/**
 * New Project Workflow Handler
 * 
 * Handles the enhanced /start-new-project-workflow command with sequential phases
 */

const fs = require('fs');
const path = require('path');
const { 
    initializeWorkflow, 
    getCurrentWorkflowState, 
    savePartialState,
    resumeWorkflow,
    getWorkflowStatus,
    approveGate 
} = require('./workflow-state-handler');
const { 
    formatWorkflowProgress, 
    formatDetailedStatus, 
    formatApprovalGate,
    formatDryRun 
} = require('./workflow-progress-formatter');

/**
 * Handle new project workflow command
 */
async function handleNewProjectWorkflow(args = []) {
    // Parse command arguments
    const options = parseArguments(args);
    
    // Handle different command modes
    if (options.status) {
        return handleStatus();
    }
    
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
    
    // Initialize new workflow
    const workflow = initializeWorkflow('new-project', {
        parallel: options.parallel || false,
        dryRun: false
    });
    
    console.log('🚀 Starting New Project Workflow\n');
    
    // Add a small delay to ensure state is written
    try {
        const progress = formatWorkflowProgress();
        console.log(progress);
    } catch (error) {
        console.error('Error formatting progress:', error.message);
        // Continue anyway - the workflow was initialized
    }
    
    // Start first phase (discovery)
    await startDiscoveryPhase();
    
    return {
        message: 'New project workflow initialized. Starting stakeholder discovery interview...',
        workflow_id: workflow.workflow_id
    };
}

/**
 * Handle --status flag
 */
function handleStatus() {
    const status = getWorkflowStatus();
    
    if (!status.active) {
        return {
            message: 'No active workflow. Use `/start-new-project-workflow` to begin.'
        };
    }
    
    console.log(formatDetailedStatus());
    
    return {
        message: 'Workflow status displayed above.',
        status: status
    };
}

/**
 * Handle --resume flag
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
    
    // Resume appropriate phase
    const workflow = result.workflow;
    await resumePhase(workflow.current_phase);
    
    return {
        message: `Resumed workflow at phase: ${workflow.current_phase}`,
        workflow: workflow
    };
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
    console.log("I'll guide you through a structured interview to understand your project vision.\n");
    
    // CRITICAL: Start with Section 0 - Context Verification
    console.log('**Section 0: What Are We Building? (CRITICAL)**\n');
    console.log("Before we dive into details, let's establish exactly what this project is about.\n");
    console.log('1. In one sentence, what is this product?');
    console.log('2. What industry or domain is this in?');
    console.log('3. Who are the target users? (Be very specific)');
    console.log("4. What is this product NOT? (List 3-5 things it's not)");
    console.log('5. What are 3 competitor products?\n');
    
    console.log('💡 This critical information will be used to create your Project Truth document');
    console.log('   and prevent context drift throughout development.\n');
    
    // Then continue with regular sections
    console.log("After Section 0, we'll continue with:");
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
 * Resume a specific phase
 */
async function resumePhase(phase) {
    const phaseFunctions = {
        discovery: startDiscoveryPhase,
        research: startResearchPhase,
        analysis: startAnalysisPhase,
        requirements: startRequirementsPhase,
        planning: startPlanningPhase,
        backlog: startBacklogPhase,
        scaffold: startScaffoldPhase,
        sprint: startSprintPhase
    };
    
    const phaseFunction = phaseFunctions[phase];
    if (phaseFunction) {
        await phaseFunction();
    } else {
        console.error(`Unknown phase: ${phase}`);
    }
}

/**
 * Handle approval gate
 */
async function handleApprovalGate(gateName) {
    console.log('\n' + formatApprovalGate(gateName));
    
    // This would wait for user approval
    // For now, we'll simulate the approval interface
    console.log('\n💡 To approve and continue, use: `approve-gate ' + gateName + '`');
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
    
    args.forEach((arg, index) => {
        switch (arg) {
            case '--status':
                options.status = true;
                break;
            case '--resume':
                options.resume = true;
                break;
            case '--save-state':
                options.saveState = true;
                // Check for optional note
                if (args[index + 1] && !args[index + 1].startsWith('--')) {
                    options.note = args[index + 1];
                }
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--parallel':
                options.parallel = true;
                break;
        }
    });
    
    return options;
}

// Placeholder phase functions (would contain actual implementation)

async function startResearchPhase() {
    console.log('\n## Phase 2: Market Research & Analysis\n');
    console.log('Starting comprehensive market research with multiple agents working in parallel...');
    
    const { updatePhaseProgress } = require('./workflow-state-handler');
    updatePhaseProgress({
        active_agents: [
            { name: 'Research Agent', status: 'Analyzing market trends', icon: '🔍' },
            { name: 'Finance Agent', status: 'Calculating financial projections', icon: '💰' },
            { name: 'Market Analyst', status: 'Competitor analysis', icon: '📊' }
        ],
        documents_total: 14,
        documents_created: 0
    });
}

async function startAnalysisPhase() {
    console.log('\n## Phase 3: Analysis & Synthesis\n');
    console.log('Synthesizing research findings and generating strategic recommendations...');
}

async function startRequirementsPhase() {
    console.log('\n## Phase 4: Requirements & Specifications\n');
    console.log('Creating PRD and technical specifications based on research and analysis...');
}

async function startPlanningPhase() {
    console.log('\n## Phase 5: Project Planning & Architecture\n');
    console.log('Developing project roadmap and system architecture...');
}

async function startBacklogPhase() {
    console.log('\n## Phase 6: Product Backlog Creation\n');
    console.log('Creating epics, user stories, and initial estimations...');
}

async function startScaffoldPhase() {
    console.log('\n## Phase 7: Project Scaffolding\n');
    console.log('Setting up project structure and development environment...');
}

async function startSprintPhase() {
    console.log('\n## Phase 8: Sprint Implementation\n');
    console.log('Starting first sprint with prioritized backlog items...\n');
    
    // Context verification before sprint starts
    console.log('🎯 Pre-Sprint Context Verification');
    console.log('Running context alignment check on selected sprint items...\n');
    console.log('This ensures all sprint tasks align with your Project Truth document.\n');
    
    // Update phase progress
    const { updatePhaseProgress } = require('./workflow-state-handler');
    updatePhaseProgress({
        active_agents: [
            { name: 'Context Verification Engine', status: 'Verifying sprint alignment', icon: '🎯' },
            { name: 'Scrum Master Agent', status: 'Preparing sprint', icon: '🏃' }
        ],
        documents_total: 0,
        documents_created: 0
    });
    
    console.log('💡 If any items fail context verification, they will be:');
    console.log('   - Flagged for review with the Project Manager');
    console.log('   - Blocked from sprint inclusion until resolved');
    console.log('   - Documented for learning and improvement\n');
}

// Export for command-line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    handleNewProjectWorkflow(args).then(result => {
        if (result.message) {
            console.log('\n' + result.message);
        }
    }).catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    handleNewProjectWorkflow
};