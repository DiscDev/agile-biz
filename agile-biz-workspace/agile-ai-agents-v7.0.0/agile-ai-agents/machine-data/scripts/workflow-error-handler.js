/**
 * Workflow Error Handler
 * 
 * Provides comprehensive error handling and recovery mechanisms for the workflow system
 */

const fs = require('fs');
const path = require('path');

// Error types
const ERROR_TYPES = {
    STATE_CORRUPTION: 'STATE_CORRUPTION',
    FILE_ACCESS: 'FILE_ACCESS',
    INVALID_PHASE: 'INVALID_PHASE',
    INVALID_WORKFLOW: 'INVALID_WORKFLOW',
    APPROVAL_GATE: 'APPROVAL_GATE',
    AGENT_FAILURE: 'AGENT_FAILURE',
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RECOVERY_FAILED: 'RECOVERY_FAILED'
};

// Recovery strategies
const RECOVERY_STRATEGIES = {
    RESTORE_CHECKPOINT: 'restore_checkpoint',
    RESET_PHASE: 'reset_phase',
    SKIP_AGENT: 'skip_agent',
    RETRY_OPERATION: 'retry_operation',
    MANUAL_INTERVENTION: 'manual_intervention',
    SAFE_MODE: 'safe_mode'
};

class WorkflowError extends Error {
    constructor(type, message, details = {}) {
        super(message);
        this.name = 'WorkflowError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.recoveryStrategy = determineRecoveryStrategy(type, details);
    }
}

/**
 * Determine appropriate recovery strategy based on error type
 */
function determineRecoveryStrategy(errorType, details) {
    switch (errorType) {
        case ERROR_TYPES.STATE_CORRUPTION:
            return RECOVERY_STRATEGIES.RESTORE_CHECKPOINT;
            
        case ERROR_TYPES.FILE_ACCESS:
            return details.retryable ? 
                RECOVERY_STRATEGIES.RETRY_OPERATION : 
                RECOVERY_STRATEGIES.MANUAL_INTERVENTION;
                
        case ERROR_TYPES.INVALID_PHASE:
            return RECOVERY_STRATEGIES.RESET_PHASE;
            
        case ERROR_TYPES.INVALID_WORKFLOW:
            return RECOVERY_STRATEGIES.MANUAL_INTERVENTION;
            
        case ERROR_TYPES.AGENT_FAILURE:
            return details.critical ? 
                RECOVERY_STRATEGIES.MANUAL_INTERVENTION : 
                RECOVERY_STRATEGIES.SKIP_AGENT;
                
        case ERROR_TYPES.NETWORK_ERROR:
            return RECOVERY_STRATEGIES.RETRY_OPERATION;
            
        default:
            return RECOVERY_STRATEGIES.SAFE_MODE;
    }
}

/**
 * Handle workflow errors with appropriate recovery
 */
async function handleWorkflowError(error, context = {}) {
    const errorLog = {
        error: {
            type: error.type || 'UNKNOWN',
            message: error.message,
            stack: error.stack,
            details: error.details || {}
        },
        context: {
            workflow_id: context.workflow_id,
            current_phase: context.current_phase,
            phase_index: context.phase_index,
            timestamp: new Date().toISOString()
        },
        recovery: {
            strategy: error.recoveryStrategy || RECOVERY_STRATEGIES.SAFE_MODE,
            attempted: false,
            successful: false
        }
    };
    
    // Log error
    await logError(errorLog);
    
    // Attempt recovery
    try {
        const recoveryResult = await attemptRecovery(error, context);
        errorLog.recovery.attempted = true;
        errorLog.recovery.successful = recoveryResult.success;
        errorLog.recovery.result = recoveryResult;
        
        // Update error log with recovery result
        await logError(errorLog);
        
        return recoveryResult;
    } catch (recoveryError) {
        errorLog.recovery.error = {
            message: recoveryError.message,
            stack: recoveryError.stack
        };
        
        await logError(errorLog);
        
        throw new WorkflowError(
            ERROR_TYPES.RECOVERY_FAILED,
            `Recovery failed: ${recoveryError.message}`,
            { originalError: error, recoveryError }
        );
    }
}

/**
 * Attempt recovery based on strategy
 */
