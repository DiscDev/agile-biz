/**
 * Development Environment Commands Handler
 * Commands for setting up and managing AgileAiAgents development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const backupManager = require('../utils/backup-manager');
const prompt = require('../utils/prompt-utils');

class DevEnvironmentHandler {
  constructor() {
    this.projectRoot = process.cwd();
    this.parentDir = path.dirname(this.projectRoot);
  }

  /**
   * Initialize and register commands
   */
  initialize(registry) {
    // Individual reset commands
    registry.registerCommand('/copy-dot-claude-to-parent', {
      description: 'Copy .claude/ directory from repository to parent level',
      handler: this.copyDotClaudeToParent.bind(this),
      category: 'development',
      usage: '/copy-dot-claude-to-parent',
      examples: ['/copy-dot-claude-to-parent']
    });

    registry.registerCommand('/copy-claude-md-to-parent', {
      description: 'Copy CLAUDE-workspace-template.md to parent as CLAUDE.md',
      handler: this.copyClaudeMdToParent.bind(this),
      category: 'development',
      usage: '/copy-claude-md-to-parent',
      examples: ['/copy-claude-md-to-parent']
    });

    registry.registerCommand('/project-state-reset', {
      description: 'Reset project-state to clean templates',
      handler: this.projectStateReset.bind(this),
      category: 'development',
      requiresBackup: true,
      prompts: ['This will delete current project state. Continue?'],
      usage: '/project-state-reset [--no-backup]',
      examples: [
        '/project-state-reset',
        '/project-state-reset --no-backup'
      ]
    });

    registry.registerCommand('/project-documents-reset', {
      description: 'Reset project-documents to empty folder structure',
      handler: this.projectDocumentsReset.bind(this),
      category: 'development',
      requiresBackup: true,
      prompts: ['This will delete all project documents. Continue?'],
      usage: '/project-documents-reset [--no-backup] [--dry-run]',
      examples: [
        '/project-documents-reset',
        '/project-documents-reset --no-backup',
        '/project-documents-reset --dry-run'
      ]
    });

    registry.registerCommand('/community-learnings-reset', {
      description: 'Clear community learnings contributions',
      handler: this.communityLearningsReset.bind(this),
      category: 'development',
      requiresBackup: true,
      prompts: ['This will delete community learnings. Continue?'],
      usage: '/community-learnings-reset [--no-backup]',
      examples: ['/community-learnings-reset']
    });

    registry.registerCommand('/clear-logs', {
      description: 'Clear all log files',
      handler: this.clearLogs.bind(this),
      category: 'development',
      prompts: ['Delete all logs?'],
      usage: '/clear-logs [--silent]',
      examples: ['/clear-logs', '/clear-logs --silent']
    });

    // Backup commands
    registry.registerCommand('/backup-before-reset', {
      description: 'Create manual backup before reset operations',
      handler: this.backupBeforeReset.bind(this),
      category: 'development',
      usage: '/backup-before-reset [category]',
      examples: [
        '/backup-before-reset',
        '/backup-before-reset project-documents'
      ]
    });

    registry.registerCommand('/restore-from-backup', {
      description: 'Restore from most recent backup',
      handler: this.restoreFromBackup.bind(this),
      category: 'development',
      usage: '/restore-from-backup [category]',
      examples: [
        '/restore-from-backup',
        '/restore-from-backup project-state'
      ]
    });

    registry.registerCommand('/list-backups', {
      description: 'Show available backups',
      handler: this.listBackups.bind(this),
      category: 'development',
      usage: '/list-backups',
      examples: ['/list-backups']
    });

    // Master command
    registry.registerCommand('/setup-dev-environment', {
      description: 'Set up development environment after cloning',
      handler: this.setupDevEnvironment.bind(this),
      category: 'development',
      usage: '/setup-dev-environment [--yes-to-all] [--dry-run]',
      examples: [
        '/setup-dev-environment',
        '/setup-dev-environment --yes-to-all',
        '/setup-dev-environment --dry-run'
      ]
    });
  }

  /**
   * Copy .claude directory to parent
   */
  async copyDotClaudeToParent(args, cmdConfig) {
    const sourcePath = path.join(this.projectRoot, '.claude');
    const targetPath = path.join(this.parentDir, '.claude');

    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      prompt.error('No .claude directory found in repository');
      return;
    }

    // Check if target exists
    if (fs.existsSync(targetPath)) {
      const overwrite = await prompt.confirm('.claude already exists in parent. Overwrite?');
      if (!overwrite) {
        prompt.info('Operation cancelled');
        return;
      }
      
      // Backup existing
      await backupManager.createBackup('parent-claude', targetPath, {
        reason: 'Before overwrite from repository'
      });
      
      // Remove existing
      execSync(`rm -rf "${targetPath}"`);
    }

    // Copy to parent
    prompt.progress('Copying .claude to parent directory');
    execSync(`cp -r "${sourcePath}" "${targetPath}"`);
    
    prompt.success('.claude directory copied to parent level');
  }

  /**
   * Copy CLAUDE.md template to parent
   */
  async copyClaudeMdToParent(args, cmdConfig) {
    const sourcePath = path.join(this.projectRoot, 'CLAUDE-workspace-template.md');
    const targetPath = path.join(this.parentDir, 'CLAUDE.md');

    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      prompt.error('CLAUDE-workspace-template.md not found');
      return;
    }

    // Check if target exists
    if (fs.existsSync(targetPath)) {
      const overwrite = await prompt.confirm('CLAUDE.md already exists in parent. Overwrite?');
      if (!overwrite) {
        prompt.info('Operation cancelled');
        return;
      }
      
      // Backup existing
      await backupManager.createBackup('parent-claude-md', targetPath, {
        reason: 'Before overwrite from template'
      });
    }

    // Copy and rename
    prompt.progress('Copying CLAUDE.md template to parent');
    fs.copyFileSync(sourcePath, targetPath);
    
    prompt.success('CLAUDE.md copied to parent directory');
  }

  /**
   * Reset project-state to clean templates
   */
  async projectStateReset(args, cmdConfig) {
    const { options } = require('../registry').parseOptions(args);
    const statePath = path.join(this.projectRoot, 'project-state');
    const templatePath = path.join(this.projectRoot, 'templates/clean-slate/project-state');

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      prompt.error('Clean slate template not found');
      return;
    }

    // Dry run
    if (options['dry-run']) {
      prompt.info('Dry run - would reset project-state to clean templates');
      return;
    }

    // Backup unless disabled
    if (!options['no-backup'] && fs.existsSync(statePath)) {
      await backupManager.createBackup('project-state', statePath, {
        reason: 'Before reset to clean state'
      });
    }

    // Confirm action
    const confirmed = await prompt.confirm('Reset project-state to clean templates?');
    if (!confirmed) {
      prompt.info('Operation cancelled');
      return;
    }

    // Remove existing
    if (fs.existsSync(statePath)) {
      prompt.progress('Removing existing project-state');
      execSync(`rm -rf "${statePath}"`);
    }

    // Copy clean template
    prompt.progress('Copying clean project-state template');
    execSync(`cp -r "${templatePath}" "${statePath}"`);
    
    prompt.success('Project state reset to clean templates');
  }

  /**
   * Reset project-documents to empty structure
   */
  async projectDocumentsReset(args, cmdConfig) {
    const { options } = require('../registry').parseOptions(args);
    const docsPath = path.join(this.projectRoot, 'project-documents');
    const templatePath = path.join(this.projectRoot, 'templates/clean-slate/project-documents');

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      prompt.error('Clean slate template not found');
      return;
    }

    // Dry run
    if (options['dry-run']) {
      prompt.info('Dry run - would reset project-documents to empty folders');
      // Show what would be deleted
      if (fs.existsSync(docsPath)) {
        const files = execSync(`find "${docsPath}" -type f -name "*.md" | wc -l`).toString().trim();
        prompt.info(`Would delete ${files} markdown files`);
      }
      return;
    }

    // Backup unless disabled
    if (!options['no-backup'] && fs.existsSync(docsPath)) {
      await backupManager.createBackup('project-documents', docsPath, {
        reason: 'Before reset to empty structure'
      });
    }

    // Confirm action
    const confirmed = await prompt.confirm('Reset project-documents to empty folders?');
    if (!confirmed) {
      prompt.info('Operation cancelled');
      return;
    }

    // Remove existing
    if (fs.existsSync(docsPath)) {
      prompt.progress('Removing existing project-documents');
      execSync(`rm -rf "${docsPath}"`);
    }

    // Copy clean template
    prompt.progress('Copying clean project-documents template');
    execSync(`cp -r "${templatePath}" "${docsPath}"`);
    
    prompt.success('Project documents reset to empty structure');
  }

  /**
   * Reset community learnings
   */
  async communityLearningsReset(args, cmdConfig) {
    const { options } = require('../registry').parseOptions(args);
    const learningsPath = path.join(this.projectRoot, 'community-learnings/contributions');

    if (!fs.existsSync(learningsPath)) {
      prompt.info('No community learnings to reset');
      return;
    }

    // Backup unless disabled
    if (!options['no-backup']) {
      await backupManager.createBackup('community-learnings', learningsPath, {
        reason: 'Before reset'
      });
    }

    // Confirm action
    const confirmed = await prompt.confirm('Clear all community learning contributions?');
    if (!confirmed) {
      prompt.info('Operation cancelled');
      return;
    }

    // Remove all contributions except examples
    prompt.progress('Clearing community learnings');
    const files = fs.readdirSync(learningsPath);
    files.forEach(file => {
      if (file !== 'examples' && file !== '.gitkeep') {
        const filePath = path.join(learningsPath, file);
        execSync(`rm -rf "${filePath}"`);
      }
    });
    
    prompt.success('Community learnings cleared');
  }

  /**
   * Clear log files
   */
  async clearLogs(args, cmdConfig) {
    const { options } = require('../registry').parseOptions(args);
    const logsPath = path.join(this.projectRoot, 'logs');
    const hookLogsPath = path.join(this.projectRoot, 'hooks/logs');

    // Silent mode
    if (!options.silent) {
      const confirmed = await prompt.confirm('Clear all log files?');
      if (!confirmed) {
        prompt.info('Operation cancelled');
        return;
      }
    }

    prompt.progress('Clearing log files');
    
    // Clear main logs
    if (fs.existsSync(logsPath)) {
      const files = fs.readdirSync(logsPath);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(logsPath, file));
        }
      });
    }

    // Clear hook logs
    if (fs.existsSync(hookLogsPath)) {
      const files = fs.readdirSync(hookLogsPath);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(hookLogsPath, file));
        }
      });
    }
    
    prompt.success('Log files cleared');
  }

  /**
   * Create manual backup
   */
  async backupBeforeReset(args) {
    const categories = ['project-state', 'project-documents', 'community-learnings', 'logs'];
    
    if (args.length > 0) {
      // Specific category
      const category = args[0];
      if (!categories.includes(category)) {
        prompt.error(`Invalid category. Choose from: ${categories.join(', ')}`);
        return;
      }
      
      const paths = {
        'project-state': path.join(this.projectRoot, 'project-state'),
        'project-documents': path.join(this.projectRoot, 'project-documents'),
        'community-learnings': path.join(this.projectRoot, 'community-learnings'),
        'logs': path.join(this.projectRoot, 'logs')
      };
      
      if (!fs.existsSync(paths[category])) {
        prompt.error(`${category} does not exist`);
        return;
      }
      
      await backupManager.createBackup(category, paths[category], {
        reason: 'Manual backup'
      });
    } else {
      // Interactive selection
      const selected = await prompt.multiSelect(
        'Select items to backup:',
        categories,
        [0, 1] // Default select project-state and project-documents
      );
      
      for (const index of selected) {
        const category = categories[index];
        const paths = {
          'project-state': path.join(this.projectRoot, 'project-state'),
          'project-documents': path.join(this.projectRoot, 'project-documents'),
          'community-learnings': path.join(this.projectRoot, 'community-learnings'),
          'logs': path.join(this.projectRoot, 'logs')
        };
        
        if (fs.existsSync(paths[category])) {
          await backupManager.createBackup(category, paths[category], {
            reason: 'Manual backup'
          });
        }
      }
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(args) {
    const backups = backupManager.listBackups();
    
    if (backups.length === 0) {
      prompt.error('No backups available');
      return;
    }

    let category;
    
    if (args.length > 0) {
      // Specific category
      category = args[0];
      const backup = backups.find(b => b.category === category);
      if (!backup) {
        prompt.error(`No backup found for category: ${category}`);
        return;
      }
    } else {
      // Interactive selection
      const options = backups.map(b => 
        `${b.category} (${new Date(b.timestamp).toLocaleString()}, ${b.size})`
      );
      
      const selected = await prompt.select('Select backup to restore:', options);
      category = backups[selected].category;
    }

    // Confirm restore
    const confirmed = await prompt.confirm(`Restore ${category} from backup?`);
    if (!confirmed) {
      prompt.info('Operation cancelled');
      return;
    }

    await backupManager.restoreBackup(category);
  }

  /**
   * List available backups
   */
  async listBackups() {
    const backups = backupManager.listBackups();
    
    if (backups.length === 0) {
      prompt.info('No backups available');
      return;
    }

    prompt.section('Available Backups');
    
    backups.forEach(backup => {
      console.log(`📦 ${backup.category}`);
      console.log(`   Created: ${new Date(backup.timestamp).toLocaleString()}`);
      console.log(`   Size: ${backup.size}`);
      console.log(`   Source: ${backup.sourcePath}`);
      if (backup.metadata.reason) {
        console.log(`   Reason: ${backup.metadata.reason}`);
      }
      console.log('');
    });
  }

  /**
   * Master setup command
   */
  async setupDevEnvironment(args) {
    const { options } = require('../registry').parseOptions(args);
    
    prompt.section('Development Environment Setup');
    
    const steps = [
      {
        name: 'Copy .claude to parent',
        action: () => this.copyDotClaudeToParent([], {}),
        prompt: 'Copy .claude directory to parent level?'
      },
      {
        name: 'Copy CLAUDE.md to parent',
        action: () => this.copyClaudeMdToParent([], {}),
        prompt: 'Copy CLAUDE.md template to parent?'
      },
      {
        name: 'Reset project-state',
        action: () => this.projectStateReset(['--no-prompt'], {}),
        prompt: 'Reset project-state to clean templates?'
      },
      {
        name: 'Reset project-documents',
        action: () => this.projectDocumentsReset(['--no-prompt'], {}),
        prompt: 'Reset project-documents to empty structure?'
      },
      {
        name: 'Clear logs',
        action: () => this.clearLogs(['--silent'], {}),
        prompt: 'Clear all log files?'
      }
    ];

    // Dry run
    if (options['dry-run']) {
      prompt.info('Dry run - would perform the following steps:');
      steps.forEach((step, index) => {
        console.log(`${index + 1}. ${step.name}`);
      });
      return;
    }

    // Execute steps
    for (const step of steps) {
      if (options['yes-to-all'] || await prompt.confirm(step.prompt)) {
        try {
          await step.action();
        } catch (error) {
          prompt.error(`Failed: ${error.message}`);
          const continueSetup = await prompt.confirm('Continue with remaining steps?');
          if (!continueSetup) {
            break;
          }
        }
      }
    }

    prompt.success('Development environment setup complete!');
    prompt.info('You can now start development with a clean environment');
  }
}

// Export handler instance
module.exports = new DevEnvironmentHandler();