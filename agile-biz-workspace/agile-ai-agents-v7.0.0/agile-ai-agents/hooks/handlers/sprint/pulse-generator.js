#!/usr/bin/env node

/**
 * Pulse Generator Hook Handler
 * Creates AI-native pulse updates for significant sprint events
 */

const fs = require('fs');
const path = require('path');

class PulseGenerator {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.batchQueue = [];
    this.batchTimeout = null;
  }

  parseContext() {
    return {
      eventType: process.env.PULSE_TYPE || process.argv[2],
      sprintId: process.env.SPRINT_ID || process.argv[3],
      eventData: process.env.EVENT_DATA ? JSON.parse(process.env.EVENT_DATA) : {},
      activeAgent: process.env.ACTIVE_AGENT || 'scrum_master',
      timestamp: new Date().toISOString()
    };
  }

  async execute() {
    try {
      const { eventType, sprintId, eventData } = this.context;
      
      if (!eventType || !sprintId) {
        return { status: 'skipped', reason: 'Missing event type or sprint ID' };
      }

      // Check if event should be batched
      if (this.shouldBatch(eventType)) {
        return await this.addToBatch(eventType, sprintId, eventData);
      }

      // Generate pulse immediately for critical events
      const pulse = await this.generatePulse(eventType, sprintId, eventData);
      
      return {
        status: 'success',
        pulseCreated: pulse.filePath,
        eventType,
        sprintId
      };

    } catch (error) {
      console.error('Pulse generation failed:', error);
      throw error;
    }
  }

  shouldBatch(eventType) {
    const batchableEvents = [
      'task-update',
      'minor-blocker',
      'code-commit',
      'review-comment'
    ];
    
    return batchableEvents.includes(eventType);
  }

  async addToBatch(eventType, sprintId, eventData) {
    this.batchQueue.push({
      eventType,
      sprintId,
      eventData,
      timestamp: new Date().toISOString()
    });

    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Set new timeout for batch processing (60 seconds)
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, 60000);

    return {
      status: 'queued',
      queueSize: this.batchQueue.length,
      message: 'Event added to batch queue'
    };
  }

  async processBatch() {
    if (this.batchQueue.length === 0) return;

    const events = [...this.batchQueue];
    this.batchQueue = [];

    // Group by sprint
    const eventsBySprint = {};
    events.forEach(event => {
      if (!eventsBySprint[event.sprintId]) {
        eventsBySprint[event.sprintId] = [];
      }
      eventsBySprint[event.sprintId].push(event);
    });

    // Generate batch pulse for each sprint
    for (const [sprintId, sprintEvents] of Object.entries(eventsBySprint)) {
      await this.generatePulse('batch-update', sprintId, { events: sprintEvents });
    }
  }

  async generatePulse(eventType, sprintId, eventData) {
    // Create pulse directory if it doesn't exist
    const pulseDir = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintId,
      'pulse-updates'
    );

    if (!fs.existsSync(pulseDir)) {
      fs.mkdirSync(pulseDir, { recursive: true });
    }

    // Generate pulse filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `pulse-${timestamp}-${eventType}.md`;
    const filePath = path.join(pulseDir, fileName);

    // Generate pulse content
    const content = this.generatePulseContent(eventType, sprintId, eventData);

    // Write pulse file
    fs.writeFileSync(filePath, content);

    // Update sprint summary
    await this.updateSprintSummary(sprintId, eventType);

    return { filePath, fileName };
  }

  generatePulseContent(eventType, sprintId, eventData) {
    const templates = {
      'sprint-start': this.sprintStartTemplate,
      'story-done': this.storyDoneTemplate,
      'blocker-new': this.blockerNewTemplate,
      'blocker-resolved': this.blockerResolvedTemplate,
      'milestone-reached': this.milestoneTemplate,
      'sprint-phase-change': this.phaseChangeTemplate,
      'test-failure': this.testFailureTemplate,
      'sprint-complete': this.sprintCompleteTemplate,
      'batch-update': this.batchUpdateTemplate
    };

    const template = templates[eventType] || this.defaultTemplate;
    return template.call(this, sprintId, eventData);
  }

  sprintStartTemplate(sprintId, data) {
    return `# Sprint Pulse: Sprint Started

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: sprint-start
**Agent**: ${this.context.activeAgent}

## Event Details

Sprint has officially started with the following configuration:

- **Planned Points**: ${data.plannedPoints || 0}
- **Team Members**: ${data.teamSize || 'AI Agents'}
- **Sprint Goal**: ${data.sprintGoal || 'Not specified'}

## Initial State

- Total Stories: ${data.storyCount || 0}
- Critical Path Items: ${data.criticalItems || 0}
- Known Risks: ${data.risks || 'None identified'}

## Next Actions

1. All agents to review assigned tasks
2. Identify any immediate blockers
3. Confirm technical approach for critical items

---
*Generated by AI-Native Pulse System*`;
  }

  storyDoneTemplate(sprintId, data) {
    return `# Sprint Pulse: Story Completed

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: story-done
**Agent**: ${this.context.activeAgent}

## Completed Story

**Story ID**: ${data.storyId}
**Title**: ${data.storyTitle}
**Points**: ${data.points}
**Completion Time**: ${data.completionTime || 'N/A'}

## Impact

- Sprint Progress: ${data.progressPercentage || 0}%
- Remaining Points: ${data.remainingPoints || 0}
- Velocity Trend: ${data.velocityTrend || 'On Track'}

## Quality Metrics

- Tests Passed: ${data.testsPassed || 0}/${data.totalTests || 0}
- Code Coverage: ${data.coverage || 'N/A'}
- Review Status: ${data.reviewStatus || 'Pending'}

${data.blockers ? `## Blockers Encountered\n${data.blockers}` : ''}

---
*Generated by AI-Native Pulse System*`;
  }

  blockerNewTemplate(sprintId, data) {
    return `# Sprint Pulse: New Blocker

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: blocker-new
**Agent**: ${this.context.activeAgent}

## 🚨 Blocker Details

**Severity**: ${data.severity || 'High'}
**Affected Stories**: ${data.affectedStories || 'Multiple'}
**Category**: ${data.category || 'Technical'}

## Description

${data.description || 'No description provided'}

## Impact Analysis

- **Sprint Risk**: ${data.sprintRisk || 'High'}
- **Points at Risk**: ${data.pointsAtRisk || 0}
- **Estimated Resolution Time**: ${data.estimatedTime || 'Unknown'}

## Proposed Solutions

${data.proposedSolutions || '1. Investigating root cause\n2. Preparing mitigation options'}

## Escalation

${data.needsEscalation ? '**⚠️ This blocker requires stakeholder attention**' : 'Being handled by development team'}

---
*Generated by AI-Native Pulse System*`;
  }

  blockerResolvedTemplate(sprintId, data) {
    return `# Sprint Pulse: Blocker Resolved

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: blocker-resolved
**Agent**: ${this.context.activeAgent}

## ✅ Resolution Details

**Blocker ID**: ${data.blockerId || 'N/A'}
**Resolution Time**: ${data.resolutionTime || 'N/A'}
**Resolved By**: ${data.resolvedBy || this.context.activeAgent}

## Solution Applied

${data.solution || 'Solution details not provided'}

## Impact

- **Stories Unblocked**: ${data.storiesUnblocked || 0}
- **Points Recovered**: ${data.pointsRecovered || 0}
- **Sprint Status**: ${data.sprintStatus || 'Back on Track'}

## Lessons Learned

${data.lessonsLearned || 'To be documented in retrospective'}

---
*Generated by AI-Native Pulse System*`;
  }

  milestoneTemplate(sprintId, data) {
    return `# Sprint Pulse: Milestone Reached

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: milestone-reached
**Agent**: ${this.context.activeAgent}

## 🎯 Milestone Achievement

**Progress**: ${data.percentage}% Complete
**Points Completed**: ${data.pointsCompleted || 0}
**Points Remaining**: ${data.pointsRemaining || 0}

## Velocity Analysis

- **Current Velocity**: ${data.currentVelocity || 0} points/sprint
- **Projected Completion**: ${data.projectedCompletion || 'On Schedule'}
- **Confidence Level**: ${data.confidence || 'High'}

## Key Accomplishments

${data.accomplishments || '- Core features implemented\n- All tests passing\n- No critical bugs'}

## Upcoming Focus

${data.upcomingFocus || '- Complete remaining stories\n- Comprehensive testing\n- Performance optimization'}

---
*Generated by AI-Native Pulse System*`;
  }

  phaseChangeTemplate(sprintId, data) {
    return `# Sprint Pulse: Phase Transition

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: sprint-phase-change
**Agent**: ${this.context.activeAgent}

## Phase Transition

**From**: ${data.fromPhase || 'Unknown'}
**To**: ${data.toPhase || 'Unknown'}
**Transition Time**: ${this.context.timestamp}

## Phase Summary

### Completed in Previous Phase
${data.completedItems || '- All planned items completed\n- Quality gates passed'}

### Ready for New Phase
${data.readyItems || '- All prerequisites met\n- Resources allocated\n- Environments prepared'}

## Next Phase Focus

${data.nextPhaseFocus || 'Continue with planned activities'}

## Risks and Mitigations

${data.risks || 'No new risks identified'}

---
*Generated by AI-Native Pulse System*`;
  }

  testFailureTemplate(sprintId, data) {
    return `# Sprint Pulse: Test Failure Alert

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: test-failure
**Agent**: ${this.context.activeAgent}

## ❌ Test Results

**Failed Tests**: ${data.failedCount || 0}
**Total Tests**: ${data.totalTests || 0}
**Pass Rate**: ${data.passRate || 0}%

## Failed Test Details

${data.failedTests || 'Test details not available'}

## Impact Assessment

- **Affected Features**: ${data.affectedFeatures || 'Multiple'}
- **Severity**: ${data.severity || 'High'}
- **Sprint Risk**: ${data.sprintRisk || 'Medium'}

## Action Items

1. ${data.actionItems || 'Investigate root cause'}
2. Fix identified issues
3. Re-run test suite
4. Update test documentation

## Assignment

**Assigned To**: ${data.assignedTo || 'Testing Agent & Coder Agent'}
**Priority**: ${data.priority || 'High'}

---
*Generated by AI-Native Pulse System*`;
  }

  sprintCompleteTemplate(sprintId, data) {
    return `# Sprint Pulse: Sprint Completed

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: sprint-complete
**Agent**: ${this.context.activeAgent}

## 🎉 Sprint Summary

**Status**: COMPLETED
**Duration**: ${data.duration || 'Standard'}
**Final Velocity**: ${data.velocity || 0} points

## Completion Metrics

- **Planned Points**: ${data.plannedPoints || 0}
- **Completed Points**: ${data.completedPoints || 0}
- **Completion Rate**: ${data.completionRate || 0}%

## Quality Metrics

- **Tests Passed**: ${data.testsPassed || 0}/${data.totalTests || 0}
- **Bug Count**: ${data.bugCount || 0}
- **Technical Debt**: ${data.technicalDebt || 'Minimal'}

## Key Achievements

${data.achievements || '- All critical features delivered\n- Quality standards met\n- No major incidents'}

## Items for Next Sprint

${data.carryOver || 'No items to carry over'}

## Retrospective Scheduled

Please prepare for sprint retrospective to capture learnings and improvements.

---
*Generated by AI-Native Pulse System*`;
  }

  batchUpdateTemplate(sprintId, data) {
    const events = data.events || [];
    const eventSummary = this.summarizeEvents(events);

    return `# Sprint Pulse: Batch Update

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: batch-update
**Agent**: ${this.context.activeAgent}

## Batch Summary

**Events Processed**: ${events.length}
**Time Range**: ${this.getTimeRange(events)}

## Event Breakdown

${eventSummary}

## Aggregate Impact

- **Net Progress**: ${this.calculateNetProgress(events)}
- **Active Blockers**: ${this.countActiveBlockers(events)}
- **Completed Items**: ${this.countCompletedItems(events)}

## Notable Changes

${this.extractNotableChanges(events)}

---
*Generated by AI-Native Pulse System*`;
  }

  defaultTemplate(sprintId, data) {
    return `# Sprint Pulse: Update

**Sprint**: ${sprintId}
**Timestamp**: ${this.context.timestamp}
**Type**: ${this.context.eventType}
**Agent**: ${this.context.activeAgent}

## Event Details

${JSON.stringify(data, null, 2)}

---
*Generated by AI-Native Pulse System*`;
  }

  summarizeEvents(events) {
    const summary = {};
    events.forEach(event => {
      summary[event.eventType] = (summary[event.eventType] || 0) + 1;
    });

    return Object.entries(summary)
      .map(([type, count]) => `- ${type}: ${count}`)
      .join('\n');
  }

  getTimeRange(events) {
    if (events.length === 0) return 'N/A';
    
    const timestamps = events.map(e => new Date(e.timestamp));
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));
    
    return `${earliest.toISOString()} to ${latest.toISOString()}`;
  }

  calculateNetProgress(events) {
    let progress = 0;
    events.forEach(event => {
      if (event.eventType === 'story-done') {
        progress += event.eventData.points || 0;
      }
    });
    return `+${progress} points`;
  }

  countActiveBlockers(events) {
    let blockers = 0;
    events.forEach(event => {
      if (event.eventType === 'blocker-new') blockers++;
      if (event.eventType === 'blocker-resolved') blockers--;
    });
    return Math.max(0, blockers);
  }

  countCompletedItems(events) {
    return events.filter(e => e.eventType === 'story-done').length;
  }

  extractNotableChanges(events) {
    const notable = [];
    
    events.forEach(event => {
      if (event.eventType === 'blocker-new' && event.eventData.severity === 'Critical') {
        notable.push(`🚨 Critical blocker: ${event.eventData.description}`);
      }
      if (event.eventType === 'story-done' && event.eventData.points >= 8) {
        notable.push(`✅ Large story completed: ${event.eventData.storyTitle}`);
      }
    });

    return notable.length > 0 ? notable.join('\n') : 'No critical changes';
  }

  async updateSprintSummary(sprintId, eventType) {
    const summaryPath = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintId,
      'pulse-summary.json'
    );

    let summary = {};
    if (fs.existsSync(summaryPath)) {
      summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    }

    // Initialize summary structure
    if (!summary.pulseCount) {
      summary = {
        sprintId,
        pulseCount: 0,
        eventTypes: {},
        lastPulse: null,
        firstPulse: null
      };
    }

    // Update summary
    summary.pulseCount++;
    summary.eventTypes[eventType] = (summary.eventTypes[eventType] || 0) + 1;
    summary.lastPulse = this.context.timestamp;
    
    if (!summary.firstPulse) {
      summary.firstPulse = this.context.timestamp;
    }

    // Save updated summary
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }
}

if (require.main === module) {
  const generator = new PulseGenerator();
  generator.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = PulseGenerator;