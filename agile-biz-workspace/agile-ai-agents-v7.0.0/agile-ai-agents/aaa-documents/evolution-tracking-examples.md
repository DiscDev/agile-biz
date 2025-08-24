# Repository Evolution Tracking - Example Usage Patterns

## Real-World Evolution Scenarios

### Scenario 1: SaaS Platform Evolution

#### Timeline: Single Repo → Multi-Repo Evolution

**Week 0: Initial Setup**
```javascript
// Project starts as single repository
const tracker = new RepositoryEvolutionTracker('./');
tracker.trackEvolution({
  from: 'none',
  to: 'single-repo',
  reason: 'Initial project setup',
  trigger_id: null
});
```

**Week 4: First Warning Signs**
```javascript
// Build times increasing
const { reportBuildComplete } = require('./machine-data/metrics-collector');
reportBuildComplete('main', Date.now() - 480000, true); // 8 minutes

// Code base growing
const { reportCodeAnalysis } = require('./machine-data/metrics-collector');
reportCodeAnalysis('main', {
  linesOfCode: 15000,
  fileCount: 120,
  complexity: 6.2
});
```

**Week 8: Evolution Trigger**
```javascript
// System detects evolution need
const collector = new MetricsCollector();
const triggers = collector.checkEvolutionTriggers();
// Returns: [{
//   type: 'build_time',
//   severity: 'medium',
//   recommendation: 'Consider splitting large modules'
// }]
```

**Week 10: Marketing Site Split**
```javascript
// Evolution decision made
const evolutionId = tracker.trackEvolution({
  from: 'single-repo',
  to: 'marketing|app',
  reason: 'SEO requirements conflict with app framework',
  trigger_id: 'TRIG-1640995200000'
});

// Post-evolution metrics
setTimeout(() => {
  reportBuildComplete('marketing', Date.now() - 120000, true); // 2 minutes
  reportBuildComplete('app', Date.now() - 300000, true);       // 5 minutes
}, 7 * 24 * 60 * 60 * 1000); // 7 days later
```

### Scenario 2: E-commerce Platform Fragmentation

#### Problem: Monolith Becoming Unmanageable

**Initial State**
```javascript
// Large monolithic repository
reportCodeAnalysis('ecommerce-main', {
  linesOfCode: 65000,
  fileCount: 450,
  complexity: 9.8
});

// Multiple teams causing conflicts
const { reportFriction } = require('./machine-data/metrics-collector');
reportFriction('ecommerce-main', 'merge_conflict', {
  files: ['src/checkout/payment.js', 'src/products/catalog.js'],
  teams: ['checkout-team', 'catalog-team'],
  resolution_time: 3600 // 1 hour
});
```

**Evolution Recommendation**
```javascript
// System recommends three-way split
const recommendations = collector.getEvolutionRecommendations();
// Returns: {
//   action: 'split_repository',
//   target_repositories: ['storefront', 'admin', 'api'],
//   expected_impact: {
//     build_time: '-60%',
//     merge_conflicts: '-80%',
//     coordination: '+40%'
//   }
// }
```

**Implementation**
```javascript
// Track the evolution
tracker.trackEvolution({
  from: 'single-repo',
  to: 'storefront|admin|api',
  reason: 'Team conflicts and build performance',
  trigger_id: 'TRIG-1640995800000'
});
```

### Scenario 3: Microservices Over-Fragmentation

#### Problem: Too Many Small Repositories

**Warning Signs**
```javascript
// System detects over-fragmentation
// 12 repositories with complex deployment order
const healthCheck = await tracker.monitorHealth();
// Returns issues: [{
//   type: 'over_fragmentation',
//   severity: 'high',
//   value: 12,
//   message: 'Too many repositories may increase coordination overhead'
// }]
```

**Consolidation Recommendation**
```javascript
// System suggests consolidation
const triggers = tracker.checkEvolutionTriggers();
// Includes recommendation to merge related services
```

## Agent Integration Examples

### Coder Agent Integration

