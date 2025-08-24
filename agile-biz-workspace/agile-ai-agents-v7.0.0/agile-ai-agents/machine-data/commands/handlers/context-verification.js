/**
 * Context Verification Command Handler
 * 
 * Handles /verify-context command and related context verification operations
 */

const fs = require('fs-extra');
const path = require('path');
const verificationEngine = require('../../context-verification/verification-engine');
const driftDetector = require('../../context-verification/drift-detector');
const auditReportGenerator = require('../../context-verification/audit-report-generator');
const { promptUser, promptConfirm } = require('../utils/prompt-utils');

/**
 * Initialize and register context verification commands
 */
function initialize(registry) {
  // Main verification command
  registry.registerCommand('/verify-context', {
    description: 'Verify project context alignment and detect drift',
    category: 'context',
    handler: handleVerifyContext,
    usage: '/verify-context [options]',
    options: {
      '--create-truth': 'Create/update project truth document',
      '--check-drift': 'Check for context drift in backlog',
      '--audit-backlog': 'Full audit of backlog items',
      '--verify-sprint': 'Verify current sprint tasks',
      '--show-truth': 'Display current project truth',
      '--monitor-drift': 'Start/stop drift monitoring',
      '--drift-status': 'Show current drift monitoring status',
      '--learning-insights': 'Show learning insights from violations',
      '--export': 'Export verification report'
    },
    examples: [
      '/verify-context --create-truth',
      '/verify-context --check-drift',
      '/verify-context --audit-backlog',
      '/verify-context --verify-sprint sprint-2025-01-30-authentication',
      '/verify-context --monitor-drift start',
      '/verify-context --drift-status'
    ]
  });

  // Alias for backward compatibility
  registry.registerAlias('/check-context', '/verify-context', 
    'Note: /check-context is deprecated. Please use /verify-context');
}

/**
 * Main handler for /verify-context command
 */
async function handleVerifyContext(args, cmdConfig) {
  try {
    const { options } = require('../../commands/registry').parseOptions(args);
    
    // Initialize verification engine
    const initResult = await verificationEngine.initialize();
    if (!initResult.success) {
      return `⚠️ Failed to initialize verification engine: ${initResult.message}`;
    }

    // Handle different options
    if (options['create-truth']) {
      return await handleCreateTruth();
    } else if (options['show-truth']) {
      return await handleShowTruth();
    } else if (options['check-drift']) {
      return await handleCheckDrift();
    } else if (options['audit-backlog']) {
      return await handleAuditBacklog();
    } else if (options['verify-sprint']) {
      const sprintName = typeof options['verify-sprint'] === 'string' 
        ? options['verify-sprint'] 
        : await getCurrentSprintName();
      return await handleVerifySprint(sprintName);
    } else if (options['monitor-drift']) {
      const action = typeof options['monitor-drift'] === 'string' 
        ? options['monitor-drift'] 
        : 'status';
      return await handleDriftMonitor(action);
    } else if (options['drift-status']) {
      return await handleDriftStatus();
    } else if (options['learning-insights']) {
      return await handleLearningInsights();
    } else if (options['export']) {
      return await handleExportReport();
    } else {
      // Default: Show current context status
      return await handleContextStatus();
    }
  } catch (error) {
    return `❌ Error: ${error.message}`;
  }
}

/**
 * Create or update project truth document
 */
