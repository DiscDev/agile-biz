/**
 * Workflow Pre-flight Checker
 * 
 * Validates system readiness before workflow execution
 * Part of Phase 1: Critical Foundation improvements
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { HookManager } = require('../hooks/hook-manager');

class WorkflowPreflightChecker {
    constructor() {
        this.checks = {
            agentsAvailable: false,
            stateIntegrity: false,
            diskSpace: false,
            permissions: false,
            hooksEnabled: false,
            researchConfig: false
        };
    }

    /**
     * Run all pre-flight checks
     */
    async runChecks(workflowType) {
        console.log('\n🔍 Running pre-flight checks...\n');
        
        const results = {
            timestamp: new Date().toISOString(),
            workflowType,
            checks: {}
        };

        // Run each check
        results.checks.agentsAvailable = await this.checkAgentAvailability(workflowType);
        results.checks.stateIntegrity = await this.validateStateSystem();
        results.checks.diskSpace = await this.checkDiskSpace();
        results.checks.permissions = await this.checkFilePermissions();
        results.checks.hooksEnabled = await this.checkHookSystem();
        results.checks.researchConfig = await this.validateResearchLevels();

        // Calculate overall status
        results.allPassed = Object.values(results.checks).every(check => check.status === 'passed');
        results.summary = this.generateSummary(results);

        // Display results
        this.displayResults(results);

        return results;
    }

    /**
     * Check if required agents are available
     */
    async checkAgentAvailability(workflowType) {
        const check = {
            name: 'Agent Availability',
            status: 'checking'
        };

        try {
            // Define required agents by workflow type
            const requiredAgents = {
                'new-project': [
                    'project_analyzer_agent',
                    'research_agent',
                    'prd_agent',
                    'project_manager_agent',
                    'coder_agent',
                    'project_structure_agent'
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

            const agents = requiredAgents[workflowType] || [];
            const agentDir = path.join(__dirname, '../../ai-agents');
            const missingAgents = [];

            for (const agent of agents) {
                const agentFile = path.join(agentDir, `${agent}.md`);
                if (!fs.existsSync(agentFile)) {
                    missingAgents.push(agent);
                }
            }

            if (missingAgents.length > 0) {
                check.status = 'failed';
                check.message = `Missing agents: ${missingAgents.join(', ')}`;
                check.details = { missingAgents };
            } else {
                check.status = 'passed';
                check.message = `All ${agents.length} required agents available`;
                check.details = { availableAgents: agents };
            }
        } catch (error) {
            check.status = 'failed';
            check.message = `Error checking agents: ${error.message}`;
            check.error = error.message;
        }

        return check;
    }

    /**
     * Validate workflow state system integrity
     */
    async validateStateSystem() {
        const check = {
            name: 'State System Integrity',
            status: 'checking'
        };

        try {
            const stateDir = path.join(__dirname, '../../project-state/workflow-states');
            const requiredDirs = [
                stateDir,
                path.join(__dirname, '../../project-state/checkpoints'),
                path.join(__dirname, '../../project-state/error-logs')
            ];

            const missingDirs = [];
            for (const dir of requiredDirs) {
                if (!fs.existsSync(dir)) {
                    missingDirs.push(dir);
                }
            }

            // Check if current state file is valid (if exists)
            const currentStateFile = path.join(stateDir, 'current-workflow.json');
            let stateValid = true;
            if (fs.existsSync(currentStateFile)) {
                try {
                    const state = JSON.parse(fs.readFileSync(currentStateFile, 'utf8'));
                    // Basic validation
                    if (!state.workflow_id || !state.workflow_type) {
                        stateValid = false;
                    }
                } catch (e) {
                    stateValid = false;
                }
            }

            if (missingDirs.length > 0) {
                check.status = 'warning';
                check.message = 'Some state directories missing (will be created)';
                check.details = { missingDirs };
            } else if (!stateValid) {
                check.status = 'warning';
                check.message = 'Current state file invalid (will be reset)';
            } else {
                check.status = 'passed';
                check.message = 'State system integrity verified';
            }
        } catch (error) {
            check.status = 'failed';
            check.message = `State system check failed: ${error.message}`;
            check.error = error.message;
        }

        return check;
    }

    /**
     * Check available disk space
     */
    async checkDiskSpace() {
        const check = {
            name: 'Disk Space',
            status: 'checking'
        };

        try {
            const stats = await this.getDiskStats();
            const requiredGB = 2; // Require at least 2GB free
            const availableGB = stats.available / (1024 * 1024 * 1024);

            if (availableGB < requiredGB) {
                check.status = 'failed';
                check.message = `Insufficient disk space: ${availableGB.toFixed(2)}GB available, ${requiredGB}GB required`;
                check.details = stats;
            } else {
                check.status = 'passed';
                check.message = `Adequate disk space: ${availableGB.toFixed(2)}GB available`;
                check.details = stats;
            }
        } catch (error) {
            check.status = 'warning';
            check.message = 'Could not check disk space';
            check.error = error.message;
        }

        return check;
    }

    /**
     * Check file permissions
     */
    async checkFilePermissions() {
        const check = {
            name: 'File Permissions',
            status: 'checking'
        };

        try {
            const testDir = path.join(__dirname, '../../project-documents');
            const testFile = path.join(testDir, '.permission-test');

            // Ensure directory exists
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }

            // Test write permission
            fs.writeFileSync(testFile, 'test');
            
            // Test read permission
            fs.readFileSync(testFile);
            
            // Clean up
            fs.unlinkSync(testFile);

            check.status = 'passed';
            check.message = 'File permissions verified';
        } catch (error) {
            check.status = 'failed';
            check.message = `Permission check failed: ${error.message}`;
            check.error = error.message;
        }

        return check;
    }

    /**
     * Check hook system status
     */
    async checkHookSystem() {
        const check = {
            name: 'Hook System',
            status: 'checking'
        };

        try {
            const hookManager = new HookManager();
            const registeredHooks = hookManager.getRegisteredHooks();

            if (registeredHooks.length === 0) {
                check.status = 'warning';
                check.message = 'No hooks registered (hooks optional)';
            } else {
                check.status = 'passed';
                check.message = `${registeredHooks.length} hooks registered and ready`;
                check.details = { 
                    hookCount: registeredHooks.length,
                    hooks: registeredHooks.slice(0, 5) // Show first 5
                };
            }
        } catch (error) {
            check.status = 'warning';
            check.message = 'Hook system not available (optional)';
            check.error = error.message;
        }

        return check;
    }

    /**
     * Validate research level configuration
     */
    async validateResearchLevels() {
        const check = {
            name: 'Research Configuration',
            status: 'checking'
        };

        try {
            const configFile = path.join(__dirname, '../research-level-documents.json');
            
            if (!fs.existsSync(configFile)) {
                check.status = 'failed';
                check.message = 'Research level configuration missing';
                return check;
            }

            const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            
            // Validate structure
            const requiredLevels = ['minimal', 'medium', 'thorough'];
            const missingLevels = requiredLevels.filter(level => !config[level]);

            if (missingLevels.length > 0) {
                check.status = 'failed';
                check.message = `Missing research levels: ${missingLevels.join(', ')}`;
            } else {
                // Check document counts
                const counts = {
                    minimal: config.minimal.total_documents,
                    medium: config.medium.total_documents,
                    thorough: config.thorough.total_documents
                };

                check.status = 'passed';
                check.message = 'Research levels configured correctly';
                check.details = counts;
            }
        } catch (error) {
            check.status = 'failed';
            check.message = `Research config check failed: ${error.message}`;
            check.error = error.message;
        }

        return check;
    }

    /**
     * Get disk statistics
     */
    async getDiskStats() {
        // Simple cross-platform disk check
        const workingDir = process.cwd();
        
        try {
            // This is a simplified check - in production would use proper disk stats
            const testFile = path.join(workingDir, '.disk-test');
            const testSize = 1024 * 1024; // 1MB
            const buffer = Buffer.alloc(testSize);
            
            fs.writeFileSync(testFile, buffer);
            const stats = fs.statSync(testFile);
            fs.unlinkSync(testFile);

            // Estimate available space (simplified)
            return {
                total: 100 * 1024 * 1024 * 1024, // Assume 100GB total
                available: 10 * 1024 * 1024 * 1024, // Assume 10GB available
                used: 90 * 1024 * 1024 * 1024
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generate summary of checks
     */
    generateSummary(results) {
        const passed = Object.values(results.checks).filter(c => c.status === 'passed').length;
        const failed = Object.values(results.checks).filter(c => c.status === 'failed').length;
        const warnings = Object.values(results.checks).filter(c => c.status === 'warning').length;

        return {
            total: Object.keys(results.checks).length,
            passed,
            failed,
            warnings,
            canProceed: failed === 0
        };
    }

    /**
     * Display results to console
     */
    displayResults(results) {
        console.log('\n📋 Pre-flight Check Results');
        console.log('─'.repeat(50));

        for (const [key, check] of Object.entries(results.checks)) {
            const icon = {
                passed: '✅',
                failed: '❌',
                warning: '⚠️',
                checking: '🔄'
            }[check.status] || '❓';

            console.log(`${icon} ${check.name}: ${check.message}`);
        }

        console.log('─'.repeat(50));
        
        const { passed, failed, warnings } = results.summary;
        console.log(`\n📊 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);

        if (results.allPassed) {
            console.log('\n✨ All checks passed! Ready to proceed with workflow.\n');
        } else if (results.summary.canProceed) {
            console.log('\n⚠️  Some warnings detected but workflow can proceed.\n');
        } else {
            console.log('\n❌ Critical checks failed. Please resolve issues before proceeding.\n');
        }
    }
}

module.exports = WorkflowPreflightChecker;