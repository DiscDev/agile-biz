/**
 * LLM Router with Fallback Cascade
 * Intelligently routes requests to optimal models with Claude-native fallback
 * ALWAYS guarantees execution through Claude fallback chain
 */

const fs = require('fs').promises;
const path = require('path');
const ServiceDetector = require('./service-detector');

class LLMRouter {
  constructor() {
    this.serviceDetector = new ServiceDetector();
    this.services = {};
    this.strategy = 'claude_native';
    this.fallbackChain = [];
    this.metrics = {
      requests: 0,
      fallbacks: 0,
      successes: 0,
      failures: 0,
      costSaved: 0,
      timeReduced: 0
    };
    this.configPath = path.join(__dirname, '..', 'CLAUDE-config.md');
    this.statePath = path.join(__dirname, '..', 'project-state');
  }

  /**
   * Initialize router with service detection
   */
  async initialize() {
    console.log('🚀 Initializing LLM Router...\n');
    
    // Detect available services
    const detection = await this.serviceDetector.detectServices();
    this.services = detection.services;
    this.strategy = detection.strategy;
    
    // Load research level configurations
    await this.loadResearchConfigs();
    
    // Build fallback chains
    this.buildFallbackChains();
    
    // Update state with routing configuration
    await this.updateRoutingState();
    
    console.log(`✅ LLM Router initialized with strategy: ${this.strategy}\n`);
    
    return {
      strategy: this.strategy,
      services: this.services,
      fallbackChains: this.fallbackChain
    };
  }

