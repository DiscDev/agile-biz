/**
 * Decision Logger
 * Tracks all significant decisions with rationale and impact
 */

const fs = require('fs');
const path = require('path');
const { stateTracker } = require('./state-tracker');

class DecisionLogger {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.decisionLogPath = path.join(this.basePath, '.claude-context', 'decision-log.json');
    
    // Ensure directory exists
    const dir = path.dirname(this.decisionLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Decision categories
    this.categories = {
      architecture: 'System design and structure decisions',
      technology: 'Technology and tool selections',
      process: 'Development process and workflow decisions',
      feature: 'Feature implementation decisions',
      security: 'Security-related decisions',
      performance: 'Performance optimization decisions',
      business: 'Business logic and rules decisions',
      deployment: 'Deployment and infrastructure decisions'
    };
    
    // Load existing decisions
    this.decisionLog = this.loadDecisionLog();
  }
  
  /**
   * Log a new decision
   */
  logDecision(decision) {
    try {
      const decisionRecord = {
        id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        
        // Core decision data
        decision: decision.decision,
        rationale: decision.rationale,
        category: this.categorizeDecision(decision),
        
        // Context
        made_by: decision.made_by || 'system',
        agent_involved: decision.agent_involved || null,
        sprint_id: decision.sprint_id || this.getCurrentSprint(),
        
        // Alternatives and analysis
        alternatives_considered: decision.alternatives || [],
        pros: decision.pros || [],
        cons: decision.cons || [],
        
        // Impact and tracking
        expected_impact: decision.expected_impact || 'unknown',
        actual_impact: null, // To be updated later
        impact_measurement: decision.impact_measurement || null,
        
        // Implementation
        implementation_status: 'pending',
        related_files: decision.related_files || [],
        related_tasks: decision.related_tasks || [],
        dependencies: decision.dependencies || [],
        
        // Metadata
        tags: this.extractTags(decision),
        reversible: decision.reversible !== false,
        review_needed: decision.review_needed || false,
        review_date: decision.review_date || null,
        
        // Links
        references: decision.references || [],
        linked_decisions: decision.linked_decisions || []
      };
      
      // Add to log
      this.decisionLog.decisions.unshift(decisionRecord);
      
      // Update indices
      this.updateIndices(decisionRecord);
      
      // Track in state
      stateTracker.trackDecision(decisionRecord);
      
      // Save to disk
      this.saveDecisionLog();
      
      console.log(`📝 Decision logged: ${decisionRecord.decision}`);
      console.log(`   Category: ${decisionRecord.category}`);
      console.log(`   ID: ${decisionRecord.id}`);
      
      return decisionRecord;
    } catch (error) {
      console.error('Error logging decision:', error.message);
      throw error;
    }
  }
  
  /**
   * Update decision impact
   */
  updateDecisionImpact(decisionId, impact) {
    try {
      const decision = this.decisionLog.decisions.find(d => d.id === decisionId);
      
      if (!decision) {
        throw new Error(`Decision ${decisionId} not found`);
      }
      
      decision.actual_impact = impact.actual_impact;
      decision.impact_notes = impact.notes;
      decision.impact_measured_at = new Date().toISOString();
      
      if (impact.metrics) {
        decision.impact_metrics = impact.metrics;
      }
      
      // Update status if provided
      if (impact.implementation_status) {
        decision.implementation_status = impact.implementation_status;
      }
      
      this.saveDecisionLog();
      
      console.log(`✅ Updated impact for decision ${decisionId}`);
      
      return decision;
    } catch (error) {
      console.error('Error updating decision impact:', error.message);
      throw error;
    }
  }
  
  /**
   * Link decisions to code changes
   */
  linkToCodeChanges(decisionId, changes) {
    try {
      const decision = this.decisionLog.decisions.find(d => d.id === decisionId);
      
      if (!decision) {
        throw new Error(`Decision ${decisionId} not found`);
      }
      
      // Add file links
      if (changes.files) {
        decision.related_files = [...new Set([...decision.related_files, ...changes.files])];
      }
      
      // Add commit info if available
      if (changes.commit) {
        if (!decision.commits) {
          decision.commits = [];
        }
        decision.commits.push({
          hash: changes.commit,
          timestamp: new Date().toISOString(),
          message: changes.commit_message || ''
        });
      }
      
      // Update implementation status
      decision.implementation_status = 'in_progress';
      
      this.saveDecisionLog();
      
      console.log(`🔗 Linked code changes to decision ${decisionId}`);
      
      return decision;
    } catch (error) {
      console.error('Error linking code changes:', error.message);
      throw error;
    }
  }
  
