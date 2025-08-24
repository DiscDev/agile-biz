/**
 * Unit tests for JSON Context Loading
 * Tests the agent context loader and JSON query utility
 */

const AgentContextLoader = require('../../machine-data/agent-context-loader');
const JsonQueryUtility = require('../../machine-data/json-query-utility');
const fs = require('fs').promises;
const path = require('path');

// Mock fs module
jest.mock('fs').promises;

describe('AgentContextLoader', () => {
  let loader;
  const mockBasePath = '/test/agile-ai-agents';

  beforeEach(() => {
    loader = new AgentContextLoader(mockBasePath);
    jest.clearAllMocks();
  });

  describe('loadAgent', () => {
    it('should load agent JSON with minimal context', async () => {
      const mockAgentData = {
        agent_name: "Testing Agent",
        role: "Quality Assurance",
        sections: {
          overview: { content: "Testing overview" },
          core_responsibilities: { content: "Test everything" }
        }
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockAgentData));

      const result = await loader.loadAgent('testing_agent', { 
        level: 'minimal' 
      });

      expect(result.agent_name).toBe('Testing Agent');
      expect(result.sections).toBeDefined();
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('testing_agent.json'),
        'utf-8'
      );
    });

    it('should fall back to markdown if JSON not found', async () => {
      fs.readFile
        .mockRejectedValueOnce(new Error('File not found')) // JSON fails
        .mockResolvedValueOnce('# Testing Agent\n\nOverview...'); // MD succeeds

      const result = await loader.loadAgent('testing_agent');

      expect(result).toContain('Testing Agent');
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should load specific sections only', async () => {
      const mockAgentData = {
        sections: {
          overview: { content: "Overview content" },
          workflows: { content: "Workflow content" },
          boundaries: { content: "Boundaries content" }
        }
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockAgentData));

      const result = await loader.loadAgent('testing_agent', {
        sections: ['overview', 'workflows']
      });

      expect(result.sections.overview).toBeDefined();
      expect(result.sections.workflows).toBeDefined();
      expect(result.sections.boundaries).toBeUndefined();
    });

    it('should handle progressive loading', async () => {
      const mockAgentData = {
        sections: {
          overview: { 
            content: "Short overview",
            md_reference: "testing_agent.md#overview"
          }
        }
      };

      fs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockAgentData))
        .mockResolvedValueOnce('# Testing Agent\n\n## Overview\nDetailed overview...');

      const result = await loader.loadAgent('testing_agent', {
        level: 'detailed'
      });

      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('loadDocument', () => {
    it('should load document JSON with section references', async () => {
      const mockDocData = {
        title: "Sprint Planning Guide",
        sections: {
          introduction: {
            content: "Sprint planning intro",
            md_reference: "sprint-planning.md#introduction"
          }
        }
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockDocData));

      const result = await loader.loadDocument('sprint-planning', {
        level: 'summary'
      });

      expect(result.title).toBe('Sprint Planning Guide');
      expect(result.sections.introduction).toBeDefined();
    });

    it('should handle missing documents gracefully', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await loader.loadDocument('non-existent');

      expect(result).toBe(null);
    });
  });

  describe('caching', () => {
    it('should cache loaded agents', async () => {
      const mockData = { agent_name: "Test Agent" };
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      // First load
      await loader.loadAgent('test_agent');
      // Second load (should use cache)
      await loader.loadAgent('test_agent');

      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should respect cache expiry', async () => {
      loader.cacheExpiry = 100; // 100ms expiry
      const mockData = { agent_name: "Test Agent" };
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      await loader.loadAgent('test_agent');
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await loader.loadAgent('test_agent');

      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('token management', () => {
    it('should track token usage', async () => {
      const mockData = {
        content: "A".repeat(1000) // ~250 tokens
      };
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      await loader.loadAgent('test_agent');

      const usage = loader.getTokenUsage();
      expect(usage.test_agent).toBeGreaterThan(0);
    });

    it('should enforce token limits', async () => {
      loader.maxTokensPerAgent = 100;
      
      const mockData = {
        content: "A".repeat(1000) // Exceeds limit
      };
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const result = await loader.loadAgent('test_agent');

      expect(result.content.length).toBeLessThan(1000);
    });
  });
});

describe('JsonQueryUtility', () => {
  let utility;
  const mockBasePath = '/test/agile-ai-agents';

  beforeEach(() => {
    utility = new JsonQueryUtility(mockBasePath);
    jest.clearAllMocks();
  });

  describe('queryByPath', () => {
    it('should resolve JSON-first with MD fallback', async () => {
      const mockJsonPath = 'machine-data/ai-agents-json/test_agent.json';
      
      fs.readFile
        .mockResolvedValueOnce(JSON.stringify({ success: true }));

      const result = await utility.queryByPath(mockJsonPath);

      expect(result.success).toBe(true);
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('test_agent.json'),
        'utf-8'
      );
    });

    it('should fall back to MD when JSON fails', async () => {
      const mockJsonPath = 'machine-data/ai-agents-json/test_agent.json';
      
      fs.readFile
        .mockRejectedValueOnce(new Error('JSON not found'))
        .mockResolvedValueOnce('# Test Agent MD Content');

      const result = await utility.queryByPath(mockJsonPath);

      expect(result).toContain('Test Agent MD Content');
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should query specific sections with anchors', async () => {
      const mockPath = 'test-doc.json#specific-section';
      const mockData = {
        sections: {
          'specific-section': { content: 'Section content' }
        }
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await utility.queryByPath(mockPath);

      expect(result.content).toBe('Section content');
    });
  });

  describe('searchAcrossDocuments', () => {
    it('should search multiple documents for patterns', async () => {
      const mockDocs = {
        'doc1.json': { content: 'Testing patterns are important' },
        'doc2.json': { content: 'Validation patterns help' },
        'doc3.json': { content: 'No match here' }
      };

      fs.readdir.mockResolvedValueOnce(['doc1.json', 'doc2.json', 'doc3.json']);
      fs.readFile.mockImplementation((path) => {
        const filename = path.split('/').pop();
        return Promise.resolve(JSON.stringify(mockDocs[filename]));
      });

      const results = await utility.searchAcrossDocuments(/patterns/);

      expect(results).toHaveLength(2);
      expect(results[0].file).toContain('doc1.json');
      expect(results[1].file).toContain('doc2.json');
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      fs.readFile.mockResolvedValueOnce('{ invalid json');

      const result = await utility.queryByPath('test.json');

      expect(result).toBe(null);
    });

    it('should handle file system errors', async () => {
      fs.readFile.mockRejectedValue(new Error('Permission denied'));

      const result = await utility.queryByPath('test.json');

      expect(result).toBe(null);
    });
  });
});