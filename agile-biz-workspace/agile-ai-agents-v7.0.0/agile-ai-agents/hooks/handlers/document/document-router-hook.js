#!/usr/bin/env node

/**
 * Document Router Hook
 * 
 * Intercepts all document creation operations and routes them through
 * the Document Router system to ensure proper placement
 */

const path = require('path');
const fs = require('fs').promises;

// Load Document Router
const DocumentRouter = require('../../machine-data/document-router');
const DocumentLifecycleManager = require('../../machine-data/document-lifecycle-manager');

class DocumentRouterHook {
  constructor() {
    this.projectRoot = path.join(__dirname, '../../..');
    this.router = new DocumentRouter(this.projectRoot);
    this.lifecycleManager = new DocumentLifecycleManager(this.projectRoot);
    this.enabled = true;
    this.logPath = path.join(__dirname, '../../machine-data/document-router-hook.log');
  }

  /**
   * Main hook handler - intercepts document creation
   */
  async handleDocumentCreation(context) {
    const startTime = Date.now();
    const result = {
      success: false,
      originalPath: context.path,
      routedPath: null,
      tier: null,
      duration_ms: 0,
      message: ''
    };

    try {
      // Check if routing is enabled
      if (!this.enabled) {
        result.message = 'Document routing disabled';
        return result;
      }

      // Extract document information from context
      const document = {
        fileName: path.basename(context.path),
        agent: context.agent || this.detectAgent(context),
        category: context.category,
        content: context.content || '',
        sprint: context.sprint || this.getCurrentSprint(),
        metadata: context.metadata || {}
      };

      // Check if document already exists
      const existing = await this.lifecycleManager.checkExisting(document);
      if (existing.exists && !existing.needsUpdate) {
        result.success = true;
        result.routedPath = existing.path;
        result.message = `Document already exists at: ${existing.path}`;
        result.tier = 'existing';
        result.duration_ms = Date.now() - startTime;
        
        await this.logRouting(result);
        return result;
      }

      // Route the document
      const routedPath = await this.router.route(document);
      
      // Ensure directory exists
      const directory = path.dirname(path.join(this.projectRoot, routedPath));
      await fs.mkdir(directory, { recursive: true });
      
      result.success = true;
      result.routedPath = routedPath;
      result.tier = this.router.routingHistory.slice(-1)[0]?.result || 'unknown';
      result.duration_ms = Date.now() - startTime;
      result.message = `Document routed successfully to: ${routedPath}`;
      
      // Log the routing decision
      await this.logRouting(result);
      
      // Update registry if needed
      if (context.updateRegistry !== false) {
        await this.updateRegistry(document, routedPath);
      }
      
      return result;
      
    } catch (error) {
      result.message = `Routing error: ${error.message}`;
      result.duration_ms = Date.now() - startTime;
      
      await this.logRouting(result);
      
      // Fallback to original path on error
      result.routedPath = context.path;
      return result;
    }
  }

  /**
   * Handle document update operations
   */
  async handleDocumentUpdate(context) {
    try {
      // Check if document needs re-routing
      const document = {
        fileName: path.basename(context.path),
        content: context.content || ''
      };
      
      const currentPath = context.path;
      const suggestedPath = await this.router.route(document);
      
      if (currentPath !== suggestedPath) {
        console.log(`⚠️  Document may be in wrong location:`);
        console.log(`   Current: ${currentPath}`);
        console.log(`   Suggested: ${suggestedPath}`);
        
        // Log suggestion but don't move automatically
        await this.logRouting({
          type: 'location_suggestion',
          currentPath: currentPath,
          suggestedPath: suggestedPath,
          timestamp: new Date().toISOString()
        });
      }
      
      // Update freshness tracking
      await this.lifecycleManager.checkExisting(document);
      
    } catch (error) {
      console.error('Error in document update handler:', error);
    }
  }

