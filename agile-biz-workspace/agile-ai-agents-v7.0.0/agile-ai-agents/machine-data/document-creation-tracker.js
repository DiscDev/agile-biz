/**
 * Document Creation Tracker
 * Manages document creation timing and prevents overload
 */

const fs = require('fs');
const path = require('path');
const FolderStructureValidator = require('./folder-structure-validator');
const FileOperationManager = require('./file-operation-manager');

class DocumentCreationTracker {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.rulesPath = path.join(projectRoot, 'machine-data', 'document-creation-rules.json');
    this.trackingPath = path.join(projectRoot, 'machine-data', 'document-creation-tracking.json');
    this.folderValidator = new FolderStructureValidator(projectRoot);
    this.fileManager = new FileOperationManager(projectRoot);
    this.loadRules();
    this.loadTracking();
  }

  /**
   * Load document creation rules
   */
  loadRules() {
    if (fs.existsSync(this.rulesPath)) {
      this.rules = JSON.parse(fs.readFileSync(this.rulesPath, 'utf8'));
    } else {
      throw new Error('Document creation rules not found');
    }
  }

  /**
   * Load or initialize tracking data
   */
  loadTracking() {
    if (fs.existsSync(this.trackingPath)) {
      this.tracking = JSON.parse(fs.readFileSync(this.trackingPath, 'utf8'));
    } else {
      this.initializeTracking();
    }
  }

  /**
   * Initialize tracking structure
   */
  initializeTracking() {
    this.tracking = {
      created_documents: {},
      pending_documents: [],
      project_context: {},
      current_phase: null,
      statistics: {
        total_created: 0,
        by_priority: {
          critical: 0,
          important: 0,
          helpful: 0,
          optional: 0
        },
        by_agent: {}
      },
      last_updated: new Date().toISOString()
    };
    this.saveTracking();
  }

  /**
   * Update project context
   */
  updateContext(context) {
    this.tracking.project_context = {
      ...this.tracking.project_context,
      ...context,
      updated_at: new Date().toISOString()
    };
    
    // If research level is set, load appropriate document set
    if (context.research_level || context.researchLevel) {
      this.loadResearchLevelDocuments(context.research_level || context.researchLevel);
    }
    
    this.saveTracking();
  }
  
  /**
   * Load documents based on research level
   */
  async loadResearchLevelDocuments(researchLevel) {
    try {
      const WorkflowDocumentManager = require('./workflow-document-manager');
      const workflowManager = new WorkflowDocumentManager(this.projectRoot);
      await workflowManager.loadConfigurations();
      
      // Determine workflow type
      const workflowType = this.tracking.project_context.existing_project ? 
        'existing-project' : 'new-project';
      
      // Generate document queue for the research level
      const documentQueue = workflowManager.generateDocumentQueue(
        workflowType, 
        researchLevel, 
        this.tracking.project_context
      );
      
      // Store the research level configuration
      this.tracking.research_configuration = {
        level: researchLevel,
        workflow: workflowType,
        totalDocuments: Object.values(documentQueue).flat().length,
        documentQueue: documentQueue
      };
      
      console.log(`📚 Loaded ${this.tracking.research_configuration.totalDocuments} documents for ${researchLevel} research level`);
      
      // SAVE the tracking after loading configuration
      this.saveTracking();
      
    } catch (error) {
      console.error('Error loading research level documents:', error);
    }
  }

  /**
   * Process a trigger event
   */
  async processTrigger(triggerName, metadata = {}) {
    console.log(`Processing trigger: ${triggerName}`);
    
    // If research configuration exists and phase matches, use it
    if (this.tracking.research_configuration && this.shouldUseResearchConfig(triggerName)) {
      return await this.processResearchLevelTrigger(triggerName, metadata);
    }
    
    // Otherwise, use traditional rule-based approach
    const phasesToProcess = [];
    
    Object.entries(this.rules.phases).forEach(([phaseKey, phase]) => {
      if (phase.trigger === triggerName) {
        phasesToProcess.push({ key: phaseKey, phase });
      }
    });

    // Process each matching phase
    phasesToProcess.forEach(({ key, phase }) => {
      this.processPhase(key, phase, metadata);
    });

    // Check for conditional triggers
    this.checkConditionalDocuments(triggerName, metadata);
    
    this.saveTracking();
    return this.getPendingDocuments();
  }
  
  /**
   * Check if we should use research configuration for this trigger
   */
  shouldUseResearchConfig(triggerName) {
    const researchTriggers = [
      'initialization_complete',
      'stakeholder_approval', 
      'planning_approved',
      'development_complete',
      'deployment_complete'
    ];
    return researchTriggers.includes(triggerName);
  }
  
  /**
   * Process trigger using research level configuration
   */
  async processResearchLevelTrigger(triggerName, metadata) {
    console.log(`📚 Processing ${triggerName} using ${this.tracking.research_configuration.level} research level`);
    
    const phaseMapping = {
      'initialization_complete': 'phase_1_discovery',
      'stakeholder_approval': 'phase_2_planning',
      'planning_approved': 'phase_3_requirements',
      'development_complete': 'phase_6_growth',
      'deployment_complete': 'phase_6_growth'
    };
    
    const phase = phaseMapping[triggerName];
    if (!phase || !this.tracking.research_configuration.documentQueue[phase]) {
      console.log(`No documents configured for trigger: ${triggerName}`);
      return this.getPendingDocuments();
    }
    
    // Queue all documents for this phase
    const phaseDocuments = this.tracking.research_configuration.documentQueue[phase];
    console.log(`Queueing ${phaseDocuments.length} documents for ${phase}`);
    
    // Use Promise.all to wait for all documents to be queued
    await Promise.all(phaseDocuments.map(doc => 
      this.queueDocument({
        path: doc.path,
        agent: doc.agent,
        priority: doc.priority
      }, `Research Level: ${this.tracking.research_configuration.level} - ${phase}`)
    ));
    
    this.saveTracking();
    return this.getPendingDocuments();
  }

  /**
   * Process a phase and queue its documents
   */
  processPhase(phaseKey, phase, metadata) {
    console.log(`Processing phase: ${phase.name}`);
    this.tracking.current_phase = phaseKey;

    // Handle branching logic
    if (phase.branches) {
      Object.entries(phase.branches).forEach(([branchKey, branch]) => {
        if (this.evaluateCondition(branch.condition, metadata)) {
          branch.documents.forEach(doc => {
            this.queueDocument(doc, phase.name);
          });
        }
      });
    }

    // Handle regular documents
    if (phase.documents) {
      phase.documents.forEach(doc => {
        if (doc.required === 'always' || this.evaluateCondition(doc.condition, metadata)) {
          this.queueDocument(doc, phase.name);
        }
      });
    }

    // Handle conditional documents
    if (phase.conditional_documents) {
      phase.conditional_documents.forEach(doc => {
        if (this.evaluateCondition(doc.condition, metadata)) {
          this.queueDocument(doc, phase.name);
        }
      });
    }
  }

  /**
   * Check for conditional documents based on context
   */
  checkConditionalDocuments(trigger, metadata) {
    const context = { ...this.tracking.project_context, ...metadata };

    // Industry-specific documents
    if (context.industry && this.rules.document_categories.industry_specific[context.industry]) {
      const industryDocs = this.rules.document_categories.industry_specific[context.industry];
      industryDocs.forEach(docPath => {
        this.queueDocument({
          path: docPath,
          agent: this.determineAgent(docPath),
          priority: 'important'
        }, 'Industry Specific');
      });
    }

    // Project type specific documents
    if (context.project_type && this.rules.document_categories.project_type_specific[context.project_type]) {
      const typeDocs = this.rules.document_categories.project_type_specific[context.project_type];
      typeDocs.forEach(docPath => {
        this.queueDocument({
          path: docPath,
          agent: this.determineAgent(docPath),
          priority: 'helpful'
        }, 'Project Type Specific');
      });
    }

    // Scale-based documents
    if (context.expected_users) {
      const scale = this.determineScale(context.expected_users);
      if (scale && this.rules.document_categories.scale_based[scale]) {
        const scaleDocs = this.rules.document_categories.scale_based[scale].documents;
        scaleDocs.forEach(docPath => {
          this.queueDocument({
            path: docPath,
            agent: this.determineAgent(docPath),
            priority: 'helpful'
          }, 'Scale Based');
        });
      }
    }
  }

  /**
   * Queue a document for creation (with FileOperationManager validation)
   */
  async queueDocument(doc, source) {
    try {
      // Extract folder name and filename from path
      const pathParts = doc.path.split('/');
      const folderName = pathParts[0];
      const filename = pathParts.slice(1).join('/');
      
      // Use FileOperationManager for validation - NO directory creation allowed
      const fullTargetPath = path.join(this.projectRoot, 'project-documents', doc.path);
      const validation = await this.fileManager.validatePath(fullTargetPath, 'QUEUE_DOCUMENT');
      
      if (!validation.isValid) {
        const errorMsg = `FILE_OPERATION_REJECTED: ${validation.errors.join(', ')}`;
        console.error(`❌ CRITICAL: ${errorMsg}`);
        console.error(`❌ Document rejected: ${doc.path}`);
        
        // Log the violation for audit
        this.logStructureViolation(doc, errorMsg, source);
        
        // Don't queue the document - it violates structure rules
        return;
      }
      
      const fullPath = `project-documents/${doc.path}`;
      
      // Check if already created
      if (this.tracking.created_documents[fullPath]) {
        console.log(`Document already exists: ${doc.path}`);
        return;
      }

      // Check if already queued
      const alreadyQueued = this.tracking.pending_documents.some(
        pending => pending.path === fullPath
      );
      
      if (!alreadyQueued) {
        this.tracking.pending_documents.push({
          path: fullPath,
          folderName: folderName,
          filename: filename,
          agent: doc.agent,
          priority: doc.priority || 'helpful',
          source: source,
          queued_at: new Date().toISOString(),
          validated: true,
          validation: validation
        });
        console.log(`📋 Queued document: ${doc.path} (${doc.priority})`);
      }
      
    } catch (error) {
      console.error(`❌ CRITICAL: ${error.message}`);
      console.error(`❌ Document rejected: ${doc.path}`);
      
      // Log the violation for audit
      this.logStructureViolation(doc, error.message, source);
      
      // Don't queue the document - it violates structure rules
      return;
    }
  }
  
  /**
   * Log structure violations for audit trail
   */
  logStructureViolation(doc, errorMessage, source) {
    if (!this.tracking.structure_violations) {
      this.tracking.structure_violations = [];
    }
    
    this.tracking.structure_violations.push({
      timestamp: new Date().toISOString(),
      document_path: doc.path,
      agent: doc.agent,
      error: errorMessage,
      source: source,
      phase: this.tracking.current_phase
    });
    
    this.saveTracking();
  }

  /**
   * Create a document using FileOperationManager (SECURE)
   */
  async createDocumentSecurely(content, folderName, filename, agent = 'unknown') {
    try {
      // Use FileOperationManager for secure document creation
      const targetPath = await this.fileManager.writeDocument(content, folderName, filename, agent);
      
      // Mark as created in tracking
      const fullPath = `project-documents/${folderName}/${filename}`;
      this.markDocumentCreated(fullPath, agent);
      
      return targetPath;
      
    } catch (error) {
      console.error(`❌ Secure document creation failed: ${error.message}`);
      
      // Log failed creation attempt
      this.logStructureViolation({
        path: `${folderName}/${filename}`,
        agent: agent
      }, error.message, 'SECURE_CREATION');
      
      throw error;
    }
  }

  /**
   * Mark a document as created
   */
  markDocumentCreated(documentPath, agent) {
    if (this.tracking.created_documents[documentPath]) {
      return; // Already marked
    }

    this.tracking.created_documents[documentPath] = {
      created_at: new Date().toISOString(),
      created_by: agent,
      phase: this.tracking.current_phase
    };

    // Update statistics
    this.tracking.statistics.total_created++;
    
    // Remove from pending
    this.tracking.pending_documents = this.tracking.pending_documents.filter(
      doc => doc.path !== documentPath
    );

    // Update agent statistics
    if (!this.tracking.statistics.by_agent[agent]) {
      this.tracking.statistics.by_agent[agent] = 0;
    }
    this.tracking.statistics.by_agent[agent]++;

    this.saveTracking();
    console.log(`Document created: ${documentPath} by ${agent}`);
  }

  /**
   * Get pending documents by priority
   */
  getPendingDocuments(priority = null) {
    let pending = [...this.tracking.pending_documents];
    
    if (priority) {
      pending = pending.filter(doc => doc.priority === priority);
    }

    // Sort by priority
    const priorityOrder = ['critical', 'important', 'helpful', 'optional'];
    pending.sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    });

    return pending;
  }

  /**
   * Get next document for an agent
   */
  getNextDocumentForAgent(agentName) {
    const agentDocs = this.tracking.pending_documents.filter(
      doc => doc.agent === agentName
    );

    if (agentDocs.length === 0) return null;

    // Return highest priority document
    const priorityOrder = ['critical', 'important', 'helpful', 'optional'];
    agentDocs.sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    });

    return agentDocs[0];
  }

  /**
   * Evaluate a condition
   */
  evaluateCondition(condition, metadata = {}) {
    if (!condition) return true;
    
    const context = { ...this.tracking.project_context, ...metadata };

    if (typeof condition === 'string') {
      return context[condition] === true;
    }

    if (condition.OR) {
      return condition.OR.some(subCondition => 
        this.evaluateSubCondition(subCondition, context)
      );
    }

    if (condition.AND) {
      return condition.AND.every(subCondition => 
        this.evaluateSubCondition(subCondition, context)
      );
    }

    return this.evaluateSubCondition(condition, context);
  }

  /**
   * Evaluate a sub-condition
   */
  evaluateSubCondition(condition, context) {
    for (const [key, value] of Object.entries(condition)) {
      if (Array.isArray(value)) {
        if (!value.includes(context[key])) return false;
      } else if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine agent from document path
   */
  determineAgent(docPath) {
    const pathParts = docPath.split('/');
    const folder = pathParts[0];
    
    const agentMapping = {
      'research': 'research',
      'marketing': 'marketing',
      'finance': 'finance',
      'security': 'security',
      'requirements': 'prd',
      'design': 'ui_ux',
      'testing': 'testing',
      'deployment': 'devops',
      'analytics': 'analytics_growth_intelligence',
      'customer-success': 'customer_lifecycle',
      'monetization': 'revenue_optimization'
    };

    for (const [key, agent] of Object.entries(agentMapping)) {
      if (folder.includes(key)) return agent;
    }

    return 'document_manager';
  }

  /**
   * Determine scale from user count
   */
  determineScale(userCount) {
    if (userCount <= 1000) return 'small';
    if (userCount <= 10000) return 'medium';
    if (userCount <= 100000) return 'large';
    return 'enterprise';
  }

  /**
   * Get creation statistics
   */
  getStatistics() {
    const stats = { ...this.tracking.statistics };
    stats.pending_count = this.tracking.pending_documents.length;
    stats.completion_percentage = 
      (stats.total_created / (stats.total_created + stats.pending_count)) * 100;
    
    // Priority breakdown of pending
    stats.pending_by_priority = {
      critical: 0,
      important: 0,
      helpful: 0,
      optional: 0
    };
    
    this.tracking.pending_documents.forEach(doc => {
      stats.pending_by_priority[doc.priority]++;
    });

    return stats;
  }

  /**
   * Save tracking data
   */
  saveTracking() {
    this.tracking.last_updated = new Date().toISOString();
    fs.writeFileSync(this.trackingPath, JSON.stringify(this.tracking, null, 2));
  }

  /**
   * Generate status report
   */
  generateStatusReport() {
    const stats = this.getStatistics();
    const report = {
      current_phase: this.tracking.current_phase,
      project_context: this.tracking.project_context,
      statistics: stats,
      critical_pending: this.getPendingDocuments('critical'),
      recent_creations: Object.entries(this.tracking.created_documents)
        .sort((a, b) => new Date(b[1].created_at) - new Date(a[1].created_at))
        .slice(0, 10)
        .map(([path, info]) => ({ path, ...info }))
    };
    
    return report;
  }
}

module.exports = DocumentCreationTracker;

// Export secure document creation for use by other modules
module.exports.createDocumentSecurely = async (content, folderName, filename, agent = 'unknown') => {
  const tracker = new DocumentCreationTracker(path.join(__dirname, '..'));
  return await tracker.createDocumentSecurely(content, folderName, filename, agent);
};

// CLI interface
if (require.main === module) {
  const tracker = new DocumentCreationTracker(path.join(__dirname, '..'));
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'trigger':
      const triggerName = args[0];
      const metadata = args[1] ? JSON.parse(args[1]) : {};
      const pending = tracker.processTrigger(triggerName, metadata);
      console.log(`\nPending documents: ${pending.length}`);
      pending.slice(0, 5).forEach(doc => {
        console.log(`  - ${doc.path} (${doc.priority}) -> ${doc.agent}`);
      });
      break;

    case 'context':
      const context = JSON.parse(args[0]);
      tracker.updateContext(context);
      console.log('Context updated');
      break;

    case 'created':
      const docPath = args[0];
      const agent = args[1];
      tracker.markDocumentCreated(docPath, agent);
      break;

    case 'next':
      const agentName = args[0];
      const next = tracker.getNextDocumentForAgent(agentName);
      if (next) {
        console.log(`Next document for ${agentName}: ${next.path} (${next.priority})`);
      } else {
        console.log(`No pending documents for ${agentName}`);
      }
      break;

    case 'status':
      const report = tracker.generateStatusReport();
      console.log('Document Creation Status');
      console.log('=======================');
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'stats':
      const stats = tracker.getStatistics();
      console.log('Creation Statistics');
      console.log('==================');
      console.log(`Total created: ${stats.total_created}`);
      console.log(`Pending: ${stats.pending_count}`);
      console.log(`Completion: ${stats.completion_percentage.toFixed(1)}%`);
      console.log('\nBy Priority:');
      Object.entries(stats.pending_by_priority).forEach(([priority, count]) => {
        console.log(`  ${priority}: ${count}`);
      });
      break;

    default:
      console.log('Usage:');
      console.log('  node document-creation-tracker.js trigger <trigger_name> [metadata]');
      console.log('  node document-creation-tracker.js context <context_json>');
      console.log('  node document-creation-tracker.js created <doc_path> <agent>');
      console.log('  node document-creation-tracker.js next <agent_name>');
      console.log('  node document-creation-tracker.js status');
      console.log('  node document-creation-tracker.js stats');
  }
}