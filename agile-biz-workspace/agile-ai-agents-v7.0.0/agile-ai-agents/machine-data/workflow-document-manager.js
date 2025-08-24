/**
 * Workflow Document Manager
 * Manages document creation based on research levels for workflows
 */

const fs = require('fs').promises;
const path = require('path');

class WorkflowDocumentManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.researchLevelDocsPath = path.join(projectRoot, 'machine-data', 'research-level-documents.json');
    this.folderStructurePath = path.join(projectRoot, 'machine-data', 'project-folder-structure-categories.json');
    this.documentRulesPath = path.join(projectRoot, 'machine-data', 'document-creation-rules.json');
    this.loadConfigurations();
  }

  /**
   * Load all configuration files
   */
  async loadConfigurations() {
    try {
      // Load research level documents mapping
      const researchLevelDocs = await fs.readFile(this.researchLevelDocsPath, 'utf8');
      this.researchLevelConfig = JSON.parse(researchLevelDocs);
      
      // Load folder structure for agent mapping
      const folderStructure = await fs.readFile(this.folderStructurePath, 'utf8');
      this.folderStructure = JSON.parse(folderStructure);
      
      // Load document creation rules
      const docRules = await fs.readFile(this.documentRulesPath, 'utf8');
      this.documentRules = JSON.parse(docRules);
      
    } catch (error) {
      console.error('Error loading configurations:', error);
      throw error;
    }
  }

  /**
   * Get documents for a specific research level
   * @param {string} researchLevel - minimal, medium, or thorough (default: thorough)
   * @returns {Object} Document list organized by category
   */
  getDocumentsForResearchLevel(researchLevel = 'thorough') {
    const levelConfig = this.researchLevelConfig.research_levels[researchLevel];
    if (!levelConfig) {
      console.warn(`Unknown research level: ${researchLevel}, defaulting to thorough`);
      return this.researchLevelConfig.research_levels.thorough.documents;
    }
    
    return levelConfig.documents;
  }

  /**
   * Get document count for a research level
   * @param {string} researchLevel 
   * @returns {number} Total document count
   */
  getDocumentCount(researchLevel = 'thorough') {
    const levelConfig = this.researchLevelConfig.research_levels[researchLevel];
    return levelConfig ? levelConfig.document_count : 0;
  }

  /**
   * Map documents to their responsible agents
   * @param {Object} documents - Documents organized by category
   * @returns {Array} Array of document objects with agent assignments
   */
  mapDocumentsToAgents(documents) {
    const mappedDocuments = [];
    
    Object.entries(documents).forEach(([category, docList]) => {
      docList.forEach(docName => {
        const agentInfo = this.findAgentForDocument(category, docName);
        // Use the correct folderPath from the agent mapping
        mappedDocuments.push({
          path: `${agentInfo.folderPath}/${docName}`,
          document: docName,
          category: category,
          agent: agentInfo.agent,
          priority: this.determinePriority(category, docName),
          folderPath: agentInfo.folderPath
        });
      });
    });
    
    return mappedDocuments;
  }

  /**
   * Find the responsible agent for a document
   * @param {string} category 
   * @param {string} documentName 
   * @returns {Object} Agent and folder information
   */
  findAgentForDocument(category, documentName) {
    // Map category names to folder structure categories
    const categoryMapping = {
      'research': 'business-strategy',
      'marketing': 'business-strategy',
      'finance': 'business-strategy',
      'market-validation': 'business-strategy',
      'customer-success': 'business-strategy',
      'monetization': 'business-strategy',
      'investment': 'business-strategy',
      'analysis': 'business-strategy',
      'security': 'implementation',
      'analytics': 'operations',
      'optimization': 'operations',
      'email-marketing': 'operations'
    };
    
    const structureCategory = categoryMapping[category] || category;
    
    // Search for the folder containing this document
    if (this.folderStructure.categories[structureCategory]) {
      const categoryFolders = this.folderStructure.categories[structureCategory].folders;
      
      for (const [folderKey, folderInfo] of Object.entries(categoryFolders)) {
        if (folderInfo.documents && folderInfo.documents.includes(documentName)) {
          return {
            agent: folderInfo.agent,
            folderPath: `${structureCategory}/${folderInfo.name}`
          };
        }
      }
    }
    
    // Default agent mapping if not found in structure
    const defaultAgentMapping = {
      'research': 'research_agent',
      'marketing': 'marketing_agent',
      'finance': 'finance_agent',
      'market-validation': 'market_validation_product_market_fit_agent',
      'customer-success': 'customer_lifecycle_retention_agent',
      'monetization': 'revenue_optimization_agent',
      'investment': 'vc_report_agent',
      'security': 'security_agent',
      'analytics': 'analytics_growth_intelligence_agent',
      'optimization': 'optimization_agent',
      'analysis': 'analysis_agent'
    };
    
    return {
      agent: defaultAgentMapping[category] || 'document_manager_agent',
      folderPath: `${structureCategory}/${category}`
    };
  }

  /**
   * Determine document priority based on category and name
   * @param {string} category 
   * @param {string} documentName 
   * @returns {string} Priority level
   */
  determinePriority(category, documentName) {
    // Critical documents
    const criticalDocs = [
      'market-analysis.md',
      'competitive-analysis.md',
      'viability-analysis.md',
      'financial-analysis.md',
      'go-no-go-recommendation.md',
      'security-architecture-strategy.md',
      'prd-document.md'
    ];
    
    if (criticalDocs.includes(documentName)) {
      return 'critical';
    }
    
    // Important category defaults
    const importantCategories = ['research', 'finance', 'security', 'market-validation'];
    if (importantCategories.includes(category)) {
      return 'important';
    }
    
    // Everything else is helpful
    return 'helpful';
  }

  /**
   * Generate document creation queue for a workflow
   * @param {string} workflowType - 'new-project' or 'existing-project'
   * @param {string} researchLevel - minimal, medium, or thorough
   * @param {Object} projectContext - Additional context
   * @returns {Object} Document queue organized by phase
   */
  generateDocumentQueue(workflowType, researchLevel = 'thorough', projectContext = {}) {
    const documents = this.getDocumentsForResearchLevel(researchLevel);
    const mappedDocs = this.mapDocumentsToAgents(documents);
    
    // Organize documents by phase based on workflow type
    const phaseMapping = {
      'new-project': {
        'phase_1_discovery': ['research', 'market-validation'],
        'phase_2_planning': ['finance', 'marketing', 'analysis'],
        'phase_3_requirements': ['security', 'investment'],
        'phase_6_growth': ['customer-success', 'monetization', 'analytics', 'optimization']
      },
      'existing-project': {
        'phase_1_discovery': ['research', 'analysis'],
        'phase_2_planning': ['market-validation', 'finance', 'marketing'],
        'phase_3_requirements': ['security'],
        'phase_6_growth': ['customer-success', 'monetization', 'analytics', 'optimization', 'investment']
      }
    };
    
    const phases = phaseMapping[workflowType] || phaseMapping['new-project'];
    const documentQueue = {};
    
    // Initialize phase queues
    Object.keys(phases).forEach(phase => {
      documentQueue[phase] = [];
    });
    
    // Assign documents to phases
    mappedDocs.forEach(doc => {
      for (const [phase, categories] of Object.entries(phases)) {
        if (categories.includes(doc.category)) {
          documentQueue[phase].push(doc);
          break;
        }
      }
    });
    
    // Add phase-specific required documents from rules
    this.addRequiredDocuments(documentQueue, workflowType, projectContext);
    
    return documentQueue;
  }

  /**
   * Add required documents from document creation rules
   * @param {Object} documentQueue 
   * @param {string} workflowType 
   * @param {Object} projectContext 
   */
  addRequiredDocuments(documentQueue, workflowType, projectContext) {
    // Add initialization phase documents
    if (!documentQueue.phase_0_initialization) {
      documentQueue.phase_0_initialization = [];
    }
    
    // Add critical initialization documents
    const initDocs = this.documentRules.phases.phase_0_initialization.documents;
    initDocs.forEach(doc => {
      if (doc.required === 'always') {
        documentQueue.phase_0_initialization.push({
          path: doc.path,
          document: doc.path.split('/').pop(),
          category: 'orchestration',
          agent: doc.agent,
          priority: doc.priority,
          description: doc.description
        });
      }
    });
    
    // Add workflow-specific required documents
    if (workflowType === 'existing-project' && documentQueue.phase_1_discovery) {
      const existingProjectDocs = [
        'business-strategy/existing-project/project-brief.md',
        'business-strategy/existing-project/technology-stack-analysis.md',
        'business-strategy/existing-project/system-architecture-analysis.md',
        'business-strategy/existing-project/enhancement-opportunities.md'
      ];
      
      existingProjectDocs.forEach(docPath => {
        if (!documentQueue.phase_1_discovery.some(d => d.path === docPath)) {
          documentQueue.phase_1_discovery.unshift({
            path: docPath,
            document: docPath.split('/').pop(),
            category: 'existing-project',
            agent: 'project_analyzer_agent',
            priority: 'critical'
          });
        }
      });
    }
  }

  /**
   * Get parallel execution groups for a phase
   * @param {Array} phaseDocuments 
   * @returns {Object} Documents grouped by agent for parallel execution
   */
  getParallelExecutionGroups(phaseDocuments) {
    const groups = {};
    
    phaseDocuments.forEach(doc => {
      if (!groups[doc.agent]) {
        groups[doc.agent] = [];
      }
      groups[doc.agent].push(doc);
    });
    
    return groups;
  }

  /**
   * Calculate estimated completion time
   * @param {string} researchLevel 
   * @param {boolean} useParallelExecution 
   * @returns {Object} Time estimates
   */
  calculateTimeEstimates(researchLevel, useParallelExecution = true) {
    const baseEstimates = {
      minimal: { min: 1, max: 2 },
      medium: { min: 3, max: 5 },
      thorough: { min: 6, max: 10 }
    };
    
    const estimate = baseEstimates[researchLevel] || baseEstimates.thorough;
    
    if (useParallelExecution) {
      // 60-78% time reduction with parallel execution
      return {
        min: Math.round(estimate.min * 0.22),
        max: Math.round(estimate.max * 0.4),
        unit: 'hours'
      };
    }
    
    return { ...estimate, unit: 'hours' };
  }

  /**
   * Generate execution plan summary
   * @param {string} workflowType 
   * @param {string} researchLevel 
   * @returns {Object} Execution plan
   */
  generateExecutionPlan(workflowType, researchLevel = 'thorough') {
    const documentQueue = this.generateDocumentQueue(workflowType, researchLevel);
    const totalDocuments = Object.values(documentQueue).flat().length;
    const timeEstimate = this.calculateTimeEstimates(researchLevel, true);
    
    const plan = {
      workflow: workflowType,
      researchLevel: researchLevel,
      totalDocuments: totalDocuments,
      estimatedTime: timeEstimate,
      phases: {}
    };
    
    // Generate phase details
    Object.entries(documentQueue).forEach(([phase, documents]) => {
      const parallelGroups = this.getParallelExecutionGroups(documents);
      plan.phases[phase] = {
        documentCount: documents.length,
        parallelGroups: Object.keys(parallelGroups).length,
        agents: Object.keys(parallelGroups),
        criticalDocuments: documents.filter(d => d.priority === 'critical').length
      };
    });
    
    return plan;
  }
}

