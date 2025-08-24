#!/usr/bin/env node

/**
 * Hook Testing Utility
 * Tests individual hooks or all hooks with sample data
 */

const fs = require('fs');
const path = require('path');
const HookManager = require('./hook-manager');
const performanceMonitor = require('./utils/performance-monitor');

class HookTester {
  constructor() {
    this.testDataPath = path.join(__dirname, 'test-data');
    this.hookManager = HookManager;
  }

  async testHook(hookName, testData = null) {
    console.log(`\n🧪 Testing hook: ${hookName}`);
    console.log('=' .repeat(50));
    
    try {
      // Load test data if not provided
      if (!testData) {
        testData = this.loadTestData(hookName);
      }
      
      // Execute hook
      const result = await this.hookManager.executeHook(hookName, testData);
      
      // Display results
      console.log(`✅ Status: ${result.status}`);
      if (result.duration) {
        console.log(`⏱️  Duration: ${result.duration}ms`);
      }
      if (result.result) {
        console.log(`📤 Result:`, result.result);
      }
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  async testAllHooks() {
    const registry = this.loadRegistry();
    const results = {};
    
    console.log('\n🧪 Testing all registered hooks...\n');
    
    for (const [hookName, hookConfig] of Object.entries(registry.hooks)) {
      results[hookName] = await this.testHook(hookName);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }
    
    // Display summary
    this.displaySummary(results);
    
    return results;
  }

  loadTestData(hookName) {
    // Default test contexts for different hook types
    const testContexts = {
      'md-json-sync': {
        filePath: 'agile-ai-agents/project-documents/research/test-document.md',
        activeAgent: 'research_agent'
      },
      'json-cleanup': {
        filePath: 'agile-ai-agents/project-documents/research/deleted-document.md',
        activeAgent: 'document_manager'
      },
      'structure-validation': {
        filePath: 'frontend/components/TestComponent.jsx',
        activeAgent: 'coder_agent'
      },
      'sprint-tracking': {
        filePath: 'agile-ai-agents/project-documents/orchestration/sprints/sprint-2025-01-24-test/state.md',
        activeAgent: 'scrum_master',
        sprintPhase: 'active'
      },
      'command-validation': {
        prompt: '/start-new-project-workflow',
        activeAgent: 'project_analyzer'
      },
      'state-backup': {
        filePath: 'agile-ai-agents/project-state/current-state.json',
        activeAgent: 'project_state_manager'
      },
      'document-registry': {
        filePath: 'agile-ai-agents/project-documents/research/new-research.md',
        activeAgent: 'research_agent'
      },
      'security-scan': {
        prompt: 'Here is my API key: sk-1234567890abcdef',
        activeAgent: 'security_agent'
      },
      'agent-context': {
        prompt: 'Acting as the Coder Agent, implement the login feature',
        activeAgent: 'coder_agent'
      },
      'cost-monitor': {
        tokens: 15000,
        cost: 0.45,
        activeAgent: 'coder_agent'
      }
    };
    
    return testContexts[hookName] || { test: true };
  }

  loadRegistry() {
    const registryPath = path.join(__dirname, 'registry/hook-registry.json');
    return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }

  displaySummary(results) {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 Test Summary');
    console.log('=' .repeat(60));
    
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const [hookName, result] of Object.entries(results)) {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'skipped' ? '⏭️' : '❌';
      
      console.log(`${icon} ${hookName}: ${result.status}`);
      
      if (result.status === 'success') passed++;
      else if (result.status === 'skipped') skipped++;
      else failed++;
    }
    
    console.log('\n' + '-' .repeat(60));
    console.log(`Total: ${Object.keys(results).length} hooks`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log('-' .repeat(60));
    
    // Performance report
    const perfReport = performanceMonitor.generateReport();
    if (perfReport.topSlowest.length > 0) {
      console.log('\n⏱️  Performance Insights:');
      console.log(`Slowest hook: ${perfReport.topSlowest[0].name} (${perfReport.topSlowest[0].avgTime}ms)`);
      console.log(`Fastest hook: ${perfReport.topFastest[0].name} (${perfReport.topFastest[0].avgTime}ms)`);
    }
  }

  async testPerformance(hookName, iterations = 100) {
    console.log(`\n⚡ Performance testing ${hookName} (${iterations} iterations)...`);
    
    const testData = this.loadTestData(hookName);
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.hookManager.executeHook(hookName, testData);
      times.push(Date.now() - start);
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        process.stdout.write('.');
      }
    }
    
    console.log('\n');
    
    // Calculate statistics
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
    
    console.log(`📊 Performance Results:`);
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Min: ${min}ms`);
    console.log(`Max: ${max}ms`);
    console.log(`P95: ${p95}ms`);
    
    return { avg, min, max, p95 };
  }
}

// CLI interface
if (require.main === module) {
  const tester = new HookTester();
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'test':
      if (args[0]) {
        tester.testHook(args[0]);
      } else {
        tester.testAllHooks();
      }
      break;
      
    case 'perf':
      const hookName = args[0];
      const iterations = parseInt(args[1]) || 100;
      if (hookName) {
        tester.testPerformance(hookName, iterations);
      } else {
        console.error('Please specify a hook name for performance testing');
      }
      break;
      
    case 'list':
      const registry = tester.loadRegistry();
      console.log('\n📋 Registered Hooks:');
      Object.entries(registry.hooks).forEach(([name, config]) => {
        console.log(`\n${name}:`);
        console.log(`  Description: ${config.description}`);
        console.log(`  Priority: ${config.priority}`);
        console.log(`  Category: ${config.category}`);
        console.log(`  Triggers: ${config.triggers.join(', ')}`);
      });
      break;
      
    default:
      console.log('Hook Testing Utility');
      console.log('===================');
      console.log('\nUsage:');
      console.log('  node test-hooks.js test [hook-name]  - Test specific hook or all hooks');
      console.log('  node test-hooks.js perf <hook-name> [iterations] - Performance test');
      console.log('  node test-hooks.js list              - List all registered hooks');
      console.log('\nExamples:');
      console.log('  node test-hooks.js test md-json-sync');
      console.log('  node test-hooks.js test              # Test all hooks');
      console.log('  node test-hooks.js perf md-json-sync 1000');
  }
}

module.exports = HookTester;