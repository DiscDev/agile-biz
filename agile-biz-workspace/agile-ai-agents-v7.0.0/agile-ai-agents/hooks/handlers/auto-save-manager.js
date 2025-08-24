/**
 * Auto-Save Manager
 * Handles automatic state saving based on various triggers
 */

const fs = require('fs');
const path = require('path');

class AutoSaveManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.statePath = path.join(this.projectRoot, 'project-state', 'runtime.json');
    this.backupPath = path.join(this.projectRoot, 'project-state', 'backups');
    this.configPath = path.join(this.projectRoot, 'machine-data', 'auto-save-config.json');
    
    this.saveQueue = [];
    this.saveInProgress = false;
    this.lastSaveTime = null;
    this.saveCount = 0;
    
    this.loadConfiguration();
    this.ensureBackupDirectory();
  }

  /**
   * Load auto-save configuration
   */
  loadConfiguration() {
    const defaultConfig = {
      enabled: true,
      triggers: {
        document_creation: true,
        section_approval: true,
        phase_transition: true,
        depth_selection: true,
        decision_recording: true,
        error_occurrence: true,
        checkpoint_creation: true,
        time_interval: 300000 // 5 minutes
      },
      save_frequency: {
        min_interval: 5000, // 5 seconds minimum between saves
        batch_delay: 1000, // 1 second delay for batching
        max_queue_size: 10
      },
      backup: {
        enabled: true,
        max_backups: 20,
        compress_old: true
      }
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const configContent = fs.readFileSync(this.configPath, 'utf8');
        this.config = { ...defaultConfig, ...JSON.parse(configContent) };
      } else {
        this.config = defaultConfig;
        this.saveConfiguration();
      }
    } catch (error) {
      console.error('Error loading auto-save config:', error);
      this.config = defaultConfig;
    }
  }

  /**
   * Save configuration
   */
  saveConfiguration() {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving auto-save config:', error);
    }
  }

  /**
   * Ensure backup directory exists
   */
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  /**
   * Register a save trigger
   */
  registerSaveTrigger(triggerType, data = {}) {
    if (!this.config.enabled) return;
    
    if (!this.config.triggers[triggerType]) {
      console.log(`Auto-save trigger '${triggerType}' is disabled`);
      return;
    }

    const saveRequest = {
      id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trigger: triggerType,
      timestamp: new Date().toISOString(),
      data
    };

    console.log(`⚡ Auto-save triggered by: ${triggerType}`);
    this.queueSave(saveRequest);
  }

  /**
   * Queue a save request
   */
  queueSave(saveRequest) {
    this.saveQueue.push(saveRequest);
    
    // Check queue size limit
    if (this.saveQueue.length > this.config.save_frequency.max_queue_size) {
      this.saveQueue = this.saveQueue.slice(-this.config.save_frequency.max_queue_size);
    }

    // Schedule batch save
    if (!this.saveInProgress) {
      setTimeout(() => this.processSaveQueue(), this.config.save_frequency.batch_delay);
    }
  }

  /**
   * Process queued saves
   */
  async processSaveQueue() {
    if (this.saveInProgress || this.saveQueue.length === 0) return;
    
    // Check minimum interval
    if (this.lastSaveTime) {
      const timeSinceLastSave = Date.now() - this.lastSaveTime;
      if (timeSinceLastSave < this.config.save_frequency.min_interval) {
        // Reschedule
        setTimeout(
          () => this.processSaveQueue(),
          this.config.save_frequency.min_interval - timeSinceLastSave
        );
        return;
      }
    }

    this.saveInProgress = true;
    const batch = [...this.saveQueue];
    this.saveQueue = [];

    try {
      // Create backup before save
      if (this.config.backup.enabled) {
        await this.createBackup();
      }

      // Load current state
      let state = {};
      if (fs.existsSync(this.statePath)) {
        const stateContent = fs.readFileSync(this.statePath, 'utf8');
        state = JSON.parse(stateContent);
      }

      // Update state with batch metadata
      state.auto_save = {
        last_save: new Date().toISOString(),
        save_count: ++this.saveCount,
        triggers: batch.map(b => ({
          trigger: b.trigger,
          timestamp: b.timestamp
        }))
      };

      // Validate state before saving
      if (!this.validateState(state)) {
        console.error('State validation failed, skipping save');
        this.saveInProgress = false;
        return;
      }

      // Save state
      fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
      this.lastSaveTime = Date.now();
      
      console.log(`💾 Auto-save complete (${batch.length} triggers processed)`);
      
      // Clean old backups
      if (this.config.backup.enabled) {
        this.cleanOldBackups();
      }

    } catch (error) {
      console.error('Auto-save error:', error);
      
      // Re-queue failed saves
      this.saveQueue.unshift(...batch);
      
      // Trigger error recovery
      this.registerSaveTrigger('error_occurrence', { error: error.message });
    } finally {
      this.saveInProgress = false;
      
      // Process any new saves that came in
      if (this.saveQueue.length > 0) {
        setTimeout(() => this.processSaveQueue(), this.config.save_frequency.batch_delay);
      }
    }
  }

  /**
   * Validate state before saving
   */
  validateState(state) {
    try {
      // Basic structure validation
      if (!state || typeof state !== 'object') {
        return false;
      }

      // Check required fields
      const requiredFields = ['workflow_stage', 'phases', 'configuration'];
      for (const field of requiredFields) {
        if (!(field in state)) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
      }

      // Validate JSON serialization
      JSON.stringify(state);
      
      return true;
    } catch (error) {
      console.error('State validation error:', error);
      return false;
    }
  }

  /**
   * Create backup of current state
   */
  async createBackup() {
    if (!fs.existsSync(this.statePath)) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `workflow-state-${timestamp}.json`;
      const backupFile = path.join(this.backupPath, backupName);
      
      const stateContent = fs.readFileSync(this.statePath, 'utf8');
      fs.writeFileSync(backupFile, stateContent);
      
      console.log(`📦 Backup created: ${backupName}`);
    } catch (error) {
      console.error('Backup creation error:', error);
    }
  }

  /**
   * Clean old backups
   */
  cleanOldBackups() {
    try {
      const files = fs.readdirSync(this.backupPath)
        .filter(f => f.startsWith('workflow-state-'))
        .map(f => ({
          name: f,
          path: path.join(this.backupPath, f),
          time: fs.statSync(path.join(this.backupPath, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only max_backups
      if (files.length > this.config.backup.max_backups) {
        const toDelete = files.slice(this.config.backup.max_backups);
        
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`🗑️  Deleted old backup: ${file.name}`);
        });
      }

      // Compress old backups if enabled
      if (this.config.backup.compress_old && files.length > 5) {
        // Would implement compression here
        // For now, just log intention
        console.log(`📦 Would compress ${files.length - 5} old backups`);
      }

    } catch (error) {
      console.error('Backup cleanup error:', error);
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupName = null) {
    try {
      let backupFile;
      
      if (backupName) {
        backupFile = path.join(this.backupPath, backupName);
      } else {
        // Get most recent backup
        const files = fs.readdirSync(this.backupPath)
          .filter(f => f.startsWith('workflow-state-'))
          .map(f => ({
            name: f,
            path: path.join(this.backupPath, f),
            time: fs.statSync(path.join(this.backupPath, f)).mtime
          }))
          .sort((a, b) => b.time - a.time);
        
        if (files.length === 0) {
          console.error('No backups available');
          return false;
        }
        
        backupFile = files[0].path;
        backupName = files[0].name;
      }

      if (!fs.existsSync(backupFile)) {
        console.error(`Backup file not found: ${backupName}`);
        return false;
      }

      // Create backup of current state before restore
      await this.createBackup();
      
      // Restore from backup
      const backupContent = fs.readFileSync(backupFile, 'utf8');
      fs.writeFileSync(this.statePath, backupContent);
      
      console.log(`✅ Restored from backup: ${backupName}`);
      return true;

    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  }

  /**
   * List available backups
   */
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupPath)
        .filter(f => f.startsWith('workflow-state-'))
        .map(f => {
          const stats = fs.statSync(path.join(this.backupPath, f));
          return {
            name: f,
            size: stats.size,
            time: stats.mtime,
            age: Date.now() - stats.mtime
          };
        })
        .sort((a, b) => b.time - a.time);

      console.log('\n📦 Available Backups:');
      console.log('─'.repeat(60));
      
      files.forEach((file, index) => {
        const ageHours = Math.floor(file.age / (1000 * 60 * 60));
        const sizeKB = Math.floor(file.size / 1024);
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Size: ${sizeKB}KB | Age: ${ageHours} hours`);
      });

      return files;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * Setup interval-based auto-save
   */
  setupIntervalSave() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    if (this.config.triggers.time_interval > 0) {
      this.intervalTimer = setInterval(
        () => this.registerSaveTrigger('time_interval'),
        this.config.triggers.time_interval
      );
      console.log(`⏰ Interval auto-save enabled (every ${this.config.triggers.time_interval / 1000}s)`);
    }
  }

  /**
   * Cleanup on shutdown
   */
  cleanup() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
    
    // Process any remaining saves
    if (this.saveQueue.length > 0) {
      this.processSaveQueue();
    }
  }
}

// Export for use in workflows
module.exports = AutoSaveManager;

// Allow direct execution for testing
if (require.main === module) {
  const manager = new AutoSaveManager(process.cwd());
  
  // Test auto-save triggers
  console.log('Testing auto-save manager...\n');
  
  manager.registerSaveTrigger('document_creation', { doc: 'test.md' });
  manager.registerSaveTrigger('phase_transition', { from: 'phase1', to: 'phase2' });
  manager.registerSaveTrigger('decision_recording', { decision: 'use-react' });
  
  // List backups
  setTimeout(() => {
    manager.listBackups();
  }, 3000);
}