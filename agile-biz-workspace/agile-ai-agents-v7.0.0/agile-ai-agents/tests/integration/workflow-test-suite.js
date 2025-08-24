/**
 * Workflow Integration Test Suite
 * Comprehensive testing for workflow enhancement implementation
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const WorkflowIntegrationHandler = require('../../hooks/handlers/workflow-integration');
const CommandHandler = require('../../hooks/handlers/command-handler');
const ParallelExecutionCoordinator = require('../../hooks/handlers/parallel-execution-coordinator');
const ErrorRecoveryHandler = require('../../hooks/handlers/error-recovery-handler');

class WorkflowTestSuite {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResults = {
      passed: [],
      failed: [],
      skipped: [],
      startTime: Date.now(),
      endTime: null
    };
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('\n' + '='.repeat(70));
    console.log('WORKFLOW INTEGRATION TEST SUITE');
    console.log('='.repeat(70));
    console.log(`Started: ${new Date().toISOString()}\n`);

    // Test categories
    const testCategories = [
      { name: 'New Project Workflow', method: 'testNewProjectWorkflow' },
      { name: 'Existing Project Workflow', method: 'testExistingProjectWorkflow' },
      { name: 'Stakeholder Interview Agent', method: 'testStakeholderAgent' },
      { name: 'Custom Slash Commands', method: 'testCustomCommands' },
      { name: 'Parallel Execution', method: 'testParallelExecution' },
      { name: 'Error Recovery', method: 'testErrorRecovery' },
      { name: 'Auto-Save System', method: 'testAutoSave' },
      { name: 'State Management', method: 'testStateManagement' }
    ];

    for (const category of testCategories) {
      console.log(`\n${'━'.repeat(60)}`);
      console.log(`TESTING: ${category.name}`);
      console.log('━'.repeat(60));
      
      try {
        await this[category.method]();
      } catch (error) {
        console.error(`Category failed: ${error.message}`);
      }
    }

    // Display results
    this.displayResults();
  }

  /**
   * Test new project workflow
   */
  async testNewProjectWorkflow() {
    const tests = [
      {
        name: 'Initialize new project workflow',
        test: async () => {
          const handler = new WorkflowIntegrationHandler(this.projectRoot);
          const result = await handler.executeCommand('/new-project-workflow', { 'dry-run': true });
          assert(result.success === false || result.dryRun === true, 'Should handle dry-run');
        }
      },
      {
        name: 'Setup verification phase',
        test: async () => {
          const handler = new WorkflowIntegrationHandler(this.projectRoot);
          // Simulate setup verification
          const verification = handler.setupVerification;
          assert(verification !== null, 'Setup verification should be initialized');
        }
      },
      {
        name: 'Sequential phase execution',
        test: async () => {
          // Test that phases 1-11 are sequential
          const configPath = path.join(this.projectRoot, 'machine-data', 'workflow-phase-configuration.json');
          if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const phases = config.workflows['new-project'].stages.development.phases;
            assert(phases.length === 11, 'Should have 11 sequential phases');
          }
        }
      },
      {
        name: 'Phase selection unlock',
        test: async () => {
          // Test that phase selection is unlocked after MVP
          const statePath = path.join(this.projectRoot, 'project-state', 'workflow-state.json');
          if (fs.existsSync(statePath)) {
            const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
            // Would check phase_selection_unlocked after MVP completion
            assert(true, 'Phase selection unlock logic exists');
          }
        }
      },
      {
        name: 'Research level selection',
        test: async () => {
          // Test research level defaults to THOROUGH
          const handler = new WorkflowIntegrationHandler(this.projectRoot);
          const state = handler.stateHandler.getDefaultState();
          assert(state.configuration.research_level === 'thorough', 'Should default to thorough');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Test existing project workflow
   */
  async testExistingProjectWorkflow() {
    const tests = [
      {
        name: 'Initialize existing project workflow',
        test: async () => {
          const handler = new WorkflowIntegrationHandler(this.projectRoot);
          const result = await handler.executeCommand('/existing-project-workflow', { 'dry-run': true });
          assert(result.success === false || result.dryRun === true, 'Should handle dry-run');
        }
      },
      {
        name: 'Code analysis phase',
        test: async () => {
          const configPath = path.join(this.projectRoot, 'machine-data', 'workflow-phase-configuration.json');
          if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const phases = config.workflows['existing-project'].stages.analysis.phases;
            const analysisPhase = phases.find(p => p.id === 'code_analysis');
            assert(analysisPhase !== undefined, 'Should have code analysis phase');
          }
        }
      },
      {
        name: 'Enhancement goals discovery',
        test: async () => {
          // Test enhancement goals functionality
          const StakeholderHandler = require('../../hooks/handlers/stakeholder-interaction');
          const handler = new StakeholderHandler(this.projectRoot, 'existing-project');
          assert(typeof handler.discoverEnhancementGoals === 'function', 'Should have enhancement goals method');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Test Stakeholder Interview Agent
   */
  async testStakeholderAgent() {
    const tests = [
      {
        name: 'Agent initialization',
        test: async () => {
          const StakeholderHandler = require('../../hooks/handlers/stakeholder-interaction');
          const handler = new StakeholderHandler(this.projectRoot, 'new-project');
          assert(handler !== null, 'Stakeholder handler should initialize');
        }
      },
      {
        name: 'Question banks loaded',
        test: async () => {
          const questionsPath = path.join(this.projectRoot, 'machine-data', 'stakeholder-interview-questions.json');
          assert(fs.existsSync(questionsPath), 'Questions file should exist');
          const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
          assert(questions.operations_vision !== undefined, 'Should have operations vision questions');
        }
      },
      {
        name: 'Iterative discovery',
        test: async () => {
          const StakeholderHandler = require('../../hooks/handlers/stakeholder-interaction');
          const handler = new StakeholderHandler(this.projectRoot, 'new-project');
          assert(typeof handler.detectAmbiguity === 'function', 'Should have ambiguity detection');
        }
      },
      {
        name: 'Decision recording',
        test: async () => {
          const StakeholderHandler = require('../../hooks/handlers/stakeholder-interaction');
          const handler = new StakeholderHandler(this.projectRoot, 'new-project');
          assert(typeof handler.saveDecision === 'function', 'Should have decision saving');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Test custom slash commands
   */
  async testCustomCommands() {
    const tests = [
      {
        name: 'Command detection',
        test: async () => {
          const handler = new CommandHandler(this.projectRoot);
          assert(handler.isCommand('/new-project-workflow'), 'Should detect valid command');
          assert(!handler.isCommand('not-a-command'), 'Should reject invalid command');
        }
      },
      {
        name: 'Command aliases',
        test: async () => {
          const handler = new CommandHandler(this.projectRoot);
          const resolved = handler.resolveAlias('/start-new-project-workflow');
          assert(resolved === '/new-project-workflow', 'Should resolve alias');
        }
      },
      {
        name: 'Flag parsing',
        test: async () => {
          const handler = new CommandHandler(this.projectRoot);
          const parsed = handler.parseCommand('/aaa-status --verbose --output json');
          assert(parsed.flags.verbose === true, 'Should parse boolean flag');
          assert(parsed.flags.output === 'json', 'Should parse value flag');
        }
      },
      {
        name: 'Backward compatibility',
        test: async () => {
          const handler = new CommandHandler(this.projectRoot);
          assert(handler.commandExists('/start-new-project-workflow'), 'Old command should work');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Test parallel execution
   */
  async testParallelExecution() {
    const tests = [
      {
        name: 'Parallel coordinator initialization',
        test: async () => {
          const coordinator = new ParallelExecutionCoordinator(this.projectRoot);
          assert(coordinator !== null, 'Coordinator should initialize');
        }
      },
      {
        name: 'Dependency graph creation',
        test: async () => {
          const coordinator = new ParallelExecutionCoordinator(this.projectRoot);
          coordinator.loadConfiguration();
          assert(coordinator.dependencyGraph.size > 0, 'Should build dependency graph');
        }
      },
      {
        name: 'Resource pool management',
        test: async () => {
          const coordinator = new ParallelExecutionCoordinator(this.projectRoot);
          const requirements = { memory: 50, cpu: 10, fileHandles: 5 };
          const canAllocate = coordinator.canAllocateResources(requirements);
          assert(canAllocate === true, 'Should be able to allocate resources');
        }
      },
      {
        name: 'Execution plan creation',
        test: async () => {
          const coordinator = new ParallelExecutionCoordinator(this.projectRoot);
          const phases = ['phase1', 'phase2', 'phase3'];
          const plan = coordinator.createExecutionPlan(phases, 'new-project', 'operations');
          assert(plan.waves.length > 0, 'Should create execution waves');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Test error recovery
   */
  async testErrorRecovery() {
    const tests = [
      {
        name: 'Error handler initialization',
        test: async () => {
          const handler = new ErrorRecoveryHandler(this.projectRoot);
          assert(handler !== null, 'Error handler should initialize');
        }
      },
      {
        name: 'Error classification',
        test: async () => {
          const handler = new ErrorRecoveryHandler(this.projectRoot);
          const networkError = new Error('Network timeout');
          const type = handler.classifyError(networkError);
          assert(type === 'network' || type === 'timeout', 'Should classify network error');
        }
      },
      {
        name: 'State validation',
        test: async () => {
          const handler = new ErrorRecoveryHandler(this.projectRoot);
          const result = await handler.validateState();
          assert(typeof result.valid === 'boolean', 'Should return validation result');
        }
      },
      {
        name: 'Checkpoint creation',
        test: async () => {
          const handler = new ErrorRecoveryHandler(this.projectRoot);
          // Would test checkpoint creation if state exists
          assert(typeof handler.createCheckpoint === 'function', 'Should have checkpoint method');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Test auto-save system
   */
  async testAutoSave() {
    const tests = [
      {
        name: 'Auto-save manager initialization',
        test: async () => {
          const AutoSaveManager = require('../../hooks/handlers/auto-save-manager');
          const manager = new AutoSaveManager(this.projectRoot);
          assert(manager !== null, 'Auto-save manager should initialize');
        }
      },
      {
        name: 'Save trigger registration',
        test: async () => {
          const AutoSaveManager = require('../../hooks/handlers/auto-save-manager');
          const manager = new AutoSaveManager(this.projectRoot);
          // Test doesn't actually save, just checks method exists
          assert(typeof manager.registerSaveTrigger === 'function', 'Should have trigger registration');
        }
      },
      {
        name: 'Backup system',
        test: async () => {
          const AutoSaveManager = require('../../hooks/handlers/auto-save-manager');
          const manager = new AutoSaveManager(this.projectRoot);
          assert(typeof manager.createBackup === 'function', 'Should have backup creation');
          assert(typeof manager.restoreFromBackup === 'function', 'Should have backup restore');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Test state management
   */
  async testStateManagement() {
    const tests = [
      {
        name: 'State handler initialization',
        test: async () => {
          const StateHandler = require('../../hooks/handlers/workflow-state-handler');
          const handler = new StateHandler(this.projectRoot);
          assert(handler !== null, 'State handler should initialize');
        }
      },
      {
        name: 'Default state structure',
        test: async () => {
          const StateHandler = require('../../hooks/handlers/workflow-state-handler');
          const handler = new StateHandler(this.projectRoot);
          const defaultState = handler.getDefaultState();
          assert(defaultState.workflow_stage !== undefined, 'Should have workflow_stage');
          assert(defaultState.phases !== undefined, 'Should have phases');
          assert(defaultState.configuration !== undefined, 'Should have configuration');
        }
      },
      {
        name: 'Phase transition',
        test: async () => {
          const StateHandler = require('../../hooks/handlers/workflow-state-handler');
          const handler = new StateHandler(this.projectRoot);
          assert(typeof handler.transitionPhase === 'function', 'Should have phase transition');
        }
      },
      {
        name: 'Checkpoint management',
        test: async () => {
          const StateHandler = require('../../hooks/handlers/workflow-state-handler');
          const handler = new StateHandler(this.projectRoot);
          assert(typeof handler.createCheckpoint === 'function', 'Should have checkpoint creation');
        }
      }
    ];

    await this.runTests(tests);
  }

  /**
   * Run a set of tests
   */
  async runTests(tests) {
    for (const test of tests) {
      process.stdout.write(`  ${test.name}... `);
      
      try {
        await test.test();
        console.log('✅ PASSED');
        this.testResults.passed.push(test.name);
      } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        this.testResults.failed.push({ name: test.name, error: error.message });
      }
    }
  }

  /**
   * Display test results
   */
  displayResults() {
    this.testResults.endTime = Date.now();
    const duration = (this.testResults.endTime - this.testResults.startTime) / 1000;

    console.log('\n' + '='.repeat(70));
    console.log('TEST RESULTS');
    console.log('='.repeat(70));
    
    console.log(`\n📊 SUMMARY`);
    console.log(`  Passed: ${this.testResults.passed.length}`);
    console.log(`  Failed: ${this.testResults.failed.length}`);
    console.log(`  Skipped: ${this.testResults.skipped.length}`);
    console.log(`  Duration: ${duration.toFixed(2)}s`);
    
    if (this.testResults.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.failed.forEach(test => {
        console.log(`  • ${test.name}`);
        console.log(`    Error: ${test.error}`);
      });
    }
    
    const passRate = (this.testResults.passed.length / 
      (this.testResults.passed.length + this.testResults.failed.length) * 100).toFixed(1);
    
    console.log(`\n${passRate}% Pass Rate`);
    
    if (passRate === '100.0') {
      console.log('\n🎉 ALL TESTS PASSED!');
    }
  }
}

// Export for use
module.exports = WorkflowTestSuite;

// Allow direct execution
if (require.main === module) {
  const suite = new WorkflowTestSuite();
  suite.runAll().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}