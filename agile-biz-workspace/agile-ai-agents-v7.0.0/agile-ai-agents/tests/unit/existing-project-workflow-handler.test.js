/**
 * Unit tests for Existing Project Workflow Handler
 */

const { handleExistingProjectWorkflow } = require('../../machine-data/scripts/existing-project-workflow-handler');

// Mock dependencies
jest.mock('../../machine-data/scripts/workflow-state-handler');
jest.mock('../../machine-data/scripts/workflow-progress-formatter');

const mockWorkflowStateHandler = require('../../machine-data/scripts/workflow-state-handler');
const mockProgressFormatter = require('../../machine-data/scripts/workflow-progress-formatter');

// Suppress console output during tests
const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
});
afterAll(() => {
    console.log = originalConsoleLog;
});

describe('Existing Project Workflow Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mock implementations
        mockWorkflowStateHandler.getCurrentWorkflowState.mockReturnValue(null);
        mockWorkflowStateHandler.initializeWorkflow.mockReturnValue({
            workflow_id: 'test-existing-workflow-123',
            workflow_type: 'existing-project',
            current_phase: 'analyze'
        });
        mockProgressFormatter.formatWorkflowProgress.mockReturnValue('Workflow progress...');
        mockProgressFormatter.formatDetailedStatus.mockReturnValue('Detailed status...');
        mockProgressFormatter.formatDryRun.mockReturnValue('Dry run preview...');
    });

    describe('Command Parsing', () => {
        it('should handle status command', async () => {
            mockWorkflowStateHandler.getWorkflowStatus.mockReturnValue({
                active: true,
                workflow_type: 'existing-project',
                current_phase: 'discovery',
                phase_progress: 65
            });

            const result = await handleExistingProjectWorkflow(['--status']);

            expect(mockWorkflowStateHandler.getWorkflowStatus).toHaveBeenCalled();
            expect(mockProgressFormatter.formatDetailedStatus).toHaveBeenCalled();
            expect(result.message).toBe('Workflow status displayed above.');
        });

        it('should handle resume command', async () => {
            mockWorkflowStateHandler.resumeWorkflow.mockReturnValue({
                success: true,
                workflow: {
                    current_phase: 'assessment',
                    workflow_type: 'existing-project'
                },
                message: 'Resuming workflow...'
            });

            const result = await handleExistingProjectWorkflow(['--resume']);

            expect(mockWorkflowStateHandler.resumeWorkflow).toHaveBeenCalled();
            expect(result.message).toContain('Resumed workflow at phase: assessment');
        });

        it('should handle save-state command', async () => {
            mockWorkflowStateHandler.savePartialState.mockReturnValue({
                message: '✅ Workflow state saved',
                checkpoint_file: '/path/to/checkpoint.json'
            });

            const result = await handleExistingProjectWorkflow(['--save-state', 'Pausing for review']);

            expect(mockWorkflowStateHandler.savePartialState).toHaveBeenCalledWith('Pausing for review');
            expect(result.message).toBe('✅ Workflow state saved');
        });

        it('should handle dry-run command', async () => {
            const result = await handleExistingProjectWorkflow(['--dry-run']);

            expect(mockProgressFormatter.formatDryRun).toHaveBeenCalledWith('existing-project');
            expect(result.message).toBe('Dry run preview displayed above. No actions were taken.');
        });

        it('should handle parallel flag', async () => {
            const result = await handleExistingProjectWorkflow(['--parallel']);

            expect(mockWorkflowStateHandler.initializeWorkflow).toHaveBeenCalledWith(
                'existing-project',
                expect.objectContaining({ parallel: true })
            );
        });
    });

    describe('Workflow Initialization', () => {
        it('should initialize existing project workflow when none exists', async () => {
            const result = await handleExistingProjectWorkflow([]);

            expect(mockWorkflowStateHandler.getCurrentWorkflowState).toHaveBeenCalled();
            expect(mockWorkflowStateHandler.initializeWorkflow).toHaveBeenCalledWith(
                'existing-project',
                expect.objectContaining({ parallel: false, dryRun: false })
            );
            expect(result.message).toContain('Existing project workflow initialized');
            expect(result.workflow_id).toBe('test-existing-workflow-123');
        });

        it('should prevent initialization if workflow already active', async () => {
            mockWorkflowStateHandler.getCurrentWorkflowState.mockReturnValue({
                workflow_id: 'active-workflow',
                current_phase: 'planning',
                completed: false
            });

            const result = await handleExistingProjectWorkflow([]);

            expect(mockWorkflowStateHandler.initializeWorkflow).not.toHaveBeenCalled();
            expect(result.message).toContain('active workflow is already in progress');
            expect(result.message).toContain('planning');
        });

        it('should allow initialization if previous workflow completed', async () => {
            mockWorkflowStateHandler.getCurrentWorkflowState.mockReturnValue({
                workflow_id: 'completed-workflow',
                completed: true
            });

            const result = await handleExistingProjectWorkflow([]);

            expect(mockWorkflowStateHandler.initializeWorkflow).toHaveBeenCalled();
            expect(result.message).toContain('Existing project workflow initialized');
        });
    });

    describe('Error Handling', () => {
        it('should handle no active workflow for status', async () => {
            mockWorkflowStateHandler.getWorkflowStatus.mockReturnValue({
                active: false,
                message: 'No active workflow'
            });

            const result = await handleExistingProjectWorkflow(['--status']);

            expect(result.message).toContain('No active workflow');
        });

        it('should handle failed resume', async () => {
            mockWorkflowStateHandler.resumeWorkflow.mockReturnValue({
                success: false,
                message: '⚠️ Workflow is awaiting approval at post-analysis'
            });

            const result = await handleExistingProjectWorkflow(['--resume']);

            expect(result.message).toBe('⚠️ Workflow is awaiting approval at post-analysis');
        });

        it('should handle no workflow for save-state', async () => {
            mockWorkflowStateHandler.savePartialState.mockReturnValue(null);

            const result = await handleExistingProjectWorkflow(['--save-state']);

            expect(result.message).toBe('❌ No active workflow to save.');
        });
    });

    describe('Phase Management', () => {
        it('should update phase progress on initialization', async () => {
            await handleExistingProjectWorkflow([]);

            expect(mockWorkflowStateHandler.updatePhaseProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    active_agents: expect.arrayContaining([
                        expect.objectContaining({ name: 'Code Quality Agent' })
                    ]),
                    documents_total: 1,
                    documents_created: 0
                })
            );
        });

        it('should handle different phases for existing project', async () => {
            mockWorkflowStateHandler.initializeWorkflow.mockReturnValue({
                workflow_id: 'test-workflow',
                workflow_type: 'existing-project',
                current_phase: 'analyze'
            });

            await handleExistingProjectWorkflow([]);

            // Should include Code Quality Agent for analyze phase
            expect(mockWorkflowStateHandler.updatePhaseProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    active_agents: expect.arrayContaining([
                        expect.objectContaining({ 
                            name: 'Code Quality Agent',
                            status: 'Analyzing codebase architecture',
                            icon: '🔍'
                        })
                    ])
                })
            );
        });
    });

    describe('Multiple Arguments', () => {
        it('should handle multiple flags correctly', async () => {
            const result = await handleExistingProjectWorkflow(['--save-state', 'checkpoint note', '--parallel']);

            expect(mockWorkflowStateHandler.savePartialState).toHaveBeenCalledWith('checkpoint note');
        });

        it('should prioritize command flags over initialization', async () => {
            mockWorkflowStateHandler.getWorkflowStatus.mockReturnValue({
                active: true,
                workflow_type: 'existing-project'
            });

            await handleExistingProjectWorkflow(['--status', '--parallel']);

            expect(mockWorkflowStateHandler.initializeWorkflow).not.toHaveBeenCalled();
            expect(mockProgressFormatter.formatDetailedStatus).toHaveBeenCalled();
        });
    });

    describe('Workflow-Specific Features', () => {
        it('should have correct phase count for existing project', async () => {
            const result = await handleExistingProjectWorkflow([]);

            expect(result.message).toContain('Workflow has 6 phases');
        });

        it('should handle existing project approval gates', async () => {
            mockWorkflowStateHandler.getCurrentWorkflowState.mockReturnValue({
                workflow_type: 'existing-project',
                phase_index: 0,
                current_phase: 'analyze',
                awaiting_approval: 'post-analysis'
            });
            
            mockWorkflowStateHandler.resumeWorkflow.mockReturnValue({
                success: false,
                message: '⚠️ Workflow is awaiting approval at post-analysis'
            });

            const result = await handleExistingProjectWorkflow(['--resume']);

            expect(result.message).toContain('post-analysis');
        });

        it('should show correct agents for each phase', async () => {
            // Test that different phases have different agents
            const phases = ['analyze', 'discovery', 'assessment', 'planning', 'backlog', 'implementation'];
            
            for (const phase of phases) {
                jest.clearAllMocks();
                
                mockWorkflowStateHandler.initializeWorkflow.mockReturnValue({
                    workflow_id: 'test-workflow',
                    workflow_type: 'existing-project',
                    current_phase: phase
                });
                
                await handleExistingProjectWorkflow([]);
                
                const updateCall = mockWorkflowStateHandler.updatePhaseProgress.mock.calls[0][0];
                expect(updateCall.active_agents).toBeDefined();
                expect(updateCall.active_agents.length).toBeGreaterThan(0);
                
                // Each phase should have appropriate agents
                if (phase === 'analyze') {
                    expect(updateCall.active_agents).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({ name: 'Code Quality Agent' })
                        ])
                    );
                } else if (phase === 'planning') {
                    expect(updateCall.active_agents).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({ name: 'Sprint Planning Agent' })
                        ])
                    );
                }
            }
        });
    });

    describe('Save State with Different Notes', () => {
        it('should handle save-state without note', async () => {
            mockWorkflowStateHandler.savePartialState.mockReturnValue({
                message: '✅ Workflow state saved',
                checkpoint_file: '/path/to/checkpoint.json'
            });

            await handleExistingProjectWorkflow(['--save-state']);

            expect(mockWorkflowStateHandler.savePartialState).toHaveBeenCalledWith(undefined);
        });

        it('should handle save-state with multi-word note', async () => {
            mockWorkflowStateHandler.savePartialState.mockReturnValue({
                message: '✅ Workflow state saved',
                checkpoint_file: '/path/to/checkpoint.json'
            });

            await handleExistingProjectWorkflow(['--save-state', 'Taking', 'a', 'break', 'for', 'lunch']);

            expect(mockWorkflowStateHandler.savePartialState).toHaveBeenCalledWith('Taking a break for lunch');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty arguments array', async () => {
            const result = await handleExistingProjectWorkflow([]);

            expect(result).toBeDefined();
            expect(result.workflow_id).toBeDefined();
        });

        it('should handle unknown flags gracefully', async () => {
            const result = await handleExistingProjectWorkflow(['--unknown-flag']);

            // Should still initialize workflow as unknown flags are ignored
            expect(mockWorkflowStateHandler.initializeWorkflow).toHaveBeenCalled();
        });

        it('should handle initialization failure', async () => {
            mockWorkflowStateHandler.initializeWorkflow.mockThrowError(new Error('Failed to initialize'));

            await expect(handleExistingProjectWorkflow([])).rejects.toThrow('Failed to initialize');
        });
    });
});