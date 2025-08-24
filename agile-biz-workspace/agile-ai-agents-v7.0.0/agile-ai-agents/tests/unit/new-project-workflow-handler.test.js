/**
 * Unit tests for New Project Workflow Handler
 */

const { handleNewProjectWorkflow } = require('../../machine-data/scripts/new-project-workflow-handler');

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

describe('New Project Workflow Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mock implementations
        mockWorkflowStateHandler.getCurrentWorkflowState.mockReturnValue(null);
        mockWorkflowStateHandler.initializeWorkflow.mockReturnValue({
            workflow_id: 'test-workflow-123',
            workflow_type: 'new-project',
            current_phase: 'discovery'
        });
        mockProgressFormatter.formatWorkflowProgress.mockReturnValue('Workflow progress...');
        mockProgressFormatter.formatDetailedStatus.mockReturnValue('Detailed status...');
        mockProgressFormatter.formatDryRun.mockReturnValue('Dry run preview...');
    });

    describe('Command Parsing', () => {
        it('should handle status command', async () => {
            mockWorkflowStateHandler.getWorkflowStatus.mockReturnValue({
                active: true,
                workflow_type: 'new-project',
                current_phase: 'research',
                phase_progress: 45
            });

            const result = await handleNewProjectWorkflow(['--status']);

            expect(mockWorkflowStateHandler.getWorkflowStatus).toHaveBeenCalled();
            expect(mockProgressFormatter.formatDetailedStatus).toHaveBeenCalled();
            expect(result.message).toBe('Workflow status displayed above.');
        });

        it('should handle resume command', async () => {
            mockWorkflowStateHandler.resumeWorkflow.mockReturnValue({
                success: true,
                workflow: {
                    current_phase: 'research',
                    workflow_type: 'new-project'
                },
                message: 'Resuming workflow...'
            });

            const result = await handleNewProjectWorkflow(['--resume']);

            expect(mockWorkflowStateHandler.resumeWorkflow).toHaveBeenCalled();
            expect(result.message).toContain('Resumed workflow at phase: research');
        });

        it('should handle save-state command', async () => {
            mockWorkflowStateHandler.savePartialState.mockReturnValue({
                message: '✅ Workflow state saved',
                checkpoint_file: '/path/to/checkpoint.json'
            });

            const result = await handleNewProjectWorkflow(['--save-state', 'Taking a break']);

            expect(mockWorkflowStateHandler.savePartialState).toHaveBeenCalledWith('Taking a break');
            expect(result.message).toBe('✅ Workflow state saved');
        });

        it('should handle dry-run command', async () => {
            const result = await handleNewProjectWorkflow(['--dry-run']);

            expect(mockProgressFormatter.formatDryRun).toHaveBeenCalledWith('new-project');
            expect(result.message).toBe('Dry run preview displayed above. No actions were taken.');
        });

        it('should handle parallel flag', async () => {
            const result = await handleNewProjectWorkflow(['--parallel']);

            expect(mockWorkflowStateHandler.initializeWorkflow).toHaveBeenCalledWith(
                'new-project',
                expect.objectContaining({ parallel: true })
            );
        });
    });

    describe('Workflow Initialization', () => {
        it('should initialize new workflow when none exists', async () => {
            const result = await handleNewProjectWorkflow([]);

            expect(mockWorkflowStateHandler.getCurrentWorkflowState).toHaveBeenCalled();
            expect(mockWorkflowStateHandler.initializeWorkflow).toHaveBeenCalledWith(
                'new-project',
                expect.objectContaining({ parallel: false, dryRun: false })
            );
            expect(result.message).toContain('New project workflow initialized');
            expect(result.workflow_id).toBe('test-workflow-123');
        });

        it('should prevent initialization if workflow already active', async () => {
            mockWorkflowStateHandler.getCurrentWorkflowState.mockReturnValue({
                workflow_id: 'existing-workflow',
                current_phase: 'research',
                completed: false
            });

            const result = await handleNewProjectWorkflow([]);

            expect(mockWorkflowStateHandler.initializeWorkflow).not.toHaveBeenCalled();
            expect(result.message).toContain('active workflow is already in progress');
            expect(result.message).toContain('research');
        });

        it('should allow initialization if previous workflow completed', async () => {
            mockWorkflowStateHandler.getCurrentWorkflowState.mockReturnValue({
                workflow_id: 'old-workflow',
                completed: true
            });

            const result = await handleNewProjectWorkflow([]);

            expect(mockWorkflowStateHandler.initializeWorkflow).toHaveBeenCalled();
            expect(result.message).toContain('New project workflow initialized');
        });
    });

    describe('Error Handling', () => {
        it('should handle no active workflow for status', async () => {
            mockWorkflowStateHandler.getWorkflowStatus.mockReturnValue({
                active: false,
                message: 'No active workflow'
            });

            const result = await handleNewProjectWorkflow(['--status']);

            expect(result.message).toContain('No active workflow');
        });

        it('should handle failed resume', async () => {
            mockWorkflowStateHandler.resumeWorkflow.mockReturnValue({
                success: false,
                message: '⚠️ Workflow is awaiting approval'
            });

            const result = await handleNewProjectWorkflow(['--resume']);

            expect(result.message).toBe('⚠️ Workflow is awaiting approval');
        });

        it('should handle no workflow for save-state', async () => {
            mockWorkflowStateHandler.savePartialState.mockReturnValue(null);

            const result = await handleNewProjectWorkflow(['--save-state']);

            expect(result.message).toBe('❌ No active workflow to save.');
        });
    });

    describe('Phase Management', () => {
        it('should update phase progress on initialization', async () => {
            await handleNewProjectWorkflow([]);

            expect(mockWorkflowStateHandler.updatePhaseProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    active_agents: expect.arrayContaining([
                        expect.objectContaining({ name: 'Project Analyzer Agent' })
                    ]),
                    documents_total: 1,
                    documents_created: 0
                })
            );
        });
    });

    describe('Multiple Arguments', () => {
        it('should handle multiple flags correctly', async () => {
            const result = await handleNewProjectWorkflow(['--save-state', 'test note', '--parallel']);

            expect(mockWorkflowStateHandler.savePartialState).toHaveBeenCalledWith('test note');
        });

        it('should prioritize command flags over initialization', async () => {
            mockWorkflowStateHandler.getWorkflowStatus.mockReturnValue({
                active: true,
                workflow_type: 'new-project'
            });

            await handleNewProjectWorkflow(['--status', '--parallel']);

            expect(mockWorkflowStateHandler.initializeWorkflow).not.toHaveBeenCalled();
            expect(mockProgressFormatter.formatDetailedStatus).toHaveBeenCalled();
        });
    });
});