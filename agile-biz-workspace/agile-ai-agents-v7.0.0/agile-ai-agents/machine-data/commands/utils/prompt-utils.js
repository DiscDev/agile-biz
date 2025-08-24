/**
 * Prompt Utilities for AgileAiAgents Commands
 * Provides consistent prompting interface for user confirmations
 */

const readline = require('readline');

class PromptUtils {
  constructor() {
    this.rl = null;
  }

  /**
   * Initialize readline interface
   */
  initReadline() {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
  }

  /**
   * Close readline interface
   */
  closeReadline() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Prompt for yes/no confirmation
   */
  async confirm(message, defaultValue = false) {
    this.initReadline();
    
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    const question = `${message} (${defaultText}): `;

    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        const response = answer.trim().toLowerCase();
        
        if (response === '') {
          resolve(defaultValue);
        } else {
          resolve(response === 'y' || response === 'yes');
        }
      });
    });
  }

  /**
   * Prompt for text input
   */
  async prompt(message, defaultValue = '') {
    this.initReadline();
    
    const question = defaultValue 
      ? `${message} [${defaultValue}]: `
      : `${message}: `;

    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        const response = answer.trim();
        resolve(response || defaultValue);
      });
    });
  }

  /**
   * Show a list of options and get selection
   */
  async select(message, options, defaultIndex = 0) {
    this.initReadline();
    
    console.log(`\n${message}`);
    options.forEach((option, index) => {
      const marker = index === defaultIndex ? '>' : ' ';
      console.log(`${marker} ${index + 1}. ${option}`);
    });
    
    const question = `\nSelect option (1-${options.length}) [${defaultIndex + 1}]: `;
    
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        const response = answer.trim();
        
        if (response === '') {
          resolve(defaultIndex);
        } else {
          const index = parseInt(response) - 1;
          if (index >= 0 && index < options.length) {
            resolve(index);
          } else {
            console.log('Invalid selection, using default');
            resolve(defaultIndex);
          }
        }
      });
    });
  }

  /**
   * Show a multi-select checklist
   */
  async multiSelect(message, options, defaultSelected = []) {
    this.initReadline();
    
    const selected = new Set(defaultSelected);
    
    console.log(`\n${message}`);
    console.log('(Space to toggle, Enter to confirm)\n');
    
    const showOptions = () => {
      options.forEach((option, index) => {
        const checked = selected.has(index) ? '[✓]' : '[ ]';
        console.log(`${checked} ${index + 1}. ${option}`);
      });
    };
    
    showOptions();
    
    const question = '\nToggle options (e.g., "1 3 5") or press Enter to confirm: ';
    
    return new Promise((resolve) => {
      const askAgain = () => {
        this.rl.question(question, (answer) => {
          const response = answer.trim();
          
          if (response === '') {
            resolve(Array.from(selected));
          } else {
            // Toggle selected items
            const toggles = response.split(/\s+/).map(n => parseInt(n) - 1);
            toggles.forEach(index => {
              if (index >= 0 && index < options.length) {
                if (selected.has(index)) {
                  selected.delete(index);
                } else {
                  selected.add(index);
                }
              }
            });
            
            console.clear();
            console.log(`\n${message}`);
            showOptions();
            askAgain();
          }
        });
      };
      
      askAgain();
    });
  }

  /**
   * Show a warning message
   */
  warn(message) {
    console.log(`\n⚠️  ${message}\n`);
  }

  /**
   * Show an error message
   */
  error(message) {
    console.log(`\n❌ ${message}\n`);
  }

  /**
   * Show a success message
   */
  success(message) {
    console.log(`\n✅ ${message}\n`);
  }

  /**
   * Show an info message
   */
  info(message) {
    console.log(`\nℹ️  ${message}\n`);
  }

  /**
   * Show a progress message
   */
  progress(message) {
    console.log(`\n⏳ ${message}...`);
  }

  /**
   * Create a section header
   */
  section(title) {
    const line = '─'.repeat(50);
    console.log(`\n${line}`);
    console.log(`  ${title}`);
    console.log(`${line}\n`);
  }

  /**
   * Execute with confirmation prompts
   */
  async executeWithPrompts(prompts, action, options = {}) {
    try {
      // Show all prompts and collect confirmations
      for (const prompt of prompts) {
        const confirmed = await this.confirm(prompt, options.defaultYes);
        if (!confirmed) {
          this.info('Operation cancelled');
          return { success: false, cancelled: true };
        }
      }
      
      // Execute the action
      const result = await action();
      return { success: true, result };
      
    } catch (error) {
      this.error(`Operation failed: ${error.message}`);
      return { success: false, error };
    } finally {
      this.closeReadline();
    }
  }
}

// Export singleton instance
module.exports = new PromptUtils();