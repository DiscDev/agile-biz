#!/usr/bin/env node

/**
 * Remove placeholder sections from all agent MD files
 * 
 * This script removes duplicate sections that contain only placeholder text
 * like "*[This section needs to be documented]*" which interfere with
 * JSON extraction logic.
 */

const fs = require('fs').promises;
const path = require('path');

async function removePlaceholderSections() {
  const agentsPath = path.join(__dirname, '..', 'ai-agents');
  const files = await fs.readdir(agentsPath);
  const agentFiles = files.filter(file => file.endsWith('_agent.md'));
  
  console.log(`🧹 Removing placeholder sections from ${agentFiles.length} agent files...`);
  
  const results = [];
  
  for (const file of agentFiles) {
    const filePath = path.join(agentsPath, file);
    const agentName = file.replace('.md', '');
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let modifiedContent = content;
      let sectionsRemoved = 0;
      
      // Pattern to match placeholder sections
      const placeholderPattern = /\n## (Reference Documentation|Agent Coordination|Clear Boundaries|Success Metrics)\n\n?\*\[This section needs to be documented\]\*\n?/g;
      
      // Remove placeholder sections
      const matches = content.matchAll(placeholderPattern);
      for (const match of matches) {
        console.log(`  📝 ${agentName}: Removing placeholder "${match[1]}" section`);
        modifiedContent = modifiedContent.replace(match[0], '');
        sectionsRemoved++;
      }
      
      // Also remove any trailing placeholder sections at the end
      const trailingPattern = /\n## (Reference Documentation|Agent Coordination|Clear Boundaries|Success Metrics)\n\n?\*\[This section needs to be documented\]\*\s*$/g;
      const trailingMatches = modifiedContent.matchAll(trailingPattern);
      for (const match of trailingMatches) {
        console.log(`  📝 ${agentName}: Removing trailing placeholder "${match[1]}" section`);
        modifiedContent = modifiedContent.replace(match[0], '');
        sectionsRemoved++;
      }
      
      if (sectionsRemoved > 0) {
        await fs.writeFile(filePath, modifiedContent, 'utf8');
        results.push({
          agent: agentName,
          sectionsRemoved: sectionsRemoved,
          status: 'updated'
        });
        console.log(`✅ ${agentName}: Removed ${sectionsRemoved} placeholder sections`);
      } else {
        results.push({
          agent: agentName,
          sectionsRemoved: 0,
          status: 'no_changes'
        });
        console.log(`ℹ️  ${agentName}: No placeholder sections found`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${agentName}:`, error.message);
      results.push({
        agent: agentName,
        status: 'error',
        error: error.message
      });
    }
  }
  
  // Generate summary
  const updated = results.filter(r => r.status === 'updated');
  const noChanges = results.filter(r => r.status === 'no_changes');
  const errors = results.filter(r => r.status === 'error');
  const totalSectionsRemoved = updated.reduce((sum, r) => sum + r.sectionsRemoved, 0);
  
  console.log('\n📊 Summary:');
  console.log(`✅ Updated: ${updated.length} agents`);
  console.log(`ℹ️  No changes: ${noChanges.length} agents`);
  console.log(`❌ Errors: ${errors.length} agents`);
  console.log(`🗑️  Total sections removed: ${totalSectionsRemoved}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(r => {
      console.log(`   ${r.agent}: ${r.error}`);
    });
  }
  
  if (updated.length > 0) {
    console.log('\n📋 Updated agents:');
    updated.forEach(r => {
      console.log(`   ${r.agent}: ${r.sectionsRemoved} sections removed`);
    });
  }
  
  console.log('\n🎉 Placeholder section cleanup complete!');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  removePlaceholderSections().catch(console.error);
}

module.exports = { removePlaceholderSections };