#!/usr/bin/env node

/**
 * Project Document Registry Manager
 * Manages the centralized document registry for all project documents
 * Tracks both MD and JSON versions with token counts and summaries
 */

const fs = require('fs').promises;
const path = require('path');

class ProjectDocumentRegistryManager {
  constructor(projectRoot = path.join(__dirname, '..')) {
    this.projectRoot = projectRoot;
    this.registryPath = path.join(projectRoot, 'machine-data', 'project-document-registry.json');
    this.queueDir = path.join(projectRoot, 'machine-data', 'registry-queue');
    this.queueFile = path.join(this.queueDir, 'pending-updates.jsonl');
    this.lockFile = path.join(this.queueDir, '.lock');
    this.registry = null;
    this.lockTimeout = 5000; // 5 seconds
    this.maxSummaryWords = 25;
  }

  /**
   * Initialize the registry system
   */
  async initialize() {
    // Ensure queue directory exists
    await fs.mkdir(this.queueDir, { recursive: true });
    
    // Load or create registry
    await this.loadRegistry();
    
    // Initialize queue file if not exists
    try {
      await fs.access(this.queueFile);
    } catch {
      await fs.writeFile(this.queueFile, '');
    }
  }

  /**
   * Load the registry from disk or create new one
   */
  async loadRegistry() {
    try {
      const content = await fs.readFile(this.registryPath, 'utf8');
      this.registry = JSON.parse(content);
    } catch (error) {
      // Create new registry if doesn't exist
      this.registry = {
        version: 1,
        last_updated: new Date().toISOString(),
        document_count: 0,
        documents: {
          orchestration: {},
          'business-strategy': {},
          implementation: {},
          operations: {},
          'stakeholder-input': {},
          'analysis-reports': {},
          planning: {},
          research: {},
          technical: {}
        }
      };
      await this.saveRegistry();
    }
  }

  /**
   * Save the registry to disk
   */
  async saveRegistry() {
    const content = JSON.stringify(this.registry, null, 2);
    await fs.writeFile(this.registryPath, content, 'utf8');
  }

