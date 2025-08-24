/**
 * Unit tests for Workflow Error Handler
 */

const fs = require('fs');
const path = require('path');
const {
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
} = require('../../machine-data/scripts/workflow-error-handler');

// Mock fs module
jest.mock('fs');

describe('Workflow Error Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mock implementations
        fs.existsSync.mockReturnValue(true);
        fs.mkdirSync.mockReturnValue(true);
        fs.writeFileSync.mockImplementation(() => {});
        fs.readFileSync.mockReturnValue('{}');
    });

    describe('WorkflowError Class', () => {
        it('should create error with correct properties', () => {
            const error = new WorkflowError(
                ERROR_TYPES.STATE_CORRUPTION,
                'State is corrupted',
                { phase: 'research' }
            );

            expect(error.type).toBe(ERROR_TYPES.STATE_CORRUPTION);
            expect(error.message).toBe('State is corrupted');
            expect(error.details).toEqual({ phase: 'research' });
            expect(error.timestamp).toBeDefined();
            expect(error.recoveryStrategy).toBe(RECOVERY_STRATEGIES.RESTORE_CHECKPOINT);
        });

        it('should determine correct recovery strategy for each error type', () => {
            const testCases = [
                { type: ERROR_TYPES.STATE_CORRUPTION, strategy: RECOVERY_STRATEGIES.RESTORE_CHECKPOINT },
                { type: ERROR_TYPES.INVALID_PHASE, strategy: RECOVERY_STRATEGIES.RESET_PHASE },
                { type: ERROR_TYPES.NETWORK_ERROR, strategy: RECOVERY_STRATEGIES.RETRY_OPERATION },
                { 
                    type: ERROR_TYPES.AGENT_FAILURE, 
                    details: { critical: false },
                    strategy: RECOVERY_STRATEGIES.SKIP_AGENT 
                },
                { 
                    type: ERROR_TYPES.AGENT_FAILURE, 
                    details: { critical: true },
                    strategy: RECOVERY_STRATEGIES.MANUAL_INTERVENTION 
                }
            ];

            testCases.forEach(({ type, details, strategy }) => {
                const error = new WorkflowError(type, 'Test error', details);
                expect(error.recoveryStrategy).toBe(strategy);
            });
        });
    });

    describe('handleWorkflowError', () => {
        it('should log error and attempt recovery', async () => {
            const error = new WorkflowError(
                ERROR_TYPES.STATE_CORRUPTION,
                'State corrupted'
            );

            const context = {
                workflow_id: 'test-workflow',
                current_phase: 'research'
            };

            // Mock checkpoint restoration
            fs.readdirSync.mockReturnValue(['checkpoint-2025-01-20.json']);
            fs.readFileSync.mockReturnValue(JSON.stringify({
                workflow_id: 'test-workflow',
                current_phase: 'discovery'
            }));

            const result = await handleWorkflowError(error, context);

            expect(result.success).toBe(true);
            expect(result.message).toContain('Restored from checkpoint');
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it('should handle recovery failure', async () => {
            const error = new WorkflowError(
                ERROR_TYPES.STATE_CORRUPTION,
                'State corrupted'
            );

            // Mock no checkpoints available
            fs.readdirSync.mockReturnValue([]);

            await expect(handleWorkflowError(error)).rejects.toThrow(WorkflowError);
            await expect(handleWorkflowError(error)).rejects.toThrow(/Recovery failed/);
        });
    });

    describe('validateWorkflowState', () => {
        it('should validate correct state', () => {
            const validState = {
                workflow_id: 'test-123',
                workflow_type: 'new-project',
                current_phase: 'research',
                phase_index: 1,
                phases_completed: ['discovery']
            };

            const errors = validateWorkflowState(validState);
            expect(errors).toHaveLength(0);
        });

        it('should detect missing required fields', () => {
            const invalidState = {
                workflow_type: 'new-project',
                phase_index: 1
            };

            const errors = validateWorkflowState(invalidState);
            expect(errors).toContain('Missing required field: workflow_id');
            expect(errors).toContain('Missing required field: current_phase');
        });

        it('should detect invalid phase index', () => {
            const invalidState = {
                workflow_id: 'test',
                workflow_type: 'new-project',
                current_phase: 'research',
                phase_index: -1
            };

            const errors = validateWorkflowState(invalidState);
            expect(errors).toContain('Invalid phase_index: -1');
        });

        it('should detect state corruption', () => {
            const corruptedState = {
                workflow_id: 'test',
                workflow_type: 'new-project',
                current_phase: 'discovery',
                phase_index: 0,
                phases_completed: ['discovery', 'research', 'analysis']
            };

            const errors = validateWorkflowState(corruptedState);
            expect(errors).toContain('Phase completion count exceeds current phase index');
        });
    });

    describe('Recovery Functions', () => {
        describe('restoreFromCheckpoint', () => {
            it('should restore from most recent checkpoint', async () => {
                const checkpoints = [
                    'checkpoint-2025-01-20-10-00-00.json',
                    'checkpoint-2025-01-20-11-00-00.json',
                    'checkpoint-2025-01-20-09-00-00.json'
                ];

                fs.readdirSync.mockReturnValue(checkpoints);
                fs.readFileSync.mockReturnValue(JSON.stringify({
                    workflow_id: 'restored',
                    current_phase: 'planning'
                }));

                const result = await restoreFromCheckpoint({ workflow_id: 'current' });

                expect(result.success).toBe(true);
                expect(result.checkpoint).toBe('checkpoint-2025-01-20-11-00-00.json');
                expect(result.restored_phase).toBe('planning');
            });

            it('should handle no checkpoints available', async () => {
                fs.readdirSync.mockReturnValue([]);

                const result = await restoreFromCheckpoint({});

                expect(result.success).toBe(false);
                expect(result.message).toContain('No checkpoints available');
            });
        });

        describe('resetCurrentPhase', () => {
            it('should reset phase progress', async () => {
                const currentState = {
                    current_phase: 'research',
                    phase_details: {
                        progress_percentage: 75,
                        documents_created: 10
                    },
                    awaiting_approval: 'post-research',
                    can_resume: false
                };

                fs.readFileSync.mockReturnValue(JSON.stringify(currentState));

                let savedState;
                fs.writeFileSync.mockImplementation((path, data) => {
                    savedState = JSON.parse(data);
                });

                const result = await resetCurrentPhase({ current_phase: 'research' });

                expect(result.success).toBe(true);
                expect(savedState.phase_details.progress_percentage).toBe(0);
                expect(savedState.phase_details.documents_created).toBe(0);
                expect(savedState.awaiting_approval).toBeNull();
                expect(savedState.can_resume).toBe(true);
            });
        });

        describe('skipFailedAgent', () => {
            it('should skip agent and update state', async () => {
                const error = createWorkflowError(
                    ERROR_TYPES.AGENT_FAILURE,
                    'Agent failed',
                    { agent_name: 'Research Agent' }
                );

                const state = {
                    current_phase: 'research',
                    phase_details: {
                        active_agents: [
                            { name: 'Research Agent' },
                            { name: 'Finance Agent' }
                        ]
                    }
                };

                fs.readFileSync.mockReturnValue(JSON.stringify(state));

                let savedState;
                fs.writeFileSync.mockImplementation((path, data) => {
                    savedState = JSON.parse(data);
                });

                const result = await skipFailedAgent(error, {});

                expect(result.success).toBe(true);
                expect(savedState.skipped_agents).toHaveLength(1);
                expect(savedState.skipped_agents[0].agent_name).toBe('Research Agent');
                expect(savedState.phase_details.active_agents).toHaveLength(1);
                expect(savedState.phase_details.active_agents[0].name).toBe('Finance Agent');
            });
        });

        describe('enterSafeMode', () => {
            it('should enable safe mode with restrictions', async () => {
                const state = {
                    workflow_id: 'test',
                    parallel_mode: true
                };

                fs.readFileSync.mockReturnValue(JSON.stringify(state));

                let savedState;
                fs.writeFileSync.mockImplementation((path, data) => {
                    savedState = JSON.parse(data);
                });

                const result = await enterSafeMode({ workflow_id: 'test' });

                expect(result.success).toBe(true);
                expect(savedState.safe_mode.enabled).toBe(true);
                expect(savedState.safe_mode.restrictions).toBeDefined();
                expect(savedState.parallel_mode).toBe(false);
            });
        });
    });

    describe('Error Logging', () => {
        it('should create error log files', async () => {
            const error = new WorkflowError(
                ERROR_TYPES.VALIDATION_ERROR,
                'Validation failed'
            );

            await handleWorkflowError(error, { workflow_id: 'test' });

            // Check that error log was created
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.stringContaining('error-'),
                expect.stringContaining('VALIDATION_ERROR')
            );

            // Check that main log was appended
            expect(fs.appendFileSync).toHaveBeenCalledWith(
                expect.stringContaining('workflow-errors.log'),
                expect.stringContaining('VALIDATION_ERROR')
            );
        });
    });

    describe('Manual Intervention', () => {
        it('should provide detailed instructions for manual intervention', async () => {
            const error = new WorkflowError(
                ERROR_TYPES.AGENT_FAILURE,
                'Critical agent failure',
                { agent_name: 'Security Agent', critical: true }
            );

            const result = await handleWorkflowError(error);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Manual intervention required');
            expect(result.instructions).toContain('Security Agent');
            expect(result.instructions).toContain('/workflow-recovery');
        });
    });
});