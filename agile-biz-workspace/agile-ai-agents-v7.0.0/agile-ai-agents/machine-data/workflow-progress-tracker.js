/**
 * Workflow Progress Tracker
 * 
 * Tracks detailed progress of workflow execution and provides real-time updates
 * Part of Phase 3: Agent Coordination & Visibility
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const { 
    getCurrentWorkflowState,
    updatePhaseProgress
} = require('./scripts/workflow-state-handler');

class WorkflowProgressTracker extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            updateInterval: 5000, // 5 seconds
            etaCalculationWindow: 10, // Use last 10 updates for ETA
            progressGranularity: 0.1, // Update on 0.1% changes
            dashboardApiPort: 3001
        };
        
        // Progress tracking
        this.progressHistory = new Map();
        this.phaseStartTimes = new Map();
        this.documentProgress = new Map();
        this.agentProgress = new Map();
        this.overallProgress = 0;
        
        // ETA calculation
        this.progressRates = new Map();
        this.estimatedCompletionTime = null;
        
        // Active tracking
        this.tracking = false;
        this.updateTimer = null;
        this.lastUpdate = null;
    }

    /**
     * Start tracking workflow progress
     */
    startTracking(workflowId) {
        if (this.tracking) {
            console.log('Progress tracking already active');
            return;
        }
        
        this.tracking = true;
        this.workflowId = workflowId;
        console.log(`📊 Started progress tracking for workflow: ${workflowId}`);
        
        // Initialize tracking
        this.initializeTracking();
        
        // Start update loop
        this.updateTimer = setInterval(() => {
            this.updateProgress();
        }, this.config.updateInterval);
        
        // Emit start event
        this.emit('tracking-started', {
            workflowId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Stop tracking
     */
    stopTracking() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        this.tracking = false;
        console.log('📊 Stopped progress tracking');
        
        // Emit stop event
        this.emit('tracking-stopped', {
            workflowId: this.workflowId,
            timestamp: new Date().toISOString(),
            finalProgress: this.overallProgress
        });
    }

    /**
     * Initialize tracking data
     */
    initializeTracking() {
        const state = getCurrentWorkflowState();
        if (!state) return;
        
        // Initialize phase tracking
        if (state.phases) {
            state.phases.forEach((phase, index) => {
                this.progressHistory.set(phase.name, []);
                this.progressRates.set(phase.name, 0);
                
                if (index === state.phase_index) {
                    this.phaseStartTimes.set(phase.name, new Date());
                }
            });
        }
        
        // Initialize overall progress
        this.updateOverallProgress(state);
    }

    /**
     * Update progress for all tracked elements
     */
    async updateProgress() {
        try {
            const state = getCurrentWorkflowState();
            if (!state) return;
            
            const progressData = {
                timestamp: new Date().toISOString(),
                workflow: {
                    id: state.workflow_id,
                    type: state.workflow_type,
                    phase: state.current_phase,
                    phaseIndex: state.phase_index,
                    totalPhases: state.phases ? state.phases.length : 0
                },
                phase: await this.calculatePhaseProgress(state),
                agents: await this.calculateAgentProgress(state),
                documents: await this.calculateDocumentProgress(state),
                overall: await this.calculateOverallProgress(state),
                eta: await this.calculateETA(state),
                metrics: await this.gatherMetrics(state)
            };
            
            // Check for significant changes
            if (this.hasSignificantChange(progressData)) {
                // Update state handler
                await this.updateStateWithProgress(progressData);
                
                // Send to dashboard
                await this.sendToDashboard(progressData);
                
                // Emit progress event
                this.emit('progress-update', progressData);
                
                // Log summary
                this.logProgressSummary(progressData);
                
                this.lastUpdate = progressData;
            }
            
        } catch (error) {
            console.error('Progress update error:', error.message);
            this.emit('progress-error', error);
        }
    }

    /**
     * Calculate phase progress
     */
    async calculatePhaseProgress(state) {
        const phaseProgress = {
            name: state.current_phase,
            index: state.phase_index,
            percentage: 0,
            startTime: null,
            elapsedTime: 0,
            status: 'active'
        };
        
        if (state.phase_details) {
            phaseProgress.percentage = state.phase_details.progress_percentage || 0;
            
            if (state.phase_details.started_at) {
                phaseProgress.startTime = state.phase_details.started_at;
                phaseProgress.elapsedTime = new Date() - new Date(state.phase_details.started_at);
            }
            
            // Track substeps
            if (state.phase_details.substeps) {
                phaseProgress.substeps = this.calculateSubstepProgress(state.phase_details.substeps);
            }
        }
        
        // Update history
        const history = this.progressHistory.get(state.current_phase) || [];
        history.push({
            percentage: phaseProgress.percentage,
            timestamp: new Date()
        });
        
        // Keep only recent history
        if (history.length > this.config.etaCalculationWindow) {
            history.shift();
        }
        
        this.progressHistory.set(state.current_phase, history);
        
        // Calculate progress rate
        if (history.length >= 2) {
            const recent = history[history.length - 1];
            const previous = history[history.length - 2];
            const timeDiff = recent.timestamp - previous.timestamp;
            const progressDiff = recent.percentage - previous.percentage;
            
            if (timeDiff > 0) {
                const rate = progressDiff / (timeDiff / 1000); // % per second
                this.progressRates.set(state.current_phase, rate);
            }
        }
        
        return phaseProgress;
    }

    /**
     * Calculate agent progress
     */
    async calculateAgentProgress(state) {
        const agentProgress = [];
        
        if (state.phase_details && state.phase_details.active_agents) {
            for (const agent of state.phase_details.active_agents) {
                const progress = {
                    name: agent.name,
                    status: agent.status || 'active',
                    documentsAssigned: agent.documents_assigned || 0,
                    documentsCompleted: agent.documents_completed || 0,
                    percentage: 0,
                    lastUpdate: agent.last_update
                };
                
                if (progress.documentsAssigned > 0) {
                    progress.percentage = Math.round(
                        (progress.documentsCompleted / progress.documentsAssigned) * 100
                    );
                }
                
                agentProgress.push(progress);
                this.agentProgress.set(agent.name, progress);
            }
        }
        
        return {
            active: agentProgress.filter(a => a.status === 'active').length,
            completed: agentProgress.filter(a => a.status === 'completed').length,
            failed: agentProgress.filter(a => a.status === 'failed').length,
            agents: agentProgress
        };
    }

    /**
     * Calculate document progress
     */
    async calculateDocumentProgress(state) {
        const documentProgress = {
            total: 0,
            created: 0,
            pending: 0,
            percentage: 0,
            byCategory: {}
        };
        
        if (state.phase_details) {
            documentProgress.total = state.phase_details.documents_total || 0;
            documentProgress.created = state.phase_details.documents_created || 0;
            documentProgress.pending = documentProgress.total - documentProgress.created;
            
            if (documentProgress.total > 0) {
                documentProgress.percentage = Math.round(
                    (documentProgress.created / documentProgress.total) * 100
                );
            }
            
            // Track by category if available
            if (state.phase_details.documents_by_category) {
                documentProgress.byCategory = state.phase_details.documents_by_category;
            }
        }
        
        return documentProgress;
    }

    /**
     * Calculate overall progress
     */
    async calculateOverallProgress(state) {
        let overallProgress = 0;
        
        if (state.phases && state.phases.length > 0) {
            const completedPhases = state.phase_index;
            const currentPhaseProgress = state.phase_details?.progress_percentage || 0;
            
            // Weight calculation
            const phaseWeight = 100 / state.phases.length;
            overallProgress = (completedPhases * phaseWeight) + 
                             (currentPhaseProgress / 100 * phaseWeight);
            
            // Add completion bonus for final phase
            if (state.phase_index === state.phases.length - 1 && 
                currentPhaseProgress === 100) {
                overallProgress = 100;
            }
        }
        
        this.overallProgress = Math.round(overallProgress * 10) / 10; // 1 decimal place
        
        return {
            percentage: this.overallProgress,
            phasesCompleted: state.phases_completed?.length || 0,
            totalPhases: state.phases?.length || 0,
            milestones: this.identifyMilestones(state)
        };
    }

    /**
     * Calculate ETA
     */
    async calculateETA(state) {
        const eta = {
            phaseCompletion: null,
            workflowCompletion: null,
            confidence: 'low'
        };
        
        // Phase ETA
        const currentPhase = state.current_phase;
        const phaseRate = this.progressRates.get(currentPhase) || 0;
        const phaseProgress = state.phase_details?.progress_percentage || 0;
        
        if (phaseRate > 0 && phaseProgress < 100) {
            const remainingProgress = 100 - phaseProgress;
            const secondsToComplete = remainingProgress / phaseRate;
            eta.phaseCompletion = new Date(Date.now() + secondsToComplete * 1000);
            eta.confidence = 'medium';
        }
        
        // Workflow ETA
        if (state.phases && this.overallProgress < 100) {
            const averagePhaseTime = this.calculateAveragePhaseTime(state);
            if (averagePhaseTime > 0) {
                const remainingPhases = state.phases.length - state.phase_index - 1;
                const remainingTime = (remainingPhases + 0.5) * averagePhaseTime;
                eta.workflowCompletion = new Date(Date.now() + remainingTime);
                eta.confidence = 'high';
            }
        }
        
        this.estimatedCompletionTime = eta.workflowCompletion;
        
        return eta;
    }

    /**
     * Gather performance metrics
     */
    async gatherMetrics(state) {
        return {
            documentsPerMinute: this.calculateDocumentRate(state),
            averagePhaseTime: this.calculateAveragePhaseTime(state),
            systemLoad: await this.getSystemLoad(),
            activeResources: this.getActiveResources(state)
        };
    }

    /**
     * Update state handler with progress
     */
    async updateStateWithProgress(progressData) {
        const updateData = {
            progress_percentage: Math.round(progressData.phase.percentage),
            overall_progress: progressData.overall.percentage,
            eta_phase: progressData.eta.phaseCompletion,
            eta_workflow: progressData.eta.workflowCompletion,
            metrics: progressData.metrics
        };
        
        await updatePhaseProgress(updateData);
    }

    /**
     * Send progress to dashboard API
     */
    async sendToDashboard(progressData) {
        try {
            // Check if dashboard is running
            const dashboardPath = path.join(__dirname, '../../dashboard/server.js');
            if (!fs.existsSync(dashboardPath)) {
                return;
            }
            
            // Emit event that dashboard can listen to
            this.emit('dashboard-update', progressData);
            
            // If dashboard has WebSocket, it will receive via event system
            // Otherwise, could implement HTTP POST here
            
        } catch (error) {
            // Dashboard might not be running, ignore errors
        }
    }

    /**
     * Check if progress has changed significantly
     */
    hasSignificantChange(currentData) {
        if (!this.lastUpdate) return true;
        
        // Check phase progress change
        const lastPhaseProgress = this.lastUpdate.phase?.percentage || 0;
        const currentPhaseProgress = currentData.phase?.percentage || 0;
        
        if (Math.abs(currentPhaseProgress - lastPhaseProgress) >= this.config.progressGranularity) {
            return true;
        }
        
        // Check overall progress change
        const lastOverallProgress = this.lastUpdate.overall?.percentage || 0;
        const currentOverallProgress = currentData.overall?.percentage || 0;
        
        if (Math.abs(currentOverallProgress - lastOverallProgress) >= this.config.progressGranularity) {
            return true;
        }
        
        // Check agent status changes
        const lastAgentCount = this.lastUpdate.agents?.active || 0;
        const currentAgentCount = currentData.agents?.active || 0;
        
        if (lastAgentCount !== currentAgentCount) {
            return true;
        }
        
        // Check document progress
        const lastDocs = this.lastUpdate.documents?.created || 0;
        const currentDocs = currentData.documents?.created || 0;
        
        if (currentDocs > lastDocs) {
            return true;
        }
        
        return false;
    }

    /**
     * Log progress summary
     */
    logProgressSummary(progressData) {
        const { phase, overall, documents, agents } = progressData;
        
        console.log(`
📊 Progress Update:
   Phase: ${phase.name} (${phase.percentage}%)
   Overall: ${overall.percentage}%
   Documents: ${documents.created}/${documents.total}
   Active Agents: ${agents.active}
   ETA: ${progressData.eta.workflowCompletion ? 
          new Date(progressData.eta.workflowCompletion).toLocaleTimeString() : 
          'Calculating...'}
        `);
    }

    /**
     * Helper methods
     */
    
    calculateSubstepProgress(substeps) {
        return substeps.map(step => ({
            name: step.name,
            completed: step.completed || false,
            percentage: step.percentage || (step.completed ? 100 : 0)
        }));
    }

    identifyMilestones(state) {
        const milestones = [];
        
        // Phase milestones
        if (state.phases_completed) {
            state.phases_completed.forEach(phase => {
                milestones.push({
                    type: 'phase_completed',
                    name: phase,
                    timestamp: state.phase_completion_times?.[phase]
                });
            });
        }
        
        // Progress milestones
        const progressMilestones = [25, 50, 75, 90];
        progressMilestones.forEach(milestone => {
            if (this.overallProgress >= milestone && 
                !milestones.some(m => m.type === `progress_${milestone}`)) {
                milestones.push({
                    type: `progress_${milestone}`,
                    name: `${milestone}% Complete`,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        return milestones;
    }

    calculateAveragePhaseTime(state) {
        if (!state.phase_completion_times || 
            Object.keys(state.phase_completion_times).length === 0) {
            // Estimate based on current phase
            if (this.phaseStartTimes.has(state.current_phase)) {
                const elapsed = new Date() - this.phaseStartTimes.get(state.current_phase);
                const progress = state.phase_details?.progress_percentage || 1;
                return (elapsed / progress) * 100; // Extrapolate to 100%
            }
            return 0;
        }
        
        const times = Object.values(state.phase_completion_times);
        const totalTime = times.reduce((sum, time) => sum + time, 0);
        return totalTime / times.length;
    }

    calculateDocumentRate(state) {
        if (!state.phase_details || !state.phase_details.started_at) {
            return 0;
        }
        
        const elapsed = (new Date() - new Date(state.phase_details.started_at)) / 60000; // minutes
        const created = state.phase_details.documents_created || 0;
        
        return elapsed > 0 ? Math.round(created / elapsed * 10) / 10 : 0;
    }

    async getSystemLoad() {
        try {
            const os = require('os');
            const cpus = os.cpus();
            
            // Calculate CPU load
            let totalIdle = 0;
            let totalTick = 0;
            
            cpus.forEach(cpu => {
                for (const type in cpu.times) {
                    totalTick += cpu.times[type];
                }
                totalIdle += cpu.times.idle;
            });
            
            const idle = totalIdle / cpus.length;
            const total = totalTick / cpus.length;
            const usage = 100 - ~~(100 * idle / total);
            
            // Memory usage
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const memUsage = Math.round((1 - freeMem / totalMem) * 100);
            
            return {
                cpu: usage,
                memory: memUsage
            };
            
        } catch (error) {
            return { cpu: 0, memory: 0 };
        }
    }

    getActiveResources(state) {
        return {
            agents: state.phase_details?.active_agents?.length || 0,
            documents: this.documentProgress.size,
            checkpoints: state.checkpoints ? Object.keys(state.checkpoints).length : 0
        };
    }

    /**
     * Get current progress snapshot
     */
    getProgressSnapshot() {
        return {
            overall: this.overallProgress,
            phases: Array.from(this.progressHistory.entries()).map(([phase, history]) => ({
                name: phase,
                progress: history.length > 0 ? history[history.length - 1].percentage : 0,
                rate: this.progressRates.get(phase) || 0
            })),
            agents: Array.from(this.agentProgress.values()),
            eta: this.estimatedCompletionTime,
            tracking: this.tracking
        };
    }
}

module.exports = WorkflowProgressTracker;