async function attemptRecovery(error, context) {
    const strategy = error.recoveryStrategy || RECOVERY_STRATEGIES.SAFE_MODE;
    
    switch (strategy) {
        case RECOVERY_STRATEGIES.RESTORE_CHECKPOINT:
            return await restoreFromCheckpoint(context);
            
        case RECOVERY_STRATEGIES.RESET_PHASE:
            return await resetCurrentPhase(context);
            
        case RECOVERY_STRATEGIES.SKIP_AGENT:
            return await skipFailedAgent(error, context);
            
        case RECOVERY_STRATEGIES.RETRY_OPERATION:
            return await retryOperation(error, context);
            
        case RECOVERY_STRATEGIES.SAFE_MODE:
            return await enterSafeMode(context);
            
        case RECOVERY_STRATEGIES.MANUAL_INTERVENTION:
        default:
            return {
                success: false,
                message: 'Manual intervention required',
                instructions: getManualInstructions(error, context)
            };
    }
}

/**
 * Restore workflow from last checkpoint
 */
async function restoreFromCheckpoint(context) {
    const checkpointDir = path.join(__dirname, '../../project-state/checkpoints');
    
    try {
        // Find most recent checkpoint
        const checkpoints = fs.readdirSync(checkpointDir)
            .filter(f => f.startsWith('checkpoint-'))
            .sort()
            .reverse();
            
        if (checkpoints.length === 0) {
            return {
                success: false,
                message: 'No checkpoints available for restoration'
            };
        }
        
        // Load checkpoint
        const checkpointPath = path.join(checkpointDir, checkpoints[0]);
        const checkpointData = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
        
        // Restore state
        const stateFile = path.join(__dirname, '../../project-state/workflow-states/current-workflow.json');
        fs.writeFileSync(stateFile, JSON.stringify(checkpointData, null, 2));
        
        return {
            success: true,
            message: `Restored from checkpoint: ${checkpoints[0]}`,
            checkpoint: checkpoints[0],
            restored_phase: checkpointData.current_phase
        };
    } catch (err) {
        return {
            success: false,
            message: `Failed to restore checkpoint: ${err.message}`
        };
    }
}

/**
 * Reset current phase to beginning
 */
async function resetCurrentPhase(context) {
    try {
        const stateFile = path.join(__dirname, '../../project-state/workflow-states/current-workflow.json');
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        
        // Reset phase progress
        state.phase_details = {
            ...state.phase_details,
            progress_percentage: 0,
            documents_created: 0,
            active_agents: [],
            started_at: new Date().toISOString()
        };
        
        // Clear any approval gates for this phase
        if (state.awaiting_approval) {
            state.awaiting_approval = null;
            state.can_resume = true;
        }
        
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        
        return {
            success: true,
            message: `Reset phase: ${state.current_phase}`,
            phase: state.current_phase
        };
    } catch (err) {
        return {
            success: false,
            message: `Failed to reset phase: ${err.message}`
        };
    }
}

/**
 * Skip failed agent and continue
 */
async function skipFailedAgent(error, context) {
    const failedAgent = error.details.agent_name;
    
    if (!failedAgent) {
        return {
            success: false,
            message: 'No agent information available to skip'
        };
    }
    
    try {
        const stateFile = path.join(__dirname, '../../project-state/workflow-states/current-workflow.json');
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        
        // Record skipped agent
        if (!state.skipped_agents) {
            state.skipped_agents = [];
        }
        
        state.skipped_agents.push({
            agent_name: failedAgent,
            phase: state.current_phase,
            reason: error.message,
            timestamp: new Date().toISOString()
        });
        
        // Remove from active agents
        if (state.phase_details.active_agents) {
            state.phase_details.active_agents = state.phase_details.active_agents
                .filter(a => a.name !== failedAgent);
        }
        
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        
        return {
            success: true,
            message: `Skipped agent: ${failedAgent}`,
            skipped_agent: failedAgent,
            remaining_agents: state.phase_details.active_agents
        };
    } catch (err) {
        return {
            success: false,
            message: `Failed to skip agent: ${err.message}`
        };
    }
}

/**
 * Retry failed operation
 */
async function retryOperation(error, context) {
    const maxRetries = error.details.maxRetries || 3;
    const currentRetry = error.details.currentRetry || 0;
    
    if (currentRetry >= maxRetries) {
        return {
            success: false,
            message: `Max retries (${maxRetries}) exceeded`,
            retries: currentRetry
        };
    }
    
    // Return retry information for caller to handle
    return {
        success: true,
        message: 'Retry operation',
        retry: {
            attempt: currentRetry + 1,
            maxRetries,
            delay: Math.pow(2, currentRetry) * 1000 // Exponential backoff
        }
    };
}

/**
 * Enter safe mode - minimal functionality
 */
