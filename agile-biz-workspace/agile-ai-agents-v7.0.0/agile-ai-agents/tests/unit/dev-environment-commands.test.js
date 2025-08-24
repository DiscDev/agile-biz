/**
 * Unit tests for development environment commands
 */

const { expect } = require('@jest/globals');
const { registry } = require('../../machine-data/commands/registry');
const backupManager = require('../../machine-data/commands/utils/backup-manager');
const fs = require('fs');
const path = require('path');

describe('Development Environment Commands', () => {
  describe('Command Registry', () => {
    test('should register all dev commands', () => {
      const devCommands = [
        '/copy-dot-claude-to-parent',
        '/copy-claude-md-to-parent',
        '/project-state-reset',
        '/project-documents-reset',
        '/community-learnings-reset',
        '/clear-logs',
        '/backup-before-reset',
        '/restore-from-backup',
        '/list-backups',
        '/setup-dev-environment'
      ];

      devCommands.forEach(cmd => {
        expect(registry.hasCommand(cmd)).toBe(true);
      });
    });

    test('should have /aaa-status instead of /status', () => {
      expect(registry.hasCommand('/aaa-status')).toBe(true);
      expect(registry.hasCommand('/status')).toBe(true); // Alias exists
      
      const statusCmd = registry.getCommand('/status');
      expect(statusCmd).toBeDefined();
    });

    test('should categorize dev commands correctly', () => {
      const commandsByCategory = registry.getCommandsByCategory();
      expect(commandsByCategory.development).toBeDefined();
      expect(commandsByCategory.development.length).toBeGreaterThan(0);
    });
  });

  describe('Backup Manager', () => {
    const testBackupDir = path.join(process.cwd(), '.test-backup');
    const testSourceDir = path.join(process.cwd(), 'test-source');

    beforeEach(() => {
      // Create test directories
      if (!fs.existsSync(testSourceDir)) {
        fs.mkdirSync(testSourceDir, { recursive: true });
        fs.writeFileSync(path.join(testSourceDir, 'test.txt'), 'test content');
      }
    });

    afterEach(() => {
      // Clean up test directories
      if (fs.existsSync(testBackupDir)) {
        fs.rmSync(testBackupDir, { recursive: true, force: true });
      }
      if (fs.existsSync(testSourceDir)) {
        fs.rmSync(testSourceDir, { recursive: true, force: true });
      }
    });

    test('should create backup directory with .gitignore', () => {
      expect(fs.existsSync(backupManager.backupRoot)).toBe(true);
      
      const gitignorePath = path.join(backupManager.backupRoot, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
    });

    test('should list backups', () => {
      const backups = backupManager.listBackups();
      expect(Array.isArray(backups)).toBe(true);
    });
  });

  describe('Command Options Parsing', () => {
    test('should parse command options correctly', () => {
      const { options, positional } = registry.parseOptions([
        'some-file',
        '--no-backup',
        '--dry-run',
        'another-arg'
      ]);

      expect(options['no-backup']).toBe(true);
      expect(options['dry-run']).toBe(true);
      expect(positional).toEqual(['some-file', 'another-arg']);
    });

    test('should parse options with values', () => {
      const { options, positional } = registry.parseOptions([
        '--timeout',
        '5000',
        '--name',
        'test-backup',
        'file.txt'
      ]);

      expect(options.timeout).toBe('5000');
      expect(options.name).toBe('test-backup');
      expect(positional).toEqual(['file.txt']);
    });
  });
});

describe('/aaa-help Command', () => {
  test('should show development commands separately', async () => {
    // This would require mocking console.log to test output
    // For now, just verify the command exists
    const helpCmd = registry.getCommand('/aaa-help');
    expect(helpCmd).toBeDefined();
    expect(helpCmd.category).toBe('help');
  });
});