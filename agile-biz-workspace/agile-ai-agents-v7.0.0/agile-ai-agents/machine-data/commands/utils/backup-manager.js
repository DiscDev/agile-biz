/**
 * Backup Manager for AgileAiAgents
 * Handles backup and restore operations for reset commands
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackupManager {
  constructor() {
    this.backupRoot = path.join(process.cwd(), '.backup');
    this.manifestPath = path.join(this.backupRoot, 'manifest.json');
    this.ensureBackupDirectory();
  }

  /**
   * Ensure backup directory exists
   */
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupRoot)) {
      fs.mkdirSync(this.backupRoot, { recursive: true });
    }
    
    // Create .gitignore to exclude backups from git
    const gitignorePath = path.join(this.backupRoot, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, '*\n!.gitignore\n');
    }
  }

  /**
   * Load or create manifest
   */
  loadManifest() {
    if (fs.existsSync(this.manifestPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      } catch (error) {
        console.warn('Failed to load backup manifest, creating new one');
      }
    }
    return {
      version: '1.0',
      backups: {}
    };
  }

  /**
   * Save manifest
   */
  saveManifest(manifest) {
    fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
  }

  /**
   * Create a backup
   */
  async createBackup(category, sourcePath, metadata = {}) {
    // Validate source exists
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    // Create category directory
    const categoryDir = path.join(this.backupRoot, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Backup destination
    const backupDir = path.join(categoryDir, 'latest');
    
    // If latest exists, move it to timestamped backup (keep only 1 previous)
    if (fs.existsSync(backupDir)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedDir = path.join(categoryDir, `backup-${timestamp}`);
      
      // Remove any existing timestamped backups (keep only latest)
      const files = fs.readdirSync(categoryDir);
      files.forEach(file => {
        if (file.startsWith('backup-') && file !== 'latest') {
          const oldBackup = path.join(categoryDir, file);
          execSync(`rm -rf "${oldBackup}"`);
        }
      });
      
      // Move current latest to timestamped
      fs.renameSync(backupDir, timestampedDir);
    }

    // Create new backup
    console.log(`📦 Creating backup of ${category}...`);
    
    // Use cp -r for directories, cp for files
    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      execSync(`cp -r "${sourcePath}" "${backupDir}"`);
    } else {
      fs.mkdirSync(backupDir, { recursive: true });
      execSync(`cp "${sourcePath}" "${backupDir}"`);
    }

    // Update manifest
    const manifest = this.loadManifest();
    manifest.backups[category] = {
      latest: {
        timestamp: new Date().toISOString(),
        sourcePath,
        size: this.getDirectorySize(backupDir),
        metadata
      }
    };
    this.saveManifest(manifest);

    console.log(`✅ Backup created for ${category}`);
    return backupDir;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(category, targetPath = null) {
    const manifest = this.loadManifest();
    
    // Check if backup exists
    if (!manifest.backups[category]) {
      throw new Error(`No backup found for category: ${category}`);
    }

    const backupInfo = manifest.backups[category].latest;
    const backupPath = path.join(this.backupRoot, category, 'latest');
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup files missing for category: ${category}`);
    }

    // Use original source path if target not specified
    const restorePath = targetPath || backupInfo.sourcePath;
    
    console.log(`📥 Restoring ${category} from backup...`);
    console.log(`   From: ${backupPath}`);
    console.log(`   To: ${restorePath}`);

    // Remove existing target if it exists
    if (fs.existsSync(restorePath)) {
      execSync(`rm -rf "${restorePath}"`);
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(restorePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Restore backup
    execSync(`cp -r "${backupPath}" "${restorePath}"`);
    
    console.log(`✅ Restored ${category} from backup`);
    return restorePath;
  }

  /**
   * List available backups
   */
  listBackups() {
    const manifest = this.loadManifest();
    const backups = [];

    for (const [category, info] of Object.entries(manifest.backups)) {
      const latestPath = path.join(this.backupRoot, category, 'latest');
      if (fs.existsSync(latestPath)) {
        backups.push({
          category,
          timestamp: info.latest.timestamp,
          size: info.latest.size,
          sourcePath: info.latest.sourcePath,
          metadata: info.latest.metadata
        });
      }
    }

    return backups;
  }

  /**
   * Get directory size
   */
  getDirectorySize(dirPath) {
    try {
      const output = execSync(`du -sh "${dirPath}" 2>/dev/null || echo "0"`, { encoding: 'utf8' });
      return output.split('\t')[0].trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Clean old backups
   */
  cleanOldBackups(category = null) {
    if (category) {
      const categoryDir = path.join(this.backupRoot, category);
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir);
        files.forEach(file => {
          if (file.startsWith('backup-') && file !== 'latest') {
            const oldBackup = path.join(categoryDir, file);
            execSync(`rm -rf "${oldBackup}"`);
          }
        });
      }
    } else {
      // Clean all categories
      const categories = fs.readdirSync(this.backupRoot);
      categories.forEach(cat => {
        if (cat !== 'manifest.json' && cat !== '.gitignore') {
          this.cleanOldBackups(cat);
        }
      });
    }
  }
}

// Export singleton instance
module.exports = new BackupManager();