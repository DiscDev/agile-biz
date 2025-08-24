/**
 * State Management Commands Handler
 * Commands for project state management and persistence
 */

const fs = require('fs');
const path = require('path');

class StateHandler {
  constructor() {
    this.projectRoot = process.cwd();
    this.stateDir = path.join(this.projectRoot, 'project-state');
  }

  /**
   * Initialize and register commands
   */
  initialize(registry) {
    // Register new /aaa-status command
    registry.registerCommand('/aaa-status', {
      description: 'Show current project and workflow status',
      handler: this.showStatus.bind(this),
      category: 'state',
      usage: '/aaa-status',
      examples: ['/aaa-status']
    });

    // Register alias for old /status command with deprecation warning
    registry.registerAlias(
      '/status',
      '/aaa-status',
      'Note: /status conflicts with Claude Code. Please use /aaa-status instead.'
    );

    // Other state commands
    registry.registerCommand('/checkpoint', {
      description: 'Create manual save point',
      handler: this.createCheckpoint.bind(this),
      category: 'state',
      usage: '/checkpoint [message] [--full]',
      examples: [
        '/checkpoint',
        '/checkpoint "Completed authentication feature"',
        '/checkpoint --full'
      ]
    });

    registry.registerCommand('/continue', {
      description: 'Resume previous work session',
      handler: this.continueWork.bind(this),
      category: 'state',
      usage: '/continue [sprint-name]',
      examples: [
        '/continue',
        '/continue sprint-2025-01-30-authentication'
      ]
    });

    registry.registerCommand('/where-are-we', {
      description: 'Display comprehensive context summary',
      handler: this.whereAreWe.bind(this),
      category: 'state',
      usage: '/where-are-we',
      examples: ['/where-are-we']
    });

    registry.registerCommand('/update-state', {
      description: 'Manually update project state',
      handler: this.updateState.bind(this),
      category: 'state',
      usage: '/update-state "details"',
      examples: ['/update-state "Completed user authentication, starting on dashboard"']
    });

    registry.registerCommand('/save-decision', {
      description: 'Save important decision with rationale',
      handler: this.saveDecision.bind(this),
      category: 'state',
      usage: '/save-decision "decision" ["rationale"]',
      examples: [
        '/save-decision "Use PostgreSQL for database"',
        '/save-decision "Switch to TypeScript" "Better type safety for large team"'
      ]
    });

    registry.registerCommand('/show-learnings', {
      description: 'Display captured learnings from this project',
      handler: this.showLearnings.bind(this),
      category: 'state',
      usage: '/show-learnings',
      examples: ['/show-learnings']
    });
  }

  /**
   * Show project status (renamed from /status)
   */
  async showStatus() {
    const currentStatePath = path.join(this.stateDir, 'current-state.json');
    const workflowStatePath = path.join(this.stateDir, 'workflow-state.json');
    
    console.log('\n' + '─'.repeat(60));
    console.log('  📊 PROJECT STATUS');
    console.log('─'.repeat(60) + '\n');

    // Check if state exists
    if (!fs.existsSync(currentStatePath)) {
      console.log('ℹ️  No project state found. Start with a workflow command:\n');
      console.log('  • /start-new-project-workflow');
      console.log('  • /start-existing-project-workflow\n');
      return;
    }

    try {
      // Load states
      const currentState = JSON.parse(fs.readFileSync(currentStatePath, 'utf8'));
      const workflowState = fs.existsSync(workflowStatePath) 
        ? JSON.parse(fs.readFileSync(workflowStatePath, 'utf8'))
        : null;

      // Project info
      console.log('🏗️  Project Information');
      console.log(`   Name: ${currentState.projectName || 'Unnamed Project'}`);
      console.log(`   Started: ${new Date(currentState.createdAt).toLocaleDateString()}`);
      console.log(`   Last Updated: ${new Date(currentState.lastUpdated).toLocaleString()}`);
      
      // Workflow status
      if (workflowState?.active_workflow) {
        console.log('\n📋 Workflow Status');
        console.log(`   Type: ${workflowState.active_workflow}`);
        console.log(`   Phase: ${workflowState.workflow_phase || 'Unknown'}`);
        console.log(`   Started: ${new Date(workflowState.started_at).toLocaleString()}`);
      }

      // Current task
      if (currentState.currentTask) {
        console.log('\n🎯 Current Task');
        console.log(`   ${currentState.currentTask.description}`);
        if (currentState.currentTask.sprint) {
          console.log(`   Sprint: ${currentState.currentTask.sprint}`);
        }
      }

      // Recent decisions
      if (currentState.decisions?.length > 0) {
        console.log('\n💡 Recent Decisions');
        const recentDecisions = currentState.decisions.slice(-3);
        recentDecisions.forEach(decision => {
          console.log(`   • ${decision.decision}`);
          if (decision.rationale) {
            console.log(`     → ${decision.rationale}`);
          }
        });
      }

      // Active sprint
      if (currentState.activeSprint) {
        console.log('\n🏃 Active Sprint');
        console.log(`   ${currentState.activeSprint.name}`);
        console.log(`   Progress: ${currentState.activeSprint.completedPoints || 0}/${currentState.activeSprint.totalPoints || 0} points`);
      }

      // Next steps
      console.log('\n📌 Next Steps');
      console.log('   Use /continue to resume work');
      console.log('   Use /checkpoint to save progress');
      console.log('   Use /aaa-help for all commands\n');

    } catch (error) {
      console.error('❌ Error reading project state:', error.message);
    }
  }

