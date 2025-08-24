/**
 * Self-Improvement Manager
 * Enables agents to self-improve in external AgileAiAgents systems
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class SelfImprovementManager extends EventEmitter {
  constructor(projectRoot) {
    super();
    this.projectRoot = projectRoot;
    this.improvementLogPath = path.join(projectRoot, 'machine-data', 'self-improvements.json');
    this.proposalsPath = path.join(projectRoot, 'machine-data', 'improvement-proposals.json');
    this.initializeStorage();
  }

  /**
   * Initialize storage files
   */
  initializeStorage() {
    if (!fs.existsSync(this.improvementLogPath)) {
      fs.writeFileSync(this.improvementLogPath, JSON.stringify({
        improvements: [],
        statistics: {
          total_proposals: 0,
          accepted_proposals: 0,
          successful_implementations: 0,
          failed_implementations: 0
        }
      }, null, 2));
    }

    if (!fs.existsSync(this.proposalsPath)) {
      fs.writeFileSync(this.proposalsPath, JSON.stringify({
        pending: [],
        approved: [],
        rejected: []
      }, null, 2));
    }
  }

  /**
   * Agent proposes self-improvement
   */
  proposeImprovement(proposal) {
    const enhancedProposal = {
      id: this.generateProposalId(),
      timestamp: new Date().toISOString(),
      agent: proposal.agent,
      type: proposal.type || 'optimization',
      trigger: proposal.trigger,
      description: proposal.description,
      current_behavior: proposal.current_behavior,
      proposed_change: proposal.proposed_change,
      expected_impact: proposal.expected_impact,
      confidence_score: this.calculateProposalConfidence(proposal),
      risk_assessment: this.assessRisk(proposal),
      status: 'pending',
      validation_required: true
    };

    // Save proposal
    const proposals = JSON.parse(fs.readFileSync(this.proposalsPath, 'utf8'));
    proposals.pending.push(enhancedProposal);
    fs.writeFileSync(this.proposalsPath, JSON.stringify(proposals, null, 2));

    // Update statistics
    this.updateStatistics('total_proposals', 1);

    // Emit event for Learning Analysis Agent
    this.emit('improvement_proposed', enhancedProposal);

    return enhancedProposal;
  }

  /**
   * Calculate confidence score for proposal
   */
  calculateProposalConfidence(proposal) {
    let score = 0.5; // Base score

    // Evidence-based factors
    if (proposal.evidence) {
      if (proposal.evidence.error_count > 5) score += 0.2;
      if (proposal.evidence.success_rate < 0.5) score += 0.15;
      if (proposal.evidence.user_feedback) score += 0.1;
    }

    // Pattern recognition
    if (proposal.pattern_frequency > 10) score += 0.15;
    if (proposal.similar_successes > 3) score += 0.2;

    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Assess risk of proposed improvement
   */
  assessRisk(proposal) {
    const risk = {
      level: 'low',
      factors: [],
      mitigation: []
    };

    // Check change scope
    if (proposal.proposed_change.includes('major') || 
        proposal.proposed_change.includes('refactor')) {
      risk.level = 'high';
      risk.factors.push('Large scope change');
      risk.mitigation.push('Implement in phases');
    }

    // Check critical paths
    if (proposal.agent.includes('security') || 
        proposal.agent.includes('devops')) {
      risk.level = risk.level === 'high' ? 'high' : 'medium';
      risk.factors.push('Critical system component');
      risk.mitigation.push('Extra validation required');
    }

    // Check dependencies
    if (proposal.affects_other_agents) {
      risk.level = risk.level === 'low' ? 'medium' : risk.level;
      risk.factors.push('Cross-agent dependencies');
      risk.mitigation.push('Coordinate with affected agents');
    }

    return risk;
  }

  /**
   * Learning Analysis Agent validates proposal
   */
  validateProposal(proposalId, validation) {
    const proposals = JSON.parse(fs.readFileSync(this.proposalsPath, 'utf8'));
    const proposalIndex = proposals.pending.findIndex(p => p.id === proposalId);
    
    if (proposalIndex === -1) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const proposal = proposals.pending[proposalIndex];
    proposal.validation = {
      timestamp: new Date().toISOString(),
      approved: validation.approved,
      reason: validation.reason,
      modifications: validation.modifications || [],
      implementation_priority: validation.priority || 'medium'
    };

    // Move to appropriate array
    proposals.pending.splice(proposalIndex, 1);
    if (validation.approved) {
      proposal.status = 'approved';
      proposals.approved.push(proposal);
      this.updateStatistics('accepted_proposals', 1);
    } else {
      proposal.status = 'rejected';
      proposals.rejected.push(proposal);
    }

    fs.writeFileSync(this.proposalsPath, JSON.stringify(proposals, null, 2));

    // Emit event for implementation
    if (validation.approved) {
      this.emit('proposal_approved', proposal);
    }

    return proposal;
  }

  /**
   * Implement approved improvement
   */
  async implementImprovement(proposalId) {
    const proposals = JSON.parse(fs.readFileSync(this.proposalsPath, 'utf8'));
    const proposal = proposals.approved.find(p => p.id === proposalId);
    
    if (!proposal) {
      throw new Error(`Approved proposal ${proposalId} not found`);
    }

    const implementation = {
      id: this.generateImplementationId(),
      proposal_id: proposalId,
      agent: proposal.agent,
      started: new Date().toISOString(),
      changes: [],
      metrics_before: await this.captureMetrics(proposal.agent),
      status: 'in_progress'
    };

    try {
      // Simulate implementation (in real system, this would update agent files)
      implementation.changes = await this.applyChanges(proposal);
      implementation.completed = new Date().toISOString();
      implementation.status = 'completed';
      
      // Capture post-implementation metrics
      implementation.metrics_after = await this.captureMetrics(proposal.agent);
      
      // Calculate success
      implementation.success_metrics = this.calculateSuccess(
        implementation.metrics_before,
        implementation.metrics_after,
        proposal.expected_impact
      );

      // Log implementation
      this.logImplementation(implementation);

      // Update version if successful
      if (implementation.success_metrics.success_rate > 0.7) {
        this.emit('update_agent_version', {
          agent: proposal.agent,
          improvement: {
            source: `self-improvement-${proposalId}`,
            changes: proposal.description,
            impact: implementation.success_metrics.summary
          }
        });
        this.updateStatistics('successful_implementations', 1);
      } else {
        this.updateStatistics('failed_implementations', 1);
      }

    } catch (error) {
      implementation.status = 'failed';
      implementation.error = error.message;
      implementation.completed = new Date().toISOString();
      this.logImplementation(implementation);
      this.updateStatistics('failed_implementations', 1);
    }

    return implementation;
  }

  /**
   * Apply changes from proposal
   */
  async applyChanges(proposal) {
    // In real implementation, this would modify agent files
    // For now, simulate changes
    const changes = [
      {
        type: 'behavior_update',
        location: `${proposal.agent}.md`,
        description: proposal.proposed_change,
        timestamp: new Date().toISOString()
      }
    ];

    if (proposal.validation.modifications.length > 0) {
      proposal.validation.modifications.forEach(mod => {
        changes.push({
          type: 'modification',
          description: mod,
          timestamp: new Date().toISOString()
        });
      });
    }

    return changes;
  }

  /**
   * Capture metrics for an agent
   */
  async captureMetrics(agent) {
    // In real implementation, would capture actual metrics
    // For now, return simulated metrics
    return {
      performance: {
        response_time: Math.random() * 1000,
        token_usage: Math.floor(Math.random() * 10000),
        error_rate: Math.random() * 0.1
      },
      quality: {
        task_success_rate: 0.8 + Math.random() * 0.2,
        user_satisfaction: 0.7 + Math.random() * 0.3
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate implementation success
   */
  calculateSuccess(before, after, expected) {
    const metrics = {
      performance_improvement: 
        ((before.performance.response_time - after.performance.response_time) / 
         before.performance.response_time * 100).toFixed(1),
      token_reduction:
        ((before.performance.token_usage - after.performance.token_usage) / 
         before.performance.token_usage * 100).toFixed(1),
      error_reduction:
        ((before.performance.error_rate - after.performance.error_rate) / 
         before.performance.error_rate * 100).toFixed(1),
      quality_improvement:
        ((after.quality.task_success_rate - before.quality.task_success_rate) / 
         before.quality.task_success_rate * 100).toFixed(1)
    };

    // Calculate overall success rate
    const improvements = Object.values(metrics).filter(v => parseFloat(v) > 0).length;
    const success_rate = improvements / Object.keys(metrics).length;

    return {
      ...metrics,
      success_rate,
      meets_expectations: success_rate > 0.5,
      summary: `${improvements} of ${Object.keys(metrics).length} metrics improved`
    };
  }

  /**
   * Log implementation details
   */
  logImplementation(implementation) {
    const log = JSON.parse(fs.readFileSync(this.improvementLogPath, 'utf8'));
    log.improvements.push(implementation);
    
    // Keep last 100 implementations
    if (log.improvements.length > 100) {
      log.improvements = log.improvements.slice(-100);
    }

    fs.writeFileSync(this.improvementLogPath, JSON.stringify(log, null, 2));
  }

  /**
   * Update statistics
   */
  updateStatistics(field, increment) {
    const log = JSON.parse(fs.readFileSync(this.improvementLogPath, 'utf8'));
    log.statistics[field] += increment;
    fs.writeFileSync(this.improvementLogPath, JSON.stringify(log, null, 2));
  }

  /**
   * Track improvement patterns
   */
  getImprovementPatterns() {
    const log = JSON.parse(fs.readFileSync(this.improvementLogPath, 'utf8'));
    const patterns = {
      by_agent: {},
      by_type: {},
      success_patterns: [],
      failure_patterns: []
    };

    log.improvements.forEach(impl => {
      // By agent
      patterns.by_agent[impl.agent] = patterns.by_agent[impl.agent] || {
        total: 0,
        successful: 0
      };
      patterns.by_agent[impl.agent].total++;
      if (impl.status === 'completed' && impl.success_metrics?.success_rate > 0.7) {
        patterns.by_agent[impl.agent].successful++;
      }

      // Success/failure patterns
      if (impl.success_metrics?.success_rate > 0.8) {
        patterns.success_patterns.push({
          agent: impl.agent,
          type: impl.type,
          impact: impl.success_metrics.summary
        });
      } else if (impl.success_metrics?.success_rate < 0.3) {
        patterns.failure_patterns.push({
          agent: impl.agent,
          type: impl.type,
          reason: impl.error || 'Low success rate'
        });
      }
    });

    return patterns;
  }

  /**
   * Generate improvement report
   */
  generateReport() {
    const log = JSON.parse(fs.readFileSync(this.improvementLogPath, 'utf8'));
    const proposals = JSON.parse(fs.readFileSync(this.proposalsPath, 'utf8'));
    const patterns = this.getImprovementPatterns();

    return {
      summary: {
        total_proposals: log.statistics.total_proposals,
        acceptance_rate: (log.statistics.accepted_proposals / log.statistics.total_proposals * 100).toFixed(1) + '%',
        success_rate: (log.statistics.successful_implementations / log.statistics.accepted_proposals * 100).toFixed(1) + '%',
        pending_proposals: proposals.pending.length
      },
      patterns,
      recent_improvements: log.improvements.slice(-5).map(impl => ({
        agent: impl.agent,
        date: impl.completed,
        success: impl.success_metrics?.success_rate > 0.7,
        impact: impl.success_metrics?.summary
      })),
      recommendations: this.generateRecommendations(patterns)
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(patterns) {
    const recommendations = [];

    // Agent-specific recommendations
    Object.entries(patterns.by_agent).forEach(([agent, stats]) => {
      const successRate = stats.successful / stats.total;
      if (successRate < 0.5 && stats.total > 3) {
        recommendations.push({
          type: 'agent_improvement',
          agent,
          message: `${agent} has low improvement success rate (${(successRate * 100).toFixed(1)}%)`,
          action: 'Review proposal quality and validation criteria'
        });
      }
    });

    // Pattern-based recommendations
    if (patterns.failure_patterns.length > patterns.success_patterns.length) {
      recommendations.push({
        type: 'system_improvement',
        message: 'More failures than successes in self-improvement',
        action: 'Strengthen proposal validation and testing'
      });
    }

    return recommendations;
  }

  /**
   * Generate IDs
   */
  generateProposalId() {
    return `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateImplementationId() {
    return `IMPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = SelfImprovementManager;

// CLI interface
if (require.main === module) {
  const manager = new SelfImprovementManager(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      const report = manager.generateReport();
      console.log('📊 Self-Improvement Report');
      console.log('=========================');
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'propose':
      // Example proposal
      const proposal = manager.proposeImprovement({
        agent: 'testing_agent',
        type: 'optimization',
        trigger: 'Repeated timeout errors in browser tests',
        description: 'Implement parallel browser test execution',
        current_behavior: 'Tests run sequentially',
        proposed_change: 'Run tests in parallel with max 4 workers',
        expected_impact: '50% reduction in test execution time',
        evidence: {
          error_count: 12,
          success_rate: 0.6
        }
      });
      console.log('✅ Proposal created:', proposal.id);
      break;

    default:
      console.log('Commands: report, propose');
  }
}