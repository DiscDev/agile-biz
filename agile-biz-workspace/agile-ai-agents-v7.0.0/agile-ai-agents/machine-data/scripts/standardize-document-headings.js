#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Standardize Document Headings
 * Removes numbering and normalizes section names for consistent anchor generation
 */

class DocumentHeadingStandardizer {
  constructor() {
    this.stats = {
      processed: 0,
      modified: 0,
      errors: 0
    };

    // Standard heading mappings
    this.HEADING_MAPPINGS = {
      // Common variations to standardize
      'Introduction': 'Overview',
      'Getting Started': 'Overview',
      'About': 'Overview',
      'Summary': 'Overview',
      'Prerequisites': 'Prerequisites',
      'Requirements': 'Prerequisites',
      'Concepts': 'Core Concepts',
      'Key Concepts': 'Core Concepts',
      'Implementation': 'Implementation Guide',
      'How to Use': 'Usage Guide',
      'Usage': 'Usage Guide',
      'How It Works': 'Implementation Guide',
      'Setup': 'Setup Guide',
      'Installation': 'Setup Guide',
      'Configuration': 'Configuration',
      'Examples': 'Examples',
      'Example': 'Examples',
      'Use Cases': 'Examples',
      'Best Practices': 'Best Practices',
      'Guidelines': 'Best Practices',
      'Troubleshooting': 'Troubleshooting',
      'Common Issues': 'Troubleshooting',
      'FAQ': 'Troubleshooting',
      'References': 'Reference Documentation',
      'Related Documents': 'Reference Documentation',
      'See Also': 'Reference Documentation',
      'Links': 'Reference Documentation',
      'Changelog': 'Version History',
      'History': 'Version History',
      'Versions': 'Version History'
    };
  }

  /**
   * Remove numbering from heading
   */
  removeNumbering(heading) {
    // Remove patterns like "1.", "1.1", "1.1.1", etc.
    return heading.replace(/^\d+(\.\d+)*\.\s*/, '');
  }

  /**
   * Standardize heading name
   */
  standardizeHeading(heading) {
    const cleaned = this.removeNumbering(heading).trim();
    return this.HEADING_MAPPINGS[cleaned] || cleaned;
  }

  /**
   * Process markdown content
   */
  processContent(content) {
    const lines = content.split('\n');
    let modified = false;
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Check if line is a heading
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        const level = headingMatch[1];
        const originalHeading = headingMatch[2];
        const standardized = this.standardizeHeading(originalHeading);
        
        if (originalHeading !== standardized) {
          line = `${level} ${standardized}`;
          modified = true;
        }
      }
      
      processedLines.push(line);
    }

    return { content: processedLines.join('\n'), modified };
  }

  /**
   * Process a single document
   */
  async processDocument(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { content: processedContent, modified } = this.processContent(content);
      
      if (modified) {
        await fs.writeFile(filePath, processedContent, 'utf-8');
        console.log(`✓ Standardized: ${path.basename(filePath)}`);
        this.stats.modified++;
      } else {
        console.log(`- No changes needed: ${path.basename(filePath)}`);
      }
      
      this.stats.processed++;
      
    } catch (error) {
      console.error(`✗ Error processing ${filePath}: ${error.message}`);
      this.stats.errors++;
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
  async processDirectory(dirPath) {
    const mdFiles = await this.getAllMarkdownFiles(dirPath);
    
    console.log(`Found ${mdFiles.length} markdown files in ${path.basename(dirPath)}\n`);
    
    for (const filePath of mdFiles) {
      await this.processDocument(filePath);
    }
  }

  /**
   * Display summary
   */
  displaySummary() {
    console.log('\n' + '='.repeat(50));
    console.log('=== Standardization Summary ===');
    console.log(`Total files processed: ${this.stats.processed}`);
    console.log(`Files modified: ${this.stats.modified}`);
    console.log(`Errors: ${this.stats.errors}`);
  }
}

// Main execution
async function main() {
  const standardizer = new DocumentHeadingStandardizer();
  const baseDir = path.join(__dirname, '..', '..');
  
  // Process both directories
  console.log('Standardizing document headings...\n');
  
  console.log('Processing aaa-documents...');
  console.log('='.repeat(50));
  await standardizer.processDirectory(path.join(baseDir, 'aaa-documents'));
  
  console.log('\nProcessing project-documents...');
  console.log('='.repeat(50));
  await standardizer.processDirectory(path.join(baseDir, 'project-documents'));
  
  standardizer.displaySummary();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DocumentHeadingStandardizer;