#!/usr/bin/env node

/**
 * Centralized File Operation Manager
 * 
 * This module provides secure, validated file operations for the AgileAiAgents system.
 * It prevents unauthorized directory creation and enforces strict folder structure compliance.
 * 
 * Critical Design Principles:
 * 1. NO DIRECTORY CREATION - Only writes to pre-existing folders
 * 2. Mandatory path validation - All paths must pass strict validation
 * 3. Comprehensive audit trail - Every operation is logged
 * 4. Fail-safe mechanisms - Invalid operations are rejected, not corrected
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class FileOperationManager {
  constructor(projectRoot = null) {
    this.projectRoot = projectRoot || path.join(__dirname, '..');
    this.projectDocsPath = path.join(this.projectRoot, 'project-documents');
    this.auditLogPath = path.join(this.projectRoot, 'machine-data', 'file-operations-audit.log');
    this.operationLog = [];
    
    // Load hardcoded folder mappings
    this.initializeFolderMappings();
    
    // Initialize audit system
    this.initializeAuditSystem();
  }

  /**
   * Initialize hardcoded folder mappings - NO DYNAMIC CREATION
   * Using category-based structure v3.0.0
   */
  initializeFolderMappings() {
    // Category-based structure (v3.0.0)
    this.ALLOWED_FOLDERS = {
      // Orchestration category
      'orchestration': path.join(this.projectDocsPath, 'orchestration'),
      'orchestration/sprints': path.join(this.projectDocsPath, 'orchestration', 'sprints'),
      
      // Business Strategy category
      'business-strategy': path.join(this.projectDocsPath, 'business-strategy'),
      'business-strategy/existing-project': path.join(this.projectDocsPath, 'business-strategy', 'existing-project'),
      'business-strategy/research': path.join(this.projectDocsPath, 'business-strategy', 'research'),
      'business-strategy/marketing': path.join(this.projectDocsPath, 'business-strategy', 'marketing'),
      'business-strategy/finance': path.join(this.projectDocsPath, 'business-strategy', 'finance'),
      'business-strategy/market-validation': path.join(this.projectDocsPath, 'business-strategy', 'market-validation'),
      'business-strategy/customer-success': path.join(this.projectDocsPath, 'business-strategy', 'customer-success'),
      'business-strategy/monetization': path.join(this.projectDocsPath, 'business-strategy', 'monetization'),
      'business-strategy/analysis': path.join(this.projectDocsPath, 'business-strategy', 'analysis'),
      'business-strategy/investment': path.join(this.projectDocsPath, 'business-strategy', 'investment'),
      
      // Implementation category
      'implementation': path.join(this.projectDocsPath, 'implementation'),
      'implementation/requirements': path.join(this.projectDocsPath, 'implementation', 'requirements'),
      'implementation/security': path.join(this.projectDocsPath, 'implementation', 'security'),
      'implementation/llm-analysis': path.join(this.projectDocsPath, 'implementation', 'llm-analysis'),
      'implementation/api-analysis': path.join(this.projectDocsPath, 'implementation', 'api-analysis'),
      'implementation/mcp-analysis': path.join(this.projectDocsPath, 'implementation', 'mcp-analysis'),
      'implementation/project-planning': path.join(this.projectDocsPath, 'implementation', 'project-planning'),
      'implementation/environment': path.join(this.projectDocsPath, 'implementation', 'environment'),
      'implementation/design': path.join(this.projectDocsPath, 'implementation', 'design'),
      'implementation/implementation': path.join(this.projectDocsPath, 'implementation', 'implementation'),
      'implementation/testing': path.join(this.projectDocsPath, 'implementation', 'testing'),
      'implementation/documentation': path.join(this.projectDocsPath, 'implementation', 'documentation'),
      
      // Operations category
      'operations': path.join(this.projectDocsPath, 'operations'),
      'operations/deployment': path.join(this.projectDocsPath, 'operations', 'deployment'),
      'operations/launch': path.join(this.projectDocsPath, 'operations', 'launch'),
      'operations/analytics': path.join(this.projectDocsPath, 'operations', 'analytics'),
      'operations/monitoring': path.join(this.projectDocsPath, 'operations', 'monitoring'),
      'operations/optimization': path.join(this.projectDocsPath, 'operations', 'optimization'),
      'operations/seo': path.join(this.projectDocsPath, 'operations', 'seo'),
      'operations/crm-marketing': path.join(this.projectDocsPath, 'operations', 'crm-marketing'),
      'operations/media-buying': path.join(this.projectDocsPath, 'operations', 'media-buying'),
      'operations/social-media': path.join(this.projectDocsPath, 'operations', 'social-media'),
      
      // Legacy numbered folders (for backward compatibility during transition)
      'orchestration': path.join(this.projectDocsPath, 'orchestration'),
      '01-existing-project-analysis': path.join(this.projectDocsPath, 'business-strategy', 'existing-project'),
      '02-research': path.join(this.projectDocsPath, 'business-strategy', 'research'),
      '03-marketing': path.join(this.projectDocsPath, 'business-strategy', 'marketing'),
      '04-finance': path.join(this.projectDocsPath, 'business-strategy', 'finance'),
      '05-market-validation': path.join(this.projectDocsPath, 'business-strategy', 'market-validation'),
      '06-customer-success': path.join(this.projectDocsPath, 'business-strategy', 'customer-success'),
      '07-monetization': path.join(this.projectDocsPath, 'business-strategy', 'monetization'),
      '08-analysis': path.join(this.projectDocsPath, 'business-strategy', 'analysis'),
      '09-investment': path.join(this.projectDocsPath, 'business-strategy', 'investment'),
      '10-security': path.join(this.projectDocsPath, 'implementation', 'security'),
      '11-requirements': path.join(this.projectDocsPath, 'implementation', 'requirements'),
      '12-llm-analysis': path.join(this.projectDocsPath, 'implementation', 'llm-analysis'),
      '13-api-analysis': path.join(this.projectDocsPath, 'implementation', 'api-analysis'),
      '14-mcp-analysis': path.join(this.projectDocsPath, 'implementation', 'mcp-analysis'),
      '15-seo': path.join(this.projectDocsPath, 'operations', 'seo'),
      '16-tech-documentation': path.join(this.projectDocsPath, 'implementation', 'documentation'),
      '18-project-planning': path.join(this.projectDocsPath, 'implementation', 'project-planning'),
      '19-environment': path.join(this.projectDocsPath, 'implementation', 'environment'),
      '20-design': path.join(this.projectDocsPath, 'implementation', 'design'),
      '21-implementation': path.join(this.projectDocsPath, 'implementation', 'implementation'),
      '22-testing': path.join(this.projectDocsPath, 'implementation', 'testing'),
      '23-deployment': path.join(this.projectDocsPath, 'operations', 'deployment'),
      '24-launch': path.join(this.projectDocsPath, 'operations', 'launch'),
      '25-analytics': path.join(this.projectDocsPath, 'operations', 'analytics'),
      '26-optimization': path.join(this.projectDocsPath, 'operations', 'optimization'),
      '27-email-marketing': path.join(this.projectDocsPath, 'operations', 'crm-marketing'),
      '28-media-buying': path.join(this.projectDocsPath, 'operations', 'media-buying'),
      '29-social-media': path.join(this.projectDocsPath, 'operations', 'social-media')
    };

    // Forbidden patterns that should NEVER appear in paths
    this.FORBIDDEN_PATTERNS = [
      /phase/i,
      /parallel/i,
      /temp/i,
      /tmp/i,
      /wave/i,
      /coordination/i,
      /orchestrator-temp/i,
      /agent-temp/i,
      /sprint-temp/i
    ];

    // Valid folder name patterns (both category-based and legacy numbered)
    this.VALID_FOLDER_PATTERNS = [
      /^[a-z-]+$/, // Category folders: orchestration, business-strategy, etc.
      /^[a-z-]+\/[a-z-]+$/, // Subcategory folders: business-strategy/research
      /^\d{2}-[a-z-]+$/ // Legacy numbered folders: 02-research
    ];
  }

  /**
   * Initialize audit system
   */
  initializeAuditSystem() {
    this.auditEnabled = true;
    this.suspiciousPatterns = [];
    this.alertThreshold = 3; // Alert after 3 suspicious operations
  }

  /**
   * Validate GitHub markdown standards for document content
   */
  async validateGitHubMarkdown(content, agent = 'unknown') {
    const validation = {
      isValid: true,
      warnings: [],
      suggestions: [],
      agent: agent,
      timestamp: new Date().toISOString(),
      standards_applied: 'github_markdown_formatting_standards'
    };

    // Get agent category for appropriate formatting level
    const agentCategory = this.getAgentCategory(agent);
    
    // Basic Standards (ALL agents must follow)
    if (content.includes('\n- ') || content.includes('\n+ ')) {
      validation.warnings.push('UNORDERED_LISTS: Use * for unordered lists, not - or +');
      validation.isValid = false;
    }
    
    if (content.match(/^#[^#]/m)) {
      validation.warnings.push('HEADING_HIERARCHY: Reserve # for document title only, start sections with ##');
      validation.isValid = false;
    }
    
    // Check for code blocks without language specification
    const codeBlocksWithoutLang = content.match(/```\n(?!```)/g);
    if (codeBlocksWithoutLang) {
      validation.warnings.push('CODE_BLOCKS: Always specify language in code blocks: ```javascript, ```bash, etc.');
      validation.isValid = false;
    }
    
    // Check for non-descriptive links
    if (content.includes('[click here]') || content.includes('[here]')) {
      validation.warnings.push('LINK_TEXT: Use descriptive link text instead of "click here" or "here"');
      validation.isValid = false;
    }
    
    // Category-specific validations
    if (agentCategory === 'business' || agentCategory === 'growth') {
      // Check for financial data without proper table alignment
      if (content.includes('$') && content.includes('|') && !content.includes('|--------:|')) {
        validation.suggestions.push('NUMERIC_ALIGNMENT: Consider right-aligning numeric columns in tables');
      }
    }
    
    if (agentCategory === 'technical' || agentCategory === 'development') {
      // Check for API documentation without proper formatting
      if (content.includes('API') && !content.includes('```')) {
        validation.suggestions.push('TECHNICAL_FORMAT: Consider using code blocks for API examples');
      }
    }

    // Additional quality checks
    if (content.split('\n').length > 100 && !content.includes('<details>')) {
      validation.suggestions.push('LONG_DOCUMENT: Consider using collapsible sections <details> for lengthy content');
    }

    return validation;
  }

  /**
   * Get agent category for markdown formatting requirements
   */
  getAgentCategory(agent) {
    const developmentAgents = ['coder', 'testing', 'ui_ux', 'devops', 'prd'];
    const businessAgents = ['research', 'finance', 'analysis', 'marketing', 'business_documents'];
    const growthAgents = ['seo', 'ppc', 'social_media', 'email_marketing', 'revenue_optimization', 'analytics', 'customer_lifecycle'];
    const technicalAgents = ['api', 'llm', 'mcp', 'ml', 'data_engineer', 'security', 'dba'];
    
    const agentName = agent.toLowerCase().replace(/_agent$/, '');
    
    if (developmentAgents.includes(agentName)) return 'development';
    if (businessAgents.includes(agentName)) return 'business';
    if (growthAgents.includes(agentName)) return 'growth';
    if (technicalAgents.includes(agentName)) return 'technical';
    
    return 'support'; // Default category
  }

  /**
   * Pre-flight path validation - MANDATORY for all operations
   */
  async validatePath(targetPath, operation = 'unknown') {
    const validation = {
      isValid: false,
      path: targetPath,
      operation: operation,
      timestamp: new Date().toISOString(),
      errors: [],
      warnings: []
    };

    try {
      // 1. Check for forbidden patterns
      for (const pattern of this.FORBIDDEN_PATTERNS) {
        if (pattern.test(targetPath)) {
          validation.errors.push(`FORBIDDEN_PATTERN: Path contains prohibited pattern: ${pattern}`);
        }
      }

      // 2. Ensure path is within project-documents
      const normalizedPath = path.resolve(targetPath);
      const normalizedProjectDocs = path.resolve(this.projectDocsPath);
      
      if (!normalizedPath.startsWith(normalizedProjectDocs)) {
        validation.errors.push(`PATH_OUTSIDE_PROJECT: Path is outside project-documents: ${targetPath}`);
      }

      // 3. Extract folder name and validate
      const relativePath = path.relative(this.projectDocsPath, normalizedPath);
      const folderName = relativePath.split(path.sep)[0];
      
      if (!this.ALLOWED_FOLDERS[folderName]) {
        validation.errors.push(`INVALID_FOLDER: Folder "${folderName}" is not in allowed folders list`);
      }

      // 4. Check if target folder exists (NO CREATION ALLOWED)
      const folderPath = path.join(this.projectDocsPath, folderName);
      if (!fsSync.existsSync(folderPath)) {
        validation.errors.push(`FOLDER_NOT_EXISTS: Target folder does not exist: ${folderPath}`);
      }

      // 5. Validate folder name format
      const isValidFormat = this.VALID_FOLDER_PATTERNS.some(pattern => pattern.test(folderName));
      if (!isValidFormat) {
        validation.errors.push(`INVALID_FORMAT: Folder name does not match required format: ${folderName}`);
      }

      // 6. Sprint-specific validation
      if (this.isSprintRelatedPath(relativePath)) {
        const sprintValidation = this.validateSprintPath(relativePath);
        if (!sprintValidation.isValid) {
          validation.errors.push(...sprintValidation.errors);
          validation.warnings.push(...sprintValidation.warnings);
        }
      }

      validation.isValid = validation.errors.length === 0;
      
    } catch (error) {
      validation.errors.push(`VALIDATION_ERROR: ${error.message}`);
    }

    // Log validation result
    await this.auditLog('PATH_VALIDATION', {
      ...validation,
      agent: 'file-operation-manager'
    });

    return validation;
  }

  /**
   * Safe document write - ONLY method for writing files
   */
  async writeDocument(content, folderName, filename, agent = 'unknown') {
    const operation = {
      type: 'WRITE_DOCUMENT',
      agent: agent,
      timestamp: new Date().toISOString(),
      folderName: folderName,
      filename: filename,
      contentLength: content.length
    };

    try {
      // 1. Construct target path
      const targetPath = path.join(this.projectDocsPath, folderName, filename);
      
      // 2. Mandatory pre-flight validation
      const validation = await this.validatePath(targetPath, 'WRITE_DOCUMENT');
      
      if (!validation.isValid) {
        const error = new Error(`PATH_VALIDATION_FAILED: ${validation.errors.join(', ')}`);
        operation.result = 'REJECTED';
        operation.error = error.message;
        operation.validation = validation;
        
        await this.auditLog('WRITE_REJECTED', operation);
        throw error;
      }

      // 3. Validate GitHub markdown standards for .md files
      if (filename.endsWith('.md')) {
        const markdownValidation = await this.validateGitHubMarkdown(content, agent);
        operation.markdown_validation = markdownValidation;
        
        if (!markdownValidation.isValid) {
          console.warn(`⚠️  GitHub markdown validation failed for ${filename}:`, markdownValidation.warnings);
          // Log warnings but continue (non-blocking)
        }
      }

      // 4. Verify folder exists (should be caught by validation, but double-check)
      const folderPath = path.join(this.projectDocsPath, folderName);
      if (!fsSync.existsSync(folderPath)) {
        const error = new Error(`ABORT: Target folder does not exist: ${folderPath}`);
        operation.result = 'ABORTED';
        operation.error = error.message;
        
        await this.auditLog('WRITE_ABORTED', operation);
        throw error;
      }

      // 5. Perform the write operation
      await fs.writeFile(targetPath, content, 'utf8');
      
      operation.result = 'SUCCESS';
      operation.targetPath = targetPath;
      operation.validation = validation;
      
      await this.auditLog('WRITE_SUCCESS', operation);
      
      console.log(`✅ Document written: ${folderName}/${filename}`);
      return targetPath;

    } catch (error) {
      operation.result = 'ERROR';
      operation.error = error.message;
      
      await this.auditLog('WRITE_ERROR', operation);
      
      console.error(`❌ Write failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Safe document read
   */
  async readDocument(folderName, filename, agent = 'unknown') {
    const operation = {
      type: 'READ_DOCUMENT',
      agent: agent,
      timestamp: new Date().toISOString(),
      folderName: folderName,
      filename: filename
    };

    try {
      const targetPath = path.join(this.projectDocsPath, folderName, filename);
      
      // Validate path for read operations too
      const validation = await this.validatePath(targetPath, 'READ_DOCUMENT');
      
      if (!validation.isValid) {
        const error = new Error(`READ_VALIDATION_FAILED: ${validation.errors.join(', ')}`);
        operation.result = 'REJECTED';
        operation.error = error.message;
        
        await this.auditLog('READ_REJECTED', operation);
        throw error;
      }

      const content = await fs.readFile(targetPath, 'utf8');
      
      operation.result = 'SUCCESS';
      operation.targetPath = targetPath;
      operation.contentLength = content.length;
      
      await this.auditLog('READ_SUCCESS', operation);
      
      return content;

    } catch (error) {
      operation.result = 'ERROR';
      operation.error = error.message;
      
      await this.auditLog('READ_ERROR', operation);
      throw error;
    }
  }

  /**
   * DISABLED: Directory creation is NEVER allowed
   */
  async createDirectory() {
    const error = new Error('OPERATION_DISABLED: Directory creation is not allowed. Use only pre-existing folders.');
    
    await this.auditLog('CREATE_DIRECTORY_BLOCKED', {
      type: 'CREATE_DIRECTORY_BLOCKED',
      timestamp: new Date().toISOString(),
      error: error.message,
      agent: 'file-operation-manager'
    });
    
    throw error;
  }

  /**
   * List allowed folders
   */
  getAllowedFolders() {
    return Object.keys(this.ALLOWED_FOLDERS);
  }

  /**
   * Get full path for a folder name
   */
  getFolderPath(folderName) {
    if (!this.ALLOWED_FOLDERS[folderName]) {
      throw new Error(`INVALID_FOLDER: "${folderName}" is not an allowed folder`);
    }
    return this.ALLOWED_FOLDERS[folderName];
  }

  /**
   * Comprehensive audit logging
   */
  async auditLog(eventType, data) {
    if (!this.auditEnabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: eventType,
      ...data
    };

    // Add to in-memory log
    this.operationLog.push(logEntry);

    // Write to audit file
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.auditLogPath, logLine);
    } catch (error) {
      console.error('Audit logging failed:', error.message);
    }

    // Check for suspicious patterns
    this.detectSuspiciousActivity(logEntry);
  }

  /**
   * Detect suspicious activity patterns
   */
  detectSuspiciousActivity(logEntry) {
    // Pattern 1: Multiple path validation failures
    if (logEntry.eventType.includes('REJECTED') || logEntry.eventType.includes('ABORTED')) {
      this.suspiciousPatterns.push(logEntry);
      
      if (this.suspiciousPatterns.length >= this.alertThreshold) {
        this.raiseSecurityAlert('MULTIPLE_VALIDATION_FAILURES', this.suspiciousPatterns.slice(-this.alertThreshold));
      }
    }

    // Pattern 2: Attempts to access forbidden patterns
    if (logEntry.error && this.FORBIDDEN_PATTERNS.some(pattern => 
      pattern.test(logEntry.error) || pattern.test(logEntry.folderName || '') || pattern.test(logEntry.targetPath || ''))) {
      this.raiseSecurityAlert('FORBIDDEN_PATTERN_ATTEMPT', logEntry);
    }
  }

  /**
   * Raise security alerts
   */
  raiseSecurityAlert(alertType, data) {
    const alert = {
      timestamp: new Date().toISOString(),
      alertType: alertType,
      severity: 'HIGH',
      data: data
    };

    console.error(`🚨 SECURITY ALERT: ${alertType}`);
    console.error(`🚨 Details:`, JSON.stringify(alert, null, 2));

    // Log alert
    this.auditLog('SECURITY_ALERT', alert);
  }

  /**
   * Get operation statistics
   */
  getOperationStats() {
    const stats = {
      total: this.operationLog.length,
      successful: this.operationLog.filter(op => op.result === 'SUCCESS').length,
      rejected: this.operationLog.filter(op => op.result === 'REJECTED').length,
      errors: this.operationLog.filter(op => op.result === 'ERROR').length,
      alerts: this.operationLog.filter(op => op.eventType === 'SECURITY_ALERT').length
    };

    stats.successRate = stats.total > 0 ? (stats.successful / stats.total * 100).toFixed(2) + '%' : '0%';
    
    return stats;
  }

  /**
   * Emergency system scan for unauthorized folders
   */
  async scanForUnauthorizedFolders() {
    const results = {
      timestamp: new Date().toISOString(),
      unauthorizedFolders: [],
      totalFolders: 0,
      compliantFolders: 0
    };

    try {
      const entries = await fs.readdir(this.projectDocsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          results.totalFolders++;
          
          if (!this.ALLOWED_FOLDERS[entry.name]) {
            results.unauthorizedFolders.push({
              name: entry.name,
              path: path.join(this.projectDocsPath, entry.name),
              matchesForbiddenPattern: this.FORBIDDEN_PATTERNS.some(pattern => pattern.test(entry.name))
            });
          } else {
            results.compliantFolders++;
          }
        }
      }
      
      await this.auditLog('FOLDER_SCAN', results);
      
    } catch (error) {
      results.error = error.message;
      await this.auditLog('FOLDER_SCAN_ERROR', results);
    }

    return results;
  }

  /**
   * Check if a path is sprint-related
   */
  isSprintRelatedPath(relativePath) {
    const sprintKeywords = [
      'sprint',
      'retrospective',
      'review',
      'standup',
      'planning',
      'velocity',
      'burndown',
      'backlog'
    ];
    
    const pathLower = relativePath.toLowerCase();
    return sprintKeywords.some(keyword => pathLower.includes(keyword));
  }

  /**
   * Validate sprint-specific paths
   */
  validateSprintPath(relativePath) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const pathParts = relativePath.split(path.sep);
    
    // Check if path is in orchestration folder
    if (pathParts[0] !== 'orchestration') {
      // Sprint documents can only be in orchestration folder
      if (this.isSprintRelatedPath(relativePath)) {
        validation.warnings.push(`SPRINT_LOCATION_WARNING: Sprint-related documents should be in orchestration folder`);
      }
      return validation;
    }

    // Sprint documents must be within sprints folder structure
    const sprintFolderPatterns = [
      /^orchestration\/sprints\/sprint-\d{4}-\d{2}-\d{2}-[\w-]+\//,  // Inside sprint folder
      /^orchestration\/sprints\/_templates\//,                        // Templates folder
      /^orchestration\/sprints\/sprint-dependencies\.md$/,            // Dependencies file
      /^orchestration\/sprints\/README\.md$/,                        // Sprints README
      /^orchestration\/product-backlog\//,                           // Backlog folder (new)
      /^orchestration\/project-progress\.json$/,                     // Progress tracking
      /^orchestration\/sprint-audit-report\.md$/                     // Audit reports
    ];

    // Check against allowed patterns
    const isAllowedPath = sprintFolderPatterns.some(pattern => pattern.test(relativePath));
    
    // Special check for common mistakes
    const forbiddenSprintPaths = [
      /^orchestration\/sprint-retrospectives/,
      /^orchestration\/sprint-reviews/,
      /^orchestration\/sprint-planning/,
      /^orchestration\/daily-standups/,
      /^orchestration\/sprint-\w+/  // Any sprint-* folder outside sprints/
    ];
    
    const isForbiddenPath = forbiddenSprintPaths.some(pattern => pattern.test(relativePath));
    
    if (isForbiddenPath) {
      validation.isValid = false;
      validation.errors.push(
        `SPRINT_FOLDER_ERROR: Sprint documents must be inside orchestration/sprints/sprint-YYYY-MM-DD-name/ folders. ` +
        `Found attempt to create in: ${relativePath}`
      );
    } else if (pathParts.includes('sprints') && !isAllowedPath && this.isSprintRelatedPath(relativePath)) {
      validation.warnings.push(
        `SPRINT_STRUCTURE_WARNING: Unusual sprint document location. ` +
        `Ensure this follows the standard sprint folder structure.`
      );
    }

    return validation;
  }
}

// Export for use by other modules
module.exports = FileOperationManager;

// Utility functions for backward compatibility
module.exports.writeDocumentSafely = async (content, folderName, filename, agent = 'unknown') => {
  const manager = new FileOperationManager();
  return await manager.writeDocument(content, folderName, filename, agent);
};

module.exports.validatePathSafely = async (targetPath, operation = 'unknown') => {
  const manager = new FileOperationManager();
  return await manager.validatePath(targetPath, operation);
};

module.exports.scanForViolations = async () => {
  const manager = new FileOperationManager();
  return await manager.scanForUnauthorizedFolders();
};

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new FileOperationManager();
  
  (async () => {
    try {
      switch (command) {
        case 'scan':
          console.log('🔍 Scanning for unauthorized folders...\n');
          const scanResults = await manager.scanForUnauthorizedFolders();
          console.log('Scan Results:', JSON.stringify(scanResults, null, 2));
          break;
          
        case 'stats':
          const stats = manager.getOperationStats();
          console.log('Operation Statistics:', JSON.stringify(stats, null, 2));
          break;
          
        case 'validate':
          if (args.length < 2) {
            console.error('Usage: validate <path>');
            process.exit(1);
          }
          const validation = await manager.validatePath(args[1], 'CLI_VALIDATION');
          console.log('Validation Result:', JSON.stringify(validation, null, 2));
          break;
          
        case 'folders':
          const folders = manager.getAllowedFolders();
          console.log('Allowed Folders:', folders);
          break;
          
        default:
          console.log('Usage: node file-operation-manager.js <command>');
          console.log('Commands:');
          console.log('  scan      - Scan for unauthorized folders');
          console.log('  stats     - Show operation statistics');
          console.log('  validate  - Validate a path');
          console.log('  folders   - List allowed folders');
          break;
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}