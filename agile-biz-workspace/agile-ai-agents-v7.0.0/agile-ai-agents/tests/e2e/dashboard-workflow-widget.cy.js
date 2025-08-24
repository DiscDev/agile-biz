/**
 * E2E tests for Dashboard Workflow Widget
 * 
 * Tests the workflow progress widget in the AgileAiAgents dashboard
 */

describe('Dashboard Workflow Widget E2E', () => {
    beforeEach(() => {
        // Intercept console errors to fail tests
        cy.on('window:before:load', (win) => {
            cy.stub(win.console, 'error').callsFake((msg) => {
                cy.task('consoleError', msg);
                throw new Error(msg);
            });
        });

        // Visit dashboard
        cy.visit('http://localhost:3001');
    });

    describe('Widget Loading', () => {
        it('should load workflow widget without errors', () => {
            cy.get('#workflow-progress-widget').should('exist');
            cy.get('.workflow-widget').should('be.visible');
            cy.get('.workflow-header h3').should('contain', 'Workflow Progress');
        });

        it('should show no active workflow initially', () => {
            cy.get('.no-workflow').should('be.visible');
            cy.get('.no-workflow p').should('contain', 'No active workflow');
            cy.get('.no-workflow code').should('contain', '/start-new-project-workflow');
        });

        it('should have control buttons', () => {
            cy.get('.workflow-controls button').should('have.length', 2);
            cy.get('.workflow-controls button').first().should('contain', 'Save State');
            cy.get('.workflow-controls button').last().should('contain', 'Details');
        });
    });

    describe('Active Workflow Display', () => {
        beforeEach(() => {
            // Mock active workflow response
            cy.intercept('GET', '/api/workflow/status', {
                statusCode: 200,
                body: {
                    active: true,
                    workflow_type: 'new-project',
                    current_phase: 'Market Research & Analysis',
                    phase_progress: 45,
                    overall_progress: 25,
                    phases_completed: 2,
                    phases_total: 8,
                    started_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
                    active_agents: [
                        { name: 'Research Agent', status: 'Analyzing market trends', icon: '🔍' },
                        { name: 'Finance Agent', status: 'Calculating projections', icon: '💰' }
                    ],
                    documents_created: 8,
                    documents_total: 14,
                    can_resume: true
                }
            }).as('getWorkflowStatus');

            cy.visit('http://localhost:3001');
            cy.wait('@getWorkflowStatus');
        });

        it('should display active workflow information', () => {
            cy.get('.workflow-active').should('be.visible');
            cy.get('.workflow-title').should('contain', '🆕 New Project Workflow');
            cy.get('.phase-info h4').should('contain', 'Market Research & Analysis');
            cy.get('.progress-text').should('contain', '45%');
        });

        it('should show workflow statistics', () => {
            cy.get('.workflow-stats .stat').should('have.length', 3);
            cy.get('.workflow-stats .stat').eq(0).should('contain', 'Overall:').and('contain', '25%');
            cy.get('.workflow-stats .stat').eq(1).should('contain', 'Phase:').and('contain', '2/8');
            cy.get('.workflow-stats .stat').eq(2).should('contain', 'Time:').and('contain', '1h 30m');
        });

        it('should display active agents', () => {
            cy.get('.active-agents').should('be.visible');
            cy.get('.active-agents h4').should('contain', 'Active Agents (2)');
            cy.get('.agent-item').should('have.length', 2);
            cy.get('.agent-item').first().should('contain', 'Research Agent');
            cy.get('.agent-item').first().should('contain', 'Analyzing market trends');
        });

        it('should show document progress', () => {
            cy.get('.document-progress').should('be.visible');
            cy.get('.doc-stats').should('contain', '8 of 14 created');
            cy.get('.doc-stats .percentage').should('contain', '57%');
            cy.get('.mini-progress-fill').should('have.css', 'width').and('match', /57/);
        });

        it('should update progress periodically', () => {
            // Mock updated status
            cy.intercept('GET', '/api/workflow/status', {
                statusCode: 200,
                body: {
                    active: true,
                    workflow_type: 'new-project',
                    current_phase: 'Market Research & Analysis',
                    phase_progress: 55, // Increased from 45
                    overall_progress: 25,
                    phases_completed: 2,
                    phases_total: 8,
                    documents_created: 10, // Increased from 8
                    documents_total: 14
                }
            }).as('getUpdatedStatus');

            // Wait for automatic update (5 seconds)
            cy.wait(5500);
            cy.wait('@getUpdatedStatus');

            // Check updated values
            cy.get('.progress-text').should('contain', '55%');
            cy.get('.doc-stats').should('contain', '10 of 14 created');
        });
    });

    describe('Approval Gate Display', () => {
        beforeEach(() => {
            cy.intercept('GET', '/api/workflow/status', {
                statusCode: 200,
                body: {
                    active: true,
                    workflow_type: 'existing-project',
                    current_phase: 'Code Analysis',
                    phase_progress: 100,
                    awaiting_approval: 'post-analysis',
                    can_resume: false,
                    phases_completed: 1,
                    phases_total: 6
                }
            }).as('getApprovalStatus');

            cy.visit('http://localhost:3001');
            cy.wait('@getApprovalStatus');
        });

        it('should show approval alert', () => {
            cy.get('.approval-alert').should('be.visible');
            cy.get('.approval-alert strong').should('contain', 'Approval Required');
            cy.get('.approval-alert p').should('contain', 'Post-Analysis Review');
            cy.get('.approval-alert button').should('contain', 'Review & Approve');
        });

        it('should open approval interface on button click', () => {
            cy.window().then((win) => {
                cy.stub(win.console, 'log').as('consoleLog');
            });

            cy.get('.approval-alert button').click();
            cy.get('@consoleLog').should('be.calledWith', 'Opening approval interface for:', 'post-analysis');
        });
    });

    describe('Control Buttons', () => {
        beforeEach(() => {
            cy.intercept('GET', '/api/workflow/status', {
                statusCode: 200,
                body: { active: true, workflow_type: 'new-project' }
            }).as('getStatus');

            cy.visit('http://localhost:3001');
            cy.wait('@getStatus');
        });

        it('should save state when save button clicked', () => {
            cy.intercept('POST', '/api/workflow/save-state', {
                statusCode: 200,
                body: { success: true }
            }).as('saveState');

            cy.get('.workflow-controls button').first().click();
            cy.wait('@saveState');

            // Check for success notification
            cy.get('.notification-success').should('be.visible');
            cy.get('.notification-success').should('contain', 'State saved successfully');
        });

        it('should handle save state error', () => {
            cy.intercept('POST', '/api/workflow/save-state', {
                statusCode: 500,
                body: { success: false, error: 'Save failed' }
            }).as('saveStateError');

            cy.get('.workflow-controls button').first().click();
            cy.wait('@saveStateError');

            // Check for error notification
            cy.get('.notification-error').should('be.visible');
            cy.get('.notification-error').should('contain', 'Error saving state');
        });

        it('should open details window', () => {
            cy.window().then((win) => {
                cy.stub(win, 'open').as('windowOpen');
            });

            cy.get('.workflow-controls button').last().click();
            cy.get('@windowOpen').should('be.calledWith', '/workflow-details', 'workflow-details');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', () => {
            cy.intercept('GET', '/api/workflow/status', {
                statusCode: 500,
                body: { error: 'Internal server error' }
            }).as('getStatusError');

            cy.visit('http://localhost:3001');
            cy.wait('@getStatusError');

            // Should still show widget structure
            cy.get('.workflow-widget').should('be.visible');
            // Console error should be caught
            cy.window().then((win) => {
                expect(win.console.error).to.have.been.called;
            });
        });

        it('should handle network timeout', () => {
            cy.intercept('GET', '/api/workflow/status', (req) => {
                req.destroy();
            }).as('networkTimeout');

            cy.visit('http://localhost:3001');
            
            // Widget should still be visible
            cy.get('.workflow-widget').should('be.visible');
        });
    });

    describe('Responsive Design', () => {
        it('should be responsive on mobile', () => {
            cy.viewport('iphone-x');
            cy.visit('http://localhost:3001');

            cy.get('.workflow-widget').should('be.visible');
            cy.get('.workflow-stats').should('have.css', 'grid-template-columns', '1fr');
            cy.get('.workflow-controls').should('have.css', 'flex-direction', 'column');
        });

        it('should be responsive on tablet', () => {
            cy.viewport('ipad-2');
            cy.visit('http://localhost:3001');

            cy.get('.workflow-widget').should('be.visible');
            cy.get('.phase-timeline').should('have.css', 'overflow-x', 'auto');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            cy.get('.workflow-widget').should('have.attr', 'role', 'region');
            cy.get('.workflow-widget').should('have.attr', 'aria-label', 'Workflow Progress');
            cy.get('.progress-bar').should('have.attr', 'role', 'progressbar');
            cy.get('.progress-bar').should('have.attr', 'aria-valuenow');
        });

        it('should be keyboard navigable', () => {
            cy.get('.workflow-controls button').first().focus();
            cy.focused().should('contain', 'Save State');
            
            cy.focused().tab();
            cy.focused().should('contain', 'Details');
        });
    });

    describe('Integration with Dashboard', () => {
        it('should integrate with main dashboard layout', () => {
            // Check widget is in correct container
            cy.get('.dashboard-widgets').within(() => {
                cy.get('#workflow-progress-widget').should('exist');
            });

            // Check CSS is loaded
            cy.get('link[href*="workflow-widget.css"]').should('exist');

            // Check JavaScript is loaded
            cy.window().then((win) => {
                expect(win.workflowWidget).to.exist;
                expect(win.workflowWidget.constructor.name).to.equal('WorkflowProgressWidget');
            });
        });
    });
});