async function handleCreateTruth() {
  console.log('\n📋 Project Truth Document Creation\n');
  
  // Check if truth already exists
  if (verificationEngine.currentTruth) {
    const update = await promptConfirm(
      'A project truth document already exists. Update it?'
    );
    if (!update) {
      return 'Operation cancelled.';
    }
  }

  // Collect project information
  const projectData = {
    projectName: await promptUser('Project name:'),
    whatWereBuilding: await promptUser('In one sentence, what is this product?'),
    industry: await promptUser('What industry/domain is this in?'),
    targetUsers: {
      primary: await promptUser('Who are the primary target users?'),
      secondary: await promptUser('Who are the secondary target users? (optional)') || ''
    },
    notThis: [],
    competitors: [],
    domainTerms: []
  };

  // Collect "NOT THIS" items
  console.log('\n❌ What this project is NOT (helps prevent drift):');
  console.log('Enter items one at a time. Press Enter with empty line when done.\n');
  
  let notItem;
  while ((notItem = await promptUser('This is NOT:')) !== '') {
    projectData.notThis.push(notItem);
  }

  // Collect competitors
  console.log('\n🏢 Competitor products (3-5 recommended):');
  console.log('Format: CompetitorName - What they do\n');
  
  let competitor;
  while ((competitor = await promptUser('Competitor:')) !== '') {
    const [name, ...descParts] = competitor.split(' - ');
    projectData.competitors.push({
      name: name.trim(),
      description: descParts.join(' - ').trim() || 'No description provided'
    });
  }

  // Collect domain terms
  console.log('\n📚 Domain-specific terms and definitions:');
  console.log('Format: Term: Definition\n');
  
  let term;
  while ((term = await promptUser('Term and definition:')) !== '') {
    const [termName, ...defParts] = term.split(':');
    projectData.domainTerms.push({
      term: termName.trim(),
      definition: defParts.join(':').trim() || 'No definition provided'
    });
  }

  // Create the truth document
  const result = await verificationEngine.createProjectTruth(projectData);
  
  if (result.success) {
    console.log(`\n✅ ${result.message}`);
    console.log(`📁 Created at: ${result.path}`);
    
    // Run initial verification
    console.log('\n🔍 Running initial context verification...\n');
    const backlogResult = await verificationEngine.verifyBacklog();
    if (backlogResult.success && backlogResult.results.total > 0) {
      displayBacklogResults(backlogResult.results);
    }
    
    return 'Project truth document created successfully!';
  } else {
    return `❌ Failed to create project truth: ${result.message}`;
  }
}

/**
 * Show current project truth
 */
async function handleShowTruth() {
  if (!verificationEngine.currentTruth) {
    return '⚠️ No project truth document found. Use /verify-context --create-truth to create one.';
  }

  const truth = verificationEngine.currentTruth;
  
  console.log('\n📋 PROJECT TRUTH DOCUMENT\n');
  console.log(`🏗️  What We're Building: ${truth.whatWereBuilding}`);
  console.log(`🏭 Industry/Domain: ${truth.industry}`);
  console.log(`👥 Target Users:`);
  console.log(`   - Primary: ${truth.targetUsers.primary}`);
  if (truth.targetUsers.secondary) {
    console.log(`   - Secondary: ${truth.targetUsers.secondary}`);
  }
  
  if (truth.notThis.length > 0) {
    console.log('\n❌ NOT THIS:');
    truth.notThis.forEach(item => console.log(`   - ${item}`));
  }
  
  if (truth.competitors.length > 0) {
    console.log('\n🏢 Competitors:');
    truth.competitors.forEach(comp => {
      console.log(`   - ${comp.name || comp} ${comp.description ? `- ${comp.description}` : ''}`);
    });
  }
  
  if (truth.domainTerms.length > 0) {
    console.log('\n📚 Domain Terms:');
    truth.domainTerms.forEach(term => {
      console.log(`   - ${term.term}: ${term.definition}`);
    });
  }
  
  console.log(`\n📅 Last Verified: ${new Date(truth.lastVerified).toLocaleString()}`);
  
  return '';
}

/**
 * Check for context drift
 */
async function handleCheckDrift() {
  if (!verificationEngine.currentTruth) {
    return '⚠️ No project truth document found. Use /verify-context --create-truth to create one.';
  }

  console.log('\n🔍 Checking for Context Drift...\n');
  
  // Check backlog
  const backlogResult = await verificationEngine.verifyBacklog();
  
  if (!backlogResult.success) {
    return `⚠️ ${backlogResult.message}`;
  }

  const results = backlogResult.results;
  
  // Summary statistics
  console.log('📊 Context Alignment Summary:');
  console.log(`   Total Items: ${results.total}`);
  console.log(`   ✅ Aligned: ${results.aligned} (${Math.round(results.aligned / results.total * 100)}%)`);
  console.log(`   ⚠️  Warnings: ${results.warnings}`);
  console.log(`   🔍 Need Review: ${results.reviews}`);
  console.log(`   ❌ Violations: ${results.violations}`);
  console.log(`   📈 Purity Score: ${results.purityScore}%\n`);

  // Show problematic items
  if (results.warnings + results.reviews + results.violations > 0) {
    console.log('⚠️ Items Requiring Attention:\n');
    
    results.items
      .filter(item => item.status !== 'allowed')
      .forEach(item => {
        const icon = item.status === 'blocked' ? '❌' : 
                    item.status === 'review' ? '🔍' : '⚠️';
        console.log(`${icon} ${item.title}`);
        console.log(`   Status: ${item.status} (${item.confidence}% confidence)`);
        console.log(`   Reason: ${item.message}`);
        if (item.recommendation) {
          console.log(`   Action: ${item.recommendation}`);
        }
        console.log('');
      });
  }

  // Recommendations
  if (results.violations > 0) {
    console.log('🚨 CRITICAL: Context violations detected!');
    console.log('   These items do not align with project goals and should be removed or revised.');
  } else if (results.reviews > 0) {
    console.log('🔍 Review Required: Some items may be drifting from project context.');
    console.log('   Review with Project Manager to ensure alignment.');
  } else if (results.warnings > 0) {
    console.log('⚠️ Minor Concerns: Some items could be clearer about alignment.');
  } else {
    console.log('✅ Excellent! All backlog items align with project context.');
  }

  return '';
}

