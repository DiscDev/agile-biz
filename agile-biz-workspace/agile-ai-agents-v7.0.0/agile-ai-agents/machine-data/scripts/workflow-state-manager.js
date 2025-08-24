/**
 * Workflow State Manager
 * 
 * Integrates state protection, health monitoring, and recovery
 * Part of Phase 2: State Protection & Recovery
 */

const StateProtectionLayer = require('../state-protection-layer');
const WorkflowHealthMonitor = require('../workflow-health-monitor');
const { 
    getCurrentWorkflowState,
    saveWorkflowState 
} = require('./workflow-state-handler');

class WorkflowStateManager {
    constructor() {
        this.protectionLayer = new StateProtectionLayer();
        this.healthMonitor = new WorkflowHealthMonitor();
        
        // Set up event handlers for health monitor
        this.setupHealthMonitorEvents();
        
        // Track if monitoring is active
        this.isMonitoring = false;
    }

    /**
     * Set up health monitor event handlers
     */
    setupHealthMonitorEvents() {
        // Handle stuck state detection
        this.healthMonitor.on('stuck-state-detected', async (data) => {
            console.log('\n⚠️  Stuck state detected by health monitor');
            console.log('Indicators:', data.indicators);
            
            // Log to state
            await this.logHealthEvent('stuck-state', data);
        });
        
        // Handle recovery attempts
        this.healthMonitor.on('recovery-attempted', async (data) => {
            console.log(`\n🔧 Recovery attempted: ${data.type}`);
            await this.logHealthEvent('recovery-attempt', data);
        });
        
        // Handle recovery failures
        this.healthMonitor.on('recovery-failed', async (data) => {
            console.error(`\n❌ Recovery failed: ${data.type}`);
            await this.logHealthEvent('recovery-failure', data);
        });
        
        // Handle health check errors
        this.healthMonitor.on('health-check-error', (error) => {
            console.error('Health check error:', error.message);
        });
    }

    /**
     * Initialize state management for a workflow
     */
    async initialize(workflowType, options = {}) {
        console.log('🛡️ Initializing state management with protection and monitoring');
        
        // Start health monitoring if requested
        if (options.monitoring !== false) {
            this.startMonitoring();
        }
        
        // Create initial snapshot
        const state = getCurrentWorkflowState();
        if (state) {
            await this.createSnapshot('workflow-start');
        }
        
        return {
            protectionEnabled: true,
            monitoringEnabled: this.isMonitoring,
            snapshotsEnabled: true
        };
    }

    /**
     * Start health monitoring
     */
    startMonitoring() {
        if (!this.isMonitoring) {
            this.healthMonitor.startMonitoring();
            this.isMonitoring = true;
        }
    }

    /**
     * Stop health monitoring
     */
    stopMonitoring() {
        if (this.isMonitoring) {
            this.healthMonitor.stopMonitoring();
            this.isMonitoring = false;
        }
    }

    /**
     * Save state with protection
     */
    async saveProtectedState(state) {
        try {
            return await this.protectionLayer.saveState(state);
        } catch (error) {
            console.error('Protected save failed:', error.message);
            throw error;
        }
    }

    /**
     * Load state with integrity check
     */
    async loadProtectedState() {
        try {
            return await this.protectionLayer.loadState();
        } catch (error) {
            console.error('Protected load failed:', error.message);
            
            // Attempt recovery
            const recovered = await this.attemptStateRecovery();
            if (recovered) {
                console.log('✅ State recovered from backup');
                return recovered;
            }
            
            throw error;
        }
    }

    /**
     * Create a named snapshot
     */
    async createSnapshot(name) {
        try {
            const snapshot = await this.protectionLayer.createSnapshot(name);
            console.log(`📸 Snapshot created: ${name}`);
            return snapshot;
        } catch (error) {
            console.error(`Failed to create snapshot: ${error.message}`);
            throw error;
        }
    }

    /**
     * List available snapshots
     */
    listSnapshots() {
        return this.protectionLayer.listSnapshots();
    }

