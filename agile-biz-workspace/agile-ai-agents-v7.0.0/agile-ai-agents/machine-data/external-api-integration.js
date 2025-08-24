/**
 * External API Integration Module
 * Manages direct connections to non-Claude AI services
 * Part of Phase 2: Progressive Enhancement
 */

const fs = require('fs').promises;
const path = require('path');

class ExternalAPIIntegration {
  constructor() {
    this.providers = {
      gemini: {
        name: 'Google Gemini',
        enabled: false,
        apiKey: null,
        endpoint: 'https://generativelanguage.googleapis.com/v1',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        status: 'not_configured'
      },
      openai: {
        name: 'OpenAI',
        enabled: false,
        apiKey: null,
        endpoint: 'https://api.openai.com/v1',
        models: ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'],
        status: 'not_configured'
      },
      perplexity: {
        name: 'Perplexity',
        enabled: false,
        apiKey: null,
        endpoint: 'https://api.perplexity.ai',
        models: ['sonar', 'sonar-pro'],
        status: 'not_configured'
      },
      tavily: {
        name: 'Tavily',
        enabled: false,
        apiKey: null,
        endpoint: 'https://api.tavily.com/v1',
        models: ['search'],
        status: 'not_configured'
      },
      exa: {
        name: 'Exa',
        enabled: false,
        apiKey: null,
        endpoint: 'https://api.exa.ai/v1',
        models: ['neural-search'],
        status: 'not_configured'
      }
    };
    
    this.metrics = {
      totalRequests: {},
      successfulRequests: {},
      failedRequests: {},
      totalCost: {},
      avgLatency: {}
    };
  }

  /**
   * Initialize all external API integrations
   */
  async initialize() {
    console.log('🌐 Initializing External API Integrations...\n');
    
    // Check each provider
    for (const [key, provider] of Object.entries(this.providers)) {
      await this.checkProvider(key);
    }
    
    // Generate summary
    const summary = this.generateSummary();
    
    return summary;
  }

  /**
   * Check individual provider configuration
   */
  async checkProvider(providerKey) {
    const provider = this.providers[providerKey];
    const envKey = `${providerKey.toUpperCase()}_API_KEY`;
    const apiKey = process.env[envKey] || process.env[`${providerKey.toUpperCase()}_AI_API_KEY`];
    
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
      provider.status = 'not_configured';
      return;
    }
    
    provider.apiKey = apiKey;
    provider.enabled = true;
    
    // Test connection (simulated for now)
    const connected = await this.testProviderConnection(providerKey);
    