/**
 * Full backlog audit
 */
async function handleAuditBacklog() {
  if (!verificationEngine.currentTruth) {
    return '⚠️ No project truth document found. Use /verify-context --create-truth to create one.';
  }

  console.log('\n📋 Full Backlog Context Audit\n');
  
  const result = await verificationEngine.verifyBacklog();
  
  if (!result.success) {
    return `⚠️ ${result.message}`;
  }

  displayBacklogResults(result.results, true);
  
  // Generate audit report
  const reportPath = path.join(
    verificationEngine.projectRoot,
    'project-documents',
    'orchestration',
    'context-audit-report.md'
  );
  
  const report = generateAuditReport(result.results);
  await fs.writeFile(reportPath, report, 'utf8');
  
  console.log(`\n📁 Full audit report saved to: ${reportPath}`);
  
  return '';
}

/**
 * Verify sprint tasks
 */
async function handleVerifySprint(sprintName) {
  if (!verificationEngine.currentTruth) {
    return '⚠️ No project truth document found. Use /verify-context --create-truth to create one.';
  }

  console.log(`\n🏃 Verifying Sprint: ${sprintName}\n`);
  
  const result = await verificationEngine.verifySprintTasks(sprintName);
  
  if (!result.success) {
    return `⚠️ ${result.message}`;
  }

  const sprintResults = result.results;
  
  // Display results
  console.log(`Sprint: ${sprintResults.sprintName}`);
  console.log(`Can Proceed: ${sprintResults.canProceed ? '✅ Yes' : '❌ No'}\n`);
  
  sprintResults.tasks.forEach(task => {
    const icon = task.status === 'blocked' ? '❌' : 
                task.status === 'review' ? '🔍' : 
                task.status === 'warning' ? '⚠️' : '✅';
    
    console.log(`${icon} ${task.title}`);
    if (task.status !== 'allowed') {
      console.log(`   Confidence: ${task.confidence}%`);
      console.log(`   Issue: ${task.message}`);
      if (task.recommendation) {
        console.log(`   Action: ${task.recommendation}`);
      }
    }
    console.log('');
  });

  if (!sprintResults.canProceed) {
    console.log('🚨 SPRINT BLOCKED: Critical context violations detected.');
    console.log('   Sprint cannot proceed until violations are resolved.');
    console.log('   Escalate to Project Manager and Scrum Master immediately.');
  }

  return '';
}

/**
 * Export verification report
 */
async function handleExportReport() {
  console.log('\n📊 Generating Comprehensive Context Verification Report...\n');
  
  // Check if project truth exists
  if (!verificationEngine.currentTruth) {
    return '⚠️ No project truth document found. Use /verify-context --create-truth to create one.';
  }
  
  // Ask for report options
  const includeAll = await promptConfirm('Include all sections in the report?');
  
  let options = {};
  if (!includeAll) {
    options = {
      includeBacklog: await promptConfirm('Include backlog analysis?'),
      includeSprints: await promptConfirm('Include sprint analysis?'),
      includeDocuments: await promptConfirm('Include document analysis?'),
      includeDecisions: await promptConfirm('Include decision analysis?'),
      includeHistory: await promptConfirm('Include version history?'),
      includeLearnings: await promptConfirm('Include learning insights?'),
      includeRecommendations: await promptConfirm('Include recommendations?')
    };
  }
  
  console.log('\n🔍 Analyzing project context...');
  
  const result = await auditReportGenerator.generateFullAudit(options);
  
  if (result.success) {
    console.log('\n✅ Audit report generated successfully!\n');
    console.log(`📁 Report locations:`);
    console.log(`   JSON: ${result.paths.json}`);
    console.log(`   Markdown: ${result.paths.markdown}`);
    console.log(`   HTML: ${result.paths.html}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Overall Score: ${result.summary.overallScore}% (${result.summary.healthStatus})`);
    console.log(`   Issues Found: ${result.summary.totalIssues}`);
    console.log(`   Critical Findings: ${result.summary.criticalFindings.length}`);
    
    if (result.summary.criticalFindings.length > 0) {
      console.log('\n⚠️ Critical Findings:');
      result.summary.criticalFindings.forEach(finding => {
        console.log(`   - ${finding.section}: ${finding.finding}`);
      });
    }
    
    return `\nView the full report at: ${result.paths.html}`;
  } else {
    return `❌ Failed to generate report: ${result.error}`;
  }
}

