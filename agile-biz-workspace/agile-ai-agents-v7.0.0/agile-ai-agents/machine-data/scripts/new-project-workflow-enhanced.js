/**
 * Enhanced New Project Workflow Handler
 * 
 * Integrates error handling, pre-flight checks, and approval timeouts
 * Part of Phase 1: Critical Foundation improvements
 */

const fs = require('fs');
const path = require('path');
const { 
    initializeWorkflow, 
    getCurrentWorkflowState, 
    savePartialState,
    resumeWorkflow,
    getWorkflowStatus,
    approveGate,
    checkApprovalTimeouts,
    notifyApprovalTimeout
} = require('./workflow-state-handler');
const { 
    formatWorkflowProgress, 
    formatDetailedStatus, 
    formatApprovalGate,
    formatDryRun 
} = require('./workflow-progress-formatter');
const WorkflowPreflightChecker = require('../workflow-preflight-checker');
const { 
    executePhaseWithErrorHandling, 
    showRecoveryInstructions,
    createSafePhaseExecutor 
} = require('./workflow-execution-wrapper');

/**
 * Enhanced handler with error handling and pre-flight checks
 */
async function handleNewProjectWorkflow(args = []) {
    // Parse command arguments
    const options = parseArguments(args);
    
    // Handle status command
    if (options.status) {
        // Check for approval timeouts when showing status
        const timeoutCheck = checkApprovalTimeouts();
        if (timeoutCheck && timeoutCheck.timedOut) {
            notifyApprovalTimeout(timeoutCheck.gateName);
        }
        return handleStatus();
    }
    
    // Handle other command modes
    if (options.resume) {
        return handleResume();
    }
    
    if (options.saveState) {
        return handleSaveState(options.note);
    }
    
    if (options.dryRun) {
        return handleDryRun();
    }
    
    // Check for existing workflow
    const existingWorkflow = getCurrentWorkflowState();
    if (existingWorkflow && !existingWorkflow.completed) {
        return {
            message: `⚠️ An active workflow is already in progress.\n\nCurrent phase: ${existingWorkflow.current_phase}\nUse \`--resume\` to continue or \`--status\` to see details.`
        };
    }
    
    // Run pre-flight checks
    console.log('🔍 Running pre-flight checks before starting workflow...\n');
    const preflightChecker = new WorkflowPreflightChecker();
    const preflightResults = await preflightChecker.runChecks('new-project');
    
    if (!preflightResults.summary.canProceed) {
        return {
            message: '❌ Pre-flight checks failed. Please resolve the issues above before proceeding.',
            preflightResults
        };
    }
    
    // Initialize new workflow
    const workflow = initializeWorkflow('new-project', {
        parallel: options.parallel || false,
        dryRun: false
    });
    
    console.log('🚀 Starting New Project Workflow\n');
    console.log(formatWorkflowProgress());
    
    // Start first phase with error handling
    try {
        const discoveryPhase = createSafePhaseExecutor(
            'Stakeholder Discovery',
            'Project Analyzer Agent',
            startDiscoveryPhase
        );
        
        await executePhaseWithErrorHandling(discoveryPhase);
    } catch (error) {
        showRecoveryInstructions(error);
        return {
            message: '❌ Workflow failed to start. See recovery instructions above.',
            error: error.message
        };
    }
    
    return {
        message: 'New project workflow initialized. Starting stakeholder discovery interview...',
        workflow_id: workflow.workflow_id
    };
}

/**
 * Enhanced status handler with timeout checking
 */
function handleStatus() {
    const status = getWorkflowStatus();
    
    if (!status.active) {
        return {
            message: 'No active workflow. Use `/start-new-project-workflow` to begin.'
        };
    }
    
    // Check for approval timeouts
    const timeoutCheck = checkApprovalTimeouts();
    
    console.log(formatDetailedStatus());
    
    if (timeoutCheck) {
        console.log('\n' + '─'.repeat(50));
        console.log(timeoutCheck.message);
        if (timeoutCheck.timedOut) {
            console.log('⚠️  Action required to proceed!');
        }
        console.log('─'.repeat(50) + '\n');
    }
    
    return {
        message: 'Workflow status displayed above.',
        status: status,
        timeoutStatus: timeoutCheck
    };
}

/**
 * Enhanced resume handler with error recovery
 */
async function handleResume() {
    const result = resumeWorkflow();
    
    if (!result.success) {
        return {
            message: result.message
        };
    }
    
    console.log(result.message);
    console.log('\n' + formatWorkflowProgress());
    
    // Check for approval timeouts before resuming
    const timeoutCheck = checkApprovalTimeouts();
    if (timeoutCheck && timeoutCheck.timedOut) {
        notifyApprovalTimeout(timeoutCheck.gateName);
        return {
            message: `⚠️ Cannot resume - approval gate "${timeoutCheck.gateName}" has timed out. Please take action.`,
            timeoutStatus: timeoutCheck
        };
    }
    
    // Resume appropriate phase with error handling
    const workflow = result.workflow;
    try {
        await resumePhaseWithErrorHandling(workflow.current_phase);
    } catch (error) {
        showRecoveryInstructions(error);
        return {
            message: `❌ Failed to resume workflow at phase: ${workflow.current_phase}`,
            error: error.message
        };
    }
    
    return {
        message: `Resumed workflow at phase: ${workflow.current_phase}`,
        workflow: workflow
    };
}

