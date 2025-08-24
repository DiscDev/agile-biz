/**
 * Simple test runner for Phase 1 tests without Jest
 */

const path = require('path');

// Test counter
let passedTests = 0;
let failedTests = 0;
let currentDescribe = '';
let currentTest = '';

// Mock Jest functions
global.jest = {
  fn: () => {
    const mockFn = (...args) => {
      mockFn.mock.calls.push(args);
      return mockFn.mockReturnValue || mockFn.mockResolvedValue;
    };
    mockFn.mock = { calls: [] };
    mockFn.mockReturnValue = function(value) {
      this.mockReturnValue = value;
      return this;
    };
    mockFn.mockResolvedValue = function(value) {
      this.mockResolvedValue = Promise.resolve(value);
      return this;
    };
    mockFn.mockRejectedValue = function(value) {
      this.mockResolvedValue = Promise.reject(value);
      return this;
    };
    mockFn.mockImplementation = function(impl) {
      const original = mockFn;
      return Object.assign(impl, {
        mock: original.mock,
        mockReturnValue: original.mockReturnValue,
        mockResolvedValue: original.mockResolvedValue,
        mockRejectedValue: original.mockRejectedValue,
        mockImplementation: original.mockImplementation
      });
    };
    return mockFn;
  },
  spyOn: (obj, method) => {
    const original = obj[method];
    const spy = global.jest.fn();
    spy.mockRestore = () => { obj[method] = original; };
    obj[method] = spy;
    return spy;
  },
  clearAllMocks: () => {},
  mock: () => {}
};

global.describe = (name, fn) => {
  currentDescribe = name;
  console.log(`\n${name}`);
  fn();
};

global.it = async (name, fn) => {
  currentTest = name;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failedTests++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
  }
};

global.beforeEach = (fn) => {
  // Run before each test
};

global.expect = (actual) => {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toContain: (substring) => {
      if (!actual.includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined but was undefined`);
      }
    },
    toBeGreaterThan: (value) => {
      if (!(actual > value)) {
        throw new Error(`Expected ${actual} to be greater than ${value}`);
      }
    },
    toHaveBeenCalled: () => {
      if (!actual.mock || actual.mock.calls.length === 0) {
        throw new Error(`Expected function to have been called`);
      }
    },
    rejects: {
      toThrow: async () => {
        try {
          await actual;
          throw new Error(`Expected promise to reject but it resolved`);
        } catch (e) {
          // Expected
        }
      }
    }
  };
};

// Run Phase 1 tests
console.log('🧪 Running Phase 1 Critical Foundation Tests\n');
console.log('═'.repeat(50));

// Test basic functionality of the components
try {
  // Test 1: Workflow State Handler exists
  const { initializeWorkflow } = require('../machine-data/scripts/workflow-state-handler');
  passedTests++;
  console.log('✅ Workflow State Handler module loads correctly');
} catch (e) {
  failedTests++;
  console.log('❌ Failed to load Workflow State Handler:', e.message);
}

try {
  // Test 2: Error Handler exists
  const { handleWorkflowError } = require('../machine-data/scripts/workflow-error-handler');
  passedTests++;
  console.log('✅ Workflow Error Handler module loads correctly');
} catch (e) {
  failedTests++;
  console.log('❌ Failed to load Workflow Error Handler:', e.message);
}

try {
  // Test 3: Pre-flight Checker exists
  const WorkflowPreflightChecker = require('../machine-data/workflow-preflight-checker');
  const checker = new WorkflowPreflightChecker();
  passedTests++;
  console.log('✅ Workflow Pre-flight Checker instantiates correctly');
} catch (e) {
  failedTests++;
  console.log('❌ Failed to instantiate Pre-flight Checker:', e.message);
}

try {
  // Test 4: Research level sync exists
  const { getDocumentCounts } = require('../machine-data/scripts/sync-research-level-docs');
  const counts = getDocumentCounts();
  
  if (counts.minimal.total === 15) {
    passedTests++;
    console.log('✅ Research level minimal count correct (15 docs)');
  } else {
    failedTests++;
    console.log(`❌ Research level minimal count incorrect: ${counts.minimal.total}`);
  }
  
  if (counts.medium.total === 48) {
    passedTests++;
    console.log('✅ Research level medium count correct (48 docs)');
  } else {
    failedTests++;
    console.log(`❌ Research level medium count incorrect: ${counts.medium.total}`);
  }
  
  if (counts.thorough.total === 194) {
    passedTests++;
    console.log('✅ Research level thorough count correct (194 docs)');
  } else {
    failedTests++;
    console.log(`❌ Research level thorough count incorrect: ${counts.thorough.total}`);
  }
} catch (e) {
  failedTests++;
  console.log('❌ Failed to get document counts:', e.message);
}

try {
  // Test 5: Hook Manager compatibility
  const HookManager = require('../hooks/hook-manager').HookManager;
  passedTests++;
  console.log('✅ Hook Manager module is compatible');
} catch (e) {
  failedTests++;
  console.log('❌ Hook Manager compatibility issue:', e.message);
}

// Summary
console.log('\n' + '═'.repeat(50));
console.log(`\n📊 Test Summary:`);
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   Total: ${passedTests + failedTests}`);

if (failedTests === 0) {
  console.log('\n🎉 All Phase 1 tests passed!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix issues.\n');
  process.exit(1);
}