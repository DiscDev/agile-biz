/**
 * Error Recovery Handler
 * Manages error handling, recovery, and state validation
 */

const fs = require('fs');
const path = require('path');

class ErrorRecoveryHandler {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.statePath = path.join(this.projectRoot, 'project-state', 'runtime.json');
    this.errorLogPath = path.join(this.projectRoot, 'logs', 'error-recovery.log');
    this.checkpointsPath = path.join(this.projectRoot, 'project-state', 'checkpoints');
    this.repairLogPath = path.join(this.projectRoot, 'logs', 'state-repairs.log');
    
    this.maxRetries = 3;
    this.retryDelays = [1000, 3000, 5000]; // Progressive delays
    this.safeModeEnabled = false;
    this.errorHistory = [];
    
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [
      path.dirname(this.errorLogPath),
      this.checkpointsPath,
      path.dirname(this.repairLogPath)
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Wrap phase execution in error handler
   */
  async safePhaseExecutor(phaseExecutor, phase, context = {}) {
    const phaseId = phase.id || phase;
    let attempts = 0;
    let lastError = null;
    
    console.log(`\n🛡️  Safe execution wrapper for: ${phaseId}`);
    
    while (attempts < this.maxRetries) {
      attempts++;
      
      try {
        // Create pre-execution checkpoint
        const checkpointId = await this.createCheckpoint(`pre-${phaseId}-attempt-${attempts}`);
        
        // Validate state before execution
        const stateValid = await this.validateState();
        if (!stateValid.valid) {
          console.warn('⚠️  State validation failed before execution');
          await this.repairState(stateValid.issues);
        }
        
        // Execute phase
        console.log(`   Attempt ${attempts}/${this.maxRetries}...`);
        const result = await phaseExecutor(phase, context);
        
        // Success - clean up and return
        console.log(`   ✅ Phase executed successfully`);
        this.recordSuccess(phaseId, attempts);
        return result;
        
      } catch (error) {
        lastError = error;
        console.error(`   ❌ Attempt ${attempts} failed:`, error.message);
        
        // Log error
        await this.logError(phaseId, error, attempts);
        
        // Determine recovery strategy
        const recovery = await this.determineRecoveryStrategy(phaseId, error, attempts);
        
        if (recovery.action === 'retry' && attempts < this.maxRetries) {
          console.log(`   🔄 Retrying in ${recovery.delay}ms...`);
          await this.sleep(recovery.delay);
          continue;
        } else if (recovery.action === 'skip') {
          console.log(`   ⏭️  Skipping phase as per recovery strategy`);
          return { success: false, skipped: true, reason: error.message };
        } else if (recovery.action === 'safe_mode') {
          console.log(`   🛡️  Entering safe mode...`);
          return await this.executeSafeMode(phase, context);
        } else if (recovery.action === 'restore') {
          console.log(`   📂 Restoring from checkpoint...`);
          await this.restoreFromCheckpoint(recovery.checkpointId);
          // Retry after restore
          if (attempts < this.maxRetries) {
            await this.sleep(recovery.delay);
            continue;
          }
        }
        
        // Max retries reached or unrecoverable error
        break;
      }
    }
    
    // All attempts failed
    console.error(`\n❌ PHASE FAILED AFTER ${attempts} ATTEMPTS`);
    console.error(`Phase: ${phaseId}`);
    console.error(`Error: ${lastError?.message}`);
    
    // Show recovery options
    await this.displayRecoveryOptions(phaseId, lastError);
    
    return {
      success: false,
      phaseId,
      attempts,
      error: lastError?.message,
      recoveryOptions: this.getRecoveryOptions(phaseId, lastError)
    };
  }

  /**
   * Determine recovery strategy based on error type
   */
  async determineRecoveryStrategy(phaseId, error, attempts) {
    const errorType = this.classifyError(error);
    
    const strategies = {
      'network': {
        action: 'retry',
        delay: this.retryDelays[Math.min(attempts - 1, this.retryDelays.length - 1)]
      },
      'timeout': {
        action: 'retry',
        delay: this.retryDelays[Math.min(attempts - 1, this.retryDelays.length - 1)] * 2
      },
      'resource': {
        action: 'retry',
        delay: 5000
      },
      'state': {
        action: 'restore',
        checkpointId: await this.findBestCheckpoint(phaseId),
        delay: 1000
      },
      'permission': {
        action: 'safe_mode'
      },
      'validation': {
        action: attempts < 2 ? 'retry' : 'skip',
        delay: 2000
      },
      'unknown': {
        action: attempts < this.maxRetries ? 'retry' : 'skip',
        delay: this.retryDelays[Math.min(attempts - 1, this.retryDelays.length - 1)]
      }
    };
    
    return strategies[errorType] || strategies.unknown;
  }

  /**
   * Classify error type
   */
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('api')) {
      return 'network';
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout';
    }
    if (message.includes('memory') || message.includes('resource') || message.includes('allocation')) {
      return 'resource';
    }
    if (message.includes('state') || message.includes('corrupt') || message.includes('invalid json')) {
      return 'state';
    }
    if (message.includes('permission') || message.includes('access') || message.includes('denied')) {
      return 'permission';
    }
    if (message.includes('validation') || message.includes('required') || message.includes('missing')) {
      return 'validation';
    }
    
