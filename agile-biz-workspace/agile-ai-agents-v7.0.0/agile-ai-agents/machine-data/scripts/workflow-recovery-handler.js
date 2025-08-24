/**
 * Workflow Recovery Command Handler
 * 
 * Handles /workflow-recovery commands for error recovery and diagnostics
 */

const fs = require('fs');
const path = require('path');
const { 
    handleWorkflowError, 
    restoreFromCheckpoint, 
    resetCurrentPhase,
    skipFailedAgent,
    enterSafeMode,
    validateWorkflowState,
    ERROR_TYPES
} = require('./workflow-error-handler');
const { getCurrentWorkflowState, saveWorkflowState } = require('./workflow-state-handler');

/**
 * Handle workflow recovery commands
 */
async function handleWorkflowRecovery(args = []) {
    const command = args[0];
    
    switch (command) {
        case '--diagnostic':
            return runDiagnostics();
            
        case '--restore-checkpoint':
            return restoreCheckpoint(args.slice(1));
            
        case '--reset-workflow':
            return resetWorkflow();
            
        case '--reset-phase':
            return resetPhase();
            
        case '--skip-approval':
            return skipApproval();
            
        case '--skip-agent':
            return skipAgent(args[1]);
            
        case '--retry-agent':
            return retryAgent(args[1]);
            
        case '--safe-mode':
            return enableSafeMode();
            
        case '--exit-safe-mode':
            return exitSafeMode();
            
        case '--show-errors':
            return showRecentErrors(args[1] || 5);
            
        case '--validate-state':
            return validateState();
            
        case '--export-state':
            return exportState(args[1]);
            
        case '--import-state':
            return importState(args[1]);
            
        default:
            return showRecoveryHelp();
    }
}

/**
 * Run comprehensive diagnostics
 */
async function runDiagnostics() {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        workflow_state: {},
        validation_errors: [],
        checkpoints: [],
        error_logs: [],
        recommendations: []
    };
    
    try {
        // Check workflow state
        const state = getCurrentWorkflowState();
        if (state) {
            diagnostics.workflow_state = {
                workflow_id: state.workflow_id,
                workflow_type: state.workflow_type,
                current_phase: state.current_phase,
                phase_index: state.phase_index,
                awaiting_approval: state.awaiting_approval,
                safe_mode: state.safe_mode,
                completed: state.completed,
                phases_completed: state.phases_completed?.length || 0
            };
            
            // Validate state
            diagnostics.validation_errors = validateWorkflowState(state);
        } else {
            diagnostics.workflow_state = { status: 'No active workflow' };
        }
        
        // Check checkpoints
        const checkpointDir = path.join(__dirname, '../../project-state/checkpoints');
        if (fs.existsSync(checkpointDir)) {
            diagnostics.checkpoints = fs.readdirSync(checkpointDir)
                .filter(f => f.startsWith('checkpoint-'))
                .map(f => {
                    const stats = fs.statSync(path.join(checkpointDir, f));
                    return {
                        file: f,
                        size: stats.size,
                        created: stats.mtime
                    };
                })
                .sort((a, b) => b.created - a.created)
                .slice(0, 5);
        }
        
        // Check recent errors
        const errorDir = path.join(__dirname, '../../project-state/error-logs');
        if (fs.existsSync(errorDir)) {
            diagnostics.error_logs = fs.readdirSync(errorDir)
                .filter(f => f.endsWith('.json'))
                .map(f => {
                    try {
                        const errorData = JSON.parse(fs.readFileSync(path.join(errorDir, f), 'utf8'));
                        return {
                            file: f,
                            type: errorData.error.type,
                            message: errorData.error.message,
                            timestamp: errorData.context.timestamp
                        };
                    } catch (e) {
                        return { file: f, error: 'Failed to parse' };
                    }
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 5);
        }
        
        // Generate recommendations
        if (diagnostics.validation_errors.length > 0) {
            diagnostics.recommendations.push('State validation errors detected. Consider --restore-checkpoint or --reset-workflow');
        }
        
        if (state?.safe_mode?.enabled) {
            diagnostics.recommendations.push('Workflow is in safe mode. Run --exit-safe-mode when issues are resolved');
        }
        
        if (state?.awaiting_approval) {
            diagnostics.recommendations.push(`Workflow awaiting approval at ${state.awaiting_approval}. Use --skip-approval to bypass`);
        }
        
        if (diagnostics.error_logs.length > 0) {
            diagnostics.recommendations.push('Recent errors detected. Review with --show-errors for details');
        }
        
    } catch (error) {
        diagnostics.diagnostic_error = error.message;
    }
    
    // Format output
    const output = [
        '🔍 Workflow Diagnostics Report',
        '================================',
        '',
        '📊 Workflow State:',
        JSON.stringify(diagnostics.workflow_state, null, 2),
        '',
        `✅ Validation: ${diagnostics.validation_errors.length === 0 ? 'PASSED' : `FAILED (${diagnostics.validation_errors.length} errors)`}`
    ];
    
    if (diagnostics.validation_errors.length > 0) {
        output.push('Validation Errors:');
        diagnostics.validation_errors.forEach(err => output.push(`  - ${err}`));
    }
    
    output.push('', '💾 Recent Checkpoints:');
    diagnostics.checkpoints.forEach(cp => {
        output.push(`  - ${cp.file} (${(cp.size / 1024).toFixed(1)}KB) - ${cp.created.toLocaleString()}`);
    });
    
    if (diagnostics.error_logs.length > 0) {
        output.push('', '❌ Recent Errors:');
        diagnostics.error_logs.forEach(err => {
            output.push(`  - [${err.type}] ${err.message} (${err.timestamp})`);
        });
    }
    
    if (diagnostics.recommendations.length > 0) {
        output.push('', '💡 Recommendations:');
        diagnostics.recommendations.forEach(rec => output.push(`  - ${rec}`));
    }
    
    console.log(output.join('\n'));
    
    return {
        message: 'Diagnostics complete',
        diagnostics
    };
}