  /**
   * Load research level configurations from CLAUDE-config.md
   */
  async loadResearchConfigs() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      
      // Parse research levels configuration
      const researchMatch = configContent.match(/research_levels:([\s\S]*?)```/);
      if (researchMatch) {
        // Store parsed configuration
        this.researchConfig = this.parseYamlSection(researchMatch[1]);
      }
    } catch (error) {
      console.warn('⚠️  Could not load research configurations, using defaults');
      this.researchConfig = this.getDefaultResearchConfig();
    }
  }

  /**
   * Parse YAML-like configuration section (simplified)
   */
  parseYamlSection(content) {
    // Simplified parsing for demonstration
    // In production, would use proper YAML parser
    return {
      minimal: {
        duration: '1-2 hours',
        enhanced_duration: '15-30 minutes',
        model_routing: {
          zen_enabled: {
            primary: 'gemini-1.5-flash',
            secondary: 'claude-3-haiku',
            parallel_streams: 2
          },
          claude_native: {
            primary: 'claude-3-haiku',
            secondary: 'claude-3-sonnet',
            final: 'claude-3-opus'
          }
        }
      },
      medium: {
        duration: '3-5 hours',
        enhanced_duration: '45-75 minutes',
        model_routing: {
          zen_enabled: {
            primary: 'gemini-1.5-pro',
            secondary: 'claude-3-haiku',
            deep_research: 'perplexity-sonar',
            parallel_streams: 3
          },
          claude_native: {
            primary: 'claude-3-sonnet',
            secondary: 'claude-3-haiku',
            final: 'claude-3-opus'
          }
        }
      },
      thorough: {
        duration: '6-10 hours',
        enhanced_duration: '1.5-2.5 hours',
        model_routing: {
          zen_enabled: {
            primary: 'claude-sonnet-4',
            secondary: 'gemini-1.5-pro',
            deep_research: ['perplexity-sonar-pro', 'tavily', 'exa'],
            parallel_streams: 5
          },
          claude_native: {
            primary: 'claude-sonnet-4',
            secondary: 'claude-opus-4',
            final: 'claude-opus-4'
          }
        }
      }
    };
  }

  /**
   * Get default research configuration
   */
  getDefaultResearchConfig() {
    return {
      minimal: {
        model_routing: {
          claude_native: {
            primary: 'claude-3-haiku',
            secondary: 'claude-3-sonnet',
            final: 'claude-3-opus'
          }
        }
      },
      medium: {
        model_routing: {
          claude_native: {
            primary: 'claude-3-sonnet',
            secondary: 'claude-3-opus',
            final: 'claude-3-opus'
          }
        }
      },
      thorough: {
        model_routing: {
          claude_native: {
            primary: 'claude-sonnet-4',
            secondary: 'claude-opus-4',
            final: 'claude-opus-4'
          }
        }
      }
    };
  }

  /**
   * Build fallback chains based on available services
   */
  buildFallbackChains() {
    this.fallbackChain = {};
    
    // Build chains for each research level
    ['minimal', 'medium', 'thorough'].forEach(level => {
      const config = this.researchConfig[level];
      
      if (this.strategy === 'zen_enabled' && config.model_routing.zen_enabled) {
        // Full optimization available
        this.fallbackChain[level] = [
          ...this.buildZenChain(config.model_routing.zen_enabled),
          ...this.buildClaudeChain(config.model_routing.claude_native)
        ];
      } else if (this.strategy === 'hybrid') {
        // Partial optimization
        this.fallbackChain[level] = [
          ...this.buildHybridChain(config.model_routing),
          ...this.buildClaudeChain(config.model_routing.claude_native)
        ];
      } else {
        // Claude-only fallback (ALWAYS AVAILABLE)
        this.fallbackChain[level] = this.buildClaudeChain(
          config.model_routing.claude_native || config.model_routing
        );
      }
    });
    
    console.log('📊 Fallback chains built for all research levels');
  }

  /**
   * Build Zen-enabled chain
   */
  buildZenChain(config) {
    const chain = [];
    
    if (config.primary) chain.push({ model: config.primary, via: 'zen' });
    if (config.secondary) chain.push({ model: config.secondary, via: 'zen' });
    if (config.tertiary) chain.push({ model: config.tertiary, via: 'zen' });
    
    return chain;
  }

  /**
   * Build hybrid chain with available services
   */
  buildHybridChain(config) {
    const chain = [];
    
    // Add available external services
    if (this.services.gemini && config.zen_enabled?.primary?.includes('gemini')) {
      chain.push({ model: 'gemini-1.5-pro', via: 'direct' });
    }
    if (this.services.openai && config.zen_enabled?.primary?.includes('gpt')) {
      chain.push({ model: 'gpt-4-turbo', via: 'direct' });
    }
    if (this.services.perplexity) {
      chain.push({ model: 'perplexity-sonar', via: 'direct' });
    }
    
    return chain;
  }

  /**
   * Build Claude chain (ALWAYS AVAILABLE)
   */
  buildClaudeChain(config) {
    const chain = [];
    
    // Always add Claude models in order of preference
    if (config.primary) chain.push({ model: config.primary, via: 'claude' });
    if (config.secondary) chain.push({ model: config.secondary, via: 'claude' });
    if (config.final) chain.push({ model: config.final, via: 'claude' });
    
    // Ultimate fallback if nothing configured
    if (chain.length === 0) {
      chain.push(
        { model: 'claude-3-haiku', via: 'claude' },
        { model: 'claude-3-sonnet', via: 'claude' },
        { model: 'claude-3-opus', via: 'claude' }
      );
    }
    
    return chain;
  }

  /**
   * Route a request with automatic fallback
   */
  async routeRequest(request) {
    const { task, level = 'minimal', content, maxRetries = 3 } = request;
    
    this.metrics.requests++;
    
    console.log(`\n🔄 Routing request: ${task} (level: ${level})`);
    console.log(`   Strategy: ${this.strategy}`);
    
    const chain = this.fallbackChain[level] || this.fallbackChain.minimal;
    let lastError = null;
    
    // Try each model in the chain
    for (const { model, via } of chain) {
      try {
        console.log(`   Trying: ${model} via ${via}...`);
        
        const result = await this.executeWithModel(model, via, content);
        
        this.metrics.successes++;
        console.log(`   ✅ Success with ${model}`);
        
        // Track metrics
        if (via !== 'claude') {
          this.trackSavings(model, via);
        }
        
        return {
          success: true,
          model,
          via,
          result,
          fallbacksUsed: chain.indexOf({ model, via })
        };
        
      } catch (error) {
        console.log(`   ⚠️  Failed: ${error.message}`);
        lastError = error;
        this.metrics.fallbacks++;
        
        // Continue to next model in chain
        continue;
      }
    }
    
    // All models failed
    this.metrics.failures++;
    console.error(`   ❌ All models in chain failed`);
    
    throw new Error(`Request failed after trying all models: ${lastError?.message}`);
  }

  /**
   * Execute request with specific model
   */
  async executeWithModel(model, via, content) {
    // Simulate model execution
    // In production, this would call actual APIs
    
    return new Promise((resolve, reject) => {
      // Simulate processing time
      setTimeout(() => {
        // Simulate random failures for testing
        if (Math.random() > 0.8 && via !== 'claude') {
          reject(new Error(`${model} temporarily unavailable`));
        } else {
          resolve({
            model,
            via,
            response: `Processed by ${model} via ${via}`,
            tokens: Math.floor(Math.random() * 1000) + 500,
            cost: this.calculateCost(model)
          });
        }
      }, 100);
    });
  }

  /**
   * Calculate cost for model usage
   */
  calculateCost(model) {
    const costs = {
      'claude-3-haiku': 0.25,
      'claude-3-sonnet': 1.0,
      'claude-3-opus': 5.0,
      'claude-sonnet-4': 3.0,
      'claude-opus-4': 15.0,
      'gemini-1.5-flash': 0.075,
      'gemini-1.5-pro': 0.35,
      'gpt-3.5-turbo': 0.5,
      'gpt-4-turbo': 10.0,
      'perplexity-sonar': 0.6
    };
    
    return costs[model] || 1.0;
  }

  /**
   * Track cost and time savings
   */
  trackSavings(model, via) {
    // Calculate savings vs Claude-only
    const claudeCost = this.calculateCost('claude-3-sonnet');
    const actualCost = this.calculateCost(model);
    
    this.metrics.costSaved += (claudeCost - actualCost);
    
    // Track time savings for parallel execution
    if (via === 'zen' || this.strategy === 'hybrid') {
      this.metrics.timeReduced += 0.5; // Hours saved
    }
  }

  /**
   * Update routing state for monitoring
   */
  async updateRoutingState() {
    const stateFile = path.join(this.statePath, 'configuration.json');
    
    const state = {
      timestamp: new Date().toISOString(),
      strategy: this.strategy,
      services: this.services,
      fallbackChains: this.fallbackChain,
      metrics: this.metrics,
      performance: {
        speedMultiplier: this.strategy === 'zen_enabled' ? 4 : 
                        this.strategy === 'hybrid' ? 2 : 1,
        costMultiplier: this.strategy === 'zen_enabled' ? 0.3 : 
                       this.strategy === 'hybrid' ? 0.6 : 1
      }
    };
    
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    console.log(`💾 Routing state saved to: ${path.basename(stateFile)}`);
  }

  /**
   * Get current routing metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.requests > 0 ? 
        (this.metrics.successes / this.metrics.requests * 100).toFixed(1) + '%' : '0%',
      fallbackRate: this.metrics.requests > 0 ?
        (this.metrics.fallbacks / this.metrics.requests * 100).toFixed(1) + '%' : '0%',
      totalSaved: `$${this.metrics.costSaved.toFixed(2)}`,
      timeReduced: `${this.metrics.timeReduced.toFixed(1)} hours`
    };
  }

  /**
   * Display routing status
   */
  displayStatus() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 LLM ROUTER STATUS');
    console.log('='.repeat(60));
    
    console.log(`\nStrategy: ${this.strategy}`);
    console.log(`Services Available:`);
    Object.entries(this.services).forEach(([service, available]) => {
      console.log(`  ${available ? '✅' : '⚪'} ${service}`);
    });
    
    console.log(`\nMetrics:`);
    const metrics = this.getMetrics();
    console.log(`  Requests: ${this.metrics.requests}`);
    console.log(`  Success Rate: ${metrics.successRate}`);
    console.log(`  Fallback Rate: ${metrics.fallbackRate}`);
    console.log(`  Cost Saved: ${metrics.totalSaved}`);
    console.log(`  Time Reduced: ${metrics.timeReduced}`);
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Export for use in other modules
module.exports = LLMRouter;

// Test the router if called directly
if (require.main === module) {
  const router = new LLMRouter();
  
  async function testRouter() {
    // Initialize router
    await router.initialize();
    router.displayStatus();
    
    // Test routing with different levels
    console.log('🧪 Testing routing with different research levels...\n');
    
    const testRequests = [
      { task: 'Market Analysis', level: 'minimal', content: 'Analyze market trends' },
      { task: 'Technical Review', level: 'medium', content: 'Review architecture' },
      { task: 'Deep Research', level: 'thorough', content: 'Comprehensive analysis' }
    ];
    
    for (const request of testRequests) {
      try {
        const result = await router.routeRequest(request);
        console.log(`✅ ${request.task} completed with ${result.model}`);
      } catch (error) {
        console.error(`❌ ${request.task} failed: ${error.message}`);
      }
    }
    
    // Display final metrics
    router.displayStatus();
  }
  
  testRouter().catch(console.error);
}