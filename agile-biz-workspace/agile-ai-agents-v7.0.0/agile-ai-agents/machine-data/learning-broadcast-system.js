/**
 * Learning Broadcast System
 * Enables agents to share learnings automatically
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class LearningBroadcastSystem extends EventEmitter {
  constructor(projectRoot) {
    super();
    this.projectRoot = projectRoot;
    this.broadcastLogPath = path.join(projectRoot, 'machine-data', 'broadcast-log.json');
    this.subscriptionsPath = path.join(projectRoot, 'machine-data', 'agent-subscriptions.json');
    this.learningNetworkPath = path.join(projectRoot, 'machine-data', 'learning-network.json');
    this.initializeSystem();
  }

  /**
   * Initialize broadcast system
   */
  initializeSystem() {
    if (!fs.existsSync(this.broadcastLogPath)) {
      fs.writeFileSync(this.broadcastLogPath, JSON.stringify({
        broadcasts: [],
        statistics: {
          total_broadcasts: 0,
          successful_adoptions: 0,
          failed_adoptions: 0,
          pending_evaluations: 0
        }
      }, null, 2));
    }

    if (!fs.existsSync(this.subscriptionsPath)) {
      // Default agent subscriptions based on domain relationships
      const defaultSubscriptions = {
        coder_agent: {
          subscribes_to: ['testing_agent', 'security_agent', 'devops_agent', 'api_agent'],
          learning_interests: ['patterns', 'optimization', 'technology']
        },
        testing_agent: {
          subscribes_to: ['coder_agent', 'security_agent', 'ui_ux_agent'],
          learning_interests: ['bug_fix', 'patterns', 'recovery']
        },
        security_agent: {
          subscribes_to: ['coder_agent', 'devops_agent', 'testing_agent'],
          learning_interests: ['anti_pattern', 'recovery', 'technology']
        },
        devops_agent: {
          subscribes_to: ['coder_agent', 'security_agent', 'testing_agent'],
          learning_interests: ['optimization', 'recovery', 'technology']
        },
        ui_ux_agent: {
          subscribes_to: ['coder_agent', 'testing_agent'],
          learning_interests: ['patterns', 'optimization']
        },
        project_manager_agent: {
          subscribes_to: ['all'],
          learning_interests: ['all']
        },
        api_agent: {
          subscribes_to: ['coder_agent', 'security_agent'],
          learning_interests: ['patterns', 'optimization', 'technology']
        },
        ml_agent: {
          subscribes_to: ['coder_agent', 'data_engineer_agent'],
          learning_interests: ['patterns', 'optimization', 'technology']
        }
      };
      fs.writeFileSync(this.subscriptionsPath, JSON.stringify(defaultSubscriptions, null, 2));
    }

    if (!fs.existsSync(this.learningNetworkPath)) {
      fs.writeFileSync(this.learningNetworkPath, JSON.stringify({
        nodes: [],
        edges: [],
        clusters: []
      }, null, 2));
    }
  }

  /**
   * Broadcast a learning to relevant agents
   */
  broadcastLearning(learning) {
    const broadcast = {
      id: this.generateBroadcastId(),
      timestamp: new Date().toISOString(),
      source_agent: learning.source_agent,
      learning_type: learning.type,
      category: learning.category,
      description: learning.description,
      confidence: learning.confidence || 0.8,
      applicable_to: this.determineApplicableAgents(learning),
      content: learning,
      adoption_status: {},
      metrics: {
        sent_to: 0,
        evaluated: 0,
        adopted: 0,
        rejected: 0
      }
    };

    // Determine recipients
    const recipients = this.getRecipients(broadcast);
    broadcast.recipients = recipients;
    broadcast.metrics.sent_to = recipients.length;

    // Log broadcast
    this.logBroadcast(broadcast);

    // Send to each recipient
    recipients.forEach(agent => {
      this.sendToAgent(agent, broadcast);
    });

    // Update statistics
    this.updateStatistics('total_broadcasts', 1);

    // Emit event
    this.emit('learning_broadcast', broadcast);

    return broadcast;
  }

  /**
   * Determine which agents could benefit from this learning
   */
  determineApplicableAgents(learning) {
    const applicable = [];
    const subscriptions = JSON.parse(fs.readFileSync(this.subscriptionsPath, 'utf8'));

    // Check based on learning category and agent interests
    Object.entries(subscriptions).forEach(([agent, config]) => {
      if (agent === learning.source_agent) return; // Don't send to self

      // Check if agent is interested in this type of learning
      if (config.learning_interests.includes('all') || 
          config.learning_interests.includes(learning.category)) {
        
        // Calculate relevance score
        const relevance = this.calculateRelevance(learning, agent, config);
        if (relevance > 0.6) {
          applicable.push({
            agent,
            relevance,
            reason: this.getRelevanceReason(learning, config)
          });
        }
      }
    });

    // Sort by relevance
    return applicable.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calculate relevance score for an agent
   */
  calculateRelevance(learning, agentName, agentConfig) {
    let score = 0;

    // Category match
    if (agentConfig.learning_interests.includes(learning.category)) {
      score += 0.4;
    }

    // Domain similarity
    if (this.areDomainsSimilar(learning.source_agent, agentName)) {
      score += 0.3;
    }

    // Historical success rate
    const history = this.getAdoptionHistory(agentName, learning.source_agent);
    if (history.success_rate > 0.7) {
      score += 0.2;
    }

    // Confidence factor
    score += (learning.confidence || 0.8) * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Check if two agents have similar domains
   */
  areDomainsSimilar(agent1, agent2) {
    const domainGroups = {
      development: ['coder_agent', 'testing_agent', 'ui_ux_agent'],
      infrastructure: ['devops_agent', 'security_agent', 'dba_agent'],
      data: ['ml_agent', 'data_engineer_agent', 'analytics_agent'],
      business: ['project_manager_agent', 'finance_agent', 'marketing_agent']
    };

    for (const group of Object.values(domainGroups)) {
      if (group.includes(agent1) && group.includes(agent2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get historical adoption success between agents
   */
  getAdoptionHistory(recipient, source) {
    const log = JSON.parse(fs.readFileSync(this.broadcastLogPath, 'utf8'));
    const relevant = log.broadcasts.filter(b => 
      b.source_agent === source && 
      b.adoption_status[recipient]
    );

    if (relevant.length === 0) {
      return { success_rate: 0.5, total: 0 }; // Default neutral
    }

    const successful = relevant.filter(b => 
      b.adoption_status[recipient].adopted
    ).length;

    return {
      success_rate: successful / relevant.length,
      total: relevant.length
    };
  }

  /**
   * Get relevance reason for transparency
   */
  getRelevanceReason(learning, config) {
    const reasons = [];
    
    if (config.learning_interests.includes(learning.category)) {
      reasons.push(`Interested in ${learning.category}`);
    }
    
    if (learning.confidence > 0.8) {
      reasons.push('High confidence learning');
    }

    return reasons.join(', ');
  }

  /**
   * Get recipients for a broadcast
   */
  getRecipients(broadcast) {
    const subscriptions = JSON.parse(fs.readFileSync(this.subscriptionsPath, 'utf8'));
    const recipients = [];

    // Get explicitly subscribed agents
    Object.entries(subscriptions).forEach(([agent, config]) => {
      if (agent === broadcast.source_agent) return;

      if (config.subscribes_to.includes('all') || 
          config.subscribes_to.includes(broadcast.source_agent)) {
        recipients.push(agent);
      }
    });

    // Add agents from applicable_to list
    broadcast.applicable_to.forEach(item => {
      if (!recipients.includes(item.agent)) {
        recipients.push(item.agent);
      }
    });

    return recipients;
  }

  /**
   * Send broadcast to specific agent
   */
  sendToAgent(agent, broadcast) {
    // In real implementation, this would trigger agent evaluation
    // For now, simulate by emitting event
    this.emit('learning_received', {
      recipient: agent,
      broadcast: broadcast
    });

    // Simulate evaluation delay
    setTimeout(() => {
      this.evaluateLearning(agent, broadcast.id);
    }, Math.random() * 5000 + 1000); // 1-6 seconds
  }

  /**
   * Agent evaluates received learning
   */
  evaluateLearning(agent, broadcastId) {
    const log = JSON.parse(fs.readFileSync(this.broadcastLogPath, 'utf8'));
    const broadcast = log.broadcasts.find(b => b.id === broadcastId);
    
    if (!broadcast) return;

    // Simulate evaluation logic
    const relevance = broadcast.applicable_to.find(a => a.agent === agent)?.relevance || 0.5;
    const randomFactor = Math.random() * 0.2; // Add some randomness
    const adoptionScore = relevance + randomFactor;

    const evaluation = {
      timestamp: new Date().toISOString(),
      evaluated: true,
      adopted: adoptionScore > 0.7,
      confidence: adoptionScore,
      reason: adoptionScore > 0.7 ? 'High relevance to current patterns' : 'Low relevance',
      adaptation: adoptionScore > 0.7 ? this.generateAdaptation(broadcast.content, agent) : null
    };

    // Update broadcast record
    broadcast.adoption_status[agent] = evaluation;
    broadcast.metrics.evaluated++;
    if (evaluation.adopted) {
      broadcast.metrics.adopted++;
      this.updateStatistics('successful_adoptions', 1);
    } else {
      broadcast.metrics.rejected++;
    }

    // Save updated log
    fs.writeFileSync(this.broadcastLogPath, JSON.stringify(log, null, 2));

    // Update learning network
    if (evaluation.adopted) {
      this.updateLearningNetwork(broadcast.source_agent, agent, broadcast);
    }

    // Emit adoption event
    this.emit('learning_evaluated', {
      agent,
      broadcastId,
      evaluation
    });

    return evaluation;
  }

  /**
   * Generate adapted version of learning for specific agent
   */
  generateAdaptation(learning, agent) {
    return {
      original_learning: learning.description,
      adapted_for: agent,
      modifications: [
        `Adjusted for ${agent} context`,
        'Applied domain-specific constraints',
        'Integrated with existing patterns'
      ],
      implementation_notes: `Implement within ${agent} workflow patterns`
    };
  }

  /**
   * Update learning network graph
   */
  updateLearningNetwork(source, target, broadcast) {
    const network = JSON.parse(fs.readFileSync(this.learningNetworkPath, 'utf8'));
    
    // Add or update nodes
    if (!network.nodes.find(n => n.id === source)) {
      network.nodes.push({ id: source, adoptions_sent: 0, adoptions_received: 0 });
    }
    if (!network.nodes.find(n => n.id === target)) {
      network.nodes.push({ id: target, adoptions_sent: 0, adoptions_received: 0 });
    }

    // Update node statistics
    const sourceNode = network.nodes.find(n => n.id === source);
    const targetNode = network.nodes.find(n => n.id === target);
    sourceNode.adoptions_sent++;
    targetNode.adoptions_received++;

    // Add or update edge
    let edge = network.edges.find(e => e.source === source && e.target === target);
    if (!edge) {
      edge = { source, target, weight: 0, learnings: [] };
      network.edges.push(edge);
    }
    edge.weight++;
    edge.learnings.push({
      broadcastId: broadcast.id,
      category: broadcast.category,
      timestamp: broadcast.timestamp
    });

    // Update clusters (agents that frequently share learnings)
    this.updateClusters(network);

    fs.writeFileSync(this.learningNetworkPath, JSON.stringify(network, null, 2));
  }

  /**
   * Update agent clusters based on learning patterns
   */
  updateClusters(network) {
    // Simple clustering: agents with high mutual learning exchange
    const clusters = [];
    const threshold = 3; // Minimum exchanges to form cluster

    network.edges.forEach(edge => {
      // Check for bidirectional high-weight edges
      const reverseEdge = network.edges.find(e => 
        e.source === edge.target && 
        e.target === edge.source
      );

      if (reverseEdge && edge.weight >= threshold && reverseEdge.weight >= threshold) {
        // Check if cluster already exists
        let cluster = clusters.find(c => 
          c.agents.includes(edge.source) || c.agents.includes(edge.target)
        );

        if (!cluster) {
          clusters.push({
            id: `cluster-${clusters.length + 1}`,
            agents: [edge.source, edge.target],
            strength: (edge.weight + reverseEdge.weight) / 2
          });
        } else if (!cluster.agents.includes(edge.source)) {
          cluster.agents.push(edge.source);
        } else if (!cluster.agents.includes(edge.target)) {
          cluster.agents.push(edge.target);
        }
      }
    });

    network.clusters = clusters;
  }

  /**
   * Log broadcast
   */
  logBroadcast(broadcast) {
    const log = JSON.parse(fs.readFileSync(this.broadcastLogPath, 'utf8'));
    log.broadcasts.push(broadcast);
    
    // Keep last 500 broadcasts
    if (log.broadcasts.length > 500) {
      log.broadcasts = log.broadcasts.slice(-500);
    }

    fs.writeFileSync(this.broadcastLogPath, JSON.stringify(log, null, 2));
  }

  /**
   * Update statistics
   */
  updateStatistics(field, increment) {
    const log = JSON.parse(fs.readFileSync(this.broadcastLogPath, 'utf8'));
    log.statistics[field] += increment;
    fs.writeFileSync(this.broadcastLogPath, JSON.stringify(log, null, 2));
  }

  /**
   * Get broadcast effectiveness report
   */
  getEffectivenessReport() {
    const log = JSON.parse(fs.readFileSync(this.broadcastLogPath, 'utf8'));
    const network = JSON.parse(fs.readFileSync(this.learningNetworkPath, 'utf8'));

    const report = {
      overall_statistics: log.statistics,
      adoption_rate: (log.statistics.successful_adoptions / 
                     log.statistics.total_broadcasts * 100).toFixed(1) + '%',
      most_influential_agents: this.getMostInfluentialAgents(network),
      strongest_connections: this.getStrongestConnections(network),
      learning_clusters: network.clusters,
      recent_broadcasts: log.broadcasts.slice(-10).map(b => ({
        id: b.id,
        source: b.source_agent,
        category: b.category,
        adoption_rate: (b.metrics.adopted / b.metrics.sent_to * 100).toFixed(1) + '%'
      }))
    };

    return report;
  }

  /**
   * Get most influential agents (highest adoption rates)
   */
  getMostInfluentialAgents(network) {
    return network.nodes
      .sort((a, b) => b.adoptions_sent - a.adoptions_sent)
      .slice(0, 5)
      .map(node => ({
        agent: node.id,
        learnings_shared: node.adoptions_sent,
        learnings_adopted: node.adoptions_received
      }));
  }

  /**
   * Get strongest learning connections
   */
  getStrongestConnections(network) {
    return network.edges
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .map(edge => ({
        from: edge.source,
        to: edge.target,
        shared_learnings: edge.weight,
        categories: [...new Set(edge.learnings.map(l => l.category))]
      }));
  }

  /**
   * Generate broadcast ID
   */
  generateBroadcastId() {
    return `BCAST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = LearningBroadcastSystem;

// CLI interface
if (require.main === module) {
  const broadcaster = new LearningBroadcastSystem(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      const report = broadcaster.getEffectivenessReport();
      console.log('📡 Learning Broadcast Report');
      console.log('===========================');
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'broadcast':
      // Example broadcast
      const learning = {
        source_agent: 'coder_agent',
        type: 'pattern',
        category: 'optimization',
        description: 'React 18 concurrent rendering optimization',
        confidence: 0.9,
        details: 'Use startTransition for non-urgent updates'
      };
      const broadcast = broadcaster.broadcastLearning(learning);
      console.log(`✅ Broadcast sent: ${broadcast.id}`);
      console.log(`📡 Sent to ${broadcast.metrics.sent_to} agents`);
      break;

    default:
      console.log('Commands: report, broadcast');
  }
}