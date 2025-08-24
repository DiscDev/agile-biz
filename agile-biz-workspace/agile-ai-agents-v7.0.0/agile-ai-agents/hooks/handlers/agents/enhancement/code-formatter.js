const BaseAgentHook = require('../../shared/base-agent-hook');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

class CodeFormatterHook extends BaseAgentHook {
  constructor() {
    super({
      name: 'code-formatter',
      description: 'Automatically formats code before commits',
      events: ['file.modified', 'pre-commit'],
      performanceImpact: 'medium',
      cacheTTL: 0, // No caching for formatting
      warningThreshold: 3000,
      disableThreshold: 5000
    });
    
    this.formatters = {
      javascript: { command: 'prettier', extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      python: { command: 'black', extensions: ['.py'] },
      go: { command: 'gofmt', extensions: ['.go'] },
      rust: { command: 'rustfmt', extensions: ['.rs'] },
      css: { command: 'prettier', extensions: ['.css', '.scss', '.less'] },
      json: { command: 'prettier', extensions: ['.json'] },
      markdown: { command: 'prettier', extensions: ['.md'] }
    };
  }

  async handle(data) {
    const { filePath, eventType } = data;
    
    if (!filePath) return { formatted: false, message: 'No file path provided' };
    
    const ext = path.extname(filePath).toLowerCase();
    const formatter = this.getFormatterForExtension(ext);
    
    if (!formatter) {
      return { formatted: false, message: `No formatter configured for ${ext} files` };
    }
    
    // Check if formatter is available
    const isAvailable = await this.checkFormatterAvailable(formatter.command);
    if (!isAvailable) {
      return { 
        formatted: false, 
        message: `Formatter ${formatter.command} not available`,
        suggestion: `Install ${formatter.command} to enable auto-formatting`
      };
    }
    
    try {
      const formatted = await this.formatFile(filePath, formatter);
      
      if (formatted) {
        return {
          formatted: true,
          message: `Formatted ${path.basename(filePath)} with ${formatter.command}`,
          filePath
        };
      }
      
      return {
        formatted: false,
        message: `File already formatted or no changes needed`
      };
    } catch (error) {
      return {
        formatted: false,
        error: error.message,
        message: `Failed to format ${path.basename(filePath)}`
      };
    }
  }

  getFormatterForExtension(ext) {
    for (const [lang, formatter] of Object.entries(this.formatters)) {
      if (formatter.extensions.includes(ext)) {
        return formatter;
      }
    }
    return null;
  }

  async checkFormatterAvailable(command) {
    try {
      await execAsync(`which ${command}`);
      return true;
    } catch {
      return false;
    }
  }

  async formatFile(filePath, formatter) {
    const originalContent = await fs.readFile(filePath, 'utf8');
    let formattedContent;
    
    switch (formatter.command) {
      case 'prettier':
        try {
          const { stdout } = await execAsync(
            `prettier --write "${filePath}"`,
            { cwd: path.dirname(filePath) }
          );
          // Check if file was modified
          formattedContent = await fs.readFile(filePath, 'utf8');
          return originalContent !== formattedContent;
        } catch (error) {
          // Prettier might fail on syntax errors
          throw new Error(`Prettier formatting failed: ${error.message}`);
        }
        
      case 'black':
        try {
          await execAsync(
            `black --quiet "${filePath}"`,
            { cwd: path.dirname(filePath) }
          );
          formattedContent = await fs.readFile(filePath, 'utf8');
          return originalContent !== formattedContent;
        } catch (error) {
          throw new Error(`Black formatting failed: ${error.message}`);
        }
        
      case 'gofmt':
        try {
          const { stdout } = await execAsync(
            `gofmt -w "${filePath}"`,
            { cwd: path.dirname(filePath) }
          );
          formattedContent = await fs.readFile(filePath, 'utf8');
          return originalContent !== formattedContent;
        } catch (error) {
          throw new Error(`Gofmt formatting failed: ${error.message}`);
        }
        
      case 'rustfmt':
        try {
          await execAsync(
            `rustfmt "${filePath}"`,
            { cwd: path.dirname(filePath) }
          );
          formattedContent = await fs.readFile(filePath, 'utf8');
          return originalContent !== formattedContent;
        } catch (error) {
          throw new Error(`Rustfmt formatting failed: ${error.message}`);
        }
        
      default:
        throw new Error(`Unknown formatter: ${formatter.command}`);
    }
  }

  getConfig() {
    return {
      ...super.getConfig(),
      formatters: Object.keys(this.formatters),
      supportedExtensions: Object.values(this.formatters)
        .flatMap(f => f.extensions)
        .filter((v, i, a) => a.indexOf(v) === i) // unique
    };
  }
}

module.exports = CodeFormatterHook;