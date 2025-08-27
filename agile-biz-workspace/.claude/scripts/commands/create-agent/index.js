#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

const { AgentNameValidator, PurposeValidator, InputSanitizer } = require('./validation.js');
const { WorkflowManager } = require('./workflow.js');
const { SpecificationCompiler } = require('./compiler.js');

class CreateAgentCommand {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.workflow = new WorkflowManager();
    }

    async run() {
        console.log('🚀 Starting agent creation workflow...\n');
        
        try {
            await this.workflow.start(this.rl);
            
            // Compile specification
            const compiler = new SpecificationCompiler(this.workflow.userAnswers);
            const result = compiler.compile();
            
            if (!result.success) {
                console.error('❌ Specification compilation failed:');
                result.errors.forEach(error => console.error(`  - ${error}`));
                process.exit(1);
            }
            
            // Spawn agent-admin with specification
            await this.spawnAgentAdmin(result.specification);
            
        } catch (error) {
            console.error(`❌ Agent creation failed: ${error.message}`);
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }
    
    async spawnAgentAdmin(specification) {
        console.log('\n🔧 Creating agent with agent-admin...');
        
        const prompt = `Create a new agent using this complete specification:

${JSON.stringify(specification, null, 2)}

Follow the specification exactly and create all required files, contexts, and integrations as specified. Ensure the agent follows all AgileBiz standards and integrates properly with the existing infrastructure.`;

        // Use claude-code to spawn agent-admin
        const child = spawn('claude-code', ['chat', '--agent', 'agent-admin', prompt], {
            stdio: 'inherit'
        });
        
        return new Promise((resolve, reject) => {
            child.on('close', (code) => {
                if (code === 0) {
                    console.log('\n✅ Agent created successfully!');
                    console.log('⚠️  IMPORTANT: Please restart Claude Code for the new agent to appear in the /agents list.');
                    resolve();
                } else {
                    reject(new Error(`Agent creation failed with code ${code}`));
                }
            });
            
            child.on('error', (error) => {
                reject(new Error(`Failed to spawn agent-admin: ${error.message}`));
            });
        });
    }
}

// Run if called directly
if (require.main === module) {
    const command = new CreateAgentCommand();
    command.run().catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { CreateAgentCommand };