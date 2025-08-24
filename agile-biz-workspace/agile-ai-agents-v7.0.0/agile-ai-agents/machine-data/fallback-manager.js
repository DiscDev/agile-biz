/**
 * Intelligent Fallback Manager
 * Manages smooth degradation between service levels and automatic recovery
 * Part of Phase 3: Intelligent Fallback Management
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class FallbackManager extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.fallbackRules = new Map();
    this.healthChecks = new Map();
    this.costLimits = {
      session: 50,
      hourly: 10,
      warning: 0.8
    };
    this.currentCosts = {
      session: 0,
      hourly: 0
    };
    this.recoveryAttempts = new Map();
    this.maxRecoveryAttempts = 3;
    this.healthCheckInterval = 30000; // 30 seconds
    this.isMonitoring = false;
  }

  /**
   * Initialize fallback management
   */
  async initialize() {
    console.log('🛡️ Initializing Intelligent Fallback Manager...\n');
    
    // Load fallback rules
    await this.loadFallbackRules();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    console.log('✅ Fallback Manager ready\n');
    
    return {
      rules: this.fallbackRules.size,
      services: this.services.size,
      monitoring: this.isMonitoring
    };
  }

  /**
   * Load fallback rules configuration
   */
  async loadFallbackRules() {
    // Model-specific fallback chains
    this.fallbackRules.set('gemini-1.5-pro', [
      'gpt-4-turbo',
      'claude-sonnet-4',
      'claude-opus-4'
    ]);
    
    this.fallbackRules.set('gemini-1.5-flash', [
      'gpt-3.5-turbo',
      'claude-3-haiku',
      'claude-3-sonnet'
    ]);
    
    this.fallbackRules.set('gpt-4-turbo', [
      'gemini-1.5-pro',
      'claude-sonnet-4',
      'claude-opus-4'
    ]);
    
    this.fallbackRules.set('gpt-3.5-turbo', [
      'gemini-1.5-flash',
      'claude-3-haiku',
      'claude-3-sonnet'
    ]);
    
    this.fallbackRules.set('perplexity-sonar-pro', [
      'perplexity-sonar',
      'websearch-mcp',
      'claude-with-search'
    ]);
    
    // Service-level fallback rules
    this.fallbackRules.set('zen_mcp', {
      action: 'switch_to_direct_apis',
      notification: 'Zen MCP unavailable, using direct APIs',
      performanceImpact: '50% slower'
    });
    
    this.fallbackRules.set('all_external', {
      action: 'switch_to_claude_native',
      notification: 'All external services down, using Claude-only mode',
      performanceImpact: 'Standard performance'
    });
    
    console.log(`📋 Loaded ${this.fallbackRules.size} fallback rules`);
  }

  /**
   * Register a service for monitoring
   */
  registerService(name, config) {
    this.services.set(name, {
      name,
      status: 'unknown',
      lastCheck: null,
      failures: 0,
      ...config
    });
    
    // Initialize health check
    this.healthChecks.set(name, {
      consecutive_failures: 0,
      total_failures: 0,
      total_checks: 0,
      uptime: 100
    });
    
    console.log(`📝 Registered service: ${name}`);
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);
    
    console.log('🔍 Started health monitoring');
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (!this.isMonitoring) return;
    
    clearInterval(this.healthCheckTimer);
    this.isMonitoring = false;
    
    console.log('🛑 Stopped health monitoring');
  }

  /**
   * Perform health checks on all services
   */
  async performHealthChecks() {
    for (const [name, service] of this.services) {
      await this.checkServiceHealth(name);
    }
  }

  /**
   * Check health of individual service
   */
  async checkServiceHealth(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return;
    
    const health = this.healthChecks.get(serviceName);
    health.total_checks++;
    
    try {
      // Simulate health check (in production, would make actual API call)
      const isHealthy = await this.pingService(service);
      
      if (isHealthy) {
        service.status = 'healthy';
        health.consecutive_failures = 0;
        
        // Attempt recovery if was down
        if (service.status === 'unhealthy') {
          await this.attemptRecovery(serviceName);
        }
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      service.status = 'unhealthy';
      health.consecutive_failures++;
      health.total_failures++;
      
      // Trigger fallback if threshold reached
      if (health.consecutive_failures >= 3) {
        await this.triggerFallback(serviceName, error.message);
      }
    }
    
    // Update uptime percentage
    health.uptime = ((health.total_checks - health.total_failures) / health.total_checks * 100).toFixed(1);
    service.lastCheck = new Date().toISOString();
  }

  /**
   * Ping service to check if it's alive
   */
  async pingService(service) {
    // Simulate ping (in production, would make actual health check)
    if (process.env.SIMULATE_SERVICE_HEALTH === 'true') {
      // Simulate occasional failures for testing
      return Math.random() > 0.1;
    }
    
    // Real implementation would check actual service
    return true;
  }

  /**
   * Trigger fallback for failed service
   */
  async triggerFallback(serviceName, reason) {
    console.log(`\n⚠️ Triggering fallback for ${serviceName}`);
    console.log(`   Reason: ${reason}`);
    
    const fallbackChain = this.fallbackRules.get(serviceName);
    
    if (!fallbackChain) {
      console.log('   No fallback rules defined');
      return null;
    }
    
    // Emit fallback event
    this.emit('fallback', {
      service: serviceName,
      reason,
      fallbackChain,
      timestamp: new Date().toISOString()
    });
    
    // Find first available fallback
    if (Array.isArray(fallbackChain)) {
      for (const fallback of fallbackChain) {
        const fallbackService = this.services.get(fallback);
        if (fallbackService && fallbackService.status === 'healthy') {
          console.log(`   ✅ Falling back to: ${fallback}`);
          return fallback;
        }
      }
    } else if (fallbackChain.action) {
      // Service-level fallback
      console.log(`   Action: ${fallbackChain.action}`);
      console.log(`   Impact: ${fallbackChain.performanceImpact}`);
      
      this.emit('service-fallback', {
        action: fallbackChain.action,
        notification: fallbackChain.notification,
        impact: fallbackChain.performanceImpact
      });
      
      return fallbackChain.action;
    }
    
    // No fallback available
    console.log('   ❌ No healthy fallback available');
    return null;
  }

  /**
   * Attempt to recover failed service
   */
  async attemptRecovery(serviceName) {
    const attempts = this.recoveryAttempts.get(serviceName) || 0;
    
    if (attempts >= this.maxRecoveryAttempts) {
      console.log(`❌ Max recovery attempts reached for ${serviceName}`);
      return false;
    }
    
    console.log(`🔧 Attempting recovery for ${serviceName} (attempt ${attempts + 1})`);
    
    this.recoveryAttempts.set(serviceName, attempts + 1);
    
    try {
      // Attempt to reconnect (simulated)
      const recovered = await this.reconnectService(serviceName);
      
      if (recovered) {
        console.log(`✅ ${serviceName} recovered successfully`);
        this.recoveryAttempts.set(serviceName, 0);
        
        this.emit('recovery', {
          service: serviceName,
          attempts: attempts + 1,
          timestamp: new Date().toISOString()
        });
        
        return true;
      }
    } catch (error) {
      console.log(`   Recovery failed: ${error.message}`);
    }
    
    return false;
  }

  /**
   * Reconnect to service
   */
  async reconnectService(serviceName) {
    // Simulate reconnection attempt
    if (process.env.SIMULATE_SERVICE_HEALTH === 'true') {
      // 50% chance of recovery
      return Math.random() > 0.5;
    }
    
    return true;
  }

  /**
   * Track cost and enforce limits
   */
  trackCost(amount, model) {
    this.currentCosts.session += amount;
    this.currentCosts.hourly += amount;
    
    // Check warning threshold
    const sessionPercent = this.currentCosts.session / this.costLimits.session;
    
    if (sessionPercent >= this.costLimits.warning) {
      this.emit('cost-warning', {
        current: this.currentCosts.session,
        limit: this.costLimits.session,
        percentage: (sessionPercent * 100).toFixed(0)
      });
      
      // Switch to cheaper models if over 90%
      if (sessionPercent >= 0.9) {
        this.enforceCostLimit();
      }
    }
    
    // Check hard limit
    if (this.currentCosts.session >= this.costLimits.session) {
      this.emit('cost-limit-exceeded', {
        current: this.currentCosts.session,
        limit: this.costLimits.session
      });
      
      this.enforceHardLimit();
    }
  }

  /**
   * Enforce cost limit by switching to cheaper models
   */
  enforceCostLimit() {
    console.log('💰 Enforcing cost limit - switching to economy mode');
    
    this.emit('cost-limit-action', {
      action: 'switch_to_economy',
      models: ['claude-3-haiku', 'gemini-1.5-flash'],
      reason: 'Approaching cost limit'
    });
  }

  /**
   * Enforce hard limit by restricting to Claude Haiku only
   */
  enforceHardLimit() {
    console.log('🛑 Hard cost limit reached - Claude Haiku only');
    
    this.emit('cost-limit-action', {
      action: 'haiku_only',
      models: ['claude-3-haiku'],
      reason: 'Cost limit exceeded'
    });
  }

  /**
   * Get fallback chain for a model
   */
  getFallbackChain(model) {
    return this.fallbackRules.get(model) || [];
  }

  /**
   * Get service health status
   */
  getServiceHealth(serviceName) {
    const service = this.services.get(serviceName);
    const health = this.healthChecks.get(serviceName);
    
    if (!service || !health) return null;
    
    return {
      name: serviceName,
      status: service.status,
      uptime: health.uptime,
      failures: health.total_failures,
      lastCheck: service.lastCheck
    };
  }

  /**
   * Get all service health statuses
   */
  getAllServiceHealth() {
    const healthStatus = [];
    
    for (const [name] of this.services) {
      const health = this.getServiceHealth(name);
      if (health) {
        healthStatus.push(health);
      }
    }
    
    return healthStatus;
  }

  /**
   * Get cost status
   */
  getCostStatus() {
    return {
      current: this.currentCosts,
      limits: this.costLimits,
      percentage: {
        session: (this.currentCosts.session / this.costLimits.session * 100).toFixed(0),
        hourly: (this.currentCosts.hourly / this.costLimits.hourly * 100).toFixed(0)
      }
    };
  }

  /**
   * Reset hourly costs
   */
  resetHourlyCosts() {
    this.currentCosts.hourly = 0;
    console.log('💰 Hourly costs reset');
  }

  /**
   * Configure cost limits
   */
  setCostLimits(limits) {
    this.costLimits = { ...this.costLimits, ...limits };
    console.log('💰 Cost limits updated:', this.costLimits);
  }

  /**
   * Get fallback statistics
   */
  getStatistics() {
    const stats = {
      services: this.services.size,
      healthyServices: 0,
      unhealthyServices: 0,
      totalFallbacks: 0,
      totalRecoveries: 0,
      costStatus: this.getCostStatus()
    };
    
    for (const [_, service] of this.services) {
      if (service.status === 'healthy') {
        stats.healthyServices++;
      } else if (service.status === 'unhealthy') {
        stats.unhealthyServices++;
      }
    }
    
    return stats;
  }
}

