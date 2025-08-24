/**
 * Session Manager
 * Handles session lifecycle, history, and handoffs
 */

const fs = require('fs');
const path = require('path');
const { stateTracker } = require('./state-tracker');

class SessionManager {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.sessionHistoryPath = path.join(this.basePath, 'project-state', 'session-history');
    
    // Current session info
    this.currentSession = null;
    this.sessionStartTime = null;
    
    // Initialize or restore session
    this.initializeSession();
  }
  
  /**
   * Initialize session
   */
  initializeSession() {
    const currentState = stateTracker.loadProjectState();
    
    if (currentState?.session) {
      // Check if this is a continuation or new session
      const lastUpdated = new Date(currentState.session.last_updated);
      const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 4) {
        // Continue existing session
        this.currentSession = currentState.session;
        console.log(`📂 Continuing session: ${this.currentSession.id}`);
      } else {
        // Start new session but reference the previous
        this.startNewSession(currentState.session.id);
      }
    } else {
      // Brand new session
      this.startNewSession();
    }
    
    this.sessionStartTime = Date.now();
  }
  
  /**
   * Start new session
   */
  startNewSession(previousSessionId = null) {
    this.currentSession = {
      id: this.generateSessionId(),
      started_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      claude_code_version: process.env.CLAUDE_VERSION || 'unknown',
      previous_session: previousSessionId,
      handoff_from: null,
      handoff_to: null
    };
    
    // Update state with new session
    stateTracker.saveProjectState({
      session: this.currentSession,
      completed_this_session: []
    });
    
    console.log(`🆕 Started new session: ${this.currentSession.id}`);
    
    // Generate welcome message
    this.displayWelcomeMessage();
  }
  
  /**
   * Generate session ID
   */
  generateSessionId() {
    const date = new Date().toISOString().split('T')[0];
    const time = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `session-${date}-${time}-${random}`;
  }
  
  /**
   * Get session history
   */
  getSessionHistory(limit = 10) {
    try {
      const files = fs.readdirSync(this.sessionHistoryPath)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const fullPath = path.join(this.sessionHistoryPath, f);
          const stats = fs.statSync(fullPath);
          return {
            filename: f,
            path: fullPath,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.modified - a.modified)
        .slice(0, limit);
      
      return files.map(file => {
        try {
          const session = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
          return {
            id: session.session.id,
            started_at: session.session.started_at,
            last_updated: session.session.last_updated,
            duration: this.calculateDuration(session.session.started_at, session.session.last_updated),
            summary: this.generateSessionSummary(session),
            completed_tasks: session.completed_this_session?.length || 0,
            decisions_made: session.decisions?.length || 0
          };
        } catch (error) {
          console.error(`Error loading session ${file.filename}:`, error.message);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Error getting session history:', error.message);
      return [];
    }
  }
  
  /**
   * Restore specific session
   */
  async restoreSession(sessionId) {
    try {
      const sessionPath = path.join(this.sessionHistoryPath, `${sessionId}.json`);
      
      if (!fs.existsSync(sessionPath)) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      const sessionState = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
      
      // Create checkpoint before restoration
      await stateTracker.createCheckpoint('before-session-restore');
      
      // Restore the session state
      await stateTracker.saveProjectState(sessionState);
      
      // Update current session
      this.currentSession = sessionState.session;
      
      console.log(`✅ Restored session: ${sessionId}`);
      
      // Display restoration summary
      this.displayRestorationSummary(sessionState);
      
      return sessionState;
    } catch (error) {
      console.error('Error restoring session:', error.message);
      throw error;
    }
  }
  
  /**
   * Create session handoff
   */
  async createHandoff(recipientName, notes = '') {
    try {
      const currentState = stateTracker.loadProjectState();
      
      const handoff = {
        id: `handoff-${Date.now()}`,
        created_at: new Date().toISOString(),
        from_session: this.currentSession.id,
        to_recipient: recipientName,
        notes: notes,
        
        // Current state summary
        project_status: {
          name: currentState.project.name,
          phase: currentState.project.phase,
          active_sprint: currentState.project.active_sprint
        },
        
        // Active work
        active_task: currentState.current_context?.active_task || null,
        
        // Recent activity
        completed_this_session: currentState.completed_this_session || [],
        recent_decisions: (currentState.decisions || []).slice(0, 5),
        recent_files: (currentState.current_context?.recent_files || []).slice(0, 10),
        
        // Next steps
        next_actions: currentState.next_actions || [],
        blockers: this.extractBlockers(currentState),
        
        // Context
        important_context: this.extractImportantContext(currentState),
        
        // System state
        system_rules_reminder: 'Always load system-rules.json first',
        working_directory: currentState.current_context?.working_directory
      };
      
      // Save handoff document
      const handoffPath = path.join(this.basePath, 'project-state', `${handoff.id}.json`);
      fs.writeFileSync(handoffPath, JSON.stringify(handoff, null, 2));
      
      // Generate markdown summary
      const markdownPath = path.join(this.basePath, 'project-state', `${handoff.id}.md`);
      fs.writeFileSync(markdownPath, this.generateHandoffMarkdown(handoff));
      
      // Update current session
      this.currentSession.handoff_to = recipientName;
      await stateTracker.saveProjectState({
        session: this.currentSession
      });
      
      console.log(`📋 Handoff created: ${handoff.id}`);
      console.log(`   Markdown: ${markdownPath}`);
      
      return handoff;
    } catch (error) {
      console.error('Error creating handoff:', error.message);
      throw error;
    }
  }
  
  /**
   * End current session
   */
  async endSession(reason = 'manual') {
    try {
      const duration = this.calculateDuration(
        this.currentSession.started_at,
        new Date().toISOString()
      );
      
      // Update session with end time
      this.currentSession.ended_at = new Date().toISOString();
      this.currentSession.end_reason = reason;
      this.currentSession.duration = duration;
      
      // Save final state
      await stateTracker.saveProjectState({
        session: this.currentSession
      });
      
      // Generate session summary
      const summary = stateTracker.getSessionSummary();
      
      console.log(`\n🏁 Session ended: ${this.currentSession.id}`);
      console.log(`   Duration: ${duration}`);
      console.log(`   Tasks completed: ${summary.completed_tasks.length}`);
      console.log(`   Decisions made: ${summary.decisions_made.length}`);
      
      return summary;
    } catch (error) {
      console.error('Error ending session:', error.message);
      throw error;
    }
  }
  
  /**
   * Display welcome message
   */
  displayWelcomeMessage() {
    const state = stateTracker.loadProjectState();
    const previousSessions = this.getSessionHistory(1);
    
    console.log('\n🎯 Welcome to AgileAiAgents!');
    console.log('=' . repeat(50));
    
    if (previousSessions.length > 0) {
      const lastSession = previousSessions[0];
      console.log(`\n📅 Last session: ${this.formatDate(lastSession.started_at)}`);
      console.log(`   Duration: ${lastSession.duration}`);
      console.log(`   Completed: ${lastSession.completed_tasks} tasks`);
      console.log(`   Decisions: ${lastSession.decisions_made}`);
    }
    
    if (state?.current_context?.active_task) {
      console.log(`\n🎯 Active task: ${state.current_context.active_task.title}`);
      console.log(`   Progress: ${state.current_context.active_task.progress}%`);
    }
    
    if (state?.next_actions?.length > 0) {
      console.log('\n📋 Next actions:');
      state.next_actions.slice(0, 3).forEach((action, i) => {
        console.log(`   ${i + 1}. ${action.action} (${action.priority})`);
      });
    }
    
    console.log('\n💡 Use "Where are we?" to see full context');
    console.log('=' . repeat(50));
  }
  
  /**
   * Display restoration summary
   */
  displayRestorationSummary(sessionState) {
    console.log('\n📂 Session Restored Successfully');
    console.log('=' . repeat(50));
    console.log(`Session ID: ${sessionState.session.id}`);
    console.log(`Originally started: ${this.formatDate(sessionState.session.started_at)}`);
    
    if (sessionState.project) {
      console.log(`\nProject: ${sessionState.project.name}`);
      console.log(`Phase: ${sessionState.project.phase}`);
      console.log(`Sprint: ${sessionState.project.active_sprint || 'None'}`);
    }
    
    if (sessionState.current_context?.active_task) {
      console.log(`\nActive task: ${sessionState.current_context.active_task.title}`);
    }
    
    if (sessionState.completed_this_session?.length > 0) {
      console.log(`\nCompleted in session: ${sessionState.completed_this_session.length} tasks`);
    }
    
    console.log('=' . repeat(50));
  }
  
  /**
   * Generate session summary
   */
  generateSessionSummary(session) {
    const parts = [];
    
    if (session.project?.phase) {
      parts.push(`Phase: ${session.project.phase}`);
    }
    
    if (session.current_context?.active_task) {
      parts.push(`Working on: ${session.current_context.active_task.title}`);
    }
    
    if (session.completed_this_session?.length > 0) {
      parts.push(`Completed ${session.completed_this_session.length} tasks`);
    }
    
    return parts.join(' | ');
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
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
  
  /**
   * Format date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString()}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString()}`;
    } else {
      return date.toLocaleString();
    }
  }
  
  /**
   * Extract blockers
   */
  extractBlockers(state) {
    const blockers = [];
    
    if (state.current_context?.active_task?.blockers) {
      blockers.push(...state.current_context.active_task.blockers);
    }
    
    // Add other sources of blockers
    return blockers;
  }
  
  /**
   * Extract important context
   */
  extractImportantContext(state) {
    return {
      key_decisions: (state.decisions || []).slice(0, 3).map(d => ({
        decision: d.decision,
        rationale: d.rationale
      })),
      critical_files: (state.current_context?.recent_files || [])
        .filter(f => f.critical)
        .map(f => f.path),
      important_notes: state.important_notes || []
    };
  }
  
  /**
   * Generate handoff markdown
   */
  generateHandoffMarkdown(handoff) {
    return `# Project Handoff Document

**Created**: ${new Date(handoff.created_at).toLocaleString()}
**From Session**: ${handoff.from_session}
**To**: ${handoff.to_recipient}

## Project Status
- **Name**: ${handoff.project_status.name}
- **Phase**: ${handoff.project_status.phase}
- **Active Sprint**: ${handoff.project_status.active_sprint || 'None'}

## Active Work
${handoff.active_task ? `
### Current Task
- **Title**: ${handoff.active_task.title}
- **Progress**: ${handoff.active_task.progress}%
- **Assigned Agents**: ${handoff.active_task.assigned_agents?.join(', ') || 'None'}
` : 'No active task'}

## Completed This Session
${handoff.completed_this_session.map(task => `- ${task}`).join('\n') || 'None'}

## Recent Decisions
${handoff.recent_decisions.map(d => `
### ${d.decision}
- **Rationale**: ${d.rationale}
- **Time**: ${new Date(d.timestamp).toLocaleString()}
`).join('\n') || 'None'}

## Next Actions
${handoff.next_actions.map((action, i) => `${i + 1}. ${action.action} (${action.priority})`).join('\n') || 'None'}

## Blockers
${handoff.blockers.map(b => `- ${b}`).join('\n') || 'None'}

## Important Context
${handoff.important_context.key_decisions.map(d => `- **Decision**: ${d.decision}\n  **Why**: ${d.rationale}`).join('\n')}

## System Information
- **Working Directory**: ${handoff.working_directory}
- **Remember**: ${handoff.system_rules_reminder}

## Handoff Notes
${handoff.notes || 'No additional notes'}

---
*Generated by AgileAiAgents Session Manager*`;
  }
}

// Export singleton instance
const sessionManager = new SessionManager();

module.exports = {
  SessionManager,
  sessionManager,
  
  // Convenience exports
  getSessionHistory: (limit) => sessionManager.getSessionHistory(limit),
  restoreSession: (sessionId) => sessionManager.restoreSession(sessionId),
  createHandoff: (recipient, notes) => sessionManager.createHandoff(recipient, notes),
  endSession: (reason) => sessionManager.endSession(reason),
  getCurrentSession: () => sessionManager.currentSession
};