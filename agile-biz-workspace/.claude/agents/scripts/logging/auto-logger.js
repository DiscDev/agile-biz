#!/usr/bin/env node

/**
 * Auto-Logger for Agent Spawning
 * Monitors for Task tool usage patterns and triggers logging automatically
 * 
 * **AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const LOGGING_CONFIG_PATH = '.claude/agents/logs/logging-config.json';
const LOGGING_FUNCTIONS_PATH = '.claude/agents/scripts/logging/logging-functions.js';
const AGENTS_LOG_PATH = '.claude/agents/logs/agents.json';
const MONITOR_LOG_PATH = '.claude/agents/logs/monitor.log';

class AgentAutoLogger {
    constructor() {
        this.lastLoggedTime = 0;
        this.monitorInterval = 2000; // Check every 2 seconds
        this.isMonitoring = false;
    }

    /**
     * Check if logging is enabled
     */
    isLoggingEnabled() {
        try {
            if (!fs.existsSync(LOGGING_CONFIG_PATH)) {
                return false;
            }
            const config = JSON.parse(fs.readFileSync(LOGGING_CONFIG_PATH, 'utf8'));
            return config.logging_enabled === true;
        } catch (error) {
            this.log('ERROR', `Failed to check logging config: ${error.message}`);
            return false;
        }
    }

    /**
     * Log monitoring activity
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${level}] ${message}\n`;
        fs.appendFileSync(MONITOR_LOG_PATH, logEntry);
        console.log(logEntry.trim());
    }

    /**
     * Get the most recent agent spawn from logs
     */
    getLatestAgentSpawn() {
        try {
            if (!fs.existsSync(AGENTS_LOG_PATH)) {
                return null;
            }
            
            const logsData = JSON.parse(fs.readFileSync(AGENTS_LOG_PATH, 'utf8'));
            if (!Array.isArray(logsData) || logsData.length === 0) {
                return null;
            }
            
            // Find the most recent agent_spawn event
            const agentSpawns = logsData
                .filter(entry => entry.event_type === 'agent_spawn')
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return agentSpawns[0] || null;
        } catch (error) {
            this.log('ERROR', `Failed to read agents log: ${error.message}`);
            return null;
        }
    }

    /**
     * Detect if a new agent spawn should have been logged
     */
    detectMissingLogEntry(prompt) {
        if (!prompt) return null;
        
        const lowerPrompt = prompt.toLowerCase();
        
        // Detect developer agent patterns
        if (lowerPrompt.includes('developer agent') || 
            lowerPrompt.includes('dev agent') ||
            lowerPrompt.includes('have the developer') ||
            /create.*script|implement|build|code/.test(lowerPrompt)) {
            return 'developer';
        }
        
        // Detect devops agent patterns
        if (lowerPrompt.includes('devops agent') ||
            /deploy|infrastructure|docker|kubernetes|aws|ci\/cd/.test(lowerPrompt)) {
            return 'devops';
        }
        
        return null;
    }

    /**
     * Execute logging for missed agent spawn
     */
    async executeLogging(agentType, prompt) {
        return new Promise((resolve) => {
            const child = spawn('node', [LOGGING_FUNCTIONS_PATH, 'full-log', agentType, prompt], {
                stdio: 'pipe',
                cwd: process.cwd()
            });
            
            let output = '';
            let error = '';
            
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    this.log('INFO', `✅ Auto-logged ${agentType} agent spawn`);
                    resolve(true);
                } else {
                    this.log('ERROR', `❌ Failed to auto-log: ${error}`);
                    resolve(false);
                }
            });
            
            child.on('error', (err) => {
                this.log('ERROR', `❌ Logging execution error: ${err.message}`);
                resolve(false);
            });
        });
    }

    /**
     * Monitor for missing agent logging
     */
    async monitorAgentActivity() {
        if (!this.isLoggingEnabled()) {
            this.log('INFO', 'Logging disabled - stopping monitor');
            return;
        }
        
        this.log('INFO', 'Starting agent activity monitoring...');
        
        setInterval(async () => {
            if (!this.isLoggingEnabled()) {
                this.log('INFO', 'Logging disabled - monitoring paused');
                return;
            }
            
            // Check for recent agent activity by monitoring when new files are created
            // or when specific patterns suggest agent spawning occurred
            
            // This is a simplified approach - in a real implementation, 
            // you might monitor file system changes, process spawning, etc.
            
        }, this.monitorInterval);
    }

    /**
     * Manual trigger for logging a specific agent spawn
     */
    async triggerManualLog(agentType, prompt) {
        if (!this.isLoggingEnabled()) {
            this.log('WARN', 'Logging disabled - skipping manual trigger');
            return false;
        }
        
        this.log('INFO', `Manual trigger for ${agentType} agent: ${prompt.substring(0, 50)}...`);
        return await this.executeLogging(agentType, prompt);
    }

    /**
     * Start the auto-logger service
     */
    start() {
        this.log('INFO', 'Agent Auto-Logger starting...');
        this.isMonitoring = true;
        this.monitorAgentActivity();
    }

    /**
     * Stop the auto-logger service
     */
    stop() {
        this.log('INFO', 'Agent Auto-Logger stopping...');
        this.isMonitoring = false;
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const autoLogger = new AgentAutoLogger();
    
    if (args[0] === 'monitor') {
        autoLogger.start();
    } else if (args[0] === 'trigger' && args.length >= 3) {
        const agentType = args[1];
        const prompt = args.slice(2).join(' ');
        await autoLogger.triggerManualLog(agentType, prompt);
    } else {
        console.log('Usage:');
        console.log('  node auto-logger.js monitor                    # Start monitoring');
        console.log('  node auto-logger.js trigger <agent> <prompt>  # Manual trigger');
        console.log('');
        console.log('Examples:');
        console.log('  node auto-logger.js trigger developer "Create a React component"');
        console.log('  node auto-logger.js trigger devops "Deploy to AWS"');
    }
}

// Export for use as module
module.exports = AgentAutoLogger;

// Execute if run directly
if (require.main === module) {
    main().catch(console.error);
}