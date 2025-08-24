#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Existing Project Research Enhancement
 * Tests the integration of code analysis with market research
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  verbose: true,
  stopOnError: false,
  testResults: []
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test utilities
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testPassed(testName, details = '') {
  log(`✅ PASSED: ${testName}`, colors.green);
  if (details && config.verbose) {
    log(`   ${details}`, colors.cyan);
  }
  config.testResults.push({ test: testName, status: 'passed', details });
}

function testFailed(testName, error) {
  log(`❌ FAILED: ${testName}`, colors.red);
  log(`   Error: ${error}`, colors.yellow);
  config.testResults.push({ test: testName, status: 'failed', error });
  if (config.stopOnError) {
    process.exit(1);
  }
}

function testSkipped(testName, reason) {
  log(`⏭️  SKIPPED: ${testName}`, colors.yellow);
  log(`   Reason: ${reason}`, colors.cyan);
  config.testResults.push({ test: testName, status: 'skipped', reason });
}

// Test functions
function testFileExists(filePath, testName) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    testPassed(testName, `File exists at: ${filePath}`);
    return true;
  } else {
    testFailed(testName, `File not found: ${filePath}`);
    return false;
  }
}

function testFileContains(filePath, searchString, testName) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    testFailed(testName, `File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(searchString)) {
    testPassed(testName, `Found: "${searchString.substring(0, 50)}..."`);
    return true;
  } else {
    testFailed(testName, `String not found: "${searchString.substring(0, 50)}..."`);
    return false;
  }
}

function testJSONValid(filePath, testName) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    testFailed(testName, `File not found: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    JSON.parse(content);
    testPassed(testName, 'Valid JSON structure');
    return true;
  } catch (error) {
    testFailed(testName, `Invalid JSON: ${error.message}`);
    return false;
  }
}