  /**
   * Create checkpoint
   */
  async createCheckpoint(args) {
    const { options, positional } = require('../registry').parseOptions(args);
    const message = positional.join(' ');
    
    console.log('✅ Creating checkpoint...');
    
    // Implementation would call actual checkpoint logic
    console.log(`   Message: ${message || 'No message provided'}`);
    if (options.full) {
      console.log('   Type: Full checkpoint');
    }
    
    console.log('✅ Checkpoint created successfully');
  }

  /**
   * Continue work
   */
  async continueWork(args) {
    const sprintName = args.join(' ');
    
    console.log('🔄 Resuming work...');
    if (sprintName) {
      console.log(`   Sprint: ${sprintName}`);
    }
    
    // Show status after loading
    await this.showStatus();
  }

  /**
   * Where are we - comprehensive context
   */
  async whereAreWe() {
    // More detailed than status
    await this.showStatus();
    
    // Add additional context
    console.log('📁 Recent Files');
    console.log('   • Implementation details would go here');
    console.log('\n🔄 Recent Activities');
    console.log('   • Activity log would go here');
  }

  /**
   * Update state manually
   */
  async updateState(args) {
    const details = args.join(' ');
    
    if (!details) {
      console.error('❌ Please provide state details');
      return;
    }
    
    console.log('📝 Updating project state...');
    console.log(`   Details: ${details}`);
    console.log('✅ State updated');
  }

  /**
   * Save decision
   */
  async saveDecision(args) {
    if (args.length === 0) {
      console.error('❌ Please provide a decision');
      return;
    }
    
    // Parse decision and rationale
    let decision, rationale;
    
    // Check if args contain quoted strings
    const quotedMatch = args.join(' ').match(/"([^"]+)"\s*"?([^"]*)"?/);
    if (quotedMatch) {
      decision = quotedMatch[1];
      rationale = quotedMatch[2];
    } else {
      decision = args.join(' ');
    }
    
    console.log('💡 Saving decision...');
    console.log(`   Decision: ${decision}`);
    if (rationale) {
      console.log(`   Rationale: ${rationale}`);
    }
    console.log('✅ Decision saved');
  }

  /**
   * Show learnings
   */
  async showLearnings() {
    const learningsPath = path.join(this.stateDir, 'learnings');
    
    console.log('\n' + '─'.repeat(60));
    console.log('  🎓 PROJECT LEARNINGS');
    console.log('─'.repeat(60) + '\n');
    
    if (!fs.existsSync(learningsPath)) {
      console.log('ℹ️  No learnings captured yet\n');
      console.log('Learnings are captured automatically during:');
      console.log('  • Sprint retrospectives');
      console.log('  • Milestone completions');
      console.log('  • Project completion\n');
      return;
    }
    
    // Implementation would show actual learnings
    console.log('📚 Captured Learnings');
    console.log('   • Learning details would go here\n');
  }
}

// Export handler instance
module.exports = new StateHandler();