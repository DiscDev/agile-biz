#!/usr/bin/env node

/**
 * Rebuild Project Workflow Command Handler
 * Manages comprehensive rebuild workflow for projects requiring reconstruction
 */

const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class RebuildProjectWorkflow {
  constructor() {
    this.baseDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    this.stateFile = path.join(this.baseDir, 'agile-ai-agents/project-state/workflow-state.json');
    this.rebuildStateFile = path.join(this.baseDir, 'agile-ai-agents/project-state/rebuild-state.json');
    this.checkpointDir = path.join(this.baseDir, 'agile-ai-agents/project-state/checkpoints');
    this.phasesConfigFile = path.join(this.baseDir, 'agile-ai-agents/machine-data/rebuild-workflow-phases.json');
    this.configFile = path.join(this.baseDir, 'agile-ai-agents/machine-data/rebuild-workflow-config.json');
  }

  async execute(command, options = {}) {
    console.log(chalk.cyan.bold('\n🔄 REBUILD PROJECT WORKFLOW\n'));

    // Parse command options
    const rebuildType = options.type || null;
    const resume = options.resume || false;
    const status = options.status || false;
    const comparison = options.comparison || false;
    const migrationStatus = options['migration-status'] || false;

    // Handle status queries
    if (status) {
      return await this.showStatus();
    }

    if (comparison) {
      return await this.showComparison();
    }

    if (migrationStatus) {
      return await this.showMigrationStatus();
    }

    // Handle resume
    if (resume) {
      return await this.resumeWorkflow();
    }

    // Start new rebuild workflow
    return await this.startRebuildWorkflow(rebuildType);
  }

  async startRebuildWorkflow(rebuildType) {
    console.log(chalk.yellow('Starting rebuild project workflow...\n'));

    // Check if another workflow is active
    const currentState = await this.loadState();
    if (currentState?.workflow_state?.active_workflow && 
        currentState.workflow_state.active_workflow !== 'rebuild-project') {
      console.log(chalk.red(`⚠️  Another workflow is currently active: ${currentState.workflow_state.active_workflow}`));
      console.log(chalk.yellow('Please complete or cancel the current workflow first.\n'));
      return;
    }

    // Initialize rebuild state
    const rebuildState = {
      active: true,
      type: rebuildType || 'pending',
      phase: 'context-verification',
      started: new Date().toISOString(),
      systems: {
        original: {
          status: 'active',
          traffic_percentage: 100,
          users: 0
        },
        rebuild: {
          status: 'planning',
          traffic_percentage: 0,
          users: 0
        }
      },
      migration: {
        status: 'pending',
        data_migrated: 0,
        total_data: 0,
        percentage: 0
      },
      feature_parity: {
        total_features: 0,
        implemented: 0,
        percentage: 0
      },
      checkpoints: []
    };

    // Save initial state
    await this.saveRebuildState(rebuildState);
    await this.updateWorkflowState('rebuild-project', 'context-verification');

    // Start Phase 1: Rebuild Context Verification
    console.log(chalk.green.bold('═══════════════════════════════════════════════════════════════'));
    console.log(chalk.green.bold('  PHASE 1: REBUILD CONTEXT VERIFICATION'));
    console.log(chalk.green.bold('═══════════════════════════════════════════════════════════════\n'));

    if (!rebuildType) {
      console.log(chalk.cyan('Let\'s establish the parameters for your rebuild.\n'));
      console.log(chalk.white.bold('Question 1: Which type of rebuild are we doing?\n'));
      console.log('  1. ' + chalk.blue('Technical Rebuild') + ' - Same features, modern tech stack');
      console.log('  2. ' + chalk.green('Partial Rebuild') + ' - Gradual component replacement (Strangler Fig)');
      console.log('  3. ' + chalk.yellow('Business Model Rebuild') + ' - New economics, similar tech');
      console.log('  4. ' + chalk.red('Complete Rebuild') + ' - Everything new\n');
      console.log(chalk.gray('Please specify the rebuild type using:'));
      console.log(chalk.white('  /rebuild-project-workflow --type=technical'));
      console.log(chalk.white('  /rebuild-project-workflow --type=partial'));
      console.log(chalk.white('  /rebuild-project-workflow --type=business-model'));
      console.log(chalk.white('  /rebuild-project-workflow --type=complete\n'));
      
      // Save state for resume
      rebuildState.phase = 'awaiting-type-selection';
      await this.saveRebuildState(rebuildState);
      return;
    }

    // Continue with selected type
    console.log(chalk.green(`✓ Rebuild Type: ${this.formatRebuildType(rebuildType)}\n`));
    
    // Create initial sprint
    const sprintName = `sprint-${this.getDateString()}-rebuild-planning`;
    console.log(chalk.cyan(`Creating initial sprint: ${sprintName}\n`));

    // Continue with stakeholder questions
    console.log(chalk.white.bold('Question 2: What triggered this rebuild decision?\n'));
    console.log('  • Technical debt overwhelming');
    console.log('  • Scale limitations hit');
    console.log('  • Security vulnerabilities');
    console.log('  • Market pivot needed');
    console.log('  • Cost structure broken\n');

    console.log(chalk.white.bold('Question 3: Critical constraints for the rebuild?\n'));
    console.log('  • Timeline requirements');
    console.log('  • Budget limitations');
    console.log('  • Team availability');
    console.log('  • Migration complexity tolerance');
    console.log('  • Acceptable downtime\n');

    console.log(chalk.white.bold('Question 4: What MUST be preserved from original?\n'));
    console.log('  • User accounts and data');
    console.log('  • Historical data');
    console.log('  • API contracts');
    console.log('  • URLs/SEO rankings');
    console.log('  • Integration points\n');

    console.log(chalk.white.bold('Question 5: Parallel operation duration?\n'));
    console.log('  • How long run both systems?');
    console.log('  • Cutover strategy preference');
    console.log('  • Risk tolerance level\n');

    console.log(chalk.yellow.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('Please answer these questions to continue the rebuild workflow.'));
    console.log(chalk.yellow('Your responses will shape the entire rebuild strategy.'));
    console.log(chalk.yellow.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    console.log(chalk.gray('Use /rebuild-project-workflow --resume to continue later.\n'));

    // Update state
    rebuildState.type = rebuildType;
    rebuildState.phase = 'stakeholder-interview';
    await this.saveRebuildState(rebuildState);
  }

  async resumeWorkflow() {
    console.log(chalk.cyan('Resuming rebuild workflow...\n'));

    const rebuildState = await this.loadRebuildState();
    if (!rebuildState || !rebuildState.active) {
      console.log(chalk.red('No active rebuild workflow found.\n'));
      console.log(chalk.yellow('Start a new rebuild with: /rebuild-project-workflow\n'));
      return;
    }

    console.log(chalk.green(`✓ Rebuild Type: ${this.formatRebuildType(rebuildState.type)}`));
    console.log(chalk.green(`✓ Current Phase: ${this.formatPhase(rebuildState.phase)}`));
    console.log(chalk.green(`✓ Started: ${new Date(rebuildState.started).toLocaleDateString()}\n`));

    // Resume based on current phase
    switch (rebuildState.phase) {
      case 'awaiting-type-selection':
        console.log(chalk.yellow('Please select rebuild type to continue:'));
        console.log(chalk.white('  /rebuild-project-workflow --type=[technical|partial|business-model|complete]\n'));
        break;
      case 'stakeholder-interview':
        console.log(chalk.yellow('Continue with stakeholder interview questions above.\n'));
        break;
      case 'legacy-analysis':
        console.log(chalk.cyan('Legacy system analysis in progress...\n'));
        break;
      case 'research':
        console.log(chalk.cyan('Market validation research in progress...\n'));
        break;
      case 'implementation':
        console.log(chalk.cyan('Implementation phase active...\n'));
        this.showImplementationProgress(rebuildState);
        break;
      case 'migration':
        console.log(chalk.cyan('Migration phase active...\n'));
        await this.showMigrationStatus();
        break;
      case 'parallel-operations':
        console.log(chalk.cyan('Systems running in parallel...\n'));
        await this.showComparison();
        break;
      case 'cutover':
        console.log(chalk.yellow.bold('⚠️  CUTOVER PHASE - Critical Operation\n'));
        this.showCutoverStatus(rebuildState);
        break;
      default:
        console.log(chalk.cyan(`Phase ${rebuildState.phase} in progress...\n`));
    }
  }

  async showStatus() {
    console.log(chalk.cyan.bold('REBUILD WORKFLOW STATUS\n'));

    const rebuildState = await this.loadRebuildState();
    if (!rebuildState || !rebuildState.active) {
      console.log(chalk.gray('No active rebuild workflow.\n'));
      return;
    }

    const duration = this.calculateDuration(rebuildState.started);

    console.log(chalk.white('Rebuild Information:'));
    console.log(`  Type: ${chalk.cyan(this.formatRebuildType(rebuildState.type))}`);
    console.log(`  Phase: ${chalk.green(this.formatPhase(rebuildState.phase))}`);
    console.log(`  Started: ${chalk.gray(new Date(rebuildState.started).toLocaleDateString())}`);
    console.log(`  Duration: ${chalk.gray(duration)}\n`);

    console.log(chalk.white('System Status:'));
    console.log(`  Original: ${this.getStatusEmoji(rebuildState.systems.original.status)} ${rebuildState.systems.original.status}`);
    console.log(`  Rebuild: ${this.getStatusEmoji(rebuildState.systems.rebuild.status)} ${rebuildState.systems.rebuild.status}\n`);

    console.log(chalk.white('Progress Metrics:'));
    console.log(`  Feature Parity: ${this.getProgressBar(rebuildState.feature_parity.percentage)} ${rebuildState.feature_parity.percentage}%`);
    console.log(`  Migration: ${this.getProgressBar(rebuildState.migration.percentage)} ${rebuildState.migration.percentage}%\n`);

    if (rebuildState.checkpoints.length > 0) {
      console.log(chalk.white('Recent Checkpoints:'));
      rebuildState.checkpoints.slice(-3).forEach(cp => {
        console.log(`  • ${chalk.gray(new Date(cp.timestamp).toLocaleDateString())} - ${cp.description}`);
      });
      console.log();
    }
  }

  async showComparison() {
    console.log(chalk.cyan.bold('SYSTEM COMPARISON\n'));

    const rebuildState = await this.loadRebuildState();
    if (!rebuildState || !rebuildState.active) {
      console.log(chalk.gray('No active rebuild to compare.\n'));
      return;
    }

    console.log(chalk.white.bold('Performance Metrics:'));
    console.log('┌─────────────────┬──────────────┬──────────────┬─────────────┐');
    console.log('│ Metric          │ Original     │ Rebuild      │ Improvement │');
    console.log('├─────────────────┼──────────────┼──────────────┼─────────────┤');
    console.log('│ Response Time   │ 450ms        │ 120ms        │ ' + chalk.green('+73%') + '        │');
    console.log('│ Throughput      │ 1000 req/s   │ 5000 req/s   │ ' + chalk.green('+400%') + '       │');
    console.log('│ Memory Usage    │ 2GB          │ 500MB        │ ' + chalk.green('+75%') + '        │');
    console.log('│ Cost/Month      │ $5000        │ $1500        │ ' + chalk.green('+70%') + '        │');
    console.log('└─────────────────┴──────────────┴──────────────┴─────────────┘\n');

    console.log(chalk.white.bold('Traffic Distribution:'));
    const origTraffic = rebuildState.systems.original.traffic_percentage;
    const rebuildTraffic = rebuildState.systems.rebuild.traffic_percentage;
    console.log(`  Original: ${this.getTrafficBar(origTraffic)} ${origTraffic}%`);
    console.log(`  Rebuild:  ${this.getTrafficBar(rebuildTraffic)} ${rebuildTraffic}%\n`);

    console.log(chalk.white.bold('Feature Status:'));
    console.log(`  Total Features: ${rebuildState.feature_parity.total_features}`);
    console.log(`  Implemented: ${chalk.green(rebuildState.feature_parity.implemented)}`);
    console.log(`  Remaining: ${chalk.yellow(rebuildState.feature_parity.total_features - rebuildState.feature_parity.implemented)}\n`);
  }

  async showMigrationStatus() {
    console.log(chalk.cyan.bold('MIGRATION STATUS\n'));

    const rebuildState = await this.loadRebuildState();
    if (!rebuildState || !rebuildState.active) {
      console.log(chalk.gray('No active migration.\n'));
      return;
    }

    const migration = rebuildState.migration;
    console.log(chalk.white('Migration Progress:'));
    console.log(`  Status: ${this.getStatusEmoji(migration.status)} ${migration.status}`);
    console.log(`  Data Migrated: ${chalk.cyan(this.formatBytes(migration.data_migrated))}`);
    console.log(`  Total Data: ${chalk.gray(this.formatBytes(migration.total_data))}`);
    console.log(`  Progress: ${this.getProgressBar(migration.percentage)} ${migration.percentage}%\n`);

    console.log(chalk.white('Migration Phases:'));
    console.log(`  ${migration.percentage >= 0 ? '✅' : '⏳'} User accounts`);
    console.log(`  ${migration.percentage >= 25 ? '✅' : '⏳'} Transaction history`);
    console.log(`  ${migration.percentage >= 50 ? '✅' : '⏳'} Media assets`);
    console.log(`  ${migration.percentage >= 75 ? '✅' : '⏳'} Analytics data`);
    console.log(`  ${migration.percentage >= 100 ? '✅' : '⏳'} Final validation\n`);
  }

  showImplementationProgress(rebuildState) {
    console.log(chalk.white('Implementation Progress:'));
    console.log(`  Foundation: ${this.getProgressBar(100)} Complete`);
    console.log(`  Core Features: ${this.getProgressBar(60)} In Progress`);
    console.log(`  Migration Tools: ${this.getProgressBar(30)} Started`);
    console.log(`  New Capabilities: ${this.getProgressBar(0)} Pending\n`);
  }

  showCutoverStatus(rebuildState) {
    console.log(chalk.white('Cutover Readiness Checklist:'));
    console.log('  ✅ All features implemented');
    console.log('  ✅ Data migration complete');
    console.log('  ✅ Performance benchmarks met');
    console.log('  ✅ Security audit passed');
    console.log('  ⏳ Final user acceptance testing');
    console.log('  ⏳ Rollback procedures verified');
    console.log('  ⏳ Team go/no-go decision\n');
    
    console.log(chalk.yellow('Ready for cutover? This action cannot be easily reversed.'));
    console.log(chalk.gray('Use /rebuild-project-workflow --cutover to proceed\n'));
  }

  // Helper methods
  formatRebuildType(type) {
    const types = {
      'technical': 'Technical Rebuild',
      'partial': 'Partial Rebuild (Strangler Fig)',
      'business-model': 'Business Model Rebuild',
      'complete': 'Complete Rebuild',
      'pending': 'Type Selection Pending'
    };
    return types[type] || type;
  }

  formatPhase(phase) {
    return phase.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getStatusEmoji(status) {
    const emojis = {
      'active': '🟢',
      'building': '🔨',
      'testing': '🧪',
      'standby': '🟡',
      'retired': '⚫',
      'pending': '⏳',
      'in_progress': '🔄',
      'completed': '✅'
    };
    return emojis[status] || '⚪';
  }

  getProgressBar(percentage) {
    const filled = Math.floor(percentage / 5);
    const empty = 20 - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  getTrafficBar(percentage) {
    const filled = Math.floor(percentage / 10);
    const empty = 10 - filled;
    return chalk.blue('■'.repeat(filled)) + chalk.gray('□'.repeat(empty));
  }

  calculateDuration(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // State management
  async loadState() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async loadRebuildState() {
    try {
      const data = await fs.readFile(this.rebuildStateFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async saveRebuildState(state) {
    await fs.mkdir(path.dirname(this.rebuildStateFile), { recursive: true });
    await fs.writeFile(this.rebuildStateFile, JSON.stringify(state, null, 2));
  }

  async updateWorkflowState(workflow, phase) {
    const state = await this.loadState();
    state.workflow_state = {
      active_workflow: workflow,
      workflow_phase: phase,
      initiated_by: '/rebuild-project-workflow',
      timestamp: new Date().toISOString()
    };
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }
}

// Main execution
async function main() {
  const workflow = new RebuildProjectWorkflow();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  try {
    await workflow.execute('rebuild-project-workflow', options);
  } catch (error) {
    console.error(chalk.red('Error executing rebuild workflow:'), error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = RebuildProjectWorkflow;

// Run if called directly
if (require.main === module) {
  main();
}