#!/usr/bin/env node

/**
 * Session Tracker Hook Handler
 * Tracks Claude Code sessions for continuity
 */

const fs = require('fs');
const path = require('path');

class SessionTracker {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.stateDir = path.join(this.projectRoot, 'project-state');
    this.sessionDir = path.join(this.stateDir, 'session-history');
    this.currentSessionPath = path.join(this.stateDir, 'runtime.json');
  }

  parseContext() {
    return {
      eventType: process.env.SESSION_EVENT || process.argv[2] || 'update',
      prompt: process.env.USER_PROMPT || '',
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  async execute() {
    try {
      const { eventType } = this.context;
      
      // Ensure directories exist
      this.ensureDirectories();

      let result;
      switch (eventType) {
        case 'start':
          result = await this.startSession();
          break;
        case 'update':
          result = await this.updateSession();
          break;
        case 'end':
          result = await this.endSession();
          break;
        case 'checkpoint':
          result = await this.createCheckpoint();
          break;
        default:
          result = { status: 'skipped', reason: 'Unknown event type' };
      }

      return result;

    } catch (error) {
      console.error('Session tracking failed:', error);
      throw error;
    }
  }

  ensureDirectories() {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async startSession() {
    // Check if there's an existing session
    let previousSession = null;
    if (fs.existsSync(this.currentSessionPath)) {
      previousSession = JSON.parse(fs.readFileSync(this.currentSessionPath, 'utf8'));
      // Archive the previous session
      await this.archiveSession(previousSession);
    }

    // Create new session
    const session = {
      id: this.generateSessionId(),
      started_at: this.context.timestamp,
      last_updated: this.context.timestamp,
      interactions: [],
      agents_used: new Set([this.context.activeAgent]).values(),
      files_accessed: [],
      decisions_made: [],
      tasks_completed: [],
      context_summary: '',
      previous_session: previousSession ? previousSession.id : null
    };

    // Save current session
    this.saveCurrentSession(session);

    // Load context from previous session if exists
    const contextSummary = previousSession ? 
      this.summarizePreviousSession(previousSession) : null;

    return {
      status: 'success',
      sessionId: session.id,
      previousContext: contextSummary,
      message: 'New session started'
    };
  }

  async updateSession() {
    if (!fs.existsSync(this.currentSessionPath)) {
      // Auto-start session if not exists
      await this.startSession();
    }

    const session = JSON.parse(fs.readFileSync(this.currentSessionPath, 'utf8'));
    
    // Update session data
    session.last_updated = this.context.timestamp;
    
    // Track interaction
    if (this.context.prompt) {
      session.interactions.push({
        timestamp: this.context.timestamp,
        agent: this.context.activeAgent,
        prompt_preview: this.context.prompt.substring(0, 100) + '...',
        type: this.categorizeInteraction(this.context.prompt)
      });
    }

    // Track agent usage
    if (!session.agents_used.includes(this.context.activeAgent)) {
      session.agents_used.push(this.context.activeAgent);
    }

    // Track file access (from environment)
    if (process.env.ACCESSED_FILES) {
      const files = JSON.parse(process.env.ACCESSED_FILES);
      files.forEach(file => {
        if (!session.files_accessed.some(f => f.path === file)) {
          session.files_accessed.push({
            path: file,
            timestamp: this.context.timestamp,
            agent: this.context.activeAgent
          });
        }
      });
    }

    // Update context summary periodically
    if (session.interactions.length % 10 === 0) {
      session.context_summary = this.generateContextSummary(session);
    }

    // Save updated session
    this.saveCurrentSession(session);

    return {
      status: 'success',
      sessionId: session.id,
      interactionCount: session.interactions.length,
      duration: this.calculateDuration(session.started_at)
    };
  }

  async endSession() {
    if (!fs.existsSync(this.currentSessionPath)) {
      return { status: 'skipped', reason: 'No active session' };
    }

    const session = JSON.parse(fs.readFileSync(this.currentSessionPath, 'utf8'));
    
    // Finalize session
    session.ended_at = this.context.timestamp;
    session.duration = this.calculateDuration(session.started_at);
    session.final_summary = this.generateFinalSummary(session);
    
    // Archive session
    await this.archiveSession(session);
    
    // Remove current session file
    fs.unlinkSync(this.currentSessionPath);

    return {
      status: 'success',
      sessionId: session.id,
      duration: session.duration,
      summary: session.final_summary
    };
  }

  async createCheckpoint() {
    if (!fs.existsSync(this.currentSessionPath)) {
      return { status: 'skipped', reason: 'No active session' };
    }

    const session = JSON.parse(fs.readFileSync(this.currentSessionPath, 'utf8'));
    
    // Create checkpoint
    const checkpoint = {
      session_id: session.id,
      timestamp: this.context.timestamp,
      interaction_count: session.interactions.length,
      context_snapshot: {
        agents_used: session.agents_used,
        recent_files: session.files_accessed.slice(-10),
        recent_decisions: session.decisions_made.slice(-5),
        summary: session.context_summary || this.generateContextSummary(session)
      }
    };

    // Save checkpoint
    const checkpointPath = path.join(
      this.stateDir,
      'checkpoints',
      `session-checkpoint-${Date.now()}.json`
    );
    
    const checkpointDir = path.dirname(checkpointPath);
    if (!fs.existsSync(checkpointDir)) {
      fs.mkdirSync(checkpointDir, { recursive: true });
    }
    
    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

    return {
      status: 'success',
      checkpoint: checkpointPath,
      sessionId: session.id
    };
  }

  generateSessionId() {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `session-${date}-${random}`;
  }

  categorizeInteraction(prompt) {
    const categories = {
      command: /^\/\w+/.test(prompt),
      question: /\?$/.test(prompt),
      implementation: /(implement|create|build|add|update|fix)/i.test(prompt),
      analysis: /(analyze|review|check|test|debug)/i.test(prompt),
      documentation: /(document|explain|describe|write)/i.test(prompt),
      planning: /(plan|design|architect|structure)/i.test(prompt)
    };

    for (const [category, pattern] of Object.entries(categories)) {
      if (pattern) return category;
    }
    
    return 'general';
  }

  generateContextSummary(session) {
    const summary = {
      duration: this.calculateDuration(session.started_at),
      total_interactions: session.interactions.length,
      interaction_types: {},
      top_agents: [],
      recent_focus: ''
    };

    // Count interaction types
    session.interactions.forEach(interaction => {
      summary.interaction_types[interaction.type] = 
        (summary.interaction_types[interaction.type] || 0) + 1;
    });

    // Find top agents
    const agentCounts = {};
    session.agents_used.forEach(agent => {
      agentCounts[agent] = session.interactions.filter(i => i.agent === agent).length;
    });
    summary.top_agents = Object.entries(agentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([agent, count]) => ({ agent, count }));

    // Determine recent focus
    const recentInteractions = session.interactions.slice(-5);
    const recentTypes = recentInteractions.map(i => i.type);
    const mostCommon = this.getMostCommon(recentTypes);
    summary.recent_focus = mostCommon || 'varied';

    return summary;
  }

  generateFinalSummary(session) {
    const summary = this.generateContextSummary(session);
    
    return {
      ...summary,
      total_files_accessed: session.files_accessed.length,
      total_decisions: session.decisions_made.length,
      total_tasks: session.tasks_completed.length,
      key_accomplishments: this.extractKeyAccomplishments(session),
      next_session_context: this.prepareNextSessionContext(session)
    };
  }

  extractKeyAccomplishments(session) {
    const accomplishments = [];
    
    // Extract from completed tasks
    session.tasks_completed.forEach(task => {
      accomplishments.push(task.description);
    });
    
    // Extract from interactions
    const implementationInteractions = session.interactions
      .filter(i => i.type === 'implementation')
      .slice(-5);
    
    implementationInteractions.forEach(interaction => {
      accomplishments.push(`Implementation: ${interaction.prompt_preview}`);
    });
    
    return accomplishments.slice(0, 5); // Top 5
  }

  prepareNextSessionContext(session) {
    return {
      previous_session_id: session.id,
      duration: session.duration,
      last_active_agent: session.agents_used[session.agents_used.length - 1],
      recent_files: session.files_accessed.slice(-5).map(f => f.path),
      unfinished_tasks: session.tasks_completed
        .filter(t => t.status !== 'completed')
        .map(t => t.description),
      key_context: session.context_summary
    };
  }

  summarizePreviousSession(session) {
    return {
      session_id: session.id,
      duration: session.duration || this.calculateDuration(session.started_at, session.ended_at),
      key_points: session.final_summary || session.context_summary,
      last_activity: session.last_updated,
      suggestion: this.generateContinuationSuggestion(session)
    };
  }

  generateContinuationSuggestion(session) {
    if (!session.interactions || session.interactions.length === 0) {
      return 'Start fresh with your project goals';
    }

    const lastInteraction = session.interactions[session.interactions.length - 1];
    const suggestions = {
      implementation: 'Continue implementing the feature you were working on',
      analysis: 'Review the analysis results and plan next steps',
      documentation: 'Complete the documentation you started',
      planning: 'Finalize the plan and begin implementation',
      command: 'Continue with the workflow you initiated',
      general: 'Resume where you left off'
    };

    return suggestions[lastInteraction.type] || suggestions.general;
  }

  async archiveSession(session) {
    const date = session.started_at.split('T')[0];
    const archivePath = path.join(this.sessionDir, `session-${date}.json`);
    
    // If file exists for this date, append session
    let sessions = [];
    if (fs.existsSync(archivePath)) {
      sessions = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
    }
    
    sessions.push(session);
    
    // Save archived sessions
    fs.writeFileSync(archivePath, JSON.stringify(sessions, null, 2));
  }

  saveCurrentSession(session) {
    // Convert Set to Array for JSON serialization
    const sessionData = {
      ...session,
      agents_used: Array.from(session.agents_used || [])
    };
    
    fs.writeFileSync(this.currentSessionPath, JSON.stringify(sessionData, null, 2));
  }

  calculateDuration(startTime, endTime = null) {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  getMostCommon(array) {
    if (array.length === 0) return null;
    
    const counts = {};
    array.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }
}

if (require.main === module) {
  const tracker = new SessionTracker();
  tracker.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = SessionTracker;