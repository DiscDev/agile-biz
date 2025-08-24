/**
 * Deployment and Scaling Configuration
 * 
 * Manages deployment, scaling, and production configuration
 * Part of Phase 5: Production Readiness
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const cluster = require('cluster');
const EventEmitter = require('events');
const { info, error, warn, debug } = require('./production-logger');

class DeploymentScaler extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            deployment: {
                environment: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 3000,
                host: process.env.HOST || '0.0.0.0',
                basePath: process.cwd(),
                configPath: path.join(process.cwd(), 'deployment.json')
            },
            scaling: {
                mode: 'auto', // 'manual', 'auto', 'cluster'
                minInstances: 1,
                maxInstances: os.cpus().length,
                targetCPU: 70, // percentage
                targetMemory: 80, // percentage
                scaleUpThreshold: 80,
                scaleDownThreshold: 20,
                cooldownPeriod: 60000 // 1 minute
            },
            cluster: {
                workers: os.cpus().length,
                restartDelay: 5000,
                maxRestarts: 3,
                gracefulShutdownTimeout: 30000
            },
            healthCheck: {
                enabled: true,
                interval: 30000, // 30 seconds
                timeout: 5000,
                path: '/health',
                unhealthyThreshold: 3
            },
            resources: {
                maxMemory: 512 * 1024 * 1024, // 512MB
                maxCPU: 90, // percentage
                diskSpace: 1024 * 1024 * 1024 // 1GB
            }
        };
        
        // State
        this.workers = new Map();
        this.metrics = {
            cpu: [],
            memory: [],
            requests: 0,
            errors: 0,
            restarts: 0
        };
        this.lastScaleAction = 0;
        this.isHealthy = true;
        
        // Load deployment config
        this.loadDeploymentConfig();
    }

    /**
     * Initialize deployment
     */
    async initialize() {
        info('Initializing deployment scaler', {
            environment: this.config.deployment.environment,
            mode: this.config.scaling.mode
        });
        
        if (cluster.isMaster && this.config.scaling.mode === 'cluster') {
            await this.initializeMaster();
        } else {
            await this.initializeWorker();
        }
        
        // Start monitoring
        this.startMonitoring();
        
        // Setup graceful shutdown
        this.setupGracefulShutdown();
    }

    /**
     * Initialize master process
     */
    async initializeMaster() {
        info('Initializing master process', {
            workers: this.config.cluster.workers
        });
        
        // Fork workers
        for (let i = 0; i < this.config.cluster.workers; i++) {
            this.forkWorker();
        }
        
        // Handle worker events
        cluster.on('exit', (worker, code, signal) => {
            error('Worker died', {
                workerId: worker.id,
                pid: worker.process.pid,
                code,
                signal
            });
            
            this.handleWorkerExit(worker);
        });
        
        cluster.on('message', (worker, message) => {
            this.handleWorkerMessage(worker, message);
        });
        
        // Start auto-scaling
        if (this.config.scaling.mode === 'auto') {
            this.startAutoScaling();
        }
    }

    /**
     * Initialize worker process
     */
    async initializeWorker() {
        info('Initializing worker process', {
            workerId: cluster.worker?.id || 'single',
            pid: process.pid
        });
        
        // Setup worker health reporting
        if (cluster.worker) {
            setInterval(() => {
                this.reportWorkerHealth();
            }, 10000);
        }
        
        // Handle worker-specific initialization
        await this.setupWorkerEnvironment();
    }

    /**
     * Fork new worker
     */
    forkWorker() {
        const worker = cluster.fork({
            ...process.env,
            WORKER_ID: Date.now()
        });
        
        const workerInfo = {
            id: worker.id,
            pid: worker.process.pid,
            startTime: Date.now(),
            restarts: 0,
            healthy: true
        };
        
        this.workers.set(worker.id, workerInfo);
        
        info('Worker forked', {
            workerId: worker.id,
            pid: worker.process.pid
        });
        
        return worker;
    }

    /**
     * Handle worker exit
     */
    handleWorkerExit(worker) {
        const workerInfo = this.workers.get(worker.id);
        
        if (workerInfo) {
            workerInfo.restarts++;
            this.metrics.restarts++;
            
            if (workerInfo.restarts <= this.config.cluster.maxRestarts) {
                warn('Restarting worker', {
                    workerId: worker.id,
                    restarts: workerInfo.restarts
                });
                
                setTimeout(() => {
                    this.forkWorker();
                }, this.config.cluster.restartDelay);
            } else {
                error('Worker exceeded max restarts', {
                    workerId: worker.id,
                    restarts: workerInfo.restarts
                });
            }
            
            this.workers.delete(worker.id);
        }
    }

    /**
     * Handle worker messages
     */
    handleWorkerMessage(worker, message) {
        if (message.type === 'health') {
            this.updateWorkerHealth(worker.id, message.data);
        } else if (message.type === 'metrics') {
            this.updateWorkerMetrics(worker.id, message.data);
        }
    }

    /**
     * Auto-scaling logic
     */
    startAutoScaling() {
        this.scaleTimer = setInterval(() => {
            this.checkScaling();
        }, 30000); // Check every 30 seconds
        
        info('Auto-scaling started');
    }

    async checkScaling() {
        const now = Date.now();
        
        // Check cooldown period
        if (now - this.lastScaleAction < this.config.scaling.cooldownPeriod) {
            return;
        }
        
        const metrics = this.getAverageMetrics();
        const currentWorkers = this.workers.size;
        
        debug('Checking scaling', {
            currentWorkers,
            cpu: metrics.cpu,
            memory: metrics.memory
        });
        
        // Scale up
        if ((metrics.cpu > this.config.scaling.scaleUpThreshold || 
             metrics.memory > this.config.scaling.scaleUpThreshold) &&
            currentWorkers < this.config.scaling.maxInstances) {
            
            await this.scaleUp();
            this.lastScaleAction = now;
        }
        
        // Scale down
        else if (metrics.cpu < this.config.scaling.scaleDownThreshold &&
                 metrics.memory < this.config.scaling.scaleDownThreshold &&
                 currentWorkers > this.config.scaling.minInstances) {
            
            await this.scaleDown();
            this.lastScaleAction = now;
        }
    }

    async scaleUp() {
        const newWorkers = Math.min(
            this.workers.size + 1,
            this.config.scaling.maxInstances
        );
        
        info('Scaling up', {
            current: this.workers.size,
            target: newWorkers
        });
        
        this.forkWorker();
        
        this.emit('scaled', {
            direction: 'up',
            workers: newWorkers
        });
    }

    async scaleDown() {
        const targetWorkers = Math.max(
            this.workers.size - 1,
            this.config.scaling.minInstances
        );
        
        info('Scaling down', {
            current: this.workers.size,
            target: targetWorkers
        });
        
        // Find least loaded worker
        const workerToKill = this.findLeastLoadedWorker();
        
        if (workerToKill) {
            cluster.workers[workerToKill].kill('SIGTERM');
        }
        
        this.emit('scaled', {
            direction: 'down',
            workers: targetWorkers
        });
    }

    /**
     * Health checks
     */
    startMonitoring() {
        // Collect system metrics
        this.metricsTimer = setInterval(() => {
            this.collectSystemMetrics();
        }, 5000);
        
        // Health checks
        if (this.config.healthCheck.enabled) {
            this.healthTimer = setInterval(() => {
                this.performHealthCheck();
            }, this.config.healthCheck.interval);
        }
    }

    collectSystemMetrics() {
        const cpuUsage = process.cpuUsage();
        const memUsage = process.memoryUsage();
        
        const metrics = {
            cpu: this.calculateCPUPercentage(cpuUsage),
            memory: (memUsage.heapUsed / memUsage.heapTotal) * 100,
            rss: memUsage.rss,
            external: memUsage.external,
            timestamp: Date.now()
        };
        
        // Store metrics
        this.metrics.cpu.push(metrics.cpu);
        this.metrics.memory.push(metrics.memory);
        
        // Keep only recent metrics
        const maxMetrics = 60; // 5 minutes at 5-second intervals
        if (this.metrics.cpu.length > maxMetrics) {
            this.metrics.cpu.shift();
            this.metrics.memory.shift();
        }
        
        // Check resource limits
        this.checkResourceLimits(metrics);
        
        return metrics;
    }

    async performHealthCheck() {
        try {
            const health = await this.checkSystemHealth();
            
            if (!health.healthy) {
                warn('System unhealthy', health);
                this.isHealthy = false;
                this.emit('unhealthy', health);
            } else if (!this.isHealthy) {
                info('System recovered');
                this.isHealthy = true;
                this.emit('healthy');
            }
            
        } catch (error) {
            error('Health check failed', {
                error: error.message
            });
        }
    }

    async checkSystemHealth() {
        const checks = {
            memory: this.checkMemoryHealth(),
            disk: await this.checkDiskHealth(),
            workers: this.checkWorkerHealth(),
            services: await this.checkServiceHealth()
        };
        
        const healthy = Object.values(checks).every(check => check.healthy);
        
        return {
            healthy,
            checks,
            timestamp: Date.now()
        };
    }

    checkMemoryHealth() {
        const memUsage = process.memoryUsage();
        const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        return {
            healthy: usagePercent < this.config.resources.maxMemory,
            usage: usagePercent,
            details: memUsage
        };
    }

    async checkDiskHealth() {
        try {
            const stats = fs.statfsSync(this.config.deployment.basePath);
            const available = stats.bavail * stats.bsize;
            
            return {
                healthy: available > this.config.resources.diskSpace,
                available,
                required: this.config.resources.diskSpace
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }

    checkWorkerHealth() {
        const healthyWorkers = Array.from(this.workers.values())
            .filter(w => w.healthy).length;
        
        return {
            healthy: healthyWorkers >= this.config.scaling.minInstances,
            healthyWorkers,
            totalWorkers: this.workers.size
        };
    }

    async checkServiceHealth() {
        // Check critical services
        const services = {
            database: await this.checkDatabaseConnection(),
            cache: await this.checkCacheConnection(),
            filesystem: await this.checkFilesystemAccess()
        };
        
        const healthy = Object.values(services).every(s => s);
        
        return {
            healthy,
            services
        };
    }

    /**
     * Deployment configuration
     */
    loadDeploymentConfig() {
        if (fs.existsSync(this.config.deployment.configPath)) {
            try {
                const config = JSON.parse(
                    fs.readFileSync(this.config.deployment.configPath, 'utf8')
                );
                
                this.config = this.mergeConfig(this.config, config);
                
                info('Deployment config loaded', {
                    path: this.config.deployment.configPath
                });
                
            } catch (error) {
                error('Failed to load deployment config', {
                    error: error.message
                });
            }
        }
    }

    saveDeploymentConfig() {
        const config = {
            deployment: this.config.deployment,
            scaling: this.config.scaling,
            cluster: this.config.cluster,
            healthCheck: this.config.healthCheck,
            resources: this.config.resources
        };
        
        fs.writeFileSync(
            this.config.deployment.configPath,
            JSON.stringify(config, null, 2)
        );
        
        info('Deployment config saved');
    }

    /**
     * Environment management
     */
    async setupWorkerEnvironment() {
        // Set resource limits
        if (process.platform !== 'win32') {
            try {
                process.setrlimit('nofile', {
                    soft: 4096,
                    hard: 4096
                });
            } catch (error) {
                warn('Failed to set file descriptor limit', {
                    error: error.message
                });
            }
        }
        
        // Configure process
        process.title = `agile-ai-worker-${cluster.worker?.id || 'single'}`;
        
        // Set memory limit
        if (this.config.resources.maxMemory) {
            const v8 = require('v8');
            v8.setFlagsFromString(`--max-old-space-size=${
                Math.floor(this.config.resources.maxMemory / 1024 / 1024)
            }`);
        }
    }

    reportWorkerHealth() {
        if (!cluster.worker) return;
        
        const health = {
            cpu: this.calculateCPUPercentage(process.cpuUsage()),
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            requests: this.metrics.requests,
            errors: this.metrics.errors
        };
        
        process.send({
            type: 'health',
            data: health
        });
    }

    /**
     * Graceful shutdown
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            info('Graceful shutdown initiated', { signal });
            
            // Stop accepting new connections
            this.emit('shutdown-start');
            
            // Wait for ongoing requests
            await this.drainConnections();
            
            // Cleanup
            this.cleanup();
            
            // Exit
            process.exit(0);
        };
        
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }

    async drainConnections() {
        info('Draining connections');
        
        return new Promise((resolve) => {
            setTimeout(resolve, this.config.cluster.gracefulShutdownTimeout);
        });
    }

    cleanup() {
        // Clear timers
        if (this.scaleTimer) clearInterval(this.scaleTimer);
        if (this.metricsTimer) clearInterval(this.metricsTimer);
        if (this.healthTimer) clearInterval(this.healthTimer);
        
        // Save final state
        this.saveDeploymentConfig();
        
        info('Cleanup completed');
    }

    /**
     * Utility methods
     */
    calculateCPUPercentage(cpuUsage) {
        const user = cpuUsage.user / 1000000; // Convert to seconds
        const system = cpuUsage.system / 1000000;
        const total = user + system;
        const elapsed = process.uptime();
        
        return (total / elapsed) * 100;
    }

    getAverageMetrics() {
        const avgCPU = this.metrics.cpu.length > 0
            ? this.metrics.cpu.reduce((a, b) => a + b) / this.metrics.cpu.length
            : 0;
            
        const avgMemory = this.metrics.memory.length > 0
            ? this.metrics.memory.reduce((a, b) => a + b) / this.metrics.memory.length
            : 0;
            
        return { cpu: avgCPU, memory: avgMemory };
    }

    findLeastLoadedWorker() {
        let leastLoaded = null;
        let minLoad = Infinity;
        
        for (const [id, info] of this.workers) {
            const load = info.metrics?.cpu || 0;
            if (load < minLoad) {
                minLoad = load;
                leastLoaded = id;
            }
        }
        
        return leastLoaded;
    }

    updateWorkerHealth(workerId, health) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.metrics = health;
            worker.lastHealthReport = Date.now();
        }
    }

    checkResourceLimits(metrics) {
        if (metrics.cpu > this.config.resources.maxCPU) {
            warn('CPU limit exceeded', {
                current: metrics.cpu,
                limit: this.config.resources.maxCPU
            });
        }
        
        if (metrics.rss > this.config.resources.maxMemory) {
            error('Memory limit exceeded', {
                current: metrics.rss,
                limit: this.config.resources.maxMemory
            });
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
        }
    }

    mergeConfig(defaultConfig, customConfig) {
        const merged = { ...defaultConfig };
        
        for (const key in customConfig) {
            if (typeof customConfig[key] === 'object' && !Array.isArray(customConfig[key])) {
                merged[key] = { ...defaultConfig[key], ...customConfig[key] };
            } else {
                merged[key] = customConfig[key];
            }
        }
        
        return merged;
    }

    /**
     * Service health checks (stubs)
     */
    async checkDatabaseConnection() {
        // Implement actual database check
        return true;
    }

    async checkCacheConnection() {
        // Implement actual cache check
        return true;
    }

    async checkFilesystemAccess() {
        try {
            const testFile = path.join(os.tmpdir(), '.health-check');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get deployment status
     */
    getStatus() {
        return {
            environment: this.config.deployment.environment,
            mode: this.config.scaling.mode,
            workers: {
                current: this.workers.size,
                min: this.config.scaling.minInstances,
                max: this.config.scaling.maxInstances,
                healthy: Array.from(this.workers.values()).filter(w => w.healthy).length
            },
            metrics: this.getAverageMetrics(),
            health: this.isHealthy,
            uptime: process.uptime(),
            restarts: this.metrics.restarts
        };
    }

    /**
     * Export deployment report
     */
    exportDeploymentReport() {
        const report = {
            timestamp: new Date().toISOString(),
            status: this.getStatus(),
            configuration: this.config,
            workers: Array.from(this.workers.values()),
            metrics: {
                cpu: this.metrics.cpu.slice(-10),
                memory: this.metrics.memory.slice(-10),
                requests: this.metrics.requests,
                errors: this.metrics.errors
            },
            recommendations: this.getScalingRecommendations()
        };
        
        return report;
    }

    getScalingRecommendations() {
        const recommendations = [];
        const metrics = this.getAverageMetrics();
        
        if (metrics.cpu > 80) {
            recommendations.push({
                type: 'scaling',
                severity: 'high',
                message: 'High CPU usage, consider scaling up',
                value: metrics.cpu
            });
        }
        
        if (metrics.memory > 85) {
            recommendations.push({
                type: 'resources',
                severity: 'high',
                message: 'High memory usage, consider increasing memory limit',
                value: metrics.memory
            });
        }
        
        if (this.metrics.restarts > 10) {
            recommendations.push({
                type: 'stability',
                severity: 'critical',
                message: 'High restart count, investigate worker stability',
                value: this.metrics.restarts
            });
        }
        
        return recommendations;
    }
}

// Export singleton
let instance = null;

module.exports = {
    DeploymentScaler,
    
    getInstance() {
        if (!instance) {
            instance = new DeploymentScaler();
        }
        return instance;
    },
    
    // Convenience methods
    initialize: () => module.exports.getInstance().initialize(),
    getStatus: () => module.exports.getInstance().getStatus(),
    scaleUp: () => module.exports.getInstance().scaleUp(),
    scaleDown: () => module.exports.getInstance().scaleDown()
};