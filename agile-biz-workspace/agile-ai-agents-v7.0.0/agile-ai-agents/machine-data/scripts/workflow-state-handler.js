/**
 * Workflow State Handler
 * 
 * Manages state for sequential workflow phases with progress tracking
 */

const fs = require('fs');
const path = require('path');
const { handleWorkflowError, createWorkflowError, ERROR_TYPES } = require('./workflow-error-handler');

// State file paths
const WORKFLOW_STATE_DIR = path.join(__dirname, '../../project-state/workflow-states');
const CURRENT_WORKFLOW_FILE = path.join(WORKFLOW_STATE_DIR, 'current-workflow.json');
const CHECKPOINTS_DIR = path.join(WORKFLOW_STATE_DIR, 'checkpoints');
const HISTORY_DIR = path.join(WORKFLOW_STATE_DIR, 'history');

// Ensure directories exist
[WORKFLOW_STATE_DIR, CHECKPOINTS_DIR, HISTORY_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Workflow phase definitions
const WORKFLOW_PHASES = {
    'new-project': {
        phases: ['discovery', 'research', 'analysis', 'requirements', 'planning', 'backlog', 'scaffold', 'sprint'],
        approvalGates: {
            'post-research': { after: 'research', before: 'analysis' },
            'post-requirements': { after: 'requirements', before: 'planning' },
            'pre-implementation': { after: 'scaffold', before: 'sprint' }
        },
        phaseDurations: {
            discovery: '2-3 hours',
            research: '4-6 hours',
            analysis: '2-3 hours',
            requirements: '3-4 hours',
            planning: '2-3 hours',
            backlog: '2-3 hours',
            scaffold: '1-2 hours',
            sprint: 'Ongoing'
        }
    },
    'existing-project': {
        phases: ['analyze', 'discovery', 'assessment', 'improvement-selection', 'planning', 'backlog', 'implementation'],
        approvalGates: {
            'post-analysis': { after: 'analyze', before: 'discovery' },
            'post-assessment': { after: 'assessment', before: 'improvement-selection' },
            'post-selection': { after: 'improvement-selection', before: 'planning' },
            'pre-implementation': { after: 'backlog', before: 'implementation' }
        },
        phaseDurations: {
            analyze: '2-4 hours',
            discovery: '2-3 hours',
            assessment: '1-2 hours',
            'improvement-selection': '30-60 minutes',
            planning: '3-4 hours',
            backlog: '2-3 hours',
            implementation: 'Ongoing'
        }
    }
};

/**
 * Initialize workflow state
 */
function initializeWorkflow(workflowType, options = {}) {
    const workflowId = `workflow-${new Date().toISOString().split('T')[0]}-${Date.now()}`;
    const workflowDef = WORKFLOW_PHASES[workflowType];
    
    // Check if workflow type is valid
    if (!workflowDef) {
        throw createWorkflowError(
            ERROR_TYPES.INVALID_WORKFLOW,
            `Unknown workflow type: ${workflowType}. Valid types are: ${Object.keys(WORKFLOW_PHASES).join(', ')}`
        );
    }
    
    const initialState = {
        workflow_id: workflowId,
        workflow_type: workflowType,
        started_at: new Date().toISOString(),
        current_phase: workflowDef.phases[0],
        phase_index: 0,
        phase_details: {
            name: getPhaseDisplayName(workflowType, workflowDef.phases[0]),
            progress_percentage: 0,
            active_agents: [],
            documents_created: 0,
            documents_total: 0,
            estimated_time_remaining: workflowDef.phaseDurations[workflowDef.phases[0]],
            started_at: new Date().toISOString()
        },
        phases_completed: [],
        approval_gates: initializeApprovalGates(workflowDef.approvalGates),
        checkpoints: {
            last_save: new Date().toISOString(),
            phase_checkpoints: {}
        },
        can_resume: true,
        parallel_mode: options.parallel || false,
        dry_run: options.dryRun || false
    };
    
    saveWorkflowState(initialState);
    return initialState;
}

/**
 * Get current workflow state
 */
function getCurrentWorkflowState() {
    try {
        if (!fs.existsSync(CURRENT_WORKFLOW_FILE)) {
            return null;
        }
        
        const stateContent = fs.readFileSync(CURRENT_WORKFLOW_FILE, 'utf-8');
        const state = JSON.parse(stateContent);
        
        // Validate state integrity
        const { validateWorkflowState } = require('./workflow-error-handler');
        const errors = validateWorkflowState(state);
        
        if (errors.length > 0) {
            const error = createWorkflowError(
                ERROR_TYPES.STATE_CORRUPTION,
                'Workflow state validation failed',
                { validation_errors: errors }
            );
            
            // Attempt recovery
            handleWorkflowError(error, state);
            
            // Try to load recovered state
            return JSON.parse(fs.readFileSync(CURRENT_WORKFLOW_FILE, 'utf-8'));
        }
        
        return state;
    } catch (error) {
        const workflowError = createWorkflowError(
            ERROR_TYPES.FILE_ACCESS,
            `Failed to read workflow state: ${error.message}`,
            { original_error: error.message, retryable: true }
        );
        
        handleWorkflowError(workflowError);
        return null;
    }
}

/**
 * Save workflow state
 */
function saveWorkflowState(state) {
    // Use StateProtectionLayer for atomic saves
    const StateProtectionLayer = require('../state-protection-layer');
    const protectionLayer = new StateProtectionLayer();
    
    try {
        state.checkpoints.last_save = new Date().toISOString();
        
        // Check if we should create an automatic checkpoint
        checkAutoCheckpoint(state);
        
        // Use protection layer for safe save
        const result = protectionLayer.saveState(state);
        
        return result;
    } catch (error) {
        const workflowError = createWorkflowError(
            ERROR_TYPES.FILE_ACCESS,
            `Failed to save workflow state: ${error.message}`,
            { original_error: error.message, critical: true }
        );
        
        handleWorkflowError(workflowError, state);
        throw workflowError;
    }
}

/**
 * Check if automatic checkpoint should be created
 */
function checkAutoCheckpoint(state) {
    const AUTO_CHECKPOINT_TRIGGERS = {
        phaseCompletion: true,
        significantProgress: 25, // percentage
        timeInterval: 30 * 60 * 1000, // 30 minutes
        beforeRiskyOperation: true
    };
    
    let shouldCheckpoint = false;
    let trigger = '';
    
    // Check phase completion
    if (state.phase_just_completed) {
        shouldCheckpoint = true;
        trigger = 'phase-completion';
    }
    
    // Check significant progress
    const progress = state.phase_details?.progress_percentage || 0;
    const lastCheckpointProgress = state.checkpoints?.last_progress || 0;
    
    if (progress - lastCheckpointProgress >= AUTO_CHECKPOINT_TRIGGERS.significantProgress) {
        shouldCheckpoint = true;
        trigger = 'progress-milestone';
    }
    
    // Check time interval
    const lastCheckpoint = state.checkpoints?.last_checkpoint_time;
    if (lastCheckpoint) {
        const timeSince = Date.now() - new Date(lastCheckpoint).getTime();
        if (timeSince >= AUTO_CHECKPOINT_TRIGGERS.timeInterval) {
            shouldCheckpoint = true;
            trigger = 'time-interval';
        }
    }
    
    if (shouldCheckpoint) {
        createAutomaticCheckpoint(state, trigger);
    }
}

/**
 * Create automatic checkpoint
 */
function createAutomaticCheckpoint(state, trigger) {
    try {
        const checkpointName = `auto-${trigger}-${Date.now()}`;
        const checkpointPath = path.join(CHECKPOINTS_DIR, `${checkpointName}.json`);
        
        // Save checkpoint
        fs.writeFileSync(checkpointPath, JSON.stringify({
            ...state,
            checkpoint_metadata: {
                trigger,
                created_at: new Date().toISOString(),
                phase: state.current_phase,
                progress: state.phase_details?.progress_percentage || 0
            }
        }, null, 2));
        
        // Update state tracking
        state.checkpoints.last_checkpoint_time = new Date().toISOString();
        state.checkpoints.last_progress = state.phase_details?.progress_percentage || 0;
        state.checkpoints.total_checkpoints = (state.checkpoints.total_checkpoints || 0) + 1;
        
        // Clean old checkpoints (keep last 10)
        cleanOldCheckpoints();
        
        console.log(`✅ Automatic checkpoint created: ${checkpointName}`);
    } catch (error) {
        console.error('Failed to create automatic checkpoint:', error.message);
    }
}

/**
 * Clean old checkpoints
 */
function cleanOldCheckpoints() {
    try {
        const checkpoints = fs.readdirSync(CHECKPOINTS_DIR)
            .filter(f => f.startsWith('auto-'))
            .map(f => ({
                name: f,
                path: path.join(CHECKPOINTS_DIR, f),
                created: fs.statSync(path.join(CHECKPOINTS_DIR, f)).mtime
            }))
            .sort((a, b) => b.created - a.created);
        
        // Keep only the 10 most recent automatic checkpoints
        const toDelete = checkpoints.slice(10);
        toDelete.forEach(checkpoint => {
            fs.unlinkSync(checkpoint.path);
        });
    } catch (error) {
        console.warn('Failed to clean old checkpoints:', error.message);
    }
}

/**
 * Update phase progress
 */
function updatePhaseProgress(progressData) {
    const state = getCurrentWorkflowState();
    if (!state) return null;
    
    state.phase_details = {
        ...state.phase_details,
        ...progressData,
        progress_percentage: calculateProgressPercentage(progressData)
    };
    
    saveWorkflowState(state);
    return state;
}

/**
 * Complete current phase
 */
function completePhase(phaseResults = {}) {
    const state = getCurrentWorkflowState();
    if (!state) return null;
    
    const currentPhase = state.current_phase;
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    if (!workflowDef) {
        throw createWorkflowError(
            ERROR_TYPES.INVALID_WORKFLOW,
            `Invalid workflow type in state: ${state.workflow_type}`
        );
    }
    
    // Save phase checkpoint
    const checkpointFile = path.join(CHECKPOINTS_DIR, `phase-${currentPhase}-complete.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify({
        phase: currentPhase,
        completed_at: new Date().toISOString(),
        results: phaseResults,
        state_snapshot: state
    }, null, 2));
    
    // Update state
    state.phases_completed.push(currentPhase);
    state.checkpoints.phase_checkpoints[currentPhase] = new Date().toISOString();
    
    // Check for approval gate
    const nextGate = findNextApprovalGate(state);
    if (nextGate) {
        state.awaiting_approval = nextGate;
        state.can_resume = false;
        // Set approval requested timestamp
        state.approval_gates[nextGate].approval_requested_at = new Date().toISOString();
    } else {
        // Move to next phase
        state.phase_index++;
        if (state.phase_index < workflowDef.phases.length) {
            state.current_phase = workflowDef.phases[state.phase_index];
            state.phase_details = {
                name: getPhaseDisplayName(state.workflow_type, state.current_phase),
                progress_percentage: 0,
                active_agents: [],
                documents_created: 0,
                documents_total: 0,
                estimated_time_remaining: workflowDef.phaseDurations[state.current_phase],
                started_at: new Date().toISOString()
            };
        } else {
            state.completed = true;
            state.completed_at = new Date().toISOString();
        }
    }
    
    saveWorkflowState(state);
    return state;
}

/**
 * Save partial state (--save-state command)
 */
function savePartialState(note = null) {
    const state = getCurrentWorkflowState();
    if (!state) return null;
    
    const checkpoint = {
        timestamp: new Date().toISOString(),
        workflow_id: state.workflow_id,
        phase: state.current_phase,
        phase_progress: state.phase_details.progress_percentage,
        partial_documents: gatherPartialDocuments(),
        agent_states: captureAgentStates(),
        research_cache: cacheTimeBasedData(),
        user_note: note
    };
    
    const checkpointFile = path.join(CHECKPOINTS_DIR, 
        `phase-${state.current_phase}-partial-${Date.now()}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
    
    state.checkpoints.last_partial_save = checkpoint.timestamp;
    saveWorkflowState(state);
    
    return {
        message: `✅ Workflow state saved at ${state.current_phase} (${state.phase_details.progress_percentage}% complete)`,
        checkpoint_file: checkpointFile,
        can_resume_from: checkpoint.timestamp
    };
}

/**
 * Resume workflow
 */
function resumeWorkflow() {
    const state = getCurrentWorkflowState();
    if (!state || !state.can_resume) {
        return {
            success: false,
            message: state?.awaiting_approval 
                ? `⚠️ Workflow is awaiting approval at gate: ${state.awaiting_approval}`
                : '❌ No resumable workflow found'
        };
    }
    
    return {
        success: true,
        workflow: state,
        message: `✅ Resuming ${state.workflow_type} workflow at phase: ${state.current_phase}`
    };
}

/**
 * Get workflow status
 */
function getWorkflowStatus() {
    const state = getCurrentWorkflowState();
    if (!state) {
        return {
            active: false,
            message: 'No active workflow'
        };
    }
    
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    if (!workflowDef) {
        return {
            active: false,
            workflow_type: state?.workflow_type || 'unknown',
            error: 'Invalid workflow type'
        };
    }
    const totalPhases = workflowDef.phases.length;
    const completedPhases = state.phases_completed.length;
    
    return {
        active: true,
        workflow_type: state.workflow_type,
        current_phase: state.current_phase,
        phase_progress: state.phase_details.progress_percentage,
        overall_progress: Math.round((completedPhases / totalPhases) * 100),
        phases_completed: completedPhases,
        phases_total: totalPhases,
        active_agents: state.phase_details.active_agents,
        awaiting_approval: state.awaiting_approval || null,
        can_resume: state.can_resume,
        started_at: state.started_at,
        estimated_completion: estimateCompletionTime(state)
    };
}

/**
 * Approve gate and continue
 */
function approveGate(gateName, modifications = {}) {
    const state = getCurrentWorkflowState();
    if (!state || state.awaiting_approval !== gateName) {
        return {
            success: false,
            message: `❌ No approval pending for gate: ${gateName}`
        };
    }
    
    // Record approval
    state.approval_gates[gateName] = {
        ...state.approval_gates[gateName],
        approved: true,
        approved_at: new Date().toISOString(),
        modifications: modifications
    };
    
    // Clear approval wait and allow resume
    state.awaiting_approval = null;
    state.can_resume = true;
    
    // Move to next phase
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    if (!workflowDef) {
        throw createWorkflowError(
            ERROR_TYPES.INVALID_WORKFLOW,
            `Invalid workflow type in state: ${state.workflow_type}`
        );
    }
    state.phase_index++;
    state.current_phase = workflowDef.phases[state.phase_index];
    state.phase_details = {
        name: getPhaseDisplayName(state.workflow_type, state.current_phase),
        progress_percentage: 0,
        active_agents: [],
        documents_created: 0,
        documents_total: 0,
        estimated_time_remaining: workflowDef.phaseDurations[state.current_phase],
        started_at: new Date().toISOString()
    };
    
    saveWorkflowState(state);
    
    return {
        success: true,
        message: `✅ Gate approved. Proceeding to phase: ${state.current_phase}`,
        next_phase: state.current_phase
    };
}

// Helper functions

function getPhaseDisplayName(workflowType, phase) {
    const displayNames = {
        'new-project': {
            discovery: 'Stakeholder Discovery Interview',
            research: 'Market Research & Analysis',
            analysis: 'Analysis & Synthesis',
            requirements: 'Requirements & Specifications',
            planning: 'Project Planning & Architecture',
            backlog: 'Product Backlog Creation',
            scaffold: 'Project Scaffolding',
            sprint: 'Sprint Implementation'
        },
        'existing-project': {
            analyze: 'Code Analysis & Assessment',
            discovery: 'Stakeholder Interview',
            assessment: 'Gap Analysis & Opportunities',
            planning: 'Enhancement Planning',
            backlog: 'Enhancement Backlog',
            implementation: 'Implementation'
        }
    };
    
    return displayNames[workflowType]?.[phase] || phase;
}

function initializeApprovalGates(gateDefs) {
    const gates = {};
    Object.keys(gateDefs).forEach(gateName => {
        gates[gateName] = {
            approved: false,
            approved_at: null,
            approval_requested_at: null,
            timeout_minutes: getApprovalTimeout(gateName),
            notes: null,
            modifications: {}
        };
    });
    return gates;
}

// Get timeout for approval gate
function getApprovalTimeout(gateName) {
    const timeouts = {
        'post-research': 30, // minutes
        'post-requirements': 60,
        'pre-implementation': 120,
        'post-analysis': 45,
        default: 30
    };
    return timeouts[gateName] || timeouts.default;
}

function findNextApprovalGate(state) {
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    if (!workflowDef) {
        return null;
    }
    const currentPhase = state.current_phase;
    
    for (const [gateName, gateDef] of Object.entries(workflowDef.approvalGates)) {
        if (gateDef.after === currentPhase && !state.approval_gates[gateName].approved) {
            return gateName;
        }
    }
    
    return null;
}

function calculateProgressPercentage(progressData) {
    if (progressData.documents_total > 0) {
        return Math.round((progressData.documents_created / progressData.documents_total) * 100);
    }
    return progressData.progress_percentage || 0;
}

function gatherPartialDocuments() {
    // Implementation would gather any partially created documents
    return [];
}

function captureAgentStates() {
    // Implementation would capture current agent states
    return {};
}

function cacheTimeBasedData() {
    // Implementation would cache time-sensitive research data
    return {};
}

function estimateCompletionTime(state) {
    // Simple estimation based on remaining phases
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    if (!workflowDef) {
        return 'Unknown';
    }
    const remainingPhases = workflowDef.phases.length - state.phase_index - 1;
    
    // Rough estimate: 3 hours per phase average
    const hoursRemaining = remainingPhases * 3;
    const estimatedDate = new Date();
    estimatedDate.setHours(estimatedDate.getHours() + hoursRemaining);
    
    return estimatedDate.toISOString();
}

/**
 * Check for approval gate timeouts
 */
function checkApprovalTimeouts() {
    const state = getCurrentWorkflowState();
    if (!state || !state.awaiting_approval) return null;
    
    const gateName = state.awaiting_approval;
    const gate = state.approval_gates[gateName];
    
    if (!gate.approval_requested_at) return null;
    
    const requestedAt = new Date(gate.approval_requested_at);
    const now = new Date();
    const elapsedMinutes = (now - requestedAt) / (1000 * 60);
    const timeoutMinutes = gate.timeout_minutes;
    
    if (elapsedMinutes >= timeoutMinutes) {
        return {
            timedOut: true,
            gateName,
            elapsedMinutes: Math.floor(elapsedMinutes),
            timeoutMinutes,
            message: `⏰ Approval gate "${gateName}" has timed out after ${Math.floor(elapsedMinutes)} minutes (timeout: ${timeoutMinutes} minutes)`
        };
    }
    
    const remainingMinutes = Math.ceil(timeoutMinutes - elapsedMinutes);
    return {
        timedOut: false,
        gateName,
        elapsedMinutes: Math.floor(elapsedMinutes),
        remainingMinutes,
        timeoutMinutes,
        message: `⏳ Approval gate "${gateName}" - ${remainingMinutes} minutes remaining before timeout`
    };
}

/**
 * Notify user about approval timeout
 */
function notifyApprovalTimeout(gateName) {
    console.log('\n' + '─'.repeat(50));
    console.log('⏰ APPROVAL GATE TIMEOUT NOTIFICATION');
    console.log('─'.repeat(50));
    console.log(`\nThe approval gate "${gateName}" has exceeded its timeout period.`);
    console.log('\nOptions:');
    console.log('1. Approve the gate: /approve-gate ' + gateName);
    console.log('2. Skip the gate: /workflow-recovery --skip-approval');
    console.log('3. Reset the phase: /workflow-recovery --reset-phase');
    console.log('4. View status: /start-new-project-workflow --status');
    console.log('\n' + '─'.repeat(50) + '\n');
}

module.exports = {
    initializeWorkflow,
    getCurrentWorkflowState,
    saveWorkflowState,
    updatePhaseProgress,
    completePhase,
    savePartialState,
    resumeWorkflow,
    getWorkflowStatus,
    approveGate,
    checkApprovalTimeouts,
    notifyApprovalTimeout,
    WORKFLOW_PHASES
};