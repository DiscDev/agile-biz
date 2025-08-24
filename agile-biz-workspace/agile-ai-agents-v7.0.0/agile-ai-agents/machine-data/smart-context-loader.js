#!/usr/bin/env node

/**
 * Smart Context Loader
 * Implements progressive context loading for token optimization
 * Allows agents to start with JSON and load MD sections as needed
 */

const fs = require('fs');
const path = require('path');

class SmartContextLoader {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.cache = new Map();
    this.tokenBudget = 0;
    this.usedTokens = 0;
  }

  /**
   * Set token budget for context loading
   */
  setTokenBudget(tokens) {
    this.tokenBudget = tokens;
    this.usedTokens = 0;
  }

  /**
   * Load context with progressive strategy
   * @param {string} agentName - Name of the agent
   * @param {number} level - Context level (1-4)
   * @returns {object} Loaded context
   */
  async loadContext(agentName, level = 1) {
    const context = {
      level,
      agent: agentName,
      data: {},
      metadata: {
        tokens_used: 0,
        sources: []
      }
    };

    try {
      switch (level) {
        case 1: // Minimal JSON (~10-20% context)
          context.data = await this.loadMinimalJson(agentName);
          break;
          
        case 2: // Full JSON (~40-50% context)
          context.data = await this.loadFullJson(agentName);
          break;
          
        case 3: // JSON + Critical MD sections (~70-80% context)
          context.data = await this.loadJsonWithMdSections(agentName);
          break;
          
        case 4: // Full Markdown (100% context)
          context.data = await this.loadFullMarkdown(agentName);
          break;
          
        default:
          throw new Error(`Invalid context level: ${level}`);
      }
      
      // Update token usage
      context.metadata.tokens_used = this.estimateTokens(JSON.stringify(context.data));
      this.usedTokens += context.metadata.tokens_used;
      
      return context;
    } catch (error) {
      console.error(`Error loading context for ${agentName}:`, error.message);
      return context;
    }
  }

  /**
   * Load minimal JSON (summary and key data only)
   */
  async loadMinimalJson(agentName) {
    const jsonPath = this.getJsonPath(agentName);
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`JSON file not found: ${jsonPath}`);
    }
    
    const fullJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Extract only essential fields
    return {
      meta: fullJson.meta,
      summary: fullJson.summary,
      key_findings: fullJson.key_findings,
      decisions: fullJson.decisions,
      next_agent_needs: fullJson.next_agent_needs
    };
  }

  /**
   * Load full JSON
   */
  async loadFullJson(agentName) {
    const jsonPath = this.getJsonPath(agentName);
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`JSON file not found: ${jsonPath}`);
    }
    
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  /**
   * Load JSON with specific MD sections
   */
  async loadJsonWithMdSections(agentName, sections = ['core_responsibilities', 'workflow']) {
    const jsonData = await this.loadFullJson(agentName);
    
    // Get MD path from JSON meta
    if (!jsonData.meta || !jsonData.meta.source_file) {
      throw new Error('No source_file reference in JSON');
    }
    
    const mdPath = path.join(this.projectRoot, jsonData.meta.source_file);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    
    // Extract requested sections
    const mdSections = {};
    sections.forEach(section => {
      const extracted = this.extractMdSection(mdContent, section);
      if (extracted) {
        mdSections[section] = extracted;
      }
    });
    
    return {
      json: jsonData,
      markdown_sections: mdSections
    };
  }

  /**
   * Load full markdown
   */
  async loadFullMarkdown(agentName) {
    const jsonPath = this.getJsonPath(agentName);
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (!jsonData.meta || !jsonData.meta.source_file) {
      throw new Error('No source_file reference in JSON');
    }
    
    const mdPath = path.join(this.projectRoot, jsonData.meta.source_file);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    
    return {
      json_summary: jsonData,
      full_markdown: mdContent
    };
  }

  /**
   * Extract a specific section from markdown
   */
  extractMdSection(mdContent, sectionName) {
    const lines = mdContent.split('\n');
    const sectionRegex = new RegExp(`^##\\s+${sectionName}`, 'i');
    const nextSectionRegex = /^##\s+/;
    
    let inSection = false;
    let sectionContent = [];
    
    for (const line of lines) {
      if (sectionRegex.test(line)) {
        inSection = true;
        sectionContent.push(line);
      } else if (inSection && nextSectionRegex.test(line)) {
        break;
      } else if (inSection) {
        sectionContent.push(line);
      }
    }
    
    return sectionContent.length > 0 ? sectionContent.join('\n') : null;
  }

  /**
   * Query specific JSON paths
   */
  queryJsonPath(agentName, jsonPath) {
    const data = this.loadFullJson(agentName);
    
    // Simple JSON path implementation
    const parts = jsonPath.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Load stakeholder context (highest priority)
   */
  async loadStakeholderContext() {
    const stakeholderPaths = [
      'project-documents/analysis-reports/stakeholder-interview',
      'project-documents/orchestration/stakeholder-responses'
    ];
    
    const context = {
      business_objectives: null,
      technical_constraints: null,
      success_metrics: null,
      priorities: null
    };
    
    for (const basePath of stakeholderPaths) {
      const fullPath = path.join(this.projectRoot, basePath);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(path.join(fullPath, file), 'utf8'));
            Object.assign(context, data);
          }
        }
      }
    }
    
    return context;
  }

  /**
   * Get JSON path for an agent
   */
  getJsonPath(agentName) {
    const mappings = {
      'prd_agent': 'ai-agents-json/prd_agent.json',
      'coder_agent': 'ai-agents-json/coder_agent.json',
      'research_agent': 'ai-agents-json/research_agent.json',
      'finance_agent': 'ai-agents-json/finance_agent.json',
      'marketing_agent': 'ai-agents-json/marketing_agent.json',
      'analysis_agent': 'ai-agents-json/analysis_agent.json',
      // Add more mappings as needed
    };
    
    const relativePath = mappings[agentName];
    if (!relativePath) {
      throw new Error(`Unknown agent: ${agentName}`);
    }
    
    return path.join(this.projectRoot, 'machine-data', relativePath);
  }

  /**
   * Estimate token count
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get recommendation for context level based on task
   */
  recommendContextLevel(task, availableTokens) {
    const recommendations = {
      'quick_lookup': 1,
      'data_retrieval': 1,
      'analysis': 2,
      'implementation': 3,
      'deep_research': 4,
      'complex_task': 4
    };
    
    let recommended = recommendations[task] || 2;
    
    // Adjust based on token budget
    if (availableTokens < 1000) {
      recommended = Math.min(recommended, 1);
    } else if (availableTokens < 5000) {
      recommended = Math.min(recommended, 2);
    } else if (availableTokens < 10000) {
      recommended = Math.min(recommended, 3);
    }
    
    return recommended;
  }

  /**
   * Cache management
   */
  getCached(key) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
        return cached.data;
      }
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Generate context loading strategy
   */
  generateLoadingStrategy(agents, totalTokenBudget) {
    const strategy = {
      total_budget: totalTokenBudget,
      allocations: {},
      loading_order: []
    };
    
    // Prioritize stakeholder context
    strategy.allocations['stakeholder'] = Math.floor(totalTokenBudget * 0.2);
    let remaining = totalTokenBudget * 0.8;
    
    // Allocate tokens to each agent
    const agentCount = agents.length;
    agents.forEach(agent => {
      strategy.allocations[agent.name] = {
        tokens: Math.floor(remaining / agentCount),
        level: this.recommendContextLevel(agent.task, remaining / agentCount),
        priority: agent.priority || 'medium'
      };
    });
    
    // Sort by priority
    strategy.loading_order = agents.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    }).map(a => a.name);
    
    return strategy;
  }
}

