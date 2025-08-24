#!/usr/bin/env node

/**
 * Sprint Pulse Coordinator
 * Coordinates between sprint tracking and pulse generation
 */

const { spawn } = require('child_process');
const path = require('path');

class SprintPulseCoordinator {
  constructor() {
    this.pulseGeneratorPath = path.join(__dirname, 'pulse-generator.js');
  }

  async triggerPulse(eventType, sprintId, eventData) {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        PULSE_TYPE: eventType,
        SPRINT_ID: sprintId,
        EVENT_DATA: JSON.stringify(eventData)
      };

      const child = spawn('node', [this.pulseGeneratorPath], { env });
      
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (error) {
            resolve({ status: 'success', raw: stdout });
          }
        } else {
          reject(new Error(`Pulse generation failed: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  determinePulseType(documentType, changeData) {
    // Map document changes to pulse event types
    const pulseMap = {
      'state': {
        'planning_to_active': 'sprint-start',
        'active_to_testing': 'milestone-reached',
        'testing_to_review': 'milestone-reached',
        'review_to_completed': 'sprint-complete'
      },
      'planning': {
        'points_added': 'sprint-update',
        'story_added': 'story-added'
      },
      'testing': {
        'tests_failed': 'test-failure',
        'tests_passed': 'milestone-reached'
      },
      'story': {
        'completed': 'story-done',
        'blocked': 'blocker-new',
        'unblocked': 'blocker-resolved'
      }
    };

    const docMap = pulseMap[documentType];
    if (!docMap) return null;

    // Find matching change type
    for (const [change, pulseType] of Object.entries(docMap)) {
      if (this.matchesChange(change, changeData)) {
        return pulseType;
      }
    }

    return null;
  }

  matchesChange(changePattern, changeData) {
    // Simple pattern matching for state transitions
    if (changePattern.includes('_to_')) {
      const [from, to] = changePattern.split('_to_');
      return changeData.fromState === from && changeData.toState === to;
    }

    // Check for specific change types
    switch (changePattern) {
      case 'points_added':
        return changeData.pointsAdded > 0;
      case 'story_added':
        return changeData.storyAdded === true;
      case 'tests_failed':
        return changeData.testsFailed > 0;
      case 'tests_passed':
        return changeData.allTestsPassed === true;
      case 'completed':
        return changeData.status === 'completed';
      case 'blocked':
        return changeData.blocked === true;
      case 'unblocked':
        return changeData.blocked === false && changeData.wasBlocked === true;
      default:
        return false;
    }
  }

  prepareEventData(pulseType, documentType, changeData) {
    // Prepare event-specific data for pulse generation
    const baseData = {
      documentType,
      timestamp: new Date().toISOString(),
      ...changeData
    };

    // Add type-specific data
    switch (pulseType) {
      case 'sprint-start':
        return {
          ...baseData,
          plannedPoints: changeData.plannedPoints || 0,
          storyCount: changeData.storyCount || 0,
          sprintGoal: changeData.sprintGoal || 'Not specified'
        };

      case 'story-done':
        return {
          ...baseData,
          storyId: changeData.storyId,
          storyTitle: changeData.storyTitle,
          points: changeData.points || 0,
          progressPercentage: changeData.progressPercentage
        };

      case 'blocker-new':
        return {
          ...baseData,
          severity: changeData.severity || 'High',
          description: changeData.description,
          affectedStories: changeData.affectedStories,
          needsEscalation: changeData.severity === 'Critical'
        };

      case 'test-failure':
        return {
          ...baseData,
          failedCount: changeData.testsFailed,
          totalTests: changeData.totalTests,
          passRate: Math.round((changeData.testsPassed / changeData.totalTests) * 100),
          failedTests: changeData.failedTestDetails
        };

      case 'sprint-complete':
        return {
          ...baseData,
          velocity: changeData.velocity,
          plannedPoints: changeData.plannedPoints,
          completedPoints: changeData.completedPoints,
          completionRate: Math.round((changeData.completedPoints / changeData.plannedPoints) * 100)
        };

      case 'milestone-reached':
        const percentage = changeData.progressPercentage || 
                          Math.round((changeData.completedPoints / changeData.totalPoints) * 100);
        
        // Only trigger milestone pulses at 10% intervals
        if (percentage % 10 !== 0) return null;
        
        return {
          ...baseData,
          percentage,
          pointsCompleted: changeData.completedPoints,
          pointsRemaining: changeData.remainingPoints,
          currentVelocity: changeData.velocity
        };

      default:
        return baseData;
    }
  }

  shouldTriggerPulse(pulseType, eventData) {
    // Determine if pulse should be triggered based on significance
    const alwaysTrigger = [
      'sprint-start',
      'sprint-complete',
      'blocker-new',
      'test-failure'
    ];

    if (alwaysTrigger.includes(pulseType)) {
      return true;
    }

    // Conditional triggers
    switch (pulseType) {
      case 'story-done':
        // Trigger for stories >= 3 points
        return eventData.points >= 3;

      case 'milestone-reached':
        // Already filtered in prepareEventData
        return eventData !== null;

      case 'blocker-resolved':
        // Trigger for high/critical blockers
        return ['High', 'Critical'].includes(eventData.severity);

      default:
        return false;
    }
  }
}

module.exports = SprintPulseCoordinator;