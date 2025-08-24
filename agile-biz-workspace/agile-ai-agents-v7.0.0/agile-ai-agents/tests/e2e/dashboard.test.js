/**
 * E2E tests for AgileAiAgents Dashboard
 * Following Testing Agent's CRITICAL REQUIREMENTS for browser testing
 */

describe('AgileAiAgents Dashboard E2E', () => {
  // CRITICAL: Following Testing Agent's mandatory authentication testing protocol
  
  describe('🚨 MANDATORY: Unauthenticated State Testing (MUST BE FIRST)', () => {
    beforeEach(() => {
      // Clear all auth data before each test
      cy.clearLocalStorage();
      cy.clearCookies();
      sessionStorage.clear();
      
      // Set up console error monitoring
      cy.on('window:before:load', (win) => {
        cy.spy(win.console, 'error').as('consoleError');
        cy.spy(win.console, 'warn').as('consoleWarn');
      });
    });

    it('should redirect to login when accessing dashboard without auth', () => {
      cy.visit('http://localhost:3001/dashboard', { failOnStatusCode: false });
      cy.url().should('include', '/login');
      
      // Verify no console errors
      cy.get('@consoleError').should('not.have.been.called');
    });

    it('should return 401 for API calls without authentication', () => {
      cy.request({
        url: 'http://localhost:3001/api/agents/status',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Unauthorized');
      });
    });

    it('should handle all protected routes without auth', () => {
      const protectedRoutes = [
        '/dashboard',
        '/agents',
        '/sprints',
        '/documents',
        '/analytics',
        '/settings'
      ];

      protectedRoutes.forEach(route => {
        cy.visit(`http://localhost:3001${route}`, { failOnStatusCode: false });
        cy.url().should('include', '/login');
      });
    });

    it('should show login form on auth pages', () => {
      cy.visit('http://localhost:3001/login');
      cy.get('form[data-testid="login-form"]').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Login');
    });
  });

  describe('Authenticated Dashboard Testing', () => {
    beforeEach(() => {
      // Simulate authentication
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'test-token-12345');
      });
      
      // Monitor console for errors
      cy.on('window:before:load', (win) => {
        cy.spy(win.console, 'error').as('consoleError');
        cy.spy(win.console, 'warn').as('consoleWarn');
      });
      
      cy.visit('http://localhost:3001/dashboard');
    });

    describe('Page Load Validation', () => {
      it('should load dashboard without JavaScript errors', () => {
        // Wait for page to fully load
        cy.get('[data-testid="dashboard-main"]').should('be.visible');
        
        // CRITICAL: Verify no console errors per Testing Agent requirements
        cy.get('@consoleError').should('not.have.been.called');
        cy.get('@consoleWarn').should('not.have.been.called');
      });

      it('should verify all dependencies load correctly', () => {
        // Check critical scripts loaded
        cy.window().then((win) => {
          expect(win.io).to.exist; // Socket.io
          expect(win.marked).to.exist; // Markdown parser
          expect(win.hljs).to.exist; // Syntax highlighting
        });
      });

      it('should verify CSS and styling loads correctly', () => {
        // Check critical styles are applied
        cy.get('.dashboard-container').should('have.css', 'display', 'flex');
        cy.get('.agent-grid').should('have.css', 'grid-template-columns');
        
        // Verify no broken images
        cy.get('img').each(($img) => {
          cy.wrap($img).should('be.visible')
            .and(($img) => {
              expect($img[0].naturalWidth).to.be.greaterThan(0);
            });
        });
      });
    });

    describe('Real Browser Interaction Testing', () => {
      it('should test all clickable elements in agent cards', () => {
        // Get all agent cards
        cy.get('.agent-card').should('have.length.at.least', 37);
        
        // Click each agent card and verify no errors
        cy.get('.agent-card').each(($card, index) => {
          cy.wrap($card).click();
          cy.get('@consoleError').should('not.have.been.called');
          
          // Verify agent details panel opens
          cy.get('.agent-details').should('be.visible');
          cy.get('.close-details').click();
        });
      });

      it('should test sprint creation workflow', () => {
        // Click create sprint button
        cy.get('[data-testid="create-sprint-btn"]').click();
        cy.get('@consoleError').should('not.have.been.called');
        
        // Fill sprint form
        cy.get('input[name="sprintName"]').type('test-sprint-2025-01-10');
        cy.get('textarea[name="sprintGoal"]').type('Test sprint for E2E testing');
        cy.get('select[name="sprintType"]').select('feature');
        
        // Submit form
        cy.get('button[type="submit"]').click();
        
        // Verify sprint created without errors
        cy.get('@consoleError').should('not.have.been.called');
        cy.get('.sprint-card').should('contain', 'test-sprint-2025-01-10');
      });

      it('should test document search functionality', () => {
        cy.get('input[data-testid="document-search"]').type('requirements');
        cy.get('@consoleError').should('not.have.been.called');
        
        // Verify search results
        cy.get('.search-results').should('be.visible');
        cy.get('.search-result-item').should('have.length.at.least', 1);
        
        // Click a result
        cy.get('.search-result-item').first().click();
        cy.get('@consoleError').should('not.have.been.called');
      });
    });

    describe('Real-time WebSocket Testing', () => {
      it('should establish WebSocket connection without errors', () => {
        cy.window().then((win) => {
          const socket = win.io.connect('http://localhost:3001');
          
          cy.wrap(new Promise((resolve) => {
            socket.on('connect', () => {
              expect(socket.connected).to.be.true;
              resolve();
            });
          }));
        });
        
        cy.get('@consoleError').should('not.have.been.called');
      });

      it('should receive real-time agent updates', () => {
        // Trigger an agent action
        cy.get('[data-testid="run-analysis-btn"]').click();
        
        // Wait for WebSocket update
        cy.get('.agent-status-indicator').should('have.class', 'active');
        cy.get('.activity-log').should('contain', 'Analysis started');
        
        // Verify no errors during real-time updates
        cy.get('@consoleError').should('not.have.been.called');
      });
    });

    describe('Cross-browser Compatibility', () => {
      const browsers = ['chrome', 'firefox', 'edge'];
      
      browsers.forEach(browser => {
        it(`should work correctly in ${browser}`, () => {
          // Note: Cypress runs in the browser specified in cypress.config.js
          // This test structure shows the pattern for cross-browser testing
          
          cy.get('[data-testid="dashboard-main"]').should('be.visible');
          cy.get('@consoleError').should('not.have.been.called');
          
          // Test browser-specific features
          if (browser === 'chrome') {
            // Chrome-specific validations
            cy.window().then((win) => {
              expect(win.chrome).to.exist;
            });
          }
        });
      });
    });

    describe('Performance Monitoring', () => {
      it('should load dashboard within performance budget', () => {
        cy.visit('http://localhost:3001/dashboard', {
          onBeforeLoad: (win) => {
            win.performance.mark('pageStart');
          },
          onLoad: (win) => {
            win.performance.mark('pageEnd');
            win.performance.measure('pageLoad', 'pageStart', 'pageEnd');
            
            const measure = win.performance.getEntriesByName('pageLoad')[0];
            expect(measure.duration).to.be.lessThan(3000); // 3 second budget
          }
        });
      });

      it('should not have memory leaks during navigation', () => {
        cy.window().then((win) => {
          const initialMemory = win.performance.memory.usedJSHeapSize;
          
          // Navigate through multiple pages
          cy.get('[data-testid="nav-agents"]').click();
          cy.get('[data-testid="nav-sprints"]').click();
          cy.get('[data-testid="nav-documents"]').click();
          cy.get('[data-testid="nav-dashboard"]').click();
          
          // Check memory hasn't grown excessively
          const finalMemory = win.performance.memory.usedJSHeapSize;
          const memoryGrowth = finalMemory - initialMemory;
          
          expect(memoryGrowth).to.be.lessThan(10000000); // 10MB threshold
        });
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API failures gracefully', () => {
      // Intercept API call and force failure
      cy.intercept('GET', '/api/agents/status', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      });
      
      cy.visit('http://localhost:3001/dashboard');
      
      // Should show error message, not crash
      cy.get('.error-message').should('contain', 'Failed to load agent status');
      cy.get('@consoleError').should('not.have.been.called');
    });

    it('should handle WebSocket disconnection', () => {
      cy.visit('http://localhost:3001/dashboard');
      
      // Simulate WebSocket disconnect
      cy.window().then((win) => {
        win.io.disconnect();
      });
      
      // Should show reconnection message
      cy.get('.connection-status').should('contain', 'Reconnecting');
      cy.get('@consoleError').should('not.have.been.called');
    });
  });
});