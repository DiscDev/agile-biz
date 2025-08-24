#!/usr/bin/env node

/**
 * Category-Based Folder Reference Validator
 * 
 * Validates folder references for the new category-based structure while
 * maintaining backward compatibility with numbered folders during migration.
 */

const fs = require('fs');
const path = require('path');

// Load both folder structures
const NUMBERED_STRUCTURE_FILE = path.join(__dirname, '../../machine-data/project-folder-structure.json');
const CATEGORY_STRUCTURE_FILE = path.join(__dirname, '../../machine-data/project-folder-structure-categories.json');
const VALID_NUMBERED_FOLDERS = new Set();
const VALID_CATEGORY_PATHS = new Set();

// Documents to validate - check for category versions first, fall back to original
const DOCS_TO_VALIDATE = [
    'aaa-documents/auto-project-orchestrator-categories.md',
    'ai-agent-coordination/orchestrator-workflows-categories.md',
    'ai-agent-coordination/sprint-document-coordination-categories.md',
    'ai-agent-coordination/validation-workflows-categories.md'
];

// Fallback to original files if category versions don't exist
const ORIGINAL_DOCS = [
    'aaa-documents/auto-project-orchestrator.md',
    'ai-agent-coordination/orchestrator-workflows.md',
    'ai-agent-coordination/sprint-document-coordination.md',
    'ai-agent-coordination/validation-workflows.md'
];

// Pattern for numbered folders
const NUMBERED_FOLDER_PATTERN = /(?:^|\s|`|│\s+├──\s+|│\s+└──\s+)(\d{2}-[a-z-]+)\/(?:\s|$|`)/gm;

// Pattern for category-based paths
const CATEGORY_PATH_PATTERN = /(?:^|\s|`|│\s+├──\s+|│\s+└──\s+)((?:orchestration|business-strategy|implementation|operations)\/[a-z-]+)\/(?:\s|$|`)/gm;

function loadNumberedFolders() {
    try {
        const structure = JSON.parse(fs.readFileSync(NUMBERED_STRUCTURE_FILE, 'utf8'));
        Object.keys(structure.folders).forEach(folder => {
            VALID_NUMBERED_FOLDERS.add(folder);
            if (structure.folders[folder].aliases) {
                structure.folders[folder].aliases.forEach(alias => {
                    VALID_NUMBERED_FOLDERS.add(alias);
                });
            }
        });
        console.log(`✅ Loaded ${VALID_NUMBERED_FOLDERS.size} numbered folder references`);
    } catch (error) {
        console.log(`⚠️  Numbered structure not found, using category-only validation`);
    }
}

function loadCategoryPaths() {
    try {
        const structure = JSON.parse(fs.readFileSync(CATEGORY_STRUCTURE_FILE, 'utf8'));
        
        // Build valid paths from category structure
        Object.keys(structure.categories).forEach(category => {
            const categoryData = structure.categories[category];
            
            // Add category root paths
            VALID_CATEGORY_PATHS.add(category);
            
            // Add folder paths within categories
            if (categoryData.folders) {
                Object.keys(categoryData.folders).forEach(folder => {
                    const fullPath = `${category}/${folder}`;
                    VALID_CATEGORY_PATHS.add(fullPath);
                    
                    // Also add aliases for migration support
                    const folderData = categoryData.folders[folder];
                    if (folderData.aliases) {
                        folderData.aliases.forEach(alias => {
                            VALID_NUMBERED_FOLDERS.add(alias);
                        });
                    }
                });
            }
        });
        
        console.log(`✅ Loaded ${VALID_CATEGORY_PATHS.size} category-based paths`);
    } catch (error) {
        console.error(`❌ Failed to load category structure: ${error.message}`);
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

    // Check numbered folder references
    NUMBERED_FOLDER_PATTERN.lastIndex = 0;
    while ((match = NUMBERED_FOLDER_PATTERN.exec(content)) !== null) {
        const folderRef = match[1];
        
        if (!VALID_NUMBERED_FOLDERS.has(folderRef)) {
            const beforeMatch = content.substring(0, match.index);
            const lineNumber = beforeMatch.split('\n').length;
            
            violations.push({
                type: 'numbered',
                folder: folderRef,
                line: lineNumber,
                context: match[0].trim()
            });
        }
    }

    // Check category-based path references
    CATEGORY_PATH_PATTERN.lastIndex = 0;
    while ((match = CATEGORY_PATH_PATTERN.exec(content)) !== null) {
        const pathRef = match[1];
        
        if (!VALID_CATEGORY_PATHS.has(pathRef)) {
            const beforeMatch = content.substring(0, match.index);
            const lineNumber = beforeMatch.split('\n').length;
            
            violations.push({
                type: 'category',
                folder: pathRef,
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

function suggestMigration(violation) {
    if (violation.type === 'numbered') {
        // Map numbered folders to category paths
        const numberToCategoryMap = {
            '01-existing-project': 'business-strategy/existing-project',
            '02-research': 'business-strategy/research',
            '03-marketing': 'business-strategy/marketing',
            '04-finance': 'business-strategy/finance',
            '05-market-validation': 'business-strategy/market-validation',
            '06-customer-success': 'business-strategy/customer-success',
            '07-monetization': 'business-strategy/monetization',
            '08-analysis': 'business-strategy/analysis',
            '09-investment': 'business-strategy/investment',
            '10-security': 'implementation/security',
            '11-requirements': 'implementation/requirements',
            '12-llm-analysis': 'implementation/llm-analysis',
            '13-api-analysis': 'implementation/api-analysis',
            '14-mcp-analysis': 'implementation/mcp-analysis',
            '15-seo': 'operations/seo',
            '16-tech-documentation': 'implementation/documentation',
            '17-monitoring': 'operations/monitoring',
            '18-project-planning': 'implementation/project-planning',
            '19-environment': 'implementation/environment',
            '20-design': 'implementation/design',
            '21-implementation': 'implementation/implementation',
            '22-testing': 'implementation/testing',
            '23-deployment': 'operations/deployment',
            '24-launch': 'operations/launch',
            '25-analytics': 'operations/analytics',
            '26-optimization': 'operations/optimization',
            '27-email-marketing': 'operations/crm-marketing',
            '28-media-buying': 'operations/media-buying',
            '29-social-media': 'operations/social-media',
            '00-orchestration': 'orchestration'
        };
        
        return numberToCategoryMap[violation.folder] || 'Check category structure';
    }
    
    return 'Check project-folder-structure-categories.json';
}

function main() {
    console.log('🔍 Validating folder references for category-based structure...\n');
    
    loadNumberedFolders();
    loadCategoryPaths();
    
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
                const suggestion = suggestMigration(violation);
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
        console.log(`\n🔧 Migration Tips:`);
        console.log(`   1. Update numbered folders to category-based paths`);
        console.log(`   2. Use format: category/folder (e.g., business-strategy/research)`);
        console.log(`   3. Run this validator again to verify fixes`);
        process.exit(1);
    } else {
        console.log(`✅ VALIDATION PASSED`);
        console.log(`   All folder references are valid`);
        console.log(`   Ready for category-based structure`);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateDocument, loadNumberedFolders, loadCategoryPaths, suggestMigration };