/**
 * Restore from checkpoint
 */
async function restoreCheckpoint(args) {
    const checkpointName = args[0];
    
    try {
        const context = getCurrentWorkflowState() || {};
        let result;
        
        if (checkpointName) {
            // Restore specific checkpoint
            const checkpointPath = path.join(__dirname, '../../project-state/checkpoints', checkpointName);
            if (!fs.existsSync(checkpointPath)) {
                return {
                    message: `Checkpoint not found: ${checkpointName}`,
                    available: fs.readdirSync(path.join(__dirname, '../../project-state/checkpoints'))
                        .filter(f => f.startsWith('checkpoint-'))
                };
            }
            
            const checkpointData = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
            const stateFile = path.join(__dirname, '../../project-state/workflow-states/current-workflow.json');
            fs.writeFileSync(stateFile, JSON.stringify(checkpointData, null, 2));
            
            result = {
                success: true,
                message: `Restored from checkpoint: ${checkpointName}`,
                checkpoint: checkpointName
            };
        } else {
            // Restore from most recent
            result = await restoreFromCheckpoint(context);
        }
        
        console.log(`\n✅ ${result.message}\n`);
        return result;
        
    } catch (error) {
        console.log(`\n❌ Failed to restore checkpoint: ${error.message}\n`);
        return {
            message: `Failed to restore checkpoint: ${error.message}`,
            error: true
        };
    }
}

/**
 * Reset entire workflow
 */
