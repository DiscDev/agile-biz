#!/usr/bin/env node

/**
 * End-to-End Test Suite for Multi-LLM Implementation
 * Tests the complete integration of all phases
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// Import all modules
const ServiceDetector = require('../service-detector');
const LLMRouter = require('../llm-router');
const FallbackManager = require('../fallback-manager');
const RoutingOptimizer = require('../routing-optimizer');
const DeepResearchIntegration = require('../deep-research-integration');
const ZenMCPIntegration = require('../zen-mcp-integration');
const ExternalAPIIntegration = require('../external-api-integration');

class E2ETestSuite {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      skipped: []
    };
    this.startTime = Date.now();
  }

  /**
   * Run all end-to-end tests
   */
  async runAllTests() {
    console.log('🚀 END-TO-END MULTI-LLM TEST SUITE\n');
    console.log('=' .repeat(60));
    console.log('Testing complete integration of all components\n');

    // Set up test environment
    await this.setupTestEnvironment();

    // Run test scenarios
    await this.testScenario1_ClaudeOnly();
    await this.testScenario2_HybridMode();
    await this.testScenario3_ZenEnabled();
    await this.testScenario4_DeepResearch();
    await this.testScenario5_FallbackCascade();
    await this.testScenario6_CostManagement();
    await this.testScenario7_ParallelExecution();
    await this.testScenario8_CommandIntegration();
    await this.testScenario9_MonitoringIntegration();
    await this.testScenario10_FullWorkflow();

    // Clean up
    await this.cleanupTestEnvironment();

    // Display results
    this.displayResults();
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    console.log('📦 Setting up test environment...\n');

    // Create test directories
    const testDirs = [
      'test-output',
      'test-output/logs',
      'test-output/results'
    ];

    for (const dir of testDirs) {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true });
    }

    // Set environment variables for testing
    process.env.MULTI_LLM_TEST_MODE = 'true';
    process.env.SIMULATE_EXTERNAL_APIS = 'true';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';

    console.log('✅ Test environment ready\n');
  }

  /**
   * Scenario 1: Claude-Only Mode
   */
  async testScenario1_ClaudeOnly() {
    console.log('\n📋 SCENARIO 1: Claude-Only Mode');
    console.log('-'.repeat(40));

    try {
      // Initialize with only Claude
      delete process.env.GOOGLE_AI_API_KEY;
      delete process.env.ZEN_MCP_ENABLED;

      const detector = new ServiceDetector();
      const services = await detector.detectServices();

      this.assert(services.services.claude === true, 'Claude detected');
      this.assert(services.strategy === 'claude_native', 'Claude-native strategy');

      // Test routing
      const router = new LLMRouter();
      await router.initialize();

      const result = await router.routeRequest({
        task: 'test',
        content: 'Claude-only test'
      });

      this.assert(result.success === true, 'Request routed successfully');
      this.assert(result.via === 'claude', 'Routed via Claude');

      this.results.passed.push('Scenario 1: Claude-Only Mode');
      console.log('✅ Claude-only mode working correctly');
    } catch (error) {
      this.results.failed.push(`Scenario 1: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 2: Hybrid Mode with External APIs
   */
  async testScenario2_HybridMode() {
    console.log('\n📋 SCENARIO 2: Hybrid Mode');
    console.log('-'.repeat(40));

    try {
      // Enable external APIs
      process.env.GOOGLE_AI_API_KEY = 'test-gemini-key';
      process.env.PERPLEXITY_API_KEY = 'test-perplexity-key';

      const detector = new ServiceDetector();
      const services = await detector.detectServices();

      this.assert(services.services.gemini === true, 'Gemini detected');
      this.assert(services.services.perplexity === true, 'Perplexity detected');
      this.assert(services.strategy === 'hybrid', 'Hybrid strategy');

      // Test routing to different models
      const router = new LLMRouter();
      await router.initialize();

      // Should route to Gemini for fast queries
      const fastResult = await router.routeRequest({
        task: 'quick-analysis',
        level: 'minimal',
        content: 'Fast query'
      });

      this.assert(fastResult.model.includes('gemini'), 'Routed to Gemini for speed');

      // Should route to Perplexity for research
      const researchResult = await router.routeRequest({
        task: 'research',
        content: 'Research query',
        options: { citations: true }
      });

      this.assert(researchResult.model.includes('perplexity'), 'Routed to Perplexity for research');

      this.results.passed.push('Scenario 2: Hybrid Mode');
      console.log('✅ Hybrid mode with multiple models working');
    } catch (error) {
      this.results.failed.push(`Scenario 2: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 3: Zen MCP Enabled
   */
  async testScenario3_ZenEnabled() {
    console.log('\n📋 SCENARIO 3: Zen MCP Integration');
    console.log('-'.repeat(40));

    try {
      // Enable Zen MCP
      process.env.ZEN_MCP_ENABLED = 'true';
      process.env.ZEN_MCP_ENDPOINT = 'http://localhost:8080';
      process.env.ZEN_MCP_API_KEY = 'test-zen-key';
      process.env.ZEN_MCP_SIMULATE = 'true';

      const zen = new ZenMCPIntegration();
      const result = await zen.initialize();

      this.assert(result.available === true, 'Zen MCP available');
      this.assert(result.models.length > 0, 'Models discovered via Zen');

      // Test unified routing
      const response = await zen.routeRequest({
        task: 'analysis',
        content: 'Test via Zen'
      });

      this.assert(response.success === true, 'Request routed via Zen');
      this.assert(response.model !== null, 'Model selected by Zen');

      this.results.passed.push('Scenario 3: Zen MCP Integration');
      console.log('✅ Zen MCP integration working');
    } catch (error) {
      this.results.failed.push(`Scenario 3: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 4: Deep Research Integration
   */
  async testScenario4_DeepResearch() {
    console.log('\n📋 SCENARIO 4: Deep Research');
    console.log('-'.repeat(40));

    try {
      process.env.PERPLEXITY_API_KEY = 'test-key';
      process.env.TAVILY_API_KEY = 'test-key';

      const research = new DeepResearchIntegration();
      await research.initialize();

      // Start research session
      const session = await research.startResearchSession('test topic');
      this.assert(session.id !== null, 'Research session created');

      // Perform deep research
      const results = await research.performDeepResearch('competitor analysis', {
        focus: 'competitive',
        depth: 'comprehensive'
      });

      this.assert(results.insights.length > 0, 'Insights generated');
      this.assert(results.citations.length > 0, 'Citations included');
      this.assert(results.confidence > 0, 'Confidence score calculated');

      this.results.passed.push('Scenario 4: Deep Research');
      console.log('✅ Deep research capabilities working');
    } catch (error) {
      this.results.failed.push(`Scenario 4: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 5: Fallback Cascade
   */
  async testScenario5_FallbackCascade() {
    console.log('\n📋 SCENARIO 5: Fallback Management');
    console.log('-'.repeat(40));

    try {
      const manager = new FallbackManager();
      await manager.initialize();

      // Register services
      manager.registerService('primary-service', {});
      manager.registerService('secondary-service', {});
      manager.registerService('claude-fallback', {});

      // Simulate primary failure
      const fallback1 = await manager.triggerFallback('primary-service', 'Simulated failure');
      this.assert(fallback1 !== null, 'First fallback triggered');

      // Simulate cascade
      const fallback2 = await manager.triggerFallback(fallback1, 'Secondary failure');
      this.assert(fallback2 !== null, 'Second fallback triggered');

      // Verify Claude is final fallback
      const chain = manager.getFallbackChain('gemini-1.5-pro');
      const lastFallback = chain[chain.length - 1];
      this.assert(lastFallback.includes('claude'), 'Claude is final fallback');

      this.results.passed.push('Scenario 5: Fallback Management');
      console.log('✅ Fallback cascade working correctly');
    } catch (error) {
      this.results.failed.push(`Scenario 5: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 6: Cost Management
   */
  async testScenario6_CostManagement() {
    console.log('\n📋 SCENARIO 6: Cost Management');
    console.log('-'.repeat(40));

    try {
      const manager = new FallbackManager();
      await manager.initialize();

      // Set cost limits
      manager.setCostLimits({
        session: 10,
        hourly: 5
      });

      // Track costs
      manager.trackCost(3, 'gpt-4');
      manager.trackCost(2, 'claude-opus');
      manager.trackCost(4, 'gemini-pro');

      const status = manager.getCostStatus();
      this.assert(status.current.session === 9, 'Cost tracking accurate');
      this.assert(status.percentage.session === '90', 'Percentage calculated');

      // Test cost limit enforcement
      let limitEnforced = false;
      manager.on('cost-limit-action', () => {
        limitEnforced = true;
      });

      manager.trackCost(2, 'expensive-model');
      this.assert(limitEnforced === true, 'Cost limit enforced');

      this.results.passed.push('Scenario 6: Cost Management');
      console.log('✅ Cost management working correctly');
    } catch (error) {
      this.results.failed.push(`Scenario 6: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 7: Parallel Execution
   */
  async testScenario7_ParallelExecution() {
    console.log('\n📋 SCENARIO 7: Parallel Execution');
    console.log('-'.repeat(40));

    try {
      // Enable multiple models
      process.env.GOOGLE_AI_API_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'test-key';

      const router = new LLMRouter();
      await router.initialize();

      // Execute parallel requests
      const start = Date.now();
      
      const requests = [
        router.routeRequest({ task: 'analysis1', content: 'Query 1' }),
        router.routeRequest({ task: 'analysis2', content: 'Query 2' }),
        router.routeRequest({ task: 'analysis3', content: 'Query 3' })
      ];

      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      this.assert(results.every(r => r.success), 'All parallel requests succeeded');
      this.assert(duration < 2000, `Parallel execution fast (${duration}ms)`);

      // Verify different models used
      const models = results.map(r => r.model);
      const uniqueModels = new Set(models);
      this.assert(uniqueModels.size > 1, 'Multiple models used in parallel');

      this.results.passed.push('Scenario 7: Parallel Execution');
      console.log('✅ Parallel execution working efficiently');
    } catch (error) {
      this.results.failed.push(`Scenario 7: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 8: Command Integration
   */
  async testScenario8_CommandIntegration() {
    console.log('\n📋 SCENARIO 8: Command Integration');
    console.log('-'.repeat(40));

    try {
      // Verify command files exist
      const commandsDir = path.join(__dirname, '..', '..', '.claude', 'commands');
      const commands = [
        'configure-models.md',
        'model-status.md',
        'research-boost.md'
      ];

      for (const cmd of commands) {
        const cmdPath = path.join(commandsDir, cmd);
        const exists = await fs.access(cmdPath)
          .then(() => true)
          .catch(() => false);
        
        this.assert(exists, `Command ${cmd} exists`);

        // Verify command structure
        const content = await fs.readFile(cmdPath, 'utf8');
        this.assert(content.includes('command:'), 'Has command metadata');
        this.assert(content.includes('description:'), 'Has description');
        this.assert(content.includes('## Usage'), 'Has usage section');
      }

      this.results.passed.push('Scenario 8: Command Integration');
      console.log('✅ Commands properly integrated');
    } catch (error) {
      this.results.failed.push(`Scenario 8: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 9: Monitoring Integration
   */
  async testScenario9_MonitoringIntegration() {
    console.log('\n📋 SCENARIO 9: Monitoring Integration');
    console.log('-'.repeat(40));

    try {
      // Check statusline updates
      const statuslineScript = path.join(__dirname, '..', '..', '..', '.claude', 'hooks', 'statusline.sh');
      const content = await fs.readFile(statuslineScript, 'utf8');
      
      this.assert(content.includes('model_status'), 'Statusline includes model status');
      this.assert(content.includes('cost_savings'), 'Statusline shows savings');

      // Check dashboard component
      const dashboardComponent = path.join(__dirname, '..', '..', 'dashboard', 'src', 'components', 'ModelMonitor.jsx');
      const componentExists = await fs.access(dashboardComponent)
        .then(() => true)
        .catch(() => false);
      
      this.assert(componentExists, 'Dashboard component created');

      // Check API endpoint
      const apiEndpoint = path.join(__dirname, '..', '..', 'dashboard', 'api', 'model-status.js');
      const apiExists = await fs.access(apiEndpoint)
        .then(() => true)
        .catch(() => false);
      
      this.assert(apiExists, 'Dashboard API endpoint created');

      this.results.passed.push('Scenario 9: Monitoring Integration');
      console.log('✅ Monitoring properly integrated');
    } catch (error) {
      this.results.failed.push(`Scenario 9: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Scenario 10: Full Workflow Integration
   */
  async testScenario10_FullWorkflow() {
    console.log('\n📋 SCENARIO 10: Full Workflow');
    console.log('-'.repeat(40));

    try {
      // Simulate complete workflow
      console.log('  Simulating complete research workflow...');

      // 1. Detect services
      const detector = new ServiceDetector();
      const services = await detector.detectServices();
      console.log(`  ✓ Detected ${Object.values(services.services).filter(s => s).length} services`);

      // 2. Initialize router
      const router = new LLMRouter();
      await router.initialize();
      console.log('  ✓ Router initialized');

      // 3. Initialize research
      const research = new DeepResearchIntegration();
      await research.initialize();
      console.log('  ✓ Deep research ready');

      // 4. Initialize fallback manager
      const manager = new FallbackManager();
      await manager.initialize();
      console.log('  ✓ Fallback manager ready');

      // 5. Execute parallel research
      const researchTasks = [
        router.routeRequest({ task: 'market-analysis', content: 'Market trends' }),
        router.routeRequest({ task: 'competitor-research', content: 'Competitors' }),
        router.routeRequest({ task: 'technical-feasibility', content: 'Technology' })
      ];

      const results = await Promise.all(researchTasks);
      console.log(`  ✓ Completed ${results.length} parallel tasks`);

      // 6. Track costs
      let totalCost = 0;
      for (const result of results) {
        if (result.cost) {
          manager.trackCost(result.cost, result.model);
          totalCost += result.cost;
        }
      }
      console.log(`  ✓ Total cost: $${totalCost.toFixed(2)}`);

      // 7. Generate status
      const status = {
        services_active: Object.values(services.services).filter(s => s).length,
        tasks_completed: results.length,
        total_cost: totalCost,
        success_rate: results.filter(r => r.success).length / results.length * 100
      };

      console.log(`  ✓ Success rate: ${status.success_rate}%`);

      this.assert(status.success_rate === 100, 'All tasks succeeded');
      this.assert(status.services_active > 0, 'Services active');

      this.results.passed.push('Scenario 10: Full Workflow');
      console.log('✅ Full workflow integration successful');
    } catch (error) {
      this.results.failed.push(`Scenario 10: ${error.message}`);
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  /**
   * Clean up test environment
   */
  async cleanupTestEnvironment() {
    console.log('\n📦 Cleaning up test environment...');

    // Remove test directories
    const testDir = path.join(__dirname, 'test-output');
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {
      // Directory may not exist
    }

    // Clear environment variables
    delete process.env.MULTI_LLM_TEST_MODE;
    delete process.env.SIMULATE_EXTERNAL_APIS;

    console.log('✅ Cleanup complete\n');
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
   * Display test results
   */
  displayResults() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 END-TO-END TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\nDuration: ${duration} seconds`);
    console.log(`Passed: ${this.results.passed.length} ✅`);
    console.log(`Failed: ${this.results.failed.length} ❌`);
    console.log(`Skipped: ${this.results.skipped.length} ⏭️`);
    
    if (this.results.passed.length > 0) {
      console.log('\n✅ Passed Tests:');
      this.results.passed.forEach(test => {
        console.log(`  • ${test}`);
      });
    }
    
    if (this.results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.failed.forEach(test => {
        console.log(`  • ${test}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed.length === 0) {
      console.log('🎉 ALL END-TO-END TESTS PASSED!');
      console.log('Multi-LLM implementation is fully functional.\n');
    } else {
      console.log('⚠️ SOME TESTS FAILED');
      console.log('Please review the failures above.\n');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const suite = new E2ETestSuite();
  
  suite.runAllTests()
    .then(() => {
      process.exit(suite.results.failed.length === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite crashed:', error);
      process.exit(1);
    });
}

module.exports = E2ETestSuite;