/**
 * Show current context status
 */
async function handleContextStatus() {
  console.log('\n📊 Context Verification Status\n');
  
  if (!verificationEngine.currentTruth) {
    console.log('⚠️ No project truth document found.');
    console.log('\nTo get started:');
    console.log('1. Create project truth: /verify-context --create-truth');
    console.log('2. Check for drift: /verify-context --check-drift');
    console.log('3. Audit backlog: /verify-context --audit-backlog');
    
    return '';
  }

  // Show truth summary
  const truth = verificationEngine.currentTruth;
  console.log(`Project: ${truth.whatWereBuilding}`);
  console.log(`Industry: ${truth.industry}`);
  console.log(`Last Verified: ${new Date(truth.lastVerified).toLocaleString()}\n`);

  // Quick backlog check
  const backlogResult = await verificationEngine.verifyBacklog();
  if (backlogResult.success) {
    const results = backlogResult.results;
    console.log('Backlog Alignment:');
    console.log(`  Purity Score: ${results.purityScore}%`);
    console.log(`  Total Items: ${results.total}`);
    console.log(`  Issues: ${results.warnings + results.reviews + results.violations}\n`);
  }

  console.log('Available commands:');
  console.log('  /verify-context --show-truth     - Display full project truth');
  console.log('  /verify-context --check-drift    - Check for context drift');
  console.log('  /verify-context --audit-backlog  - Full backlog audit');
  console.log('  /verify-context --verify-sprint  - Verify current sprint');

  return '';
}

/**
 * Helper: Display backlog results
 */
function displayBacklogResults(results, detailed = false) {
  console.log('📊 Backlog Analysis Results:\n');
  
  // Summary
  console.log(`Total Items: ${results.total}`);
  console.log(`Purity Score: ${results.purityScore}%\n`);
  
  // Status breakdown
  console.log('Status Breakdown:');
  console.log(`  ✅ Aligned: ${results.aligned} (${Math.round(results.aligned / results.total * 100)}%)`);
  console.log(`  ⚠️  Warnings: ${results.warnings} (${Math.round(results.warnings / results.total * 100)}%)`);
  console.log(`  🔍 Need Review: ${results.reviews} (${Math.round(results.reviews / results.total * 100)}%)`);
  console.log(`  ❌ Violations: ${results.violations} (${Math.round(results.violations / results.total * 100)}%)`);
  
  if (detailed) {
    console.log('\nDetailed Item Analysis:\n');
    results.items.forEach(item => {
      const icon = item.status === 'blocked' ? '❌' : 
                  item.status === 'review' ? '🔍' : 
                  item.status === 'warning' ? '⚠️' : '✅';
      
      console.log(`${icon} [${item.id}] ${item.title}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Confidence: ${item.confidence}%`);
      console.log(`   Reason: ${item.message}`);
      if (item.recommendation) {
        console.log(`   Recommendation: ${item.recommendation}`);
      }
      if (item.details) {
        console.log(`   Scores: Domain=${item.details.domainAlignment}%, ` +
                   `User=${item.details.userAlignment}%, ` +
                   `Competitor=${item.details.competitorFeature}%, ` +
                   `Historical=${item.details.historicalPattern}%`);
      }
      console.log('');
    });
  }
}

/**
 * Helper: Generate audit report markdown
 */