/**
 * Resume phase with error handling
 */
async function resumePhaseWithErrorHandling(phase) {
    const phaseFunctions = {
        discovery: { name: 'Stakeholder Discovery', agent: 'Project Analyzer Agent', fn: startDiscoveryPhase },
        research: { name: 'Research Execution', agent: 'Research Agent', fn: startResearchPhase },
        analysis: { name: 'Research Analysis', agent: 'Analysis Agent', fn: startAnalysisPhase },
        requirements: { name: 'Requirements Document', agent: 'PRD Agent', fn: startRequirementsPhase },
        planning: { name: 'Strategic Planning', agent: 'Project Manager Agent', fn: startPlanningPhase },
        backlog: { name: 'Backlog Creation', agent: 'Scrum Master Agent', fn: startBacklogPhase },
        scaffold: { name: 'Project Scaffolding', agent: 'Project Structure Agent', fn: startScaffoldPhase },
        sprint: { name: 'Sprint Implementation', agent: 'Multiple Agents', fn: startSprintPhase }
    };
    
    const phaseConfig = phaseFunctions[phase];
    if (phaseConfig) {
        const safeExecutor = createSafePhaseExecutor(
            phaseConfig.name,
            phaseConfig.agent,
            phaseConfig.fn
        );
        
        await executePhaseWithErrorHandling(safeExecutor);
    } else {
        console.log(`Unknown phase: ${phase}`);
    }
}

/**
 * Parse command arguments
 */
function parseArguments(args) {
    const options = {
        status: false,
        resume: false,
        saveState: false,
        dryRun: false,
        parallel: false,
        note: null
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--status':
                options.status = true;
                break;
            case '--resume':
                options.resume = true;
                break;
            case '--save-state':
                options.saveState = true;
                if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                    options.note = args[++i];
                }
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--parallel':
                options.parallel = true;
                break;
        }
    }
    
    return options;
}

/**
 * Handle --save-state flag
 */
function handleSaveState(note) {
    const result = savePartialState(note);
    
    if (!result) {
        return {
            message: '❌ No active workflow to save.'
        };
    }
    
    return {
        message: result.message,
        checkpoint: result.checkpoint_file
    };
}

/**
 * Handle --dry-run flag
 */
function handleDryRun() {
    console.log(formatDryRun('new-project'));
    
    return {
        message: 'Dry run preview displayed above. No actions were taken.'
    };
}

/**
 * Start discovery phase
 */
async function startDiscoveryPhase() {
    console.log('\n## Phase 1: Stakeholder Discovery Interview\n');
    console.log('I\'ll guide you through a structured interview to understand your project vision.\n');
    
    // CRITICAL: Start with Section 0 - Context Verification
    console.log('**Section 0: What Are We Building? (CRITICAL)**\n');
    console.log('Before we dive into details, let\'s establish exactly what this project is about.\n');
    console.log('1. In one sentence, what is this product?');
    console.log('2. What industry or domain is this in?');
    console.log('3. Who are the target users? (Be very specific)');
    console.log('4. What is this product NOT? (List 3-5 things it\'s not)');
    console.log('5. What are 3 competitor products?\n');
    
    console.log('💡 This critical information will be used to create your Project Truth document');
    console.log('   and prevent context drift throughout development.\n');
    
    // Then continue with regular sections
    console.log('After Section 0, we\'ll continue with:');
    console.log('- Section 1: Project Vision & Purpose');
    console.log('- Section 2: Technical Preferences');
    console.log('- Section 2.5: Project Structure');
    console.log('- Section 3: Business Context\n');
    
    // Update phase progress
    const { updatePhaseProgress } = require('./workflow-state-handler');
    updatePhaseProgress({
        active_agents: [{ name: 'Project Analyzer Agent', status: 'Conducting interview - Section 0', icon: '🎯' }],
        documents_total: 2, // Now includes project truth document
        documents_created: 0
    });
}

/**
 * Placeholder functions for other phases
 */
async function startResearchPhase() {
    console.log('\n## Phase 2: Research Execution\n');
    console.log('Executing research based on selected depth...\n');
}

async function startAnalysisPhase() {
    console.log('\n## Phase 3: Research Analysis & Synthesis\n');
    console.log('Analyzing research findings...\n');
}

async function startRequirementsPhase() {
    console.log('\n## Phase 4: Product Requirements Document\n');
    console.log('Creating comprehensive PRD...\n');
}

async function startPlanningPhase() {
    console.log('\n## Phase 5: Strategic Planning\n');
    console.log('Creating project roadmap and architecture...\n');
}

async function startBacklogPhase() {
    console.log('\n## Phase 6: Product Backlog Creation\n');
    console.log('Transforming requirements into backlog items...\n');
}

async function startScaffoldPhase() {
    console.log('\n## Phase 7: Project Scaffolding\n');
    console.log('Setting up project structure...\n');
}

async function startSprintPhase() {
    console.log('\n## Phase 8: Sprint-Based Implementation\n');
    console.log('Beginning sprint process...\n');
}

module.exports = {
    handleNewProjectWorkflow
};