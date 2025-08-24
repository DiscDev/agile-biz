/**
 * Workflow Execution Wrapper
 * 
 * Wraps workflow phase execution with comprehensive error handling
 * Part of Phase 1: Critical Foundation improvements
 */

const { 
    handleWorkflowError, 
    createWorkflowError, 
    ERROR_TYPES,
    validateWorkflowState 
} = require('./workflow-error-handler');
const { 
    getCurrentWorkflowState,
    saveWorkflowState,
    updatePhaseProgress
} = require('./workflow-state-handler');

/**
 * Execute a workflow phase with error handling
 */
async function executePhaseWithErrorHandling(phaseConfig) {
    const state = getCurrentWorkflowState();
    if (!state) {
        throw createWorkflowError(
            ERROR_TYPES.STATE_CORRUPTION,
            'No active workflow state found'
        );
    }

    // Validate state before execution
    const validationErrors = validateWorkflowState(state);
    if (validationErrors.length > 0) {
        throw createWorkflowError(
            ERROR_TYPES.STATE_CORRUPTION,
            'Invalid workflow state detected',
            { validation_errors: validationErrors }
        );
    }

    let phaseResult = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
        try {
            // Log phase start
            console.log(`\n🚀 Starting Phase: ${phaseConfig.name}`);
            console.log(`   Phase ${state.phase_index + 1} of ${phaseConfig.totalPhases}`);
            
            // Update state to show phase is active
            await updatePhaseProgress({
                phase_status: 'active',
                started_at: new Date().toISOString()
            });

            // Execute the phase function
            phaseResult = await phaseConfig.execute(state);

            // If successful, break the retry loop
            break;

        } catch (error) {
            console.error(`\n❌ Error in phase execution: ${error.message}`);

            // Create workflow error with context
            const workflowError = error instanceof Error && error.type ? 
                error : 
                createWorkflowError(
                    ERROR_TYPES.AGENT_FAILURE,
                    error.message || 'Unknown error',
                    {
                        phase: phaseConfig.name,
                        agent: phaseConfig.agent,
                        retryable: retryCount < maxRetries,
                        currentRetry: retryCount
                    }
                );

            // Attempt recovery
            const recovery = await handleWorkflowError(workflowError, state);

            if (recovery.success) {
                if (recovery.retry) {
                    // Retry operation
                    retryCount++;
                    console.log(`\n🔄 Retrying phase (attempt ${retryCount}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, recovery.retry.delay));
                    continue;
                } else {
                    // Recovery successful, return result
                    phaseResult = recovery;
                    break;
                }
            } else {
                // Recovery failed, show instructions
                console.error('\n' + recovery.instructions);
                throw workflowError;
            }
        }
    }

    if (!phaseResult && retryCount > maxRetries) {
        throw createWorkflowError(
            ERROR_TYPES.AGENT_FAILURE,
            `Phase failed after ${maxRetries} retries`,
            { phase: phaseConfig.name }
        );
    }

    // Update phase progress with completion
    await updatePhaseProgress({
        phase_status: 'completed',
        completed_at: new Date().toISOString(),
        result: phaseResult
    });

    console.log(`\n✅ Phase completed: ${phaseConfig.name}`);
    return phaseResult;
}

/**
 * Show recovery instructions to user
 */
function showRecoveryInstructions(error) {
    const instructions = [
        '\n🚨 Workflow Error - Manual Intervention Required',
        '─'.repeat(50),
        `Error: ${error.message}`,
        `Type: ${error.type || 'Unknown'}`,
        '',
        '📋 Recovery Options:',
        ''
    ];

    // Add specific recovery options based on error type
    switch (error.type) {
        case ERROR_TYPES.STATE_CORRUPTION:
            instructions.push(
                '1. Restore from checkpoint:',
                '   /workflow-recovery --restore-checkpoint',
                '',
                '2. Reset current phase:',
                '   /workflow-recovery --reset-phase',
                '',
                '3. Start fresh:',
                '   /workflow-recovery --reset-workflow'
            );
            break;

        case ERROR_TYPES.AGENT_FAILURE:
            instructions.push(
                '1. Skip this agent and continue:',
                '   /workflow-recovery --skip-agent',
                '',
                '2. Retry with the agent:',
                '   /workflow-recovery --retry-agent',
                '',
                '3. Enter safe mode:',
                '   /workflow-recovery --safe-mode'
            );
            break;

        case ERROR_TYPES.APPROVAL_GATE:
            instructions.push(
                '1. Skip approval and continue:',
                '   /workflow-recovery --skip-approval',
                '',
                '2. Reset to before approval:',
                '   /workflow-recovery --reset-phase',
                '',
                '3. Check approval status:',
                '   /workflow-recovery --status'
            );
            break;

        default:
            instructions.push(
                '1. Run diagnostics:',
                '   /workflow-recovery --diagnostic',
                '',
                '2. View error logs:',
                '   /workflow-recovery --show-errors',
                '',
                '3. Get help:',
                '   /workflow-recovery --help'
            );
    }

    instructions.push(
        '',
        '─'.repeat(50),
        '💡 Tip: You can also use /continue to attempt automatic recovery',
        ''
    );

    console.log(instructions.join('\n'));
}

/**
 * Create a safe phase execution function
 */
function createSafePhaseExecutor(phaseName, agentName, executeFunction) {
    return {
        name: phaseName,
        agent: agentName,
        execute: executeFunction,
        totalPhases: 8 // Default for new-project workflow
    };
}

module.exports = {
    executePhaseWithErrorHandling,
    showRecoveryInstructions,
    createSafePhaseExecutor
};