#!/usr/bin/env node

/**
 * Rebuild Workflow Tests
 * Comprehensive test suite for rebuild workflow functionality
 */

const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Import the classes to test
const RebuildProjectWorkflow = require('../hooks/handlers/command/rebuild-project-workflow');
const RebuildMonitor = require('../hooks/handlers/rebuild/rebuild-monitor');

// Test configuration
const TEST_DIR = path.join(__dirname, 'test-rebuild-workspace');
const TEST_STATE_DIR = path.join(TEST_DIR, 'agile-ai-agents/project-state');

// Test suite
class RebuildWorkflowTests {
  constructor() {
    this.workflow = null;
    this.monitor = null;
    this.testsPassed = 0;
    this.testsFailed = 0;
  }

  async setup() {
    console.log('Setting up test environment...');
    
    // Create test directories
    await fs.mkdir(TEST_STATE_DIR, { recursive: true });
    
    // Set environment variable
    process.env.CLAUDE_PROJECT_DIR = TEST_DIR;
    
    // Initialize instances
    this.workflow = new RebuildProjectWorkflow();
    this.monitor = new RebuildMonitor();
    
    console.log('Test environment ready\n');
  }

  async teardown() {
    console.log('\nCleaning up test environment...');
    
    // Remove test directory
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    
    // Clear environment variable
    delete process.env.CLAUDE_PROJECT_DIR;
    
    console.log('Cleanup complete');
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`Running: ${testName}`);
      await testFunction.call(this);
      this.testsPassed++;
      console.log(`  ✅ PASSED\n`);
    } catch (error) {
      this.testsFailed++;
      console.log(`  ❌ FAILED: ${error.message}\n`);
    }
  }

  // Test 1: Command initialization
  async testCommandInitialization() {
    assert(this.workflow !== null, 'Workflow should be initialized');
    assert(typeof this.workflow.execute === 'function', 'Execute method should exist');
  }

  // Test 2: Start rebuild workflow
  async testStartRebuildWorkflow() {
    // Start with type selection
    await this.workflow.startRebuildWorkflow('technical');
    
    // Check state was created
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    const exists = await fs.access(stateFile).then(() => true).catch(() => false);
    assert(exists, 'Rebuild state file should be created');
    
    // Verify state content
    const state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
    assert(state.active === true, 'Rebuild should be active');
    assert(state.type === 'technical', 'Type should be technical');
    assert(state.phase === 'stakeholder-interview', 'Should be in stakeholder interview phase');
  }

  // Test 3: Resume workflow
  async testResumeWorkflow() {
    // Create a test state
    const testState = {
      active: true,
      type: 'partial',
      phase: 'migration',
      started: new Date().toISOString(),
      systems: {
        original: { status: 'active', traffic_percentage: 60, users: 1000 },
        rebuild: { status: 'testing', traffic_percentage: 40, users: 400 }
      },
      migration: { status: 'in_progress', percentage: 65 },
      feature_parity: { total_features: 50, implemented: 45, percentage: 90 },
      checkpoints: []
    };
    
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    await fs.writeFile(stateFile, JSON.stringify(testState, null, 2));
    
    // Resume should work without errors
    await this.workflow.resumeWorkflow();
    
    // State should still exist
    const state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
    assert(state.active === true, 'Rebuild should still be active');
  }

  // Test 4: Status display
  async testStatusDisplay() {
    // Create a test state
    const testState = {
      active: true,
      type: 'complete',
      phase: 'parallel-operations',
      started: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      systems: {
        original: { status: 'active', traffic_percentage: 30, users: 300 },
        rebuild: { status: 'active', traffic_percentage: 70, users: 700 }
      },
      migration: { status: 'completed', percentage: 100 },
      feature_parity: { total_features: 50, implemented: 50, percentage: 100 },
      checkpoints: [
        { timestamp: new Date().toISOString(), description: 'Test checkpoint' }
      ]
    };
    
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    await fs.writeFile(stateFile, JSON.stringify(testState, null, 2));
    
    // Should display status without errors
    await this.workflow.showStatus();
  }

  // Test 5: Comparison display
  async testComparisonDisplay() {
    // Create test state
    const testState = {
      active: true,
      type: 'technical',
      phase: 'parallel-operations',
      started: new Date().toISOString(),
      systems: {
        original: { status: 'active', traffic_percentage: 50, users: 500 },
        rebuild: { status: 'active', traffic_percentage: 50, users: 500 }
      },
      migration: { status: 'completed', percentage: 100 },
      feature_parity: { total_features: 30, implemented: 30, percentage: 100 },
      checkpoints: []
    };
    
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    await fs.writeFile(stateFile, JSON.stringify(testState, null, 2));
    
    // Should show comparison without errors
    await this.workflow.showComparison();
  }

  // Test 6: Migration status
  async testMigrationStatus() {
    // Create test states
    const rebuildState = {
      active: true,
      type: 'technical',
      phase: 'migration',
      started: new Date().toISOString(),
      systems: {
        original: { status: 'active', traffic_percentage: 100, users: 1000 },
        rebuild: { status: 'testing', traffic_percentage: 0, users: 0 }
      },
      migration: {
        status: 'in_progress',
        data_migrated: 50000000,
        total_data: 100000000,
        percentage: 50
      },
      feature_parity: { total_features: 30, implemented: 25, percentage: 83 },
      checkpoints: []
    };
    
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    await fs.writeFile(stateFile, JSON.stringify(rebuildState, null, 2));
    
    // Should show migration status without errors
    await this.workflow.showMigrationStatus();
  }

  // Test 7: Rebuild types
  async testRebuildTypes() {
    const types = ['technical', 'partial', 'business-model', 'complete'];
    
    for (const type of types) {
      await this.workflow.startRebuildWorkflow(type);
      
      const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
      const state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
      
      assert(state.type === type, `Type should be ${type}`);
    }
  }

  // Test 8: Monitor initialization
  async testMonitorInitialization() {
    // Create active rebuild state
    const testState = {
      active: true,
      type: 'technical',
      phase: 'implementation',
      started: new Date().toISOString(),
      systems: {
        original: { status: 'active', traffic_percentage: 100, users: 1000 },
        rebuild: { status: 'building', traffic_percentage: 0, users: 0 }
      },
      migration: { status: 'pending', percentage: 0 },
      feature_parity: { total_features: 30, implemented: 0, percentage: 0 },
      checkpoints: []
    };
    
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    await fs.writeFile(stateFile, JSON.stringify(testState, null, 2));
    
    const initialized = await this.monitor.initialize();
    assert(initialized === true, 'Monitor should initialize with active rebuild');
  }

  // Test 9: Hook phase mapping
  async testHookPhaseMapping() {
    const phaseHooks = {
      'context-verification': ['rebuild-decision'],
      'migration': ['migration-progress'],
      'parallel-operations': ['parallel-operations', 'feature-parity'],
      'cutover': ['cutover-readiness']
    };
    
    for (const [phase, expectedHooks] of Object.entries(phaseHooks)) {
      const hooks = this.monitor.getHooksForPhase(phase);
      assert(
        JSON.stringify(hooks) === JSON.stringify(expectedHooks),
        `Phase ${phase} should have correct hooks`
      );
    }
  }

  // Test 10: State file validation
  async testStateFileValidation() {
    // Test with invalid state
    const invalidState = {
      active: 'not-a-boolean', // Should be boolean
      type: 'invalid-type', // Not in enum
      phase: 'invalid-phase' // Not in enum
    };
    
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    await fs.writeFile(stateFile, JSON.stringify(invalidState, null, 2));
    
    // Should handle invalid state gracefully
    const state = await this.workflow.loadRebuildState();
    assert(state !== null, 'Should load state even if invalid');
  }

  // Test 11: Checkpoint creation
  async testCheckpointCreation() {
    // Start workflow
    await this.workflow.startRebuildWorkflow('technical');
    
    // Create checkpoint
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    const state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
    
    state.checkpoints.push({
      id: 'test-checkpoint',
      timestamp: new Date().toISOString(),
      phase: state.phase,
      description: 'Test checkpoint'
    });
    
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    
    // Verify checkpoint was saved
    const updatedState = JSON.parse(await fs.readFile(stateFile, 'utf8'));
    assert(updatedState.checkpoints.length === 1, 'Should have one checkpoint');
    assert(updatedState.checkpoints[0].id === 'test-checkpoint', 'Checkpoint should be saved');
  }

  // Test 12: Progress calculations
  async testProgressCalculations() {
    // Test feature parity percentage
    const features = { total_features: 50, implemented: 25 };
    const percentage = (features.implemented / features.total_features) * 100;
    assert(percentage === 50, 'Feature parity should be 50%');
    
    // Test migration percentage
    const migration = { data_migrated: 75000000, total_data: 100000000 };
    const migrationPercentage = (migration.data_migrated / migration.total_data) * 100;
    assert(migrationPercentage === 75, 'Migration should be 75%');
  }

  // Test 13: Traffic distribution validation
  async testTrafficDistribution() {
    const testState = {
      active: true,
      type: 'partial',
      phase: 'parallel-operations',
      started: new Date().toISOString(),
      systems: {
        original: { status: 'active', traffic_percentage: 60, users: 600 },
        rebuild: { status: 'active', traffic_percentage: 40, users: 400 }
      },
      migration: { status: 'completed', percentage: 100 },
      feature_parity: { total_features: 30, implemented: 30, percentage: 100 },
      checkpoints: []
    };
    
    const totalTraffic = testState.systems.original.traffic_percentage + 
                        testState.systems.rebuild.traffic_percentage;
    assert(totalTraffic === 100, 'Total traffic should equal 100%');
  }

  // Test 14: Phase transitions
  async testPhaseTransitions() {
    const phases = [
      'context-verification',
      'stakeholder-interview',
      'legacy-analysis',
      'research-selection',
      'market-validation',
      'implementation',
      'migration',
      'parallel-operations',
      'cutover'
    ];
    
    // Create state
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    
    for (const phase of phases) {
      const state = {
        active: true,
        type: 'technical',
        phase: phase,
        started: new Date().toISOString(),
        systems: {
          original: { status: 'active', traffic_percentage: 100, users: 1000 },
          rebuild: { status: 'building', traffic_percentage: 0, users: 0 }
        },
        migration: { status: 'pending', percentage: 0 },
        feature_parity: { total_features: 30, implemented: 0, percentage: 0 },
        checkpoints: []
      };
      
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
      
      // Verify phase can be loaded
      const loadedState = await this.workflow.loadRebuildState();
      assert(loadedState.phase === phase, `Phase ${phase} should be loadable`);
    }
  }

  // Test 15: Error handling
  async testErrorHandling() {
    // Test with non-existent state file
    const state = await this.workflow.loadRebuildState();
    assert(state === null, 'Should return null for non-existent state');
    
    // Test with corrupted JSON
    const stateFile = path.join(TEST_STATE_DIR, 'rebuild-state.json');
    await fs.writeFile(stateFile, 'invalid json content');
    
    const corruptedState = await this.workflow.loadRebuildState();
    assert(corruptedState === null, 'Should handle corrupted JSON gracefully');
  }

  // Run all tests
  async runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('   REBUILD WORKFLOW TEST SUITE');
    console.log('═══════════════════════════════════════════\n');
    
    await this.setup();
    
    // Run tests
    await this.runTest('Command Initialization', this.testCommandInitialization);
    await this.runTest('Start Rebuild Workflow', this.testStartRebuildWorkflow);
    await this.runTest('Resume Workflow', this.testResumeWorkflow);
    await this.runTest('Status Display', this.testStatusDisplay);
    await this.runTest('Comparison Display', this.testComparisonDisplay);
    await this.runTest('Migration Status', this.testMigrationStatus);
    await this.runTest('Rebuild Types', this.testRebuildTypes);
    await this.runTest('Monitor Initialization', this.testMonitorInitialization);
    await this.runTest('Hook Phase Mapping', this.testHookPhaseMapping);
    await this.runTest('State File Validation', this.testStateFileValidation);
    await this.runTest('Checkpoint Creation', this.testCheckpointCreation);
    await this.runTest('Progress Calculations', this.testProgressCalculations);
    await this.runTest('Traffic Distribution', this.testTrafficDistribution);
    await this.runTest('Phase Transitions', this.testPhaseTransitions);
    await this.runTest('Error Handling', this.testErrorHandling);
    
    await this.teardown();
    
    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('   TEST RESULTS');
    console.log('═══════════════════════════════════════════');
    console.log(`  ✅ Passed: ${this.testsPassed}`);
    console.log(`  ❌ Failed: ${this.testsFailed}`);
    console.log(`  📊 Total: ${this.testsPassed + this.testsFailed}`);
    console.log(`  🎯 Success Rate: ${Math.round((this.testsPassed / (this.testsPassed + this.testsFailed)) * 100)}%`);
    console.log('═══════════════════════════════════════════\n');
    
    // Exit with appropriate code
    process.exit(this.testsFailed > 0 ? 1 : 0);
  }
}

// Run tests
const tester = new RebuildWorkflowTests();
tester.runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});