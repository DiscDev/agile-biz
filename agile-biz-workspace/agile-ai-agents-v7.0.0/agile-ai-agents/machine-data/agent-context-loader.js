/**
 * Agent Context Loader for JSON Context Optimization
 * Provides a standardized way for agents to load optimized context data
 * Updated to support enhanced JSON structure and GitHub markdown standards
 */

const { query } = require('./json-query-utility');
const { handler: errorHandler } = require('./error-handler');
const { monitor } = require('./performance-monitor');
const fs = require('fs').promises;
const path = require('path');

class AgentContextLoader {
  constructor(agentName) {
    this.agentName = agentName;
    this.contextCache = new Map();
    this.sectionCache = new Map();
    this.loadStartTime = Date.now();
  }

  /**
   * Load optimized context for this agent from multiple sources
   * @param {Array} sourceAgents - List of agent names to load context from
   * @param {Object} options - Configuration options
   * @returns {Object} Optimized context data
   */
  async loadOptimizedContext(sourceAgents = [], options = {}) {
    const startTime = Date.now();
    const contextLimit = options.contextLimit || 50000; // 50KB default
    const allowMarkdownFallback = options.allowMarkdownFallback !== false;
    
    console.log(`🔄 ${this.agentName}: Loading optimized context from ${sourceAgents.length} sources`);
    
    try {
      // Try to get fully optimized context using JSON files
      const optimizedContext = query.getOptimizedContext(this.agentName, sourceAgents, {
        contextLimit: contextLimit
      });
      
      if (optimizedContext && optimizedContext.metadata.optimization_stats.total_size > 0) {
        const reductionPercentage = this.calculateContextReduction(optimizedContext);
        
        // Record successful optimization
        monitor.recordContextOptimization(
          `${this.agentName}_context_load`,
          reductionPercentage,
          optimizedContext.metadata.optimization_stats.total_size,
          this.agentName
        );
        
        const loadTime = Date.now() - startTime;
        monitor.recordQuery(`${this.agentName}_optimized_context`, loadTime, true, reductionPercentage);
        
        console.log(`✅ ${this.agentName}: Loaded optimized context (${reductionPercentage.toFixed(1)}% reduction, ${loadTime}ms)`);
        
        return {
          success: true,
          method: 'json_optimized',
          data: optimizedContext,
          metrics: {
            reduction_percentage: reductionPercentage,
            load_time: loadTime,
            sources_loaded: sourceAgents.length
          }
        };
      }
    } catch (error) {
      console.warn(`⚠️ ${this.agentName}: JSON optimization failed: ${error.message}`);
      errorHandler.handleJSONError(`${this.agentName}_context`, error);
    }
    
    // Fallback to individual agent loading with markdown support
    if (allowMarkdownFallback) {
      return await this.loadFallbackContext(sourceAgents, options);
    }
    
    return {
      success: false,
      method: 'failed',
      data: null,
      error: 'Context loading failed and fallback disabled'
    };
  }

  /**
   * Load context from individual sources with markdown fallback
   */
  async loadFallbackContext(sourceAgents, options) {
    const startTime = Date.now();
    const context = { agents: {} };
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    console.log(`📄 ${this.agentName}: Using fallback context loading`);
    
    for (const sourceAgent of sourceAgents) {
      try {
        // Try JSON first
        const jsonData = query.queryJSON(`${sourceAgent}.json`);
        
        if (jsonData && jsonData.meta && jsonData.meta.source !== 'markdown_fallback') {
          // Successfully loaded JSON
          const criticalData = query.getCriticalData(this.agentName, sourceAgent);
          context.agents[sourceAgent] = {
            source: 'json',
            critical_data: criticalData,
            summary: jsonData.summary,
            capabilities: jsonData.capabilities?.slice(0, 5) || [] // Limit capabilities
          };
          
          totalOptimizedSize += JSON.stringify(context.agents[sourceAgent]).length;
        } else {
          // Fallback to markdown
          const markdownData = await this.loadMarkdownAgent(sourceAgent);
          if (markdownData) {
            context.agents[sourceAgent] = markdownData;
            totalOptimizedSize += JSON.stringify(markdownData).length;
          }
        }
        
        // Estimate original size (for reduction calculation)
        totalOriginalSize += 15000; // Approximate original size per agent
        
      } catch (error) {
        console.warn(`⚠️ ${this.agentName}: Failed to load ${sourceAgent}: ${error.message}`);
        errorHandler.logError(
          errorHandler.generateErrorId(),
          'agent_context_load_failed',
          error,
          { requesting_agent: this.agentName, source_agent: sourceAgent }
        );
      }
    }
    
    const loadTime = Date.now() - startTime;
    const reductionPercentage = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100 
      : 0;
    
    // Record fallback performance
    monitor.recordQuery(`${this.agentName}_fallback_context`, loadTime, false, reductionPercentage);
    
    console.log(`📊 ${this.agentName}: Fallback context loaded (${reductionPercentage.toFixed(1)}% reduction, ${loadTime}ms)`);
    
    return {
      success: true,
      method: 'fallback_mixed',
      data: context,
      metrics: {
        reduction_percentage: reductionPercentage,
        load_time: loadTime,
        sources_loaded: Object.keys(context.agents).length,
        json_sources: Object.values(context.agents).filter(a => a.source === 'json').length,
        markdown_sources: Object.values(context.agents).filter(a => a.source === 'markdown').length
      }
    };
  }

