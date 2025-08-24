#!/usr/bin/env node

/**
 * Command Validator Hook Handler
 * Validates AgileAiAgents commands before execution
 */

const fs = require('fs');
const path = require('path');

class CommandValidator {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.commandRegistry = this.loadCommandRegistry();
  }

  parseContext() {
    return {
      prompt: process.env.USER_PROMPT || process.argv[2] || '',
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadCommandRegistry() {
    // Load command registry from multiple sources
    const registry = {
      // Primary workflow commands
      '/start-new-project-workflow': {
        description: 'Begin new project from idea to implementation',
        agent: 'project_analyzer',
        category: 'workflow',
        aliases: ['/new-project', '/start-new'],
        options: ['--status', '--resume', '--skip-research'],
        validation: {
          requiresEmptyProject: false,
          requiresState: false
        }
      },
      '/start-existing-project-workflow': {
        description: 'Analyze and enhance existing codebase',
        agent: 'code_analyzer',
        category: 'workflow',
        aliases: ['/existing-project', '/analyze-project'],
        options: ['--status', '--resume', '--deep-analysis'],
        validation: {
          requiresEmptyProject: false,
          requiresState: false
        }
      },
      '/quickstart': {
        description: 'Interactive menu showing all available options',
        agent: 'scrum_master',
        category: 'utility',
        aliases: ['/menu', '/help-menu'],
        options: [],
        validation: {}
      },
      '/aaa-help': {
        description: 'List all available AgileAiAgents commands',
        agent: 'scrum_master',
        category: 'utility',
        aliases: ['/commands', '/list-commands'],
        options: ['--category', '--agent'],
        validation: {}
      },
      
      // State management commands
      '/status': {
        description: 'Show current project status',
        agent: 'project_state_manager',
        category: 'state',
        aliases: ['/where', '/current-status'],
        options: ['--detailed', '--summary'],
        validation: {
          requiresState: true
        }
      },
      '/checkpoint': {
        description: 'Create manual checkpoint',
        agent: 'project_state_manager',
        category: 'state',
        aliases: ['/save-checkpoint', '/backup'],
        options: ['--full', '--message'],
        validation: {
          requiresState: true
        }
      },
      '/continue': {
        description: 'Resume previous work',
        agent: 'project_state_manager',
        category: 'state',
        aliases: ['/resume', '/load-state'],
        options: ['--sprint', '--checkpoint'],
        validation: {}
      },
      '/update-state': {
        description: 'Manually update project state',
        agent: 'project_state_manager',
        category: 'state',
        aliases: [],
        options: [],
        validation: {
          requiresState: true
        }
      },
      '/save-decision': {
        description: 'Save important decision with rationale',
        agent: 'project_manager',
        category: 'state',
        aliases: ['/decision', '/record-decision'],
        options: [],
        validation: {
          requiresState: true
        }
      },
      
      // Sprint management commands
      '/sprint-retrospective': {
        description: 'Conduct sprint retrospective',
        agent: 'scrum_master',
        category: 'sprint',
        aliases: ['/retro', '/retrospective'],
        options: ['--generate-report'],
        validation: {
          requiresActiveSprint: true
        }
      },
      '/milestone': {
        description: 'Record milestone achievement',
        agent: 'project_manager',
        category: 'project',
        aliases: ['/achievement', '/mark-milestone'],
        options: [],
        validation: {
          requiresState: true
        }
      },
      '/deployment-success': {
        description: 'Mark successful deployment',
        agent: 'devops',
        category: 'deployment',
        aliases: ['/deployed', '/release-success'],
        options: ['--version', '--environment'],
        validation: {
          requiresState: true
        }
      },
      '/project-complete': {
        description: 'Mark project as complete',
        agent: 'project_manager',
        category: 'project',
        aliases: ['/complete', '/finish-project'],
        options: ['--archive'],
        validation: {
          requiresState: true
        }
      },
      
      // Learning and contribution commands
      '/capture-learnings': {
        description: 'Manually capture project learnings',
        agent: 'learning_analysis_agent',
        category: 'learning',
        aliases: ['/learnings', '/capture'],
        options: ['--sprint', '--project'],
        validation: {
          requiresState: true
        }
      },
      '/show-contribution-status': {
        description: 'Check contribution readiness',
        agent: 'learning_analysis_agent',
        category: 'learning',
        aliases: ['/contribution-status'],
        options: [],
        validation: {}
      },
      '/review-learnings': {
        description: 'Review captured learnings',
        agent: 'learning_analysis_agent',
        category: 'learning',
        aliases: ['/show-learnings'],
        options: [],
        validation: {}
      },
      '/skip-contribution': {
        description: 'Skip learning contribution prompts',
        agent: 'learning_analysis_agent',
        category: 'learning',
        aliases: ['/skip'],
        options: ['--duration'],
        validation: {}
      },
      '/learn-from-contributions-workflow': {
        description: 'Run learning analysis workflow',
        agent: 'learning_analysis_agent',
        category: 'learning',
        aliases: ['/analyze-learnings'],
        options: ['--check-only', '--validate', '--analyze', '--plan', '--approve', '--implement', '--archive', '--status', '--resume'],
        validation: {}
      },
      
      // Conversion commands
      '/convert-md-to-json-aaa-documents': {
        description: 'Convert aaa-documents to JSON',
        agent: 'document_manager',
        category: 'conversion',
        aliases: [],
        options: [],
        validation: {}
      },
      '/convert-md-to-json-ai-agents': {
        description: 'Convert ai-agents to JSON',
        agent: 'document_manager',
        category: 'conversion',
        aliases: [],
        options: [],
        validation: {}
      },
      '/convert-md-to-json-project-documents': {
        description: 'Convert project-documents to JSON',
        agent: 'document_manager',
        category: 'conversion',
        aliases: [],
        options: [],
        validation: {}
      },
      '/convert-all-md-to-json': {
        description: 'Convert all MD files to JSON',
        agent: 'document_manager',
        category: 'conversion',
        aliases: ['/convert-all'],
        options: [],
        validation: {}
      },
      
      // Velocity profile commands
      '/select-velocity-profile': {
        description: 'Select team velocity profile',
        agent: 'scrum_master',
        category: 'sprint',
        aliases: ['/velocity-profile'],
        options: [],
        validation: {}
      },
      '/show-velocity-profile': {
        description: 'Show current velocity profile',
        agent: 'scrum_master',
        category: 'sprint',
        aliases: ['/velocity'],
        options: [],
        validation: {}
      },
      
      // Structure commands
      '/add-agile-context': {
        description: 'Add AgileAiAgents context to project',
        agent: 'project_analyzer',
        category: 'setup',
        aliases: ['/init-agile'],
        options: [],
        validation: {}
      }
    };

    // Load any custom commands from JSON if exists
    const customCommandsPath = path.join(
      this.projectRoot,
      'machine-data/aaa-documents-json/custom-commands.json'
    );
    
    if (fs.existsSync(customCommandsPath)) {
      const customCommands = JSON.parse(fs.readFileSync(customCommandsPath, 'utf8'));
      Object.assign(registry, customCommands);
    }

    return registry;
  }

  async execute() {
    try {
      const { prompt } = this.context;
      
      if (!prompt || !prompt.startsWith('/')) {
        return { status: 'skipped', reason: 'Not a command' };
      }

      // Parse command and options
      const parsed = this.parseCommand(prompt);
      
      // Validate command
      const validation = await this.validateCommand(parsed);
      
      // If invalid, provide suggestions
      if (!validation.isValid) {
        validation.suggestions = this.getSuggestions(parsed.command);
      }

      // Log command usage
      this.logCommandUsage(parsed, validation);

      return {
        status: validation.isValid ? 'success' : 'error',
        command: parsed.command,
        options: parsed.options,
        arguments: parsed.arguments,
        validation,
        agent: validation.agent,
        category: validation.category
      };

    } catch (error) {
      console.error('Command validation failed:', error);
      throw error;
    }
  }

  parseCommand(prompt) {
    const parts = prompt.split(/\s+/);
    const command = parts[0];
    const options = [];
    const args = [];

    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('--')) {
        options.push(parts[i]);
      } else {
        args.push(parts[i]);
      }
    }

    return {
      command,
      options,
      arguments: args,
      fullCommand: prompt
    };
  }

  async validateCommand(parsed) {
    const { command, options } = parsed;
    
    // Check if command exists
    let commandDef = this.commandRegistry[command];
    
    // Check aliases if not found
    if (!commandDef) {
      for (const [cmd, def] of Object.entries(this.commandRegistry)) {
        if (def.aliases && def.aliases.includes(command)) {
          commandDef = def;
          parsed.command = cmd; // Normalize to primary command
          break;
        }
      }
    }

    if (!commandDef) {
      return {
        isValid: false,
        error: `Unknown command: ${command}`,
        type: 'unknown_command'
      };
    }

    // Validate options
    const invalidOptions = options.filter(opt => 
      !commandDef.options.includes(opt)
    );
    
    if (invalidOptions.length > 0) {
      return {
        isValid: false,
        error: `Invalid options: ${invalidOptions.join(', ')}`,
        type: 'invalid_options',
        validOptions: commandDef.options
      };
    }

    // Check validation requirements
    const validationErrors = await this.checkValidationRequirements(
      commandDef.validation
    );
    
    if (validationErrors.length > 0) {
      return {
        isValid: false,
        error: validationErrors.join('; '),
        type: 'validation_failed',
        requirements: validationErrors
      };
    }

    return {
      isValid: true,
      agent: commandDef.agent,
      category: commandDef.category,
      description: commandDef.description
    };
  }

  async checkValidationRequirements(validation) {
    const errors = [];
    
    if (!validation) return errors;

    // Check if state is required
    if (validation.requiresState) {
      const statePath = path.join(this.projectRoot, 'project-state/current-state.json');
      if (!fs.existsSync(statePath)) {
        errors.push('Command requires active project state. Run /start-new-project-workflow first');
      }
    }

    // Check if active sprint is required
    if (validation.requiresActiveSprint) {
      const statePath = path.join(this.projectRoot, 'project-state/current-state.json');
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        if (!state.active_sprint || state.active_sprint.state !== 'active') {
          errors.push('Command requires an active sprint');
        }
      } else {
        errors.push('No project state found');
      }
    }

    // Check if empty project is required
    if (validation.requiresEmptyProject) {
      const docsPath = path.join(this.projectRoot, 'project-documents');
      if (fs.existsSync(docsPath)) {
        const files = this.countFilesRecursive(docsPath);
        if (files > 10) { // Allow some system files
          errors.push('Command requires an empty project. Too many existing documents');
        }
      }
    }

    return errors;
  }

  countFilesRecursive(dir) {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += this.countFilesRecursive(path.join(dir, entry.name));
      } else {
        count++;
      }
    }
    
    return count;
  }

  getSuggestions(command) {
    const suggestions = [];
    
    // Find similar commands
    const commands = Object.keys(this.commandRegistry);
    
    // Check for partial matches
    const partialMatches = commands.filter(cmd => 
      cmd.includes(command) || command.includes(cmd)
    );
    
    if (partialMatches.length > 0) {
      suggestions.push(...partialMatches.slice(0, 3));
    }

    // Check Levenshtein distance for typos
    const closeMatches = commands
      .map(cmd => ({
        command: cmd,
        distance: this.levenshteinDistance(command, cmd)
      }))
      .filter(match => match.distance <= 3)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(match => match.command);

    suggestions.push(...closeMatches);

    // Remove duplicates
    return [...new Set(suggestions)];
  }

  levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  logCommandUsage(parsed, validation) {
    const logPath = path.join(
      this.projectRoot,
      'logs/command-usage.log'
    );
    
    const logEntry = {
      timestamp: this.context.timestamp,
      command: parsed.command,
      options: parsed.options,
      valid: validation.isValid,
      agent: validation.agent || null,
      error: validation.error || null
    };

    // Ensure log directory exists
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to log
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  }
}

if (require.main === module) {
  const validator = new CommandValidator();
  validator.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = CommandValidator;