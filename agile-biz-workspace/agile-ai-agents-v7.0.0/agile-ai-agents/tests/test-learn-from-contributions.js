#!/usr/bin/env node

/**
 * Simple test runner for learn-from-contributions handler
 * Runs tests without requiring Jest installation
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the handler script
const HANDLER_PATH = path.join(__dirname, '../machine-data/scripts/learn-from-contributions-handler.js');

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
                throw new Error(`Expected to contain "${substring}" but didn't find it in:\n${actual.substring(0, 200)}...`);
            }
        },
        toMatch(pattern) {
            if (!pattern.test(actual)) {
                throw new Error(`Expected to match pattern ${pattern} but didn't`);
            }
        },
        not: {
            toContain(substring) {
                if (actual.includes(substring)) {
                    throw new Error(`Expected NOT to contain "${substring}" but found it`);
                }
            }
        }
    };
}

// Helper to run the handler
function runHandler(args = '') {
    try {
        const output = execSync(`node "${HANDLER_PATH}" ${args}`, {
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

// Start testing
console.log('\n🧪 Testing Learn From Contributions Handler\n');

// Test 1: Basic execution
test('should run without arguments (interactive mode)', () => {
    const result = runHandler();
    expect(result.success).toBe(true);
    expect(result.output).toContain('Learning Analysis Agent - Interactive Mode');
});

// Test 2: Help command
test('should show help with --help flag', () => {
    const result = runHandler('--help');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Usage: learn-from-contributions [option]');
    expect(result.output).toContain('--check-only');
    expect(result.output).toContain('--analyze');
    expect(result.output).toContain('--status');
});

// Test 3: Check-only command
test('should check for contributions with --check-only', () => {
    const result = runHandler('--check-only');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Contribution Status');
    expect(result.output).toMatch(/Total contributions found: \d+/);
    expect(result.output).toMatch(/New contributions: \d+/);
});

// Test 4: Examples exclusion
test('should exclude examples folder from contributions', () => {
    const result = runHandler('--check-only');
    expect(result.success).toBe(true);
    expect(result.output).not.toContain('2025-01-27-saas-dashboard-example');
});

// Test 5: Status command
test('should show comprehensive status with --status', () => {
    const result = runHandler('--status');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Learning Analysis Status');
    expect(result.output).toContain('Statistics:');
    expect(result.output).toContain('Archive Status:');
    expect(result.output).toContain('Readiness:');
});

// Test 6: Analyze command
test('should run analysis with --analyze', () => {
    const result = runHandler('--analyze');
    expect(result.success).toBe(true);
    
    // Should either find no new contributions or perform analysis
    const hasNoNew = result.output.includes('No new contributions to analyze');
    const hasAnalysis = result.output.includes('Starting Analysis...');
    
    if (!hasNoNew && !hasAnalysis) {
        throw new Error('Unexpected output from analyze command');
    }
});

// Test 7: Unknown option handling
test('should handle unknown options gracefully', () => {
    const result = runHandler('--unknown-option');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Unknown option: --unknown-option');
});

// Test 8: Archive detection
test('should detect archived contributions correctly', () => {
    const result = runHandler('--check-only');
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Previously analyzed: \d+/);
});

// Test 9: Readiness indicators
test('should show readiness indicator in status', () => {
    const result = runHandler('--status');
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/[✅🟡🔴]/);
});

// Test 10: Formatting consistency
test('should use consistent formatting across commands', () => {
    const checkResult = runHandler('--check-only');
    const statusResult = runHandler('--status');
    
    expect(checkResult.success).toBe(true);
    expect(statusResult.success).toBe(true);
    
    // Both should use the same formatting style
    expect(checkResult.output).toContain('━');
    expect(statusResult.output).toContain('━');
});

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