/**
 * Task Completion Standup Manager
 * Manages task completion standups for AI agents (replaces daily standups)
 */

const fs = require('fs');
const path = require('path');
const { monitor } = require('./performance-monitor');

class StandupManager {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.standupsPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'sprint-tracking',
      'standups'
    );
    
    // Active sprint standups
    this.activeStandups = {};
    
    // Completion event listeners
    this.completionListeners = [];
    
    // Blocker escalation thresholds
    this.escalationThresholds = {
      blocker_duration: 30 * 60 * 1000, // 30 minutes
      retry_attempts: 3,
      critical_agents: ['coder_agent', 'testing_agent', 'devops_agent']
    };
    
    // Ensure standups directory exists
    this.ensureStandupsDirectory();
  }
  
  ensureStandupsDirectory() {
    if (!fs.existsSync(this.standupsPath)) {
      fs.mkdirSync(this.standupsPath, { recursive: true });
      console.log(`📁 Created standups directory: ${this.standupsPath}`);
    }
  }
  
  /**
   * Register task completion listener
   */
  onTaskComplete(callback) {
    this.completionListeners.push(callback);
  }
  
  /**
   * Report task completion and trigger standup
   */
  reportTaskCompletion(completionData) {
    const standup = {
      meta: {
        document_type: "task_completion_standup",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      },
      standup: {
        agent: completionData.agent,
        task_id: completionData.task_id,
        story_id: completionData.story_id,
        sprint_id: completionData.sprint_id,
        completion_time: new Date().toISOString(),
        
        // What was completed
        completed: {
          task_title: completionData.task_title,
          story_points: completionData.story_points || 0,
          actual_time: completionData.actual_time,
          deliverables: completionData.deliverables || []
        },
        
        // What's next
        next_task: completionData.next_task || null,
        
        // Any blockers
        blockers: completionData.blockers || [],
        
        // Progress update
        progress: {
          story_progress: completionData.story_progress,
          sprint_progress: completionData.sprint_progress,
          agent_velocity: completionData.agent_velocity
        }
      }
    };
    
    // Save standup report
    this.saveStandup(standup);
    
    // Update performance metrics
    if (completionData.actual_time) {
      monitor.recordTaskComplete(
        completionData.task_id,
        completionData.agent,
        completionData.actual_time
      );
    }
    
    // Process blockers if any
    if (standup.standup.blockers.length > 0) {
      this.processBlockers(standup);
    }
    
    // Notify listeners
    this.notifyListeners(standup);
    
    // Generate standup report
    const report = this.generateStandupReport(standup);
    
    // Stream to other agents if streaming is available
    this.streamStandupUpdate(standup);
    
    console.log(`📢 ${completionData.agent} standup: Completed ${completionData.task_title}`);
    
    return report;
  }
  
  /**
   * Process reported blockers
   */
  processBlockers(standup) {
    for (const blocker of standup.standup.blockers) {
      // Check if blocker needs escalation
      if (this.needsEscalation(blocker, standup.standup.agent)) {
        this.escalateBlocker(blocker, standup);
      } else {
        // Log blocker for tracking
        this.trackBlocker(blocker, standup);
      }
    }
  }
  
  /**
   * Check if blocker needs escalation
   */
  needsEscalation(blocker, agent) {
    // Critical agents always escalate
    if (this.escalationThresholds.critical_agents.includes(agent)) {
      return blocker.severity === 'high' || blocker.severity === 'critical';
    }
    
    // Check duration
    if (blocker.duration && blocker.duration > this.escalationThresholds.blocker_duration) {
      return true;
    }
    
    // Check retry attempts
    if (blocker.retry_count >= this.escalationThresholds.retry_attempts) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Escalate blocker to Project Manager
   */
  escalateBlocker(blocker, standup) {
    const escalation = {
      meta: {
        document_type: "blocker_escalation",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      },
      escalation: {
        blocker: blocker,
        reporting_agent: standup.standup.agent,
        task_id: standup.standup.task_id,
        story_id: standup.standup.story_id,
        severity: blocker.severity || 'high',
        impact: blocker.impact || 'blocks_progress',
        suggested_action: blocker.suggested_action || 'requires_intervention',
        escalation_reason: this.getEscalationReason(blocker, standup.standup.agent)
      }
    };
    
    // Save escalation
    const escalationPath = path.join(
      this.standupsPath,
      `escalation_${Date.now()}.json`
    );
    fs.writeFileSync(escalationPath, JSON.stringify(escalation, null, 2));
    
    console.log(`🚨 Blocker escalated: ${blocker.description}`);
    
    return escalation;
  }
  
  /**
   * Get escalation reason
   */
  getEscalationReason(blocker, agent) {
    const reasons = [];
    
    if (this.escalationThresholds.critical_agents.includes(agent)) {
      reasons.push('Critical agent blocked');
    }
    
    if (blocker.duration > this.escalationThresholds.blocker_duration) {
      reasons.push(`Blocked for ${Math.round(blocker.duration / 60000)} minutes`);
    }
    
    if (blocker.retry_count >= this.escalationThresholds.retry_attempts) {
      reasons.push(`${blocker.retry_count} retry attempts failed`);
    }
    
    return reasons.join(', ');
  }
  
  /**
   * Track blocker for analysis
   */
  trackBlocker(blocker, standup) {
    // Update story blocked time if available
    if (standup.standup.story_id && blocker.duration) {
      monitor.recordStoryBlocked(
        standup.standup.story_id,
        blocker.duration,
        blocker.description
      );
    }
    
    // Add to blocker tracking
    const trackingPath = path.join(this.standupsPath, 'blocker-tracking.json');
    let tracking = { blockers: [] };
    
    try {
      if (fs.existsSync(trackingPath)) {
        tracking = JSON.parse(fs.readFileSync(trackingPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading blocker tracking:', error.message);
    }
    
    tracking.blockers.push({
      timestamp: new Date().toISOString(),
      agent: standup.standup.agent,
      blocker: blocker,
      task_id: standup.standup.task_id,
      resolved: false
    });
    
    fs.writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
  }
  
  /**
   * Generate standup report
   */
  generateStandupReport(standup) {
    const report = {
      agent: standup.standup.agent,
      timestamp: standup.standup.completion_time,
      
      summary: `${standup.standup.agent} completed "${standup.standup.completed.task_title}"`,
      
      completed: {
        task: standup.standup.completed.task_title,
        points: standup.standup.completed.story_points,
        time: this.formatDuration(standup.standup.completed.actual_time),
        deliverables: standup.standup.completed.deliverables
      },
      
      next_up: standup.standup.next_task ? {
        task: standup.standup.next_task.title,
        estimated_points: standup.standup.next_task.points,
        dependencies: standup.standup.next_task.dependencies || []
      } : null,
      
      blockers: standup.standup.blockers.map(b => ({
        description: b.description,
        severity: b.severity,
        needs_help_from: b.needs_help_from
      })),
      
      progress: {
        story: standup.standup.progress.story_progress 
          ? `${standup.standup.progress.story_progress}% complete` 
          : 'N/A',
        sprint: standup.standup.progress.sprint_progress 
          ? `${standup.standup.progress.sprint_progress}% complete` 
          : 'N/A',
        velocity: standup.standup.progress.agent_velocity 
          ? `${standup.standup.progress.agent_velocity} points/sprint` 
          : 'N/A'
      }
    };
    
    return report;
  }
  
  /**
   * Save standup to file
   */
  saveStandup(standup) {
    const fileName = `standup_${standup.standup.agent}_${Date.now()}.json`;
    const filePath = path.join(this.standupsPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(standup, null, 2));
  }
  
  /**
   * Notify registered listeners
   */
  notifyListeners(standup) {
    for (const listener of this.completionListeners) {
      try {
        listener(standup);
      } catch (error) {
        console.error('Error notifying listener:', error.message);
      }
    }
  }
  
  /**
   * Stream standup update to other agents
   */
  streamStandupUpdate(standup) {
    try {
      const streamingPath = path.join(__dirname, 'streaming-infrastructure.js');
      
      if (fs.existsSync(streamingPath)) {
        const { StreamingInfrastructure } = require('./streaming-infrastructure');
        const streaming = new StreamingInfrastructure();
        
        // Stream standup event
        streaming.streamAgentEvent(standup.standup.agent, 'task_completed', {
          task_id: standup.standup.task_id,
          task_title: standup.standup.completed.task_title,
          story_points: standup.standup.completed.story_points,
          next_task: standup.standup.next_task,
          blockers: standup.standup.blockers.length,
          progress: standup.standup.progress
        });
        
        console.log('📡 Standup streamed to system');
      }
    } catch (error) {
      // Silently fail if streaming is not available
      console.log('💡 Streaming infrastructure not available for standup');
    }
  }
  
  /**
   * Get sprint standup summary
   */
  getSprintStandupSummary(sprintId) {
    const standupFiles = fs.readdirSync(this.standupsPath)
      .filter(f => f.startsWith('standup_'));
    
    const sprintStandups = [];
    
    for (const file of standupFiles) {
      try {
        const standup = JSON.parse(
          fs.readFileSync(path.join(this.standupsPath, file), 'utf-8')
        );
        
        if (standup.standup.sprint_id === sprintId) {
          sprintStandups.push(standup);
        }
      } catch (error) {
        console.error(`Error reading standup file ${file}:`, error.message);
      }
    }
    
    // Generate summary
    const summary = {
      sprint_id: sprintId,
      total_standups: sprintStandups.length,
      tasks_completed: sprintStandups.length,
      total_points: sprintStandups.reduce(
        (sum, s) => sum + (s.standup.completed.story_points || 0), 0
      ),
      blockers_reported: sprintStandups.reduce(
        (sum, s) => sum + s.standup.blockers.length, 0
      ),
      by_agent: {}
    };
    
    // Group by agent
    for (const standup of sprintStandups) {
      const agent = standup.standup.agent;
      
      if (!summary.by_agent[agent]) {
        summary.by_agent[agent] = {
          tasks_completed: 0,
          points_completed: 0,
          blockers_reported: 0
        };
      }
      
      summary.by_agent[agent].tasks_completed++;
      summary.by_agent[agent].points_completed += standup.standup.completed.story_points || 0;
      summary.by_agent[agent].blockers_reported += standup.standup.blockers.length;
    }
    
    return summary;
  }
  
  /**
   * Format duration for display
   */
  formatDuration(milliseconds) {
    if (!milliseconds) return 'N/A';
    
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }
  
  /**
   * Mark blocker as resolved
   */
  resolveBlocker(taskId, blockerId) {
    const trackingPath = path.join(this.standupsPath, 'blocker-tracking.json');
    
    try {
      if (fs.existsSync(trackingPath)) {
        const tracking = JSON.parse(fs.readFileSync(trackingPath, 'utf-8'));
        
        const blocker = tracking.blockers.find(
          b => b.task_id === taskId && !b.resolved
        );
        
        if (blocker) {
          blocker.resolved = true;
          blocker.resolved_at = new Date().toISOString();
          
          fs.writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
          
          console.log(`✅ Blocker resolved for task ${taskId}`);
        }
      }
    } catch (error) {
      console.error('Error resolving blocker:', error.message);
    }
  }
}

// Export the class and create instance
const standupManager = new StandupManager();

module.exports = {
  StandupManager,
  standupManager,
  
  // Convenience exports
  reportTaskCompletion: (data) => standupManager.reportTaskCompletion(data),
  onTaskComplete: (callback) => standupManager.onTaskComplete(callback),
  getSprintStandupSummary: (sprintId) => standupManager.getSprintStandupSummary(sprintId),
  resolveBlocker: (taskId, blockerId) => standupManager.resolveBlocker(taskId, blockerId)
};

// If run directly, simulate a standup
if (require.main === module) {
  console.log('📢 Simulating Task Completion Standup');
  
  // Simulate task completion
  const report = standupManager.reportTaskCompletion({
    agent: 'coder_agent',
    task_id: 'TASK-001',
    story_id: 'AUTH-001',
    sprint_id: 'sprint_1',
    task_title: 'Implement login API endpoint',
    story_points: 3,
    actual_time: 45 * 60 * 1000, // 45 minutes
    
    deliverables: [
      'POST /api/auth/login endpoint',
      'JWT token generation',
      'Input validation'
    ],
    
    next_task: {
      title: 'Implement logout endpoint',
      points: 1,
      dependencies: []
    },
    
    blockers: [],
    
    story_progress: 60,
    sprint_progress: 25,
    agent_velocity: 15
  });
  
  console.log('\nStandup Report:', JSON.stringify(report, null, 2));
  
  // Simulate a blocker
  const blockedReport = standupManager.reportTaskCompletion({
    agent: 'testing_agent',
    task_id: 'TASK-002',
    story_id: 'AUTH-001',
    sprint_id: 'sprint_1',
    task_title: 'Write authentication tests',
    story_points: 2,
    actual_time: 60 * 60 * 1000, // 60 minutes
    
    deliverables: [],
    
    next_task: null,
    
    blockers: [{
      description: 'Test environment not configured properly',
      severity: 'high',
      duration: 45 * 60 * 1000, // 45 minutes
      retry_count: 2,
      needs_help_from: ['devops_agent'],
      impact: 'Cannot run integration tests'
    }],
    
    story_progress: 40,
    sprint_progress: 25,
    agent_velocity: 12
  });
  
  console.log('\nBlocked Standup Report:', JSON.stringify(blockedReport, null, 2));
}