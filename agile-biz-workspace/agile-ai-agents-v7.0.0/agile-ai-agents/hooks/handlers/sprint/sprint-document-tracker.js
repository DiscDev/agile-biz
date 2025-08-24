#!/usr/bin/env node

/**
 * Sprint Document Tracker Hook Handler
 * Tracks changes to sprint documents and updates metrics
 */

const fs = require('fs');
const path = require('path');

class SprintDocumentTracker {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.metricsPath = path.join(
      this.projectRoot,
      'project-documents/orchestration/product-backlog/velocity-metrics.json'
    );
  }

  parseContext() {
    return {
      filePath: process.env.FILE_PATH || process.argv[2],
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  async execute() {
    try {
      const { filePath } = this.context;
      
      if (!filePath || !this.isSprintDocument(filePath)) {
        return { status: 'skipped', reason: 'Not a sprint document' };
      }

      // Extract sprint information
      const sprintInfo = this.extractSprintInfo(filePath);
      if (!sprintInfo) {
        return { status: 'skipped', reason: 'Could not extract sprint info' };
      }

      // Determine document type and take action
      const documentType = this.getDocumentType(filePath);
      const result = await this.processDocument(documentType, sprintInfo);

      // Update velocity metrics if needed
      if (result.updateMetrics) {
        await this.updateVelocityMetrics(sprintInfo, result);
      }

      // Check for pulse trigger conditions
      const pulseNeeded = this.checkPulseTrigger(documentType, result);
      if (pulseNeeded) {
        result.pulseTrigger = pulseNeeded;
      }

      return {
        status: 'success',
        documentType,
        sprintInfo,
        result
      };

    } catch (error) {
      console.error('Sprint tracking failed:', error);
      throw error;
    }
  }

  isSprintDocument(filePath) {
    return filePath.includes('/sprints/') && 
           (filePath.endsWith('.md') || filePath.endsWith('.json'));
  }

  extractSprintInfo(filePath) {
    const match = filePath.match(/sprint-([\d-]+)-([^/]+)/);
    if (!match) return null;

    return {
      sprintId: match[0],
      date: match[1],
      featureName: match[2],
      fullPath: filePath
    };
  }

  getDocumentType(filePath) {
    const filename = path.basename(filePath);
    
    const documentTypes = {
      'state.md': 'state',
      'planning.md': 'planning',
      'review.md': 'review',
      'retrospective.md': 'retrospective',
      'testing-report.md': 'testing',
      'document-registry.md': 'registry',
      'backlog-snapshot.json': 'backlog'
    };

    // Check for pulse updates
    if (filePath.includes('/pulse-updates/')) {
      return 'pulse';
    }

    return documentTypes[filename] || 'other';
  }

  async processDocument(documentType, sprintInfo) {
    const processors = {
      'state': () => this.processStateChange(sprintInfo),
      'planning': () => this.processPlanningUpdate(sprintInfo),
      'review': () => this.processReviewComplete(sprintInfo),
      'retrospective': () => this.processRetrospective(sprintInfo),
      'testing': () => this.processTestingUpdate(sprintInfo),
      'pulse': () => this.processPulseUpdate(sprintInfo),
      'backlog': () => this.processBacklogUpdate(sprintInfo)
    };

    const processor = processors[documentType];
    if (processor) {
      return await processor();
    }

    return { processed: false };
  }

  async processStateChange(sprintInfo) {
    const statePath = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintInfo.sprintId,
      'state.md'
    );

    if (!fs.existsSync(statePath)) {
      return { processed: false };
    }

    const content = fs.readFileSync(statePath, 'utf8');
    const currentState = this.extractState(content);
    
    // Check for state transitions
    const transitions = {
      'planning': { next: 'active', metric: 'sprints_started' },
      'active': { next: 'testing', metric: 'sprints_in_progress' },
      'testing': { next: 'review', metric: 'sprints_testing' },
      'review': { next: 'retrospective', metric: 'sprints_reviewing' },
      'retrospective': { next: 'completed', metric: 'sprints_completed' }
    };

    if (transitions[currentState]) {
      return {
        processed: true,
        stateTransition: true,
        fromState: currentState,
        updateMetrics: true,
        metricType: transitions[currentState].metric
      };
    }

    return { processed: true, currentState };
  }

  async processPlanningUpdate(sprintInfo) {
    // Extract planned points from planning document
    const planningPath = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintInfo.sprintId,
      'planning.md'
    );

    if (!fs.existsSync(planningPath)) {
      return { processed: false };
    }

    const content = fs.readFileSync(planningPath, 'utf8');
    const plannedPoints = this.extractPlannedPoints(content);

    return {
      processed: true,
      plannedPoints,
      updateMetrics: true,
      metricType: 'sprint_planned'
    };
  }

  async processReviewComplete(sprintInfo) {
    // Extract completed points from review
    const reviewPath = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintInfo.sprintId,
      'review.md'
    );

    if (!fs.existsSync(reviewPath)) {
      return { processed: false };
    }

    const content = fs.readFileSync(reviewPath, 'utf8');
    const completedPoints = this.extractCompletedPoints(content);
    const velocity = completedPoints; // Actual velocity for this sprint

    return {
      processed: true,
      completedPoints,
      velocity,
      updateMetrics: true,
      metricType: 'sprint_completed'
    };
  }

  async processRetrospective(sprintInfo) {
    // Trigger learning contribution prompt
    return {
      processed: true,
      triggerContribution: true,
      contributionType: 'sprint_retrospective',
      updateMetrics: false
    };
  }

  async processTestingUpdate(sprintInfo) {
    const testingPath = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintInfo.sprintId,
      'testing-report.md'
    );

    if (!fs.existsSync(testingPath)) {
      return { processed: false };
    }

    const content = fs.readFileSync(testingPath, 'utf8');
    const testResults = this.extractTestResults(content);

    return {
      processed: true,
      testResults,
      updateMetrics: testResults.allPassed,
      metricType: 'tests_passed'
    };
  }

  async processPulseUpdate(sprintInfo) {
    // Count pulse updates for this sprint
    const pulsePath = path.join(
      this.projectRoot,
      'project-documents/orchestration/sprints',
      sprintInfo.sprintId,
      'pulse-updates'
    );

    let pulseCount = 0;
    if (fs.existsSync(pulsePath)) {
      pulseCount = fs.readdirSync(pulsePath).length;
    }

    return {
      processed: true,
      pulseCount,
      updateMetrics: false
    };
  }

  async processBacklogUpdate(sprintInfo) {
    // Track backlog changes during sprint
    return {
      processed: true,
      backlogUpdated: true,
      updateMetrics: true,
      metricType: 'backlog_refined'
    };
  }

  checkPulseTrigger(documentType, result) {
    // Determine if a pulse update should be generated
    const triggers = {
      'state': result.stateTransition,
      'testing': result.testResults && !result.testResults.allPassed,
      'review': result.completedPoints > 0
    };

    if (triggers[documentType]) {
      return {
        type: this.getPulseType(documentType, result),
        reason: this.getPulseReason(documentType, result)
      };
    }

    return null;
  }

  getPulseType(documentType, result) {
    const typeMap = {
      'state': 'sprint-phase-change',
      'testing': 'test-failure',
      'review': 'sprint-complete'
    };
    return typeMap[documentType] || 'update';
  }

  getPulseReason(documentType, result) {
    if (documentType === 'state' && result.stateTransition) {
      return `Sprint transitioned from ${result.fromState}`;
    }
    if (documentType === 'testing' && result.testResults) {
      return `${result.testResults.failed} tests failed`;
    }
    if (documentType === 'review' && result.completedPoints) {
      return `Sprint completed with ${result.completedPoints} points`;
    }
    return 'Sprint update';
  }

  async updateVelocityMetrics(sprintInfo, result) {
    try {
      // Load current metrics
      let metrics = {};
      if (fs.existsSync(this.metricsPath)) {
        metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
      }

      // Initialize if needed
      if (!metrics.sprints) {
        metrics.sprints = {};
      }
      if (!metrics.summary) {
        metrics.summary = {
          total_sprints: 0,
          completed_sprints: 0,
          total_points_planned: 0,
          total_points_completed: 0,
          average_velocity: 0
        };
      }

      // Update sprint-specific data
      if (!metrics.sprints[sprintInfo.sprintId]) {
        metrics.sprints[sprintInfo.sprintId] = {
          start_date: sprintInfo.date,
          feature: sprintInfo.featureName,
          planned_points: 0,
          completed_points: 0,
          state: 'planning'
        };
      }

      const sprint = metrics.sprints[sprintInfo.sprintId];

      // Apply updates based on metric type
      switch (result.metricType) {
        case 'sprint_planned':
          sprint.planned_points = result.plannedPoints;
          metrics.summary.total_points_planned += result.plannedPoints;
          break;

        case 'sprint_completed':
          sprint.completed_points = result.completedPoints;
          sprint.velocity = result.velocity;
          sprint.state = 'completed';
          metrics.summary.completed_sprints++;
          metrics.summary.total_points_completed += result.completedPoints;
          
          // Recalculate average velocity
          if (metrics.summary.completed_sprints > 0) {
            metrics.summary.average_velocity = Math.round(
              metrics.summary.total_points_completed / 
              metrics.summary.completed_sprints
            );
          }
          break;

        case 'sprints_started':
          sprint.state = 'active';
          sprint.start_timestamp = new Date().toISOString();
          metrics.summary.total_sprints++;
          break;

        case 'tests_passed':
          sprint.tests_passed = result.testResults.passed;
          sprint.tests_total = result.testResults.total;
          break;
      }

      // Update timestamp
      metrics.last_updated = new Date().toISOString();

      // Save metrics
      fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));

      return { metricsUpdated: true };

    } catch (error) {
      console.error('Failed to update velocity metrics:', error);
      return { metricsUpdated: false, error: error.message };
    }
  }

  extractState(content) {
    const match = content.match(/Current State:\s*(\w+)/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  extractPlannedPoints(content) {
    const match = content.match(/Total Points:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  extractCompletedPoints(content) {
    const match = content.match(/Completed Points:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  extractTestResults(content) {
    const passedMatch = content.match(/Tests Passed:\s*(\d+)/i);
    const totalMatch = content.match(/Total Tests:\s*(\d+)/i);
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const total = totalMatch ? parseInt(totalMatch[1]) : 0;
    
    return {
      passed,
      total,
      failed: total - passed,
      allPassed: passed === total && total > 0
    };
  }
}

if (require.main === module) {
  const tracker = new SprintDocumentTracker();
  tracker.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = SprintDocumentTracker;