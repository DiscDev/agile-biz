#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Enhanced Agent JSON Generator with Reference System
 * Converts agent markdown files to JSON with section references
 */

// Configuration
const CONFIG = {
  agentsDir: path.join(__dirname, '../../ai-agents'),
  outputDir: path.join(__dirname, '../ai-agents-json'),
  schemaPath: path.join(__dirname, '../schemas/agent-json-schema.json'),
  tokensPerChar: 0.25, // Rough estimate: 1 token per 4 characters
  maxSummaryLength: 500
};

/**
 * Estimate token count for a string
 */
function estimateTokens(text) {
  if (!text) return 0;
  // More accurate estimation based on OpenAI's rule of thumb
  // English text: ~1 token per 4 characters
  // Account for markdown formatting
  const cleanText = text.replace(/[#*`\[\]()]/g, '');
  return Math.ceil(cleanText.length * CONFIG.tokensPerChar);
}

/**
 * Extract section references from markdown content
 */
function extractSectionReferences(content, mdPath) {
  const references = {};
  const lines = content.split('\n');
  let currentSection = '';
  let currentLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      const level = headingMatch[1].length;
      const heading = headingMatch[2].trim();
      const anchor = heading.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      if (level === 2) {
        currentSection = heading;
        references[currentSection] = {
          anchor: anchor,
          mdReference: `${mdPath}#${anchor}`,
          tokens: 0,
          subsections: {}
        };
      } else if (level === 3 && currentSection) {
        references[currentSection].subsections[heading] = {
          anchor: anchor,
          mdReference: `${mdPath}#${anchor}`,
          tokens: 0
        };
      }
    }
  }
  
  // Calculate tokens for each section
  let sectionContent = {};
  let currentSectionName = '';
  let sectionStartIdx = 0;
  
  lines.forEach((line, idx) => {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (currentSectionName) {
        const content = lines.slice(sectionStartIdx, idx).join('\n');
        sectionContent[currentSectionName] = content;
        if (references[currentSectionName]) {
          references[currentSectionName].tokens = estimateTokens(content);
        }
      }
      currentSectionName = headingMatch[1].trim();
      sectionStartIdx = idx;
    }
  });
  
  // Don't forget the last section
  if (currentSectionName) {
    const content = lines.slice(sectionStartIdx).join('\n');
    sectionContent[currentSectionName] = content;
    if (references[currentSectionName]) {
      references[currentSectionName].tokens = estimateTokens(content);
    }
  }
  
  return { references, sectionContent };
}

/**
 * Parse agent markdown file and extract structured data
 */
