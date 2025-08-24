#!/usr/bin/env node

/**
 * Test runner for learn-from-contributions-workflow handler
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the new workflow handler
const HANDLER_PATH = path.join(__dirname, '../machine-data/scripts/learn-from-contributions-workflow-handler.js');
const STATE_PATH = path.join(__dirname, '../project-state/learning-workflow/current-workflow-state.json');

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Test helper functions
function test(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`${GREEN}✓${RESET} ${name}`);
    } catch (error) {
        failedTests++;
        console.log(`${RED}✗${RESET} ${name}`);
        console.log(`  ${RED}${error.message}${RESET}`);
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected} but got ${actual}`);
            }
        },
        toContain(substring) {
            if (!actual.includes(substring)) {
                throw new Error(`Expected to contain "${substring}" but didn't find it`);
            }
        },
        toMatch(pattern) {
            if (!pattern.test(actual)) {
                throw new Error(`Expected to match pattern ${pattern} but didn't`);
            }
        },
        toBeGreaterThan(value) {
            if (!(actual > value)) {
                throw new Error(`Expected ${actual} to be greater than ${value}`);
            }
        }
    };
}

// Helper to run the handler
function runHandler(args = '', input = '') {
    try {
        const output = execSync(`echo "${input}" | node "${HANDLER_PATH}" ${args}`, {
            encoding: 'utf-8',
            env: { ...process.env, NODE_ENV: 'test' }
        });
        return { success: true, output };
    } catch (error) {
        return { 
            success: false, 
            output: error.stdout || '', 
            error: error.stderr || error.message 
        };
    }
}

// Clean up any existing state
function cleanupState() {
    if (fs.existsSync(STATE_PATH)) {
        const stateDir = path.dirname(STATE_PATH);
        fs.rmSync(stateDir, { recursive: true, force: true });
    }
}

// Start testing
console.log('\n🧪 Testing Learn From Contributions Workflow Handler\n');

// Test 1: Help command
test('should show help with --help flag', () => {
    const result = runHandler('--help');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Learn From Contributions Workflow - Help');
    expect(result.output).toContain('Workflow Phases:');
    expect(result.output).toContain('1. Discovery');
    expect(result.output).toContain('7. Archive');
});

// Test 2: Discovery phase
test('should run discovery phase with --check-only', () => {
    const result = runHandler('--check-only');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Phase 1: Discovery');
    expect(result.output).toMatch(/Total contributions found: \d+/);
});

// Test 3: Status command
test('should show workflow status', () => {
    const result = runHandler('--status');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Learning Analysis Workflow Status');
    expect(result.output).toContain('Archive Status:');
});

// Test 4: Validation phase requires state
test('should require discovery before validation', () => {
    cleanupState(); // Ensure no state exists
    const result = runHandler('--validate', 'n\n'); // 'n' to skip override
    expect(result.success).toBe(true);
    expect(result.output).toContain('No contributions to validate');
});

// Test 5: Analysis phase requires validation
test('should require validation before analysis', () => {
    cleanupState();
    const result = runHandler('--analyze');
    expect(result.success).toBe(true);
    expect(result.output).toContain('No validated contributions to analyze');
});

// Test 6: Planning phase requires analysis
test('should require analysis before planning', () => {
    cleanupState();
    const result = runHandler('--plan');
    expect(result.success).toBe(true);
    expect(result.output).toContain('No analysis results found');
});

// Test 7: Approval phase requires plans
test('should require plans before approval', () => {
    cleanupState();
    const result = runHandler('--approve', '\n'); // Enter to close
    expect(result.success).toBe(true);
    expect(result.output).toContain('No plans found to approve');
});

// Test 8: Implementation phases require approval first
test('should require approvals before implementation', () => {
    cleanupState();
    const result = runHandler('--implement', '\n'); // Enter to close
    expect(result.success).toBe(true);
    expect(result.output).toContain('No approved plans to implement');
});

// Test 8b: Archive phase requires implementation first  
test('should require implementation before archive', () => {
    cleanupState();
    const result = runHandler('--archive', '\n'); // Enter to close
    expect(result.success).toBe(true);
    expect(result.output).toContain('No implementation results to archive');
});

// Test 8c: Resume requires existing workflow
test('should require workflow state for resume', () => {
    cleanupState();
    const result = runHandler('--resume', '\n');
    expect(result.success).toBe(true);
    expect(result.output).toContain('No workflow state found to resume');
});

// Test 8d: Rollback still not implemented
test('should show not implemented for rollback', () => {
    const result = runHandler('--rollback');
    expect(result.success).toBe(true);
    expect(result.output).toContain('not yet implemented');
});

// Test 9: Unknown options are handled
test('should handle unknown options gracefully', () => {
    const result = runHandler('--unknown-option');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Unknown option: --unknown-option');
});

// Test 10: Full workflow can be initiated
test('should start full workflow without arguments', () => {
    cleanupState();
    const result = runHandler('', 'n\n'); // 'n' to not resume
    expect(result.success).toBe(true);
    expect(result.output).toContain('Learn From Contributions Workflow');
    expect(result.output).toContain('7 phases');
});

// Test 11: State persistence works
test('should save and load workflow state', () => {
    cleanupState();
    
    // Run discovery to create state
    runHandler('--check-only');
    
    // Check state was created
    expect(fs.existsSync(path.dirname(STATE_PATH))).toBe(true);
    
    // Run status to verify state can be loaded
    const result = runHandler('--status');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Active Workflow:');
});

// Test 12: Archive detection includes new directories
test('should detect all archive directories', () => {
    const result = runHandler('--status');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Implemented patterns:');
    expect(result.output).toContain('Rejected patterns:');
    expect(result.output).toContain('Failed implementations:');
    expect(result.output).toContain('Partial implementations:');
});

// Clean up after tests
cleanupState();

// Print test summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results:`);
console.log(`   Total:  ${totalTests}`);
console.log(`   ${GREEN}Passed: ${passedTests}${RESET}`);
console.log(`   ${RED}Failed: ${failedTests}${RESET}`);

if (failedTests > 0) {
    console.log(`\n${RED}❌ Some tests failed!${RESET}`);
    process.exit(1);
} else {
    console.log(`\n${GREEN}✅ All tests passed!${RESET}`);
    process.exit(0);
}