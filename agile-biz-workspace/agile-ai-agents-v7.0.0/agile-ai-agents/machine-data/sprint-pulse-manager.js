/**
 * Sprint Pulse Manager for AgileAiAgents
 * Handles continuous real-time updates during AI-speed sprints
 * Replaces traditional daily standups with streaming sprint pulse
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class SprintPulseManager extends EventEmitter {
  constructor() {
    super();
    this.activeSprint = null;
    this.agentActivities = new Map();
    this.pulseStream = [];
    this.pulseInterval = null;
    this.basePath = path.join(__dirname, '..');
    this.streamPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'sprint-pulse-stream.jsonl'
    );
  }

  /**
   * Start sprint pulse monitoring for active sprint
   */
  startSprintPulse(sprintData) {
    this.activeSprint = {
      id: sprintData.sprintId,
      startTime: new Date(),
      committedPoints: sprintData.committedPoints,
      completedPoints: 0,
      agents: sprintData.agents || [],
      status: 'active'
    };

    // Initialize agent activity tracking
    this.activeSprint.agents.forEach(agentId => {
      this.agentActivities.set(agentId, {
        currentTask: null,
        completedPoints: 0,
        status: 'ready',
        lastUpdate: new Date(),
        blockers: []
      });
    });

    // Start pulse streaming
    this.startPulseStreaming();
    
    // Emit sprint start event
    this.emitPulseEvent('sprint_pulse_started', {
      sprintId: this.activeSprint.id,
      committedPoints: this.activeSprint.committedPoints,
      agents: this.activeSprint.agents
    });

    console.log(`🚀 Sprint Pulse started for Sprint ${this.activeSprint.id}`);
    return this.activeSprint.id;
  }

  /**
   * Stream real-time updates from agents
   */
  streamUpdates(agentId, updateData = {}) {
    if (!this.activeSprint) {
      throw new Error('No active sprint for pulse updates');
    }

    const agentActivity = this.agentActivities.get(agentId);
    if (!agentActivity) {
      throw new Error(`Agent ${agentId} not part of current sprint`);
    }

    // Update agent activity
    const timestamp = new Date();
    agentActivity.lastUpdate = timestamp;

    // Process different types of updates
    if (updateData.taskStarted) {
      agentActivity.currentTask = updateData.taskStarted;
      agentActivity.status = 'working';
      
      this.emitPulseEvent('task_started', {
        agentId,
        task: updateData.taskStarted,
        estimatedPoints: updateData.estimatedPoints
      });
    }

    if (updateData.pointsCompleted) {
      agentActivity.completedPoints += updateData.pointsCompleted;
      this.activeSprint.completedPoints += updateData.pointsCompleted;
      agentActivity.currentTask = null;
      agentActivity.status = 'ready';

      this.emitPulseEvent('points_completed', {
        agentId,
        pointsCompleted: updateData.pointsCompleted,
        totalAgentPoints: agentActivity.completedPoints,
        sprintProgress: this.getSprintProgress()
      });
    }

    if (updateData.blocker) {
      agentActivity.blockers.push({
        description: updateData.blocker.description,
        severity: updateData.blocker.severity || 'medium',
        timestamp: timestamp
      });
      agentActivity.status = 'blocked';

      this.emitPulseEvent('blocker_reported', {
        agentId,
        blocker: updateData.blocker,
        requiresHelp: updateData.blocker.requiresHelp || false
      });
    }

    if (updateData.blockerResolved) {
      agentActivity.blockers = agentActivity.blockers.filter(
        b => b.description !== updateData.blockerResolved
      );
      agentActivity.status = agentActivity.blockers.length > 0 ? 'blocked' : 'ready';

      this.emitPulseEvent('blocker_resolved', {
        agentId,
        blockerResolved: updateData.blockerResolved
      });
    }

    if (updateData.helpNeeded) {
      this.emitPulseEvent('help_requested', {
        agentId,
        helpType: updateData.helpNeeded.type,
        description: updateData.helpNeeded.description,
        urgency: updateData.helpNeeded.urgency || 'normal'
      });
    }

    // Update pulse stream
    this.updatePulseStream();
    
    return this.getCurrentPulseStatus();
  }

  /**
   * Get current sprint pulse status
   */
  getCurrentPulseStatus() {
    if (!this.activeSprint) return null;

    const elapsedHours = this.getSprintElapsedHours();
    const progress = this.getSprintProgress();
    const velocity = this.getCurrentVelocity();
    const agentStatuses = this.getAgentStatuses();

    return {
      timestamp: new Date().toISOString(),
      sprint: {
        id: this.activeSprint.id,
        elapsedHours: Math.round(elapsedHours * 100) / 100,
        progress: progress,
        velocity: velocity,
        status: this.getSprintStatus()
      },
      agents: agentStatuses,
      blockers: this.getActiveBlockers(),
      projectedCompletion: this.getProjectedCompletion()
    };
  }

  /**
   * Complete the current sprint
   */
  completeSprint(completionData = {}) {
    if (!this.activeSprint) {
      throw new Error('No active sprint to complete');
    }

    this.activeSprint.endTime = new Date();
    this.activeSprint.status = 'completed';
    this.activeSprint.finalVelocity = this.getCurrentVelocity();
    this.activeSprint.completionRate = this.getSprintProgress().percentage;

    // Stop pulse streaming
    this.stopPulseStreaming();

    // Emit completion event
    this.emitPulseEvent('sprint_pulse_completed', {
      sprintId: this.activeSprint.id,
      completedPoints: this.activeSprint.completedPoints,
      committedPoints: this.activeSprint.committedPoints,
      completionRate: this.activeSprint.completionRate,
      duration: this.getSprintElapsedHours(),
      finalVelocity: this.activeSprint.finalVelocity
    });

    const completedSprint = { ...this.activeSprint };
    this.activeSprint = null;
    this.agentActivities.clear();

    console.log(`✅ Sprint Pulse completed for Sprint ${completedSprint.id}`);
    return completedSprint;
  }

  /**
   * Private helper methods
   */
  startPulseStreaming() {
    // Stream pulse updates every 30 seconds
    this.pulseInterval = setInterval(() => {
      this.updatePulseStream();
    }, 30000);
  }

  stopPulseStreaming() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
  }

  updatePulseStream() {
    const pulseData = this.getCurrentPulseStatus();
    if (pulseData) {
      this.pulseStream.push(pulseData);
      
      // Write to stream file
      const streamLine = JSON.stringify({
        event: 'pulse_update',
        ...pulseData
      }) + '\n';
      
      try {
        fs.appendFileSync(this.streamPath, streamLine);
      } catch (error) {
        console.warn('Failed to write pulse stream:', error.message);
      }
    }
  }

  emitPulseEvent(eventType, eventData) {
    const pulseEvent = {
      event: eventType,
      timestamp: new Date().toISOString(),
      sprintId: this.activeSprint?.id,
      ...eventData
    };

    // Emit to listeners
    this.emit('pulse_event', pulseEvent);

    // Add to pulse stream
    this.pulseStream.push(pulseEvent);

    // Write to stream file
    try {
      const streamLine = JSON.stringify(pulseEvent) + '\n';
      fs.appendFileSync(this.streamPath, streamLine);
    } catch (error) {
      console.warn('Failed to write pulse event:', error.message);
    }

    console.log(`📡 Pulse Event: ${eventType}`, eventData);
  }

  getSprintElapsedHours() {
    if (!this.activeSprint) return 0;
    
    const now = new Date();
    const elapsed = (now - this.activeSprint.startTime) / (1000 * 60 * 60);
    return elapsed;
  }

  getSprintProgress() {
    if (!this.activeSprint) return null;

    const percentage = (this.activeSprint.completedPoints / this.activeSprint.committedPoints) * 100;
    
    return {
      completedPoints: this.activeSprint.completedPoints,
      committedPoints: this.activeSprint.committedPoints,
      percentage: Math.round(percentage),
      remainingPoints: this.activeSprint.committedPoints - this.activeSprint.completedPoints
    };
  }

  getCurrentVelocity() {
    if (!this.activeSprint) return 0;
    
    const elapsedHours = this.getSprintElapsedHours();
    return elapsedHours > 0 ? this.activeSprint.completedPoints / elapsedHours : 0;
  }

  getAgentStatuses() {
    const statuses = [];
    
    this.agentActivities.forEach((activity, agentId) => {
      statuses.push({
        agentId,
        status: activity.status,
        currentTask: activity.currentTask,
        completedPoints: activity.completedPoints,
        blockers: activity.blockers.length,
        lastUpdate: activity.lastUpdate.toISOString()
      });
    });

    return statuses;
  }

  getActiveBlockers() {
    const allBlockers = [];
    
    this.agentActivities.forEach((activity, agentId) => {
      activity.blockers.forEach(blocker => {
        allBlockers.push({
          agentId,
          ...blocker
        });
      });
    });

    return allBlockers.sort((a, b) => {
      const severityOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  getProjectedCompletion() {
    if (!this.activeSprint) return null;

    const currentVelocity = this.getCurrentVelocity();
    if (currentVelocity === 0) return null;

    const progress = this.getSprintProgress();
    const remainingHours = progress.remainingPoints / currentVelocity;
    const projectedCompletion = new Date(Date.now() + (remainingHours * 60 * 60 * 1000));

    return {
      remainingHours: Math.round(remainingHours * 10) / 10,
      projectedCompletion: projectedCompletion.toISOString(),
      confidence: this.getProjectionConfidence()
    };
  }

  getProjectionConfidence() {
    const elapsedHours = this.getSprintElapsedHours();
    const blockers = this.getActiveBlockers().length;
    
    if (elapsedHours < 0.5) return 'low';
    if (blockers > 2) return 'low';
    if (elapsedHours < 2) return 'medium';
    return 'high';
  }

  getSprintStatus() {
    if (!this.activeSprint) return 'none';

    const progress = this.getSprintProgress();
    const blockers = this.getActiveBlockers();
    const criticalBlockers = blockers.filter(b => b.severity === 'critical').length;

    if (progress.percentage === 100) return 'completed';
    if (criticalBlockers > 0) return 'blocked';
    if (progress.percentage >= 80) return 'on_track';
    
    const projectedCompletion = this.getProjectedCompletion();
    if (projectedCompletion && projectedCompletion.remainingHours > 8) return 'at_risk';
    
    return 'in_progress';
  }

  // Dashboard integration methods
  getDashboardData() {
    return {
      currentPulse: this.getCurrentPulseStatus(),
      recentEvents: this.pulseStream.slice(-20),
      sprintSummary: this.activeSprint ? {
        id: this.activeSprint.id,
        status: this.activeSprint.status,
        startTime: this.activeSprint.startTime,
        progress: this.getSprintProgress()
      } : null
    };
  }

  // Export for testing and analysis
  exportPulseData() {
    return {
      activeSprint: this.activeSprint,
      agentActivities: Array.from(this.agentActivities.entries()),
      pulseStream: this.pulseStream,
      currentStatus: this.getCurrentPulseStatus()
    };
  }
}

module.exports = { SprintPulseManager };

// Usage example:
/*
const { SprintPulseManager } = require('./sprint-pulse-manager');

const pulseManager = new SprintPulseManager();

// Start sprint pulse
pulseManager.startSprintPulse({
  sprintId: 'sprint-001',
  committedPoints: 23,
  agents: ['coder_agent', 'testing_agent', 'ui_ux_agent']
});

// Agent starts work
pulseManager.streamUpdates('coder_agent', {
  taskStarted: 'AUTH-001: Implement user login',
  estimatedPoints: 5
});

// Agent completes work
pulseManager.streamUpdates('coder_agent', {
  pointsCompleted: 5
});

// Agent reports blocker
pulseManager.streamUpdates('testing_agent', {
  blocker: {
    description: 'Test environment down',
    severity: 'high',
    requiresHelp: true
  }
});

// Listen for pulse events
pulseManager.on('pulse_event', (event) => {
  console.log('Pulse event:', event);
});

// Get current status
const status = pulseManager.getCurrentPulseStatus();
console.log('Current pulse:', status);
*/