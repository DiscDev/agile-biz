/**
 * Audit Report Generator
 * 
 * Creates comprehensive context verification audit reports
 */

const fs = require('fs-extra');
const path = require('path');
const verificationEngine = require('./verification-engine');
const driftDetector = require('./drift-detector');
const violationLearningSystem = require('./violation-learning-system');
const truthVersionManager = require('./truth-version-manager');

class AuditReportGenerator {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.reportsPath = path.join(
      this.projectRoot, 
      'project-documents', 
      'orchestration', 
      'context-audits'
    );
  }

  /**
   * Generate comprehensive audit report
   */
  async generateFullAudit(options = {}) {
    const {
      includeBacklog = true,
      includeSprints = true,
      includeDocuments = true,
      includeDecisions = true,
      includeHistory = true,
      includeLearnings = true,
      includeRecommendations = true
    } = options;

    try {
      // Ensure reports directory exists
      await fs.ensureDir(this.reportsPath);

      const timestamp = new Date().toISOString();
      const reportData = {
        timestamp,
        projectName: verificationEngine.currentTruth?.projectName || 'Unknown Project',
        auditType: 'comprehensive',
        summary: {},
        sections: []
      };

      console.log('🔍 Generating comprehensive context audit...');

      // Section 1: Project Truth Status
      if (verificationEngine.currentTruth) {
        const truthSection = await this.auditProjectTruth();
        reportData.sections.push(truthSection);
      }

      // Section 2: Backlog Alignment
      if (includeBacklog) {
        const backlogSection = await this.auditBacklog();
        reportData.sections.push(backlogSection);
      }

      // Section 3: Sprint Context
      if (includeSprints) {
        const sprintSection = await this.auditSprints();
        reportData.sections.push(sprintSection);
      }

      // Section 4: Document Analysis
      if (includeDocuments) {
        const docSection = await this.auditDocuments();
        reportData.sections.push(docSection);
      }

      // Section 5: Decision Alignment
      if (includeDecisions) {
        const decisionSection = await this.auditDecisions();
        reportData.sections.push(decisionSection);
      }

      // Section 6: Version History
      if (includeHistory) {
        const historySection = await this.auditVersionHistory();
        reportData.sections.push(historySection);
      }

      // Section 7: Learning Insights
      if (includeLearnings) {
        const learningSection = await this.auditLearnings();
        reportData.sections.push(learningSection);
      }

      // Generate executive summary
      reportData.summary = this.generateExecutiveSummary(reportData.sections);

      // Generate recommendations
      if (includeRecommendations) {
        reportData.recommendations = await this.generateRecommendations(reportData);
      }

      // Save report in multiple formats
      const reportId = `audit-${new Date().toISOString().split('T')[0]}`;
      
      // Save JSON version
      const jsonPath = path.join(this.reportsPath, `${reportId}.json`);
      await fs.writeJSON(jsonPath, reportData, { spaces: 2 });

      // Generate and save markdown version
      const markdownReport = this.generateMarkdownReport(reportData);
      const mdPath = path.join(this.reportsPath, `${reportId}.md`);
      await fs.writeFile(mdPath, markdownReport, 'utf8');

      // Generate and save HTML version
      const htmlReport = this.generateHtmlReport(reportData);
      const htmlPath = path.join(this.reportsPath, `${reportId}.html`);
      await fs.writeFile(htmlPath, htmlReport, 'utf8');

      console.log(`✅ Audit report generated: ${reportId}`);

      return {
        success: true,
        reportId,
        paths: {
          json: jsonPath,
          markdown: mdPath,
          html: htmlPath
        },
        summary: reportData.summary
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Audit project truth document
   */
  async auditProjectTruth() {
    const truth = verificationEngine.currentTruth;
    
    return {
      name: 'Project Truth Analysis',
      status: 'analyzed',
      findings: {
        established: truth.lastVerified,
        whatWereBuilding: truth.whatWereBuilding,
        industry: truth.industry,
        targetUsers: truth.targetUsers,
        notThisCount: truth.notThis?.length || 0,
        competitorsCount: truth.competitors?.length || 0,
        domainTermsCount: truth.domainTerms?.length || 0
      },
      issues: this.analyzeProjectTruthIssues(truth),
      score: this.calculateTruthCompleteness(truth)
    };
  }

  /**
   * Audit backlog alignment
   */
  async auditBacklog() {
    const result = await verificationEngine.verifyBacklog();
    
    if (!result.success) {
      return {
        name: 'Backlog Alignment',
        status: 'error',
        error: result.message
      };
    }

    const stats = result.results;
    
    return {
      name: 'Backlog Alignment',
      status: 'analyzed',
      findings: {
        totalItems: stats.total,
        aligned: stats.aligned,
        warnings: stats.warnings,
        reviews: stats.reviews,
        violations: stats.violations,
        purityScore: stats.purityScore
      },
      issues: this.categorizeBacklogIssues(stats.items),
      topViolations: this.getTopViolations(stats.items, 5),
      score: stats.purityScore
    };
  }

  /**
   * Audit sprint context alignment
   */
  async auditSprints() {
    const sprintsPath = path.join(
      this.projectRoot,
      'project-documents',
      'orchestration',
      'sprints'
    );

    const sprints = await fs.readdir(sprintsPath).catch(() => []);
    const activeSprints = sprints.filter(s => s.startsWith('sprint-'));
    
    const sprintAudits = [];
    
    for (const sprint of activeSprints.slice(-3)) { // Last 3 sprints
      const sprintResult = await verificationEngine.verifySprintTasks(sprint);
      
      if (sprintResult.success) {
        const results = sprintResult.results;
        const violations = results.tasks.filter(t => t.status === 'blocked').length;
        const reviews = results.tasks.filter(t => t.status === 'review').length;
        
        sprintAudits.push({
          sprint,
          canProceed: results.canProceed,
          taskCount: results.tasks.length,
          violations,
          reviews,
          alignmentScore: Math.round(
            ((results.tasks.length - violations - reviews) / results.tasks.length) * 100
          )
        });
      }
    }

    return {
      name: 'Sprint Context Alignment',
      status: 'analyzed',
      findings: {
        sprintsAnalyzed: sprintAudits.length,
        averageAlignment: sprintAudits.length > 0 
          ? Math.round(sprintAudits.reduce((sum, s) => sum + s.alignmentScore, 0) / sprintAudits.length)
          : 0,
        blockedSprints: sprintAudits.filter(s => !s.canProceed).length
      },
      sprints: sprintAudits,
      score: sprintAudits.length > 0
        ? Math.round(sprintAudits.reduce((sum, s) => sum + s.alignmentScore, 0) / sprintAudits.length)
        : 0
    };
  }

  /**
   * Audit project documents
   */
  async auditDocuments() {
    const driftReport = await driftDetector.checkDriftNow();
    
    const docCheck = driftReport.checks.find(c => c.name === 'recent-documents');
    
    return {
      name: 'Document Drift Analysis',
      status: 'analyzed',
      findings: {
        drift: docCheck?.drift || 0,
        documentsChecked: docCheck?.items?.length || 0,
        details: docCheck?.details || 'No recent documents'
      },
      documents: docCheck?.items || [],
      score: 100 - (docCheck?.drift || 0)
    };
  }

  /**
   * Audit decision alignment
   */
  async auditDecisions() {
    const driftReport = await driftDetector.checkDriftNow();
    
    const decisionCheck = driftReport.checks.find(c => c.name === 'decisions');
    
    return {
      name: 'Decision Alignment',
      status: 'analyzed',
      findings: {
        drift: decisionCheck?.drift || 0,
        decisionsChecked: decisionCheck?.items?.length || 0,
        details: decisionCheck?.details || 'No recent decisions'
      },
      decisions: decisionCheck?.items || [],
      score: 100 - (decisionCheck?.drift || 0)
    };
  }

  /**
   * Audit version history
   */
  async auditVersionHistory() {
    await truthVersionManager.initialize();
    const history = truthVersionManager.getHistory();
    
    const changeFrequency = this.analyzeChangeFrequency(history);
    const changeTypes = this.analyzeChangeTypes(history);
    
    return {
      name: 'Truth Version History',
      status: 'analyzed',
      findings: {
        totalVersions: history.length,
        changeFrequency,
        majorChanges: changeTypes.major,
        minorChanges: changeTypes.minor,
        patchChanges: changeTypes.patch
      },
      recentChanges: history.slice(-5).reverse(),
      stability: this.calculateStabilityScore(changeFrequency, changeTypes),
      score: this.calculateStabilityScore(changeFrequency, changeTypes)
    };
  }

  /**
   * Audit learning insights
   */
  async auditLearnings() {
    const insights = await verificationEngine.getLearningInsights();
    
    if (!insights.success) {
      return {
        name: 'Learning Insights',
        status: 'error',
        error: insights.message
      };
    }

    const learnings = insights.insights;
    
    return {
      name: 'Learning Insights',
      status: 'analyzed',
      findings: {
        commonViolations: learnings.commonViolations.length,
        riskFactors: learnings.riskFactors.length,
        preventionStrategies: learnings.preventionStrategies.length,
        recommendations: learnings.recommendations.length
      },
      topPatterns: learnings.commonViolations.slice(0, 3),
      criticalRisks: learnings.riskFactors.filter(r => r.impact === 'high'),
      score: this.calculateLearningScore(learnings)
    };
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(sections) {
    const scores = sections
      .filter(s => s.score !== undefined)
      .map(s => s.score);
    
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    const issues = sections
      .filter(s => s.issues && s.issues.length > 0)
      .reduce((sum, s) => sum + s.issues.length, 0);

    const criticalFindings = [];
    
    sections.forEach(section => {
      if (section.score < 70) {
        criticalFindings.push({
          section: section.name,
          score: section.score,
          finding: this.extractCriticalFinding(section)
        });
      }
    });

    return {
      overallScore,
      healthStatus: this.getHealthStatus(overallScore),
      sectionsAnalyzed: sections.length,
      totalIssues: issues,
      criticalFindings,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations(reportData) {
    const recommendations = [];
    const summary = reportData.summary;

    // Overall health recommendations
    if (summary.overallScore < 70) {
      recommendations.push({
        priority: 'critical',
        category: 'overall',
        recommendation: 'Immediate intervention required to address context drift',
        actions: [
          'Schedule emergency review with Project Manager and stakeholders',
          'Review and update Project Truth document',
          'Implement stricter context verification processes'
        ]
      });
    } else if (summary.overallScore < 85) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        recommendation: 'Attention needed to prevent further context drift',
        actions: [
          'Review flagged items in next sprint planning',
          'Update team on project context and goals',
          'Consider implementing automated context checks'
        ]
      });
    }

    // Section-specific recommendations
    reportData.sections.forEach(section => {
      const sectionRecs = this.generateSectionRecommendations(section);
      recommendations.push(...sectionRecs);
    });

    // Process improvements
    recommendations.push(...this.generateProcessRecommendations(reportData));

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return recommendations;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(reportData) {
    let markdown = `# Context Verification Audit Report\n\n`;
    markdown += `Generated: ${reportData.timestamp}\n`;
    markdown += `Project: ${reportData.projectName}\n\n`;

    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Overall Score**: ${reportData.summary.overallScore}% (${reportData.summary.healthStatus})\n`;
    markdown += `- **Sections Analyzed**: ${reportData.summary.sectionsAnalyzed}\n`;
    markdown += `- **Total Issues**: ${reportData.summary.totalIssues}\n`;
    markdown += `- **Critical Findings**: ${reportData.summary.criticalFindings.length}\n\n`;

    if (reportData.summary.criticalFindings.length > 0) {
      markdown += `### Critical Findings\n\n`;
      reportData.summary.criticalFindings.forEach(finding => {
        markdown += `- **${finding.section}** (${finding.score}%): ${finding.finding}\n`;
      });
      markdown += '\n';
    }

    // Health Status Visual
    markdown += `### Context Health Status\n\n`;
    markdown += this.generateHealthVisual(reportData.summary.overallScore);
    markdown += '\n\n';

    // Detailed Sections
    reportData.sections.forEach(section => {
      markdown += `## ${section.name}\n\n`;
      
      if (section.status === 'error') {
        markdown += `⚠️ Error: ${section.error}\n\n`;
      } else {
        markdown += `**Score**: ${section.score !== undefined ? section.score + '%' : 'N/A'}\n\n`;
        
        // Findings
        if (section.findings) {
          markdown += `### Findings\n\n`;
          Object.entries(section.findings).forEach(([key, value]) => {
            markdown += `- **${this.formatKey(key)}**: ${value}\n`;
          });
          markdown += '\n';
        }

        // Issues
        if (section.issues && section.issues.length > 0) {
          markdown += `### Issues\n\n`;
          section.issues.forEach(issue => {
            markdown += `- ${issue}\n`;
          });
          markdown += '\n';
        }

        // Section-specific content
        markdown += this.generateSectionMarkdown(section);
      }
    });

    // Recommendations
    if (reportData.recommendations && reportData.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      
      const grouped = this.groupRecommendationsByPriority(reportData.recommendations);
      
      Object.entries(grouped).forEach(([priority, recs]) => {
        markdown += `### ${this.capitalize(priority)} Priority\n\n`;
        recs.forEach(rec => {
          markdown += `**${rec.category}**: ${rec.recommendation}\n`;
          if (rec.actions && rec.actions.length > 0) {
            markdown += `- Actions:\n`;
            rec.actions.forEach(action => {
              markdown += `  - ${action}\n`;
            });
          }
          markdown += '\n';
        });
      });
    }

    // Footer
    markdown += `---\n\n`;
    markdown += `*This report was automatically generated by the AgileAiAgents Context Verification System.*\n`;

    return markdown;
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(reportData) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Context Verification Audit Report - ${reportData.projectName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #2563eb; margin-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
        h3 { color: #555; }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .summary-card {
            background: #f8f8f8;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e0e0e0;
        }
        .summary-card h4 {
            margin: 0 0 10px 0;
            color: #666;
            font-weight: normal;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
        }
        .health-status {
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .health-excellent { background: #E8F5E9; color: #2E7D32; }
        .health-good { background: #FFF3E0; color: #F57C00; }
        .health-attention { background: #FFF3E0; color: #F57C00; }
        .health-critical { background: #FFEBEE; color: #C62828; }
        .score-bar {
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            margin: 10px 0;
        }
        .score-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f8f8;
            border-radius: 8px;
        }
        .issue {
            background: #FFF3E0;
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
            border-left: 4px solid #FF9800;
        }
        .recommendation {
            background: #E3F2FD;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 4px solid #2196F3;
        }
        .priority-critical { border-left-color: #F44336; background: #FFEBEE; }
        .priority-high { border-left-color: #FF9800; background: #FFF3E0; }
        .priority-medium { border-left-color: #FFC107; background: #FFFDE7; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        th {
            background: #f5f5f5;
            font-weight: bold;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Context Verification Audit Report</h1>
        <p class="timestamp">Generated: ${new Date(reportData.timestamp).toLocaleString()}</p>
        <p><strong>Project:</strong> ${reportData.projectName}</p>
        
        ${this.generateHtmlSummary(reportData.summary)}
        ${this.generateHtmlSections(reportData.sections)}
        ${this.generateHtmlRecommendations(reportData.recommendations)}
        
        <hr style="margin-top: 50px;">
        <p style="text-align: center; color: #666; font-size: 0.9em;">
            <em>This report was automatically generated by the AgileAiAgents Context Verification System.</em>
        </p>
    </div>
</body>
</html>`;

    return html;
  }

  // Helper methods
  analyzeProjectTruthIssues(truth) {
    const issues = [];
    
    if (!truth.whatWereBuilding || truth.whatWereBuilding.length < 20) {
      issues.push('Project description is too vague');
    }
    
    if (!truth.notThis || truth.notThis.length === 0) {
      issues.push('No "NOT THIS" definitions - high risk of scope creep');
    }
    
    if (!truth.competitors || truth.competitors.length < 3) {
      issues.push('Insufficient competitor analysis');
    }
    
    if (!truth.domainTerms || truth.domainTerms.length < 5) {
      issues.push('Limited domain terminology defined');
    }
    
    return issues;
  }

  calculateTruthCompleteness(truth) {
    let score = 100;
    
    if (!truth.whatWereBuilding || truth.whatWereBuilding.length < 20) score -= 20;
    if (!truth.industry || truth.industry.length < 10) score -= 15;
    if (!truth.targetUsers?.primary) score -= 15;
    if (!truth.notThis || truth.notThis.length === 0) score -= 20;
    if (!truth.competitors || truth.competitors.length < 3) score -= 15;
    if (!truth.domainTerms || truth.domainTerms.length < 5) score -= 15;
    
    return Math.max(0, score);
  }

  categorizeBacklogIssues(items) {
    const issues = [];
    const violations = items.filter(i => i.status === 'blocked');
    const reviews = items.filter(i => i.status === 'review');
    
    if (violations.length > 0) {
      issues.push(`${violations.length} items violate project context`);
    }
    
    if (reviews.length > 5) {
      issues.push(`${reviews.length} items need context review`);
    }
    
    const avgConfidence = items.reduce((sum, i) => sum + i.confidence, 0) / items.length;
    if (avgConfidence > 50) {
      issues.push(`High average violation confidence (${Math.round(avgConfidence)}%)`);
    }
    
    return issues;
  }

  getTopViolations(items, limit) {
    return items
      .filter(i => i.status === 'blocked' || i.status === 'review')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit)
      .map(i => ({
        title: i.title,
        confidence: i.confidence,
        message: i.message
      }));
  }

  analyzeChangeFrequency(history) {
    if (history.length < 2) return 'stable';
    
    const changes = history.slice(-10);
    const timeSpans = [];
    
    for (let i = 1; i < changes.length; i++) {
      const prev = new Date(changes[i - 1].timestamp);
      const curr = new Date(changes[i].timestamp);
      timeSpans.push(curr - prev);
    }
    
    const avgSpan = timeSpans.reduce((a, b) => a + b, 0) / timeSpans.length;
    const daysPerChange = avgSpan / (1000 * 60 * 60 * 24);
    
    if (daysPerChange < 1) return 'very frequent';
    if (daysPerChange < 7) return 'frequent';
    if (daysPerChange < 30) return 'moderate';
    return 'stable';
  }

  analyzeChangeTypes(history) {
    const types = { major: 0, minor: 0, patch: 0 };
    
    history.forEach(version => {
      if (version.changeType === 'major' || version.changeSummary?.includes('Major')) {
        types.major++;
      } else if (version.changeType === 'minor' || version.changeSummary?.includes('Minor')) {
        types.minor++;
      } else {
        types.patch++;
      }
    });
    
    return types;
  }

  calculateStabilityScore(frequency, changeTypes) {
    let score = 100;
    
    if (frequency === 'very frequent') score -= 30;
    else if (frequency === 'frequent') score -= 15;
    
    score -= changeTypes.major * 10;
    score -= changeTypes.minor * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  calculateLearningScore(learnings) {
    let score = 50; // Base score
    
    // Positive factors
    score += Math.min(30, learnings.preventionStrategies.length * 10);
    score += Math.min(20, learnings.recommendations.length * 5);
    
    // Negative factors
    score -= Math.min(30, learnings.commonViolations.length * 5);
    score -= Math.min(20, learnings.riskFactors.filter(r => r.impact === 'high').length * 10);
    
    return Math.max(0, Math.min(100, score));
  }

  getHealthStatus(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Needs Attention';
    return 'Critical';
  }

  extractCriticalFinding(section) {
    if (section.issues && section.issues.length > 0) {
      return section.issues[0];
    }
    
    if (section.findings) {
      const critical = Object.entries(section.findings)
        .find(([key, value]) => {
          if (typeof value === 'number' && key.includes('violations')) {
            return value > 0;
          }
          return false;
        });
      
      if (critical) {
        return `${this.formatKey(critical[0])}: ${critical[1]}`;
      }
    }
    
    return 'Low score indicates issues';
  }

  generateSectionRecommendations(section) {
    const recommendations = [];
    
    if (section.score < 70) {
      const priority = section.score < 50 ? 'critical' : 'high';
      
      recommendations.push({
        priority,
        category: section.name.toLowerCase().replace(/\s+/g, '-'),
        recommendation: `Address issues in ${section.name}`,
        actions: this.getSectionActions(section)
      });
    }
    
    return recommendations;
  }

  getSectionActions(section) {
    const actions = [];
    
    switch (section.name) {
      case 'Project Truth Analysis':
        if (section.issues?.includes('vague')) {
          actions.push('Clarify project description with specific goals');
        }
        if (section.issues?.includes('NOT THIS')) {
          actions.push('Define what the project explicitly is NOT');
        }
        break;
        
      case 'Backlog Alignment':
        if (section.findings?.violations > 0) {
          actions.push('Remove or revise items that violate context');
        }
        if (section.findings?.reviews > 5) {
          actions.push('Review flagged items with Product Owner');
        }
        break;
        
      case 'Sprint Context Alignment':
        if (section.findings?.blockedSprints > 0) {
          actions.push('Resolve context violations before sprint start');
        }
        break;
    }
    
    return actions.length > 0 ? actions : ['Review and address identified issues'];
  }

  generateProcessRecommendations(reportData) {
    const recommendations = [];
    const overallScore = reportData.summary.overallScore;
    
    if (overallScore < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'process',
        recommendation: 'Implement regular context verification checkpoints',
        actions: [
          'Add context verification to Definition of Done',
          'Include context check in sprint planning',
          'Schedule monthly context alignment reviews'
        ]
      });
    }
    
    return recommendations;
  }

  generateHealthVisual(score) {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    const color = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
    
    return color.repeat(filled) + '⚪'.repeat(empty) + ` ${score}%`;
  }

  formatKey(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  groupRecommendationsByPriority(recommendations) {
    return recommendations.reduce((grouped, rec) => {
      if (!grouped[rec.priority]) {
        grouped[rec.priority] = [];
      }
      grouped[rec.priority].push(rec);
      return grouped;
    }, {});
  }

  generateSectionMarkdown(section) {
    let markdown = '';
    
    // Add section-specific content based on type
    if (section.topViolations && section.topViolations.length > 0) {
      markdown += '### Top Violations\n\n';
      section.topViolations.forEach((v, i) => {
        markdown += `${i + 1}. **${v.title}** (${v.confidence}% confidence)\n`;
        markdown += `   - ${v.message}\n\n`;
      });
    }
    
    if (section.sprints && section.sprints.length > 0) {
      markdown += '### Sprint Details\n\n';
      markdown += '| Sprint | Tasks | Alignment | Can Proceed |\n';
      markdown += '|--------|-------|-----------|-------------|\n';
      section.sprints.forEach(s => {
        markdown += `| ${s.sprint} | ${s.taskCount} | ${s.alignmentScore}% | ${s.canProceed ? '✅' : '❌'} |\n`;
      });
      markdown += '\n';
    }
    
    return markdown;
  }

  generateHtmlSummary(summary) {
    const healthClass = `health-${summary.healthStatus.toLowerCase().replace(/\s+/g, '-')}`;
    
    return `
      <div class="${healthClass} health-status">
        <h2>Overall Context Health: ${summary.healthStatus}</h2>
        <div class="score-bar">
          <div class="score-fill" style="width: ${summary.overallScore}%; background: ${this.getScoreColor(summary.overallScore)}"></div>
        </div>
        <p style="font-size: 2em; margin: 10px 0;">${summary.overallScore}%</p>
      </div>
      
      <div class="summary-grid">
        <div class="summary-card">
          <h4>Sections Analyzed</h4>
          <div class="value">${summary.sectionsAnalyzed}</div>
        </div>
        <div class="summary-card">
          <h4>Total Issues</h4>
          <div class="value" style="color: ${summary.totalIssues > 0 ? '#F44336' : '#4CAF50'}">${summary.totalIssues}</div>
        </div>
        <div class="summary-card">
          <h4>Critical Findings</h4>
          <div class="value" style="color: ${summary.criticalFindings.length > 0 ? '#F44336' : '#4CAF50'}">${summary.criticalFindings.length}</div>
        </div>
      </div>
      
      ${summary.criticalFindings.length > 0 ? `
        <div class="section">
          <h3>Critical Findings</h3>
          ${summary.criticalFindings.map(finding => `
            <div class="issue">
              <strong>${finding.section}</strong> (${finding.score}%): ${finding.finding}
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  generateHtmlSections(sections) {
    return sections.map(section => `
      <div class="section">
        <h2>${section.name}</h2>
        ${section.status === 'error' ? `
          <div class="issue">⚠️ Error: ${section.error}</div>
        ` : `
          ${section.score !== undefined ? `
            <p><strong>Score:</strong> ${section.score}%</p>
            <div class="score-bar">
              <div class="score-fill" style="width: ${section.score}%; background: ${this.getScoreColor(section.score)}"></div>
            </div>
          ` : ''}
          
          ${section.findings ? `
            <h3>Findings</h3>
            <table>
              ${Object.entries(section.findings).map(([key, value]) => `
                <tr>
                  <td><strong>${this.formatKey(key)}</strong></td>
                  <td>${value}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
          
          ${section.issues && section.issues.length > 0 ? `
            <h3>Issues</h3>
            ${section.issues.map(issue => `
              <div class="issue">${issue}</div>
            `).join('')}
          ` : ''}
          
          ${this.generateSectionHtml(section)}
        `}
      </div>
    `).join('');
  }

  generateSectionHtml(section) {
    let html = '';
    
    if (section.topViolations && section.topViolations.length > 0) {
      html += '<h3>Top Violations</h3><ol>';
      section.topViolations.forEach(v => {
        html += `<li><strong>${v.title}</strong> (${v.confidence}% confidence)<br>${v.message}</li>`;
      });
      html += '</ol>';
    }
    
    if (section.sprints && section.sprints.length > 0) {
      html += '<h3>Sprint Details</h3><table><tr><th>Sprint</th><th>Tasks</th><th>Alignment</th><th>Can Proceed</th></tr>';
      section.sprints.forEach(s => {
        html += `<tr><td>${s.sprint}</td><td>${s.taskCount}</td><td>${s.alignmentScore}%</td><td>${s.canProceed ? '✅' : '❌'}</td></tr>`;
      });
      html += '</table>';
    }
    
    return html;
  }

  generateHtmlRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) return '';
    
    const grouped = this.groupRecommendationsByPriority(recommendations);
    
    return `
      <h2>Recommendations</h2>
      ${Object.entries(grouped).map(([priority, recs]) => `
        <h3>${this.capitalize(priority)} Priority</h3>
        ${recs.map(rec => `
          <div class="recommendation priority-${priority}">
            <strong>${this.capitalize(rec.category)}</strong>: ${rec.recommendation}
            ${rec.actions && rec.actions.length > 0 ? `
              <ul>
                ${rec.actions.map(action => `<li>${action}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      `).join('')}
    `;
  }

  getScoreColor(score) {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  }
}

// Export singleton instance
module.exports = new AuditReportGenerator();