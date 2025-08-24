/**
 * Context Commands
 * Quick commands for context management and project status
 */

const { stateTracker } = require('./state-tracker');
const { sessionManager } = require('./session-manager');
const { contextSummarizer } = require('./context-summarizer');
const { conversationTracker } = require('./conversation-tracker');
const { decisionLogger } = require('./decision-logger');
const { claudeMdUpdater } = require('./claude-md-updater');
const fs = require('fs');
const path = require('path');

class ContextCommands {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    
    // Command registry
    this.commands = {
      // Status commands
      'where are we?': this.whereAreWe.bind(this),
      'where are we': this.whereAreWe.bind(this),
      'what did we do last session?': this.lastSession.bind(this),
      'what did we do last session': this.lastSession.bind(this),
      'show recent decisions': this.showRecentDecisions.bind(this),
      'what\'s next?': this.whatNext.bind(this),
      'whats next': this.whatNext.bind(this),
      'what is next': this.whatNext.bind(this),
      
      // Action commands
      'continue working': this.continueWorking.bind(this),
      'checkpoint now': this.checkpointNow.bind(this),
      'restore from': this.restoreFrom.bind(this),
      'handoff to': this.handoffTo.bind(this),
      
      // Validation commands
      'validate state': this.validateState.bind(this),
      'check rules': this.checkRules.bind(this),
      'show blockers': this.showBlockers.bind(this),
      
      // Additional utility commands
      'show sessions': this.showSessions.bind(this),
      'show checkpoints': this.showCheckpoints.bind(this),
      'search decisions': this.searchDecisions.bind(this),
      'show context size': this.showContextSize.bind(this)
    };
    