  /**
   * Load markdown agent data with essential information extraction
   */
  async loadMarkdownAgent(agentName) {
    try {
      const markdownData = query.queryJSON(`${agentName}.json`, { allowMarkdownFallback: true });
      
      if (markdownData && markdownData.meta && markdownData.meta.source === 'markdown_fallback') {
        // Extract essential information from markdown
        return {
          source: 'markdown',
          summary: markdownData.summary,
          capabilities: this.extractLimitedCapabilities(markdownData.content),
          key_info: this.extractKeyInformation(markdownData.content)
        };
      }
    } catch (error) {
      console.warn(`Failed to load markdown for ${agentName}: ${error.message}`);
    }
    
    return null;
  }

  /**
   * Extract limited capabilities from markdown content
   */
  extractLimitedCapabilities(content) {
    const lines = content.split('\n');
    const capabilities = [];
    
    for (let i = 0; i < lines.length && capabilities.length < 3; i++) {
      const line = lines[i].trim();
      if ((line.startsWith('- ') || line.startsWith('* ')) && 
          (lines[i-1]?.toLowerCase().includes('capabilit') || 
           lines[i-1]?.toLowerCase().includes('function'))) {
        capabilities.push(line.substring(2).substring(0, 100)); // Limit length
      }
    }
    
    return capabilities;
  }

  /**
   * Extract key information from markdown content
   */
  extractKeyInformation(content) {
    const info = {};
    
    // Extract tools/technologies mentioned
    const toolMatches = content.match(/(?:tool|technolog|framework|librar)[^\.]*?([A-Z][a-zA-Z0-9]+)/gi);
    if (toolMatches) {
      info.tools = [...new Set(toolMatches.slice(0, 5))]; // Unique, limited list
    }
    
    // Extract responsibilities
    const respMatches = content.match(/(?:responsibl|role|duty)[^\.]*?([a-z][^\.]{10,50})/gi);
    if (respMatches) {
      info.responsibilities = respMatches.slice(0, 3);
    }
    
    return info;
  }

  /**
   * Load a specific section from a markdown file using reference
   * @param {string} mdReference - Reference in format "agile-ai-agents/path/file.md#section-anchor"
   * @param {Object} options - Configuration options
   * @returns {Object} Section content and metadata
   */
  async loadSectionByReference(mdReference, options = {}) {
    const startTime = Date.now();
    
    // Check cache first
    if (this.sectionCache.has(mdReference)) {
      const cached = this.sectionCache.get(mdReference);
      if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
        return cached.data;
      }
    }
    
