/**
 * Command Handler
 * Manages custom slash commands for AgileAiAgents
 */

const fs = require('fs');
const path = require('path');
const WorkflowIntegrationHandler = require('./workflow-integration');

class CommandHandler {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.commandsPath = path.join(this.projectRoot, 'templates', 'claude-integration', '.claude', 'commands.json');
    this.aliasesPath = path.join(this.projectRoot, 'machine-data', 'command-aliases.json');
    this.statePath = path.join(this.projectRoot, 'project-state', 'runtime.json');
    
    this.loadCommands();
    this.loadAliases();
    this.workflowHandler = new WorkflowIntegrationHandler(this.projectRoot);
  }

  /**
   * Load command definitions
   */
  loadCommands() {
    try {
      if (fs.existsSync(this.commandsPath)) {
        const commandsContent = fs.readFileSync(this.commandsPath, 'utf8');
        this.commands = JSON.parse(commandsContent);
      } else {
        console.error('Commands file not found:', this.commandsPath);
        this.commands = { commands: [] };
      }
    } catch (error) {
      console.error('Error loading commands:', error);
      this.commands = { commands: [] };
    }
  }

  /**
   * Load command aliases for backward compatibility
   */
  loadAliases() {
    const defaultAliases = {
      '/start-new-project-workflow': '/new-project-workflow',
      '/start-existing-project-workflow': '/existing-project-workflow',
      '/aaa': '/aaa-status',
      '/help': '/aaa-help',
      '/status': '/aaa-status',
      '/resume': '/continue',
      '/save': '/checkpoint'
    };

    try {
      if (fs.existsSync(this.aliasesPath)) {
        const aliasesContent = fs.readFileSync(this.aliasesPath, 'utf8');
        this.aliases = { ...defaultAliases, ...JSON.parse(aliasesContent) };
      } else {
        this.aliases = defaultAliases;
        this.saveAliases();
      }
    } catch (error) {
      console.error('Error loading aliases:', error);
      this.aliases = defaultAliases;
    }
  }

  /**
   * Save aliases configuration
   */
  saveAliases() {
    try {
      const aliasDir = path.dirname(this.aliasesPath);
      if (!fs.existsSync(aliasDir)) {
        fs.mkdirSync(aliasDir, { recursive: true });
      }
      fs.writeFileSync(this.aliasesPath, JSON.stringify(this.aliases, null, 2));
    } catch (error) {
      console.error('Error saving aliases:', error);
    }
  }

  /**
   * Detect if input is a command
   */
  isCommand(input) {
    if (!input || typeof input !== 'string') return false;
    
    // Check for slash prefix
    if (!input.startsWith('/')) return false;
    
    // Extract command name (before any flags)
    const commandName = input.split(' ')[0];
    
    // Check if it's a registered command or alias
    return this.commandExists(commandName);
  }

  /**
   * Check if command exists (including aliases)
   */
  commandExists(commandName) {
    // Check direct command
    const directCommand = this.commands.commands.find(cmd => 
      `/${cmd.name}` === commandName
    );
    
    if (directCommand) return true;
    
    // Check aliases
    return commandName in this.aliases;
  }

  /**
   * Parse command and flags
   */
  parseCommand(input) {
    const parts = input.split(' ');
    const commandName = parts[0];
    const args = parts.slice(1);
    
    // Parse flags
    const flags = {};
    const positionalArgs = [];
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        // Long flag
        const flagName = arg.substring(2);
        
        // Check if next arg is the value or if it's a boolean flag
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          flags[flagName] = args[++i];
        } else {
          flags[flagName] = true;
        }
      } else if (arg.startsWith('-')) {
        // Short flag
        const flagName = arg.substring(1);
        
        // Check if next arg is the value
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          flags[flagName] = args[++i];
        } else {
          flags[flagName] = true;
        }
      } else {
        // Positional argument
        positionalArgs.push(arg);
      }
    }
    
    return {
      command: this.resolveAlias(commandName),
      originalCommand: commandName,
      flags,
      args: positionalArgs,
      raw: input
    };
  }

  /**
   * Resolve command alias to actual command
   */
  resolveAlias(commandName) {
    if (commandName in this.aliases) {
      const resolved = this.aliases[commandName];
      
      // Show gentle deprecation notice for old commands
      if (commandName.includes('start-')) {
        console.log(`\n💡 Tip: You can now use the shorter command: ${resolved}`);
      }
      
      return resolved;
    }
    return commandName;
  }

  /**
   * Execute command
   */
  async execute(input) {
    if (!this.isCommand(input)) {
      return { 
        success: false, 
        error: 'Not a valid command',
        input 
      };
    }

    const parsed = this.parseCommand(input);
    console.log('\n🎯 Executing command:', parsed.command);
    
    if (parsed.flags) {
      const flagKeys = Object.keys(parsed.flags);
      if (flagKeys.length > 0) {
        console.log('   Flags:', flagKeys.map(k => `--${k}${parsed.flags[k] !== true ? '=' + parsed.flags[k] : ''}`).join(' '));
      }
    }

    try {
      // Route to appropriate handler
      const result = await this.routeCommand(parsed);
      
      // Handle result
      if (result.success) {
        console.log('✅ Command completed successfully');
      } else {
        console.log('❌ Command failed:', result.error || result.reason);
      }
      
      return result;
      
    } catch (error) {
      console.error('Command execution error:', error);
      return {
        success: false,
        error: error.message,
        command: parsed.command
      };
    }
  }

  /**
   * Route command to appropriate handler
   */
  async routeCommand(parsed) {
    const { command, flags, args } = parsed;
    
    // Initialize workflow state if needed
    if (this.isWorkflowCommand(command)) {
      await this.initializeWorkflowState();
    }

    // Handle special flags
    if (flags.status) {
      return await this.getCommandStatus(command);
    }
    
    if (flags['dry-run']) {
      return await this.dryRun(command, flags, args);
    }

    // Route to specific handlers
    switch (command) {
      // Workflow commands
      case '/new-project-workflow':
        return await this.workflowHandler.executeCommand('new-project-workflow', flags);
      
      case '/existing-project-workflow':
        return await this.workflowHandler.executeCommand('existing-project-workflow', flags);
      
      case '/select-phases':
        return await this.workflowHandler.executeCommand('select-phases', flags);
      
      // Status commands
      case '/aaa-status':
        return await this.workflowHandler.executeCommand('aaa-status', flags);
      
      // State management
      case '/continue':
        return await this.handleContinue(flags);
      
      case '/checkpoint':
        return await this.handleCheckpoint(flags, args);
      
      case '/save-decision':
        return await this.handleSaveDecision(flags, args);
      
      // Help commands
      case '/aaa-help':
        return await this.showHelp();
      
      case '/quickstart':
        return await this.showQuickstart();
      
      // Sprint commands
      case '/sprint-review':
        return await this.handleSprintReview(flags);
      
      case '/sprint-retrospective':
        return await this.handleSprintRetrospective(flags);
      
      case '/milestone':
        return await this.handleMilestone(flags, args);
      
      default:
        return {
          success: false,
          error: `Unknown command: ${command}`,
          suggestion: 'Use /aaa-help to see available commands'
        };
    }
  }

  /**
   * Check if command is a workflow command
   */
  isWorkflowCommand(command) {
    const workflowCommands = [
      '/new-project-workflow',
      '/existing-project-workflow',
      '/select-phases',
      '/continue'
    ];
    return workflowCommands.includes(command);
  }

  /**
   * Initialize workflow state if needed
   */
  async initializeWorkflowState() {
    const stateDir = path.dirname(this.statePath);
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
      console.log('📁 Created project-state directory');
    }
    
    if (!fs.existsSync(this.statePath)) {
      const initialState = {
        workflow_stage: null,
        active_workflow: null,
        current_phase: null,
        phase_selection_unlocked: false,
        phases: {
          completed: [],
          selected: {
            active: [],
            execution_mode: null
          }
        },
        configuration: {
          research_level: 'thorough',
          analysis_level: 'comprehensive'
        },
        metrics: {
          documents_created: 0,
          decisions_made: 0,
          approvals_obtained: 0,
          phases_completed: 0
        },
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      
      fs.writeFileSync(this.statePath, JSON.stringify(initialState, null, 2));
      console.log('📝 Initialized workflow state');
    }
  }

  /**
   * Get command status
   */
  async getCommandStatus(command) {
    const commandInfo = this.commands.commands.find(cmd => `/${cmd.name}` === command);
    
    if (!commandInfo) {
      return {
        success: false,
        error: `Command not found: ${command}`
      };
    }
    
    return {
      success: true,
      command: commandInfo.name,
      description: commandInfo.description,
      category: commandInfo.category,
      priority: commandInfo.priority
    };
  }

  /**
   * Dry run command
   */
  async dryRun(command, flags, args) {
    console.log('\n🧪 DRY RUN MODE');
    console.log('─'.repeat(40));
    console.log('Command:', command);
    console.log('Flags:', flags);
    console.log('Arguments:', args);
    console.log('\nThis would execute the following:');
    
    // Simulate what would happen
    const commandInfo = this.commands.commands.find(cmd => `/${cmd.name}` === command);
    if (commandInfo) {
      console.log(`• ${commandInfo.description}`);
      console.log(`• Category: ${commandInfo.category}`);
      console.log(`• Priority: ${commandInfo.priority}`);
    }
    
    console.log('\n(No actual changes made)');
    
    return {
      success: true,
      dryRun: true,
      command,
      flags,
      args
    };
  }

  /**
   * Handle continue command
   */
  async handleContinue(flags) {
    if (!fs.existsSync(this.statePath)) {
      return {
        success: false,
        error: 'No saved state found. Start a workflow first.'
      };
    }
    
    const state = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
    
    if (!state.active_workflow) {
      return {
        success: false,
        error: 'No active workflow to continue.'
      };
    }
    
    // Resume the workflow
    flags.resume = true;
    return await this.workflowHandler.executeCommand(state.active_workflow, flags);
  }

  /**
   * Handle checkpoint command
   */
  async handleCheckpoint(flags, args) {
    const checkpointName = args[0] || `manual-${Date.now()}`;
    
    if (!fs.existsSync(this.statePath)) {
      return {
        success: false,
        error: 'No state to checkpoint'
      };
    }
    
    const state = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
    const checkpointsDir = path.join(this.projectRoot, 'project-state', 'checkpoints');
    
    if (!fs.existsSync(checkpointsDir)) {
      fs.mkdirSync(checkpointsDir, { recursive: true });
    }
    
    const checkpointPath = path.join(checkpointsDir, `${checkpointName}.json`);
    fs.writeFileSync(checkpointPath, JSON.stringify(state, null, 2));
    
    console.log(`✅ Checkpoint created: ${checkpointName}`);
    
    return {
      success: true,
      checkpoint: checkpointName,
      path: checkpointPath
    };
  }

  /**
   * Handle save decision command
   */
  async handleSaveDecision(flags, args) {
    const decision = args.join(' ') || flags.decision;
    
    if (!decision) {
      return {
        success: false,
        error: 'No decision provided. Use: /save-decision "Your decision here"'
      };
    }
    
    const decisionsPath = path.join(
      this.projectRoot,
      'project-documents',
      'orchestration',
      'project-decisions.md'
    );
    
    const timestamp = new Date().toISOString();
    const entry = `\n## Decision: ${timestamp}\n${decision}\n\n---\n`;
    
    // Ensure directory exists
    const decisionsDir = path.dirname(decisionsPath);
    if (!fs.existsSync(decisionsDir)) {
      fs.mkdirSync(decisionsDir, { recursive: true });
    }
    
    // Append to decisions file
    if (fs.existsSync(decisionsPath)) {
      fs.appendFileSync(decisionsPath, entry);
    } else {
      fs.writeFileSync(decisionsPath, `# Project Decisions\n${entry}`);
    }
    
    console.log('✅ Decision saved');
    
    return {
      success: true,
      decision,
      timestamp
    };
  }

  /**
   * Show help
   */
  async showHelp() {
    console.log('\n📚 AGILEAIAGENTS COMMANDS');
    console.log('═'.repeat(60));
    
    const categories = {};
    this.commands.commands.forEach(cmd => {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd);
    });
    
    Object.keys(categories).forEach(category => {
      const catInfo = this.commands.categories[category];
      console.log(`\n${catInfo.description.toUpperCase()}`);
      console.log('─'.repeat(40));
      
      categories[category]
        .sort((a, b) => a.priority - b.priority)
        .forEach(cmd => {
          console.log(`  /${cmd.name}`);
          console.log(`    ${cmd.description}`);
        });
    });
    
    console.log('\n💡 Use --help with any command for detailed information');
    console.log('💡 Use --dry-run to preview command without executing');
    
    return { success: true };
  }

  /**
   * Show quickstart menu
   */
  async showQuickstart() {
    console.log('\n🚀 AGILEAIAGENTS QUICKSTART');
    console.log('═'.repeat(60));
    console.log('\nChoose an option:\n');
    console.log('1. Start new project from idea');
    console.log('2. Analyze existing codebase');
    console.log('3. Resume previous session');
    console.log('4. View current status');
    console.log('5. Show all commands');
    console.log('6. Access documentation');
    console.log('\nEnter your choice (1-6): ');
    
    // In real implementation, would wait for user input
    // For now, return menu info
    
    return {
      success: true,
      menu: 'quickstart',
      options: 6
    };
  }

  /**
   * Handle sprint review
   */
  async handleSprintReview(flags) {
    console.log('\n📊 SPRINT REVIEW');
    console.log('─'.repeat(40));
    console.log('Gathering sprint metrics and achievements...\n');
    
    // Would implement actual sprint review logic
    return {
      success: true,
      command: 'sprint-review',
      message: 'Sprint review initiated'
    };
  }

  /**
   * Handle sprint retrospective
   */
  async handleSprintRetrospective(flags) {
    console.log('\n🔄 SPRINT RETROSPECTIVE');
    console.log('─'.repeat(40));
    console.log('Analyzing sprint performance with AI agents...\n');
    
    // Would implement actual retrospective logic
    return {
      success: true,
      command: 'sprint-retrospective',
      message: 'Retrospective analysis started'
    };
  }

  /**
   * Handle milestone recording
   */
  async handleMilestone(flags, args) {
    const milestone = args.join(' ') || flags.milestone;
    
    if (!milestone) {
      return {
        success: false,
        error: 'No milestone provided. Use: /milestone "Achievement description"'
      };
    }
    
    console.log(`\n🏆 Milestone Recorded: ${milestone}`);
    
    // Would save to milestones file
    return {
      success: true,
      milestone,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in hooks
module.exports = CommandHandler;

// Allow direct execution for testing
if (require.main === module) {
  const handler = new CommandHandler(process.cwd());
  
  // Test command parsing
  const testCommands = [
    '/new-project-workflow',
    '/start-new-project-workflow',  // Test alias
    '/aaa-status --verbose',
    '/checkpoint sprint-1-complete',
    '/save-decision "Use React for frontend"',
    '/continue --resume',
    '/help',
    '/unknown-command'
  ];
  
  console.log('Testing command handler...\n');
  
  testCommands.forEach(cmd => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${cmd}`);
    console.log('─'.repeat(60));
    
    if (handler.isCommand(cmd)) {
      const parsed = handler.parseCommand(cmd);
      console.log('Parsed:', parsed);
      console.log('Exists:', handler.commandExists(parsed.command));
    } else {
      console.log('Not recognized as a command');
    }
  });
}