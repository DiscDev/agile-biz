#!/usr/bin/env node

/**
 * State Backup Hook Handler
 * Creates periodic backups of project state
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class StateBackupHandler {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.stateDir = path.join(this.projectRoot, 'project-state');
    this.backupDir = path.join(this.stateDir, 'backups');
    this.config = this.loadConfig();
  }

  parseContext() {
    return {
      filePath: process.env.FILE_PATH || process.argv[2],
      triggerType: process.env.TRIGGER_TYPE || 'file-change',
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadConfig() {
    return {
      maxBackups: 20,
      intervalMinutes: 30,
      compressionThreshold: 1048576, // 1MB
      criticalFiles: [
        'runtime.json',
        'runtime.json',
        'decisions/persistent.json'
      ]
    };
  }

  async execute() {
    try {
      const { filePath, triggerType } = this.context;
      
      // Check if backup is needed
      if (!this.shouldBackup(filePath, triggerType)) {
        return { status: 'skipped', reason: 'Backup not needed' };
      }

      // Ensure backup directory exists
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Create backup
      const backupInfo = await this.createBackup();
      
      // Cleanup old backups
      await this.cleanupOldBackups();

      // Verify backup integrity
      const isValid = await this.verifyBackup(backupInfo.path);
      
      return {
        status: 'success',
        backup: backupInfo,
        verified: isValid,
        totalBackups: this.countBackups()
      };

    } catch (error) {
      console.error('State backup failed:', error);
      throw error;
    }
  }

  shouldBackup(filePath, triggerType) {
    // Always backup on time interval
    if (triggerType === 'time-interval') {
      return true;
    }

    // Check if it's a critical state file
    if (filePath) {
      const relativePath = this.getRelativePath(filePath);
      return this.config.criticalFiles.some(critical => 
        relativePath.includes(critical)
      );
    }

    // Check last backup time
    const lastBackup = this.getLastBackupTime();
    if (!lastBackup) return true;

    const minutesSinceBackup = (Date.now() - lastBackup) / 60000;
    return minutesSinceBackup >= this.config.intervalMinutes;
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `state-backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);

    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });

    // Determine what to backup
    const filesToBackup = this.getFilesToBackup();
    const backupManifest = {
      timestamp: this.context.timestamp,
      trigger: this.context.triggerType,
      agent: this.context.activeAgent,
      files: [],
      checksums: {},
      compressed: false
    };

    // Copy files to backup
    let totalSize = 0;
    for (const file of filesToBackup) {
      const sourcePath = path.join(this.stateDir, file);
      if (!fs.existsSync(sourcePath)) continue;

      const destPath = path.join(backupPath, file);
      const destDir = path.dirname(destPath);
      
      // Ensure destination directory exists
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy file
      const content = fs.readFileSync(sourcePath);
      fs.writeFileSync(destPath, content);
      
      // Calculate checksum
      const checksum = crypto.createHash('md5').update(content).digest('hex');
      backupManifest.checksums[file] = checksum;
      backupManifest.files.push(file);
      
      totalSize += content.length;
    }

    // Compress if needed
    if (totalSize > this.config.compressionThreshold) {
      await this.compressBackup(backupPath, backupManifest);
    }

    // Save manifest
    fs.writeFileSync(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(backupManifest, null, 2)
    );

    return {
      name: backupName,
      path: backupPath,
      size: totalSize,
      fileCount: backupManifest.files.length,
      compressed: backupManifest.compressed
    };
  }

  getFilesToBackup() {
    const files = [];
    
    // Add all critical files
    files.push(...this.config.criticalFiles);
    
    // Add session history (last 7 days)
    const sessionDir = 'session-history';
    if (fs.existsSync(path.join(this.stateDir, sessionDir))) {
      const sessions = fs.readdirSync(path.join(this.stateDir, sessionDir))
        .filter(f => f.endsWith('.json'))
        .sort()
        .slice(-7); // Last 7 sessions
      
      sessions.forEach(session => {
        files.push(path.join(sessionDir, session));
      });
    }
    
    // Add recent checkpoints
    const checkpointDir = 'checkpoints';
    if (fs.existsSync(path.join(this.stateDir, checkpointDir))) {
      const checkpoints = fs.readdirSync(path.join(this.stateDir, checkpointDir))
        .filter(f => f.endsWith('.json'))
        .sort()
        .slice(-5); // Last 5 checkpoints
      
      checkpoints.forEach(checkpoint => {
        files.push(path.join(checkpointDir, checkpoint));
      });
    }
    
    return [...new Set(files)]; // Remove duplicates
  }

  async compressBackup(backupPath, manifest) {
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    const zipPath = `${backupPath}.zip`;
    const output = fs.createWriteStream(zipPath);
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        // Remove uncompressed backup
        this.removeDirectory(backupPath);
        manifest.compressed = true;
        resolve();
      });
      
      archive.on('error', reject);
      
      archive.pipe(output);
      archive.directory(backupPath, false);
      archive.finalize();
    });
  }

  async verifyBackup(backupPath) {
    try {
      const manifestPath = path.join(backupPath, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        return false;
      }
      
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Verify each file's checksum
      for (const [file, expectedChecksum] of Object.entries(manifest.checksums)) {
        const filePath = path.join(backupPath, file);
        if (!fs.existsSync(filePath)) {
          console.error(`Backup verification failed: ${file} missing`);
          return false;
        }
        
        const content = fs.readFileSync(filePath);
        const actualChecksum = crypto.createHash('md5').update(content).digest('hex');
        
        if (actualChecksum !== expectedChecksum) {
          console.error(`Backup verification failed: ${file} checksum mismatch`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Backup verification error:', error);
      return false;
    }
  }

  async cleanupOldBackups() {
    const backups = this.getBackupList();
    
    if (backups.length <= this.config.maxBackups) {
      return;
    }
    
    // Sort by creation time (oldest first)
    backups.sort((a, b) => a.created - b.created);
    
    // Remove oldest backups
    const toRemove = backups.length - this.config.maxBackups;
    for (let i = 0; i < toRemove; i++) {
      const backup = backups[i];
      try {
        if (backup.path.endsWith('.zip')) {
          fs.unlinkSync(backup.path);
        } else {
          this.removeDirectory(backup.path);
        }
        console.log(`Removed old backup: ${backup.name}`);
      } catch (error) {
        console.error(`Failed to remove backup: ${backup.name}`, error);
      }
    }
  }

  getBackupList() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }
    
    const entries = fs.readdirSync(this.backupDir);
    const backups = [];
    
    entries.forEach(entry => {
      const fullPath = path.join(this.backupDir, entry);
      const stats = fs.statSync(fullPath);
      
      if (entry.startsWith('state-backup-')) {
        backups.push({
          name: entry,
          path: fullPath,
          created: stats.birthtime.getTime(),
          size: stats.size
        });
      }
    });
    
    return backups;
  }

  getLastBackupTime() {
    const backups = this.getBackupList();
    if (backups.length === 0) return null;
    
    const latest = backups.reduce((prev, current) => 
      prev.created > current.created ? prev : current
    );
    
    return latest.created;
  }

  countBackups() {
    return this.getBackupList().length;
  }

  getRelativePath(filePath) {
    return filePath.replace(this.stateDir, '').replace(/^[/\\]/, '');
  }

  removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.removeDirectory(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }
}

if (require.main === module) {
  const handler = new StateBackupHandler();
  handler.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = StateBackupHandler;