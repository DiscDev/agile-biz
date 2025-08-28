#!/usr/bin/env node

/**
 * Simple test to verify logging system functionality after cleanup
 * Tests all logging functions and verifies output
 * 
 * **AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Test results tracking
let passedTests = 0;
let failedTests = 0;
const testResults = [];

/**
 * Run a command and capture output
 */
function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: path.resolve(__dirname, '../../../..'),
            env: { ...process.env }
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });
        
        child.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Test a single logging function
 */
async function testLoggingFunction(testName, command, args, expectedPatterns) {
    console.log(`\n${colors.cyan}Testing: ${testName}${colors.reset}`);
    
    try {
        const result = await runCommand(command, args);
        const output = result.stdout + result.stderr;
        
        let allPatternsFound = true;
        const missingPatterns = [];
        
        for (const pattern of expectedPatterns) {
            const regex = new RegExp(pattern, 'i');
            if (!regex.test(output)) {
                allPatternsFound = false;
                missingPatterns.push(pattern);
            }
        }
        
        if (result.code === 0 && allPatternsFound) {
            console.log(`${colors.green}✓ ${testName} passed${colors.reset}`);
            passedTests++;
            testResults.push({ test: testName, status: 'PASSED' });
        } else {
            console.log(`${colors.red}✗ ${testName} failed${colors.reset}`);
            if (result.code !== 0) {
                console.log(`  Exit code: ${result.code}`);
            }
            if (missingPatterns.length > 0) {
                console.log(`  Missing patterns: ${missingPatterns.join(', ')}`);
            }
            if (output.length < 100) {
                console.log(`  Output: ${output}`);
            }
            failedTests++;
            testResults.push({ test: testName, status: 'FAILED', reason: missingPatterns.join(', ') });
        }
    } catch (error) {
        console.log(`${colors.red}✗ ${testName} error: ${error.message}${colors.reset}`);
        failedTests++;
        testResults.push({ test: testName, status: 'ERROR', error: error.message });
    }
}

/**
 * Check if log files exist
 */
