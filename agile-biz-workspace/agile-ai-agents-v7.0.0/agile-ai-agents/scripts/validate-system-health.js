#!/usr/bin/env node

/**
 * AgileAiAgents System Health Validation
 * 
 * Comprehensive check of all system components
 */

const fs = require('fs-extra');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const projectRoot = path.join(__dirname, '..');

class SystemValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: [],
            summary: {}
        };
    }

    async validate() {
        console.log(`${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║        AgileAiAgents System Health Check           ║${colors.reset}`);
        console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}`);
        
        await this.checkCoreComponents();
        await this.checkAgents();
        await this.checkWorkflows();
        await this.checkStateManagement();
        await this.checkBacklogSystem();
        await this.checkPulseSystem();
        await this.checkDashboard();
        await this.checkCommunityLearnings();
        await this.checkDocumentation();
        await this.displaySummary();
    }

    async checkCoreComponents() {
        console.log(`\n${colors.blue}=== Core Components ===${colors.reset}`);
        
        const components = [
            { path: 'CLAUDE.md', name: 'CLAUDE.md configuration' },
            { path: 'package.json', name: 'Package configuration' },
            { path: '.env_example', name: 'Environment template' },
            { path: 'VERSION.json', name: 'Version tracking' },
            { path: 'machine-data/system-rules.json', name: 'System rules' }
        ];

        for (const comp of components) {
            if (await fs.pathExists(path.join(projectRoot, comp.path))) {
                this.pass(`${comp.name} exists`);
                
                // Validate JSON files
                if (comp.path.endsWith('.json')) {
                    try {
                        await fs.readJSON(path.join(projectRoot, comp.path));
                        this.pass(`  JSON valid`);
                    } catch (error) {
                        this.fail(`  JSON invalid: ${error.message}`);
                    }
                }
            } else {
                this.fail(`${comp.name} missing`);
            }
        }
    }

    async checkAgents() {
        console.log(`\n${colors.blue}=== AI Agents (38 Total) ===${colors.reset}`);
        
        const agentsPath = path.join(projectRoot, 'ai-agents');
        const agentFiles = await fs.readdir(agentsPath);
        const mdAgents = agentFiles.filter(f => f.endsWith('_agent.md'));
        
        this.pass(`Found ${mdAgents.length} agent files`);
        
        // Check JSON conversions
        const jsonPath = path.join(projectRoot, 'machine-data/ai-agents-json');
        if (await fs.pathExists(jsonPath)) {
            const jsonFiles = await fs.readdir(jsonPath);
            const jsonAgents = jsonFiles.filter(f => f.endsWith('.json'));
            
            if (jsonAgents.length === mdAgents.length) {
                this.pass(`All agents have JSON versions (${jsonAgents.length})`);
            } else {
                this.warn(`JSON mismatch: ${mdAgents.length} MD vs ${jsonAgents.length} JSON`);
            }
        }

        // Check for AI-Native Pulse System in Scrum Master
        const scrumMasterPath = path.join(agentsPath, 'scrum_master_agent.md');
        const scrumContent = await fs.readFile(scrumMasterPath, 'utf8');
        if (scrumContent.includes('AI-Native Event-Driven')) {
            this.pass('Scrum Master has AI-Native Pulse System');
        } else {
            this.fail('Scrum Master missing AI-Native Pulse System');
        }
    }

    async checkWorkflows() {
        console.log(`\n${colors.blue}=== Workflow System ===${colors.reset}`);
        
        const workflows = [
            'aaa-documents/workflow-templates/new-project-workflow-template.md',
            'aaa-documents/workflow-templates/existing-project-workflow-template.md',
            'ai-agent-coordination/auto-project-orchestrator.md',
            'ai-agent-coordination/orchestrator-workflows.md'
        ];

        for (const workflow of workflows) {
            if (await fs.pathExists(path.join(projectRoot, workflow))) {
                this.pass(`${path.basename(workflow)} exists`);
            } else {
                this.fail(`${path.basename(workflow)} missing`);
            }
        }

        // Check for backlog integration
        const newProjectPath = path.join(projectRoot, workflows[0]);
        const content = await fs.readFile(newProjectPath, 'utf8');
        if (content.includes('Product Backlog Creation')) {
            this.pass('New project workflow includes backlog phase');
        } else {
            this.fail('New project workflow missing backlog phase');
        }
    }

    async checkStateManagement() {
        console.log(`\n${colors.blue}=== State Management ===${colors.reset}`);
        
        const statePath = path.join(projectRoot, 'project-state');
        if (await fs.pathExists(statePath)) {
            this.pass('Project state directory exists');
            
            const stateFiles = [
                'current-state.json',
                'checkpoints/',
                'session-history/',
                'decisions/'
            ];

            for (const file of stateFiles) {
                const filePath = path.join(statePath, file);
                if (await fs.pathExists(filePath)) {
                    this.pass(`  ${file} exists`);
                } else {
                    this.warn(`  ${file} missing (will be created on use)`);
                }
            }
        } else {
            this.fail('Project state directory missing');
        }
    }

    async checkBacklogSystem() {
        console.log(`\n${colors.blue}=== Product Backlog System ===${colors.reset}`);
        
        const backlogPath = path.join(projectRoot, 'project-documents/orchestration/product-backlog');
        if (await fs.pathExists(backlogPath)) {
            this.pass('Product backlog directory exists');
            
            const requiredFiles = [
                'backlog-state.json',
                'velocity-metrics.json',
                'dependency-map.md',
                'estimation-guidelines.md',
                'backlog-refinement-log.md'
            ];

            for (const file of requiredFiles) {
                if (await fs.pathExists(path.join(backlogPath, file))) {
                    this.pass(`  ${file} exists`);
                } else {
                    this.fail(`  ${file} missing`);
                }
            }

            // Check backlog items
            const itemsPath = path.join(backlogPath, 'backlog-items');
            if (await fs.pathExists(itemsPath)) {
                const epics = await fs.readdir(itemsPath);
                const epicFolders = epics.filter(e => fs.statSync(path.join(itemsPath, e)).isDirectory());
                this.pass(`  ${epicFolders.length} epic folders found`);
            }
        } else {
            this.fail('Product backlog directory missing');
        }
    }

    async checkPulseSystem() {
        console.log(`\n${colors.blue}=== AI-Native Pulse System ===${colors.reset}`);
        
        const exampleSprintPath = path.join(projectRoot, 
            'project-documents/orchestration/sprints/sprint-2025-01-09-example-structure');
        
        if (await fs.pathExists(exampleSprintPath)) {
            this.pass('Example sprint exists');
            
            // Check for old daily-updates
            const dailyPath = path.join(exampleSprintPath, 'daily-updates');
            if (await fs.pathExists(dailyPath)) {
                this.fail('  Old daily-updates folder still exists');
            } else {
                this.pass('  Daily-updates properly removed');
            }

            // Check for pulse-updates
            const pulsePath = path.join(exampleSprintPath, 'pulse-updates');
            if (await fs.pathExists(pulsePath)) {
                this.pass('  Pulse-updates folder exists');
                
                const pulses = await fs.readdir(pulsePath);
                const validPulses = pulses.filter(p => p.match(/pulse-\d{4}-\d{2}-\d{2}-\d{6}-[\w-]+\.md/));
                this.pass(`  ${validPulses.length} valid pulse files found`);
            } else {
                this.fail('  Pulse-updates folder missing');
            }
        }

        // Check guide exists
        const guideExists = await fs.pathExists(
            path.join(projectRoot, 'aaa-documents/ai-native-pulse-system-guide.md')
        );
        if (guideExists) {
            this.pass('AI-Native Pulse System Guide exists');
        } else {
            this.fail('AI-Native Pulse System Guide missing');
        }
    }

    async checkDashboard() {
        console.log(`\n${colors.blue}=== Project Dashboard ===${colors.reset}`);
        
        const dashboardPath = path.join(projectRoot, 'project-dashboard');
        if (await fs.pathExists(dashboardPath)) {
            this.pass('Dashboard directory exists');
            
            // Check key files
            const files = ['server.js', 'public/index.html', 'public/dashboard.js'];
            for (const file of files) {
                if (await fs.pathExists(path.join(dashboardPath, file))) {
                    this.pass(`  ${file} exists`);
                } else {
                    this.fail(`  ${file} missing`);
                }
            }

            // Check for backlog integration
            const serverPath = path.join(dashboardPath, 'server.js');
            const serverContent = await fs.readFile(serverPath, 'utf8');
            if (serverContent.includes('loadBacklogMetrics')) {
                this.pass('  Dashboard has backlog integration');
            } else {
                this.fail('  Dashboard missing backlog integration');
            }
        } else {
            this.fail('Dashboard directory missing');
        }
    }

    async checkCommunityLearnings() {
        console.log(`\n${colors.blue}=== Community Learnings ===${colors.reset}`);
        
        const learningsPath = path.join(projectRoot, 'community-learnings');
        if (await fs.pathExists(learningsPath)) {
            this.pass('Community learnings directory exists');
            
            const subdirs = ['contributions', 'analysis', 'implementation'];
            for (const dir of subdirs) {
                if (await fs.pathExists(path.join(learningsPath, dir))) {
                    this.pass(`  ${dir}/ exists`);
                } else {
                    this.warn(`  ${dir}/ missing (will be created on use)`);
                }
            }
        } else {
            this.fail('Community learnings directory missing');
        }
    }

    async checkDocumentation() {
        console.log(`\n${colors.blue}=== Documentation ===${colors.reset}`);
        
        const criticalDocs = [
            'README.md',
            'CHANGELOG.md',
            'aaa-documents/folder-structure-guide.md',
            'aaa-documents/github-markdown-style-guide.md',
            'aaa-documents/ai-native-pulse-system-guide.md'
        ];

        for (const doc of criticalDocs) {
            if (await fs.pathExists(path.join(projectRoot, doc))) {
                this.pass(`${path.basename(doc)} exists`);
            } else {
                this.fail(`${path.basename(doc)} missing`);
            }
        }
    }

    pass(message) {
        console.log(`${colors.green}✓${colors.reset} ${message}`);
        this.results.passed++;
    }

    fail(message) {
        console.log(`${colors.red}✗${colors.reset} ${message}`);
        this.results.failed++;
        this.results.errors.push(message);
    }

    warn(message) {
        console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
        this.results.warnings++;
    }

    async displaySummary() {
        console.log(`\n${colors.blue}=== System Health Summary ===${colors.reset}`);
        console.log(`${colors.green}Passed: ${this.results.passed}${colors.reset}`);
        console.log(`${colors.red}Failed: ${this.results.failed}${colors.reset}`);
        console.log(`${colors.yellow}Warnings: ${this.results.warnings}${colors.reset}`);

        if (this.results.failed > 0) {
            console.log(`\n${colors.red}Critical Issues Found:${colors.reset}`);
            this.results.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
            console.log(`\n${colors.red}❌ System health check FAILED${colors.reset}`);
        } else if (this.results.warnings > 0) {
            console.log(`\n${colors.yellow}⚠️  System operational with warnings${colors.reset}`);
        } else {
            console.log(`\n${colors.green}✨ System is healthy and ready!${colors.reset}`);
        }

        // Recommendations
        console.log(`\n${colors.blue}=== Recommendations ===${colors.reset}`);
        if (this.results.failed === 0) {
            console.log('1. Run full workflow test: /start-new-project-workflow');
            console.log('2. Test state persistence: Create checkpoint, restart, continue');
            console.log('3. Monitor dashboard: npm run dashboard');
            console.log('4. Check pulse generation during sprint execution');
        } else {
            console.log('1. Fix critical issues before testing workflows');
            console.log('2. Run: npm install (if packages missing)');
            console.log('3. Check file permissions');
            console.log('4. Review error messages above');
        }
    }
}

// Run validation
const validator = new SystemValidator();
validator.validate().catch(console.error);