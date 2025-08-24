#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Folder Structure Validator
 * Ensures all project documents are created in the standard 30-folder structure
 */
class FolderStructureValidator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.configPath = path.join(projectRoot, 'machine-data', 'project-folder-structure-categories.json');
    this.projectDocsPath = path.join(projectRoot, 'project-documents');
    this.structure = null;
    this.folderMap = new Map();
    this.aliasMap = new Map();
  }

  /**
   * Load the folder structure configuration
   */
  async loadStructure() {
    if (!this.structure) {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      this.structure = JSON.parse(configContent);
      
      // Build lookup maps
      Object.entries(this.structure.folders).forEach(([key, folder]) => {
        this.folderMap.set(folder.name, folder);
        
        // Map aliases to standard folder names
        folder.aliases.forEach(alias => {
          this.aliasMap.set(alias.toLowerCase(), folder.name);
        });
      });
    }
    return this.structure;
  }

  /**
   * Get the standard folder name from an alias or incorrect name
   */
  getStandardFolderName(folderName) {
    // Check if it's already a standard name
    if (this.folderMap.has(folderName)) {
      return folderName;
    }
    
    // Check aliases
    const lowerName = folderName.toLowerCase();
    if (this.aliasMap.has(lowerName)) {
      return this.aliasMap.get(lowerName);
    }
    
    // Try fuzzy matching for common mistakes
    const fuzzyMatch = this.fuzzyMatchFolder(folderName);
    if (fuzzyMatch) {
      return fuzzyMatch;
    }
    
    return null;
  }

  /**
   * Fuzzy match folder names for common mistakes
   */
  fuzzyMatchFolder(folderName) {
    const normalizedInput = folderName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [standardName, folder] of this.folderMap) {
      const normalizedStandard = standardName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Check if the core words match
      if (normalizedInput.includes(normalizedStandard.substring(3)) || 
          normalizedStandard.includes(normalizedInput)) {
        return standardName;
      }
      
      // Check against description keywords
      const descWords = folder.description.toLowerCase().split(/\s+/);
      if (descWords.some(word => normalizedInput.includes(word) && word.length > 4)) {
        return standardName;
      }
    }
    
    return null;
  }

  /**
   * Check if a folder path contains prohibited temporary or phase folders
   */
  isProhibitedFolder(folderName) {
    const prohibitedPatterns = [
      /^phase-\d+/i,              // phase-1, phase-2, etc.
      /^phase-\d+-parallel/i,     // phase-1-parallel, phase-2-parallel, etc.
      /^temp/i,                   // temp, temporary folders
      /^tmp/i,                    // tmp folders
      /^parallel-/i,              // parallel-execution, etc.
      /^coordination-/i,          // coordination-temp, etc.
      /^orchestrator-temp/i,      // orchestrator temporary folders
      /^sprint-temp/i,            // sprint temporary folders
      /^agent-temp/i              // agent temporary folders
    ];
    
    return prohibitedPatterns.some(pattern => pattern.test(folderName));
  }

  /**
   * Validate a document path and suggest corrections
   */
  async validateDocumentPath(documentPath, agentName = null) {
    await this.loadStructure();
    
    const pathParts = documentPath.split(path.sep);
    const folderName = pathParts[0];
    
    const result = {
      isValid: false,
      folderName: folderName,
      standardFolder: null,
      correctedPath: null,
      message: '',
      agent: null,
      isProhibited: false
    };
    
    // Check for prohibited temporary/phase folders FIRST
    if (this.isProhibitedFolder(folderName)) {
      result.isProhibited = true;
      result.message = `PROHIBITED: Folder "${folderName}" violates folder structure rules. Temporary and phase folders are not allowed.`;
      
      // Force correction to appropriate standard folder
      if (agentName) {
        const agentFolders = this.getFoldersForAgent(agentName);
        if (agentFolders.length > 0) {
          result.standardFolder = agentFolders[0];
          pathParts[0] = agentFolders[0];
          result.correctedPath = pathParts.join(path.sep);
          result.message += ` MUST use: "${agentFolders[0]}" for ${agentName}`;
        }
      }
      return result;
    }
    
    // Get the standard folder name
    const standardFolder = this.getStandardFolderName(folderName);
    
    if (standardFolder) {
      result.standardFolder = standardFolder;
      result.isValid = (folderName === standardFolder);
      result.agent = this.folderMap.get(standardFolder).agent;
      
      if (!result.isValid) {
        // Build corrected path
        pathParts[0] = standardFolder;
        result.correctedPath = pathParts.join(path.sep);
        result.message = `Folder "${folderName}" should be "${standardFolder}"`;
      } else {
        result.message = 'Valid standard folder';
      }
      
      // Check if agent matches
      if (agentName && result.agent !== agentName) {
        result.message += `. Note: This folder is typically managed by ${result.agent}`;
      }
    } else {
      result.message = `Unknown folder "${folderName}". No standard folder found.`;
      
      // Suggest the most appropriate folder based on agent
      if (agentName) {
        const agentFolders = this.getFoldersForAgent(agentName);
        if (agentFolders.length > 0) {
          result.standardFolder = agentFolders[0];
          pathParts[0] = agentFolders[0];
          result.correctedPath = pathParts.join(path.sep);
          result.message += ` Suggested: "${agentFolders[0]}" for ${agentName}`;
        }
      }
    }
    
    return result;
  }

  /**
   * Get all folders managed by a specific agent
   */
  getFoldersForAgent(agentName) {
    const folders = [];
    for (const [folderName, folder] of this.folderMap) {
      if (folder.agent === agentName) {
        folders.push(folderName);
      }
    }
    return folders;
  }

  /**
   * Ensure a standard folder exists (create if needed)
   */
  async ensureStandardFolder(folderName) {
    await this.loadStructure();
    
    const standardFolder = this.getStandardFolderName(folderName);
    if (!standardFolder) {
      throw new Error(`"${folderName}" is not a standard folder`);
    }
    
    const folderPath = path.join(this.projectDocsPath, standardFolder);
    await fs.mkdir(folderPath, { recursive: true });
    
    return standardFolder;
  }

  /**
   * Scan project-documents for non-standard folders
   */
  async scanForNonStandardFolders() {
    await this.loadStructure();
    
    const issues = [];
    
    try {
      const entries = await fs.readdir(this.projectDocsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const folderName = entry.name;
          
          // Skip hidden folders
          if (folderName.startsWith('.')) continue;
          
          if (!this.folderMap.has(folderName)) {
            const standardName = this.getStandardFolderName(folderName);
            issues.push({
              current: folderName,
              suggested: standardName,
              type: standardName ? 'rename' : 'unknown'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error scanning folders:', error.message);
    }
    
    return issues;
  }

  /**
   * Fix non-standard folders (with dry-run option)
   */
  async fixNonStandardFolders(dryRun = true) {
    const issues = await this.scanForNonStandardFolders();
    const fixes = [];
    
    for (const issue of issues) {
      if (issue.type === 'rename' && issue.suggested) {
        const oldPath = path.join(this.projectDocsPath, issue.current);
        const newPath = path.join(this.projectDocsPath, issue.suggested);
        
        fixes.push({
          action: 'rename',
          from: issue.current,
          to: issue.suggested,
          oldPath,
          newPath
        });
        
        if (!dryRun) {
          try {
            // Check if target exists
            const targetExists = await fs.access(newPath).then(() => true).catch(() => false);
            
            if (targetExists) {
              console.warn(`⚠️  Cannot rename: ${issue.suggested} already exists`);
              fixes[fixes.length - 1].status = 'skipped';
              fixes[fixes.length - 1].reason = 'target exists';
            } else {
              await fs.rename(oldPath, newPath);
              fixes[fixes.length - 1].status = 'completed';
            }
          } catch (error) {
            fixes[fixes.length - 1].status = 'error';
            fixes[fixes.length - 1].error = error.message;
          }
        }
      } else if (issue.type === 'unknown') {
        fixes.push({
          action: 'review',
          folder: issue.current,
          message: 'Unknown folder - manual review required'
        });
      }
    }
    
    return fixes;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const validator = new FolderStructureValidator(path.join(__dirname, '..'));
  
  try {
    switch (command) {
      case 'validate':
        if (args.length < 2) {
          console.log('Usage: validate <document-path> [agent-name]');
          break;
        }
        const result = await validator.validateDocumentPath(args[1], args[2]);
        console.log(JSON.stringify(result, null, 2));
        break;
        
      case 'scan':
        console.log('Scanning for non-standard folders...\n');
        const issues = await validator.scanForNonStandardFolders();
        if (issues.length === 0) {
          console.log('✅ All folders follow the standard structure!');
        } else {
          console.log(`Found ${issues.length} non-standard folders:\n`);
          issues.forEach(issue => {
            if (issue.suggested) {
              console.log(`❌ "${issue.current}" → should be "${issue.suggested}"`);
            } else {
              console.log(`❓ "${issue.current}" → unknown folder`);
            }
          });
        }
        break;
        
      case 'fix':
        const dryRun = !args.includes('--execute');
        console.log(dryRun ? 'DRY RUN - No changes will be made\n' : 'EXECUTING FIXES\n');
        
        const fixes = await validator.fixNonStandardFolders(dryRun);
        if (fixes.length === 0) {
          console.log('✅ No fixes needed!');
        } else {
          fixes.forEach(fix => {
            if (fix.action === 'rename') {
              const status = dryRun ? 'would rename' : (fix.status || 'pending');
              console.log(`${status}: "${fix.from}" → "${fix.to}"`);
              if (fix.reason) console.log(`  Reason: ${fix.reason}`);
              if (fix.error) console.log(`  Error: ${fix.error}`);
            } else if (fix.action === 'review') {
              console.log(`review: "${fix.folder}" - ${fix.message}`);
            }
          });
          
          if (dryRun && fixes.some(f => f.action === 'rename')) {
            console.log('\nTo execute these changes, run: fix --execute');
          }
        }
        break;
        
      case 'list':
        await validator.loadStructure();
        console.log('Standard 30-Folder Structure:\n');
        const folders = Array.from(validator.folderMap.values());
        folders.forEach(folder => {
          console.log(`${folder.name.padEnd(30)} - ${folder.description}`);
          console.log(`  Agent: ${folder.agent}`);
          console.log(`  Aliases: ${folder.aliases.join(', ')}\n`);
        });
        break;
        
      default:
        console.log('Folder Structure Validator\n');
        console.log('Commands:');
        console.log('  validate <path> [agent]  - Validate a document path');
        console.log('  scan                     - Scan for non-standard folders');
        console.log('  fix [--execute]          - Fix non-standard folders (dry-run by default)');
        console.log('  list                     - List all standard folders');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for use by other modules
module.exports = FolderStructureValidator;

// Export methods for use in other modules
module.exports.validateBeforeExecution = async (documentPath, agentName = null) => {
  const validator = new FolderStructureValidator(path.join(__dirname, '..'));
  return await validator.validateBeforeExecution(documentPath, agentName);
};

module.exports.auditFolderStructure = async () => {
  const validator = new FolderStructureValidator(path.join(__dirname, '..'));
  return await validator.auditFolderStructure();
};

module.exports.isProhibitedFolder = (folderName) => {
  const validator = new FolderStructureValidator(path.join(__dirname, '..'));
  return validator.isProhibitedFolder(folderName);
};

// Run CLI if called directly
if (require.main === module) {
  main();
}