  /**
   * Search decisions
   */
  searchDecisions(query) {
    try {
      const searchTerm = query.toLowerCase();
      
      return this.decisionLog.decisions.filter(decision => {
        // Search in decision text
        if (decision.decision.toLowerCase().includes(searchTerm)) return true;
        
        // Search in rationale
        if (decision.rationale.toLowerCase().includes(searchTerm)) return true;
        
        // Search in category
        if (decision.category.toLowerCase().includes(searchTerm)) return true;
        
        // Search in tags
        if (decision.tags.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
        
        // Search in alternatives
        if (decision.alternatives_considered.some(alt => 
          alt.toLowerCase().includes(searchTerm)
        )) return true;
        
        return false;
      });
    } catch (error) {
      console.error('Error searching decisions:', error.message);
      return [];
    }
  }
  
  /**
   * Get decisions by category
   */
  getDecisionsByCategory(category) {
    return this.decisionLog.decisions.filter(d => d.category === category);
  }
  
  /**
   * Get decisions by sprint
   */
  getDecisionsBySprint(sprintId) {
    return this.decisionLog.decisions.filter(d => d.sprint_id === sprintId);
  }
  
  /**
   * Get pending decisions
   */
  getPendingDecisions() {
    return this.decisionLog.decisions.filter(
      d => d.implementation_status === 'pending'
    );
  }
  
  /**
   * Get decisions needing review
   */
  getDecisionsNeedingReview() {
    const now = new Date();
    
    return this.decisionLog.decisions.filter(decision => {
      if (!decision.review_needed) return false;
      if (!decision.review_date) return true;
      
      const reviewDate = new Date(decision.review_date);
      return reviewDate <= now;
    });
  }
  
  /**
   * Generate decision report
   */
  generateDecisionReport(options = {}) {
    const { sprintId, category, startDate, endDate } = options;
    
    let decisions = [...this.decisionLog.decisions];
    
    // Apply filters
    if (sprintId) {
      decisions = decisions.filter(d => d.sprint_id === sprintId);
    }
    
    if (category) {
      decisions = decisions.filter(d => d.category === category);
    }
    
    if (startDate || endDate) {
      decisions = decisions.filter(d => {
        const decisionDate = new Date(d.timestamp);
        if (startDate && decisionDate < new Date(startDate)) return false;
        if (endDate && decisionDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Generate report
    const report = {
      generated_at: new Date().toISOString(),
      filters: options,
      summary: {
        total_decisions: decisions.length,
        by_category: this.groupByCategory(decisions),
        by_status: this.groupByStatus(decisions),
        by_impact: this.groupByImpact(decisions)
      },
      decisions: decisions.map(d => ({
        id: d.id,
        date: d.timestamp,
        decision: d.decision,
        category: d.category,
        status: d.implementation_status,
        impact: d.actual_impact || d.expected_impact
      })),
      insights: this.generateInsights(decisions)
    };
    
    return report;
  }
  
  /**
   * Categorize decision
   */
  categorizeDecision(decision) {
    const text = `${decision.decision} ${decision.rationale}`.toLowerCase();
    
    // Check each category
    for (const [category, description] of Object.entries(this.categories)) {
      const keywords = this.getCategoryKeywords(category);
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }
  
  /**
   * Get category keywords
   */
  getCategoryKeywords(category) {
    const keywords = {
      architecture: ['architecture', 'design', 'structure', 'pattern', 'component'],
      technology: ['technology', 'framework', 'library', 'tool', 'stack'],
      process: ['process', 'workflow', 'methodology', 'sprint', 'agile'],
      feature: ['feature', 'functionality', 'capability', 'requirement'],
      security: ['security', 'authentication', 'authorization', 'encryption', 'vulnerability'],
      performance: ['performance', 'optimization', 'speed', 'efficiency', 'cache'],
      business: ['business', 'logic', 'rule', 'requirement', 'specification'],
      deployment: ['deployment', 'infrastructure', 'CI/CD', 'docker', 'kubernetes']
    };
    
    return keywords[category] || [];
  }
  
  /**
   * Extract tags from decision
   */
  extractTags(decision) {
    const tags = [];
    const text = `${decision.decision} ${decision.rationale}`.toLowerCase();
    
    // Technology tags
    const technologies = ['react', 'node', 'python', 'docker', 'kubernetes', 'aws'];
    technologies.forEach(tech => {
      if (text.includes(tech)) tags.push(tech);
    });
    
    // Type tags
    if (text.includes('api')) tags.push('api');
    if (text.includes('database')) tags.push('database');
    if (text.includes('frontend')) tags.push('frontend');
    if (text.includes('backend')) tags.push('backend');
    
    // Add custom tags
    if (decision.tags) {
      tags.push(...decision.tags);
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }
  
  /**
   * Update indices
   */
  updateIndices(decision) {
    // Update category index
    if (!this.decisionLog.indices.by_category[decision.category]) {
      this.decisionLog.indices.by_category[decision.category] = [];
    }
    this.decisionLog.indices.by_category[decision.category].unshift(decision.id);
    
    // Update sprint index
    if (decision.sprint_id) {
      if (!this.decisionLog.indices.by_sprint[decision.sprint_id]) {
        this.decisionLog.indices.by_sprint[decision.sprint_id] = [];
      }
      this.decisionLog.indices.by_sprint[decision.sprint_id].unshift(decision.id);
    }
    
    // Update tag index
    decision.tags.forEach(tag => {
      if (!this.decisionLog.indices.by_tag[tag]) {
        this.decisionLog.indices.by_tag[tag] = [];
      }
      this.decisionLog.indices.by_tag[tag].unshift(decision.id);
    });
  }
  
  /**
   * Get current sprint
   */
  getCurrentSprint() {
    const state = stateTracker.loadProjectState();
    return state?.project?.active_sprint || null;
  }
  
  /**
   * Load decision log
   */
  loadDecisionLog() {
    try {
      if (fs.existsSync(this.decisionLogPath)) {
        return JSON.parse(fs.readFileSync(this.decisionLogPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading decision log:', error.message);
    }
    
    // Return default structure
    return {
      version: '1.0.0',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      decisions: [],
      indices: {
        by_category: {},
        by_sprint: {},
        by_tag: {}
      },
      statistics: {
        total_decisions: 0,
        decisions_implemented: 0,
        average_implementation_time: null
      }
    };
  }
  
  /**
   * Save decision log
   */
  saveDecisionLog() {
    try {
      // Update statistics
      this.updateStatistics();
      
      // Update timestamp
      this.decisionLog.last_updated = new Date().toISOString();
      
      // Save to disk
      fs.writeFileSync(
        this.decisionLogPath,
        JSON.stringify(this.decisionLog, null, 2)
      );
    } catch (error) {
      console.error('Error saving decision log:', error.message);
    }
  }
  
  /**
   * Update statistics
   */
  updateStatistics() {
    const stats = this.decisionLog.statistics;
    
    stats.total_decisions = this.decisionLog.decisions.length;
    stats.decisions_implemented = this.decisionLog.decisions.filter(
      d => d.implementation_status === 'completed'
    ).length;
    
    // Calculate average implementation time
    const implementedDecisions = this.decisionLog.decisions.filter(
      d => d.implementation_status === 'completed' && d.impact_measured_at
    );
    
    if (implementedDecisions.length > 0) {
      const totalTime = implementedDecisions.reduce((sum, decision) => {
        const start = new Date(decision.timestamp);
        const end = new Date(decision.impact_measured_at);
        return sum + (end - start);
      }, 0);
      
      stats.average_implementation_time = totalTime / implementedDecisions.length;
    }
  }
  
  /**
   * Group decisions by category
   */
  groupByCategory(decisions) {
    const grouped = {};
    decisions.forEach(decision => {
      grouped[decision.category] = (grouped[decision.category] || 0) + 1;
    });
    return grouped;
  }
  
  /**
   * Group decisions by status
   */
  groupByStatus(decisions) {
    const grouped = {};
    decisions.forEach(decision => {
      grouped[decision.implementation_status] = 
        (grouped[decision.implementation_status] || 0) + 1;
    });
    return grouped;
  }
  
  /**
   * Group decisions by impact
   */
  groupByImpact(decisions) {
    const grouped = {};
    decisions.forEach(decision => {
      const impact = decision.actual_impact || decision.expected_impact;
      grouped[impact] = (grouped[impact] || 0) + 1;
    });
    return grouped;
  }
  
  /**
   * Generate insights
   */
  generateInsights(decisions) {
    const insights = [];
    
    // Most common category
    const byCategory = this.groupByCategory(decisions);
    const topCategory = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory) {
      insights.push(`Most decisions were about ${topCategory[0]} (${topCategory[1]} decisions)`);
    }
    
    // Implementation rate
    const implemented = decisions.filter(d => d.implementation_status === 'completed').length;
    const implementationRate = (implemented / decisions.length * 100).toFixed(0);
    insights.push(`${implementationRate}% of decisions have been implemented`);
    
    // Decisions needing review
    const needingReview = decisions.filter(d => d.review_needed && !d.review_date).length;
    if (needingReview > 0) {
      insights.push(`${needingReview} decisions need review`);
    }
    
    return insights;
  }
}

// Export singleton instance
const decisionLogger = new DecisionLogger();

module.exports = {
  DecisionLogger,
  decisionLogger,
  
  // Convenience exports
  logDecision: (decision) => decisionLogger.logDecision(decision),
  updateDecisionImpact: (id, impact) => decisionLogger.updateDecisionImpact(id, impact),
  linkToCodeChanges: (id, changes) => decisionLogger.linkToCodeChanges(id, changes),
  searchDecisions: (query) => decisionLogger.searchDecisions(query),
  generateDecisionReport: (options) => decisionLogger.generateDecisionReport(options)
};