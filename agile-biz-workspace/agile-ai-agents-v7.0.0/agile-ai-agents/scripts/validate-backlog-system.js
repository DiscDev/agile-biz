#!/usr/bin/env node

/**
 * Validation Script for Sprint System Enhancement with Product Backlog
 * 
 * This script validates:
 * 1. Sprint folder structure compliance
 * 2. Product backlog structure and files
 * 3. Agent integration with backlog system
 * 4. Workflow updates
 * 5. Dashboard backlog metrics
 */

const fs = require('fs-extra');
const path = require('path');

// Color codes for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

const projectRoot = path.join(__dirname, '..');
const projectDocsPath = path.join(projectRoot, 'project-documents');
const orchestrationPath = path.join(projectDocsPath, 'orchestration');

let validationResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
};

// Validation functions
async function validateSprintFolderStructure() {
    console.log(`\n${colors.blue}=== Validating Sprint Folder Structure ===${colors.reset}`);
    
    const sprintsPath = path.join(orchestrationPath, 'sprints');
    
    // Check if sprints folder exists
    if (!await fs.pathExists(sprintsPath)) {
        logError('Sprint folder does not exist: ' + sprintsPath);
        return;
    }
    
    logSuccess('Sprint folder exists');
    
    // Check if old sprint folders have been moved
    const oldFolders = ['sprint-retrospectives', 'sprint-reviews'];
    for (const folder of oldFolders) {
        const oldPath = path.join(orchestrationPath, folder);
        if (await fs.pathExists(oldPath)) {
            logWarning(`Old folder still exists: ${folder} (should be moved to example sprint)`);
        } else {
            logSuccess(`Old folder properly removed: ${folder}`);
        }
    }
    
    // Validate sprint folder structure
    const exampleSprintPath = path.join(sprintsPath, 'sprint-2025-01-09-example-structure');
    if (await fs.pathExists(exampleSprintPath)) {
        logSuccess('Example sprint folder exists');
        
        // Check required subfolders
        const requiredSubfolders = [
            'planning', 'reviews', 'retrospectives', 
            'testing', 'documents', 'daily-updates'
        ];
        
        for (const subfolder of requiredSubfolders) {
            const subfolderPath = path.join(exampleSprintPath, subfolder);
            if (await fs.pathExists(subfolderPath)) {
                logSuccess(`  ✓ ${subfolder}/ exists`);
            } else {
                logError(`  ✗ Missing subfolder: ${subfolder}/`);
            }
        }
    }
}

async function validateProductBacklog() {
    console.log(`\n${colors.blue}=== Validating Product Backlog ===${colors.reset}`);
    
    const backlogPath = path.join(orchestrationPath, 'product-backlog');
    
    // Check if backlog folder exists
    if (!await fs.pathExists(backlogPath)) {
        logError('Product backlog folder does not exist: ' + backlogPath);
        return;
    }
    
    logSuccess('Product backlog folder exists');
    
    // Check required files
    const requiredFiles = [
        'README.md',
        'backlog-state.json',
        'velocity-metrics.json',
        'estimation-guidelines.md',
        'dependency-map.md',
        'backlog-refinement-log.md'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(backlogPath, file);
        if (await fs.pathExists(filePath)) {
            logSuccess(`  ✓ ${file} exists`);
            
            // Validate JSON files
            if (file.endsWith('.json')) {
                try {
                    await fs.readJSON(filePath);
                    logSuccess(`    JSON is valid`);
                } catch (error) {
                    logError(`    JSON is invalid: ${error.message}`);
                }
            }
        } else {
            logError(`  ✗ Missing file: ${file}`);
        }
    }
    
    // Check backlog items structure
    const backlogItemsPath = path.join(backlogPath, 'backlog-items');
    if (await fs.pathExists(backlogItemsPath)) {
        logSuccess('Backlog items folder exists');
        
        // Check epic folders
        const epicFolders = ['epic-core-features', 'epic-user-experience', 'epic-technical-debt', 'unassigned'];
        for (const epic of epicFolders) {
            const epicPath = path.join(backlogItemsPath, epic);
            if (await fs.pathExists(epicPath)) {
                const items = await fs.readdir(epicPath);
                const mdItems = items.filter(item => item.endsWith('.md') && !item.startsWith('TEMPLATE'));
                logSuccess(`  ✓ ${epic}/ has ${mdItems.length} items`);
            } else {
                logWarning(`  ⚠ Epic folder missing: ${epic}/`);
            }
        }
    }
}

