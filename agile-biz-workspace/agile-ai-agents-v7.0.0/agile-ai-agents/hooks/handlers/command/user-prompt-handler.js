#!/usr/bin/env node

/**
 * User Prompt Submit Handler
 * Processes user prompts and commands before execution
 * 
 * This handler is triggered when users submit prompts in Claude Code
 * and can perform validation, logging, and command routing
 */

const fs = require('fs');
const path = require('path');

class UserPromptHandler {
  constructor() {
    this.logFile = path.join(__dirname, '../../../logs/user-prompts.log');
    this.commandPrefix = '/';
    this.agileCommandPrefix = '/aaa';
  }

  /**
   * Main handler method
   */
  async handle(context) {
    try {
      // Extract prompt from context
      const prompt = context.data?.prompt || context.prompt || '';
      
      if (!prompt || prompt.trim() === '') {
        return {
          status: 'skipped',
          reason: 'No prompt provided'
        };
      }

      // Log the prompt
      this.logPrompt(prompt, context);

      // Check if it's a command
      if (prompt.trim().startsWith(this.commandPrefix)) {
        return await this.handleCommand(prompt, context);
      }

      // Regular prompt processing
      return {
        status: 'success',
        processed: true,
        prompt: prompt
      };

    } catch (error) {
      console.error('[User Prompt Handler] Error:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Handle command prompts
   */
  async handleCommand(prompt, context) {
    const command = prompt.trim();
    
    // Check if it's an AgileAiAgents command
    if (command.startsWith(this.agileCommandPrefix)) {
      return {
        status: 'success',
        type: 'agile-command',
        command: command,
        message: 'AgileAiAgents command detected'
      };
    }

    // Other slash commands
    return {
      status: 'success', 
      type: 'command',
      command: command
    };
  }

  /**
   * Log prompts for analytics and debugging
   */
  logPrompt(prompt, context) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        prompt: prompt,
        type: prompt.startsWith(this.commandPrefix) ? 'command' : 'prompt',
        context: {
          agent: context.agent || 'unknown',
          workflow: context.workflow || null,
          sessionId: context.sessionId || null
        }
      };

      // Ensure log directory exists
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Append to log file
      fs.appendFileSync(
        this.logFile, 
        JSON.stringify(logEntry) + '\n'
      );

    } catch (error) {
      console.error('[User Prompt Handler] Logging error:', error);
    }
  }
}

// Main execution
async function main() {
  const handler = new UserPromptHandler();
  const context = JSON.parse(process.env.HOOK_CONTEXT || '{}');
  
  const result = await handler.handle(context);
  console.log(JSON.stringify(result));
  
  process.exit(result.status === 'error' ? 1 : 0);
}

// Export for testing
module.exports = UserPromptHandler;

// Run if executed directly
if (require.main === module) {
  main();
}