async function enterSafeMode(context) {
    try {
        const stateFile = path.join(__dirname, '../../project-state/workflow-states/current-workflow.json');
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        
        // Mark workflow as in safe mode
        state.safe_mode = {
            enabled: true,
            reason: 'Error recovery',
            timestamp: new Date().toISOString(),
            restrictions: [
                'No parallel agent execution',
                'Manual approval required for phase transitions',
                'Limited to essential operations only'
            ]
        };
        
        // Disable parallel mode
        state.parallel_mode = false;
        
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        
        return {
            success: true,
            message: 'Entered safe mode',
            restrictions: state.safe_mode.restrictions
        };
    } catch (err) {
        return {
            success: false,
            message: `Failed to enter safe mode: ${err.message}`
        };
    }
}

/**
 * Get manual intervention instructions
 */
function getManualInstructions(error, context) {
    const instructions = [
        '🚨 Manual Intervention Required',
        '',
        `Error Type: ${error.type}`,
        `Error Message: ${error.message}`,
        ''
    ];
    
    // Add specific instructions based on error type
    switch (error.type) {
        case ERROR_TYPES.STATE_CORRUPTION:
            instructions.push(
                'The workflow state appears to be corrupted.',
                'Options:',
                '1. Run: /workflow-recovery --restore-checkpoint',
                '2. Run: /workflow-recovery --reset-workflow',
                '3. Manually edit state file in project-state/workflow-states/'
            );
            break;
            
        case ERROR_TYPES.APPROVAL_GATE:
            instructions.push(
                'Approval gate issue detected.',
                'Options:',
                '1. Run: /workflow-recovery --skip-approval',
                '2. Run: /workflow-recovery --reset-phase',
                '3. Contact stakeholder for approval'
            );
            break;
            
        case ERROR_TYPES.AGENT_FAILURE:
            instructions.push(
                `Agent "${error.details.agent_name}" has failed.`,
                'Options:',
                '1. Run: /workflow-recovery --skip-agent',
                '2. Run: /workflow-recovery --retry-agent',
                '3. Manually complete agent tasks'
            );
            break;
            
        default:
            instructions.push(
                'An unexpected error has occurred.',
                'Options:',
                '1. Run: /workflow-recovery --diagnostic',
                '2. Check logs in project-state/error-logs/',
                '3. Run: /workflow-recovery --safe-mode'
            );
    }
    
    return instructions.join('\n');
}

/**
 * Log error to file system
 */
async function logError(errorLog) {
    const errorDir = path.join(__dirname, '../../project-state/error-logs');
    
    // Ensure directory exists
    if (!fs.existsSync(errorDir)) {
        fs.mkdirSync(errorDir, { recursive: true });
    }
    
    // Create timestamped log file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(errorDir, `error-${timestamp}.json`);
    
    fs.writeFileSync(logFile, JSON.stringify(errorLog, null, 2));
    
    // Also append to main error log
    const mainLog = path.join(errorDir, 'workflow-errors.log');
    const logEntry = `[${errorLog.context.timestamp}] ${errorLog.error.type}: ${errorLog.error.message}\n`;
    fs.appendFileSync(mainLog, logEntry);
}

/**
 * Validate workflow state integrity
 */
function validateWorkflowState(state) {
    const errors = [];
    
    // Check required fields
    const requiredFields = ['workflow_id', 'workflow_type', 'current_phase', 'phase_index'];
    for (const field of requiredFields) {
        if (!state[field] && state[field] !== 0) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    
    // Validate phase index
    if (state.phase_index < 0 || state.phase_index >= 10) {
        errors.push(`Invalid phase_index: ${state.phase_index}`);
    }
    
    // Validate workflow type
    if (!['new-project', 'existing-project'].includes(state.workflow_type)) {
        errors.push(`Invalid workflow_type: ${state.workflow_type}`);
    }
    
    // Check for state corruption indicators
    if (state.phases_completed && state.phases_completed.length > state.phase_index + 1) {
        errors.push('Phase completion count exceeds current phase index');
    }
    
    return errors;
}

/**
 * Create error with context
 */
function createWorkflowError(type, message, details = {}) {
    return new WorkflowError(type, message, details);
}

module.exports = {
    WorkflowError,
    ERROR_TYPES,
    RECOVERY_STRATEGIES,
    handleWorkflowError,
    validateWorkflowState,
    createWorkflowError,
    restoreFromCheckpoint,
    resetCurrentPhase,
    skipFailedAgent,
    enterSafeMode
};