async function validateAgentUpdates() {
    console.log(`\n${colors.blue}=== Validating Agent Updates ===${colors.reset}`);
    
    const agentsPath = path.join(projectRoot, 'ai-agents');
    
    // Check Project Manager Agent for backlog section
    const pmAgentPath = path.join(agentsPath, 'project_manager_agent.md');
    if (await fs.pathExists(pmAgentPath)) {
        const content = await fs.readFile(pmAgentPath, 'utf8');
        if (content.includes('### Product Backlog Management')) {
            logSuccess('Project Manager Agent has Product Backlog Management section');
        } else {
            logError('Project Manager Agent missing Product Backlog Management section');
        }
    }
    
    // Check Scrum Master Agent for backlog refinement
    const smAgentPath = path.join(agentsPath, 'scrum_master_agent.md');
    if (await fs.pathExists(smAgentPath)) {
        const content = await fs.readFile(smAgentPath, 'utf8');
        if (content.includes('### Product Backlog Refinement')) {
            logSuccess('Scrum Master Agent has Product Backlog Refinement section');
        } else {
            logError('Scrum Master Agent missing Product Backlog Refinement section');
        }
    }
}

async function validateWorkflowUpdates() {
    console.log(`\n${colors.blue}=== Validating Workflow Updates ===${colors.reset}`);
    
    const workflowPath = path.join(projectRoot, 'aaa-documents', 'workflow-templates');
    
    // Check new project workflow
    const newProjectPath = path.join(workflowPath, 'new-project-workflow-template.md');
    if (await fs.pathExists(newProjectPath)) {
        const content = await fs.readFile(newProjectPath, 'utf8');
        if (content.includes('### Phase 7: Product Backlog Creation')) {
            logSuccess('New project workflow includes Product Backlog Creation phase');
        } else {
            logError('New project workflow missing Product Backlog Creation phase');
        }
    }
    
    // Check existing project workflow
    const existingProjectPath = path.join(workflowPath, 'existing-project-workflow-template.md');
    if (await fs.pathExists(existingProjectPath)) {
        const content = await fs.readFile(existingProjectPath, 'utf8');
        if (content.includes('### Phase 7: Enhancement Backlog Creation')) {
            logSuccess('Existing project workflow includes Enhancement Backlog Creation phase');
        } else {
            logError('Existing project workflow missing Enhancement Backlog Creation phase');
        }
    }
}

async function validateDashboardIntegration() {
    console.log(`\n${colors.blue}=== Validating Dashboard Integration ===${colors.reset}`);
    
    const dashboardPath = path.join(projectRoot, 'project-dashboard');
    
    // Check HTML for backlog metrics
    const htmlPath = path.join(dashboardPath, 'public', 'index.html');
    if (await fs.pathExists(htmlPath)) {
        const content = await fs.readFile(htmlPath, 'utf8');
        if (content.includes('Product Backlog Metrics')) {
            logSuccess('Dashboard HTML includes Product Backlog Metrics section');
        } else {
            logError('Dashboard HTML missing Product Backlog Metrics section');
        }
    }
    
    // Check JavaScript for backlog handling
    const jsPath = path.join(dashboardPath, 'public', 'dashboard.js');
    if (await fs.pathExists(jsPath)) {
        const content = await fs.readFile(jsPath, 'utf8');
        if (content.includes('updateBacklogMetrics')) {
            logSuccess('Dashboard JS includes updateBacklogMetrics function');
        } else {
            logError('Dashboard JS missing updateBacklogMetrics function');
        }
    }
    
    // Check server for backlog data handling
    const serverPath = path.join(dashboardPath, 'server.js');
    if (await fs.pathExists(serverPath)) {
        const content = await fs.readFile(serverPath, 'utf8');
        if (content.includes('loadBacklogMetrics')) {
            logSuccess('Server includes loadBacklogMetrics function');
        } else {
            logError('Server missing loadBacklogMetrics function');
        }
    }
}

// Utility functions
function logSuccess(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
    validationResults.passed++;
}

function logError(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    validationResults.failed++;
    validationResults.errors.push(message);
}

function logWarning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
    validationResults.warnings++;
}

// Main validation runner
async function runValidation() {
    console.log(`${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║     Sprint System Enhancement Validation Suite     ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}`);
    
    try {
        await validateSprintFolderStructure();
        await validateProductBacklog();
        await validateAgentUpdates();
        await validateWorkflowUpdates();
        await validateDashboardIntegration();
        
        // Summary
        console.log(`\n${colors.blue}=== Validation Summary ===${colors.reset}`);
        console.log(`${colors.green}Passed: ${validationResults.passed}${colors.reset}`);
        console.log(`${colors.red}Failed: ${validationResults.failed}${colors.reset}`);
        console.log(`${colors.yellow}Warnings: ${validationResults.warnings}${colors.reset}`);
        
        if (validationResults.failed > 0) {
            console.log(`\n${colors.red}Validation FAILED with ${validationResults.failed} errors:${colors.reset}`);
            validationResults.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
            process.exit(1);
        } else if (validationResults.warnings > 0) {
            console.log(`\n${colors.yellow}Validation PASSED with ${validationResults.warnings} warnings${colors.reset}`);
        } else {
            console.log(`\n${colors.green}✨ All validations PASSED! ✨${colors.reset}`);
        }
        
        console.log(`\n${colors.blue}Sprint System Enhancement with Product Backlog is ready for use!${colors.reset}`);
        
    } catch (error) {
        console.error(`\n${colors.red}Validation error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Run validation
runValidation();