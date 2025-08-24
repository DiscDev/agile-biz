/**
 * Error Handler for AgileAiAgents JSON Context Optimization
 * Provides robust error handling, recovery mechanisms, and fallback strategies
 */

const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.retryAttempts = new Map();
    this.fallbackStrategies = new Map();
    this.maxRetries = 3;
    this.basePath = path.join(__dirname);
    
    // Performance monitor integration
    this.performanceMonitor = null;
    try {
      const { monitor } = require('./performance-monitor');
      this.performanceMonitor = monitor;
    } catch (error) {
      console.log('Performance monitor not available for error tracking');
    }
    
    this.initializeFallbackStrategies();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Initialize fallback strategies for different error types
   */
  initializeFallbackStrategies() {
    this.fallbackStrategies.set('json_parse_error', 'fallback_to_markdown');
    this.fallbackStrategies.set('file_not_found', 'search_alternative_locations');
    this.fallbackStrategies.set('permission_denied', 'retry_with_different_path');
    this.fallbackStrategies.set('json_generation_failed', 'use_cached_version');
    this.fallbackStrategies.set('network_timeout', 'use_local_fallback');
    this.fallbackStrategies.set('schema_validation_error', 'repair_json_structure');
    this.fallbackStrategies.set('context_limit_exceeded', 'optimize_context_further');
    this.fallbackStrategies.set('agent_overload', 'queue_for_later_processing');
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleCriticalError('uncaught_exception', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleCriticalError('unhandled_rejection', {
        reason: reason,
        promise: promise
      });
    });
  }

  /**
   * Handle JSON parsing errors with fallback to markdown
   */
  handleJSONError(filePath, error, options = {}) {
    const errorType = 'json_parse_error';
    const errorId = this.generateErrorId();
    
    console.warn(`⚠️ JSON Error [${errorId}]: ${error.message} in ${filePath}`);
    
    this.logError(errorId, errorType, error, { filePath, options });
    
    // Try fallback to markdown
    try {
      const markdownPath = this.convertToMarkdownPath(filePath);
      
      if (fs.existsSync(markdownPath)) {
        console.log(`📄 Fallback: Using markdown file ${markdownPath}`);
        
        if (this.performanceMonitor) {
          this.performanceMonitor.recordError('json_fallback_success', 'Successful markdown fallback', { 
            original_file: filePath,
            fallback_file: markdownPath 
          });
        }
        
        return this.readMarkdownFile(markdownPath);
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback failed: ${fallbackError.message}`);
      this.logError(this.generateErrorId(), 'fallback_failed', fallbackError, { 
        originalError: error,
        filePath 
      });
    }
    
    // Ultimate fallback
    return this.createEmptyFallbackObject(filePath);
  }

  /**
   * Handle file not found errors with search strategies
   */
  handleFileNotFound(filePath, options = {}) {
    const errorType = 'file_not_found';
    const errorId = this.generateErrorId();
    
    console.warn(`⚠️ File Not Found [${errorId}]: ${filePath}`);
    
    this.logError(errorId, errorType, new Error('File not found'), { filePath, options });
    
    // Search alternative locations
    const alternativeFiles = this.searchAlternativeLocations(filePath);
    
    for (const altFile of alternativeFiles) {
      try {
        if (fs.existsSync(altFile)) {
          console.log(`🔍 Found alternative: ${altFile}`);
          
          if (this.performanceMonitor) {
            this.performanceMonitor.recordError('file_found_alternative', 'Found file in alternative location', {
              original_path: filePath,
              found_path: altFile
            });
          }
          
          return this.readFileWithErrorHandling(altFile);
        }
      } catch (error) {
        console.warn(`Failed to read alternative file ${altFile}: ${error.message}`);
      }
    }
    
    // Try to generate the missing file
    return this.attemptFileGeneration(filePath, options);
  }

  /**
   * Handle JSON generation failures with retry logic
   */
  handleGenerationFailure(agentName, error, options = {}) {
    const errorType = 'json_generation_failed';
    const errorId = this.generateErrorId();
    const retryKey = `generate_${agentName}`;
    
    console.warn(`⚠️ Generation Failed [${errorId}]: ${agentName} - ${error.message}`);
    
    this.logError(errorId, errorType, error, { agentName, options });
    
    // Check retry count
    const currentRetries = this.retryAttempts.get(retryKey) || 0;
    
    if (currentRetries < this.maxRetries) {
      console.log(`🔄 Retrying generation for ${agentName} (attempt ${currentRetries + 1}/${this.maxRetries})`);
      
      this.retryAttempts.set(retryKey, currentRetries + 1);
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, currentRetries) * 1000;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.retryJSONGeneration(agentName, options));
        }, delay);
      });
    } else {
      console.error(`❌ Max retries exceeded for ${agentName}`);
      
      if (this.performanceMonitor) {
        this.performanceMonitor.recordError('max_retries_exceeded', `Failed to generate ${agentName} after ${this.maxRetries} attempts`, {
          agent: agentName,
          retries: currentRetries
        });
      }
      
      // Reset retry count and use cached version if available
      this.retryAttempts.delete(retryKey);
      return this.useCachedVersion(agentName) || this.createEmptyFallbackObject(`${agentName}.json`);
    }
  }

  /**
   * Handle context limit exceeded errors
   */
  handleContextLimitExceeded(agentName, contextSize, limit, options = {}) {
    const errorType = 'context_limit_exceeded';
    const errorId = this.generateErrorId();
    
    console.warn(`⚠️ Context Limit Exceeded [${errorId}]: ${agentName} (${contextSize} > ${limit})`);
    
    this.logError(errorId, errorType, new Error('Context limit exceeded'), { 
      agentName, 
      contextSize, 
      limit, 
      options 
    });
    
    // Apply aggressive context optimization
    console.log(`⚡ Applying aggressive context optimization for ${agentName}`);
    
    try {
      const { query } = require('./json-query-utility');
      
      // Get only critical data with very tight limits
      const optimizedContext = query.getOptimizedContext(agentName, options.sourceAgents || [], {
        contextLimit: Math.floor(limit * 0.7), // Use 70% of limit
        priorityMode: 'critical_only'
      });
      
      if (this.performanceMonitor) {
        this.performanceMonitor.recordContextOptimization(
          `context_recovery_${agentName}`,
          ((contextSize - optimizedContext.metadata.optimization_stats.total_size) / contextSize) * 100,
          contextSize - optimizedContext.metadata.optimization_stats.total_size,
          agentName
        );
      }
      
      return optimizedContext;
    } catch (optimizationError) {
      console.error(`❌ Context optimization failed: ${optimizationError.message}`);
      return this.createMinimalContext(agentName);
    }
  }

  /**
   * Handle schema validation errors
   */
  handleSchemaValidationError(filePath, error, data, options = {}) {
    const errorType = 'schema_validation_error';
    const errorId = this.generateErrorId();
    
    console.warn(`⚠️ Schema Validation Error [${errorId}]: ${filePath} - ${error.message}`);
    
    this.logError(errorId, errorType, error, { filePath, data, options });
    
    // Attempt to repair JSON structure
    try {
      const repairedData = this.repairJSONStructure(data, filePath);
      
      if (repairedData) {
        console.log(`🔧 Repaired JSON structure for ${filePath}`);
        
        if (this.performanceMonitor) {
          this.performanceMonitor.recordError('schema_repair_success', 'Successfully repaired JSON schema', {
            file: filePath
          });
        }
        
        return repairedData;
      }
    } catch (repairError) {
      console.error(`❌ JSON repair failed: ${repairError.message}`);
    }
    
    // Fallback to minimal valid structure
    return this.createValidFallbackStructure(filePath);
  }

  /**
   * Handle critical errors that require immediate attention
   */
  handleCriticalError(errorType, error) {
    const errorId = this.generateErrorId();
    
    console.error(`🚨 CRITICAL ERROR [${errorId}]: ${errorType}`);
    console.error(error);
    
    this.logError(errorId, errorType, error, { critical: true });
    
    if (this.performanceMonitor) {
      this.performanceMonitor.recordError('critical_system_error', `Critical error: ${errorType}`, {
        error_id: errorId,
        stack: error.stack
      });
    }
    
    // Save error log immediately for critical errors
    this.saveErrorLog();
    
    // Attempt graceful degradation
    this.initializeGracefulDegradation();
  }

  /**
   * Convert JSON path to markdown path
   */
  convertToMarkdownPath(jsonPath) {
    if (jsonPath.includes('ai-agents-json/')) {
      return jsonPath.replace('ai-agents-json/', '../ai-agents/').replace('.json', '.md');
    } else if (jsonPath.includes('project-documents-json/')) {
      return jsonPath.replace('project-documents-json/', '../project-documents/').replace('.json', '.md');
    } else if (jsonPath.includes('aaa-documents-json/')) {
      return jsonPath.replace('aaa-documents-json/', '../aaa-documents/').replace('.json', '.md');
    }
    
    // Default agent path
    const fileName = path.basename(jsonPath, '.json');
    return path.join(this.basePath, '..', 'ai-agents', `${fileName}.md`);
  }

  /**
   * Search alternative locations for a file
   */
  searchAlternativeLocations(filePath) {
    const alternatives = [];
    const fileName = path.basename(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    
    // Different folder combinations
    const folders = ['ai-agents-json', 'project-documents-json', 'aaa-documents-json'];
    
    for (const folder of folders) {
      alternatives.push(path.join(this.basePath, folder, fileName));
      alternatives.push(path.join(this.basePath, folder, `${baseName}.json`));
      alternatives.push(path.join(this.basePath, folder, `${baseName}.md`));
    }
    
    // Legacy locations
    alternatives.push(path.join(this.basePath, '..', 'ai-agents', `${baseName}.md`));
    alternatives.push(path.join(this.basePath, '..', 'project-documents', fileName.replace('.json', '.md')));
    
    return alternatives;
  }

  /**
   * Read markdown file safely
   */
  readMarkdownFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      return {
        meta: {
          source: 'markdown_fallback',
          file_path: filePath,
          timestamp: new Date().toISOString(),
          fallback_reason: 'json_error'
        },
        content: content,
        summary: this.extractMarkdownSummary(content),
        capabilities: this.extractMarkdownCapabilities(content),
        tools: this.extractMarkdownTools(content)
      };
    } catch (error) {
      throw new Error(`Failed to read markdown file: ${error.message}`);
    }
  }

  /**
   * Extract summary from markdown
   */
  extractMarkdownSummary(content) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('## overview') || 
          lines[i].toLowerCase().includes('## summary')) {
        const summaryLines = [];
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const line = lines[j].trim();
          if (line && !line.startsWith('#')) {
            summaryLines.push(line);
          } else if (line.startsWith('#')) {
            break;
          }
        }
        return summaryLines.join(' ').substring(0, 200);
      }
    }
    return 'Summary not available from markdown fallback';
  }

  /**
   * Extract capabilities from markdown
   */
  extractMarkdownCapabilities(content) {
    const capabilities = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('## capabilities') || 
          line.toLowerCase().includes('## core functions')) {
        for (let j = i + 1; j < lines.length && !lines[j].startsWith('##'); j++) {
          const capLine = lines[j].trim();
          if (capLine.startsWith('- ') || capLine.startsWith('* ')) {
            capabilities.push(capLine.substring(2));
          }
        }
        break;
      }
    }
    
    return capabilities.length > 0 ? capabilities : ['Basic agent functionality'];
  }

  /**
   * Extract tools from markdown
   */
  extractMarkdownTools(content) {
    const tools = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('## tools') || 
          line.toLowerCase().includes('## available tools')) {
        for (let j = i + 1; j < lines.length && !lines[j].startsWith('##'); j++) {
          const toolLine = lines[j].trim();
          if (toolLine.startsWith('- ') || toolLine.startsWith('* ')) {
            tools.push(toolLine.substring(2));
          }
        }
        break;
      }
    }
    
    return tools;
  }

  /**
   * Create empty fallback object
   */
  createEmptyFallbackObject(filePath) {
    const agentName = path.basename(filePath, '.json');
    
    return {
      meta: {
        agent: agentName,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        source: "error_fallback",
        fallback_reason: "file_error"
      },
      summary: `Fallback data for ${agentName} due to file error`,
      capabilities: ["Basic functionality"],
      tools: [],
      context_priorities: {},
      workflows: {},
      error_info: {
        message: "Original file could not be loaded",
        fallback_created: new Date().toISOString()
      }
    };
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error with full context
   */
  logError(errorId, errorType, error, context = {}) {
    const errorEntry = {
      id: errorId,
      type: errorType,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: context
    };
    
    this.errorLog.push(errorEntry);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
    
    // Record in performance monitor if available
    if (this.performanceMonitor) {
      this.performanceMonitor.recordError(errorType, error.message, context);
    }
  }

  /**
   * Save error log to file
   */
  saveErrorLog() {
    try {
      const logPath = path.join(this.basePath, 'project-documents-json', '00-orchestration', 'error-log.json');
      
      const logData = {
        meta: {
          timestamp: new Date().toISOString(),
          total_errors: this.errorLog.length,
          log_version: "1.0.0"
        },
        errors: this.errorLog,
        summary: {
          error_types: this.getErrorTypeSummary(),
          recent_critical_errors: this.getRecentCriticalErrors(),
          recovery_success_rate: this.calculateRecoverySuccessRate()
        }
      };
      
      // Ensure directory exists
      const logDir = path.dirname(logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
      console.log(`📝 Error log saved to ${logPath}`);
    } catch (saveError) {
      console.error('Failed to save error log:', saveError.message);
    }
  }

  /**
   * Get error type summary
   */
  getErrorTypeSummary() {
    const summary = {};
    
    for (const error of this.errorLog) {
      summary[error.type] = (summary[error.type] || 0) + 1;
    }
    
    return summary;
  }

  /**
   * Get recent critical errors
   */
  getRecentCriticalErrors() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return this.errorLog.filter(error => 
      error.context.critical && 
      new Date(error.timestamp).getTime() > oneDayAgo
    );
  }

  /**
   * Calculate recovery success rate
   */
  calculateRecoverySuccessRate() {
    const recoveryAttempts = this.errorLog.filter(error => 
      error.type.includes('fallback') || 
      error.type.includes('retry') || 
      error.type.includes('recovery')
    );
    
    const successfulRecoveries = this.errorLog.filter(error => 
      error.type.includes('success') || 
      error.type.includes('found_alternative')
    );
    
    if (recoveryAttempts.length === 0) return 100;
    
    return (successfulRecoveries.length / recoveryAttempts.length * 100).toFixed(1);
  }

  /**
   * Initialize graceful degradation mode
   */
  initializeGracefulDegradation() {
    console.log('🛡️ Initializing graceful degradation mode');
    
    // Disable non-essential features
    // Switch to basic fallback mode
    // Reduce performance thresholds
    
    if (this.performanceMonitor) {
      this.performanceMonitor.recordError('graceful_degradation_activated', 'System entered graceful degradation mode', {
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get error statistics
   */
  getErrorStatistics() {
    return {
      total_errors: this.errorLog.length,
      error_types: this.getErrorTypeSummary(),
      recent_errors: this.errorLog.slice(-10),
      retry_attempts: Object.fromEntries(this.retryAttempts),
      recovery_rate: this.calculateRecoverySuccessRate()
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.retryAttempts.clear();
    console.log('🧹 Error log cleared');
  }
}

// Export the class and create a default instance
const errorHandler = new ErrorHandler();

module.exports = {
  ErrorHandler,
  handler: errorHandler
};