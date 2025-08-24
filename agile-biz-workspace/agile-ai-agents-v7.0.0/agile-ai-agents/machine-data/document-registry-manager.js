/**
 * Document Registry Manager for Sub-Agent System
 * Manages hybrid document registry with session-based sub-registries
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentRegistryManager {
  constructor() {
    this.consolidationInterval = 300000; // 5 minutes
    this.archiveAfterHours = 24;
    this.basePath = path.join(__dirname, '..', 'project-documents', 'orchestration');
    this.masterRegistry = path.join(this.basePath, 'master-document-registry.md');
    this.consolidationTimer = null;
    this.pendingUpdates = [];
  }

  /**
   * Initialize the registry system
   */
  async initialize() {
    // Ensure directories exist
    const registriesPath = path.join(this.basePath, 'sub-agent-registries');
    const archivePath = path.join(this.basePath, 'registry-archive');
    
    await fs.mkdir(registriesPath, { recursive: true });
    await fs.mkdir(archivePath, { recursive: true });
    
    // Initialize master registry if it doesn't exist
    try {
      await fs.access(this.masterRegistry);
    } catch (error) {
      await this.initializeMasterRegistry();
    }
    
    // Start periodic consolidation
    this.startPeriodicConsolidation();
  }

  /**
   * Initialize master registry document
   */
  async initializeMasterRegistry() {
    const initialContent = `# Master Document Registry

## Overview
This is the consolidated view of all documents created by AgileAiAgents, including those created by sub-agents.

**Last Updated**: ${new Date().toISOString()}
**Total Documents**: 0

## Document Index

### By Category

#### Orchestration
*No documents yet*

#### Business Strategy
*No documents yet*

#### Implementation
*No documents yet*

#### Operations
*No documents yet*

## Sub-Agent Activity Log

### Recent Sessions
*No sessions yet*

---
*This registry is automatically updated every 5 minutes and when sessions complete.*
`;
    
    await fs.writeFile(this.masterRegistry, initialContent);
  }

  /**
   * Register a document creation by a sub-agent
   */
  async registerDocument(subAgentId, document) {
    const registryEntry = {
      timestamp: new Date().toISOString(),
      subAgentId,
      document: {
        path: document.path,
        title: document.title,
        category: this.categorizeDocument(document.path),
        size: document.size || 0,
        type: document.type || 'markdown'
      }
    };
    
    // Add to pending updates
    this.pendingUpdates.push(registryEntry);
    
    // Write to sub-agent registry immediately
    await this.updateSubAgentRegistry(subAgentId, registryEntry);
    
    // Schedule consolidation if not already scheduled
    this.scheduleConsolidation();
    
    return registryEntry;
  }

  /**
   * Update sub-agent specific registry
   */
  async updateSubAgentRegistry(subAgentId, entry) {
    const sessionPath = await this.getActiveSessionPath();
    const registryPath = path.join(sessionPath, `${subAgentId}.json`);
    
    let registry;
    try {
      const content = await fs.readFile(registryPath, 'utf-8');
      registry = JSON.parse(content);
    } catch (error) {
      // Create new registry
      registry = {
        subAgentId,
        startTime: new Date().toISOString(),
        documents: []
      };
    }
    
    // Add document entry
    registry.documents.push(entry.document);
    registry.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
  }

  /**
   * Get active session path
   */
  async getActiveSessionPath() {
    const registriesPath = path.join(this.basePath, 'sub-agent-registries');
    const activePath = path.join(registriesPath, '_active');
    
    try {
      // Follow symlink to actual session directory
      const sessionName = await fs.readlink(activePath);
      return path.join(registriesPath, sessionName);
    } catch (error) {
      // No active session, return registries path
      return registriesPath;
    }
  }

  /**
   * Categorize document based on path
   */
  categorizeDocument(documentPath) {
    const categories = {
      'orchestration': ['orchestration', 'sprints', 'project-log', 'agent-coordination'],
      'business-strategy': ['research', 'marketing', 'finance', 'analysis', 'investment'],
      'implementation': ['requirements', 'security', 'design', 'testing', 'documentation'],
      'operations': ['deployment', 'monitoring', 'analytics', 'optimization', 'seo']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => documentPath.includes(keyword))) {
        return category;
      }
    }
    
    return 'uncategorized';
  }

  /**
   * Schedule consolidation
   */
  scheduleConsolidation() {
    if (this.consolidationTimer) {
      return; // Already scheduled
    }
    
    this.consolidationTimer = setTimeout(() => {
      this.consolidateRegistries();
      this.consolidationTimer = null;
    }, 5000); // Debounce for 5 seconds
  }

  /**
   * Start periodic consolidation
   */
  startPeriodicConsolidation() {
    setInterval(() => {
      this.consolidateRegistries();
    }, this.consolidationInterval);
  }

  /**
   * Consolidate sub-agent registries into master
   */
  async consolidateRegistries() {
    try {
      const sessionPath = await this.getActiveSessionPath();
      const registryFiles = await fs.readdir(sessionPath);
      
      const allDocuments = {
        orchestration: [],
        'business-strategy': [],
        implementation: [],
        operations: [],
        uncategorized: []
      };
      
      let totalDocuments = 0;
      const sessionSummaries = [];
      
      // Read all sub-agent registries
      for (const file of registryFiles) {
        if (file.endsWith('.json') && !file.includes('session-summary')) {
          const registryPath = path.join(sessionPath, file);
          const content = await fs.readFile(registryPath, 'utf-8');
          const registry = JSON.parse(content);
          
          if (registry.documents) {
            for (const doc of registry.documents) {
              const category = doc.category || 'uncategorized';
              allDocuments[category].push({
                ...doc,
                subAgent: registry.subAgentId,
                created: doc.timestamp || registry.startTime
              });
              totalDocuments++;
            }
            
            sessionSummaries.push({
              subAgent: registry.subAgentId,
              documentCount: registry.documents.length,
              lastUpdated: registry.lastUpdated
            });
          }
        }
      }
      
      // Update master registry
      await this.updateMasterRegistry(allDocuments, totalDocuments, sessionSummaries);
      
      // Clear pending updates
      this.pendingUpdates = [];
      
      // Log consolidation
      await this.logConsolidation(totalDocuments, sessionSummaries.length);
      
    } catch (error) {
      console.error('Error consolidating registries:', error);
    }
  }

  /**
   * Update master registry document
   */
  async updateMasterRegistry(documents, totalCount, sessionSummaries) {
    let content = `# Master Document Registry

## Overview
This is the consolidated view of all documents created by AgileAiAgents, including those created by sub-agents.

**Last Updated**: ${new Date().toISOString()}
**Total Documents**: ${totalCount}
**Active Sub-Agents**: ${sessionSummaries.length}

## Document Index

### By Category
`;
    
    // Add documents by category
    for (const [category, docs] of Object.entries(documents)) {
      if (docs.length > 0) {
        content += `\n#### ${category.charAt(0).toUpperCase() + category.slice(1)} (${docs.length} documents)\n`;
        
        // Sort by creation time
        docs.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        // List documents
        for (const doc of docs.slice(0, 50)) { // Show latest 50 per category
          content += `- \`${doc.path}\` - ${doc.title || 'Untitled'} *(${doc.subAgent})*\n`;
        }
        
        if (docs.length > 50) {
          content += `- *... and ${docs.length - 50} more documents*\n`;
        }
      } else {
        content += `\n#### ${category.charAt(0).toUpperCase() + category.slice(1)}\n*No documents yet*\n`;
      }
    }
    
    // Add sub-agent activity
    content += `\n## Sub-Agent Activity Log

### Current Session
| Sub-Agent | Documents | Last Updated |
|-----------|-----------|--------------|
`;
    
    for (const summary of sessionSummaries) {
      content += `| ${summary.subAgent} | ${summary.documentCount} | ${summary.lastUpdated} |\n`;
    }
    
    content += `
---
*This registry is automatically updated every 5 minutes and when sessions complete.*
`;
    
    await fs.writeFile(this.masterRegistry, content);
  }

  /**
   * Log consolidation event
   */
  async logConsolidation(documentCount, subAgentCount) {
    const logPath = path.join(this.basePath, 'registry-consolidation-log.md');
    
    let logContent;
    try {
      logContent = await fs.readFile(logPath, 'utf-8');
    } catch (error) {
      logContent = `# Registry Consolidation Log

## Overview
This log tracks all consolidation events for the document registry system.

## Consolidation Events
`;
    }
    
    // Add new log entry
    const logEntry = `
### ${new Date().toISOString()}
- **Documents Consolidated**: ${documentCount}
- **Sub-Agents Active**: ${subAgentCount}
- **Pending Updates Processed**: ${this.pendingUpdates.length}
`;
    
    logContent += logEntry;
    
    await fs.writeFile(logPath, logContent);
  }

  /**
   * Archive old sessions
   */
  async archiveOldSessions() {
    const registriesPath = path.join(this.basePath, 'sub-agent-registries');
    const archivePath = path.join(this.basePath, 'registry-archive');
    
    const sessions = await fs.readdir(registriesPath);
    const now = Date.now();
    const archiveThreshold = this.archiveAfterHours * 60 * 60 * 1000;
    
    for (const session of sessions) {
      if (session.startsWith('session-') && !session.startsWith('_')) {
        const sessionPath = path.join(registriesPath, session);
        const stats = await fs.stat(sessionPath);
        
        if (now - stats.mtime.getTime() > archiveThreshold) {
          // Move to archive
          const archiveSessionPath = path.join(archivePath, session);
          await fs.rename(sessionPath, archiveSessionPath);
          
          console.log(`Archived session: ${session}`);
        }
      }
    }
  }

  /**
   * Get registry statistics
   */
  async getStatistics() {
    const stats = {
      totalDocuments: 0,
      documentsByCategory: {},
      activeSessions: 0,
      archivedSessions: 0,
      lastConsolidation: null
    };
    
    // Read master registry to get totals
    try {
      const content = await fs.readFile(this.masterRegistry, 'utf-8');
      const totalMatch = content.match(/\*\*Total Documents\*\*: (\d+)/);
      if (totalMatch) {
        stats.totalDocuments = parseInt(totalMatch[1]);
      }
    } catch (error) {
      // Master registry not yet created
    }
    
    // Count active and archived sessions
    const registriesPath = path.join(this.basePath, 'sub-agent-registries');
    const archivePath = path.join(this.basePath, 'registry-archive');
    
    try {
      const activeSessions = await fs.readdir(registriesPath);
      stats.activeSessions = activeSessions.filter(s => s.startsWith('session-')).length;
    } catch (error) {
      // Directory doesn't exist yet
    }
    
    try {
      const archivedSessions = await fs.readdir(archivePath);
      stats.archivedSessions = archivedSessions.filter(s => s.startsWith('session-')).length;
    } catch (error) {
      // Directory doesn't exist yet
    }
    
    return stats;
  }
}

module.exports = DocumentRegistryManager;