/**
 * Generate JSON files for AI agents based on their markdown specifications
 * This is what the Document Manager Agent would run
 */

const fs = require('fs-extra');
const path = require('path');

// Agent JSON generator
async function generateAgentJSON(agentName, mdContent) {
  // Extract context priorities from markdown
  const contextMatch = mdContent.match(/## Context Optimization Priorities[\s\S]*?(?=##|$)/);
  const contextPriorities = {};
  
  if (contextMatch) {
    // Parse "From [Agent]" sections
    const fromMatches = contextMatch[0].matchAll(/#### From (.+?)\n\*\*Critical Data\*\*[^:]*:\n([\s\S]*?)(?=\*\*Optional Data\*\*)/g);
    
    for (const match of fromMatches) {
      const fromAgent = match[1].toLowerCase().replace(/ /g, '_');
      const criticalItems = match[2].match(/- `(.+?)`/g) || [];
      
      contextPriorities[fromAgent] = {
        critical: criticalItems.map(item => item.match(/`(.+?)`/)[1]),
        optional: []
      };
      
      // Get optional data
      const optionalMatch = contextMatch[0].match(new RegExp(`From ${match[1]}[\\s\\S]*?\\*\\*Optional Data\\*\\*[^:]*:\\n([\\s\\S]*?)(?=####|###|$)`));
      if (optionalMatch) {
        const optionalItems = optionalMatch[1].match(/- `(.+?)`/g) || [];
        contextPriorities[fromAgent].optional = optionalItems.map(item => item.match(/`(.+?)`/)[1]);
      }
    }
  }
  
  // Extract capabilities from Core Responsibilities
  const capabilities = [];
  const respMatch = mdContent.match(/## Core Responsibilities[\s\S]*?(?=##|$)/);
  if (respMatch) {
    const items = respMatch[0].match(/\*\*[^*]+\*\*/g) || [];
    capabilities.push(...items.slice(0, 5).map(item => 
      item.replace(/\*\*/g, '').toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')
    ));
  }
  
  // Extract workflows
  const workflows = {};
  const workflowMatch = mdContent.match(/## Workflows[\s\S]*?(?=##|$)/);
  if (workflowMatch) {
    const workflowSections = workflowMatch[0].match(/### \d+\. (.+?)\n/g) || [];
    workflowSections.forEach(section => {
      const name = section.match(/### \d+\. (.+?)\n/)[1];
      workflows[name.toLowerCase().replace(/ /g, '_')] = {
        description: name,
        steps: []
      };
    });
  }
  
  return {
    meta: {
      agent: agentName,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: `ai-agents/${agentName}.md`
    },
    summary: extractSummary(mdContent),
    capabilities: capabilities,
    context_priorities: contextPriorities,
    workflows: workflows,
    output_schema: `schemas/${agentName}-output.schema.json`,
    streaming_events: getStreamingEvents(agentName),
    dependencies: getDependencies(agentName)
  };
}

// Extract summary from Overview section
function extractSummary(content) {
  const overviewMatch = content.match(/## Overview\n(.+?)(?=\n##|\n\n)/);
  if (overviewMatch) {
    return overviewMatch[1].trim();
  }
  return "AI agent specialist";
}

// Get streaming events based on agent type
function getStreamingEvents(agentName) {
  const streamingAgents = {
    'testing_agent': ['test_started', 'test_failed', 'test_passed', 'suite_completed'],
    'coder_agent': ['module_started', 'module_completed', 'error_found'],
    'project_manager_agent': ['sprint_started', 'task_assigned', 'milestone_reached'],
    'logger_agent': ['log_entry', 'error_logged', 'metric_recorded']
  };
  
  return streamingAgents[agentName] || [];
}

// Get agent dependencies
function getDependencies(agentName) {
  const dependencies = {
    'prd_agent': {
      required_before: ['research_agent', 'finance_agent', 'marketing_agent'],
      provides_to: ['ui_ux_agent', 'coder_agent', 'project_manager_agent']
    },
    'coder_agent': {
      required_before: ['prd_agent', 'ui_ux_agent'],
      provides_to: ['testing_agent', 'devops_agent', 'documentation_agent']
    },
    'testing_agent': {
      required_before: ['coder_agent'],
      provides_to: ['devops_agent', 'project_manager_agent']
    }
  };
  
  return dependencies[agentName] || { required_before: [], provides_to: [] };
}

// Main function to generate all agent JSONs
async function generateAllAgentJSONs() {
  const agentsPath = path.join(__dirname, '..', 'ai-agents');
  const outputPath = path.join(__dirname, 'ai-agents-json');
  
  // Ensure output directory exists
  await fs.ensureDir(outputPath);
  
  // Get all agent .md files
  const files = await fs.readdir(agentsPath);
  const agentFiles = files.filter(file => file.endsWith('_agent.md'));
  
  console.log(`📄 Document Manager Agent: Generating JSON for ${agentFiles.length} agents...`);
  
  for (const file of agentFiles) {
    const agentName = file.replace('.md', '');
    const mdContent = await fs.readFile(path.join(agentsPath, file), 'utf8');
    
    try {
      const jsonData = await generateAgentJSON(agentName, mdContent);
      const outputFile = path.join(outputPath, `${agentName}.json`);
      
      await fs.writeJSON(outputFile, jsonData, { spaces: 2 });
      console.log(`✅ Generated: ${agentName}.json`);
    } catch (error) {
      console.error(`❌ Error generating JSON for ${agentName}:`, error.message);
    }
  }
  
  console.log('📄 Document Manager Agent: JSON generation complete!');
}

// Run if called directly
if (require.main === module) {
  generateAllAgentJSONs().catch(console.error);
}

module.exports = { generateAgentJSON, generateAllAgentJSONs };