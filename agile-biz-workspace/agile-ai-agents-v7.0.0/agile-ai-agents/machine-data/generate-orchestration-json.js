/**
 * Orchestration Documents JSON Generator
 * Converts project-documents/orchestration markdown files to optimized JSON format
 */

const fs = require('fs');
const path = require('path');

class OrchestrationJSONGenerator {
  constructor() {
    this.sourceDir = path.join(__dirname, '..', 'project-documents', 'orchestration');
    this.outputDir = path.join(__dirname, 'project-documents-json', 'orchestration');
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
   * Generate all orchestration JSON files
   */
  generateAllOrchestrationDocs() {
    console.log('🚀 Generating Orchestration Documents JSON Files');
    console.log('=' .repeat(60));
    
    try {
      // Get all markdown files in the orchestration directory
      const markdownFiles = this.getAllMarkdownFiles(this.sourceDir);
      
      console.log(`📄 Found ${markdownFiles.length} documentation files`);
      
      for (const filePath of markdownFiles) {
        try {
          this.generateDocumentJSON(filePath);
        } catch (error) {
          console.error(`❌ Failed to generate JSON for ${path.basename(filePath)}:`, error.message);
        }
      }
      
      // Also copy the existing project-progress.json if it exists
      const progressJsonPath = path.join(this.sourceDir, 'project-progress.json');
      if (fs.existsSync(progressJsonPath)) {
        const outputProgressPath = path.join(this.outputDir, 'project-progress.json');
        fs.copyFileSync(progressJsonPath, outputProgressPath);
        console.log(`📋 Copied: project-progress.json`);
      }
      
      console.log(`\n✅ Generated ${this.generatedFiles.length} JSON files`);
      console.log('📁 Location:', this.outputDir);
      
      return this.generatedFiles;
      
    } catch (error) {
      console.error('❌ Orchestration documentation generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Recursively get all markdown files from a directory
   */
  getAllMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        this.getAllMarkdownFiles(filePath, fileList);
      } else if (file.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
    
    return fileList;
  }

  /**
   * Generate JSON for a specific documentation file
   */
  generateDocumentJSON(mdFilePath) {
    const relativePath = path.relative(this.sourceDir, mdFilePath);
    const jsonFileName = relativePath.replace(/\.md$/, '.json').replace(/\//g, '_');
    const jsonPath = path.join(this.outputDir, jsonFileName);
    
    console.log(`\n📝 Processing: ${relativePath}`);
    
    // Read markdown content
    const markdownContent = fs.readFileSync(mdFilePath, 'utf-8');
    
    // Generate JSON based on document type
    const jsonData = this.createJSONStructure(relativePath, markdownContent);
    
    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    
    this.generatedFiles.push({
      source: relativePath,
      output: jsonFileName,
      size: JSON.stringify(jsonData).length
    });
    
    console.log(`✅ Generated: ${jsonFileName} (${JSON.stringify(jsonData).length} bytes)`);
  }

  /**
   * Create optimized JSON structure based on document type
   */
  createJSONStructure(filePath, content) {
    const fileName = path.basename(filePath, '.md');
    const dirPath = path.dirname(filePath);
    
    // Common structure for all documents
    const baseStructure = {
      meta: {
        document: fileName,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        source_file: `project-documents/orchestration/${filePath}`,
        document_type: this.getDocumentType(fileName, dirPath),
        category: "orchestration"
      },
      summary: this.extractSummary(content),
      sections: this.extractSections(content),
      key_points: this.extractKeyPoints(content)
    };

    // Add document-specific optimizations
    switch (fileName) {
      case 'dashboard-status':
        return {
          ...baseStructure,
          dashboard_info: this.extractDashboardInfo(content),
          features: this.extractFeatures(content),
          monitoring_status: this.extractMonitoringStatus(content)
        };
        
      case 'json-context-optimization-implementation-plan':
        return {
          ...baseStructure,
          implementation_status: this.extractImplementationStatus(content),
          phases: this.extractPhases(content),
          accomplishments: this.extractAccomplishments(content),
          metrics: this.extractMetrics(content)
        };
        
      case 'json-context-optimization-summary':
        return {
          ...baseStructure,
          optimization_results: this.extractOptimizationResults(content),
          performance_metrics: this.extractPerformanceMetrics(content)
        };
        
      case 'a2a-protocol-analysis':
        return {
          ...baseStructure,
          analysis_type: "protocol_evaluation",
          recommendations: this.extractRecommendations(content),
          pros_cons: this.extractProsCons(content),
          implementation_phases: this.extractImplementationPhases(content)
        };
        
      case 'user-decisions':
      case 'user-decision-logging-setup':
        return {
          ...baseStructure,
          decision_tracking: this.extractDecisionTracking(content),
          logging_setup: this.extractLoggingSetup(content)
        };
        
      default:
        // Handle sprint-related and other documents
        if (dirPath.includes('sprint-')) {
          return {
            ...baseStructure,
            sprint_type: this.getSprintType(dirPath),
            sprint_data: this.extractSprintData(content),
            action_items: this.extractActionItems(content)
          };
        }
        return baseStructure;
    }
  }

  /**
   * Determine document type based on filename and path
   */
  getDocumentType(fileName, dirPath) {
    if (fileName.includes('dashboard')) return 'dashboard_status';
    if (fileName.includes('json-context-optimization')) return 'optimization_documentation';
    if (fileName.includes('a2a-protocol')) return 'protocol_analysis';
    if (fileName.includes('user-decision')) return 'decision_management';
    if (dirPath.includes('sprint-')) return 'sprint_documentation';
    if (dirPath.includes('stakeholder-')) return 'stakeholder_management';
    
    return 'orchestration_documentation';
  }

  /**
   * Extract summary from document
   */
  extractSummary(content) {
    const lines = content.split('\n');
    
    // Look for overview, summary, or executive summary
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (line.includes('## overview') || 
          line.includes('## summary') ||
          line.includes('## executive summary')) {
        
        const summaryLines = [];
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
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
    
    // Fallback: use first substantial paragraph
    const paragraphs = content.split('\n\n');
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.length > 50) {
        return trimmed.substring(0, 300);
      }
    }
    
    return 'Orchestration documentation for AgileAiAgents';
  }

  /**
   * Extract main sections
   */
  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('## ')) {
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
      if ((trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('✅ ')) && 
          trimmed.length > 10 && trimmed.length < 200) {
        keyPoints.push(trimmed.replace(/^[-*✅]\s*/, ''));
        if (keyPoints.length >= 15) break; // Limit to 15 key points
      }
    }
    
    return keyPoints;
  }

  /**
   * Extract dashboard information
   */
  extractDashboardInfo(content) {
    const info = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('URL:')) info.url = line.split('URL:')[1]?.trim();
      if (line.includes('Status:')) info.status = line.split('Status:')[1]?.trim();
      if (line.includes('Started:')) info.started = line.split('Started:')[1]?.trim();
    }
    
