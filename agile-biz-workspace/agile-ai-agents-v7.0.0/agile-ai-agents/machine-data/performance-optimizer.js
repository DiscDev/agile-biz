/**
 * Performance Optimizer
 * 
 * Performance optimization and caching for production environments
 * Part of Phase 5: Production Readiness
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const { info, debug, warn, logPerformance } = require('./production-logger');

class PerformanceOptimizer extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            cache: {
                maxSize: 100 * 1024 * 1024, // 100MB
                maxItems: 10000,
                ttl: 3600000, // 1 hour default
                cleanupInterval: 300000, // 5 minutes
                strategy: 'lru' // least recently used
            },
            optimization: {
                enableParallelization: true,
                maxConcurrent: 5,
                enableBatching: true,
                batchSize: 50,
                batchTimeout: 1000, // 1 second
                enableCompression: true,
                compressionThreshold: 1024 // 1KB
            },
            performance: {
                slowThreshold: 1000, // 1 second
                monitoringInterval: 60000, // 1 minute
                metricsRetention: 3600000 // 1 hour
            }
        };
        
        // Cache storage
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            size: 0
        };
        
        // Batch processing
        this.batchQueues = new Map();
        this.batchTimers = new Map();
        
        // Performance metrics
        this.performanceMetrics = new Map();
        this.operationTimings = new Map();
        
        // Resource pools
        this.resourcePools = {
            workers: [],
            connections: new Map(),
            buffers: []
        };
        
        // Initialize
        this.initialize();
    }

    /**
     * Initialize optimizer
     */
    initialize() {
        info('Performance optimizer initializing');
        
        // Start cleanup interval
        this.cleanupTimer = setInterval(() => {
            this.cleanupCache();
        }, this.config.cache.cleanupInterval);
        
        // Start monitoring
        this.monitoringTimer = setInterval(() => {
            this.collectMetrics();
        }, this.config.performance.monitoringInterval);
        
        // Setup resource pools
        this.setupResourcePools();
        
        debug('Performance optimizer initialized', {
            cacheSize: this.config.cache.maxSize,
            maxConcurrent: this.config.optimization.maxConcurrent
        });
    }

    /**
     * Cache operations
     */
    async cacheGet(key, options = {}) {
        const startTime = Date.now();
        const hashedKey = this.hashKey(key);
        
        const entry = this.cache.get(hashedKey);
        
        if (entry) {
            const now = Date.now();
            const ttl = options.ttl || this.config.cache.ttl;
            
            if (now - entry.timestamp < ttl) {
                // Cache hit
                entry.lastAccessed = now;
                entry.hits++;
                this.cacheStats.hits++;
                
                logPerformance('cache.get', Date.now() - startTime, {
                    key,
                    hit: true,
                    size: entry.size
                });
                
                return entry.value;
            } else {
                // Expired
                this.cache.delete(hashedKey);
                this.cacheStats.size -= entry.size;
            }
        }
        
        // Cache miss
        this.cacheStats.misses++;
        
        logPerformance('cache.get', Date.now() - startTime, {
            key,
            hit: false
        });
        
        return null;
    }

    async cacheSet(key, value, options = {}) {
        const startTime = Date.now();
        const hashedKey = this.hashKey(key);
        
        // Serialize and optionally compress
        const serialized = JSON.stringify(value);
        const size = Buffer.byteLength(serialized);
        
        let data = serialized;
        let compressed = false;
        
        if (this.config.optimization.enableCompression && 
            size > this.config.optimization.compressionThreshold) {
            data = await this.compress(serialized);
            compressed = true;
        }
        
        // Check cache size
        if (this.cacheStats.size + size > this.config.cache.maxSize) {
            await this.evictLRU(size);
        }
        
        // Store in cache
        const entry = {
            key,
            value,
            data,
            size,
            compressed,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            hits: 0,
            ttl: options.ttl || this.config.cache.ttl
        };
        
        this.cache.set(hashedKey, entry);
        this.cacheStats.size += size;
        
        logPerformance('cache.set', Date.now() - startTime, {
            key,
            size,
            compressed
        });
        
        return true;
    }

    async cacheDelete(key) {
        const hashedKey = this.hashKey(key);
        const entry = this.cache.get(hashedKey);
        
        if (entry) {
            this.cache.delete(hashedKey);
            this.cacheStats.size -= entry.size;
            return true;
        }
        
        return false;
    }

    cacheClear() {
        this.cache.clear();
        this.cacheStats.size = 0;
        this.cacheStats.evictions += this.cache.size;
        
        info('Cache cleared');
    }

    /**
     * Performance optimization
     */
    async optimizeOperation(operation, params) {
        const startTime = Date.now();
        const operationId = `${operation}-${Date.now()}-${Math.random()}`;
        
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(operation, params);
            const cached = await this.cacheGet(cacheKey);
            
            if (cached) {
                debug('Operation served from cache', { operation, cacheKey });
                return cached;
            }
            
            // Apply optimizations
            let result;
            
            if (this.config.optimization.enableBatching && 
                this.isBatchable(operation)) {
                result = await this.batchOperation(operation, params);
            } else if (this.config.optimization.enableParallelization && 
                       this.isParallelizable(operation)) {
                result = await this.parallelizeOperation(operation, params);
            } else {
                result = await this.executeOperation(operation, params);
            }
            
            // Cache result
            await this.cacheSet(cacheKey, result);
            
            // Record performance
            const duration = Date.now() - startTime;
            this.recordOperationMetrics(operation, duration, params);
            
            return result;
            
        } catch (error) {
            warn('Operation optimization failed', {
                operation,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Batch operations
     */
    async batchOperation(operation, params) {
        return new Promise((resolve, reject) => {
            // Add to batch queue
            if (!this.batchQueues.has(operation)) {
                this.batchQueues.set(operation, []);
            }
            
            const queue = this.batchQueues.get(operation);
            queue.push({ params, resolve, reject });
            
            // Start batch timer if not running
            if (!this.batchTimers.has(operation)) {
                const timer = setTimeout(() => {
                    this.processBatch(operation);
                }, this.config.optimization.batchTimeout);
                
                this.batchTimers.set(operation, timer);
            }
            
            // Process immediately if batch is full
            if (queue.length >= this.config.optimization.batchSize) {
                clearTimeout(this.batchTimers.get(operation));
                this.batchTimers.delete(operation);
                this.processBatch(operation);
            }
        });
    }

    async processBatch(operation) {
        const queue = this.batchQueues.get(operation);
        if (!queue || queue.length === 0) return;
        
        const batch = queue.splice(0, this.config.optimization.batchSize);
        this.batchQueues.set(operation, queue);
        
        debug('Processing batch', {
            operation,
            batchSize: batch.length
        });
        
        try {
            // Execute batch operation
            const results = await this.executeBatchOperation(operation, 
                batch.map(item => item.params));
            
            // Resolve individual promises
            batch.forEach((item, index) => {
                item.resolve(results[index]);
            });
            
        } catch (error) {
            // Reject all promises in batch
            batch.forEach(item => {
                item.reject(error);
            });
        }
    }

    /**
     * Parallelize operations
     */
    async parallelizeOperation(operation, params) {
        const { items, processor } = params;
        
        if (!Array.isArray(items)) {
            return this.executeOperation(operation, params);
        }
        
        const chunks = this.chunkArray(items, this.config.optimization.maxConcurrent);
        const results = [];
        
        for (const chunk of chunks) {
            const chunkResults = await Promise.all(
                chunk.map(item => processor(item))
            );
            results.push(...chunkResults);
        }
        
        return results;
    }

    /**
     * Execute single operation
     */
    async executeOperation(operation, params) {
        // This would be overridden by specific implementations
        debug('Executing operation', { operation });
        
        // Simulate operation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { operation, params, result: 'success' };
    }

    async executeBatchOperation(operation, batchParams) {
        // This would be overridden by specific implementations
        debug('Executing batch operation', { 
            operation, 
            batchSize: batchParams.length 
        });
        
        // Simulate batch operation
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return batchParams.map(params => ({
            operation,
            params,
            result: 'success'
        }));
    }

    /**
     * Resource pool management
     */
    setupResourcePools() {
        // Pre-allocate buffers
        for (let i = 0; i < 10; i++) {
            this.resourcePools.buffers.push(Buffer.allocUnsafe(1024 * 1024)); // 1MB
        }
        
        debug('Resource pools initialized', {
            buffers: this.resourcePools.buffers.length
        });
    }

    acquireBuffer(size) {
        // Find or allocate buffer
        for (const buffer of this.resourcePools.buffers) {
            if (buffer.length >= size && !buffer.inUse) {
                buffer.inUse = true;
                return buffer.slice(0, size);
            }
        }
        
        // Allocate new buffer if needed
        const buffer = Buffer.allocUnsafe(size);
        buffer.inUse = true;
        this.resourcePools.buffers.push(buffer);
        
        return buffer;
    }

    releaseBuffer(buffer) {
        buffer.inUse = false;
    }

    /**
     * Performance monitoring
     */
    recordOperationMetrics(operation, duration, params = {}) {
        if (!this.performanceMetrics.has(operation)) {
            this.performanceMetrics.set(operation, {
                count: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                avgDuration: 0,
                slowCount: 0,
                errors: 0,
                lastUpdated: Date.now()
            });
        }
        
        const metrics = this.performanceMetrics.get(operation);
        metrics.count++;
        metrics.totalDuration += duration;
        metrics.minDuration = Math.min(metrics.minDuration, duration);
        metrics.maxDuration = Math.max(metrics.maxDuration, duration);
        metrics.avgDuration = metrics.totalDuration / metrics.count;
        metrics.lastUpdated = Date.now();
        
        if (duration > this.config.performance.slowThreshold) {
            metrics.slowCount++;
            warn('Slow operation detected', {
                operation,
                duration,
                threshold: this.config.performance.slowThreshold
            });
        }
        
        // Track timing history
        if (!this.operationTimings.has(operation)) {
            this.operationTimings.set(operation, []);
        }
        
        const timings = this.operationTimings.get(operation);
        timings.push({ duration, timestamp: Date.now() });
        
        // Keep only recent timings
        const cutoff = Date.now() - this.config.performance.metricsRetention;
        this.operationTimings.set(operation, 
            timings.filter(t => t.timestamp > cutoff));
        
        logPerformance(operation, duration, params);
    }

    collectMetrics() {
        const metrics = {
            cache: {
                ...this.cacheStats,
                hitRate: this.cacheStats.hits / 
                    (this.cacheStats.hits + this.cacheStats.misses) || 0
            },
            operations: {},
            resources: {
                buffers: {
                    total: this.resourcePools.buffers.length,
                    inUse: this.resourcePools.buffers.filter(b => b.inUse).length
                }
            },
            timestamp: Date.now()
        };
        
        // Collect operation metrics
        for (const [operation, opMetrics] of this.performanceMetrics) {
            metrics.operations[operation] = {
                ...opMetrics,
                recentTimings: this.getRecentTimings(operation)
            };
        }
        
        this.emit('metrics-collected', metrics);
        
        return metrics;
    }

    getRecentTimings(operation, count = 10) {
        const timings = this.operationTimings.get(operation) || [];
        return timings.slice(-count);
    }

    /**
     * Cache management
     */
    async evictLRU(requiredSize) {
        const entries = Array.from(this.cache.entries())
            .map(([key, entry]) => ({ key, ...entry }))
            .sort((a, b) => a.lastAccessed - b.lastAccessed);
        
        let freedSize = 0;
        
        for (const entry of entries) {
            this.cache.delete(entry.key);
            freedSize += entry.size;
            this.cacheStats.evictions++;
            
            if (freedSize >= requiredSize) break;
        }
        
        this.cacheStats.size -= freedSize;
        
        debug('Cache eviction completed', {
            freedSize,
            evicted: this.cacheStats.evictions
        });
    }

    cleanupCache() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                this.cacheStats.size -= entry.size;
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            debug('Cache cleanup completed', { cleaned });
        }
    }

    /**
     * Optimization helpers
     */
    isBatchable(operation) {
        // Define which operations can be batched
        const batchableOperations = [
            'document.validate',
            'document.generate',
            'agent.invoke',
            'state.update'
        ];
        
        return batchableOperations.includes(operation);
    }

    isParallelizable(operation) {
        // Define which operations can be parallelized
        const parallelizableOperations = [
            'document.process',
            'agent.analyze',
            'file.read',
            'validation.check'
        ];
        
        return parallelizableOperations.includes(operation);
    }

    generateCacheKey(operation, params) {
        const key = `${operation}:${JSON.stringify(params)}`;
        return key;
    }

    hashKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    async compress(data) {
        const zlib = require('zlib');
        return new Promise((resolve, reject) => {
            zlib.gzip(data, (err, compressed) => {
                if (err) reject(err);
                else resolve(compressed);
            });
        });
    }

    async decompress(data) {
        const zlib = require('zlib');
        return new Promise((resolve, reject) => {
            zlib.gunzip(data, (err, decompressed) => {
                if (err) reject(err);
                else resolve(decompressed);
            });
        });
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Performance recommendations
     */
    getPerformanceRecommendations() {
        const recommendations = [];
        
        // Check cache hit rate
        const hitRate = this.cacheStats.hits / 
            (this.cacheStats.hits + this.cacheStats.misses);
            
        if (hitRate < 0.5) {
            recommendations.push({
                area: 'cache',
                issue: 'Low cache hit rate',
                value: hitRate,
                recommendation: 'Consider increasing cache TTL or size'
            });
        }
        
        // Check slow operations
        for (const [operation, metrics] of this.performanceMetrics) {
            if (metrics.slowCount / metrics.count > 0.1) {
                recommendations.push({
                    area: 'performance',
                    issue: 'Frequent slow operations',
                    operation,
                    percentage: (metrics.slowCount / metrics.count * 100).toFixed(1),
                    recommendation: 'Optimize operation or increase resources'
                });
            }
        }
        
        return recommendations;
    }

    /**
     * Export performance report
     */
    exportPerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            cache: {
                ...this.cacheStats,
                configuration: this.config.cache
            },
            operations: Object.fromEntries(this.performanceMetrics),
            recommendations: this.getPerformanceRecommendations(),
            resources: {
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        };
        
        return report;
    }

    /**
     * Shutdown and cleanup
     */
    shutdown() {
        info('Performance optimizer shutting down');
        
        // Clear timers
        if (this.cleanupTimer) clearInterval(this.cleanupTimer);
        if (this.monitoringTimer) clearInterval(this.monitoringTimer);
        
        // Clear batch timers
        for (const timer of this.batchTimers.values()) {
            clearTimeout(timer);
        }
        
        // Clear cache
        this.cacheClear();
        
        // Remove listeners
        this.removeAllListeners();
    }
}

// Singleton instance
let instance = null;

module.exports = {
    PerformanceOptimizer,
    
    getInstance() {
        if (!instance) {
            instance = new PerformanceOptimizer();
        }
        return instance;
    },
    
    // Convenience methods
    optimize: (operation, params) => 
        module.exports.getInstance().optimizeOperation(operation, params),
    cacheGet: (key, options) => 
        module.exports.getInstance().cacheGet(key, options),
    cacheSet: (key, value, options) => 
        module.exports.getInstance().cacheSet(key, value, options),
    getMetrics: () => 
        module.exports.getInstance().collectMetrics(),
    getPerformanceReport: () => 
        module.exports.getInstance().exportPerformanceReport()
};