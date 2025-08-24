/**
 * Integration tests for Approval Gates System
 * 
 * Tests the full flow of approval gates across workflow phases
 */

const fs = require('fs');
const path = require('path');
const { 
    initializeWorkflow, 
    completePhase, 
    approveGate,
    getCurrentWorkflowState,
    resumeWorkflow,
    getWorkflowStatus
} = require('../../machine-data/scripts/workflow-state-handler');
const { handleNewProjectWorkflow } = require('../../machine-data/scripts/new-project-workflow-handler');
const { handleExistingProjectWorkflow } = require('../../machine-data/scripts/existing-project-workflow-handler');
const { formatApprovalGate } = require('../../machine-data/scripts/workflow-progress-formatter');

// Mock file system
jest.mock('fs');

// Test state directory
const mockStateDir = path.join(__dirname, 'test-workflow-states');

describe('Approval Gates Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup mock file system
        fs.existsSync.mockReturnValue(true);
        fs.mkdirSync.mockReturnValue(true);
        fs.writeFileSync.mockImplementation(() => {});
        
        // Clear any existing state
        fs.readFileSync.mockReturnValue(JSON.stringify(null));
    });

    describe('New Project Workflow Approval Gates', () => {
        it('should pause at post-research approval gate', async () => {
            // Initialize workflow
            const workflow = initializeWorkflow('new-project');
            expect(workflow.current_phase).toBe('discovery');
            
            // Mock file system to persist state
            let currentState = workflow;
            fs.readFileSync.mockImplementation(() => JSON.stringify(currentState));
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('current-workflow.json')) {
                    currentState = JSON.parse(data);
                }
            });
            
            // Complete discovery phase
            const afterDiscovery = completePhase({ summary: 'Discovery complete' });
            expect(afterDiscovery.message).toContain('Phase completed');
            expect(currentState.current_phase).toBe('research');
            expect(currentState.phases_completed).toContain('discovery');
            
            // Complete research phase - should trigger approval gate
            const afterResearch = completePhase({ summary: 'Research complete' });
            expect(afterResearch.message).toContain('Approval required');
            expect(currentState.awaiting_approval).toBe('post-research');
            expect(currentState.can_resume).toBe(false);
            expect(currentState.current_phase).toBe('research'); // Still on research
        });

        it('should not allow resume while awaiting approval', async () => {
            // Setup state awaiting approval
            const mockState = {
                workflow_type: 'new-project',
                current_phase: 'research',
                awaiting_approval: 'post-research',
                can_resume: false
            };
            
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            // Try to resume
            const result = resumeWorkflow();
            expect(result.success).toBe(false);
            expect(result.message).toContain('awaiting approval');
            expect(result.approval_gate).toBe('post-research');
        });

        it('should continue workflow after approval', async () => {
            // Setup state awaiting approval
            let currentState = {
                workflow_type: 'new-project',
                current_phase: 'research',
                phase_index: 1,
                awaiting_approval: 'post-research',
                approval_gates: {
                    'post-research': { approved: false }
                },
                can_resume: false
            };
            
            fs.readFileSync.mockImplementation(() => JSON.stringify(currentState));
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('current-workflow.json')) {
                    currentState = JSON.parse(data);
                }
            });
            
            // Approve the gate
            const approvalResult = approveGate('post-research', {
                notes: 'Research looks good, proceed to analysis',
                approved_by: 'stakeholder@example.com'
            });
            
            expect(approvalResult.success).toBe(true);
            expect(currentState.approval_gates['post-research'].approved).toBe(true);
            expect(currentState.approval_gates['post-research'].notes).toBe('Research looks good, proceed to analysis');
            expect(currentState.awaiting_approval).toBeNull();
            expect(currentState.can_resume).toBe(true);
            expect(currentState.current_phase).toBe('analysis'); // Moved to next phase
        });

        it('should handle all three approval gates in sequence', async () => {
            let currentState = initializeWorkflow('new-project');
            
            fs.readFileSync.mockImplementation(() => JSON.stringify(currentState));
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('current-workflow.json')) {
                    currentState = JSON.parse(data);
                }
            });
            
            // Progress through all phases and gates
            const phasesBeforeGates = [
                { phase: 'discovery', nextPhase: 'research' },
                { phase: 'research', gate: 'post-research', nextPhase: 'analysis' },
                { phase: 'analysis', nextPhase: 'requirements' },
                { phase: 'requirements', gate: 'post-requirements', nextPhase: 'planning' },
                { phase: 'planning', nextPhase: 'backlog' },
                { phase: 'backlog', nextPhase: 'scaffold' },
                { phase: 'scaffold', gate: 'pre-implementation', nextPhase: 'sprint' }
            ];
            
            for (const phaseInfo of phasesBeforeGates) {
                // Complete the phase
                const result = completePhase({ summary: `${phaseInfo.phase} complete` });
                
                if (phaseInfo.gate) {
                    // Should be awaiting approval
                    expect(currentState.awaiting_approval).toBe(phaseInfo.gate);
                    expect(result.message).toContain('Approval required');
                    
                    // Approve the gate
                    const approval = approveGate(phaseInfo.gate, {
                        notes: `Approving ${phaseInfo.gate}`,
                        approved_by: 'stakeholder@example.com'
                    });
                    
                    expect(approval.success).toBe(true);
                    expect(currentState.current_phase).toBe(phaseInfo.nextPhase);
                } else {
                    // Should move to next phase directly
                    expect(currentState.current_phase).toBe(phaseInfo.nextPhase);
                    expect(currentState.awaiting_approval).toBeNull();
                }
            }
            
            // Final phase should be sprint
            expect(currentState.current_phase).toBe('sprint');
            expect(currentState.phases_completed).toHaveLength(7); // All phases except sprint
        });
    });

    describe('Existing Project Workflow Approval Gates', () => {
        it('should handle two approval gates correctly', async () => {
            let currentState = initializeWorkflow('existing-project');
            
            fs.readFileSync.mockImplementation(() => JSON.stringify(currentState));
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('current-workflow.json')) {
                    currentState = JSON.parse(data);
                }
            });
            
            // Progress through phases
            const phases = [
                { phase: 'analyze', gate: 'post-analysis', nextPhase: 'discovery' },
                { phase: 'discovery', nextPhase: 'assessment' },
                { phase: 'assessment', nextPhase: 'planning' },
                { phase: 'planning', nextPhase: 'backlog' },
                { phase: 'backlog', gate: 'pre-implementation', nextPhase: 'implementation' }
            ];
            
            for (const phaseInfo of phases) {
                const result = completePhase({ summary: `${phaseInfo.phase} complete` });
                
                if (phaseInfo.gate) {
                    expect(currentState.awaiting_approval).toBe(phaseInfo.gate);
                    
                    const approval = approveGate(phaseInfo.gate, {
                        notes: `Approving ${phaseInfo.gate}`
                    });
                    
                    expect(approval.success).toBe(true);
                    expect(currentState.current_phase).toBe(phaseInfo.nextPhase);
                } else {
                    expect(currentState.current_phase).toBe(phaseInfo.nextPhase);
                }
            }
        });
    });

    describe('Approval Gate UI Integration', () => {
        it('should format approval gate interface correctly', () => {
            const mockState = {
                workflow_type: 'new-project',
                awaiting_approval: 'post-research',
                phase_details: {
                    started_at: new Date().toISOString(),
                    documents_created: 14
                }
            };
            
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            const formatted = formatApprovalGate('post-research');
            
            expect(formatted).toContain('Approval Gate: Post-Research Review');
            expect(formatted).toContain('Documents Created: 14');
            expect(formatted).toContain('Key Findings');
            expect(formatted).toContain('Next Phase Preview');
            expect(formatted).toContain('[✅ Approve & Continue]');
            expect(formatted).toContain('[🔄 Request Revisions]');
            expect(formatted).toContain('[❌ Reject & Stop]');
        });
    });

    describe('Command Handler Integration', () => {
        it('should handle approval gates through workflow command handlers', async () => {
            // Initialize workflow through command handler
            await handleNewProjectWorkflow([]);
            
            // Mock state progression to approval gate
            const mockState = {
                workflow_type: 'new-project',
                current_phase: 'research',
                awaiting_approval: 'post-research',
                can_resume: false
            };
            
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            // Try to resume through command handler
            const result = await handleNewProjectWorkflow(['--resume']);
            
            expect(result.message).toContain('awaiting approval');
        });
    });

    describe('Workflow Status with Approval Gates', () => {
        it('should show approval gate in workflow status', () => {
            const mockState = {
                workflow_type: 'existing-project',
                current_phase: 'analyze',
                phase_index: 0,
                awaiting_approval: 'post-analysis',
                phase_details: {
                    progress_percentage: 100
                },
                phases_completed: [],
                started_at: new Date().toISOString()
            };
            
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            const status = getWorkflowStatus();
            
            expect(status.active).toBe(true);
            expect(status.awaiting_approval).toBe('post-analysis');
            expect(status.can_resume).toBe(false);
            expect(status.phase_progress).toBe(100);
        });
    });

    describe('Error Handling', () => {
        it('should prevent approving wrong gate', () => {
            const mockState = {
                workflow_type: 'new-project',
                awaiting_approval: 'post-research'
            };
            
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            const result = approveGate('post-requirements');
            
            expect(result.success).toBe(false);
            expect(result.message).toContain('No approval pending for gate: post-requirements');
        });

        it('should prevent approving already approved gate', () => {
            const mockState = {
                workflow_type: 'new-project',
                awaiting_approval: null,
                approval_gates: {
                    'post-research': { approved: true }
                }
            };
            
            fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
            
            const result = approveGate('post-research');
            
            expect(result.success).toBe(false);
            expect(result.message).toContain('No approval pending');
        });
    });

    describe('State Persistence', () => {
        it('should persist approval information across sessions', async () => {
            // First session - reach approval gate
            let savedState;
            fs.writeFileSync.mockImplementation((path, data) => {
                if (path.includes('current-workflow.json')) {
                    savedState = data;
                }
            });
            
            const workflow = initializeWorkflow('new-project');
            
            // Progress to approval gate
            fs.readFileSync.mockReturnValue(JSON.stringify({
                ...workflow,
                current_phase: 'research',
                phase_index: 1,
                phases_completed: ['discovery']
            }));
            
            completePhase();
            
            // Verify state was saved
            expect(savedState).toBeDefined();
            const parsedState = JSON.parse(savedState);
            expect(parsedState.awaiting_approval).toBe('post-research');
            
            // Second session - load saved state
            fs.readFileSync.mockReturnValue(savedState);
            
            const loadedState = getCurrentWorkflowState();
            expect(loadedState.awaiting_approval).toBe('post-research');
            expect(loadedState.can_resume).toBe(false);
        });
    });
});