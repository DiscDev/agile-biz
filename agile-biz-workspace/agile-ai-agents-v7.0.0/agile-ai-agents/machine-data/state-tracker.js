/**
 * State Tracker
 * Core module for managing project state persistence
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class StateTracker {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.statePath = path.join(this.basePath, 'project-state');
    this.currentStatePath = path.join(this.statePath, 'runtime.json');
    this.systemRulesPath = path.join(__dirname, 'system-rules.json');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Load system rules (always in memory)
    this.systemRules = this.loadSystemRules();
    
    // State cache
    this.stateCache = null;
    this.lastSaved = null;
    
    // Auto-save configuration
    this.autoSaveInterval = 30000; // 30 seconds
    this.pendingChanges = false;
    
    // Start auto-save timer
    this.startAutoSave();
  }
  
  /**
   * Convert absolute path to relative path from project root
   * @param {string} filePath - The file path to convert
   * @returns {string} - Relative path from project root
   */
  toRelativePath(filePath) {
    if (!filePath) return filePath;
    
    // If already relative, return as-is
    if (!path.isAbsolute(filePath)) return filePath;
    
    // Get the project root (parent of agile-ai-agents folder)
    const projectRoot = path.dirname(this.basePath);
    
    // Convert to relative path
    const relativePath = path.relative(projectRoot, filePath);
    
    // If the path goes outside project root, just use the basename
    if (relativePath.startsWith('..')) {
      return path.basename(filePath);
    }
    
    return relativePath;
  }
  
  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [
      this.statePath,
      path.join(this.statePath, 'session-history'),
      path.join(this.statePath, 'checkpoints'),
      path.join(this.basePath, '.claude-context')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  /**
   * Load system rules (critical context)
   */
  loadSystemRules() {
    try {
      if (fs.existsSync(this.systemRulesPath)) {
        return JSON.parse(fs.readFileSync(this.systemRulesPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading system rules:', error.message);
    }
    return null;
  }
  
  /**
   * Save project state
   */
  async saveProjectState(updates = {}) {
    try {
      // Load current state or create new
      let state = this.loadProjectState() || this.createNewState();
      
      // Merge updates
      state = this.mergeStateUpdates(state, updates);
      
      // Update metadata
      state.meta.last_updated = new Date().toISOString();
      state.meta.checksum = this.calculateChecksum(state);
      
      // Save to disk
      fs.writeFileSync(this.currentStatePath, JSON.stringify(state, null, 2));
      
      // Update cache
      this.stateCache = state;
      this.lastSaved = Date.now();
      this.pendingChanges = false;
      
      // Save to session history
      await this.saveToSessionHistory(state);
      
      console.log('✅ Project state saved successfully');
      return state;
    } catch (error) {
      console.error('Error saving project state:', error.message);
      throw error;
    }
  }
  
  /**
   * Load project state
   */
  loadProjectState() {
    try {
      // Check cache first
      if (this.stateCache && (Date.now() - this.lastSaved < 5000)) {
        return this.stateCache;
      }
      
      if (fs.existsSync(this.currentStatePath)) {
        const state = JSON.parse(fs.readFileSync(this.currentStatePath, 'utf-8'));
        
        // Validate checksum
        if (this.validateChecksum(state)) {
          this.stateCache = state;
          return state;
        } else {
          console.warn('State checksum validation failed, attempting recovery...');
          return this.recoverCorruptedState();
        }
      }
    } catch (error) {
      console.error('Error loading project state:', error.message);
      return this.recoverCorruptedState();
    }
    
    return null;
  }
  
  /**
   * Create checkpoint
   */
  async createCheckpoint(reason = 'manual') {
    try {
      const state = this.loadProjectState();
      if (!state) {
        throw new Error('No current state to checkpoint');
      }
      
      const checkpointId = `checkpoint-${Date.now()}-${reason.replace(/\s+/g, '-')}`;
      const checkpointPath = path.join(this.statePath, 'checkpoints', `${checkpointId}.json`);
      
      // Add checkpoint metadata
      state.checkpoint = {
        id: checkpointId,
        reason: reason,
        created_at: new Date().toISOString()
      };
      
      // Save checkpoint
      fs.writeFileSync(checkpointPath, JSON.stringify(state, null, 2));
      
      // Manage checkpoint rotation
      await this.rotateCheckpoints();
      
      console.log(`✅ Checkpoint created: ${checkpointId}`);
      return checkpointId;
    } catch (error) {
      console.error('Error creating checkpoint:', error.message);
      throw error;
    }
  }
  
  /**
   * Get session summary
   */
  getSessionSummary(sessionId = null) {
    try {
      const state = this.loadProjectState();
      if (!state) return null;
      
      const session = sessionId ? this.loadSession(sessionId) : state.session;
      
      return {
        session_id: session.id,
        duration: this.calculateDuration(session.started_at, session.last_updated),
        completed_tasks: state.completed_this_session || [],
        decisions_made: state.decisions || [],
        files_modified: state.current_context?.recent_files || [],
        next_actions: state.next_actions || [],
        summary: this.generateSummaryText(state)
      };
    } catch (error) {
      console.error('Error getting session summary:', error.message);
      return null;
    }
  }
  
  /**
   * Track decision
   */
  trackDecision(decision) {
    try {
      const state = this.loadProjectState() || this.createNewState();
      
      if (!state.decisions) {
        state.decisions = [];
      }
      
      const decisionRecord = {
        id: `decision-${Date.now()}`,
        timestamp: new Date().toISOString(),
        decision: decision.decision,
        rationale: decision.rationale,
        alternatives: decision.alternatives || [],
        impact: decision.impact || 'unknown',
        made_by: decision.made_by || 'system',
        related_files: (decision.related_files || []).map(f => this.toRelativePath(f))
      };
      
      state.decisions.unshift(decisionRecord);
      
      // Keep only recent decisions in active state
      if (state.decisions.length > 10) {
        // Archive older decisions
        this.archiveOldDecisions(state.decisions.slice(10));
        state.decisions = state.decisions.slice(0, 10);
      }
      
      this.pendingChanges = true;
      console.log(`📝 Decision tracked: ${decision.decision}`);
      
      return decisionRecord;
    } catch (error) {
      console.error('Error tracking decision:', error.message);
      throw error;
    }
  }
  
  /**
   * Record context
   */
  recordContext(contextUpdate) {
    try {
      const state = this.loadProjectState() || this.createNewState();
      
      // Convert file paths to relative if recent_files is provided
      if (contextUpdate.recent_files && Array.isArray(contextUpdate.recent_files)) {
        contextUpdate.recent_files = contextUpdate.recent_files.map(file => {
          if (typeof file === 'string') {
            return {
              path: this.toRelativePath(file),
              last_modified: new Date().toISOString()
            };
          } else if (file.path) {
            return {
              ...file,
              path: this.toRelativePath(file.path)
            };
          }
          return file;
        });
      }
      
      // Update current context
      state.current_context = {
        ...state.current_context,
        ...contextUpdate,
        last_updated: new Date().toISOString()
      };
      
      this.pendingChanges = true;
      return state.current_context;
    } catch (error) {
      console.error('Error recording context:', error.message);
      throw error;
    }
  }
  
  /**
   * Create new state structure
   */
  createNewState() {
    return {
      meta: {
        version: '1.0.0',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      },
      session: {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        started_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        claude_code_version: process.env.CLAUDE_VERSION || 'unknown'
      },
      project: {
        name: path.basename(this.basePath),
        type: 'unknown',
        phase: 'planning',
        active_sprint: null
      },
      current_context: {
        active_task: null,
        recent_files: [],
        working_directory: '.'  // Always use relative path for portability
      },
      decisions: [],
      next_actions: [],
      completed_this_session: []
    };
  }
  
  /**
   * Merge state updates
   */
  mergeStateUpdates(state, updates) {
    // Deep merge updates into state
    const merged = { ...state };
    
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        merged[key] = { ...merged[key], ...updates[key] };
      } else {
        merged[key] = updates[key];
      }
    });
    
    return merged;
  }
  
  /**
   * Calculate checksum
   */
  calculateChecksum(state) {
    const content = JSON.stringify(state);
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
  }
  
  /**
   * Validate checksum
   */
  validateChecksum(state) {
    if (!state.meta?.checksum) return true; // No checksum to validate
    
    const stateCopy = { ...state };
    const expectedChecksum = stateCopy.meta.checksum;
    delete stateCopy.meta.checksum;
    
    const actualChecksum = this.calculateChecksum(stateCopy);
    return actualChecksum === expectedChecksum;
  }
  
  /**
   * Recover corrupted state
   */
  recoverCorruptedState() {
    console.warn('Attempting to recover from corrupted state...');
    
    // Try to load from most recent session history
    const sessions = this.getRecentSessions(1);
    if (sessions.length > 0) {
      console.log('Recovered from session history');
      return sessions[0];
    }
    
    // Try to load from most recent checkpoint
    const checkpoints = this.getAvailableCheckpoints();
    if (checkpoints.length > 0) {
      const latest = checkpoints[0];
      const checkpointPath = path.join(this.statePath, 'checkpoints', latest);
      try {
        const state = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
        console.log('Recovered from checkpoint');
        return state;
      } catch (error) {
        console.error('Checkpoint recovery failed:', error.message);
      }
    }
    
    // Create new state as last resort
    console.log('Creating new state (recovery failed)');
    return this.createNewState();
  }
  
  /**
   * Save to session history
   */
  async saveToSessionHistory(state) {
    try {
      const sessionFile = `${state.session.id}.json`;
      const sessionPath = path.join(this.statePath, 'session-history', sessionFile);
      
      // Save session snapshot
      fs.writeFileSync(sessionPath, JSON.stringify(state, null, 2));
      
      // Rotate old sessions
      await this.rotateSessionHistory();
    } catch (error) {
      console.error('Error saving session history:', error.message);
    }
  }
  
  /**
   * Rotate session history
   */
  async rotateSessionHistory() {
    const historyDir = path.join(this.statePath, 'session-history');
    const files = fs.readdirSync(historyDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(historyDir, f),
        mtime: fs.statSync(path.join(historyDir, f)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    // Keep only last 30 sessions
    if (files.length > 30) {
      files.slice(30).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  }
  
  /**
   * Rotate checkpoints
   */
  async rotateCheckpoints() {
    const checkpointDir = path.join(this.statePath, 'checkpoints');
    const files = fs.readdirSync(checkpointDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(checkpointDir, f),
        mtime: fs.statSync(path.join(checkpointDir, f)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    // Keep only last 10 checkpoints
    if (files.length > 10) {
      files.slice(10).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  }
  
  /**
   * Get recent sessions
   */
  getRecentSessions(limit = 5) {
    const historyDir = path.join(this.statePath, 'session-history');
    
    try {
      const files = fs.readdirSync(historyDir)
        .filter(f => f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(historyDir, f),
          mtime: fs.statSync(path.join(historyDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, limit);
      
      return files.map(file => {
        try {
          return JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        } catch (error) {
          console.error(`Error loading session ${file.name}:`, error.message);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Error getting recent sessions:', error.message);
      return [];
    }
  }
  
  /**
   * Get available checkpoints
   */
  getAvailableCheckpoints() {
    const checkpointDir = path.join(this.statePath, 'checkpoints');
    
    try {
      return fs.readdirSync(checkpointDir)
        .filter(f => f.endsWith('.json'))
        .sort((a, b) => {
          const timeA = parseInt(a.split('-')[1]);
          const timeB = parseInt(b.split('-')[1]);
          return timeB - timeA;
        });
    } catch (error) {
      console.error('Error getting checkpoints:', error.message);
      return [];
    }
  }
  
  /**
   * Calculate duration
   */
  calculateDuration(start, end) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = endTime - startTime;
    
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    
    return `${hours}h ${minutes}m`;
  }
  
  /**
   * Generate summary text
   */
  generateSummaryText(state) {
    const parts = [];
    
    if (state.current_context?.active_task) {
      parts.push(`Working on: ${state.current_context.active_task.title}`);
    }
    
    if (state.completed_this_session?.length > 0) {
      parts.push(`Completed ${state.completed_this_session.length} tasks`);
    }
    
    if (state.decisions?.length > 0) {
      parts.push(`Made ${state.decisions.length} decisions`);
    }
    
    if (state.next_actions?.length > 0) {
      parts.push(`${state.next_actions.length} actions planned`);
    }
    
    return parts.join('. ');
  }
  
  /**
   * Archive old decisions
   */
  archiveOldDecisions(decisions) {
    try {
      const archivePath = path.join(this.basePath, '.claude-context', 'decision-archive.json');
      
      let archive = [];
      if (fs.existsSync(archivePath)) {
        archive = JSON.parse(fs.readFileSync(archivePath, 'utf-8'));
      }
      
      archive.push(...decisions);
      
      fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
    } catch (error) {
      console.error('Error archiving decisions:', error.message);
    }
  }
  
  /**
   * Start auto-save timer
   */
  startAutoSave() {
    setInterval(() => {
      if (this.pendingChanges) {
        this.saveProjectState().catch(error => {
          console.error('Auto-save failed:', error.message);
        });
      }
    }, this.autoSaveInterval);
  }
  
  /**
   * Load specific session
   */
  loadSession(sessionId) {
    const sessionPath = path.join(this.statePath, 'session-history', `${sessionId}.json`);
    
    try {
      if (fs.existsSync(sessionPath)) {
        return JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
      }
    } catch (error) {
      console.error(`Error loading session ${sessionId}:`, error.message);
    }
    
    return null;
  }
}

// Export singleton instance
const stateTracker = new StateTracker();

module.exports = {
  StateTracker,
  stateTracker,
  
  // Convenience exports
  saveProjectState: (updates) => stateTracker.saveProjectState(updates),
  loadProjectState: () => stateTracker.loadProjectState(),
  createCheckpoint: (reason) => stateTracker.createCheckpoint(reason),
  getSessionSummary: (sessionId) => stateTracker.getSessionSummary(sessionId),
  trackDecision: (decision) => stateTracker.trackDecision(decision),
  recordContext: (context) => stateTracker.recordContext(context)
};