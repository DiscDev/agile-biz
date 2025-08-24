/**
 * Context Drift Detection System
 * 
 * Monitors project activities and detects when the project is drifting from its original context
 */

const fs = require('fs-extra');
const path = require('path');
const verificationEngine = require('./verification-engine');
const { calculateConfidenceScore } = require('./confidence-scorer');
const driftResolutionCoordinator = require('./drift-resolution-coordinator');

class DriftDetector {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.monitoringEnabled = false;
    this.driftHistory = [];
    this.driftThresholds = {
      minor: 20,      // 20% drift - informational
      moderate: 40,   // 40% drift - warning
      major: 60,      // 60% drift - alert
      critical: 80    // 80% drift - escalation
    };
    this.checkInterval = null;
    this.lastCheck = null;
  }

  /**
   * Start drift monitoring
   */
  async startMonitoring(intervalMinutes = 60) {
    // Initialize verification engine
    const initResult = await verificationEngine.initialize();
    if (!initResult.success) {
      throw new Error(`Failed to initialize verification engine: ${initResult.message}`);
    }

    if (!verificationEngine.currentTruth) {
      throw new Error('No project truth document found. Cannot monitor drift.');
    }

    this.monitoringEnabled = true;
    this.lastCheck = new Date();
    
    console.log(`🔍 Context drift monitoring started (checking every ${intervalMinutes} minutes)`);
    
    // Set up periodic checks
    this.checkInterval = setInterval(async () => {
      await this.performDriftCheck();
    }, intervalMinutes * 60 * 1000);

    // Perform initial check
    await this.performDriftCheck();
  }

  /**
   * Stop drift monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.monitoringEnabled = false;
    console.log('🛑 Context drift monitoring stopped');
  }

  /**
   * Perform a drift check
   */
  async performDriftCheck() {
    if (!this.monitoringEnabled) return;

    console.log('\n🔍 Performing context drift check...');
    
    const driftReport = {
      timestamp: new Date().toISOString(),
      checks: [],
      overallDrift: 0,
      severity: 'none',
      recommendations: []
    };

    // Check various project artifacts
    const checks = [
      { name: 'backlog', method: this.checkBacklogDrift.bind(this) },
      { name: 'recent-documents', method: this.checkDocumentDrift.bind(this) },
      { name: 'commit-messages', method: this.checkCommitDrift.bind(this) },
      { name: 'sprint-goals', method: this.checkSprintDrift.bind(this) },
      { name: 'decisions', method: this.checkDecisionDrift.bind(this) }
    ];

    for (const check of checks) {
      try {
        const result = await check.method();
        driftReport.checks.push({
          name: check.name,
          drift: result.drift,
          details: result.details,
          items: result.items
        });
      } catch (error) {
        driftReport.checks.push({
          name: check.name,
          error: error.message
        });
      }
    }

    // Calculate overall drift
    const validChecks = driftReport.checks.filter(c => !c.error && c.drift !== undefined);
    if (validChecks.length > 0) {
      driftReport.overallDrift = Math.round(
        validChecks.reduce((sum, c) => sum + c.drift, 0) / validChecks.length
      );
    }

    // Determine severity
    driftReport.severity = this.calculateSeverity(driftReport.overallDrift);

    // Generate recommendations
    driftReport.recommendations = await this.generateRecommendations(driftReport);

    // Store in history
    this.driftHistory.push(driftReport);
    if (this.driftHistory.length > 100) {
      this.driftHistory.shift(); // Keep only last 100 checks
    }

    // Handle based on severity
    await this.handleDriftReport(driftReport);

    this.lastCheck = new Date();
    return driftReport;
  }

  /**
   * Check backlog drift
   */
  async checkBacklogDrift() {
    const backlogPath = path.join(
      this.projectRoot, 'project-documents', 
      'orchestration', 'product-backlog', 'backlog-state.json'
    );

    if (!await fs.pathExists(backlogPath)) {
      return { drift: 0, details: 'No backlog found' };
    }

    const backlog = await fs.readJSON(backlogPath);
    const recentItems = backlog.items
      .filter(item => {
        const created = new Date(item.createdAt || item.created);
        const daysSince = (Date.now() - created) / (1000 * 60 * 60 * 24);
        return daysSince <= 7; // Last 7 days
      })
      .slice(0, 10); // Max 10 items

    if (recentItems.length === 0) {
      return { drift: 0, details: 'No recent backlog items' };
    }

    // Verify each item
    const verifications = [];
    for (const item of recentItems) {
      const verification = await verificationEngine.verifyItem({
        title: item.title,
        description: item.description,
        acceptanceCriteria: item.acceptanceCriteria
      }, 'backlog');
      
      verifications.push({
        id: item.id,
        title: item.title,
        confidence: verification.confidence,
        status: verification.status
      });
    }

    // Calculate drift percentage
    const avgConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length;
    const drift = Math.min(100, avgConfidence); // Confidence is inverse of alignment

    return {
      drift,
      details: `${recentItems.length} recent items analyzed`,
      items: verifications
    };
  }

  /**
   * Check document drift
   */
  async checkDocumentDrift() {
    const docsPath = path.join(this.projectRoot, 'project-documents');
    
    // Find recently modified documents
    const recentDocs = await this.findRecentFiles(docsPath, 7, '.md');
    
    if (recentDocs.length === 0) {
      return { drift: 0, details: 'No recent documents' };
    }

    // Sample up to 5 documents
    const sampled = recentDocs.slice(0, 5);
    const verifications = [];

    for (const doc of sampled) {
      const content = await fs.readFile(doc.path, 'utf8');
      const preview = content.substring(0, 500); // First 500 chars
      
      const verification = await calculateConfidenceScore(
        preview,
        verificationEngine.currentTruth,
        'document'
      );
      
      verifications.push({
        file: path.relative(docsPath, doc.path),
        confidence: verification.score,
        reason: verification.reason
      });
    }

    const avgConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length;
    const drift = Math.min(100, avgConfidence);

    return {
      drift,
      details: `${sampled.length} recent documents analyzed`,
      items: verifications
    };
  }

  /**
   * Check commit message drift
   */
  async checkCommitDrift() {
    // This would integrate with git to check recent commit messages
    // For now, return a placeholder
    return {
      drift: 0,
      details: 'Git integration not implemented',
      items: []
    };
  }

  /**
   * Check sprint goal drift
   */
  async checkSprintDrift() {
    const sprintsPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'sprints'
    );

    // Find active sprint
    const sprintDirs = await fs.readdir(sprintsPath).catch(() => []);
    const activeSprint = sprintDirs
      .filter(dir => dir.startsWith('sprint-'))
      .sort()
      .pop();

    if (!activeSprint) {
      return { drift: 0, details: 'No active sprint found' };
    }

    const goalsPath = path.join(sprintsPath, activeSprint, 'planning', 'sprint-goals.md');
    
    if (!await fs.pathExists(goalsPath)) {
      return { drift: 0, details: 'No sprint goals found' };
    }

    const goals = await fs.readFile(goalsPath, 'utf8');
    const verification = await calculateConfidenceScore(
      goals,
      verificationEngine.currentTruth,
      'sprint-goals'
    );

    return {
      drift: Math.min(100, verification.score),
      details: `Sprint ${activeSprint} goals analyzed`,
      items: [{
        sprint: activeSprint,
        confidence: verification.score,
        reason: verification.reason
      }]
    };
  }

  /**
   * Check decision drift
   */
  async checkDecisionDrift() {
    const decisionsPath = path.join(
      this.projectRoot, 'project-state',
      'decisions', 'decisions-log.json'
    );

    if (!await fs.pathExists(decisionsPath)) {
      return { drift: 0, details: 'No decisions log found' };
    }

    const decisions = await fs.readJSON(decisionsPath);
    const recentDecisions = (decisions.decisions || [])
      .filter(d => {
        const made = new Date(d.timestamp);
        const daysSince = (Date.now() - made) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      })
      .slice(0, 5);

    if (recentDecisions.length === 0) {
      return { drift: 0, details: 'No recent decisions' };
    }

    const verifications = [];
    for (const decision of recentDecisions) {
      const verification = await calculateConfidenceScore(
        `${decision.decision} - ${decision.rationale}`,
        verificationEngine.currentTruth,
        'decision'
      );
      
      verifications.push({
        decision: decision.decision,
        confidence: verification.score,
        timestamp: decision.timestamp
      });
    }

    const avgConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length;
    const drift = Math.min(100, avgConfidence);

    return {
      drift,
      details: `${recentDecisions.length} recent decisions analyzed`,
      items: verifications
    };
  }

  /**
   * Find recently modified files
   */
  async findRecentFiles(dir, daysBack, extension) {
    const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
    const files = [];

    async function walk(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          const stats = await fs.stat(fullPath);
          if (stats.mtime.getTime() > cutoff) {
            files.push({
              path: fullPath,
              modified: stats.mtime
            });
          }
        }
      }
    }

    await walk(dir);
    return files.sort((a, b) => b.modified - a.modified);
  }

  /**
   * Calculate drift severity
   */
  calculateSeverity(drift) {
    if (drift >= this.driftThresholds.critical) return 'critical';
    if (drift >= this.driftThresholds.major) return 'major';
    if (drift >= this.driftThresholds.moderate) return 'moderate';
    if (drift >= this.driftThresholds.minor) return 'minor';
    return 'none';
  }

  /**
   * Generate recommendations based on drift report
   */
  async generateRecommendations(report) {
    const recommendations = [];

    if (report.severity === 'critical') {
      recommendations.push('🚨 URGENT: Schedule immediate review with Project Manager and stakeholders');
      recommendations.push('🔄 Consider updating Project Truth document if scope has legitimately changed');
      recommendations.push('⛔ Pause new feature development until alignment is restored');
    } else if (report.severity === 'major') {
      recommendations.push('⚠️ Schedule review session within 24 hours');
      recommendations.push('🔍 Audit recent decisions and backlog items');
      recommendations.push('📋 Create action plan to realign with project context');
    } else if (report.severity === 'moderate') {
      recommendations.push('👀 Review flagged items in next sprint planning');
      recommendations.push('📝 Update team on project context and goals');
      recommendations.push('🎯 Reinforce context awareness in daily activities');
    } else if (report.severity === 'minor') {
      recommendations.push('ℹ️ Monitor drift trend over next few checks');
      recommendations.push('✅ Continue current practices with minor adjustments');
    }

    // Specific recommendations based on checks
    for (const check of report.checks) {
      if (check.drift > 60) {
        switch (check.name) {
          case 'backlog':
            recommendations.push(`📋 Review and clean up backlog items (${check.drift}% drift)`);
            break;
          case 'recent-documents':
            recommendations.push(`📄 Ensure documentation aligns with project goals (${check.drift}% drift)`);
            break;
          case 'sprint-goals':
            recommendations.push(`🏃 Realign sprint goals with project context (${check.drift}% drift)`);
            break;
          case 'decisions':
            recommendations.push(`🤔 Review recent decisions for alignment (${check.drift}% drift)`);
            break;
        }
      }
    }

    return recommendations;
  }

  /**
   * Handle drift report based on severity
   */
  async handleDriftReport(report) {
    // Save report
    const reportPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'drift-reports',
      `drift-report-${new Date().toISOString().split('T')[0]}.json`
    );
    
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJSON(reportPath, report, { spaces: 2 });

    // Display results
    console.log(`\n📊 Drift Check Complete`);
    console.log(`   Overall Drift: ${report.overallDrift}%`);
    console.log(`   Severity: ${report.severity.toUpperCase()}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    // Handle based on severity
    if (report.severity === 'critical' || report.severity === 'major') {
      await this.escalateDrift(report);
      
      // Initiate drift resolution
      await driftResolutionCoordinator.initiateDriftResolution(report);
    } else if (report.severity === 'moderate') {
      // Initiate collaborative resolution
      await driftResolutionCoordinator.initiateDriftResolution(report);
    }

    // Generate trend analysis if enough history
    if (this.driftHistory.length >= 5) {
      const trend = this.analyzeDriftTrend();
      if (trend.increasing && trend.rate > 5) {
        console.log(`\n⚠️ Warning: Drift increasing at ${trend.rate}% per check`);
      }
    }
  }

  /**
   * Escalate drift to stakeholders
   */
  async escalateDrift(report) {
    const escalationPath = path.join(
      this.projectRoot, 'project-documents',
      'orchestration', 'stakeholder-escalations.md'
    );
    
    let escalation = await fs.readFile(escalationPath, 'utf8').catch(() => '# Stakeholder Escalations\n\n');
    
    escalation += `## Context Drift Alert - ${report.timestamp}\n\n`;
    escalation += `- **Severity**: ${report.severity.toUpperCase()}\n`;
    escalation += `- **Overall Drift**: ${report.overallDrift}%\n`;
    escalation += `- **Checks Performed**: ${report.checks.length}\n\n`;
    
    escalation += `### Drift by Area\n`;
    report.checks.forEach(check => {
      if (!check.error) {
        escalation += `- ${check.name}: ${check.drift}% drift\n`;
      }
    });
    
    escalation += `\n### Recommendations\n`;
    report.recommendations.forEach(rec => {
      escalation += `- ${rec}\n`;
    });
    
    escalation += `\n### Full Report\n`;
    escalation += `See: project-documents/orchestration/drift-reports/drift-report-${new Date().toISOString().split('T')[0]}.json\n\n`;
    
    await fs.writeFile(escalationPath, escalation, 'utf8');
    
    console.log('\n🔔 Drift alert escalated to stakeholders');
  }

  /**
   * Analyze drift trend
   */
  analyzeDriftTrend() {
    if (this.driftHistory.length < 2) {
      return { increasing: false, rate: 0 };
    }

    const recent = this.driftHistory.slice(-5);
    const drifts = recent.map(r => r.overallDrift);
    
    // Simple linear regression
    const n = drifts.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = drifts.reduce((a, b) => a + b, 0);
    const sumXY = drifts.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return {
      increasing: slope > 0,
      rate: Math.abs(Math.round(slope * 10) / 10)
    };
  }

  /**
   * Get drift status
   */
  getDriftStatus() {
    const latestReport = this.driftHistory[this.driftHistory.length - 1];
    
    return {
      monitoring: this.monitoringEnabled,
      lastCheck: this.lastCheck,
      currentDrift: latestReport ? latestReport.overallDrift : 0,
      severity: latestReport ? latestReport.severity : 'none',
      trend: this.analyzeDriftTrend(),
      historyLength: this.driftHistory.length
    };
  }

  /**
   * Manual drift check
   */
  async checkDriftNow() {
    return await this.performDriftCheck();
  }
}

// Export singleton instance
module.exports = new DriftDetector();