// Export for use in other modules
module.exports = SmartContextLoader;

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const loader = new SmartContextLoader();
  
  const command = args[0];
  const agentName = args[1];
  const level = parseInt(args[2]) || 1;
  
  async function main() {
    switch (command) {
      case 'load':
        if (!agentName) {
          console.error('Usage: smart-context-loader.js load <agent_name> [level]');
          process.exit(1);
        }
        
        console.log(`Loading context for ${agentName} at level ${level}...`);
        const context = await loader.loadContext(agentName, level);
        console.log('\nLoaded context:');
        console.log(JSON.stringify(context, null, 2));
        console.log(`\nTokens used: ${context.metadata.tokens_used}`);
        break;
        
      case 'query':
        if (!agentName || !args[2]) {
          console.error('Usage: smart-context-loader.js query <agent_name> <json_path>');
          process.exit(1);
        }
        
        const result = loader.queryJsonPath(agentName, args[2]);
        console.log(JSON.stringify(result, null, 2));
        break;
        
      case 'stakeholder':
        console.log('Loading stakeholder context...');
        const stakeholderContext = await loader.loadStakeholderContext();
        console.log(JSON.stringify(stakeholderContext, null, 2));
        break;
        
      case 'strategy':
        console.log('Generating context loading strategy...');
        const agents = [
          { name: 'prd_agent', task: 'analysis', priority: 'high' },
          { name: 'coder_agent', task: 'implementation', priority: 'high' },
          { name: 'finance_agent', task: 'data_retrieval', priority: 'medium' }
        ];
        const strategy = loader.generateLoadingStrategy(agents, 20000);
        console.log(JSON.stringify(strategy, null, 2));
        break;
        
      default:
        console.log('Smart Context Loader\n');
        console.log('Usage:');
        console.log('  load <agent> [level]     - Load context at specified level (1-4)');
        console.log('  query <agent> <path>     - Query specific JSON path');
        console.log('  stakeholder             - Load stakeholder context');
        console.log('  strategy                - Generate loading strategy example');
    }
  }
  
  main().catch(console.error);
}