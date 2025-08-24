/**
 * Repository Evolution Tracker
 * Monitors repository health and tracks evolution needs
 */

const fs = require('fs');
const path = require('path');
const MultiRepositoryCoordinator = require('./multi-repo-coordinator');

class RepositoryEvolutionTracker {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.repoCoordinator = new MultiRepositoryCoordinator(projectRoot);
    this.trackingPath = path.join(projectRoot, 'machine-data', 'repository-evolution-tracking.json');
    this.metricsPath = path.join(projectRoot, 'machine-data', 'repository-metrics.json');
    this.loadTracking();
  }

  /**
   * Load or initialize tracking data
   */
  loadTracking() {
    if (fs.existsSync(this.trackingPath)) {
      this.tracking = JSON.parse(fs.readFileSync(this.trackingPath, 'utf8'));
    } else {
      this.initializeTracking();
    }

    if (fs.existsSync(this.metricsPath)) {
      this.metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
    } else {
      this.initializeMetrics();
    }
  }

  /**
   * Initialize tracking data
   */
  initializeTracking() {
    this.tracking = {
      version: "1.0.0",
      evolution_history: [],
      health_snapshots: [],
      trigger_history: [],
      recommendations: [],
      last_updated: new Date().toISOString()
    };
    this.saveTracking();
  }

  /**
   * Initialize metrics data
   */
  initializeMetrics() {
    this.metrics = {
      repositories: {},
      global: {
        build_time: [],
        deployment_success_rate: [],
        merge_conflicts: [],
        developer_friction: []
      },
      last_updated: new Date().toISOString()
    };
    this.saveMetrics();
  }

  /**
   * Monitor repository health
   */
  async monitorHealth() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      structure: this.repoCoordinator.config.project_structure,
      repositories: {},
      overall_health: 100,
      issues: [],
      recommendations: []
    };

    // Analyze each repository
    const repos = Object.keys(this.repoCoordinator.config.repositories);
    for (const repo of repos) {
      const health = await this.analyzeRepositoryHealth(repo);
      snapshot.repositories[repo] = health;
      
      // Deduct from overall health based on issues
      snapshot.overall_health -= health.penalty;
      
      // Collect issues
      if (health.issues.length > 0) {
        snapshot.issues.push(...health.issues.map(issue => ({
          ...issue,
          repository: repo
        })));
      }
    }

    // Check for structure-level issues
    const structureIssues = this.checkStructureHealth();
    snapshot.issues.push(...structureIssues);
    
    // Generate recommendations based on issues
    snapshot.recommendations = this.generateHealthRecommendations(snapshot.issues);

    // Save snapshot
    this.tracking.health_snapshots.push(snapshot);
    if (this.tracking.health_snapshots.length > 100) {
      this.tracking.health_snapshots = this.tracking.health_snapshots.slice(-100);
    }

    this.saveTracking();
    return snapshot;
  }

  /**
   * Analyze individual repository health
   */
  async analyzeRepositoryHealth(repository) {
    const health = {
      score: 100,
      penalty: 0,
      issues: [],
      metrics: {}
    };

    // Get repository-specific metrics
    const repoMetrics = this.metrics.repositories[repository] || {};
    
    // Check build time
    if (repoMetrics.avg_build_time > 600) {
      const severity = this.calculateSeverity(repoMetrics.avg_build_time, 600, 1200);
      health.issues.push({
        type: 'build_time',
        severity,
        value: repoMetrics.avg_build_time,
        threshold: 600,
        message: `Build time exceeds threshold: ${repoMetrics.avg_build_time}s`
      });
      health.penalty += severity === 'high' ? 10 : 5;
    }

    // Check code size
    if (repoMetrics.lines_of_code > 50000) {
      health.issues.push({
        type: 'code_size',
        severity: 'medium',
        value: repoMetrics.lines_of_code,
        threshold: 50000,
        message: 'Repository becoming too large'
      });
      health.penalty += 5;
    }

    // Check dependency coupling
    const coupling = this.repoCoordinator.calculateCouplingScore(repository);
    if (coupling > 0.7) {
      health.issues.push({
        type: 'high_coupling',
        severity: 'high',
        value: coupling,
        threshold: 0.7,
        message: 'High coupling with other repositories'
      });
      health.penalty += 10;
    }

    // Check for circular dependencies
    const circular = this.repoCoordinator.detectCircularDependencies(repository);
    if (circular.length > 0) {
      health.issues.push({
        type: 'circular_dependency',
        severity: 'critical',
        value: circular,
        message: 'Circular dependencies detected'
      });
      health.penalty += 15;
    }

    health.score = Math.max(0, health.score - health.penalty);
    health.metrics = repoMetrics;

    return health;
  }

  /**
   * Check overall structure health
   */
  checkStructureHealth() {
    const issues = [];
    const config = this.repoCoordinator.config;
    
    // Check for too many repositories
    const repoCount = Object.keys(config.repositories).length;
    if (repoCount > 10) {
      issues.push({
        type: 'over_fragmentation',
        severity: 'high',
        value: repoCount,
        threshold: 10,
        message: 'Too many repositories may increase coordination overhead'
      });
    }

    // Check for unused repositories
    Object.entries(config.repositories).forEach(([name, repo]) => {
      if (!repo.active) {
        issues.push({
          type: 'inactive_repository',
          severity: 'low',
          repository: name,
          message: `Repository ${name} is inactive`
        });
      }
    });

    // Check deployment complexity
    const deploymentOrder = config.coordination_rules.deployment_order;
    if (deploymentOrder.length > 5) {
      issues.push({
        type: 'complex_deployment',
        severity: 'medium',
        value: deploymentOrder.length,
        message: 'Complex deployment order may cause issues'
      });
    }

    return issues;
  }

  /**
   * Track evolution trigger
   */
  trackEvolutionTrigger(trigger) {
    const record = {
      id: `TRIG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      trigger,
      current_structure: this.repoCoordinator.config.project_structure,
      action_taken: null,
      outcome: null
    };

    this.tracking.trigger_history.push(record);
    
    // Keep last 200 triggers
    if (this.tracking.trigger_history.length > 200) {
      this.tracking.trigger_history = this.tracking.trigger_history.slice(-200);
    }

    this.saveTracking();
    return record.id;
  }

  /**
   * Track evolution event
   */
  trackEvolution(evolution) {
    const record = {
      id: `EVO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      from_structure: evolution.from,
      to_structure: evolution.to,
      reason: evolution.reason,
      triggered_by: evolution.trigger_id,
      metrics_before: this.captureCurrentMetrics(),
      metrics_after: null,
      success: null,
      rollback: false
    };

    this.tracking.evolution_history.push(record);
    this.saveTracking();

    // Schedule metrics capture after evolution
    setTimeout(() => this.capturePostEvolutionMetrics(record.id), 7 * 24 * 60 * 60 * 1000);

    return record.id;
  }

  /**
   * Update metrics
   */
  updateMetrics(metricsData) {
    const { repository, metrics } = metricsData;

    if (!this.metrics.repositories[repository]) {
      this.metrics.repositories[repository] = {
        build_times: [],
        deployment_results: [],
        merge_conflicts: [],
        lines_of_code: 0,
        file_count: 0
      };
    }

    const repoMetrics = this.metrics.repositories[repository];

    // Update build time
    if (metrics.build_time !== undefined) {
      repoMetrics.build_times.push({
        value: metrics.build_time,
        timestamp: new Date().toISOString()
      });
      
      // Keep last 100 measurements
      if (repoMetrics.build_times.length > 100) {
        repoMetrics.build_times = repoMetrics.build_times.slice(-100);
      }
      
      // Calculate average
      repoMetrics.avg_build_time = this.calculateAverage(
        repoMetrics.build_times.map(bt => bt.value)
      );
    }

    // Update deployment results
    if (metrics.deployment_success !== undefined) {
      repoMetrics.deployment_results.push({
        success: metrics.deployment_success,
        timestamp: new Date().toISOString()
      });
      
      if (repoMetrics.deployment_results.length > 50) {
        repoMetrics.deployment_results = repoMetrics.deployment_results.slice(-50);
      }
      
      // Calculate success rate
      const successes = repoMetrics.deployment_results.filter(d => d.success).length;
      repoMetrics.deployment_success_rate = successes / repoMetrics.deployment_results.length;
    }

    // Update code metrics
    if (metrics.lines_of_code !== undefined) {
      repoMetrics.lines_of_code = metrics.lines_of_code;
    }
    if (metrics.file_count !== undefined) {
      repoMetrics.file_count = metrics.file_count;
    }

    // Update global metrics
    this.updateGlobalMetrics(metrics);

    this.saveMetrics();
  }

  /**
   * Check evolution triggers
   */
  checkEvolutionTriggers() {
    const triggers = [];
    const globalMetrics = this.calculateGlobalAverages();

    // Build time trigger
    if (globalMetrics.avg_build_time > 600) {
      triggers.push({
        type: 'build_time',
        metric: 'global_avg_build_time',
        value: globalMetrics.avg_build_time,
        threshold: 600,
        severity: this.calculateSeverity(globalMetrics.avg_build_time, 600, 1200),
        recommendation: 'Consider splitting large modules',
        confidence: 0.8
      });
    }

    // Merge conflicts trigger
    if (globalMetrics.weekly_merge_conflicts > 5) {
      triggers.push({
        type: 'merge_conflicts',
        metric: 'weekly_merge_conflicts',
        value: globalMetrics.weekly_merge_conflicts,
        threshold: 5,
        severity: 'medium',
        recommendation: 'Review repository boundaries',
        confidence: 0.7
      });
    }

    // Deployment failures trigger
    if (globalMetrics.deployment_success_rate < 0.95) {
      triggers.push({
        type: 'deployment_failures',
        metric: 'deployment_success_rate',
        value: globalMetrics.deployment_success_rate,
        threshold: 0.95,
        severity: 'high',
        recommendation: 'Isolate unstable components',
        confidence: 0.9
      });
    }

    // Repository-specific triggers
    Object.entries(this.metrics.repositories).forEach(([repo, metrics]) => {
      if (metrics.lines_of_code > 50000) {
        triggers.push({
          type: 'large_repository',
          metric: 'lines_of_code',
          repository: repo,
          value: metrics.lines_of_code,
          threshold: 50000,
          severity: 'medium',
          recommendation: `Consider splitting ${repo} repository`,
          confidence: 0.75
        });
      }
    });

    // Check for patterns in trigger history
    const patternTriggers = this.detectTriggerPatterns();
    triggers.push(...patternTriggers);

    return triggers;
  }

  /**
   * Detect patterns in trigger history
   */
  detectTriggerPatterns() {
    const patterns = [];
    const recentTriggers = this.tracking.trigger_history.slice(-50);
    
    // Count trigger types
    const triggerCounts = {};
    recentTriggers.forEach(trigger => {
      const type = trigger.trigger.type;
      triggerCounts[type] = (triggerCounts[type] || 0) + 1;
    });

    // Detect recurring issues
    Object.entries(triggerCounts).forEach(([type, count]) => {
      if (count > 5) {
        patterns.push({
          type: 'recurring_issue',
          metric: `${type}_frequency`,
          value: count,
          threshold: 5,
          severity: 'high',
          recommendation: `Recurring ${type} issues indicate structural problem`,
          confidence: 0.85
        });
      }
    });

    return patterns;
  }

  /**
   * Generate recommendations for evolution
   */
  generateEvolutionRecommendations(triggers) {
    const recommendations = [];
    const currentStructure = this.repoCoordinator.config.project_structure;

    // Group triggers by type
    const triggersByType = {};
    triggers.forEach(trigger => {
      if (!triggersByType[trigger.type]) {
        triggersByType[trigger.type] = [];
      }
      triggersByType[trigger.type].push(trigger);
    });

    // Generate recommendations based on trigger combinations
    if (triggersByType.build_time && triggersByType.large_repository) {
      recommendations.push({
        action: 'split_repository',
        priority: 'high',
        description: 'Split large repository to improve build times',
        target_repositories: triggersByType.large_repository.map(t => t.repository),
        expected_impact: {
          build_time: '-40%',
          complexity: '+20%'
        }
      });
    }

    if (triggersByType.merge_conflicts) {
      recommendations.push({
        action: 'review_boundaries',
        priority: 'medium',
        description: 'Review and adjust repository boundaries',
        analysis_needed: [
          'Identify files causing conflicts',
          'Analyze team working patterns',
          'Review feature ownership'
        ]
      });
    }

    if (triggersByType.deployment_failures && currentStructure === 'single-repo') {
      recommendations.push({
        action: 'isolate_unstable',
        priority: 'high',
        description: 'Isolate unstable components into separate repository',
        benefits: [
          'Independent deployment cycles',
          'Reduced blast radius',
          'Faster rollbacks'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Predict evolution needs
   */
  predictEvolutionNeeds() {
    const prediction = {
      likelihood: 0,
      estimated_timeline: null,
      factors: [],
      recommended_preparation: []
    };

    // Analyze trends
    const trends = this.analyzeMetricTrends();
    
    // Build time trend
    if (trends.build_time_trend > 0.1) {
      prediction.factors.push({
        factor: 'increasing_build_time',
        impact: 'high',
        trend: `+${(trends.build_time_trend * 100).toFixed(1)}% per week`
      });
      prediction.likelihood += 0.3;
    }

    // Repository growth
    Object.entries(this.metrics.repositories).forEach(([repo, metrics]) => {
      const growthRate = this.calculateGrowthRate(metrics);
      if (growthRate > 0.05) {
        prediction.factors.push({
          factor: 'rapid_growth',
          repository: repo,
          impact: 'medium',
          growth_rate: `+${(growthRate * 100).toFixed(1)}% per week`
        });
        prediction.likelihood += 0.2;
      }
    });

    // Team size (would need to be tracked)
    const teamGrowth = this.predictTeamGrowth();
    if (teamGrowth > 0) {
      prediction.factors.push({
        factor: 'team_expansion',
        impact: 'medium',
        expected: `+${teamGrowth} developers`
      });
      prediction.likelihood += 0.2;
    }

    // Calculate timeline
    if (prediction.likelihood > 0.5) {
      prediction.estimated_timeline = this.estimateEvolutionTimeline(prediction.factors);
      prediction.recommended_preparation = this.generatePreparationSteps(prediction.factors);
    }

    return prediction;
  }

  /**
   * Helper methods
   */

  calculateSeverity(value, threshold, criticalThreshold) {
    if (value >= criticalThreshold) return 'critical';
    if (value >= threshold * 1.5) return 'high';
    if (value >= threshold) return 'medium';
    return 'low';
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  updateGlobalMetrics(metrics) {
    if (metrics.build_time !== undefined) {
      this.metrics.global.build_time.push({
        value: metrics.build_time,
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.merge_conflict !== undefined) {
      this.metrics.global.merge_conflicts.push({
        timestamp: new Date().toISOString()
      });
    }

    // Keep global metrics limited
    Object.keys(this.metrics.global).forEach(key => {
      if (Array.isArray(this.metrics.global[key]) && this.metrics.global[key].length > 500) {
        this.metrics.global[key] = this.metrics.global[key].slice(-500);
      }
    });
  }

  calculateGlobalAverages() {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Average build time
    const recentBuildTimes = this.metrics.global.build_time
      .filter(bt => new Date(bt.timestamp) > weekAgo)
      .map(bt => bt.value);
    
    const avg_build_time = this.calculateAverage(recentBuildTimes);

    // Weekly merge conflicts
    const weekly_merge_conflicts = this.metrics.global.merge_conflicts
      .filter(mc => new Date(mc.timestamp) > weekAgo).length;

    // Deployment success rate
    let deployment_success_rate = 1.0;
    let totalDeployments = 0;
    let successfulDeployments = 0;
    
    Object.values(this.metrics.repositories).forEach(repo => {
      if (repo.deployment_results) {
        const recent = repo.deployment_results.filter(
          d => new Date(d.timestamp) > weekAgo
        );
        totalDeployments += recent.length;
        successfulDeployments += recent.filter(d => d.success).length;
      }
    });
    
    if (totalDeployments > 0) {
      deployment_success_rate = successfulDeployments / totalDeployments;
    }

    return {
      avg_build_time,
      weekly_merge_conflicts,
      deployment_success_rate
    };
  }

  generateHealthRecommendations(issues) {
    const recommendations = [];
    const issuesByType = {};

    // Group issues by type
    issues.forEach(issue => {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    });

    // Generate specific recommendations
    if (issuesByType.build_time) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        action: 'Optimize build process or split repository',
        details: issuesByType.build_time
      });
    }

    if (issuesByType.circular_dependency) {
      recommendations.push({
        type: 'architecture',
        priority: 'critical',
        action: 'Break circular dependencies immediately',
        details: issuesByType.circular_dependency
      });
    }

    if (issuesByType.high_coupling) {
      recommendations.push({
        type: 'architecture',
        priority: 'medium',
        action: 'Reduce coupling between repositories',
        details: issuesByType.high_coupling
      });
    }

    return recommendations;
  }

  captureCurrentMetrics() {
    return {
      global: this.calculateGlobalAverages(),
      repositories: JSON.parse(JSON.stringify(this.metrics.repositories)),
      timestamp: new Date().toISOString()
    };
  }

  async capturePostEvolutionMetrics(evolutionId) {
    const evolution = this.tracking.evolution_history.find(e => e.id === evolutionId);
    if (!evolution) return;

    evolution.metrics_after = this.captureCurrentMetrics();
    
    // Calculate improvement
    const before = evolution.metrics_before.global;
    const after = evolution.metrics_after.global;
    
    evolution.improvement = {
      build_time: ((before.avg_build_time - after.avg_build_time) / before.avg_build_time * 100).toFixed(1),
      merge_conflicts: before.weekly_merge_conflicts - after.weekly_merge_conflicts,
      deployment_success: ((after.deployment_success_rate - before.deployment_success_rate) * 100).toFixed(1)
    };

    // Determine success
    evolution.success = evolution.improvement.build_time > 0 || 
                       evolution.improvement.merge_conflicts > 0 ||
                       evolution.improvement.deployment_success > 0;

    this.saveTracking();
  }

  analyzeMetricTrends() {
    const trends = {
      build_time_trend: 0,
      conflict_trend: 0,
      deployment_trend: 0
    };

    // Analyze build time trend
    if (this.metrics.global.build_time.length > 10) {
      const recent = this.metrics.global.build_time.slice(-10);
      trends.build_time_trend = this.calculateTrend(recent.map(bt => bt.value));
    }

    return trends;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    // Simple linear regression
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * (i + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;
    
    return avgY > 0 ? slope / avgY : 0;
  }

  calculateGrowthRate(metrics) {
    // Simplified growth rate calculation
    if (!metrics.lines_of_code) return 0;
    
    // This would need historical data to calculate properly
    // For now, return a mock value based on size
    if (metrics.lines_of_code > 40000) return 0.08;
    if (metrics.lines_of_code > 20000) return 0.05;
    return 0.02;
  }

  predictTeamGrowth() {
    // This would need team size tracking
    // Mock implementation
    return 0;
  }

  estimateEvolutionTimeline(factors) {
    let weeks = 12; // Base timeline
    
    factors.forEach(factor => {
      if (factor.impact === 'high') weeks -= 3;
      if (factor.impact === 'medium') weeks -= 1;
    });

    return Math.max(2, weeks);
  }

  generatePreparationSteps(factors) {
    const steps = [
      'Document current repository structure',
      'Identify clear module boundaries',
      'Plan migration strategy'
    ];

    if (factors.some(f => f.factor === 'increasing_build_time')) {
      steps.push('Analyze build bottlenecks');
      steps.push('Identify candidates for extraction');
    }

    if (factors.some(f => f.factor === 'team_expansion')) {
      steps.push('Define code ownership areas');
      steps.push('Establish team communication patterns');
    }

    return steps;
  }

  /**
   * Save tracking data
   */
  saveTracking() {
    this.tracking.last_updated = new Date().toISOString();
    fs.writeFileSync(this.trackingPath, JSON.stringify(this.tracking, null, 2));
  }

  /**
   * Save metrics data
   */
  saveMetrics() {
    this.metrics.last_updated = new Date().toISOString();
    fs.writeFileSync(this.metricsPath, JSON.stringify(this.metrics, null, 2));
  }

  /**
   * Generate evolution report
   */
  generateEvolutionReport() {
    const report = {
      current_structure: this.repoCoordinator.config.project_structure,
      health_summary: this.getLatestHealthSnapshot(),
      active_triggers: this.checkEvolutionTriggers(),
      evolution_history: this.tracking.evolution_history.slice(-5),
      predictions: this.predictEvolutionNeeds(),
      recommendations: []
    };

    // Add recommendations based on active triggers
    if (report.active_triggers.length > 0) {
      report.recommendations = this.generateEvolutionRecommendations(report.active_triggers);
    }

    return report;
  }

  getLatestHealthSnapshot() {
    const snapshots = this.tracking.health_snapshots;
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  }
}

module.exports = RepositoryEvolutionTracker;

// CLI interface
if (require.main === module) {
  const tracker = new RepositoryEvolutionTracker(path.join(__dirname, '..'));
  const command = process.argv[2];

  async function main() {
    switch (command) {
      case 'monitor':
        const health = await tracker.monitorHealth();
        console.log('Repository Health Report');
        console.log('=======================');
        console.log(JSON.stringify(health, null, 2));
        break;

      case 'check-triggers':
        const triggers = tracker.checkEvolutionTriggers();
        console.log('Evolution Triggers');
        console.log('==================');
        console.log(JSON.stringify(triggers, null, 2));
        break;

      case 'predict':
        const prediction = tracker.predictEvolutionNeeds();
        console.log('Evolution Prediction');
        console.log('====================');
        console.log(JSON.stringify(prediction, null, 2));
        break;

      case 'report':
        const report = tracker.generateEvolutionReport();
        console.log('Evolution Report');
        console.log('================');
        console.log(JSON.stringify(report, null, 2));
        break;

      case 'update-metrics':
        // Example metric update
        tracker.updateMetrics({
          repository: 'main',
          metrics: {
            build_time: 450,
            deployment_success: true,
            lines_of_code: 25000,
            file_count: 180
          }
        });
        console.log('Metrics updated');
        break;

      default:
        console.log('Commands: monitor, check-triggers, predict, report, update-metrics');
    }
  }

  main().catch(console.error);
}