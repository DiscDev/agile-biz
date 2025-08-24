#!/usr/bin/env node

/**
 * MD/JSON Synchronization Monitor
 * Monitors changes to MD files and triggers JSON regeneration
 * Detects orphaned JSON files and outdated synchronization
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chokidar = require('chokidar');

class SyncMonitor {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.mdPaths = [
      'ai-agents/*.md',
      'aaa-documents/*.md',
      'ai-agent-coordination/*.md',
      'project-documents/**/*.md'
    ];
    this.jsonRoot = path.join(this.projectRoot, 'machine-data');
    this.syncLog = [];
    this.cache = new Map();
  }

  /**
   * Calculate MD5 checksum of a file
   */
  calculateChecksum(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Rough estimate: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  /**
   * Get file size in bytes
   */
  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  /**
   * Convert MD path to JSON path
   */
  mdToJsonPath(mdPath) {
    const relativePath = path.relative(this.projectRoot, mdPath);
    const parts = relativePath.split(path.sep);
    
    // Map MD directories to JSON directories
    if (parts[0] === 'ai-agents') {
      parts[0] = 'ai-agents-json';
    } else if (parts[0] === 'aaa-documents') {
      parts[0] = 'aaa-documents-json';
    } else if (parts[0] === 'ai-agent-coordination') {
      parts[0] = 'ai-agent-coordination-json';
    } else if (parts[0] === 'project-documents') {
      parts[0] = 'project-documents-json';
    }
    
    // Change extension
    const fileName = parts[parts.length - 1];
    parts[parts.length - 1] = fileName.replace('.md', '.json');
    
    return path.join(this.jsonRoot, ...parts);
  }

  /**
   * Check if JSON file exists and needs sync
   */
  checkSyncStatus(mdPath) {
    const jsonPath = this.mdToJsonPath(mdPath);
    
    if (!fs.existsSync(jsonPath)) {
      return { status: 'missing', jsonPath };
    }
    
    try {
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const currentChecksum = this.calculateChecksum(mdPath);
      
      if (!jsonContent.meta || !jsonContent.meta.md_checksum) {
        return { status: 'outdated', jsonPath, reason: 'missing_checksum' };
      }
      
      if (jsonContent.meta.md_checksum !== currentChecksum) {
        return { status: 'outdated', jsonPath, reason: 'checksum_mismatch' };
      }
      
      return { status: 'synced', jsonPath };
    } catch (error) {
      return { status: 'error', jsonPath, error: error.message };
    }
  }

  /**
   * Find orphaned JSON files
   */
  findOrphanedJsonFiles() {
    const orphaned = [];
    const jsonDirs = [
      'ai-agents-json',
      'aaa-documents-json',
      'ai-agent-coordination-json',
      'project-documents-json'
    ];
    
    jsonDirs.forEach(dir => {
      const fullPath = path.join(this.jsonRoot, dir);
      if (!fs.existsSync(fullPath)) return;
      
      const files = fs.readdirSync(fullPath, { recursive: true });
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const jsonPath = path.join(fullPath, file);
          try {
            const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            if (content.meta && content.meta.source_file) {
              const mdPath = path.join(this.projectRoot, content.meta.source_file);
              if (!fs.existsSync(mdPath)) {
                orphaned.push({
                  jsonPath,
                  sourcePath: content.meta.source_file,
                  reason: 'source_missing'
                });
              }
            }
          } catch (error) {
            // Skip malformed JSON files
          }
        }
      });
    });
    
    return orphaned;
  }

  /**
   * Generate sync report
   */
  generateSyncReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_md_files: 0,
        synced: 0,
        outdated: 0,
        missing: 0,
        orphaned: 0
      },
      details: {
        outdated: [],
        missing: [],
        orphaned: [],
        errors: []
      }
    };
    
    // Check all MD files
    this.mdPaths.forEach(pattern => {
      const files = this.findFiles(pattern);
      files.forEach(mdPath => {
        report.summary.total_md_files++;
        const status = this.checkSyncStatus(mdPath);
        
        switch (status.status) {
          case 'synced':
            report.summary.synced++;
            break;
          case 'outdated':
            report.summary.outdated++;
            report.details.outdated.push({
              mdPath,
              jsonPath: status.jsonPath,
              reason: status.reason
            });
            break;
          case 'missing':
            report.summary.missing++;
            report.details.missing.push({
              mdPath,
              jsonPath: status.jsonPath
            });
            break;
          case 'error':
            report.details.errors.push({
              mdPath,
              jsonPath: status.jsonPath,
              error: status.error
            });
            break;
        }
      });
    });
    
    // Find orphaned JSON files
    const orphaned = this.findOrphanedJsonFiles();
    report.summary.orphaned = orphaned.length;
    report.details.orphaned = orphaned;
    
    return report;
  }

  /**
   * Find files matching a pattern
   */
  findFiles(pattern) {
    const glob = require('glob');
    return glob.sync(path.join(this.projectRoot, pattern));
  }

  /**
   * Update JSON meta fields
   */
  updateJsonMeta(jsonPath, mdPath) {
    try {
      let jsonContent = {};
      if (fs.existsSync(jsonPath)) {
        jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      }
      
      // Update meta fields
      jsonContent.meta = jsonContent.meta || {};
      jsonContent.meta.source_file = path.relative(this.projectRoot, mdPath);
      jsonContent.meta.last_synced = new Date().toISOString();
      jsonContent.meta.sync_status = 'synced';
      jsonContent.meta.md_checksum = this.calculateChecksum(mdPath);
      jsonContent.meta.file_size = this.getFileSize(mdPath);
      jsonContent.meta.estimated_tokens = this.estimateTokens(mdPath);
      
      // Ensure directory exists
      const dir = path.dirname(jsonPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write updated JSON
      fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
      
      console.log(`✓ Updated meta for ${path.basename(jsonPath)}`);
      return true;
    } catch (error) {
      console.error(`✗ Error updating ${jsonPath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Start file watcher
   */
  startWatcher() {
    console.log('🔍 Starting MD/JSON Synchronization Monitor...\n');
    
    // Initial sync report
    const report = this.generateSyncReport();
    this.printReport(report);
    
    // Set up file watcher
    const watcher = chokidar.watch(this.mdPaths.map(p => path.join(this.projectRoot, p)), {
      persistent: true,
      ignoreInitial: true
    });
    
    watcher
      .on('add', path => this.handleFileChange('added', path))
      .on('change', path => this.handleFileChange('changed', path))
      .on('unlink', path => this.handleFileChange('deleted', path));
    
    console.log('\n👀 Watching for MD file changes...');
    console.log('Press Ctrl+C to stop\n');
  }

  /**
   * Handle file change events
   */
  handleFileChange(event, mdPath) {
    console.log(`\n📝 MD file ${event}: ${path.relative(this.projectRoot, mdPath)}`);
    
    if (event === 'deleted') {
      const jsonPath = this.mdToJsonPath(mdPath);
      if (fs.existsSync(jsonPath)) {
        console.log(`⚠️  Corresponding JSON file is now orphaned: ${path.relative(this.projectRoot, jsonPath)}`);
      }
    } else {
      const status = this.checkSyncStatus(mdPath);
      if (status.status !== 'synced') {
        console.log(`🔄 JSON file needs update: ${status.status}`);
        // In a real implementation, this would trigger JSON regeneration
        console.log(`   Run Document Manager Agent to regenerate JSON`);
      }
    }
  }

  /**
   * Print sync report
   */
  printReport(report) {
    console.log('📊 Synchronization Report');
    console.log('========================\n');
    
    console.log('Summary:');
    console.log(`  Total MD files: ${report.summary.total_md_files}`);
    console.log(`  ✅ Synced: ${report.summary.synced}`);
    console.log(`  ⚠️  Outdated: ${report.summary.outdated}`);
    console.log(`  ❌ Missing JSON: ${report.summary.missing}`);
    console.log(`  🗑️  Orphaned JSON: ${report.summary.orphaned}`);
    
    if (report.details.outdated.length > 0) {
      console.log('\n⚠️  Outdated JSON files:');
      report.details.outdated.forEach(item => {
        console.log(`  - ${path.relative(this.projectRoot, item.mdPath)}`);
        console.log(`    Reason: ${item.reason}`);
      });
    }
    
    if (report.details.missing.length > 0) {
      console.log('\n❌ Missing JSON files:');
      report.details.missing.forEach(item => {
        console.log(`  - ${path.relative(this.projectRoot, item.mdPath)}`);
      });
    }
    
    if (report.details.orphaned.length > 0) {
      console.log('\n🗑️  Orphaned JSON files:');
      report.details.orphaned.forEach(item => {
        console.log(`  - ${path.relative(this.projectRoot, item.jsonPath)}`);
        console.log(`    Source: ${item.sourcePath} (missing)`);
      });
    }
  }

  /**
   * Retrofit existing JSON files with meta information
   */
  retrofitExistingFiles() {
    console.log('🔧 Retrofitting existing JSON files with meta information...\n');
    
    let updated = 0;
    let failed = 0;
    
    this.mdPaths.forEach(pattern => {
      const files = this.findFiles(pattern);
      files.forEach(mdPath => {
        const jsonPath = this.mdToJsonPath(mdPath);
        if (fs.existsSync(jsonPath)) {
          if (this.updateJsonMeta(jsonPath, mdPath)) {
            updated++;
          } else {
            failed++;
          }
        }
      });
    });
    
    console.log(`\n✅ Retrofit complete: ${updated} files updated, ${failed} failed`);
  }
}

// Command line interface
const args = process.argv.slice(2);
const monitor = new SyncMonitor();

switch (args[0]) {
  case 'report':
    const report = monitor.generateSyncReport();
    monitor.printReport(report);
    break;
    
  case 'retrofit':
    monitor.retrofitExistingFiles();
    break;
    
  case 'watch':
    monitor.startWatcher();
    break;
    
  default:
    console.log('MD/JSON Synchronization Monitor\n');
    console.log('Usage:');
    console.log('  node sync-monitor.js report    - Generate sync status report');
    console.log('  node sync-monitor.js retrofit  - Add meta fields to existing JSON files');
    console.log('  node sync-monitor.js watch     - Start file watcher for real-time monitoring');
}