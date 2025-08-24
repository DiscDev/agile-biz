/**
 * Existing Project Workflow Handler
 * 
 * Handles the enhanced /start-existing-project-workflow command with sequential phases
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
    updatePhaseProgress
} = require('./workflow-state-handler');
const ImprovementSelectionHandler = require('./improvement-selection-handler');
const { 
    formatWorkflowProgress, 
    formatDetailedStatus, 
    formatApprovalGate,
    formatDryRun 
} = require('./workflow-progress-formatter');

/**
 * Handle existing project workflow command
 */
async function handleExistingProjectWorkflow(args = []) {
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
    
    if (options.reprioritize) {
        const selectionHandler = new ImprovementSelectionHandler();
        return selectionHandler.handleReprioritization();
    }
    
    if (options.showDeferred) {
        const selectionHandler = new ImprovementSelectionHandler();
        return selectionHandler.showDeferredImprovements();
    }
    
    // Check for existing workflow
    const existingWorkflow = getCurrentWorkflowState();
    if (existingWorkflow && !existingWorkflow.completed) {
        return {
            message: `⚠️ An active workflow is already in progress.\\n\\nCurrent phase: ${existingWorkflow.current_phase}\\nUse \`--resume\` to continue or \`--status\` to see details.`
        };
    }
    
    // Initialize new workflow
    const workflow = initializeWorkflow('existing-project', {
        parallel: options.parallel || false,
        dryRun: false
    });
    
    console.log('🚀 Starting Existing Project Workflow\\n');
    console.log(formatWorkflowProgress());
    
    // Start first phase (analyze)
    await startAnalyzePhase();
    
    return {
        message: 'Existing project workflow initialized. Starting code analysis...',
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
            message: 'No active workflow. Use `/start-existing-project-workflow` to begin.'
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
    console.log('\\n' + formatWorkflowProgress());
    
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
    console.log(formatDryRun('existing-project'));
    
    return {
        message: 'Dry run preview displayed above. No actions were taken.'
    };
}

/**
 * Start analyze phase
 */
async function startAnalyzePhase() {
    console.log('\\n## Phase 1: Code Analysis & Assessment\\n');
    console.log('I\\'ll analyze your codebase to understand the current architecture and identify opportunities.\\n');
    
    // Update phase progress
    updatePhaseProgress({
        active_agents: [
            { name: 'Code Analyzer Agent', status: 'Analyzing code structure', icon: '🔍' },
            { name: 'Security Agent', status: 'Scanning for vulnerabilities', icon: '🔒' },
            { name: 'Performance Agent', status: 'Analyzing performance metrics', icon: '⚡' }
        ],
        documents_total: 10,
        documents_created: 0,
        documents: [
            { name: 'code-structure-analysis.md', completed: false, progress: 0 },
            { name: 'technology-stack-analysis.md', completed: false, progress: 0 },
            { name: 'security-assessment.md', completed: false, progress: 0 },
            { name: 'performance-analysis.md', completed: false, progress: 0 },
            { name: 'test-coverage-report.md', completed: false, progress: 0 },
            { name: 'dependency-analysis.md', completed: false, progress: 0 },
            { name: 'code-quality-metrics.md', completed: false, progress: 0 },
            { name: 'api-documentation.md', completed: false, progress: 0 },
            { name: 'database-schema-analysis.md', completed: false, progress: 0 },
            { name: 'enhancement-opportunities.md', completed: false, progress: 0 }
        ]
    });
    
    console.log('🔍 Analyzing project structure...');
    
    // Simulate parallel analysis if enabled
    const state = getCurrentWorkflowState();
    if (state.parallel_mode) {
        console.log('\\n⚡ Parallel mode enabled - running multiple analyses simultaneously');
    }
    
    // This would integrate with actual code analysis logic
    console.log('\\nDetecting technology stack...');
    console.log('Analyzing code quality metrics...');
    console.log('Scanning for security vulnerabilities...');
}

/**
 * Resume a specific phase
 */
async function resumePhase(phase) {
    const phaseFunctions = {
        analyze: startAnalyzePhase,
        discovery: startDiscoveryPhase,
        assessment: startAssessmentPhase,
        'improvement-selection': startImprovementSelectionPhase,
        planning: startPlanningPhase,
        backlog: startBacklogPhase,
        implementation: startImplementationPhase
    };
    
    const phaseFunction = phaseFunctions[phase];
    if (phaseFunction) {
        await phaseFunction();
    } else {
        console.error(`Unknown phase: ${phase}`);
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
        reprioritize: false,
        showDeferred: false,
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
            case '--reprioritize':
                options.reprioritize = true;
                break;
            case '--show-deferred':
                options.showDeferred = true;
                break;
        }
    });
    
    return options;
}

// Phase implementation functions

