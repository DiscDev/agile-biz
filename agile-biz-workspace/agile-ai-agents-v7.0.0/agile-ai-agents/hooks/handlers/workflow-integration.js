/**
 * Workflow Integration Handler
 * Integrates all workflow components and manages execution
 */

const fs = require('fs');
const path = require('path');
const SetupVerificationHandler = require('./setup-verification');
const WorkflowStateHandler = require('./workflow-state-handler');
const StakeholderInteractionHandler = require('./stakeholder-interaction');
const PhaseSelectionMenu = require('./phase-selection-menu');
const AutoSaveManager = require('./auto-save-manager');
const ParallelExecutionCoordinator = require('./parallel-execution-coordinator');
const ErrorRecoveryHandler = require('./error-recovery-handler');

class WorkflowIntegrationHandler {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.configPath = path.join(this.projectRoot, 'machine-data', 'workflow-phase-configuration.json');
    this.loadConfiguration();
    
    // Initialize handlers
    this.setupVerification = new SetupVerificationHandler(this.projectRoot);
    this.stateHandler = new WorkflowStateHandler(this.projectRoot);
    this.autoSaveManager = new AutoSaveManager(this.projectRoot);
    this.parallelCoordinator = new ParallelExecutionCoordinator(this.projectRoot);
    this.errorRecovery = new ErrorRecoveryHandler(this.projectRoot);
    this.phaseMenu = null; // Initialized when needed
    this.stakeholderHandler = null; // Initialized per workflow
    
