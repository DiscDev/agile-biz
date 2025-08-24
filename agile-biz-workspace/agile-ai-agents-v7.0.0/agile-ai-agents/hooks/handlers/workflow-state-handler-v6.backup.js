/**
 * Workflow State Handler
 * Manages workflow state for new and existing project workflows
 */

const fs = require('fs');
const path = require('path');

class WorkflowStateHandler {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.statePath = path.join(this.projectRoot, 'project-state', 'workflow-state.json');
    this.checkpointPath = path.join(this.projectRoot, 'project-state', 'checkpoints');
    this.state = this.loadState();
  }

  /**
   * Load existing state or create new
   */
  loadState() {
    try {
      if (fs.existsSync(this.statePath)) {
        const content = fs.readFileSync(this.statePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading workflow state:', error);
    }

    // Return default state
    return this.getDefaultState();
  }

  /**
   * Get default workflow state
   */
  getDefaultState() {
    return {
      version: '2.0.0',
      active_workflow: null,
      workflow_phase: null,
      workflow_stage: null, // 'development' or 'operations'
      phase_selection_unlocked: false,
      mvp_deployed: false,
      initiated_by: null,
      started_at: null,
      last_updated: new Date().toISOString(),
      
      discovery: {
        sections_completed: [],
        current_section: null,
        approvals: {},
        iterations: {},
        research_level: null, // 'minimal', 'medium', or 'thorough'
        analysis_level: null  // For existing projects
      },
      
      phases: {
        sequential: {
          completed: [],
          current: null,
          next: null
        },
        selected: {
          available: [],
          active: [],
          completed: []
        }
      },
      
      configuration: {
        project_type: null,
        existing_project: false,
        existing_tech: [],
        key_decisions: [],
        research_level: 'thorough', // DEFAULT
        analysis_level: 'standard'  // DEFAULT for existing projects
      },
      
      approvals: {
        setup_verification: null,
        stakeholder_discovery: null,
        research_review: null,
        requirements_review: null,
        pre_implementation: null,
        mvp_deployment: null
      },
      
      checkpoints: [],
      
      metrics: {
        documents_created: 0,
        decisions_made: 0,
        approvals_obtained: 0,
        phases_completed: 0,
        time_in_workflow: 0
      }
    };
  }

  /**
   * Start new workflow
   */
  async startWorkflow(workflowType, command) {
    if (this.state.active_workflow) {
      return {
        success: false,
        error: 'Another workflow is already active',
        suggestion: 'Use --resume to continue or reset state'
      };
    }

    this.state.active_workflow = workflowType;
    this.state.workflow_stage = 'development';
    this.state.initiated_by = command;
    this.state.started_at = new Date().toISOString();
    this.state.last_updated = new Date().toISOString();
    
    // ALWAYS default research level to thorough if not set
    if (!this.state.configuration.research_level) {
      this.state.configuration.research_level = 'thorough';
      this.state.discovery.research_level = 'thorough';
      console.log('📚 Defaulting to THOROUGH research level (194 documents)');
    }

    // Set initial phase based on workflow type
    if (workflowType === 'new-project') {
      this.state.workflow_phase = 'setup_verification';
      this.state.phases.sequential.next = 'stakeholder_discovery';
    } else if (workflowType === 'existing-project') {
      this.state.workflow_phase = 'setup_verification';
      this.state.phases.sequential.next = 'code_analysis';
      this.state.configuration.existing_project = true;
    }
    
    // Initialize document creation tracker with default research level
    try {
      const DocumentCreationTracker = require('../../machine-data/document-creation-tracker');
      const tracker = new DocumentCreationTracker(this.projectRoot);
      
      // Update context AND wait for research configuration to load
      tracker.updateContext({
        research_level: this.state.configuration.research_level || 'thorough',
        researchLevel: this.state.configuration.research_level || 'thorough',
        existing_project: this.state.configuration.existing_project || false,
        workflow_type: workflowType
      });
      
      // Ensure research configuration is loaded
      if (!tracker.tracking.research_configuration) {
        await tracker.loadResearchLevelDocuments(this.state.configuration.research_level || 'thorough');
      }
      
      console.log('📋 Document creation tracker initialized');
    } catch (error) {
      console.error('Warning: Could not initialize document tracker:', error.message);
    }

    this.saveState();
    return { success: true };
  }

  /**
   * Trigger document creation for current phase
   */
  async triggerDocumentCreation(triggerName, metadata = {}) {
    try {
      const DocumentCreationTracker = require('../../machine-data/document-creation-tracker');
      const tracker = new DocumentCreationTracker(this.projectRoot);
      
      // Ensure research level is set (default to thorough)
      const researchLevel = this.state.configuration.research_level || 'thorough';
      
      // Update context if not already set
      if (!tracker.tracking.research_configuration) {
        tracker.updateContext({
          research_level: researchLevel,
          researchLevel: researchLevel,
          project_type: this.state.configuration.project_type,
          existing_project: this.state.configuration.existing_project || false,
          workflow_type: this.state.active_workflow
        });
      }
      
      // Process the trigger (now async)
      const pendingDocs = await tracker.processTrigger(triggerName, metadata);
      
      console.log(`📚 Triggered document creation for ${triggerName}`);
      console.log(`📋 ${pendingDocs.length} documents queued for creation`);
      
      // Update metrics
      this.state.metrics.documents_created = tracker.tracking.statistics.total_created;
      this.saveState();
      
      return { success: true, pending: pendingDocs.length };
    } catch (error) {
      console.error('Warning: Could not trigger document creation:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Transition to next phase
   */
  async transitionPhase(nextPhase) {
    const currentPhase = this.state.workflow_phase;
    
    // Mark current phase as complete
    if (currentPhase && !this.state.phases.sequential.completed.includes(currentPhase)) {
      this.state.phases.sequential.completed.push(currentPhase);
      this.state.metrics.phases_completed++;
    }

    // Update phase
    this.state.workflow_phase = nextPhase;
    this.state.phases.sequential.current = nextPhase;
    this.state.last_updated = new Date().toISOString();

    // Trigger document creation based on phase transitions
    const phaseTriggerMap = {
      'stakeholder_discovery': 'initialization_complete',
      'research_execution': 'stakeholder_approval',
      'requirements_synthesis': 'planning_approved',
      'mvp_deployment': 'development_complete',
      'operations': 'deployment_complete'
    };
    
    if (phaseTriggerMap[nextPhase]) {
      await this.triggerDocumentCreation(phaseTriggerMap[nextPhase], {
        phase: nextPhase,
        workflow: this.state.active_workflow
      });
    }

    // Check for stage transition
    if (this.state.active_workflow === 'new-project' && nextPhase === 'mvp_deployment') {
      this.state.mvp_deployed = true;
      this.state.phase_selection_unlocked = true;
      this.state.workflow_stage = 'operations';
      this.unlockOperationalPhases();
    } else if (this.state.active_workflow === 'existing-project' && nextPhase === 'analysis_complete') {
      this.state.phase_selection_unlocked = true;
      this.state.workflow_stage = 'operations';
      this.unlockEnhancementPhases();
    }

    this.saveState();
    return { success: true };
  }

  /**
   * Unlock operational phases for new projects
   */
  unlockOperationalPhases() {
    this.state.phases.selected.available = [
      // Growth & Marketing
      'launch_campaigns',
      'seo_optimization',
      'email_marketing',
      'social_media',
      'content_marketing',
      
      // Analytics & Intelligence
      'analytics_setup',
      'business_intelligence',
      'performance_monitoring',
      
      // Customer Success
      'customer_onboarding',
      'retention_systems',
      'support_automation',
      
      // Revenue Optimization
      'pricing_optimization',
      'monetization_strategy',
      'subscription_management',
      
      // Scale & Performance
      'performance_optimization',
      'infrastructure_scaling',
      'security_hardening'
    ];
  }

  /**
   * Unlock enhancement phases for existing projects
   */
  unlockEnhancementPhases() {
    this.state.phases.selected.available = [
      // Technical Improvements
      'refactoring',
      'performance_optimization',
      'security_audit',
      'test_coverage',
      
      // Feature Development
      'new_features',
      'ui_redesign',
      'api_expansion',
      
      // Infrastructure
      'migration',
      'scaling',
      'monitoring',
      
      // Business Features
      'analytics_integration',
      'payment_integration',
      'notification_system'
    ];
  }

  /**
   * Record approval
   */
  recordApproval(approvalType, approved, details = {}) {
    this.state.approvals[approvalType] = {
      approved,
      timestamp: new Date().toISOString(),
      details
    };
    
    if (approved) {
      this.state.metrics.approvals_obtained++;
    }
    
    this.saveState();
    return { success: true };
  }

  /**
   * Update discovery section
   */
  updateDiscoverySection(section, data) {
    if (!this.state.discovery.sections_completed.includes(section)) {
      this.state.discovery.sections_completed.push(section);
    }
    
    this.state.discovery.current_section = data.next_section || null;
    
    if (data.approvals) {
      Object.assign(this.state.discovery.approvals, data.approvals);
    }
    
    if (data.iterations) {
      Object.assign(this.state.discovery.iterations, data.iterations);
    }
    
    this.state.last_updated = new Date().toISOString();
    this.saveState();
    return { success: true };
  }

  /**
   * Set research level and initialize document creation
   */
  setResearchLevel(level) {
    const validLevels = ['minimal', 'medium', 'thorough'];
    
    // ALWAYS default to thorough if not specified or invalid
    if (!validLevels.includes(level)) {
      level = 'thorough'; // Default fallback
      console.log('📚 Defaulting to thorough research level');
    }
    
    this.state.discovery.research_level = level;
    this.state.configuration.research_level = level;
    this.state.last_updated = new Date().toISOString();
    
    // Initialize document creation tracker with research level
    try {
      const DocumentCreationTracker = require('../../machine-data/document-creation-tracker');
      const tracker = new DocumentCreationTracker(this.projectRoot);
      
      // Update context with research level and project info
      tracker.updateContext({
        research_level: level,
        researchLevel: level, // Support both formats
        project_type: this.state.configuration.project_type,
        existing_project: this.state.configuration.existing_project || false,
        workflow_type: this.state.active_workflow
      });
      
      console.log(`📚 Document creation tracker initialized with ${level} research level`);
      console.log(`📚 Total documents to create: ${tracker.tracking.research_configuration?.totalDocuments || 0}`);
      
    } catch (error) {
      console.error('Warning: Could not initialize document tracker:', error.message);
    }
    
    this.saveState();
    return { success: true, level };
  }

  /**
   * Record decision
   */
  recordDecision(decision) {
    this.state.configuration.key_decisions.push({
      ...decision,
      timestamp: new Date().toISOString()
    });
    
    this.state.metrics.decisions_made++;
    this.state.last_updated = new Date().toISOString();
    
    this.saveState();
    return { success: true };
  }

  /**
   * Create checkpoint
   */
  createCheckpoint(name = null) {
    const checkpointId = Date.now().toString();
    const checkpointName = name || `checkpoint-${checkpointId}`;
    
    // Ensure checkpoint directory exists
    if (!fs.existsSync(this.checkpointPath)) {
      fs.mkdirSync(this.checkpointPath, { recursive: true });
    }
    
    // Save checkpoint
    const checkpointFile = path.join(this.checkpointPath, `${checkpointName}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(this.state, null, 2));
    
    // Record in state
    this.state.checkpoints.push({
      id: checkpointId,
      name: checkpointName,
      timestamp: new Date().toISOString(),
      phase: this.state.workflow_phase
    });
    
    // Keep only last 20 checkpoints
    if (this.state.checkpoints.length > 20) {
      this.state.checkpoints = this.state.checkpoints.slice(-20);
    }
    
    this.saveState();
    return { success: true, checkpoint: checkpointName };
  }

  /**
   * Restore from checkpoint
   */
  restoreCheckpoint(checkpointName) {
    const checkpointFile = path.join(this.checkpointPath, `${checkpointName}.json`);
    
    if (!fs.existsSync(checkpointFile)) {
      return {
        success: false,
        error: 'Checkpoint not found'
      };
    }
    
    try {
      const content = fs.readFileSync(checkpointFile, 'utf8');
      this.state = JSON.parse(content);
      this.saveState();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get workflow status
   */
  getStatus() {
    if (!this.state.active_workflow) {
      return {
        active: false,
        message: 'No active workflow'
      };
    }

    const duration = this.state.started_at 
      ? Math.floor((Date.now() - new Date(this.state.started_at).getTime()) / 1000 / 60)
      : 0;

    return {
      active: true,
      workflow: this.state.active_workflow,
      stage: this.state.workflow_stage,
      phase: this.state.workflow_phase,
      phases_completed: this.state.phases.sequential.completed,
      research_level: this.state.configuration.research_level,
      duration_minutes: duration,
      metrics: this.state.metrics,
      can_select_phases: this.state.phase_selection_unlocked
    };
  }

  /**
   * Save state to file
   */
  saveState() {
    try {
      // Ensure directory exists
      const stateDir = path.dirname(this.statePath);
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }
      
      // Save state
      fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save workflow state:', error);
      return false;
    }
  }

  /**
   * Reset workflow state
   */
  reset() {
    this.state = this.getDefaultState();
    this.saveState();
    return { success: true };
  }
}

// Export for use in workflows
module.exports = WorkflowStateHandler;

// Allow direct execution for testing
if (require.main === module) {
  const handler = new WorkflowStateHandler();
  const status = handler.getStatus();
  console.log('Workflow Status:', JSON.stringify(status, null, 2));
}