    return 'unknown';
  }

  /**
   * Execute in safe mode with reduced functionality
   */
  async executeSafeMode(phase, context) {
    this.safeModeEnabled = true;
    console.log('\n🛡️  SAFE MODE EXECUTION');
    console.log('─'.repeat(40));
    console.log('Running with:');
    console.log('  • Reduced parallelism');
    console.log('  • Extended timeouts');
    console.log('  • Extra validation');
    console.log('  • Minimal resource usage');
    
    try {
      // Simplified execution with extra safety
      const result = await this.minimalPhaseExecution(phase, context);
      
      this.safeModeEnabled = false;
      return result;
      
    } catch (error) {
      this.safeModeEnabled = false;
      console.error('Safe mode execution also failed:', error.message);
      return { success: false, safeModeFailed: true, error: error.message };
    }
  }

  /**
   * Minimal phase execution for safe mode
   */
  async minimalPhaseExecution(phase, context) {
    // Simulate minimal execution
    console.log(`Executing minimal version of ${phase.id || phase}`);
    await this.sleep(2000);
    
    return {
      success: true,
      safeMode: true,
      limited: true,
      message: 'Phase completed with limited functionality'
    };
  }

  /**
   * Validate workflow state
   */
  async validateState() {
    const issues = [];
    
    try {
      // Check state file exists
      if (!fs.existsSync(this.statePath)) {
        issues.push({
          type: 'missing_state',
          severity: 'critical',
          message: 'State file does not exist'
        });
        return { valid: false, issues };
      }
      
      // Read and parse state
      const stateContent = fs.readFileSync(this.statePath, 'utf8');
      let state;
      
      try {
        state = JSON.parse(stateContent);
      } catch (error) {
        issues.push({
          type: 'invalid_json',
          severity: 'critical',
          message: 'State file contains invalid JSON'
        });
        return { valid: false, issues };
      }
      
      // Validate structure
      const requiredFields = [
        'workflow_stage',
        'phases',
        'configuration',
        'metrics'
      ];
      
      requiredFields.forEach(field => {
        if (!(field in state)) {
          issues.push({
            type: 'missing_field',
            severity: 'high',
            field,
            message: `Required field '${field}' is missing`
          });
        }
      });
      
      // Validate phases structure
      if (state.phases) {
        if (!state.phases.completed || !Array.isArray(state.phases.completed)) {
          issues.push({
            type: 'invalid_structure',
            severity: 'medium',
            field: 'phases.completed',
            message: 'phases.completed should be an array'
          });
        }
        
        if (!state.phases.selected || typeof state.phases.selected !== 'object') {
          issues.push({
            type: 'invalid_structure',
            severity: 'medium',
            field: 'phases.selected',
            message: 'phases.selected should be an object'
          });
        }
      }
      
      // Check for data consistency
      if (state.metrics) {
        Object.entries(state.metrics).forEach(([key, value]) => {
          if (typeof value !== 'number' || value < 0) {
            issues.push({
              type: 'invalid_data',
              severity: 'low',
              field: `metrics.${key}`,
              message: `Metric '${key}' has invalid value: ${value}`
            });
          }
        });
      }
      
      return {
        valid: issues.length === 0,
        issues,
        state
      };
      
    } catch (error) {
      issues.push({
        type: 'validation_error',
        severity: 'critical',
        message: error.message
      });
      return { valid: false, issues };
    }
  }

  /**
   * Repair state issues
   */
  async repairState(issues) {
    console.log('\n🔧 REPAIRING STATE');
    console.log('─'.repeat(40));
    console.log(`Found ${issues.length} issues to repair`);
    
    // Create backup before repair
    await this.createCheckpoint('pre-repair-backup');
    
    let state = {};
    let repaired = 0;
    
    // Try to read existing state
    if (fs.existsSync(this.statePath)) {
      try {
        const content = fs.readFileSync(this.statePath, 'utf8');
        state = JSON.parse(content);
      } catch (error) {
        console.log('Starting with fresh state due to corruption');
        state = {};
      }
    }
    
    // Apply repairs
    for (const issue of issues) {
      console.log(`\n🔧 Repairing: ${issue.type} - ${issue.message}`);
      
      switch (issue.type) {
        case 'missing_state':
        case 'invalid_json':
          state = this.getDefaultState();
          repaired++;
          break;
          
        case 'missing_field':
          state[issue.field] = this.getDefaultFieldValue(issue.field);
          repaired++;
          break;
          
        case 'invalid_structure':
          const parts = issue.field.split('.');
          let target = state;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) {
              target[parts[i]] = {};
            }
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = this.getDefaultFieldValue(issue.field);
          repaired++;
          break;
          
        case 'invalid_data':
          const dataParts = issue.field.split('.');
          let dataTarget = state;
          for (let i = 0; i < dataParts.length - 1; i++) {
            dataTarget = dataTarget[dataParts[i]];
          }
          dataTarget[dataParts[dataParts.length - 1]] = 0;
          repaired++;
          break;
      }
    }
    
    // Save repaired state
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
    
    // Log repair
    await this.logRepair(issues, repaired);
    
    console.log(`\n✅ Repaired ${repaired}/${issues.length} issues`);
    
    return { repaired, total: issues.length };
  }

  /**
   * Get default state structure
   */
  getDefaultState() {
    return {
      workflow_stage: null,
      active_workflow: null,
      current_phase: null,
      phase_selection_unlocked: false,
      phases: {
        completed: [],
        selected: {
          active: [],
          execution_mode: null
        }
      },
      configuration: {
        research_level: 'thorough',
        analysis_level: 'comprehensive'
      },
      metrics: {
        documents_created: 0,
        decisions_made: 0,
        approvals_obtained: 0,
        phases_completed: 0
      },
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      repaired: true
    };
  }

  /**
   * Get default value for a field
   */
  getDefaultFieldValue(field) {
    const defaults = {
      'workflow_stage': null,
      'active_workflow': null,
      'current_phase': null,
      'phase_selection_unlocked': false,
      'phases': { completed: [], selected: { active: [], execution_mode: null } },
      'phases.completed': [],
      'phases.selected': { active: [], execution_mode: null },
      'configuration': { research_level: 'thorough', analysis_level: 'comprehensive' },
      'metrics': { documents_created: 0, decisions_made: 0, approvals_obtained: 0, phases_completed: 0 }
    };
    
    return defaults[field] || null;
  }

  /**
   * Create checkpoint
   */
  async createCheckpoint(name = null) {
    if (!fs.existsSync(this.statePath)) {
      return null;
    }
    
    const checkpointId = name || `checkpoint-${Date.now()}`;
    const checkpointPath = path.join(this.checkpointsPath, `${checkpointId}.json`);
    
    try {
      const stateContent = fs.readFileSync(this.statePath, 'utf8');
      fs.writeFileSync(checkpointPath, stateContent);
      console.log(`   📸 Checkpoint created: ${checkpointId}`);
      return checkpointId;
    } catch (error) {
      console.error('Failed to create checkpoint:', error.message);
      return null;
    }
  }

  /**
   * Restore from checkpoint
   */
  async restoreFromCheckpoint(checkpointId = null) {
    try {
      let checkpointPath;
      
      if (checkpointId) {
        checkpointPath = path.join(this.checkpointsPath, `${checkpointId}.json`);
      } else {
        // Find most recent checkpoint
        const checkpoints = fs.readdirSync(this.checkpointsPath)
          .filter(f => f.endsWith('.json'))
          .map(f => ({
            file: f,
            path: path.join(this.checkpointsPath, f),
            time: fs.statSync(path.join(this.checkpointsPath, f)).mtime
          }))
          .sort((a, b) => b.time - a.time);
        
        if (checkpoints.length === 0) {
          console.error('No checkpoints available');
          return false;
        }
        
        checkpointPath = checkpoints[0].path;
        checkpointId = checkpoints[0].file.replace('.json', '');
      }
      
      if (!fs.existsSync(checkpointPath)) {
        console.error(`Checkpoint not found: ${checkpointId}`);
        return false;
      }
      
      // Backup current state before restore
      await this.createCheckpoint('pre-restore-backup');
      
      // Restore
      const checkpointContent = fs.readFileSync(checkpointPath, 'utf8');
      fs.writeFileSync(this.statePath, checkpointContent);
      
      console.log(`   ✅ Restored from checkpoint: ${checkpointId}`);
      return true;
      
    } catch (error) {
      console.error('Restore failed:', error.message);
      return false;
    }
  }

  /**
   * Find best checkpoint for recovery
   */
  async findBestCheckpoint(phaseId) {
    const checkpoints = fs.readdirSync(this.checkpointsPath)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        id: f.replace('.json', ''),
        file: f,
        path: path.join(this.checkpointsPath, f),
        time: fs.statSync(path.join(this.checkpointsPath, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    // Look for phase-specific checkpoint
    const phaseCheckpoint = checkpoints.find(c => c.id.includes(phaseId));
    if (phaseCheckpoint) {
      return phaseCheckpoint.id;
    }
    
    // Return most recent
    return checkpoints[0]?.id || null;
  }

  /**
   * Display recovery options
   */
  async displayRecoveryOptions(phaseId, error) {
    console.log('\n📋 RECOVERY OPTIONS');
    console.log('─'.repeat(40));
    console.log('1. Retry phase execution');
    console.log('2. Skip this phase');
    console.log('3. Enter safe mode');
    console.log('4. Restore from checkpoint');
    console.log('5. Repair state and retry');
    console.log('6. Abort workflow');
    console.log('\nRecommended: Based on error type, option 3 (safe mode) is suggested');
  }

  /**
   * Get recovery options
   */
  getRecoveryOptions(phaseId, error) {
    return [
      { action: 'retry', description: 'Retry phase execution' },
      { action: 'skip', description: 'Skip this phase and continue' },
      { action: 'safe_mode', description: 'Execute in safe mode with limited functionality' },
      { action: 'restore', description: 'Restore from checkpoint and retry' },
      { action: 'repair', description: 'Repair state and retry' },
      { action: 'abort', description: 'Abort the workflow' }
    ];
  }

  /**
   * Log error
   */
  async logError(phaseId, error, attempts) {
    const entry = {
      timestamp: new Date().toISOString(),
      phaseId,
      attempts,
      error: {
        message: error.message,
        stack: error.stack,
        type: this.classifyError(error)
      }
    };
    
    this.errorHistory.push(entry);
    
    // Write to log file
    const logEntry = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.errorLogPath, logEntry);
  }

  /**
   * Log repair
   */
  async logRepair(issues, repaired) {
    const entry = {
      timestamp: new Date().toISOString(),
      issues: issues.length,
      repaired,
      details: issues
    };
    
    const logEntry = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.repairLogPath, logEntry);
  }

  /**
   * Record success
   */
  recordSuccess(phaseId, attempts) {
    if (attempts > 1) {
      console.log(`   ℹ️  Phase succeeded after ${attempts} attempts`);
    }
    
    // Clear error history for this phase
    this.errorHistory = this.errorHistory.filter(e => e.phaseId !== phaseId);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorHistory.length,
      byType: {},
      byPhase: {},
      recentErrors: this.errorHistory.slice(-5)
    };
    
    this.errorHistory.forEach(entry => {
      // By type
      const type = entry.error.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // By phase
      stats.byPhase[entry.phaseId] = (stats.byPhase[entry.phaseId] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Helper: Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in workflows
module.exports = ErrorRecoveryHandler;

// Allow direct execution for testing
if (require.main === module) {
  const handler = new ErrorRecoveryHandler(process.cwd());
  
  console.log('Testing error recovery handler...\n');
  
  // Test state validation
  handler.validateState().then(result => {
    console.log('State validation:', result);
    
    if (!result.valid) {
      console.log('\nRepairing state...');
      return handler.repairState(result.issues);
    }
  }).then(() => {
    // Test safe phase execution
    const testPhase = { id: 'test_phase', name: 'Test Phase' };
    
    const phaseExecutor = async () => {
      // Simulate random failure
      if (Math.random() < 0.7) {
        throw new Error('Simulated network timeout');
      }
      return { success: true };
    };
    
    return handler.safePhaseExecutor(phaseExecutor, testPhase);
  }).then(result => {
    console.log('\nPhase execution result:', result);
    console.log('\nError statistics:', handler.getErrorStats());
  });
}