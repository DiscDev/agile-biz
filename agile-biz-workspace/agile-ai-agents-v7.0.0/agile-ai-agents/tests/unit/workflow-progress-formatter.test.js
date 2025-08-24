/**
 * Unit tests for Workflow Progress Formatter
 */

const {
    formatWorkflowProgress,
    formatDetailedStatus,
    formatApprovalGate,
    formatDryRun
} = require('../../machine-data/scripts/workflow-progress-formatter');

// Mock the workflow state handler
jest.mock('../../machine-data/scripts/workflow-state-handler', () => ({
    getCurrentWorkflowState: jest.fn(),
    WORKFLOW_PHASES: {
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
            phases: ['analyze', 'discovery', 'assessment', 'planning', 'backlog', 'implementation'],
            approvalGates: {
                'post-analysis': { after: 'analyze', before: 'discovery' },
                'pre-implementation': { after: 'backlog', before: 'implementation' }
            },
            phaseDurations: {
                analyze: '2-4 hours',
                discovery: '2-3 hours',
                assessment: '1-2 hours',
                planning: '3-4 hours',
                backlog: '2-3 hours',
                implementation: 'Ongoing'
            }
        }
    }
}));

const { getCurrentWorkflowState } = require('../../machine-data/scripts/workflow-state-handler');

