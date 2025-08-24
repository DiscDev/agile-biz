/**
 * Unit tests for Workflow State Handler
 */

const fs = require('fs');
const path = require('path');
const {
    initializeWorkflow,
    getCurrentWorkflowState,
    saveWorkflowState,
    updatePhaseProgress,
    completePhase,
    savePartialState,
    resumeWorkflow,
    getWorkflowStatus,
    approveGate,
    WORKFLOW_PHASES
} = require('../../machine-data/scripts/workflow-state-handler');

// Mock fs module
jest.mock('fs');

describe('Workflow State Handler', () => {
    const mockWorkflowStateDir = '/mock/workflow-states';
    const mockCurrentWorkflowFile = '/mock/workflow-states/current-workflow.json';
    
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Mock directory existence
        fs.existsSync.mockReturnValue(true);
        fs.mkdirSync.mockReturnValue(true);
    });

    describe('initializeWorkflow', () => {
        it('should initialize a new project workflow', () => {
            const mockState = {};
            fs.writeFileSync.mockImplementation((path, data) => {
                Object.assign(mockState, JSON.parse(data));
            });

            const workflow = initializeWorkflow('new-project', { parallel: true });

            expect(workflow.workflow_type).toBe('new-project');
            expect(workflow.current_phase).toBe('discovery');
            expect(workflow.phase_index).toBe(0);
            expect(workflow.parallel_mode).toBe(true);
            expect(workflow.phases_completed).toEqual([]);
            expect(workflow.can_resume).toBe(true);
        });

        it('should initialize an existing project workflow', () => {
            const mockState = {};
            fs.writeFileSync.mockImplementation((path, data) => {
                Object.assign(mockState, JSON.parse(data));
            });

            const workflow = initializeWorkflow('existing-project');

            expect(workflow.workflow_type).toBe('existing-project');
            expect(workflow.current_phase).toBe('analyze');
            expect(workflow.phase_index).toBe(0);
            expect(workflow.parallel_mode).toBe(false);
        });

        it('should generate unique workflow IDs', () => {
            fs.writeFileSync.mockImplementation(() => {});

            const workflow1 = initializeWorkflow('new-project');
            const workflow2 = initializeWorkflow('new-project');

            expect(workflow1.workflow_id).not.toBe(workflow2.workflow_id);
        });
    });

    describe('getCurrentWorkflowState', () => {
        it('should return null if no workflow exists', () => {
            fs.existsSync.mockReturnValue(false);

            const state = getCurrentWorkflowState();

            expect(state).toBeNull();
        });

        it('should return current workflow state', () => {
            const mockState = {
                workflow_id: 'test-workflow',
                current_phase: 'research'
            };
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));

            const state = getCurrentWorkflowState();

            expect(state).toEqual(mockState);
        });
    });

    describe('updatePhaseProgress', () => {
        it('should update phase progress details', () => {
            const mockState = {
                workflow_id: 'test-workflow',
                phase_details: {
                    progress_percentage: 0,
                    documents_created: 0,
                    documents_total: 10
                }
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            fs.writeFileSync.mockImplementation(() => {});

            const progressData = {
                active_agents: [{ name: 'Test Agent' }],
                documents_created: 5,
                documents_total: 10
            };

            const updated = updatePhaseProgress(progressData);

            expect(updated.phase_details.documents_created).toBe(5);
            expect(updated.phase_details.progress_percentage).toBe(50);
        });
    });

    describe('completePhase', () => {
        it('should complete current phase and move to next', () => {
            const mockState = {
                workflow_type: 'new-project',
                current_phase: 'discovery',
                phase_index: 0,
                phases_completed: [],
                approval_gates: {
                    'post-research': { approved: false }
                },
                checkpoints: {
                    phase_checkpoints: {}
                }
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            let savedState;
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('current-workflow.json')) {
                    savedState = JSON.parse(data);
                }
            });

            const result = completePhase({ summary: 'Phase completed' });

            expect(savedState.phases_completed).toContain('discovery');
            expect(savedState.current_phase).toBe('research');
            expect(savedState.phase_index).toBe(1);
        });

        it('should pause at approval gate', () => {
            const mockState = {
                workflow_type: 'new-project',
                current_phase: 'research',
                phase_index: 1,
                phases_completed: ['discovery'],
                approval_gates: {
                    'post-research': { approved: false }
                },
                checkpoints: {
                    phase_checkpoints: {}
                }
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            let savedState;
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('current-workflow.json')) {
                    savedState = JSON.parse(data);
                }
            });

            const result = completePhase();

            expect(savedState.awaiting_approval).toBe('post-research');
            expect(savedState.can_resume).toBe(false);
        });
    });

    describe('savePartialState', () => {
        it('should save partial state with checkpoint', () => {
            const mockState = {
                workflow_id: 'test-workflow',
                current_phase: 'research',
                phase_details: {
                    progress_percentage: 45
                },
                checkpoints: {}
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            let checkpointData;
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('partial')) {
                    checkpointData = JSON.parse(data);
                }
            });

            const result = savePartialState('Taking a break');

            expect(result.message).toContain('Workflow state saved');
            expect(checkpointData.user_note).toBe('Taking a break');
            expect(checkpointData.phase).toBe('research');
            expect(checkpointData.phase_progress).toBe(45);
        });
    });

    describe('resumeWorkflow', () => {
        it('should resume workflow successfully', () => {
            const mockState = {
                workflow_id: 'test-workflow',
                current_phase: 'research',
                can_resume: true
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));

            const result = resumeWorkflow();

            expect(result.success).toBe(true);
            expect(result.workflow).toEqual(mockState);
            expect(result.message).toContain('Resuming');
        });

        it('should fail if awaiting approval', () => {
            const mockState = {
                workflow_id: 'test-workflow',
                awaiting_approval: 'post-research',
                can_resume: false
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));

            const result = resumeWorkflow();

            expect(result.success).toBe(false);
            expect(result.message).toContain('awaiting approval');
        });
    });

    describe('getWorkflowStatus', () => {
        it('should return detailed workflow status', () => {
            const mockState = {
                workflow_type: 'new-project',
                current_phase: 'research',
                phase_index: 1,
                phases_completed: ['discovery'],
                phase_details: {
                    progress_percentage: 45,
                    active_agents: [{ name: 'Research Agent' }]
                },
                started_at: new Date().toISOString(),
                can_resume: true
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));

            const status = getWorkflowStatus();

            expect(status.active).toBe(true);
            expect(status.workflow_type).toBe('new-project');
            expect(status.current_phase).toBe('research');
            expect(status.phase_progress).toBe(45);
            expect(status.overall_progress).toBe(12); // 1 of 8 phases = 12.5%
            expect(status.phases_completed).toBe(1);
            expect(status.phases_total).toBe(8);
        });

        it('should return inactive status when no workflow', () => {
            fs.existsSync.mockReturnValue(false);

            const status = getWorkflowStatus();

            expect(status.active).toBe(false);
            expect(status.message).toBe('No active workflow');
        });
    });

    describe('approveGate', () => {
        it('should approve gate and continue workflow', () => {
            const mockState = {
                workflow_type: 'new-project',
                phase_index: 1,
                awaiting_approval: 'post-research',
                approval_gates: {
                    'post-research': {
                        approved: false
                    }
                },
                can_resume: false
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            let savedState;
            fs.writeFileSync.mockImplementation((path, data) => {
                savedState = JSON.parse(data);
            });

            const result = approveGate('post-research', { notes: 'Looks good' });

            expect(result.success).toBe(true);
            expect(savedState.approval_gates['post-research'].approved).toBe(true);
            expect(savedState.awaiting_approval).toBeNull();
            expect(savedState.can_resume).toBe(true);
            expect(savedState.current_phase).toBe('analysis');
        });

        it('should fail if wrong gate', () => {
            const mockState = {
                awaiting_approval: 'post-research'
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));

            const result = approveGate('wrong-gate');

            expect(result.success).toBe(false);
            expect(result.message).toContain('No approval pending');
        });
    });

    describe('WORKFLOW_PHASES', () => {
        it('should have correct phase definitions', () => {
            expect(WORKFLOW_PHASES['new-project'].phases).toHaveLength(8);
            expect(WORKFLOW_PHASES['new-project'].phases[0]).toBe('discovery');
            expect(WORKFLOW_PHASES['new-project'].phases[7]).toBe('sprint');

            expect(WORKFLOW_PHASES['existing-project'].phases).toHaveLength(6);
            expect(WORKFLOW_PHASES['existing-project'].phases[0]).toBe('analyze');
            expect(WORKFLOW_PHASES['existing-project'].phases[5]).toBe('implementation');
        });

        it('should have approval gates defined', () => {
            const newProjectGates = WORKFLOW_PHASES['new-project'].approvalGates;
            expect(Object.keys(newProjectGates)).toHaveLength(3);
            expect(newProjectGates['post-research'].after).toBe('research');
            expect(newProjectGates['post-research'].before).toBe('analysis');

            const existingProjectGates = WORKFLOW_PHASES['existing-project'].approvalGates;
            expect(Object.keys(existingProjectGates)).toHaveLength(2);
            expect(existingProjectGates['post-analysis'].after).toBe('analyze');
        });
    });
});