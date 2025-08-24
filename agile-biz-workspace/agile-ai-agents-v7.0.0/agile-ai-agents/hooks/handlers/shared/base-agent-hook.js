/**
 * Base class for all agent-specific hooks
 * Provides performance tracking, caching, and configuration management
 */
class BaseAgentHook {
  constructor(config = {}) {
    this.name = config.name || this.constructor.name;
    this.agent = config.agent || 'unknown';
    this.category = config.category || 'enhancement'; // critical, valuable, enhancement, specialized
    this.impact = config.impact || 'medium'; // low, medium, high, async
    this.enabled = config.enabled !== false;
    this.config = config.config || {};
    
    // Performance tracking
    this.performanceHistory = [];
    this.averageExecutionTime = 0;
    this.executionCount = 0;
    this.failures = 0;
    
    // Performance thresholds (ms)
    this.performanceThresholds = {
      low: 50,
      medium: 200,
      high: 500,
      warning: config.warningThreshold || 1000,
      disable: config.disableThreshold || 2000
    };
    
    // Caching
    this.cache = new Map();
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes default
    
    // Auto-disable settings
    this.autoDisableAfterFailures = config.autoDisableAfterFailures || 5;
    this.autoDisableAfterSlowness = config.autoDisableAfterSlowness || 10;
  }

  /**
   * Main entry point for hook execution
   */
  async execute(context) {
    if (!this.enabled) {
      return { skipped: true, reason: 'Hook disabled' };
    }

    const startTime = Date.now();
    let result = null;
    let error = null;

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(context);
      if (this.cacheEnabled && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (cached.timestamp + this.cacheTTL > Date.now()) {
          return { ...cached.result, cached: true };
        }
        this.cache.delete(cacheKey);
      }

      // Execute the hook
      result = await this.handle(context);

      // Cache successful results
      if (this.cacheEnabled && result && !result.error) {
        this.cache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
      }

      // Reset failure count on success
      this.failures = 0;
    } catch (err) {
      error = err;
      this.failures++;
      
      // Auto-disable if too many failures
      if (this.failures >= this.autoDisableAfterFailures) {
        this.enabled = false;
        console.warn(`[${this.name}] Auto-disabled after ${this.failures} failures`);
      }
    }

    // Track performance
    const executionTime = Date.now() - startTime;
    this.trackPerformance(executionTime);

    // Check for performance issues
    if (executionTime > this.performanceThresholds.warning) {
      console.warn(`[${this.name}] Slow execution: ${executionTime}ms`);
      
      // Auto-disable if consistently slow
      const recentSlowExecutions = this.performanceHistory
        .slice(-this.autoDisableAfterSlowness)
        .filter(time => time > this.performanceThresholds.warning)
        .length;
        
      if (recentSlowExecutions >= this.autoDisableAfterSlowness) {
        this.enabled = false;
        console.warn(`[${this.name}] Auto-disabled due to consistent slow performance`);
      }
    }

    return {
      success: !error,
      error: error?.message,
      executionTime,
      result,
      hookName: this.name,
      agent: this.agent,
      category: this.category,
      impact: this.impact
    };
  }

  /**
   * Track performance metrics
   */
  trackPerformance(executionTime) {
    this.performanceHistory.push(executionTime);
    this.executionCount++;
    
    // Keep only last 100 executions
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
    
    // Update average
    this.averageExecutionTime = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      name: this.name,
      agent: this.agent,
      category: this.category,
      impact: this.impact,
      enabled: this.enabled,
      executionCount: this.executionCount,
      averageExecutionTime: Math.round(this.averageExecutionTime),
      failures: this.failures,
      performanceHistory: this.performanceHistory.slice(-10), // Last 10
      cacheHitRate: this.getCacheHitRate()
    };
  }

  /**
   * Generate cache key for context
   */
  getCacheKey(context) {
    // Override in subclasses for custom cache key generation
    return JSON.stringify({
      hook: this.name,
      agent: this.agent,
      contextType: context.type,
      contextId: context.id
    });
  }

  /**
   * Calculate cache hit rate
   */
  getCacheHitRate() {
    // This would need more sophisticated tracking in production
    return this.cache.size > 0 ? 'Active' : 'Empty';
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.performanceHistory = [];
    this.averageExecutionTime = 0;
    this.executionCount = 0;
    this.failures = 0;
  }

  /**
   * Enable the hook
   */
  enable() {
    this.enabled = true;
    this.failures = 0; // Reset failures on re-enable
  }

  /**
   * Disable the hook
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Main hook logic - must be implemented by subclasses
   */
  async handle(context) {
    throw new Error(`${this.name} must implement handle() method`);
  }

  /**
   * Get hook info for UI display
   */
  getInfo() {
    return {
      name: this.name,
      agent: this.agent,
      category: this.category,
      impact: this.impact,
      description: this.getDescription(),
      configurable: this.getConfigurableOptions(),
      enabled: this.enabled,
      metrics: this.getMetrics()
    };
  }

  /**
   * Get hook description - override in subclasses
   */
  getDescription() {
    return 'Base agent hook';
  }

  /**
   * Get configurable options - override in subclasses
   */
  getConfigurableOptions() {
    return {};
  }
}

module.exports = BaseAgentHook;