/**
 * Dashboard Integration Module
 * 
 * Integrates workflow progress, agent status, and system health with real-time dashboard
 * Part of Phase 3: Agent Coordination & Visibility
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const WorkflowProgressTracker = require('./workflow-progress-tracker');
const AgentAvailabilityChecker = require('./agent-availability-checker');
const WorkflowHealthMonitor = require('./workflow-health-monitor');
const ParallelExecutionCoordinator = require('./parallel-execution-coordinator');

class DashboardIntegration extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            updateInterval: 2000, // 2 seconds
            metricsRetention: 100, // Keep last 100 data points
            alertThreshold: {
                cpuUsage: 80,
                memoryUsage: 85,
                phaseStallMinutes: 15,
                agentTimeout: 5
            }
        };
        
        // Component instances
        this.progressTracker = new WorkflowProgressTracker();
        this.availabilityChecker = new AgentAvailabilityChecker();
        this.healthMonitor = new WorkflowHealthMonitor();
        this.executionCoordinator = new ParallelExecutionCoordinator();
        
        // Dashboard state
        this.dashboardState = {
            workflow: null,
            progress: null,
            agents: null,
            health: null,
            metrics: [],
            alerts: [],
            lastUpdate: null
        };
        
        // Integration status
        this.integrated = false;
        this.updateTimer = null;
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Initialize dashboard integration
     */
    async initialize(workflowId) {
        console.log('🎯 Initializing dashboard integration...');
        
        try {
            // Start component monitoring
            this.progressTracker.startTracking(workflowId);
            this.healthMonitor.startMonitoring();
            
            // Initial data gathering
            await this.gatherDashboardData();
            
            // Start update loop
            this.startUpdateLoop();
            
            this.integrated = true;
            
            // Emit initialization event
            this.emit('integration-initialized', {
                workflowId,
                timestamp: new Date().toISOString(),
                components: {
                    progressTracker: true,
                    healthMonitor: true,
                    availabilityChecker: true,
                    executionCoordinator: true
                }
            });
            
            console.log('✅ Dashboard integration initialized successfully');
            
        } catch (error) {
            console.error('Dashboard integration error:', error.message);
            this.emit('integration-error', error);
        }
    }

    /**
     * Setup event listeners for all components
     */
    setupEventListeners() {
        // Progress tracker events
        this.progressTracker.on('progress-update', (data) => {
            this.dashboardState.progress = data;
            this.broadcastUpdate('progress', data);
        });
        
        this.progressTracker.on('dashboard-update', (data) => {
            // Forward to dashboard
            this.emit('dashboard-data', data);
        });
        
        // Health monitor events
        this.healthMonitor.on('stuck-state-detected', (data) => {
            this.addAlert('warning', 'Stuck state detected', data);
        });
        
        this.healthMonitor.on('recovery-attempted', (data) => {
            this.addAlert('info', 'Recovery attempted', data);
        });
        
        // Execution coordinator events
        this.executionCoordinator.on('agent-completed', (data) => {
            this.updateAgentStatus(data.agent, 'completed');
        });
        
        this.executionCoordinator.on('agent-failed', (data) => {
            this.addAlert('error', `Agent failed: ${data.agent}`, data.error);
        });
        
        this.executionCoordinator.on('progress-update', (data) => {
            this.dashboardState.parallelExecution = data;
        });
    }

    /**
     * Start the update loop
     */
    startUpdateLoop() {
        this.updateTimer = setInterval(async () => {
            await this.gatherDashboardData();
            await this.checkAlerts();
            this.broadcastState();
        }, this.config.updateInterval);
    }

    /**
     * Gather all dashboard data
     */
    async gatherDashboardData() {
        const data = {
            timestamp: new Date().toISOString(),
            workflow: await this.getWorkflowSummary(),
            progress: this.progressTracker.getProgressSnapshot(),
            agents: await this.getAgentStatuses(),
            health: this.healthMonitor.getHealthStatus(),
            system: await this.getSystemMetrics(),
            execution: this.getExecutionStatus()
        };
        
        // Update state
        this.dashboardState = {
            ...this.dashboardState,
            ...data,
            lastUpdate: data.timestamp
        };
        
        // Add to metrics history
        this.addMetricPoint(data);
        
        return data;
    }

    /**
     * Get workflow summary
     */
    async getWorkflowSummary() {
        const { getCurrentWorkflowState } = require('./scripts/workflow-state-handler');
        const state = getCurrentWorkflowState();
        
        if (!state) return null;
        
        return {
            id: state.workflow_id,
            type: state.workflow_type,
            currentPhase: state.current_phase,
            phaseIndex: state.phase_index,
            totalPhases: state.phases?.length || 0,
            status: state.status || 'active',
            startTime: state.created_at,
            lastActivity: state.last_updated
        };
    }

    /**
     * Get agent statuses
     */
    async getAgentStatuses() {
        const state = this.getCurrentState();
        const agents = [];
        
        // Get required agents for workflow
        const requiredAgents = AgentAvailabilityChecker.getRequiredAgents(
            state?.workflow_type || 'new-project'
        );
        
        // Check availability
        const availability = await this.availabilityChecker.checkAgents(requiredAgents);
        
        // Combine with active agent data
        if (state?.phase_details?.active_agents) {
            for (const activeAgent of state.phase_details.active_agents) {
                const availabilityData = availability.agents[activeAgent.name] || {};
                
                agents.push({
                    name: activeAgent.name,
                    status: activeAgent.status || 'active',
                    available: availabilityData.ready || false,
                    documentsAssigned: activeAgent.documents_assigned || 0,
                    documentsCompleted: activeAgent.documents_completed || 0,
                    lastUpdate: activeAgent.last_update,
                    resources: availabilityData.resourcesAvailable || false
                });
            }
        }
        
        // Add inactive but required agents
        for (const agentName of requiredAgents) {
            if (!agents.some(a => a.name === agentName)) {
                const availabilityData = availability.agents[agentName] || {};
                agents.push({
                    name: agentName,
                    status: 'inactive',
                    available: availabilityData.ready || false,
                    documentsAssigned: 0,
                    documentsCompleted: 0,
                    resources: availabilityData.resourcesAvailable || false
                });
            }
        }
        
        return {
            total: agents.length,
            active: agents.filter(a => a.status === 'active').length,
            available: agents.filter(a => a.available).length,
            agents
        };
    }

    /**
     * Get system metrics
     */
    async getSystemMetrics() {
        const os = require('os');
        
        // CPU usage
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);
        
        // Memory usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memUsage = Math.round((1 - freeMem / totalMem) * 100);
        
        // Disk usage (simplified)
        const workflowDir = path.join(__dirname, '../project-documents');
        let diskUsage = 0;
        try {
            diskUsage = await this.calculateDirectorySize(workflowDir);
        } catch (e) {
            // Ignore errors
        }
        
        return {
            cpu: {
                usage: cpuUsage,
                cores: cpus.length
            },
            memory: {
                usage: memUsage,
                total: Math.round(totalMem / 1024 / 1024 / 1024), // GB
                free: Math.round(freeMem / 1024 / 1024 / 1024) // GB
            },
            disk: {
                workflowData: Math.round(diskUsage / 1024 / 1024), // MB
                documentsCreated: await this.countDocuments()
            },
            uptime: os.uptime()
        };
    }

    /**
     * Get execution status
     */
    getExecutionStatus() {
        return {
            activeAgents: this.executionCoordinator.activeAgents.size,
            queuedTasks: this.executionCoordinator.executionQueue.length,
            completedTasks: this.executionCoordinator.completedTasks.length,
            conflicts: this.executionCoordinator.conflicts.length,
            resourceUtilization: {
                memory: 100 - this.executionCoordinator.resourcePools.memory,
                cpu: 100 - this.executionCoordinator.resourcePools.cpu,
                fileHandles: 
                    (1000 - this.executionCoordinator.resourcePools.fileHandles) / 10 // %
            }
        };
    }

    /**
     * Check for alerts
     */
    async checkAlerts() {
        const metrics = this.dashboardState.system;
        const health = this.dashboardState.health;
        
        // CPU usage alert
        if (metrics?.cpu?.usage > this.config.alertThreshold.cpuUsage) {
            this.addAlert('warning', 'High CPU usage', {
                usage: metrics.cpu.usage,
                threshold: this.config.alertThreshold.cpuUsage
            });
        }
        
        // Memory usage alert
        if (metrics?.memory?.usage > this.config.alertThreshold.memoryUsage) {
            this.addAlert('warning', 'High memory usage', {
                usage: metrics.memory.usage,
                threshold: this.config.alertThreshold.memoryUsage
            });
        }
        
        // Stuck state alerts (handled by health monitor events)
        
        // Agent availability alerts
        const agents = this.dashboardState.agents;
        if (agents && agents.available < agents.total * 0.5) {
            this.addAlert('warning', 'Low agent availability', {
                available: agents.available,
                total: agents.total
            });
        }
    }

    /**
     * Add alert to dashboard
     */
    addAlert(severity, message, details = {}) {
        const alert = {
            id: Date.now().toString(),
            severity, // 'info', 'warning', 'error'
            message,
            details,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };
        
        this.dashboardState.alerts.unshift(alert);
        
        // Keep only recent alerts
        if (this.dashboardState.alerts.length > 50) {
            this.dashboardState.alerts = this.dashboardState.alerts.slice(0, 50);
        }
        
        // Emit alert event
        this.emit('alert', alert);
        
        // Log critical alerts
        if (severity === 'error') {
            console.error(`🚨 Dashboard Alert: ${message}`, details);
        }
    }

    /**
     * Update agent status
     */
    updateAgentStatus(agentName, status) {
        if (!this.dashboardState.agents) return;
        
        const agent = this.dashboardState.agents.agents.find(a => a.name === agentName);
        if (agent) {
            agent.status = status;
            agent.lastUpdate = new Date().toISOString();
        }
    }

    /**
     * Add metric point to history
     */
    addMetricPoint(data) {
        this.dashboardState.metrics.push({
            timestamp: data.timestamp,
            overall: data.progress?.overall || 0,
            phase: data.progress?.phases?.[0]?.progress || 0,
            cpu: data.system?.cpu?.usage || 0,
            memory: data.system?.memory?.usage || 0,
            activeAgents: data.agents?.active || 0
        });
        
        // Maintain retention limit
        if (this.dashboardState.metrics.length > this.config.metricsRetention) {
            this.dashboardState.metrics.shift();
        }
    }

    /**
     * Broadcast update to specific component
     */
    broadcastUpdate(component, data) {
        this.emit('component-update', {
            component,
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Broadcast full dashboard state
     */
    broadcastState() {
        this.emit('state-update', this.dashboardState);
        
        // Also emit to any WebSocket connections if dashboard is running
        this.emit('dashboard-broadcast', {
            type: 'state',
            data: this.dashboardState
        });
    }

    /**
     * Get current workflow state
     */
    getCurrentState() {
        const { getCurrentWorkflowState } = require('./scripts/workflow-state-handler');
        return getCurrentWorkflowState();
    }

    /**
     * Calculate directory size
     */
    async calculateDirectorySize(dir) {
        let size = 0;
        
        try {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    size += await this.calculateDirectorySize(filePath);
                } else {
                    size += stat.size;
                }
            }
        } catch (e) {
            // Ignore errors
        }
        
        return size;
    }

    /**
     * Count created documents
     */
    async countDocuments() {
        const docsDir = path.join(__dirname, '../project-documents');
        let count = 0;
        
        try {
            const countFiles = (dir) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    
                    if (stat.isDirectory()) {
                        countFiles(filePath);
                    } else if (file.endsWith('.md') || file.endsWith('.json')) {
                        count++;
                    }
                }
            };
            
            countFiles(docsDir);
        } catch (e) {
            // Ignore errors
        }
        
        return count;
    }

    /**
     * Handle dashboard query
     */
    async handleQuery(query) {
        switch (query.type) {
            case 'state':
                return this.dashboardState;
                
            case 'metrics':
                return this.dashboardState.metrics;
                
            case 'alerts':
                return this.dashboardState.alerts;
                
            case 'agent-details':
                return this.getAgentDetails(query.agentName);
                
            case 'phase-details':
                return this.getPhaseDetails(query.phaseName);
                
            default:
                return { error: 'Unknown query type' };
        }
    }

    /**
     * Get detailed agent information
     */
    async getAgentDetails(agentName) {
        const availability = await this.availabilityChecker.checkSingleAgent(agentName);
        const progress = this.executionCoordinator.activeAgents.get(agentName);
        
        return {
            ...availability,
            progress,
            allocation: this.executionCoordinator.resourceAllocations.get(agentName)
        };
    }

    /**
     * Get detailed phase information
     */
    getPhaseDetails(phaseName) {
        const history = this.progressTracker.progressHistory.get(phaseName);
        const rate = this.progressTracker.progressRates.get(phaseName);
        
        return {
            name: phaseName,
            history: history || [],
            progressRate: rate || 0,
            startTime: this.progressTracker.phaseStartTimes.get(phaseName)
        };
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.dashboardState.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
        }
    }

    /**
     * Clear alerts
     */
    clearAlerts(severity = null) {
        if (severity) {
            this.dashboardState.alerts = this.dashboardState.alerts.filter(
                a => a.severity !== severity
            );
        } else {
            this.dashboardState.alerts = [];
        }
    }

    /**
     * Stop dashboard integration
     */
    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        this.progressTracker.stopTracking();
        this.healthMonitor.stopMonitoring();
        
        this.integrated = false;
        
        console.log('🛑 Dashboard integration stopped');
    }

    /**
     * Get integration status
     */
    getStatus() {
        return {
            integrated: this.integrated,
            components: {
                progressTracker: this.progressTracker.tracking,
                healthMonitor: this.healthMonitor.monitoring,
                availabilityChecker: true,
                executionCoordinator: this.executionCoordinator.activeAgents.size > 0
            },
            lastUpdate: this.dashboardState.lastUpdate,
            alertCount: this.dashboardState.alerts.length
        };
    }
}

module.exports = DashboardIntegration;