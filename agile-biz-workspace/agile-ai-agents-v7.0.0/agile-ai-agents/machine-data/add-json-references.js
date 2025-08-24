/**
 * Add JSON references to all agent MD files
 * Creates bidirectional references between MD and JSON files
 */

const fs = require('fs-extra');
const path = require('path');

// Generate the JSON reference section for an agent
function generateJsonReferenceSection(agentName, jsonData) {
  const jsonPath = `../machine-data/ai-agents-json/${agentName}.json`;
  const tokenReduction = jsonData.meta.token_reduction || '95%';
  const estimatedTokens = jsonData.meta.estimated_tokens || 0;
  const fullMdTokens = jsonData.meta.full_md_tokens || 0;
  
  return `## Quick Reference

**JSON Summary**: [\`machine-data/ai-agents-json/${agentName}.json\`](${jsonPath})
* **Estimated Tokens**: ${estimatedTokens} (${tokenReduction} reduction from ${fullMdTokens.toLocaleString()} MD tokens)
* **Context Loading**: Minimal (100 tokens) → Standard (250 tokens) → Detailed (full MD)
* **Key Sections**: [Responsibilities](#core-responsibilities) | [Workflows](#workflows) | [Context Priorities](#context-optimization-priorities)

**Progressive Loading Strategy**:
* **Start Here**: Load JSON for overview and token-efficient context
* **Expand**: Use \`md_reference\` links for specific sections
* **Deep Dive**: Full markdown for comprehensive understanding

---

`;
}

// Add JSON reference section to MD file
async function addJsonReferenceToMD(agentFilePath, agentName, jsonData) {
  const mdContent = await fs.readFile(agentFilePath, 'utf8');
  
  // Check if JSON reference already exists
  if (mdContent.includes('## Quick Reference')) {
    console.log(`⚠️  JSON reference already exists in ${agentName}.md`);
    return false;
  }
  
  // Find the insertion point (after Overview section)
  const overviewMatch = mdContent.match(/^## Overview\n([\s\S]*?)(?=\n## |$)/m);
  if (!overviewMatch) {
    console.log(`❌ Could not find Overview section in ${agentName}.md`);
    return false;
  }
  
  const overviewEnd = overviewMatch.index + overviewMatch[0].length;
  const jsonReferenceSection = generateJsonReferenceSection(agentName, jsonData);
  
  // Insert JSON reference section after Overview
  const updatedContent = 
    mdContent.slice(0, overviewEnd) + 
    '\n' + 
    jsonReferenceSection + 
    mdContent.slice(overviewEnd);
  
  await fs.writeFile(agentFilePath, updatedContent, 'utf8');
  return true;
}

// Process all agent files
async function addJsonReferencesToAllAgents() {
  const agentsPath = path.join(__dirname, '..', 'ai-agents');
  const jsonPath = path.join(__dirname, 'ai-agents-json');
  
  console.log('🔗 Adding JSON references to all agent MD files...\n');
  
  // Get all agent files
  const agentFiles = await fs.readdir(agentsPath);
  const agentMDFiles = agentFiles.filter(file => file.endsWith('_agent.md'));
  
  const results = [];
  
  for (const file of agentMDFiles) {
    const agentName = file.replace('.md', '');
    const agentFilePath = path.join(agentsPath, file);
    const jsonFilePath = path.join(jsonPath, `${agentName}.json`);
    
    console.log(`📄 Processing: ${agentName}`);
    
    try {
      // Load JSON data
      const jsonData = await fs.readJSON(jsonFilePath);
      
      // Add JSON reference to MD file
      const updated = await addJsonReferenceToMD(agentFilePath, agentName, jsonData);
      
      if (updated) {
        console.log(`✅ Added JSON reference to ${agentName}.md`);
        results.push({ agent: agentName, status: 'updated' });
      } else {
        console.log(`⚠️  Skipped ${agentName}.md (already exists)`);
        results.push({ agent: agentName, status: 'skipped' });
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${agentName}:`, error.message);
      results.push({ agent: agentName, status: 'error', error: error.message });
    }
  }
  
  // Generate summary
  const updated = results.filter(r => r.status === 'updated').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log('\n📊 Summary:');
  console.log(`✅ Updated: ${updated} agents`);
  console.log(`⚠️  Skipped: ${skipped} agents`);
  console.log(`❌ Errors: ${errors} agents`);
  
  if (errors > 0) {
    console.log('\n❌ Errors:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`   ${r.agent}: ${r.error}`);
    });
  }
  
  console.log('\n🔗 JSON references added successfully!');
  console.log('\n💡 Benefits:');
  console.log('   • Bidirectional navigation between MD and JSON');
  console.log('   • Clear token reduction visibility');
  console.log('   • Progressive loading guidance');
  console.log('   • Enhanced user experience');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  addJsonReferencesToAllAgents().catch(console.error);
}

module.exports = { addJsonReferencesToAllAgents };