    try {
      // Parse reference
      const [filePath, anchor] = mdReference.split('#');
      if (!filePath || !anchor) {
        throw new Error(`Invalid reference format: ${mdReference}`);
      }
      
      // Resolve file path
      const fullPath = path.join(__dirname, '../..', filePath.replace('agile-ai-agents/', ''));
      
      // Read file content
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');
      
      // Find section by anchor
      const anchorPattern = new RegExp(`^#+\\s+(.+)$`);
      let sectionStart = -1;
      let sectionEnd = lines.length;
      let sectionLevel = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(anchorPattern);
        if (match) {
          const heading = match[1];
          const headingAnchor = heading.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          
          if (headingAnchor === anchor && sectionStart === -1) {
            sectionStart = i;
            sectionLevel = lines[i].match(/^#+/)[0].length;
          } else if (sectionStart > -1) {
            const currentLevel = lines[i].match(/^#+/)[0].length;
            if (currentLevel <= sectionLevel) {
              sectionEnd = i;
              break;
            }
          }
        }
      }
      
      if (sectionStart === -1) {
        throw new Error(`Section anchor not found: ${anchor}`);
      }
      
      // Extract section content
      const sectionContent = lines.slice(sectionStart, sectionEnd).join('\n');
      const tokens = Math.ceil(sectionContent.length * 0.25);
      
      const result = {
        success: true,
        reference: mdReference,
        content: sectionContent,
        tokens: tokens,
        heading: lines[sectionStart].replace(/^#+\s+/, ''),
        load_time: Date.now() - startTime
      };
      
      // Cache the result
      this.sectionCache.set(mdReference, {
        data: result,
        timestamp: Date.now()
      });
      
      // Record metrics
      monitor.recordQuery(`section_load:${anchor}`, result.load_time, true);
      
      return result;
      
    } catch (error) {
      errorHandler.handleError(error, 'loadSectionByReference', {
        reference: mdReference,
        agent: this.agentName
      });
      
      return {
        success: false,
        reference: mdReference,
        error: error.message,
        load_time: Date.now() - startTime
      };
    }
  }

  /**
   * Load context progressively based on recommendations
   * @param {Object} agentJson - The agent's JSON data with context recommendations
   * @param {string} level - Context level: 'minimal', 'standard', or 'detailed'
   * @returns {Object} Loaded context based on recommendations
   */
  async loadProgressiveContext(agentJson, level = 'standard') {
    const recommendations = agentJson.context_recommendations?.[level] || {};
    const context = {};
    
    // Enhanced JSON structure support
    if (typeof recommendations === 'object' && recommendations.sections) {
      // New structure: { sections: [...], tokens: N, description: "..." }
      const sections = recommendations.sections;
      const estimatedTokens = recommendations.tokens;
      
      console.log(`📊 ${this.agentName}: Loading ${level} context (${estimatedTokens} tokens)`);
      
      for (const section of sections) {
        if (section === 'minimal' || section === 'standard') {
          // Recursive call for nested recommendations
          const nestedContext = await this.loadProgressiveContext(agentJson, section);
          Object.assign(context, nestedContext);
        } else if (section.includes('.')) {
          // Direct path in JSON (e.g., "workflows.available")
          const pathParts = section.split('.');
          let value = agentJson;
          for (const part of pathParts) {
            value = value?.[part];
          }
          if (value !== undefined) {
            context[section] = value;
          }
        } else if (section === 'all_md_references_as_needed') {
          // Collect all md_reference fields for progressive loading
          context.md_references = this.collectMdReferences(agentJson);
        } else {
          // Top-level property
          if (agentJson[section] !== undefined) {
            context[section] = agentJson[section];
          }
        }
      }
      
      // Add metadata about the context level
      context._context_metadata = {
        level: level,
        estimated_tokens: estimatedTokens,
        description: recommendations.description,
        sections_loaded: sections.length
      };
    } else {
      // Legacy array structure support
      const sectionArray = Array.isArray(recommendations) ? recommendations : [];
      for (const recommendation of sectionArray) {
        if (recommendation === 'minimal' || recommendation === 'standard') {
          const nestedContext = await this.loadProgressiveContext(agentJson, recommendation);
          Object.assign(context, nestedContext);
        } else if (recommendation.includes('.')) {
          const pathParts = recommendation.split('.');
          let value = agentJson;
          for (const part of pathParts) {
            value = value?.[part];
          }
          if (value !== undefined) {
            context[recommendation] = value;
          }
        } else if (agentJson[recommendation] !== undefined) {
          context[recommendation] = agentJson[recommendation];
        }
      }
    }
    
    return context;
  }

  /**
   * Collect all md_reference fields from the agent JSON
   */
  collectMdReferences(agentJson) {
    const references = {};
    
    // Traverse the JSON structure to find md_reference fields
    const traverse = (obj, path = '') => {
      if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (key === 'md_reference' && typeof value === 'string') {
            references[currentPath.replace('.md_reference', '')] = value;
          } else if (typeof value === 'object') {
            traverse(value, currentPath);
          }
        }
      }
    };
    
