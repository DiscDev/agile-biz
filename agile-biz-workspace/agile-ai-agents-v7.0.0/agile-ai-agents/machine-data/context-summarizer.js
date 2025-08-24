/**
 * Context Summarizer
 * Intelligent context compression and summarization for token optimization
 */

const fs = require('fs');
const path = require('path');

class ContextSummarizer {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    
    // Token limits and thresholds
    this.maxTokens = 100000; // Approximate token limit
    this.targetUtilization = 0.5; // Target 50% utilization
    this.criticalThreshold = 0.8; // Start aggressive pruning at 80%
    
    // Context priorities (higher = more important)
    this.priorities = {
      system_rules: 1000,        // Never prune
      current_task: 900,         // Critical
      active_blockers: 850,      // Critical
      recent_decisions: 800,     // Important (last 5)
      active_sprint: 750,        // Important
      recent_files: 700,         // Important (last 10)
      session_summary: 600,      // Useful
      older_decisions: 500,      // Compressible
      completed_tasks: 400,      // Summarizable
      conversation_history: 300, // Prunable
      archived_data: 100        // First to prune
    };
    
    // Compression strategies
    this.compressionStrategies = {
      decisions: this.compressDecisions,
      conversations: this.compressConversations,
      tasks: this.compressTasks,
      files: this.compressFiles
    };
  }
  
  /**
   * Summarize context within token limits
   */
  summarizeContext(fullContext, currentTokens = null) {
    try {
      // Estimate current token usage
      const estimatedTokens = currentTokens || this.estimateTokens(fullContext);
      const utilizationRatio = estimatedTokens / this.maxTokens;
      
      console.log(`📊 Context utilization: ${(utilizationRatio * 100).toFixed(1)}%`);
      
      // If under target, return full context
      if (utilizationRatio <= this.targetUtilization) {
        return {
          context: fullContext,
          compressed: false,
          utilization: utilizationRatio,
          tokens: estimatedTokens
        };
      }
      
      // Apply compression based on utilization
      let compressedContext = { ...fullContext };
      
      if (utilizationRatio > this.criticalThreshold) {
        // Aggressive compression
        compressedContext = this.applyAggressiveCompression(compressedContext);
      } else {
        // Standard compression
        compressedContext = this.applyStandardCompression(compressedContext);
      }
      
      // Re-estimate tokens
      const compressedTokens = this.estimateTokens(compressedContext);
      const newUtilization = compressedTokens / this.maxTokens;
      
      return {
        context: compressedContext,
        compressed: true,
        utilization: newUtilization,
        tokens: compressedTokens,
        reduction: ((estimatedTokens - compressedTokens) / estimatedTokens * 100).toFixed(1) + '%'
      };
    } catch (error) {
      console.error('Error summarizing context:', error.message);
      return {
        context: fullContext,
        compressed: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate "Where We Left Off" summary
   */
  generateWhereWeLeftOff(state) {
    const summary = {
      timestamp: new Date().toISOString(),
      
      // Project overview
      project: {
        name: state.project?.name || 'Unknown Project',
        phase: state.project?.phase || 'Unknown',
        sprint: state.project?.active_sprint || 'No active sprint'
      },
      
      // Current status
      current_status: this.generateCurrentStatus(state),
      
      // Recent activity
      recent_activity: this.generateRecentActivity(state),
      
      // Key decisions
      key_decisions: this.extractKeyDecisions(state),
      
      // Next steps
      next_steps: this.generateNextSteps(state),
      
      // Important context
      important_context: this.extractImportantContext(state),
      
      // Quick actions
      quick_actions: this.generateQuickActions(state)
    };
    
    return summary;
  }
  
  /**
   * Prioritize context elements
   */
  prioritizeContext(context) {
    const prioritized = [];
    
    // Add elements by priority
    Object.entries(context).forEach(([key, value]) => {
      const priority = this.getPriority(key, value);
      prioritized.push({
        key,
        value,
        priority,
        size: this.estimateSize(value)
      });
    });
    
    // Sort by priority (descending)
    prioritized.sort((a, b) => b.priority - a.priority);
    
    return prioritized;
  }
  
  /**
   * Apply standard compression
   */
  applyStandardCompression(context) {
    const compressed = { ...context };
    
    // Compress decisions (keep last 5 detailed, summarize rest)
    if (compressed.decisions?.length > 5) {
      compressed.decisions = [
        ...compressed.decisions.slice(0, 5),
        {
          summary: `${compressed.decisions.length - 5} older decisions`,
          count: compressed.decisions.length - 5,
          categories: this.categorizeDecisions(compressed.decisions.slice(5))
        }
      ];
    }
    
    // Compress completed tasks (summary only)
    if (compressed.completed_tasks?.length > 10) {
      compressed.completed_tasks = {
        summary: `${compressed.completed_tasks.length} tasks completed`,
        recent: compressed.completed_tasks.slice(0, 5),
        by_category: this.categorizeTasks(compressed.completed_tasks)
      };
    }
    
    // Compress file history
    if (compressed.recent_files?.length > 10) {
      compressed.recent_files = compressed.recent_files.slice(0, 10);
    }
    
    // Compress conversation history
    if (compressed.conversation_history) {
      compressed.conversation_history = this.compressConversations(compressed.conversation_history);
    }
    
    return compressed;
  }
  
  /**
   * Apply aggressive compression
   */
  applyAggressiveCompression(context) {
    const compressed = { ...context };
    
    // Keep only critical elements
    const critical = ['system_rules', 'current_task', 'active_blockers', 'active_sprint'];
    const important = ['recent_decisions', 'recent_files', 'next_actions'];
    
    // Remove non-critical elements
    Object.keys(compressed).forEach(key => {
      if (!critical.includes(key) && !important.includes(key)) {
        if (this.canSummarize(key)) {
          compressed[key] = this.generateMinimalSummary(key, compressed[key]);
        } else {
          delete compressed[key];
        }
      }
    });
    
    // Aggressively compress important elements
    if (compressed.recent_decisions?.length > 3) {
      compressed.recent_decisions = compressed.recent_decisions.slice(0, 3).map(d => ({
        decision: d.decision,
        timestamp: d.timestamp
      }));
    }
    
    if (compressed.recent_files?.length > 5) {
      compressed.recent_files = compressed.recent_files.slice(0, 5).map(f => f.path);
    }
    
    return compressed;
  }
  
  /**
   * Compress decisions
   */
  compressDecisions(decisions) {
    if (!Array.isArray(decisions) || decisions.length <= 5) {
      return decisions;
    }
    
    return {
      recent: decisions.slice(0, 5),
      summary: {
        total: decisions.length,
        older: decisions.length - 5,
        categories: this.categorizeDecisions(decisions.slice(5)),
        key_themes: this.extractDecisionThemes(decisions.slice(5))
      }
    };
  }
  
  /**
   * Compress conversations
   */
  compressConversations(conversations) {
    if (!conversations || conversations.length === 0) {
      return null;
    }
    
    return {
      summary: `${conversations.length} conversations`,
      key_points: this.extractKeyPoints(conversations),
      recent: conversations.slice(0, 3).map(c => ({
        timestamp: c.timestamp,
        summary: c.summary || this.generateConversationSummary(c)
      }))
    };
  }
  
  /**
   * Compress tasks
   */
  compressTasks(tasks) {
    if (!Array.isArray(tasks) || tasks.length <= 5) {
      return tasks;
    }
    
    return {
      total: tasks.length,
      recent: tasks.slice(0, 5),
      by_status: this.groupByStatus(tasks),
      by_agent: this.groupByAgent(tasks),
      metrics: {
        completion_rate: this.calculateCompletionRate(tasks),
        average_duration: this.calculateAverageDuration(tasks)
      }
    };
  }
  
  /**
   * Compress files
   */
  compressFiles(files) {
    if (!Array.isArray(files) || files.length <= 10) {
      return files;
    }
    
    return {
      total: files.length,
      recent: files.slice(0, 10).map(f => ({
        path: f.path,
        modified: f.last_modified
      })),
      by_type: this.groupFilesByType(files),
      most_active: this.getMostActiveFiles(files, 5)
    };
  }
  
  /**
   * Estimate tokens (rough approximation)
   */
  estimateTokens(obj) {
    const json = JSON.stringify(obj);
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(json.length / 4);
  }
  
  /**
   * Estimate size of value
   */
  estimateSize(value) {
    if (!value) return 0;
    if (typeof value === 'string') return value.length;
    if (Array.isArray(value)) return value.reduce((sum, item) => sum + this.estimateSize(item), 0);
    if (typeof value === 'object') return JSON.stringify(value).length;
    return String(value).length;
  }
  
  /**
   * Get priority for context element
   */
  getPriority(key, value) {
    // Check predefined priorities
    if (this.priorities[key]) {
      return this.priorities[key];
    }
    
    // Dynamic priority based on content
    if (key.includes('current') || key.includes('active')) {
      return 800;
    }
    if (key.includes('recent')) {
      return 600;
    }
    if (key.includes('history') || key.includes('archived')) {
      return 200;
    }
    
    return 400; // Default medium priority
  }
  
  /**
   * Check if element can be summarized
   */
  canSummarize(key) {
    const summarizable = ['decisions', 'tasks', 'conversations', 'files', 'history'];
    return summarizable.some(type => key.includes(type));
  }
  
  /**
   * Generate minimal summary
   */
  generateMinimalSummary(key, value) {
    if (Array.isArray(value)) {
      return `${value.length} ${key}`;
    }
    if (typeof value === 'object') {
      return `${key}: ${Object.keys(value).length} items`;
    }
    return `${key}: present`;
  }
  
  /**
   * Generate current status
   */
  generateCurrentStatus(state) {
    const status = [];
    
    if (state.current_context?.active_task) {
      status.push(`Working on: ${state.current_context.active_task.title} (${state.current_context.active_task.progress}%)`);
    } else {
      status.push('No active task');
    }
    
    if (state.current_context?.active_task?.blockers?.length > 0) {
      status.push(`Blocked by: ${state.current_context.active_task.blockers.join(', ')}`);
    }
    
    if (state.project?.active_sprint) {
      status.push(`Sprint: ${state.project.active_sprint}`);
    }
    
    return status;
  }
  
  /**
   * Generate recent activity
   */
  generateRecentActivity(state) {
    const activity = [];
    
    if (state.completed_this_session?.length > 0) {
      activity.push(`Completed ${state.completed_this_session.length} tasks this session`);
    }
    
    if (state.decisions?.length > 0) {
      const recentDecision = state.decisions[0];
      activity.push(`Recent decision: ${recentDecision.decision}`);
    }
    
    if (state.current_context?.recent_files?.length > 0) {
      activity.push(`Modified ${state.current_context.recent_files.length} files`);
    }
    
    return activity;
  }
  
  /**
   * Extract key decisions
   */
  extractKeyDecisions(state) {
    if (!state.decisions || state.decisions.length === 0) {
      return [];
    }
    
    return state.decisions.slice(0, 3).map(d => ({
      decision: d.decision,
      why: d.rationale,
      when: this.formatRelativeTime(d.timestamp)
    }));
  }
  
  /**
   * Generate next steps
   */
  generateNextSteps(state) {
    const steps = [];
    
    if (state.next_actions?.length > 0) {
      state.next_actions.slice(0, 5).forEach(action => {
        steps.push(`${action.action} (${action.priority})`);
      });
    }
    
    if (state.current_context?.active_task && state.current_context.active_task.progress < 100) {
      steps.push(`Complete: ${state.current_context.active_task.title}`);
    }
    
    return steps;
  }
  
  /**
   * Extract important context
   */
  extractImportantContext(state) {
    const context = [];
    
    // System rules reminder
    context.push('Remember: system-rules.json must always be loaded first');
    
    // Working directory
    if (state.current_context?.working_directory) {
      context.push(`Working in: ${state.current_context.working_directory}`);
    }
    
    // Important files
    const criticalFiles = state.current_context?.recent_files?.filter(f => f.critical);
    if (criticalFiles?.length > 0) {
      context.push(`Critical files: ${criticalFiles.map(f => path.basename(f.path)).join(', ')}`);
    }
    
    return context;
  }
  
  /**
   * Generate quick actions
   */
  generateQuickActions(state) {
    const actions = [];
    
    if (state.current_context?.active_task) {
      actions.push('Continue working - Resume active task');
    }
    
    if (state.next_actions?.length > 0) {
      actions.push('Show next actions - View planned work');
    }
    
    actions.push('Checkpoint now - Save current state');
    actions.push('Show recent decisions - View decision history');
    
    return actions;
  }
  
  /**
   * Categorize decisions
   */
  categorizeDecisions(decisions) {
    const categories = {};
    
    decisions.forEach(decision => {
      const category = this.detectDecisionCategory(decision);
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
  }
  
  /**
   * Detect decision category
   */
  detectDecisionCategory(decision) {
    const text = (decision.decision + ' ' + decision.rationale).toLowerCase();
    
    if (text.includes('architecture') || text.includes('design')) return 'architecture';
    if (text.includes('technology') || text.includes('tool')) return 'technology';
    if (text.includes('process') || text.includes('workflow')) return 'process';
    if (text.includes('feature') || text.includes('functionality')) return 'feature';
    if (text.includes('bug') || text.includes('fix')) return 'bugfix';
    
    return 'other';
  }
  
  /**
   * Extract decision themes
   */
  extractDecisionThemes(decisions) {
    // Simple theme extraction - could be enhanced with NLP
    const themes = new Set();
    
    decisions.forEach(decision => {
      const words = decision.decision.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5 && !this.isCommonWord(word)) {
          themes.add(word);
        }
      });
    });
    
    return Array.from(themes).slice(0, 5);
  }
  
  /**
   * Check if word is common
   */
  isCommonWord(word) {
    const common = ['should', 'would', 'could', 'about', 'after', 'before', 'during'];
    return common.includes(word);
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
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  
  /**
   * Extract key points from conversations
   */
  extractKeyPoints(conversations) {
    // Simplified key point extraction
    return conversations
      .filter(c => c.important || c.decision)
      .slice(0, 5)
      .map(c => c.summary || c.message);
  }
  
  /**
   * Generate conversation summary
   */
  generateConversationSummary(conversation) {
    if (conversation.messages?.length > 0) {
      return `${conversation.messages.length} messages about ${conversation.topic || 'various topics'}`;
    }
    return 'Conversation summary unavailable';
  }
  
  /**
   * Group tasks by status
   */
  groupByStatus(tasks) {
    const grouped = {};
    tasks.forEach(task => {
      const status = task.status || 'unknown';
      grouped[status] = (grouped[status] || 0) + 1;
    });
    return grouped;
  }
  
  /**
   * Group tasks by agent
   */
  groupByAgent(tasks) {
    const grouped = {};
    tasks.forEach(task => {
      const agents = task.assigned_agents || ['unassigned'];
      agents.forEach(agent => {
        grouped[agent] = (grouped[agent] || 0) + 1;
      });
    });
    return grouped;
  }
  
  /**
   * Calculate completion rate
   */
  calculateCompletionRate(tasks) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    return (completed / tasks.length * 100).toFixed(1) + '%';
  }
  
  /**
   * Calculate average duration
   */
  calculateAverageDuration(tasks) {
    const durations = tasks
      .filter(t => t.duration)
      .map(t => t.duration);
    
    if (durations.length === 0) return 'N/A';
    
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    return `${Math.round(avg)}m`;
  }
  
  /**
   * Group files by type
   */
  groupFilesByType(files) {
    const grouped = {};
    files.forEach(file => {
      const ext = path.extname(file.path) || 'no-ext';
      grouped[ext] = (grouped[ext] || 0) + 1;
    });
    return grouped;
  }
  
  /**
   * Get most active files
   */
  getMostActiveFiles(files, limit) {
    return files
      .sort((a, b) => (b.modification_count || 0) - (a.modification_count || 0))
      .slice(0, limit)
      .map(f => ({
        path: f.path,
        changes: f.modification_count || 1
      }));
  }
}

// Export singleton instance
const contextSummarizer = new ContextSummarizer();

module.exports = {
  ContextSummarizer,
  contextSummarizer,
  
  // Convenience exports
  summarizeContext: (context, tokens) => contextSummarizer.summarizeContext(context, tokens),
  generateWhereWeLeftOff: (state) => contextSummarizer.generateWhereWeLeftOff(state),
  prioritizeContext: (context) => contextSummarizer.prioritizeContext(context),
  estimateTokens: (obj) => contextSummarizer.estimateTokens(obj)
};