async function startDiscoveryPhase() {
    console.log('\\n## Phase 2: Stakeholder Interview\\n');
    console.log('Now I\\'ll gather information about your enhancement goals based on the analysis findings.\\n');
    
    // CRITICAL: Start with Section 0 - Context Verification
    console.log('**Section 0: Verify What We\\'re Working On (CRITICAL)**\\n');
    console.log('Based on my analysis, I need to verify what this project actually is.\\n');
    
    console.log('1. Based on my analysis, this appears to be [initial assessment]. In one sentence, what is this product?');
    console.log('2. What industry or domain does this serve?');
    console.log('3. Who are your current users? (Be specific)');
    console.log('4. What is this product NOT? (What might people mistakenly think it is?)');
    console.log('5. Who are your main competitors?\\n');
    
    console.log('💡 This verification prevents us from building features that don\\'t align with your product\\'s purpose.\\n');
    
    // Show analysis findings
    console.log('Based on my analysis, I found:');
    console.log('- Technology Stack: [detected stack]');
    console.log('- Test Coverage: [coverage %]');
    console.log('- Code Quality Score: [score]\\n');
    
    console.log('After Section 0, we\\'ll continue with:');
    console.log('- Section 1: Current State Validation');
    console.log('- Section 2: Technical Landscape');
    console.log('- Section 2.5: Project Structure Evaluation');
    console.log('- Section 3: Improvement Goals\\n');
    
    updatePhaseProgress({
        active_agents: [
            { name: 'Project Analyzer Agent', status: 'Conducting contextual interview - Section 0', icon: '🎯' }
        ],
        documents_total: 2, // Now includes project truth document
        documents_created: 0
    });
}

async function startAssessmentPhase() {
    console.log('\\n## Phase 3: Gap Analysis & Opportunities\\n');
    console.log('Identifying gaps between current state and desired enhancements...');
    
    updatePhaseProgress({
        active_agents: [
            { name: 'Analysis Agent', status: 'Performing gap analysis', icon: '📊' },
            { name: 'Technical Architect', status: 'Identifying opportunities', icon: '🏗️' }
        ],
        documents_total: 3,
        documents_created: 0
    });
}

async function startImprovementSelectionPhase() {
    console.log('\\n## Phase 4: Improvement Selection & Prioritization\\n');
    console.log('Interactive selection of improvements to implement...');
    
    updatePhaseProgress({
        active_agents: [
            { name: 'Analysis Agent', status: 'Preparing improvement recommendations', icon: '📊' },
            { name: 'Project Manager Agent', status: 'Facilitating selection process', icon: '📋' }
        ],
        documents_total: 2,
        documents_created: 0
    });
    
    // Simulate analysis results for now
    // In production, this would come from the actual analysis phase
    const analysisResults = {
        security: {
            sqlInjection: [],
            xss: [],
            authIssues: []
        },
        performance: {
            slowQueries: [],
            missingIndexes: [],
            nPlusOne: []
        },
        codeQuality: {
            highComplexity: [],
            duplication: { percentage: 10 }
        },
        testCoverage: {
            coverage: 45,
            missingIntegrationTests: true
        },
        dependencies: {
            outdated: [],
            deprecated: []
        }
    };
    
    const selectionHandler = new ImprovementSelectionHandler();
    const result = await selectionHandler.handleImprovementSelection(analysisResults);
    
    if (result.success) {
        console.log('\\n✅ Improvement selection completed successfully.');
        console.log(`Selected ${result.selected.length} improvements for implementation.`);
        console.log(`Deferred ${result.deferred.length} improvements for future consideration.`);
    }
    
    return result;
}

async function startPlanningPhase() {
    console.log('\\n## Phase 4: Enhancement Planning\\n');
    console.log('Creating detailed enhancement roadmap and technical approach...');
    
    updatePhaseProgress({
        active_agents: [
            { name: 'Project Manager Agent', status: 'Creating roadmap', icon: '📋' },
            { name: 'PRD Agent', status: 'Documenting requirements', icon: '📝' }
        ],
        documents_total: 5,
        documents_created: 0
    });
}

async function startBacklogPhase() {
    console.log('\\n## Phase 5: Enhancement Backlog\\n');
    console.log('Creating prioritized backlog of enhancement items...');
    
    updatePhaseProgress({
        active_agents: [
            { name: 'Project Manager Agent', status: 'Creating backlog items', icon: '📋' },
            { name: 'Scrum Master Agent', status: 'Estimating effort', icon: '🎯' }
        ],
        documents_total: 2,
        documents_created: 0
    });
}

async function startImplementationPhase() {
    console.log('\\n## Phase 6: Implementation\\n');
    console.log('Starting enhancement implementation with backward compatibility focus...');
    
    updatePhaseProgress({
        active_agents: [
            { name: 'Coder Agent', status: 'Implementing enhancements', icon: '💻' },
            { name: 'Testing Agent', status: 'Writing tests', icon: '🧪' },
            { name: 'DevOps Agent', status: 'Updating deployment', icon: '🚀' }
        ],
        documents_total: 0,
        documents_created: 0
    });
}

// Export for command-line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    handleExistingProjectWorkflow(args).then(result => {
        if (result.message) {
            console.log('\\n' + result.message);
        }
    }).catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    handleExistingProjectWorkflow
};