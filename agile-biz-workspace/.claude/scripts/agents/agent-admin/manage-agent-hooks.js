#!/usr/bin/env node

/**
 * Agent Hook Management Script
 * Manages agent detection patterns in Claude Code hook files
 * Used by agent-admin when creating, editing, or deleting agents
 * 
 * Usage:
 * node manage-agent-hooks.js add <agent-name> <keywords>
 * node manage-agent-hooks.js remove <agent-name>
 * node manage-agent-hooks.js update <agent-name> <keywords>
 * node manage-agent-hooks.js validate
 * 
 * AgileBiz™ - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Hook file paths
const DETECTION_HOOK = path.join(__dirname, '../hooks/agent-detection-hook.sh');
const COMPLETION_HOOK = path.join(__dirname, '../hooks/task-completion-hook.sh');

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../hooks/backups');

class HookManager {
    constructor() {
        this.detectionHookPath = DETECTION_HOOK;
        this.completionHookPath = COMPLETION_HOOK;
        this.backupDir = BACKUP_DIR;
    }

    /**
     * Create backup of hook files before modification
     */
    async createBackup() {
        try {
            // Ensure backup directory exists
            await fs.mkdir(this.backupDir, { recursive: true });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Backup both hook files
            await fs.copyFile(
                this.detectionHookPath, 
                path.join(this.backupDir, `agent-detection-hook-${timestamp}.sh`)
            );
            await fs.copyFile(
                this.completionHookPath, 
                path.join(this.backupDir, `task-completion-hook-${timestamp}.sh`)
            );
            
            console.log(`✅ Backups created with timestamp: ${timestamp}`);
            return timestamp;
        } catch (error) {
            console.error('❌ Failed to create backup:', error.message);
            throw error;
        }
    }

    /**
     * Convert keywords array to grep pattern
     */
    buildGrepPattern(keywords) {
        if (!Array.isArray(keywords)) {
            keywords = [keywords];
        }

        const patterns = keywords.map(keyword => {
            // Handle multi-word phrases
            if (keyword.includes(' ')) {
                return keyword.replace(/\s+/g, '.*');
            }
            return keyword;
        });

        // Join with OR operator
        if (patterns.length === 1) {
            return patterns[0];
        }
        return `(${patterns.join('|')})`;
    }

    /**
     * Add agent detection patterns to hook files
     */
    async addAgent(agentName, keywords) {
        try {
            await this.createBackup();
            
            // Build grep pattern from keywords
            const grepPattern = this.buildGrepPattern(keywords);
            
            // Read current hook files
            let detectionContent = await fs.readFile(this.detectionHookPath, 'utf8');
            let completionContent = await fs.readFile(this.completionHookPath, 'utf8');
            
            // Check if agent already exists
            if (detectionContent.includes(`agent_type="${agentName}"`)) {
                console.log(`⚠️ Agent ${agentName} already exists in hooks`);
                return;
            }
            
            // Build detection block for agent-detection-hook.sh
            const detectionBlock = `
    # Detect ${agentName} patterns
    if echo "$lower_input" | grep -E "${grepPattern}" > /dev/null; then
        agent_type="${agentName}"
    fi`;
            
            // Insert detection block before the closing detection section (around line 58)
            const detectionInsertPoint = detectionContent.lastIndexOf('    # Return the detected agent type');
            if (detectionInsertPoint > -1) {
                detectionContent = 
                    detectionContent.slice(0, detectionInsertPoint) +
                    detectionBlock + '\n    \n' +
                    detectionContent.slice(detectionInsertPoint);
            }
            
            // Build extraction pattern for task-completion-hook.sh
            const extractionPattern = `    elif echo "$params" | grep -i "${agentName}" > /dev/null; then
        echo "${agentName}"`;
            
            // Insert extraction pattern before the else clause
            const extractionInsertPoint = completionContent.indexOf('    else\n        echo "unknown"');
            if (extractionInsertPoint > -1) {
                completionContent = 
                    completionContent.slice(0, extractionInsertPoint) +
                    extractionPattern + '\n' +
                    completionContent.slice(extractionInsertPoint);
            }
            
            // Write updated files
            await fs.writeFile(this.detectionHookPath, detectionContent);
            await fs.writeFile(this.completionHookPath, completionContent);
            
            // Validate syntax
            await this.validateHooks();
            
            console.log(`✅ Successfully added ${agentName} to hook files`);
            console.log(`   Detection pattern: ${grepPattern}`);
            
        } catch (error) {
            console.error(`❌ Failed to add agent ${agentName}:`, error.message);
            throw error;
        }
    }

    /**
     * Remove agent detection patterns from hook files
     */
    async removeAgent(agentName) {
        // 🔒 CRITICAL: Self-protection check - agent-admin cannot be removed from hooks (case-insensitive)
        if (agentName.toLowerCase() === 'agent-admin') {
            const errorMsg = 'CRITICAL ERROR: agent-admin is system-critical and cannot be removed from hooks';
            console.error(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
        }
        
        try {
            await this.createBackup();
            
            // Read current hook files
            let detectionContent = await fs.readFile(this.detectionHookPath, 'utf8');
            let completionContent = await fs.readFile(this.completionHookPath, 'utf8');
            
            // Remove detection block from agent-detection-hook.sh
            const detectionPattern = new RegExp(
                `\\n\\s*# Detect ${agentName} patterns[\\s\\S]*?agent_type="${agentName}"[\\s\\S]*?\\n    fi`, 
                'g'
            );
            detectionContent = detectionContent.replace(detectionPattern, '');
            
            // Remove extraction pattern from task-completion-hook.sh
            const extractionPattern = new RegExp(
                `\\s*elif echo "\\$params" \\| grep -i "${agentName}"[^\\n]*\\n\\s*echo "${agentName}"`, 
                'g'
            );
            completionContent = completionContent.replace(extractionPattern, '');
            
            // Write updated files
            await fs.writeFile(this.detectionHookPath, detectionContent);
            await fs.writeFile(this.completionHookPath, completionContent);
            
            // Validate syntax
            await this.validateHooks();
            
            console.log(`✅ Successfully removed ${agentName} from hook files`);
            
        } catch (error) {
            console.error(`❌ Failed to remove agent ${agentName}:`, error.message);
            throw error;
        }
    }

    /**
     * Update agent detection patterns in hook files
     */
    async updateAgent(agentName, keywords) {
        try {
            console.log(`📝 Updating ${agentName} with new keywords...`);
            
            // Remove existing patterns
            await this.removeAgent(agentName);
            
            // Add new patterns
            await this.addAgent(agentName, keywords);
            
            console.log(`✅ Successfully updated ${agentName} in hook files`);
            
        } catch (error) {
            console.error(`❌ Failed to update agent ${agentName}:`, error.message);
            throw error;
        }
    }

    /**
     * Validate hook file syntax
     */
    async validateHooks() {
        try {
            // Validate detection hook
            await execAsync(`bash -n "${this.detectionHookPath}"`);
            console.log('✅ agent-detection-hook.sh syntax valid');
            
            // Validate completion hook
            await execAsync(`bash -n "${this.completionHookPath}"`);
            console.log('✅ task-completion-hook.sh syntax valid');
            
            return true;
        } catch (error) {
            console.error('❌ Hook validation failed:', error.message);
            throw new Error('Hook file syntax validation failed');
        }
    }

    /**
     * List all agents detected in hooks
     */
    async listAgents() {
        try {
            const detectionContent = await fs.readFile(this.detectionHookPath, 'utf8');
            
            // Extract agent names from agent_type assignments
            const agentPattern = /agent_type="([^"]+)"/g;
            const agents = new Set();
            let match;
            
            while ((match = agentPattern.exec(detectionContent)) !== null) {
                agents.add(match[1]);
            }
            
            console.log('\n📋 Agents configured in hooks:');
            Array.from(agents).sort().forEach(agent => {
                console.log(`   - ${agent}`);
            });
            
            return Array.from(agents);
        } catch (error) {
            console.error('❌ Failed to list agents:', error.message);
            throw error;
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const agentName = args[1];
    const keywords = args.slice(2);
    
    const manager = new HookManager();
    
    try {
        switch (command) {
            case 'add':
                if (!agentName || keywords.length === 0) {
                    console.error('Usage: node manage-agent-hooks.js add <agent-name> <keywords...>');
                    process.exit(1);
                }
                await manager.addAgent(agentName, keywords);
                break;
                
            case 'remove':
                if (!agentName) {
                    console.error('Usage: node manage-agent-hooks.js remove <agent-name>');
                    process.exit(1);
                }
                await manager.removeAgent(agentName);
                break;
                
            case 'update':
                if (!agentName || keywords.length === 0) {
                    console.error('Usage: node manage-agent-hooks.js update <agent-name> <keywords...>');
                    process.exit(1);
                }
                await manager.updateAgent(agentName, keywords);
                break;
                
            case 'validate':
                await manager.validateHooks();
                console.log('✅ All hook files are valid');
                break;
                
            case 'list':
                await manager.listAgents();
                break;
                
            default:
                console.log(`
Agent Hook Management Script

Usage:
  node manage-agent-hooks.js add <agent-name> <keywords...>
  node manage-agent-hooks.js remove <agent-name>
  node manage-agent-hooks.js update <agent-name> <keywords...>
  node manage-agent-hooks.js validate
  node manage-agent-hooks.js list

Examples:
  node manage-agent-hooks.js add testing "test" "qa" "quality assurance"
  node manage-agent-hooks.js remove old-agent
  node manage-agent-hooks.js update finance "financial" "accounting" "budget"
  node manage-agent-hooks.js validate
  node manage-agent-hooks.js list

AgileBiz™ - Created by Phillip Darren Brown (https://github.com/DiscDev)
                `);
                break;
        }
    } catch (error) {
        console.error('❌ Operation failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = HookManager;