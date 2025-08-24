#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Multi-LLM Implementation
 * Tests all phases of the multi-LLM support system
 */

const ServiceDetector = require('../service-detector');
const LLMRouter = require('../llm-router');
const ZenMCPIntegration = require('../zen-mcp-integration');
const ExternalAPIIntegration = require('../external-api-integration');
const RoutingOptimizer = require('../routing-optimizer');
const DeepResearchIntegration = require('../deep-research-integration');
const FallbackManager = require('../fallback-manager');
const RoutingMessages = require('../routing-messages');

class MultiLLMTestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 COMPREHENSIVE MULTI-LLM TEST SUITE\n');
    console.log('='.repeat(60));
    
    // Phase 1 Tests: Foundation
    await this.testPhase1Foundation();
    
    // Phase 2 Tests: Progressive Enhancement
    await this.testPhase2Enhancement();
    
    // Phase 2.5 Tests: Deep Research
    await this.testPhase25DeepResearch();
    
    // Phase 3 Tests: Fallback Management
    await this.testPhase3Fallback();
    
    // Phase 4 Tests: Commands (validation only)
    await this.testPhase4Commands();
    
    // Integration Tests
    await this.testIntegration();
    
    // Performance Tests
    await this.testPerformance();
    
    // Display results
    this.displayResults();
  }

  /**
   * Phase 1: Foundation Tests
   */
  async testPhase1Foundation() {
    console.log('\n📋 PHASE 1: Foundation Tests');
    console.log('-'.repeat(40));
    
    // Test service detection
    await this.test('Service Detection', async () => {
      const detector = new ServiceDetector();
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      const result = await detector.detectServices();
      
      this.assert(result.services.claude === true, 'Claude detected');
      this.assert(result.strategy !== null, 'Strategy determined');
      return true;
    });
    
    // Test Claude-native fallback
    await this.test('Claude-Native Fallback', async () => {
      const router = new LLMRouter();
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      await router.initialize();
      
      this.assert(router.strategy === 'claude_native', 'Claude-native strategy');
      this.assert(router.fallbackChain.minimal.length > 0, 'Fallback chain exists');
      return true;
    });
    
    // Test routing messages
    await this.test('Routing Messages', async () => {
      const messages = new RoutingMessages();
      messages.setVerbosity('normal');
      
      const msg = messages.getDetectionMessage(
        { claude: true },
        'claude_native'
      );
      
      this.assert(msg !== null, 'Message generated');
      this.assert(msg.includes('Claude'), 'Message mentions Claude');
      return true;
    });
  }

  /**
   * Phase 2: Progressive Enhancement Tests
   */
  async testPhase2Enhancement() {
    console.log('\n📋 PHASE 2: Progressive Enhancement Tests');
    console.log('-'.repeat(40));
    
    // Test Zen MCP integration
    await this.test('Zen MCP Integration', async () => {
      process.env.ZEN_MCP_ENABLED = 'true';
      process.env.ZEN_MCP_ENDPOINT = 'http://localhost:8080';
      process.env.ZEN_MCP_API_KEY = 'test-key';
      process.env.ZEN_MCP_SIMULATE = 'true';
      
      const zen = new ZenMCPIntegration();
      const result = await zen.initialize();
      
      this.assert(result.available === true, 'Zen MCP available');
      this.assert(result.models.length > 0, 'Models discovered');
      return true;
    });
    
    // Test external API integration
    await this.test('External API Integration', async () => {
      process.env.SIMULATE_EXTERNAL_APIS = 'true';
      process.env.GOOGLE_AI_API_KEY = 'test-gemini';
      
      const external = new ExternalAPIIntegration();
      const result = await external.initialize();
      
      this.assert(result.configured > 0, 'APIs configured');
      this.assert(result.providers.length > 0, 'Providers available');
      return true;
    });
    
    // Test routing optimizer
    await this.test('Routing Optimizer', async () => {
      const optimizer = new RoutingOptimizer();
      const result = await optimizer.initialize();
      
      this.assert(result.strategies.length > 0, 'Strategies created');
      this.assert(result.selected !== null, 'Strategy selected');
      return true;
    });
  }

  /**
   * Phase 2.5: Deep Research Tests
   */
  async testPhase25DeepResearch() {
    console.log('\n📋 PHASE 2.5: Deep Research Tests');
    console.log('-'.repeat(40));
    
    // Test deep research integration
    await this.test('Deep Research Integration', async () => {
      process.env.SIMULATE_EXTERNAL_APIS = 'true';
      process.env.PERPLEXITY_API_KEY = 'test-key';
      
      const research = new DeepResearchIntegration();
      const result = await research.initialize();
      
      this.assert(result.enabledCount > 0, 'Research providers enabled');
      this.assert(result.capabilities.citations === true, 'Citations available');
      return true;
    });
    
    // Test research session
    await this.test('Research Session', async () => {
      const research = new DeepResearchIntegration();
      await research.initialize();
      
      const session = await research.startResearchSession('test topic');
      
      this.assert(session.id !== null, 'Session created');
      this.assert(session.status === 'active', 'Session active');
      return true;
    });
  }

  /**
   * Phase 3: Fallback Management Tests
   */
  async testPhase3Fallback() {
    console.log('\n📋 PHASE 3: Fallback Management Tests');
    console.log('-'.repeat(40));
    
    // Test fallback manager
    await this.test('Fallback Manager', async () => {
      const manager = new FallbackManager();
      const result = await manager.initialize();
      
      this.assert(result.rules > 0, 'Fallback rules loaded');
      this.assert(result.monitoring === true, 'Health monitoring started');
      return true;
    });
    
    // Test service registration
    await this.test('Service Registration', async () => {
      const manager = new FallbackManager();
      await manager.initialize();
      
      manager.registerService('test-service', {});
      const health = manager.getServiceHealth('test-service');
      
      this.assert(health !== null, 'Service registered');
      return true;
    });
    
    // Test cost tracking
    await this.test('Cost Tracking', async () => {
      const manager = new FallbackManager();
      await manager.initialize();
      
      manager.trackCost(10, 'gpt-4');
      const status = manager.getCostStatus();
      
      this.assert(status.current.session === 10, 'Cost tracked');
      this.assert(status.percentage.session !== null, 'Percentage calculated');
      return true;
    });
  }

  /**
   * Phase 4: Command Tests
   */
  async testPhase4Commands() {
    console.log('\n📋 PHASE 4: Command Tests');
    console.log('-'.repeat(40));
    
    // Test command files exist
    await this.test('Command Files', async () => {
      const fs = require('fs').promises;
      const path = require('path');
      
      const commandsDir = path.join(__dirname, '..', '..', '.claude', 'commands');
      const commands = ['configure-models.md', 'model-status.md', 'research-boost.md'];
      
      for (const cmd of commands) {
        const exists = await fs.access(path.join(commandsDir, cmd))
          .then(() => true)
          .catch(() => false);
        this.assert(exists, `${cmd} exists`);
      }
      
      return true;
    });
  }

  /**
   * Integration Tests
   */
  async testIntegration() {
    console.log('\n📋 INTEGRATION Tests');
    console.log('-'.repeat(40));
    
    // Test full routing flow
    await this.test('Full Routing Flow', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      process.env.SIMULATE_EXTERNAL_APIS = 'true';
      
      const router = new LLMRouter();
      await router.initialize();
      
      const result = await router.routeRequest({
        task: 'Test',
        level: 'minimal',
        content: 'Test content'
      });
      
      this.assert(result.success === true, 'Request routed');
      this.assert(result.model !== null, 'Model selected');
      return true;
    });
    
    // Test fallback cascade
    await this.test('Fallback Cascade', async () => {
      const manager = new FallbackManager();
      await manager.initialize();
      
      const chain = manager.getFallbackChain('gemini-1.5-pro');
      
      this.assert(Array.isArray(chain), 'Fallback chain exists');
      this.assert(chain.length > 0, 'Chain has fallbacks');
      return true;
    });
    
    // Test optimization flow
    await this.test('Optimization Flow', async () => {
      process.env.ZEN_MCP_SIMULATE = 'true';
      process.env.SIMULATE_EXTERNAL_APIS = 'true';
      
      const optimizer = new RoutingOptimizer();
      await optimizer.initialize();
      
      const optimized = optimizer.optimizeForTask({
        type: 'research',
        requirements: {}
      });
      
      this.assert(optimized.strategy !== null, 'Strategy optimized');
      this.assert(optimized.reasoning.length > 0, 'Reasoning provided');
      return true;
    });
  }

  /**
   * Performance Tests
   */
  async testPerformance() {
    console.log('\n📋 PERFORMANCE Tests');
    console.log('-'.repeat(40));
    
    // Test initialization speed
    await this.test('Initialization Speed', async () => {
      const start = Date.now();
      
      const detector = new ServiceDetector();
      await detector.detectServices();
      
      const duration = Date.now() - start;
      
      this.assert(duration < 1000, `Fast init (${duration}ms)`);
      return true;
    });
    
    // Test routing speed
    await this.test('Routing Speed', async () => {
      const router = new LLMRouter();
      await router.initialize();
      
      const start = Date.now();
      
      await router.routeRequest({
        task: 'Speed test',
        level: 'minimal',
        content: 'Test'
      });
      
      const duration = Date.now() - start;
      
      this.assert(duration < 500, `Fast routing (${duration}ms)`);
      return true;
    });
  }

  /**
   * Test helper
   */
  async test(name, fn) {
    try {
      const result = await fn();
      if (result) {
        this.passed++;
        console.log(`  ✅ ${name}`);
      } else {
        this.failed++;
        console.log(`  ❌ ${name}`);
      }
    } catch (error) {
      this.failed++;
      console.log(`  ❌ ${name}: ${error.message}`);
    }
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Display results
   */
  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    
    const total = this.passed + this.failed + this.skipped;
    const passRate = total > 0 ? (this.passed / total * 100).toFixed(1) : 0;
    
    console.log(`\nTests Run: ${total}`);
    console.log(`Passed: ${this.passed} ✅`);
    console.log(`Failed: ${this.failed} ❌`);
    console.log(`Skipped: ${this.skipped} ⏭️`);
    console.log(`Pass Rate: ${passRate}%`);
    
    console.log('\n' + '='.repeat(60));
    
    if (this.failed === 0) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('Multi-LLM implementation is working correctly.\n');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('Please review the failures above.\n');
    }
  }
}

// Run tests
if (require.main === module) {
  // Clean environment
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ZEN_MCP_ENABLED;
  delete process.env.GOOGLE_AI_API_KEY;
  
  const suite = new MultiLLMTestSuite();
  
  suite.runAllTests()
    .then(() => {
      process.exit(suite.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = MultiLLMTestSuite;