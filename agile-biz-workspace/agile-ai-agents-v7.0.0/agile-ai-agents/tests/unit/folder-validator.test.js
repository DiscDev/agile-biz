/**
 * Unit tests for FolderStructureValidator
 * Tests the folder validation and correction logic
 */

const FolderStructureValidator = require('../../machine-data/folder-structure-validator');
const path = require('path');

describe('FolderStructureValidator', () => {
  let validator;
  const mockProjectRoot = '/test/project';

  beforeEach(() => {
    validator = new FolderStructureValidator(mockProjectRoot);
  });

  describe('validateFolderName', () => {
    it('should validate correct folder names', () => {
      const validFolders = [
        'orchestration',
        'research',
        'planning',
        'technical'
      ];

      validFolders.forEach(folder => {
        const result = validator.validateFolderName(folder);
        expect(result.isValid).toBe(true);
        expect(result.folderName).toBe(folder);
      });
    });

    it('should correct common folder name mistakes', () => {
      const corrections = [
        { input: 'research', expected: 'research' },
        { input: 'business-strategy', expected: 'business-strategy' },
        { input: 'research', expected: 'research' },
        { input: 'testing', expected: 'technical' }
      ];

      corrections.forEach(({ input, expected }) => {
        const result = validator.validateFolderName(input);
        expect(result.isValid).toBe(false);
        expect(result.suggestion).toBe(expected);
      });
    });

    it('should handle fuzzy matching for misspellings', () => {
      const misspellings = [
        { input: 'marketting', expected: 'planning' },
        { input: 'deployement', expected: 'operations' },
        { input: 'optimizaton', expected: 'operations' }
      ];

      misspellings.forEach(({ input, expected }) => {
        const result = validator.validateFolderName(input);
        expect(result.suggestion).toBe(expected);
      });
    });

    it('should return unknown for completely unrecognized names', () => {
      const result = validator.validateFolderName('random-folder-xyz');
      expect(result.isValid).toBe(false);
      expect(result.isUnknown).toBe(true);
    });
  });

  describe('validateDocumentPath', () => {
    it('should validate correct document paths', async () => {
      const validPaths = [
        'project-documents/research/market-analysis.md',
        'project-documents/planning/prd.md',
        'project-documents/orchestration/sprints/sprint-2025-01-10/planning.md'
      ];

      for (const docPath of validPaths) {
        const result = await validator.validateDocumentPath(docPath);
        expect(result.isValid).toBe(true);
        expect(result.path).toBe(docPath);
      }
    });

    it('should correct paths with wrong folder names', async () => {
      const result = await validator.validateDocumentPath(
        'project-documents/research/analysis.md',
        'research_agent'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.correctedPath).toBe('project-documents/research/analysis.md');
      expect(result.message).toContain('should be "research"');
    });

    it('should suggest folder based on agent if path is ambiguous', async () => {
      const result = await validator.validateDocumentPath(
        'project-documents/unknown-folder/doc.md',
        'testing_agent'
      );
      
      expect(result.suggestedFolder).toBe('technical');
    });

    it('should handle nested sprint paths correctly', async () => {
      const sprintPath = 'project-documents/orchestration/sprints/sprint-2025-01-10/planning.md';
      const result = await validator.validateDocumentPath(sprintPath);
      
      expect(result.isValid).toBe(true);
      expect(result.isSprintDocument).toBe(true);
    });
  });

  describe('getStandardFolderName', () => {
    it('should return exact matches', () => {
      expect(validator.getStandardFolderName('research')).toBe('research');
      expect(validator.getStandardFolderName('technical')).toBe('technical');
    });

    it('should use aliases for common mistakes', () => {
      expect(validator.getStandardFolderName('research')).toBe('research');
      expect(validator.getStandardFolderName('research')).toBe('research');
    });

    it('should use fuzzy matching for close matches', () => {
      expect(validator.getStandardFolderName('reserch')).toBe('research');
      expect(validator.getStandardFolderName('deployments')).toBe('operations');
    });

    it('should return null for no match', () => {
      expect(validator.getStandardFolderName('completely-random')).toBe(null);
    });
  });

  describe('getFolderByAgent', () => {
    it('should return correct folder for each agent', () => {
      const agentFolders = [
        { agent: 'research_agent', folder: 'research' },
        { agent: 'testing_agent', folder: 'technical' },
        { agent: 'prd_agent', folder: 'planning' },
        { agent: 'devops_agent', folders: ['operations', 'operations'] }
      ];

      agentFolders.forEach(({ agent, folder, folders }) => {
        const result = validator.getFolderByAgent(agent);
        if (folders) {
          expect(folders).toContain(result);
        } else {
          expect(result).toBe(folder);
        }
      });
    });

    it('should return null for unknown agent', () => {
      expect(validator.getFolderByAgent('unknown_agent')).toBe(null);
    });
  });

  describe('error handling', () => {
    it('should handle null inputs gracefully', () => {
      expect(() => validator.validateFolderName(null)).not.toThrow();
      expect(validator.validateFolderName(null).isValid).toBe(false);
    });

    it('should handle empty strings', () => {
      const result = validator.validateFolderName('');
      expect(result.isValid).toBe(false);
      expect(result.isUnknown).toBe(true);
    });

    it('should handle paths with extra slashes', async () => {
      const result = await validator.validateDocumentPath(
        'project-documents//research///doc.md'
      );
      expect(result.normalizedPath).toBe('project-documents/research/doc.md');
    });
  });
});

// Performance tests
describe('FolderStructureValidator Performance', () => {
  let validator;

  beforeEach(() => {
    validator = new FolderStructureValidator('/test/project');
  });

  it('should validate 1000 paths quickly', () => {
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      validator.validateFolderName(`folder-${i % 30}`);
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });
});