module.exports = WorkflowDocumentManager;

// CLI interface for testing
if (require.main === module) {
  const manager = new WorkflowDocumentManager(path.join(__dirname, '..'));
  
  manager.loadConfigurations().then(() => {
    const command = process.argv[2];
    const args = process.argv.slice(3);
    
    switch (command) {
      case 'list':
        const level = args[0] || 'thorough';
        const docs = manager.getDocumentsForResearchLevel(level);
        console.log(`\nDocuments for ${level} research level (${manager.getDocumentCount(level)} total):`);
        console.log(JSON.stringify(docs, null, 2));
        break;
        
      case 'plan':
        const workflow = args[0] || 'new-project';
        const researchLevel = args[1] || 'thorough';
        const plan = manager.generateExecutionPlan(workflow, researchLevel);
        console.log(`\nExecution plan for ${workflow} at ${researchLevel} level:`);
        console.log(JSON.stringify(plan, null, 2));
        break;
        
      case 'queue':
        const wf = args[0] || 'new-project';
        const rl = args[1] || 'thorough';
        const queue = manager.generateDocumentQueue(wf, rl);
        console.log(`\nDocument queue for ${wf} at ${rl} level:`);
        Object.entries(queue).forEach(([phase, docs]) => {
          console.log(`\n${phase}: ${docs.length} documents`);
          docs.slice(0, 5).forEach(doc => {
            console.log(`  - ${doc.path} (${doc.priority}) -> ${doc.agent}`);
          });
          if (docs.length > 5) {
            console.log(`  ... and ${docs.length - 5} more`);
          }
        });
        break;
        
      default:
        console.log('Usage:');
        console.log('  node workflow-document-manager.js list [research-level]');
        console.log('  node workflow-document-manager.js plan [workflow-type] [research-level]');
        console.log('  node workflow-document-manager.js queue [workflow-type] [research-level]');
        console.log('\nDefaults: workflow-type=new-project, research-level=thorough');
    }
  });
}