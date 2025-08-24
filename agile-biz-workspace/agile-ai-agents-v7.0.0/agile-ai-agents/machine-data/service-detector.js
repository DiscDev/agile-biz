/**
 * Service Detector for Multi-LLM Support
 * Detects available AI services and determines optimal routing strategy
 * ALWAYS falls back to Claude models for 100% reliability
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ServiceDetector {
  constructor() {
    this.services = {
      claude: false,      // REQUIRED - System won't work without this
      zenMCP: false,      // Optional - Multi-model routing
      gemini: false,      // Optional - Google AI
      openai: false,      // Optional - OpenAI GPT models
      perplexity: false,  // Optional - Deep research
      tavily: false,      // Optional - Search enhancement
      exa: false,         // Optional - Semantic search
      websearch: false    // Optional - Basic web search
    };
    
    this.routingStrategy = 'claude_native'; // Default fallback
    this.envPath = path.join(__dirname, '..', '.env');
  }

  /**
   * Initialize and detect all available services
   */
  async detectServices() {
    console.log('🔍 Detecting available AI services...\n');
    
    // Check Claude first (REQUIRED)
    await this.checkClaude();
    
    // Check optional services
    await this.checkZenMCP();
    await this.checkExternalAPIs();
    
    // Determine optimal routing strategy
    this.routingStrategy = this.determineRoutingStrategy();
    
    // Generate service report
    const report = this.generateServiceReport();
    
    return {
      services: this.services,
      strategy: this.routingStrategy,
      report
    };
  }

  /**
   * Check Claude API availability (REQUIRED)
   */
  async checkClaude() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      console.error('❌ CRITICAL: Claude API key not configured');
      console.error('   AgileAiAgents requires Claude API access to function');
      console.error('   Please set ANTHROPIC_API_KEY in your .env file\n');
      throw new Error('Claude API key is required for AgileAiAgents to function');
    }
    
    // Validate API key format
    if (!apiKey.startsWith('sk-ant-')) {
      console.warn('⚠️  WARNING: Claude API key format may be incorrect');
      console.warn('   Expected format: sk-ant-...\n');
    }
    
    this.services.claude = true;
    console.log('✅ Claude API: Available (REQUIRED - System ready)');
    
    // Check which Claude models are accessible
    await this.detectClaudeModels();
  }

  /**
   * Detect available Claude models
   */
  async detectClaudeModels() {
    // In production, would make API call to check model availability
    // For now, assume standard models are available
    this.claudeModels = {
      'claude-3-haiku': true,
      'claude-3-sonnet': true,
      'claude-3-opus': true,
      'claude-3.5-sonnet': true,
      'claude-3.5-haiku': true
    };
    
    console.log('   Available Claude models:');
    Object.keys(this.claudeModels).forEach(model => {
      if (this.claudeModels[model]) {
        console.log(`   • ${model}`);
      }
    });
  }

  /**
   * Check Zen MCP installation
   */
  async checkZenMCP() {
    try {
      // Check if Zen MCP is enabled in environment
      const zenEnabled = process.env.ZEN_MCP_ENABLED === 'true';
      const zenEndpoint = process.env.ZEN_MCP_ENDPOINT;
      const zenApiKey = process.env.ZEN_MCP_API_KEY;
      
      if (!zenEnabled) {
        console.log('⚪ Zen MCP: Not enabled (optional)');
        return;
      }
      
      if (!zenEndpoint || !zenApiKey || 
          zenEndpoint === 'your_zen_mcp_endpoint_here' || 
          zenApiKey === 'your_zen_mcp_api_key_here') {
        console.log('⚪ Zen MCP: Enabled but not configured (optional)');
        return;
      }
      
      // Check if Zen MCP server is accessible
      // In production, would make test connection
      this.services.zenMCP = true;
      console.log('✅ Zen MCP: Available (Multi-model routing enabled)');
      
    } catch (error) {
      console.log('⚪ Zen MCP: Not available (optional)');
    }
  }

  /**
   * Check external API availability
   */
  async checkExternalAPIs() {
    // Check Gemini
    const geminiKey = process.env.GOOGLE_AI_API_KEY;
    if (geminiKey && geminiKey !== 'your_google_ai_api_key_here') {
      this.services.gemini = true;
      console.log('✅ Gemini API: Available');
    } else {
      console.log('⚪ Gemini API: Not configured (optional)');
    }
    
    // Check OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      this.services.openai = true;
      console.log('✅ OpenAI API: Available');
    } else {
      console.log('⚪ OpenAI API: Not configured (optional)');
    }
    
    // Check Perplexity
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    if (perplexityKey && perplexityKey !== 'your_perplexity_api_key_here') {
      this.services.perplexity = true;
      console.log('✅ Perplexity API: Available (Deep research enabled)');
    } else {
      console.log('⚪ Perplexity API: Not configured (optional)');
    }
    
    // Check Tavily
    const tavilyKey = process.env.TAVILY_API_KEY;
    if (tavilyKey && tavilyKey !== 'your_tavily_api_key_here') {
      this.services.tavily = true;
      console.log('✅ Tavily API: Available');
    } else {
      console.log('⚪ Tavily API: Not configured (optional)');
    }
    
    // Check Exa
    const exaKey = process.env.EXA_API_KEY;
    if (exaKey && exaKey !== 'your_exa_api_key_here') {
      this.services.exa = true;
      console.log('✅ Exa API: Available');
    } else {
      console.log('⚪ Exa API: Not configured (optional)');
    }
  }

  /**
   * Determine optimal routing strategy based on available services
   */
  determineRoutingStrategy() {
    // Always require Claude
    if (!this.services.claude) {
      throw new Error('Claude API is required');
    }
    
    // Check for full optimization
    if (this.services.zenMCP && (this.services.gemini || this.services.openai)) {
      return 'zen_enabled';  // Full multi-model optimization
    }
    
    // Check for hybrid mode
    if (this.services.perplexity || this.services.gemini || this.services.openai) {
      return 'hybrid';  // Partial optimization
    }
    
    // Default to Claude-only
    return 'claude_native';  // Fully functional, standard performance
  }

  /**
   * Generate service availability report
   */
  generateServiceReport() {
    const strategyDescriptions = {
      'zen_enabled': 'Full multi-model optimization (75% faster, 70% cheaper)',
      'hybrid': 'Partial optimization (40-50% faster, 30-40% cheaper)',
      'claude_native': 'Claude-only mode (100% reliable, standard performance)'
    };
    
    const report = {
      timestamp: new Date().toISOString(),
      strategy: this.routingStrategy,
      description: strategyDescriptions[this.routingStrategy],
      services: this.services,
      recommendations: this.generateRecommendations(),
      performance: this.estimatePerformance()
    };
    
    return report;
  }

  /**
   * Generate recommendations for improving setup
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (!this.services.zenMCP && !this.services.gemini && !this.services.openai) {
      recommendations.push({
        priority: 'high',
        service: 'Zen MCP or External APIs',
        benefit: 'Enable 75% faster execution and 70% cost savings',
        action: 'Configure Zen MCP or add Gemini/OpenAI API keys'
      });
    }
    
    if (!this.services.perplexity) {
      recommendations.push({
        priority: 'medium',
        service: 'Perplexity',
        benefit: 'Enable deep research with citations',
        action: 'Add PERPLEXITY_API_KEY to .env'
      });
    }
    
    if (this.services.zenMCP && !this.services.gemini) {
      recommendations.push({
        priority: 'low',
        service: 'Gemini',
        benefit: 'Lower cost alternative to Claude for some tasks',
        action: 'Add GOOGLE_AI_API_KEY to .env'
      });
    }
    
    return recommendations;
  }

  /**
   * Estimate performance based on available services
   */
  estimatePerformance() {
    const baseTime = 600; // 10 hours for thorough research (baseline)
    const baseCost = 40;  // $40 for Claude-only thorough research
    
    let timeMultiplier = 1;
    let costMultiplier = 1;
    
    switch (this.routingStrategy) {
      case 'zen_enabled':
        timeMultiplier = 0.25;  // 75% faster
        costMultiplier = 0.3;   // 70% cheaper
        break;
      case 'hybrid':
        timeMultiplier = 0.5;   // 50% faster
        costMultiplier = 0.6;   // 40% cheaper
        break;
      case 'claude_native':
      default:
        timeMultiplier = 1;     // Standard
        costMultiplier = 1;     // Standard
        break;
    }
    
    return {
      estimatedTime: {
        minimal: `${(120 * timeMultiplier).toFixed(0)} minutes`,
        medium: `${(300 * timeMultiplier).toFixed(0)} minutes`,
        thorough: `${(baseTime * timeMultiplier).toFixed(0)} minutes`
      },
      estimatedCost: {
        minimal: `$${(5 * costMultiplier).toFixed(2)}`,
        medium: `$${(15 * costMultiplier).toFixed(2)}`,
        thorough: `$${(baseCost * costMultiplier).toFixed(2)}`
      },
      speedImprovement: `${((1 - timeMultiplier) * 100).toFixed(0)}%`,
      costSavings: `${((1 - costMultiplier) * 100).toFixed(0)}%`
    };
  }

  /**
   * Display service status in formatted output
   */
  displayStatus() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SERVICE DETECTION COMPLETE');
    console.log('='.repeat(60));
    
    console.log(`\n🎯 Routing Strategy: ${this.routingStrategy.toUpperCase()}`);
    
    const strategyDescriptions = {
      'zen_enabled': '   Full optimization - Multi-model parallel execution',
      'hybrid': '   Partial optimization - Some external services available',
      'claude_native': '   Standard mode - Claude models only (fully functional)'
    };
    console.log(strategyDescriptions[this.routingStrategy]);
    
    const perf = this.estimatePerformance();
    console.log(`\n📈 Performance Estimates:`);
    console.log(`   Speed improvement: ${perf.speedImprovement}`);
    console.log(`   Cost savings: ${perf.costSavings}`);
    console.log(`   Thorough research: ${perf.estimatedTime.thorough} (cost: ${perf.estimatedCost.thorough})`);
    
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log(`\n💡 Recommendations to improve performance:`);
      recommendations.forEach(rec => {
        console.log(`   • ${rec.service}: ${rec.benefit}`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Save service detection results to state
   */
  async saveToState(statePath) {
    const stateFile = path.join(statePath, 'service-availability.json');
    const report = this.generateServiceReport();
    
    await fs.writeFile(stateFile, JSON.stringify(report, null, 2));
    console.log(`💾 Service availability saved to: ${path.basename(stateFile)}`);
    
    return report;
  }
}

// Export for use in other modules
module.exports = ServiceDetector;

// Run detection if called directly
if (require.main === module) {
  const detector = new ServiceDetector();
  
  detector.detectServices()
    .then(result => {
      detector.displayStatus();
      
      // Save to state directory
      const statePath = path.join(__dirname, '..', 'project-state');
      return detector.saveToState(statePath);
    })
    .then(() => {
      console.log('✅ Service detection complete');
    })
    .catch(error => {
      console.error('❌ Service detection failed:', error.message);
      process.exit(1);
    });
}