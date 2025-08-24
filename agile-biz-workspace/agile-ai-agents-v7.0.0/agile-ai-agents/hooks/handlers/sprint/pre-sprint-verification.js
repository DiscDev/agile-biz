/**
 * Pre-Sprint Context Verification Hook
 * 
 * Verifies that all sprint items align with project context before sprint starts
 */

const fs = require('fs-extra');
const path = require('path');
const verificationEngine = require('../../../machine-data/context-verification/verification-engine');

class PreSprintVerificationHook {
  constructor() {
    this.name = 'pre-sprint-verification';
    this.description = 'Verify sprint items align with project context';
    this.category = 'sprint';
    this.events = ['sprint.planning.complete', 'sprint.about.to.start'];
    this.enabled = true;
    this.config = {
      blockOnViolations: true,
      requireReview: ['blocked', 'review'],
      notifyAgents: ['project_manager', 'scrum_master'],
      generateReport: true
    };
  }

  /**
   * Initialize the hook
   */
  async initialize() {
    // Initialize verification engine
    const result = await verificationEngine.initialize();
    if (!result.success) {
      console.warn(`[${this.name}] Failed to initialize verification engine: ${result.message}`);
      this.enabled = false;
    }
  }

  /**
   * Handle hook events
   */
  async handle(event, data) {
    if (!this.enabled) {
      return { success: true, skipped: true };
    }

    try {
      // Check if we have a project truth document
      if (!verificationEngine.currentTruth) {
        return {
          success: true,
          warning: 'No project truth document found. Sprint proceeding without context verification.',
          recommendation: 'Create project truth with /verify-context --create-truth'
        };
      }

      // Get sprint information
      const sprintName = data.sprintName || this.getCurrentSprintName();
      
      console.log(`\n🎯 Pre-Sprint Context Verification for ${sprintName}`);
      
      // Verify sprint tasks
      const verificationResult = await verificationEngine.verifySprintTasks(sprintName);
      
      if (!verificationResult.success) {
        return {
          success: false,
          error: verificationResult.message
        };
      }

      const results = verificationResult.results;
      
      // Process results
      const violations = results.tasks.filter(t => t.status === 'blocked').length;
      const reviews = results.tasks.filter(t => t.status === 'review').length;
      const warnings = results.tasks.filter(t => t.status === 'warning').length;
      
      // Generate report if configured
      if (this.config.generateReport) {
        await this.generateVerificationReport(sprintName, results);
      }

      // Check if sprint can proceed
      if (!results.canProceed && this.config.blockOnViolations) {
        // Notify agents
        await this.notifyAgents(sprintName, results);
        
        return {
          success: false,
          blocked: true,
          message: `Sprint blocked: ${violations} context violations detected`,
          violations,
          reviews,
          warnings,
          report: `project-documents/orchestration/sprints/${sprintName}/context-verification-report.md`
        };
      }

      // Sprint can proceed but with warnings
      if (reviews > 0 || warnings > 0) {
        console.log(`⚠️ Sprint proceeding with ${reviews + warnings} items flagged for review`);
        
        return {
          success: true,
          warnings: reviews + warnings,
          message: `Sprint approved with ${reviews} reviews and ${warnings} warnings`,
          report: `project-documents/orchestration/sprints/${sprintName}/context-verification-report.md`
        };
      }

      // All clear
      console.log('✅ All sprint items align with project context');
      
      return {
        success: true,
        message: 'Sprint context verification passed',
        perfectAlignment: true
      };

    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current sprint name from workflow state
   */
  getCurrentSprintName() {
    try {
      const workflowStatePath = path.join(
        __dirname, '..', '..', '..',
        'project-state', 'workflow-state.json'
      );
      
      if (fs.existsSync(workflowStatePath)) {
        const state = fs.readJSONSync(workflowStatePath);
        if (state.active_sprint) {
          return state.active_sprint;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    // Fallback to date-based name
    const date = new Date().toISOString().split('T')[0];
    return `sprint-${date}`;
  }

  /**
   * Generate verification report
   */
  async generateVerificationReport(sprintName, results) {
    const reportPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration', 'sprints',
      sprintName, 'context-verification-report.md'
    );

    let report = `# Pre-Sprint Context Verification Report\n\n`;
    report += `Sprint: ${sprintName}\n`;
    report += `Verified: ${new Date().toISOString()}\n`;
    report += `Can Proceed: ${results.canProceed ? '✅ Yes' : '❌ No'}\n\n`;

    report += `## Summary\n\n`;
    report += `- Total Tasks: ${results.tasks.length}\n`;
    report += `- Aligned: ${results.tasks.filter(t => t.status === 'allowed').length}\n`;
    report += `- Warnings: ${results.tasks.filter(t => t.status === 'warning').length}\n`;
    report += `- Need Review: ${results.tasks.filter(t => t.status === 'review').length}\n`;
    report += `- Violations: ${results.tasks.filter(t => t.status === 'blocked').length}\n\n`;

    if (!results.canProceed) {
      report += `## 🚨 SPRINT BLOCKED\n\n`;
      report += `Critical context violations detected. Sprint cannot proceed until resolved.\n\n`;
    }

    // List violations
    const violations = results.tasks.filter(t => t.status === 'blocked');
    if (violations.length > 0) {
      report += `## Context Violations\n\n`;
      violations.forEach(task => {
        report += `### ❌ ${task.title}\n`;
        report += `- Confidence: ${task.confidence}%\n`;
        report += `- Issue: ${task.message}\n`;
        report += `- Action: ${task.recommendation}\n\n`;
      });
    }

    // List reviews needed
    const reviews = results.tasks.filter(t => t.status === 'review');
    if (reviews.length > 0) {
      report += `## Items Requiring Review\n\n`;
      reviews.forEach(task => {
        report += `### 🔍 ${task.title}\n`;
        report += `- Confidence: ${task.confidence}%\n`;
        report += `- Concern: ${task.message}\n`;
        report += `- Recommendation: ${task.recommendation}\n\n`;
      });
    }

    // List warnings
    const warnings = results.tasks.filter(t => t.status === 'warning');
    if (warnings.length > 0) {
      report += `## Warnings\n\n`;
      warnings.forEach(task => {
        report += `### ⚠️ ${task.title}\n`;
        report += `- Confidence: ${task.confidence}%\n`;
        report += `- Note: ${task.message}\n\n`;
      });
    }

    report += `## Recommendations\n\n`;
    if (!results.canProceed) {
      report += `1. Review all violations with Project Manager immediately\n`;
      report += `2. Either remove violating items or revise to align with project context\n`;
      report += `3. Update Project Truth document if scope has legitimately changed\n`;
      report += `4. Re-run verification after changes: /verify-context --verify-sprint ${sprintName}\n`;
    } else if (reviews.length > 0) {
      report += `1. Review flagged items with stakeholders before sprint begins\n`;
      report += `2. Clarify alignment or adjust items as needed\n`;
      report += `3. Document any scope clarifications in Project Truth\n`;
    } else {
      report += `1. Excellent alignment! Proceed with sprint as planned\n`;
      report += `2. Monitor for any drift during sprint execution\n`;
    }

    // Create directory if needed
    await fs.ensureDir(path.dirname(reportPath));
    
    // Write report
    await fs.writeFile(reportPath, report, 'utf8');
    
    console.log(`📄 Verification report saved to: ${reportPath}`);
  }

  /**
   * Notify relevant agents about verification results
   */
  async notifyAgents(sprintName, results) {
    // In a real implementation, this would trigger agent notifications
    console.log(`\n🔔 Notifying agents about sprint verification results:`);
    console.log(`   - Project Manager: ${results.tasks.filter(t => t.status === 'blocked').length} violations require resolution`);
    console.log(`   - Scrum Master: Sprint ${sprintName} is blocked pending context alignment`);
    
    // Create escalation document
    const escalationPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration',
      'stakeholder-escalations.md'
    );
    
    let escalation = await fs.readFile(escalationPath, 'utf8').catch(() => '# Stakeholder Escalations\n\n');
    
    escalation += `## Sprint Context Violation - ${new Date().toISOString()}\n\n`;
    escalation += `- **Sprint**: ${sprintName}\n`;
    escalation += `- **Issue**: ${results.tasks.filter(t => t.status === 'blocked').length} tasks violate project context\n`;
    escalation += `- **Action Required**: Review and resolve with Project Manager\n`;
    escalation += `- **Details**: See verification report in sprint folder\n\n`;
    
    await fs.writeFile(escalationPath, escalation, 'utf8');
  }

  /**
   * Get hook configuration
   */
  getConfig() {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      events: this.events,
      enabled: this.enabled,
      config: this.config
    };
  }

  /**
   * Update hook configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

module.exports = new PreSprintVerificationHook();