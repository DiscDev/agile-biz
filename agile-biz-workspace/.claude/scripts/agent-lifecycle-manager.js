#!/usr/bin/env node

/**
 * Agent Lifecycle Manager
 * Complete agent management with hook integration
 * Used by agent-admin for all agent operations
 * 
 * AgileBiz™ - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

const fs = require('fs').promises;
const path = require('path');
const HookManager = require('./manage-agent-hooks');

class AgentLifecycleManager {
    constructor() {
        this.hookManager = new HookManager();
        this.agentsDir = path.join(__dirname, '../agents');
        this.claudeMdPath = path.join(__dirname, '../../CLAUDE.md');
    }

    /**
     * Create a new agent with full integration
     */
    async createAgent(agentName, config) {
        console.log(`\n🚀 Creating agent: ${agentName}`);
        
        try {
            // Step 1: Create agent file
            const agentPath = path.join(this.agentsDir, `${agentName}.md`);
            const agentContent = this.generateAgentFile(agentName, config);
            await fs.writeFile(agentPath, agentContent);
            console.log(`✅ Agent file created: ${agentPath}`);
            
            // Step 2: Update hook files
            await this.hookManager.addAgent(agentName, config.keywords);
            console.log(`✅ Hook files updated with ${agentName} patterns`);
            
            // Step 3: Update CLAUDE.md
            await this.updateClaudeMd('add', agentName, config);
            console.log(`✅ CLAUDE.md updated with ${agentName} documentation`);
            
            // Step 4: Create agent-specific context files if needed
            if (config.contexts && config.contexts.length > 0) {
                await this.createContextFiles(agentName, config.contexts);
                console.log(`✅ Context files created for ${agentName}`);
            }
            
            // Step 5: Validate everything
            await this.validateAgent(agentName);
            console.log(`✅ Agent ${agentName} validated successfully`);
            
            console.log(`\n✅ Agent ${agentName} created successfully!`);
            console.log(`   Trigger with: ${config.keywords.join(', ')}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to create agent ${agentName}:`, error.message);
            // Attempt rollback
            await this.rollbackAgent(agentName);
            throw error;
        }
    }

    /**
     * Delete an agent with full cleanup
     */
    async deleteAgent(agentName) {
        console.log(`\n🗑️ Deleting agent: ${agentName}`);
        
        try {
            // Step 1: Backup agent before deletion
            await this.backupAgent(agentName);
            console.log(`✅ Agent backed up before deletion`);
            
            // Step 2: Remove from hook files
            await this.hookManager.removeAgent(agentName);
            console.log(`✅ Removed ${agentName} from hook files`);
            
            // Step 3: Update CLAUDE.md
            await this.updateClaudeMd('remove', agentName);
            console.log(`✅ Removed ${agentName} from CLAUDE.md`);
            
            // Step 4: Delete agent file
            const agentPath = path.join(this.agentsDir, `${agentName}.md`);
            await fs.unlink(agentPath);
            console.log(`✅ Deleted agent file: ${agentPath}`);
            
            // Step 5: Delete agent-specific context files
            await this.deleteContextFiles(agentName);
            console.log(`✅ Deleted context files for ${agentName}`);
            
            console.log(`\n✅ Agent ${agentName} deleted successfully!`);
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete agent ${agentName}:`, error.message);
            throw error;
        }
    }

    /**
     * Update an existing agent
     */
    async updateAgent(agentName, updates) {
        console.log(`\n📝 Updating agent: ${agentName}`);
        
        try {
            // Step 1: Backup current state
            await this.backupAgent(agentName);
            console.log(`✅ Agent backed up before update`);
            
            // Step 2: Update agent file if needed
            if (updates.content) {
                const agentPath = path.join(this.agentsDir, `${agentName}.md`);
                await fs.writeFile(agentPath, updates.content);
                console.log(`✅ Agent file updated`);
            }
            
            // Step 3: Update hooks if keywords changed
            if (updates.keywords) {
                await this.hookManager.updateAgent(agentName, updates.keywords);
                console.log(`✅ Hook files updated with new patterns`);
            }
            
            // Step 4: Update CLAUDE.md if needed
            if (updates.documentation) {
                await this.updateClaudeMd('update', agentName, updates);
                console.log(`✅ CLAUDE.md documentation updated`);
            }
            
            // Step 5: Validate changes
            await this.validateAgent(agentName);
            console.log(`✅ Agent ${agentName} validated successfully`);
            
            console.log(`\n✅ Agent ${agentName} updated successfully!`);
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to update agent ${agentName}:`, error.message);
            throw error;
        }
    }

    /**
     * Generate agent file content
     */
    generateAgentFile(agentName, config) {
        const yaml = `---
name: ${agentName}
description: ${config.description}
tools: [${config.tools.join(', ')}]
model: ${config.model}
token_count: ${config.tokenCount || 2000}
---`;

        const content = `${yaml}

# ${config.displayName || agentName} Agent

## Purpose
${config.purpose}

## Capabilities
${config.capabilities.map(cap => `- ${cap}`).join('\n')}

## Keywords and Triggers
${config.keywords.map(kw => `- "${kw}"`).join('\n')}

## Context Loading
${config.contextLoading || 'Standard context loading pattern'}

## Integration
- Logging: Enabled
- Hooks: Configured
- Documentation: CLAUDE.md

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)`;

        return content;
    }

    /**
     * Update CLAUDE.md with agent information
     */
    async updateClaudeMd(action, agentName, config = {}) {
        try {
            let content = await fs.readFile(this.claudeMdPath, 'utf8');
            
            if (action === 'add') {
                // Add new agent documentation
                const agentDoc = this.generateClaudeMdEntry(agentName, config);
                
                // Find insertion point (after other agents)
                const insertPoint = content.indexOf('### Agent Usage Examples');
                if (insertPoint > -1) {
                    content = content.slice(0, insertPoint) + agentDoc + '\n\n' + content.slice(insertPoint);
                }
            } else if (action === 'remove') {
                // Remove agent documentation
                const pattern = new RegExp(`#### \\*\\*[^*]+${agentName}[^#]+`, 'gi');
                content = content.replace(pattern, '');
            } else if (action === 'update') {
                // Update existing documentation
                // First remove old, then add new
                await this.updateClaudeMd('remove', agentName);
                await this.updateClaudeMd('add', agentName, config);
                return;
            }
            
            await fs.writeFile(this.claudeMdPath, content);
        } catch (error) {
            console.error(`Failed to update CLAUDE.md:`, error.message);
            throw error;
        }
    }

    /**
     * Generate CLAUDE.md entry for an agent
     */
    generateClaudeMdEntry(agentName, config) {
        return `#### **${config.displayName || agentName} Agent** (\`${agentName}\`)
- **Purpose**: ${config.description}
- **Triggers**: ${config.keywords.map(k => `"${k}"`).join(', ')}
- **Capabilities**:
${config.capabilities.map(cap => `  - ${cap}`).join('\n')}
- **Model**: Claude 3.5 ${config.model.charAt(0).toUpperCase() + config.model.slice(1)}`;
    }

    /**
     * Create agent-specific context files
     */
    async createContextFiles(agentName, contexts) {
        const contextDir = path.join(this.agentsDir, 'agent-tools', agentName);
        await fs.mkdir(contextDir, { recursive: true });
        
        for (const context of contexts) {
            const contextPath = path.join(contextDir, `${context.name}.md`);
            await fs.writeFile(contextPath, context.content);
        }
    }

    /**
     * Delete agent-specific context files
     */
    async deleteContextFiles(agentName) {
        const contextDir = path.join(this.agentsDir, 'agent-tools', agentName);
        try {
            await fs.rm(contextDir, { recursive: true, force: true });
        } catch (error) {
            // Directory might not exist, that's ok
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    /**
     * Backup an agent before modification/deletion
     */
    async backupAgent(agentName) {
        const backupDir = path.join(this.agentsDir, 'backups');
        await fs.mkdir(backupDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const agentPath = path.join(this.agentsDir, `${agentName}.md`);
        const backupPath = path.join(backupDir, `${agentName}-${timestamp}.md`);
        
        try {
            await fs.copyFile(agentPath, backupPath);
        } catch (error) {
            // Agent might not exist yet (for new agents)
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    /**
     * Validate agent configuration
     */
    async validateAgent(agentName) {
        const agentPath = path.join(this.agentsDir, `${agentName}.md`);
        
        try {
            const content = await fs.readFile(agentPath, 'utf8');
            
            // Check YAML frontmatter
            if (!content.startsWith('---')) {
                throw new Error('Missing YAML frontmatter');
            }
            
            // Extract YAML
            const yamlEnd = content.indexOf('---', 4);
            if (yamlEnd === -1) {
                throw new Error('Invalid YAML frontmatter');
            }
            
            const yaml = content.slice(4, yamlEnd);
            
            // Check required fields
            const requiredFields = ['name:', 'description:', 'tools:', 'model:', 'token_count:'];
            for (const field of requiredFields) {
                if (!yaml.includes(field)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            
            // Check forbidden fields
            const forbiddenFields = ['agentName:', 'agentRole:', 'modelName:', 'temperature:'];
            for (const field of forbiddenFields) {
                if (yaml.includes(field)) {
                    throw new Error(`Forbidden field found: ${field}`);
                }
            }
            
            return true;
        } catch (error) {
            throw new Error(`Agent validation failed: ${error.message}`);
        }
    }

    /**
     * Rollback agent creation on failure
     */
    async rollbackAgent(agentName) {
        console.log(`⚠️ Rolling back agent ${agentName}...`);
        
        try {
            // Remove from hooks
            await this.hookManager.removeAgent(agentName).catch(() => {});
            
            // Remove agent file
            const agentPath = path.join(this.agentsDir, `${agentName}.md`);
            await fs.unlink(agentPath).catch(() => {});
            
            // Remove context files
            await this.deleteContextFiles(agentName).catch(() => {});
            
            console.log(`✅ Rollback completed`);
        } catch (error) {
            console.error(`⚠️ Rollback incomplete:`, error.message);
        }
    }
}

// CLI Interface
async function main() {
    const manager = new AgentLifecycleManager();
    
    // Example usage - this would be called by agent-admin
    const testConfig = {
        description: 'Test agent for demonstration',
        purpose: 'Demonstrates agent lifecycle management',
        displayName: 'Test Agent',
        capabilities: [
            'Testing functionality',
            'Demonstrating features',
            'Validating integration'
        ],
        keywords: ['test', 'testing', 'qa', 'quality assurance'],
        tools: ['Read', 'Write', 'Edit', 'Bash'],
        model: 'sonnet',
        tokenCount: 1500
    };
    
    // Uncomment to test:
    // await manager.createAgent('test-agent', testConfig);
    // await manager.deleteAgent('test-agent');
    
    console.log('Agent Lifecycle Manager ready for use by agent-admin');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = AgentLifecycleManager;