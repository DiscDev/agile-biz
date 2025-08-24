#!/usr/bin/env node

/**
 * Agent Update Rollback Script
 * Provides rollback capability for agent updates including Claude agents
 */

const fs = require('fs');
const path = require('path');

class AgentUpdateRollback {
  constructor() {
    this.projectRoot = path.join(__dirname, '../..');
    this.backupDir = path.join(this.projectRoot, '.agent-backups');
    this.agentDirs = {
      md: path.join(this.projectRoot, 'ai-agents'),
      json: path.join(this.projectRoot, 'machine-data/ai-agents-json'),
      claude: path.join(this.projectRoot, '.claude/agents')
    };
  }

  /**
   * Create backup of all agent files
   */
  async createBackup(description = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);
    
    console.log(`Creating backup: ${backupName}`);
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    // Create backup subdirectories
    const backupDirs = {
      md: path.join(backupPath, 'ai-agents'),
      json: path.join(backupPath, 'ai-agents-json'),
      claude: path.join(backupPath, 'claude-agents')
    };
    
    Object.values(backupDirs).forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });
    
    // Copy all agent files
    let fileCount = 0;
    
    // Backup MD files
    if (fs.existsSync(this.agentDirs.md)) {
      const mdFiles = fs.readdirSync(this.agentDirs.md).filter(f => f.endsWith('.md'));
      mdFiles.forEach(file => {
        fs.copyFileSync(
          path.join(this.agentDirs.md, file),
          path.join(backupDirs.md, file)
        );
        fileCount++;
      });
    }
    
    // Backup JSON files
    if (fs.existsSync(this.agentDirs.json)) {
      const jsonFiles = fs.readdirSync(this.agentDirs.json).filter(f => f.endsWith('.json'));
      jsonFiles.forEach(file => {
        fs.copyFileSync(
          path.join(this.agentDirs.json, file),
          path.join(backupDirs.json, file)
        );
        fileCount++;
      });
    }
    
    // Backup Claude agents
    if (fs.existsSync(this.agentDirs.claude)) {
      const claudeFiles = fs.readdirSync(this.agentDirs.claude).filter(f => f.endsWith('.md'));
      claudeFiles.forEach(file => {
        fs.copyFileSync(
          path.join(this.agentDirs.claude, file),
          path.join(backupDirs.claude, file)
        );
        fileCount++;
      });
    }
    
    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      description: description || 'Manual backup',
      fileCount,
      directories: Object.keys(backupDirs)
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`✅ Backup created successfully: ${fileCount} files backed up`);
    return backupName;
  }

  /**
   * List available backups
   */
  listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      console.log('No backups found.');
      return [];
    }
    
    const backups = fs.readdirSync(this.backupDir)
      .filter(dir => dir.startsWith('backup-'))
      .map(dir => {
        const metadataPath = path.join(this.backupDir, dir, 'backup-metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          return {
            name: dir,
            ...metadata
          };
        }
        return { name: dir, description: 'No metadata' };
      })
      .sort((a, b) => b.timestamp?.localeCompare(a.timestamp) || 0);
    
    console.log('\nAvailable backups:');
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.name}`);
      console.log(`   Created: ${backup.timestamp || 'Unknown'}`);
      console.log(`   Description: ${backup.description}`);
      console.log(`   Files: ${backup.fileCount || 'Unknown'}`);
      console.log('');
    });
    
    return backups;
  }

  /**
   * Rollback to a specific backup
   */
  async rollback(backupName) {
    const backupPath = path.join(this.backupDir, backupName);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }
    
    console.log(`Rolling back to: ${backupName}`);
    
    // Create a safety backup first
    const safetyBackup = await this.createBackup('Pre-rollback safety backup');
    
    try {
      let restoredCount = 0;
      
      // Restore MD files
      const mdBackupDir = path.join(backupPath, 'ai-agents');
      if (fs.existsSync(mdBackupDir)) {
        const files = fs.readdirSync(mdBackupDir);
        files.forEach(file => {
          fs.copyFileSync(
            path.join(mdBackupDir, file),
            path.join(this.agentDirs.md, file)
          );
          restoredCount++;
        });
      }
      
      // Restore JSON files
      const jsonBackupDir = path.join(backupPath, 'ai-agents-json');
      if (fs.existsSync(jsonBackupDir)) {
        const files = fs.readdirSync(jsonBackupDir);
        files.forEach(file => {
          fs.copyFileSync(
            path.join(jsonBackupDir, file),
            path.join(this.agentDirs.json, file)
          );
          restoredCount++;
        });
      }
      
      // Restore Claude agents
      const claudeBackupDir = path.join(backupPath, 'claude-agents');
      if (fs.existsSync(claudeBackupDir)) {
        const files = fs.readdirSync(claudeBackupDir);
        files.forEach(file => {
          fs.copyFileSync(
            path.join(claudeBackupDir, file),
            path.join(this.agentDirs.claude, file)
          );
          restoredCount++;
        });
      }
      
      console.log(`✅ Rollback successful: ${restoredCount} files restored`);
      console.log(`Safety backup created: ${safetyBackup}`);
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      console.log(`Attempting to restore from safety backup: ${safetyBackup}`);
      
      // Try to restore from safety backup
      await this.rollback(safetyBackup);
      throw error;
    }
  }

  /**
   * Clean old backups
   */
  cleanOldBackups(keepCount = 10) {
    const backups = this.listBackups();
    
    if (backups.length <= keepCount) {
      console.log(`Current backups (${backups.length}) within limit (${keepCount})`);
      return;
    }
    
    const toDelete = backups.slice(keepCount);
    console.log(`\nDeleting ${toDelete.length} old backups...`);
    
    toDelete.forEach(backup => {
      const backupPath = path.join(this.backupDir, backup.name);
      this.deleteDirectory(backupPath);
      console.log(`Deleted: ${backup.name}`);
    });
  }

  /**
   * Recursively delete a directory
   */
  deleteDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach((file) => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteDirectory(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }
}

// CLI interface
if (require.main === module) {
  const rollback = new AgentUpdateRollback();
  const command = process.argv[2];
  const param = process.argv[3];
  
  switch (command) {
    case 'backup':
      rollback.createBackup(param || 'Manual backup');
      break;
      
    case 'list':
      rollback.listBackups();
      break;
      
    case 'rollback':
      if (!param) {
        console.error('Please specify backup name');
        rollback.listBackups();
      } else {
        rollback.rollback(param)
          .catch(error => {
            console.error('Rollback failed:', error);
            process.exit(1);
          });
      }
      break;
      
    case 'clean':
      const keepCount = parseInt(param) || 10;
      rollback.cleanOldBackups(keepCount);
      break;
      
    default:
      console.log('Agent Update Rollback Tool');
      console.log('');
      console.log('Usage:');
      console.log('  node agent-update-rollback.js backup [description]  - Create backup');
      console.log('  node agent-update-rollback.js list                  - List backups');
      console.log('  node agent-update-rollback.js rollback <name>       - Rollback to backup');
      console.log('  node agent-update-rollback.js clean [keep_count]    - Clean old backups');
  }
}

module.exports = AgentUpdateRollback;