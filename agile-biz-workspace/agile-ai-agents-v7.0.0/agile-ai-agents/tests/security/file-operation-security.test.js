/**
 * File Operation Security Tests
 * 
 * Critical tests to prevent regression of the phase folder creation bug
 * and ensure FileOperationManager security compliance.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const FileOperationManager = require('../../machine-data/file-operation-manager');
const DocumentCreationTracker = require('../../machine-data/document-creation-tracker');

describe('File Operation Security Tests', () => {
  let fileManager;
  let testProjectRoot;
  let projectDocsPath;

  beforeAll(async () => {
    // Create a test project structure
    testProjectRoot = path.join(__dirname, 'test-project');
    projectDocsPath = path.join(testProjectRoot, 'project-documents');
    
    // Ensure test directories exist
    await fs.mkdir(testProjectRoot, { recursive: true });
    await fs.mkdir(projectDocsPath, { recursive: true });
    
    // Create standard folders for testing
    const standardFolders = [
      '00-orchestration',
      '02-research', 
      '10-security',
      '11-requirements'
    ];
    
    for (const folder of standardFolders) {
      await fs.mkdir(path.join(projectDocsPath, folder), { recursive: true });
    }
    
    fileManager = new FileOperationManager(testProjectRoot);
  });

  afterAll(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testProjectRoot, { recursive: true, force: true });
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  describe('Phase Folder Creation Prevention', () => {
    test('should REJECT phase-parallel folder patterns', async () => {
      const prohibitedPaths = [
        'phase-1-parallel/test.md',
        'phase-2-parallel/analysis.md', 
        'phase-3-parallel/security.md',
        'phase-coordination/orchestrator.md'
      ];

      for (const prohibitedPath of prohibitedPaths) {
        const fullPath = path.join(projectDocsPath, prohibitedPath);
        
        await expect(
          fileManager.validatePath(fullPath, 'TEST_VALIDATION')
        ).resolves.toMatchObject({
          isValid: false,
          errors: expect.arrayContaining([
            expect.stringMatching(/FORBIDDEN_PATTERN.*phase/i)
          ])
        });
      }
    });

    test('should REJECT temporary folder patterns', async () => {
      const prohibitedPaths = [
        'temp/test.md',
        'tmp/analysis.md',
        'temporary/security.md',
        'orchestrator-temp/coordination.md',
        'agent-temp/workflow.md'
      ];

      for (const prohibitedPath of prohibitedPaths) {
        const fullPath = path.join(projectDocsPath, prohibitedPath);
        
        await expect(
          fileManager.validatePath(fullPath, 'TEST_VALIDATION')
        ).resolves.toMatchObject({
          isValid: false,
          errors: expect.arrayContaining([
            expect.stringMatching(/FORBIDDEN_PATTERN.*(temp|tmp)/i)
          ])
        });
      }
    });

    test('should REJECT parallel coordination patterns', async () => {
      const prohibitedPaths = [
        'parallel-execution/test.md',
        'coordination-temp/analysis.md',
        'wave-1/security.md'
      ];

      for (const prohibitedPath of prohibitedPaths) {
        const fullPath = path.join(projectDocsPath, prohibitedPath);
        
        await expect(
          fileManager.validatePath(fullPath, 'TEST_VALIDATION')
        ).resolves.toMatchObject({
          isValid: false,
          errors: expect.arrayContaining([
            expect.stringMatching(/FORBIDDEN_PATTERN.*(parallel|coordination|wave)/i)
          ])
        });
      }
    });
  });

  describe('Directory Creation Prevention', () => {
    test('should DISABLE createDirectory method', async () => {
      await expect(
        fileManager.createDirectory()
      ).rejects.toThrow('OPERATION_DISABLED: Directory creation is not allowed');
    });

    test('should REQUIRE pre-existing folders for write operations', async () => {
      const nonExistentFolder = 'non-existent-folder';
      
      await expect(
        fileManager.writeDocument('test content', nonExistentFolder, 'test.md', 'test_agent')
      ).rejects.toThrow(/INVALID_FOLDER.*not in allowed folders list/);
    });

    test('should VALIDATE folder existence before writing', async () => {
      // Try to write to a folder that's in the allowed list but doesn't exist on disk
      const allowedButMissingFolder = '03-marketing';
      
      await expect(
        fileManager.writeDocument('test content', allowedButMissingFolder, 'test.md', 'test_agent')
      ).rejects.toThrow(/FOLDER_NOT_EXISTS.*does not exist/);
    });
  });

  describe('Valid Operations', () => {
    test('should ALLOW writing to valid existing folders', async () => {
      const content = 'Test document content';
      const folderName = '02-research';
      const filename = 'test-research.md';
      
      const result = await fileManager.writeDocument(content, folderName, filename, 'test_agent');
      
      expect(result).toBe(path.join(projectDocsPath, folderName, filename));
      
      // Verify file was actually created
      const fileContent = await fs.readFile(result, 'utf8');
      expect(fileContent).toBe(content);
    });

    test('should VALIDATE paths for standard folders', async () => {
      const validPath = path.join(projectDocsPath, '10-security', 'security-analysis.md');
      
      const validation = await fileManager.validatePath(validPath, 'TEST_VALIDATION');
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Audit Trail', () => {
    test('should LOG all validation attempts', async () => {
      const testPath = path.join(projectDocsPath, 'phase-1-parallel', 'test.md');
      
      // Clear any existing logs
      fileManager.operationLog = [];
      
      await fileManager.validatePath(testPath, 'AUDIT_TEST');
      
      expect(fileManager.operationLog).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventType: 'PATH_VALIDATION',
            operation: 'AUDIT_TEST',
            isValid: false
          })
        ])
      );
    });

    test('should LOG security violations', async () => {
      // Clear any existing logs
      fileManager.operationLog = [];
      
      try {
        await fileManager.writeDocument('test', 'phase-1-parallel', 'test.md', 'test_agent');
      } catch (error) {
        // Expected to fail
      }
      
      expect(fileManager.operationLog).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventType: 'WRITE_REJECTED',
            result: 'REJECTED'
          })
        ])
      );
    });
  });

  describe('Document Creation Tracker Integration', () => {
    test('should REJECT queuing documents with prohibited paths', async () => {
      const tracker = new DocumentCreationTracker(testProjectRoot);
      
      // Mock console.error to capture error messages
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const doc = {
        path: 'phase-1-parallel/test.md',
        agent: 'test_agent',
        priority: 'high'
      };
      
      await tracker.queueDocument(doc, 'TEST_SOURCE');
      
      // Document should not be queued
      expect(tracker.tracking.pending_documents).toHaveLength(0);
      
      // Error should be logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/CRITICAL.*FILE_OPERATION_REJECTED/)
      );
      
      consoleSpy.mockRestore();
    });

    test('should SUCCESSFULLY queue documents with valid paths', async () => {
      const tracker = new DocumentCreationTracker(testProjectRoot);
      
      const doc = {
        path: '02-research/valid-document.md',
        agent: 'research_agent',
        priority: 'high'
      };
      
      await tracker.queueDocument(doc, 'TEST_SOURCE');
      
      // Document should be queued
      expect(tracker.tracking.pending_documents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            folderName: '02-research',
            filename: 'valid-document.md',
            agent: 'research_agent'
          })
        ])
      );
    });
  });

  describe('Stress Testing - Multiple Parallel Operations', () => {
    test('should REJECT all prohibited patterns under high load', async () => {
      const prohibitedPatterns = [
        'phase-1/test.md',
        'phase-2-parallel/analysis.md',
        'temp/security.md',
        'parallel-execution/workflow.md',
        'coordination-temp/orchestrator.md'
      ];
      
      const promises = prohibitedPatterns.map(async (prohibitedPath) => {
        const fullPath = path.join(projectDocsPath, prohibitedPath);
        
        try {
          await fileManager.writeDocument('test content', prohibitedPath.split('/')[0], 'test.md', 'stress_test_agent');
          return { path: prohibitedPath, result: 'UNEXPECTED_SUCCESS' };
        } catch (error) {
          return { path: prohibitedPath, result: 'CORRECTLY_REJECTED', error: error.message };
        }
      });
      
      const results = await Promise.all(promises);
      
      // All should be rejected
      results.forEach(result => {
        expect(result.result).toBe('CORRECTLY_REJECTED');
      });
    });

    test('should MAINTAIN audit trail integrity under parallel load', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => ({
        content: `Test content ${i}`,
        folderName: '02-research',
        filename: `parallel-test-${i}.md`,
        agent: `test_agent_${i}`
      }));
      
      // Clear logs
      fileManager.operationLog = [];
      
      const promises = operations.map(op => 
        fileManager.writeDocument(op.content, op.folderName, op.filename, op.agent)
      );
      
      const results = await Promise.all(promises);
      
      // All should succeed
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toMatch(/project-documents\/02-research\/parallel-test-\d+\.md$/);
      });
      
      // Audit log should have entries for all operations
      const successLogs = fileManager.operationLog.filter(log => log.eventType === 'WRITE_SUCCESS');
      expect(successLogs).toHaveLength(10);
    });
  });

  describe('Emergency Folder Scan', () => {
    test('should DETECT unauthorized folders if they exist', async () => {
      // Create an unauthorized folder for testing
      const unauthorizedFolder = path.join(projectDocsPath, 'phase-test-unauthorized');
      await fs.mkdir(unauthorizedFolder, { recursive: true });
      
      const scanResults = await fileManager.scanForUnauthorizedFolders();
      
      expect(scanResults.unauthorizedFolders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'phase-test-unauthorized',
            matchesForbiddenPattern: true
          })
        ])
      );
      
      // Cleanup
      await fs.rm(unauthorizedFolder, { recursive: true, force: true });
    });

    test('should REPORT clean state when no violations exist', async () => {
      const scanResults = await fileManager.scanForUnauthorizedFolders();
      
      expect(scanResults.unauthorizedFolders).toHaveLength(0);
      expect(scanResults.compliantFolders).toBeGreaterThan(0);
    });
  });
});

describe('Regression Test: Brazil Project Phase Folder Bug', () => {
  /**
   * This test specifically recreates the conditions that led to the 
   * phase folder creation bug in the Brazil project external implementation.
   */
  
  test('should PREVENT the exact bug pattern from Brazil project', async () => {
    const testProjectRoot = path.join(__dirname, 'brazil-bug-test');
    const projectDocsPath = path.join(testProjectRoot, 'project-documents');
    
    try {
      // Setup test environment
      await fs.mkdir(projectDocsPath, { recursive: true });
      await fs.mkdir(path.join(projectDocsPath, '02-research'), { recursive: true });
      await fs.mkdir(path.join(projectDocsPath, '10-security'), { recursive: true });
      
      const fileManager = new FileOperationManager(testProjectRoot);
      
      // Simulate the exact parallel coordination scenario that caused the bug
      const parallelOperations = [
        { content: 'Finance analysis', folderPath: 'phase-2-parallel/finance', filename: 'financial-projections.md' },
        { content: 'Security assessment', folderPath: 'phase-2-parallel/security', filename: 'security-analysis.md' },
        { content: 'API documentation', folderPath: 'phase-2-parallel/api', filename: 'api-spec.md' },
        { content: 'LLM analysis', folderPath: 'phase-3-parallel/llm', filename: 'llm-strategy.md' }
      ];
      
      const results = [];
      
      for (const operation of parallelOperations) {
        try {
          // Extract folder name from the problematic path pattern
          const folderName = operation.folderPath.split('/')[0];
          await fileManager.writeDocument(operation.content, folderName, operation.filename, 'parallel_test_agent');
          results.push({ operation, result: 'UNEXPECTED_SUCCESS' });
        } catch (error) {
          results.push({ operation, result: 'CORRECTLY_BLOCKED', error: error.message });
        }
      }
      
      // ALL operations should be blocked
      results.forEach(result => {
        expect(result.result).toBe('CORRECTLY_BLOCKED');
        expect(result.error).toMatch(/FORBIDDEN_PATTERN.*phase/i);
      });
      
      // Verify no unauthorized folders were created
      const scanResults = await fileManager.scanForUnauthorizedFolders();
      const phasefolders = scanResults.unauthorizedFolders.filter(folder => 
        folder.name.includes('phase') || folder.name.includes('parallel')
      );
      expect(phasefolders).toHaveLength(0);
      
    } finally {
      // Cleanup
      try {
        await fs.rm(testProjectRoot, { recursive: true, force: true });
      } catch (error) {
        console.warn('Cleanup warning:', error.message);
      }
    }
  });
});