    return info;
  }

  /**
   * Extract features list
   */
  extractFeatures(content) {
    const features = [];
    const lines = content.split('\n');
    
    let inFeaturesSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('features') && line.startsWith('##')) {
        inFeaturesSection = true;
        continue;
      }
      
      if (inFeaturesSection) {
        if (line.startsWith('##')) break;
        if (line.trim().startsWith('- ✅') || line.trim().startsWith('✅')) {
          features.push(line.trim().replace(/^[-✅\s]*/, ''));
        }
      }
    }
    
    return features;
  }

  /**
   * Extract implementation status
   */
  extractImplementationStatus(content) {
    const status = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('Phase') && (line.includes('✅') || line.includes('❌') || line.includes('🔄'))) {
        const match = line.match(/Phase (\d+).*?([✅❌🔄])\s*(.*)/);
        if (match) {
          const phase = `phase_${match[1]}`;
          const statusIcon = match[2];
          const description = match[3];
          
          status[phase] = {
            status: statusIcon === '✅' ? 'complete' : statusIcon === '🔄' ? 'in_progress' : 'not_started',
            description: description
          };
        }
      }
    }
    
    return status;
  }

  // Placeholder methods for additional extractions
  extractMonitoringStatus(content) { return {}; }
  extractPhases(content) { return []; }
  extractAccomplishments(content) { return []; }
  extractMetrics(content) { return {}; }
  extractOptimizationResults(content) { return {}; }
  extractPerformanceMetrics(content) { return {}; }
  extractRecommendations(content) { return []; }
  extractProsCons(content) { return {}; }
  extractImplementationPhases(content) { return []; }
  extractDecisionTracking(content) { return {}; }
  extractLoggingSetup(content) { return {}; }
  getSprintType(dirPath) { return dirPath.split('/').pop(); }
  extractSprintData(content) { return {}; }
  extractActionItems(content) { return []; }

  /**
   * Get generation statistics
   */
  getGenerationStats() {
    const totalSize = this.generatedFiles.reduce((sum, file) => sum + file.size, 0);
    
    return {
      files_generated: this.generatedFiles.length,
      total_size: totalSize,
      average_size: this.generatedFiles.length > 0 ? Math.round(totalSize / this.generatedFiles.length) : 0,
      files: this.generatedFiles
    };
  }
}

// Export the class and create a default instance
const orchestrationGenerator = new OrchestrationJSONGenerator();

module.exports = {
  OrchestrationJSONGenerator,
  generator: orchestrationGenerator
};

// Generate all files if this script is run directly
if (require.main === module) {
  orchestrationGenerator.generateAllOrchestrationDocs();
  console.log('\n📊 Generation Statistics:');
  console.log(JSON.stringify(orchestrationGenerator.getGenerationStats(), null, 2));
}