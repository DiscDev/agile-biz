/**
 * Context Drift Monitoring Hook
 * 
 * Monitors for context drift and triggers alerts
 */

const driftDetector = require('../../../machine-data/context-verification/drift-detector');

class DriftMonitorHook {
  constructor() {
    this.name = 'drift-monitor';
    this.description = 'Monitors project context drift over time';
    this.category = 'monitoring';
    this.events = ['session.start', 'workflow.phase.complete', 'sprint.complete'];
    this.enabled = true;
    this.config = {
      autoStartMonitoring: true,
      checkIntervalMinutes: 60,
      alertOnMajorDrift: true,
      includeInDashboard: true
    };
    this.isMonitoring = false;
  }

  /**
   * Initialize the hook
   */
  async initialize() {
    // Start monitoring if configured
    if (this.config.autoStartMonitoring) {
      try {
        await this.startMonitoring();
      } catch (error) {
        console.warn(`[${this.name}] Failed to start monitoring: ${error.message}`);
        this.enabled = false;
      }
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
      switch (event) {
        case 'session.start':
          // Ensure monitoring is running
          if (!this.isMonitoring && this.config.autoStartMonitoring) {
            await this.startMonitoring();
          }
          break;

        case 'workflow.phase.complete':
          // Perform drift check after phase completion
          console.log('\n🔍 Checking context drift after phase completion...');
          const phaseReport = await driftDetector.checkDriftNow();
          
          return {
            success: true,
            driftCheck: {
              drift: phaseReport.overallDrift,
              severity: phaseReport.severity,
              phase: data.phase
            }
          };

        case 'sprint.complete':
          // Comprehensive drift check after sprint
          console.log('\n🔍 Performing comprehensive drift analysis after sprint...');
          const sprintReport = await driftDetector.checkDriftNow();
          
          // Generate sprint drift summary
          await this.generateSprintDriftSummary(data.sprintName, sprintReport);
          
          return {
            success: true,
            driftCheck: {
              drift: sprintReport.overallDrift,
              severity: sprintReport.severity,
              sprint: data.sprintName
            }
          };
      }

      return { success: true };

    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start drift monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    try {
      await driftDetector.startMonitoring(this.config.checkIntervalMinutes);
      this.isMonitoring = true;
      console.log(`✅ Context drift monitoring started`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stop drift monitoring
   */
  stopMonitoring() {
    if (this.isMonitoring) {
      driftDetector.stopMonitoring();
      this.isMonitoring = false;
      console.log(`⏹️ Context drift monitoring stopped`);
    }
  }

  /**
   * Generate sprint drift summary
   */
  async generateSprintDriftSummary(sprintName, report) {
    const fs = require('fs-extra');
    const path = require('path');
    
    const summaryPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration', 'sprints',
      sprintName, 'review', 'context-drift-summary.md'
    );

    let summary = `# Sprint Context Drift Summary\n\n`;
    summary += `Sprint: ${sprintName}\n`;
    summary += `Analysis Date: ${report.timestamp}\n\n`;

    summary += `## Overall Assessment\n\n`;
    summary += `- **Drift Level**: ${report.overallDrift}%\n`;
    summary += `- **Severity**: ${report.severity.toUpperCase()}\n\n`;

    summary += `## Drift by Area\n\n`;
    summary += `| Area | Drift % | Status |\n`;
    summary += `|------|---------|--------|\n`;
    
    report.checks.forEach(check => {
      if (!check.error) {
        const status = check.drift > 60 ? '🔴' : check.drift > 40 ? '🟡' : '🟢';
        summary += `| ${check.name} | ${check.drift}% | ${status} |\n`;
      }
    });

    summary += `\n## Key Findings\n\n`;
    
    // List high-drift items
    report.checks.forEach(check => {
      if (check.drift > 40 && check.items && check.items.length > 0) {
        summary += `### ${check.name} (${check.drift}% drift)\n\n`;
        check.items.slice(0, 3).forEach(item => {
          summary += `- ${item.title || item.file || item.decision || 'Item'}: ${item.confidence}% confidence\n`;
        });
        summary += '\n';
      }
    });

    summary += `## Recommendations for Next Sprint\n\n`;
    report.recommendations.forEach((rec, i) => {
      summary += `${i + 1}. ${rec}\n`;
    });

    summary += `\n## Action Items\n\n`;
    if (report.severity === 'critical' || report.severity === 'major') {
      summary += `- [ ] Schedule stakeholder review meeting\n`;
      summary += `- [ ] Review and update Project Truth document\n`;
      summary += `- [ ] Audit all backlog items for alignment\n`;
      summary += `- [ ] Create action plan to restore alignment\n`;
    } else if (report.severity === 'moderate') {
      summary += `- [ ] Review flagged items in sprint planning\n`;
      summary += `- [ ] Reinforce project context with team\n`;
      summary += `- [ ] Monitor drift in next sprint\n`;
    } else {
      summary += `- [ ] Continue monitoring drift trends\n`;
      summary += `- [ ] Maintain current practices\n`;
    }

    // Ensure directory exists
    await fs.ensureDir(path.dirname(summaryPath));
    
    // Write summary
    await fs.writeFile(summaryPath, summary, 'utf8');
    
    console.log(`📄 Sprint drift summary saved to: ${summaryPath}`);
  }

  /**
   * Get current drift status
   */
  getDriftStatus() {
    return driftDetector.getDriftStatus();
  }

  /**
   * Manual drift check command
   */
  async checkDriftNow() {
    console.log('\n🔍 Running manual drift check...');
    const report = await driftDetector.checkDriftNow();
    
    console.log(`\nDrift Check Results:`);
    console.log(`  Overall Drift: ${report.overallDrift}%`);
    console.log(`  Severity: ${report.severity}`);
    
    return report;
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
      config: this.config,
      status: {
        monitoring: this.isMonitoring,
        driftStatus: this.getDriftStatus()
      }
    };
  }

  /**
   * Update hook configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Handle monitoring changes
    if (newConfig.autoStartMonitoring !== undefined) {
      if (newConfig.autoStartMonitoring && !this.isMonitoring) {
        this.startMonitoring().catch(console.error);
      } else if (!newConfig.autoStartMonitoring && this.isMonitoring) {
        this.stopMonitoring();
      }
    }
    
    // Update check interval if monitoring
    if (newConfig.checkIntervalMinutes && this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring().catch(console.error);
    }
  }

  /**
   * Cleanup on shutdown
   */
  cleanup() {
    this.stopMonitoring();
  }
}

module.exports = new DriftMonitorHook();