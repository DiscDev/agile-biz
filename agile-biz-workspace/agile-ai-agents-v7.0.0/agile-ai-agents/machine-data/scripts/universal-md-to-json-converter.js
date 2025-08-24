#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Universal MD to JSON Converter with Reference System
 * Handles all document types: agents, aaa-documents, project-documents
 * Includes automatic CLAUDE.md reference updates
 */

class UniversalMdToJsonConverter {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      totalTokenReduction: 0,
      claudeMdUpdates: 0
    };
    
    this.documentTypes = {
      agents: {
        inputDir: 'ai-agents',
        outputDir: 'machine-data/ai-agents-json',
        processor: 'processAgentDocument'
      },
      aaaDocuments: {
        inputDir: 'aaa-documents',
        outputDir: 'machine-data/aaa-documents-json',
        processor: 'processGeneralDocument'
      },
      projectDocuments: {
        inputDir: 'project-documents',
        outputDir: 'machine-data/project-documents-json',
        processor: 'processGeneralDocument'
      }
    };
    
    this.seenAnchors = new Map();
  }

  /**
   * Generate GitHub-style anchor from heading text
   */
  generateAnchor(heading) {
    return heading
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Replace multiple hyphens
      .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
  }

  /**
   * Generate unique anchor handling duplicates
   */
  generateUniqueAnchor(heading, filePath) {
    const baseAnchor = this.generateAnchor(heading);
    const key = `${filePath}#${baseAnchor}`;
    
    if (!this.seenAnchors.has(filePath)) {
      this.seenAnchors.set(filePath, new Map());
    }
    
    const fileAnchors = this.seenAnchors.get(filePath);
    const count = fileAnchors.get(baseAnchor) || 0;
    fileAnchors.set(baseAnchor, count + 1);
    
    return count === 0 ? baseAnchor : `${baseAnchor}-${count}`;
  }

  /**
   * Estimate token count (1 token ≈ 4 characters)
   */
  estimateTokens(text) {
    if (!text) return 0;
    const cleanText = text.replace(/[#*`\[\]()]/g, '');
    return Math.ceil(cleanText.length / 4);
  }

  /**
   * Get relative path from agile-ai-agents root
   */
  getRelativePath(filePath) {
    const parts = filePath.split(path.sep);
    const agileIndex = parts.findIndex(p => p === 'agile-ai-agents');
    return agileIndex >= 0 ? parts.slice(agileIndex).join('/') : filePath;
  }

  /**
   * Extract sections with full hierarchy and md_reference
   */
  extractSectionsWithReferences(content, mdPath) {
    const lines = content.split('\n');
    const sections = [];
    const sectionMap = {};
    let currentH1 = null;
    let currentH2 = null;
    let currentH3 = null;
    let currentContent = [];
    let contentStart = 0;
    
    // Reset anchors for this file
    this.seenAnchors.delete(mdPath);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        // Save previous section content
        if (currentContent.length > 0) {
          const contentText = currentContent.join('\n').trim();
          const contentPreview = contentText.substring(0, 150) + (contentText.length > 150 ? '...' : '');
          
          if (currentH3 && currentH2 && sectionMap[currentH2]) {
            if (!sectionMap[currentH2].subsections) {
              sectionMap[currentH2].subsections = {};
            }
            sectionMap[currentH2].subsections[currentH3] = {
              content_preview: contentPreview,
              tokens: this.estimateTokens(contentText),
              md_reference: `${mdPath}#${this.generateUniqueAnchor(currentH3, mdPath)}`
            };
          } else if (currentH2 && sectionMap[currentH2]) {
            sectionMap[currentH2].content_preview = contentPreview;
            sectionMap[currentH2].tokens = this.estimateTokens(contentText);
          }
        }
        
        const level = headingMatch[1].length;
        const heading = headingMatch[2].trim();
        const anchor = this.generateUniqueAnchor(heading, mdPath);
        
        if (level === 1) {
          currentH1 = heading;
          currentH2 = null;
          currentH3 = null;
        } else if (level === 2) {
          currentH2 = heading;
          currentH3 = null;
          sections.push({
            title: heading,
            level: 2,
            md_reference: `${mdPath}#${anchor}`,
            content_preview: '' // Will be filled later
          });
          sectionMap[heading] = {
            md_reference: `${mdPath}#${anchor}`,
            tokens: 0
          };
        } else if (level === 3 && currentH2) {
          currentH3 = heading;
        }
        
        currentContent = [];
        contentStart = i + 1;
      } else {
        currentContent.push(line);
      }
    }
    
    // Don't forget the last section
    if (currentContent.length > 0) {
      const contentText = currentContent.join('\n').trim();
      const contentPreview = contentText.substring(0, 150) + (contentText.length > 150 ? '...' : '');
      
      if (currentH3 && currentH2 && sectionMap[currentH2]) {
        if (!sectionMap[currentH2].subsections) {
          sectionMap[currentH2].subsections = {};
        }
        sectionMap[currentH2].subsections[currentH3] = {
          content_preview: contentPreview,
          tokens: this.estimateTokens(contentText),
          md_reference: `${mdPath}#${this.generateUniqueAnchor(currentH3, mdPath)}`
        };
      } else if (currentH2 && sectionMap[currentH2]) {
        sectionMap[currentH2].content_preview = contentPreview;
        sectionMap[currentH2].tokens = this.estimateTokens(contentText);
      }
    }
    
    // Update section previews
    sections.forEach(section => {
      if (sectionMap[section.title]) {
        section.content_preview = sectionMap[section.title].content_preview || '';
      }
    });
    
    return { sections, sectionMap };
  }

  /**
   * Extract summary from Overview or first paragraph
   */
  extractSummary(content) {
    const overviewMatch = content.match(/##\s+Overview\s*\n([\s\S]*?)(?=\n##|\n#[^#]|$)/i);
    if (overviewMatch) {
      const overview = overviewMatch[1].trim();
      const sentences = overview.split(/\.\s+/);
      return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
    }
    
    // Fallback: first paragraph after title
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^#\s+/) && i + 1 < lines.length) {
        while (i + 1 < lines.length && !lines[i + 1].trim()) i++;
        if (i + 1 < lines.length) {
          return lines[i + 1].trim();
        }
      }
    }
    
    return "Document summary not available";
  }

  /**
   * Extract key points from document
   */
  extractKeyPoints(content, sectionMap) {
    const keyPoints = [];
    
    // Look for bullet points in key sections
    const keySections = ['Key Features', 'Key Concepts', 'Core Concepts', 'Key Benefits', 'Key Points'];
    
    for (const sectionName of keySections) {
      if (sectionMap[sectionName]) {
        const sectionContent = this.extractSectionContent(content, sectionName);
        const bulletPoints = sectionContent.match(/^\s*[\*\-]\s+(.+)$/gm);
        if (bulletPoints) {
          bulletPoints.forEach(point => {
            const cleanPoint = point.replace(/^\s*[\*\-]\s+/, '').trim();
            if (cleanPoint.length > 10 && cleanPoint.length < 100) {
              keyPoints.push(cleanPoint);
            }
          });
        }
      }
    }
    
    return keyPoints.slice(0, 10); // Limit to 10 key points
  }

  /**
   * Extract section content by name
   */
  extractSectionContent(content, sectionName) {
    const regex = new RegExp(`##\\s+${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n##|\\n#[^#]|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1] : '';
  }

  /**
   * Process general document (aaa-documents, project-documents)
   */
  async processGeneralDocument(mdPath, outputDir) {
    try {
      const content = await fs.readFile(mdPath, 'utf-8');
      const fileName = path.basename(mdPath, '.md');
      const relativePath = this.getRelativePath(mdPath);
      
      // Extract title
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName;
      
      // Generate file hash
      const fileHash = crypto.createHash('md5').update(content).digest('hex');
      
      // Check if JSON exists and is up to date
      const outputPath = path.join(outputDir, `${fileName}.json`);
      if (await this.fileExists(outputPath)) {
        const existingJson = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
        if (existingJson.meta?.file_hash === fileHash) {
          this.stats.skipped++;
          console.log(`⏭️  ${fileName}.md → Already up to date`);
          return null;
        }
      }
      
      // Extract sections with references
      const { sections, sectionMap } = this.extractSectionsWithReferences(content, relativePath);
      
      // Extract summary and key points
      const summary = this.extractSummary(content);
      const keyPoints = this.extractKeyPoints(content, sectionMap);
      
      // Calculate tokens
      const fullTokens = this.estimateTokens(content);
      const summaryTokens = this.estimateTokens(summary) + this.estimateTokens(JSON.stringify(keyPoints));
      
      // Determine document type
      const documentType = this.determineDocumentType(fileName, content);
      
      // Build JSON structure
      const jsonData = {
        meta: {
          document: fileName,
          title: title,
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          source_file: relativePath,
          document_type: documentType,
          file_hash: fileHash,
          estimated_tokens: summaryTokens + sections.length * 50,
          full_md_tokens: fullTokens
        },
        summary: summary,
        sections: sections,
        key_points: keyPoints,
        usage_context: this.determineUsageContext(fileName, content),
        section_details: sectionMap
      };
      
      // Write JSON file
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));
      
      // Update stats
      if (await this.fileExists(outputPath)) {
        this.stats.updated++;
      } else {
        this.stats.created++;
      }
      this.stats.processed++;
      
      const reduction = ((fullTokens - jsonData.meta.estimated_tokens) / fullTokens * 100).toFixed(1);
      this.stats.totalTokenReduction += parseFloat(reduction);
      
      console.log(`✓ ${fileName}.md → ${reduction}% token reduction`);
      
      return {
        file: fileName,
        path: outputPath,
        tokens: jsonData.meta.estimated_tokens,
        reduction: parseFloat(reduction)
      };
      
    } catch (error) {
      console.error(`✗ Error processing ${mdPath}: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Process agent document with specialized structure
   */
  async processAgentDocument(mdPath, outputDir) {
    try {
      const content = await fs.readFile(mdPath, 'utf-8');
      const fileName = path.basename(mdPath, '.md');
      const relativePath = this.getRelativePath(mdPath);
      
      // Generate file hash
      const fileHash = crypto.createHash('md5').update(content).digest('hex');
      
      // Check if JSON exists and is up to date
      const outputPath = path.join(outputDir, `${fileName}.json`);
      if (await this.fileExists(outputPath)) {
        const existingJson = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
        if (existingJson.meta?.file_hash === fileHash) {
          this.stats.skipped++;
          console.log(`⏭️  ${fileName}.md → Already up to date`);
          return null;
        }
      }
      
      // Use existing agent JSON generator for consistency
      const { parseAgentMarkdown } = require('./generate-agent-json.js');
      const agentJson = await parseAgentMarkdown(mdPath);
      
      // Add file hash for change detection
      agentJson.meta.file_hash = fileHash;
      
      // Write JSON file
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(agentJson, null, 2));
      
      // Update stats
      if (await this.fileExists(outputPath)) {
        this.stats.updated++;
      } else {
        this.stats.created++;
      }
      this.stats.processed++;
      
      const reduction = ((agentJson.meta.full_md_tokens - agentJson.meta.estimated_tokens) / agentJson.meta.full_md_tokens * 100).toFixed(1);
      this.stats.totalTokenReduction += parseFloat(reduction);
      
      console.log(`✓ ${fileName}.md → ${reduction}% token reduction (agent)`);
      
      return {
        file: fileName,
        path: outputPath,
        tokens: agentJson.meta.estimated_tokens,
        reduction: parseFloat(reduction),
        type: 'agent'
      };
      
    } catch (error) {
      console.error(`✗ Error processing agent ${mdPath}: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Determine document type based on content
   */
  determineDocumentType(fileName, content) {
    const contentLower = content.toLowerCase();
    
    if (fileName.includes('guide') || contentLower.includes('## step-by-step')) {
      return 'guide';
    } else if (fileName.includes('template')) {
      return 'template';
    } else if (fileName.includes('workflow')) {
      return 'workflow';
    } else if (fileName.includes('standard') || fileName.includes('specification')) {
      return 'standard';
    } else if (contentLower.includes('## api') || contentLower.includes('## architecture')) {
      return 'technical';
    } else {
      return 'general_documentation';
    }
  }

  /**
   * Determine usage context for document
   */
  determineUsageContext(fileName, content) {
    const contexts = [];
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('agent') || contentLower.includes('coordination')) {
      contexts.push('agent_coordination');
    }
    if (contentLower.includes('workflow') || contentLower.includes('process')) {
      contexts.push('workflow_guidance');
    }
    if (contentLower.includes('api') || contentLower.includes('integration')) {
      contexts.push('technical_integration');
    }
    if (contentLower.includes('sprint') || contentLower.includes('agile')) {
      contexts.push('sprint_management');
    }
    if (contentLower.includes('deploy') || contentLower.includes('production')) {
      contexts.push('deployment');
    }
    
    return contexts.length > 0 ? contexts : ['general_reference'];
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all markdown files recursively
   */
  async getAllMarkdownFiles(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.git', 'machine-data'].includes(file.name)) {
          continue;
        }
        await this.getAllMarkdownFiles(fullPath, fileList);
      } else if (file.name.endsWith('.md') && !file.name.startsWith('README')) {
        fileList.push(fullPath);
      }
    }
    
    return fileList;
  }

  /**
   * Convert documents by type
   */
  async convertDocumentType(type) {
    const config = this.documentTypes[type];
    if (!config) {
      throw new Error(`Unknown document type: ${type}`);
    }
    
    const baseDir = path.join(__dirname, '..', '..');
    const inputDir = path.join(baseDir, config.inputDir);
    const outputDir = path.join(baseDir, config.outputDir);
    
    console.log(`\n📁 Converting ${type}...`);
    console.log(`Input: ${config.inputDir}/`);
    console.log(`Output: ${config.outputDir}/`);
    console.log('='.repeat(50));
    
    // Get all markdown files
    const mdFiles = await this.getAllMarkdownFiles(inputDir);
    console.log(`Found ${mdFiles.length} markdown files\n`);
    
    const results = [];
    for (const filePath of mdFiles) {
      const relativePath = path.relative(inputDir, filePath);
      const outputSubdir = path.dirname(relativePath);
      const outputDirFull = path.join(outputDir, outputSubdir);
      
      const processor = this[config.processor].bind(this);
      const result = await processor(filePath, outputDirFull);
      if (result) results.push(result);
    }
    
    return results;
  }

  /**
   * Update CLAUDE.md references
   */
  async updateClaudeMdReferences(results) {
    const claudeMdPath = path.join(__dirname, '..', '..', 'CLAUDE.md');
    
    try {
      let claudeMdContent = await fs.readFile(claudeMdPath, 'utf-8');
      let updatesCount = 0;
      
      // Find and update JSON path references
      results.forEach(result => {
        if (!result) return;
        
        // Look for references to the MD file
        const mdFileName = result.file + '.md';
        const jsonPath = this.getRelativePath(result.path);
        
        // Pattern to find MD references and replace with JSON
        const patterns = [
          // Direct file references
          new RegExp(`(["'\`])([^"'\`]*\/)${mdFileName}(["'\`])`, 'g'),
          // Reference documentation patterns
          new RegExp(`(path|file|document):\\s*(["'\`])([^"'\`]*\/)${mdFileName}(["'\`])`, 'g')
        ];
        
        patterns.forEach(pattern => {
          const matches = claudeMdContent.match(pattern);
          if (matches) {
            claudeMdContent = claudeMdContent.replace(pattern, (match, quote1, path, quote2) => {
              updatesCount++;
              const newPath = jsonPath.replace(/.*\/machine-data\//, 'machine-data/');
              return `${quote1}${newPath}${quote2 || quote1}`;
            });
          }
        });
      });
      
      if (updatesCount > 0) {
        // Backup CLAUDE.md
        const backupPath = claudeMdPath + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
        await fs.writeFile(backupPath, await fs.readFile(claudeMdPath, 'utf-8'));
        
        // Write updated CLAUDE.md
        await fs.writeFile(claudeMdPath, claudeMdContent);
        
        this.stats.claudeMdUpdates = updatesCount;
        console.log(`\n✓ Updated ${updatesCount} references in CLAUDE.md`);
        console.log(`  Backup saved to: ${path.basename(backupPath)}`);
      } else {
        console.log('\n✓ No CLAUDE.md updates needed');
      }
      
    } catch (error) {
      console.error(`\n✗ Error updating CLAUDE.md: ${error.message}`);
    }
  }

  /**
   * Generate summary report
   */
  async generateReport(allResults) {
    const reportDir = path.join(__dirname, '..', 'conversion-reports');
    await fs.mkdir(reportDir, { recursive: true });
    
    const report = {
      generated: new Date().toISOString(),
      summary: {
        total_files: this.stats.processed + this.stats.errors + this.stats.skipped,
        processed: this.stats.processed,
        created: this.stats.created,
        updated: this.stats.updated,
        skipped: this.stats.skipped,
        errors: this.stats.errors,
        average_token_reduction: this.stats.processed > 0 
          ? (this.stats.totalTokenReduction / this.stats.processed).toFixed(1)
          : 0,
        claude_md_updates: this.stats.claudeMdUpdates
      },
      conversions: {
        agents: allResults.agents || [],
        aaa_documents: allResults.aaaDocuments || [],
        project_documents: allResults.projectDocuments || []
      }
    };
    
    const reportPath = path.join(reportDir, `conversion-report-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    return reportPath;
  }

  /**
   * Run conversion for specific type or all
   */
  async run(documentType = 'all') {
    console.log('\n🚀 Universal MD to JSON Converter');
    console.log('='.repeat(50));
    
    const allResults = {};
    
    if (documentType === 'all') {
      // Convert all types
      for (const type of Object.keys(this.documentTypes)) {
        allResults[type] = await this.convertDocumentType(type);
      }
    } else {
      // Convert specific type
      allResults[documentType] = await this.convertDocumentType(documentType);
    }
    
    // Update CLAUDE.md references
    const flatResults = Object.values(allResults).flat();
    await this.updateClaudeMdReferences(flatResults);
    
    // Generate report
    const reportPath = await this.generateReport(allResults);
    
    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Conversion Summary');
    console.log('='.repeat(50));
    console.log(`Total files scanned: ${this.stats.processed + this.stats.errors + this.stats.skipped}`);
    console.log(`✓ Processed: ${this.stats.processed}`);
    console.log(`  - Created: ${this.stats.created}`);
    console.log(`  - Updated: ${this.stats.updated}`);
    console.log(`⏭️  Skipped (up to date): ${this.stats.skipped}`);
    console.log(`✗ Errors: ${this.stats.errors}`);
    if (this.stats.processed > 0) {
      console.log(`\n📉 Average token reduction: ${(this.stats.totalTokenReduction / this.stats.processed).toFixed(1)}%`);
    }
    if (this.stats.claudeMdUpdates > 0) {
      console.log(`\n📝 CLAUDE.md updates: ${this.stats.claudeMdUpdates} references`);
    }
    console.log(`\n📄 Full report: ${this.getRelativePath(reportPath)}`);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const validTypes = ['all', 'agents', 'aaaDocuments', 'projectDocuments'];
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Universal MD to JSON Converter

Usage: node universal-md-to-json-converter.js [type]

Types:
  all               Convert all document types (default)
  agents            Convert ai-agents only
  aaaDocuments      Convert aaa-documents only
  projectDocuments  Convert project-documents only

Examples:
  node universal-md-to-json-converter.js
  node universal-md-to-json-converter.js agents
  node universal-md-to-json-converter.js aaaDocuments
`);
    process.exit(0);
  }
  
  const type = args[0] || 'all';
  if (!validTypes.includes(type)) {
    console.error(`Error: Invalid type '${type}'. Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
  }
  
  const converter = new UniversalMdToJsonConverter();
  converter.run(type).catch(console.error);
}

module.exports = UniversalMdToJsonConverter;