/**
 * Parallel Execution Coordinator
 * Manages parallel execution of independent phases and agents
 */

const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');
const EventEmitter = require('events');

class ParallelExecutionCoordinator extends EventEmitter {
  constructor(projectRoot) {
    super();
    this.projectRoot = projectRoot || process.cwd();
    this.configPath = path.join(this.projectRoot, 'machine-data', 'workflow-phase-configuration.json');
    this.resourcePoolPath = path.join(this.projectRoot, 'machine-data', 'resource-pools.json');
    
    this.activeExecutions = new Map();
    this.resourcePools = this.initializeResourcePools();
    this.dependencyGraph = new Map();
    this.executionQueue = [];
    this.maxConcurrency = 5; // Default max concurrent executions
    
    this.loadConfiguration();
  }

  /**
   * Initialize resource pools
   */
  initializeResourcePools() {
    const defaultPools = {
      memory: {
        total: 1024, // MB
        available: 1024,
        allocations: {}
      },
      cpu: {
        total: 100, // percentage
        available: 100,
        allocations: {}
      },
      fileHandles: {
        total: 100,
        available: 100,
        allocations: {}
      },
      documents: {
        // Prevent document conflicts
        locked: new Set(),
        writeQueue: new Map()
      }
    };

    try {
      if (fs.existsSync(this.resourcePoolPath)) {
        const poolsContent = fs.readFileSync(this.resourcePoolPath, 'utf8');
        return { ...defaultPools, ...JSON.parse(poolsContent) };
      }
    } catch (error) {
      console.error('Error loading resource pools:', error);
    }

    return defaultPools;
  }