  /**
   * Handle document deletion
   */
  async handleDocumentDeletion(context) {
    try {
      // Remove from lifecycle tracking
      const fileName = path.basename(context.path);
      
      // Update lifecycle state
      if (this.lifecycleManager.lifecycleState.documents[fileName]) {
        delete this.lifecycleManager.lifecycleState.documents[fileName];
        await this.lifecycleManager.saveLifecycleState();
      }
      
      await this.logRouting({
        type: 'document_deleted',
        path: context.path,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in document deletion handler:', error);
    }
  }

  /**
   * Detect agent from context
   */
  detectAgent(context) {
    // Try to detect from file path
    if (context.path) {
      const pathLower = context.path.toLowerCase();
      
      if (pathLower.includes('research')) return 'research_agent';
      if (pathLower.includes('marketing')) return 'marketing_agent';
      if (pathLower.includes('finance')) return 'finance_agent';
      if (pathLower.includes('security')) return 'security_agent';
      if (pathLower.includes('test')) return 'testing_agent';
      if (pathLower.includes('deploy')) return 'devops_agent';
      if (pathLower.includes('sprint')) return 'scrum_master_agent';
    }
    
    // Try to detect from environment
    if (process.env.ACTIVE_AGENT) {
      return process.env.ACTIVE_AGENT;
    }
    
    return 'unknown';
  }

  /**
   * Get current sprint
   */
  getCurrentSprint() {
    try {
      const workflowStatePath = path.join(this.projectRoot, 'agile-ai-agents/project-state/workflow-state.json');
      if (require('fs').existsSync(workflowStatePath)) {
        const workflowState = JSON.parse(require('fs').readFileSync(workflowStatePath, 'utf8'));
        if (workflowState.current_sprint) {
          return workflowState.current_sprint;
        }
      }
    } catch (error) {
      // Silent fail
    }
    return 'sprint-001';
  }

  /**
   * Update document registry
   */
  async updateRegistry(document, routedPath) {
    try {
      const registryPath = path.join(__dirname, '../../machine-data/project-document-registry.json');
      
      let registry = {};
      if (require('fs').existsSync(registryPath)) {
        const content = await fs.readFile(registryPath, 'utf8');
        registry = JSON.parse(content);
      }
      
      registry[document.fileName] = {
        path: routedPath,
        agent: document.agent,
        category: document.category,
        created: new Date().toISOString(),
        sprint: document.sprint
      };
      
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
      
    } catch (error) {
      console.error('Error updating registry:', error);
    }
  }

  /**
   * Log routing decision
   */
  async logRouting(result) {
    try {
      const logEntry = {
        ...result,
        timestamp: new Date().toISOString()
      };
      
      // Append to log file
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.logPath, logLine);
      
    } catch (error) {
      console.error('Error logging routing:', error);
    }
  }

  /**
   * Enable/disable routing
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`Document routing ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get routing statistics
   */
  async getStatistics() {
    return this.router.getStatistics();
  }
}

// Export hook instance
const hook = new DocumentRouterHook();

// Handle different hook events
module.exports = {
  /**
   * Before document creation
   */
  beforeCreate: async (context) => {
    return await hook.handleDocumentCreation(context);
  },
  
  /**
   * After document update
   */
  afterUpdate: async (context) => {
    return await hook.handleDocumentUpdate(context);
  },
  
  /**
   * Before document deletion
   */
  beforeDelete: async (context) => {
    return await hook.handleDocumentDeletion(context);
  },
  
  /**
   * Get hook instance for testing
   */
  getHook: () => hook
};

// CLI interface for testing
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  (async () => {
    try {
      switch (command) {
        case 'test':
          // Test routing
          const context = {
            path: 'project-documents/market-analysis.md',
            agent: 'research_agent',
            content: 'Market analysis content...'
          };
          
          const result = await hook.handleDocumentCreation(context);
          console.log('Routing result:', JSON.stringify(result, null, 2));
          break;
          
        case 'stats':
          const stats = await hook.getStatistics();
          console.log('Routing statistics:', JSON.stringify(stats, null, 2));
          break;
          
        case 'enable':
          hook.setEnabled(true);
          break;
          
        case 'disable':
          hook.setEnabled(false);
          break;
          
        default:
          console.log('Usage: node document-router-hook.js <command>');
          console.log('Commands:');
          console.log('  test     - Test document routing');
          console.log('  stats    - Show routing statistics');
          console.log('  enable   - Enable document routing');
          console.log('  disable  - Disable document routing');
          break;
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}