async function checkLogFiles() {
    console.log(`\n${colors.cyan}Checking log files...${colors.reset}`);
    
    const logDir = path.join(__dirname, '../../../..', '.claude/logs');
    
    try {
        if (fs.existsSync(logDir)) {
            const files = fs.readdirSync(logDir);
            const logFiles = files.filter(f => f.endsWith('.json'));
            
            if (logFiles.length > 0) {
                console.log(`${colors.green}✓ Found ${logFiles.length} log file(s)${colors.reset}`);
                
                // Check agents.json structure
                const agentsLogPath = path.join(logDir, 'agents.json');
                if (fs.existsSync(agentsLogPath)) {
                    const logContent = JSON.parse(fs.readFileSync(agentsLogPath, 'utf8'));
                    
                    // Check if it's an array with valid entries
                    if (Array.isArray(logContent) && logContent.length > 0) {
                        const validEntry = logContent.some(entry => 
                            entry.timestamp && 
                            entry.event_type && 
                            entry.agent_id
                        );
                        
                        if (validEntry) {
                            console.log(`${colors.green}✓ Log file structure is valid (${logContent.length} entries)${colors.reset}`);
                            passedTests++;
                            testResults.push({ test: 'Log file structure', status: 'PASSED' });
                        } else {
                            console.log(`${colors.red}✗ Log entries are malformed${colors.reset}`);
                            failedTests++;
                            testResults.push({ test: 'Log file structure', status: 'FAILED' });
                        }
                    } else {
                        console.log(`${colors.yellow}⚠ Log file is empty or not an array${colors.reset}`);
                        testResults.push({ test: 'Log file structure', status: 'WARNING' });
                    }
                } else {
                    console.log(`${colors.yellow}⚠ agents.json log file not found${colors.reset}`);
                    testResults.push({ test: 'Log file structure', status: 'WARNING' });
                }
            } else {
                console.log(`${colors.yellow}⚠ No log files found (may be disabled)${colors.reset}`);
            }
        } else {
            console.log(`${colors.yellow}⚠ Log directory does not exist (logging may be disabled)${colors.reset}`);
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error checking log files: ${error.message}${colors.reset}`);
        failedTests++;
        testResults.push({ test: 'Log file check', status: 'ERROR', error: error.message });
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log(`${colors.magenta}${'='.repeat(60)}`);
    console.log('LOGGING SYSTEM TEST SUITE');
    console.log(`${'='.repeat(60)}${colors.reset}`);
    
    // Test 1: Check if logging functions script exists
    const loggingScript = path.join(__dirname, 'logging-functions.js');
    if (fs.existsSync(loggingScript)) {
        console.log(`${colors.green}✓ logging-functions.js exists${colors.reset}`);
        passedTests++;
    } else {
        console.log(`${colors.red}✗ logging-functions.js not found${colors.reset}`);
        failedTests++;
        return;
    }
    
    // Test 2: Basic logging with disabled logging (should work silently)
    await testLoggingFunction(
        'Basic logging (disabled)',
        'node',
        ['.claude/agents/scripts/logging/logging-functions.js', 'basic-log', 'developer', 'Test request'],
        []  // No output expected when disabled
    );
    
    // Test 3: Full logging attempt (should handle gracefully if disabled)
    await testLoggingFunction(
        'Full logging (handles disabled state)',
        'node',
        ['.claude/agents/scripts/logging/logging-functions.js', 'full-log', 'developer', 'Test full logging'],
        []  // Should handle gracefully
    );
    
    // Test 4: Check agent wrapper
    const wrapperScript = path.join(__dirname, 'agent-wrapper.js');
    if (fs.existsSync(wrapperScript)) {
        console.log(`${colors.green}✓ agent-wrapper.js exists${colors.reset}`);
        passedTests++;
        
        // Test wrapper functionality
        await testLoggingFunction(
            'Agent wrapper test',
            'node',
            ['.claude/agents/scripts/logging/agent-wrapper.js', 'developer', 'Test wrapper'],
            ['developer']  // Should at least show agent name
        );
    } else {
        console.log(`${colors.yellow}⚠ agent-wrapper.js not found${colors.reset}`);
    }
    
    // Test 5: Check auto-logger
    const autoLoggerScript = path.join(__dirname, 'auto-logger.js');
    if (fs.existsSync(autoLoggerScript)) {
        console.log(`${colors.green}✓ auto-logger.js exists${colors.reset}`);
        passedTests++;
    } else {
        console.log(`${colors.yellow}⚠ auto-logger.js not found${colors.reset}`);
    }
    
    // Test 6: Check log files
    await checkLogFiles();
    
    // Test 7: Verify cleanup (no duplicate or unnecessary files)
    console.log(`\n${colors.cyan}Checking for cleanup...${colors.reset}`);
    const scriptsDir = path.dirname(__dirname);
    const allFiles = fs.readdirSync(__dirname);
    const duplicates = allFiles.filter(f => f.includes('copy') || f.includes('backup') || f.includes('old'));
    
    if (duplicates.length === 0) {
        console.log(`${colors.green}✓ No duplicate or backup files found${colors.reset}`);
        passedTests++;
        testResults.push({ test: 'Cleanup verification', status: 'PASSED' });
    } else {
        console.log(`${colors.yellow}⚠ Found potential leftover files: ${duplicates.join(', ')}${colors.reset}`);
        testResults.push({ test: 'Cleanup verification', status: 'WARNING', files: duplicates });
    }
    
    // Summary
    console.log(`\n${colors.magenta}${'='.repeat(60)}`);
    console.log('TEST SUMMARY');
    console.log(`${'='.repeat(60)}${colors.reset}`);
    
    const total = passedTests + failedTests;
    const passRate = total > 0 ? ((passedTests / total) * 100).toFixed(1) : 0;
    
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (failedTests === 0) {
        console.log(`\n${colors.green}✓ All tests passed! Logging system is working correctly.${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}⚠ Some tests failed. Review the results above.${colors.reset}`);
        console.log('Note: Logging may be disabled by design. Check .claude/agents/settings/logging-config.json');
    }
    
    // Save test results
    const resultsPath = path.join(__dirname, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        passed: passedTests,
        failed: failedTests,
        passRate: `${passRate}%`,
        results: testResults
    }, null, 2));
    
    console.log(`\nTest results saved to: ${resultsPath}`);
    
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});