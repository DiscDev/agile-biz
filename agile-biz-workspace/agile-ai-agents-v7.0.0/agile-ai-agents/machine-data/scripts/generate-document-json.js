#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Enhanced Document JSON Generator with Section References
 * Processes markdown documents to create JSON with section-level references
 * for progressive context loading
 */

class DocumentJsonGenerator {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      totalTokenReduction: 0
    };
  }

  /**
   * Generate anchor from heading text (GitHub-style)
   */
  generateAnchor(heading) {
    return heading
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
  }

  /**
   * Estimate token count (1 token ≈ 4 characters)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Extract sections with hierarchy and references
   */
  extractSections(content, mdPath) {
    const lines = content.split('\n');
    const sections = {};
    const anchorCounts = new Map();
    
    let currentSection = null;
    let currentSubsection = null;
    let currentContent = [];
    let currentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);

      if (headingMatch) {
        // Save previous section content
        if (currentSection) {
          const contentText = currentContent.join('\n').trim();
          if (currentSubsection) {
            if (!sections[currentSection].subsections) {
              sections[currentSection].subsections = {};
            }
            sections[currentSection].subsections[currentSubsection] = {
              tokens: this.estimateTokens(contentText),
              md_reference: `${mdPath}#${this.generateUniqueAnchor(currentSubsection, anchorCounts)}`
            };
          } else {
            sections[currentSection].content_tokens = this.estimateTokens(contentText);
          }
        }

        const level = headingMatch[1].length;
        const heading = headingMatch[2];
        
        if (level === 2) {
          // New major section
          currentSection = heading;
          currentSubsection = null;
          currentContent = [];
          currentLevel = level;
          
          const anchor = this.generateUniqueAnchor(heading, anchorCounts);
          sections[currentSection] = {
            tokens: 0, // Will be calculated later
            md_reference: `${mdPath}#${anchor}`,
            subsections: {}
          };
        } else if (level === 3 && currentSection) {
          // Subsection
          currentSubsection = heading;
          currentContent = [];
        } else if (level === 1) {
          // Document title, skip
          continue;
        }
      } else {
        currentContent.push(line);
      }
    }

    // Save final section
    if (currentSection && currentContent.length > 0) {
      const contentText = currentContent.join('\n').trim();
      if (currentSubsection) {
        if (!sections[currentSection].subsections) {
          sections[currentSection].subsections = {};
        }
        sections[currentSection].subsections[currentSubsection] = {
          tokens: this.estimateTokens(contentText),
          md_reference: `${mdPath}#${this.generateUniqueAnchor(currentSubsection, anchorCounts)}`
        };
      } else {
        sections[currentSection].content_tokens = this.estimateTokens(contentText);
      }
    }

    // Calculate total tokens for each section
    Object.keys(sections).forEach(sectionName => {
      const section = sections[sectionName];
      let totalTokens = section.content_tokens || 0;
      
      if (section.subsections) {
        Object.values(section.subsections).forEach(subsection => {
          totalTokens += subsection.tokens;
        });
      }
      
      section.tokens = totalTokens;
    });

    return sections;
  }

  /**
   * Generate unique anchor handling duplicates
   */
  generateUniqueAnchor(heading, anchorCounts) {
    const baseAnchor = this.generateAnchor(heading);
    const count = anchorCounts.get(baseAnchor) || 0;
    anchorCounts.set(baseAnchor, count + 1);
    
    return count === 0 ? baseAnchor : `${baseAnchor}-${count}`;
  }

  /**
   * Extract document summary from Overview section
   */
  extractSummary(content) {
    const overviewMatch = content.match(/##\s+Overview\s*\n([\s\S]*?)(?=\n##|\n#[^#]|$)/i);
    if (overviewMatch) {
      const overview = overviewMatch[1].trim();
      // Take first 2-3 sentences or first paragraph
      const sentences = overview.split(/\.\s+/);
      return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
    }
    
    // Fallback: extract first paragraph after title
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^#\s+/) && i + 1 < lines.length) {
        // Skip empty lines
        while (i + 1 < lines.length && !lines[i + 1].trim()) i++;
        if (i + 1 < lines.length) {
          return lines[i + 1].trim();
        }
      }
    }
    
    return "Document summary not available";
  }

  /**
   * Determine document category based on path and content
   */
  determineCategory(filePath, content) {
    const fileName = path.basename(filePath).toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (fileName.includes('guide') || contentLower.includes('## step-by-step')) {
      return 'guide';
    } else if (fileName.includes('template')) {
      return 'template';
    } else if (fileName.includes('standard') || fileName.includes('specification')) {
      return 'standard';
    } else if (contentLower.includes('## api') || contentLower.includes('## architecture')) {
      return 'technical';
    } else {
      return 'reference';
    }
  }

  /**
   * Generate context recommendations based on document structure
   */
  generateContextRecommendations(sections) {
    const sectionNames = Object.keys(sections);
    const recommendations = {
      minimal: ['meta', 'summary'],
      standard: ['minimal'],
      detailed: ['standard']
    };

    // Add overview to minimal if present
    if (sectionNames.includes('Overview')) {
      recommendations.minimal.push('sections.Overview');
    }

    // Add core sections to standard
    const coreSections = ['Core Concepts', 'Key Concepts', 'Prerequisites', 'Implementation Guide'];
    coreSections.forEach(section => {
      if (sectionNames.includes(section)) {
        recommendations.standard.push(`sections.${section.replace(/\s+/g, '_')}`);
      }
    });

    // Add all section references to detailed
    recommendations.detailed.push('all_section_references');

    return recommendations;
  }

  /**
   * Process a single markdown document
   */
  async processDocument(mdPath, outputDir) {
    try {
      const content = await fs.readFile(mdPath, 'utf-8');
      const fileName = path.basename(mdPath, '.md');
      const relativePath = this.getRelativePath(mdPath);
      
      // Extract document title
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName;
      
      // Generate file hash for change detection
      const fileHash = crypto.createHash('md5').update(content).digest('hex');
      
      // Extract sections with references
      const sections = this.extractSections(content, relativePath);
      
      // Calculate token counts
      const fullTokens = this.estimateTokens(content);
      const summaryTokens = this.estimateTokens(this.extractSummary(content));
      
      // Build JSON structure
      const jsonData = {
        meta: {
          document: fileName,
          title: title,
          category: this.determineCategory(mdPath, content),
          version: "1.0.0",
          last_updated: new Date().toISOString().split('T')[0],
          estimated_tokens: summaryTokens + Object.keys(sections).length * 50, // Approximate
          full_md_tokens: fullTokens,
          md_file: relativePath,
          file_hash: fileHash
        },
        summary: this.extractSummary(content),
        sections: sections,
        context_recommendations: this.generateContextRecommendations(sections),
        dependencies: this.extractDependencies(content)
      };
      
      // Write JSON file
      const outputPath = path.join(outputDir, `${fileName}.json`);
      await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));
      
      // Update stats
      this.stats.processed++;
      const reduction = ((fullTokens - jsonData.meta.estimated_tokens) / fullTokens * 100).toFixed(1);
      this.stats.totalTokenReduction += parseFloat(reduction);
      
      console.log(`✓ ${fileName}.md → ${reduction}% token reduction`);
      
      return {
        file: fileName,
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
   * Get relative path from agile-ai-agents root
   */
  getRelativePath(filePath) {
    const parts = filePath.split(path.sep);
    const agileIndex = parts.findIndex(p => p === 'agile-ai-agents');
    return agileIndex >= 0 ? parts.slice(agileIndex).join('/') : filePath;
  }

  /**
   * Extract document dependencies
   */
  extractDependencies(content) {
    const dependencies = [];
    const linkPattern = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
    let match;
    
    while ((match = linkPattern.exec(content)) !== null) {
      const link = match[2];
      if (!link.startsWith('http') && !dependencies.includes(link)) {
        dependencies.push(link);
      }
    }
    
    return dependencies;
  }

  /**
   * Get all markdown files recursively
   */
  async getAllMarkdownFiles(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Recursively search subdirectories
        await this.getAllMarkdownFiles(fullPath, fileList);
      } else if (file.name.endsWith('.md')) {
        fileList.push(fullPath);
      }
    }
    
    return fileList;
  }

  /**
   * Process all documents in a directory (including subdirectories)
   */
  async processDirectory(inputDir, outputDir) {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Get all markdown files recursively
    const mdFiles = await this.getAllMarkdownFiles(inputDir);
    
    console.log(`Found ${mdFiles.length} markdown files to process\n`);
    
    const results = [];
    for (const filePath of mdFiles) {
      // Create subdirectory structure in output if needed
      const relativePath = path.relative(inputDir, filePath);
      const outputSubdir = path.dirname(relativePath);
      const outputDirFull = path.join(outputDir, outputSubdir);
      
      if (outputSubdir !== '.') {
        await fs.mkdir(outputDirFull, { recursive: true });
      }
      
      const result = await this.processDocument(
        filePath,
        outputSubdir === '.' ? outputDir : outputDirFull
      );
      if (result) results.push(result);
    }
    
    return results;
  }

  /**
   * Generate summary report
   */
  async generateReport(results, outputDir) {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        total_files: this.stats.processed + this.stats.errors,
        successful: this.stats.processed,
        errors: this.stats.errors,
        average_token_reduction: this.stats.processed > 0 
          ? (this.stats.totalTokenReduction / this.stats.processed).toFixed(1)
          : 0
      },
      files: results.filter(r => r !== null)
    };
    
    await fs.writeFile(
      path.join(outputDir, 'generation-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    return report;
  }
}

// Main execution
async function main() {
  const generator = new DocumentJsonGenerator();
  const baseDir = path.join(__dirname, '..', '..');
  
  // Process both aaa-documents and project-documents
  const directories = [
    {
      input: path.join(baseDir, 'aaa-documents'),
      output: path.join(baseDir, 'machine-data', 'aaa-documents-json')
    },
    {
      input: path.join(baseDir, 'project-documents'),
      output: path.join(baseDir, 'machine-data', 'project-documents-json')
    }
  ];
  
  const allResults = [];
  
  for (const dir of directories) {
    console.log(`\nProcessing ${path.basename(dir.input)}...`);
    console.log('='.repeat(50));
    
    const results = await generator.processDirectory(dir.input, dir.output);
    allResults.push(...results);
    
    // Generate directory-specific report
    await generator.generateReport(results, dir.output);
  }
  
  // Display summary
  console.log('\n' + '='.repeat(50));
  console.log('=== Overall Summary ===');
  console.log(`Total documents processed: ${generator.stats.processed}`);
  console.log(`Errors: ${generator.stats.errors}`);
  console.log(`Average token reduction: ${(generator.stats.totalTokenReduction / generator.stats.processed).toFixed(1)}%`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DocumentJsonGenerator;