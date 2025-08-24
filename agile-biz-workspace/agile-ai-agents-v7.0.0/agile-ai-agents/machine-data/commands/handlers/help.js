/**
 * Help Command Handler
 * Enhanced help system with categorized command display
 */

class HelpHandler {
  /**
   * Initialize and register commands
   */
  initialize(registry) {
    this.registry = registry;
    
    registry.registerCommand('/aaa-help', {
      description: 'Show all available AgileAiAgents commands',
      handler: this.showHelp.bind(this),
      category: 'help',
      usage: '/aaa-help [category]',
      examples: [
        '/aaa-help',
        '/aaa-help workflow',
        '/aaa-help development'
      ]
    });
  }

  /**
   * Show categorized help
   */
  async showHelp(args) {
    const requestedCategory = args[0];
    
    console.log('\n' + '═'.repeat(60));
    console.log('  🤖 AgileAiAgents Commands');
    console.log('═'.repeat(60) + '\n');

    const categoryOrder = [
      'workflow',
      'state',
      'sprint',
      'context',
      'learning',
      'development',
      'help'
    ];

    const categoryTitles = {
      workflow: '📋 WORKFLOW COMMANDS',
      state: '💾 STATE MANAGEMENT',
      sprint: '🏃 SPRINT MANAGEMENT',
      context: '🎯 CONTEXT VERIFICATION',
      learning: '🎓 LEARNING SYSTEM',
      development: '🔧 DEVELOPMENT COMMANDS (System Maintenance)',
      help: '❓ HELP'
    };

    const categoryDescriptions = {
      workflow: 'Start and manage project workflows',
      state: 'Save and restore project state',
      sprint: 'Sprint planning and execution',
      context: 'Verify project context alignment and prevent drift',
      learning: 'Community learning contributions',
      development: 'Set up and reset development environment',
      help: 'Get help and documentation'
    };

    // Get all commands by category
    const commandsByCategory = this.registry.getCommandsByCategory();

    // Show specific category or all
    if (requestedCategory && commandsByCategory[requestedCategory]) {
      // Show single category
      this.showCategory(
        requestedCategory,
        categoryTitles[requestedCategory] || requestedCategory.toUpperCase(),
        commandsByCategory[requestedCategory]
      );
    } else if (requestedCategory) {
      console.log(`❌ Unknown category: ${requestedCategory}\n`);
      console.log('Available categories:');
      categoryOrder.forEach(cat => {
        console.log(`  • ${cat} - ${categoryDescriptions[cat]}`);
      });
    } else {
      // Show all categories
      categoryOrder.forEach(category => {
        if (commandsByCategory[category]) {
          this.showCategory(
            category,
            categoryTitles[category] || category.toUpperCase(),
            commandsByCategory[category],
            categoryDescriptions[category]
          );
        }
      });

      // Show footer with tips
      console.log('─'.repeat(60));
      console.log('\n💡 TIPS:');
      console.log('  • Use /aaa-help [category] to see commands for a specific category');
      console.log('  • Commands support options like --dry-run, --no-backup, etc.');
      console.log('  • The /status command is now /aaa-status (avoids Claude Code conflict)');
      console.log('  • Development commands are for AgileAiAgents system maintenance\n');
    }
  }

  /**
   * Show a category of commands
   */
  showCategory(category, title, commands, description = null) {
    console.log(title);
    if (description) {
      console.log(`  ${description}`);
    }
    console.log('');

    // Find longest command for alignment
    const maxCmdLength = Math.max(...commands.map(cmd => cmd.command.length));

    commands.forEach(cmd => {
      const padding = ' '.repeat(maxCmdLength - cmd.command.length + 2);
      console.log(`  ${cmd.command}${padding}${cmd.description}`);
      
      // Show usage if different from command
      if (cmd.usage && cmd.usage !== cmd.command) {
        console.log(`  ${' '.repeat(maxCmdLength + 2)}Usage: ${cmd.usage}`);
      }
    });
    
    console.log('');
  }
}

module.exports = new HelpHandler();