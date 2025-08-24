/**
 * Mock Data for Tests
 * Provides consistent test data across all test suites
 */

module.exports = {
  // Sample agents with their characteristics
  agents: {
    prd_agent: {
      name: 'PRD Agent',
      role: 'Product Requirements Specialist',
      status: 'available',
      capabilities: ['requirements_analysis', 'user_stories', 'acceptance_criteria'],
      folder: 'planning'
    },
    testing_agent: {
      name: 'Testing Agent',
      role: 'Quality Assurance & Validation',
      status: 'available',
      capabilities: ['test_planning', 'browser_testing', 'api_testing', 'performance_testing'],
      folder: 'technical'
    },
    coder_agent: {
      name: 'Coder Agent',
      role: 'Software Development',
      status: 'available',
      capabilities: ['frontend_dev', 'backend_dev', 'api_development', 'refactoring'],
      folder: 'implementation'
    },
    scrum_master_agent: {
      name: 'Scrum Master Agent',
      role: 'Sprint Coordination',
      status: 'available',
      capabilities: ['sprint_planning', 'task_coordination', 'retrospectives'],
      folder: 'orchestration'
    }
  },

  // Sample project structure
  projectStructure: {
    'project-documents': {
      'orchestration': ['project-log.md', 'stakeholder-decisions.md'],
      'research': ['market-analysis.md', 'competitor-research.md'],
      'planning': ['prd.md', 'user-stories.md'],
      'technical': ['test-plan.md', 'test-results.md']
    },
    'project-state': ['current-state.json', 'checkpoints/'],
    'machine-data': {
      'ai-agents-json': ['prd_agent.json', 'testing_agent.json'],
      'project-documents-json': ['generation-report.json']
    }
  },

  // Sample sprint data
  sprints: {
    active: {
      name: 'sprint-2025-01-10-authentication',
      status: 'active',
      goal: 'Implement user authentication system',
      startDate: '2025-01-10',
      tasks: [
        {
          id: 'task-001',
          title: 'Design authentication flow',
          agent: 'ui_ux_agent',
          status: 'completed',
          completedAt: '2025-01-10T14:00:00Z'
        },
        {
          id: 'task-002',
          title: 'Implement JWT authentication',
          agent: 'coder_agent',
          status: 'in_progress',
          startedAt: '2025-01-10T15:00:00Z'
        },
        {
          id: 'task-003',
          title: 'Write authentication tests',
          agent: 'testing_agent',
          status: 'pending',
          dependencies: ['task-002']
        }
      ]
    },
    completed: {
      name: 'sprint-2025-01-05-setup',
      status: 'completed',
      goal: 'Initial project setup',
      completedAt: '2025-01-08T17:00:00Z',
      metrics: {
        tasksCompleted: 8,
        velocity: 21,
        defectsFound: 2,
        defectsFixed: 2
      }
    }
  },

  // Sample documents
  documents: {
    prd: {
      title: 'Product Requirements Document',
      path: 'project-documents/planning/prd.md',
      content: `# Product Requirements Document

## Overview
This application provides AI-powered agent coordination for software development.

## User Stories
1. As a developer, I want to describe my project idea and have AI agents build it
2. As a project manager, I want to track progress across all agents
3. As a user, I want secure authentication to protect my projects

## Technical Requirements
- Node.js >= 16.0.0
- React 18+
- PostgreSQL database
- JWT authentication
- WebSocket support for real-time updates`,
      metadata: {
        created: '2025-01-10T10:00:00Z',
        agent: 'prd_agent',
        version: '1.0.0'
      }
    },
    testPlan: {
      title: 'Comprehensive Test Plan',
      path: 'project-documents/technical/test-plan.md',
      content: `# Test Plan

## Test Strategy
Following Testing Agent guidelines with emphasis on real browser testing.

## Test Cases

### Authentication Testing (CRITICAL - TEST FIRST)
1. Unauthenticated state validation
2. Login functionality
3. Token validation
4. Session management

### Browser Testing Requirements
- Monitor console for all errors
- Test in Chrome, Firefox, Edge
- Verify all dependencies load
- Check visual rendering`,
      metadata: {
        created: '2025-01-10T11:00:00Z',
        agent: 'testing_agent',
        version: '1.0.0'
      }
    }
  },

  // Sample API responses
  apiResponses: {
    agentStatus: {
      success: true,
      agents: [
        { name: 'prd_agent', status: 'idle', lastActive: '2025-01-10T15:30:00Z' },
        { name: 'coder_agent', status: 'active', currentTask: 'Implementing authentication' },
        { name: 'testing_agent', status: 'idle', lastActive: '2025-01-10T14:00:00Z' }
      ]
    },
    sprintStatus: {
      success: true,
      sprint: {
        name: 'sprint-2025-01-10-authentication',
        progress: 45,
        tasksCompleted: 3,
        tasksTotal: 7,
        estimatedCompletion: '2025-01-12T18:00:00Z'
      }
    },
    error: {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  },

  // Sample WebSocket events
  socketEvents: {
    agentUpdate: {
      event: 'agent:update',
      data: {
        agent: 'coder_agent',
        status: 'active',
        message: 'Implementing user authentication endpoint',
        progress: 65
      }
    },
    taskComplete: {
      event: 'task:complete',
      data: {
        taskId: 'task-002',
        agent: 'coder_agent',
        result: 'Authentication endpoint implemented successfully',
        duration: 3600000 // 1 hour in ms
      }
    },
    error: {
      event: 'error',
      data: {
        agent: 'testing_agent',
        error: 'Browser test failed: Port 3000 already in use',
        severity: 'warning',
        recoverable: true
      }
    }
  },

  // Console error patterns to test for
  consoleErrorPatterns: {
    dependency: /Failed to load .* dependency/,
    syntax: /Uncaught SyntaxError/,
    reference: /ReferenceError: .* is not defined/,
    network: /Failed to fetch|NetworkError/,
    react: /React error boundary|Invalid hook call/
  },

  // Test user credentials
  testUsers: {
    admin: {
      username: 'admin@test.com',
      password: 'Test123!',
      role: 'admin',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.admin'
    },
    developer: {
      username: 'dev@test.com',
      password: 'Test123!',
      role: 'developer',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.developer'
    },
    viewer: {
      username: 'viewer@test.com',
      password: 'Test123!',
      role: 'viewer',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.viewer'
    }
  }
};