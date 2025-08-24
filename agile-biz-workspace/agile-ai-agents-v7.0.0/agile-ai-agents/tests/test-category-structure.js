#!/usr/bin/env node

/**
 * Test script for category-based folder structure
 * Validates that the new structure works correctly
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_RESULTS = {
    passed: 0,
    failed: 0,
    tests: []
};

function test(name, fn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
        fn();
        TEST_RESULTS.passed++;
        TEST_RESULTS.tests.push({ name, status: 'PASSED' });
        console.log(`   ✅ PASSED`);
    } catch (error) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.tests.push({ name, status: 'FAILED', error: error.message });
        console.log(`   ❌ FAILED: ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// Tests
test('Category folders exist', () => {
    const categories = ['orchestration', 'business-strategy', 'implementation', 'operations'];
    categories.forEach(cat => {
        const catPath = path.join(__dirname, '..', 'project-documents', cat);
        assert(fs.existsSync(catPath), `Category folder missing: ${cat}`);
    });
});

test('Business strategy subfolders exist', () => {
    const subfolders = [
        'existing-project', 'research', 'marketing', 'finance',
        'market-validation', 'customer-success', 'monetization',
        'analysis', 'investment'
    ];
    subfolders.forEach(folder => {
        const folderPath = path.join(__dirname, '..', 'project-documents', 'business-strategy', folder);
        assert(fs.existsSync(folderPath), `Business strategy subfolder missing: ${folder}`);
    });
});

test('Implementation subfolders exist', () => {
    const subfolders = [
        'requirements', 'security', 'llm-analysis', 'api-analysis',
        'mcp-analysis', 'project-planning', 'environment', 'design',
        'implementation', 'testing', 'documentation'
    ];
    subfolders.forEach(folder => {
        const folderPath = path.join(__dirname, '..', 'project-documents', 'implementation', folder);
        assert(fs.existsSync(folderPath), `Implementation subfolder missing: ${folder}`);
    });
});

test('Operations subfolders exist', () => {
    const subfolders = [
        'deployment', 'launch', 'analytics', 'monitoring',
        'optimization', 'seo', 'crm-marketing', 'media-buying', 'social-media'
    ];
    subfolders.forEach(folder => {
        const folderPath = path.join(__dirname, '..', 'project-documents', 'operations', folder);
        assert(fs.existsSync(folderPath), `Operations subfolder missing: ${folder}`);
    });
});

test('Category structure JSON exists', () => {
    const structurePath = path.join(__dirname, '..', 'machine-data', 'project-folder-structure-categories.json');
    assert(fs.existsSync(structurePath), 'Category structure JSON missing');
    
    // Validate JSON is parseable
    const content = fs.readFileSync(structurePath, 'utf8');
    const structure = JSON.parse(content);
    assert(structure.structure_type === 'category-based', 'Structure type mismatch');
});

test('Migration script exists', () => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'bash', 'migrate-to-categories.js');
    assert(fs.existsSync(scriptPath), 'Migration script missing');
});

test('Category validator exists', () => {
    const validatorPath = path.join(__dirname, '..', 'scripts', 'bash', 'validate-folder-references-categories.js');
    assert(fs.existsSync(validatorPath), 'Category validator missing');
});

test('Migrated orchestrator documents exist', () => {
    const docs = [
        'aaa-documents/auto-project-orchestrator-categories.md',
        'ai-agent-coordination/orchestrator-workflows-categories.md',
        'ai-agent-coordination/sprint-document-coordination-categories.md',
        'ai-agent-coordination/validation-workflows-categories.md'
    ];
    docs.forEach(doc => {
        const docPath = path.join(__dirname, '..', doc);
        assert(fs.existsSync(docPath), `Migrated document missing: ${doc}`);
    });
});

test('Backup exists', () => {
    const today = new Date().toISOString().split('T')[0];
    const backupPath = path.join(__dirname, '..', 'machine-data', `project-folder-structure-backup-${today}.json`);
    assert(fs.existsSync(backupPath), 'Backup file missing');
});

test('NPM scripts updated', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(packageContent);
    
    assert(pkg.scripts['validate-categories'], 'validate-categories script missing');
    assert(pkg.scripts['validate-categories'].includes('validate-folder-references-categories.js'), 
           'validate-categories script incorrect');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`📊 TEST SUMMARY`);
console.log(`   ✅ Passed: ${TEST_RESULTS.passed}`);
console.log(`   ❌ Failed: ${TEST_RESULTS.failed}`);
console.log(`   📋 Total: ${TEST_RESULTS.tests.length}`);

if (TEST_RESULTS.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    TEST_RESULTS.tests.filter(t => t.status === 'FAILED').forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
    });
    process.exit(1);
} else {
    console.log('\n✅ ALL TESTS PASSED! Category structure is ready.');
}