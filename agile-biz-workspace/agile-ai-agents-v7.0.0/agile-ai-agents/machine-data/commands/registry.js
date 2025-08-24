#!/usr/bin/env node

/**
 * AgileAiAgents Command Registry
 * Central registry for all slash commands with routing and aliasing support
 */

class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.categories = new Map();
    this.handlers = {};
    
    // Load all command handlers
    this.loadHandlers();
  }

  /**
   * Load all command handlers from the handlers directory
   */
  loadHandlers() {
    // Import handlers - these will self-register
    this.handlers.workflow = require('./handlers/workflow');
    this.handlers.state = require('./handlers/state');
    this.handlers.sprint = require('./handlers/sprint');
    this.handlers.learning = require('./handlers/learning');
    this.handlers.devEnvironment = require('./handlers/dev-environment');
    this.handlers.help = require('./handlers/help');
    this.handlers.contextVerification = require('./handlers/context-verification');
    
    // Initialize each handler
    Object.values(this.handlers).forEach(handler => {
      if (handler.initialize) {
        handler.initialize(this);
      }
    });
  }

  /**
   * Register a command
   */
  registerCommand(command, config) {
    // Validate command format
    if (!command.startsWith('/')) {
      throw new Error(`Command must start with /: ${command}`);
    }
    
    // Store command with metadata
    this.commands.set(command, {
      command,
      description: config.description || '',
      handler: config.handler,
      category: config.category || 'general',
      prompts: config.prompts || [],
      requiresBackup: config.requiresBackup || false,
      options: config.options || {},
      usage: config.usage || command,
      examples: config.examples || []
    });
    
    // Track by category
    if (!this.categories.has(config.category)) {
      this.categories.set(config.category, []);
    }
    this.categories.get(config.category).push(command);
  }

  /**
   * Register an alias for a command
   */
  registerAlias(alias, target, deprecationMessage) {
    this.aliases.set(alias, {
      target,
      deprecationMessage
    });
  }

  /**
   * Get command handler (resolving aliases)
   */
  getCommand(command) {
    // Check if it's an alias
    if (this.aliases.has(command)) {
      const alias = this.aliases.get(command);
      if (alias.deprecationMessage) {
        console.warn(`⚠️  ${alias.deprecationMessage}`);
      }
      return this.commands.get(alias.target);
    }
    
    // Direct command lookup
    return this.commands.get(command);
  }

  /**
   * Check if a command exists
   */
  hasCommand(command) {
    return this.commands.has(command) || this.aliases.has(command);
  }

  /**
   * Get all commands by category
   */
  getCommandsByCategory() {
    const result = {};
    for (const [category, commands] of this.categories) {
      result[category] = commands.map(cmd => this.commands.get(cmd));
    }
    return result;
  }

  /**
   * Get all available commands
   */
  getAllCommands() {
    return Array.from(this.commands.values());
  }

  /**
   * Execute a command
   */
  async executeCommand(commandLine) {
    // Parse command and arguments
    const parts = commandLine.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    
    // Get command handler
    const cmdConfig = this.getCommand(command);
    if (!cmdConfig) {
      return {
        success: false,
        error: `Unknown command: ${command}. Use /aaa-help for available commands.`
      };
    }
    
    // Execute handler
    try {
      const result = await cmdConfig.handler(args, cmdConfig);
      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Parse command options (--flag value format)
   */
  parseOptions(args) {
    const options = {};
    const positional = [];
    
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const key = args[i].substring(2);
        // Check if next arg is a value or another flag
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options[key] = args[i + 1];
          i++; // Skip the value
        } else {
          options[key] = true; // Flag without value
        }
      } else {
        positional.push(args[i]);
      }
    }
    
    return { options, positional };
  }
}

// Create singleton instance
const registry = new CommandRegistry();

// Export for use in handlers and command execution
module.exports = {
  registry,
  
  // Convenience methods
  registerCommand: (cmd, config) => registry.registerCommand(cmd, config),
  registerAlias: (alias, target, msg) => registry.registerAlias(alias, target, msg),
  executeCommand: (cmd) => registry.executeCommand(cmd),
  hasCommand: (cmd) => registry.hasCommand(cmd),
  getCommand: (cmd) => registry.getCommand(cmd),
  parseOptions: (args) => registry.parseOptions(args)
};

// CLI execution support
if (require.main === module) {
  const command = process.argv.slice(2).join(' ');
  if (command) {
    registry.executeCommand(command).then(result => {
      if (!result.success) {
        console.error('Error:', result.error);
        process.exit(1);
      }
      if (result.result) {
        console.log(result.result);
      }
    });
  } else {
    console.log('No command provided');
    process.exit(1);
  }
}