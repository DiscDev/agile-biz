/**
 * Implementation Tracker
 * Tracks learning implementation effectiveness
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class ImplementationTracker extends EventEmitter {
  constructor(projectRoot) {
    super();
    this.projectRoot = projectRoot;
    this.trackingPath = path.join(projectRoot, 'machine-data', 'implementation-tracking.json');
    this.metricsPath = path.join(projectRoot, 'machine-data', 'implementation-metrics.json');
    this.dashboardPath = path.join(projectRoot, 'machine-data', 'learning-dashboard.json');
    this.initializeTracking();
  }

  /**
   * Initialize tracking storage
   */
  initializeTracking() {
    if (!fs.existsSync(this.trackingPath)) {
      fs.writeFileSync(this.trackingPath, JSON.stringify({
        implementations: [],
        contribution_map: {},
        agent_improvements: {}
      }, null, 2));
    }

    if (!fs.existsSync(this.metricsPath)) {
      fs.writeFileSync(this.metricsPath, JSON.stringify({
        before_after: {},
        success_rates: {},
        rollback_history: []
      }, null, 2));
    }

    if (!fs.existsSync(this.dashboardPath)) {
      fs.writeFileSync(this.dashboardPath, JSON.stringify({
        summary: {
          total_contributions: 0,
          total_implementations: 0,
          successful_implementations: 0,
          average_impact: 0
        },
        timeline: [],
        agent_performance: {}
      }, null, 2));
    }
  }

  /**
   * Track new implementation
   */
  trackImplementation(implementation) {
    const tracking = JSON.parse(fs.readFileSync(this.trackingPath, 'utf8'));
    
    const record = {
      id: this.generateImplementationId(),
      contribution_id: implementation.source_contribution,
      contribution_date: implementation.contribution_date,
      implementation_date: new Date().toISOString(),
      agent: implementation.agent,
      learning: implementation.learning,
      version_before: implementation.version_before,
      version_after: implementation.version_after,
      status: 'in_progress',
      metrics: {
        before: implementation.metrics_before || {},
        after: {},
        improvement: {}
      },
      validation: {
        required: true,
        completed: false,
        validation_date: null,
        success: null
      }
    };

    tracking.implementations.push(record);
    
    // Update contribution map
    if (!tracking.contribution_map[implementation.source_contribution]) {
      tracking.contribution_map[implementation.source_contribution] = [];
    }
    tracking.contribution_map[implementation.source_contribution].push(record.id);

    // Update agent improvements
    if (!tracking.agent_improvements[implementation.agent]) {
      tracking.agent_improvements[implementation.agent] = [];
    }
    tracking.agent_improvements[implementation.agent].push(record.id);

    fs.writeFileSync(this.trackingPath, JSON.stringify(tracking, null, 2));
    
    // Start monitoring
    this.startMonitoring(record.id);
    
    return record;
  }

  /**
   * Start monitoring implementation
   */
  startMonitoring(implementationId) {
    // In real implementation, this would set up continuous monitoring
    // For now, simulate with delayed validation
    setTimeout(() => {
      this.validateImplementation(implementationId);
    }, 5000); // Validate after 5 seconds
  }

  /**
   * Validate implementation success
   */
  validateImplementation(implementationId) {
    const tracking = JSON.parse(fs.readFileSync(this.trackingPath, 'utf8'));
    const implementation = tracking.implementations.find(i => i.id === implementationId);
    
    if (!implementation) return;

    // Capture after metrics
    implementation.metrics.after = this.captureMetrics(implementation.agent);
    
    // Calculate improvements
    implementation.metrics.improvement = this.calculateImprovement(
      implementation.metrics.before,
      implementation.metrics.after
    );

    // Determine success
    const successScore = this.calculateSuccessScore(implementation.metrics.improvement);
    implementation.validation.completed = true;
    implementation.validation.validation_date = new Date().toISOString();
    implementation.validation.success = successScore > 0.6;
    implementation.status = implementation.validation.success ? 'successful' : 'failed';

    // Update tracking
    fs.writeFileSync(this.trackingPath, JSON.stringify(tracking, null, 2));

    // Update metrics
    this.updateMetrics(implementation);

    // Update dashboard
    this.updateDashboard(implementation);

    // Handle rollback if failed
    if (!implementation.validation.success) {
      this.initiateRollback(implementation);
    }

    // Emit event
    this.emit('implementation_validated', implementation);

    return implementation;
  }

  /**
   * Capture current metrics for agent
   */
  captureMetrics(agent) {
    // In real implementation, would capture actual metrics
    // For now, return simulated metrics
    return {
      performance: {
        response_time: 200 + Math.random() * 100,
        token_usage: 5000 + Math.floor(Math.random() * 5000),
        error_rate: Math.random() * 0.05,
        success_rate: 0.85 + Math.random() * 0.15
      },
      quality: {
        code_quality_score: 0.8 + Math.random() * 0.2,
        test_coverage: 0.7 + Math.random() * 0.3,
        bug_detection_rate: 0.6 + Math.random() * 0.4
      },
      efficiency: {
        task_completion_time: 300 + Math.random() * 200,
        resource_utilization: 0.5 + Math.random() * 0.5
      }
    };
  }

  /**
   * Calculate improvement between metrics
   */
  calculateImprovement(before, after) {
    const improvements = {};

    // Performance improvements
    improvements.performance = {
      response_time: this.percentageChange(
        before.performance.response_time,
        after.performance.response_time,
        true // Lower is better
      ),
      token_usage: this.percentageChange(
        before.performance.token_usage,
        after.performance.token_usage,
        true
      ),
      error_rate: this.percentageChange(
        before.performance.error_rate,
        after.performance.error_rate,
        true
      ),
      success_rate: this.percentageChange(
        before.performance.success_rate,
        after.performance.success_rate
      )
    };

    // Quality improvements
    improvements.quality = {
      code_quality_score: this.percentageChange(
        before.quality.code_quality_score,
        after.quality.code_quality_score
      ),
      test_coverage: this.percentageChange(
        before.quality.test_coverage,
        after.quality.test_coverage
      ),
      bug_detection_rate: this.percentageChange(
        before.quality.bug_detection_rate,
        after.quality.bug_detection_rate
      )
    };

    // Overall improvement score
    improvements.overall_score = this.calculateOverallScore(improvements);

    return improvements;
  }

  /**
   * Calculate percentage change
   */
  percentageChange(before, after, lowerIsBetter = false) {
    if (lowerIsBetter) {
      return ((before - after) / before * 100).toFixed(1);
    }
    return ((after - before) / before * 100).toFixed(1);
  }

  /**
   * Calculate overall improvement score
   */
  calculateOverallScore(improvements) {
    let positiveCount = 0;
    let totalCount = 0;
    let totalImprovement = 0;

    Object.values(improvements).forEach(category => {
      if (typeof category === 'object') {
        Object.values(category).forEach(value => {
          totalCount++;
          const numValue = parseFloat(value);
          if (numValue > 0) {
            positiveCount++;
            totalImprovement += numValue;
          }
        });
      }
    });

    return {
      positive_metrics: positiveCount,
      total_metrics: totalCount,
      success_rate: (positiveCount / totalCount),
      average_improvement: (totalImprovement / positiveCount).toFixed(1)
    };
  }

  /**
   * Calculate success score
   */
  calculateSuccessScore(improvement) {
    return improvement.overall_score.success_rate;
  }

  /**
   * Update metrics storage
   */
  updateMetrics(implementation) {
    const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
    
    // Store before/after comparison
    metrics.before_after[implementation.id] = {
      agent: implementation.agent,
      before: implementation.metrics.before,
      after: implementation.metrics.after,
      improvement: implementation.metrics.improvement
    };

    // Update success rates
    if (!metrics.success_rates[implementation.agent]) {
      metrics.success_rates[implementation.agent] = {
        total: 0,
        successful: 0,
        rate: 0
      };
    }
    
    metrics.success_rates[implementation.agent].total++;
    if (implementation.validation.success) {
      metrics.success_rates[implementation.agent].successful++;
    }
    metrics.success_rates[implementation.agent].rate = 
      (metrics.success_rates[implementation.agent].successful / 
       metrics.success_rates[implementation.agent].total * 100).toFixed(1);

    fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));
  }

  /**
   * Update learning dashboard
   */
  updateDashboard(implementation) {
    const dashboard = JSON.parse(fs.readFileSync(this.dashboardPath, 'utf8'));
    
    // Update summary
    dashboard.summary.total_implementations++;
    if (implementation.validation.success) {
      dashboard.summary.successful_implementations++;
    }
    
    // Update timeline
    dashboard.timeline.push({
      date: implementation.implementation_date,
      agent: implementation.agent,
      success: implementation.validation.success,
      impact: implementation.metrics.improvement.overall_score.average_improvement
    });
    
    // Keep last 50 entries
    if (dashboard.timeline.length > 50) {
      dashboard.timeline = dashboard.timeline.slice(-50);
    }

    // Update agent performance
    if (!dashboard.agent_performance[implementation.agent]) {
      dashboard.agent_performance[implementation.agent] = {
        implementations: 0,
        successes: 0,
        average_impact: 0,
        improvements: []
      };
    }
    
    const agentPerf = dashboard.agent_performance[implementation.agent];
    agentPerf.implementations++;
    if (implementation.validation.success) {
      agentPerf.successes++;
      agentPerf.improvements.push(
        parseFloat(implementation.metrics.improvement.overall_score.average_improvement)
      );
      agentPerf.average_impact = 
        (agentPerf.improvements.reduce((a, b) => a + b, 0) / 
         agentPerf.improvements.length).toFixed(1);
    }

    // Calculate overall average impact
    let totalImpact = 0;
    let impactCount = 0;
    Object.values(dashboard.agent_performance).forEach(agent => {
      if (agent.average_impact > 0) {
        totalImpact += parseFloat(agent.average_impact);
        impactCount++;
      }
    });
    dashboard.summary.average_impact = 
      impactCount > 0 ? (totalImpact / impactCount).toFixed(1) : 0;

    fs.writeFileSync(this.dashboardPath, JSON.stringify(dashboard, null, 2));
  }

  /**
   * Initiate rollback for failed implementation
   */
  initiateRollback(implementation) {
    const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
    
    const rollback = {
      id: this.generateRollbackId(),
      implementation_id: implementation.id,
      agent: implementation.agent,
      timestamp: new Date().toISOString(),
      reason: 'Implementation validation failed',
      from_version: implementation.version_after,
      to_version: implementation.version_before,
      metrics_at_failure: implementation.metrics.after
    };

    metrics.rollback_history.push(rollback);
    fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));

    // Emit rollback event
    this.emit('rollback_initiated', rollback);

    return rollback;
  }

  /**
   * Get implementation report
   */
  getImplementationReport() {
    const tracking = JSON.parse(fs.readFileSync(this.trackingPath, 'utf8'));
    const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
    const dashboard = JSON.parse(fs.readFileSync(this.dashboardPath, 'utf8'));

    return {
      summary: dashboard.summary,
      by_contribution: this.getContributionImpact(tracking),
      by_agent: dashboard.agent_performance,
      success_rates: metrics.success_rates,
      recent_implementations: tracking.implementations.slice(-10).reverse(),
      rollback_count: metrics.rollback_history.length,
      top_improvements: this.getTopImprovements(metrics)
    };
  }

  /**
   * Get contribution impact analysis
   */
  getContributionImpact(tracking) {
    const impact = {};
    
    Object.entries(tracking.contribution_map).forEach(([contributionId, implementationIds]) => {
      const implementations = implementationIds.map(id => 
        tracking.implementations.find(i => i.id === id)
      );
      
      const successful = implementations.filter(i => i?.validation?.success).length;
      
      impact[contributionId] = {
        total_implementations: implementations.length,
        successful_implementations: successful,
        success_rate: (successful / implementations.length * 100).toFixed(1) + '%',
        agents_affected: [...new Set(implementations.map(i => i?.agent).filter(Boolean))]
      };
    });

    return impact;
  }

  /**
   * Get top improvements
   */
  getTopImprovements(metrics) {
    const improvements = [];
    
    Object.entries(metrics.before_after).forEach(([id, data]) => {
      if (data.improvement?.overall_score?.average_improvement > 20) {
        improvements.push({
          implementation_id: id,
          agent: data.agent,
          average_improvement: data.improvement.overall_score.average_improvement,
          key_metrics: this.extractKeyMetrics(data.improvement)
        });
      }
    });

    return improvements
      .sort((a, b) => b.average_improvement - a.average_improvement)
      .slice(0, 10);
  }

  /**
   * Extract key improvement metrics
   */
  extractKeyMetrics(improvement) {
    const key = [];
    
    ['performance', 'quality'].forEach(category => {
      Object.entries(improvement[category] || {}).forEach(([metric, value]) => {
        if (parseFloat(value) > 15) {
          key.push(`${metric}: +${value}%`);
        }
      });
    });

    return key;
  }

  /**
   * Generate dashboard visualization data
   */
  getDashboardData() {
    const dashboard = JSON.parse(fs.readFileSync(this.dashboardPath, 'utf8'));
    
    return {
      summary: dashboard.summary,
      timeline_chart: {
        labels: dashboard.timeline.map(t => new Date(t.date).toLocaleDateString()),
        success_data: dashboard.timeline.map(t => t.success ? 1 : 0),
        impact_data: dashboard.timeline.map(t => parseFloat(t.impact) || 0)
      },
      agent_performance_chart: {
        labels: Object.keys(dashboard.agent_performance),
        success_rates: Object.values(dashboard.agent_performance).map(a => 
          (a.successes / a.implementations * 100).toFixed(1)
        ),
        average_impacts: Object.values(dashboard.agent_performance).map(a => 
          parseFloat(a.average_impact) || 0
        )
      }
    };
  }

  /**
   * Generate IDs
   */
  generateImplementationId() {
    return `IMPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateRollbackId() {
    return `ROLL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ImplementationTracker;

// CLI interface
if (require.main === module) {
  const tracker = new ImplementationTracker(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      const report = tracker.getImplementationReport();
      console.log('📊 Implementation Tracking Report');
      console.log('================================');
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'dashboard':
      const dashboardData = tracker.getDashboardData();
      console.log('📈 Dashboard Data');
      console.log('================');
      console.log(JSON.stringify(dashboardData, null, 2));
      break;

    case 'track':
      // Example tracking
      const implementation = tracker.trackImplementation({
        source_contribution: '2025-01-27-saas-dashboard',
        contribution_date: '2025-01-27',
        agent: 'testing_agent',
        learning: 'Browser testing for SPAs',
        version_before: '1.0.0',
        version_after: '1.0.0+20250128.1',
        metrics_before: tracker.captureMetrics('testing_agent')
      });
      console.log('✅ Tracking implementation:', implementation.id);
      break;

    default:
      console.log('Commands: report, dashboard, track');
  }
}