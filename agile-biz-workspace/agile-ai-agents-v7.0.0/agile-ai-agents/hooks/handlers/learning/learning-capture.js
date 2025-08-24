#!/usr/bin/env node

/**
 * Learning Capture Hook Handler
 * Automatically captures learnings from significant events
 */

const fs = require('fs');
const path = require('path');

class LearningCaptureHandler {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.learningsDir = path.join(this.projectRoot, 'community-learnings/capture');
    this.config = this.loadConfig();
  }

  parseContext() {
    return {
      triggerEvent: process.env.TRIGGER_EVENT || process.argv[2] || 'manual',
      eventData: process.env.EVENT_DATA ? JSON.parse(process.env.EVENT_DATA) : {},
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadConfig() {
    return {
      capture: {
        autoCapture: true,
        captureEvents: [
          'sprint-complete',
          'milestone-reached',
          'deployment-success',
          'critical-bug-resolved',
          'performance-improvement',
          'workflow-optimization'
        ],
        minSprintDuration: 2, // days
        includeMetrics: true,
        includePatterns: true,
        anonymize: true
      },
      categories: {
        performance: ['velocity', 'throughput', 'efficiency'],
        quality: ['bug-rate', 'test-coverage', 'code-quality'],
        process: ['workflow', 'collaboration', 'automation'],
        technical: ['architecture', 'tools', 'integration']
      }
    };
  }

  async execute() {
    try {
      const { triggerEvent, eventData } = this.context;
      
      // Check if event should trigger capture
      if (!this.shouldCapture(triggerEvent, eventData)) {
        return { status: 'skipped', reason: 'Event not configured for capture' };
      }

      // Gather learning context
      const learningContext = await this.gatherContext(triggerEvent, eventData);
      
      // Extract learnings
      const learnings = this.extractLearnings(learningContext);
      
      // Anonymize if configured
      if (this.config.capture.anonymize) {
        this.anonymizeLearnings(learnings);
      }

      // Save learnings
      const savedPath = this.saveLearnings(learnings);
      
      // Update learning summary
      this.updateSummary(learnings);

      return {
        status: 'success',
        captured: learnings.insights.length,
        categories: Object.keys(learnings.categories),
        path: savedPath
      };

    } catch (error) {
      console.error('Learning capture failed:', error);
      throw error;
    }
  }

  shouldCapture(triggerEvent, eventData) {
    // Check if auto-capture is enabled
    if (!this.config.capture.autoCapture) {
      return triggerEvent === 'manual';
    }

    // Check if event is in capture list
    if (!this.config.capture.captureEvents.includes(triggerEvent)) {
      return false;
    }

    // Additional validation for specific events
    switch (triggerEvent) {
      case 'sprint-complete':
        return this.validateSprintCapture(eventData);
      case 'milestone-reached':
        return eventData.significance >= 'medium';
      case 'deployment-success':
        return eventData.environment === 'production';
      default:
        return true;
    }
  }

  validateSprintCapture(eventData) {
    if (!eventData.sprintDuration) return true;
    
    // Check minimum sprint duration
    const durationDays = eventData.sprintDuration / (1000 * 60 * 60 * 24);
    return durationDays >= this.config.capture.minSprintDuration;
  }

  async gatherContext(triggerEvent, eventData) {
    const context = {
      trigger: triggerEvent,
      eventData,
      timestamp: this.context.timestamp,
      project: {},
      sprint: {},
      metrics: {},
      patterns: {},
      environment: {}
    };

    // Load project state
    const statePath = path.join(this.projectRoot, 'project-state/current-state.json');
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      context.project = {
        id: state.project_id,
        type: state.project_type,
        phase: state.workflow_phase,
        duration: this.calculateDuration(state.created_at)
      };
    }

    // Load sprint data
    if (eventData.sprintId) {
      context.sprint = await this.loadSprintData(eventData.sprintId);
    }

    // Gather metrics
    if (this.config.capture.includeMetrics) {
      context.metrics = await this.gatherMetrics();
    }

    // Identify patterns
    if (this.config.capture.includePatterns) {
      context.patterns = await this.identifyPatterns();
    }

    // System environment
    context.environment = {
      agentsUsed: await this.getActiveAgents(),
      toolsUsed: await this.getToolsUsed(),
      workflowType: eventData.workflowType || 'standard'
    };

    return context;
  }

  async loadSprintData(sprintId) {
    const sprintPath = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintId
    );

    if (!fs.existsSync(sprintPath)) {
      return {};
    }

    const sprintData = {
      id: sprintId,
      metrics: {}
    };

    // Load sprint state
    const statePath = path.join(sprintPath, 'state.md');
    if (fs.existsSync(statePath)) {
      const content = fs.readFileSync(statePath, 'utf8');
      sprintData.state = this.extractSprintState(content);
    }

    // Load metrics from review
    const reviewPath = path.join(sprintPath, 'review.md');
    if (fs.existsSync(reviewPath)) {
      const content = fs.readFileSync(reviewPath, 'utf8');
      sprintData.metrics = this.extractSprintMetrics(content);
    }

    return sprintData;
  }

  extractSprintState(content) {
    const stateMatch = content.match(/Current State:\s*(\w+)/i);
    return stateMatch ? stateMatch[1] : 'unknown';
  }

  extractSprintMetrics(content) {
    const metrics = {};
    
    const patterns = {
      plannedPoints: /Planned Points:\s*(\d+)/i,
      completedPoints: /Completed Points:\s*(\d+)/i,
      velocity: /Velocity:\s*(\d+)/i,
      completionRate: /Completion Rate:\s*([\d.]+)%/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        metrics[key] = parseFloat(match[1]);
      }
    }

    return metrics;
  }

  async gatherMetrics() {
    const metrics = {
      velocity: {},
      quality: {},
      efficiency: {}
    };

    // Load velocity metrics
    const velocityPath = path.join(
      this.projectRoot,
      'project-documents/orchestration/product-backlog/velocity-metrics.json'
    );
    if (fs.existsSync(velocityPath)) {
      const velocityData = JSON.parse(fs.readFileSync(velocityPath, 'utf8'));
      metrics.velocity = {
        average: velocityData.summary?.average_velocity || 0,
        trend: this.calculateVelocityTrend(velocityData),
        consistency: this.calculateConsistency(velocityData)
      };
    }

    // Load quality metrics
    metrics.quality = await this.gatherQualityMetrics();
    
    // Calculate efficiency
    metrics.efficiency = await this.calculateEfficiency();

    return metrics;
  }

  calculateVelocityTrend(velocityData) {
    if (!velocityData.sprints) return 'stable';
    
    const recentSprints = Object.values(velocityData.sprints)
      .filter(s => s.state === 'completed')
      .slice(-3);
    
    if (recentSprints.length < 2) return 'insufficient-data';
    
    const velocities = recentSprints.map(s => s.velocity || 0);
    const trend = velocities[velocities.length - 1] - velocities[0];
    
    if (trend > 5) return 'improving';
    if (trend < -5) return 'declining';
    return 'stable';
  }

  calculateConsistency(velocityData) {
    if (!velocityData.sprints) return 0;
    
    const velocities = Object.values(velocityData.sprints)
      .filter(s => s.velocity)
      .map(s => s.velocity);
    
    if (velocities.length < 2) return 100;
    
    const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / velocities.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to consistency percentage (lower std dev = higher consistency)
    return Math.max(0, 100 - (stdDev / avg * 100));
  }

  async gatherQualityMetrics() {
    // This would integrate with testing results, code quality tools, etc.
    return {
      testCoverage: 'unknown',
      bugRate: 'unknown',
      codeQualityScore: 'unknown'
    };
  }

  async calculateEfficiency() {
    return {
      automationLevel: 'high', // Based on hook usage
      reworkRate: 'unknown',
      blockageFrequency: 'unknown'
    };
  }

  async identifyPatterns() {
    const patterns = {
      workflow: [],
      collaboration: [],
      technical: [],
      bottlenecks: []
    };

    // Analyze agent collaboration patterns
    const agentContextPath = path.join(this.projectRoot, 'project-state/agent-context.json');
    if (fs.existsSync(agentContextPath)) {
      const agentContext = JSON.parse(fs.readFileSync(agentContextPath, 'utf8'));
      patterns.collaboration = agentContext.collaboration_patterns || [];
    }

    // Identify workflow patterns
    patterns.workflow = await this.analyzeWorkflowPatterns();
    
    // Technical patterns (would analyze code changes, architecture decisions)
    patterns.technical = await this.analyzeTechnicalPatterns();
    
    // Bottleneck patterns
    patterns.bottlenecks = await this.identifyBottlenecks();

    return patterns;
  }

  async analyzeWorkflowPatterns() {
    // Simplified pattern detection
    return [
      'sequential-handoffs',
      'parallel-execution',
      'iterative-refinement'
    ];
  }

  async analyzeTechnicalPatterns() {
    return [
      'modular-architecture',
      'api-first-design',
      'test-driven-development'
    ];
  }

  async identifyBottlenecks() {
    return [];
  }

  async getActiveAgents() {
    const agentContextPath = path.join(this.projectRoot, 'project-state/agent-context.json');
    if (fs.existsSync(agentContextPath)) {
      const context = JSON.parse(fs.readFileSync(agentContextPath, 'utf8'));
      return Object.keys(context.agent_interactions || {});
    }
    return [];
  }

  async getToolsUsed() {
    // Would analyze tool usage from logs
    return ['mcp-servers', 'dashboard', 'hooks'];
  }

  extractLearnings(context) {
    const learnings = {
      id: this.generateLearningId(),
      timestamp: this.context.timestamp,
      trigger: context.trigger,
      duration: context.project.duration,
      insights: [],
      categories: {},
      metrics: context.metrics,
      patterns: context.patterns,
      recommendations: []
    };

    // Extract insights based on trigger type
    switch (context.trigger) {
      case 'sprint-complete':
        learnings.insights.push(...this.extractSprintInsights(context));
        break;
      case 'milestone-reached':
        learnings.insights.push(...this.extractMilestoneInsights(context));
        break;
      case 'deployment-success':
        learnings.insights.push(...this.extractDeploymentInsights(context));
        break;
    }

    // Categorize insights
    learnings.insights.forEach(insight => {
      const category = this.categorizeInsight(insight);
      if (!learnings.categories[category]) {
        learnings.categories[category] = [];
      }
      learnings.categories[category].push(insight);
    });

    // Generate recommendations
    learnings.recommendations = this.generateRecommendations(learnings);

    return learnings;
  }

  extractSprintInsights(context) {
    const insights = [];
    const sprint = context.sprint;
    
    if (sprint.metrics) {
      // Velocity insights
      if (sprint.metrics.velocity > sprint.metrics.plannedPoints) {
        insights.push({
          type: 'velocity-exceeded',
          message: 'Team velocity exceeded planned capacity',
          impact: 'positive',
          metric: sprint.metrics.velocity
        });
      }
      
      // Completion insights
      if (sprint.metrics.completionRate && sprint.metrics.completionRate >= 90) {
        insights.push({
          type: 'high-completion',
          message: 'Achieved high sprint completion rate',
          impact: 'positive',
          metric: sprint.metrics.completionRate
        });
      }
    }

    // Pattern-based insights
    if (context.patterns.collaboration.length > 3) {
      insights.push({
        type: 'collaborative-workflow',
        message: 'Multiple agent collaboration patterns identified',
        impact: 'positive',
        patterns: context.patterns.collaboration
      });
    }

    return insights;
  }

  extractMilestoneInsights(context) {
    return [{
      type: 'milestone-achievement',
      message: `Reached ${context.eventData.percentage}% project completion`,
      impact: 'positive',
      timing: context.project.duration
    }];
  }

  extractDeploymentInsights(context) {
    return [{
      type: 'successful-deployment',
      message: 'Production deployment completed successfully',
      impact: 'positive',
      environment: context.eventData.environment
    }];
  }

  categorizeInsight(insight) {
    for (const [category, keywords] of Object.entries(this.config.categories)) {
      if (keywords.some(keyword => 
        insight.type.includes(keyword) || 
        insight.message.toLowerCase().includes(keyword)
      )) {
        return category;
      }
    }
    return 'general';
  }

  generateRecommendations(learnings) {
    const recommendations = [];
    
    // Velocity-based recommendations
    if (learnings.metrics.velocity.trend === 'improving') {
      recommendations.push({
        type: 'maintain-practices',
        message: 'Continue current velocity improvement practices',
        priority: 'medium'
      });
    } else if (learnings.metrics.velocity.trend === 'declining') {
      recommendations.push({
        type: 'investigate-velocity',
        message: 'Investigate causes of velocity decline',
        priority: 'high'
      });
    }

    // Pattern-based recommendations
    if (learnings.patterns.bottlenecks.length > 0) {
      recommendations.push({
        type: 'address-bottlenecks',
        message: 'Address identified workflow bottlenecks',
        priority: 'high',
        bottlenecks: learnings.patterns.bottlenecks
      });
    }

    return recommendations;
  }

  anonymizeLearnings(learnings) {
    // Remove sensitive information
    delete learnings.project?.id;
    
    // Generalize specific values
    if (learnings.metrics.velocity.average) {
      learnings.metrics.velocity.average = Math.round(learnings.metrics.velocity.average / 5) * 5;
    }
    
    // Remove identifiable patterns
    learnings.patterns.collaboration = learnings.patterns.collaboration
      .map(pattern => pattern.replace(/\w+_agent/g, 'agent'));
  }

  saveLearnings(learnings) {
    // Ensure directory exists
    if (!fs.existsSync(this.learningsDir)) {
      fs.mkdirSync(this.learningsDir, { recursive: true });
    }

    const filename = `learning-${learnings.id}.json`;
    const filepath = path.join(this.learningsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(learnings, null, 2));
    
    return filepath;
  }

  updateSummary(learnings) {
    const summaryPath = path.join(this.learningsDir, 'summary.json');
    
    let summary = {};
    if (fs.existsSync(summaryPath)) {
      summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    }

    // Initialize if needed
    if (!summary.total_captures) {
      summary = {
        total_captures: 0,
        by_trigger: {},
        by_category: {},
        top_insights: [],
        last_updated: null
      };
    }

    // Update counts
    summary.total_captures++;
    summary.by_trigger[learnings.trigger] = (summary.by_trigger[learnings.trigger] || 0) + 1;
    
    // Update categories
    Object.keys(learnings.categories).forEach(category => {
      summary.by_category[category] = (summary.by_category[category] || 0) + 
        learnings.categories[category].length;
    });

    // Track top insights
    learnings.insights.forEach(insight => {
      if (insight.impact === 'positive') {
        summary.top_insights.push({
          type: insight.type,
          message: insight.message,
          timestamp: learnings.timestamp
        });
      }
    });

    // Keep only recent top insights
    summary.top_insights = summary.top_insights.slice(-20);
    summary.last_updated = this.context.timestamp;

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }

  calculateDuration(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const durationMs = now - start;
    
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h`;
    }
  }

  generateLearningId() {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `${date}-${random}`;
  }
}

if (require.main === module) {
  const handler = new LearningCaptureHandler();
  handler.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = LearningCaptureHandler;