#!/usr/bin/env node

/**
 * Migration script to convert numbered folder references to category-based paths
 */

const fs = require('fs');
const path = require('path');

// Mapping from numbered folders to category-based paths
const FOLDER_MAPPING = {
    '00-orchestration': 'orchestration',
    '01-existing-project': 'business-strategy/existing-project',
    '01-existing-project-analysis': 'business-strategy/existing-project',
    '02-research': 'business-strategy/research',
    '03-marketing': 'business-strategy/marketing',
    '04-finance': 'business-strategy/finance',
    '04-business-documents': 'business-strategy/finance', // consolidating
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
    '30-logger': 'operations/monitoring' // consolidating with monitoring
};

function migrateDocument(inputPath, outputPath) {
    console.log(`📄 Migrating: ${inputPath} → ${outputPath}`);
    
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ File not found: ${inputPath}`);
        return false;
    }
    
    let content = fs.readFileSync(inputPath, 'utf8');
    let changeCount = 0;
    
    // Replace numbered folder references with category paths
    Object.keys(FOLDER_MAPPING).forEach(oldFolder => {
        const newPath = FOLDER_MAPPING[oldFolder];
        
        // Pattern to match folder references (with trailing slash)
        const pattern = new RegExp(`\\b${oldFolder}\\/`, 'g');
        const matches = content.match(pattern);
        
        if (matches) {
            changeCount += matches.length;
            content = content.replace(pattern, `${newPath}/`);
        }
    });
    
    // Write the migrated content
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Migrated with ${changeCount} folder reference updates`);
    
    return true;
}

function migrateOrchestrator() {
    const docsToMigrate = [
        {
            input: 'aaa-documents/auto-project-orchestrator.md',
            output: 'aaa-documents/auto-project-orchestrator-categories.md'
        },
        {
            input: 'ai-agent-coordination/orchestrator-workflows.md',
            output: 'ai-agent-coordination/orchestrator-workflows-categories.md'
        },
        {
            input: 'ai-agent-coordination/sprint-document-coordination.md',
            output: 'ai-agent-coordination/sprint-document-coordination-categories.md'
        },
        {
            input: 'ai-agent-coordination/validation-workflows.md',
            output: 'ai-agent-coordination/validation-workflows-categories.md'
        }
    ];
    
    console.log('🚀 Starting migration to category-based folder structure\n');
    
    docsToMigrate.forEach(doc => {
        const inputPath = path.join(__dirname, '../..', doc.input);
        const outputPath = path.join(__dirname, '../..', doc.output);
        migrateDocument(inputPath, outputPath);
        console.log('');
    });
    
    console.log('✅ Migration complete! New category-based documents created.');
    console.log('\n📋 Next steps:');
    console.log('1. Review the new -categories.md files');
    console.log('2. Test with npm run validate-categories');
    console.log('3. When ready, replace original files with migrated versions');
}

// Run migration if called directly
if (require.main === module) {
    migrateOrchestrator();
}

module.exports = { migrateDocument, FOLDER_MAPPING };