/**
 * Test Setup and Configuration
 * Common setup for all test suites
 */

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.DASHBOARD_PORT = '3001';
process.env.TEST_MODE = 'true';

// Mock console methods to catch errors in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

global.consoleErrors = [];
global.consoleWarnings = [];

console.error = (...args) => {
  global.consoleErrors.push(args);
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  global.consoleWarnings.push(args);
  originalConsoleWarn.apply(console, args);
};

// Global test helpers
global.testHelpers = {
  // Clear console tracking
  clearConsoleTracking: () => {
    global.consoleErrors = [];
    global.consoleWarnings = [];
  },

  // Assert no console errors (Testing Agent requirement)
  assertNoConsoleErrors: () => {
    expect(global.consoleErrors).toHaveLength(0);
  },

  // Create test file structure
  createTestFileStructure: async (basePath) => {
    const fs = require('fs').promises;
    const path = require('path');

    const folders = [
      'project-documents/orchestration',
      'project-documents/research',
      'project-documents/planning',
      'project-documents/technical',
      'project-state',
      'machine-data/ai-agents-json'
    ];

    for (const folder of folders) {
      await fs.mkdir(path.join(basePath, folder), { recursive: true });
    }
  },

  // Clean up test files
  cleanupTestFiles: async (basePath) => {
    const fs = require('fs').promises;
    await fs.rm(basePath, { recursive: true, force: true });
  },

  // Wait for condition with timeout
  waitFor: async (condition, timeout = 5000, interval = 100) => {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Timeout waiting for condition');
  },

  // Mock agent response
  mockAgentResponse: (agentName, response) => {
    return {
      agent: agentName,
      timestamp: new Date().toISOString(),
      status: 'success',
      response: response,
      tokenUsage: Math.floor(Math.random() * 1000) + 100
    };
  },

  // Generate test sprint data
  generateTestSprint: (name = 'test-sprint') => {
    const date = new Date().toISOString().split('T')[0];
    return {
      name: `sprint-${date}-${name}`,
      goal: `Test sprint for ${name}`,
      status: 'planning',
      tasks: [
        { id: 1, title: 'Task 1', agent: 'coder_agent', status: 'pending' },
        { id: 2, title: 'Task 2', agent: 'testing_agent', status: 'pending' }
      ],
      created: new Date().toISOString()
    };
  }
};

// Jest configuration
if (typeof jest !== 'undefined') {
  // Set test timeout
  jest.setTimeout(30000); // 30 seconds for integration tests

  // Global setup
  beforeEach(() => {
    global.testHelpers.clearConsoleTracking();
  });

  // Global teardown
  afterEach(() => {
    // Verify no console errors (Testing Agent requirement)
    try {
      global.testHelpers.assertNoConsoleErrors();
    } catch (e) {
      // Log the errors for debugging
      console.log('Console errors detected:', global.consoleErrors);
      throw e;
    }
  });
}

// Cypress configuration helpers
if (typeof cy !== 'undefined') {
  // Custom Cypress commands
  Cypress.Commands.add('loginWithToken', (token = 'test-token') => {
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', token);
    });
  });

  Cypress.Commands.add('clearAllStorage', () => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  Cypress.Commands.add('waitForWebSocket', () => {
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        if (win.io && win.io.connected) {
          resolve();
        } else {
          const checkConnection = setInterval(() => {
            if (win.io && win.io.connected) {
              clearInterval(checkConnection);
              resolve();
            }
          }, 100);
        }
      });
    });
  });
}

module.exports = global.testHelpers;