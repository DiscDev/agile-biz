/**
 * JSON Utility Functions for AgileAiAgents
 * Provides helper functions for agents to work with JSON data
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Read JSON file with path-based query support
 * @param {string} filePath - Path to JSON file (can include # for JSON pointer)
 * @returns {any} - JSON data or specific value if path provided
 * 
 * Examples:
 *   readJsonPath("machine-data/ai-agents-json/prd_agent.json")
 *   readJsonPath("machine-data/ai-agents-json/prd_agent.json#/capabilities")
 *   readJsonPath("machine-data/project-documents-json/01-research/analysis.json#/key_findings/market_size")
 */
async function readJsonPath(filePath) {
  const [file, jsonPath] = filePath.split('#');
  
  // Check if JSON exists, fallback to .md if not
  if (!await fs.pathExists(file)) {
    const mdPath = file.replace('/machine-data/', '/')
                       .replace('-json/', '/')
                       .replace('.json', '.md');
    if (await fs.pathExists(mdPath)) {
      console.log(`JSON not found, falling back to markdown: ${mdPath}`);
      return await fs.readFile(mdPath, 'utf8');
    }
    throw new Error(`File not found: ${file}`);
  }
  
  const data = await fs.readJSON(file);
  
  // If no path specified, return full JSON
  if (!jsonPath) return data;
  
  // Navigate JSON path
  const segments = jsonPath.split('/').filter(s => s);
  let current = data;
  
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * Query JSON with simple filters
 * @param {string} filePath - Path to JSON file
 * @param {object} query - Query object with path and optional filter
 * @returns {any} - Filtered results
 * 
 * Example:
 *   queryJson("machine-data/project-documents-json/01-research/competitors.json", {
 *     path: "competitors",
 *     filter: { price: { "<": 10 } }
 *   })
 */
async function queryJson(filePath, query) {
  const data = await readJsonPath(filePath + (query.path ? '#/' + query.path : ''));
  
  if (!query.filter || !Array.isArray(data)) {
    return data;
  }
  
  // Apply simple filters
  return data.filter(item => {
    for (const [field, condition] of Object.entries(query.filter)) {
      const value = item[field];
      
      if (typeof condition === 'object') {
        for (const [op, target] of Object.entries(condition)) {
          switch (op) {
            case '<': if (!(value < target)) return false; break;
            case '>': if (!(value > target)) return false; break;
            case '<=': if (!(value <= target)) return false; break;
            case '>=': if (!(value >= target)) return false; break;
            case '=': if (value !== target) return false; break;
            case '!=': if (value === target) return false; break;
          }
        }
      } else {
        if (value !== condition) return false;
      }
    }
    return true;
  });
}

/**
 * Get agent context priorities
 * @param {string} agentName - Name of the agent
 * @returns {object} - Context priorities for the agent
 */
async function getAgentPriorities(agentName) {
  try {
    const agentData = await readJsonPath(`machine-data/ai-agents-json/${agentName}.json`);
    return agentData.context_priorities || {};
  } catch (error) {
    console.log(`No JSON config for ${agentName}, using defaults`);
    return {};
  }
}

/**
 * Load context-optimized data for an agent
 * @param {string} fromAgent - Agent that created the data
 * @param {string} currentAgent - Agent requesting the data
 * @returns {object} - Optimized data based on priorities
 */
async function loadOptimizedContext(fromAgent, currentAgent) {
  const priorities = await getAgentPriorities(currentAgent);
  const agentPriorities = priorities[fromAgent] || {};
  
  // Find the latest document from the agent
  const docsPath = 'machine-data/project-documents-json';
  const folders = await fs.readdir(docsPath);
  
  for (const folder of folders) {
    const folderPath = path.join(docsPath, folder);
    const files = await fs.readdir(folderPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await readJsonPath(path.join(folderPath, file));
        if (data.meta && data.meta.agent === fromAgent) {
          // Return optimized data based on priorities
          const optimized = {
            meta: data.meta,
            summary: data.summary
          };
          
          // Add critical fields
          if (agentPriorities.critical) {
            optimized.critical_data = {};
            for (const field of agentPriorities.critical) {
              const value = await readJsonPath(path.join(folderPath, file) + '#/' + field);
              if (value !== undefined) {
                optimized.critical_data[field] = value;
              }
            }
          }
          
          // Add optional fields if context allows
          if (agentPriorities.optional && process.env.CONTEXT_BUDGET !== 'low') {
            optimized.optional_data = {};
            for (const field of agentPriorities.optional) {
              const value = await readJsonPath(path.join(folderPath, file) + '#/' + field);
              if (value !== undefined) {
                optimized.optional_data[field] = value;
              }
            }
          }
          
          return optimized;
        }
      }
    }
  }
  
  return null;
}

// Simple cache implementation
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Read JSON with caching
 * @param {string} filePath - Path to JSON file
 * @returns {any} - Cached or fresh JSON data
 */
async function readJsonCached(filePath) {
  const cached = cache.get(filePath);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await readJsonPath(filePath);
  cache.set(filePath, { data, timestamp: Date.now() });
  
  // Clean old cache entries
  for (const [key, value] of cache.entries()) {
    if (Date.now() - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
  
  return data;
}

module.exports = {
  readJsonPath,
  queryJson,
  getAgentPriorities,
  loadOptimizedContext,
  readJsonCached
};