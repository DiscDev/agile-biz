#!/usr/bin/env node

/**
 * Folder Reference Validator
 * 
 * Validates that all folder references in documentation match the authoritative
 * project-folder-structure.json. Prevents the phase folder bug by catching
 * incorrect documentation before it causes system issues.
 * 
 * Based on community learning from brazil-project phase folder bug analysis.
 */

const fs = require('fs');
const path = require('path');

// Load authoritative folder structure
const STRUCTURE_FILE = path.join(__dirname, '../../machine-data/project-folder-structure.json');
const VALID_FOLDERS = new Set();

// Documents to validate
const DOCS_TO_VALIDATE = [
    'aaa-documents/auto-project-orchestrator.md',
    'ai-agent-coordination/orchestrator-workflows.md',
    'ai-agent-coordination/sprint-document-coordination.md',
    'ai-agent-coordination/validation-workflows.md'
];

// Folder reference pattern - only matches folder paths (ending with / or in specific contexts)
const FOLDER_REF_PATTERN = /(?:^|\s|`|│\s+├──\s+|│\s+└──\s+)(\d{2}-[a-z-]+)\/(?:\s|$|`)/gm;

function loadValidFolders() {
    try {
        const structure = JSON.parse(fs.readFileSync(STRUCTURE_FILE, 'utf8'));
        Object.keys(structure.folders).forEach(folder => {
            VALID_FOLDERS.add(folder);
            // Also add aliases
            if (structure.folders[folder].aliases) {
                structure.folders[folder].aliases.forEach(alias => {
                    VALID_FOLDERS.add(alias);
                });
            }
        });
        console.log(`✅ Loaded ${VALID_FOLDERS.size} valid folder references`);
    } catch (error) {
        console.error(`❌ Failed to load folder structure: ${error.message}`);
        process.exit(1);
    }
}

function validateDocument(docPath) {
    const fullPath = path.join(__dirname, '../..', docPath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Document not found: ${docPath}`);
        return { valid: true, violations: [] };
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const violations = [];
    let match;

    // Reset regex
    FOLDER_REF_PATTERN.lastIndex = 0;
    
    while ((match = FOLDER_REF_PATTERN.exec(content)) !== null) {
        const folderRef = match[1];
        
        if (!VALID_FOLDERS.has(folderRef)) {
            // Find line number
            const beforeMatch = content.substring(0, match.index);
            const lineNumber = beforeMatch.split('\n').length;
            
            violations.push({
                folder: folderRef,
                line: lineNumber,
                context: match[0].trim()
            });
        }
    }

    return {
        valid: violations.length === 0,
        violations
    };
}

function suggestCorrection(invalidFolder) {
    // Common corrections based on the brazil-project learning
    const corrections = {
        '16-customer-success': '06-customer-success',
        '17-analytics': '25-analytics',
        '18-market-validation': '05-market-validation',
        '19-email-marketing': '27-email-marketing',
        '02-marketing': '03-marketing',
        '01-research': '02-research',
        '03-finance': '04-finance',
        '04-analysis': '08-analysis',
        '05-requirements': '11-requirements',
        '06-llm-analysis': '12-llm-analysis',
        '07-api-analysis': '13-api-analysis',
        '08-mcp-analysis': '14-mcp-analysis',
        '09-project-planning': '18-project-planning',
        '10-environment': '19-environment',
        '11-design': '20-design',
        '12-seo': '15-seo',
        '13-implementation': '21-implementation',
        '14-testing': '22-testing',
        '15-deployment': '23-deployment',
        '16-launch': '24-launch'
    };

    return corrections[invalidFolder] || 'Check project-folder-structure.json';
}

function main() {
    console.log('🔍 Validating folder references against authoritative structure...\n');
    
    loadValidFolders();
    
    let hasViolations = false;
    let totalViolations = 0;

    DOCS_TO_VALIDATE.forEach(docPath => {
        console.log(`📄 Validating: ${docPath}`);
        const result = validateDocument(docPath);
        
        if (result.valid) {
            console.log(`   ✅ All folder references valid\n`);
        } else {
            hasViolations = true;
            totalViolations += result.violations.length;
            console.log(`   ❌ Found ${result.violations.length} violations:`);
            
            result.violations.forEach(violation => {
                const suggestion = suggestCorrection(violation.folder);
                console.log(`      Line ${violation.line}: "${violation.folder}" → Should be "${suggestion}"`);
            });
            console.log('');
        }
    });

    // Summary
    console.log('=' .repeat(60));
    if (hasViolations) {
        console.log(`❌ VALIDATION FAILED`);
        console.log(`   Found ${totalViolations} folder reference violations`);
        console.log(`   These violations could cause the phase folder bug!`);
        console.log(`\n🔧 To fix violations:`);
        console.log(`   1. Update folder references to match project-folder-structure.json`);
        console.log(`   2. Use the suggested corrections above`);
        console.log(`   3. Run this validator again to verify fixes`);
        process.exit(1);
    } else {
        console.log(`✅ VALIDATION PASSED`);
        console.log(`   All folder references match the authoritative structure`);
        console.log(`   No risk of phase folder bug from documentation`);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateDocument, loadValidFolders, suggestCorrection };