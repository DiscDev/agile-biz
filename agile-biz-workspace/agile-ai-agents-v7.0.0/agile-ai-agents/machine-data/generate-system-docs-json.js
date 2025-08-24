/**
 * System Documentation JSON Generator
 * Converts aaa-documents markdown files to optimized JSON format
 */

const fs = require('fs');
const path = require('path');

class SystemDocsJSONGenerator {
  constructor() {
    this.sourceDir = path.join(__dirname, '..', 'aaa-documents');
    this.outputDir = path.join(__dirname, 'aaa-documents-json');
    this.generatedFiles = [];
    
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created directory: ${this.outputDir}`);
    }
  }

  /**
   * Generate all system documentation JSON files
   */
  generateAllSystemDocs() {
    console.log('🚀 Generating System Documentation JSON Files');
    console.log('=' .repeat(60));
    
    try {
      const markdownFiles = fs.readdirSync(this.sourceDir)
        .filter(file => file.endsWith('.md'))
        .sort();
      
      console.log(`📄 Found ${markdownFiles.length} documentation files`);
      
      for (const mdFile of markdownFiles) {
        try {
          this.generateDocumentJSON(mdFile);
        } catch (error) {
          console.error(`❌ Failed to generate JSON for ${mdFile}:`, error.message);
        }
      }
      
      console.log(`\n✅ Generated ${this.generatedFiles.length} JSON files`);
      console.log('📁 Location:', this.outputDir);
      
      return this.generatedFiles;
      
    } catch (error) {
      console.error('❌ System documentation generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate JSON for a specific documentation file
   */
  generateDocumentJSON(mdFileName) {
    const mdPath = path.join(this.sourceDir, mdFileName);
    const jsonFileName = mdFileName.replace('.md', '.json');
    const jsonPath = path.join(this.outputDir, jsonFileName);
    
    console.log(`\n📝 Processing: ${mdFileName}`);
    
    // Read markdown content
    const markdownContent = fs.readFileSync(mdPath, 'utf-8');
    
    // Generate JSON based on document type
    const jsonData = this.createJSONStructure(mdFileName, markdownContent);
    
    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    
    this.generatedFiles.push({
      source: mdFileName,
      output: jsonFileName,
      size: JSON.stringify(jsonData).length
    });
    
    console.log(`✅ Generated: ${jsonFileName} (${JSON.stringify(jsonData).length} bytes)`);
  }

  /**
   * Create optimized JSON structure based on document type
   */
  createJSONStructure(fileName, content) {
    const baseName = fileName.replace('.md', '');
    
    // Common structure for all documents
    const baseStructure = {
      meta: {
        document: baseName,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        source_file: `aaa-documents/${fileName}`,
        document_type: this.getDocumentType(baseName)
      },
      summary: this.extractSummary(content),
      sections: this.extractSections(content),
      key_points: this.extractKeyPoints(content),
      usage_context: this.getUsageContext(baseName)
    };

    // Add document-specific optimizations
    switch (baseName) {
      case 'auto-project-orchestrator':
        return {
          ...baseStructure,
          orchestration_config: this.extractOrchestrationConfig(content),
          agent_activation_order: this.extractAgentOrder(content),
          sprint_patterns: this.extractSprintPatterns(content),
          decision_points: this.extractDecisionPoints(content)
        };
        
      case 'setup-guide':
        return {
          ...baseStructure,
          installation_steps: this.extractInstallationSteps(content),
          prerequisites: this.extractPrerequisites(content),
          configuration_options: this.extractConfigOptions(content),
          troubleshooting_quick_fixes: this.extractQuickFixes(content)
        };
        
      case 'usage-guide':
        return {
          ...baseStructure,
          workflows: this.extractWorkflows(content),
          examples: this.extractExamples(content),
          best_practices: this.extractBestPractices(content),
          common_patterns: this.extractCommonPatterns(content)
        };
        
      case 'json-context-guide':
        return {
          ...baseStructure,
          optimization_techniques: this.extractOptimizationTechniques(content),
          query_patterns: this.extractQueryPatterns(content),
          performance_tips: this.extractPerformanceTips(content),
          integration_examples: this.extractIntegrationExamples(content)
        };
        
      case 'troubleshooting':
        return {
          ...baseStructure,
          common_issues: this.extractCommonIssues(content),
          solutions: this.extractSolutions(content),
          error_codes: this.extractErrorCodes(content),
          diagnostic_steps: this.extractDiagnosticSteps(content)
        };
        
      default:
        return baseStructure;
    }
  }

  /**
   * Determine document type based on filename
   */
  getDocumentType(baseName) {
    const typeMap = {
      'auto-project-orchestrator': 'orchestration_config',
      'setup-guide': 'installation_guide',
      'usage-guide': 'user_manual',
      'json-context-guide': 'developer_guide',
      'troubleshooting': 'support_guide',
      'changelog': 'version_history',
      'deployment': 'deployment_guide',
      'versioning': 'version_management',
      'ci-cd-setup': 'automation_guide'
    };
    
    return typeMap[baseName] || 'general_documentation';
  }

  /**
   * Extract summary from document
   */
  extractSummary(content) {
    const lines = content.split('\n');
    
    // Look for overview or first substantial paragraph
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.toLowerCase().includes('## overview') || 
          line.toLowerCase().includes('## introduction')) {
        // Get next few meaningful lines
        const summaryLines = [];
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.startsWith('#')) {
            summaryLines.push(nextLine);
            if (summaryLines.join(' ').length > 300) break;
          } else if (nextLine.startsWith('##')) {
            break;
          }
        }
        return summaryLines.join(' ').substring(0, 300);
      }
    }
    
    // Fallback: use first paragraph after title
    const paragraphs = content.split('\n\n');
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.length > 50) {
        return trimmed.substring(0, 300);
      }
    }
    
    return 'Documentation file for AgileAiAgents system';
  }

  /**
   * Extract main sections
   */
  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('## ') && !line.startsWith('### ')) {
        const title = line.replace('## ', '');
        const contentLines = [];
        
        // Get content until next section
        for (let j = i + 1; j < lines.length && !lines[j].startsWith('## '); j++) {
          const contentLine = lines[j].trim();
          if (contentLine) {
            contentLines.push(contentLine);
          }
        }
        
        sections.push({
          title: title,
          content_preview: contentLines.slice(0, 3).join(' ').substring(0, 150)
        });
      }
    }
    
    return sections;
  }

  /**
   * Extract key points or bullet items
   */
  extractKeyPoints(content) {
    const keyPoints = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.startsWith('- ') || trimmed.startsWith('* ')) && 
          trimmed.length > 10 && trimmed.length < 200) {
        keyPoints.push(trimmed.substring(2));
        if (keyPoints.length >= 10) break; // Limit to 10 key points
      }
    }
    
    return keyPoints;
  }

  /**
   * Get usage context for agents
   */
  getUsageContext(baseName) {
    const contextMap = {
      'auto-project-orchestrator': ['project_manager_agent', 'all_agents'],
      'setup-guide': ['system_administration', 'initial_setup'],
      'usage-guide': ['all_agents', 'user_interaction'],
      'json-context-guide': ['all_agents', 'performance_optimization'],
      'troubleshooting': ['logger_agent', 'error_handling'],
      'deployment': ['devops_agent', 'production_deployment'],
      'ci-cd-setup': ['devops_agent', 'automation']
    };
    
    return contextMap[baseName] || ['general_reference'];
  }

  /**
   * Extract orchestration configuration
   */
  extractOrchestrationConfig(content) {
    const config = {
      activation_mode: 'automatic',
      agent_coordination: true,
      sprint_based: true
    };
    
    if (content.includes('manual')) config.manual_override = true;
    if (content.includes('dashboard')) config.dashboard_integration = true;
    if (content.includes('stakeholder')) config.stakeholder_approval = true;
    
    return config;
  }

  /**
   * Extract agent activation order
   */
  extractAgentOrder(content) {
    const order = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(\d+)\.\s+(.+?agent)/i);
      if (match) {
        order.push({
          step: parseInt(match[1]),
          agent: match[2].toLowerCase().replace(/\s+/g, '_')
        });
      }
    }
    
    return order.slice(0, 10); // Limit to first 10 steps
  }

  /**
   * Extract installation steps
   */
  extractInstallationSteps(content) {
    const steps = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^\d+\.\s+/) || line.startsWith('- **Step')) {
        steps.push({
          step: steps.length + 1,
          instruction: line.replace(/^\d+\.\s*/, '').replace(/^- \*\*Step \d+\*\*:\s*/, ''),
          type: 'installation'
        });
      }
    }
    
    return steps.slice(0, 15); // Limit to 15 steps
  }

  /**
   * Extract prerequisites
   */
  extractPrerequisites(content) {
    const prerequisites = [];
    const lines = content.split('\n');
    
    let inPrereqSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('prerequisite') || 
          line.toLowerCase().includes('requirement')) {
        inPrereqSection = true;
        continue;
      }
      
      if (inPrereqSection && line.trim().startsWith('- ')) {
        prerequisites.push(line.trim().substring(2));
      } else if (inPrereqSection && line.startsWith('##')) {
        break;
      }
    }
    
    return prerequisites;
  }

  /**
   * Extract workflows
   */
  extractWorkflows(content) {
    const workflows = [];
    const sections = content.split('## ');
    
    for (const section of sections) {
      if (section.toLowerCase().includes('workflow') || 
          section.toLowerCase().includes('process')) {
        const lines = section.split('\n');
        const title = lines[0].trim();
        const steps = lines.filter(line => 
          line.trim().startsWith('-') || line.trim().match(/^\d+\./)
        ).slice(0, 8);
        
        if (steps.length > 0) {
          workflows.push({
            name: title,
            steps: steps.map(step => step.trim().replace(/^[-\d.]+\s*/, ''))
          });
        }
      }
    }
    
    return workflows;
  }

  /**
   * Extract common issues for troubleshooting
   */
  extractCommonIssues(content) {
    const issues = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('### ') && 
          (line.toLowerCase().includes('error') || 
           line.toLowerCase().includes('issue') ||
           line.toLowerCase().includes('problem'))) {
        
        const issue = line.replace('### ', '');
        const description = [];
        
        for (let j = i + 1; j < lines.length && !lines[j].startsWith('###'); j++) {
          const desc = lines[j].trim();
          if (desc && !desc.startsWith('#')) {
            description.push(desc);
            if (description.join(' ').length > 200) break;
          }
        }
        
        issues.push({
          issue: issue,
          description: description.join(' ').substring(0, 200)
        });
      }
    }
    
    return issues;
  }

  // Placeholder methods for additional extractions
  extractSprintPatterns(content) { return []; }
  extractDecisionPoints(content) { return []; }
  extractConfigOptions(content) { return {}; }
  extractQuickFixes(content) { return []; }
  extractExamples(content) { return []; }
  extractBestPractices(content) { return []; }
  extractCommonPatterns(content) { return []; }
  extractOptimizationTechniques(content) { return []; }
  extractQueryPatterns(content) { return []; }
  extractPerformanceTips(content) { return []; }
  extractIntegrationExamples(content) { return []; }
  extractSolutions(content) { return []; }
  extractErrorCodes(content) { return []; }
  extractDiagnosticSteps(content) { return []; }

  /**
   * Get generation statistics
   */
  getGenerationStats() {
    const totalSize = this.generatedFiles.reduce((sum, file) => sum + file.size, 0);
    
    return {
      files_generated: this.generatedFiles.length,
      total_size: totalSize,
      average_size: Math.round(totalSize / this.generatedFiles.length),
      files: this.generatedFiles
    };
  }
}

// Export the class and create a default instance
const systemDocsGenerator = new SystemDocsJSONGenerator();

module.exports = {
  SystemDocsJSONGenerator,
  generator: systemDocsGenerator
};

// Generate all files if this script is run directly
if (require.main === module) {
  systemDocsGenerator.generateAllSystemDocs();
  console.log('\n📊 Generation Statistics:');
  console.log(JSON.stringify(systemDocsGenerator.getGenerationStats(), null, 2));
}