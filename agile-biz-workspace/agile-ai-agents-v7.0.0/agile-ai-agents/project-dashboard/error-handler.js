const { AgileError, ErrorCodes, ErrorSeverity, formatError } = require('./error-codes');
const fs = require('fs-extra');
const path = require('path');

/**
 * Global error handler for AgileAiAgents Dashboard
 * Provides consistent error handling, logging, and user-friendly responses
 */

class ErrorHandler {
  constructor(options = {}) {
    this.logPath = options.logPath || path.join(__dirname, '..', 'logs');
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.errorLog = [];
    this.maxLogSize = 1000; // Keep last 1000 errors in memory
    
    // Ensure log directory exists
    this.initializeLogging();
  }

  async initializeLogging() {
    try {
      await fs.ensureDir(this.logPath);
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Express error middleware
   */
  expressErrorHandler() {
    return (err, req, res, next) => {
      // Log the error
      this.logError(err, { 
        url: req.url, 
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // Determine error type and response
      let statusCode = 500;
      let errorResponse = {
        error: true,
        timestamp: new Date().toISOString()
      };

      if (err instanceof AgileError) {
        // Handle our custom errors
        switch (err.severity) {
          case ErrorSeverity.CRITICAL:
            statusCode = 500;
            break;
          case ErrorSeverity.ERROR:
            statusCode = err.code.startsWith('AUTH') ? 401 :
                         err.code.startsWith('VAL') ? 400 :
                         err.code.startsWith('NET') && err.code === 'NET_001' ? 409 :
                         err.code === 'NET_004' ? 429 : 500;
            break;
          case ErrorSeverity.WARNING:
            statusCode = 200; // Warnings don't fail the request
            break;
        }

        errorResponse = {
          ...errorResponse,
          code: err.code,
          message: err.message,
          description: err.description,
          solution: err.solution,
          severity: err.severity
        };

        // Add stack trace in development
        if (this.isDevelopment) {
          errorResponse.stack = err.stack;
          errorResponse.additionalInfo = err.additionalInfo;
        }
      } else {
        // Handle standard errors
        if (err.name === 'ValidationError') {
          statusCode = 400;
          errorResponse.code = 'VAL_001';
          errorResponse.message = 'Validation error';
          errorResponse.details = err.message;
        } else if (err.name === 'UnauthorizedError') {
          statusCode = 401;
          errorResponse.code = 'AUTH_001';
          errorResponse.message = 'Unauthorized';
        } else if (err.code === 'ENOENT') {
          statusCode = 404;
          errorResponse.code = 'FS_001';
          errorResponse.message = 'File or directory not found';
        } else if (err.code === 'EACCES') {
          statusCode = 403;
          errorResponse.code = 'FS_002';
          errorResponse.message = 'Permission denied';
        } else if (err.code === 'EADDRINUSE') {
          statusCode = 500;
          errorResponse.code = 'NET_001';
          errorResponse.message = 'Port already in use';
        } else {
          // Generic error
          errorResponse.message = this.isDevelopment ? err.message : 'Internal server error';
          if (this.isDevelopment) {
            errorResponse.stack = err.stack;
          }
        }
      }

      // Send response
      res.status(statusCode).json(errorResponse);
    };
  }

  /**
   * Handle uncaught exceptions
   */
  handleUncaughtException() {
    process.on('uncaughtException', (error) => {
      console.error('UNCAUGHT EXCEPTION:', error);
      this.logError(error, { type: 'uncaughtException', fatal: true });
      
      // Give time to flush logs before exit
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection() {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
      this.logError(new Error(reason), { type: 'unhandledRejection' });
    });
  }

  /**
   * Log error to file and memory
   */
  async logError(error, context = {}) {
    const errorEntry = {
      ...formatError(error),
      context,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    // Add to memory log
    this.errorLog.push(errorEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift(); // Remove oldest
    }

    // Write to file
    try {
      const logFile = path.join(
        this.logPath, 
        `errors-${new Date().toISOString().split('T')[0]}.log`
      );
      await fs.appendFile(
        logFile,
        JSON.stringify(errorEntry) + '\n'
      );
    } catch (writeError) {
      console.error('Failed to write to error log:', writeError);
    }

    // Emit error event for real-time monitoring
    if (global.io) {
      global.io.emit('error-occurred', {
        code: error.code || 'UNKNOWN',
        message: error.message,
        severity: error.severity || 'error',
        timestamp: errorEntry.timestamp
      });
    }
  }

  /**
   * Get recent errors from memory
   */
  getRecentErrors(count = 10) {
    return this.errorLog.slice(-count);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      bySeverity: {},
      byCode: {},
      last24Hours: 0
    };

    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    this.errorLog.forEach(error => {
      // Count by severity
      const severity = error.severity || 'unknown';
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

      // Count by code
      const code = error.code || 'UNKNOWN';
      stats.byCode[code] = (stats.byCode[code] || 0) + 1;

      // Count last 24 hours
      if (new Date(error.timestamp).getTime() > oneDayAgo) {
        stats.last24Hours++;
      }
    });

    return stats;
  }

  /**
   * Clear error logs
   */
  clearLogs() {
    this.errorLog = [];
  }

  /**
   * Create user-friendly error messages
   */
  static createUserMessage(errorCode, details = {}) {
    const error = ErrorCodes[errorCode];
    if (!error) {
      return 'An unexpected error occurred. Please try again.';
    }

    let message = error.message;
    
    // Add specific details if provided
    if (details.path) {
      message += ` (${details.path})`;
    }
    if (details.port) {
      message += ` (port ${details.port})`;
    }
    if (details.missing) {
      message += ` (missing: ${details.missing})`;
    }

    return message;
  }

  /**
   * Wrap async route handlers to catch errors
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create error from common scenarios
   */
  static createError(scenario, details = {}) {
    switch (scenario) {
      case 'portInUse':
        return new AgileError('NET_001', { port: details.port });
      case 'missingEnv':
        return new AgileError('CFG_001');
      case 'authRequired':
        return new AgileError('AUTH_001');
      case 'invalidCredentials':
        return new AgileError('AUTH_002');
      case 'missingDependencies':
        return new AgileError('DASH_003');
      case 'diskFull':
        return new AgileError('FS_003');
      case 'rateLimitExceeded':
        return new AgileError('NET_004');
      default:
        return new Error('Unknown error scenario');
    }
  }
}

// Singleton instance
let errorHandler;

// Initialize error handler
function initializeErrorHandler(options = {}) {
  if (!errorHandler) {
    errorHandler = new ErrorHandler(options);
    
    // Set up global error handlers
    errorHandler.handleUncaughtException();
    errorHandler.handleUnhandledRejection();
  }
  
  return errorHandler;
}

// Export utilities
module.exports = {
  ErrorHandler,
  initializeErrorHandler,
  
  // Convenience methods
  logError: (error, context) => {
    if (errorHandler) {
      errorHandler.logError(error, context);
    }
  },
  
  getErrorStats: () => {
    return errorHandler ? errorHandler.getErrorStats() : null;
  },
  
  createError: ErrorHandler.createError,
  asyncHandler: ErrorHandler.asyncHandler,
  createUserMessage: ErrorHandler.createUserMessage
};