async function resetWorkflow() {
    try {
        const stateFile = path.join(__dirname, '../../project-state/workflow-states/current-workflow.json');
        
        // Create backup before reset
        if (fs.existsSync(stateFile)) {
            const backupName = `backup-before-reset-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const backupPath = path.join(__dirname, '../../project-state/backups', backupName);
            
            // Ensure backup directory exists
            const backupDir = path.dirname(backupPath);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            fs.copyFileSync(stateFile, backupPath);
            console.log(`\n📦 Created backup: ${backupName}`);
        }
        
        // Remove current workflow
        if (fs.existsSync(stateFile)) {
            fs.unlinkSync(stateFile);
        }
        
        console.log('\n✅ Workflow has been reset. You can start a new workflow with:');
        console.log('   /start-new-project-workflow');
        console.log('   /start-existing-project-workflow\n');
        
        return {
            message: 'Workflow reset successfully',
            backup_created: true
        };
        
    } catch (error) {
        console.log(`\n❌ Failed to reset workflow: ${error.message}\n`);
        return {
            message: `Failed to reset workflow: ${error.message}`,
            error: true
        };
    }
}

/**
 * Reset current phase
 */
async function resetPhase() {
    try {
        const state = getCurrentWorkflowState();
        if (!state) {
            return {
                message: 'No active workflow to reset',
                error: true
            };
        }
        
        const result = await resetCurrentPhase({ 
            current_phase: state.current_phase 
        });
        
        console.log(`\n✅ ${result.message}\n`);
        return result;
        
    } catch (error) {
        console.log(`\n❌ Failed to reset phase: ${error.message}\n`);
        return {
            message: `Failed to reset phase: ${error.message}`,
            error: true
        };
    }
}

/**
 * Skip approval gate
 */
async function skipApproval() {
    try {
        const state = getCurrentWorkflowState();
        if (!state) {
            return {
                message: 'No active workflow',
                error: true
            };
        }
        
        if (!state.awaiting_approval) {
            return {
                message: 'No approval gate pending',
                error: true
            };
        }
        
        // Skip the approval
        state.awaiting_approval = null;
        state.can_resume = true;
        
        // Move to next phase
        const { WORKFLOW_PHASES } = require('./workflow-state-handler');
        const workflowDef = WORKFLOW_PHASES[state.workflow_type];
        const gateInfo = workflowDef.approvalGates[state.awaiting_approval];
        
        if (gateInfo) {
            const nextPhaseIndex = workflowDef.phases.indexOf(gateInfo.before);
            if (nextPhaseIndex !== -1) {
                state.current_phase = gateInfo.before;
                state.phase_index = nextPhaseIndex;
            }
        }
        
        // Add skip record
        if (!state.skipped_approvals) {
            state.skipped_approvals = [];
        }
        state.skipped_approvals.push({
            gate: state.awaiting_approval,
            timestamp: new Date().toISOString(),
            reason: 'Manual skip via recovery command'
        });
        
        saveWorkflowState(state);
        
        console.log(`\n✅ Skipped approval gate: ${state.awaiting_approval}`);
        console.log(`   Moved to phase: ${state.current_phase}\n`);
        
        return {
            message: `Skipped approval gate and moved to ${state.current_phase}`,
            skipped_gate: state.awaiting_approval,
            new_phase: state.current_phase
        };
        
    } catch (error) {
        console.log(`\n❌ Failed to skip approval: ${error.message}\n`);
        return {
            message: `Failed to skip approval: ${error.message}`,
            error: true
        };
    }
}

/**
 * Enable safe mode
 */
async function enableSafeMode() {
    try {
        const state = getCurrentWorkflowState();
        if (!state) {
            return {
                message: 'No active workflow',
                error: true
            };
        }
        
        const result = await enterSafeMode({ workflow_id: state.workflow_id });
        
        console.log('\n🛡️ Safe Mode Enabled');
        console.log('Restrictions:');
        result.restrictions.forEach(r => console.log(`  - ${r}`));
        console.log('\nUse --exit-safe-mode when issues are resolved.\n');
        
        return result;
        
    } catch (error) {
        console.log(`\n❌ Failed to enable safe mode: ${error.message}\n`);
        return {
            message: `Failed to enable safe mode: ${error.message}`,
            error: true
        };
    }
}

/**
 * Exit safe mode
 */
async function exitSafeMode() {
    try {
        const state = getCurrentWorkflowState();
        if (!state) {
            return {
                message: 'No active workflow',
                error: true
            };
        }
        
        if (!state.safe_mode?.enabled) {
            return {
                message: 'Workflow is not in safe mode',
                error: true
            };
        }
        
        // Remove safe mode
        delete state.safe_mode;
        
        // Re-enable parallel mode if it was originally enabled
        if (state.original_parallel_mode !== undefined) {
            state.parallel_mode = state.original_parallel_mode;
            delete state.original_parallel_mode;
        }
        
        saveWorkflowState(state);
        
        console.log('\n✅ Exited safe mode. Normal operations resumed.\n');
        
        return {
            message: 'Exited safe mode successfully',
            parallel_mode: state.parallel_mode
        };
        
    } catch (error) {
        console.log(`\n❌ Failed to exit safe mode: ${error.message}\n`);
        return {
            message: `Failed to exit safe mode: ${error.message}`,
            error: true
        };
    }
}

/**
 * Show recent errors
 */
async function showRecentErrors(count = 5) {
    try {
        const errorDir = path.join(__dirname, '../../project-state/error-logs');
        if (!fs.existsSync(errorDir)) {
            return {
                message: 'No error logs found',
                errors: []
            };
        }
        
        const errors = fs.readdirSync(errorDir)
            .filter(f => f.endsWith('.json'))
            .map(f => {
                try {
                    const errorData = JSON.parse(fs.readFileSync(path.join(errorDir, f), 'utf8'));
                    return {
                        file: f,
                        ...errorData
                    };
                } catch (e) {
                    return null;
                }
            })
            .filter(e => e !== null)
            .sort((a, b) => new Date(b.context.timestamp) - new Date(a.context.timestamp))
            .slice(0, parseInt(count));
        
        console.log(`\n📋 Recent Errors (showing ${errors.length} of ${count} requested):`);
        console.log('=' .repeat(60));
        
        errors.forEach((err, idx) => {
            console.log(`\n${idx + 1}. ${err.error.type} - ${new Date(err.context.timestamp).toLocaleString()}`);
            console.log(`   Message: ${err.error.message}`);
            console.log(`   Phase: ${err.context.current_phase || 'Unknown'}`);
            console.log(`   Recovery: ${err.recovery.strategy}`);
            if (err.recovery.successful) {
                console.log(`   ✅ Recovery successful: ${err.recovery.result?.message}`);
            } else {
                console.log(`   ❌ Recovery failed`);
            }
        });
        
        return {
            message: `Displayed ${errors.length} recent errors`,
            errors: errors.map(e => ({
                type: e.error.type,
                message: e.error.message,
                timestamp: e.context.timestamp,
                recovery_attempted: e.recovery.attempted,
                recovery_successful: e.recovery.successful
            }))
        };
        
    } catch (error) {
        console.log(`\n❌ Failed to show errors: ${error.message}\n`);
        return {
            message: `Failed to show errors: ${error.message}`,
            error: true
        };
    }
}

/**
 * Show recovery help
 */
function showRecoveryHelp() {
    const help = [
        '',
        '🛠️  Workflow Recovery Commands',
        '================================',
        '',
        'Diagnostic Commands:',
        '  --diagnostic              Run comprehensive diagnostics',
        '  --validate-state         Validate current workflow state',
        '  --show-errors [count]    Show recent errors (default: 5)',
        '',
        'Recovery Commands:',
        '  --restore-checkpoint [name]  Restore from checkpoint',
        '  --reset-workflow            Reset entire workflow (with backup)',
        '  --reset-phase              Reset current phase progress',
        '  --skip-approval            Skip pending approval gate',
        '  --skip-agent [name]        Skip failed agent',
        '  --retry-agent [name]       Retry failed agent',
        '',
        'Safe Mode:',
        '  --safe-mode               Enable safe mode (restricted operations)',
        '  --exit-safe-mode         Exit safe mode',
        '',
        'State Management:',
        '  --export-state [file]     Export current state to file',
        '  --import-state [file]     Import state from file',
        '',
        'Examples:',
        '  /workflow-recovery --diagnostic',
        '  /workflow-recovery --restore-checkpoint',
        '  /workflow-recovery --skip-approval',
        '  /workflow-recovery --safe-mode',
        ''
    ];
    
    console.log(help.join('\n'));
    
    return {
        message: 'Help displayed',
        commands: [
            '--diagnostic', '--validate-state', '--show-errors',
            '--restore-checkpoint', '--reset-workflow', '--reset-phase',
            '--skip-approval', '--skip-agent', '--retry-agent',
            '--safe-mode', '--exit-safe-mode',
            '--export-state', '--import-state'
        ]
    };
}

/**
 * Validate current state
 */
async function validateState() {
    try {
        const state = getCurrentWorkflowState();
        if (!state) {
            return {
                message: 'No active workflow to validate',
                error: true
            };
        }
        
        const errors = validateWorkflowState(state);
        
        console.log('\n🔍 State Validation Results:');
        console.log('=' .repeat(40));
        
        if (errors.length === 0) {
            console.log('✅ State validation PASSED\n');
            return {
                message: 'State validation passed',
                valid: true,
                errors: []
            };
        } else {
            console.log(`❌ State validation FAILED (${errors.length} errors):\n`);
            errors.forEach((err, idx) => {
                console.log(`${idx + 1}. ${err}`);
            });
            console.log('\nConsider using --restore-checkpoint or --reset-workflow\n');
            
            return {
                message: `State validation failed with ${errors.length} errors`,
                valid: false,
                errors
            };
        }
        
    } catch (error) {
        console.log(`\n❌ Failed to validate state: ${error.message}\n`);
        return {
            message: `Failed to validate state: ${error.message}`,
            error: true
        };
    }
}

/**
 * Export current state
 */
async function exportState(filename) {
    try {
        const state = getCurrentWorkflowState();
        if (!state) {
            return {
                message: 'No active workflow to export',
                error: true
            };
        }
        
        const exportPath = filename || `workflow-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const fullPath = path.isAbsolute(exportPath) ? exportPath : path.join(process.cwd(), exportPath);
        
        fs.writeFileSync(fullPath, JSON.stringify(state, null, 2));
        
        console.log(`\n✅ State exported to: ${fullPath}\n`);
        
        return {
            message: 'State exported successfully',
            path: fullPath
        };
        
    } catch (error) {
        console.log(`\n❌ Failed to export state: ${error.message}\n`);
        return {
            message: `Failed to export state: ${error.message}`,
            error: true
        };
    }
}

/**
 * Import state from file
 */
async function importState(filename) {
    try {
        if (!filename) {
            return {
                message: 'Please provide a filename to import',
                error: true
            };
        }
        
        const importPath = path.isAbsolute(filename) ? filename : path.join(process.cwd(), filename);
        
        if (!fs.existsSync(importPath)) {
            return {
                message: `File not found: ${importPath}`,
                error: true
            };
        }
        
        // Read and validate the state
        const importedState = JSON.parse(fs.readFileSync(importPath, 'utf8'));
        const errors = validateWorkflowState(importedState);
        
        if (errors.length > 0) {
            console.log('\n❌ Imported state validation failed:');
            errors.forEach(err => console.log(`  - ${err}`));
            return {
                message: 'Imported state is invalid',
                errors,
                error: true
            };
        }
        
        // Create backup of current state
        const currentState = getCurrentWorkflowState();
        if (currentState) {
            const backupName = `backup-before-import-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const backupPath = path.join(__dirname, '../../project-state/backups', backupName);
            
            const backupDir = path.dirname(backupPath);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            fs.writeFileSync(backupPath, JSON.stringify(currentState, null, 2));
            console.log(`\n📦 Created backup: ${backupName}`);
        }
        
        // Import the state
        saveWorkflowState(importedState);
        
        console.log(`\n✅ State imported successfully from: ${importPath}`);
        console.log(`   Workflow: ${importedState.workflow_type}`);
        console.log(`   Phase: ${importedState.current_phase}\n`);
        
        return {
            message: 'State imported successfully',
            workflow_type: importedState.workflow_type,
            current_phase: importedState.current_phase
        };
        
    } catch (error) {
        console.log(`\n❌ Failed to import state: ${error.message}\n`);
        return {
            message: `Failed to import state: ${error.message}`,
            error: true
        };
    }
}

module.exports = {
    handleWorkflowRecovery
};