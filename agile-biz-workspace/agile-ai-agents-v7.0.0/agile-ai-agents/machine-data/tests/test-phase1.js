#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Phase 1: Foundation
 * Tests Claude-native fallback guarantee and all Phase 1 components
 */

const ServiceDetector = require('../service-detector');
const LLMRouter = require('../llm-router');
const StartupValidator = require('../startup-validator');
const RoutingMessages = require('../routing-messages');
const fs = require('fs').promises;
const path = require('path');

class Phase1TestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  /**
   * Run all Phase 1 tests
   */
  async runAllTests() {
    console.log('🧪 PHASE 1 COMPREHENSIVE TEST SUITE\n');
    console.log('='.repeat(60));
    console.log('Testing: Claude-native fallback guarantee\n');

    // Test 1: Service Detection
    await this.testServiceDetection();
    
    // Test 2: Claude API Validation
    await this.testClaudeValidation();
    
    // Test 3: Fallback Chains
    await this.testFallbackChains();
    
    // Test 4: Routing with Claude-only
    await this.testClaudeOnlyRouting();
    
    // Test 5: Message System
    await this.testMessageSystem();
    
    // Test 6: Startup Validation
    await this.testStartupValidation();
    
    // Test 7: Configuration Updates
    await this.testConfigurationUpdates();
    
    // Test 8: State Persistence
    await this.testStatePersistence();
    
    // Display results
    this.displayResults();
  }

  /**
   * Test 1: Service Detection
   */
  async testServiceDetection() {
    console.log('\n📋 Test 1: Service Detection');
    console.log('-'.repeat(40));
    
    try {
      // Test with no API keys
      const detector1 = new ServiceDetector();
      process.env.ANTHROPIC_API_KEY = '';
      
      let errorCaught = false;
      try {
        await detector1.detectServices();
      } catch (error) {
        errorCaught = error.message.includes('Claude API key is required');
      }
      
      this.assert(
        'Should fail without Claude API key',
        errorCaught === true
      );
      
      // Test with Claude API key only
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      const detector2 = new ServiceDetector();
      const result = await detector2.detectServices();
      
      this.assert(
        'Should detect Claude as available',
        result.services.claude === true
      );
      
      this.assert(
        'Should use claude_native strategy',
        result.strategy === 'claude_native'
      );
      
      // Test with multiple services
      process.env.GOOGLE_AI_API_KEY = 'test-key';
      process.env.PERPLEXITY_API_KEY = 'test-key';
      const detector3 = new ServiceDetector();
      const result2 = await detector3.detectServices();
      
      this.assert(
        'Should detect hybrid strategy with external services',
        result2.strategy === 'hybrid'
      );
      
      // Clean up
      delete process.env.GOOGLE_AI_API_KEY;
      delete process.env.PERPLEXITY_API_KEY;
      
    } catch (error) {
      this.fail('Service Detection', error.message);
    }
  }

  /**
   * Test 2: Claude API Validation
   */
  async testClaudeValidation() {
    console.log('\n📋 Test 2: Claude API Validation');
    console.log('-'.repeat(40));
    
    try {
      const validator = new StartupValidator();
      
      // Test invalid key format
      process.env.ANTHROPIC_API_KEY = 'invalid-key';
      await validator.validateClaude();
      
      this.assert(
        'Should warn about invalid key format',
        validator.warnings.length > 0
      );
      
      // Test valid key format
      validator.warnings = [];
      process.env.ANTHROPIC_API_KEY = 'sk-ant-valid-test-key';
      await validator.validateClaude();
      
      this.assert(
        'Should accept valid key format',
        validator.warnings.length === 0
      );
      
      this.assert(
        'Should add Claude to info',
        validator.info.some(i => i.includes('Claude API'))
      );
      
    } catch (error) {
      this.fail('Claude API Validation', error.message);
    }
  }

  /**
   * Test 3: Fallback Chains
   */
  async testFallbackChains() {
    console.log('\n📋 Test 3: Fallback Chains');
    console.log('-'.repeat(40));
    
    try {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      const router = new LLMRouter();
      await router.initialize();
      
      // Test minimal level chain
      this.assert(
        'Minimal level should have fallback chain',
        router.fallbackChain.minimal.length > 0
      );
      
      // Test all chains end with Claude
      ['minimal', 'medium', 'thorough'].forEach(level => {
        const chain = router.fallbackChain[level];
        const lastModel = chain[chain.length - 1];
        
        this.assert(
          `${level} chain should end with Claude model`,
          lastModel.via === 'claude'
        );
      });
      
      // Test Claude-native strategy
      this.assert(
        'Should use claude_native strategy',
        router.strategy === 'claude_native'
      );
      
    } catch (error) {
      this.fail('Fallback Chains', error.message);
    }
  }

  /**
   * Test 4: Claude-Only Routing
   */
  async testClaudeOnlyRouting() {
    console.log('\n📋 Test 4: Claude-Only Routing');
    console.log('-'.repeat(40));
    
    try {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      const router = new LLMRouter();
      await router.initialize();
      
      // Test routing request
      const request = {
        task: 'Test Analysis',
        level: 'minimal',
        content: 'Test content'
      };
      
      const result = await router.routeRequest(request);
      
      this.assert(
        'Should successfully route request',
        result.success === true
      );
      
      this.assert(
        'Should use Claude model',
        result.via === 'claude'
      );
      
      this.assert(
        'Should track metrics',
        router.metrics.requests > 0
      );
      
    } catch (error) {
      this.fail('Claude-Only Routing', error.message);
    }
  }

  /**
   * Test 5: Message System
   */
  async testMessageSystem() {
    console.log('\n📋 Test 5: Message System');
    console.log('-'.repeat(40));
    
    try {
      const messages = new RoutingMessages();
      
      // Test verbosity levels
      messages.setVerbosity('quiet');
      const quietMsg = messages.getDetectionMessage(
        { claude: true },
        'claude_native'
      );
      
      this.assert(
        'Quiet mode should return minimal messages',
        quietMsg === null || quietMsg.length < 50
      );
      
      // Test normal verbosity
      messages.setVerbosity('normal');
      const normalMsg = messages.getDetectionMessage(
        { claude: true },
        'claude_native'
      );
      
      this.assert(
        'Normal mode should return formatted messages',
        normalMsg && normalMsg.includes('Claude-Only Mode')
      );
      
      // Test fallback messages
      const fallbackMsg = messages.getFallbackMessage(
        'gemini-1.5-pro',
        'claude-3-haiku',
        'unavailable'
      );
      
      this.assert(
        'Should format fallback messages',
        fallbackMsg.includes('Switching Models')
      );
      
    } catch (error) {
      this.fail('Message System', error.message);
    }
  }

  /**
   * Test 6: Startup Validation
   */
  async testStartupValidation() {
    console.log('\n📋 Test 6: Startup Validation');
    console.log('-'.repeat(40));
    
    try {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      const validator = new StartupValidator();
      
      const isValid = await validator.validate();
      
      this.assert(
        'Should validate successfully with Claude API',
        isValid === true
      );
      
      this.assert(
        'Should have no errors',
        validator.errors.length === 0
      );
      
      this.assert(
        'Should detect claude_native strategy',
        validator.routing.strategy === 'claude_native'
      );
      
    } catch (error) {
      this.fail('Startup Validation', error.message);
    }
  }

  /**
   * Test 7: Configuration Updates
   */
  async testConfigurationUpdates() {
    console.log('\n📋 Test 7: Configuration Updates');
    console.log('-'.repeat(40));
    
    try {
      const configPath = path.join(__dirname, '..', '..', 'CLAUDE-config.md');
      const configContent = await fs.readFile(configPath, 'utf-8');
      
      this.assert(
        'Config should have model_routing sections',
        configContent.includes('model_routing:')
      );
      
      this.assert(
        'Config should have zen_enabled routing',
        configContent.includes('zen_enabled:')
      );
      
      this.assert(
        'Config should have claude_native fallback',
        configContent.includes('claude_native:')
      );
      
      this.assert(
        'Config should have enhanced_duration',
        configContent.includes('enhanced_duration:')
      );
      
    } catch (error) {
      this.fail('Configuration Updates', error.message);
    }
  }

  /**
   * Test 8: State Persistence
   */
  async testStatePersistence() {
    console.log('\n📋 Test 8: State Persistence');
    console.log('-'.repeat(40));
    
    try {
      const statePath = path.join(__dirname, '..', '..', 'project-state');
      
      // Check if state files are created
      const routingState = path.join(statePath, 'model-routing-state.json');
      const serviceState = path.join(statePath, 'service-availability.json');
      
      // Initialize router to create state
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      const router = new LLMRouter();
      await router.initialize();
      
      const routingExists = await fs.access(routingState)
        .then(() => true)
        .catch(() => false);
      
      this.assert(
        'Should create routing state file',
        routingExists === true
      );
      
      // Read and validate state
      if (routingExists) {
        const state = JSON.parse(await fs.readFile(routingState, 'utf-8'));
        
        this.assert(
          'State should contain strategy',
          state.strategy === 'claude_native'
        );
        
        this.assert(
          'State should contain fallback chains',
          state.fallbackChains && state.fallbackChains.minimal
        );
      }
      
    } catch (error) {
      this.fail('State Persistence', error.message);
    }
  }

  /**
   * Assert helper
   */
  assert(description, condition) {
    if (condition) {
      this.pass(description);
    } else {
      this.fail(description, 'Assertion failed');
    }
  }

  /**
   * Record pass
   */
  pass(description) {
    this.passed++;
    this.results.push({
      status: 'PASS',
      description
    });
    console.log(`  ✅ ${description}`);
  }

  /**
   * Record failure
   */
  fail(description, error) {
    this.failed++;
    this.results.push({
      status: 'FAIL',
      description,
      error
    });
    console.log(`  ❌ ${description}`);
    console.log(`     Error: ${error}`);
  }

  /**
   * Display test results
   */
  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    
    const total = this.passed + this.failed;
    const passRate = total > 0 ? (this.passed / total * 100).toFixed(1) : 0;
    
    console.log(`\nTests Run: ${total}`);
    console.log(`Passed: ${this.passed} ✅`);
    console.log(`Failed: ${this.failed} ❌`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (this.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.description}`);
          console.log(`    ${r.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.failed === 0) {
      console.log('✅ ALL PHASE 1 TESTS PASSED!');
      console.log('Claude-native fallback guarantee is working correctly.\n');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('Please fix the issues above before proceeding.\n');
    }
  }
}

// Run tests
if (require.main === module) {
  const suite = new Phase1TestSuite();
  
  suite.runAllTests()
    .then(() => {
      process.exit(suite.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = Phase1TestSuite;