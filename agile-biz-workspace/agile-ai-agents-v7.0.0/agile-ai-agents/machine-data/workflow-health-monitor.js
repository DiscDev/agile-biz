/**
 * Workflow Health Monitor
 * 
 * Detects stuck states and triggers recovery mechanisms
 * Part of Phase 2: State Protection & Recovery
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { 
    getCurrentWorkflowState,
    updatePhaseProgress
} = require('./scripts/workflow-state-handler');
const {
    handleWorkflowError,
    createWorkflowError,
    ERROR_TYPES
} = require('./scripts/workflow-error-handler');

class WorkflowHealthMonitor extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            phaseStallThreshold: 15 * 60 * 1000, // 15 minutes
            progressStallThreshold: 10 * 60 * 1000, // 10 minutes
            agentResponseTimeout: 5 * 60 * 1000, // 5 minutes
            documentCreationTimeout: 10 * 60 * 1000, // 10 minutes
            approvalGateWarning: 5 * 60 * 1000, // 5 minutes before timeout
            checkInterval: 60 * 1000 // Check every minute
        };
        
        // State tracking
        this.lastCheck = null;
        this.lastProgress = {};
        this.stuckIndicators = {};
        this.monitoring = false;
        this.checkTimer = null;
    }

    /**
     * Start monitoring workflow health
     */
    startMonitoring() {
        if (this.monitoring) {
            console.log('Health monitor already running');
            return;
        }
        
        this.monitoring = true;
        console.log('🏥 Workflow health monitoring started');
        
        // Run initial check
        this.performHealthCheck();
        
        // Schedule regular checks
        this.checkTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.checkInterval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
        
        this.monitoring = false;
        console.log('🏥 Workflow health monitoring stopped');
    }

    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        try {
            const state = getCurrentWorkflowState();
            if (!state) {
                // No active workflow
                this.resetTracking();
                return;
            }
            
            const indicators = await this.detectStuckStates(state);
            
            // Check if any indicators show stuck state
            const isStuck = Object.values(indicators).some(indicator => indicator.stuck);
            
            if (isStuck) {
                this.emit('stuck-state-detected', {
                    indicators,
                    state,
                    timestamp: new Date().toISOString()
                });
                
                // Attempt automatic recovery
                await this.triggerRecovery(indicators, state);
            }
            
            // Update tracking
            this.lastCheck = new Date();
            this.stuckIndicators = indicators;
            
        } catch (error) {
            console.error('Health check error:', error.message);
            this.emit('health-check-error', error);
        }
    }

    /**
     * Detect various stuck state conditions
     */
    async detectStuckStates(state) {
        const indicators = {
            phaseStalled: await this.checkPhaseProgress(state),
            agentsUnresponsive: await this.checkAgentActivity(state),
            documentsNotCreating: await this.checkDocumentProgress(state),
            approvalTimeout: await this.checkApprovalWait(state),
            progressNotAdvancing: await this.checkOverallProgress(state)
        };
        
        return indicators;
    }

    /**
     * Check if phase has stalled
     */
    async checkPhaseProgress(state) {
        const indicator = {
            stuck: false,
            reason: null,
            duration: 0
        };
        
        if (!state.phase_details || !state.phase_details.started_at) {
            return indicator;
        }
        
        const phaseStarted = new Date(state.phase_details.started_at);
        const now = new Date();
        const duration = now - phaseStarted;
        
        // Check if phase has been running too long without progress
        if (duration > this.config.phaseStallThreshold) {
            const progress = state.phase_details.progress_percentage || 0;
            
            // For testing or first check, consider it stuck if duration exceeded and low progress
            const lastProgress = this.lastProgress[state.current_phase];
            
            if (lastProgress === undefined || (progress === lastProgress && progress < 90)) {
                indicator.stuck = true;
                indicator.reason = `Phase "${state.current_phase}" stalled at ${progress}% for ${Math.floor(duration / 60000)} minutes`;
                indicator.duration = duration;
            }
            
            this.lastProgress[state.current_phase] = progress;
        }
        
        return indicator;
    }

    /**
     * Check agent activity
     */
    async checkAgentActivity(state) {
        const indicator = {
            stuck: false,
            reason: null,
            unresponsiveAgents: []
        };
        
        if (!state.phase_details || !state.phase_details.active_agents) {
            return indicator;
        }
        
        const activeAgents = state.phase_details.active_agents;
        const now = new Date();
        
        for (const agent of activeAgents) {
            if (agent.last_update) {
                const lastUpdate = new Date(agent.last_update);
                const timeSinceUpdate = now - lastUpdate;
                
                if (timeSinceUpdate > this.config.agentResponseTimeout) {
                    indicator.unresponsiveAgents.push({
                        name: agent.name,
                        lastSeen: agent.last_update,
                        duration: timeSinceUpdate
                    });
                }
            }
        }
        
        if (indicator.unresponsiveAgents.length > 0) {
            indicator.stuck = true;
            indicator.reason = `${indicator.unresponsiveAgents.length} agent(s) unresponsive`;
        }
        
        return indicator;
    }

    /**
     * Check document creation progress
     */
    async checkDocumentProgress(state) {
        const indicator = {
            stuck: false,
            reason: null,
            creationRate: 0
        };
        
        if (!state.phase_details) {
            return indicator;
        }
        
        const docsCreated = state.phase_details.documents_created || 0;
        const docsTotal = state.phase_details.documents_total || 0;
        const phaseStarted = new Date(state.phase_details.started_at || Date.now());
        const duration = new Date() - phaseStarted;
        
        // Only check if we expect documents
        if (docsTotal > 0 && duration > this.config.documentCreationTimeout) {
            // Calculate creation rate
            const expectedRate = docsTotal / (2 * 60 * 60 * 1000); // Expected in 2 hours
            const actualRate = docsCreated / duration;
            
            if (actualRate < expectedRate * 0.1 && docsCreated < docsTotal * 0.9) {
                indicator.stuck = true;
                indicator.reason = `Document creation stalled: ${docsCreated}/${docsTotal} after ${Math.floor(duration / 60000)} minutes`;
                indicator.creationRate = actualRate;
            }
        }
        
        return indicator;
    }

    /**
     * Check approval gate timeout
     */
    async checkApprovalWait(state) {
        const indicator = {
            stuck: false,
            reason: null,
            waitTime: 0
        };
        
        if (!state.awaiting_approval || !state.approval_gates) {
            return indicator;
        }
        
        const gateName = state.awaiting_approval;
        const gate = state.approval_gates[gateName];
        
        if (gate && gate.approval_requested_at) {
            const requested = new Date(gate.approval_requested_at);
            const now = new Date();
            const waitTime = now - requested;
            const timeout = (gate.timeout_minutes || 30) * 60 * 1000;
            
            indicator.waitTime = waitTime;
            
            // Check if approaching timeout
            if (waitTime > timeout - this.config.approvalGateWarning) {
                indicator.stuck = true;
                indicator.reason = `Approval gate "${gateName}" approaching timeout: ${Math.floor(waitTime / 60000)}/${gate.timeout_minutes} minutes`;
            }
        }
        
        return indicator;
    }

    /**
     * Check overall workflow progress
     */
    async checkOverallProgress(state) {
        const indicator = {
            stuck: false,
            reason: null,
            lastChange: null
        };
        
        // Track key state changes
        const currentFingerprint = this.createStateFingerprint(state);
        const lastFingerprint = this.lastStateFingerprint;
        
        if (lastFingerprint && currentFingerprint === lastFingerprint) {
            // State hasn't changed
            const timeSinceChange = new Date() - (this.lastStateChange || new Date());
            
            if (timeSinceChange > this.config.progressStallThreshold) {
                indicator.stuck = true;
                indicator.reason = `No state changes for ${Math.floor(timeSinceChange / 60000)} minutes`;
                indicator.lastChange = this.lastStateChange;
            }
        } else {
            // State changed, update tracking
            this.lastStateFingerprint = currentFingerprint;
            this.lastStateChange = new Date();
        }
        
        return indicator;
    }

    /**
     * Create a fingerprint of key state properties
     */
    createStateFingerprint(state) {
        const key = {
            phase: state.current_phase,
            phaseIndex: state.phase_index,
            progress: state.phase_details?.progress_percentage,
            docsCreated: state.phase_details?.documents_created,
            awaiting: state.awaiting_approval,
            completed: state.phases_completed?.length
        };
        
        return JSON.stringify(key);
    }

    /**
     * Trigger recovery for stuck states
     */
    async triggerRecovery(indicators, state) {
        console.log('\n🚨 Stuck state detected, attempting recovery...');
        
        const recoveryActions = [];
        
        // Determine recovery actions based on indicators
        if (indicators.phaseStalled.stuck) {
            recoveryActions.push({
                type: 'phase-restart',
                reason: indicators.phaseStalled.reason,
                action: () => this.restartPhase(state)
            });
        }
        
        if (indicators.agentsUnresponsive.stuck) {
            recoveryActions.push({
                type: 'agent-restart',
                reason: indicators.agentsUnresponsive.reason,
                agents: indicators.agentsUnresponsive.unresponsiveAgents,
                action: () => this.restartAgents(indicators.agentsUnresponsive.unresponsiveAgents)
            });
        }
        
        if (indicators.documentsNotCreating.stuck) {
            recoveryActions.push({
                type: 'document-retry',
                reason: indicators.documentsNotCreating.reason,
                action: () => this.retryDocumentCreation(state)
            });
        }
        
        if (indicators.approvalTimeout.stuck) {
            recoveryActions.push({
                type: 'approval-notification',
                reason: indicators.approvalTimeout.reason,
                action: () => this.notifyApprovalTimeout(state)
            });
        }
        
        // Execute recovery actions
        for (const recovery of recoveryActions) {
            try {
                console.log(`\n🔧 Executing recovery: ${recovery.type}`);
                console.log(`   Reason: ${recovery.reason}`);
                
                await recovery.action();
                
                this.emit('recovery-attempted', {
                    type: recovery.type,
                    reason: recovery.reason,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`Recovery failed for ${recovery.type}:`, error.message);
                
                this.emit('recovery-failed', {
                    type: recovery.type,
                    error: error.message
                });
            }
        }
        
        // If all recovery attempts fail, enter safe mode
        if (recoveryActions.length > 0 && recoveryActions.every(a => a.failed)) {
            await this.enterSafeMode(state);
        }
    }

    /**
     * Restart current phase
     */
    async restartPhase(state) {
        console.log(`Restarting phase: ${state.current_phase}`);
        
        // Reset phase progress
        await updatePhaseProgress({
            progress_percentage: 0,
            documents_created: 0,
            active_agents: [],
            started_at: new Date().toISOString(),
            restarted: true,
            restart_reason: 'Automated recovery from stalled state'
        });
    }

    /**
     * Restart unresponsive agents
     */
    async restartAgents(unresponsiveAgents) {
        for (const agent of unresponsiveAgents) {
            console.log(`Restarting agent: ${agent.name}`);
            // Agent restart logic would go here
            // For now, just remove from active agents
        }
    }

    /**
     * Retry document creation
     */
    async retryDocumentCreation(state) {
        console.log('Retrying document creation...');
        // Document retry logic would integrate with document creation system
    }

    /**
     * Notify about approval timeout
     */
    async notifyApprovalTimeout(state) {
        const { notifyApprovalTimeout } = require('./scripts/workflow-state-handler');
        notifyApprovalTimeout(state.awaiting_approval);
    }

    /**
     * Enter safe mode
     */
    async enterSafeMode(state) {
        console.log('\n⚠️  Entering safe mode due to recovery failures');
        
        const error = createWorkflowError(
            ERROR_TYPES.RECOVERY_FAILED,
            'Multiple recovery attempts failed, entering safe mode',
            { stuck_indicators: this.stuckIndicators }
        );
        
        await handleWorkflowError(error, state);
    }

    /**
     * Reset tracking data
     */
    resetTracking() {
        this.lastProgress = {};
        this.lastStateFingerprint = null;
        this.lastStateChange = null;
        this.stuckIndicators = {};
    }

    /**
     * Get current health status
     */
    getHealthStatus() {
        return {
            monitoring: this.monitoring,
            lastCheck: this.lastCheck,
            indicators: this.stuckIndicators,
            healthy: !Object.values(this.stuckIndicators).some(i => i.stuck)
        };
    }
}

module.exports = WorkflowHealthMonitor;