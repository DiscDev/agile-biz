/**
 * Enhanced Agent JSON Generator
 * Generates optimized JSON files from agent markdown files with:
 * - Progressive loading via md_reference links
 * - Accurate token counting
 * - GitHub formatting standards extraction
 * - Context optimization priorities
 * - Bidirectional references
 */

const fs = require('fs-extra');
const path = require('path');

// Token estimation (conservative estimate: 0.25 tokens per character)
function estimateTokens(text) {
  if (!text) return 0;
  
  // Account for different content types
  const codeBlockMultiplier = 1.1;
  const tableMultiplier = 1.2;
  const baseMultiplier = 0.25;
  
  // Detect code blocks and tables for more accurate counting
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).join('');
  const tables = (text.match(/\|.*\|/g) || []).join('');
  const regularText = text.replace(/```[\s\S]*?```/g, '').replace(/\|.*\|/g, '');
  
  return Math.ceil(
    (regularText.length * baseMultiplier) +
    (codeBlocks.length * baseMultiplier * codeBlockMultiplier) +
    (tables.length * baseMultiplier * tableMultiplier)
  );
}

// Generate GitHub-style anchor from heading text
function generateAnchor(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Extract section content between headings
function extractSection(content, startHeading, endHeading = null) {
  const headingRegex = new RegExp(`^#{1,3}\\s+${startHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'mi');
  const match = content.match(headingRegex);
  
  if (!match) return null;
  
  const startIndex = match.index + match[0].length;
  let endIndex = content.length;
  
  if (endHeading) {
    const endMatch = content.match(new RegExp(`^#{1,3}\\s+${endHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'mi'));
    if (endMatch) {
      endIndex = endMatch.index;
    }
  } else {
    // Find next heading of same or higher level
    const remainingContent = content.slice(startIndex);
    const nextHeadingMatch = remainingContent.match(/^#{1,3}\s+/m);
    if (nextHeadingMatch) {
      endIndex = startIndex + nextHeadingMatch.index;
    }
  }
  
  return content.slice(startIndex, endIndex).trim();
}

// Extract GitHub formatting information
function extractGitHubFormatting(content) {
  const section = extractSection(content, 'GitHub Markdown Formatting Standards');
  if (!section) return null;
  
  // Determine agent category
  const categoryMatch = section.match(/The\s+[\w\s&]+Agent\s+uses\s+\*\*([^*]+)\*\*.*formatting/i);
  let agentCategory = 'support'; // default
  let formattingLevel = 'basic';
  
  if (categoryMatch) {
    const levelText = categoryMatch[1].toLowerCase();
    if (levelText.includes('development')) {
      agentCategory = 'development';
      formattingLevel = 'basic+intermediate';
    } else if (levelText.includes('business')) {
      agentCategory = 'business';
      formattingLevel = 'basic+intermediate';
    } else if (levelText.includes('growth')) {
      agentCategory = 'growth';
      formattingLevel = 'basic+intermediate';
    } else if (levelText.includes('technical')) {
      agentCategory = 'technical';
      formattingLevel = 'basic+advanced';
    }
  }
  
  // Count examples
  const examplesCount = (section.match(/```[\s\S]*?```/g) || []).length;
  
  return {
    agent_category: agentCategory,
    formatting_level: formattingLevel,
    standards_included: true,
    examples_count: examplesCount,
    quality_checklist: section.includes('Quality Validation'),
    tokens: estimateTokens(section)
  };
}

// Extract context optimization priorities
function extractContextOptimization(content) {
  const section = extractSection(content, 'Context Optimization Priorities');
  if (!section) return null;
  
  const requiredFromAgents = {};
  const optionalFromAgents = {};
  
  // Parse "From Agent" sections
  const fromMatches = section.matchAll(/#### From (.+?)\n\*\*Critical Data\*\*[^:]*:\n([\s\S]*?)(?=\*\*Optional Data\*\*|####|$)/g);
  
  for (const match of fromMatches) {
    const agentName = match[1].toLowerCase().replace(/\s+agent/i, '').replace(/\s+/g, '_');
    const criticalSection = match[2];
    
    // Extract critical data items
    const criticalItems = criticalSection.match(/- `([^`]+)`/g) || [];
    if (criticalItems.length > 0) {
      requiredFromAgents[agentName] = criticalItems.map(item => item.match(/`([^`]+)`/)[1]);
    }
    
    // Extract optional data items
    const optionalMatch = section.match(new RegExp(`From ${match[1]}[\\s\\S]*?\\*\\*Optional Data\\*\\*[^:]*:\\n([\\s\\S]*?)(?=####|$)`));
    if (optionalMatch) {
      const optionalItems = optionalMatch[1].match(/- `([^`]+)`/g) || [];
      if (optionalItems.length > 0) {
        optionalFromAgents[agentName] = optionalItems.map(item => item.match(/`([^`]+)`/)[1]);
      }
    }
  }
  
  return {
    required_from_agents: requiredFromAgents,
    optional_from_agents: optionalFromAgents,
    tokens: estimateTokens(section)
  };
}

