#!/usr/bin/env node

/**
 * MD to Claude Agent Converter
 * Converts AgileAiAgents markdown files to Claude Code sub-agent format
 * Adds YAML frontmatter and preserves complete MD content
 */

const fs = require('fs');
const path = require('path');

class MDToClaudeAgentConverter {
  constructor() {
    this.projectRoot = path.join(__dirname, '../..');
    this.sourceDir = path.join(this.projectRoot, 'ai-agents');
    this.outputDir = path.join(this.projectRoot, 'templates/claude-integration/.claude/agents');
    this.settingsPath = path.join(this.projectRoot, 'templates/claude-integration/.claude/settings.json');
    this.toolMappings = this.loadToolMappings();
    this.conversionLog = [];
  }

  loadToolMappings() {
    try {
      const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
      const mappings = settings['agent-mappings'] || {};
      
      // Flatten the categorized mappings
      const flatMappings = {};
      Object.keys(mappings).forEach(category => {
        if (category !== 'description' && category !== 'default') {
          Object.assign(flatMappings, mappings[category]);
        }
      });
      
      return {
        ...flatMappings,
        default: mappings.default || 'Read, Write, Edit, Bash, Grep'
      };
    } catch (error) {
      console.error('Warning: Could not load tool mappings from settings.json, using defaults');
      return {
        // Development agents
        coder_agent: 'Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS',
        testing_agent: 'Read, Bash, Grep, Glob, LS',
        devops_agent: 'Read, Write, Bash, Grep, LS',
        security_agent: 'Read, Grep, Glob, LS, WebSearch',
        ui_ux_agent: 'Read, Write, Edit, Grep, Glob',
        dba_agent: 'Read, Write, Bash, Grep',
        
        // Research agents
        research_agent: 'WebSearch, WebFetch, Read, Write, Grep',
        finance_agent: 'Read, Write, WebFetch, WebSearch',
        analysis_agent: 'Read, Write, WebSearch, WebFetch',
        marketing_agent: 'Read, Write, WebSearch, WebFetch',
        
        // Documentation agents
        documentator_agent: 'Read, Write, Edit, Grep, Glob',
        logger_agent: 'Read, Write, Grep, LS',
        
        // Management agents
        project_manager_agent: 'Read, Write, Edit, TodoWrite',
        scrum_master_agent: 'Read, Write, Edit, TodoWrite',
        prd_agent: 'Read, Write, Edit',
        
        // Growth agents
        seo_agent: 'Read, Write, WebSearch, WebFetch',
        ppc_agent: 'Read, Write, WebSearch, WebFetch',
        social_media_agent: 'Read, Write, WebSearch',
        email_marketing_agent: 'Read, Write, Edit',
        analytics_agent: 'Read, Write, WebFetch',
        revenue_optimization_agent: 'Read, Write, WebSearch',
        customer_lifecycle_agent: 'Read, Write, Edit',
        
        // Technical integration agents
        api_agent: 'Read, Write, Edit, Bash, WebFetch',
        llm_agent: 'Read, Write, WebSearch, WebFetch',
        mcp_agent: 'Read, Write, Edit, Bash',
        ml_agent: 'Read, Write, Edit, Bash',
        data_engineer_agent: 'Read, Write, Bash, Grep',
        
        // Support agents
        optimization_agent: 'Read, Write, Grep, LS',
        dashboard_agent: 'Read, Write, Edit',
        project_analyzer_agent: 'Read, Grep, Glob, LS',
        document_manager_agent: 'Read, Write, LS, Glob',
        project_state_manager_agent: 'Read, Write, Edit',
        project_structure_agent: 'Read, Write, LS, Grep',
        learning_analysis_agent: 'Read, Write, Grep, WebSearch',
        vc_report_agent: 'Read, Write, WebSearch, WebFetch',
        business_documents_agent: 'Read, Write, Edit',
        
        // Default
        default: 'Read, Write, Edit, Bash, Grep'
      };
    }
  }

  async convert(agentFile = null) {
    console.log('Starting MD to Claude Agent conversion...');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Get files to convert
    const files = agentFile 
      ? [agentFile + '.md'] 
      : fs.readdirSync(this.sourceDir).filter(f => f.endsWith('.md'));

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(this.sourceDir, file);
        const agentName = path.basename(file, '.md');
        
        console.log(`Converting ${agentName}...`);
        
        const result = await this.convertFile(filePath, agentName);
        
        if (result.success) {
          successCount++;
          this.conversionLog.push({
            agent: agentName,
            status: 'success',
            outputPath: result.outputPath
          });
        } else {
          errorCount++;
          this.conversionLog.push({
            agent: agentName,
            status: 'error',
            error: result.error
          });
        }
      } catch (error) {
        errorCount++;
        console.error(`Error converting ${file}:`, error.message);
      }
    }

    // Write conversion report
    this.writeConversionReport();

    console.log(`\nConversion complete!`);
    console.log(`Success: ${successCount} agents`);
    console.log(`Errors: ${errorCount} agents`);
    
    return { successCount, errorCount };
  }

  async convertFile(filePath, agentName) {
    try {
      // Read original MD content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract description from content
      const description = this.extractDescription(content, agentName);
      
      // Get tools for this agent
      const tools = this.toolMappings[agentName] || this.toolMappings.default;
      
      // Create YAML frontmatter
      const frontmatter = this.createFrontmatter(agentName, description, tools);
      
      // Combine frontmatter with original content
      const claudeAgentContent = `${frontmatter}\n${content}`;
      
      // Write to output
      const outputPath = path.join(this.outputDir, `${agentName}.md`);
      fs.writeFileSync(outputPath, claudeAgentContent);
      
      return {
        success: true,
        outputPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractDescription(content, agentName) {
    // Try to extract from Overview section
    const overviewMatch = content.match(/## Overview\s*\n\s*(.+?)(?:\n|$)/);
    if (overviewMatch) {
      return overviewMatch[1].trim();
    }
    
    // Try to extract from first paragraph
    const firstParaMatch = content.match(/^# .+?\n\n(.+?)(?:\n|$)/m);
    if (firstParaMatch) {
      return firstParaMatch[1].trim();
    }
    
    // Fallback to agent name
    return `${agentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} for AgileAiAgents`;
  }

  createFrontmatter(agentName, description, tools) {
    return `---
name: ${agentName}
description: ${description}
tools: ${tools}
---`;
  }

  writeConversionReport() {
    const reportPath = path.join(this.projectRoot, 'machine-data/conversion-reports/claude-agent-conversion.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.conversionLog.length,
        success: this.conversionLog.filter(l => l.status === 'success').length,
        errors: this.conversionLog.filter(l => l.status === 'error').length
      },
      details: this.conversionLog
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }
}

// CLI execution
if (require.main === module) {
  const converter = new MDToClaudeAgentConverter();
  const agentFile = process.argv[2];
  
  converter.convert(agentFile)
    .then(result => {
      process.exit(result.errorCount > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = MDToClaudeAgentConverter;