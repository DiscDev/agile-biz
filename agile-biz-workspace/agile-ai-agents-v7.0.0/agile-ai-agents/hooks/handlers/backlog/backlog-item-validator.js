/**
 * Backlog Item Context Validator Hook
 * 
 * Validates new backlog items against project context to prevent drift
 */

const fs = require('fs-extra');
const path = require('path');
const verificationEngine = require('../../../machine-data/context-verification/verification-engine');

class BacklogItemValidatorHook {
  constructor() {
    this.name = 'backlog-item-validator';
    this.description = 'Validates backlog items against project context';
    this.category = 'backlog';
    this.events = ['backlog.item.created', 'backlog.item.updated'];
    this.enabled = true;
    this.config = {
      autoBlock: true,           // Automatically block high-confidence violations
      warningThreshold: 60,      // Confidence threshold for warnings
      reviewThreshold: 80,       // Confidence threshold for review
      blockThreshold: 95,        // Confidence threshold for blocking
      notifyOnViolation: true,   // Notify PM when violations detected
      batchValidation: true      // Support bulk validation
    };
  }

  /**
   * Initialize the hook
   */
  async initialize() {
    // Initialize verification engine
    const result = await verificationEngine.initialize();
    if (!result.success) {
      console.warn(`[${this.name}] Failed to initialize verification engine: ${result.message}`);
      this.enabled = false;
    }
  }

  /**
   * Handle hook events
   */
  async handle(event, data) {
    if (!this.enabled) {
      return { success: true, skipped: true };
    }

    try {
      // Check if we have a project truth document
      if (!verificationEngine.currentTruth) {
        return {
          success: true,
          warning: 'No project truth document found. Backlog validation skipped.',
          recommendation: 'Create project truth with /verify-context --create-truth'
        };
      }

      // Handle different event types
      if (event === 'backlog.item.created') {
        return await this.handleItemCreated(data);
      } else if (event === 'backlog.item.updated') {
        return await this.handleItemUpdated(data);
      }

      return { success: true };

    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle new backlog item creation
   */
  async handleItemCreated(data) {
    const item = data.item || data;
    
    console.log(`\n🎯 Validating new backlog item: ${item.title}`);
    
    // Verify the item
    const verification = await verificationEngine.verifyItem({
      title: item.title,
      description: item.description,
      acceptanceCriteria: item.acceptanceCriteria
    }, 'backlog');

    // Handle verification results
    if (verification.status === 'blocked' && this.config.autoBlock) {
      // Block the item
      await this.blockItem(item, verification);
      
      return {
        success: false,
        blocked: true,
        itemId: item.id,
        message: `Backlog item blocked: ${verification.message}`,
        confidence: verification.confidence,
        recommendation: verification.recommendation
      };
    }

    if (verification.status === 'review') {
      // Flag for review
      await this.flagForReview(item, verification);
      
      return {
        success: true,
        reviewRequired: true,
        itemId: item.id,
        message: `Backlog item needs review: ${verification.message}`,
        confidence: verification.confidence,
        recommendation: verification.recommendation
      };
    }

    if (verification.status === 'warning') {
      // Add warning but allow
      await this.addWarning(item, verification);
      
      return {
        success: true,
        warning: true,
        itemId: item.id,
        message: `Backlog item has warning: ${verification.message}`,
        confidence: verification.confidence
      };
    }

    // Item is aligned
    console.log('✅ Backlog item aligns with project context');
    
    return {
      success: true,
      itemId: item.id,
      aligned: true
    };
  }

  /**
   * Handle backlog item update
   */
  async handleItemUpdated(data) {
    const item = data.item || data;
    const changes = data.changes || {};
    
    // Only validate if key fields changed
    if (!changes.title && !changes.description && !changes.acceptanceCriteria) {
      return { success: true, skipped: true };
    }
    
    console.log(`\n🔄 Re-validating updated backlog item: ${item.title}`);
    
    // Verify the updated item
    const verification = await verificationEngine.verifyItem({
      title: item.title,
      description: item.description,
      acceptanceCriteria: item.acceptanceCriteria
    }, 'backlog');

    // Handle similar to creation
    return await this.handleVerificationResult(item, verification);
  }

  /**
   * Block a backlog item
   */
  async blockItem(item, verification) {
    // Update backlog state
    const backlogPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration', 'product-backlog',
      'backlog-state.json'
    );

    if (await fs.pathExists(backlogPath)) {
      const backlog = await fs.readJSON(backlogPath);
      
      // Find and update item
      const backlogItem = backlog.items.find(i => i.id === item.id);
      if (backlogItem) {
        backlogItem.status = 'blocked';
        backlogItem.blockedReason = verification.message;
        backlogItem.contextVerification = {
          status: 'blocked',
          confidence: verification.confidence,
          verifiedAt: new Date().toISOString()
        };
        
        await fs.writeJSON(backlogPath, backlog, { spaces: 2 });
      }
    }

    // Create blocking report
    await this.createBlockingReport(item, verification);
    
    // Notify if configured
    if (this.config.notifyOnViolation) {
      await this.notifyProjectManager(item, verification, 'blocked');
    }
  }

  /**
   * Flag item for review
   */
  async flagForReview(item, verification) {
    // Add review flag to backlog state
    const backlogPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration', 'product-backlog',
      'backlog-state.json'
    );

    if (await fs.pathExists(backlogPath)) {
      const backlog = await fs.readJSON(backlogPath);
      
      const backlogItem = backlog.items.find(i => i.id === item.id);
      if (backlogItem) {
        backlogItem.needsReview = true;
        backlogItem.reviewReason = verification.message;
        backlogItem.contextVerification = {
          status: 'review',
          confidence: verification.confidence,
          verifiedAt: new Date().toISOString()
        };
        
        await fs.writeJSON(backlogPath, backlog, { spaces: 2 });
      }
    }

    // Notify if configured
    if (this.config.notifyOnViolation) {
      await this.notifyProjectManager(item, verification, 'review');
    }
  }