function generateAuditReport(results) {
  const timestamp = new Date().toISOString();
  
  let report = `# Context Verification Audit Report\n\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  report += `## Executive Summary\n\n`;
  report += `- **Total Backlog Items**: ${results.total}\n`;
  report += `- **Context Purity Score**: ${results.purityScore}%\n`;
  report += `- **Items Requiring Action**: ${results.warnings + results.reviews + results.violations}\n\n`;
  
  report += `## Status Breakdown\n\n`;
  report += `| Status | Count | Percentage |\n`;
  report += `|--------|-------|------------|\n`;
  report += `| ✅ Aligned | ${results.aligned} | ${Math.round(results.aligned / results.total * 100)}% |\n`;
  report += `| ⚠️ Warnings | ${results.warnings} | ${Math.round(results.warnings / results.total * 100)}% |\n`;
  report += `| 🔍 Need Review | ${results.reviews} | ${Math.round(results.reviews / results.total * 100)}% |\n`;
  report += `| ❌ Violations | ${results.violations} | ${Math.round(results.violations / results.total * 100)}% |\n\n`;
  
  if (results.violations > 0) {
    report += `## Critical Violations\n\n`;
    report += `These items do not align with project goals and must be addressed:\n\n`;
    
    results.items
      .filter(item => item.status === 'blocked')
      .forEach(item => {
        report += `### ${item.title}\n`;
        report += `- **ID**: ${item.id}\n`;
        report += `- **Confidence**: ${item.confidence}%\n`;
        report += `- **Issue**: ${item.message}\n`;
        report += `- **Action Required**: ${item.recommendation}\n\n`;
      });
  }
  
  if (results.reviews > 0) {
    report += `## Items Requiring Review\n\n`;
    
    results.items
      .filter(item => item.status === 'review')
      .forEach(item => {
        report += `### ${item.title}\n`;
        report += `- **ID**: ${item.id}\n`;
        report += `- **Confidence**: ${item.confidence}%\n`;
        report += `- **Concern**: ${item.message}\n`;
        report += `- **Recommendation**: ${item.recommendation}\n\n`;
      });
  }
  
  report += `## Recommendations\n\n`;
  
  if (results.purityScore < 70) {
    report += `1. **Immediate Action Required**: Context purity is below 70%. Schedule emergency review with Project Manager.\n`;
    report += `2. **Root Cause Analysis**: Investigate how misaligned items entered the backlog.\n`;
    report += `3. **Process Improvement**: Implement pre-backlog context verification.\n`;
  } else if (results.purityScore < 85) {
    report += `1. **Attention Needed**: Some drift detected. Review flagged items with stakeholders.\n`;
    report += `2. **Preventive Measures**: Consider more frequent context verification.\n`;
  } else {
    report += `1. **Good Alignment**: Continue current practices.\n`;
    report += `2. **Minor Improvements**: Address any warnings to maintain high alignment.\n`;
  }
  
  return report;
}

/**
 * Helper: Get current sprint name
 */
async function getCurrentSprintName() {
  // TODO: Read from current workflow state
  const workflowStatePath = path.join(
    verificationEngine.projectRoot,
    'project-state',
    'workflow-state.json'
  );
  
  if (await fs.pathExists(workflowStatePath)) {
    const state = await fs.readJSON(workflowStatePath);
    if (state.active_sprint) {
      return state.active_sprint;
    }
  }
  
  // Prompt for sprint name
  return await promptUser('Enter sprint name (e.g., sprint-2025-01-30-feature):');
}

/**
 * Handle drift monitoring command
 */
async function handleDriftMonitor(action) {
  switch (action.toLowerCase()) {
    case 'start':
      try {
        if (!verificationEngine.currentTruth) {
          return '⚠️ Cannot start drift monitoring without project truth document. Use /verify-context --create-truth first.';
        }
        
        const intervalStr = await promptUser('Check interval in minutes (default: 60):') || '60';
        const interval = parseInt(intervalStr);
        
        if (isNaN(interval) || interval < 5) {
          return '❌ Invalid interval. Must be at least 5 minutes.';
        }
        
        await driftDetector.startMonitoring(interval);
        return `✅ Drift monitoring started (checking every ${interval} minutes)`;
      } catch (error) {
        return `❌ Failed to start monitoring: ${error.message}`;
      }
      
    case 'stop':
      driftDetector.stopMonitoring();
      return '⏹️ Drift monitoring stopped';
      
    case 'check':
      console.log('\n🔍 Running manual drift check...');
      const report = await driftDetector.checkDriftNow();
      return ''; // Report is displayed by the detector
      
    case 'status':
    default:
      const status = driftDetector.getDriftStatus();
      console.log('\n📊 Drift Monitoring Status\n');
      console.log(`Monitoring: ${status.monitoring ? '✅ Active' : '❌ Inactive'}`);
      if (status.lastCheck) {
        console.log(`Last Check: ${new Date(status.lastCheck).toLocaleString()}`);
        console.log(`Current Drift: ${status.currentDrift}%`);
        console.log(`Severity: ${status.severity.toUpperCase()}`);
        if (status.trend.increasing) {
          console.log(`Trend: ⬆️ Increasing at ${status.trend.rate}% per check`);
        } else if (status.trend.rate > 0) {
          console.log(`Trend: ⬇️ Decreasing at ${status.trend.rate}% per check`);
        } else {
          console.log(`Trend: ➡️ Stable`);
        }
      }
      console.log(`\nUse /verify-context --monitor-drift [start|stop|check] to control monitoring`);
      return '';
  }
}

