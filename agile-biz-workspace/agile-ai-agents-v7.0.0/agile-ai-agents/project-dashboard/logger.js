const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs-extra');

/**
 * AgileAiAgents Logging System
 * Provides structured logging with rotation, multiple transports, and log levels
 */

class LoggerSystem {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(__dirname, '..', 'logs');
    this.appName = options.appName || 'AgileAiAgents';
    this.environment = process.env.NODE_ENV || 'development';
    
    // Ensure log directory exists
    this.ensureLogDirectory();
    
    // Create logger instance
    this.logger = this.createLogger();
    
    // Track performance metrics
    this.performanceMetrics = new Map();
  }

  ensureLogDirectory() {
    try {
      fs.ensureDirSync(this.logDir);
      fs.ensureDirSync(path.join(this.logDir, 'app'));
      fs.ensureDirSync(path.join(this.logDir, 'error'));
      fs.ensureDirSync(path.join(this.logDir, 'access'));
      fs.ensureDirSync(path.join(this.logDir, 'agent'));
      fs.ensureDirSync(path.join(this.logDir, 'security'));
    } catch (error) {
      console.error('Failed to create log directories:', error);
    }
  }

  createLogger() {
    // Custom log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        // Add metadata if present
        if (Object.keys(metadata).length > 0) {
          // Handle error objects specially
          if (metadata.error && metadata.error.stack) {
            metadata.error = {
              message: metadata.error.message,
              code: metadata.error.code,
              stack: metadata.error.stack
            };
          }
          msg += ` ${JSON.stringify(metadata)}`;
        }
        
        return msg;
      })
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} ${level}: ${message}`;
        
        // Add important metadata to console
        if (metadata.code) msg += ` [${metadata.code}]`;
        if (metadata.duration) msg += ` (${metadata.duration}ms)`;
        if (metadata.userId) msg += ` user:${metadata.userId}`;
        
        return msg;
      })
    );

    // Define log levels
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6
    };

    // Create transports
    const transports = [];

    // Console transport (development only)
    if (this.environment === 'development') {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          level: 'debug'
        })
      );
    }

    // Application logs (all levels)
    transports.push(
      new DailyRotateFile({
        filename: path.join(this.logDir, 'app', 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: logFormat,
        level: 'info'
      })
    );

    // Error logs (errors only)
    transports.push(
      new DailyRotateFile({
        filename: path.join(this.logDir, 'error', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: logFormat,
        level: 'error'
      })
    );

    // Create logger
    return winston.createLogger({
      levels,
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  // Create specialized loggers
  createAccessLogger() {
    return winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'access', 'access-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '50m',
          maxFiles: '14d'
        })
      ]
    });
  }

  createAgentLogger() {
    return winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'agent', 'agent-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d'
        })
      ]
    });
  }

  createSecurityLogger() {
    return winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'security', 'security-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '90d' // Keep security logs longer
        })
      ]
    });
  }

  // Logging methods
  error(message, metadata = {}) {
    this.logger.error(message, metadata);
  }

  warn(message, metadata = {}) {
    this.logger.warn(message, metadata);
  }

  info(message, metadata = {}) {
    this.logger.info(message, metadata);
  }

  http(message, metadata = {}) {
    this.logger.http(message, metadata);
  }

  debug(message, metadata = {}) {
    this.logger.debug(message, metadata);
  }

  // Specialized logging methods
  logError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      code: error.code,
      stack: error.stack,
      ...context
    };

    this.error(`Error: ${error.message}`, { error: errorInfo });
  }

  logRequest(req, res, duration) {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      referer: req.get('referer'),
      contentLength: res.get('content-length')
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      this.error('Server error response', logData);
    } else if (res.statusCode >= 400) {
      this.warn('Client error response', logData);
    } else {
      this.http('Request completed', logData);
    }
  }

  logAgentActivity(agentName, action, details = {}) {
    const agentLogger = this.agentLogger || this.createAgentLogger();
    agentLogger.info(`Agent activity: ${agentName} - ${action}`, {
      agent: agentName,
      action: action,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  logSecurityEvent(event, severity = 'warn', details = {}) {
    const securityLogger = this.securityLogger || this.createSecurityLogger();
    securityLogger.log(severity, `Security event: ${event}`, {
      event: event,
      severity: severity,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Performance tracking
  startTimer(label) {
    this.performanceMetrics.set(label, Date.now());
  }

  endTimer(label, metadata = {}) {
    const startTime = this.performanceMetrics.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.performanceMetrics.delete(label);
      
      this.info(`Performance: ${label}`, {
        duration: duration,
        ...metadata
      });
      
      return duration;
    }
    return null;
  }

  // Express middleware
  expressMiddleware() {
    const accessLogger = this.createAccessLogger();
    
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log request start
      this.debug(`Incoming ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip
      });

      // Capture response finish
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        // Log to access log
        accessLogger.info('Request', {
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          duration: duration,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          referer: req.get('referer'),
          contentLength: res.get('content-length'),
          timestamp: new Date().toISOString()
        });
        
        // Also log to main logger
        this.logRequest(req, res, duration);
      });

      next();
    };
  }

  // Log cleanup utility
  async cleanupOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    try {
      const logDirs = ['app', 'error', 'access', 'agent', 'security'];
      
      for (const dir of logDirs) {
        const dirPath = path.join(this.logDir, dir);
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate && file.endsWith('.log')) {
            await fs.unlink(filePath);
            this.info(`Cleaned up old log file: ${file}`);
          }
        }
      }
    } catch (error) {
      this.error('Failed to cleanup old logs', { error: error.message });
    }
  }

  // Get log statistics
  async getLogStats() {
    const stats = {
      totalSize: 0,
      fileCount: 0,
      byType: {},
      oldestLog: null,
      newestLog: null
    };

    try {
      const logDirs = ['app', 'error', 'access', 'agent', 'security'];
      
      for (const dir of logDirs) {
        const dirPath = path.join(this.logDir, dir);
        const files = await fs.readdir(dirPath);
        
        stats.byType[dir] = {
          count: 0,
          size: 0
        };
        
        for (const file of files) {
          if (file.endsWith('.log') || file.endsWith('.gz')) {
            const filePath = path.join(dirPath, file);
            const fileStat = await fs.stat(filePath);
            
            stats.totalSize += fileStat.size;
            stats.fileCount++;
            stats.byType[dir].count++;
            stats.byType[dir].size += fileStat.size;
            
            // Track oldest and newest
            if (!stats.oldestLog || fileStat.mtime < stats.oldestLog) {
              stats.oldestLog = fileStat.mtime;
            }
            if (!stats.newestLog || fileStat.mtime > stats.newestLog) {
              stats.newestLog = fileStat.mtime;
            }
          }
        }
      }
      
      // Convert sizes to human readable
      stats.totalSizeReadable = this.formatBytes(stats.totalSize);
      Object.keys(stats.byType).forEach(type => {
        stats.byType[type].sizeReadable = this.formatBytes(stats.byType[type].size);
      });
      
    } catch (error) {
      this.error('Failed to get log statistics', { error: error.message });
    }

    return stats;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Singleton instance
let loggerInstance;

function initializeLogger(options = {}) {
  if (!loggerInstance) {
    loggerInstance = new LoggerSystem(options);
  }
  return loggerInstance;
}

// Export convenience methods
module.exports = {
  LoggerSystem,
  initializeLogger,
  
  // Direct logging methods
  error: (message, metadata) => {
    if (loggerInstance) loggerInstance.error(message, metadata);
  },
  warn: (message, metadata) => {
    if (loggerInstance) loggerInstance.warn(message, metadata);
  },
  info: (message, metadata) => {
    if (loggerInstance) loggerInstance.info(message, metadata);
  },
  debug: (message, metadata) => {
    if (loggerInstance) loggerInstance.debug(message, metadata);
  },
  logError: (error, context) => {
    if (loggerInstance) loggerInstance.logError(error, context);
  },
  logAgentActivity: (agent, action, details) => {
    if (loggerInstance) loggerInstance.logAgentActivity(agent, action, details);
  },
  logSecurityEvent: (event, severity, details) => {
    if (loggerInstance) loggerInstance.logSecurityEvent(event, severity, details);
  }
};