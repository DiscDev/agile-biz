/**
 * Production Monitoring Dashboard
 * 
 * Real-time monitoring dashboard for production environments
 * Part of Phase 5: Production Readiness
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const EventEmitter = require('events');
const { getInstance: getLogger } = require('./production-logger');
const { getInstance: getOptimizer } = require('./performance-optimizer');
const { getInstance: getScaler } = require('./deployment-scaler');
const DashboardIntegration = require('./dashboard-integration');

class ProductionMonitorDashboard extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            port: process.env.MONITOR_PORT || 3002,
            host: '0.0.0.0',
            updateInterval: 5000, // 5 seconds
            metricsRetention: 3600000, // 1 hour
            alertRetention: 86400000, // 24 hours
            auth: {
                enabled: process.env.MONITOR_AUTH === 'true',
                username: process.env.MONITOR_USER || 'admin',
                password: process.env.MONITOR_PASS || 'admin'
            }
        };
        
        // Components
        this.logger = getLogger();
        this.optimizer = getOptimizer();
        this.scaler = getScaler();
        this.dashboardIntegration = new DashboardIntegration();
        
        // Server components
        this.app = null;
        this.server = null;
        this.wss = null;
        
        // Dashboard state
        this.dashboardState = {
            system: {},
            workflow: {},
            performance: {},
            deployment: {},
            alerts: [],
            logs: [],
            metrics: {
                timeline: [],
                aggregated: {}
            }
        };
        
        // Connected clients
        this.clients = new Set();
        
        // Initialize
        this.initialize();
    }

    /**
     * Initialize dashboard
     */
    async initialize() {
        this.logger.info('Initializing production monitoring dashboard');
        
        // Setup Express app
        this.setupExpress();
        
        // Setup WebSocket server
        this.setupWebSocket();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start data collection
        this.startDataCollection();
        
        // Start server
        await this.startServer();
    }

    /**
     * Setup Express application
     */
    setupExpress() {
        this.app = express();
        
        // Middleware
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'dashboard-ui')));
        
        // Basic auth if enabled
        if (this.config.auth.enabled) {
            this.app.use(this.basicAuth.bind(this));
        }
        
        // API Routes
        this.setupAPIRoutes();
    }

    /**
     * Setup API routes
     */
    setupAPIRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
        
        // System status
        this.app.get('/api/status', (req, res) => {
            res.json(this.getSystemStatus());
        });
        
        // Metrics
        this.app.get('/api/metrics', (req, res) => {
            const { period = '1h', aggregation = '1m' } = req.query;
            res.json(this.getMetrics(period, aggregation));
        });
        
        // Logs
        this.app.get('/api/logs', async (req, res) => {
            const { level, limit = 100, search } = req.query;
            const logs = await this.getLogs({ level, limit, pattern: search });
            res.json(logs);
        });
        
        // Alerts
        this.app.get('/api/alerts', (req, res) => {
            const { severity, acknowledged = false } = req.query;
            res.json(this.getAlerts({ severity, acknowledged }));
        });
        
        // Performance report
        this.app.get('/api/performance', (req, res) => {
            res.json(this.optimizer.exportPerformanceReport());
        });
        
        // Deployment status
        this.app.get('/api/deployment', (req, res) => {
            res.json(this.scaler.exportDeploymentReport());
        });
        
        // Control endpoints
        this.app.post('/api/control/scale', async (req, res) => {
            const { action } = req.body;
            try {
                if (action === 'up') {
                    await this.scaler.scaleUp();
                } else if (action === 'down') {
                    await this.scaler.scaleDown();
                }
                res.json({ success: true, action });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.post('/api/control/cache', (req, res) => {
            const { action } = req.body;
            if (action === 'clear') {
                this.optimizer.cacheClear();
                res.json({ success: true, action });
            } else {
                res.status(400).json({ error: 'Invalid action' });
            }
        });
        
        this.app.post('/api/alerts/:id/acknowledge', (req, res) => {
            const { id } = req.params;
            this.acknowledgeAlert(id);
            res.json({ success: true });
        });
    }

    /**
     * Setup WebSocket server
     */
    setupWebSocket() {
        this.wss = new WebSocket.Server({ noServer: true });
        
        this.wss.on('connection', (ws, req) => {
            this.logger.debug('WebSocket client connected', {
                ip: req.socket.remoteAddress
            });
            
            // Add to clients
            this.clients.add(ws);
            
            // Send initial state
            this.sendToClient(ws, {
                type: 'initial',
                data: this.dashboardState
            });
            
            // Handle messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(ws, data);
                } catch (error) {
                    this.logger.error('Invalid WebSocket message', { error: error.message });
                }
            });
            
            // Handle close
            ws.on('close', () => {
                this.clients.delete(ws);
                this.logger.debug('WebSocket client disconnected');
            });
            
            // Handle error
            ws.on('error', (error) => {
                this.logger.error('WebSocket error', { error: error.message });
                this.clients.delete(ws);
            });
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Logger events
        this.logger.on('log', (entry) => {
            if (entry.level === 'ERROR' || entry.level === 'WARN') {
                this.addLog(entry);
            }
        });
        
        // Performance events
        this.optimizer.on('metrics-collected', (metrics) => {
            this.updatePerformanceMetrics(metrics);
        });
        
        // Deployment events
        this.scaler.on('scaled', (event) => {
            this.addAlert('info', `System scaled ${event.direction}`, event);
        });
        
        this.scaler.on('unhealthy', (health) => {
            this.addAlert('error', 'System unhealthy', health);
        });
        
        // Dashboard integration events
        this.dashboardIntegration.on('alert', (alert) => {
            this.addAlert(alert.severity, alert.message, alert.details);
        });
        
        this.dashboardIntegration.on('state-update', (state) => {
            this.updateWorkflowState(state);
        });
    }

    /**
     * Start data collection
     */
    startDataCollection() {
        // Collect system metrics
        this.collectionTimer = setInterval(() => {
            this.collectDashboardData();
        }, this.config.updateInterval);
        
        // Initial collection
        this.collectDashboardData();
        
        this.logger.info('Dashboard data collection started');
    }

    /**
     * Collect dashboard data
     */
    async collectDashboardData() {
        try {
            // System metrics
            const systemMetrics = this.getSystemMetrics();
            
            // Performance metrics
            const performanceMetrics = this.optimizer.collectMetrics();
            
            // Deployment status
            const deploymentStatus = this.scaler.getStatus();
            
            // Logger metrics
            const loggerMetrics = this.logger.getMetrics();
            
            // Update dashboard state
            this.dashboardState.system = systemMetrics;
            this.dashboardState.performance = performanceMetrics;
            this.dashboardState.deployment = deploymentStatus;
            this.dashboardState.logging = loggerMetrics;
            
            // Add to timeline
            this.addTimelineEntry({
                timestamp: Date.now(),
                system: systemMetrics,
                performance: performanceMetrics,
                deployment: deploymentStatus
            });
            
            // Broadcast update
            this.broadcastUpdate({
                type: 'update',
                data: this.dashboardState
            });
            
        } catch (error) {
            this.logger.error('Dashboard data collection error', {
                error: error.message
            });
        }
    }

    /**
     * Get system metrics
     */
    getSystemMetrics() {
        const cpuUsage = process.cpuUsage();
        const memUsage = process.memoryUsage();
        
        return {
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
                percentage: this.calculateCPUPercentage()
            },
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external,
                percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
            },
            uptime: process.uptime(),
            pid: process.pid,
            platform: process.platform,
            nodeVersion: process.version
        };
    }

    /**
     * Add timeline entry
     */
    addTimelineEntry(entry) {
        this.dashboardState.metrics.timeline.push(entry);
        
        // Cleanup old entries
        const cutoff = Date.now() - this.config.metricsRetention;
        this.dashboardState.metrics.timeline = this.dashboardState.metrics.timeline
            .filter(e => e.timestamp > cutoff);
    }

    /**
     * Add alert
     */
    addAlert(severity, message, details = {}) {
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            severity,
            message,
            details,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };
        
        this.dashboardState.alerts.unshift(alert);
        
        // Cleanup old alerts
        const cutoff = Date.now() - this.config.alertRetention;
        this.dashboardState.alerts = this.dashboardState.alerts
            .filter(a => new Date(a.timestamp) > cutoff);
        
        // Broadcast alert
        this.broadcastUpdate({
            type: 'alert',
            data: alert
        });
        
        this.logger.warn('Dashboard alert', { alert });
    }

    /**
     * Add log entry
     */
    addLog(entry) {
        this.dashboardState.logs.unshift(entry);
        
        // Keep only recent logs
        if (this.dashboardState.logs.length > 1000) {
            this.dashboardState.logs = this.dashboardState.logs.slice(0, 1000);
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(metrics) {
        this.dashboardState.performance = metrics;
        
        // Calculate aggregated metrics
        this.calculateAggregatedMetrics();
    }

    /**
     * Update workflow state
     */
    updateWorkflowState(state) {
        this.dashboardState.workflow = state;
    }

    /**
     * Calculate aggregated metrics
     */
    calculateAggregatedMetrics() {
        const timeline = this.dashboardState.metrics.timeline;
        if (timeline.length === 0) return;
        
        // Last 5 minutes
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const recentMetrics = timeline.filter(e => e.timestamp > fiveMinutesAgo);
        
        if (recentMetrics.length === 0) return;
        
        // Calculate averages
        const aggregated = {
            cpu: {
                avg: 0,
                max: 0,
                min: 100
            },
            memory: {
                avg: 0,
                max: 0,
                min: 100
            },
            cacheHitRate: 0,
            requestsPerMinute: 0
        };
        
        // CPU and Memory
        recentMetrics.forEach(entry => {
            const cpu = entry.system?.cpu?.percentage || 0;
            const memory = entry.system?.memory?.percentage || 0;
            
            aggregated.cpu.avg += cpu;
            aggregated.cpu.max = Math.max(aggregated.cpu.max, cpu);
            aggregated.cpu.min = Math.min(aggregated.cpu.min, cpu);
            
            aggregated.memory.avg += memory;
            aggregated.memory.max = Math.max(aggregated.memory.max, memory);
            aggregated.memory.min = Math.min(aggregated.memory.min, memory);
        });
        
        aggregated.cpu.avg /= recentMetrics.length;
        aggregated.memory.avg /= recentMetrics.length;
        
        // Cache hit rate
        const cacheMetrics = recentMetrics[recentMetrics.length - 1]?.performance?.cache;
        if (cacheMetrics) {
            aggregated.cacheHitRate = cacheMetrics.hitRate * 100;
        }
        
        this.dashboardState.metrics.aggregated = aggregated;
    }

    /**
     * WebSocket message handling
     */
    handleClientMessage(ws, message) {
        switch (message.type) {
            case 'subscribe':
                // Client subscribing to specific updates
                ws.subscriptions = message.subscriptions || ['all'];
                break;
                
            case 'command':
                this.handleCommand(ws, message.command, message.params);
                break;
                
            case 'query':
                this.handleQuery(ws, message.query, message.params);
                break;
                
            default:
                this.logger.warn('Unknown message type', { type: message.type });
        }
    }

    async handleCommand(ws, command, params) {
        try {
            let result;
            
            switch (command) {
                case 'clearCache':
                    this.optimizer.cacheClear();
                    result = { success: true };
                    break;
                    
                case 'setLogLevel':
                    this.logger.setLogLevel(params.level);
                    result = { success: true };
                    break;
                    
                case 'exportLogs':
                    result = await this.logger.exportLogs(params.format, params.options);
                    break;
                    
                default:
                    result = { error: 'Unknown command' };
            }
            
            this.sendToClient(ws, {
                type: 'commandResult',
                command,
                result
            });
            
        } catch (error) {
            this.sendToClient(ws, {
                type: 'error',
                error: error.message
            });
        }
    }

    async handleQuery(ws, query, params) {
        try {
            let result;
            
            switch (query) {
                case 'logs':
                    result = await this.getLogs(params);
                    break;
                    
                case 'metrics':
                    result = this.getMetrics(params.period, params.aggregation);
                    break;
                    
                case 'performance':
                    result = this.optimizer.exportPerformanceReport();
                    break;
                    
                default:
                    result = { error: 'Unknown query' };
            }
            
            this.sendToClient(ws, {
                type: 'queryResult',
                query,
                result
            });
            
        } catch (error) {
            this.sendToClient(ws, {
                type: 'error',
                error: error.message
            });
        }
    }

    /**
     * Send message to client
     */
    sendToClient(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    /**
     * Broadcast to all clients
     */
    broadcastUpdate(message) {
        const data = JSON.stringify(message);
        
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    /**
     * Start server
     */
    async startServer() {
        this.server = http.createServer(this.app);
        
        // Handle WebSocket upgrades
        this.server.on('upgrade', (request, socket, head) => {
            // Basic auth check if enabled
            if (this.config.auth.enabled && !this.checkAuth(request)) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
            
            this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit('connection', ws, request);
            });
        });
        
        // Start listening
        await new Promise((resolve, reject) => {
            this.server.listen(this.config.port, this.config.host, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        this.logger.info('Production monitoring dashboard started', {
            port: this.config.port,
            host: this.config.host,
            url: `http://${this.config.host}:${this.config.port}`
        });
    }

    /**
     * Basic authentication
     */
    basicAuth(req, res, next) {
        const auth = req.headers.authorization;
        
        if (!auth || !auth.startsWith('Basic ')) {
            res.status(401).set('WWW-Authenticate', 'Basic realm="Monitor"').send('Authentication required');
            return;
        }
        
        const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
        const username = credentials[0];
        const password = credentials[1];
        
        if (username === this.config.auth.username && password === this.config.auth.password) {
            next();
        } else {
            res.status(401).send('Invalid credentials');
        }
    }

    checkAuth(request) {
        const auth = request.headers.authorization;
        if (!auth || !auth.startsWith('Basic ')) return false;
        
        const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
        return credentials[0] === this.config.auth.username && 
               credentials[1] === this.config.auth.password;
    }

    /**
     * Data access methods
     */
    getSystemStatus() {
        return {
            healthy: true,
            system: this.dashboardState.system,
            deployment: this.dashboardState.deployment,
            performance: {
                cache: this.dashboardState.performance.cache,
                operations: Object.keys(this.dashboardState.performance.operations || {}).length
            },
            alerts: {
                total: this.dashboardState.alerts.length,
                unacknowledged: this.dashboardState.alerts.filter(a => !a.acknowledged).length
            }
        };
    }

    async getLogs(criteria) {
        return this.logger.searchLogs(criteria);
    }

    getMetrics(period = '1h', aggregation = '1m') {
        const timeline = this.dashboardState.metrics.timeline;
        const now = Date.now();
        
        // Parse period
        const periodMs = this.parsePeriod(period);
        const cutoff = now - periodMs;
        
        // Filter timeline
        const filtered = timeline.filter(e => e.timestamp > cutoff);
        
        // Aggregate
        const aggregationMs = this.parsePeriod(aggregation);
        const aggregated = this.aggregateTimeline(filtered, aggregationMs);
        
        return {
            period,
            aggregation,
            data: aggregated
        };
    }

    getAlerts(filters = {}) {
        let alerts = [...this.dashboardState.alerts];
        
        if (filters.severity) {
            alerts = alerts.filter(a => a.severity === filters.severity);
        }
        
        if (filters.acknowledged !== undefined) {
            alerts = alerts.filter(a => a.acknowledged === (filters.acknowledged === 'true'));
        }
        
        return alerts;
    }

    acknowledgeAlert(alertId) {
        const alert = this.dashboardState.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
        }
    }

    /**
     * Utility methods
     */
    calculateCPUPercentage() {
        const usage = process.cpuUsage();
        const total = usage.user + usage.system;
        const elapsed = process.uptime() * 1000000; // Convert to microseconds
        return (total / elapsed) * 100;
    }

    parsePeriod(period) {
        const units = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000
        };
        
        const match = period.match(/^(\d+)([smhd])$/);
        if (!match) return 3600000; // Default 1 hour
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        return value * units[unit];
    }

    aggregateTimeline(timeline, intervalMs) {
        if (timeline.length === 0) return [];
        
        const aggregated = [];
        let currentBucket = [];
        let bucketStart = Math.floor(timeline[0].timestamp / intervalMs) * intervalMs;
        
        for (const entry of timeline) {
            const entryBucket = Math.floor(entry.timestamp / intervalMs) * intervalMs;
            
            if (entryBucket !== bucketStart) {
                // Process current bucket
                if (currentBucket.length > 0) {
                    aggregated.push(this.aggregateBucket(currentBucket, bucketStart));
                }
                
                currentBucket = [entry];
                bucketStart = entryBucket;
            } else {
                currentBucket.push(entry);
            }
        }
        
        // Process last bucket
        if (currentBucket.length > 0) {
            aggregated.push(this.aggregateBucket(currentBucket, bucketStart));
        }
        
        return aggregated;
    }

    aggregateBucket(entries, timestamp) {
        const aggregated = {
            timestamp,
            cpu: 0,
            memory: 0,
            cacheHits: 0,
            cacheMisses: 0,
            requests: 0
        };
        
        entries.forEach(entry => {
            aggregated.cpu += entry.system?.cpu?.percentage || 0;
            aggregated.memory += entry.system?.memory?.percentage || 0;
            aggregated.cacheHits += entry.performance?.cache?.hits || 0;
            aggregated.cacheMisses += entry.performance?.cache?.misses || 0;
        });
        
        // Average
        aggregated.cpu /= entries.length;
        aggregated.memory /= entries.length;
        
        return aggregated;
    }

    /**
     * Shutdown
     */
    async shutdown() {
        this.logger.info('Shutting down monitoring dashboard');
        
        // Stop data collection
        if (this.collectionTimer) {
            clearInterval(this.collectionTimer);
        }
        
        // Close WebSocket connections
        this.clients.forEach(client => {
            client.close(1000, 'Server shutting down');
        });
        
        // Close servers
        if (this.wss) {
            this.wss.close();
        }
        
        if (this.server) {
            await new Promise(resolve => this.server.close(resolve));
        }
        
        this.logger.info('Monitoring dashboard shutdown complete');
    }
}

// Export singleton
let instance = null;

module.exports = {
    ProductionMonitorDashboard,
    
    getInstance() {
        if (!instance) {
            instance = new ProductionMonitorDashboard();
        }
        return instance;
    },
    
    // Convenience methods
    start: () => module.exports.getInstance().initialize(),
    stop: () => module.exports.getInstance().shutdown()
};