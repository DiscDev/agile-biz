/**
 * Test script for the enhanced agent JSON generator
 * Tests on a subset of agents to validate functionality
 */

const { generateEnhancedAgentJSON } = require('./generate-enhanced-agent-json');
const fs = require('fs-extra');
const path = require('path');

// Test agents representing different categories
const testAgents = [
  'coder_agent.md',           // Development
  'analytics_growth_intelligence_agent.md', // Growth
  'finance_agent.md',         // Business
  'security_agent.md',        // Technical
  'customer_lifecycle_retention_agent.md' // Support
];

async function testEnhancedGenerator() {
  console.log('🧪 Testing Enhanced Agent JSON Generator\n');
  
  const agentsPath = path.join(__dirname, '..', 'ai-agents');
  const testOutputPath = path.join(__dirname, 'test-output');
  
  await fs.ensureDir(testOutputPath);
  
  const results = [];
  
  for (const agentFile of testAgents) {
    const agentName = agentFile.replace('.md', '');
    const mdFilePath = `agile-ai-agents/ai-agents/${agentFile}`;
    
    console.log(`\n📄 Testing: ${agentName}`);
    console.log('─'.repeat(50));
    
    try {
      // Read the markdown file
      const mdContent = await fs.readFile(path.join(agentsPath, agentFile), 'utf8');
      
      // Generate enhanced JSON
      const enhancedJSON = await generateEnhancedAgentJSON(agentName, mdContent, mdFilePath);
      
      // Save test output
      const testOutputFile = path.join(testOutputPath, `${agentName}.json`);
      await fs.writeJSON(testOutputFile, enhancedJSON, { spaces: 2 });
      
      // Analyze results
      const result = {
        agent: agentName,
        success: true,
        estimated_tokens: enhancedJSON.meta.estimated_tokens,
        full_md_tokens: enhancedJSON.meta.full_md_tokens,
        token_reduction: enhancedJSON.meta.token_reduction,
        sections_found: {
          github_formatting: !!enhancedJSON.github_formatting,
          context_optimization: !!enhancedJSON.context_optimization,
          core_responsibilities: !!enhancedJSON.core_responsibilities,
          workflows: enhancedJSON.workflows?.available?.length || 0,
          coordination: !!enhancedJSON.coordination,
          boundaries: !!enhancedJSON.boundaries,
          success_metrics: !!enhancedJSON.success_metrics,
          tools_integrations: !!enhancedJSON.tools_integrations
        }
      };
      
      results.push(result);
      
      // Display results
      console.log(`✅ Generation successful`);
      console.log(`📊 Token reduction: ${result.token_reduction}`);
      console.log(`📝 Tokens: ${result.estimated_tokens}/${result.full_md_tokens}`);
      console.log(`🏷️  GitHub formatting: ${result.sections_found.github_formatting ? '✅' : '❌'}`);
      console.log(`🔗 Context optimization: ${result.sections_found.context_optimization ? '✅' : '❌'}`);
      console.log(`📋 Core responsibilities: ${result.sections_found.core_responsibilities ? '✅' : '❌'}`);
      console.log(`⚙️  Workflows: ${result.sections_found.workflows}`);
      console.log(`🤝 Coordination: ${result.sections_found.coordination ? '✅' : '❌'}`);
      console.log(`🚫 Boundaries: ${result.sections_found.boundaries ? '✅' : '❌'}`);
      console.log(`🎯 Success metrics: ${result.sections_found.success_metrics ? '✅' : '❌'}`);
      console.log(`🛠️  Tools/integrations: ${result.sections_found.tools_integrations ? '✅' : '❌'}`);
      
      // Validate structure
      const structureValid = validateJSONStructure(enhancedJSON);
      console.log(`📋 Structure valid: ${structureValid ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      results.push({
        agent: agentName,
        success: false,
        error: error.message
      });
    }
  }
  
  // Generate summary report
  console.log('\n📊 Test Summary');
  console.log('═'.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length} agents`);
  console.log(`❌ Failed: ${failed.length}/${results.length} agents`);
  
  if (successful.length > 0) {
    const avgTokenReduction = successful.reduce((sum, r) => sum + parseFloat(r.token_reduction), 0) / successful.length;
    const avgTokens = successful.reduce((sum, r) => sum + r.estimated_tokens, 0) / successful.length;
    
    console.log(`\n📈 Performance Metrics:`);
    console.log(`   Average token reduction: ${avgTokenReduction.toFixed(1)}%`);
    console.log(`   Average JSON tokens: ${Math.round(avgTokens)}`);
    console.log(`   Token reduction target: 50%+ ${avgTokenReduction >= 50 ? '✅' : '❌'}`);
    
    console.log(`\n🏷️  Section Detection:`);
    const sectionStats = {
      github_formatting: successful.filter(r => r.sections_found.github_formatting).length,
      context_optimization: successful.filter(r => r.sections_found.context_optimization).length,
      core_responsibilities: successful.filter(r => r.sections_found.core_responsibilities).length,
      workflows: successful.filter(r => r.sections_found.workflows > 0).length,
      coordination: successful.filter(r => r.sections_found.coordination).length,
      boundaries: successful.filter(r => r.sections_found.boundaries).length,
      success_metrics: successful.filter(r => r.sections_found.success_metrics).length,
      tools_integrations: successful.filter(r => r.sections_found.tools_integrations).length
    };
    
    Object.entries(sectionStats).forEach(([section, count]) => {
      const percentage = (count / successful.length * 100).toFixed(0);
      console.log(`   ${section}: ${count}/${successful.length} (${percentage}%)`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed Agents:`);
    failed.forEach(r => {
      console.log(`   ${r.agent}: ${r.error}`);
    });
  }
  
  console.log('\n🧪 Test Complete!');
  console.log(`📁 Test output saved to: ${testOutputPath}`);
  
  return results;
}

// Validate JSON structure against expected schema
function validateJSONStructure(json) {
  const requiredFields = [
    'meta',
    'meta.agent',
    'meta.version',
    'meta.estimated_tokens',
    'meta.full_md_tokens',
    'meta.token_reduction',
    'summary',
    'context_recommendations',
    'context_recommendations.minimal',
    'context_recommendations.standard',
    'context_recommendations.detailed'
  ];
  
  for (const field of requiredFields) {
    if (!getNestedProperty(json, field)) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate md_reference format
  const mdReferenceFields = [
    'github_formatting.md_reference',
    'core_responsibilities.md_reference',
    'context_optimization.md_reference',
    'workflows.md_reference',
    'coordination.md_reference',
    'boundaries.md_reference',
    'success_metrics.md_reference'
  ];
  
  for (const field of mdReferenceFields) {
    const value = getNestedProperty(json, field);
    if (value && !value.includes('#')) {
      console.error(`❌ Invalid md_reference format: ${field} = ${value}`);
      return false;
    }
  }
  
  return true;
}

// Helper function to get nested object property
function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Run test if called directly
if (require.main === module) {
  testEnhancedGenerator().catch(console.error);
}

module.exports = { testEnhancedGenerator };