#!/usr/bin/env node

/**
 * Claude Agent Sync Hook Handler
 * Monitors ai-agents/*.md changes and triggers Claude agent conversion
 * Works alongside the MD→JSON sync handler
 */

const fs = require('fs');
const path = require('path');

class ClaudeAgentSyncHandler {
  constructor() {
    this.projectRoot = path.join(__dirname, '../../..');
    this.claudeConverterPath = path.join(
      this.projectRoot,
      'machine-data/scripts/md-to-claude-agent-converter.js'
    );
    this.logPath = path.join(this.projectRoot, 'logs/claude-agent-sync.log');
  }

  async execute() {
    const filePath = process.env.FILE_PATH || process.argv[2];
    
    if (!filePath) {
      return { status: 'error', message: 'No file path provided' };
    }

    // Only process ai-agents MD files
    if (!filePath.includes('/ai-agents/') || !filePath.endsWith('.md')) {
      return { status: 'skipped', reason: 'Not an ai-agent MD file' };
    }

    const agentName = path.basename(filePath, '.md');
    
    try {
      // Check if file exists (might be delete operation)
      if (!fs.existsSync(filePath)) {
        return await this.handleDeletedAgent(agentName);
      }

      // Run Claude agent converter
      const result = await this.runConverter(agentName);
      
      this.log('info', `Claude agent conversion completed for ${agentName}`, result);
      
      return {
        status: 'success',
        agent: agentName,
        ...result
      };
    } catch (error) {
      this.log('error', `Failed to convert ${agentName}`, {
        error: error.message,
        stack: error.stack
      });
      
      return {
        status: 'error',
        agent: agentName,
        error: error.message
      };
    }
  }

  async runConverter(agentName) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
      const converter = spawn('node', [this.claudeConverterPath, agentName]);
      
      let stdout = '';
      let stderr = '';

      converter.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      converter.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      converter.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, stdout });
        } else {
          reject(new Error(`Converter failed with code ${code}: ${stderr}`));
        }
      });

      converter.on('error', (error) => {
        reject(error);
      });
    });
  }

  async handleDeletedAgent(agentName) {
    const claudeAgentPath = path.join(
      this.projectRoot,
      '.claude/agents',
      `${agentName}.md`
    );
    
    if (fs.existsSync(claudeAgentPath)) {
      try {
        fs.unlinkSync(claudeAgentPath);
        this.log('info', `Removed Claude agent file for ${agentName}`);
        return { status: 'success', action: 'claude_agent_removed' };
      } catch (error) {
        this.log('error', `Failed to remove Claude agent for ${agentName}`, {
          error: error.message
        });
        return { status: 'error', error: error.message };
      }
    }
    
    return { status: 'skipped', reason: 'No Claude agent to remove' };
  }

  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    // Console output for errors
    if (level === 'error') {
      console.error(`[Claude Agent Sync] ${message}`, data);
    }

    // Ensure log directory exists
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to log file
    try {
      fs.appendFileSync(this.logPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const handler = new ClaudeAgentSyncHandler();
  handler.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = ClaudeAgentSyncHandler;