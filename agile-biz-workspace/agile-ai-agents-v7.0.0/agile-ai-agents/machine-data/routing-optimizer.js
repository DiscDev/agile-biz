/**
 * Routing Strategy Optimizer
 * Intelligently selects optimal models and routing strategies
 * Part of Phase 2: Progressive Enhancement
 */

const ZenMCPIntegration = require('./zen-mcp-integration');
const ExternalAPIIntegration = require('./external-api-integration');

class RoutingOptimizer {
  constructor() {
    this.zenMCP = new ZenMCPIntegration();
    this.externalAPIs = new ExternalAPIIntegration();
    this.strategies = [];
    this.currentStrategy = null;
    this.performanceHistory = [];
    this.costHistory = [];
    this.optimizationRules = {
      costWeight: 0.4,
      speedWeight: 0.3,
      qualityWeight: 0.3
    };
  }

  /**
   * Initialize optimizer with all available services
   */
  async initialize() {
    console.log('🎯 Initializing Routing Optimizer...\n');
    
    // Initialize integrations
    const zenResult = await this.zenMCP.initialize();
    const externalResult = await this.externalAPIs.initialize();
    
    // Build available strategies
    this.buildStrategies(zenResult, externalResult);
    
    // Select optimal strategy
    this.currentStrategy = this.selectOptimalStrategy();
    
    console.log(`\n📊 Optimization Complete`);
    console.log(`   Available strategies: ${this.strategies.length}`);
    console.log(`   Selected strategy: ${this.currentStrategy?.name || 'claude_native'}\n`);
    
    return {
      strategies: this.strategies,
      selected: this.currentStrategy,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Build available routing strategies
   */
  buildStrategies(zenResult, externalResult) {
    this.strategies = [];
    
    // Always add Claude-native as baseline
    this.strategies.push({
      name: 'claude_native',
      type: 'baseline',
      description: 'Claude-only sequential execution',
      providers: ['claude'],
      performance: {
        speed: 1,
        cost: 1,
        quality: 1,
        reliability: 1
      },
      available: true
    });
    
    // Add Zen MCP strategy if available
    if (zenResult.available) {
      this.strategies.push({
        name: 'zen_optimized',
        type: 'multi_model',
        description: 'Full multi-model optimization via Zen MCP',
        providers: ['zen_mcp'],
        models: zenResult.models,
        performance: {
          speed: 4,      // 4x faster
          cost: 0.3,     // 70% cheaper
          quality: 0.95, // Slight quality trade-off
          reliability: 0.98
        },
        available: true
      });
    }
    
    // Add hybrid strategies based on available external APIs
    if (externalResult.configured > 0) {
      // Fast hybrid (prioritize speed)
      if (externalResult.capabilities.fast_inference) {
        this.strategies.push({
          name: 'speed_optimized',
          type: 'hybrid',
          description: 'Optimized for speed with fast models',
          providers: externalResult.providers.filter(p => 
            ['gemini', 'openai'].includes(p.key)
          ),
          performance: {
            speed: 2.5,
            cost: 0.5,
            quality: 0.9,
            reliability: 0.95
          },
          available: true
        });
      }
      
      // Cost hybrid (prioritize cost)
      if (externalResult.providers.some(p => p.key === 'gemini')) {
        this.strategies.push({
          name: 'cost_optimized',
          type: 'hybrid',
          description: 'Optimized for cost with cheaper models',
          providers: ['gemini', 'claude'],
          performance: {
            speed: 2,
            cost: 0.4,
            quality: 0.92,
            reliability: 0.96
          },
          available: true
        });
      }
      
      // Research hybrid (with Perplexity)
      if (externalResult.capabilities.deep_research) {
        this.strategies.push({
          name: 'research_enhanced',
          type: 'hybrid',
          description: 'Enhanced with deep research capabilities',
          providers: ['perplexity', 'claude'],
          performance: {
            speed: 1.8,
            cost: 0.6,
            quality: 1.1,  // Better quality with citations
            reliability: 0.97
          },
          available: true
        });
      }
    }
    
    // Add adaptive strategy if multiple options available
    if (this.strategies.length > 2) {
      this.strategies.push({
        name: 'adaptive',
        type: 'dynamic',
        description: 'Dynamically selects best strategy per task',
        providers: 'dynamic',
        performance: {
          speed: 3,
          cost: 0.45,
          quality: 0.98,
          reliability: 0.99
        },
        available: true
      });
    }
  }

  /**
   * Select optimal strategy based on weights
   */
  selectOptimalStrategy() {
    if (this.strategies.length === 1) {
      return this.strategies[0];
    }
    
    // Calculate scores for each strategy
    const scores = this.strategies.map(strategy => {
      const score = 
        (strategy.performance.speed * this.optimizationRules.speedWeight) +
        ((1 / strategy.performance.cost) * this.optimizationRules.costWeight) +
        (strategy.performance.quality * this.optimizationRules.qualityWeight);
      
      return {
        strategy,
        score
      };
    });
    
    // Sort by score and return best
    scores.sort((a, b) => b.score - a.score);
    
    return scores[0].strategy;
  }

  /**
   * Optimize routing for specific task
   */
  optimizeForTask(task) {
    const { type, requirements = {}, constraints = {} } = task;
    
    // Task-specific optimization
    const taskProfiles = {
      research: {
        speedWeight: 0.2,
        costWeight: 0.3,
        qualityWeight: 0.5
      },
      quick_validation: {
        speedWeight: 0.6,
        costWeight: 0.3,
        qualityWeight: 0.1
      },
      production_code: {
        speedWeight: 0.2,
        costWeight: 0.2,
        qualityWeight: 0.6
      },
      bulk_processing: {
        speedWeight: 0.3,
        costWeight: 0.5,
        qualityWeight: 0.2
      }
    };
    
    const profile = taskProfiles[type] || this.optimizationRules;
    
    // Find best strategy for this task
    let bestStrategy = this.currentStrategy;
    let bestScore = 0;
    
    for (const strategy of this.strategies) {
      // Check constraints
      if (constraints.maxCost && strategy.performance.cost > constraints.maxCost) {
        continue;
      }
      
      if (constraints.minQuality && strategy.performance.quality < constraints.minQuality) {
        continue;
      }
      
      // Calculate score
      const score = 
        (strategy.performance.speed * profile.speedWeight) +
        ((1 / strategy.performance.cost) * profile.costWeight) +
        (strategy.performance.quality * profile.qualityWeight);
      
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategy;
      }
    }
    
    return {
      strategy: bestStrategy,
      reasoning: this.explainOptimization(bestStrategy, task),
      alternatives: this.getAlternatives(bestStrategy)
    };
  }

  /**
   * Explain optimization decision
   */
  explainOptimization(strategy, task) {
    const reasons = [];
    
    if (strategy.name === 'zen_optimized') {
      reasons.push('Using Zen MCP for maximum parallelization');
      reasons.push(`Expected ${(strategy.performance.speed * 100).toFixed(0)}% speed improvement`);
      reasons.push(`Estimated ${((1 - strategy.performance.cost) * 100).toFixed(0)}% cost savings`);
    } else if (strategy.type === 'hybrid') {
      reasons.push(`Using ${strategy.providers.length} providers for optimization`);
      if (strategy.name === 'research_enhanced') {
        reasons.push('Perplexity provides citation-based research');
      }
      if (strategy.name === 'speed_optimized') {
        reasons.push('Fast models prioritized for quick results');
      }
      if (strategy.name === 'cost_optimized') {
        reasons.push('Cost-effective models selected');
      }
    } else if (strategy.name === 'adaptive') {
      reasons.push('Dynamically selecting best model per subtask');
      reasons.push('Balancing speed, cost, and quality optimally');
    } else {
      reasons.push('Using Claude-native for reliability');
      reasons.push('All features guaranteed to work');
    }
    
    return reasons;
  }

  /**
   * Get alternative strategies
   */
  getAlternatives(selectedStrategy) {
    return this.strategies
      .filter(s => s.name !== selectedStrategy.name && s.available)
      .map(s => ({
        name: s.name,
        tradeoff: this.compareStrategies(selectedStrategy, s)
      }));
  }

  /**
   * Compare two strategies
   */
  compareStrategies(strategy1, strategy2) {
    const speedDiff = strategy2.performance.speed - strategy1.performance.speed;
    const costDiff = strategy1.performance.cost - strategy2.performance.cost;
    const qualityDiff = strategy2.performance.quality - strategy1.performance.quality;
    
    const tradeoffs = [];
    
    if (speedDiff > 0) {
      tradeoffs.push(`${(speedDiff * 100).toFixed(0)}% faster`);
    } else if (speedDiff < 0) {
      tradeoffs.push(`${Math.abs(speedDiff * 100).toFixed(0)}% slower`);
    }
    
    if (costDiff > 0) {
      tradeoffs.push(`${(costDiff * 100).toFixed(0)}% more expensive`);
    } else if (costDiff < 0) {
      tradeoffs.push(`${Math.abs(costDiff * 100).toFixed(0)}% cheaper`);
    }
    
    if (qualityDiff > 0) {
      tradeoffs.push(`${(qualityDiff * 100).toFixed(0)}% better quality`);
    } else if (qualityDiff < 0) {
      tradeoffs.push(`${Math.abs(qualityDiff * 100).toFixed(0)}% lower quality`);
    }
    
    return tradeoffs.join(', ') || 'Similar performance';
  }

  /**
   * Track performance for learning
   */
  trackPerformance(strategy, task, metrics) {
    this.performanceHistory.push({
      timestamp: new Date().toISOString(),
      strategy: strategy.name,
      task: task.type,
      metrics
    });
    
    // Update strategy performance based on real data
    this.updateStrategyPerformance(strategy, metrics);
  }

  /**
   * Update strategy performance based on actual metrics
   */
  updateStrategyPerformance(strategy, metrics) {
    // Simple exponential moving average
    const alpha = 0.1; // Learning rate
    
    if (metrics.actualSpeed) {
      strategy.performance.speed = 
        (alpha * metrics.actualSpeed) + ((1 - alpha) * strategy.performance.speed);
    }
    
    if (metrics.actualCost) {
      strategy.performance.cost = 
        (alpha * metrics.actualCost) + ((1 - alpha) * strategy.performance.cost);
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check if Zen MCP could be added
    if (!this.strategies.some(s => s.name === 'zen_optimized')) {
      recommendations.push({
        priority: 'high',
        title: 'Enable Zen MCP',
        benefit: 'Up to 75% faster execution and 70% cost savings',
        action: 'Install and configure Zen MCP'
      });
    }
    
    // Check for research capabilities
    if (!this.strategies.some(s => s.name === 'research_enhanced')) {
      recommendations.push({
        priority: 'medium',
        title: 'Add Perplexity API',
        benefit: 'Citation-based research with real-time data',
        action: 'Configure PERPLEXITY_API_KEY in .env'
      });
    }
    
    // Check for cost optimization
    if (!this.strategies.some(s => s.name === 'cost_optimized')) {
      recommendations.push({
        priority: 'low',
        title: 'Add Gemini API',
        benefit: 'Lower costs for routine tasks',
        action: 'Configure GOOGLE_AI_API_KEY in .env'
      });
    }
    
    return recommendations;
  }

  /**
   * Get optimization metrics
   */
  getMetrics() {
    const avgPerformance = this.calculateAveragePerformance();
    const totalCostSaved = this.calculateTotalCostSaved();
    const totalTimeSaved = this.calculateTotalTimeSaved();
    
    return {
      strategiesAvailable: this.strategies.length,
      currentStrategy: this.currentStrategy?.name,
      performanceHistory: this.performanceHistory.length,
      avgPerformance,
      totalCostSaved,
      totalTimeSaved,
      recommendations: this.generateRecommendations().length
    };
  }

  /**
   * Calculate average performance
   */
  calculateAveragePerformance() {
    if (this.performanceHistory.length === 0) {
      return null;
    }
    
    const avg = {
      speed: 0,
      cost: 0,
      quality: 0
    };
    
    for (const entry of this.performanceHistory) {
      avg.speed += entry.metrics.actualSpeed || 1;
      avg.cost += entry.metrics.actualCost || 1;
      avg.quality += entry.metrics.qualityScore || 1;
    }
    
    const count = this.performanceHistory.length;
    avg.speed /= count;
    avg.cost /= count;
    avg.quality /= count;
    
    return avg;
  }

  /**
   * Calculate total cost saved
   */
  calculateTotalCostSaved() {
    return this.performanceHistory.reduce((total, entry) => {
      const saved = entry.metrics.costSaved || 0;
      return total + saved;
    }, 0);
  }

  /**
   * Calculate total time saved
   */
  calculateTotalTimeSaved() {
    return this.performanceHistory.reduce((total, entry) => {
      const saved = entry.metrics.timeSaved || 0;
      return total + saved;
    }, 0);
  }
}

// Export for use in other modules
module.exports = RoutingOptimizer;

// Test if called directly
if (require.main === module) {
  console.log('🧪 Testing Routing Optimizer\n');
  
  // Set test environment
  process.env.ZEN_MCP_ENABLED = 'true';
  process.env.ZEN_MCP_ENDPOINT = 'http://localhost:8080';
  process.env.ZEN_MCP_API_KEY = 'test-key';
  process.env.ZEN_MCP_SIMULATE = 'true';
  process.env.SIMULATE_EXTERNAL_APIS = 'true';
  process.env.GOOGLE_AI_API_KEY = 'test-gemini';
  process.env.PERPLEXITY_API_KEY = 'test-perplexity';
  
  const optimizer = new RoutingOptimizer();
  
  optimizer.initialize()
    .then(async (result) => {
      console.log('Available Strategies:');
      result.strategies.forEach(s => {
        console.log(`  - ${s.name}: ${s.description}`);
        console.log(`    Performance: Speed ${s.performance.speed}x, Cost ${s.performance.cost}x`);
      });
      
      console.log(`\nSelected Strategy: ${result.selected.name}`);
      
      // Test task optimization
      const tasks = [
        { type: 'research', requirements: {} },
        { type: 'quick_validation', requirements: {} },
        { type: 'production_code', requirements: {} }
      ];
      
      console.log('\nTask-Specific Optimization:');
      for (const task of tasks) {
        const optimized = optimizer.optimizeForTask(task);
        console.log(`\n  ${task.type}:`);
        console.log(`    Strategy: ${optimized.strategy.name}`);
        console.log(`    Reasoning: ${optimized.reasoning.join(', ')}`);
      }
      
      // Show metrics
      console.log('\nOptimizer Metrics:', optimizer.getMetrics());
    })
    .catch(console.error);
}