```javascript
// coder-agent.js
class CoderAgent {
  async buildProject(repository) {
    const buildStart = Date.now();
    
    try {
      // Build process
      const buildResult = await this.executeBuild(repository);
      
      // Report successful build
      const { reportBuildComplete } = require('./machine-data/metrics-collector');
      reportBuildComplete(repository, buildStart, true);
      
      // Report code metrics after build
      const codeStats = await this.analyzeCode(repository);
      const { reportCodeAnalysis } = require('./machine-data/metrics-collector');
      reportCodeAnalysis(repository, codeStats);
      
      return buildResult;
    } catch (error) {
      // Report failed build
      reportBuildComplete(repository, buildStart, false);
      
      // Report friction
      const { reportFriction } = require('./machine-data/metrics-collector');
      reportFriction(repository, 'build_failure', {
        error: error.message,
        stage: 'compilation'
      });
      
      throw error;
    }
  }
  
  async handleMergeConflict(repository, conflictFiles) {
    const resolutionStart = Date.now();
    
    try {
      await this.resolveConflicts(conflictFiles);
      
      const resolutionTime = Math.floor((Date.now() - resolutionStart) / 1000);
      const collector = new MetricsCollector();
      collector.reportMergeConflict(repository, conflictFiles, resolutionTime);
      
    } catch (error) {
      // Report unresolved conflict
      reportFriction(repository, 'merge_conflict', {
        files: conflictFiles,
        error: error.message,
        resolution_time: null
      });
    }
  }
}
```

### DevOps Agent Integration

```javascript
// devops-agent.js
class DevOpsAgent {
  async deployApplication(repository, environment) {
    const deployStart = Date.now();
    
    try {
      const deployResult = await this.executeDeployment(repository, environment);
      
      const deployDuration = Math.floor((Date.now() - deployStart) / 1000);
      const { reportDeployment } = require('./machine-data/metrics-collector');
      reportDeployment(repository, true, deployDuration);
      
      return deployResult;
    } catch (error) {
      const deployDuration = Math.floor((Date.now() - deployStart) / 1000);
      reportDeployment(repository, false, deployDuration);
      
      // Report deployment friction
      const { reportFriction } = require('./machine-data/metrics-collector');
      reportFriction(repository, 'deployment_failure', {
        environment,
        error: error.message,
        duration: deployDuration
      });
      
      throw error;
    }
  }
  
  async runTests(repository) {
    const testStart = Date.now();
    
    const testResult = await this.executeTests(repository);
    const testDuration = Math.floor((Date.now() - testStart) / 1000);
    
    const { reportTestRun } = require('./machine-data/metrics-collector');
    reportTestRun(repository, testStart, testResult.coverage);
    
    if (testResult.failed > 0) {
      reportFriction(repository, 'test_failure', {
        failed_tests: testResult.failed,
        total_tests: testResult.total
      });
    }
    
    return testResult;
  }
}
```

### Project Manager Agent Integration

```javascript
// project-manager-agent.js
class ProjectManagerAgent {
  async planSprint() {
    // Check evolution recommendations before sprint planning
    const { MetricsCollector } = require('./machine-data/metrics-collector');
    const collector = new MetricsCollector();
    
    const evolutionReport = collector.getEvolutionRecommendations();
    
    if (evolutionReport.recommendations.length > 0) {
      console.log('Evolution recommendations for sprint planning:');
      evolutionReport.recommendations.forEach(rec => {
        console.log(`- ${rec.action}: ${rec.description}`);
        
        // Add evolution tasks to sprint
        this.addSprintTask({
          type: 'evolution',
          priority: rec.priority,
          description: rec.description,
          estimatedEffort: this.estimateEvolutionEffort(rec)
        });
      });
    }
    
    // Check for critical triggers
    const triggers = collector.checkEvolutionTriggers();
    const criticalTriggers = triggers.filter(t => t.severity === 'critical');
    
    if (criticalTriggers.length > 0) {
      console.log('Critical evolution triggers detected:');
      criticalTriggers.forEach(trigger => {
        console.log(`- ${trigger.type}: ${trigger.recommendation}`);
        
        // Escalate critical issues
        this.escalateIssue({
          type: 'evolution_critical',
          trigger,
          urgency: 'high'
        });
      });
    }
  }
  
  async reviewSprintMetrics(sprintData) {
    // Report sprint-level metrics
    const collector = new MetricsCollector();
    
    sprintData.repositories.forEach(repo => {
      if (repo.buildIssues > 0) {
        collector.reportDeveloperFriction(
          repo.name,
          'sprint_build_issues',
          repo.buildIssues > 5 ? 'high' : 'medium',
          { issues_count: repo.buildIssues, sprint: sprintData.number }
        );
      }
      
      if (repo.deploymentFailures > 0) {
        collector.reportDeveloperFriction(
          repo.name,
          'sprint_deployment_issues',
          'high',
          { failures: repo.deploymentFailures, sprint: sprintData.number }
        );
      }
    });
  }
}
```