describe('Workflow Progress Formatter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('formatWorkflowProgress', () => {
        it('should show no active workflow message', () => {
            getCurrentWorkflowState.mockReturnValue(null);

            const output = formatWorkflowProgress();

            expect(output).toContain('No active workflow');
            expect(output).toContain('/start-new-project-workflow');
            expect(output).toContain('/start-existing-project-workflow');
        });

        it('should format active new project workflow', () => {
            const mockState = {
                workflow_type: 'new-project',
                phase_index: 1,
                current_phase: 'research',
                phase_details: {
                    name: 'Market Research & Analysis',
                    progress_percentage: 45,
                    active_agents: [
                        { name: 'Research Agent', status: 'Analyzing market trends', icon: '🔍' },
                        { name: 'Finance Agent', status: 'Calculating projections', icon: '💰' }
                    ],
                    documents_created: 8,
                    documents_total: 14,
                    estimated_time_remaining: '2.5 hours',
                    started_at: new Date(Date.now() - 75 * 60 * 1000).toISOString() // 1h 15m ago
                }
            };

            getCurrentWorkflowState.mockReturnValue(mockState);

            const output = formatWorkflowProgress();

            expect(output).toContain('🚀 New Project Workflow Progress');
            expect(output).toContain('Market Research & Analysis (2 of 8)');
            expect(output).toContain('45%');
            expect(output).toContain('█████████░░░░░░░░░░');
            expect(output).toContain('Active Agents (2)');
            expect(output).toContain('Research Agent: Analyzing market trends');
            expect(output).toContain('Documents Created: 8 of 14');
        });

        it('should show approval gate warning', () => {
            const mockState = {
                workflow_type: 'existing-project',
                phase_index: 0,
                current_phase: 'analyze',
                awaiting_approval: 'post-analysis',
                phase_details: {
                    name: 'Code Analysis & Assessment',
                    progress_percentage: 100,
                    started_at: new Date().toISOString()
                }
            };

            getCurrentWorkflowState.mockReturnValue(mockState);

            const output = formatWorkflowProgress();

            expect(output).toContain('⚠️ **Awaiting Approval**');
            expect(output).toContain('post-analysis');
        });
    });

    describe('formatDetailedStatus', () => {
        it('should format detailed status with timeline', () => {
            const mockState = {
                workflow_id: 'workflow-2024-01-20-123456',
                workflow_type: 'new-project',
                started_at: new Date().toISOString(),
                parallel_mode: true,
                current_phase: 'research',
                phase_index: 1,
                phases_completed: ['discovery'],
                phase_details: {
                    progress_percentage: 45
                },
                checkpoints: {
                    last_save: new Date().toISOString(),
                    phase_checkpoints: {
                        discovery: new Date().toISOString()
                    }
                },
                approval_gates: {
                    'post-research': { approved: false }
                }
            };

            getCurrentWorkflowState.mockReturnValue(mockState);

            const output = formatDetailedStatus();

            expect(output).toContain('📊 Workflow Status Report');
            expect(output).toContain('workflow-2024-01-20-123456');
            expect(output).toContain('Parallel Mode: Enabled');
            expect(output).toContain('📅 Phase Timeline');
            expect(output).toContain('✅ **Stakeholder Discovery Interview**');
            expect(output).toContain('🔄 **Market Research & Analysis**');
            expect(output).toContain('In Progress (45%)');
            expect(output).toContain('○ **Analysis & Synthesis**');
            expect(output).toContain('Phases Completed: 1 of 8');
        });
    });

    describe('formatApprovalGate', () => {
        it('should format approval gate interface', () => {
            const mockState = {
                workflow_type: 'new-project',
                awaiting_approval: 'post-research',
                phase_details: {
                    started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                    documents_created: 14
                }
            };

            getCurrentWorkflowState.mockReturnValue(mockState);

            const output = formatApprovalGate('post-research');

            expect(output).toContain('🚦 Approval Gate: Post-Research Review');
            expect(output).toContain('📊 Phase Summary');
            expect(output).toContain('Market Research & Analysis');
            expect(output).toContain('Documents Created: 14');
            expect(output).toContain('🔍 Key Findings');
            expect(output).toContain('📁 Documents Available for Review');
            expect(output).toContain('🎯 Next Phase Preview');
            expect(output).toContain('Analysis & Synthesis');
            expect(output).toContain('⚙️ Modification Options');
            expect(output).toContain('[✅ Approve & Continue]');
        });

        it('should return no gate message if wrong gate', () => {
            const mockState = {
                awaiting_approval: 'different-gate'
            };

            getCurrentWorkflowState.mockReturnValue(mockState);

            const output = formatApprovalGate('post-research');

            expect(output).toBe('No approval gate pending.');
        });
    });

    describe('formatDryRun', () => {
        it('should format dry run for new project', () => {
            const output = formatDryRun('new-project');

            expect(output).toContain('🔍 Workflow Dry Run: New Project');
            expect(output).toContain('/start-new-project-workflow');
            expect(output).toContain('Sequential (with approval gates)');
            expect(output).toContain('24-32 hours');
            expect(output).toContain('1. ✅ **Stakeholder Discovery Interview**');
            expect(output).toContain('2. ✅ **Market Research & Analysis**');
            expect(output).toContain('🚦 **Approval Gate 1**');
            expect(output).toContain('8. ✅ **Sprint Implementation**');
            expect(output).toContain('This is a preview only');
        });

        it('should format dry run for existing project', () => {
            const output = formatDryRun('existing-project');

            expect(output).toContain('🔍 Workflow Dry Run: Existing Project');
            expect(output).toContain('/start-existing-project-workflow');
            expect(output).toContain('15-20 hours');
            expect(output).toContain('1. ✅ **Code Analysis & Assessment**');
            expect(output).toContain('6. ✅ **Implementation**');
        });
    });

    describe('Progress Bar Generation', () => {
        it('should generate correct progress bars', () => {
            const testCases = [
                { percentage: 0, expected: '░░░░░░░░░░░░░░░░░░░░' },
                { percentage: 25, expected: '█████░░░░░░░░░░░░░░░' },
                { percentage: 50, expected: '██████████░░░░░░░░░░' },
                { percentage: 75, expected: '███████████████░░░░░' },
                { percentage: 100, expected: '████████████████████' }
            ];

            testCases.forEach(({ percentage, expected }) => {
                const mockState = {
                    workflow_type: 'new-project',
                    phase_index: 0,
                    current_phase: 'discovery',
                    phase_details: {
                        name: 'Test Phase',
                        progress_percentage: percentage,
                        started_at: new Date().toISOString()
                    }
                };

                getCurrentWorkflowState.mockReturnValue(mockState);
                const output = formatWorkflowProgress();
                
                expect(output).toContain(expected);
                expect(output).toContain(`${percentage}%`);
            });
        });
    });

    describe('Time Formatting', () => {
        it('should format elapsed time correctly', () => {
            const testCases = [
                { minutesAgo: 45, expected: 'Time Elapsed: 45m' },
                { minutesAgo: 90, expected: 'Time Elapsed: 1h 30m' },
                { minutesAgo: 180, expected: 'Time Elapsed: 3h 0m' }
            ];

            testCases.forEach(({ minutesAgo, expected }) => {
                const mockState = {
                    workflow_type: 'new-project',
                    phase_index: 0,
                    current_phase: 'discovery',
                    phase_details: {
                        name: 'Test Phase',
                        progress_percentage: 50,
                        started_at: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
                        estimated_time_remaining: '1 hour'
                    }
                };

                getCurrentWorkflowState.mockReturnValue(mockState);
                const output = formatWorkflowProgress();
                
                expect(output).toContain(expected);
            });
        });
    });
});