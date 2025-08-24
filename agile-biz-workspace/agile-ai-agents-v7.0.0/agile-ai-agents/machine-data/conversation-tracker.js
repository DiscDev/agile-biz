/**
 * Conversation Tracker
 * Tracks and summarizes conversation context across sessions
 */

const fs = require('fs');
const path = require('path');

class ConversationTracker {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.contextPath = path.join(this.basePath, '.claude-context');
    this.conversationFile = path.join(this.contextPath, 'recent-context.json');
    
    // Ensure directory exists
    if (!fs.existsSync(this.contextPath)) {
      fs.mkdirSync(this.contextPath, { recursive: true });
    }
    
    // Configuration
    this.maxExchanges = 20;        // Keep last 20 exchanges
    this.maxSummaryLength = 500;   // Max chars per summary
    this.importanceThreshold = 0.7; // Importance score threshold
    
    // Load existing context
    this.conversationHistory = this.loadConversationHistory();
  }
  
  /**
   * Record an exchange between user and assistant
   */
  recordExchange(exchange) {
    try {
      const timestamp = new Date().toISOString();
      
      // Create exchange record
      const record = {
        id: `exchange-${Date.now()}`,
        timestamp: timestamp,
        type: exchange.type || 'conversation',
        user_message: this.truncateMessage(exchange.user_message),
        assistant_response: this.truncateMessage(exchange.assistant_response),
        importance: this.calculateImportance(exchange),
        topics: this.extractTopics(exchange),
        actions: this.extractActions(exchange),
        decisions: this.extractDecisions(exchange),
        files_mentioned: this.extractFiles(exchange),
        summary: this.generateExchangeSummary(exchange)
      };
      
      // Add to history
      this.conversationHistory.exchanges.unshift(record);
      
      // Prune old exchanges
      if (this.conversationHistory.exchanges.length > this.maxExchanges) {
        this.pruneOldContext();
      }
      
      // Update aggregated data
      this.updateAggregatedData(record);
      
      // Save to disk
      this.saveConversationHistory();
      
      console.log(`💬 Recorded exchange: ${record.summary.substring(0, 50)}...`);
      
      return record;
    } catch (error) {
      console.error('Error recording exchange:', error.message);
      return null;
    }
  }
  
  /**
   * Get recent context for restoration
   */
  getRecentContext(limit = 10) {
    try {
      const recent = this.conversationHistory.exchanges.slice(0, limit);
      
      return {
        exchanges: recent,
        summary: this.conversationHistory.session_summary,
        key_topics: this.conversationHistory.aggregated.topics,
        important_decisions: this.conversationHistory.aggregated.decisions.slice(0, 5),
        recent_files: this.conversationHistory.aggregated.files.slice(0, 10),
        context_summary: this.generateContextSummary(recent)
      };
    } catch (error) {
      console.error('Error getting recent context:', error.message);
      return {
        exchanges: [],
        summary: 'No conversation history available',
        key_topics: [],
        important_decisions: [],
        recent_files: []
      };
    }
  }
  
  /**
   * Summarize conversation history
   */
  summarizeConversation(exchanges = null) {
    try {
      const toSummarize = exchanges || this.conversationHistory.exchanges;
      
      if (toSummarize.length === 0) {
        return 'No conversation to summarize';
      }
      
      // Group by importance
      const important = toSummarize.filter(e => e.importance >= this.importanceThreshold);
      const regular = toSummarize.filter(e => e.importance < this.importanceThreshold);
      
      const summary = {
        total_exchanges: toSummarize.length,
        important_exchanges: important.length,
        time_span: this.calculateTimeSpan(toSummarize),
        
        key_points: important.map(e => ({
          time: this.formatRelativeTime(e.timestamp),
          summary: e.summary,
          decisions: e.decisions
        })),
        
        topics_discussed: this.aggregateTopics(toSummarize),
        
        actions_taken: this.aggregateActions(toSummarize),
        
        files_worked_on: this.aggregateFiles(toSummarize),
        
        narrative_summary: this.generateNarrativeSummary(toSummarize)
      };
      
      return summary;
    } catch (error) {
      console.error('Error summarizing conversation:', error.message);
      return 'Error generating summary';
    }
  }
  
  /**
   * Prune old context intelligently
   */
  pruneOldContext() {
    try {
      // Keep all important exchanges
      const important = this.conversationHistory.exchanges.filter(
        e => e.importance >= this.importanceThreshold
      );
      
      // Keep recent exchanges
      const recent = this.conversationHistory.exchanges
        .filter(e => e.importance < this.importanceThreshold)
        .slice(0, this.maxExchanges - important.length);
      
      // Summarize pruned exchanges
      const pruned = this.conversationHistory.exchanges.slice(this.maxExchanges);
      if (pruned.length > 0) {
        const prunedSummary = this.generateNarrativeSummary(pruned);
        this.conversationHistory.archived_summaries.push({
          timestamp: new Date().toISOString(),
          exchange_count: pruned.length,
          summary: prunedSummary
        });
      }
      
      // Update exchanges
      this.conversationHistory.exchanges = [...important, ...recent];
      
      // Keep only last 10 archived summaries
      if (this.conversationHistory.archived_summaries.length > 10) {
        this.conversationHistory.archived_summaries = 
          this.conversationHistory.archived_summaries.slice(-10);
      }
      
      console.log(`🧹 Pruned ${pruned.length} old exchanges`);
    } catch (error) {
      console.error('Error pruning context:', error.message);
    }
  }
  
  /**
   * Load conversation history
   */
  loadConversationHistory() {
    try {
      if (fs.existsSync(this.conversationFile)) {
        return JSON.parse(fs.readFileSync(this.conversationFile, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading conversation history:', error.message);
    }
    
    // Return default structure
    return {
      version: '1.0.0',
      last_updated: new Date().toISOString(),
      exchanges: [],
      session_summary: '',
      aggregated: {
        topics: [],
        decisions: [],
        actions: [],
        files: []
      },
      archived_summaries: []
    };
  }
  
  /**
   * Save conversation history
   */
  saveConversationHistory() {
    try {
      this.conversationHistory.last_updated = new Date().toISOString();
      fs.writeFileSync(
        this.conversationFile,
        JSON.stringify(this.conversationHistory, null, 2)
      );
    } catch (error) {
      console.error('Error saving conversation history:', error.message);
    }
  }
  
  /**
   * Calculate importance of exchange
   */
  calculateImportance(exchange) {
    let score = 0.5; // Base score
    
    // Check for decision keywords
    const decisionKeywords = ['decided', 'choose', 'selected', 'will use', 'going with'];
    const hasDecision = decisionKeywords.some(keyword => 
      exchange.user_message?.toLowerCase().includes(keyword) ||
      exchange.assistant_response?.toLowerCase().includes(keyword)
    );
    if (hasDecision) score += 0.3;
    
    // Check for action keywords
    const actionKeywords = ['create', 'implement', 'build', 'deploy', 'fix', 'update'];
    const hasAction = actionKeywords.some(keyword =>
      exchange.assistant_response?.toLowerCase().includes(keyword)
    );
    if (hasAction) score += 0.2;
    
    // Check for problem/blocker keywords
    const problemKeywords = ['error', 'issue', 'problem', 'blocker', 'failed'];
    const hasProblem = problemKeywords.some(keyword =>
      exchange.user_message?.toLowerCase().includes(keyword)
    );
    if (hasProblem) score += 0.2;
    
    // Check for file operations
    if (exchange.files_mentioned?.length > 0) score += 0.1;
    
    // Cap at 1.0
    return Math.min(score, 1.0);
  }
  
  /**
   * Extract topics from exchange
   */
  extractTopics(exchange) {
    const topics = [];
    const text = `${exchange.user_message || ''} ${exchange.assistant_response || ''}`.toLowerCase();
    
    // Topic patterns
    const topicPatterns = {
      'architecture': ['architecture', 'design', 'structure', 'pattern'],
      'implementation': ['implement', 'code', 'develop', 'build'],
      'testing': ['test', 'testing', 'coverage', 'unit test'],
      'deployment': ['deploy', 'deployment', 'production', 'release'],
      'debugging': ['error', 'bug', 'fix', 'issue', 'problem'],
      'configuration': ['config', 'setup', 'environment', 'settings'],
      'documentation': ['document', 'readme', 'docs', 'comment'],
      'planning': ['plan', 'sprint', 'task', 'story', 'requirement']
    };
    
    Object.entries(topicPatterns).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return [...new Set(topics)]; // Remove duplicates
  }
  
  /**
   * Extract actions from exchange
   */
  extractActions(exchange) {
    const actions = [];
    const response = exchange.assistant_response || '';
    
    // Action patterns
    const actionPatterns = [
      /created? (?:file|directory|function|class) (\S+)/gi,
      /updated? (?:file|function|class) (\S+)/gi,
      /implemented? (\S+)/gi,
      /fixed? (?:bug|issue|error) (?:in|with) (\S+)/gi,
      /deployed? (?:to)? (\S+)/gi
    ];
    
    actionPatterns.forEach(pattern => {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        actions.push(match[0]);
      }
    });
    
    return actions;
  }
  
  /**
   * Extract decisions from exchange
   */
  extractDecisions(exchange) {
    const decisions = [];
    const text = `${exchange.user_message || ''} ${exchange.assistant_response || ''}`;
    
    // Decision patterns
    const decisionPatterns = [
      /decided to (\S+.*?)(?:\.|$)/gi,
      /will use (\S+.*?)(?:\.|$)/gi,
      /chose (\S+.*?)(?:\.|$)/gi,
      /going with (\S+.*?)(?:\.|$)/gi,
      /selected (\S+.*?)(?:\.|$)/gi
    ];
    
    decisionPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        decisions.push(match[1].trim());
      }
    });
    
    return decisions;
  }
  
  /**
   * Extract file mentions
   */
  extractFiles(exchange) {
    const files = [];
    const text = `${exchange.user_message || ''} ${exchange.assistant_response || ''}`;
    
    // File patterns
    const filePattern = /(?:\/[\w\-./]+\.[\w]+)|(?:[\w\-]+\.[\w]+)/g;
    const matches = text.match(filePattern) || [];
    
    matches.forEach(match => {
      // Filter out common false positives
      if (!match.includes('example.') && !match.includes('test.')) {
        files.push(match);
      }
    });
    
    return [...new Set(files)]; // Remove duplicates
  }
  
  /**
   * Generate exchange summary
   */
  generateExchangeSummary(exchange) {
    // Prioritize user intent
    if (exchange.user_message) {
      const userIntent = exchange.user_message
        .substring(0, 100)
        .replace(/\n/g, ' ')
        .trim();
      
      // If assistant took action, note it
      if (exchange.actions?.length > 0) {
        return `User: ${userIntent} → Assistant: ${exchange.actions[0]}`;
      }
      
      return `User: ${userIntent}`;
    }
    
    return 'Exchange recorded';
  }
  
  /**
   * Update aggregated data
   */
  updateAggregatedData(record) {
    // Update topics
    record.topics.forEach(topic => {
      const existing = this.conversationHistory.aggregated.topics.find(t => t.name === topic);
      if (existing) {
        existing.count++;
        existing.last_mentioned = record.timestamp;
      } else {
        this.conversationHistory.aggregated.topics.push({
          name: topic,
          count: 1,
          last_mentioned: record.timestamp
        });
      }
    });
    
    // Update decisions
    record.decisions.forEach(decision => {
      this.conversationHistory.aggregated.decisions.unshift({
        decision: decision,
        timestamp: record.timestamp,
        exchange_id: record.id
      });
    });
    
    // Keep only last 20 decisions
    this.conversationHistory.aggregated.decisions = 
      this.conversationHistory.aggregated.decisions.slice(0, 20);
    
    // Update actions
    record.actions.forEach(action => {
      this.conversationHistory.aggregated.actions.unshift({
        action: action,
        timestamp: record.timestamp
      });
    });
    
    // Keep only last 50 actions
    this.conversationHistory.aggregated.actions = 
      this.conversationHistory.aggregated.actions.slice(0, 50);
    
    // Update files
    record.files_mentioned.forEach(file => {
      if (!this.conversationHistory.aggregated.files.includes(file)) {
        this.conversationHistory.aggregated.files.unshift(file);
      }
    });
    
    // Keep only last 30 files
    this.conversationHistory.aggregated.files = 
      this.conversationHistory.aggregated.files.slice(0, 30);
  }
  
  /**
   * Truncate long messages
   */
  truncateMessage(message, maxLength = 1000) {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }
  
  /**
   * Generate context summary
   */
  generateContextSummary(exchanges) {
    if (exchanges.length === 0) return 'No recent context';
    
    const topics = this.aggregateTopics(exchanges);
    const topTopics = topics.slice(0, 3).map(t => t.name).join(', ');
    
    const timeSpan = this.calculateTimeSpan(exchanges);
    const importantCount = exchanges.filter(e => e.importance >= this.importanceThreshold).length;
    
    return `${exchanges.length} exchanges over ${timeSpan}, covering ${topTopics}. ${importantCount} marked as important.`;
  }
  
  /**
   * Calculate time span
   */
  calculateTimeSpan(exchanges) {
    if (exchanges.length === 0) return 'no time';
    
    const first = new Date(exchanges[exchanges.length - 1].timestamp);
    const last = new Date(exchanges[0].timestamp);
    const diff = last - first;
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  }
  
  /**
   * Aggregate topics
   */
  aggregateTopics(exchanges) {
    const topicCounts = {};
    
    exchanges.forEach(exchange => {
      exchange.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });
    
    return Object.entries(topicCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  /**
   * Aggregate actions
   */
  aggregateActions(exchanges) {
    const actions = [];
    exchanges.forEach(exchange => {
      actions.push(...exchange.actions);
    });
    return [...new Set(actions)]; // Remove duplicates
  }
  
  /**
   * Aggregate files
   */
  aggregateFiles(exchanges) {
    const files = [];
    exchanges.forEach(exchange => {
      files.push(...exchange.files_mentioned);
    });
    return [...new Set(files)]; // Remove duplicates
  }
  
  /**
   * Generate narrative summary
   */
  generateNarrativeSummary(exchanges) {
    if (exchanges.length === 0) return 'No activity to summarize.';
    
    const topics = this.aggregateTopics(exchanges);
    const actions = this.aggregateActions(exchanges);
    const decisions = exchanges.flatMap(e => e.decisions);
    
    let summary = `Over ${exchanges.length} exchanges, `;
    
    if (topics.length > 0) {
      summary += `discussed ${topics.slice(0, 3).map(t => t.name).join(', ')}. `;
    }
    
    if (actions.length > 0) {
      summary += `Performed ${actions.length} actions. `;
    }
    
    if (decisions.length > 0) {
      summary += `Made ${decisions.length} decisions. `;
    }
    
    return summary;
  }
}

// Export singleton instance
const conversationTracker = new ConversationTracker();

module.exports = {
  ConversationTracker,
  conversationTracker,
  
  // Convenience exports
  recordExchange: (exchange) => conversationTracker.recordExchange(exchange),
  getRecentContext: (limit) => conversationTracker.getRecentContext(limit),
  summarizeConversation: (exchanges) => conversationTracker.summarizeConversation(exchanges),
  pruneOldContext: () => conversationTracker.pruneOldContext()
};