## Monitoring Dashboard Integration

### Real-time Health Monitoring

```javascript
// dashboard-integration.js
class EvolutionDashboard {
  async getHealthData() {
    const RepositoryEvolutionTracker = require('./machine-data/repository-evolution-tracker');
    const tracker = new RepositoryEvolutionTracker('./');
    
    const healthSnapshot = await tracker.monitorHealth();
    const triggers = tracker.checkEvolutionTriggers();
    const predictions = tracker.predictEvolutionNeeds();
    
    return {
      overall_health: healthSnapshot.overall_health,
      repository_health: healthSnapshot.repositories,
      active_triggers: triggers.length,
      critical_issues: healthSnapshot.issues.filter(i => i.severity === 'critical').length,
      evolution_likelihood: predictions.likelihood,
      estimated_timeline: predictions.estimated_timeline
    };
  }
  
  async getEvolutionTimeline() {
    const tracker = new RepositoryEvolutionTracker('./');
    return tracker.tracking.evolution_history.map(evolution => ({
      date: evolution.timestamp,
      from: evolution.from_structure,
      to: evolution.to_structure,
      reason: evolution.reason,
      success: evolution.success,
      improvement: evolution.improvement
    }));
  }
  
  async getTrendData() {
    const tracker = new RepositoryEvolutionTracker('./');
    const snapshots = tracker.tracking.health_snapshots.slice(-30); // Last 30 snapshots
    
    return snapshots.map(snapshot => ({
      timestamp: snapshot.timestamp,
      health_score: snapshot.overall_health,
      issue_count: snapshot.issues.length,
      critical_issues: snapshot.issues.filter(i => i.severity === 'critical').length
    }));
  }
}
```

### Alert System Integration

```javascript
// alert-system.js
class EvolutionAlertSystem {
  async checkAlerts() {
    const collector = new MetricsCollector();
    const triggers = collector.checkEvolutionTriggers();
    const criticalTriggers = triggers.filter(t => t.severity === 'critical');
    
    if (criticalTriggers.length > 0) {
      await this.sendCriticalAlert(criticalTriggers);
    }
    
    const highTriggers = triggers.filter(t => t.severity === 'high');
    if (highTriggers.length > 3) {
      await this.sendWarningAlert(highTriggers);
    }
    
    // Check predictions
    const predictions = collector.getEvolutionRecommendations();
    if (predictions.predictions.likelihood > 0.8) {
      await this.sendPredictionAlert(predictions.predictions);
    }
  }
  
  async sendCriticalAlert(triggers) {
    const message = `CRITICAL: Evolution required immediately
    
Triggers:
${triggers.map(t => `- ${t.type}: ${t.recommendation}`).join('\n')}

Immediate action required to prevent system degradation.`;
    
    // Send to team communication channel
    await this.sendNotification('critical', message);
  }
  
  async sendPredictionAlert(prediction) {
    const message = `Evolution predicted within ${prediction.estimated_timeline} weeks
    
Likelihood: ${(prediction.likelihood * 100).toFixed(1)}%

Preparation steps:
${prediction.recommended_preparation.map(step => `- ${step}`).join('\n')}

Consider planning evolution tasks for upcoming sprints.`;
    
    await this.sendNotification('info', message);
  }
}
```

## Advanced Usage Patterns

### Custom Metric Collection

```javascript
// custom-metrics.js
class CustomMetrics {
  static async collectPerformanceMetrics(repository) {
    const collector = new MetricsCollector();
    
    // Custom API response time tracking
    const apiResponseTimes = await this.measureApiPerformance();
    collector.updateMetrics(repository, 'performance', {
      api_response_time: apiResponseTimes.average,
      api_p95_response_time: apiResponseTimes.p95,
      timestamp: new Date().toISOString()
    });
    
    // Memory usage tracking
    const memoryUsage = await this.measureMemoryUsage();
    collector.updateMetrics(repository, 'resource', {
      memory_usage: memoryUsage.peak,
      memory_average: memoryUsage.average,
      timestamp: new Date().toISOString()
    });
  }
  
  static async collectDeveloperExperience(repository, teamId) {
    const collector = new MetricsCollector();
    
    // Survey or automated metrics about developer satisfaction
    const devExperience = await this.gatherDeveloperFeedback(teamId);
    
    if (devExperience.satisfaction < 7) {
      collector.reportDeveloperFriction(repository, 'low_satisfaction', 'high', {
        satisfaction_score: devExperience.satisfaction,
        common_complaints: devExperience.complaints,
        team: teamId
      });
    }
  }
}
```