async function parseAgentMarkdown(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.md');
  const relativePath = `agile-ai-agents/ai-agents/${path.basename(filePath)}`;
  
  // Extract sections and references
  const { references, sectionContent } = extractSectionReferences(content, relativePath);
  
  // Extract agent name and overview
  const nameMatch = content.match(/^#\s+(.+?)(?:\s+-\s+(.+))?$/m);
  const agentName = nameMatch ? nameMatch[1] : fileName;
  const agentSubtitle = nameMatch && nameMatch[2] ? nameMatch[2] : '';
  
  // Extract overview/summary
  const overviewSection = sectionContent['Overview'] || '';
  const summaryMatch = overviewSection.match(/^(.+?)(?:\n\n|$)/s);
  const summary = summaryMatch ? summaryMatch[1].replace(/\*/g, '').trim() : '';
  
  // Extract core responsibilities
  const responsibilitiesContent = sectionContent['Core Responsibilities'] || '';
  const responsibilities = [];
  const respLines = responsibilitiesContent.split('\n');
  respLines.forEach(line => {
    const match = line.match(/^###\s+(.+)$/);
    if (match) {
      responsibilities.push(match[1]);
    }
  });
  
  // Extract workflows
  const workflowsContent = sectionContent['Workflows'] || '';
  const workflows = [];
  if (references['Workflows'] && references['Workflows'].subsections) {
    Object.entries(references['Workflows'].subsections).forEach(([name, data]) => {
      workflows.push({
        name: name,
        tokens: data.tokens,
        md_reference: data.mdReference
      });
    });
  }
  
  // Extract reference documentation and convert to JSON paths
  const refDocsContent = sectionContent['Reference Documentation'] || '';
  const referenceDocs = {};
  const refLines = refDocsContent.split('\n');
  refLines.forEach(line => {
    const match = line.match(/^\s*-\s*\*\*(.+?)\*\*:\s*`(.+?)`/);
    if (match) {
      const docName = match[1].toLowerCase().replace(/\s+/g, '_');
      const mdPath = match[2];
      
      // Convert MD path to JSON path
      let jsonPath = mdPath;
      if (mdPath.includes('/aaa-documents/')) {
        jsonPath = mdPath.replace('/aaa-documents/', '/machine-data/aaa-documents-json/').replace('.md', '.json');
      } else if (mdPath.includes('/project-documents/')) {
        jsonPath = mdPath.replace('/project-documents/', '/machine-data/project-documents-json/').replace('.md', '.json');
      } else if (mdPath.includes('/ai-agents/')) {
        jsonPath = mdPath.replace('/ai-agents/', '/machine-data/ai-agents-json/').replace('.md', '.json');
      }
      
      referenceDocs[docName] = {
        path: jsonPath,
        tokens: 1000 // Default estimate, could be calculated
      };
    }
  });
  
  // Extract coordination patterns
  const coordinationContent = sectionContent['Agent Coordination'] || '';
  const inputs = {};
  const outputs = {};
  
  // Simple extraction - could be enhanced
  const inputsMatch = coordinationContent.match(/###\s*Inputs From.*?\n([\s\S]*?)(?=###|$)/);
  const outputsMatch = coordinationContent.match(/###\s*Outputs To.*?\n([\s\S]*?)(?=###|$)/);
  
  if (inputsMatch) {
    const inputLines = inputsMatch[1].split('\n');
    inputLines.forEach(line => {
      const match = line.match(/^\s*-\s*\*\*(.+?)\*\*:\s*(.+)$/);
      if (match) {
        const agentName = match[1].toLowerCase().replace(/\s+/g, '_');
        inputs[agentName] = [match[2].trim()];
      }
    });
  }
  
  if (outputsMatch) {
    const outputLines = outputsMatch[1].split('\n');
    outputLines.forEach(line => {
      const match = line.match(/^\s*-\s*\*\*(.+?)\*\*:\s*(.+)$/);
      if (match) {
        const agentName = match[1].toLowerCase().replace(/\s+/g, '_');
        outputs[agentName] = [match[2].trim()];
      }
    });
  }
  
  // Build the JSON structure
  const agentJson = {
    meta: {
      agent: fileName,
      version: "2.0.0",
      last_updated: new Date().toISOString().split('T')[0],
      estimated_tokens: estimateTokens(JSON.stringify({
        summary, 
        core_responsibilities: { summary: responsibilities },
        workflows: { available: workflows.map(w => ({ name: w.name })) },
        coordination: { inputs, outputs }
      })),
      full_md_tokens: estimateTokens(content),
      md_file: relativePath
    },
    summary: summary.substring(0, CONFIG.maxSummaryLength),
    core_responsibilities: {
      summary: responsibilities,
      details_tokens: references['Core Responsibilities']?.tokens || 0,
      md_reference: references['Core Responsibilities']?.mdReference || `${relativePath}#core-responsibilities`
    },
    workflows: {
      available: workflows,
      total_tokens: workflows.reduce((sum, w) => sum + w.tokens, 0),
      md_reference: references['Workflows']?.mdReference || `${relativePath}#workflows`
    },
    reference_documentation: referenceDocs,
    coordination: {
      inputs: inputs,
      outputs: outputs,
      md_reference: references['Agent Coordination']?.mdReference || `${relativePath}#agent-coordination`
    },
    context_recommendations: {
      minimal: ["meta", "summary", "core_responsibilities.summary"],
      standard: ["minimal", "workflows.available", "coordination"],
      detailed: ["standard", "reference_documentation", "specific_workflow_via_reference"]
    }
  };
  
  // Add optional sections if they exist
  if (references['Success Metrics']) {
    agentJson.success_metrics = {
      tokens: references['Success Metrics'].tokens,
      md_reference: references['Success Metrics'].mdReference
    };
  }
  
  if (references['Clear Boundaries']) {
    agentJson.boundaries = {
      tokens: references['Clear Boundaries'].tokens,
      md_reference: references['Clear Boundaries'].mdReference
    };
  }
  
  return agentJson;
}

/**
 * Generate JSON files for all agents
 */
async function generateAllAgentJsonFiles() {
  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    // Get all markdown files
    const files = await fs.readdir(CONFIG.agentsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`Found ${mdFiles.length} agent files to process`);
    
    const results = {
      success: [],
      errors: []
    };
    
    // Process each file
    for (const file of mdFiles) {
      try {
        console.log(`Processing ${file}...`);
        const filePath = path.join(CONFIG.agentsDir, file);
        const agentJson = await parseAgentMarkdown(filePath);
        
        // Validate against schema (if needed)
        // const schema = JSON.parse(await fs.readFile(CONFIG.schemaPath, 'utf-8'));
        // validateAgainstSchema(agentJson, schema);
        
        // Write JSON file
        const outputPath = path.join(CONFIG.outputDir, file.replace('.md', '.json'));
        await fs.writeFile(outputPath, JSON.stringify(agentJson, null, 2));
        
        results.success.push({
          file: file,
          tokens: agentJson.meta.estimated_tokens,
          reduction: Math.round((1 - agentJson.meta.estimated_tokens / agentJson.meta.full_md_tokens) * 100)
        });
        
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
        results.errors.push({ file, error: error.message });
      }
    }
    
    // Generate summary report
    console.log('\n=== Generation Summary ===');
    console.log(`Successfully processed: ${results.success.length} files`);
    console.log(`Errors: ${results.errors.length} files`);
    
    if (results.success.length > 0) {
      const avgReduction = results.success.reduce((sum, r) => sum + r.reduction, 0) / results.success.length;
      console.log(`Average token reduction: ${avgReduction.toFixed(1)}%`);
    }
    
    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    }
    
    // Write generation report
    const reportPath = path.join(CONFIG.outputDir, 'generation-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      generated: new Date().toISOString(),
      summary: {
        total_files: mdFiles.length,
        successful: results.success.length,
        errors: results.errors.length,
        average_token_reduction: results.success.length > 0 
          ? results.success.reduce((sum, r) => sum + r.reduction, 0) / results.success.length 
          : 0
      },
      files: results.success,
      errors: results.errors
    }, null, 2));
    
    console.log(`\nGeneration report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateAllAgentJsonFiles();
}

module.exports = {
  parseAgentMarkdown,
  extractSectionReferences,
  estimateTokens
};