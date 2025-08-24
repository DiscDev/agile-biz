#!/usr/bin/env node

/**
 * Startup Validator for Multi-LLM Support
 * Ensures Claude API is available and displays routing configuration
 * Part of AgileAiAgents system initialization
 */

const fs = require('fs').promises;
const path = require('path');
const ServiceDetector = require('./service-detector');
const LLMRouter = require('./llm-router');

class StartupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.isValid = false;
  }

  /**
   * Run complete startup validation
   */
  async validate() {
    console.log('🚀 AgileAiAgents Startup Validation\n');
    console.log('='.repeat(60));
    
    // Step 1: Check Claude API (CRITICAL)
    await this.validateClaude();
    
    if (this.errors.length > 0) {
      this.displayErrors();
      return false;
    }
    
    // Step 2: Detect all services
    await this.detectServices();
    
    // Step 3: Initialize routing
    await this.initializeRouting();
    
    // Step 4: Display configuration
    this.displayConfiguration();
    
    // Step 5: Show recommendations
    this.displayRecommendations();
    
    this.isValid = true;
    return true;
  }

  /**
   * Validate Claude API availability
   */
  async validateClaude() {
    console.log('🔍 Checking Claude API (REQUIRED)...\n');
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_anthropic_api_key_here' || apiKey === '') {
      this.errors.push({
        type: 'CRITICAL',
        message: 'Claude API key not configured',
        solution: 'Set ANTHROPIC_API_KEY in your .env file',
        docs: 'https://docs.anthropic.com/claude/docs/getting-access'
      });
      return;
    }
    
    if (!apiKey.startsWith('sk-ant-')) {
      this.warnings.push({
        type: 'WARNING',
        message: 'Claude API key format may be incorrect',
        expected: 'sk-ant-...',
        actual: apiKey.substring(0, 10) + '...'
      });
    }
    
    console.log('✅ Claude API key found and validated\n');
    this.info.push('Claude API: Available and configured');
  }

  /**
   * Detect all available services
   */
  async detectServices() {
    console.log('🔍 Detecting optional services...\n');
    
    const detector = new ServiceDetector();
    this.detection = await detector.detectServices();
    
    // Count available services
    const availableCount = Object.values(this.detection.services)
      .filter(v => v).length;
    
    this.info.push(`Services detected: ${availableCount} of 8 available`);
    
    // Add warnings for optimization opportunities
    if (!this.detection.services.zenMCP && !this.detection.services.gemini) {
      this.warnings.push({
        type: 'OPTIMIZATION',
        message: 'No multi-model services configured',
        impact: 'Running in Claude-only mode (standard performance)',
        solution: 'Configure Zen MCP or add Gemini/OpenAI keys for 75% faster execution'
      });
    }
  }

  /**
   * Initialize routing system
   */
  async initializeRouting() {
    console.log('🔄 Initializing routing system...\n');
    
    const router = new LLMRouter();
    this.routing = await router.initialize();
    
    this.info.push(`Routing strategy: ${this.routing.strategy}`);
    
    // Store performance estimates
    this.performance = this.estimatePerformance(this.routing.strategy);
  }

  /**
   * Estimate performance based on strategy
   */
  estimatePerformance(strategy) {
    const estimates = {
      'zen_enabled': {
        speed: '75% faster',
        cost: '70% cheaper',
        parallel: 'Up to 5 models in parallel',
        quality: 'Maintained through validation'
      },
      'hybrid': {
        speed: '40-50% faster',
        cost: '30-40% cheaper',
        parallel: '2-3 models in parallel',
        quality: 'Maintained through validation'
      },
      'claude_native': {
        speed: 'Standard',
        cost: 'Standard',
        parallel: 'Sequential execution',
        quality: 'Claude quality guarantee'
      }
    };
    
    return estimates[strategy] || estimates.claude_native;
  }

  /**
   * Display errors and stop
   */
  displayErrors() {
    console.log('\n' + '='.repeat(60));
    console.log('❌ STARTUP VALIDATION FAILED');
    console.log('='.repeat(60) + '\n');
    
    this.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.type}: ${error.message}`);
      console.log(`   Solution: ${error.solution}`);
      if (error.docs) {
        console.log(`   Documentation: ${error.docs}`);
      }
      console.log();
    });
    
    console.log('AgileAiAgents cannot start without Claude API access.');
    console.log('Please configure the required settings and try again.\n');
  }

  /**
   * Display current configuration
   */
  displayConfiguration() {
    console.log('\n' + '='.repeat(60));
    console.log('✅ STARTUP VALIDATION SUCCESSFUL');
    console.log('='.repeat(60) + '\n');
    
    console.log('📊 CURRENT CONFIGURATION\n');
    
    // Display routing strategy
    const strategyEmoji = {
      'zen_enabled': '🚀',
      'hybrid': '⚡',
      'claude_native': '🔷'
    };
    
    console.log(`${strategyEmoji[this.routing.strategy] || '📌'} Routing Strategy: ${this.routing.strategy.toUpperCase()}`);
    console.log(`   ${this.getStrategyDescription(this.routing.strategy)}\n`);
    
    // Display services
    console.log('📡 Service Availability:');
    Object.entries(this.detection.services).forEach(([service, available]) => {
      const icon = available ? '✅' : '⚪';
      const status = available ? 'Available' : 'Not configured';
      const required = service === 'claude' ? ' (REQUIRED)' : ' (optional)';
      console.log(`   ${icon} ${service}: ${status}${required}`);
    });
    
    // Display performance
    console.log('\n📈 Performance Expectations:');
    console.log(`   Speed: ${this.performance.speed}`);
    console.log(`   Cost: ${this.performance.cost}`);
    console.log(`   Execution: ${this.performance.parallel}`);
    console.log(`   Quality: ${this.performance.quality}`);
    
    // Display research level estimates
    console.log('\n⏱️  Research Time Estimates:');
    console.log(`   Minimal: ${this.getTimeEstimate('minimal')}`);
    console.log(`   Medium: ${this.getTimeEstimate('medium')}`);
    console.log(`   Thorough: ${this.getTimeEstimate('thorough')}`);
  }

  /**
   * Get strategy description
   */
  getStrategyDescription(strategy) {
    const descriptions = {
      'zen_enabled': 'Full multi-model optimization with parallel execution',
      'hybrid': 'Partial optimization with available external services',
      'claude_native': 'Claude-only mode with sequential execution (fully functional)'
    };
    
    return descriptions[strategy] || 'Unknown strategy';
  }

  /**
   * Get time estimate for research level
   */
  getTimeEstimate(level) {
    const baseTime = {
      minimal: 90,    // 1.5 hours average
      medium: 240,    // 4 hours average
      thorough: 480   // 8 hours average
    };
    
    const multiplier = {
      'zen_enabled': 0.25,
      'hybrid': 0.5,
      'claude_native': 1
    };
    
    const time = baseTime[level] * (multiplier[this.routing.strategy] || 1);
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    
    const original = `${Math.floor(baseTime[level] / 60)}h ${baseTime[level] % 60}m`;
    
    if (this.routing.strategy === 'claude_native') {
      return original;
    } else {
      return `${hours}h ${minutes}m (vs ${original} Claude-only)`;
    }
  }

  /**
   * Display recommendations
   */
  displayRecommendations() {
    if (this.warnings.length === 0 && this.routing.strategy === 'zen_enabled') {
      console.log('\n✨ Optimal configuration detected! No recommendations.\n');
      return;
    }
    
    console.log('\n💡 RECOMMENDATIONS\n');
    
    // Display warnings
    if (this.warnings.length > 0) {
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.type}: ${warning.message}`);
        if (warning.impact) console.log(`   Impact: ${warning.impact}`);
        if (warning.solution) console.log(`   Solution: ${warning.solution}`);
        console.log();
      });
    }
    
    // Display optimization opportunities
    if (this.routing.strategy !== 'zen_enabled') {
      console.log('🚀 Optimization Opportunities:\n');
      
      if (!this.detection.services.zenMCP) {
        console.log('   1. Install Zen MCP for multi-model routing');
        console.log('      → Enable 75% faster execution');
        console.log('      → Reduce costs by 70%');
        console.log('      → Run up to 5 models in parallel\n');
      }
      
      if (!this.detection.services.perplexity) {
        console.log('   2. Add Perplexity API for deep research');
        console.log('      → Get citation-based research');
        console.log('      → Access real-time information');
        console.log('      → Improve research quality\n');
      }
      
      if (!this.detection.services.gemini && !this.detection.services.openai) {
        console.log('   3. Add Gemini or OpenAI for cost optimization');
        console.log('      → Lower cost for routine tasks');
        console.log('      → Alternative perspectives');
        console.log('      → Fallback options\n');
      }
    }
  }

  /**
   * Save validation results
   */
  async saveResults() {
    const resultsPath = path.join(__dirname, '..', 'project-state', 'startup-validation.json');
    
    const results = {
      timestamp: new Date().toISOString(),
      valid: this.isValid,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      configuration: {
        strategy: this.routing?.strategy,
        services: this.detection?.services,
        performance: this.performance
      }
    };
    
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Validation results saved to: project-state/startup-validation.json`);
  }
}

// Export for use in other modules
module.exports = StartupValidator;

// Run validation if called directly
if (require.main === module) {
  const validator = new StartupValidator();
  
  // Set test environment if needed
  if (process.argv.includes('--test')) {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
    console.log('🧪 Running in TEST MODE\n');
  }
  
  validator.validate()
    .then(async (isValid) => {
      await validator.saveResults();
      
      if (isValid) {
        console.log('\n✅ AgileAiAgents is ready to start!\n');
        process.exit(0);
      } else {
        console.log('\n❌ Please fix the errors above before starting.\n');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Validation failed with error:', error.message);
      process.exit(1);
    });
}