function testJSONContainsKey(filePath, keyPath, testName) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    testFailed(testName, `File not found: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const json = JSON.parse(content);
    
    // Navigate through the key path
    const keys = keyPath.split('.');
    let current = json;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        testFailed(testName, `Key not found: ${keyPath}`);
        return false;
      }
    }
    
    testPassed(testName, `Key exists: ${keyPath}`);
    return true;
  } catch (error) {
    testFailed(testName, `Error checking JSON: ${error.message}`);
    return false;
  }
}

// Main test suite
async function runTests() {
  log('\n========================================', colors.blue);
  log('Existing Project Research Enhancement Tests', colors.blue);
  log('========================================\n', colors.blue);
  
  // Test 1: Workflow Template Updates
  log('\n📋 Testing Workflow Template Updates...', colors.cyan);
  
  testFileExists(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Existing project workflow template exists'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Phase 5: Market Validation & Competitive Research',
    'Phase 5 renamed to Market Validation'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Phase 5a: Usage Analytics Research',
    'Phase 5a added for usage analytics'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Phase 5b: Technical Debt vs Market Opportunity',
    'Phase 5b added for technical debt ROI'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Phase 5c: Pivot Feasibility Analysis',
    'Phase 5c added for pivot analysis'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Based on Research + Code Analysis',
    'Decision framework includes code analysis'
  );
  
  // Test 2: Code-Informed Research Template
  log('\n📋 Testing Code-Informed Research Template...', colors.cyan);
  
  testFileExists(
    'aaa-documents/workflow-templates/code-informed-research-template.md',
    'Code-informed research template created'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/code-informed-research-template.md',
    'Feature Validation Research',
    'Feature validation section exists'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/code-informed-research-template.md',
    'Technical Feasibility Layer',
    'Technical feasibility integration exists'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/code-informed-research-template.md',
    'Monetization Analysis Based on Costs',
    'Cost-based monetization analysis exists'
  );
  
  // Test 3: Research Level Documents
  log('\n📋 Testing Research Level Configuration...', colors.cyan);
  
  testJSONValid(
    'machine-data/research-level-documents.json',
    'Research level documents JSON is valid'
  );
  
  testJSONContainsKey(
    'machine-data/research-level-documents.json',
    'research_levels.existing_project_minimal',
    'Existing project minimal level added'
  );
  
  testJSONContainsKey(
    'machine-data/research-level-documents.json',
    'research_levels.existing_project_standard',
    'Existing project standard level added'
  );
  
  testJSONContainsKey(
    'machine-data/research-level-documents.json',
    'research_levels.existing_project_thorough',
    'Existing project thorough level added'
  );
  
  // Test 4: Research Configuration Document
  log('\n📋 Testing Research Configuration...', colors.cyan);
  
  testFileExists(
    'aaa-documents/existing-project-research-configuration.md',
    'Existing project research configuration created'
  );
  
  testFileContains(
    'aaa-documents/existing-project-research-configuration.md',
    'Code-First Research',
    'Code-first principle documented'
  );
  
  testFileContains(
    'aaa-documents/existing-project-research-configuration.md',
    'ROI-Driven Prioritization',
    'ROI prioritization documented'
  );
  
  testFileContains(
    'aaa-documents/existing-project-research-configuration.md',
    'Validation Outcomes',
    'Validation decision framework documented'
  );
  
  // Test 5: Agent Enhancements
  log('\n📋 Testing Agent Enhancements...', colors.cyan);
  
  testFileContains(
    'ai-agents/research_agent.md',
    'Code-Informed Research for Existing Projects',
    'Research Agent enhanced for existing projects'
  );
  
  testFileContains(
    'ai-agents/research_agent.md',
    'Feature Validation Report',
    'Feature validation capability added'
  );
  
  testFileContains(
    'ai-agents/research_agent.md',
    'Technical Debt ROI Analysis',
    'Technical debt ROI capability added'
  );
  
  // Test 6: Integration Tests
  log('\n🔗 Testing Integration Points...', colors.cyan);
  
  // Test workflow template references code analysis
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'code analysis insights',
    'Workflow integrates code analysis'
  );
  
  // Test research levels reference existing projects
  const researchLevelPath = path.join(__dirname, '..', 'machine-data/research-level-documents.json');
  if (fs.existsSync(researchLevelPath)) {
    const researchLevels = JSON.parse(fs.readFileSync(researchLevelPath, 'utf8'));
    
    if (researchLevels.research_levels.existing_project_minimal &&
        researchLevels.research_levels.existing_project_minimal.document_count > 0) {
      testPassed('Existing project research levels properly configured', 
                 `Found ${researchLevels.research_levels.existing_project_minimal.document_count} minimal docs`);
    } else {
      testFailed('Existing project research levels configuration', 
                 'Document count not properly set');
    }
  }
  
  // Test 7: Validation Tests
  log('\n✅ Testing Validation Logic...', colors.cyan);
  
  // Test that Phase 6 references research results
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Enhancement Planning (Informed by Research)',
    'Phase 6 is informed by research'
  );
  
  // Test decision framework exists
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Option 1: Validation Success',
    'Validation success path exists'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Option 2: Partial Validation',
    'Partial validation path exists'
  );
  
  testFileContains(
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'Option 3: Market Mismatch',
    'Market mismatch path exists'
  );
  
  // Test 8: Document Structure Tests
  log('\n📄 Testing Document Structure...', colors.cyan);
  
  // Check for consistent structure in templates
  const templateFiles = [
    'aaa-documents/workflow-templates/existing-project-workflow-template.md',
    'aaa-documents/workflow-templates/code-informed-research-template.md',
    'aaa-documents/existing-project-research-configuration.md'
  ];
  
  templateFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      // Check for proper markdown headers
      const hasTitle = lines.some(line => line.startsWith('# '));
      const hasOverview = lines.some(line => line.includes('## Overview'));
      
      if (hasTitle && hasOverview) {
        testPassed(`Document structure valid: ${path.basename(file)}`, 
                   'Has title and overview sections');
      } else {
        testFailed(`Document structure: ${path.basename(file)}`, 
                   'Missing required sections');
      }
    }
  });
  
  // Generate summary
  log('\n========================================', colors.blue);
  log('Test Summary', colors.blue);
  log('========================================\n', colors.blue);
  
  const passed = config.testResults.filter(r => r.status === 'passed').length;
  const failed = config.testResults.filter(r => r.status === 'failed').length;
  const skipped = config.testResults.filter(r => r.status === 'skipped').length;
  const total = config.testResults.length;
  
  log(`Total Tests: ${total}`, colors.cyan);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  log(`Skipped: ${skipped}`, colors.yellow);
  
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? colors.green : colors.red);
  
  if (failed > 0) {
    log('\n❌ Failed Tests:', colors.red);
    config.testResults
      .filter(r => r.status === 'failed')
      .forEach(r => log(`  - ${r.test}: ${r.error}`, colors.yellow));
  }
  
  // Return exit code
  return failed === 0 ? 0 : 1;
}

// Run tests
runTests().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  log(`\n💥 Test suite error: ${error.message}`, colors.red);
  process.exit(1);
});