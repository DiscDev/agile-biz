/**
 * Zen MCP Integration Module
 * Enables multi-model routing through Zen MCP when available
 * Part of Phase 2: Progressive Enhancement
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ZenMCPIntegration {
  constructor() {
    this.isAvailable = false;
    this.isConfigured = false;
    this.endpoint = null;
    this.apiKey = null;
    this.supportedModels = [];
    this.connectionStatus = 'not_checked';
    this.lastCheck = null;
    this.performanceMetrics = {
      avgLatency: 0,
      successRate: 0,
      totalRequests: 0,
      failedRequests: 0
    };
  }

  /**
   * Initialize Zen MCP integration
   */
  async initialize() {
    console.log('🔌 Initializing Zen MCP Integration...\n');
    
    // Check environment configuration
    this.checkConfiguration();
    
    if (!this.isConfigured) {
      console.log('⚪ Zen MCP not configured - using Claude-native mode');
      return {
        available: false,
        reason: 'not_configured'
      };
    }
    
    // Check if Zen MCP is installed
    const installed = await this.checkInstallation();
    
    if (!installed) {
      console.log('⚪ Zen MCP not installed - using fallback mode');
      return {
        available: false,
        reason: 'not_installed',
        installCommand: 'npm install -g zen-mcp'
      };
    }
    
    // Test connection
    const connected = await this.testConnection();
    
    if (!connected) {
      console.log('⚠️  Zen MCP configured but not reachable');
      return {
        available: false,
        reason: 'connection_failed'
      };
    }
    
    // Discover available models
    await this.discoverModels();
    
    this.isAvailable = true;
    console.log('✅ Zen MCP integration ready');
    console.log(`   Endpoint: ${this.endpoint}`);
    console.log(`   Models available: ${this.supportedModels.length}\n`);
    
    return {
      available: true,
      endpoint: this.endpoint,
      models: this.supportedModels
    };
  }

  /**
   * Check environment configuration
   */
  checkConfiguration() {
    const enabled = process.env.ZEN_MCP_ENABLED === 'true';
    const endpoint = process.env.ZEN_MCP_ENDPOINT;
    const apiKey = process.env.ZEN_MCP_API_KEY;
    
    if (!enabled) {
      return;
    }
    
    if (endpoint && endpoint !== 'your_zen_mcp_endpoint_here' &&
        apiKey && apiKey !== 'your_zen_mcp_api_key_here') {
      this.isConfigured = true;
      this.endpoint = endpoint;
      this.apiKey = apiKey;
    }
  }

  /**
   * Check if Zen MCP is installed
   */
  async checkInstallation() {
    try {
      // Check for Zen MCP in node_modules or global
      const { stdout } = await execAsync('which zen-mcp || echo "not found"');
      
      if (stdout.includes('not found')) {
        // Check in local node_modules
        const localPath = path.join(__dirname, '..', 'node_modules', '.bin', 'zen-mcp');
        try {
          await fs.access(localPath);
          return true;
        } catch {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      // For testing/development, simulate installation
      if (process.env.NODE_ENV === 'test' || process.env.ZEN_MCP_SIMULATE) {
        return true;
      }
      return false;
    }
  }

  /**
   * Test connection to Zen MCP
   */
  async testConnection() {
    try {
      // In production, would make actual API call
      // For now, simulate connection test
      
      if (process.env.ZEN_MCP_SIMULATE === 'true') {
        // Simulate successful connection
        this.connectionStatus = 'connected';
        this.lastCheck = new Date().toISOString();
        return true;
      }
      
      // Actual connection test would go here
      // const response = await fetch(`${this.endpoint}/health`);
      // return response.ok;
      
      return false;
    } catch (error) {
      this.connectionStatus = 'failed';
      this.lastCheck = new Date().toISOString();
      return false;
    }
  }

  /**
   * Discover available models through Zen MCP
   */
  async discoverModels() {
    // In production, would query Zen MCP for available models
    // For now, return simulated model list based on configuration
    
    if (process.env.ZEN_MCP_SIMULATE === 'true') {
      this.supportedModels = [
        {
          id: 'claude-3-haiku',
          provider: 'anthropic',
          contextWindow: 100000,
          costPer1kTokens: 0.00025,
          speed: 'fast',
          capabilities: ['text', 'code']
        },
        {
          id: 'claude-3-sonnet',
          provider: 'anthropic',
          contextWindow: 200000,
          costPer1kTokens: 0.003,
          speed: 'medium',
          capabilities: ['text', 'code', 'analysis']
        },
        {
          id: 'gemini-1.5-flash',
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.00035,
          speed: 'fast',
          capabilities: ['text', 'code', 'multimodal']
        },
        {
          id: 'gemini-1.5-pro',
          provider: 'google',
          contextWindow: 2000000,
          costPer1kTokens: 0.00125,
          speed: 'medium',
          capabilities: ['text', 'code', 'multimodal', 'analysis']
        },
        {
          id: 'gpt-3.5-turbo',
          provider: 'openai',
          contextWindow: 16385,
          costPer1kTokens: 0.0005,
          speed: 'fast',
          capabilities: ['text', 'code']
        },
        {
          id: 'gpt-4-turbo',
          provider: 'openai',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          speed: 'slow',
          capabilities: ['text', 'code', 'analysis', 'reasoning']
        }
      ];
    } else {
      // Actual model discovery would go here
      this.supportedModels = [];
    }
    
    return this.supportedModels;
  }

  /**
   * Route request through Zen MCP
   */
  async routeRequest(request) {
    if (!this.isAvailable) {
      throw new Error('Zen MCP not available');
    }
    
    const { model, content, options = {} } = request;
    
    // Find model configuration
    const modelConfig = this.supportedModels.find(m => m.id === model);
    if (!modelConfig) {
      throw new Error(`Model ${model} not available through Zen MCP`);
    }
    
    console.log(`🔄 Routing to ${model} via Zen MCP...`);
    
    try {
      // In production, would make actual API call
      const response = await this.simulateModelCall(model, content, options);
      
      // Track metrics
      this.performanceMetrics.totalRequests++;
      this.performanceMetrics.successRate = 
        ((this.performanceMetrics.totalRequests - this.performanceMetrics.failedRequests) / 
         this.performanceMetrics.totalRequests * 100).toFixed(1);
      
      return response;
    } catch (error) {
      this.performanceMetrics.failedRequests++;
      throw error;
    }
  }

  /**
   * Simulate model call for testing
   */
  async simulateModelCall(model, content, options) {
    return new Promise((resolve, reject) => {
      // Simulate processing time based on model speed
      const delays = {
        fast: 500,
        medium: 1000,
        slow: 2000
      };
      
      const modelConfig = this.supportedModels.find(m => m.id === model);
      const delay = delays[modelConfig?.speed || 'medium'];
      
      setTimeout(() => {
        // Simulate occasional failures for testing
        if (Math.random() > 0.95) {
          reject(new Error(`${model} temporarily unavailable`));
        } else {
          resolve({
            model,
            provider: modelConfig?.provider,
            response: `Response from ${model} via Zen MCP`,
            tokens: Math.floor(Math.random() * 1000) + 500,
            cost: this.calculateCost(model, 1000),
            latency: delay
          });
        }
      }, delay);
    });
  }

  /**
   * Calculate cost for model usage
   */
  calculateCost(model, tokens) {
    const modelConfig = this.supportedModels.find(m => m.id === model);
    if (!modelConfig) return 0;
    
    return (tokens / 1000) * modelConfig.costPer1kTokens;
  }

  /**
   * Get optimal model for task
   */
  getOptimalModel(taskType, requirements = {}) {
    const { maxCost, maxLatency, minContextWindow, capabilities = [] } = requirements;
    
    let candidates = [...this.supportedModels];
    
    // Filter by capabilities
    if (capabilities.length > 0) {
      candidates = candidates.filter(model =>
        capabilities.every(cap => model.capabilities.includes(cap))
      );
    }
    
    // Filter by context window
    if (minContextWindow) {
      candidates = candidates.filter(model =>
        model.contextWindow >= minContextWindow
      );
    }
    
    // Filter by cost
    if (maxCost) {
      candidates = candidates.filter(model =>
        model.costPer1kTokens <= maxCost
      );
    }
    
    // Filter by speed
    if (maxLatency === 'fast') {
      candidates = candidates.filter(model =>
        model.speed === 'fast'
      );
    }
    
    // Sort by cost (cheapest first)
    candidates.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);
    
    return candidates[0] || null;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      connectionStatus: this.connectionStatus,
      lastCheck: this.lastCheck,
      availableModels: this.supportedModels.length
    };
  }

  /**
   * Health check for Zen MCP
   */
  async healthCheck() {
    if (!this.isConfigured) {
      return { healthy: false, reason: 'not_configured' };
    }
    
    const connected = await this.testConnection();
    
    return {
      healthy: connected,
      endpoint: this.endpoint,
      models: this.supportedModels.length,
      metrics: this.getMetrics()
    };
  }
}

// Export for use in other modules
module.exports = ZenMCPIntegration;

// Test if called directly
if (require.main === module) {
  console.log('🧪 Testing Zen MCP Integration\n');
  
  // Set test environment
  process.env.ZEN_MCP_ENABLED = 'true';
  process.env.ZEN_MCP_ENDPOINT = 'http://localhost:8080';
  process.env.ZEN_MCP_API_KEY = 'test-api-key';
  process.env.ZEN_MCP_SIMULATE = 'true';
  
  const zen = new ZenMCPIntegration();
  
  zen.initialize()
    .then(async (result) => {
      console.log('Initialization result:', result);
      
      if (result.available) {
        // Test routing
        const response = await zen.routeRequest({
          model: 'gemini-1.5-flash',
          content: 'Test content',
          options: {}
        });
        
        console.log('\nRouting test result:', response);
        
        // Test optimal model selection
        const optimal = zen.getOptimalModel('research', {
          capabilities: ['text', 'code'],
          maxCost: 0.001
        });
        
        console.log('\nOptimal model for research:', optimal);
        
        // Show metrics
        console.log('\nMetrics:', zen.getMetrics());
      }
    })
    .catch(console.error);
}