    traverse(agentJson);
    return references;
  }

  /**
   * Load content by md_reference link
   * @param {string} mdReference - Reference from JSON md_reference field
   * @param {Object} options - Loading options
   * @returns {Object} Referenced content
   */
  async loadByMdReference(mdReference, options = {}) {
    const startTime = Date.now();
    
    try {
      // Use the existing loadSectionByReference method
      const result = await this.loadSectionByReference(mdReference, options);
      
      if (result.success) {
        console.log(`📖 ${this.agentName}: Loaded section via md_reference (${result.tokens} tokens)`);
        
        // Record metrics
        monitor.recordQuery(`md_reference_load`, result.load_time, true);
        
        return {
          success: true,
          method: 'md_reference',
          data: result.content,
          metadata: {
            reference: mdReference,
            heading: result.heading,
            tokens: result.tokens,
            load_time: result.load_time
          }
        };
      }
    } catch (error) {
      console.warn(`⚠️ ${this.agentName}: Failed to load md_reference ${mdReference}: ${error.message}`);
      errorHandler.handleError(error, 'loadByMdReference', {
        reference: mdReference,
        agent: this.agentName
      });
    }
    
    return {
      success: false,
      method: 'md_reference_failed',
      data: null,
      error: `Failed to load md_reference: ${mdReference}`
    };
  }

  /**
   * Load multiple sections by their md_reference links
   * @param {Object} mdReferences - Object with keys as section names and values as md_reference links
   * @param {Object} options - Loading options
   * @returns {Object} Object with loaded sections
   */
  async loadMultipleByMdReferences(mdReferences, options = {}) {
    const startTime = Date.now();
    const results = {};
    const errors = [];
    
    console.log(`📚 ${this.agentName}: Loading ${Object.keys(mdReferences).length} sections by md_reference`);
    
    for (const [sectionName, mdReference] of Object.entries(mdReferences)) {
      try {
        const result = await this.loadByMdReference(mdReference, options);
        if (result.success) {
          results[sectionName] = result.data;
        } else {
          errors.push(`${sectionName}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`${sectionName}: ${error.message}`);
      }
    }
    
    const loadTime = Date.now() - startTime;
    const successCount = Object.keys(results).length;
    const totalCount = Object.keys(mdReferences).length;
    
    console.log(`📚 ${this.agentName}: Loaded ${successCount}/${totalCount} sections (${loadTime}ms)`);
    
    return {
      success: successCount > 0,
      method: 'multiple_md_references',
      data: results,
      metadata: {
        sections_loaded: successCount,
        total_sections: totalCount,
        load_time: loadTime,
        errors: errors
      }
    };
  }

  /**
   * Load specific data from a single agent
   */
  async loadAgentData(sourceAgent, dataPath = null, options = {}) {
    const startTime = Date.now();
    
    try {
      // Try optimized JSON query first
      if (dataPath) {
        const result = query.queryJSON(`${sourceAgent}.json#${dataPath}`, options);
        if (result !== null) {
          const loadTime = Date.now() - startTime;
          monitor.recordQuery(`${sourceAgent}.json#${dataPath}`, loadTime, true);
          
          return {
            success: true,
            method: 'json_query',
            data: result,
            source: sourceAgent,
            path: dataPath,
            load_time: loadTime
          };
        }
      }
      
      // Fallback to full agent data
      const agentData = query.queryJSON(`${sourceAgent}.json`, { allowMarkdownFallback: true });
      if (agentData) {
        const loadTime = Date.now() - startTime;
        const isFallback = agentData.meta?.source === 'markdown_fallback';
        
        monitor.recordQuery(`${sourceAgent}.json`, loadTime, !isFallback);
        
        // Extract specific path if requested
        const result = dataPath ? query.extractJSONPath(agentData, dataPath) : agentData;
        
        return {
          success: true,
          method: isFallback ? 'markdown_fallback' : 'json_full',
          data: result,
          source: sourceAgent,
          path: dataPath,
          load_time: loadTime
        };
      }
    } catch (error) {
      errorHandler.handleJSONError(`${sourceAgent}.json`, error);
    }
    
    return {
      success: false,
      method: 'failed',
      data: null,
      error: `Failed to load data from ${sourceAgent}`
    };
  }

  /**
   * Load critical data only (fastest method)
   */
  async loadCriticalData(sourceAgents) {
    const startTime = Date.now();
    const criticalData = {};
    
    console.log(`⚡ ${this.agentName}: Loading critical data only from ${sourceAgents.length} sources`);
    
    for (const sourceAgent of sourceAgents) {
      const critical = query.getCriticalData(this.agentName, sourceAgent);
      if (critical && Object.keys(critical).length > 0) {
        criticalData[sourceAgent] = critical;
      }
    }
    
    const loadTime = Date.now() - startTime;
    const dataSize = JSON.stringify(criticalData).length;
    
    monitor.recordQuery(`${this.agentName}_critical_only`, loadTime, true);
    
    console.log(`⚡ ${this.agentName}: Critical data loaded (${dataSize} bytes, ${loadTime}ms)`);
    
    return {
      success: true,
      method: 'critical_only',
      data: criticalData,
      metrics: {
        load_time: loadTime,
        data_size: dataSize,
        sources_loaded: Object.keys(criticalData).length
      }
    };
  }

  /**
   * Calculate context reduction percentage
   */
  calculateContextReduction(optimizedContext) {
    const stats = optimizedContext.metadata.optimization_stats;
    const estimatedOriginalSize = stats.total_size * 10; // Rough estimate
    
    return ((estimatedOriginalSize - stats.total_size) / estimatedOriginalSize) * 100;
  }

  /**
   * Get context loading statistics
   */
  getLoadingStats() {
    return {
      agent: this.agentName,
      session_start: this.loadStartTime,
      cache_size: this.contextCache.size,
      uptime: Date.now() - this.loadStartTime
    };
  }

  /**
   * Clear context cache
   */
  clearCache() {
    this.contextCache.clear();
    console.log(`🧹 ${this.agentName}: Context cache cleared`);
  }
}

/**
 * Helper function to create context loader for any agent
 */
function createContextLoader(agentName) {
  return new AgentContextLoader(agentName);
}

/**
 * Quick context loading functions for common patterns
 */
const ContextPatterns = {
  // For development agents needing requirements and testing info
  developmentContext: async (agentName) => {
    const loader = createContextLoader(agentName);
    return await loader.loadOptimizedContext([
      'prd_agent',
      'testing_agent',
      'security_agent',
      'ui_ux_agent'
    ]);
  },
  
  // For business agents needing market and financial data
  businessContext: async (agentName) => {
    const loader = createContextLoader(agentName);
    return await loader.loadOptimizedContext([
      'research_agent',
      'finance_agent',
      'analysis_agent',
      'marketing_agent'
    ]);
  },
  
  // For infrastructure agents needing technical specifications
  infraContext: async (agentName) => {
    const loader = createContextLoader(agentName);
    return await loader.loadOptimizedContext([
      'devops_agent',
      'security_agent',
      'dba_agent',
      'api_agent'
    ]);
  },
  
  // For marketing agents needing research and analytics
  marketingContext: async (agentName) => {
    const loader = createContextLoader(agentName);
    return await loader.loadOptimizedContext([
      'research_agent',
      'analytics_growth_intelligence_agent',
      'customer_lifecycle_retention_agent',
      'seo_agent'
    ]);
  },
  
  // For system administration and setup
  systemContext: async (agentName) => {
    const loader = createContextLoader(agentName);
    const context = await loader.loadOptimizedContext([]);
    
    // Add system documentation
    try {
      const systemDocs = query.queryMultiple({
        setup_guide: 'aaa-documents-json/setup-guide.json',
        usage_guide: 'aaa-documents-json/usage-guide.json',
        troubleshooting: 'aaa-documents-json/troubleshooting.json',
        orchestrator_config: 'aaa-documents-json/auto-project-orchestrator.json'
      });
      
      if (context.success) {
        context.data.system_docs = systemDocs;
      }
    } catch (error) {
      console.warn('Failed to load system documentation:', error.message);
    }
    
    return context;
  },
  
  // For project management and orchestration
  orchestrationContext: async (agentName) => {
    const loader = createContextLoader(agentName);
    const context = await loader.loadOptimizedContext([
      'project_manager_agent',
      'document_manager_agent'
    ]);
    
    // Add orchestration documentation
    try {
      const orchestratorConfig = query.queryJSON('aaa-documents-json/auto-project-orchestrator.json');
      if (context.success && orchestratorConfig) {
        context.data.orchestration_config = orchestratorConfig;
      }
    } catch (error) {
      console.warn('Failed to load orchestration config:', error.message);
    }
    
    return context;
  }
};

module.exports = {
  AgentContextLoader,
  createContextLoader,
  ContextPatterns
};