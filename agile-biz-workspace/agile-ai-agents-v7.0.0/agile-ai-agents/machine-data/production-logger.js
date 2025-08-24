/**
 * Production Logger
 * 
 * Comprehensive logging and monitoring for production environments
 * Part of Phase 5: Production Readiness
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const crypto = require('crypto');

class ProductionLogger extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            logDir: path.join(__dirname, '../logs'),
            logRotation: {
                maxSize: 10 * 1024 * 1024, // 10MB
                maxFiles: 10,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            },
            levels: {
                ERROR: 0,
                WARN: 1,
                INFO: 2,
                DEBUG: 3,
                TRACE: 4
            },
            defaultLevel: 'INFO',
            asyncWrite: true,
            bufferSize: 100,
            flushInterval: 5000, // 5 seconds
            includeStackTrace: true,
            redactPatterns: [
                /api[_-]?key/i,
                /password/i,
                /token/i,
                /secret/i,
                /credential/i
            ]
        };
        
        // State
        this.currentLevel = this.config.levels[this.config.defaultLevel];
        this.logBuffer = [];
        this.logFiles = new Map();
        this.metrics = {
            totalLogs: 0,
            byLevel: {},
            errors: 0,
            warnings: 0,
            performance: {}
        };
        
        // Session info
        this.sessionId = this.generateSessionId();
        this.sessionStart = new Date();
        
        // Initialize
        this.initialize();
    }

    /**
     * Initialize logger
     */
    initialize() {
        // Ensure log directory exists
        if (!fs.existsSync(this.config.logDir)) {
            fs.mkdirSync(this.config.logDir, { recursive: true });
        }
        
        // Initialize log files
        this.initializeLogFiles();
        
        // Start buffer flush interval
        if (this.config.asyncWrite) {
            this.flushTimer = setInterval(() => {
                this.flushBuffer();
            }, this.config.flushInterval);
        }
        
        // Setup process handlers
        this.setupProcessHandlers();
        
        // Log session start
        this.info('Logger initialized', {
            sessionId: this.sessionId,
            pid: process.pid,
            node: process.version,
            platform: process.platform
        });
    }

    /**
     * Log methods by level
     */
    error(message, context = {}) {
        this.log('ERROR', message, context);
    }

    warn(message, context = {}) {
        this.log('WARN', message, context);
    }

    info(message, context = {}) {
        this.log('INFO', message, context);
    }

    debug(message, context = {}) {
        this.log('DEBUG', message, context);
    }

    trace(message, context = {}) {
        this.log('TRACE', message, context);
    }

    /**
     * Core logging method
     */
    log(level, message, context = {}) {
        // Check log level
        if (this.config.levels[level] > this.currentLevel) {
            return;
        }
        
        // Create log entry
        const entry = this.createLogEntry(level, message, context);
        
        // Update metrics
        this.updateMetrics(level);
        
        // Write log
        if (this.config.asyncWrite) {
            this.bufferLog(entry);
        } else {
            this.writeLog(entry);
        }
        
        // Emit event
        this.emit('log', entry);
        
        // Console output in development
        if (process.env.NODE_ENV !== 'production') {
            this.consoleLog(entry);
        }
    }

    /**
     * Create log entry
     */
    createLogEntry(level, message, context) {
        const timestamp = new Date().toISOString();
        const caller = this.getCallerInfo();
        
        // Redact sensitive data
        const safeContext = this.redactSensitiveData(context);
        
        const entry = {
            timestamp,
            level,
            message,
            context: safeContext,
            sessionId: this.sessionId,
            correlationId: context.correlationId || this.generateCorrelationId(),
            caller,
            pid: process.pid,
            hostname: require('os').hostname()
        };
        
        // Add stack trace for errors
        if (level === 'ERROR' && this.config.includeStackTrace) {
            entry.stack = new Error().stack;
        }
        
        return entry;
    }

    /**
     * Log performance metrics
     */
    logPerformance(operation, duration, metadata = {}) {
        const perfEntry = {
            operation,
            duration,
            timestamp: new Date().toISOString(),
            ...metadata
        };
        
        // Update performance metrics
        if (!this.metrics.performance[operation]) {
            this.metrics.performance[operation] = {
                count: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                avgDuration: 0
            };
        }
        
        const perf = this.metrics.performance[operation];
        perf.count++;
        perf.totalDuration += duration;
        perf.minDuration = Math.min(perf.minDuration, duration);
        perf.maxDuration = Math.max(perf.maxDuration, duration);
        perf.avgDuration = perf.totalDuration / perf.count;
        
        // Log if duration exceeds threshold
        if (duration > (metadata.threshold || 1000)) {
            this.warn(`Slow operation: ${operation}`, {
                duration,
                threshold: metadata.threshold,
                ...metadata
            });
        }
        
        // Emit performance event
        this.emit('performance', perfEntry);
    }

    /**
     * Log workflow events
     */
    logWorkflowEvent(eventType, workflowId, data = {}) {
        const workflowEntry = {
            eventType,
            workflowId,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        this.info(`Workflow ${eventType}`, {
            workflow: workflowEntry
        });
        
        // Emit workflow event
        this.emit('workflow-event', workflowEntry);
    }

    /**
     * Log agent activity
     */
    logAgentActivity(agentName, activity, data = {}) {
        const agentEntry = {
            agent: agentName,
            activity,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        this.debug(`Agent ${activity}: ${agentName}`, {
            agent: agentEntry
        });
        
        // Emit agent event
        this.emit('agent-activity', agentEntry);
    }

    /**
     * Log document operations
     */
    logDocumentOperation(operation, documentId, data = {}) {
        const docEntry = {
            operation,
            documentId,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        this.info(`Document ${operation}`, {
            document: docEntry
        });
        
        // Emit document event
        this.emit('document-operation', docEntry);
    }

    /**
     * Buffer log for async writing
     */
    bufferLog(entry) {
        this.logBuffer.push(entry);
        
        // Flush if buffer is full
        if (this.logBuffer.length >= this.config.bufferSize) {
            this.flushBuffer();
        }
    }

    /**
     * Flush log buffer
     */
    flushBuffer() {
        if (this.logBuffer.length === 0) return;
        
        const entries = [...this.logBuffer];
        this.logBuffer = [];
        
        // Write all entries
        for (const entry of entries) {
            this.writeLog(entry);
        }
    }

    /**
     * Write log entry to files
     */
    writeLog(entry) {
        try {
            // Format log line
            const logLine = this.formatLogEntry(entry);
            
            // Write to main log
            this.appendToLogFile('main.log', logLine);
            
            // Write to level-specific log
            this.appendToLogFile(`${entry.level.toLowerCase()}.log`, logLine);
            
            // Write to daily log
            const date = new Date().toISOString().split('T')[0];
            this.appendToLogFile(`daily-${date}.log`, logLine);
            
        } catch (error) {
            console.error('Failed to write log:', error);
        }
    }

    /**
     * Append to log file with rotation
     */
    appendToLogFile(filename, content) {
        const filepath = path.join(this.config.logDir, filename);
        
        // Check rotation
        if (this.shouldRotate(filepath)) {
            this.rotateLog(filepath);
        }
        
        // Append content
        fs.appendFileSync(filepath, content + '\n');
    }

    /**
     * Check if log should be rotated
     */
    shouldRotate(filepath) {
        if (!fs.existsSync(filepath)) return false;
        
        const stats = fs.statSync(filepath);
        return stats.size > this.config.logRotation.maxSize;
    }

    /**
     * Rotate log file
     */
    rotateLog(filepath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = `${filepath}.${timestamp}`;
        
        // Rename current file
        fs.renameSync(filepath, rotatedPath);
        
        // Clean old rotated files
        this.cleanOldLogs(filepath);
        
        this.info('Log rotated', {
            original: path.basename(filepath),
            rotated: path.basename(rotatedPath)
        });
    }

    /**
     * Clean old log files
     */
    cleanOldLogs(baseFilepath) {
        const dir = path.dirname(baseFilepath);
        const basename = path.basename(baseFilepath);
        const files = fs.readdirSync(dir);
        
        const rotatedFiles = files
            .filter(f => f.startsWith(basename + '.'))
            .map(f => ({
                name: f,
                path: path.join(dir, f),
                stats: fs.statSync(path.join(dir, f))
            }))
            .sort((a, b) => b.stats.mtime - a.stats.mtime);
        
        // Remove old files
        const maxAge = Date.now() - this.config.logRotation.maxAge;
        let kept = 0;
        
        for (const file of rotatedFiles) {
            if (kept >= this.config.logRotation.maxFiles || 
                file.stats.mtime < maxAge) {
                fs.unlinkSync(file.path);
                this.debug('Removed old log', { file: file.name });
            } else {
                kept++;
            }
        }
    }

    /**
     * Format log entry
     */
    formatLogEntry(entry) {
        // JSON format for production
        if (process.env.NODE_ENV === 'production') {
            return JSON.stringify(entry);
        }
        
        // Human-readable format for development
        const { timestamp, level, message, context, caller } = entry;
        let formatted = `[${timestamp}] [${level}] ${message}`;
        
        if (caller) {
            formatted += ` (${caller.file}:${caller.line})`;
        }
        
        if (Object.keys(context).length > 0) {
            formatted += '\n  Context: ' + JSON.stringify(context, null, 2)
                .split('\n')
                .join('\n  ');
        }
        
        return formatted;
    }

    /**
     * Console log for development
     */
    consoleLog(entry) {
        const colors = {
            ERROR: '\x1b[31m', // Red
            WARN: '\x1b[33m',  // Yellow
            INFO: '\x1b[36m',  // Cyan
            DEBUG: '\x1b[35m', // Magenta
            TRACE: '\x1b[30m'  // Gray
        };
        
        const reset = '\x1b[0m';
        const color = colors[entry.level] || reset;
        
        console.log(`${color}[${entry.level}]${reset} ${entry.message}`);
        
        if (Object.keys(entry.context).length > 0) {
            console.log('  ', entry.context);
        }
    }

    /**
     * Get caller information
     */
    getCallerInfo() {
        try {
            const stack = new Error().stack.split('\n');
            // Find first stack frame outside this file
            for (let i = 3; i < stack.length; i++) {
                const line = stack[i];
                if (!line.includes('production-logger.js')) {
                    const match = line.match(/at .+ \((.+):(\d+):(\d+)\)/);
                    if (match) {
                        return {
                            file: path.basename(match[1]),
                            line: match[2],
                            column: match[3]
                        };
                    }
                }
            }
        } catch (error) {
            // Ignore errors
        }
        return null;
    }

    /**
     * Redact sensitive data
     */
    redactSensitiveData(data) {
        const redacted = JSON.parse(JSON.stringify(data));
        
        const redactValue = (obj, key) => {
            if (typeof obj[key] === 'string') {
                for (const pattern of this.config.redactPatterns) {
                    if (pattern.test(key)) {
                        obj[key] = '[REDACTED]';
                        break;
                    }
                }
            }
        };
        
        const traverse = (obj) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    redactValue(obj, key);
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        traverse(obj[key]);
                    }
                }
            }
        };
        
        traverse(redacted);
        return redacted;
    }

    /**
     * Update metrics
     */
    updateMetrics(level) {
        this.metrics.totalLogs++;
        
        if (!this.metrics.byLevel[level]) {
            this.metrics.byLevel[level] = 0;
        }
        this.metrics.byLevel[level]++;
        
        if (level === 'ERROR') this.metrics.errors++;
        if (level === 'WARN') this.metrics.warnings++;
    }

    /**
     * Setup process handlers
     */
    setupProcessHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.error('Uncaught exception', {
                error: error.message,
                stack: error.stack
            });
            this.flushBuffer();
        });
        
        // Handle unhandled rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.error('Unhandled rejection', {
                reason: reason,
                promise: promise
            });
        });
        
        // Handle process exit
        process.on('exit', (code) => {
            this.info('Process exiting', {
                code,
                uptime: process.uptime(),
                sessionDuration: Date.now() - this.sessionStart
            });
            this.flushBuffer();
        });
        
        // Handle signals
        ['SIGINT', 'SIGTERM'].forEach(signal => {
            process.on(signal, () => {
                this.info(`Received ${signal}`, {
                    signal
                });
                this.flushBuffer();
                process.exit(0);
            });
        });
    }

    /**
     * Initialize log files
     */
    initializeLogFiles() {
        const files = ['main.log', 'error.log', 'warn.log', 'info.log', 'debug.log'];
        
        for (const file of files) {
            const filepath = path.join(this.config.logDir, file);
            if (!fs.existsSync(filepath)) {
                fs.writeFileSync(filepath, '');
            }
        }
    }

    /**
     * Set log level
     */
    setLogLevel(level) {
        if (this.config.levels.hasOwnProperty(level)) {
            this.currentLevel = this.config.levels[level];
            this.info('Log level changed', { newLevel: level });
        }
    }

    /**
     * Get metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            sessionId: this.sessionId,
            sessionStart: this.sessionStart,
            uptime: Date.now() - this.sessionStart,
            currentLevel: Object.keys(this.config.levels)
                .find(key => this.config.levels[key] === this.currentLevel)
        };
    }

    /**
     * Search logs
     */
    async searchLogs(criteria) {
        const results = [];
        const { level, startTime, endTime, pattern, limit = 100 } = criteria;
        
        // Read main log file
        const logFile = path.join(this.config.logDir, 'main.log');
        const content = fs.readFileSync(logFile, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
            if (!line) continue;
            
            try {
                const entry = JSON.parse(line);
                
                // Apply filters
                if (level && entry.level !== level) continue;
                if (startTime && new Date(entry.timestamp) < new Date(startTime)) continue;
                if (endTime && new Date(entry.timestamp) > new Date(endTime)) continue;
                if (pattern && !line.includes(pattern)) continue;
                
                results.push(entry);
                
                if (results.length >= limit) break;
                
            } catch (error) {
                // Skip non-JSON lines
            }
        }
        
        return results;
    }

    /**
     * Export logs
     */
    async exportLogs(format = 'json', options = {}) {
        const exportPath = path.join(this.config.logDir, `export-${Date.now()}.${format}`);
        const logs = await this.searchLogs(options);
        
        if (format === 'json') {
            fs.writeFileSync(exportPath, JSON.stringify(logs, null, 2));
        } else if (format === 'csv') {
            const csv = this.convertToCSV(logs);
            fs.writeFileSync(exportPath, csv);
        }
        
        return exportPath;
    }

    /**
     * Convert logs to CSV
     */
    convertToCSV(logs) {
        if (logs.length === 0) return '';
        
        const headers = ['timestamp', 'level', 'message', 'sessionId', 'correlationId'];
        const rows = [headers.join(',')];
        
        for (const log of logs) {
            const row = headers.map(h => {
                const value = log[h] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            rows.push(row.join(','));
        }
        
        return rows.join('\n');
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }

    /**
     * Generate correlation ID
     */
    generateCorrelationId() {
        return crypto.randomBytes(8).toString('hex');
    }

    /**
     * Cleanup and shutdown
     */
    shutdown() {
        this.info('Logger shutting down');
        
        // Flush buffer
        this.flushBuffer();
        
        // Clear interval
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        
        // Remove listeners
        this.removeAllListeners();
    }
}

// Singleton instance
let instance = null;

module.exports = {
    ProductionLogger,
    
    // Singleton getter
    getInstance() {
        if (!instance) {
            instance = new ProductionLogger();
        }
        return instance;
    },
    
    // Convenience methods
    error: (message, context) => module.exports.getInstance().error(message, context),
    warn: (message, context) => module.exports.getInstance().warn(message, context),
    info: (message, context) => module.exports.getInstance().info(message, context),
    debug: (message, context) => module.exports.getInstance().debug(message, context),
    trace: (message, context) => module.exports.getInstance().trace(message, context),
    logPerformance: (operation, duration, metadata) => 
        module.exports.getInstance().logPerformance(operation, duration, metadata),
    logWorkflowEvent: (eventType, workflowId, data) => 
        module.exports.getInstance().logWorkflowEvent(eventType, workflowId, data),
    logAgentActivity: (agentName, activity, data) => 
        module.exports.getInstance().logAgentActivity(agentName, activity, data),
    logDocumentOperation: (operation, documentId, data) => 
        module.exports.getInstance().logDocumentOperation(operation, documentId, data)
};