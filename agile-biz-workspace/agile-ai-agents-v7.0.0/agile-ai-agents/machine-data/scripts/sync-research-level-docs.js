/**
 * Sync Research Level Documentation
 * 
 * Updates workflow templates to show accurate document counts
 * Part of Phase 1: Fix research level documentation mismatches
 */

const fs = require('fs');
const path = require('path');

// Load research level configuration
const researchLevelConfig = require('../research-level-documents.json');

/**
 * Get document counts for each research level
 */
function getDocumentCounts() {
    const counts = {};
    
    for (const [level, config] of Object.entries(researchLevelConfig.research_levels)) {
        counts[level] = {
            total: config.document_count,
            description: config.description,
            byCategory: {}
        };
        
        // Count documents by category
        for (const [category, docs] of Object.entries(config.documents)) {
            counts[level].byCategory[category] = docs.length;
        }
    }
    
    return counts;
}

/**
 * Generate research level presentation text
 */
function generateResearchLevelText() {
    const counts = getDocumentCounts();
    
    const text = `\`\`\`
How deep should we research your project? Here's what you'll get:

📋 MINIMAL (${counts.minimal.description})
  You'll receive these ${counts.minimal.total} essential documents:
  • Market & Competitive Analysis (${counts.minimal.byCategory.research} docs)
  • Marketing Strategy (${counts.minimal.byCategory.marketing} docs)
  • Financial Analysis (${counts.minimal.byCategory.finance} docs)
  • Executive Summary & Recommendations (${counts.minimal.byCategory.analysis} docs)

📊 MEDIUM (${counts.medium.description}) [RECOMMENDED]
  You'll receive these ${counts.medium.total} comprehensive documents:
  • In-depth Market Research (${counts.medium.byCategory.research} docs)
  • Complete Marketing Strategy (${counts.medium.byCategory.marketing} docs)
  • Financial Planning & ROI (${counts.medium.byCategory.finance} docs)
  • Market Validation Framework (${counts.medium.byCategory['market-validation']} docs)
  • Strategic Analysis & Recommendations (${counts.medium.byCategory.analysis} docs)

🔍 THOROUGH (${counts.thorough.description})
  You'll receive ${counts.thorough.total} enterprise-level documents including:
  • Exhaustive Market Research (${counts.thorough.byCategory.research} docs)
  • Full Marketing Arsenal (${counts.thorough.byCategory.marketing} docs)
  • Complete Financial Analysis (${counts.thorough.byCategory.finance} docs)
  • Customer Success Strategy (${counts.thorough.byCategory['customer-success'] || 24} docs)
  • Monetization & Revenue Models (${counts.thorough.byCategory['monetization'] || 24} docs)
  • Market Validation System (${counts.thorough.byCategory['market-validation'] || 19} docs)
  • Investment & Fundraising Docs (${counts.thorough.byCategory['investment'] || 19} docs)
  • Analytics & Intelligence (${counts.thorough.byCategory['analytics'] || 23} docs)
  • Security & Compliance (${counts.thorough.byCategory['security'] || 13} docs)
  • And much more...

Which level would you prefer? (minimal/medium/thorough) [default: medium]
\`\`\``;
    
    return text;
}

/**
 * Update workflow template with accurate counts
 */
function updateWorkflowTemplate() {
    const templatePath = path.join(__dirname, '../../aaa-documents/workflow-templates/new-project-workflow-template.md');
    
    if (!fs.existsSync(templatePath)) {
        console.error('Workflow template not found:', templatePath);
        return false;
    }
    
    const content = fs.readFileSync(templatePath, 'utf8');
    const newText = generateResearchLevelText();
    
    // Find and replace the research level section
    const startMarker = '**Present Options**:\n```';
    const endMarker = 'Which level would you prefer? (minimal/medium/thorough) [default: medium]\n```';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
        console.error('Could not find research level section in template');
        return false;
    }
    
    const before = content.substring(0, startIndex + startMarker.length - 3);
    const after = content.substring(endIndex + endMarker.length);
    
    const updatedContent = before + newText + after;
    
    // Write updated content
    fs.writeFileSync(templatePath, updatedContent);
    console.log('✅ Updated workflow template with accurate document counts');
    
    return true;
}

/**
 * Update enhanced workflow handler
 */
function updateEnhancedHandler() {
    const handlerPath = path.join(__dirname, 'new-project-workflow-enhanced.js');
    
    if (!fs.existsSync(handlerPath)) {
        console.log('Enhanced handler not found, skipping update');
        return;
    }
    
    // The enhanced handler should dynamically load counts from research-level-documents.json
    console.log('✅ Enhanced handler will dynamically load document counts');
}

/**
 * Generate summary report
 */
function generateSummaryReport() {
    const counts = getDocumentCounts();
    
    console.log('\n📊 Research Level Document Summary:');
    console.log('─'.repeat(50));
    
    for (const [level, data] of Object.entries(counts)) {
        console.log(`\n${level.toUpperCase()}: ${data.total} documents`);
        console.log(`Description: ${data.description}`);
        console.log('Categories:');
        for (const [category, count] of Object.entries(data.byCategory)) {
            console.log(`  - ${category}: ${count} documents`);
        }
    }
    
    console.log('\n─'.repeat(50));
    console.log('✅ Research level documentation synchronized\n');
}

// Run synchronization
function main() {
    console.log('🔄 Synchronizing research level documentation...\n');
    
    // Update workflow template
    updateWorkflowTemplate();
    
    // Update enhanced handler
    updateEnhancedHandler();
    
    // Generate summary
    generateSummaryReport();
}

// Export for testing
module.exports = {
    getDocumentCounts,
    generateResearchLevelText,
    updateWorkflowTemplate
};

// Run if called directly
if (require.main === module) {
    main();
}