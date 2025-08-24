/**
 * Drift Resolution Coordinator
 * 
 * Coordinates between agents to resolve context drift when detected
 */

const fs = require('fs-extra');
const path = require('path');
const verificationEngine = require('./verification-engine');

class DriftResolutionCoordinator {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.resolutionStrategies = {
      minor: 'informational',
      moderate: 'collaborative',
      major: 'intervention',
      critical: 'emergency'
    };
    this.activeResolutions = new Map();
  }

  /**
   * Initiate drift resolution based on severity
   */
  async initiateDriftResolution(driftReport) {
    const resolutionId = `drift-${Date.now()}`;
    const strategy = this.resolutionStrategies[driftReport.severity] || 'informational';
    
    console.log(`\n🚨 Initiating drift resolution (${strategy} strategy)`);
    
    const resolution = {
      id: resolutionId,
      driftReport,
      strategy,
      status: 'initiated',
      startTime: new Date(),
      actions: [],
      participants: [],
      outcome: null
    };

    this.activeResolutions.set(resolutionId, resolution);

    // Execute resolution based on strategy
    switch (strategy) {
      case 'emergency':
        await this.handleEmergencyResolution(resolution);
        break;
      case 'intervention':
        await this.handleInterventionResolution(resolution);
        break;
      case 'collaborative':
        await this.handleCollaborativeResolution(resolution);
        break;
      default:
        await this.handleInformationalResolution(resolution);
    }

    return resolution;
  }

  /**
   * Emergency resolution for critical drift
   */
  async handleEmergencyResolution(resolution) {
    console.log('🚨 EMERGENCY: Critical context drift detected!');
    
    // 1. Create emergency meeting request
    const meetingRequest = await this.createEmergencyMeeting(resolution);
    resolution.actions.push({
      type: 'emergency-meeting',
      timestamp: new Date(),
      details: meetingRequest
    });

    // 2. Block all new development
    await this.blockNewDevelopment(resolution);
    resolution.actions.push({
      type: 'development-blocked',
      timestamp: new Date(),
      reason: 'Critical context drift requires resolution'
    });

    // 3. Notify all stakeholders
    await this.notifyAllStakeholders(resolution, 'emergency');
    resolution.participants.push('project-manager', 'scrum-master', 'product-owner', 'tech-lead');

    // 4. Generate emergency action plan
    const actionPlan = await this.generateEmergencyActionPlan(resolution);
    resolution.actions.push({
      type: 'action-plan-created',
      timestamp: new Date(),
      plan: actionPlan
    });

    // 5. Create resolution tracking document
    await this.createResolutionDocument(resolution, 'emergency');
    
    resolution.status = 'emergency-response-active';
  }

  /**
   * Intervention resolution for major drift
   */
  async handleInterventionResolution(resolution) {
    console.log('⚠️ INTERVENTION: Major context drift requires action');
    
    // 1. Schedule review meeting
    const meeting = await this.scheduleReviewMeeting(resolution);
    resolution.actions.push({
      type: 'review-meeting-scheduled',
      timestamp: new Date(),
      details: meeting
    });

    // 2. Pause non-critical development
    await this.pauseNonCriticalWork(resolution);
    resolution.actions.push({
      type: 'non-critical-paused',
      timestamp: new Date()
    });

    // 3. Assign resolution tasks
    const tasks = await this.assignResolutionTasks(resolution);
    resolution.actions.push({
      type: 'tasks-assigned',
      timestamp: new Date(),
      tasks
    });

    // 4. Notify key stakeholders
    await this.notifyKeyStakeholders(resolution, 'intervention');
    resolution.participants.push('project-manager', 'scrum-master', 'tech-lead');

    // 5. Create action items
    await this.createActionItems(resolution);
    
    resolution.status = 'intervention-in-progress';
  }

  /**
   * Collaborative resolution for moderate drift
   */
  async handleCollaborativeResolution(resolution) {
    console.log('🤝 COLLABORATIVE: Working together to address drift');
    
    // 1. Create discussion thread
    const discussion = await this.createDiscussionThread(resolution);
    resolution.actions.push({
      type: 'discussion-started',
      timestamp: new Date(),
      thread: discussion
    });

    // 2. Request agent analysis
    const analysis = await this.requestAgentAnalysis(resolution);
    resolution.actions.push({
      type: 'agent-analysis-requested',
      timestamp: new Date(),
      agents: ['project-manager', 'scrum-master']
    });

    // 3. Generate recommendations
    const recommendations = await this.generateRecommendations(resolution);
    resolution.actions.push({
      type: 'recommendations-generated',
      timestamp: new Date(),
      count: recommendations.length
    });

    // 4. Create follow-up tasks
    await this.createFollowUpTasks(resolution, recommendations);
    
    resolution.participants.push('project-manager', 'scrum-master');
    resolution.status = 'collaborative-review';
  }

  /**
   * Informational resolution for minor drift
   */
  async handleInformationalResolution(resolution) {
    console.log('ℹ️ INFORMATIONAL: Minor drift detected, monitoring');
    
    // 1. Log drift occurrence
    await this.logDriftOccurrence(resolution);
    resolution.actions.push({
      type: 'drift-logged',
      timestamp: new Date()
    });

    // 2. Update monitoring frequency
    await this.adjustMonitoringFrequency(resolution);
    
    // 3. Create awareness note
    await this.createAwarenessNote(resolution);
    
    resolution.status = 'monitoring';
  }

  /**
   * Create emergency meeting request
   */
  async createEmergencyMeeting(resolution) {
    const meetingPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'emergency-meetings',
      `emergency-${resolution.id}.md`
    );

    const content = `# EMERGENCY: Context Drift Meeting Request

## Critical Situation
**Drift Level**: ${resolution.driftReport.overallDrift}%
**Severity**: CRITICAL
**Date**: ${new Date().toISOString()}

## Required Attendees
- Product Owner
- Project Manager  
- Scrum Master
- Technical Lead
- Key Stakeholders

## Agenda
1. Review drift analysis report
2. Identify root causes
3. Decide on immediate actions
4. Update Project Truth document
5. Create recovery plan

## Pre-Meeting Review
- Drift Report: ${resolution.id}
- Areas of Concern:
${resolution.driftReport.checks.map(c => `  - ${c.name}: ${c.drift}%`).join('\n')}

## Immediate Actions Required
- All new feature development is BLOCKED
- Review all in-progress work for alignment
- Prepare to pivot or realign as needed

**This is a blocking issue that requires immediate resolution.**
`;

    await fs.ensureDir(path.dirname(meetingPath));
    await fs.writeFile(meetingPath, content, 'utf8');

    return { path: meetingPath, scheduled: 'ASAP' };
  }

  /**
   * Block new development
   */
  async blockNewDevelopment(resolution) {
    // Update workflow state to block new work
    const workflowStatePath = path.join(
      this.projectRoot, 'project-state', 'workflow-state.json'
    );

    if (await fs.pathExists(workflowStatePath)) {
      const state = await fs.readJSON(workflowStatePath);
      state.development_blocked = true;
      state.block_reason = 'Critical context drift requires resolution';
      state.blocked_at = new Date().toISOString();
      state.resolution_id = resolution.id;
      
      await fs.writeJSON(workflowStatePath, state, { spaces: 2 });
    }

    // Create blocking notice
    const noticePath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'DEVELOPMENT-BLOCKED.md'
    );

    const notice = `# ⛔ DEVELOPMENT BLOCKED

**Reason**: Critical context drift detected
**Drift Level**: ${resolution.driftReport.overallDrift}%
**Blocked Since**: ${new Date().toISOString()}
**Resolution ID**: ${resolution.id}

## What This Means
- No new features can be started
- Current work must be reviewed for alignment
- All commits must reference resolution ID

## Next Steps
1. Attend emergency meeting
2. Review drift analysis
3. Participate in resolution activities
4. Wait for all-clear before resuming

## Contact
- Resolution Coordinator: Project Manager
- Technical Questions: Scrum Master
`;

    await fs.writeFile(noticePath, notice, 'utf8');
  }

  /**
   * Generate emergency action plan
   */
  async generateEmergencyActionPlan(resolution) {
    const plan = {
      immediate: [
        'Stop all new feature development',
        'Review all in-progress work',
        'Audit recent decisions and changes',
        'Prepare Project Truth update proposals'
      ],
      within24Hours: [
        'Complete drift root cause analysis',
        'Interview key stakeholders',
        'Review all backlog items',
        'Create realignment strategy'
      ],
      within48Hours: [
        'Update Project Truth document',
        'Realign backlog with new truth',
        'Create new sprint plan',
        'Resume development with clear direction'
      ]
    };

    // Save action plan
    const planPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'drift-resolution',
      `emergency-plan-${resolution.id}.json`
    );

    await fs.ensureDir(path.dirname(planPath));
    await fs.writeJSON(planPath, plan, { spaces: 2 });

    return plan;
  }

  /**
   * Create resolution document
   */
  async createResolutionDocument(resolution, type) {
    const docPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'drift-resolution',
      `resolution-${resolution.id}.md`
    );

    let content = `# Drift Resolution Document

**ID**: ${resolution.id}
**Type**: ${type.toUpperCase()}
**Status**: ${resolution.status}
**Started**: ${resolution.startTime.toISOString()}

## Drift Analysis
- Overall Drift: ${resolution.driftReport.overallDrift}%
- Severity: ${resolution.driftReport.severity}

### Drift by Area
${resolution.driftReport.checks.map(c => `- ${c.name}: ${c.drift}%`).join('\n')}

## Resolution Strategy
**Strategy**: ${resolution.strategy}

## Actions Taken
${resolution.actions.map(a => `- [${a.timestamp.toISOString()}] ${a.type}`).join('\n')}

## Participants
${resolution.participants.map(p => `- ${p}`).join('\n')}

## Status Updates
*This section will be updated as resolution progresses*

---
Last Updated: ${new Date().toISOString()}
`;

    await fs.ensureDir(path.dirname(docPath));
    await fs.writeFile(docPath, content, 'utf8');
  }

  /**
   * Request agent analysis
   */
  async requestAgentAnalysis(resolution) {
    const analysisRequest = {
      id: resolution.id,
      timestamp: new Date(),
      driftReport: resolution.driftReport,
      requestedAgents: ['project-manager', 'scrum-master'],
      questions: [
        'What recent decisions may have contributed to this drift?',
        'Which backlog items are most misaligned?',
        'What changes are needed to realign with project goals?',
        'How can we prevent this drift in the future?'
      ]
    };

    // Save analysis request
    const requestPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'agent-coordination',
      `analysis-request-${resolution.id}.json`
    );

    await fs.ensureDir(path.dirname(requestPath));
    await fs.writeJSON(requestPath, analysisRequest, { spaces: 2 });

    // Simulate agent responses
    const responses = await this.simulateAgentResponses(analysisRequest);
    
    return { request: analysisRequest, responses };
  }

  /**
   * Simulate agent responses (in real implementation, this would trigger actual agents)
   */
  async simulateAgentResponses(request) {
    return {
      'project-manager': {
        recentDecisions: [
          'Added payment processing feature without stakeholder approval',
          'Expanded scope to include inventory management',
          'Changed target user from B2B to B2C'
        ],
        recommendations: [
          'Revert to original B2B focus',
          'Remove out-of-scope features',
          'Schedule stakeholder alignment session'
        ]
      },
      'scrum-master': {
        processIssues: [
          'Sprint goals not aligned with Project Truth',
          'Acceptance criteria too vague',
          'No context verification in sprint planning'
        ],
        improvements: [
          'Implement pre-sprint context checks',
          'Require explicit alignment statements',
          'Add context verification to DoD'
        ]
      }
    };
  }

  /**
   * Generate recommendations based on drift analysis
   */
  async generateRecommendations(resolution) {
    const recommendations = [];
    const driftReport = resolution.driftReport;

    // Check each area of drift
    driftReport.checks.forEach(check => {
      if (check.drift > 40) {
        switch (check.name) {
          case 'backlog':
            recommendations.push({
              area: 'backlog',
              priority: 'high',
              action: 'Review and realign all backlog items',
              owner: 'project-manager'
            });
            break;
          case 'recent-documents':
            recommendations.push({
              area: 'documentation',
              priority: 'medium',
              action: 'Audit recent documentation for alignment',
              owner: 'documentation-agent'
            });
            break;
          case 'sprint-goals':
            recommendations.push({
              area: 'sprint-planning',
              priority: 'high',
              action: 'Revise sprint goals to match project context',
              owner: 'scrum-master'
            });
            break;
          case 'decisions':
            recommendations.push({
              area: 'decision-making',
              priority: 'high',
              action: 'Review recent decisions against Project Truth',
              owner: 'project-manager'
            });
            break;
        }
      }
    });

    // Add general recommendations
    if (driftReport.overallDrift > 60) {
      recommendations.push({
        area: 'project-truth',
        priority: 'critical',
        action: 'Update Project Truth document with stakeholder input',
        owner: 'product-owner'
      });
    }

    // Save recommendations
    const recoPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'drift-resolution',
      `recommendations-${resolution.id}.json`
    );

    await fs.ensureDir(path.dirname(recoPath));
    await fs.writeJSON(recoPath, recommendations, { spaces: 2 });

    return recommendations;
  }

  /**
   * Create follow-up tasks
   */
  async createFollowUpTasks(resolution, recommendations) {
    const tasks = recommendations.map((rec, index) => ({
      id: `${resolution.id}-task-${index + 1}`,
      title: rec.action,
      area: rec.area,
      priority: rec.priority,
      assignee: rec.owner,
      status: 'pending',
      dueDate: this.calculateDueDate(rec.priority),
      created: new Date().toISOString()
    }));

    // Save tasks
    const tasksPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'drift-resolution',
      `tasks-${resolution.id}.json`
    );

    await fs.writeJSON(tasksPath, tasks, { spaces: 2 });

    // Update resolution
    resolution.actions.push({
      type: 'tasks-created',
      timestamp: new Date(),
      count: tasks.length
    });

    return tasks;
  }

  /**
   * Calculate due date based on priority
   */
  calculateDueDate(priority) {
    const now = new Date();
    switch (priority) {
      case 'critical':
        now.setHours(now.getHours() + 24);
        break;
      case 'high':
        now.setDate(now.getDate() + 2);
        break;
      case 'medium':
        now.setDate(now.getDate() + 5);
        break;
      default:
        now.setDate(now.getDate() + 7);
    }
    return now.toISOString();
  }

  /**
   * Notify stakeholders
   */
  async notifyAllStakeholders(resolution, level) {
    const notification = {
      level,
      resolutionId: resolution.id,
      drift: resolution.driftReport.overallDrift,
      severity: resolution.driftReport.severity,
      timestamp: new Date().toISOString(),
      message: this.getNotificationMessage(level, resolution)
    };

    // Save notification
    const notificationPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'notifications',
      `drift-${level}-${resolution.id}.json`
    );

    await fs.ensureDir(path.dirname(notificationPath));
    await fs.writeJSON(notificationPath, notification, { spaces: 2 });

    // Update escalations
    const escalationPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'stakeholder-escalations.md'
    );

    let escalation = await fs.readFile(escalationPath, 'utf8').catch(() => '# Stakeholder Escalations\n\n');
    escalation += `\n## ${level.toUpperCase()}: Context Drift - ${notification.timestamp}\n`;
    escalation += notification.message;
    escalation += `\n\nResolution ID: ${resolution.id}\n\n`;

    await fs.writeFile(escalationPath, escalation, 'utf8');
  }

  /**
   * Get notification message
   */
  getNotificationMessage(level, resolution) {
    const messages = {
      emergency: `🚨 CRITICAL CONTEXT DRIFT DETECTED!
Project has drifted ${resolution.driftReport.overallDrift}% from stated goals.
All development is BLOCKED until resolution.
Emergency meeting required IMMEDIATELY.`,
      
      intervention: `⚠️ Major context drift requires intervention.
Drift level: ${resolution.driftReport.overallDrift}%
Non-critical work paused. Review meeting scheduled.
Action required within 24 hours.`,
      
      collaborative: `🤝 Moderate drift detected - collaborative review needed.
Drift level: ${resolution.driftReport.overallDrift}%
Please review analysis and provide input.`,
      
      informational: `ℹ️ Minor drift detected.
Drift level: ${resolution.driftReport.overallDrift}%
Monitoring increased. No immediate action required.`
    };

    return messages[level] || messages.informational;
  }

  /**
   * Complete resolution
   */
  async completeResolution(resolutionId, outcome) {
    const resolution = this.activeResolutions.get(resolutionId);
    if (!resolution) {
      throw new Error(`Resolution ${resolutionId} not found`);
    }

    resolution.status = 'completed';
    resolution.endTime = new Date();
    resolution.outcome = outcome;
    resolution.duration = resolution.endTime - resolution.startTime;

    // Update resolution document
    await this.updateResolutionDocument(resolution);

    // Clear any blocks
    if (resolution.strategy === 'emergency' || resolution.strategy === 'intervention') {
      await this.clearDevelopmentBlock(resolution);
    }

    // Archive resolution
    await this.archiveResolution(resolution);

    this.activeResolutions.delete(resolutionId);

    return resolution;
  }

  /**
   * Clear development block
   */
  async clearDevelopmentBlock(resolution) {
    const workflowStatePath = path.join(
      this.projectRoot, 'project-state', 'workflow-state.json'
    );

    if (await fs.pathExists(workflowStatePath)) {
      const state = await fs.readJSON(workflowStatePath);
      state.development_blocked = false;
      delete state.block_reason;
      delete state.blocked_at;
      state.unblocked_at = new Date().toISOString();
      
      await fs.writeJSON(workflowStatePath, state, { spaces: 2 });
    }

    // Remove blocking notice
    const noticePath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'DEVELOPMENT-BLOCKED.md'
    );

    if (await fs.pathExists(noticePath)) {
      await fs.unlink(noticePath);
    }
  }

  /**
   * Archive resolution
   */
  async archiveResolution(resolution) {
    const archivePath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'drift-resolution', 'archive',
      `${resolution.id}-completed.json`
    );

    await fs.ensureDir(path.dirname(archivePath));
    await fs.writeJSON(archivePath, resolution, { spaces: 2 });

    // Generate learning from resolution
    if (resolution.outcome && resolution.outcome.lessonsLearned) {
      await this.generateLearning(resolution);
    }
  }

  /**
   * Generate learning from resolution
   */
  async generateLearning(resolution) {
    const learning = {
      id: `learning-${resolution.id}`,
      timestamp: new Date().toISOString(),
      context: 'drift-resolution',
      driftLevel: resolution.driftReport.overallDrift,
      severity: resolution.driftReport.severity,
      resolution: {
        strategy: resolution.strategy,
        duration: resolution.duration,
        outcome: resolution.outcome.status
      },
      lessonsLearned: resolution.outcome.lessonsLearned,
      preventionMeasures: resolution.outcome.preventionMeasures || [],
      pattern: this.identifyPattern(resolution)
    };

    // Save learning
    const learningPath = path.join(
      this.projectRoot, 'community-learnings',
      'analysis', 'drift-resolutions',
      `${learning.id}.json`
    );

    await fs.ensureDir(path.dirname(learningPath));
    await fs.writeJSON(learningPath, learning, { spaces: 2 });

    return learning;
  }

  /**
   * Identify pattern from resolution
   */
  identifyPattern(resolution) {
    const patterns = [];

    // Check for common patterns
    if (resolution.driftReport.checks.find(c => c.name === 'backlog' && c.drift > 60)) {
      patterns.push('backlog-misalignment');
    }
    
    if (resolution.driftReport.checks.find(c => c.name === 'decisions' && c.drift > 60)) {
      patterns.push('decision-drift');
    }

    if (resolution.driftReport.overallDrift > 80) {
      patterns.push('severe-drift');
    }

    if (resolution.duration < 24 * 60 * 60 * 1000) { // Less than 24 hours
      patterns.push('quick-resolution');
    }

    return patterns;
  }

  /**
   * Update resolution document
   */
  async updateResolutionDocument(resolution) {
    const docPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'drift-resolution',
      `resolution-${resolution.id}.md`
    );

    let content = await fs.readFile(docPath, 'utf8');
    
    // Add completion section
    content += `\n\n## Resolution Complete

**End Time**: ${resolution.endTime.toISOString()}
**Duration**: ${Math.round(resolution.duration / 1000 / 60)} minutes
**Outcome**: ${resolution.outcome.status}

### Lessons Learned
${resolution.outcome.lessonsLearned.map(l => `- ${l}`).join('\n')}

### Prevention Measures Implemented
${(resolution.outcome.preventionMeasures || []).map(m => `- ${m}`).join('\n')}

### Final Actions
${resolution.actions.slice(-5).map(a => `- [${a.timestamp.toISOString()}] ${a.type}`).join('\n')}
`;

    await fs.writeFile(docPath, content, 'utf8');
  }
}

// Export singleton instance
module.exports = new DriftResolutionCoordinator();