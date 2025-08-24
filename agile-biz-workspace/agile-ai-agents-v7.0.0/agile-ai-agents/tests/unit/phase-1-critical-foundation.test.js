/**
 * Phase 1 Test Implementation - Critical Foundation
 * 
 * Tests for error integration, pre-flight checks, approval timeouts, and research levels
 */

const { 
  initializeWorkflow,
  getCurrentWorkflowState,
  checkApprovalTimeouts,
  approveGate
} = require('../../machine-data/scripts/workflow-state-handler');
const { 
  handleWorkflowError,
  createWorkflowError,
  ERROR_TYPES 
} = require('../../machine-data/scripts/workflow-error-handler');
const WorkflowPreflightChecker = require('../../machine-data/workflow-preflight-checker');
const { 
  executePhaseWithErrorHandling,
  createSafePhaseExecutor 
} = require('../../machine-data/scripts/workflow-execution-wrapper');
const { 
  getDocumentCounts 
} = require('../../machine-data/scripts/sync-research-level-docs');
const fs = require('fs');
const path = require('path');

// Mock fs for controlled testing
jest.mock('fs');

describe('Phase 1: Critical Foundation Tests', () => {
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue(true);
  });

  describe('Workflow Error Integration', () => {
    it('should wrap all phase executions with error handling', async () => {
      // Mock a phase that throws an error
      const mockPhase = jest.fn().mockRejectedValue(new Error('Test error'));
      const phaseConfig = createSafePhaseExecutor('Test Phase', 'Test Agent', mockPhase);
      
      // Mock workflow state
      const mockState = {
        workflow_id: 'test-123',
        workflow_type: 'new-project',
        current_phase: 'discovery',
        phase_index: 0
      };
      
      fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
      fs.writeFileSync.mockImplementation(() => {});
      
      // Execute phase with error handling
      await expect(executePhaseWithErrorHandling(phaseConfig)).rejects.toThrow();
      
      // Verify error handling was attempted
      expect(mockPhase).toHaveBeenCalled();
    });

    it('should show recovery instructions on failure', async () => {
      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const error = createWorkflowError(
        ERROR_TYPES.AGENT_FAILURE,
        'Agent crashed',
        { agent_name: 'test_agent' }
      );
      
      // Mock failed recovery
      fs.readFileSync.mockImplementation(() => {
        throw new Error('State file missing');
      });
      
      await handleWorkflowError(error, {});
      
      // Verify recovery instructions were shown
      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).toContain('Manual intervention required');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Pre-flight Checks System', () => {
    it('should check agent availability', async () => {
      const checker = new WorkflowPreflightChecker();
      
      // Mock agent files
      fs.existsSync.mockImplementation((path) => {
        if (path.includes('ai-agents')) {
          return !path.includes('missing_agent.md');
        }
        return true;
      });
      
      const results = await checker.checkAgentAvailability('new-project');
      expect(results.status).toBe('passed');
      expect(results.message).toContain('All');
    });

    it('should validate state system integrity', async () => {
      const checker = new WorkflowPreflightChecker();
      
      // Mock valid state file
      fs.readFileSync.mockReturnValue(JSON.stringify({
        workflow_id: 'test',
        workflow_type: 'new-project'
      }));
      
      const results = await checker.validateStateSystem();
      expect(results.status).toBe('passed');
    });

    it('should check disk space', async () => {
      const checker = new WorkflowPreflightChecker();
      
      // Mock disk operations
      fs.writeFileSync.mockImplementation(() => {});
      fs.statSync.mockReturnValue({ size: 1024 * 1024 });
      fs.unlinkSync.mockImplementation(() => {});
      
      const results = await checker.checkDiskSpace();
      expect(results.status).toBe('passed');
    });

    it('should verify file permissions', async () => {
      const checker = new WorkflowPreflightChecker();
      
      // Mock successful file operations
      fs.writeFileSync.mockImplementation(() => {});
      fs.readFileSync.mockReturnValue('test');
      fs.unlinkSync.mockImplementation(() => {});
      
      const results = await checker.checkFilePermissions();
      expect(results.status).toBe('passed');
    });

    it('should validate research level configuration', async () => {
      const checker = new WorkflowPreflightChecker();
      
      // Mock research config
      const mockConfig = {
        minimal: { total_documents: 15 },
        medium: { total_documents: 48 },
        thorough: { total_documents: 194 }
      };
      
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
      
      const results = await checker.validateResearchLevels();
      expect(results.status).toBe('passed');
    });
  });

  describe('Approval Gate Timeouts', () => {
    it('should notify when approval times out', async () => {
      // Initialize workflow with approval gate
      const mockState = {
        workflow_id: 'test',
        workflow_type: 'new-project',
        awaiting_approval: 'post-research',
        approval_gates: {
          'post-research': {
            approval_requested_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 minutes ago
            timeout_minutes: 30
          }
        }
      };
      
      fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
      
      const timeoutCheck = checkApprovalTimeouts();
      expect(timeoutCheck.timedOut).toBe(true);
      expect(timeoutCheck.message).toContain('timed out');
    });

    it('should use correct timeout for each gate', () => {
      const gates = {
        'post-research': 30,
        'post-requirements': 60,
        'pre-implementation': 120,
        'post-analysis': 45
      };
      
      // Test each gate
      for (const [gateName, expectedTimeout] of Object.entries(gates)) {
        const mockState = {
          workflow_id: 'test',
          workflow_type: 'new-project',
          awaiting_approval: gateName,
          approval_gates: {
            [gateName]: {
              approval_requested_at: new Date().toISOString(),
              timeout_minutes: expectedTimeout
            }
          }
        };
        
        fs.readFileSync.mockReturnValue(JSON.stringify(mockState));
        
        const timeoutCheck = checkApprovalTimeouts();
        expect(timeoutCheck.timeoutMinutes).toBe(expectedTimeout);
      }
    });
  });

  describe('Research Level Documentation', () => {
    it('should show correct document count for thorough', () => {
      const counts = getDocumentCounts();
      expect(counts.thorough.total).toBe(194);
    });

    it('should show correct document count for medium', () => {
      const counts = getDocumentCounts();
      expect(counts.medium.total).toBe(48);
    });

    it('should show correct document count for minimal', () => {
      const counts = getDocumentCounts();
      expect(counts.minimal.total).toBe(15);
    });
  });

  describe('Hook Integration', () => {
    it('should maintain compatibility with existing hooks', async () => {
      // This would test actual hook integration
      // For now, just verify the hook manager can be imported
      const HookManager = require('../../hooks/hook-manager').HookManager;
      expect(HookManager).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full pre-flight check before workflow', async () => {
      const checker = new WorkflowPreflightChecker();
      
      // Mock all checks passing
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((path) => {
        if (path.includes('research-level')) {
          return JSON.stringify({
            minimal: { total_documents: 15, documents: {} },
            medium: { total_documents: 48, documents: {} },
            thorough: { total_documents: 194, documents: {} }
          });
        }
        return JSON.stringify({
          workflow_id: 'test',
          workflow_type: 'new-project'
        });
      });
      fs.writeFileSync.mockImplementation(() => {});
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.unlinkSync.mockImplementation(() => {});
      
      const results = await checker.runChecks('new-project');
      expect(results.allPassed).toBe(true);
    });

    it('should handle workflow initialization with all enhancements', async () => {
      // Mock successful pre-flight checks
      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});
      
      const workflow = initializeWorkflow('new-project', { parallel: true });
      
      expect(workflow).toBeDefined();
      expect(workflow.workflow_type).toBe('new-project');
      expect(workflow.parallel_mode).toBe(true);
      expect(workflow.approval_gates).toBeDefined();
      
      // Check approval gates have timeouts
      for (const gate of Object.values(workflow.approval_gates)) {
        expect(gate.timeout_minutes).toBeDefined();
        expect(gate.timeout_minutes).toBeGreaterThan(0);
      }
    });
  });
});

// Test helpers
function createMockWorkflowState(overrides = {}) {
  return {
    workflow_id: 'test-workflow',
    workflow_type: 'new-project',
    current_phase: 'discovery',
    phase_index: 0,
    phases_completed: [],
    approval_gates: {},
    can_resume: true,
    ...overrides
  };
}