  /**
   * Load phase configuration
   */
  loadConfiguration() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configContent = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configContent);
        this.buildDependencyGraph();
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  }

  /**
   * Build dependency graph for phases
   */
  buildDependencyGraph() {
    // Clear existing graph
    this.dependencyGraph.clear();

    // Process all workflows
    Object.keys(this.config.workflows).forEach(workflowType => {
      const workflow = this.config.workflows[workflowType];
      
      Object.keys(workflow.stages).forEach(stage => {
        const phases = workflow.stages[stage].phases;
        
        phases.forEach(phase => {
          const key = `${workflowType}.${stage}.${phase.id}`;
          
          this.dependencyGraph.set(key, {
            phase,
            dependencies: phase.dependencies || [],
            dependents: [],
            canParallelize: phase.execution === 'parallel',
            resourceRequirements: this.getResourceRequirements(phase)
          });
        });
        
        // Build dependents list
        phases.forEach(phase => {
          const key = `${workflowType}.${stage}.${phase.id}`;
          const node = this.dependencyGraph.get(key);
          
          if (node && node.dependencies.length > 0) {
            node.dependencies.forEach(dep => {
              const depKey = `${workflowType}.${stage}.${dep}`;
              const depNode = this.dependencyGraph.get(depKey);
              if (depNode) {
                depNode.dependents.push(phase.id);
              }
            });
          }
        });
      });
    });
  }

  /**
   * Get resource requirements for a phase
   */
  getResourceRequirements(phase) {
    // Estimate based on phase type and agents
    const baseRequirements = {
      memory: 50, // MB
      cpu: 10, // percentage
      fileHandles: 5
    };

    // Adjust based on phase characteristics
    if (phase.agents && phase.agents.length > 1) {
      baseRequirements.memory *= phase.agents.length;
      baseRequirements.cpu *= phase.agents.length;
    }

    if (phase.category === 'research') {
      baseRequirements.memory *= 2;
      baseRequirements.fileHandles *= 3;
    }

    if (phase.category === 'implementation') {
      baseRequirements.cpu *= 2;
      baseRequirements.fileHandles *= 2;
    }

    return baseRequirements;
  }

  /**
   * Check if resources are available
   */
  canAllocateResources(requirements) {
    return (
      this.resourcePools.memory.available >= requirements.memory &&
      this.resourcePools.cpu.available >= requirements.cpu &&
      this.resourcePools.fileHandles.available >= requirements.fileHandles
    );
  }

  /**
   * Allocate resources for execution
   */
  allocateResources(executionId, requirements) {
    this.resourcePools.memory.available -= requirements.memory;
    this.resourcePools.memory.allocations[executionId] = requirements.memory;

    this.resourcePools.cpu.available -= requirements.cpu;
    this.resourcePools.cpu.allocations[executionId] = requirements.cpu;

    this.resourcePools.fileHandles.available -= requirements.fileHandles;
    this.resourcePools.fileHandles.allocations[executionId] = requirements.fileHandles;

    this.emit('resources-allocated', { executionId, requirements });
  }

  /**
   * Release resources after execution
   */
  releaseResources(executionId) {
    const memoryAllocation = this.resourcePools.memory.allocations[executionId];
    if (memoryAllocation) {
      this.resourcePools.memory.available += memoryAllocation;
      delete this.resourcePools.memory.allocations[executionId];
    }

    const cpuAllocation = this.resourcePools.cpu.allocations[executionId];
    if (cpuAllocation) {
      this.resourcePools.cpu.available += cpuAllocation;
      delete this.resourcePools.cpu.allocations[executionId];
    }

    const fileAllocation = this.resourcePools.fileHandles.allocations[executionId];
    if (fileAllocation) {
      this.resourcePools.fileHandles.available += fileAllocation;
      delete this.resourcePools.fileHandles.allocations[executionId];
    }

    this.emit('resources-released', { executionId });
  }

  /**
   * Execute phases in parallel
   */
  async executeParallel(phases, workflowType = 'new-project', stage = 'operations') {
    console.log('\n🚀 PARALLEL EXECUTION COORDINATOR');
    console.log('═'.repeat(60));
    console.log(`Phases to execute: ${phases.length}`);
    console.log(`Max concurrency: ${this.maxConcurrency}`);
    
    // Create execution plan
    const executionPlan = this.createExecutionPlan(phases, workflowType, stage);
    
    // Display execution plan
    this.displayExecutionPlan(executionPlan);
    
    // Execute plan
    const results = await this.executePlan(executionPlan);
    
    // Display results
    this.displayExecutionResults(results);
    
    return results;
  }

  /**
   * Create execution plan based on dependencies
   */
  createExecutionPlan(phases, workflowType, stage) {
    const plan = {
      waves: [],
      totalTime: 0,
      parallelReduction: 0
    };

    // Group phases into waves based on dependencies
    const remaining = new Set(phases);
    const completed = new Set();
    
    while (remaining.size > 0) {
      const wave = [];
      
      for (const phaseId of remaining) {
        const key = `${workflowType}.${stage}.${phaseId}`;
        const node = this.dependencyGraph.get(key);
        
        if (!node) {
          // Phase not in dependency graph, can execute
          wave.push(phaseId);
        } else {
          // Check if all dependencies are completed
          const depsCompleted = node.dependencies.every(dep => 
            completed.has(dep) || !phases.includes(dep)
          );
          
          if (depsCompleted) {
            wave.push(phaseId);
          }
        }
      }
      
      if (wave.length === 0 && remaining.size > 0) {
        // Deadlock detected - force execute remaining
        console.warn('⚠️  Dependency deadlock detected, forcing execution');
        wave.push(...remaining);
      }
      
      // Remove wave phases from remaining
      wave.forEach(phaseId => {
        remaining.delete(phaseId);
        completed.add(phaseId);
      });
      
      plan.waves.push(wave);
    }

    // Calculate time estimates
    this.calculateTimeEstimates(plan, workflowType, stage);
    
    return plan;
  }

  /**
   * Calculate time estimates for execution plan
   */
  calculateTimeEstimates(plan, workflowType, stage) {
    let sequentialTime = 0;
    let parallelTime = 0;
    
    plan.waves.forEach(wave => {
      let waveMaxTime = 0;
      
      wave.forEach(phaseId => {
        const key = `${workflowType}.${stage}.${phaseId}`;
        const node = this.dependencyGraph.get(key);
        
        if (node && node.phase.estimated_time) {
          const time = this.parseTimeEstimate(node.phase.estimated_time);
          sequentialTime += time;
          waveMaxTime = Math.max(waveMaxTime, time);
        }
      });
      
      parallelTime += waveMaxTime;
    });
    
    plan.totalTime = parallelTime;
    plan.sequentialTime = sequentialTime;
    plan.parallelReduction = sequentialTime > 0 
      ? Math.round((1 - parallelTime / sequentialTime) * 100)
      : 0;
  }

  /**
   * Parse time estimate string to minutes
   */
  parseTimeEstimate(timeStr) {
    const match = timeStr.match(/(\d+)-(\d+)\s*(hours?|days?|minutes?)/);
    if (!match) return 60; // Default 1 hour
    
    const avg = (parseInt(match[1]) + parseInt(match[2])) / 2;
    const unit = match[3];
    
    if (unit.startsWith('minute')) return avg;
    if (unit.startsWith('hour')) return avg * 60;
    if (unit.startsWith('day')) return avg * 8 * 60;
    
    return 60;
  }

  /**
   * Display execution plan
   */
  displayExecutionPlan(plan) {
    console.log('\n📋 EXECUTION PLAN');
    console.log('─'.repeat(40));
    
    plan.waves.forEach((wave, index) => {
      console.log(`\nWave ${index + 1} (${wave.length} phases in parallel):`);
      wave.forEach(phaseId => {
        console.log(`  • ${phaseId}`);
      });
    });
    
    console.log('\n⏱️  TIME ESTIMATES');
    console.log('─'.repeat(40));
    console.log(`Sequential time: ${Math.round(plan.sequentialTime / 60)} hours`);
    console.log(`Parallel time: ${Math.round(plan.totalTime / 60)} hours`);
    console.log(`Time saved: ${plan.parallelReduction}%`);
  }

  /**
   * Execute the plan
   */
  async executePlan(plan) {
    const results = {
      waves: [],
      successful: [],
      failed: [],
      startTime: Date.now(),
      endTime: null
    };

    for (let i = 0; i < plan.waves.length; i++) {
      const wave = plan.waves[i];
      console.log(`\n${'━'.repeat(60)}`);
      console.log(`EXECUTING WAVE ${i + 1}/${plan.waves.length}`);
      console.log('━'.repeat(60));
      
      const waveResults = await this.executeWave(wave);
      results.waves.push(waveResults);
      
      // Collect results
      waveResults.forEach(result => {
        if (result.success) {
          results.successful.push(result.phaseId);
        } else {
          results.failed.push(result.phaseId);
        }
      });
      
      // Check for failures that would block next wave
      if (results.failed.length > 0) {
        console.warn('⚠️  Some phases failed, checking if we can continue...');
        // In real implementation, would check if failures block dependencies
      }
    }

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    
    return results;
  }

  /**
   * Execute a wave of parallel phases
   */
  async executeWave(phaseIds) {
    const executions = phaseIds.map(phaseId => this.executePhase(phaseId));
    
    // Wait for all to complete
    const results = await Promise.allSettled(executions);
    
    return results.map((result, index) => ({
      phaseId: phaseIds[index],
      success: result.status === 'fulfilled',
      value: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  /**
   * Execute individual phase
   */
  async executePhase(phaseId) {
    const executionId = `${phaseId}_${Date.now()}`;
    
    console.log(`\n⚙️  Starting: ${phaseId}`);
    
    // Check resource availability
    const requirements = { memory: 50, cpu: 10, fileHandles: 5 };
    
    // Wait for resources if needed
    let attempts = 0;
    while (!this.canAllocateResources(requirements) && attempts < 10) {
      console.log(`   ⏳ Waiting for resources (${phaseId})...`);
      await this.sleep(1000);
      attempts++;
    }
    
    if (!this.canAllocateResources(requirements)) {
      throw new Error(`Resource allocation timeout for ${phaseId}`);
    }
    
    // Allocate resources
    this.allocateResources(executionId, requirements);
    
    try {
      // Track active execution
      this.activeExecutions.set(executionId, {
        phaseId,
        startTime: Date.now(),
        status: 'running'
      });
      
      // Simulate phase execution
      await this.simulatePhaseExecution(phaseId);
      
      // Mark as complete
      const execution = this.activeExecutions.get(executionId);
      execution.status = 'complete';
      execution.endTime = Date.now();
      
      console.log(`   ✅ Complete: ${phaseId}`);
      
      return {
        phaseId,
        executionId,
        duration: execution.endTime - execution.startTime
      };
      
    } catch (error) {
      console.error(`   ❌ Failed: ${phaseId}`, error.message);
      
      const execution = this.activeExecutions.get(executionId);
      if (execution) {
        execution.status = 'failed';
        execution.error = error.message;
      }
      
      throw error;
      
    } finally {
      // Release resources
      this.releaseResources(executionId);
      
      // Clean up execution tracking
      setTimeout(() => {
        this.activeExecutions.delete(executionId);
      }, 5000);
    }
  }

  /**
   * Simulate phase execution
   */
  async simulatePhaseExecution(phaseId) {
    // In real implementation, would execute actual phase logic
    const duration = Math.random() * 3000 + 1000; // 1-4 seconds
    await this.sleep(duration);
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error(`Simulated failure for ${phaseId}`);
    }
  }

  /**
   * Display execution results
   */
  displayExecutionResults(results) {
    console.log('\n' + '═'.repeat(60));
    console.log('PARALLEL EXECUTION COMPLETE');
    console.log('═'.repeat(60));
    
    console.log('\n📊 RESULTS SUMMARY');
    console.log('─'.repeat(40));
    console.log(`Total phases: ${results.successful.length + results.failed.length}`);
    console.log(`Successful: ${results.successful.length}`);
    console.log(`Failed: ${results.failed.length}`);
    console.log(`Duration: ${Math.round(results.duration / 1000)}s`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ FAILED PHASES:');
      results.failed.forEach(phaseId => {
        console.log(`  • ${phaseId}`);
      });
    }
    
    console.log('\n💾 RESOURCE USAGE');
    console.log('─'.repeat(40));
    console.log(`Memory: ${this.resourcePools.memory.available}/${this.resourcePools.memory.total} MB available`);
    console.log(`CPU: ${this.resourcePools.cpu.available}/${this.resourcePools.cpu.total}% available`);
    console.log(`File handles: ${this.resourcePools.fileHandles.available}/${this.resourcePools.fileHandles.total} available`);
  }

  /**
   * Resolve document conflicts
   */
  async resolveDocumentConflict(docPath, writers) {
    console.log(`\n⚠️  Document conflict detected: ${docPath}`);
    console.log(`   Writers: ${writers.join(', ')}`);
    
    // Strategy: Queue writes
    if (!this.resourcePools.documents.writeQueue.has(docPath)) {
      this.resourcePools.documents.writeQueue.set(docPath, []);
    }
    
    const queue = this.resourcePools.documents.writeQueue.get(docPath);
    writers.forEach(writer => {
      if (!queue.includes(writer)) {
        queue.push(writer);
      }
    });
    
    console.log(`   Resolution: Queued ${writers.length} write operations`);
  }

  /**
   * Get execution status
   */
  getStatus() {
    const active = Array.from(this.activeExecutions.values());
    
    return {
      activeExecutions: active.length,
      executions: active,
      resourceUsage: {
        memory: {
          used: this.resourcePools.memory.total - this.resourcePools.memory.available,
          total: this.resourcePools.memory.total
        },
        cpu: {
          used: this.resourcePools.cpu.total - this.resourcePools.cpu.available,
          total: this.resourcePools.cpu.total
        },
        fileHandles: {
          used: this.resourcePools.fileHandles.total - this.resourcePools.fileHandles.available,
          total: this.resourcePools.fileHandles.total
        }
      },
      documentLocks: Array.from(this.resourcePools.documents.locked),
      writeQueues: Array.from(this.resourcePools.documents.writeQueue.keys())
    };
  }

  /**
   * Helper: Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in workflows
module.exports = ParallelExecutionCoordinator;

// Allow direct execution for testing
if (require.main === module) {
  const coordinator = new ParallelExecutionCoordinator(process.cwd());
  
  // Test parallel execution
  const testPhases = [
    'market_research',
    'competitive_analysis',
    'customer_research',
    'technical_analysis',
    'financial_analysis'
  ];
  
  console.log('Testing parallel execution coordinator...\n');
  
  coordinator.executeParallel(testPhases).then(results => {
    console.log('\n\nFinal results:', JSON.stringify(results, null, 2));
  }).catch(error => {
    console.error('Execution failed:', error);
  });
}