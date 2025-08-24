#!/usr/bin/env node

/**
 * JSON Cleanup Hook Handler
 * Removes orphaned JSON files when corresponding MD files are deleted
 */

const fs = require('fs');
const path = require('path');

class JSONCleanupHandler {
  constructor() {
    this.context = this.parseContext();
  }

  parseContext() {
    return {
      filePath: process.env.FILE_PATH || process.argv[2],
      timestamp: new Date().toISOString()
    };
  }

  async execute() {
    try {
      const { filePath } = this.context;
      
      if (!filePath || !filePath.endsWith('.md')) {
        return { status: 'skipped', reason: 'Not an MD file' };
      }

      // Determine converter type
      const converterType = this.determineConverterType(filePath);
      if (!converterType) {
        return { status: 'skipped', reason: 'Outside conversion scope' };
      }

      // Get JSON path
      const jsonPath = this.getJsonPath(filePath, converterType);
      
      // Remove JSON if exists
      if (fs.existsSync(jsonPath)) {
        fs.unlinkSync(jsonPath);
        
        // Clean empty directories
        this.cleanEmptyDirectories(path.dirname(jsonPath));
        
        // Notify document registry of deletion
        if (converterType === 'project-documents') {
          await this.notifyDocumentRegistry(filePath);
        }
        
        console.log(`Removed orphaned JSON: ${jsonPath}`);
        return { status: 'success', removed: jsonPath };
      }

      return { status: 'skipped', reason: 'No JSON file found' };
      
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }

  determineConverterType(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    if (normalizedPath.includes('/ai-agents/')) return 'ai-agents';
    if (normalizedPath.includes('/aaa-documents/')) return 'aaa-documents';
    if (normalizedPath.includes('/project-documents/')) return 'project-documents';
    
    return null;
  }

  getJsonPath(mdPath, converterType) {
    const basePath = path.dirname(mdPath);
    const fileName = path.basename(mdPath, '.md') + '.json';
    
    const jsonDir = basePath.replace(
      `/${converterType}/`,
      `/machine-data/${converterType}-json/`
    );
    
    return path.join(jsonDir, fileName);
  }

  cleanEmptyDirectories(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        const parentDir = path.dirname(dirPath);
        if (parentDir !== dirPath) {
          this.cleanEmptyDirectories(parentDir);
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async notifyDocumentRegistry(filePath) {
    try {
      const ProjectDocumentRegistryManager = require('../../../machine-data/project-document-registry-manager');
      const projectRoot = path.join(__dirname, '../../..');
      const manager = new ProjectDocumentRegistryManager(projectRoot);
      
      await manager.initialize();
      
      // Queue the deletion
      const relativePath = this.getRelativePath(filePath);
      await manager.queueUpdate({
        action: 'delete',
        path: relativePath
      });
      
      console.log(`Document registry notified of deletion: ${relativePath}`);
    } catch (error) {
      // Non-critical error, log but don't fail
      console.error('Failed to notify document registry:', error.message);
    }
  }

  getRelativePath(filePath) {
    const projectRoot = path.join(__dirname, '../../..');
    if (filePath.startsWith(projectRoot)) {
      return filePath.substring(projectRoot.length + 1).replace(/\\/g, '/');
    }
    
    // Try to extract project-documents path
    const projectDocsIndex = filePath.indexOf('project-documents/');
    if (projectDocsIndex >= 0) {
      return filePath.substring(projectDocsIndex);
    }
    
    return filePath;
  }
}

if (require.main === module) {
  const handler = new JSONCleanupHandler();
  handler.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = JSONCleanupHandler;