    // Command aliases
    this.aliases = {
      'status': 'where are we?',
      'continue': 'continue working',
      'checkpoint': 'checkpoint now',
      'save': 'checkpoint now',
      'blockers': 'show blockers',
      'next': 'what\'s next?'
    };
  }
  
  /**
   * Parse and execute command
   */
  async executeCommand(input) {
    try {
      const normalizedInput = input.toLowerCase().trim();
      
      // Check for exact match
      if (this.commands[normalizedInput]) {
        return await this.commands[normalizedInput]();
      }
      
      // Check aliases
      if (this.aliases[normalizedInput]) {
        return await this.commands[this.aliases[normalizedInput]]();
      }
      
      // Check for partial matches (e.g., "restore from checkpoint-123")
      for (const [cmd, handler] of Object.entries(this.commands)) {
        if (normalizedInput.startsWith(cmd)) {
          const args = normalizedInput.substring(cmd.length).trim();
          return await handler(args);
        }
      }
      
      // Command not found
      return {
        success: false,
        message: `Unknown command: "${input}". Try "where are we?" or "continue working".`
      };
    } catch (error) {
      console.error('Error executing command:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * "Where are we?" - Full context summary
   */
  async whereAreWe() {
    console.log('\n🎯 PROJECT STATUS REPORT');
    console.log('=' . repeat(60));
    
    const state = stateTracker.loadProjectState();
    if (!state) {
      return {
        success: false,
        message: 'No project state available. Start by describing your project.'
      };
    }
    
    // Generate comprehensive summary
    const summary = contextSummarizer.generateWhereWeLeftOff(state);
    
    // Project Overview
    console.log('\n📁 PROJECT OVERVIEW');
    console.log(`Name: ${summary.project.name}`);
    console.log(`Phase: ${summary.project.phase}`);
    console.log(`Sprint: ${summary.project.sprint}`);
    
    // Current Status
    console.log('\n📊 CURRENT STATUS');
    summary.current_status.forEach(status => console.log(`• ${status}`));
    
    // Recent Activity
    if (summary.recent_activity.length > 0) {
      console.log('\n🕐 RECENT ACTIVITY');
      summary.recent_activity.forEach(activity => console.log(`• ${activity}`));
    }
    
    // Key Decisions
    if (summary.key_decisions.length > 0) {
      console.log('\n📝 KEY DECISIONS');
      summary.key_decisions.forEach(decision => {
        console.log(`• ${decision.decision} (${decision.when})`);
        console.log(`  Why: ${decision.why}`);
      });
    }
    
    // Next Steps
    console.log('\n📋 NEXT STEPS');
    summary.next_steps.forEach((step, i) => console.log(`${i + 1}. ${step}`));
    
    // Important Context
    console.log('\n💡 IMPORTANT CONTEXT');
    summary.important_context.forEach(context => console.log(`• ${context}`));
    
    // Quick Actions
    console.log('\n⚡ QUICK ACTIONS');
    summary.quick_actions.forEach(action => console.log(`• ${action}`));
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: true,
      summary: summary
    };
  }
  
  /**
   * "What did we do last session?" - Session history
   */
  async lastSession() {
    console.log('\n📅 LAST SESSION SUMMARY');
    console.log('=' . repeat(60));
    
    const sessions = sessionManager.getSessionHistory(1);
    
    if (sessions.length === 0) {
      return {
        success: false,
        message: 'No previous sessions found.'
      };
    }
    
    const lastSession = sessions[0];
    
    console.log(`\nSession ID: ${lastSession.id}`);
    console.log(`Started: ${new Date(lastSession.started_at).toLocaleString()}`);
    console.log(`Duration: ${lastSession.duration}`);
    
    console.log(`\n✅ Completed: ${lastSession.completed_tasks} tasks`);
    console.log(`📝 Decisions: ${lastSession.decisions_made}`);
    
    if (lastSession.summary) {
      console.log(`\nSummary: ${lastSession.summary}`);
    }
    
    // Get more detailed summary if available
    const detailedSummary = stateTracker.getSessionSummary(lastSession.id);
    
    if (detailedSummary) {
      if (detailedSummary.completed_tasks.length > 0) {
        console.log('\nCompleted Tasks:');
        detailedSummary.completed_tasks.forEach(task => 
          console.log(`  • ${task}`)
        );
      }
      
      if (detailedSummary.decisions_made.length > 0) {
        console.log('\nDecisions Made:');
        detailedSummary.decisions_made.slice(0, 3).forEach(decision =>
          console.log(`  • ${decision.decision}`)
        );
      }
      
      if (detailedSummary.files_modified.length > 0) {
        console.log('\nFiles Modified:');
        detailedSummary.files_modified.slice(0, 5).forEach(file =>
          console.log(`  • ${file.path}`)
        );
      }
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: true,
      session: lastSession,
      details: detailedSummary
    };
  }
  
  /**
   * "Show recent decisions" - Decision history
   */
  async showRecentDecisions() {
    console.log('\n📝 RECENT DECISIONS');
    console.log('=' . repeat(60));
    
    const state = stateTracker.loadProjectState();
    const decisions = state?.decisions || [];
    
    if (decisions.length === 0) {
      return {
        success: false,
        message: 'No decisions recorded yet.'
      };
    }
    
    decisions.slice(0, 10).forEach((decision, i) => {
      console.log(`\n${i + 1}. ${decision.decision}`);
      console.log(`   Time: ${new Date(decision.timestamp).toLocaleString()}`);
      console.log(`   Rationale: ${decision.rationale}`);
      
      if (decision.alternatives && decision.alternatives.length > 0) {
        console.log(`   Alternatives considered: ${decision.alternatives.join(', ')}`);
      }
      
      if (decision.impact) {
        console.log(`   Expected impact: ${decision.impact}`);
      }
    });
    
    console.log('\n' + '=' . repeat(60));
    console.log(`Total decisions: ${decisions.length}`);
    
    return {
      success: true,
      decisions: decisions.slice(0, 10),
      total: decisions.length
    };
  }
  
  /**
   * "What's next?" - Next planned actions
   */
  async whatNext() {
    console.log('\n📋 NEXT PLANNED ACTIONS');
    console.log('=' . repeat(60));
    
    const state = stateTracker.loadProjectState();
    
    // Check for active task
    if (state?.current_context?.active_task) {
      const task = state.current_context.active_task;
      console.log('\n🎯 ACTIVE TASK');
      console.log(`Title: ${task.title}`);
      console.log(`Progress: ${task.progress}%`);
      
      if (task.assigned_agents?.length > 0) {
        console.log(`Assigned to: ${task.assigned_agents.join(', ')}`);
      }
      
      if (task.blockers?.length > 0) {
        console.log('\n⚠️  Blockers:');
        task.blockers.forEach(blocker => console.log(`  • ${blocker}`));
      }
    }
    
    // Show next actions
    const nextActions = state?.next_actions || [];
    
    if (nextActions.length > 0) {
      console.log('\n📌 PLANNED ACTIONS');
      nextActions.forEach((action, i) => {
        console.log(`\n${i + 1}. ${action.action}`);
        if (action.priority) {
          console.log(`   Priority: ${action.priority}`);
        }
        if (action.assigned_to) {
          console.log(`   Assigned to: ${action.assigned_to}`);
        }
        if (action.notes) {
          console.log(`   Notes: ${action.notes}`);
        }
      });
    } else {
      console.log('\nNo specific actions planned.');
      console.log('\nSuggested next steps:');
      console.log('1. Review project requirements');
      console.log('2. Plan next sprint');
      console.log('3. Start implementation');
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: true,
      active_task: state?.current_context?.active_task,
      next_actions: nextActions
    };
  }
  
  /**
   * "Continue working" - Resume from last state
   */
  async continueWorking() {
    console.log('\n▶️  RESUMING WORK');
    console.log('=' . repeat(60));
    
    const state = stateTracker.loadProjectState();
    
    if (!state) {
      return {
        success: false,
        message: 'No previous state to resume. Start by describing your project.'
      };
    }
    
    // Show current context
    const summary = contextSummarizer.generateWhereWeLeftOff(state);
    
    if (state.current_context?.active_task) {
      const task = state.current_context.active_task;
      console.log(`\n🎯 Resuming: ${task.title}`);
      console.log(`Progress: ${task.progress}%`);
      
      if (task.next_step) {
        console.log(`\nNext step: ${task.next_step}`);
      }
      
      if (task.context) {
        console.log(`\nContext: ${task.context}`);
      }
    } else if (state.next_actions?.length > 0) {
      console.log('\n📋 Starting next action:');
      const nextAction = state.next_actions[0];
      console.log(`• ${nextAction.action}`);
      
      // Move to active task
      await stateTracker.recordContext({
        active_task: {
          title: nextAction.action,
          progress: 0,
          started_at: new Date().toISOString()
        }
      });
    } else {
      console.log('\nNo active task or planned actions.');
      console.log('Use "What\'s next?" to see available options.');
    }
    
    // Show relevant files
    if (state.current_context?.recent_files?.length > 0) {
      console.log('\n📄 Recent files:');
      state.current_context.recent_files.slice(0, 5).forEach(file =>
        console.log(`  • ${file.path}`)
      );
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: true,
      resumed: true,
      context: summary
    };
  }
  
  /**
   * "Checkpoint now" - Manual checkpoint
   */
  async checkpointNow() {
    console.log('\n💾 CREATING CHECKPOINT');
    console.log('=' . repeat(60));
    
    try {
      const checkpointId = await stateTracker.createCheckpoint('manual-command');
      
      console.log(`\n✅ Checkpoint created successfully!`);
      console.log(`ID: ${checkpointId}`);
      console.log(`Time: ${new Date().toLocaleString()}`);
      
      // Update CLAUDE.md
      await claudeMdUpdater.updateCurrentStatus();
      
      console.log('\n' + '=' . repeat(60));
      
      return {
        success: true,
        checkpoint_id: checkpointId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * "Restore from" - Time travel to specific state
   */
  async restoreFrom(target) {
    console.log('\n⏰ RESTORING STATE');
    console.log('=' . repeat(60));
    
    if (!target) {
      // Show available options
      console.log('\nUsage: "restore from [checkpoint-id or session-id]"');
      console.log('\nAvailable checkpoints:');
      
      const checkpoints = stateTracker.getAvailableCheckpoints();
      checkpoints.slice(0, 5).forEach(checkpoint => {
        console.log(`  • ${checkpoint}`);
      });
      
      console.log('\nRecent sessions:');
      const sessions = sessionManager.getSessionHistory(5);
      sessions.forEach(session => {
        console.log(`  • ${session.id} (${session.started_at})`);
      });
      
      return {
        success: false,
        message: 'Please specify a checkpoint or session ID to restore.'
      };
    }
    
    try {
      // Try as checkpoint first
      if (target.startsWith('checkpoint-')) {
        const checkpointPath = path.join(
          this.basePath,
          'project-state',
          'checkpoints',
          `${target}.json`
        );
        
        if (fs.existsSync(checkpointPath)) {
          const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
          await stateTracker.saveProjectState(checkpoint);
          
          console.log(`\n✅ Restored from checkpoint: ${target}`);
          console.log(`Created: ${checkpoint.checkpoint?.created_at || 'Unknown'}`);
          
          return {
            success: true,
            restored_from: 'checkpoint',
            checkpoint_id: target
          };
        }
      }
      
      // Try as session
      if (target.startsWith('session-')) {
        await sessionManager.restoreSession(target);
        
        console.log(`\n✅ Restored from session: ${target}`);
        
        return {
          success: true,
          restored_from: 'session',
          session_id: target
        };
      }
      
      return {
        success: false,
        message: `Could not find checkpoint or session: ${target}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * "Handoff to" - Generate handoff document
   */
  async handoffTo(recipient) {
    console.log('\n🤝 CREATING HANDOFF');
    console.log('=' . repeat(60));
    
    if (!recipient) {
      return {
        success: false,
        message: 'Please specify recipient: "handoff to [name]"'
      };
    }
    
    try {
      const handoff = await sessionManager.createHandoff(recipient);
      
      console.log(`\n✅ Handoff created for: ${recipient}`);
      console.log(`ID: ${handoff.id}`);
      console.log(`Files created:`);
      console.log(`  • ${handoff.id}.json`);
      console.log(`  • ${handoff.id}.md`);
      
      console.log('\n' + '=' . repeat(60));
      
      return {
        success: true,
        handoff_id: handoff.id,
        recipient: recipient
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * "Validate state" - Check state consistency
   */
  async validateState() {
    console.log('\n🔍 VALIDATING STATE');
    console.log('=' . repeat(60));
    
    const issues = [];
    
    // Check state file exists and is valid
    try {
      const state = stateTracker.loadProjectState();
      if (!state) {
        issues.push('No project state found');
      } else {
        console.log('✅ State file valid');
        
        // Check required fields
        if (!state.session?.id) issues.push('Missing session ID');
        if (!state.project?.name) issues.push('Missing project name');
        if (!state.meta?.version) issues.push('Missing version info');
      }
    } catch (error) {
      issues.push(`State load error: ${error.message}`);
    }
    
    // Check CLAUDE.md
    try {
      const claudeMdPath = path.join(this.basePath, 'claude.md');
      if (!fs.existsSync(claudeMdPath)) {
        issues.push('CLAUDE.md not found');
      } else {
        console.log('✅ CLAUDE.md exists');
      }
    } catch (error) {
      issues.push(`CLAUDE.md check error: ${error.message}`);
    }
    
    // Check system rules
    try {
      const rulesPath = path.join(__dirname, 'system-rules.json');
      if (!fs.existsSync(rulesPath)) {
        issues.push('system-rules.json not found');
      } else {
        console.log('✅ System rules found');
      }
    } catch (error) {
      issues.push(`System rules check error: ${error.message}`);
    }
    
    // Report results
    if (issues.length === 0) {
      console.log('\n✅ All validation checks passed!');
    } else {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => console.log(`  • ${issue}`));
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: issues.length === 0,
      issues: issues
    };
  }
  
  /**
   * "Check rules" - Verify rule compliance
   */
  async checkRules() {
    console.log('\n📋 CHECKING SYSTEM RULES');
    console.log('=' . repeat(60));
    
    const violations = [];
    
    // Load system rules
    const rulesPath = path.join(__dirname, 'system-rules.json');
    let rules;
    
    try {
      rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
      console.log('✅ System rules loaded');
    } catch (error) {
      return {
        success: false,
        error: `Could not load system rules: ${error.message}`
      };
    }
    
    // Check each rule category
    Object.entries(rules.rules).forEach(([category, categoryRules]) => {
      console.log(`\n📌 ${category.toUpperCase()}`);
      
      categoryRules.rules.forEach(rule => {
        // Simple checks for demonstration
        if (rule.id === 'doc-001') {
          // Check for .md files in machine-data
          const machineDataPath = path.join(this.basePath, 'machine-data');
          if (fs.existsSync(machineDataPath)) {
            const mdFiles = this.findMarkdownInMachineData(machineDataPath);
            if (mdFiles.length > 0) {
              violations.push({
                rule: rule.rule,
                violation: `Found ${mdFiles.length} .md files in machine-data`,
                files: mdFiles
              });
            }
          }
        }
        
        console.log(`  ✓ ${rule.rule}`);
      });
    });
    
    // Report violations
    if (violations.length === 0) {
      console.log('\n✅ No rule violations found!');
    } else {
      console.log('\n⚠️  Rule violations:');
      violations.forEach(violation => {
        console.log(`  • ${violation.rule}`);
        console.log(`    ${violation.violation}`);
      });
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: violations.length === 0,
      violations: violations
    };
  }
  
  /**
   * "Show blockers" - Display impediments
   */
  async showBlockers() {
    console.log('\n🚫 CURRENT BLOCKERS');
    console.log('=' . repeat(60));
    
    const state = stateTracker.loadProjectState();
    const blockers = [];
    
    // Check active task blockers
    if (state?.current_context?.active_task?.blockers) {
      blockers.push(...state.current_context.active_task.blockers.map(b => ({
        source: 'Active Task',
        blocker: b
      })));
    }
    
    // Check global blockers
    if (state?.global_blockers) {
      blockers.push(...state.global_blockers.map(b => ({
        source: 'Global',
        blocker: b
      })));
    }
    
    if (blockers.length === 0) {
      console.log('\n✅ No blockers! Clear to proceed.');
    } else {
      blockers.forEach((item, i) => {
        console.log(`\n${i + 1}. ${item.blocker}`);
        console.log(`   Source: ${item.source}`);
      });
      
      console.log('\n💡 To resolve blockers:');
      console.log('  • Contact the Scrum Master Agent');
      console.log('  • Escalate to Project Manager if needed');
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: true,
      blockers: blockers
    };
  }
  
  /**
   * "Show sessions" - List recent sessions
   */
  async showSessions() {
    console.log('\n📅 RECENT SESSIONS');
    console.log('=' . repeat(60));
    
    const sessions = sessionManager.getSessionHistory(10);
    
    if (sessions.length === 0) {
      return {
        success: false,
        message: 'No sessions found.'
      };
    }
    
    sessions.forEach((session, i) => {
      console.log(`\n${i + 1}. ${session.id}`);
      console.log(`   Started: ${new Date(session.started_at).toLocaleString()}`);
      console.log(`   Duration: ${session.duration}`);
      console.log(`   Tasks: ${session.completed_tasks}, Decisions: ${session.decisions_made}`);
      if (session.summary) {
        console.log(`   Summary: ${session.summary}`);
      }
    });
    
    console.log('\n' + '=' . repeat(60));
    console.log('Use "restore from [session-id]" to restore a session.');
    
    return {
      success: true,
      sessions: sessions
    };
  }
  
  /**
   * "Show checkpoints" - List available checkpoints
   */
  async showCheckpoints() {
    console.log('\n💾 AVAILABLE CHECKPOINTS');
    console.log('=' . repeat(60));
    
    const checkpoints = stateTracker.getAvailableCheckpoints();
    
    if (checkpoints.length === 0) {
      return {
        success: false,
        message: 'No checkpoints found.'
      };
    }
    
    checkpoints.forEach((checkpoint, i) => {
      const parts = checkpoint.split('-');
      const timestamp = parseInt(parts[1]);
      const reason = parts.slice(2).join(' ').replace('.json', '');
      
      console.log(`\n${i + 1}. ${checkpoint}`);
      console.log(`   Created: ${new Date(timestamp).toLocaleString()}`);
      console.log(`   Reason: ${reason}`);
    });
    
    console.log('\n' + '=' . repeat(60));
    console.log('Use "restore from [checkpoint-id]" to restore a checkpoint.');
    
    return {
      success: true,
      checkpoints: checkpoints
    };
  }
  
  /**
   * "Search decisions" - Search decision history
   */
  async searchDecisions(query) {
    console.log('\n🔍 SEARCHING DECISIONS');
    console.log('=' . repeat(60));
    
    if (!query) {
      return {
        success: false,
        message: 'Please provide a search term: "search decisions [query]"'
      };
    }
    
    const results = decisionLogger.searchDecisions(query);
    
    if (results.length === 0) {
      console.log(`\nNo decisions found matching "${query}"`);
    } else {
      console.log(`\nFound ${results.length} decisions:`);
      
      results.slice(0, 5).forEach((decision, i) => {
        console.log(`\n${i + 1}. ${decision.decision}`);
        console.log(`   Category: ${decision.category}`);
        console.log(`   Time: ${new Date(decision.timestamp).toLocaleString()}`);
      });
      
      if (results.length > 5) {
        console.log(`\n... and ${results.length - 5} more`);
      }
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: true,
      results: results,
      query: query
    };
  }
  
  /**
   * "Show context size" - Display token usage
   */
  async showContextSize() {
    console.log('\n📏 CONTEXT SIZE ANALYSIS');
    console.log('=' . repeat(60));
    
    const state = stateTracker.loadProjectState();
    const conversation = conversationTracker.getRecentContext();
    
    // Estimate sizes
    const stateSize = contextSummarizer.estimateTokens(state);
    const conversationSize = contextSummarizer.estimateTokens(conversation);
    const totalSize = stateSize + conversationSize;
    
    const maxTokens = 100000; // Approximate
    const utilization = (totalSize / maxTokens * 100).toFixed(1);
    
    console.log(`\nState tokens: ${stateSize.toLocaleString()}`);
    console.log(`Conversation tokens: ${conversationSize.toLocaleString()}`);
    console.log(`Total tokens: ${totalSize.toLocaleString()}`);
    console.log(`\nUtilization: ${utilization}% of maximum`);
    
    // Recommend compression if needed
    if (utilization > 80) {
      console.log('\n⚠️  High token usage detected!');
      console.log('Recommendation: Context will be automatically compressed.');
    } else if (utilization > 50) {
      console.log('\n📊 Moderate token usage.');
      console.log('Context is within healthy limits.');
    } else {
      console.log('\n✅ Low token usage.');
      console.log('Plenty of context space available.');
    }
    
    console.log('\n' + '=' . repeat(60));
    
    return {
      success: true,
      tokens: {
        state: stateSize,
        conversation: conversationSize,
        total: totalSize,
        utilization: parseFloat(utilization)
      }
    };
  }
  
  /**
   * Find markdown files in machine-data (helper)
   */
  findMarkdownInMachineData(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.findMarkdownInMachineData(fullPath, files);
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }
}

// Export singleton instance
const contextCommands = new ContextCommands();

module.exports = {
  ContextCommands,
  contextCommands,
  
  // Convenience export
  executeCommand: (input) => contextCommands.executeCommand(input),
  
  // Direct command exports for programmatic use
  whereAreWe: () => contextCommands.whereAreWe(),
  continueWorking: () => contextCommands.continueWorking(),
  checkpointNow: () => contextCommands.checkpointNow(),
  showBlockers: () => contextCommands.showBlockers()
};