    /**
     * Restore from snapshot
     */
    async restoreSnapshot(name) {
        try {
            // Stop monitoring during restore
            const wasMonitoring = this.isMonitoring;
            this.stopMonitoring();
            
            const result = await this.protectionLayer.restoreSnapshot(name);
            console.log(`✅ ${result.message}`);
            
            // Restart monitoring if it was active
            if (wasMonitoring) {
                this.startMonitoring();
            }
            
            return result;
        } catch (error) {
            console.error(`Failed to restore snapshot: ${error.message}`);
            throw error;
        }
    }

    /**
     * Attempt state recovery
     */
    async attemptStateRecovery() {
        console.log('🔧 Attempting state recovery...');
        
        try {
            // Try to recover from latest backup
            const recovered = await this.protectionLayer.recoverFromLatestBackup(
                require('path').join(this.protectionLayer.stateDir, 'current-workflow.json')
            );
            
            if (recovered) {
                return await this.protectionLayer.loadState();
            }
        } catch (error) {
            console.error('Recovery attempt failed:', error.message);
        }
        
        return null;
    }

    /**
     * Get health status
     */
    getHealthStatus() {
        return this.healthMonitor.getHealthStatus();
    }

    /**
     * Log health events to state
     */
    async logHealthEvent(eventType, data) {
        try {
            const state = await this.loadProtectedState();
            if (!state) return;
            
            // Initialize health log if needed
            if (!state.health_log) {
                state.health_log = [];
            }
            
            // Add event to log
            state.health_log.push({
                type: eventType,
                timestamp: new Date().toISOString(),
                data: data
            });
            
            // Keep only last 50 events
            if (state.health_log.length > 50) {
                state.health_log = state.health_log.slice(-50);
            }
            
            // Save updated state
            await this.saveProtectedState(state);
        } catch (error) {
            console.error('Failed to log health event:', error.message);
        }
    }

    /**
     * Perform manual health check
     */
    async performHealthCheck() {
        console.log('🏥 Performing manual health check...');
        await this.healthMonitor.performHealthCheck();
        
        const status = this.getHealthStatus();
        console.log('\nHealth Status:', status.healthy ? '✅ Healthy' : '⚠️  Issues detected');
        
        if (!status.healthy) {
            console.log('Issues found:');
            for (const [key, indicator] of Object.entries(status.indicators)) {
                if (indicator.stuck) {
                    console.log(`  - ${key}: ${indicator.reason}`);
                }
            }
        }
        
        return status;
    }

    /**
     * Get state integrity report
     */
    async getIntegrityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            checks: {}
        };
        
        // Check current state integrity
        try {
            const currentPath = require('path').join(this.protectionLayer.stateDir, 'current-workflow.json');
            report.checks.currentState = await this.protectionLayer.verifyIntegrity(currentPath);
        } catch (error) {
            report.checks.currentState = { valid: false, error: error.message };
        }
        
        // Check snapshots
        const snapshots = this.listSnapshots();
        report.checks.snapshots = {
            count: snapshots.length,
            latest: snapshots[0]
        };
        
        // Check backups
        try {
            const backupDir = this.protectionLayer.backupDir;
            const backups = require('fs').readdirSync(backupDir)
                .filter(f => f.startsWith('state-backup-'));
            report.checks.backups = {
                count: backups.length,
                hasRecent: backups.length > 0
            };
        } catch (error) {
            report.checks.backups = { error: error.message };
        }
        
        // Overall status
        report.overallIntegrity = report.checks.currentState?.valid ? 'Good' : 'Compromised';
        
        return report;
    }

    /**
     * Clean up and shut down
     */
    async shutdown() {
        console.log('🛑 Shutting down state manager...');
        
        // Stop monitoring
        this.stopMonitoring();
        
        // Create final snapshot
        try {
            await this.createSnapshot('workflow-shutdown');
        } catch (error) {
            console.error('Failed to create shutdown snapshot:', error.message);
        }
    }
}

// Export singleton instance
module.exports = new WorkflowStateManager();