#!/usr/bin/env node

/**
 * Document Registry Tracker Hook Handler
 * Tracks all document creation, conversion, updates, and deletions
 * Maintains the project-document-registry.json for efficient agent access
 */

const fs = require('fs').promises;
const path = require('path');
const ProjectDocumentRegistryManager = require('../../../machine-data/project-document-registry-manager');

class DocumentRegistryTracker {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.manager = new ProjectDocumentRegistryManager(this.projectRoot);
  }

  parseContext() {
    return {
      event: process.env.HOOK_EVENT || 'file_change',
      filePath: process.env.FILE_PATH || process.argv[2],
      agent: process.env.ACTIVE_AGENT || process.env.CLAUDE_AGENT || 'Unknown',
      timestamp: new Date().toISOString(),
      oldPath: process.env.OLD_PATH, // For renames
      action: process.env.FILE_ACTION || 'create' // create, update, delete, convert
    };
  }

  async execute() {
    try {
      const { event, filePath, agent, action } = this.context;
      
      // Skip if not a project document
      if (!this.isProjectDocument(filePath)) {
        return { 
          status: 'skipped', 
          reason: 'Not a project document',
          path: filePath 
        };
      }

      // Initialize manager if needed
      await this.manager.initialize();

      // Determine action and process
      let result;
      switch (action) {
        case 'create':
          result = await this.handleCreate();
          break;
        case 'update':
          result = await this.handleUpdate();
          break;
        case 'delete':
          result = await this.handleDelete();
          break;
        case 'convert':
          result = await this.handleConvert();
          break;
        case 'rename':
          result = await this.handleRename();
          break;
        default:
          // Try to infer action from context
          result = await this.inferAndHandle();
      }

      return {
        status: 'success',
        action,
        filePath,
        agent,
        result
      };

    } catch (error) {
      console.error('Document registry tracking failed:', error);
      return {
        status: 'error',
        error: error.message,
        filePath: this.context.filePath
      };
    }
  }

  isProjectDocument(filePath) {
    if (!filePath) return false;
    
    // Check if it's in project-documents folder
    const isInProjectDocs = filePath.includes('project-documents/');
    
    // Check if it's a supported file type
    const isSupportedType = filePath.endsWith('.md') || filePath.endsWith('.json');
    
    // Exclude certain files
    const excludePatterns = [
      /node_modules/,
      /\.git/,
      /machine-data/,
      /templates/,
      /registry-queue/,
      /project-document-registry\.json$/  // Don't track the registry itself
    ];
    
    const isExcluded = excludePatterns.some(pattern => pattern.test(filePath));
    
    return isInProjectDocs && isSupportedType && !isExcluded;
  }

  async handleCreate() {
    const { filePath, agent } = this.context;
    
    // Try to extract summary from document
    const summary = await this.extractSummary(filePath);
    
    // Queue the update
    await this.manager.queueUpdate({
      action: 'create',
      path: this.getRelativePath(filePath),
      agent: agent,
      summary: summary
    });
    
    return { created: true, summary };
  }

  async handleUpdate() {
    const { filePath, agent } = this.context;
    
    // Try to extract updated summary
    const summary = await this.extractSummary(filePath);
    
    // Queue the update
    await this.manager.queueUpdate({
      action: 'update',
      path: this.getRelativePath(filePath),
      agent: agent,
      summary: summary
    });
    
    return { updated: true, summary };
  }

  async handleDelete() {
    const { filePath } = this.context;
    
    // Queue the deletion
    await this.manager.queueUpdate({
      action: 'delete',
      path: this.getRelativePath(filePath)
    });
    
    return { deleted: true };
  }

  async handleConvert() {
    const { filePath } = this.context;
    
    // Determine if this is MD -> JSON conversion
    let mdPath, jsonPath;
    
    if (filePath.endsWith('.json')) {
      // JSON was created, find corresponding MD
      mdPath = filePath.replace('.json', '.md');
      jsonPath = filePath;
    } else if (filePath.endsWith('.md')) {
      // MD exists, check if JSON was created
      jsonPath = filePath.replace('.md', '.json');
      mdPath = filePath;
      
      // Check if JSON actually exists
      try {
        await fs.access(path.join(this.projectRoot, jsonPath));
      } catch {
        // JSON doesn't exist yet, skip
        return { status: 'skipped', reason: 'JSON not yet created' };
      }
    }
    
    // Queue the conversion update
    await this.manager.queueUpdate({
      action: 'convert',
      md_path: this.getRelativePath(mdPath),
      json_path: this.getRelativePath(jsonPath)
    });
    
    return { converted: true, md: mdPath, json: jsonPath };
  }

  async handleRename() {
    const { filePath, oldPath } = this.context;
    
    if (!oldPath) {
      return { status: 'skipped', reason: 'No old path provided' };
    }
    
    // Delete old entry
    await this.manager.queueUpdate({
      action: 'delete',
      path: this.getRelativePath(oldPath)
    });
    
    // Create new entry
    const summary = await this.extractSummary(filePath);
    await this.manager.queueUpdate({
      action: 'create',
      path: this.getRelativePath(filePath),
      agent: this.context.agent,
      summary: summary
    });
    
    return { renamed: true, from: oldPath, to: filePath };
  }

  async inferAndHandle() {
    const { filePath } = this.context;
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      // Check if file exists
      await fs.access(fullPath);
      
      // File exists, check if it's already in registry
      const registry = await this.loadRegistry();
      const isInRegistry = this.findInRegistry(registry, filePath);
      
      if (isInRegistry) {
        // File exists and is in registry = update
        return await this.handleUpdate();
      } else {
        // File exists but not in registry = create
        return await this.handleCreate();
      }
    } catch {
      // File doesn't exist = delete
      return await this.handleDelete();
    }
  }

  async extractSummary(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      
      if (filePath.endsWith('.md')) {
        // Extract from markdown
        return this.extractMarkdownSummary(content);
      } else if (filePath.endsWith('.json')) {
        // Extract from JSON
        return this.extractJsonSummary(content);
      }
    } catch (error) {
      console.error(`Failed to extract summary from ${filePath}:`, error.message);
    }
    
    // Fallback to filename-based summary
    return this.generateSummaryFromPath(filePath);
  }

  extractMarkdownSummary(content) {
    // Try to extract from various common patterns
    const patterns = [
      /^#\s+(.+)$/m,                    // First H1 heading
      /^##\s+Overview\s*\n+(.+)$/m,     // Overview section
      /^##\s+Summary\s*\n+(.+)$/m,      // Summary section
      /^\*\*Purpose\*\*:\s*(.+)$/m,     // Purpose line
      /^This document\s+(.+)$/m,        // "This document..." pattern
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        // Clean and truncate to 25 words
        const summary = match[1]
          .replace(/[#*_\[\]]/g, '')
          .trim()
          .split(/\s+/)
          .slice(0, 25)
          .join(' ');
        
        if (summary.length > 10) {
          return summary;
        }
      }
    }
    
    // Fallback to first non-empty line
    const lines = content.split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/[#*_\[\]]/g, '').trim();
      if (cleaned.length > 10) {
        return cleaned.split(/\s+/).slice(0, 25).join(' ');
      }
    }
    
    return null;
  }

  extractJsonSummary(content) {
    try {
      const data = JSON.parse(content);
      
      // Look for common summary fields
      const summaryFields = [
        'summary', 'description', 'purpose', 'overview',
        'title', 'name', 'objective', 'goal'
      ];
      
      for (const field of summaryFields) {
        if (data[field] && typeof data[field] === 'string') {
          return data[field].split(/\s+/).slice(0, 25).join(' ');
        }
      }
      
      // Check metadata
      if (data.metadata) {
        for (const field of summaryFields) {
          if (data.metadata[field] && typeof data.metadata[field] === 'string') {
            return data.metadata[field].split(/\s+/).slice(0, 25).join(' ');
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse JSON for summary:', error.message);
    }
    
    return null;
  }

  generateSummaryFromPath(filePath) {
    const filename = path.basename(filePath, path.extname(filePath));
    const parts = filePath.split('/');
    
    // Get category from path
    const categoryIndex = parts.findIndex(p => p === 'project-documents');
    const category = categoryIndex >= 0 && parts[categoryIndex + 1] 
      ? parts[categoryIndex + 1] 
      : 'document';
    
    // Convert filename to readable format
    const readableName = filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return `${readableName} for ${category}`;
  }

  getRelativePath(filePath) {
    if (filePath.startsWith('project-documents/')) {
      return filePath;
    }
    
    // Try to extract relative path from absolute path
    const projectDocsIndex = filePath.indexOf('project-documents/');
    if (projectDocsIndex >= 0) {
      return filePath.substring(projectDocsIndex);
    }
    
    // Fallback
    return filePath;
  }

  async loadRegistry() {
    const registryPath = path.join(
      this.projectRoot, 
      'machine-data', 
      'project-document-registry.json'
    );
    
    try {
      const content = await fs.readFile(registryPath, 'utf8');
      return JSON.parse(content);
    } catch {
      return { documents: {} };
    }
  }

  findInRegistry(registry, filePath) {
    const relativePath = this.getRelativePath(filePath);
    
    for (const category of Object.values(registry.documents || {})) {
      for (const doc of Object.values(category)) {
        if (doc.md === relativePath || doc.json === relativePath) {
          return true;
        }
      }
    }
    
    return false;
  }

  async trackDependencies(filePath) {
    // Extract dependencies from document content
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      const dependencies = [];
      
      // Look for references to other documents
      const refPatterns = [
        /\[([^\]]+)\]\(\.\.\/([^)]+\.md)\)/g,  // Relative MD links
        /See:\s*`([^`]+\.md)`/g,                // See references
        /Requires:\s*([^,\n]+\.md)/g,           // Requires references
        /Dependencies:\s*([^\n]+)/g             // Dependencies section
      ];
      
      for (const pattern of refPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const dep = match[1] || match[2];
          if (dep && dep.endsWith('.md')) {
            dependencies.push(dep);
          }
        }
      }
      
      if (dependencies.length > 0) {
        // Queue dependency update
        await this.manager.queueUpdate({
          action: 'dependency',
          path: this.getRelativePath(filePath),
          dependencies: [...new Set(dependencies)] // Remove duplicates
        });
      }
      
      return dependencies;
    } catch {
      return [];
    }
  }
}

// Export for use in other modules
module.exports = DocumentRegistryTracker;

// CLI interface
if (require.main === module) {
  const tracker = new DocumentRegistryTracker();
  tracker.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}