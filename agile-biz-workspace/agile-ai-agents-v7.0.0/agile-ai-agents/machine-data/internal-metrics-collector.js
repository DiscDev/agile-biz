/**
 * Internal Metrics Collector
 * Automatically collects and aggregates team metrics for learning
 */

const fs = require('fs');
const path = require('path');
const { velocityTracker } = require('./velocity-tracker');
const { storyTracker } = require('./story-tracker');
const { coverageAnalyzer } = require('./coverage-analyzer');
const { monitor } = require('./performance-monitor');

class InternalMetricsCollector {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.metricsPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      'orchestration',
      'internal-metrics.json'
    );
    
    // Load existing metrics
    this.internalMetrics = this.loadInternalMetrics();
    
    // Collection triggers
    this.collectionTriggers = {
      sprint_end: true,
      story_completion: true,
      weekly_aggregation: true
    };
  }
  
  /**
   * Load internal metrics
   */
  loadInternalMetrics() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        return JSON.parse(fs.readFileSync(this.metricsPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading internal metrics:', error.message);
    }
    
    // Initialize with empty structure
    return {
      meta: {
        document_type: "internal_metrics",
        version: "1.0.0",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      summary: {
        total_sprints: 0,
        total_stories: 0,
        total_points_completed: 0,
        avg_velocity: 0,
        avg_estimation_accuracy: 0,
        avg_coverage: 0
      },
      sprint_metrics: [],
      story_patterns: {},
      velocity_trends: {
        by_sprint: [],
        by_agent: {}
      },
      estimation_patterns: {
        overestimation_rate: 0,
        underestimation_rate: 0,
        accuracy_by_story_type: {}
      },
      coverage_trends: {
        overall: [],
        by_risk_level: {
          high: [],
          medium: [],
          low: []
        }
      },
      improvement_tracking: {
        implemented_actions: [],
        effectiveness_metrics: {}
      }
    };
  }
  
  /**
   * Collect metrics at sprint end
   */
  collectSprintEndMetrics(sprintId) {
    console.log(`📊 Collecting metrics for sprint ${sprintId}`);
    
    const sprintMetrics = {
      sprint_id: sprintId,
      collected_at: new Date().toISOString(),
      
      // Velocity metrics
      velocity: this.collectVelocityMetrics(sprintId),
      
      // Story metrics
      stories: this.collectStoryMetrics(sprintId),
      
      // Estimation accuracy
      estimation: this.collectEstimationMetrics(sprintId),
      
      // Coverage metrics
      coverage: this.collectCoverageMetrics(sprintId),
      
      // Collaboration metrics
      collaboration: this.collectCollaborationMetrics(sprintId),
      
      // Quality metrics
      quality: this.collectQualityMetrics(sprintId)
    };
    
    // Add to internal metrics
    this.internalMetrics.sprint_metrics.push(sprintMetrics);
    
    // Update summary
    this.updateSummaryMetrics();
    
    // Analyze patterns
    this.analyzePatterns(sprintMetrics);
    
    // Save metrics
    this.saveInternalMetrics();
    
    // Generate insights
    const insights = this.generateInsights(sprintMetrics);
    
    console.log(`✅ Sprint metrics collected: ${sprintMetrics.velocity.completed_points} points completed`);
    
    return {
      metrics: sprintMetrics,
      insights: insights,
      recommendations: this.generateRecommendations(insights)
    };
  }
  
  /**
   * Collect velocity metrics
   */
  collectVelocityMetrics(sprintId) {
    const velocityData = velocityTracker.getTeamVelocityMetrics();
    const stories = storyTracker.getSprintStories(sprintId);
    
    let plannedPoints = 0;
    let completedPoints = 0;
    
    for (const storyData of stories) {
      const story = storyData.story;
      const points = typeof story.story_points === 'object' 
        ? story.story_points.total 
        : story.story_points;
      
      plannedPoints += points;
      
      if (story.status === 'completed') {
        completedPoints += points;
      }
    }
    
    return {
      planned_points: plannedPoints,
      completed_points: completedPoints,
      velocity: completedPoints,
      completion_rate: plannedPoints > 0 ? (completedPoints / plannedPoints) : 0,
      team_metrics: velocityData,
      agent_metrics: velocityTracker.getAgentVelocityMetrics()
    };
  }
  
  /**
   * Collect story metrics
   */
  collectStoryMetrics(sprintId) {
    const stories = storyTracker.getSprintStories(sprintId);
    const storyMetrics = monitor.getStoryMetrics();
    
    const metrics = {
      total_stories: stories.length,
      by_status: {
        completed: 0,
        in_progress: 0,
        blocked: 0,
        not_started: 0
      },
      by_size: {
        small: 0,  // 1-3 points
        medium: 0, // 5-8 points
        large: 0   // 13+ points
      },
      cycle_time: {
        average: storyMetrics.average_cycle_time,
        min: Infinity,
        max: 0
      },
      blocked_time: {
        total: storyMetrics.total_blocked_time,
        average: 0
      }
    };
    
    for (const storyData of stories) {
      const story = storyData.story;
      
      // Status breakdown
      metrics.by_status[story.status]++;
      
      // Size breakdown
      const points = typeof story.story_points === 'object' 
        ? story.story_points.total 
        : story.story_points;
      
      if (points <= 3) metrics.by_size.small++;
      else if (points <= 8) metrics.by_size.medium++;
      else metrics.by_size.large++;
      
      // Cycle time
      if (story.timing.actual_hours) {
        metrics.cycle_time.min = Math.min(metrics.cycle_time.min, story.timing.actual_hours);
        metrics.cycle_time.max = Math.max(metrics.cycle_time.max, story.timing.actual_hours);
      }
    }
    
    // Calculate averages
    if (metrics.by_status.completed > 0) {
      metrics.blocked_time.average = metrics.blocked_time.total / metrics.by_status.completed;
    }
    
    return metrics;
  }
  
  /**
   * Collect estimation metrics
   */
  collectEstimationMetrics(sprintId) {
    const stories = storyTracker.getSprintStories(sprintId);
    
    const metrics = {
      total_estimated: 0,
      accurate_estimates: 0,
      overestimated: 0,
      underestimated: 0,
      accuracy_rate: 0,
      variance_by_type: {}
    };
    
    for (const storyData of stories) {
      const story = storyData.story;
      
      if (story.timing.estimated_hours && story.timing.actual_hours) {
        metrics.total_estimated++;
        
        const variance = (story.timing.actual_hours - story.timing.estimated_hours) / story.timing.estimated_hours;
        
        if (Math.abs(variance) <= 0.2) {
          metrics.accurate_estimates++;
        } else if (variance > 0) {
          metrics.underestimated++;
        } else {
          metrics.overestimated++;
        }
        
        // Track variance by story type
        const storyType = this.categorizeStory(story);
        if (!metrics.variance_by_type[storyType]) {
          metrics.variance_by_type[storyType] = {
            count: 0,
            total_variance: 0,
            avg_variance: 0
          };
        }
        
        metrics.variance_by_type[storyType].count++;
        metrics.variance_by_type[storyType].total_variance += variance;
      }
    }
    
    // Calculate accuracy rate
    if (metrics.total_estimated > 0) {
      metrics.accuracy_rate = metrics.accurate_estimates / metrics.total_estimated;
    }
    
    // Calculate average variance by type
    for (const type of Object.values(metrics.variance_by_type)) {
      if (type.count > 0) {
        type.avg_variance = type.total_variance / type.count;
      }
    }
    
    return metrics;
  }
  
  /**
   * Collect coverage metrics
   */
  collectCoverageMetrics(sprintId) {
    const stories = storyTracker.getSprintStories(sprintId);
    
    const metrics = {
      overall_coverage: 0,
      by_risk_level: {
        high: { target: 0, actual: 0, stories: 0 },
        medium: { target: 0, actual: 0, stories: 0 },
        low: { target: 0, actual: 0, stories: 0 }
      },
      improvement_rate: 0,
      stories_meeting_target: 0,
      total_stories_with_coverage: 0
    };
    
    let totalCoverage = 0;
    let storiesWithCoverage = 0;
    
    for (const storyData of stories) {
      const story = storyData.story;
      
      if (story.coverage_requirements) {
        storiesWithCoverage++;
        const coverage = story.coverage_requirements;
        
        totalCoverage += coverage.actual;
        
        // By risk level
        const riskLevel = coverage.risk_level || 'medium';
        const riskMetrics = metrics.by_risk_level[riskLevel];
        
        riskMetrics.stories++;
        riskMetrics.target += coverage.target;
        riskMetrics.actual += coverage.actual;
        
        if (coverage.actual >= coverage.target) {
          metrics.stories_meeting_target++;
        }
      }
    }
    
    // Calculate averages
    metrics.total_stories_with_coverage = storiesWithCoverage;
    
    if (storiesWithCoverage > 0) {
      metrics.overall_coverage = totalCoverage / storiesWithCoverage;
    }
    
    // Calculate risk level averages
    for (const [level, data] of Object.entries(metrics.by_risk_level)) {
      if (data.stories > 0) {
        data.target = data.target / data.stories;
        data.actual = data.actual / data.stories;
      }
    }
    
    // Calculate improvement rate (compare with previous sprint)
    if (this.internalMetrics.sprint_metrics.length > 0) {
      const previousSprint = this.internalMetrics.sprint_metrics[this.internalMetrics.sprint_metrics.length - 1];
      if (previousSprint.coverage) {
        metrics.improvement_rate = metrics.overall_coverage - previousSprint.coverage.overall_coverage;
      }
    }
    
    return metrics;
  }
  
  /**
   * Collect collaboration metrics
   */
  collectCollaborationMetrics(sprintId) {
    const taskMetrics = monitor.getTaskMetricsByAgent();
    
    const metrics = {
      agent_participation: Object.keys(taskMetrics),
      handoff_efficiency: {},
      parallel_execution: {
        instances: 0,
        success_rate: 0
      },
      communication_patterns: {
        blockers_reported: 0,
        blockers_resolved: 0,
        avg_resolution_time: 0
      }
    };
    
    // TODO: Implement handoff tracking between agents
    // This would require tracking when one agent completes work that another depends on
    
    return metrics;
  }
  
  /**
   * Collect quality metrics
   */
  collectQualityMetrics(sprintId) {
    const stories = storyTracker.getSprintStories(sprintId);
    
    const metrics = {
      defects_found: 0,
      defects_fixed: 0,
      stories_with_rework: 0,
      first_time_quality_rate: 0,
      test_automation_rate: 0
    };
    
    // TODO: Implement defect tracking
    // This would require integration with testing results
    
    return metrics;
  }
  
  /**
   * Categorize story type
   */
  categorizeStory(story) {
    const title = story.title.toLowerCase();
    const description = (story.description || '').toLowerCase();
    const combined = `${title} ${description}`;
    
    if (combined.includes('auth') || combined.includes('login')) return 'authentication';
    if (combined.includes('api') || combined.includes('endpoint')) return 'api';
    if (combined.includes('ui') || combined.includes('frontend')) return 'ui';
    if (combined.includes('database') || combined.includes('data')) return 'data';
    if (combined.includes('test')) return 'testing';
    
    return 'general';
  }
  
  /**
   * Update summary metrics
   */
  updateSummaryMetrics() {
    const summary = this.internalMetrics.summary;
    const sprints = this.internalMetrics.sprint_metrics;
    
    summary.total_sprints = sprints.length;
    
    if (sprints.length > 0) {
      // Calculate totals and averages
      let totalVelocity = 0;
      let totalAccuracy = 0;
      let totalCoverage = 0;
      let totalStories = 0;
      let totalPoints = 0;
      
      for (const sprint of sprints) {
        totalVelocity += sprint.velocity.velocity;
        totalAccuracy += sprint.estimation.accuracy_rate;
        totalCoverage += sprint.coverage.overall_coverage;
        totalStories += sprint.stories.total_stories;
        totalPoints += sprint.velocity.completed_points;
      }
      
      summary.total_stories = totalStories;
      summary.total_points_completed = totalPoints;
      summary.avg_velocity = totalVelocity / sprints.length;
      summary.avg_estimation_accuracy = totalAccuracy / sprints.length;
      summary.avg_coverage = totalCoverage / sprints.length;
    }
    
    summary.updated_at = new Date().toISOString();
  }
  
  /**
   * Analyze patterns
   */
  analyzePatterns(sprintMetrics) {
    // Update velocity trends
    this.internalMetrics.velocity_trends.by_sprint.push({
      sprint_id: sprintMetrics.sprint_id,
      velocity: sprintMetrics.velocity.velocity,
      completion_rate: sprintMetrics.velocity.completion_rate
    });
    
    // Update agent trends
    for (const [agent, metrics] of Object.entries(sprintMetrics.velocity.agent_metrics)) {
      if (!this.internalMetrics.velocity_trends.by_agent[agent]) {
        this.internalMetrics.velocity_trends.by_agent[agent] = [];
      }
      
      this.internalMetrics.velocity_trends.by_agent[agent].push({
        sprint_id: sprintMetrics.sprint_id,
        velocity: metrics.current_velocity,
        efficiency: metrics.efficiency_score
      });
    }
    
    // Update estimation patterns
    const estimation = this.internalMetrics.estimation_patterns;
    const totalSprints = this.internalMetrics.sprint_metrics.length;
    
    if (totalSprints > 0) {
      let totalOver = 0;
      let totalUnder = 0;
      
      for (const sprint of this.internalMetrics.sprint_metrics) {
        totalOver += sprint.estimation.overestimated;
        totalUnder += sprint.estimation.underestimated;
      }
      
      const totalEstimates = totalOver + totalUnder + 
        this.internalMetrics.sprint_metrics.reduce((sum, s) => sum + s.estimation.accurate_estimates, 0);
      
      if (totalEstimates > 0) {
        estimation.overestimation_rate = totalOver / totalEstimates;
        estimation.underestimation_rate = totalUnder / totalEstimates;
      }
    }
    
    // Update story patterns
    for (const [type, variance] of Object.entries(sprintMetrics.estimation.variance_by_type)) {
      if (!this.internalMetrics.story_patterns[type]) {
        this.internalMetrics.story_patterns[type] = {
          count: 0,
          avg_variance: 0,
          completion_rate: 0
        };
      }
      
      const pattern = this.internalMetrics.story_patterns[type];
      pattern.count += variance.count;
      
      // Update rolling average
      const weight = variance.count / pattern.count;
      pattern.avg_variance = pattern.avg_variance * (1 - weight) + variance.avg_variance * weight;
    }
    
    // Update coverage trends
    this.internalMetrics.coverage_trends.overall.push({
      sprint_id: sprintMetrics.sprint_id,
      coverage: sprintMetrics.coverage.overall_coverage
    });
    
    for (const [level, data] of Object.entries(sprintMetrics.coverage.by_risk_level)) {
      this.internalMetrics.coverage_trends.by_risk_level[level].push({
        sprint_id: sprintMetrics.sprint_id,
        target: data.target,
        actual: data.actual
      });
    }
  }
  
  /**
   * Generate insights from metrics
   */
  generateInsights(sprintMetrics) {
    const insights = [];
    
    // Velocity insights
    if (sprintMetrics.velocity.completion_rate < 0.8) {
      insights.push({
        type: 'velocity',
        severity: 'warning',
        message: `Only ${(sprintMetrics.velocity.completion_rate * 100).toFixed(0)}% of planned work completed`,
        recommendation: 'Review sprint planning and capacity allocation'
      });
    }
    
    // Estimation insights
    if (sprintMetrics.estimation.accuracy_rate < 0.7) {
      insights.push({
        type: 'estimation',
        severity: 'warning',
        message: 'Estimation accuracy below 70%',
        recommendation: 'Conduct estimation calibration session'
      });
    }
    
    if (sprintMetrics.estimation.underestimated > sprintMetrics.estimation.overestimated * 2) {
      insights.push({
        type: 'estimation',
        severity: 'info',
        message: 'Team consistently underestimates complexity',
        recommendation: 'Add complexity buffer to estimates'
      });
    }
    
    // Coverage insights
    if (sprintMetrics.coverage.overall_coverage < 0.8) {
      insights.push({
        type: 'quality',
        severity: 'warning',
        message: `Overall coverage at ${(sprintMetrics.coverage.overall_coverage * 100).toFixed(0)}%`,
        recommendation: 'Allocate time for test improvement'
      });
    }
    
    if (sprintMetrics.coverage.by_risk_level.high.actual < sprintMetrics.coverage.by_risk_level.high.target) {
      insights.push({
        type: 'quality',
        severity: 'critical',
        message: 'High-risk code below coverage target',
        recommendation: 'Prioritize testing for security-critical code'
      });
    }
    
    // Story size insights
    if (sprintMetrics.stories.by_size.large > sprintMetrics.stories.total_stories * 0.3) {
      insights.push({
        type: 'planning',
        severity: 'info',
        message: 'Many large stories in sprint',
        recommendation: 'Break down large stories for better flow'
      });
    }
    
    return insights;
  }
  
  /**
   * Generate recommendations
   */
  generateRecommendations(insights) {
    const recommendations = [];
    const insightsByType = {};
    
    // Group insights by type
    for (const insight of insights) {
      if (!insightsByType[insight.type]) {
        insightsByType[insight.type] = [];
      }
      insightsByType[insight.type].push(insight);
    }
    
    // Generate type-specific recommendations
    if (insightsByType.velocity) {
      recommendations.push({
        category: 'velocity',
        action: 'Review and adjust sprint capacity planning',
        priority: 'high',
        expected_impact: 'Improved sprint predictability'
      });
    }
    
    if (insightsByType.estimation) {
      recommendations.push({
        category: 'estimation',
        action: 'Implement planning poker for all stories',
        priority: 'medium',
        expected_impact: 'Better estimation accuracy'
      });
    }
    
    if (insightsByType.quality) {
      recommendations.push({
        category: 'quality',
        action: 'Dedicate 20% of sprint capacity to test coverage',
        priority: 'high',
        expected_impact: 'Reduced defect rate'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Track improvement implementation
   */
  trackImprovementImplementation(improvementData) {
    this.internalMetrics.improvement_tracking.implemented_actions.push({
      action: improvementData.action,
      implemented_at: new Date().toISOString(),
      sprint_id: improvementData.sprint_id,
      category: improvementData.category,
      expected_impact: improvementData.expected_impact
    });
    
    this.saveInternalMetrics();
  }
  
  /**
   * Measure improvement effectiveness
   */
  measureImprovementEffectiveness(actionId, metrics) {
    if (!this.internalMetrics.improvement_tracking.effectiveness_metrics[actionId]) {
      this.internalMetrics.improvement_tracking.effectiveness_metrics[actionId] = {
        measurements: [],
        overall_effectiveness: 'pending'
      };
    }
    
    const effectiveness = this.internalMetrics.improvement_tracking.effectiveness_metrics[actionId];
    effectiveness.measurements.push({
      measured_at: new Date().toISOString(),
      metrics: metrics
    });
    
    // Determine overall effectiveness
    if (effectiveness.measurements.length >= 3) {
      // Simple effectiveness calculation based on trend
      const trend = this.calculateTrend(effectiveness.measurements.map(m => m.metrics.value));
      
      if (trend > 0.1) effectiveness.overall_effectiveness = 'effective';
      else if (trend < -0.1) effectiveness.overall_effectiveness = 'ineffective';
      else effectiveness.overall_effectiveness = 'neutral';
    }
    
    this.saveInternalMetrics();
  }
  
  /**
   * Calculate trend
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    // Simple linear trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstAvg;
  }
  
  /**
   * Generate contribution data for community
   */
  generateCommunityContribution() {
    const summary = this.internalMetrics.summary;
    
    if (summary.total_sprints < 5) {
      return {
        ready: false,
        message: 'Need at least 5 sprints of data'
      };
    }
    
    // Anonymize and aggregate data
    const contribution = {
      project_type: this.detectProjectType(),
      tech_stack: this.detectTechStack(),
      team_size: this.estimateTeamSize(),
      metrics: {
        avg_velocity: Math.round(summary.avg_velocity),
        velocity_range: this.getVelocityRange(),
        story_patterns: this.aggregateStoryPatterns(),
        coverage_achievements: {
          overall: summary.avg_coverage,
          critical_code: this.getHighRiskCoverage(),
          improvement_rate: this.calculateImprovementRate()
        },
        estimation_accuracy: summary.avg_estimation_accuracy
      }
    };
    
    return {
      ready: true,
      contribution: contribution
    };
  }
  
  /**
   * Helper methods for community contribution
   */
  detectProjectType() {
    // Analyze story patterns to detect project type
    const storyTypes = Object.keys(this.internalMetrics.story_patterns);
    
    if (storyTypes.includes('api') && storyTypes.includes('endpoint')) {
      return 'api_service';
    } else if (storyTypes.includes('ui') || storyTypes.includes('frontend')) {
      return 'web_application';
    }
    
    return 'web_application'; // Default
  }
  
  detectTechStack() {
    // This would need to be configured or detected from actual code
    return ['javascript', 'node']; // Default
  }
  
  estimateTeamSize() {
    // Estimate based on velocity and agent participation
    const agentCount = Object.keys(this.internalMetrics.velocity_trends.by_agent).length;
    return Math.min(5, Math.max(2, Math.round(agentCount / 2)));
  }
  
  getVelocityRange() {
    const velocities = this.internalMetrics.velocity_trends.by_sprint.map(s => s.velocity);
    
    return {
      min: Math.min(...velocities),
      max: Math.max(...velocities)
    };
  }
  
  aggregateStoryPatterns() {
    const patterns = {};
    
    for (const [type, data] of Object.entries(this.internalMetrics.story_patterns)) {
      patterns[type] = {
        avg_points: Math.round(3 / (1 + data.avg_variance)), // Estimate from variance
        completion_rate: 0.9 // Default
      };
    }
    
    return patterns;
  }
  
  getHighRiskCoverage() {
    const coverageTrends = this.internalMetrics.coverage_trends.by_risk_level.high;
    
    if (coverageTrends.length === 0) return 0.9; // Default
    
    const recent = coverageTrends.slice(-3);
    return recent.reduce((sum, c) => sum + c.actual, 0) / recent.length;
  }
  
  calculateImprovementRate() {
    const coverageTrends = this.internalMetrics.coverage_trends.overall;
    
    if (coverageTrends.length < 2) return 0;
    
    const first = coverageTrends[0].coverage;
    const last = coverageTrends[coverageTrends.length - 1].coverage;
    
    return (last - first) / coverageTrends.length;
  }
  
  /**
   * Save internal metrics
   */
  saveInternalMetrics() {
    try {
      fs.writeFileSync(this.metricsPath, JSON.stringify(this.internalMetrics, null, 2));
      console.log('💾 Internal metrics saved');
    } catch (error) {
      console.error('Error saving internal metrics:', error.message);
    }
  }
}

// Export the class and create instance
const internalMetricsCollector = new InternalMetricsCollector();

module.exports = {
  InternalMetricsCollector,
  internalMetricsCollector,
  
  // Convenience exports
  collectSprintEndMetrics: (sprintId) => internalMetricsCollector.collectSprintEndMetrics(sprintId),
  trackImprovementImplementation: (data) => internalMetricsCollector.trackImprovementImplementation(data),
  measureImprovementEffectiveness: (actionId, metrics) => 
    internalMetricsCollector.measureImprovementEffectiveness(actionId, metrics),
  generateCommunityContribution: () => internalMetricsCollector.generateCommunityContribution()
};

// If run directly, simulate metrics collection
if (require.main === module) {
  console.log('📊 Simulating Internal Metrics Collection');
  
  // Collect metrics for a sprint
  const result = internalMetricsCollector.collectSprintEndMetrics('sprint_1');
  
  console.log('\nMetrics collected:');
  console.log('Velocity:', result.metrics.velocity.velocity);
  console.log('Estimation accuracy:', (result.metrics.estimation.accuracy_rate * 100).toFixed(0) + '%');
  console.log('Coverage:', (result.metrics.coverage.overall_coverage * 100).toFixed(0) + '%');
  
  console.log('\nInsights:', result.insights);
  console.log('\nRecommendations:', result.recommendations);
  
  // Check if ready for community contribution
  const contribution = internalMetricsCollector.generateCommunityContribution();
  console.log('\nCommunity contribution ready:', contribution.ready);
}