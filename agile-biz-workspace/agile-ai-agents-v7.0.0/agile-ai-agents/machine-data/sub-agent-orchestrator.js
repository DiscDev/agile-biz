/**
 * Sub-Agent Orchestrator for AgileAiAgents
 * Manages parallel execution of sub-agents for improved performance
 */

const fs = require('fs').promises;
const path = require('path');
// Simple UUID alternative for testing
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class SubAgentOrchestrator {
  constructor() {
    this.activeSubAgents = new Map();
    this.sessionId = `session-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    this.registryBasePath = path.join(__dirname, '..', 'project-documents', 'orchestration', 'sub-agent-registries');
    this.maxConcurrent = 5;
    this.defaultTimeout = 300000; // 5 minutes
  }

  /**
   * Initialize the orchestrator and create necessary directories
   */
  async initialize() {
    // Create registry directories
    const sessionPath = path.join(this.registryBasePath, this.sessionId);
    await fs.mkdir(sessionPath, { recursive: true });
    
    // Create active symlink
    const activePath = path.join(this.registryBasePath, '_active');
    try {
      await fs.unlink(activePath);
    } catch (e) {
      // Ignore if doesn't exist
    }
    await fs.symlink(this.sessionId, activePath, 'dir');
    
    // Initialize session summary
    const sessionSummary = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      subAgents: [],
      status: 'active'
    };
    
    await fs.writeFile(
      path.join(sessionPath, 'session-summary.json'),
      JSON.stringify(sessionSummary, null, 2)
    );
  }

  /**
   * Launch multiple sub-agents in parallel
   * @param {Array} tasks - Array of task configurations
   * @returns {Promise<Array>} Results from all sub-agents
   */
  async launchSubAgents(tasks) {
    if (tasks.length > this.maxConcurrent) {
      // Process in batches
      const results = [];
      for (let i = 0; i < tasks.length; i += this.maxConcurrent) {
        const batch = tasks.slice(i, i + this.maxConcurrent);
        const batchResults = await this._processBatch(batch);
        results.push(...batchResults);
      }
      return results;
    }
    
    return this._processBatch(tasks);
  }

  /**
   * Process a batch of sub-agent tasks
   * @private
   */
  async _processBatch(tasks) {
    const promises = tasks.map(task => this._executeSubAgent(task));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          taskId: tasks[index].id,
          status: 'success',
          data: result.value
        };
      } else {
        return {
          taskId: tasks[index].id,
          status: 'error',
          error: result.reason,
          fallback: tasks[index].fallback
        };
      }
    });
  }

  /**
   * Execute a single sub-agent task
   * @private
   */
  async _executeSubAgent(task) {
    const subAgentId = task.subAgentId || `sub-${uuidv4()}`;
    
    // Register sub-agent
    this.activeSubAgents.set(subAgentId, {
      task,
      startTime: Date.now(),
      status: 'running'
    });
    
    // Create sub-agent registry
    const registryPath = path.join(this.registryBasePath, this.sessionId, `${subAgentId}.json`);
    const registry = {
      subAgentId,
      taskDescription: task.description,
      startTime: new Date().toISOString(),
      documents: [],
      tokenUsage: 0,
      status: 'running'
    };
    
    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
    
    try {
      // Simulate sub-agent execution (will be replaced with actual Claude Code sub-agent call)
      const result = await this._simulateSubAgentExecution(task);
      
      // Update registry with results
      registry.status = 'completed';
      registry.endTime = new Date().toISOString();
      registry.documents = result.documents || [];
      registry.tokenUsage = result.tokenUsage || 0;
      
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
      
      // Update active sub-agents
      this.activeSubAgents.get(subAgentId).status = 'completed';
      
      return result;
    } catch (error) {
      // Update registry with error
      registry.status = 'error';
      registry.endTime = new Date().toISOString();
      registry.error = error.message;
      
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
      
      // Update active sub-agents
      this.activeSubAgents.get(subAgentId).status = 'error';
      
      throw error;
    }
  }

  /**
   * Simulate sub-agent execution (placeholder for actual implementation)
   * @private
   */
  async _simulateSubAgentExecution(task) {
    // This will be replaced with actual Claude Code sub-agent API calls
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          documents: task.documents || [],
          tokenUsage: Math.floor(Math.random() * task.tokenBudget),
          content: `Simulated result for ${task.description}`
        });
      }, Math.random() * 2000 + 1000);
    });
  }

  /**
   * Consolidate results from multiple sub-agents
   */
  async consolidateResults(results) {
    const consolidated = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      totalSubAgents: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      documents: [],
      totalTokenUsage: 0
    };
    
    // Aggregate documents and token usage
    for (const result of results) {
      if (result.status === 'success' && result.data) {
        consolidated.documents.push(...(result.data.documents || []));
        consolidated.totalTokenUsage += result.data.tokenUsage || 0;
      }
    }
    
    // Write consolidation summary
    const summaryPath = path.join(
      this.registryBasePath, 
      this.sessionId, 
      'consolidation-summary.json'
    );
    await fs.writeFile(summaryPath, JSON.stringify(consolidated, null, 2));
    
    return consolidated;
  }

  /**
   * Archive completed session
   */
  async archiveSession() {
    const archivePath = path.join(this.registryBasePath, '..', 'registry-archive', this.sessionId);
    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    
    // Move session directory to archive
    const sessionPath = path.join(this.registryBasePath, this.sessionId);
    await fs.rename(sessionPath, archivePath);
    
    // Remove active symlink
    const activePath = path.join(this.registryBasePath, '_active');
    try {
      await fs.unlink(activePath);
    } catch (e) {
      // Ignore if doesn't exist
    }
  }

  /**
   * Get current session status
   */
  async getSessionStatus() {
    const status = {
      sessionId: this.sessionId,
      activeSubAgents: Array.from(this.activeSubAgents.entries()).map(([id, info]) => ({
        id,
        task: info.task.description,
        status: info.status,
        duration: Date.now() - info.startTime
      }))
    };
    
    return status;
  }
}

module.exports = SubAgentOrchestrator;