// Export for use in other modules
module.exports = FallbackManager;

// Test if called directly
if (require.main === module) {
  console.log('🧪 Testing Fallback Manager\n');
  
  // Set test environment
  process.env.SIMULATE_SERVICE_HEALTH = 'true';
  
  const manager = new FallbackManager();
  
  // Register test services
  manager.registerService('zen_mcp', { endpoint: 'http://localhost:8080' });
  manager.registerService('gemini-1.5-pro', { provider: 'google' });
  manager.registerService('gpt-4-turbo', { provider: 'openai' });
  manager.registerService('claude-sonnet-4', { provider: 'anthropic' });
  
  // Set up event listeners
  manager.on('fallback', (event) => {
    console.log('\n📢 Fallback Event:', event);
  });
  
  manager.on('recovery', (event) => {
    console.log('\n📢 Recovery Event:', event);
  });
  
  manager.on('cost-warning', (event) => {
    console.log('\n💰 Cost Warning:', event);
  });
  
  // Initialize and test
  manager.initialize()
    .then(async () => {
      // Test health checks
      await manager.performHealthChecks();
      
      // Test cost tracking
      manager.trackCost(5, 'gpt-4-turbo');
      manager.trackCost(10, 'claude-opus-4');
      manager.trackCost(30, 'gemini-1.5-pro');
      
      // Show statistics
      console.log('\n📊 Statistics:', manager.getStatistics());
      
      // Stop monitoring
      setTimeout(() => {
        manager.stopHealthMonitoring();
        console.log('\n✅ Test complete');
      }, 5000);
    })
    .catch(console.error);
}