// Extract core responsibilities
function extractCoreResponsibilities(content) {
  const section = extractSection(content, 'Core Responsibilities');
  if (!section) return null;
  
  // Extract main responsibility headings (both ### and bold ** patterns)
  const responsibilities = [];
  
  // Look for ### headings
  const h3Headings = section.match(/### (.+?)(?=\n)/g) || [];
  responsibilities.push(...h3Headings.map(h => h.replace(/^### /, '').trim()));
  
  // Look for **bold** headings at start of lines
  const boldHeadings = section.match(/^\*\*([^*]+)\*\*/gm) || [];
  responsibilities.push(...boldHeadings.map(h => h.replace(/^\*\*([^*]+)\*\*/, '$1').trim()));
  
  // Look for - **bold** list items
  const listBoldItems = section.match(/^- \*\*([^*]+)\*\*/gm) || [];
  responsibilities.push(...listBoldItems.map(h => h.replace(/^- \*\*([^*]+)\*\*/, '$1').trim()));
  
  const summary = [...new Set(responsibilities)].slice(0, 5); // Remove duplicates
  
  return {
    summary: summary,
    count: summary.length,
    details_tokens: estimateTokens(section)
  };
}

// Extract workflows
function extractWorkflows(content) {
  const section = extractSection(content, 'Workflows');
  if (!section) return { available: [], total_workflows: 0, total_tokens: 0 };
  
  // Extract workflow headings - look for both ### and patterns ending with "Workflow"
  const workflows = [];
  
  // Method 1: Look for ### headings
  const workflowMatches = section.matchAll(/### (.+?)(?=\n|$)/g);
  for (const match of workflowMatches) {
    const workflowName = match[1].trim();
    if (workflowName && !workflowName.toLowerCase().includes('coordination')) {
      workflows.push({
        name: workflowName,
        type: workflowName.toLowerCase().includes('primary') ? 'primary' : 'secondary',
        tokens: estimateTokens(extractSection(section, workflowName) || ''),
        md_reference: `#${generateAnchor(workflowName)}`
      });
    }
  }
  
  // Method 2: Look for workflow patterns (text ending with "Workflow")
  const workflowPatterns = section.match(/### (.+?Workflow[^)]*(?:\([^)]*\))?)\s*(?=\n)/g);
  if (workflowPatterns) {
    for (const pattern of workflowPatterns) {
      const workflowName = pattern.replace(/^### /, '').trim();
      if (workflowName && !workflows.some(w => w.name === workflowName)) {
        workflows.push({
          name: workflowName,
          type: workflowName.toLowerCase().includes('primary') ? 'primary' : 'secondary',
          tokens: estimateTokens(extractSection(section, workflowName) || ''),
          md_reference: `#${generateAnchor(workflowName)}`
        });
      }
    }
  }
  
  return {
    available: workflows,
    total_workflows: workflows.length,
    total_tokens: workflows.reduce((sum, w) => sum + w.tokens, 0)
  };
}

// Extract coordination patterns
function extractCoordination(content) {
  const section = extractSection(content, 'Coordination Patterns');
  if (!section) return { tokens: 0 };
  
  // Extract agent mentions
  const agentMentions = section.match(/(\w+)\s+Agent/g) || [];
  const uniqueAgents = [...new Set(agentMentions.map(mention => 
    mention.toLowerCase().replace(' agent', '').replace(/\s+/g, '_')
  ))];
  
  return {
    input_agents: uniqueAgents.slice(0, Math.ceil(uniqueAgents.length / 2)),
    output_agents: uniqueAgents.slice(Math.ceil(uniqueAgents.length / 2)),
    critical_relationships: Math.min(uniqueAgents.length, 5),
    inputs: {},
    outputs: {},
    tokens: estimateTokens(section)
  };
}

// Extract boundaries
function extractBoundaries(content) {
  // Look for Clear Boundaries section with content (not placeholder)
  const sections = content.match(/^## Clear Boundaries[^\n]*\n([\s\S]*?)(?=^## |$)/gm);
  if (!sections) return { tokens: 0 };
  
  // Find the section with actual content (not placeholder)
  let section = null;
  for (const sectionMatch of sections) {
    // Extract header and content
    const headerLine = sectionMatch.match(/^## Clear Boundaries[^\n]*/)[0];
    const fullContent = sectionMatch.substring(headerLine.length + 1); // +1 for newline
    const nonEmptyContent = fullContent.split('\n').filter(line => line.trim()).join('\n');
    
    if (nonEmptyContent && !nonEmptyContent.includes('*[This section needs to be documented]*')) {
      section = nonEmptyContent;
      break;
    }
  }
  
  if (!section) return { tokens: 0 };
  
  // Extract "does NOT do" items
  const notDoItems = section.match(/❌\s+\*\*([^*]+)\*\*/g) || [];
  const boundaries = notDoItems.map(item => item.replace(/❌\s+\*\*([^*]+)\*\*/, '$1'));
  
  // Extract agent references
  const agentRefs = section.match(/→\s+(\w+(?:\s+\w+)*)\s+Agent/g) || [];
  const referredAgents = agentRefs.map(ref => 
    ref.replace(/→\s+(\w+(?:\s+\w+)*)\s+Agent/, '$1').toLowerCase().replace(/\s+/g, '_')
  );
  
  return {
    what_not_to_do: boundaries,
    refers_to_agents: referredAgents,
    tokens: estimateTokens(section)
  };
}

// Extract success metrics
function extractSuccessMetrics(content) {
  const section = extractSection(content, 'Success Metrics');
  if (!section) return { tokens: 0 };
  
  // Count primary KPIs (usually marked with ###)
  const kpiHeadings = section.match(/### (.+?)(?=\n)/g) || [];
  const categories = [];
  
  // Determine categories based on content
  if (section.toLowerCase().includes('operational')) categories.push('operational');
  if (section.toLowerCase().includes('quality')) categories.push('quality');
  if (section.toLowerCase().includes('efficiency')) categories.push('efficiency');
  if (section.toLowerCase().includes('performance')) categories.push('performance');
  if (section.toLowerCase().includes('revenue')) categories.push('revenue');
  if (section.toLowerCase().includes('retention')) categories.push('retention');
  
  return {
    primary_kpis: kpiHeadings.length,
    categories: categories,
    tokens: estimateTokens(section)
  };
}

// Extract tools and integrations
function extractToolsIntegrations(content) {
  const section = extractSection(content, 'Tools & Integrations') || 
                  extractSection(content, 'Customer Success Tools & Integrations') ||
                  extractSection(content, 'Analytics & Intelligence Tools & Integrations');
  
  if (!section) return null;
  
  // Count tool mentions
  const toolMentions = section.match(/\*\*([^*]+)\*\*/g) || [];
  const categories = [];
  
  // Determine categories
  if (section.toLowerCase().includes('development')) categories.push('development');
  if (section.toLowerCase().includes('analytics')) categories.push('analytics');
  if (section.toLowerCase().includes('communication')) categories.push('communication');
  if (section.toLowerCase().includes('security')) categories.push('security');
  if (section.toLowerCase().includes('deployment')) categories.push('deployment');
  
  return {
    categories: categories,
    tool_count: toolMentions.length,
    tokens: estimateTokens(section)
  };
}

// Main function to generate enhanced JSON for a single agent
async function generateEnhancedAgentJSON(agentName, mdContent, mdFilePath) {
  // Calculate total MD tokens
  const fullMdTokens = estimateTokens(mdContent);
  
  // Extract summary from Overview or Role Overview section
  let overviewSection = extractSection(mdContent, 'Overview');
  if (!overviewSection) {
    overviewSection = extractSection(mdContent, 'Role Overview');
  }
  const summary = overviewSection ? overviewSection.split('\n')[0].trim() : 'AI agent specialist';
  
  // Extract all sections
  const githubFormatting = extractGitHubFormatting(mdContent);
  const contextOptimization = extractContextOptimization(mdContent);
  const coreResponsibilities = extractCoreResponsibilities(mdContent);
  const workflows = extractWorkflows(mdContent);
  const coordination = extractCoordination(mdContent);
  const boundaries = extractBoundaries(mdContent);
  const successMetrics = extractSuccessMetrics(mdContent);
  const toolsIntegrations = extractToolsIntegrations(mdContent);
  
  // Calculate estimated JSON tokens (more realistic)
  const baseSections = [
    estimateTokens(JSON.stringify({ meta: true, summary: summary })),
    githubFormatting ? Math.ceil(githubFormatting.tokens * 0.1) : 0,
    contextOptimization ? Math.ceil(contextOptimization.tokens * 0.1) : 0,
    coreResponsibilities ? Math.ceil(coreResponsibilities.details_tokens * 0.1) : 0,
    Math.ceil(workflows.total_tokens * 0.1),
    Math.ceil(coordination.tokens * 0.1),
    Math.ceil(boundaries.tokens * 0.1),
    Math.ceil(successMetrics.tokens * 0.1),
    toolsIntegrations ? Math.ceil(toolsIntegrations.tokens * 0.1) : 0
  ];
  
  const estimatedTokens = Math.max(
    baseSections.reduce((sum, tokens) => sum + tokens, 0) + 150, // Add overhead for JSON structure
    Math.ceil(fullMdTokens * 0.05) // Minimum 5% of MD tokens
  );
  const tokenReduction = ((fullMdTokens - estimatedTokens) / fullMdTokens * 100).toFixed(1) + '%';
  
  // Build the enhanced JSON structure
  const enhancedJSON = {
    meta: {
      agent: agentName,
      version: '2.1.0',
      last_updated: new Date().toISOString().split('T')[0],
      estimated_tokens: estimatedTokens,
      full_md_tokens: fullMdTokens,
      token_reduction: tokenReduction,
      md_file: mdFilePath,
      companion_md: mdFilePath,
      usage_guide: 'Load this JSON first for context efficiency, then use md_reference links for detailed sections'
    },
    
    summary: summary,
    
    ...(githubFormatting && {
      github_formatting: {
        ...githubFormatting,
        md_reference: `${mdFilePath}#github-markdown-formatting-standards`
      }
    }),
    
    ...(coreResponsibilities && {
      core_responsibilities: {
        ...coreResponsibilities,
        md_reference: `${mdFilePath}#core-responsibilities`
      }
    }),
    
    ...(contextOptimization && {
      context_optimization: {
        ...contextOptimization,
        md_reference: `${mdFilePath}#context-optimization-priorities`
      }
    }),
    
    workflows: {
      ...workflows,
      md_reference: `${mdFilePath}#workflows`
    },
    
    coordination: {
      ...coordination,
      md_reference: `${mdFilePath}#coordination-patterns`
    },
    
    boundaries: {
      ...boundaries,
      md_reference: `${mdFilePath}#clear-boundaries`
    },
    
    success_metrics: {
      ...successMetrics,
      md_reference: `${mdFilePath}#success-metrics`
    },
    
    ...(toolsIntegrations && {
      tools_integrations: {
        ...toolsIntegrations,
        md_reference: `${mdFilePath}#tools-integrations`
      }
    }),
    
    reference_documentation: {},
    
    context_recommendations: {
      minimal: {
        sections: ['meta', 'summary', 'core_responsibilities.summary', 'github_formatting.agent_category'],
        tokens: 100,
        description: 'Quick agent overview for basic context'
      },
      standard: {
        sections: ['minimal', 'workflows.available', 'context_optimization.required_from_agents', 'coordination'],
        tokens: 250,
        description: 'Operational context with inter-agent dependencies'
      },
      detailed: {
        sections: ['standard', 'boundaries', 'success_metrics', 'tools_integrations', 'all_md_references_as_needed'],
        tokens: '400-' + fullMdTokens,
        description: 'Progressive loading via md_reference links'
      }
    }
  };
  
  return enhancedJSON;
}

// Generate enhanced JSON for all agents
async function generateAllEnhancedAgentJSONs() {
  const agentsPath = path.join(__dirname, '..', 'ai-agents');
  const outputPath = path.join(__dirname, 'ai-agents-json');
  
  // Backup existing JSON files
  const backupPath = path.join(__dirname, 'ai-agents-json-backup');
  if (await fs.pathExists(outputPath)) {
    await fs.copy(outputPath, backupPath);
    console.log('📦 Backed up existing JSON files');
  }
  
  // Ensure output directory exists
  await fs.ensureDir(outputPath);
  
  // Get all agent .md files
  const files = await fs.readdir(agentsPath);
  const agentFiles = files.filter(file => file.endsWith('_agent.md'));
  
  console.log(`📄 Enhanced Agent JSON Generator: Processing ${agentFiles.length} agents...`);
  
  const results = [];
  
  for (const file of agentFiles) {
    const agentName = file.replace('.md', '');
    const mdFilePath = `agile-ai-agents/ai-agents/${file}`;
    const mdContent = await fs.readFile(path.join(agentsPath, file), 'utf8');
    
    try {
      const enhancedJSON = await generateEnhancedAgentJSON(agentName, mdContent, mdFilePath);
      const outputFile = path.join(outputPath, `${agentName}.json`);
      
      await fs.writeJSON(outputFile, enhancedJSON, { spaces: 2 });
      
      results.push({
        agent: agentName,
        estimated_tokens: enhancedJSON.meta.estimated_tokens,
        full_md_tokens: enhancedJSON.meta.full_md_tokens,
        token_reduction: enhancedJSON.meta.token_reduction,
        status: 'success'
      });
      
      console.log(`✅ Generated: ${agentName}.json (${enhancedJSON.meta.token_reduction} reduction)`);
    } catch (error) {
      console.error(`❌ Error generating JSON for ${agentName}:`, error.message);
      results.push({
        agent: agentName,
        status: 'error',
        error: error.message
      });
    }
  }
  
  // Generate summary report
  const successful = results.filter(r => r.status === 'success');
  const avgTokenReduction = successful.reduce((sum, r) => sum + parseFloat(r.token_reduction), 0) / successful.length;
  
  console.log('\n📊 Generation Summary:');
  console.log(`✅ Successful: ${successful.length}/${results.length} agents`);
  console.log(`📈 Average Token Reduction: ${avgTokenReduction.toFixed(1)}%`);
  console.log(`📄 Enhanced Agent JSON Generation Complete!`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  generateAllEnhancedAgentJSONs().catch(console.error);
}

module.exports = { 
  generateEnhancedAgentJSON, 
  generateAllEnhancedAgentJSONs,
  estimateTokens,
  generateAnchor
};