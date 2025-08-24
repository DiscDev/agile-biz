#!/usr/bin/env node

/**
 * Rebuild Monitor Handler
 * Coordinates all rebuild-related hooks and monitoring
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class RebuildMonitor {
  constructor() {
    this.baseDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    this.rebuildStateFile = path.join(this.baseDir, 'agile-ai-agents/project-state/rebuild-state.json');
    this.hooksDir = path.join(this.baseDir, '.claude/hooks');
    this.monitoringInterval = null;
  }

  async initialize() {
    // Check if rebuild is active
    const rebuildState = await this.loadRebuildState();
    if (!rebuildState || !rebuildState.active) {
      console.log('No active rebuild workflow');
      return false;
    }

    return true;
  }

  async loadRebuildState() {
    try {
      const data = await fs.readFile(this.rebuildStateFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async runHook(hookName) {
    const hookPath = path.join(this.hooksDir, `${hookName}.sh`);
    
    try {
      // Check if hook exists
      await fs.access(hookPath);
      
      // Execute hook
      const { stdout, stderr } = await execAsync(`bash "${hookPath}"`);
      
      if (stdout) {
        console.log(stdout);
      }
      
      if (stderr) {
        console.error(`Hook ${hookName} error:`, stderr);
      }
      
      return { success: true, output: stdout };
    } catch (error) {
      console.error(`Failed to run hook ${hookName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async monitorRebuildProgress() {
    const rebuildState = await this.loadRebuildState();
    if (!rebuildState) return;

    console.log('\n🔄 REBUILD MONITORING ACTIVE\n');

    // Determine which hooks to run based on current phase
    const phase = rebuildState.phase;
    const hooksToRun = this.getHooksForPhase(phase);

    for (const hook of hooksToRun) {
      console.log(`Running ${hook} hook...`);
      await this.runHook(hook);
      console.log('');
    }

    // Check for critical conditions
    await this.checkCriticalConditions(rebuildState);
  }

  getHooksForPhase(phase) {
    const phaseHooks = {
      'context-verification': ['rebuild-decision'],
      'stakeholder-interview': [],
      'legacy-analysis': ['rebuild-decision'],
      'market-validation': [],
      'implementation': ['feature-parity'],
      'migration': ['migration-progress'],
      'parallel-operations': ['parallel-operations', 'feature-parity'],
      'cutover': ['cutover-readiness'],
      'stabilization': ['parallel-operations'],
      'optimization': [],
      'legacy-retirement': []
    };

    return phaseHooks[phase] || [];
  }

  async checkCriticalConditions(rebuildState) {
    // Check migration status if in migration phase
    if (rebuildState.phase === 'migration' || rebuildState.phase === 'parallel-operations') {
      const migrationState = await this.loadMigrationState();
      if (migrationState && migrationState.errors && migrationState.errors.length > 0) {
        console.log('\n⚠️  CRITICAL: Migration errors detected!');
        console.log('Run /rebuild-project-workflow --migration-status for details\n');
      }
    }

    // Check feature parity if in implementation phase
    if (rebuildState.phase === 'implementation' || rebuildState.phase === 'parallel-operations') {
      const featureState = await this.loadFeatureState();
      if (featureState && featureState.critical_incomplete > 0) {
        console.log('\n⚠️  CRITICAL: Critical features incomplete!');
        console.log(`${featureState.critical_incomplete} critical features must be completed before cutover\n`);
      }
    }

    // Check cutover readiness if approaching cutover
    if (rebuildState.phase === 'parallel-operations' || rebuildState.phase === 'cutover') {
      const cutoverAssessment = await this.loadCutoverAssessment();
      if (cutoverAssessment && cutoverAssessment.readiness_score < 90) {
        console.log('\n⚠️  WARNING: System not ready for cutover');
        console.log(`Readiness score: ${cutoverAssessment.readiness_score}%`);
        console.log('Run cutover-readiness hook for detailed assessment\n');
      }
    }
  }

  async loadMigrationState() {
    try {
      const migrationStateFile = path.join(this.baseDir, 'agile-ai-agents/project-state/migration-state.json');
      const data = await fs.readFile(migrationStateFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async loadFeatureState() {
    try {
      const featureStateFile = path.join(this.baseDir, 'agile-ai-agents/project-state/feature-parity.json');
      const data = await fs.readFile(featureStateFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async loadCutoverAssessment() {
    try {
      const assessmentFile = path.join(this.baseDir, 'agile-ai-agents/project-state/cutover-assessment.json');
      const data = await fs.readFile(assessmentFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async startContinuousMonitoring(intervalMinutes = 30) {
    console.log(`Starting continuous rebuild monitoring (every ${intervalMinutes} minutes)`);
    
    // Run initial check
    await this.monitorRebuildProgress();
    
    // Set up interval
    this.monitoringInterval = setInterval(async () => {
      await this.monitorRebuildProgress();
    }, intervalMinutes * 60 * 1000);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log('Rebuild monitoring stopped');
    }
  }

  async generateStatusReport() {
    const rebuildState = await this.loadRebuildState();
    if (!rebuildState) {
      console.log('No active rebuild to report on');
      return;
    }

    const report = {
      timestamp: new Date().toISOString(),
      rebuild_type: rebuildState.type,
      current_phase: rebuildState.phase,
      started: rebuildState.started,
      duration_days: Math.floor((Date.now() - new Date(rebuildState.started)) / (1000 * 60 * 60 * 24)),
      systems: rebuildState.systems,
      migration: rebuildState.migration,
      feature_parity: rebuildState.feature_parity,
      checkpoints: rebuildState.checkpoints.length
    };

    // Add phase-specific metrics
    if (rebuildState.phase === 'migration' || rebuildState.phase === 'parallel-operations') {
      const migrationState = await this.loadMigrationState();
      if (migrationState) {
        report.migration_details = migrationState;
      }
    }

    if (rebuildState.phase === 'implementation' || rebuildState.phase === 'parallel-operations') {
      const featureState = await this.loadFeatureState();
      if (featureState) {
        report.feature_details = featureState;
      }
    }

    if (rebuildState.phase === 'cutover') {
      const cutoverAssessment = await this.loadCutoverAssessment();
      if (cutoverAssessment) {
        report.cutover_readiness = cutoverAssessment;
      }
    }

    // Save report
    const reportFile = path.join(
      this.baseDir,
      'agile-ai-agents/project-documents/rebuild/monitoring',
      `status-report-${new Date().toISOString().split('T')[0]}.json`
    );
    
    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('Status report generated:', reportFile);
    return report;
  }
}

// Main execution
async function main() {
  const monitor = new RebuildMonitor();
  
  const initialized = await monitor.initialize();
  if (!initialized) {
    process.exit(0);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';

  switch (command) {
    case 'monitor':
      await monitor.monitorRebuildProgress();
      break;
    case 'continuous':
      const interval = parseInt(args[1]) || 30;
      await monitor.startContinuousMonitoring(interval);
      // Keep process alive
      process.on('SIGINT', () => {
        monitor.stopMonitoring();
        process.exit(0);
      });
      break;
    case 'report':
      await monitor.generateStatusReport();
      break;
    case 'hook':
      const hookName = args[1];
      if (hookName) {
        await monitor.runHook(hookName);
      } else {
        console.error('Please specify hook name');
      }
      break;
    default:
      console.log('Usage:');
      console.log('  rebuild-monitor.js monitor     - Run single monitoring check');
      console.log('  rebuild-monitor.js continuous [minutes] - Continuous monitoring');
      console.log('  rebuild-monitor.js report      - Generate status report');
      console.log('  rebuild-monitor.js hook [name] - Run specific hook');
  }
}

// Export for testing
module.exports = RebuildMonitor;

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Rebuild monitor error:', error);
    process.exit(1);
  });
}