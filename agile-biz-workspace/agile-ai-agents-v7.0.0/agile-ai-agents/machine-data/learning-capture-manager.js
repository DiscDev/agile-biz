/**
 * Learning Capture Manager
 * Automatically captures learnings at key milestones
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class LearningCaptureManager extends EventEmitter {
  constructor(projectRoot) {
    super();
    this.projectRoot = projectRoot;
    this.capturePointsPath = path.join(projectRoot, 'machine-data', 'learning-capture-points.json');
    this.learningsPath = path.join(projectRoot, 'machine-data', 'captured-learnings.json');
    this.initializeCapturePoints();
  }

  /**
   * Initialize capture points configuration
   */
  initializeCapturePoints() {
    if (!fs.existsSync(this.capturePointsPath)) {
      const defaultPoints = {
        sprint_end: {
          enabled: true,
          auto_trigger: true,
          capture_items: [
            'velocity_metrics',
            'completed_tasks',
            'blockers_resolved',
            'agent_performance',
            'coordination_patterns'
          ]
        },
        deployment: {
          enabled: true,
          auto_trigger: true,
          capture_items: [
            'deployment_time',
            'deployment_issues',
            'rollback_events',
            'performance_metrics'
          ]
        },
        feature_completion: {
          enabled: true,
          auto_trigger: false,
          capture_items: [
            'implementation_time',
            'bug_count',
            'test_coverage',
            'user_feedback'
          ]
        },
        production_launch: {
          enabled: true,
          auto_trigger: true,
          capture_items: [
            'launch_metrics',
            'initial_performance',
            'user_adoption',
            'error_rates'
          ]
        },
        pivot_event: {
          enabled: true,
          auto_trigger: false,
          capture_items: [
            'pivot_reason',
            'time_wasted',
            'lessons_learned',
            'new_direction'
          ]
        }
      };
      fs.writeFileSync(this.capturePointsPath, JSON.stringify(defaultPoints, null, 2));
    }

    if (!fs.existsSync(this.learningsPath)) {
      fs.writeFileSync(this.learningsPath, JSON.stringify({ learnings: [] }, null, 2));
    }
  }

  /**
   * Capture learning at sprint end
   */
  async captureSprintEnd(sprintData) {
    const learning = {
      id: this.generateLearningId(),
      type: 'sprint_end',
      timestamp: new Date().toISOString(),
      sprint_number: sprintData.sprint_number,
      data: {
        velocity: {
          planned: sprintData.planned_velocity,
          achieved: sprintData.achieved_velocity,
          improvement: this.calculateImprovement(sprintData)
        },
        agent_learnings: await this.extractAgentLearnings(sprintData),
        coordination_patterns: this.identifyCoordinationPatterns(sprintData),
        blockers: sprintData.blockers_resolved,
        recommendations: this.generateRecommendations(sprintData)
      },
      auto_captured: true
    };

    this.saveLearning(learning);
    this.emit('learning_captured', learning);
    return learning;
  }

  /**
   * Capture learning at deployment
   */
  async captureDeployment(deploymentData) {
    const learning = {
      id: this.generateLearningId(),
      type: 'deployment',
      timestamp: new Date().toISOString(),
      data: {
        deployment_time: deploymentData.duration,
        deployment_type: deploymentData.type,
        issues_encountered: deploymentData.issues || [],
        rollback_required: deploymentData.rollback || false,
        performance_impact: {
          before: deploymentData.metrics_before,
          after: deploymentData.metrics_after
        },
        lessons: this.extractDeploymentLessons(deploymentData)
      },
      auto_captured: true
    };

    this.saveLearning(learning);
    this.emit('learning_captured', learning);
    return learning;
  }

  /**
   * Capture learning at feature completion
   */
  async captureFeatureCompletion(featureData) {
    const learning = {
      id: this.generateLearningId(),
      type: 'feature_completion',
      timestamp: new Date().toISOString(),
      feature_name: featureData.name,
      data: {
        implementation_time: featureData.actual_time,
        estimated_time: featureData.estimated_time,
        accuracy: (featureData.estimated_time / featureData.actual_time * 100).toFixed(1) + '%',
        bugs_found: featureData.bug_count,
        test_coverage: featureData.test_coverage,
        agents_involved: featureData.agents,
        patterns_used: featureData.patterns || [],
        challenges: featureData.challenges || [],
        solutions: featureData.solutions || []
      },
      auto_captured: false
    };

    this.saveLearning(learning);
    this.emit('learning_captured', learning);
    return learning;
  }

  /**
   * Capture continuous learnings in real-time
   */
  captureContinuous(learningData) {
    const learning = {
      id: this.generateLearningId(),
      type: 'continuous',
      timestamp: new Date().toISOString(),
      agent: learningData.agent,
      category: learningData.category,
      data: {
        observation: learningData.observation,
        context: learningData.context,
        impact: learningData.impact,
        recommendation: learningData.recommendation
      },
      auto_captured: true
    };

    this.saveLearning(learning);
    this.emit('learning_captured', learning);
    return learning;
  }

  /**
   * Extract agent-specific learnings from sprint data
   */
  async extractAgentLearnings(sprintData) {
    const learnings = [];
    
    if (sprintData.agent_metrics) {
      for (const [agent, metrics] of Object.entries(sprintData.agent_metrics)) {
        if (metrics.notable_events || metrics.improvements) {
          learnings.push({
            agent,
            performance: metrics.performance_score || 'N/A',
            improvements: metrics.improvements || [],
            challenges: metrics.challenges || [],
            patterns: metrics.patterns_discovered || []
          });
        }
      }
    }

    return learnings;
  }

  /**
   * Identify coordination patterns from sprint data
   */
  identifyCoordinationPatterns(sprintData) {
    const patterns = [];
    
    if (sprintData.agent_interactions) {
      // Look for frequent interaction pairs
      const interactionCounts = {};
      
      sprintData.agent_interactions.forEach(interaction => {
        const key = `${interaction.from}-${interaction.to}`;
        interactionCounts[key] = (interactionCounts[key] || 0) + 1;
      });

      // Identify high-frequency patterns
      Object.entries(interactionCounts).forEach(([pair, count]) => {
        if (count > 5) {
          patterns.push({
            agents: pair.split('-'),
            frequency: count,
            type: 'high_coordination'
          });
        }
      });
    }

    return patterns;
  }

  /**
   * Extract deployment lessons
   */
  extractDeploymentLessons(deploymentData) {
    const lessons = [];

    if (deploymentData.rollback) {
      lessons.push({
        type: 'rollback',
        reason: deploymentData.rollback_reason,
        prevention: 'Implement better pre-deployment testing'
      });
    }

    if (deploymentData.duration > deploymentData.expected_duration * 1.5) {
      lessons.push({
        type: 'slow_deployment',
        reason: 'Deployment took 50% longer than expected',
        improvement: 'Optimize deployment pipeline'
      });
    }

    return lessons;
  }

  /**
   * Generate recommendations based on captured data
   */
  generateRecommendations(data) {
    const recommendations = [];

    // Velocity recommendations
    if (data.achieved_velocity < data.planned_velocity * 0.8) {
      recommendations.push({
        area: 'planning',
        recommendation: 'Reduce sprint scope or improve estimation accuracy',
        priority: 'high'
      });
    }

    // Blocker recommendations
    if (data.blockers_resolved && data.blockers_resolved.length > 3) {
      recommendations.push({
        area: 'coordination',
        recommendation: 'Implement better blocker prevention strategies',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Calculate improvement metrics
   */
  calculateImprovement(sprintData) {
    if (!sprintData.previous_velocity) return 'N/A';
    
    const improvement = ((sprintData.achieved_velocity - sprintData.previous_velocity) / 
                        sprintData.previous_velocity * 100).toFixed(1);
    
    return `${improvement}%`;
  }

  /**
   * Save learning to storage
   */
  saveLearning(learning) {
    const learnings = JSON.parse(fs.readFileSync(this.learningsPath, 'utf8'));
    learnings.learnings.push(learning);
    
    // Keep only last 1000 learnings
    if (learnings.learnings.length > 1000) {
      learnings.learnings = learnings.learnings.slice(-1000);
    }

    fs.writeFileSync(this.learningsPath, JSON.stringify(learnings, null, 2));
  }

  /**
   * Generate unique learning ID
   */
  generateLearningId() {
    return `LEARN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get learnings by type
   */
  getLearningsByType(type) {
    const learnings = JSON.parse(fs.readFileSync(this.learningsPath, 'utf8'));
    return learnings.learnings.filter(l => l.type === type);
  }

  /**
   * Get learnings by date range
   */
  getLearningsByDateRange(startDate, endDate) {
    const learnings = JSON.parse(fs.readFileSync(this.learningsPath, 'utf8'));
    return learnings.learnings.filter(l => {
      const learningDate = new Date(l.timestamp);
      return learningDate >= new Date(startDate) && learningDate <= new Date(endDate);
    });
  }

  /**
   * Generate learning summary
   */
  generateSummary() {
    const learnings = JSON.parse(fs.readFileSync(this.learningsPath, 'utf8'));
    const summary = {
      total_learnings: learnings.learnings.length,
      by_type: {},
      recent_learnings: learnings.learnings.slice(-10),
      high_impact_learnings: []
    };

    // Count by type
    learnings.learnings.forEach(l => {
      summary.by_type[l.type] = (summary.by_type[l.type] || 0) + 1;
    });

    // Find high impact learnings
    summary.high_impact_learnings = learnings.learnings
      .filter(l => l.data.impact === 'high' || l.data.velocity?.improvement > 20)
      .slice(-5);

    return summary;
  }
}

module.exports = LearningCaptureManager;

// CLI interface
if (require.main === module) {
  const manager = new LearningCaptureManager(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'summary':
      const summary = manager.generateSummary();
      console.log('📊 Learning Capture Summary');
      console.log('=========================');
      console.log(`Total Learnings: ${summary.total_learnings}`);
      console.log('\nBy Type:');
      Object.entries(summary.by_type).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      console.log('\nRecent High-Impact Learnings:');
      summary.high_impact_learnings.forEach(l => {
        console.log(`  - ${l.type} (${l.timestamp}): ${l.id}`);
      });
      break;

    case 'capture':
      console.log('Use this manager programmatically to capture learnings at milestones');
      break;

    default:
      console.log('Commands: summary, capture');
  }
}