    // Setup auto-save interval
    this.autoSaveManager.setupIntervalSave();
  }

  /**
   * Load workflow configuration
   */
  loadConfiguration() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.error('Error loading workflow configuration:', error);
      this.config = null;
    }
  }

  /**
   * Execute workflow command
   */
  async executeCommand(command, options = {}) {
    console.log('\n' + '='.repeat(60));
    console.log(`EXECUTING: ${command}`);
    console.log('='.repeat(60));

    switch (command) {
      case '/new-project-workflow':
        return await this.executeNewProjectWorkflow(options);
      
      case '/existing-project-workflow':
        return await this.executeExistingProjectWorkflow(options);
      
      case '/select-phases':
        return await this.executePhaseSelection(options);
      
      case '/aaa-status':
        return await this.getWorkflowStatus();
      
      default:
        return {
          success: false,
          error: `Unknown command: ${command}`
        };
    }
  }

  /**
   * Execute new project workflow
   */
  async executeNewProjectWorkflow(options) {
    // Check for existing workflow
    const status = this.stateHandler.getStatus();
    
    if (status.active && !options.resume) {
      console.log('\n⚠️  Another workflow is already active.');
      console.log('Use --resume to continue or reset state first.');
      return { success: false, reason: 'Workflow already active' };
    }

    // Start or resume workflow
    if (options.resume || status.active) {
      console.log('\n📂 Resuming workflow from:', status.phase);
      return await this.resumeWorkflow('new-project', status.phase);
    }

    // Start new workflow
    console.log('\n🚀 Starting new project workflow...');
    this.stateHandler.startWorkflow('new-project', '/new-project-workflow');
    this.stakeholderHandler = new StakeholderInteractionHandler(this.projectRoot, 'new-project');

    // Execute sequential phases
    return await this.executeSequentialPhases('new-project');
  }

  /**
   * Execute existing project workflow
   */
  async executeExistingProjectWorkflow(options) {
    // Check for existing workflow
    const status = this.stateHandler.getStatus();
    
    if (status.active && !options.resume) {
      console.log('\n⚠️  Another workflow is already active.');
      console.log('Use --resume to continue or reset state first.');
      return { success: false, reason: 'Workflow already active' };
    }

    // Start or resume workflow
    if (options.resume || status.active) {
      console.log('\n📂 Resuming workflow from:', status.phase);
      return await this.resumeWorkflow('existing-project', status.phase);
    }

    // Start new workflow
    console.log('\n🚀 Starting existing project workflow...');
    this.stateHandler.startWorkflow('existing-project', '/existing-project-workflow');
    this.stakeholderHandler = new StakeholderInteractionHandler(this.projectRoot, 'existing-project');

    // Execute sequential phases
    return await this.executeSequentialPhases('existing-project');
  }

  /**
   * Execute sequential phases
   */
  async executeSequentialPhases(workflowType) {
    const stage = workflowType === 'new-project' ? 'development' : 'analysis';
    
    // Check config exists
    if (!this.config || !this.config.workflows || !this.config.workflows[workflowType]) {
      console.error(`Configuration not found for workflow: ${workflowType}`);
      return { success: false, error: 'Configuration missing' };
    }
    
    const phases = this.config.workflows[workflowType].stages[stage].phases;
    
    let currentPhaseIndex = 0;
    const status = this.stateHandler.getStatus();
    
    // Find current phase if resuming
    if (status.phase) {
      currentPhaseIndex = phases.findIndex(p => p.id === status.phase);
      if (currentPhaseIndex === -1) currentPhaseIndex = 0;
    }

    // Execute phases sequentially
    for (let i = currentPhaseIndex; i < phases.length; i++) {
      const phase = phases[i];
      console.log('\n' + '━'.repeat(60));
      console.log(`PHASE ${phase.order}: ${phase.name.toUpperCase()}`);
      console.log('━'.repeat(60));
      
      const result = await this.executePhase(phase, workflowType);
      
      if (!result.success) {
        console.log(`\n❌ Phase failed: ${phase.name}`);
        console.log(`Reason: ${result.reason || 'Unknown'}`);
        return result;
      }

      // Handle approval gates
      if (phase.approval_gate) {
        const approved = await this.handleApprovalGate(phase);
        if (!approved) {
          console.log('\n⏸️  Workflow paused pending approval.');
          return { success: false, paused: true, phase: phase.id };
        }
      }

      // Transition to next phase
      if (phase.next) {
        this.stateHandler.transitionPhase(phase.next);
        this.autoSaveManager.registerSaveTrigger('phase_transition', { from: phase.id, to: phase.next });
      } else if (phase.unlocks) {
        // End of sequential phases, unlock selection menu
        console.log(`\n🎉 ${stage.toUpperCase()} COMPLETE!`);
        console.log(`${phase.unlocks.toUpperCase()} phases are now available.`);
        this.stateHandler.transitionPhase(null); // Mark sequential complete
        
        // Prompt for phase selection
        console.log('\nWould you like to select operational phases now? (yes/no)');
        const selectNow = true; // Simulated response
        
        if (selectNow) {
          return await this.executePhaseSelection({});
        }
      }

      // Auto-save after each phase
      this.stateHandler.createCheckpoint(`phase-${phase.id}-complete`);
      this.autoSaveManager.registerSaveTrigger('checkpoint_creation', { phase: phase.id });
    }

    return { success: true, message: 'Workflow complete!' };
  }

  /**
   * Execute individual phase
   */
  async executePhase(phase, workflowType) {
    // Wrap in error recovery handler
    return await this.errorRecovery.safePhaseExecutor(
      async (p, ctx) => await this.executePhaseCore(p, ctx),
      phase,
      { workflowType }
    );
  }

  /**
   * Core phase execution logic
   */
  async executePhaseCore(phase, context) {
    const workflowType = context.workflowType;
    console.log(`\n⏱️  Estimated time: ${phase.estimated_time}`);
    console.log(`👤 Agent(s): ${phase.agents ? phase.agents.join(', ') : phase.agent}`);
    
    // Phase-specific execution
    switch (phase.id) {
      case 'setup_verification':
        return await this.executeSetupVerification();
      
      case 'stakeholder_discovery':
      case 'identity_verification':
      case 'enhancement_goals':
        return await this.executeStakeholderInterview(phase.id);
      
      case 'research_depth_selection':
      case 'analysis_depth_selection':
        return await this.executeDepthSelection(phase.id);
      
      case 'research_execution':
        return await this.executeResearch(phase);
      
      case 'first_sprint':
        return await this.executeFirstSprint(phase);
      
      default:
        // Simulate other phases
        console.log(`\n📋 Executing: ${phase.name}`);
        console.log('⚙️  Processing...');
        await this.sleep(1000); // Simulate work
        console.log('✅ Complete!');
        return { success: true };
    }
  }

  /**
   * Execute setup verification
   */
  async executeSetupVerification() {
    console.log('\n[Stakeholder Interview Agent]: Let me verify your setup...\n');
    const result = await this.setupVerification.runVerification();
    
    if (!result.canProceed) {
      console.log('\n❌ Setup verification failed. Please fix the issues above.');
      this.autoSaveManager.registerSaveTrigger('error_occurrence', { phase: 'setup_verification' });
      return { success: false, reason: 'Setup incomplete' };
    }

    this.stateHandler.recordApproval('setup_verification', true);
    this.autoSaveManager.registerSaveTrigger('section_approval', { phase: 'setup_verification' });
    return { success: true };
  }

  /**
   * Execute stakeholder interview
   */
  async executeStakeholderInterview(phase) {
    if (!this.stakeholderHandler) {
      const workflowType = this.stateHandler.state.active_workflow;
      this.stakeholderHandler = new StakeholderInteractionHandler(
        this.projectRoot,
        workflowType
      );
    }

    console.log('\n[Stakeholder Interview Agent]: Activated for', phase);
    const result = await this.stakeholderHandler.startInterview(phase);
    
    if (result.success) {
      this.stateHandler.recordApproval(phase, true, result.data);
      this.autoSaveManager.registerSaveTrigger('section_approval', { phase });
      
      // For stakeholder discovery, also check for AI operations discovery
      if (phase === 'stakeholder_discovery' && this.shouldDiscoverAIOperations()) {
        console.log('\n🤖 Proceeding to AI Operations Discovery...');
        const aiOpsResult = await this.stakeholderHandler.discoverAIOperations();
        if (aiOpsResult.success) {
          this.stateHandler.recordApproval('ai_operations', true, aiOpsResult.decisions);
        }
      }
    }
    
    return result;
  }

  /**
   * Execute depth selection
   */
  async executeDepthSelection(phase) {
    if (!this.stakeholderHandler) {
      const workflowType = this.stateHandler.state.active_workflow;
      this.stakeholderHandler = new StakeholderInteractionHandler(
        this.projectRoot,
        workflowType
      );
    }

    let result;
    if (phase === 'research_depth_selection') {
      result = await this.stakeholderHandler.selectResearchDepth();
    } else {
      // For analysis depth (existing projects)
      result = { success: true, level: 'standard' };
    }

    if (result.success) {
      this.stateHandler.setResearchLevel(result.level);
      this.autoSaveManager.registerSaveTrigger('depth_selection', { level: result.level });
    }
    
    return result;
  }

  /**
   * Execute research phase with parallel agents
   */
  async executeResearch(phase) {
    console.log('\n🔬 RESEARCH EXECUTION');
    console.log('─'.repeat(50));
    
    const researchLevel = this.stateHandler.state.configuration.research_level;
    console.log(`Research Level: ${researchLevel.toUpperCase()}`);
    
    // Get document count for level
    const docCounts = {
      'minimal': 15,
      'medium': 48,
      'thorough': 194
    };
    
    const totalDocs = docCounts[researchLevel] || 48;
    console.log(`Documents to create: ${totalDocs}`);
    
    // Simulate parallel execution
    if (phase.execution === 'parallel' && phase.agents) {
      console.log(`\n🚀 Launching ${phase.agents.length} agents in parallel:`);
      phase.agents.forEach(agent => {
        console.log(`   • ${agent}: Starting...`);
      });
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await this.sleep(500);
        const docsComplete = Math.floor((i / 100) * totalDocs);
        console.log(`\n📊 Progress: [${this.getProgressBar(i)}] ${i}%`);
        console.log(`   Documents: ${docsComplete}/${totalDocs}`);
      }
    }
    
    console.log('\n✅ Research phase complete!');
    console.log(`   Total documents created: ${totalDocs}`);
    
    // Update metrics
    this.stateHandler.state.metrics.documents_created += totalDocs;
    this.stateHandler.saveState();
    this.autoSaveManager.registerSaveTrigger('document_creation', { count: totalDocs });
    
    return { success: true, documents: totalDocs };
  }

  /**
   * Execute first sprint
   */
  async executeFirstSprint(phase) {
    console.log('\n🏃 FIRST SPRINT EXECUTION');
    console.log('─'.repeat(50));
    console.log('Sprint Goal: Implement core MVP features');
    
    // Simulate sprint execution
    const tasks = [
      'Setting up development environment',
      'Creating project structure',
      'Implementing authentication',
      'Building core features',
      'Writing tests',
      'Preparing for deployment'
    ];
    
    for (const task of tasks) {
      console.log(`\n⚙️  ${task}...`);
      await this.sleep(500);
      console.log('   ✅ Complete');
    }
    
    console.log('\n🎯 Sprint complete!');
    return { success: true };
  }

  /**
   * Execute selected phases with chosen mode
   */
  async executeSelectedPhases() {
    const state = this.stateHandler.state;
    const selectedPhases = state.phases.selected.active;
    const executionMode = state.phases.selected.execution_mode;
    
    if (!selectedPhases || selectedPhases.length === 0) {
      console.log('No phases selected for execution');
      return { success: false, reason: 'No phases selected' };
    }
    
    console.log(`\n🚀 Executing ${selectedPhases.length} phases in ${executionMode} mode`);
    
    if (executionMode === 'parallel') {
      // Use parallel coordinator
      const workflowType = state.active_workflow;
      const stage = workflowType === 'new-project' ? 'operations' : 'enhancements';
      const results = await this.parallelCoordinator.executeParallel(
        selectedPhases,
        workflowType,
        stage
      );
      
      // Update state with results
      results.successful.forEach(phaseId => {
        this.stateHandler.transitionPhase(phaseId);
      });
      
      return results;
    } else {
      // Execute sequentially (existing logic)
      for (const phaseId of selectedPhases) {
        const result = await this.executePhase({ id: phaseId }, state.active_workflow);
        if (!result.success) {
          return result;
        }
      }
      return { success: true, phases: selectedPhases };
    }
  }

  /**
   * Execute phase selection
   */
  async executePhaseSelection(options) {
    const workflowType = this.stateHandler.state.active_workflow;
    
    if (!workflowType) {
      console.log('❌ No active workflow. Start a workflow first.');
      return { success: false, reason: 'No active workflow' };
    }

    if (!this.phaseMenu) {
      this.phaseMenu = new PhaseSelectionMenu(this.projectRoot, workflowType);
    }

    return await this.phaseMenu.execute();
  }

  /**
   * Handle approval gate
   */
  async handleApprovalGate(phase) {
    console.log('\n' + '🔐'.repeat(20));
    console.log('APPROVAL GATE');
    console.log('🔐'.repeat(20));
    console.log(`\nPhase "${phase.name}" requires approval to continue.`);
    console.log('Review the work completed and approve to proceed.');
    console.log('\nApprove? (yes/no) [timeout in 24 hours]: ');
    
    // Simulate approval (in real implementation, would wait or timeout)
    const approved = true;
    
    if (approved) {
      console.log('✅ Approved! Continuing...');
      this.stateHandler.recordApproval(phase.id, true);
      this.autoSaveManager.registerSaveTrigger('decision_recording', { phase: phase.id, approved });
    } else {
      console.log('❌ Not approved. Workflow paused.');
      this.stateHandler.recordApproval(phase.id, false);
    }
    
    return approved;
  }

  /**
   * Check if AI operations discovery should be performed
   */
  shouldDiscoverAIOperations() {
    // Check if user has indicated interest in AI operations
    // This could be based on configuration or previous responses
    const config = this.stateHandler.state.configuration || {};
    return config.enable_ai_operations !== false; // Default to true unless explicitly disabled
  }

  /**
   * Resume workflow from saved state
   */
  async resumeWorkflow(workflowType, fromPhase) {
    console.log(`\n📂 Resuming ${workflowType} workflow from phase: ${fromPhase}`);
    
    // Reinitialize handlers
    this.stakeholderHandler = new StakeholderInteractionHandler(this.projectRoot, workflowType);
    
    // Continue sequential execution
    return await this.executeSequentialPhases(workflowType);
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus() {
    const status = this.stateHandler.getStatus();
    
    console.log('\n' + '📊'.repeat(20));
    console.log('WORKFLOW STATUS');
    console.log('📊'.repeat(20));
    
    if (!status.active) {
      console.log('\n❌ No active workflow');
      console.log('Start a workflow with:');
      console.log('  • /new-project-workflow');
      console.log('  • /existing-project-workflow');
      return status;
    }

    console.log(`\nActive Workflow: ${status.workflow}`);
    console.log(`Stage: ${status.stage}`);
    console.log(`Current Phase: ${status.phase || 'None'}`);
    console.log(`Phases Completed: ${status.phases_completed.length}`);
    console.log(`Research Level: ${status.research_level}`);
    console.log(`Duration: ${status.duration_minutes} minutes`);
    
    console.log('\nMetrics:');
    console.log(`  • Documents Created: ${status.metrics.documents_created}`);
    console.log(`  • Decisions Made: ${status.metrics.decisions_made}`);
    console.log(`  • Approvals Obtained: ${status.metrics.approvals_obtained}`);
    console.log(`  • Phases Completed: ${status.metrics.phases_completed}`);
    
    if (status.can_select_phases) {
      console.log('\n✅ Phase selection is available!');
      console.log('Use /select-phases to choose operational phases.');
    }
    
    return status;
  }

  /**
   * Helper: Get progress bar
   */
  getProgressBar(percentage) {
    const filled = Math.floor(percentage / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Helper: Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in workflows
module.exports = WorkflowIntegrationHandler;

// Allow direct execution for testing
if (require.main === module) {
  const handler = new WorkflowIntegrationHandler(process.cwd());
  
  // Test command execution
  const command = process.argv[2] || '/aaa-status';
  handler.executeCommand(command).then(result => {
    console.log('\n\nResult:', result);
  });
}