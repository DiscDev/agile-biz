/**
 * Streaming Infrastructure for AgileAiAgents JSON Context Optimization
 * Handles real-time communication between agents using JSON Lines (.jsonl) format
 */

const fs = require('fs');
const path = require('path');

class StreamingInfrastructure {
  constructor(projectDocumentsPath = 'project-documents-json') {
    this.basePath = path.join(__dirname, projectDocumentsPath);
    this.streamsPath = path.join(this.basePath, 'streams');
    this.dashboardStreamsPath = path.join(this.basePath, 'orchestration', 'streams');
    this.ensureDirectories();
  }

  ensureDirectories() {
    // Ensure base streams directory exists
    if (!fs.existsSync(this.streamsPath)) {
      fs.mkdirSync(this.streamsPath, { recursive: true });
    }
    
    // Ensure dashboard streams directory exists
    if (!fs.existsSync(this.dashboardStreamsPath)) {
      fs.mkdirSync(this.dashboardStreamsPath, { recursive: true });
    }
  }

  /**
   * Generate timestamp-based filename for streams
   */
  generateStreamFilename(prefix = 'stream') {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace(/:/g, '-');
    return `${prefix}-${timestamp}.jsonl`;
  }

  /**
   * Write streaming event to appropriate stream file
   */
  writeEvent(event, targetAgent = null, streamType = 'general') {
    const timestamp = new Date().toISOString();
    const eventWithTimestamp = {
      ...event,
      timestamp,
      stream_type: streamType
    };

    // Write to general streams
    const generalStreamFile = path.join(this.streamsPath, this.generateStreamFilename('events'));
    this.appendToStreamFile(generalStreamFile, eventWithTimestamp);

    // Write to dashboard streams for real-time monitoring
    const dashboardStreamFile = path.join(this.dashboardStreamsPath, this.generateStreamFilename('dashboard'));
    this.appendToStreamFile(dashboardStreamFile, eventWithTimestamp);

    // Write to agent-specific streams if target specified
    if (targetAgent) {
      const agentStreamFile = path.join(this.streamsPath, this.generateStreamFilename(targetAgent));
      this.appendToStreamFile(agentStreamFile, eventWithTimestamp);
    }

    console.log(`📡 Stream event: ${event.event} → ${targetAgent || 'all'}`);
  }

  /**
   * Append event to stream file (JSONL format)
   */
  appendToStreamFile(filePath, event) {
    const eventLine = JSON.stringify(event) + '\n';
    fs.appendFileSync(filePath, eventLine);
  }