### Evolution Planning Workflows

```javascript
// evolution-planner.js
class EvolutionPlanner {
  async createEvolutionPlan(repository, targetStructure) {
    const tracker = new RepositoryEvolutionTracker('./');
    
    // Analyze current state
    const currentHealth = await tracker.monitorHealth();
    const currentMetrics = tracker.captureCurrentMetrics();
    
    // Create evolution plan
    const plan = {
      id: `PLAN-${Date.now()}`,
      from: tracker.repoCoordinator.config.project_structure,
      to: targetStructure,
      current_metrics: currentMetrics,
      phases: this.generateEvolutionPhases(repository, targetStructure),
      estimated_duration: this.estimateDuration(targetStructure),
      risk_assessment: this.assessRisks(currentHealth, targetStructure),
      rollback_plan: this.createRollbackPlan()
    };
    
    return plan;
  }
  
  generateEvolutionPhases(repository, targetStructure) {
    // Create detailed phases for evolution
    return [
      {
        phase: 1,
        name: 'Preparation',
        tasks: [
          'Document current architecture',
          'Identify module boundaries',
          'Set up CI/CD for new repositories'
        ],
        estimated_days: 5
      },
      {
        phase: 2,
        name: 'Repository Creation',
        tasks: [
          'Create new repository structure',
          'Move code to appropriate repositories',
          'Update build configurations'
        ],
        estimated_days: 10
      },
      {
        phase: 3,
        name: 'Integration',
        tasks: [
          'Update deployment pipelines',
          'Configure cross-repository dependencies',
          'Test end-to-end functionality'
        ],
        estimated_days: 7
      },
      {
        phase: 4,
        name: 'Validation',
        tasks: [
          'Monitor metrics for 1 week',
          'Validate performance improvements',
          'Document lessons learned'
        ],
        estimated_days: 7
      }
    ];
  }
}
```

## Testing and Validation

### Evolution Success Validation

```javascript
// evolution-validator.js
class EvolutionValidator {
  async validateEvolution(evolutionId) {
    const tracker = new RepositoryEvolutionTracker('./');
    const evolution = tracker.tracking.evolution_history.find(e => e.id === evolutionId);
    
    if (!evolution) {
      throw new Error(`Evolution ${evolutionId} not found`);
    }
    
    // Wait for stabilization period
    const daysSinceEvolution = (Date.now() - new Date(evolution.timestamp)) / (1000 * 60 * 60 * 24);
    if (daysSinceEvolution < 7) {
      return { status: 'pending', message: 'Waiting for stabilization period' };
    }
    
    // Capture current metrics
    const currentMetrics = tracker.captureCurrentMetrics();
    
    // Compare with pre-evolution metrics
    const improvement = this.calculateImprovement(
      evolution.metrics_before,
      currentMetrics
    );
    
    // Validate success criteria
    const validation = {
      evolutionId,
      success: this.determineSuccess(improvement),
      improvements: improvement,
      issues: this.identifyNewIssues(currentMetrics),
      recommendation: this.generateRecommendation(improvement)
    };
    
    // Update evolution record
    evolution.validation = validation;
    tracker.saveTracking();
    
    return validation;
  }
  
  calculateImprovement(before, after) {
    return {
      build_time: this.calculatePercentageChange(
        before.global.avg_build_time,
        after.global.avg_build_time
      ),
      merge_conflicts: before.global.weekly_merge_conflicts - after.global.weekly_merge_conflicts,
      deployment_success: this.calculatePercentageChange(
        before.global.deployment_success_rate,
        after.global.deployment_success_rate
      )
    };
  }
  
  determineSuccess(improvement) {
    const positiveImpacts = [
      improvement.build_time < -5, // 5% improvement
      improvement.merge_conflicts > 0,
      improvement.deployment_success > 2 // 2% improvement
    ].filter(Boolean).length;
    
    return positiveImpacts >= 2; // At least 2 positive impacts
  }
}
```

These examples demonstrate real-world usage patterns for the Repository Evolution Tracking system, showing how it integrates with various agents and provides value throughout the development lifecycle.