    if (connected) {
      provider.status = 'ready';
      console.log(`✅ ${provider.name}: Configured and ready`);
    } else {
      provider.status = 'error';
      console.log(`⚠️  ${provider.name}: Configured but not accessible`);
    }
  }

  /**
   * Test provider connection
   */
  async testProviderConnection(providerKey) {
    // In production, would make actual API call to test
    // For now, simulate based on environment
    
    if (process.env.SIMULATE_EXTERNAL_APIS === 'true') {
      return true;
    }
    
    // Actual connection test would go here
    // try {
    //   const response = await fetch(`${provider.endpoint}/models`);
    //   return response.ok;
    // } catch {
    //   return false;
    // }
    
    return false;
  }

  /**
   * Route request to specific provider
   */
  async routeToProvider(providerKey, request) {
    const provider = this.providers[providerKey];
    
    if (!provider.enabled) {
      throw new Error(`${provider.name} is not configured`);
    }
    
    if (provider.status !== 'ready') {
      throw new Error(`${provider.name} is not available`);
    }
    
    const { model, content, options = {} } = request;
    
    console.log(`🔄 Routing to ${model} via ${provider.name}...`);
    
    // Track request
    this.metrics.totalRequests[providerKey] = 
      (this.metrics.totalRequests[providerKey] || 0) + 1;
    
    try {
      // Route based on provider
      let response;
      switch (providerKey) {
        case 'gemini':
          response = await this.callGemini(model, content, options);
          break;
        case 'openai':
          response = await this.callOpenAI(model, content, options);
          break;
        case 'perplexity':
          response = await this.callPerplexity(model, content, options);
          break;
        case 'tavily':
          response = await this.callTavily(content, options);
          break;
        case 'exa':
          response = await this.callExa(content, options);
          break;
        default:
          throw new Error(`Unknown provider: ${providerKey}`);
      }
      
      // Track success
      this.metrics.successfulRequests[providerKey] = 
        (this.metrics.successfulRequests[providerKey] || 0) + 1;
      
      return response;
    } catch (error) {
      // Track failure
      this.metrics.failedRequests[providerKey] = 
        (this.metrics.failedRequests[providerKey] || 0) + 1;
      
      throw error;
    }
  }

  /**
   * Call Gemini API
   */
  async callGemini(model, content, options) {
    // Simulated for testing
    if (process.env.SIMULATE_EXTERNAL_APIS === 'true') {
      return this.simulateResponse('gemini', model, content);
    }
    
    // Actual Gemini API call would go here
    throw new Error('Gemini API not implemented yet');
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(model, content, options) {
    // Simulated for testing
    if (process.env.SIMULATE_EXTERNAL_APIS === 'true') {
      return this.simulateResponse('openai', model, content);
    }
    
    // Actual OpenAI API call would go here
    throw new Error('OpenAI API not implemented yet');
  }

  /**
   * Call Perplexity API
   */
  async callPerplexity(model, content, options) {
    // Simulated for testing
    if (process.env.SIMULATE_EXTERNAL_APIS === 'true') {
      return this.simulateResponse('perplexity', model, content, {
        citations: true,
        sources: Math.floor(Math.random() * 10) + 5
      });
    }
    
    // Actual Perplexity API call would go here
    throw new Error('Perplexity API not implemented yet');
  }

  /**
   * Call Tavily Search API
   */
  async callTavily(content, options) {
    // Simulated for testing
    if (process.env.SIMULATE_EXTERNAL_APIS === 'true') {
      return this.simulateResponse('tavily', 'search', content, {
        results: Math.floor(Math.random() * 20) + 10
      });
    }
    
    // Actual Tavily API call would go here
    throw new Error('Tavily API not implemented yet');
  }

  /**
   * Call Exa Neural Search API
   */
  async callExa(content, options) {
    // Simulated for testing
    if (process.env.SIMULATE_EXTERNAL_APIS === 'true') {
      return this.simulateResponse('exa', 'neural-search', content, {
        semantic_matches: Math.floor(Math.random() * 15) + 5
      });
    }
    
    // Actual Exa API call would go here
    throw new Error('Exa API not implemented yet');
  }

  /**
   * Simulate API response for testing
   */
  async simulateResponse(provider, model, content, extras = {}) {
    return new Promise((resolve) => {
      // Simulate processing delay
      setTimeout(() => {
        const response = {
          provider,
          model,
          content: `Response from ${model} via ${provider}`,
          tokens: Math.floor(Math.random() * 1000) + 500,
          cost: this.calculateCost(provider, model, 1000),
          latency: Math.floor(Math.random() * 2000) + 500,
          ...extras
        };
        
        // Update metrics
        this.metrics.totalCost[provider] = 
          (this.metrics.totalCost[provider] || 0) + response.cost;
        
        resolve(response);
      }, Math.floor(Math.random() * 1000) + 500);
    });
  }

  /**
   * Calculate cost based on provider and model
   */
  calculateCost(provider, model, tokens) {
    const costs = {
      gemini: {
        'gemini-1.5-flash': 0.00035,
        'gemini-1.5-pro': 0.00125
      },
      openai: {
        'gpt-3.5-turbo': 0.0005,
        'gpt-4-turbo': 0.01,
        'gpt-4o': 0.005
      },
      perplexity: {
        'sonar': 0.0006,
        'sonar-pro': 0.003
      },
      tavily: {
        'search': 0.0001
      },
      exa: {
        'neural-search': 0.0002
      }
    };
    
    const providerCosts = costs[provider] || {};
    const costPer1k = providerCosts[model] || 0.001;
    
    return (tokens / 1000) * costPer1k;
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    return Object.entries(this.providers)
      .filter(([_, provider]) => provider.enabled && provider.status === 'ready')
      .map(([key, provider]) => ({
        key,
        name: provider.name,
        models: provider.models,
        status: provider.status
      }));
  }

  /**
   * Get provider for specific capability
   */
  getProviderForCapability(capability) {
    const capabilityMap = {
      'deep_research': ['perplexity'],
      'web_search': ['tavily', 'perplexity'],
      'semantic_search': ['exa'],
      'fast_inference': ['gemini', 'openai'],
      'large_context': ['gemini'],
      'reasoning': ['openai']
    };
    
    const providers = capabilityMap[capability] || [];
    
    return providers.find(p => 
      this.providers[p].enabled && this.providers[p].status === 'ready'
    );
  }

  /**
   * Generate summary of available integrations
   */
  generateSummary() {
    const available = this.getAvailableProviders();
    const total = Object.keys(this.providers).length;
    
    return {
      configured: available.length,
      total,
      providers: available,
      capabilities: {
        deep_research: !!this.getProviderForCapability('deep_research'),
        web_search: !!this.getProviderForCapability('web_search'),
        semantic_search: !!this.getProviderForCapability('semantic_search'),
        fast_inference: !!this.getProviderForCapability('fast_inference'),
        large_context: !!this.getProviderForCapability('large_context')
      },
      metrics: this.metrics
    };
  }

  /**
   * Get metrics for all providers
   */
  getMetrics() {
    const metrics = {};
    
    for (const provider of Object.keys(this.providers)) {
      const total = this.metrics.totalRequests[provider] || 0;
      const successful = this.metrics.successfulRequests[provider] || 0;
      const failed = this.metrics.failedRequests[provider] || 0;
      
      metrics[provider] = {
        total,
        successful,
        failed,
        successRate: total > 0 ? (successful / total * 100).toFixed(1) + '%' : '0%',
        totalCost: (this.metrics.totalCost[provider] || 0).toFixed(2)
      };
    }
    
    return metrics;
  }
}

// Export for use in other modules
module.exports = ExternalAPIIntegration;

// Test if called directly
if (require.main === module) {
  console.log('🧪 Testing External API Integration\n');
  
  // Set test environment
  process.env.SIMULATE_EXTERNAL_APIS = 'true';
  process.env.GOOGLE_AI_API_KEY = 'test-gemini-key';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.PERPLEXITY_API_KEY = 'test-perplexity-key';
  
  const external = new ExternalAPIIntegration();
  
  external.initialize()
    .then(async (summary) => {
      console.log('\nInitialization Summary:');
      console.log(JSON.stringify(summary, null, 2));
      
      // Test routing to available providers
      for (const provider of summary.providers) {
        try {
          const response = await external.routeToProvider(provider.key, {
            model: provider.models[0],
            content: 'Test query'
          });
          
          console.log(`\n${provider.name} Response:`, response);
        } catch (error) {
          console.error(`${provider.name} Error:`, error.message);
        }
      }
      
      // Show metrics
      console.log('\nMetrics:', external.getMetrics());
    })
    .catch(console.error);
}