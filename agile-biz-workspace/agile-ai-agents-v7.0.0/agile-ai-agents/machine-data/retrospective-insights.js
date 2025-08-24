/**
 * Sprint Retrospective Intelligence System
 * Generates AI-powered insights and improvement recommendations
 */

const fs = require('fs');
const path = require('path');
const { monitor } = require('./performance-monitor');
const { storyTracker } = require('./story-tracker');

class RetrospectiveInsights {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.retrospectivesPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'sprint-retrospectives'
    );
    
    // Historical patterns for learning
    this.historicalPatterns = this.loadHistoricalPatterns();
    
    // Insight templates
    this.insightTemplates = {
      velocity_trend: {
        improving: "Team velocity improved by {change}% - current practices are working well",
        declining: "Team velocity decreased by {change}% - review estimation accuracy and blockers",
        stable: "Team velocity remained stable at {velocity} points per sprint"
      },
      blocker_patterns: {
        recurring: "Blocker '{blocker}' appeared in {count} sprints - needs systematic solution",
        resolved: "Previous blocker '{blocker}' was successfully resolved this sprint",
        new: "New blocker type '{blocker}' emerged - monitor for recurrence"
      },
      estimation_accuracy: {
        overestimating: "Team consistently overestimates by {percentage}% - consider reducing estimates",
        underestimating: "Team consistently underestimates by {percentage}% - add buffer for complexity",
        improving: "Estimation accuracy improved to {accuracy}% this sprint"
      },
      collaboration_patterns: {
        effective: "Collaboration between {agent1} and {agent2} reduced handoff time by {time}",
        bottleneck: "Handoffs from {agent1} to {agent2} consistently cause delays",
        parallel_success: "Parallel execution of {agents} improved sprint efficiency"
      }
    };
    
    // Ensure retrospectives directory exists
    this.ensureRetrospectivesDirectory();
  }
  
  ensureRetrospectivesDirectory() {
    if (!fs.existsSync(this.retrospectivesPath)) {
      fs.mkdirSync(this.retrospectivesPath, { recursive: true });
      console.log(`📁 Created retrospectives directory: ${this.retrospectivesPath}`);
    }
  }
  
  /**
   * Generate retrospective insights
   */
  generateRetrospectiveInsights(sprintData, agentFeedback) {
    console.log(`🧠 Generating AI-powered retrospective insights for ${sprintData.sprint_id}`);
    
    const retrospective = {
      meta: {
        document_type: "sprint_retrospective_insights",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      },
      retrospective: {
        sprint_id: sprintData.sprint_id,
        sprint_metrics: this.analyzeSprintMetrics(sprintData),
        
        // Collect feedback
        agent_feedback: this.processAgentFeedback(agentFeedback),
        
        // Generate insights
        velocity_insights: this.analyzeVelocityTrends(sprintData),
        estimation_insights: this.analyzeEstimationAccuracy(sprintData),
        blocker_insights: this.analyzeBlockerPatterns(sprintData),
        collaboration_insights: this.analyzeCollaborationPatterns(sprintData),
        
        // Compare with historical data
        historical_comparison: this.compareWithHistory(sprintData),
        
        // Generate improvement actions
        improvement_actions: this.generateImprovementActions(sprintData),
        
        // Learning points
        key_learnings: [],
        
        // Success patterns to repeat
        success_patterns: [],
        
        // Anti-patterns to avoid
        anti_patterns: []
      }
    };
    
    // Extract key learnings
    retrospective.retrospective.key_learnings = this.extractKeyLearnings(retrospective);
    
    // Identify patterns
    retrospective.retrospective.success_patterns = this.identifySuccessPatterns(retrospective);
    retrospective.retrospective.anti_patterns = this.identifyAntiPatterns(retrospective);
    
    // Save retrospective
    this.saveRetrospective(retrospective);
    
    // Update historical patterns
    this.updateHistoricalPatterns(retrospective);
    
    // Generate report
    const report = this.generateInsightReport(retrospective);
    
    console.log(`✅ Retrospective insights generated with ${report.improvement_actions.length} actions`);
    
    return report;
  }
  
  /**
   * Analyze sprint metrics
   */
  analyzeSprintMetrics(sprintData) {
    const stories = storyTracker.getSprintStories(sprintData.sprint_id);
    const storyMetrics = monitor.getStoryMetrics();
    
    const metrics = {
      velocity: sprintData.completed_points || 0,
      planned_vs_completed: {
        planned: sprintData.planned_points || 0,
        completed: sprintData.completed_points || 0,
        percentage: 0
      },
      cycle_time: {
        average: storyMetrics.average_cycle_time,
        min: Infinity,
        max: 0
      },
      blocked_time: {
        total: storyMetrics.total_blocked_time,
        percentage: 0
      },
      story_completion: {
        completed: 0,
        in_progress: 0,
        blocked: 0,
        not_started: 0
      }
    };
    
    // Calculate percentages
    if (metrics.planned_vs_completed.planned > 0) {
      metrics.planned_vs_completed.percentage = 
        (metrics.planned_vs_completed.completed / metrics.planned_vs_completed.planned * 100).toFixed(1);
    }
    
    // Analyze stories
    for (const storyData of stories) {
      const story = storyData.story;
      metrics.story_completion[story.status]++;
      
      if (story.timing.actual_hours) {
        const cycleTime = story.timing.actual_hours;
        metrics.cycle_time.min = Math.min(metrics.cycle_time.min, cycleTime);
        metrics.cycle_time.max = Math.max(metrics.cycle_time.max, cycleTime);
      }
    }
    
    // Calculate blocked time percentage
    const totalTime = stories.reduce((sum, s) => sum + (s.story.timing.actual_hours || 0), 0);
    if (totalTime > 0) {
      metrics.blocked_time.percentage = 
        (metrics.blocked_time.total / totalTime * 100).toFixed(1);
    }
    
    return metrics;
  }
  
  /**
   * Process agent feedback
   */
  processAgentFeedback(agentFeedback) {
    const processed = {
      what_went_well: [],
      what_didnt_go_well: [],
      biggest_obstacles: [],
      suggested_improvements: [],
      by_agent: {}
    };
    
    for (const feedback of agentFeedback) {
      // Aggregate feedback
      if (feedback.what_went_well) {
        processed.what_went_well.push({
          agent: feedback.agent,
          feedback: feedback.what_went_well
        });
      }
      
      if (feedback.what_didnt_go_well) {
        processed.what_didnt_go_well.push({
          agent: feedback.agent,
          feedback: feedback.what_didnt_go_well
        });
      }
      
      if (feedback.biggest_obstacles) {
        processed.biggest_obstacles.push({
          agent: feedback.agent,
          obstacles: feedback.biggest_obstacles
        });
      }
      
      if (feedback.improvements) {
        processed.suggested_improvements.push({
          agent: feedback.agent,
          suggestions: feedback.improvements
        });
      }
      
      // Store by agent
      processed.by_agent[feedback.agent] = feedback;
    }
    
    return processed;
  }
  
  /**
   * Analyze velocity trends
   */
  analyzeVelocityTrends(sprintData) {
    const insights = [];
    
    // Get historical velocity data
    const historicalVelocity = this.getHistoricalVelocity();
    const currentVelocity = sprintData.completed_points || 0;
    
    if (historicalVelocity.length >= 3) {
      const avgVelocity = historicalVelocity.reduce((sum, v) => sum + v, 0) / historicalVelocity.length;
      const change = ((currentVelocity - avgVelocity) / avgVelocity * 100).toFixed(1);
      
      if (Math.abs(change) > 20) {
        insights.push({
          type: change > 0 ? 'improving' : 'declining',
          insight: this.insightTemplates.velocity_trend[change > 0 ? 'improving' : 'declining']
            .replace('{change}', Math.abs(change)),
          recommendation: change > 0 
            ? 'Continue current practices and document what worked'
            : 'Review sprint planning and estimation processes',
          priority: Math.abs(change) > 30 ? 'high' : 'medium'
        });
      } else {
        insights.push({
          type: 'stable',
          insight: this.insightTemplates.velocity_trend.stable
            .replace('{velocity}', currentVelocity),
          recommendation: 'Velocity is stable - focus on quality improvements',
          priority: 'low'
        });
      }
    }
    
    // Check velocity volatility
    if (historicalVelocity.length >= 5) {
      const volatility = this.calculateVolatility(historicalVelocity);
      
      if (volatility > 0.3) {
        insights.push({
          type: 'volatile',
          insight: 'Velocity varies significantly between sprints',
          recommendation: 'Standardize estimation practices and sprint planning',
          priority: 'high'
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Analyze estimation accuracy
   */
  analyzeEstimationAccuracy(sprintData) {
    const insights = [];
    const stories = storyTracker.getSprintStories(sprintData.sprint_id);
    
    let totalEstimated = 0;
    let totalActual = 0;
    let accurateEstimates = 0;
    
    for (const storyData of stories) {
      const story = storyData.story;
      
      if (story.timing.estimated_hours && story.timing.actual_hours) {
        totalEstimated += story.timing.estimated_hours;
        totalActual += story.timing.actual_hours;
        
        const accuracy = Math.abs(story.timing.estimated_hours - story.timing.actual_hours) / story.timing.estimated_hours;
        if (accuracy <= 0.2) { // Within 20%
          accurateEstimates++;
        }
      }
    }
    
    if (totalActual > 0) {
      const overallAccuracy = ((totalEstimated / totalActual - 1) * 100).toFixed(1);
      const accuracyRate = stories.length > 0 ? (accurateEstimates / stories.length * 100).toFixed(1) : 0;
      
      if (Math.abs(overallAccuracy) > 20) {
        const type = overallAccuracy > 0 ? 'overestimating' : 'underestimating';
        
        insights.push({
          type: type,
          insight: this.insightTemplates.estimation_accuracy[type]
            .replace('{percentage}', Math.abs(overallAccuracy)),
          recommendation: overallAccuracy > 0
            ? 'Break down stories into smaller tasks for better estimates'
            : 'Add buffer time for testing and integration',
          priority: 'medium'
        });
      }
      
      if (accuracyRate > 70) {
        insights.push({
          type: 'improving',
          insight: this.insightTemplates.estimation_accuracy.improving
            .replace('{accuracy}', accuracyRate),
          recommendation: 'Document estimation techniques that worked well',
          priority: 'low'
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Analyze blocker patterns
   */
  analyzeBlockerPatterns(sprintData) {
    const insights = [];
    
    // Load blocker tracking
    const blockersPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'sprint-tracking',
      'standups',
      'blocker-tracking.json'
    );
    
    try {
      if (fs.existsSync(blockersPath)) {
        const tracking = JSON.parse(fs.readFileSync(blockersPath, 'utf-8'));
        
        // Group blockers by type
        const blockerTypes = {};
        
        for (const blocker of tracking.blockers) {
          const type = this.categorizeBlocker(blocker.blocker.description);
          
          if (!blockerTypes[type]) {
            blockerTypes[type] = {
              count: 0,
              total_duration: 0,
              examples: []
            };
          }
          
          blockerTypes[type].count++;
          blockerTypes[type].total_duration += blocker.blocker.duration || 0;
          blockerTypes[type].examples.push(blocker.blocker.description);
        }
        
        // Generate insights for recurring blockers
        for (const [type, data] of Object.entries(blockerTypes)) {
          if (data.count >= 3) {
            insights.push({
              type: 'recurring',
              insight: this.insightTemplates.blocker_patterns.recurring
                .replace('{blocker}', type)
                .replace('{count}', data.count),
              recommendation: `Create systematic solution for ${type} issues`,
              priority: 'high',
              examples: data.examples.slice(0, 3)
            });
          }
        }
        
        // Check for resolved blockers
        const resolved = tracking.blockers.filter(b => b.resolved);
        
        if (resolved.length > 0) {
          insights.push({
            type: 'resolved',
            insight: `Successfully resolved ${resolved.length} blockers this sprint`,
            recommendation: 'Document resolution approaches for future reference',
            priority: 'low'
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing blockers:', error.message);
    }
    
    return insights;
  }
  
  /**
   * Categorize blocker type
   */
  categorizeBlocker(description) {
    const categories = {
      environment: ['environment', 'setup', 'config', 'installation'],
      dependency: ['dependency', 'waiting', 'blocked by', 'depends on'],
      technical: ['error', 'bug', 'issue', 'problem', 'failing'],
      resource: ['resource', 'capacity', 'availability', 'access'],
      communication: ['unclear', 'requirements', 'specification', 'understanding']
    };
    
    const desc = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  }
  
  /**
   * Analyze collaboration patterns
   */
  analyzeCollaborationPatterns(sprintData) {
    const insights = [];
    const taskMetrics = monitor.getTaskMetricsByAgent();
    
    // Analyze agent efficiency
    const agentEfficiencies = Object.entries(taskMetrics).map(([agent, metrics]) => ({
      agent: agent,
      efficiency: metrics.efficiency_score
    }));
    
    // Find high and low performers
    agentEfficiencies.sort((a, b) => b.efficiency - a.efficiency);
    
    if (agentEfficiencies.length >= 3) {
      const topPerformer = agentEfficiencies[0];
      const bottomPerformer = agentEfficiencies[agentEfficiencies.length - 1];
      
      if (topPerformer.efficiency > 120) {
        insights.push({
          type: 'high_performer',
          insight: `${topPerformer.agent} showed exceptional efficiency at ${topPerformer.efficiency}%`,
          recommendation: `Study ${topPerformer.agent}'s practices for team-wide adoption`,
          priority: 'medium'
        });
      }
      
      if (bottomPerformer.efficiency < 80) {
        insights.push({
          type: 'needs_support',
          insight: `${bottomPerformer.agent} may need support - efficiency at ${bottomPerformer.efficiency}%`,
          recommendation: `Review workload and provide assistance to ${bottomPerformer.agent}`,
          priority: 'high'
        });
      }
    }
    
    // TODO: Analyze handoff patterns between agents
    
    return insights;
  }
  
  /**
   * Compare with historical data
   */
  compareWithHistory(sprintData) {
    const comparison = {
      velocity_trend: 'stable',
      estimation_trend: 'stable',
      quality_trend: 'stable',
      historical_rank: 0
    };
    
    const history = this.historicalPatterns.sprints || [];
    
    if (history.length >= 3) {
      // Compare velocity
      const velocities = history.map(s => s.velocity).filter(v => v > 0);
      const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
      const currentVelocity = sprintData.completed_points || 0;
      
      if (currentVelocity > avgVelocity * 1.1) {
        comparison.velocity_trend = 'improving';
      } else if (currentVelocity < avgVelocity * 0.9) {
        comparison.velocity_trend = 'declining';
      }
      
      // Rank this sprint
      const allVelocities = [...velocities, currentVelocity].sort((a, b) => b - a);
      comparison.historical_rank = allVelocities.indexOf(currentVelocity) + 1;
    }
    
    return comparison;
  }
  
  /**
   * Generate improvement actions
   */
  generateImprovementActions(sprintData) {
    const actions = [];
    const insights = [];
    
    // Collect all insights
    if (sprintData.velocity_insights) insights.push(...sprintData.velocity_insights);
    if (sprintData.estimation_insights) insights.push(...sprintData.estimation_insights);
    if (sprintData.blocker_insights) insights.push(...sprintData.blocker_insights);
    if (sprintData.collaboration_insights) insights.push(...sprintData.collaboration_insights);
    
    // Convert high-priority insights to actions
    for (const insight of insights) {
      if (insight.priority === 'high' || insight.priority === 'medium') {
        actions.push({
          action: insight.recommendation,
          category: insight.type,
          priority: insight.priority,
          assigned_to: this.assignActionOwner(insight),
          success_criteria: this.defineSuccessCriteria(insight)
        });
      }
    }
    
    // Limit to top 5 actions
    actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    return actions.slice(0, 5);
  }
  
  /**
   * Assign action owner based on insight type
   */
  assignActionOwner(insight) {
    const ownerMap = {
      estimation: 'project_manager_agent',
      velocity: 'project_manager_agent',
      blocker: 'devops_agent',
      collaboration: 'project_manager_agent',
      technical: 'coder_agent',
      quality: 'testing_agent'
    };
    
    return ownerMap[insight.type] || 'project_manager_agent';
  }
  
  /**
   * Define success criteria for improvement action
   */
  defineSuccessCriteria(insight) {
    const criteriaMap = {
      velocity: 'Velocity variance < 15% over next 3 sprints',
      estimation: 'Estimation accuracy > 80% next sprint',
      blocker: 'Blocker resolution time < 30 minutes',
      collaboration: 'Handoff time reduced by 20%',
      quality: 'Defect rate reduced by 25%'
    };
    
    return criteriaMap[insight.type] || 'Measurable improvement in next sprint';
  }
  
  /**
   * Extract key learnings
   */
  extractKeyLearnings(retrospective) {
    const learnings = [];
    
    // Learning from velocity insights
    if (retrospective.retrospective.velocity_insights.some(i => i.type === 'improving')) {
      learnings.push({
        category: 'process',
        learning: 'Current sprint planning and execution practices are effective',
        evidence: 'Velocity improved this sprint'
      });
    }
    
    // Learning from estimation
    if (retrospective.retrospective.estimation_insights.some(i => i.type === 'improving')) {
      learnings.push({
        category: 'estimation',
        learning: 'Team estimation accuracy is improving through practice',
        evidence: 'Estimation accuracy above 70%'
      });
    }
    
    // Learning from resolved blockers
    if (retrospective.retrospective.blocker_insights.some(i => i.type === 'resolved')) {
      learnings.push({
        category: 'problem_solving',
        learning: 'Team effectively resolves blockers when they arise',
        evidence: 'Multiple blockers resolved this sprint'
      });
    }
    
    return learnings;
  }
  
  /**
   * Identify success patterns
   */
  identifySuccessPatterns(retrospective) {
    const patterns = [];
    
    // Check agent feedback for success patterns
    const feedback = retrospective.retrospective.agent_feedback;
    
    if (feedback.what_went_well.length > 0) {
      // Find common themes
      const themes = this.extractThemes(feedback.what_went_well.map(f => f.feedback));
      
      for (const theme of themes) {
        patterns.push({
          pattern: theme,
          frequency: 'Mentioned by multiple agents',
          recommendation: 'Continue and enhance this practice'
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Identify anti-patterns
   */
  identifyAntiPatterns(retrospective) {
    const antiPatterns = [];
    
    // Check for recurring issues
    if (retrospective.retrospective.blocker_insights.some(i => i.type === 'recurring')) {
      antiPatterns.push({
        pattern: 'Recurring blockers not systematically addressed',
        impact: 'Repeated delays and frustration',
        recommendation: 'Create runbook for common blocker types'
      });
    }
    
    // Check for estimation issues
    if (retrospective.retrospective.estimation_insights.some(i => 
      i.type === 'overestimating' || i.type === 'underestimating')) {
      antiPatterns.push({
        pattern: 'Consistent estimation bias',
        impact: 'Sprint planning inaccuracy',
        recommendation: 'Review and calibrate estimation process'
      });
    }
    
    return antiPatterns;
  }
  
  /**
   * Extract common themes from text
   */
  extractThemes(textArray) {
    // Simple theme extraction - in real implementation would use NLP
    const themes = [];
    const commonPhrases = [
      'clear requirements',
      'good communication',
      'parallel execution',
      'quick feedback',
      'automated testing'
    ];
    
    for (const phrase of commonPhrases) {
      const count = textArray.filter(text => 
        text.toLowerCase().includes(phrase)
      ).length;
      
      if (count >= 2) {
        themes.push(phrase);
      }
    }
    
    return themes;
  }
  
  /**
   * Get historical velocity data
   */
  getHistoricalVelocity() {
    const history = this.historicalPatterns.sprints || [];
    return history.map(s => s.velocity).filter(v => v > 0);
  }
  
  /**
   * Calculate volatility
   */
  calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / mean; // Coefficient of variation
  }
  
  /**
   * Load historical patterns
   */
  loadHistoricalPatterns() {
    const patternsPath = path.join(this.retrospectivesPath, 'historical-patterns.json');
    
    try {
      if (fs.existsSync(patternsPath)) {
        return JSON.parse(fs.readFileSync(patternsPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading historical patterns:', error.message);
    }
    
    return {
      sprints: [],
      patterns: {
        success: [],
        anti: []
      }
    };
  }
  
  /**
   * Update historical patterns
   */
  updateHistoricalPatterns(retrospective) {
    // Add sprint data
    this.historicalPatterns.sprints.push({
      sprint_id: retrospective.retrospective.sprint_id,
      velocity: retrospective.retrospective.sprint_metrics.velocity,
      estimation_accuracy: this.calculateEstimationAccuracy(retrospective),
      blockers: retrospective.retrospective.blocker_insights.length,
      timestamp: retrospective.meta.timestamp
    });
    
    // Keep last 20 sprints
    if (this.historicalPatterns.sprints.length > 20) {
      this.historicalPatterns.sprints.shift();
    }
    
    // Update patterns
    for (const pattern of retrospective.retrospective.success_patterns) {
      const existing = this.historicalPatterns.patterns.success.find(
        p => p.pattern === pattern.pattern
      );
      
      if (existing) {
        existing.occurrences++;
      } else {
        this.historicalPatterns.patterns.success.push({
          pattern: pattern.pattern,
          occurrences: 1
        });
      }
    }
    
    // Save updated patterns
    const patternsPath = path.join(this.retrospectivesPath, 'historical-patterns.json');
    fs.writeFileSync(patternsPath, JSON.stringify(this.historicalPatterns, null, 2));
  }
  
  /**
   * Calculate estimation accuracy from retrospective
   */
  calculateEstimationAccuracy(retrospective) {
    const insights = retrospective.retrospective.estimation_insights;
    
    for (const insight of insights) {
      if (insight.type === 'improving' && insight.insight.includes('%')) {
        const match = insight.insight.match(/(\d+\.?\d*)%/);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
    
    return 50; // Default if no accuracy data
  }
  
  /**
   * Save retrospective
   */
  saveRetrospective(retrospective) {
    const fileName = `sprint_${retrospective.retrospective.sprint_id}_retrospective.json`;
    const filePath = path.join(this.retrospectivesPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(retrospective, null, 2));
    console.log(`💾 Retrospective saved to ${fileName}`);
  }
  
  /**
   * Generate insight report
   */
  generateInsightReport(retrospective) {
    const retro = retrospective.retrospective;
    
    return {
      sprint_id: retro.sprint_id,
      
      summary: {
        velocity: retro.sprint_metrics.velocity,
        completion_rate: retro.sprint_metrics.planned_vs_completed.percentage + '%',
        key_insights: [
          ...retro.velocity_insights.slice(0, 1),
          ...retro.estimation_insights.slice(0, 1),
          ...retro.blocker_insights.slice(0, 1)
        ].map(i => i.insight)
      },
      
      improvement_actions: retro.improvement_actions,
      
      learnings: retro.key_learnings,
      
      patterns: {
        success: retro.success_patterns,
        anti: retro.anti_patterns
      },
      
      historical_comparison: retro.historical_comparison
    };
  }
}

// Export the class and create instance
const retrospectiveInsights = new RetrospectiveInsights();

module.exports = {
  RetrospectiveInsights,
  retrospectiveInsights,
  
  // Convenience exports
  generateRetrospectiveInsights: (sprintData, agentFeedback) => 
    retrospectiveInsights.generateRetrospectiveInsights(sprintData, agentFeedback)
};

// If run directly, simulate retrospective insights
if (require.main === module) {
  console.log('🧠 Simulating Retrospective Insights');
  
  // Simulate sprint data
  const sprintData = {
    sprint_id: 'sprint_1',
    planned_points: 25,
    completed_points: 20
  };
  
  // Simulate agent feedback
  const agentFeedback = [
    {
      agent: 'coder_agent',
      what_went_well: 'Clear requirements and good API design patterns',
      what_didnt_go_well: 'Environment setup took longer than expected',
      biggest_obstacles: 'Docker configuration issues',
      improvements: 'Create standard development environment template'
    },
    {
      agent: 'testing_agent',
      what_went_well: 'Automated test suite worked efficiently',
      what_didnt_go_well: 'Test data setup was manual',
      biggest_obstacles: 'Test environment instability',
      improvements: 'Implement test data factories'
    },
    {
      agent: 'ui_ux_agent',
      what_went_well: 'Good communication with coder agent',
      what_didnt_go_well: 'Design reviews took multiple rounds',
      biggest_obstacles: 'Unclear design requirements',
      improvements: 'Earlier stakeholder involvement in design'
    }
  ];
  
  const report = retrospectiveInsights.generateRetrospectiveInsights(sprintData, agentFeedback);
  
  console.log('\nRetrospective Insights Report:', JSON.stringify(report, null, 2));
}