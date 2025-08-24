/**
 * JSON Query Utility for AgileAiAgents Context Optimization
 * Provides efficient JSON data access with caching and fallback to markdown files
 */

const fs = require('fs');
const path = require('path');

class JSONQueryUtility {
  constructor() {
    this.cache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      totalQueries: 0
    };
    this.basePath = path.join(__dirname);
    this.agentJsonPath = path.join(this.basePath, 'ai-agents-json');
    this.projectJsonPath = path.join(this.basePath, 'project-documents-json');
    this.systemJsonPath = path.join(this.basePath, 'aaa-documents-json');
    
    // Default TTL is 5 minutes
    this.defaultTTL = 5 * 60 * 1000;
    
    // Cache cleanup interval (every 10 minutes)
    setInterval(() => this.cleanupExpiredCache(), 10 * 60 * 1000);
  }

  /**
   * Main query function with path-based syntax
   * Example: queryJSON("coder_agent.json#/capabilities/0")
   */
  queryJSON(queryPath, options = {}) {
    this.cacheStats.totalQueries++;
    
    const { filePath, jsonPath } = this.parseQueryPath(queryPath);
    const cacheKey = queryPath;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() < cached.expiry) {
        this.cacheStats.hits++;
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }
    
    this.cacheStats.misses++;
    
    // Try to load JSON file
    const jsonData = this.loadJSONFile(filePath, options);
    if (jsonData === null) {
      return null; // File not found or error
    }
    
    // Extract specific path if provided
    const result = jsonPath ? this.extractJSONPath(jsonData, jsonPath) : jsonData;
    
    // Cache the result
    const ttl = options.ttl || this.defaultTTL;
    this.cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + ttl
    });
    
    return result;
  }

  /**
   * Parse query path into file path and JSON path
   * Example: "coder_agent.json#/capabilities/0" → { filePath: "coder_agent.json", jsonPath: "/capabilities/0" }
   */
  parseQueryPath(queryPath) {
    const parts = queryPath.split('#');
    const filePath = parts[0];
    const jsonPath = parts.length > 1 ? parts[1] : null;
    
    return { filePath, jsonPath };
  }

  /**
   * Load JSON file with fallback to markdown
   */
  loadJSONFile(relativePath, options = {}) {
    // Normalize the path - handle both relative and absolute paths
    let normalizedPath = relativePath;
    if (relativePath.startsWith('agile-ai-agents/')) {
      normalizedPath = relativePath.replace('agile-ai-agents/', '');
    }
    
    // Determine the full path based on file location
    let fullPath;
    
    if (normalizedPath.includes('machine-data/ai-agents-json/')) {
      // Handle new JSON reference format
      const fileName = normalizedPath.replace('machine-data/ai-agents-json/', '');
      fullPath = path.join(this.agentJsonPath, fileName);
    } else if (normalizedPath.includes('machine-data/aaa-documents-json/')) {
      // Handle new JSON reference format for aaa-documents
      const fileName = normalizedPath.replace('machine-data/aaa-documents-json/', '');
      fullPath = path.join(this.systemJsonPath, fileName);
    } else if (normalizedPath.includes('machine-data/project-documents-json/')) {
      // Handle new JSON reference format for project-documents
      const fileName = normalizedPath.replace('machine-data/project-documents-json/', '');
      fullPath = path.join(this.projectJsonPath, fileName);
    } else if (normalizedPath.includes('ai-agents-json/') || normalizedPath.endsWith('_agent.json')) {
      // Legacy: Agent JSON files
      const fileName = normalizedPath.replace('ai-agents-json/', '');
      fullPath = path.join(this.agentJsonPath, fileName);
    } else if (normalizedPath.includes('project-documents-json/')) {
      // Legacy: Project document JSON files
      fullPath = path.join(this.basePath, normalizedPath);
    } else if (normalizedPath.includes('aaa-documents-json/')) {
      // Legacy: System documentation JSON files
      fullPath = path.join(this.basePath, normalizedPath);
    } else {
      // Default to agent JSON if no path specified
      fullPath = path.join(this.agentJsonPath, normalizedPath);
    }

    try {
      if (fs.existsSync(fullPath)) {
        const jsonContent = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(jsonContent);
      }
    } catch (error) {
      console.warn(`Warning: Error loading JSON file ${fullPath}:`, error.message);
    }

    // Fallback to markdown file if JSON not available
    if (options.allowMarkdownFallback !== false) {
      return this.fallbackToMarkdown(normalizedPath);
    }

    return null;
  }

  /**
   * Fallback to reading markdown file when JSON is not available
   */
  fallbackToMarkdown(relativePath) {
    try {
      // Convert JSON path to markdown path
      let mdPath;
      
      // Handle new JSON reference format
      if (relativePath.includes('machine-data/ai-agents-json/')) {
        // New format: machine-data/ai-agents-json/coder_agent.json → ai-agents/coder_agent.md
        const fileName = relativePath.replace('machine-data/ai-agents-json/', '').replace('.json', '.md');
        mdPath = path.join(this.basePath, '..', 'ai-agents', fileName);
      } else if (relativePath.includes('machine-data/aaa-documents-json/')) {
        // New format: machine-data/aaa-documents-json/guide.json → aaa-documents/guide.md
        const fileName = relativePath.replace('machine-data/aaa-documents-json/', '').replace('.json', '.md');
        mdPath = path.join(this.basePath, '..', 'aaa-documents', fileName);
      } else if (relativePath.includes('machine-data/project-documents-json/')) {
        // New format: machine-data/project-documents-json/path/file.json → project-documents/path/file.md
        const filePath = relativePath.replace('machine-data/project-documents-json/', '').replace('.json', '.md');
        mdPath = path.join(this.basePath, '..', 'project-documents', filePath);
      } else if (relativePath.endsWith('_agent.json')) {
        // Legacy: Agent files: ai-agents-json/coder_agent.json → ai-agents/coder_agent.md
        const agentName = relativePath.replace('.json', '.md');
        mdPath = path.join(this.basePath, '..', 'ai-agents', agentName);
      } else if (relativePath.includes('project-documents-json/')) {
        // Legacy: Project files: project-documents-json/planning/prd.json → project-documents/planning/prd.md
        mdPath = relativePath.replace('project-documents-json/', '../project-documents/').replace('.json', '.md');
        mdPath = path.join(this.basePath, mdPath);
      } else if (relativePath.includes('aaa-documents-json/')) {
        // Legacy: System files: aaa-documents-json/setup-guide.json → aaa-documents/setup-guide.md
        mdPath = relativePath.replace('aaa-documents-json/', '../aaa-documents/').replace('.json', '.md');
        mdPath = path.join(this.basePath, mdPath);
      }

      if (mdPath && fs.existsSync(mdPath)) {
        const mdContent = fs.readFileSync(mdPath, 'utf-8');
        console.log(`📄 Fallback: Reading markdown file ${path.basename(mdPath)}`);
        
        // Return a simple structure for markdown content
        return {
          meta: {
            source: 'markdown_fallback',
            file_path: mdPath,
            timestamp: new Date().toISOString()
          },
          content: mdContent,
          summary: this.extractMarkdownSummary(mdContent)
        };
      }
    } catch (error) {
      console.warn(`Warning: Error in markdown fallback:`, error.message);
    }

    return null;
  }

  /**
   * Extract summary from markdown content
   */
  extractMarkdownSummary(content) {
    const lines = content.split('\n');
    let summary = '';
    
    // Look for overview or summary section
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('## overview') || 
          line.toLowerCase().includes('## summary')) {
        // Extract next few non-empty lines
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.startsWith('#')) {
            summary += nextLine + ' ';
            if (summary.length > 200) break;
          }
        }
        break;
      }
    }
    
    return summary.trim() || 'No summary available';
  }

  /**
   * Extract data from JSON using path notation
   * Example: extractJSONPath(data, "/capabilities/0") → data.capabilities[0]
   */
  extractJSONPath(data, jsonPath) {
    if (!jsonPath || jsonPath === '/') {
      return data;
    }

    try {
      const pathParts = jsonPath.split('/').filter(part => part.length > 0);
      let current = data;

      for (const part of pathParts) {
        if (current === null || current === undefined) {
          return null;
        }

        // Handle array indices
        if (/^\d+$/.test(part)) {
          const index = parseInt(part);
          if (Array.isArray(current) && index < current.length) {
            current = current[index];
          } else {
            return null;
          }
        } else {
          // Handle object properties
          if (typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return null;
          }
        }
      }

      return current;
    } catch (error) {
      console.warn(`Error extracting JSON path ${jsonPath}:`, error.message);
      return null;
    }
  }

  /**
   * Query multiple paths efficiently
   */
  queryMultiple(queries) {
    const results = {};
    
    for (const [key, queryPath] of Object.entries(queries)) {
      results[key] = this.queryJSON(queryPath);
    }
    
    return results;
  }

  /**
   * Get critical data for an agent (high priority)
   */
  getCriticalData(agentName, sourceAgent) {
    const agentData = this.queryJSON(`${agentName}.json`);
    
    if (!agentData || !agentData.context_priorities) {
      return null;
    }

    const priorities = agentData.context_priorities[sourceAgent];
    if (!priorities || !priorities.critical) {
      return null;
    }

    const sourceData = this.queryJSON(`${sourceAgent}.json`);
    if (!sourceData) {
      return null;
    }

    const criticalData = {};
    for (const field of priorities.critical) {
      const value = this.extractJSONPath(sourceData, `/${field}`);
      if (value !== null) {
        criticalData[field] = value;
      }
    }

    return criticalData;
  }

  /**
   * Get optional data for an agent (lower priority)
   */
  getOptionalData(agentName, sourceAgent, contextLimit = 10000) {
    const agentData = this.queryJSON(`${agentName}.json`);
    
    if (!agentData || !agentData.context_priorities) {
      return null;
    }

    const priorities = agentData.context_priorities[sourceAgent];
    if (!priorities || !priorities.optional) {
      return null;
    }

    const sourceData = this.queryJSON(`${sourceAgent}.json`);
    if (!sourceData) {
      return null;
    }

    const optionalData = {};
    let currentSize = 0;

    for (const field of priorities.optional) {
      const value = this.extractJSONPath(sourceData, `/${field}`);
      if (value !== null) {
        const fieldSize = JSON.stringify(value).length;
        if (currentSize + fieldSize <= contextLimit) {
          optionalData[field] = value;
          currentSize += fieldSize;
        } else {
          break; // Stop if we exceed context limit
        }
      }
    }

    return optionalData;
  }

  /**
   * Get optimized context for an agent
   */
  getOptimizedContext(agentName, sourceAgents, options = {}) {
    const contextLimit = options.contextLimit || 50000; // 50KB default limit
    const context = {
      critical: {},
      optional: {},
      metadata: {
        agent: agentName,
        timestamp: new Date().toISOString(),
        sources: sourceAgents,
        optimization_stats: {
          total_size: 0,
          critical_size: 0,
          optional_size: 0
        }
      }
    };

    // First, load all critical data
    for (const sourceAgent of sourceAgents) {
      const criticalData = this.getCriticalData(agentName, sourceAgent);
      if (criticalData) {
        context.critical[sourceAgent] = criticalData;
      }
    }

    const criticalSize = JSON.stringify(context.critical).length;
    context.metadata.optimization_stats.critical_size = criticalSize;

    // Then, load optional data within remaining context limit
    const remainingLimit = contextLimit - criticalSize;
    const optionalLimit = Math.max(0, remainingLimit);

    for (const sourceAgent of sourceAgents) {
      const optionalData = this.getOptionalData(agentName, sourceAgent, optionalLimit / sourceAgents.length);
      if (optionalData && Object.keys(optionalData).length > 0) {
        context.optional[sourceAgent] = optionalData;
      }
    }

    const optionalSize = JSON.stringify(context.optional).length;
    context.metadata.optimization_stats.optional_size = optionalSize;
    context.metadata.optimization_stats.total_size = criticalSize + optionalSize;

    return context;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      ...this.cacheStats,
      cache_size: this.cache.size,
      hit_rate: this.cacheStats.totalQueries > 0 
        ? (this.cacheStats.hits / this.cacheStats.totalQueries * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now >= value.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }
}

// Export the class and create a default instance
const jsonQuery = new JSONQueryUtility();

module.exports = {
  JSONQueryUtility,
  query: jsonQuery
};