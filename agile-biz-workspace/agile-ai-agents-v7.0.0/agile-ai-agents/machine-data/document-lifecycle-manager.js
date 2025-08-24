#!/usr/bin/env node

/**
 * Document Lifecycle Manager
 * 
 * Manages the complete lifecycle of documents including:
 * - Checking for existing documents to prevent duplicates
 * - Tracking document freshness and staleness
 * - Importing existing documents after upgrades
 * - Validating document health and dependencies
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

class DocumentLifecycleManager {
  constructor(projectRoot = null) {
    this.projectRoot = projectRoot || path.join(__dirname, '..');
    this.projectDocsPath = path.join(this.projectRoot, 'project-documents');
    this.registryPath = path.join(__dirname, 'project-document-registry.json');
    this.lifecyclePath = path.join(__dirname, 'document-lifecycle-state.json');
    
    // Freshness thresholds in days
    this.freshnessThresholds = {
      'market-analysis': 30,
      'competitive-analysis': 60,
      'technical-docs': 90,
      'financial-projections': 30,
      'user-research': 45,
      'security-audit': 90,
      'api-documentation': 120,
      'deployment-guide': 60,
      'pricing-strategy': 30,
      'customer-feedback': 45,
      'performance-metrics': 7,
      'default': 90
    };
    
    // Load or initialize lifecycle state
    this.loadLifecycleState();
  }

  /**
   * Load lifecycle state from disk
   */
  async loadLifecycleState() {
    try {
      if (fsSync.existsSync(this.lifecyclePath)) {
        const content = await fs.readFile(this.lifecyclePath, 'utf8');
        this.lifecycleState = JSON.parse(content);
      } else {
        this.lifecycleState = {
          version: '1.0.0',
          documents: {},
          imports: [],
          validations: [],
          last_scan: null
        };
      }
    } catch (error) {
      console.error('Error loading lifecycle state:', error);
      this.lifecycleState = {
        version: '1.0.0',
        documents: {},
        imports: [],
        validations: [],
        last_scan: null
      };
    }
  }

  /**
   * Save lifecycle state to disk
   */
  async saveLifecycleState() {
    try {
      await fs.writeFile(
        this.lifecyclePath,
        JSON.stringify(this.lifecycleState, null, 2)
      );
    } catch (error) {
      console.error('Error saving lifecycle state:', error);
    }
  }

  /**
   * Check if document already exists
   */
  async checkExisting(document) {
    const result = {
      exists: false,
      path: null,
      isFresh: true,
      lastModified: null,
      checksum: null,
      needsUpdate: false
    };

    try {
      // Check multiple possible locations
      const possiblePaths = await this.getPossiblePaths(document);
      
      for (const possiblePath of possiblePaths) {
        if (await this.fileExists(possiblePath)) {
          result.exists = true;
          result.path = possiblePath;
          
          // Get file stats
          const stats = await fs.stat(possiblePath);
          result.lastModified = stats.mtime;
          
          // Calculate checksum
          const content = await fs.readFile(possiblePath, 'utf8');
          result.checksum = this.calculateChecksum(content);
          
          // Check freshness
          const freshnessCheck = this.checkFreshness(document.fileName, stats.mtime);
          result.isFresh = freshnessCheck.isFresh;
          result.daysOld = freshnessCheck.daysOld;
          result.threshold = freshnessCheck.threshold;
          
          if (!result.isFresh) {
            result.needsUpdate = true;
            console.warn(`⚠️  Stale document detected: ${document.fileName} (${result.daysOld} days old, threshold: ${result.threshold} days)`);
          }
          
          // Update lifecycle state
          this.lifecycleState.documents[document.fileName] = {
            path: result.path,
            lastModified: result.lastModified,
            checksum: result.checksum,
            isFresh: result.isFresh,
            lastChecked: new Date().toISOString()
          };
          
          await this.saveLifecycleState();
          break;
        }
      }
    } catch (error) {
      console.error('Error checking existing document:', error);
    }

    return result;
  }

  /**
   * Get possible paths for a document
   */
  async getPossiblePaths(document) {
    const paths = [];
    const fileName = document.fileName;
    
    // Check all category folders
    const categories = ['orchestration', 'business-strategy', 'implementation', 'operations'];
    
    for (const category of categories) {
      const categoryPath = path.join(this.projectDocsPath, category);
      
      // Direct category path
      paths.push(path.join(categoryPath, fileName));
      
      // Check subcategories
      if (fsSync.existsSync(categoryPath)) {
        const entries = await fs.readdir(categoryPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            paths.push(path.join(categoryPath, entry.name, fileName));
            
            // Check sprint folders within subcategories
            const subcategoryPath = path.join(categoryPath, entry.name);
            const subEntries = await fs.readdir(subcategoryPath, { withFileTypes: true });
            for (const subEntry of subEntries) {
              if (subEntry.isDirectory() && subEntry.name.startsWith('sprint-')) {
                paths.push(path.join(subcategoryPath, subEntry.name, fileName));
              }
            }
          }
        }
      }
    }
    
    // Also check legacy numbered folders for backward compatibility
    const legacyFolders = await this.getLegacyFolders();
    for (const folder of legacyFolders) {
      paths.push(path.join(this.projectDocsPath, folder, fileName));
    }
    
    return paths;
  }

  /**
   * Get legacy numbered folders
   */
  async getLegacyFolders() {
    const folders = [];
    try {
      const entries = await fs.readdir(this.projectDocsPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && /^\d{2}-/.test(entry.name)) {
          folders.push(entry.name);
        }
      }
    } catch (error) {
      // Ignore if project-documents doesn't exist yet
    }
    return folders;
  }

  /**
   * Check document freshness
   */
  checkFreshness(fileName, lastModified) {
    // Determine threshold based on document type
    let threshold = this.freshnessThresholds.default;
    
    for (const [pattern, days] of Object.entries(this.freshnessThresholds)) {
      if (fileName.includes(pattern.replace('-', '')) || 
          fileName.match(new RegExp(pattern.replace('*', '.*')))) {
        threshold = days;
        break;
      }
    }
    
    // Calculate days since last modified
    const now = new Date();
    const modified = new Date(lastModified);
    const daysOld = Math.floor((now - modified) / (1000 * 60 * 60 * 24));
    
    return {
      isFresh: daysOld <= threshold,
      daysOld: daysOld,
      threshold: threshold,
      staleness: daysOld > threshold ? 'stale' : 'fresh'
    };
  }

  /**
   * Import existing documents into registry
   */
  async importExistingDocuments() {
    const importReport = {
      timestamp: new Date().toISOString(),
      scanned: 0,
      imported: 0,
      updated: 0,
      errors: 0,
      documents: [],
      summary: {}
    };

    console.log('🔍 Scanning for existing documents...');

    try {
      // Scan all documents in project-documents
      const documents = await this.scanProjectDocuments();
      importReport.scanned = documents.length;
      
      for (const doc of documents) {
        try {
          // Check if already in lifecycle state
          const existingEntry = this.lifecycleState.documents[doc.fileName];
          
          if (existingEntry && existingEntry.checksum === doc.checksum) {
            // Document unchanged
            doc.status = 'unchanged';
          } else if (existingEntry) {
            // Document updated
            doc.status = 'updated';
            importReport.updated++;
          } else {
            // New document
            doc.status = 'imported';
            importReport.imported++;
          }
          
          // Update lifecycle state
          this.lifecycleState.documents[doc.fileName] = {
            path: doc.path,
            lastModified: doc.lastModified,
            checksum: doc.checksum,
            isFresh: doc.isFresh,
            category: doc.category,
            importedAt: new Date().toISOString()
          };
          
          importReport.documents.push({
            fileName: doc.fileName,
            path: doc.path,
            status: doc.status,
            isFresh: doc.isFresh,
            daysOld: doc.daysOld
          });
          
        } catch (error) {
          console.error(`Error importing ${doc.fileName}:`, error);
          importReport.errors++;
        }
      }
      
      // Save updated state
      await this.saveLifecycleState();
      
      // Update registry
      await this.updateRegistry(importReport.documents);
      
      // Generate summary
      importReport.summary = {
        total_documents: importReport.scanned,
        new_imports: importReport.imported,
        updated_documents: importReport.updated,
        fresh_documents: importReport.documents.filter(d => d.isFresh).length,
        stale_documents: importReport.documents.filter(d => !d.isFresh).length,
        error_count: importReport.errors
      };
      
      // Save import report
      this.lifecycleState.imports.push(importReport);
      await this.saveLifecycleState();
      
      console.log(`📊 Import complete:
  • Scanned: ${importReport.scanned} documents
  • Imported: ${importReport.imported} new
  • Updated: ${importReport.updated} existing
  • Fresh: ${importReport.summary.fresh_documents}
  • Stale: ${importReport.summary.stale_documents}
  • Errors: ${importReport.errors}`);
      
      return importReport;
      
    } catch (error) {
      console.error('Error during import:', error);
      importReport.errors++;
      return importReport;
    }
  }

  /**
   * Scan project documents recursively
   */
  async scanProjectDocuments(dir = this.projectDocsPath, category = '') {
    const documents = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Determine category from folder name
          const newCategory = category || this.determineCategoryFromPath(entry.name);
          
          // Recurse into subdirectories
          const subDocs = await this.scanProjectDocuments(fullPath, newCategory);
          documents.push(...subDocs);
          
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // Process markdown file
          const stats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, 'utf8');
          const checksum = this.calculateChecksum(content);
          const freshnessCheck = this.checkFreshness(entry.name, stats.mtime);
          
          documents.push({
            fileName: entry.name,
            path: fullPath,
            relativePath: path.relative(this.projectDocsPath, fullPath),
            category: category || 'uncategorized',
            lastModified: stats.mtime,
            size: stats.size,
            checksum: checksum,
            isFresh: freshnessCheck.isFresh,
            daysOld: freshnessCheck.daysOld,
            threshold: freshnessCheck.threshold
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
    
    return documents;
  }

  /**
   * Determine category from folder path
   */
  determineCategoryFromPath(folderName) {
    if (folderName === 'orchestration') return 'orchestration';
    if (folderName === 'business-strategy') return 'business-strategy';
    if (folderName === 'implementation') return 'implementation';
    if (folderName === 'operations') return 'operations';
    
    // Legacy numbered folders
    const folderMap = {
      '00-orchestration': 'orchestration',
      '01-existing-project-analysis': 'business-strategy',
      '02-research': 'business-strategy',
      '03-marketing': 'business-strategy',
      '04-finance': 'business-strategy',
      '05-market-validation': 'business-strategy',
      '10-security': 'implementation',
      '11-requirements': 'implementation',
      '21-implementation': 'implementation',
      '22-testing': 'implementation',
      '23-deployment': 'operations',
      '24-launch': 'operations',
      '25-analytics': 'operations'
    };
    
    return folderMap[folderName] || 'uncategorized';
  }

  /**
   * Validate document health
   */
  async validateDocumentHealth() {
    const validation = {
      timestamp: new Date().toISOString(),
      total_documents: 0,
      healthy: 0,
      warnings: 0,
      errors: 0,
      details: {
        correctly_located: 0,
        fresh_documents: 0,
        complete_documents: 0,
        dependencies_met: 0
      },
      issues: []
    };

    console.log('🏥 Checking document health...');

    try {
      // Get all documents from lifecycle state
      const documents = Object.entries(this.lifecycleState.documents);
      validation.total_documents = documents.length;
      
      for (const [fileName, docInfo] of documents) {
        const issues = [];
        
        // Check if file still exists
        if (!await this.fileExists(docInfo.path)) {
          issues.push({
            type: 'error',
            message: `File no longer exists at: ${docInfo.path}`
          });
          validation.errors++;
          continue;
        }
        
        // Check freshness
        const freshnessCheck = this.checkFreshness(fileName, docInfo.lastModified);
        if (!freshnessCheck.isFresh) {
          issues.push({
            type: 'warning',
            message: `Document is stale (${freshnessCheck.daysOld} days old, threshold: ${freshnessCheck.threshold})`
          });
          validation.warnings++;
        } else {
          validation.details.fresh_documents++;
        }
        
        // Check location correctness
        const locationCheck = await this.validateLocation(fileName, docInfo.path);
        if (locationCheck.isCorrect) {
          validation.details.correctly_located++;
        } else {
          issues.push({
            type: 'warning',
            message: `Document may be in wrong location. Suggested: ${locationCheck.suggestedPath}`
          });
          validation.warnings++;
        }
        
        // Check completeness
        const completenessCheck = await this.checkCompleteness(docInfo.path);
        if (completenessCheck.isComplete) {
          validation.details.complete_documents++;
        } else {
          issues.push({
            type: 'warning',
            message: `Document appears incomplete: ${completenessCheck.missing.join(', ')}`
          });
          validation.warnings++;
        }
        
        // Check dependencies
        const dependencyCheck = await this.checkDependencies(fileName, docInfo.path);
        if (dependencyCheck.allMet) {
          validation.details.dependencies_met++;
        } else {
          issues.push({
            type: 'error',
            message: `Missing dependencies: ${dependencyCheck.missing.join(', ')}`
          });
          validation.errors++;
        }
        
        // Record issues
        if (issues.length > 0) {
          validation.issues.push({
            fileName: fileName,
            path: docInfo.path,
            issues: issues
          });
        } else {
          validation.healthy++;
        }
      }
      
      // Calculate health score
      validation.healthScore = validation.total_documents > 0
        ? Math.round((validation.healthy / validation.total_documents) * 100)
        : 0;
      
      // Save validation report
      this.lifecycleState.validations.push(validation);
      await this.saveLifecycleState();
      
      // Display results
      console.log(`📊 Document Health Check Complete:
  • Total Documents: ${validation.total_documents}
  • Healthy: ${validation.healthy} ✅
  • Warnings: ${validation.warnings} ⚠️
  • Errors: ${validation.errors} ❌
  • Health Score: ${validation.healthScore}%
  
Details:
  • Correctly Located: ${validation.details.correctly_located}
  • Fresh: ${validation.details.fresh_documents}
  • Complete: ${validation.details.complete_documents}
  • Dependencies Met: ${validation.details.dependencies_met}`);
      
      // Show top issues
      if (validation.issues.length > 0) {
        console.log('\nTop Issues:');
        validation.issues.slice(0, 5).forEach(issue => {
          console.log(`  • ${issue.fileName}:`);
          issue.issues.forEach(i => {
            const icon = i.type === 'error' ? '❌' : '⚠️';
            console.log(`    ${icon} ${i.message}`);
          });
        });
        
        if (validation.issues.length > 5) {
          console.log(`  ... and ${validation.issues.length - 5} more issues`);
        }
      }
      
      return validation;
      
    } catch (error) {
      console.error('Error during validation:', error);
      validation.errors++;
      return validation;
    }
  }

  /**
   * Validate document location
   */
  async validateLocation(fileName, currentPath) {
    // Use Document Router to determine correct path
    try {
      const DocumentRouter = require('./document-router');
      const router = new DocumentRouter(this.projectRoot);
      
      const suggestedPath = await router.route({
        fileName: fileName,
        content: await fs.readFile(currentPath, 'utf8')
      });
      
      // Normalize paths for comparison
      const normalizedCurrent = path.normalize(currentPath);
      const normalizedSuggested = path.normalize(
        path.join(this.projectRoot, suggestedPath)
      );
      
      return {
        isCorrect: normalizedCurrent === normalizedSuggested,
        currentPath: currentPath,
        suggestedPath: suggestedPath
      };
    } catch (error) {
      // If router not available, assume location is correct
      return {
        isCorrect: true,
        currentPath: currentPath,
        suggestedPath: currentPath
      };
    }
  }

  /**
   * Check document completeness
   */
  async checkCompleteness(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const missing = [];
      
      // Check for required sections
      if (!content.match(/^#\s+/m)) {
        missing.push('Main title');
      }
      
      if (!content.match(/^##\s+(?:Overview|Introduction|Purpose)/mi)) {
        missing.push('Overview section');
      }
      
      if (content.length < 100) {
        missing.push('Sufficient content (too short)');
      }
      
      // Check for TODO markers
      if (content.match(/TODO|TBD|FIXME|XXX/)) {
        missing.push('Has incomplete sections (TODO markers)');
      }
      
      return {
        isComplete: missing.length === 0,
        missing: missing
      };
    } catch (error) {
      return {
        isComplete: false,
        missing: ['Could not read file']
      };
    }
  }

  /**
   * Check document dependencies
   */
  async checkDependencies(fileName, filePath) {
    const dependencies = {
      'api-implementation.md': ['api-design.md'],
      'deployment-guide.md': ['technical-architecture.md'],
      'test-results.md': ['test-plan.md'],
      'sprint-review.md': ['sprint-planning.md'],
      'financial-projections.md': ['market-analysis.md']
    };
    
    const required = dependencies[fileName] || [];
    const missing = [];
    
    for (const dep of required) {
      const depExists = this.lifecycleState.documents[dep];
      if (!depExists) {
        missing.push(dep);
      }
    }
    
    return {
      allMet: missing.length === 0,
      required: required,
      missing: missing
    };
  }

  /**
   * Update document registry
   */
  async updateRegistry(documents) {
    try {
      let registry = {};
      
      // Load existing registry
      if (fsSync.existsSync(this.registryPath)) {
        const content = await fs.readFile(this.registryPath, 'utf8');
        registry = JSON.parse(content);
      }
      
      // Update with new documents
      for (const doc of documents) {
        registry[doc.fileName] = {
          path: doc.path,
          status: doc.status,
          isFresh: doc.isFresh,
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Save updated registry
      await fs.writeFile(
        this.registryPath,
        JSON.stringify(registry, null, 2)
      );
    } catch (error) {
      console.error('Error updating registry:', error);
    }
  }

  /**
   * Calculate checksum for content
   */
  calculateChecksum(content) {
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get stale documents
   */
  getStaleDocuments() {
    const stale = [];
    
    for (const [fileName, docInfo] of Object.entries(this.lifecycleState.documents)) {
      if (!docInfo.isFresh) {
        stale.push({
          fileName: fileName,
          path: docInfo.path,
          lastModified: docInfo.lastModified,
          daysOld: Math.floor(
            (new Date() - new Date(docInfo.lastModified)) / (1000 * 60 * 60 * 24)
          )
        });
      }
    }
    
    return stale.sort((a, b) => b.daysOld - a.daysOld);
  }

  /**
   * Get lifecycle statistics
   */
  getStatistics() {
    const stats = {
      total_documents: Object.keys(this.lifecycleState.documents).length,
      fresh_documents: 0,
      stale_documents: 0,
      import_count: this.lifecycleState.imports.length,
      validation_count: this.lifecycleState.validations.length,
      last_scan: this.lifecycleState.last_scan,
      categories: {}
    };
    
    for (const docInfo of Object.values(this.lifecycleState.documents)) {
      if (docInfo.isFresh) {
        stats.fresh_documents++;
      } else {
        stats.stale_documents++;
      }
      
      const category = docInfo.category || 'uncategorized';
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    }
    
    stats.freshness_percentage = stats.total_documents > 0
      ? Math.round((stats.fresh_documents / stats.total_documents) * 100)
      : 0;
    
    return stats;
  }
}

// Export for use by other modules
module.exports = DocumentLifecycleManager;

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new DocumentLifecycleManager();
  
  (async () => {
    try {
      switch (command) {
        case 'import':
          await manager.importExistingDocuments();
          break;
          
        case 'validate':
          await manager.validateDocumentHealth();
          break;
          
        case 'stale':
          const staleDocuments = manager.getStaleDocuments();
          if (staleDocuments.length > 0) {
            console.log('📅 Stale Documents:');
            staleDocuments.forEach(doc => {
              console.log(`  • ${doc.fileName} (${doc.daysOld} days old)`);
              console.log(`    Path: ${doc.path}`);
            });
          } else {
            console.log('✅ No stale documents found');
          }
          break;
          
        case 'stats':
          const stats = manager.getStatistics();
          console.log('📊 Lifecycle Statistics:', JSON.stringify(stats, null, 2));
          break;
          
        default:
          console.log('Usage: node document-lifecycle-manager.js <command>');
          console.log('Commands:');
          console.log('  import   - Import existing documents');
          console.log('  validate - Validate document health');
          console.log('  stale    - List stale documents');
          console.log('  stats    - Show lifecycle statistics');
          break;
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}