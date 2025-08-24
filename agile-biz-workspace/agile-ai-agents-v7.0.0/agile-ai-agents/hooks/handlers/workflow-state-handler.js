/**
 * Workflow State Handler v7.0.0
 * Manages workflow state using three-file structure:
 * - runtime.json: Current workflow state
 * - persistent.json: Historical data
 * - configuration.json: User preferences
 */

const fs = require('fs');
const path = require('path');

class WorkflowStateHandler {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    
    // Three-file structure paths
    this.runtimePath = path.join(this.projectRoot, 'project-state', 'runtime.json');
    this.persistentPath = path.join(this.projectRoot, 'project-state', 'persistent.json');
    this.configPath = path.join(this.projectRoot, 'project-state', 'configuration.json');
    this.archivePath = path.join(this.projectRoot, 'project-state', 'archives');
    
    // Load all three state files
    this.runtime = this.loadRuntime();
    this.persistent = this.loadPersistent();
    this.config = this.loadConfiguration();
  }

  /**
   * Load runtime state (resets on new workflow)
   */
  loadRuntime() {
    try {
      if (fs.existsSync(this.runtimePath)) {
        const content = fs.readFileSync(this.runtimePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading runtime state:', error);
    }
    return this.getDefaultRuntime();
  }

  /**
   * Load persistent state (survives resets)
   */
  loadPersistent() {
    try {
      if (fs.existsSync(this.persistentPath)) {
        const content = fs.readFileSync(this.persistentPath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading persistent state:', error);
    }
    return this.getDefaultPersistent();
  }

  /**
   * Load configuration (user preferences)
   */
  loadConfiguration() {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
    
    // Copy from clean-slate if not exists
    const cleanSlatePath = path.join(this.projectRoot, 'templates', 'clean-slate', 'project-state', 'configuration.json');
    if (fs.existsSync(cleanSlatePath)) {
      const content = fs.readFileSync(cleanSlatePath, 'utf8');
      const config = JSON.parse(content);
      this.saveConfiguration(config);
      return config;
    }
    
    return this.getDefaultConfiguration();
  }

  /**
   * Get default runtime state
   */
  getDefaultRuntime() {
    return {
      version: '7.0.0',
      workflow: {
        active: null,
        phase: null,
        stage: null,
        progress: 0,
        started_at: null,
        last_updated: null
      },
      session: {
        id: null,
        started: null,
        last_activity: null,
        user: null
      },
      discovery: {
        sections_completed: [],
        current_section: null,
        approvals: {},
        iterations: {}
      },
      phases: {
        sequential: {
          current: null,
          next: null
        },
        selected: {
          active: []
        }
      },
      queues: {
        documents: [],
        tasks: [],
        approvals: []
      },
      agents: {
        active: [],
        coordination: {},
        conflicts: []
      },
      temp: {
        phase_selection_unlocked: false,
        mvp_deployed: false,
        validation_gates: {}
      }
    };
  }

  /**
   * Get default persistent state
   */
  getDefaultPersistent() {
    return {
      version: '7.0.0',
      project: {
        name: null,
        created: null,
        description: null,
        type: null,
        repository: null
      },
      decisions: [],
      learnings: [],
      sprints: [],
      milestones: [],
      documents_created: [],
      phases_completed: [],
      checkpoints: [],
      metrics: {
        total_documents: 0,
        total_decisions: 0,
        total_approvals: 0,
        total_phases: 0,
        total_sprints: 0,
        total_time_hours: 0
      },
      progress: {
        percentage: 0,
        phase: null,
        sprint: null,
        tasks_completed: 0,
        tasks_total: 0,
        last_milestone: null
      },
      velocity: {
        average: 0,
        sprints: [],
        confidence: 0,
        profile: null
      },
      backlog: {
        items: [],
        state: {},
        priorities: []
      },
      session_history: []
    };
  }

  /**
   * Get default configuration
   */
  getDefaultConfiguration() {
    // This should match the clean-slate configuration.json
    return {
      version: '7.0.0',
      preferences: {
        research_level: 'thorough',
        verbosity: 'normal',
        auto_save: true,
        timezone: 'America/Los_Angeles',
        time_format: '12h',
        show_timezone: true,
        parallel_agents: 5,
        confirm_destructive: true
      },
      project_state: {
        auto_save: {
          enabled: true,
          frequency_preset: 'balanced',
          debounce_ms: 5000,
          save_mode: 'update',
          show_confirmations: true,
          confirmation_style: 'minimal'
        }
      },
      // ... rest matches clean-slate configuration.json
    };
  }

  /**
   * Save runtime state
   */
  saveRuntime() {
    try {
      const dir = path.dirname(this.runtimePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      this.runtime.last_updated = new Date().toISOString();
      fs.writeFileSync(this.runtimePath, JSON.stringify(this.runtime, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving runtime state:', error);
      return false;
    }
  }

  /**
   * Save persistent state
   */
  savePersistent() {
    try {
      const dir = path.dirname(this.persistentPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.persistentPath, JSON.stringify(this.persistent, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving persistent state:', error);
      return false;
    }
  }

  /**
   * Save configuration
   */
  saveConfiguration(config = this.config) {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
      return true;
    } catch (error) {
      console.error('Error saving configuration:', error);
      return false;
    }
  }

  /**
   * Initialize workflow (creates fresh runtime)
   */
  initializeWorkflow(workflowType, options = {}) {
    // Reset runtime to defaults
    this.runtime = this.getDefaultRuntime();
    
    // Set workflow info
    this.runtime.workflow.active = workflowType;
    this.runtime.workflow.started_at = new Date().toISOString();
    this.runtime.session.id = `session-${Date.now()}`;
    this.runtime.session.started = new Date().toISOString();
    
    // Apply configuration preferences
    const researchLevel = options.research_level || this.config.preferences.research_level;
    
    // Update persistent project info if new
    if (!this.persistent.project.created) {
      this.persistent.project.created = new Date().toISOString();
      this.persistent.project.type = workflowType;
    }
    
    // Save all states
    this.saveRuntime();
    this.savePersistent();
    
    return {
      success: true,
      workflow: workflowType,
      research_level: researchLevel
    };
  }

  /**
   * Update workflow phase
   */
  updatePhase(phase, metadata = {}) {
    this.runtime.workflow.phase = phase;
    this.runtime.workflow.last_updated = new Date().toISOString();
    
    // Add to persistent history
    if (!this.persistent.phases_completed.includes(phase)) {
      this.persistent.phases_completed.push(phase);
      this.persistent.metrics.total_phases++;
    }
    
    this.saveRuntime();
    this.savePersistent();
    
    return { success: true, phase };
  }

  /**
   * Save decision to persistent state
   */
  saveDecision(decision, metadata = {}) {
    const decisionEntry = {
      id: `decision-${Date.now()}`,
      decision,
      metadata,
      timestamp: new Date().toISOString(),
      workflow: this.runtime.workflow.active,
      phase: this.runtime.workflow.phase
    };
    
    this.persistent.decisions.push(decisionEntry);
    this.persistent.metrics.total_decisions++;
    
    this.savePersistent();
    
    return { success: true, id: decisionEntry.id };
  }

  /**
   * Create checkpoint (archive current state)
   */
  createCheckpoint(name = null) {
    const checkpointName = name || `checkpoint-${Date.now()}`;
    const checkpointData = {
      name: checkpointName,
      timestamp: new Date().toISOString(),
      runtime: { ...this.runtime },
      persistent: { ...this.persistent },
      configuration: { ...this.config }
    };
    
    // Save to archives
    if (!fs.existsSync(this.archivePath)) {
      fs.mkdirSync(this.archivePath, { recursive: true });
    }
    
    const checkpointFile = path.join(this.archivePath, `${checkpointName}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpointData, null, 2));
    
    // Add to persistent checkpoints list
    this.persistent.checkpoints.push({
      name: checkpointName,
      timestamp: checkpointData.timestamp,
      file: checkpointFile
    });
    
    // Limit checkpoints based on configuration
    const maxCheckpoints = this.config.project_state?.checkpoint?.max_checkpoints || 20;
    if (this.persistent.checkpoints.length > maxCheckpoints) {
      const removed = this.persistent.checkpoints.shift();
      // Delete old checkpoint file
      if (fs.existsSync(removed.file)) {
        fs.unlinkSync(removed.file);
      }
    }
    
    this.savePersistent();
    
    return { success: true, checkpoint: checkpointName };
  }

  /**
   * Reset runtime state (for new workflow)
   */
  resetRuntime() {
    this.runtime = this.getDefaultRuntime();
    this.saveRuntime();
    return { success: true };
  }

  /**
   * Get combined state for compatibility
   */
  getState() {
    return {
      ...this.runtime,
      configuration: this.config.preferences,
      metrics: this.persistent.metrics,
      project: this.persistent.project
    };
  }

  /**
   * Legacy compatibility - redirect old state property
   */
  get state() {
    return this.getState();
  }

  /**
   * Legacy compatibility - save state
   */
  saveState() {
    this.saveRuntime();
    this.savePersistent();
    return true;
  }
}

module.exports = WorkflowStateHandler;