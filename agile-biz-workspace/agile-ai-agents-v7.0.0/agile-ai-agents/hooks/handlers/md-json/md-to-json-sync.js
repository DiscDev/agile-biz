#!/usr/bin/env node

/**
 * MD to JSON Auto-Sync Hook Handler
 * Automatically converts MD files to JSON when they are created or modified
 * Ensures token optimization and consistency across the system
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MDToJSONSyncHandler {
  constructor() {
    this.context = this.parseContext();
    this.converterPath = path.join(
      __dirname, 
      '../../../machine-data/scripts/universal-md-to-json-converter.js'
    );
    this.claudeConverterPath = path.join(
      __dirname,
      '../../../machine-data/scripts/md-to-claude-agent-converter.js'
    );
    this.syncLogPath = path.join(__dirname, '../../../logs/md-json-sync.log');
  }

  /**
   * Parse hook context from environment
   */
  parseContext() {
    try {
      return {
        filePath: process.env.FILE_PATH || process.argv[2],
        hookContext: process.env.HOOK_CONTEXT ? JSON.parse(process.env.HOOK_CONTEXT) : {},
        activeAgent: process.env.ACTIVE_AGENT || 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to parse context:', error);
      return {};
    }
  }

  /**
   * Main execution
   */
  async execute() {
    try {
      const { filePath } = this.context;
      
      if (!filePath) {
        throw new Error('No file path provided');
      }

      // Check if file is MD
      if (!filePath.endsWith('.md')) {
        this.log('info', 'Skipping non-MD file', { filePath });
        return { status: 'skipped', reason: 'Not an MD file' };
      }

      // Determine which converter to use based on path
      const converterType = this.determineConverterType(filePath);
      if (!converterType) {
        this.log('info', 'File not in conversion scope', { filePath });
        return { status: 'skipped', reason: 'Outside conversion directories' };
      }

      // Check if file exists (might be delete operation)
      if (!fs.existsSync(filePath)) {
        return await this.handleDeletedFile(filePath, converterType);
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const checksum = this.calculateChecksum(filePath);

      // Check if conversion is needed
      const jsonPath = this.getJsonPath(filePath, converterType);
      if (this.isConversionNeeded(filePath, jsonPath, checksum)) {
        this.log('info', 'Starting MD to JSON conversion', {
          filePath,
          converterType,
          fileSize,
          agent: this.context.activeAgent
        });

        const startTime = Date.now();
        const result = await this.runConverter(filePath, converterType);
        const duration = Date.now() - startTime;

        this.log('info', 'Conversion completed', {
          filePath,
          duration,
          success: result.success
        });

        // If this is an ai-agent file, also convert to Claude agent
        if (converterType === 'agents' && result.success) {
          try {
            const claudeResult = await this.runClaudeAgentConverter(filePath);
            this.log('info', 'Claude agent conversion completed', {
              filePath,
              success: claudeResult.success
            });
            
            // Sync to parent if in repository context and auto-sync is enabled
            if (claudeResult.success && await this.shouldSyncToParent()) {
              await this.syncClaudeAgentToParent(filePath);
            }
          } catch (claudeError) {
            this.log('error', 'Claude agent conversion failed', {
              filePath,
              error: claudeError.message
            });
            // Don't fail the whole operation if Claude conversion fails
          }
        }

        // Notify dashboard if available
        this.notifyDashboard({
          type: 'md-json-sync',
          filePath,
          converterType,
          duration,
          success: result.success
        });

        // Notify document registry of conversion
        if (converterType === 'project-documents' && result.success) {
          this.notifyDocumentRegistry(filePath, jsonPath);
        }

        return {
          status: 'success',
          duration,
          jsonPath,
          fileSize,
          checksum
        };
      } else {
        this.log('debug', 'Conversion not needed', { filePath });
        return { status: 'skipped', reason: 'JSON already up to date' };
      }

    } catch (error) {
      this.log('error', 'Sync failed', {
        error: error.message,
        stack: error.stack,
        context: this.context
      });
      
      throw error;
    }
  }

  /**
   * Determine which type of converter to use
   */
  determineConverterType(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    if (normalizedPath.includes('/ai-agents/')) {
      return 'agents';
    } else if (normalizedPath.includes('/aaa-documents/')) {
      return 'aaa-documents';
    } else if (normalizedPath.includes('/project-documents/')) {
      return 'project-documents';
    }
    
    return null;
  }

  /**
   * Get corresponding JSON path
   */
  getJsonPath(mdPath, converterType) {
    const basePath = path.dirname(mdPath);
    const fileName = path.basename(mdPath, '.md') + '.json';
    
    // Replace MD directory with JSON directory
    let jsonDir;
    if (converterType === 'agents') {
      jsonDir = basePath.replace('/ai-agents/', '/machine-data/ai-agents-json/');
    } else {
      jsonDir = basePath.replace(
        `/${converterType}/`,
        `/machine-data/${converterType}-json/`
      );
    }
    
    return path.join(jsonDir, fileName);
  }

  /**
   * Check if conversion is needed
   */
  isConversionNeeded(mdPath, jsonPath, currentChecksum) {
    // If JSON doesn't exist, conversion needed
    if (!fs.existsSync(jsonPath)) {
      return true;
    }

    try {
      // Read JSON and check checksum
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const storedChecksum = jsonContent.meta?.checksum;
      
      return storedChecksum !== currentChecksum;
    } catch (error) {
      // If JSON is corrupted, reconvert
      return true;
    }
  }

  /**
   * Calculate file checksum
   */
  calculateChecksum(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Run the appropriate converter
   */
  async runConverter(filePath, converterType) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
      // Use the universal converter with type parameter
      const args = [
        this.converterPath,
        converterType,
        '--file',
        filePath,
        '--incremental'
      ];

      const converter = spawn('node', args);
      
      let stdout = '';
      let stderr = '';

      converter.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      converter.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      converter.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, stdout, stderr });
        } else {
          reject(new Error(`Converter failed with code ${code}: ${stderr}`));
        }
      });

      converter.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Handle deleted MD file
   */
  async handleDeletedFile(mdPath, converterType) {
    const jsonPath = this.getJsonPath(mdPath, converterType);
    
    if (fs.existsSync(jsonPath)) {
      try {
        fs.unlinkSync(jsonPath);
        this.log('info', 'Removed orphaned JSON file', { jsonPath });
        
        // Clean up empty directories
        this.cleanEmptyDirectories(path.dirname(jsonPath));
        
        // Also remove Claude agent if it's an ai-agent
        if (converterType === 'agents') {
          const agentName = path.basename(mdPath, '.md');
          const claudeAgentPath = path.join(
            __dirname,
            '../../../.claude/agents',
            `${agentName}.md`
          );
          
          if (fs.existsSync(claudeAgentPath)) {
            fs.unlinkSync(claudeAgentPath);
            this.log('info', 'Removed orphaned Claude agent file', { claudeAgentPath });
          }
        }
        
        return { status: 'success', action: 'json_removed' };
      } catch (error) {
        this.log('error', 'Failed to remove JSON file', {
          jsonPath,
          error: error.message
        });
        throw error;
      }
    }
    
    return { status: 'skipped', reason: 'No JSON file to remove' };
  }

  /**
   * Clean up empty directories
   */
  cleanEmptyDirectories(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        
        // Recursively check parent
        const parentDir = path.dirname(dirPath);
        if (parentDir !== dirPath) {
          this.cleanEmptyDirectories(parentDir);
        }
      }
    } catch (error) {
      // Ignore errors in cleanup
    }
  }

  /**
   * Run Claude agent converter for ai-agents
   */
  async runClaudeAgentConverter(filePath) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const agentName = path.basename(filePath, '.md');
      
      const args = [
        this.claudeConverterPath,
        agentName
      ];

      const converter = spawn('node', args);
      
      let stdout = '';
      let stderr = '';

      converter.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      converter.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      converter.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, stdout, stderr });
        } else {
          reject(new Error(`Claude converter failed with code ${code}: ${stderr}`));
        }
      });

      converter.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Notify dashboard of sync status
   */
  notifyDashboard(data) {
    try {
      const http = require('http');
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/hooks/md-json-sync',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        // Don't wait for response
      });

      req.on('error', (error) => {
        // Dashboard might not be running, ignore
      });

      req.write(postData);
      req.end();
    } catch (error) {
      // Non-critical, ignore
    }
  }

  /**
   * Notify document registry of conversion
   */
  async notifyDocumentRegistry(mdPath, jsonPath) {
    try {
      const ProjectDocumentRegistryManager = require('../../../machine-data/project-document-registry-manager');
      const manager = new ProjectDocumentRegistryManager(path.join(__dirname, '../../..'));
      
      await manager.initialize();
      
      // Queue the conversion update
      await manager.queueUpdate({
        action: 'convert',
        md_path: this.getRelativePath(mdPath),
        json_path: this.getRelativePath(jsonPath)
      });
      
      this.log('debug', 'Document registry notified of conversion', {
        mdPath,
        jsonPath
      });
    } catch (error) {
      // Non-critical error, log but don't fail
      this.log('warn', 'Failed to notify document registry', {
        error: error.message,
        mdPath,
        jsonPath
      });
    }
  }

  /**
   * Get relative path from project root
   */
  getRelativePath(filePath) {
    const projectRoot = path.join(__dirname, '../../..');
    if (filePath.startsWith(projectRoot)) {
      return filePath.substring(projectRoot.length + 1).replace(/\\/g, '/');
    }
    
    // Already relative or try to extract project-documents path
    const projectDocsIndex = filePath.indexOf('project-documents/');
    if (projectDocsIndex >= 0) {
      return filePath.substring(projectDocsIndex);
    }
    
    return filePath;
  }

  /**
   * Log to sync log file
   */
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context: {
        agent: this.context.activeAgent,
        file: this.context.filePath
      }
    };

    // Console output for errors
    if (level === 'error') {
      console.error(`[MD-JSON Sync] ${message}`, data);
    }

    // Append to log file
    try {
      const logDir = path.dirname(this.syncLogPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      fs.appendFileSync(
        this.syncLogPath,
        JSON.stringify(logEntry) + '\n'
      );
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * Check if we should sync to parent directory
   */
  async shouldSyncToParent() {
    try {
      // Check execution context from environment
      if (process.env.EXECUTION_CONTEXT !== 'repository') {
        return false;
      }
      
      // Check if parent .claude directory exists
      const parentClaudeDir = path.join(__dirname, '../../../../../.claude');
      if (!fs.existsSync(parentClaudeDir)) {
        return false;
      }
      
      // Check Claude settings for auto-sync
      const ClaudeHookBridge = require('../../claude-hook-bridge');
      const bridge = new ClaudeHookBridge();
      const settings = bridge.loadSettings();
      
      return settings?.hookSettings?.autoSyncToParent !== false;
    } catch (error) {
      this.log('debug', 'Error checking sync settings', { error: error.message });
      return false;
    }
  }

  /**
   * Sync Claude agent to parent directory
   */
  async syncClaudeAgentToParent(sourceMdPath) {
    try {
      // Get agent name from path
      const agentName = path.basename(sourceMdPath, '.md');
      
      // Source and destination paths
      const sourceClaudeAgent = path.join(
        __dirname, 
        '../../../templates/claude-integration/.claude/agents',
        `${agentName}.md`
      );
      
      const destClaudeAgent = path.join(
        __dirname,
        '../../../../../.claude/agents',
        `${agentName}.md`
      );
      
      // Ensure destination directory exists
      const destDir = path.dirname(destClaudeAgent);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy the file
      fs.copyFileSync(sourceClaudeAgent, destClaudeAgent);
      
      this.log('info', 'Synced Claude agent to parent', {
        agent: agentName,
        source: sourceClaudeAgent,
        destination: destClaudeAgent
      });
      
      return true;
    } catch (error) {
      this.log('error', 'Failed to sync to parent', {
        error: error.message,
        sourcePath: sourceMdPath
      });
      return false;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const handler = new MDToJSONSyncHandler();
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

module.exports = MDToJSONSyncHandler;