/**
 * Handle learning insights command
 */
async function handleLearningInsights() {
  if (!verificationEngine.currentTruth) {
    return '⚠️ No project truth document found. Use /verify-context --create-truth to create one.';
  }

  console.log('\n🧠 Context Violation Learning Insights\n');
  
  const result = await verificationEngine.getLearningInsights();
  
  if (!result.success) {
    return `⚠️ ${result.message}`;
  }

  const insights = result.insights;
  
  // Display common violations
  if (insights.commonViolations.length > 0) {
    console.log('📊 Common Violation Patterns:');
    insights.commonViolations.forEach((violation, i) => {
      console.log(`   ${i + 1}. ${violation.description}`);
    });
    console.log('');
  } else {
    console.log('✅ No violation patterns detected yet\n');
  }

  // Display risk factors
  if (insights.riskFactors.length > 0) {
    console.log('⚠️ Risk Factors for Your Project:');
    insights.riskFactors.forEach(risk => {
      const icon = risk.impact === 'high' ? '🔴' : risk.impact === 'medium' ? '🟡' : '🟢';
      console.log(`   ${icon} ${risk.factor}`);
      console.log(`      Mitigation: ${risk.mitigation}`);
    });
    console.log('');
  }

  // Display prevention strategies
  if (insights.preventionStrategies.length > 0) {
    console.log('🛡️ Recommended Prevention Strategies:');
    insights.preventionStrategies.forEach(strategy => {
      const priorityIcon = strategy.priority === 'critical' ? '🔴' : 
                          strategy.priority === 'high' ? '🟠' : '🟡';
      console.log(`   ${priorityIcon} ${strategy.name}`);
      console.log(`      ${strategy.description}`);
    });
    console.log('');
  }

  // Display recommendations
  if (insights.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    insights.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.action}`);
      if (rec.details) {
        console.log(`      ${rec.details}`);
      }
    });
  }

  console.log('\n📚 Use /verify-context --audit-backlog to check current items');
  console.log('🔍 Use /verify-context --monitor-drift start to enable continuous monitoring');

  return '';
}

/**
 * Handle drift status command
 */
async function handleDriftStatus() {
  const status = driftDetector.getDriftStatus();
  
  console.log('\n📊 Context Drift Status\n');
  
  if (!status.monitoring) {
    console.log('⚠️ Drift monitoring is not active.');
    console.log('Start monitoring with: /verify-context --monitor-drift start\n');
    return '';
  }
  
  console.log(`Last Check: ${new Date(status.lastCheck).toLocaleString()}`);
  console.log(`Current Drift: ${status.currentDrift}%`);
  console.log(`Severity: ${status.severity.toUpperCase()}\n`);
  
  // Show severity scale
  console.log('Drift Scale:');
  console.log('  🟢 0-20%   - None/Minor');
  console.log('  🟡 20-40%  - Moderate');
  console.log('  🟠 40-60%  - Major');
  console.log('  🔴 60-80%  - Critical');
  console.log('  ⚫ 80-100% - Severe\n');
  
  // Show trend
  if (status.historyLength >= 5) {
    if (status.trend.increasing) {
      console.log(`⚠️ Trend: Drift is increasing at ${status.trend.rate}% per check`);
    } else if (status.trend.rate > 0) {
      console.log(`✅ Trend: Drift is decreasing at ${status.trend.rate}% per check`);
    } else {
      console.log(`➡️ Trend: Drift is stable`);
    }
  } else {
    console.log(`📊 Trend: Need ${5 - status.historyLength} more checks to calculate trend`);
  }
  
  console.log('\nCommands:');
  console.log('  /verify-context --monitor-drift check  - Run check now');
  console.log('  /verify-context --audit-backlog       - Full backlog audit');
  console.log('  /verify-context --show-truth          - View project truth');
  
  return '';
}

// Export initialization function
module.exports = {
  initialize
};