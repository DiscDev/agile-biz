#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Standardize agent markdown headings for JSON reference generation
 */

const CONFIG = {
  agentsDir: path.join(__dirname, '../../ai-agents'),
  backupDir: path.join(__dirname, '../../ai-agents-backup'),
  dryRun: false // Set to true to preview changes without modifying files
};

// Standard heading mappings
const HEADING_MAPPINGS = {
  // Section mappings
  'Example Workflows': 'Workflows',
  'Workflows & Processes': 'Workflows',
  'Common Workflows': 'Workflows',
  'Key Workflows': 'Workflows',
  'Workflow Patterns': 'Workflows',
  
  // Coordination mappings
  'Working with Other Agents': 'Agent Coordination',
  'Coordination with Other Agents': 'Agent Coordination',
  'Agent Interactions': 'Agent Coordination',
  'Inter-Agent Communication': 'Agent Coordination',
  
  // Boundaries mappings
  'Clear Boundaries (What [^)]+)': 'Clear Boundaries',
  'What .+ Does NOT Do': 'Clear Boundaries',
  
  // Success metrics mappings
  'Key Performance Indicators': 'Success Metrics',
  'Quality Metrics': 'Success Metrics',
  'Performance Metrics': 'Success Metrics'
};

/**
 * Standardize workflow headings by removing numbers and prefixes
 */
function standardizeWorkflowHeading(heading) {
  // Remove numbering (e.g., "1. ", "2.1 ", etc.)
  let cleaned = heading.replace(/^\d+\.?\d*\s*/, '');
  
  // Remove "Workflow" if it's not at the end
  cleaned = cleaned.replace(/^Workflow\s*[-:]\s*/i, '');
  
  // Ensure "Workflow" is at the end if not present
  if (!cleaned.match(/workflow\s*$/i)) {
    cleaned = cleaned.trim() + ' Workflow';
  }
  
  return cleaned;
}

/**
 * Process a single agent file
 */
async function processAgentFile(filePath) {
  const fileName = path.basename(filePath);
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let modified = false;
  const changes = [];
  const newLines = [];
  
  let inWorkflowsSection = false;
  let currentSectionLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      const level = headingMatch[1];
      const originalHeading = headingMatch[2].trim();
      let newHeading = originalHeading;
      
      // Check if we're entering/leaving workflows section
      if (level === '##') {
        inWorkflowsSection = false;
        currentSectionLevel = 2;
        
        // Apply section heading mappings
        for (const [pattern, replacement] of Object.entries(HEADING_MAPPINGS)) {
          const regex = new RegExp(`^${pattern}$`, 'i');
          if (originalHeading.match(regex)) {
            newHeading = replacement;
            if (replacement === 'Workflows') {
              inWorkflowsSection = true;
            }
            break;
          }
        }
      }
      
      // Standardize workflow subsection headings
      if (inWorkflowsSection && level === '###') {
        newHeading = standardizeWorkflowHeading(originalHeading);
      }
      
      // If heading changed, record it
      if (newHeading !== originalHeading) {
        modified = true;
        changes.push({
          line: i + 1,
          original: originalHeading,
          new: newHeading
        });
        line = `${level} ${newHeading}`;
      }
    }
    
    newLines.push(line);
  }
  
  return {
    fileName,
    content: newLines.join('\n'),
    modified,
    changes
  };
}

/**
 * Add missing standard sections if they don't exist
 */
function ensureStandardSections(content) {
  const lines = content.split('\n');
  const sections = new Set();
  
  // Find existing sections
  lines.forEach(line => {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      sections.add(match[1].trim());
    }
  });
  
  // Required sections
  const requiredSections = [
    'Overview',
    'Reference Documentation',
    'Core Responsibilities',
    'Workflows',
    'Agent Coordination',
    'Clear Boundaries',
    'Success Metrics'
  ];
  
  // Add missing sections
  const newLines = [...lines];
  for (const section of requiredSections) {
    if (!sections.has(section) && !sections.has(section.replace(' ', '_'))) {
      // Find where to insert (before Version History if exists, otherwise at end)
      let insertIndex = newLines.length;
      for (let i = 0; i < newLines.length; i++) {
        if (newLines[i].match(/^##\s+Version History/)) {
          insertIndex = i - 1;
          break;
        }
      }
      
      // Insert section with placeholder
      newLines.splice(insertIndex, 0, '', `## ${section}`, '', `*[This section needs to be documented]*`, '');
      console.log(`  Added missing section: ${section}`);
    }
  }
  
  return newLines.join('\n');
}

/**
 * Main processing function
 */
async function standardizeAllAgents() {
  try {
    // Create backup directory
    if (!CONFIG.dryRun) {
      await fs.mkdir(CONFIG.backupDir, { recursive: true });
    }
    
    // Get all markdown files
    const files = await fs.readdir(CONFIG.agentsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`Found ${mdFiles.length} agent files to process`);
    console.log(CONFIG.dryRun ? '🔍 DRY RUN MODE - No files will be modified' : '✏️  LIVE MODE - Files will be modified');
    console.log('');
    
    const results = {
      processed: 0,
      modified: 0,
      errors: 0
    };
    
    for (const file of mdFiles) {
      const filePath = path.join(CONFIG.agentsDir, file);
      
      try {
        // Process file
        const result = await processAgentFile(filePath);
        results.processed++;
        
        if (result.modified) {
          results.modified++;
          console.log(`📝 ${file}`);
          result.changes.forEach(change => {
            console.log(`   Line ${change.line}: "${change.original}" → "${change.new}"`);
          });
          
          // Ensure standard sections exist
          const finalContent = ensureStandardSections(result.content);
          
          if (!CONFIG.dryRun) {
            // Backup original
            const backupPath = path.join(CONFIG.backupDir, file);
            await fs.copyFile(filePath, backupPath);
            
            // Write modified content
            await fs.writeFile(filePath, finalContent);
          }
          console.log('');
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${file}: ${error.message}`);
        results.errors++;
      }
    }
    
    // Summary
    console.log('\n=== Summary ===');
    console.log(`Files processed: ${results.processed}`);
    console.log(`Files modified: ${results.modified}`);
    console.log(`Errors: ${results.errors}`);
    
    if (!CONFIG.dryRun && results.modified > 0) {
      console.log(`\nBackups saved to: ${CONFIG.backupDir}`);
    }
    
    if (CONFIG.dryRun && results.modified > 0) {
      console.log('\n⚠️  To apply these changes, run with dryRun: false');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Command line argument handling
const args = process.argv.slice(2);
if (args.includes('--dry-run') || args.includes('-d')) {
  CONFIG.dryRun = true;
}
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node standardize-agent-headings.js [options]');
  console.log('Options:');
  console.log('  -d, --dry-run    Preview changes without modifying files');
  console.log('  -h, --help       Show this help message');
  process.exit(0);
}

// Run standardization
standardizeAllAgents();