  /**
   * Acquire lock for registry updates
   */
  async acquireLock(retries = 10) {
    for (let i = 0; i < retries; i++) {
      try {
        // Try to create lock file (fails if exists)
        const lockData = {
          pid: process.pid,
          timestamp: Date.now(),
          expires: Date.now() + this.lockTimeout
        };
        await fs.writeFile(this.lockFile, JSON.stringify(lockData), { flag: 'wx' });
        return true;
      } catch (error) {
        // Lock exists, check if expired
        try {
          const lockContent = await fs.readFile(this.lockFile, 'utf8');
          const lockData = JSON.parse(lockContent);
          
          if (Date.now() > lockData.expires) {
            // Lock expired, remove and retry
            await fs.unlink(this.lockFile);
            continue;
          }
        } catch {
          // Error reading lock, remove and retry
          try {
            await fs.unlink(this.lockFile);
          } catch {}
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    throw new Error('Failed to acquire lock after ' + retries + ' attempts');
  }

  /**
   * Release the lock
   */
  async releaseLock() {
    try {
      await fs.unlink(this.lockFile);
    } catch {
      // Lock already released
    }
  }

  /**
   * Add an update to the queue
   */
  async queueUpdate(update) {
    const entry = JSON.stringify({
      ...update,
      timestamp: new Date().toISOString()
    }) + '\n';
    
    await fs.appendFile(this.queueFile, entry);
    
    // Process queue immediately
    await this.processQueue();
  }

  /**
   * Process all pending updates in the queue
   */
  async processQueue() {
    try {
      await this.acquireLock();
      
      // Reload registry to get latest version
      await this.loadRegistry();
      
      // Read queue file
      const content = await fs.readFile(this.queueFile, 'utf8');
      if (!content.trim()) {
        await this.releaseLock();
        return;
      }
      
      // Parse updates
      const updates = content
        .trim()
        .split('\n')
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            console.error('Invalid queue entry:', line);
            return null;
          }
        })
        .filter(Boolean);
      
      // Process each update
      for (const update of updates) {
        await this.applyUpdate(update);
      }
      
      // Increment version
      this.registry.version++;
      this.registry.last_updated = new Date().toISOString();
      
      // Update document count
      this.registry.document_count = this.countDocuments();
      
      // Save registry
      await this.saveRegistry();
      
      // Clear queue
      await fs.writeFile(this.queueFile, '');
      
      console.log(`📚 Registry updated to version ${this.registry.version} with ${updates.length} changes`);
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Apply a single update to the registry
   */
  async applyUpdate(update) {
    switch (update.action) {
      case 'create':
        await this.handleDocumentCreation(update);
        break;
      case 'convert':
        await this.handleJsonConversion(update);
        break;
      case 'delete':
        await this.handleDocumentDeletion(update);
        break;
      case 'update':
        await this.handleDocumentUpdate(update);
        break;
      case 'dependency':
        await this.handleDependencyUpdate(update);
        break;
      default:
        console.warn('Unknown update action:', update.action);
    }
  }

  /**
   * Handle document creation
   */
  async handleDocumentCreation(update) {
    const { path: docPath, agent, summary } = update;
    
    // Parse path to get category and document name
    const pathParts = docPath.replace('project-documents/', '').split('/');
    const category = this.normalizeCategory(pathParts[0]);
    const subPath = pathParts.slice(1).join('/');
    const docName = this.normalizeDocName(path.basename(docPath, '.md'));
    
    // Count tokens (rough estimate: 1 token ≈ 4 characters)
    let mdTokens = 0;
    try {
      const content = await fs.readFile(path.join(this.projectRoot, docPath), 'utf8');
      mdTokens = Math.ceil(content.length / 4);
    } catch {
      mdTokens = 0;
    }
    
    // Ensure category exists
    if (!this.registry.documents[category]) {
      this.registry.documents[category] = {};
    }
    
    // Create full document key including subpath if exists
    const docKey = subPath ? `${subPath.replace(/\//g, '-')}-${docName}` : docName;
    
    // Add or update document entry
    this.registry.documents[category][docKey] = {
      md: docPath,
      json: null,
      tokens: { md: mdTokens, json: 0 },
      summary: summary || this.generateSummary(docName),
      deps: [],
      agent: agent ? agent.replace(' Agent', '') : 'Unknown',
      created: update.timestamp,
      modified: update.timestamp
    };
  }

  /**
   * Handle JSON conversion
   */
  async handleJsonConversion(update) {
    const { md_path, json_path } = update;
    
    // Find the document in registry
    const docEntry = this.findDocumentByPath(md_path);
    if (!docEntry) {
      // Document not in registry yet, create entry first
      await this.handleDocumentCreation({
        action: 'create',
        path: md_path,
        agent: 'Document Manager',
        timestamp: update.timestamp
      });
      // Find again
      const newEntry = this.findDocumentByPath(md_path);
      if (newEntry) {
        newEntry.doc = docEntry;
      }
    }
    
    if (docEntry) {
      // Count JSON tokens
      let jsonTokens = 0;
      try {
        const content = await fs.readFile(path.join(this.projectRoot, json_path), 'utf8');
        jsonTokens = Math.ceil(content.length / 4);
      } catch {
        jsonTokens = 0;
      }
      
      // Update entry
      docEntry.doc.json = json_path;
      docEntry.doc.tokens.json = jsonTokens;
      docEntry.doc.modified = update.timestamp;
      
      // Calculate token reduction
      if (docEntry.doc.tokens.md > 0 && jsonTokens > 0) {
        const reduction = Math.round((1 - jsonTokens / docEntry.doc.tokens.md) * 100);
        console.log(`  📉 Token reduction: ${reduction}% (${docEntry.doc.tokens.md} → ${jsonTokens})`);
      }
    }
  }

  /**
   * Handle document deletion
   */
  async handleDocumentDeletion(update) {
    const { path: docPath } = update;
    
    // Find and remove document
    for (const category of Object.keys(this.registry.documents)) {
      for (const docName of Object.keys(this.registry.documents[category])) {
        const doc = this.registry.documents[category][docName];
        if (doc.md === docPath || doc.json === docPath) {
          delete this.registry.documents[category][docName];
          console.log(`  🗑️  Removed ${docName} from registry`);
          return;
        }
      }
    }
  }

  /**
   * Handle document update
   */
  async handleDocumentUpdate(update) {
    const result = this.findDocumentByPath(update.path);
    if (result && result.doc) {
      // Re-count tokens
      try {
        const content = await fs.readFile(path.join(this.projectRoot, update.path), 'utf8');
        const tokens = Math.ceil(content.length / 4);
        
        if (update.path.endsWith('.md')) {
          result.doc.tokens.md = tokens;
        } else if (update.path.endsWith('.json')) {
          result.doc.tokens.json = tokens;
        }
        
        result.doc.modified = update.timestamp;
        
        // Update summary if provided
        if (update.summary) {
          result.doc.summary = update.summary;
        }
      } catch (error) {
        console.error('Error updating document tokens:', error);
      }
    }
  }

  /**
   * Handle dependency update
   */
  async handleDependencyUpdate(update) {
    const { path: docPath, dependencies } = update;
    const result = this.findDocumentByPath(docPath);
    
    if (result && result.doc) {
      result.doc.deps = dependencies || [];
      result.doc.modified = update.timestamp;
    }
  }

  /**
   * Find document entry by path
   */
  findDocumentByPath(docPath) {
    for (const category of Object.keys(this.registry.documents)) {
      for (const docName of Object.keys(this.registry.documents[category])) {
        const doc = this.registry.documents[category][docName];
        if (doc.md === docPath || doc.json === docPath) {
          return { category, name: docName, doc };
        }
      }
    }
    return null;
  }

  /**
   * Normalize category name
   */
  normalizeCategory(category) {
    // Map common variations to standard categories
    const categoryMap = {
      'orchestration': 'orchestration',
      'business-strategy': 'business-strategy',
      'implementation': 'implementation',
      'operations': 'operations',
      'stakeholder-input': 'stakeholder-input',
      'analysis-reports': 'analysis-reports',
      'planning': 'planning',
      'research': 'research',
      'technical': 'technical'
    };
    
    return categoryMap[category] || category;
  }

  /**
   * Normalize document name
   */
  normalizeDocName(name) {
    return name.replace(/-/g, '_').toLowerCase();
  }

  /**
   * Count total documents in registry
   */
  countDocuments() {
    let count = 0;
    for (const category of Object.keys(this.registry.documents)) {
      count += Object.keys(this.registry.documents[category]).length;
    }
    return count;
  }

  /**
   * Generate a summary from document name
   */
  generateSummary(docName) {
    // Convert underscore/hyphen separated name to readable summary
    const words = docName.replace(/_/g, ' ').replace(/-/g, ' ').split(' ');
    const summary = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Limit to max words
    const summaryWords = summary.split(' ').slice(0, this.maxSummaryWords).join(' ');
    return summaryWords;
  }

  /**
   * Search for documents by name or content
   */
  async findDocument(searchTerm) {
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    for (const category of Object.keys(this.registry.documents)) {
      for (const docName of Object.keys(this.registry.documents[category])) {
        const doc = this.registry.documents[category][docName];
        
        // Search in name and summary
        if (docName.toLowerCase().includes(searchLower) ||
            doc.summary.toLowerCase().includes(searchLower)) {
          results.push({
            category,
            name: docName,
            ...doc
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const stats = {
      version: this.registry.version,
      last_updated: this.registry.last_updated,
      total_documents: this.registry.document_count,
      categories: {},
      total_tokens: { md: 0, json: 0 },
      json_coverage: 0,
      token_savings: 0
    };
    
    let docsWithJson = 0;
    
    for (const category of Object.keys(this.registry.documents)) {
      const docs = this.registry.documents[category];
      const docCount = Object.keys(docs).length;
      
      stats.categories[category] = {
        count: docCount,
        tokens: { md: 0, json: 0 }
      };
      
      for (const doc of Object.values(docs)) {
        stats.categories[category].tokens.md += doc.tokens.md || 0;
        stats.categories[category].tokens.json += doc.tokens.json || 0;
        stats.total_tokens.md += doc.tokens.md || 0;
        stats.total_tokens.json += doc.tokens.json || 0;
        
        if (doc.json) {
          docsWithJson++;
        }
      }
    }
    
    // Calculate coverage and savings
    if (this.registry.document_count > 0) {
      stats.json_coverage = Math.round((docsWithJson / this.registry.document_count) * 100);
    }
    
    if (stats.total_tokens.md > 0 && stats.total_tokens.json > 0) {
      stats.token_savings = Math.round((1 - stats.total_tokens.json / stats.total_tokens.md) * 100);
    }
    
    return stats;
  }

  /**
   * Display registry in readable format
   */
  async displayRegistry() {
    const stats = this.getStats();
    
    console.log('\n📚 Document Registry v' + this.registry.version);
    console.log('=' .repeat(60));
    console.log(`Last Updated: ${this.registry.last_updated}`);
    console.log(`Total Documents: ${this.registry.document_count}`);
    console.log(`JSON Coverage: ${stats.json_coverage}%`);
    console.log(`Token Savings: ${stats.token_savings}%`);
    console.log('');
    
    for (const [category, docs] of Object.entries(this.registry.documents)) {
      const docCount = Object.keys(docs).length;
      if (docCount === 0) continue;
      
      console.log(`\n📁 ${category} (${docCount} documents)`);
      console.log('-'.repeat(50));
      
      for (const [name, doc] of Object.entries(docs)) {
        const jsonIndicator = doc.json ? '✅' : '⏳';
        const tokenInfo = doc.json 
          ? `MD: ${doc.tokens.md}, JSON: ${doc.tokens.json}`
          : `MD: ${doc.tokens.md}`;
        
        console.log(`  ${jsonIndicator} ${name}`);
        console.log(`     Summary: ${doc.summary}`);
        console.log(`     Tokens: ${tokenInfo}`);
        console.log(`     Agent: ${doc.agent}`);
        
        if (doc.deps && doc.deps.length > 0) {
          console.log(`     Dependencies: ${doc.deps.join(', ')}`);
        }
      }
    }
  }
}

// Export for use in other modules
module.exports = ProjectDocumentRegistryManager;

// CLI interface
if (require.main === module) {
  const manager = new ProjectDocumentRegistryManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  (async () => {
    await manager.initialize();
    
    switch (command) {
      case 'init':
        console.log('✅ Registry initialized');
        break;
        
      case 'stats':
        const stats = manager.getStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
        
      case 'display':
        await manager.displayRegistry();
        break;
        
      case 'find':
        if (!args[0]) {
          console.error('Usage: project-document-registry-manager.js find <search-term>');
          process.exit(1);
        }
        const results = await manager.findDocument(args[0]);
        console.log(JSON.stringify(results, null, 2));
        break;
        
      case 'queue':
        // Add an update to queue (for testing)
        const update = JSON.parse(args[0]);
        await manager.queueUpdate(update);
        break;
        
      case 'process':
        // Process the queue manually
        await manager.processQueue();
        break;
        
      default:
        console.log('📚 Project Document Registry Manager');
        console.log('Commands:');
        console.log('  init     - Initialize the registry');
        console.log('  stats    - Show registry statistics');
        console.log('  display  - Display full registry');
        console.log('  find     - Find documents by name or summary');
        console.log('  queue    - Add update to queue (JSON string)');
        console.log('  process  - Process pending queue');
    }
  })().catch(console.error);
}