  /**
   * Add warning to item
   */
  async addWarning(item, verification) {
    // Add warning to backlog state
    const backlogPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration', 'product-backlog',
      'backlog-state.json'
    );

    if (await fs.pathExists(backlogPath)) {
      const backlog = await fs.readJSON(backlogPath);
      
      const backlogItem = backlog.items.find(i => i.id === item.id);
      if (backlogItem) {
        backlogItem.warnings = backlogItem.warnings || [];
        backlogItem.warnings.push({
          message: verification.message,
          confidence: verification.confidence,
          timestamp: new Date().toISOString()
        });
        
        backlogItem.contextVerification = {
          status: 'warning',
          confidence: verification.confidence,
          verifiedAt: new Date().toISOString()
        };
        
        await fs.writeJSON(backlogPath, backlog, { spaces: 2 });
      }
    }
  }

  /**
   * Create blocking report
   */
  async createBlockingReport(item, verification) {
    const reportPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration', 'context-violations',
      `violation-${item.id}-${Date.now()}.md`
    );

    let report = `# Context Violation Report\n\n`;
    report += `## Backlog Item Blocked\n\n`;
    report += `- **Item ID**: ${item.id}\n`;
    report += `- **Title**: ${item.title}\n`;
    report += `- **Created**: ${new Date().toISOString()}\n`;
    report += `- **Confidence**: ${verification.confidence}%\n\n`;
    
    report += `## Violation Details\n\n`;
    report += `${verification.message}\n\n`;
    
    report += `## Recommendation\n\n`;
    report += `${verification.recommendation}\n\n`;
    
    report += `## Context Analysis\n\n`;
    if (verification.details) {
      report += `- Domain Alignment: ${verification.details.domainAlignment}%\n`;
      report += `- User Alignment: ${verification.details.userAlignment}%\n`;
      report += `- Competitor Feature: ${verification.details.competitorFeature}%\n`;
      report += `- Historical Pattern: ${verification.details.historicalPattern}%\n\n`;
    }

    report += `## Item Content\n\n`;
    report += `### Title\n${item.title}\n\n`;
    report += `### Description\n${item.description || 'No description provided'}\n\n`;
    report += `### Acceptance Criteria\n${item.acceptanceCriteria || 'No criteria provided'}\n\n`;

    report += `## Next Steps\n\n`;
    report += `1. Review this violation with the Project Manager\n`;
    report += `2. Either revise the item to align with project context\n`;
    report += `3. Or update Project Truth if scope has legitimately changed\n`;
    report += `4. Re-submit after resolution\n`;

    // Create directory if needed
    await fs.ensureDir(path.dirname(reportPath));
    
    // Write report
    await fs.writeFile(reportPath, report, 'utf8');
  }

  /**
   * Notify project manager
   */
  async notifyProjectManager(item, verification, severity) {
    const escalationPath = path.join(
      __dirname, '..', '..', '..',
      'project-documents', 'orchestration',
      'stakeholder-escalations.md'
    );
    
    let escalation = await fs.readFile(escalationPath, 'utf8').catch(() => '# Stakeholder Escalations\n\n');
    
    escalation += `## Backlog Context ${severity === 'blocked' ? 'Violation' : 'Review'} - ${new Date().toISOString()}\n\n`;
    escalation += `- **Item**: ${item.title} (${item.id})\n`;
    escalation += `- **Severity**: ${severity}\n`;
    escalation += `- **Confidence**: ${verification.confidence}%\n`;
    escalation += `- **Issue**: ${verification.message}\n`;
    escalation += `- **Action Required**: ${verification.recommendation}\n\n`;
    
    await fs.writeFile(escalationPath, escalation, 'utf8');
    
    console.log(`\n🔔 Project Manager notified of ${severity} backlog item`);
  }

  /**
   * Handle verification result
   */
  async handleVerificationResult(item, verification) {
    switch (verification.status) {
      case 'blocked':
        if (this.config.autoBlock) {
          await this.blockItem(item, verification);
          return {
            success: false,
            blocked: true,
            itemId: item.id,
            message: `Backlog item blocked: ${verification.message}`,
            confidence: verification.confidence,
            recommendation: verification.recommendation
          };
        }
        break;
        
      case 'review':
        await this.flagForReview(item, verification);
        return {
          success: true,
          reviewRequired: true,
          itemId: item.id,
          message: `Backlog item needs review: ${verification.message}`,
          confidence: verification.confidence,
          recommendation: verification.recommendation
        };
        
      case 'warning':
        await this.addWarning(item, verification);
        return {
          success: true,
          warning: true,
          itemId: item.id,
          message: `Backlog item has warning: ${verification.message}`,
          confidence: verification.confidence
        };
        
      default:
        return {
          success: true,
          itemId: item.id,
          aligned: true
        };
    }
  }

  /**
   * Batch validate multiple items
   */
  async validateBatch(items) {
    if (!this.enabled || !this.config.batchValidation) {
      return { success: true, skipped: true };
    }

    const results = {
      total: items.length,
      aligned: 0,
      warnings: 0,
      reviews: 0,
      blocked: 0,
      items: []
    };

    for (const item of items) {
      const verification = await verificationEngine.verifyItem({
        title: item.title,
        description: item.description,
        acceptanceCriteria: item.acceptanceCriteria
      }, 'backlog');

      switch (verification.status) {
        case 'allowed':
          results.aligned++;
          break;
        case 'warning':
          results.warnings++;
          break;
        case 'review':
          results.reviews++;
          break;
        case 'blocked':
          results.blocked++;
          break;
      }

      results.items.push({
        id: item.id,
        title: item.title,
        ...verification
      });
    }

    return {
      success: true,
      results
    };
  }

  /**
   * Get hook configuration
   */
  getConfig() {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      events: this.events,
      enabled: this.enabled,
      config: this.config
    };
  }

  /**
   * Update hook configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

module.exports = new BacklogItemValidatorHook();