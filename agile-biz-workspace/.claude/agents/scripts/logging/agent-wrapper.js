#!/usr/bin/env node

/**
 * Agent Wrapper Script
 * Intercepts agent spawning and automatically logs when enabled
 * 
 * Usage: node agent-wrapper.js <agentType> "<userRequest>"
 * 
 * **AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration paths
const LOGGING_CONFIG_PATH = '.claude/agents/logs/logging-config.json';
const LOGGING_FUNCTIONS_PATH = '.claude/agents/scripts/logging/logging-functions.js';

/**
 * Check if logging is enabled
 */
function isLoggingEnabled() {
    try {
        if (!fs.existsSync(LOGGING_CONFIG_PATH)) {
            return false;
        }
        
        const config = JSON.parse(fs.readFileSync(LOGGING_CONFIG_PATH, 'utf8'));
        return config.logging_enabled === true;
    } catch (error) {
        console.error('Error checking logging config:', error.message);
        return false;
    }
}

/**
 * Execute logging for agent spawn
 */
async function executeLogging(agentType, userRequest) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [LOGGING_FUNCTIONS_PATH, 'full-log', agentType, userRequest], {
            stdio: 'pipe',
            cwd: process.cwd()
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Agent spawn logged successfully');
                resolve(output);
            } else {
                console.error('❌ Logging failed:', errorOutput);
                resolve(null); // Don't fail the wrapper if logging fails
            }
        });
        
        child.on('error', (error) => {
            console.error('❌ Logging execution error:', error.message);
            resolve(null); // Don't fail the wrapper if logging fails
        });
    });
}

/**
 * Main wrapper execution
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Usage: node agent-wrapper.js <agentType> "<userRequest>"');
        process.exit(1);
    }
    
    const agentType = args[0];
    const userRequest = args[1];
    
    console.log(`🤖 Agent Wrapper: Spawning ${agentType} agent`);
    
    // Check if logging is enabled and execute
    if (isLoggingEnabled()) {
        console.log('📝 Logging enabled - executing logging...');
        await executeLogging(agentType, userRequest);
    } else {
        console.log('📝 Logging disabled - skipping logging');
    }
    
    console.log(`✨ Agent spawn complete`);
}

// Execute if run directly
if (require.main === module) {
    main().catch(error => {
        console.error('Wrapper error:', error);
        process.exit(1);
    });
}