  /**
   * Read latest events from stream file
   */
  readLatestEvents(streamFile, maxEvents = 100) {
    if (!fs.existsSync(streamFile)) {
      return [];
    }

    const content = fs.readFileSync(streamFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);
    
    // Return latest events (last N lines)
    const latestLines = lines.slice(-maxEvents);
    return latestLines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error('Error parsing stream event:', e);
        return null;
      }
    }).filter(event => event !== null);
  }

  /**
   * Agent Progress Update Stream
   * All Agents → Project Manager
   */
  streamProgressUpdate(fromAgent, progressData) {
    const event = {
      event: 'progress_update',
      from_agent: fromAgent,
      to_agent: 'project_manager_agent',
      data: {
        task_completed: progressData.taskCompleted || null,
        progress_percentage: progressData.progressPercentage || null,
        current_phase: progressData.currentPhase || null,
        eta: progressData.eta || null,
        blockers: progressData.blockers || [],
        achievements: progressData.achievements || []
      }
    };

    this.writeEvent(event, 'project_manager_agent', 'progress_update');
  }

  /**
   * Dashboard Real-time Update Stream
   * All Agents → Dashboard
   */
  streamDashboardUpdate(fromAgent, updateType, updateData) {
    const event = {
      event: 'dashboard_update',
      from_agent: fromAgent,
      to_agent: 'project_dashboard_agent',
      update_type: updateType, // 'document_created', 'agent_status', 'milestone_achieved', etc.
      data: updateData
    };

    this.writeEvent(event, 'project_dashboard_agent', 'dashboard_update');
  }

  /**
   * Incremental Testing Stream
   * Coder Agent → Testing Agent
   */
  streamIncrementalTesting(codeChanges, testScope = 'affected') {
    const event = {
      event: 'incremental_test_request',
      from_agent: 'coder_agent',
      to_agent: 'testing_agent',
      data: {
        changed_files: codeChanges.changedFiles || [],
        test_scope: testScope,
        priority: codeChanges.priority || 'normal',
        branch: codeChanges.branch || 'main',
        commit_hash: codeChanges.commitHash || null
      }
    };

    this.writeEvent(event, 'testing_agent', 'incremental_testing');
  }

  /**
   * Cross-Agent Coordination Stream
   */
  streamCoordinationEvent(fromAgent, toAgent, coordinationType, coordinationData) {
    const event = {
      event: 'agent_coordination',
      from_agent: fromAgent,
      to_agent: toAgent,
      coordination_type: coordinationType, // 'handoff', 'request', 'notification', 'approval'
      data: coordinationData
    };

    this.writeEvent(event, toAgent, 'coordination');
  }

  /**
   * Error and Alert Stream
   */
  streamAlert(fromAgent, alertType, alertData) {
    const event = {
      event: 'alert',
      from_agent: fromAgent,
      alert_type: alertType, // 'error', 'warning', 'critical', 'info'
      data: {
        message: alertData.message,
        severity: alertData.severity || 'medium',
        requires_action: alertData.requiresAction || false,
        recommended_actions: alertData.recommendedActions || [],
        context: alertData.context || {}
      }
    };

    this.writeEvent(event, 'project_manager_agent', 'alert');
  }

  /**
   * Performance Metrics Stream
   */
  streamPerformanceMetric(fromAgent, metricType, metricData) {
    const event = {
      event: 'performance_metric',
      from_agent: fromAgent,
      metric_type: metricType, // 'context_usage', 'generation_time', 'cache_hit_rate', etc.
      data: {
        value: metricData.value,
        unit: metricData.unit || null,
        context: metricData.context || {},
        threshold_status: metricData.thresholdStatus || 'normal' // 'normal', 'warning', 'critical'
      }
    };

    this.writeEvent(event, 'optimization_agent', 'performance');
  }

  /**
   * Stakeholder Decision Stream
   */
  streamStakeholderDecision(requiredDecision, decisionData) {
    const event = {
      event: 'stakeholder_decision_required',
      from_agent: 'project_manager_agent',
      to_agent: 'project_dashboard_agent',
      decision_type: requiredDecision.type, // 'approval', 'choice', 'feedback', 'priority'
      data: {
        title: decisionData.title,
        description: decisionData.description,
        options: decisionData.options || [],
        deadline: decisionData.deadline || null,
        urgency: decisionData.urgency || 'medium',
        context_documents: decisionData.contextDocuments || []
      }
    };

    this.writeEvent(event, 'project_dashboard_agent', 'stakeholder_decision');
  }

  /**
   * JSON Context Optimization Stream
   */
  streamContextOptimization(fromAgent, optimizationData) {
    const event = {
      event: 'context_optimization',
      from_agent: fromAgent,
      data: {
        original_size: optimizationData.originalSize,
        optimized_size: optimizationData.optimizedSize,
        reduction_percentage: optimizationData.reductionPercentage,
        query_path: optimizationData.queryPath || null,
        cache_hit: optimizationData.cacheHit || false,
        performance_gain: optimizationData.performanceGain || null
      }
    };

    this.writeEvent(event, 'document_manager_agent', 'context_optimization');
  }

  /**
   * Clean up old stream files (keep last 30 days)
   */
  cleanupOldStreams(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    [this.streamsPath, this.dashboardStreamsPath].forEach(dirPath => {
      if (!fs.existsSync(dirPath)) return;

      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.jsonl'));
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`🧹 Cleaned up old stream file: ${file}`);
        }
      });
    });
  }

  /**
   * Get stream statistics
   */
  getStreamStats() {
    const stats = {
      total_stream_files: 0,
      total_events: 0,
      events_by_type: {},
      events_by_agent: {},
      latest_activity: null
    };

    [this.streamsPath, this.dashboardStreamsPath].forEach(dirPath => {
      if (!fs.existsSync(dirPath)) return;

      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.jsonl'));
      stats.total_stream_files += files.length;

      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const events = this.readLatestEvents(filePath, 10000); // Read all events for stats
        
        stats.total_events += events.length;
        
        events.forEach(event => {
          // Count by event type
          const eventType = event.event || 'unknown';
          stats.events_by_type[eventType] = (stats.events_by_type[eventType] || 0) + 1;
          
          // Count by agent
          const fromAgent = event.from_agent || 'unknown';
          stats.events_by_agent[fromAgent] = (stats.events_by_agent[fromAgent] || 0) + 1;
          
          // Track latest activity
          if (!stats.latest_activity || event.timestamp > stats.latest_activity) {
            stats.latest_activity = event.timestamp;
          }
        });
      });
    });

    return stats;
  }
}

// Export the class and create a default instance
const streamingInfrastructure = new StreamingInfrastructure();

module.exports = {
  StreamingInfrastructure,
  streaming: streamingInfrastructure
};