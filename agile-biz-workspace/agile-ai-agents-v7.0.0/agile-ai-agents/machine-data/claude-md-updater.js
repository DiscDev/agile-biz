/**
 * CLAUDE.md Updater
 * Maintains the living document with current project status
 */

const fs = require('fs');
const path = require('path');
const { stateTracker } = require('./state-tracker');

class ClaudeMdUpdater {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.claudeMdPath = path.join(this.basePath, 'claude.md');
    
    // Status section markers
    this.statusMarkers = {
      start: '## 📊 Current Project Status',
      end: '---\n\n**Ready to transform'
    };
    
    // Update triggers
    this.updateTriggers = [
      'task_completion',
      'sprint_change',
      'decision_made',
      'blocker_added',
      'blocker_resolved',
      'session_end'
    ];
  }
  
  /**
   * Update current status section
   */
  async updateCurrentStatus(updates = {}) {
    try {
      // Load current state
      const state = stateTracker.loadProjectState();
      if (!state) {
        console.error('No project state available for CLAUDE.md update');
        return;
      }
      
      // Generate new status section
      const statusSection = this.generateStatusSection(state, updates);
      
      // Read current CLAUDE.md
      let content = fs.readFileSync(this.claudeMdPath, 'utf-8');
      
      // Find and replace status section
      const startIndex = content.indexOf(this.statusMarkers.start);
      const endIndex = content.indexOf(this.statusMarkers.end);
      
      if (startIndex === -1 || endIndex === -1) {
        console.error('Could not find status section markers in CLAUDE.md');
        return;
      }
      
      // Replace the section
      const before = content.substring(0, startIndex);
      const after = content.substring(endIndex);
      
      content = before + statusSection + '\n\n' + after;
      
      // Write updated content
      fs.writeFileSync(this.claudeMdPath, content);
      
      console.log('✅ CLAUDE.md status updated');
    } catch (error) {
      console.error('Error updating CLAUDE.md:', error.message);
    }
  }
  
  /**
   * Append session summary
   */
  async appendSessionSummary(summary) {
    try {
      const timestamp = new Date().toISOString();
      const sessionSection = `
## Session Summary - ${timestamp}

### Work Completed
${summary.completed_tasks.map(task => `- ✅ ${task}`).join('\n') || '- No tasks completed'}

### Decisions Made
${summary.decisions_made.map(d => `- 📝 **${d.decision}**: ${d.rationale}`).join('\n') || '- No decisions made'}

### Files Modified
${summary.files_modified.map(f => `- 📄 ${f.path}`).join('\n') || '- No files modified'}

### Next Session
${summary.next_actions.map((action, i) => `${i + 1}. ${action.action}`).join('\n') || '- No specific actions planned'}

---
`;
      
      // Append to session history file instead of main CLAUDE.md
      const historyPath = path.join(this.basePath, 'project-state', 'session-summaries.md');
      
      let historyContent = '';
      if (fs.existsSync(historyPath)) {
        historyContent = fs.readFileSync(historyPath, 'utf-8');
      }
      
      // Prepend new summary (most recent first)
      historyContent = sessionSection + '\n' + historyContent;
      
      fs.writeFileSync(historyPath, historyContent);
      
      console.log('✅ Session summary appended to history');
    } catch (error) {
      console.error('Error appending session summary:', error.message);
    }
  }
  
  /**
   * Rotate old sessions
   */
  async rotateOldSessions() {
    try {
      const historyPath = path.join(this.basePath, 'project-state', 'session-summaries.md');
      
      if (!fs.existsSync(historyPath)) {
        return;
      }
      
      const content = fs.readFileSync(historyPath, 'utf-8');
      const sessions = content.split('## Session Summary - ');
      
      // Keep only last 10 sessions
      if (sessions.length > 11) { // +1 for the empty first element
        const kept = sessions.slice(0, 11);
        const rotated = kept.join('## Session Summary - ');
        fs.writeFileSync(historyPath, rotated);
        
        console.log(`🔄 Rotated old sessions (kept last 10)`);
      }
    } catch (error) {
      console.error('Error rotating sessions:', error.message);
    }
  }
  
  /**
   * Generate status section
   */
  generateStatusSection(state, updates = {}) {
    // Merge any immediate updates
    const currentState = { ...state, ...updates };
    
    // Format sprint info
    const sprintInfo = this.formatSprintInfo(currentState);
    
    // Format completed tasks
    const completedTasks = this.formatCompletedTasks(currentState);
    
    // Format in-progress tasks
    const inProgressTasks = this.formatInProgressTasks(currentState);
    
    // Format blockers
    const blockers = this.formatBlockers(currentState);
    
    // Format next steps
    const nextSteps = this.formatNextSteps(currentState);
    
    // Format recent decisions
    const recentDecisions = this.formatRecentDecisions(currentState);
    
    return `## 📊 Current Project Status

### Active Sprint
${sprintInfo}

### Completed This Session
${completedTasks}

### In Progress
${inProgressTasks}

### Blockers
${blockers}

### Next Steps
${nextSteps}

### Recent Decisions
${recentDecisions}`;
  }
  
  /**
   * Format sprint information
   */
  formatSprintInfo(state) {
    if (!state.project?.active_sprint) {
      return `- **Sprint ID**: None
- **Started**: N/A
- **Progress**: N/A`;
    }
    
    // Calculate sprint progress (example)
    const progress = state.sprint_progress || 0;
    
    return `- **Sprint ID**: ${state.project.active_sprint}
- **Started**: ${state.sprint_started || 'Unknown'}
- **Progress**: ${progress}% (${state.completed_points || 0}/${state.total_points || 0} points)`;
  }
  
  /**
   * Format completed tasks
   */
  formatCompletedTasks(state) {
    if (!state.completed_this_session || state.completed_this_session.length === 0) {
      return '- No tasks completed yet';
    }
    
    return state.completed_this_session
      .slice(0, 10) // Show max 10
      .map(task => `- ✅ ${task}`)
      .join('\n');
  }
  
  /**
   * Format in-progress tasks
   */
  formatInProgressTasks(state) {
    if (!state.current_context?.active_task) {
      return '- No active tasks';
    }
    
    const task = state.current_context.active_task;
    let taskInfo = `- **${task.title}** (${task.progress || 0}% complete)`;
    
    if (task.assigned_agents?.length > 0) {
      taskInfo += `\n  - Assigned to: ${task.assigned_agents.join(', ')}`;
    }
    
    if (task.estimated_completion) {
      taskInfo += `\n  - ETA: ${task.estimated_completion}`;
    }
    
    return taskInfo;
  }
  
  /**
   * Format blockers
   */
  formatBlockers(state) {
    const blockers = [];
    
    // Check active task blockers
    if (state.current_context?.active_task?.blockers?.length > 0) {
      blockers.push(...state.current_context.active_task.blockers);
    }
    
    // Check global blockers
    if (state.global_blockers?.length > 0) {
      blockers.push(...state.global_blockers);
    }
    
    if (blockers.length === 0) {
      return '- No current blockers';
    }
    
    return blockers
      .map(blocker => `- 🚫 ${blocker}`)
      .join('\n');
  }
  
  /**
   * Format next steps
   */
  formatNextSteps(state) {
    if (!state.next_actions || state.next_actions.length === 0) {
      return `1. Read all files in agile-ai-agents folder
2. Start with automated mode
3. Describe your project idea`;
    }
    
    return state.next_actions
      .slice(0, 5) // Show max 5
      .map((action, i) => {
        let step = `${i + 1}. ${action.action}`;
        if (action.priority) {
          step += ` (${action.priority} priority)`;
        }
        if (action.assigned_to) {
          step += ` - ${action.assigned_to}`;
        }
        return step;
      })
      .join('\n');
  }
  
  /**
   * Format recent decisions
   */
  formatRecentDecisions(state) {
    if (!state.decisions || state.decisions.length === 0) {
      return '- No decisions recorded yet';
    }
    
    return state.decisions
      .slice(0, 5) // Show max 5
      .map(decision => {
        const time = this.formatRelativeTime(decision.timestamp);
        return `- **${decision.decision}** (${time})
  - *Rationale*: ${decision.rationale}`;
      })
      .join('\n');
  }
  
  /**
   * Format relative time
   */
  formatRelativeTime(timestamp) {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
  
  /**
   * Register update trigger
   */
  registerTrigger(eventType, handler) {
    if (this.updateTriggers.includes(eventType)) {
      // In a real implementation, this would set up event listeners
      console.log(`Registered trigger for ${eventType}`);
    }
  }
  
  /**
   * Create backup before update
   */
  createBackup() {
    try {
      const backupPath = path.join(
        this.basePath,
        'project-state',
        `claude.md.backup.${Date.now()}`
      );
      
      const content = fs.readFileSync(this.claudeMdPath, 'utf-8');
      fs.writeFileSync(backupPath, content);
      
      // Keep only last 5 backups
      this.cleanupBackups();
    } catch (error) {
      console.error('Error creating backup:', error.message);
    }
  }
  
  /**
   * Cleanup old backups
   */
  cleanupBackups() {
    const backupDir = path.join(this.basePath, 'project-state');
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('claude.md.backup.'))
      .sort()
      .reverse();
    
    if (backups.length > 5) {
      backups.slice(5).forEach(backup => {
        fs.unlinkSync(path.join(backupDir, backup));
      });
    }
  }
  
  /**
   * Validate CLAUDE.md structure
   */
  validateStructure() {
    try {
      const content = fs.readFileSync(this.claudeMdPath, 'utf-8');
      
      // Check for required sections
      const requiredSections = [
        '## Overview',
        '## System Architecture',
        '## 📋 System Rules & Guidelines',
        '## 📊 Current Project Status'
      ];
      
      const missingSections = requiredSections.filter(section => 
        !content.includes(section)
      );
      
      if (missingSections.length > 0) {
        console.warn('⚠️  Missing sections in CLAUDE.md:', missingSections);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating CLAUDE.md:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const claudeMdUpdater = new ClaudeMdUpdater();

module.exports = {
  ClaudeMdUpdater,
  claudeMdUpdater,
  
  // Convenience exports
  updateCurrentStatus: (updates) => claudeMdUpdater.updateCurrentStatus(updates),
  appendSessionSummary: (summary) => claudeMdUpdater.appendSessionSummary(summary),
  rotateOldSessions: () => claudeMdUpdater.rotateOldSessions(),
  generateStatusSection: (state) => claudeMdUpdater.generateStatusSection(state)
};