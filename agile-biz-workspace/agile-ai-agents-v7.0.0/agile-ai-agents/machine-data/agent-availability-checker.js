/**
 * Agent Availability Checker
 * 
 * Verifies agent availability and readiness before workflow execution
 * Part of Phase 3: Agent Coordination & Visibility
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AgentAvailabilityChecker {
    constructor() {
        this.agentDir = path.join(__dirname, '../ai-agents');
        this.subAgentDir = path.join(__dirname, '../../.claude/agents');
        this.agentCache = new Map();
        this.lastCheck = null;
        this.checkInterval = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Check availability of required agents
     */
    async checkAgents(requiredAgents) {
        const availability = {};
        const timestamp = new Date().toISOString();
        
        console.log(`\n🔍 Checking availability of ${requiredAgents.length} agents...`);
        
        for (const agent of requiredAgents) {
            // Check cache first
            const cached = this.getCachedAvailability(agent);
            if (cached) {
                availability[agent] = cached;
                continue;
            }
            
            // Perform fresh check
            availability[agent] = await this.checkSingleAgent(agent);
            
            // Update cache
            this.agentCache.set(agent, {
                ...availability[agent],
                checkedAt: timestamp
            });
        }
        
        this.lastCheck = timestamp;
        
        // Generate summary
        const summary = this.generateAvailabilitySummary(availability);
        
        return {
            timestamp,
            allAvailable: Object.values(availability).every(a => a.ready),
            agents: availability,
            summary,
            recommendations: this.getRecommendations(availability)
        };
    }

    /**
     * Check single agent availability
     */
    async checkSingleAgent(agentName) {
        const result = {
            name: agentName,
            exists: false,
            responsive: false,
            ready: false,
            resourcesAvailable: false,
            details: {}
        };

        try {
            // Step 1: Check if agent file exists
            result.exists = await this.checkAgentExists(agentName);
            if (!result.exists) {
                result.details.error = 'Agent file not found';
                return result;
            }

            // Step 2: Check if agent is a sub-agent in Claude
            result.details.isSubAgent = await this.checkIfSubAgent(agentName);
            
            // Step 3: Ping agent (simulate responsiveness check)
            result.responsive = await this.pingAgent(agentName);
            
            // Step 4: Check agent readiness
            result.ready = await this.checkAgentReady(agentName);
            
            // Step 5: Check resource availability
            result.resourcesAvailable = await this.checkResources(agentName);
            
            // Overall ready status
            result.ready = result.exists && result.responsive && result.resourcesAvailable;
            
        } catch (error) {
            result.details.error = error.message;
        }

        return result;
    }

    /**
     * Check if agent file exists
     */
    async checkAgentExists(agentName) {
        // Check main agent directory
        const mainAgentPath = path.join(this.agentDir, `${agentName}.md`);
        if (fs.existsSync(mainAgentPath)) {
            return true;
        }
        
        // Check sub-agent directory
        const subAgentPath = path.join(this.subAgentDir, `${agentName}.md`);
        if (fs.existsSync(subAgentPath)) {
            return true;
        }
        
        // Check JSON version
        const jsonPath = path.join(__dirname, 'ai-agents-json', `${agentName}.json`);
        if (fs.existsSync(jsonPath)) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if agent is a Claude sub-agent
     */
    async checkIfSubAgent(agentName) {
        const subAgentPath = path.join(this.subAgentDir, `${agentName}.md`);
        return fs.existsSync(subAgentPath);
    }

    /**
     * Ping agent to check responsiveness
     */
    async pingAgent(agentName) {
        // For markdown-based agents, we simulate a ping
        // In a real implementation, this might invoke the agent with a test command
        
        try {
            // Check if agent file is readable and valid
            const agentPath = this.findAgentFile(agentName);
            if (!agentPath) return false;
            
            const content = fs.readFileSync(agentPath, 'utf8');
            
            // Basic validation - agent file should have content
            if (content.length < 100) {
                return false;
            }
            
            // Check for required agent markers
            const hasValidStructure = 
                content.includes('# ') && // Has headers
                (content.includes('Overview') || content.includes('Role')) && // Has description
                (content.includes('Capabilities') || content.includes('Tools')); // Has capabilities
            
            return hasValidStructure;
            
        } catch (error) {
            console.error(`Failed to ping agent ${agentName}:`, error.message);
            return false;
        }
    }

    /**
     * Check if agent is ready to execute
     */
    async checkAgentReady(agentName) {
        // Check agent-specific readiness criteria
        const readinessChecks = {
            'project_analyzer_agent': () => this.checkProjectAnalyzerReady(),
            'research_agent': () => this.checkResearchAgentReady(),
            'prd_agent': () => this.checkPRDAgentReady(),
            'coder_agent': () => this.checkCoderAgentReady(),
            'testing_agent': () => this.checkTestingAgentReady()
        };
        
        const checkFn = readinessChecks[agentName];
        if (checkFn) {
            return await checkFn();
        }
        
        // Default readiness check
        return this.checkDefaultReady(agentName);
    }

    /**
     * Check resource availability for agent
     */
    async checkResources(agentName) {
        const resources = {
            memory: await this.checkMemoryAvailable(),
            disk: await this.checkDiskSpace(),
            permissions: await this.checkPermissions(agentName)
        };
        
        return Object.values(resources).every(r => r);
    }

    /**
     * Check memory availability
     */
    async checkMemoryAvailable() {
        try {
            const os = require('os');
            const freeMemory = os.freemem();
            const requiredMemory = 512 * 1024 * 1024; // 512MB minimum
            
            return freeMemory > requiredMemory;
        } catch (error) {
            console.warn('Could not check memory:', error.message);
            return true; // Assume available if can't check
        }
    }

    /**
     * Check disk space
     */
    async checkDiskSpace() {
        // Simplified check - in production would use proper disk stats
        try {
            const testFile = path.join(this.agentDir, '.disk-test');
            fs.writeFileSync(testFile, Buffer.alloc(1024 * 1024)); // 1MB test
            fs.unlinkSync(testFile);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check permissions for agent operations
     */
    async checkPermissions(agentName) {
        const requiredPaths = [
            path.join(__dirname, '../project-documents'),
            path.join(__dirname, '../project-state'),
            path.join(__dirname, '../../')
        ];
        
        for (const requiredPath of requiredPaths) {
            try {
                // Check read permission
                fs.accessSync(requiredPath, fs.constants.R_OK);
                
                // Check write permission for project directories
                if (requiredPath.includes('project-')) {
                    fs.accessSync(requiredPath, fs.constants.W_OK);
                }
            } catch (error) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Find agent file path
     */
    findAgentFile(agentName) {
        const possiblePaths = [
            path.join(this.agentDir, `${agentName}.md`),
            path.join(this.subAgentDir, `${agentName}.md`),
            path.join(__dirname, 'ai-agents-json', `${agentName}.json`)
        ];
        
        for (const agentPath of possiblePaths) {
            if (fs.existsSync(agentPath)) {
                return agentPath;
            }
        }
        
        return null;
    }

    /**
     * Get cached availability if fresh enough
     */
    getCachedAvailability(agentName) {
        const cached = this.agentCache.get(agentName);
        if (!cached) return null;
        
        const age = Date.now() - new Date(cached.checkedAt).getTime();
        if (age > this.checkInterval) {
            this.agentCache.delete(agentName);
            return null;
        }
        
        return cached;
    }

    /**
     * Generate availability summary
     */
    generateAvailabilitySummary(availability) {
        const total = Object.keys(availability).length;
        const available = Object.values(availability).filter(a => a.ready).length;
        const missing = Object.values(availability).filter(a => !a.exists).length;
        const unresponsive = Object.values(availability).filter(a => a.exists && !a.responsive).length;
        const resourceIssues = Object.values(availability).filter(a => a.exists && a.responsive && !a.resourcesAvailable).length;
        
        return {
            total,
            available,
            missing,
            unresponsive,
            resourceIssues,
            percentageReady: Math.round((available / total) * 100)
        };
    }

    /**
     * Get recommendations based on availability
     */
    getRecommendations(availability) {
        const recommendations = [];
        
        for (const [agent, status] of Object.entries(availability)) {
            if (!status.ready) {
                if (!status.exists) {
                    recommendations.push({
                        agent,
                        issue: 'missing',
                        action: `Install missing agent: ${agent}`,
                        command: `cp templates/ai-agents/${agent}.md ai-agents/`
                    });
                } else if (!status.responsive) {
                    recommendations.push({
                        agent,
                        issue: 'unresponsive',
                        action: `Check agent file integrity: ${agent}`,
                        command: `cat ai-agents/${agent}.md | head -20`
                    });
                } else if (!status.resourcesAvailable) {
                    recommendations.push({
                        agent,
                        issue: 'resources',
                        action: 'Free up system resources',
                        details: status.details
                    });
                }
            }
        }
        
        return recommendations;
    }

    /**
     * Agent-specific readiness checks
     */
    async checkProjectAnalyzerReady() {
        // Project analyzer needs access to stakeholder templates
        const templatePath = path.join(__dirname, '../templates/stakeholder-prompts');
        return fs.existsSync(templatePath);
    }

    async checkResearchAgentReady() {
        // Research agent needs research level configuration
        const configPath = path.join(__dirname, 'research-level-documents.json');
        return fs.existsSync(configPath);
    }

    async checkPRDAgentReady() {
        // PRD agent needs requirements templates
        const templatePath = path.join(__dirname, '../templates/requirements');
        return true; // Simplified for now
    }

    async checkCoderAgentReady() {
        // Coder agent needs write access to project directory
        try {
            const testPath = path.join(__dirname, '../../.coder-test');
            fs.writeFileSync(testPath, 'test');
            fs.unlinkSync(testPath);
            return true;
        } catch (error) {
            return false;
        }
    }

    async checkTestingAgentReady() {
        // Testing agent needs test framework availability
        const jestConfig = path.join(__dirname, '../jest.config.js');
        return fs.existsSync(jestConfig);
    }

    async checkDefaultReady(agentName) {
        // Default readiness is just that the agent exists and is responsive
        return true;
    }

    /**
     * Clear agent cache
     */
    clearCache() {
        this.agentCache.clear();
        this.lastCheck = null;
    }

    /**
     * Get required agents for workflow type
     */
    static getRequiredAgents(workflowType) {
        const agentSets = {
            'new-project': [
                'project_analyzer_agent',
                'research_agent',
                'prd_agent',
                'analysis_agent',
                'project_manager_agent',
                'project_structure_agent',
                'coder_agent',
                'scrum_master_agent'
            ],
            'existing-project': [
                'project_analyzer_agent',
                'security_agent',
                'testing_agent',
                'devops_agent',
                'ui_ux_agent',
                'dba_agent',
                'api_agent',
                'optimization_agent'
            ]
        };
        
        return agentSets[workflowType] || [];
    }
}

module.exports = AgentAvailabilityChecker;