/**
 * Parallel Execution Coordinator
 * 
 * Manages safe parallel execution of multiple agents
 * Part of Phase 3: Agent Coordination & Visibility
 */

const EventEmitter = require('events');
const path = require('path');

class ParallelExecutionCoordinator extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            maxConcurrentAgents: 5,
            resourceAllocationStrategy: 'balanced',
            conflictResolutionStrategy: 'queue',
            deadlockTimeout: 30 * 60 * 1000, // 30 minutes
            progressUpdateInterval: 30 * 1000 // 30 seconds
        };
        
        // State tracking
        this.activeAgents = new Map();
        this.documentAssignments = new Map();
        this.resourceAllocations = new Map();
        this.executionQueue = [];
        this.completedTasks = [];
        this.conflicts = [];
        
        // Resource pools
        this.resourcePools = {
            memory: 100, // Percentage
            cpu: 100,    // Percentage
            fileHandles: 1000 // Max concurrent file operations
        };
    }

    /**
     * Assign work to agents with conflict prevention
     */
    async assignWork(agents, documents) {
        console.log(`\n🔄 Coordinating work assignment for ${agents.length} agents and ${documents.length} documents`);
        
        // Step 1: Create conflict-free assignments
        const assignments = await this.createConflictFreeAssignments(agents, documents);
        
        // Step 2: Allocate resources
        const resources = await this.allocateResources(assignments);
        
        // Step 3: Create deadlock-free execution plan
        const executionPlan = await this.createDeadlockFreeSchedule(assignments);
        
        // Step 4: Set up conflict resolution handlers
        const conflictHandlers = this.getConflictHandlers();
        
        return {
            assignments,
            resources,
            executionPlan,
            conflictResolution: conflictHandlers,
            summary: this.generateAssignmentSummary(assignments, resources, executionPlan)
        };
    }

    /**
     * Create assignments that prevent file conflicts
     */
    async createConflictFreeAssignments(agents, documents) {
        const assignments = new Map();
        const assignedDocs = new Set();
        const docsByCategory = this.categorizeDocuments(documents);
        
        // Initialize agent assignments
        agents.forEach(agent => {
            assignments.set(agent, {
                agent,
                documents: [],
                dependencies: [],
                priority: this.getAgentPriority(agent),
                estimatedDuration: 0
            });
        });
        
        // Assign documents based on agent expertise and conflict avoidance
        for (const [category, categoryDocs] of Object.entries(docsByCategory)) {
            const eligibleAgents = this.getAgentsForCategory(agents, category);
            
            for (const doc of categoryDocs) {
                // Skip if already assigned
                if (assignedDocs.has(doc.path)) continue;
                
                // Find best agent without conflicts
                const agent = this.findBestAgentForDocument(eligibleAgents, doc, assignments);
                
                if (agent) {
                    const assignment = assignments.get(agent);
                    assignment.documents.push(doc);
                    assignment.estimatedDuration += this.estimateDocumentDuration(doc);
                    assignedDocs.add(doc.path);
                    
                    // Track document assignment for conflict detection
                    this.documentAssignments.set(doc.path, agent);
                }
            }
        }
        
        // Handle unassigned documents
        const unassignedDocs = documents.filter(doc => !assignedDocs.has(doc.path));
        if (unassignedDocs.length > 0) {
            await this.handleUnassignedDocuments(unassignedDocs, assignments);
        }
        
        return assignments;
    }

    /**
     * Allocate resources to assignments
     */
    async allocateResources(assignments) {
        const allocations = new Map();
        const totalAgents = assignments.size;
        
        // Calculate resource shares
        const baseMemoryShare = Math.floor(this.resourcePools.memory / totalAgents);
        const baseCpuShare = Math.floor(this.resourcePools.cpu / totalAgents);
        const baseFileHandles = Math.floor(this.resourcePools.fileHandles / totalAgents);
        
        for (const [agent, assignment] of assignments) {
            const workload = assignment.documents.length;
            const priority = assignment.priority;
            
            // Adjust allocation based on workload and priority
            const memoryAllocation = this.calculateResourceAllocation(
                baseMemoryShare, workload, priority, 'memory'
            );
            const cpuAllocation = this.calculateResourceAllocation(
                baseCpuShare, workload, priority, 'cpu'
            );
            const fileHandleAllocation = Math.min(
                workload * 10, // 10 handles per document
                baseFileHandles
            );
            
            allocations.set(agent, {
                memory: memoryAllocation,
                cpu: cpuAllocation,
                fileHandles: fileHandleAllocation,
                constraints: this.getResourceConstraints(agent)
            });
            
            this.resourceAllocations.set(agent, allocations.get(agent));
        }
        
        return allocations;
    }

    /**
     * Create execution schedule that prevents deadlocks
     */
    async createDeadlockFreeSchedule(assignments) {
        const schedule = {
            phases: [],
            dependencies: new Map(),
            estimatedDuration: 0
        };
        
        // Analyze dependencies between documents
        const dependencies = this.analyzeDependencies(assignments);
        
        // Create execution phases using topological sort
        const phases = this.createExecutionPhases(assignments, dependencies);
        
        // Optimize phase scheduling
        const optimizedPhases = this.optimizePhaseScheduling(phases);
        
        schedule.phases = optimizedPhases;
        schedule.dependencies = dependencies;
        schedule.estimatedDuration = this.calculateTotalDuration(optimizedPhases);
        
        return schedule;
    }

    /**
     * Get conflict resolution handlers
     */
    getConflictHandlers() {
        return {
            fileConflict: this.handleFileConflict.bind(this),
            resourceConflict: this.handleResourceConflict.bind(this),
            dependencyConflict: this.handleDependencyConflict.bind(this),
            deadlockDetected: this.handleDeadlock.bind(this)
        };
    }

    /**
     * Start parallel execution
     */
    async executeInParallel(executionPlan) {
        console.log('\n🚀 Starting parallel execution...');
        
        const results = {
            completed: [],
            failed: [],
            skipped: []
        };
        
        try {
            // Execute phases sequentially, agents in parallel within each phase
            for (const [phaseIndex, phase] of executionPlan.phases.entries()) {
                console.log(`\n📍 Phase ${phaseIndex + 1}/${executionPlan.phases.length}`);
                
                const phaseResults = await this.executePhase(phase);
                
                results.completed.push(...phaseResults.completed);
                results.failed.push(...phaseResults.failed);
                results.skipped.push(...phaseResults.skipped);
                
                // Check for critical failures
                if (phaseResults.failed.some(f => f.critical)) {
                    console.error('❌ Critical failure detected, stopping execution');
                    break;
                }
            }
        } catch (error) {
            console.error('Parallel execution error:', error.message);
            this.emit('execution-error', error);
        }
        
        return results;
    }

    /**
     * Execute a single phase with parallel agents
     */
    async executePhase(phase) {
        const phaseResults = {
            completed: [],
            failed: [],
            skipped: []
        };
        
        // Start progress monitoring
        const progressMonitor = this.startProgressMonitoring(phase);
        
        try {
            // Execute agents in parallel
            const agentPromises = phase.agents.map(agentTask => 
                this.executeAgent(agentTask)
                    .then(result => {
                        phaseResults.completed.push(result);
                        this.emit('agent-completed', result);
                    })
                    .catch(error => {
                        phaseResults.failed.push({
                            agent: agentTask.agent,
                            error: error.message,
                            critical: this.isAgentCritical(agentTask.agent)
                        });
                        this.emit('agent-failed', { agent: agentTask.agent, error });
                    })
            );
            
            // Wait for all agents to complete
            await Promise.allSettled(agentPromises);
            
        } finally {
            // Stop progress monitoring
            clearInterval(progressMonitor);
        }
        
        return phaseResults;
    }

    /**
     * Execute single agent task
     */
    async executeAgent(agentTask) {
        const { agent, documents } = agentTask;
        
        // Register agent as active
        this.activeAgents.set(agent, {
            startTime: new Date(),
            documents,
            status: 'running'
        });
        
        try {
            // Simulate agent execution
            // In real implementation, this would invoke the actual agent
            const result = await this.simulateAgentExecution(agent, documents);
            
            // Update tracking
            this.activeAgents.delete(agent);
            this.completedTasks.push({
                agent,
                documents: documents.length,
                duration: Date.now() - this.activeAgents.get(agent).startTime,
                timestamp: new Date()
            });
            
            return result;
            
        } catch (error) {
            this.activeAgents.delete(agent);
            throw error;
        }
    }

    /**
     * Handle file conflicts
     */
    async handleFileConflict(conflict) {
        console.warn(`⚠️ File conflict detected: ${conflict.file}`);
        
        switch (this.config.conflictResolutionStrategy) {
            case 'queue':
                // Queue the second agent
                this.executionQueue.push(conflict.agent2);
                return { action: 'queued', agent: conflict.agent2 };
                
            case 'priority':
                // Give priority to higher priority agent
                const priority1 = this.getAgentPriority(conflict.agent1);
                const priority2 = this.getAgentPriority(conflict.agent2);
                
                if (priority1 >= priority2) {
                    this.executionQueue.push(conflict.agent2);
                    return { action: 'queued', agent: conflict.agent2 };
                } else {
                    // Pause agent1, let agent2 proceed
                    return { action: 'pause', agent: conflict.agent1 };
                }
                
            case 'split':
                // Split the work
                return { action: 'split', file: conflict.file };
                
            default:
                throw new Error(`Unknown conflict resolution strategy: ${this.config.conflictResolutionStrategy}`);
        }
    }

    /**
     * Handle resource conflicts
     */
    async handleResourceConflict(conflict) {
        console.warn(`⚠️ Resource conflict: ${conflict.resource}`);
        
        // Reduce resource allocation for all agents
        const reduction = 0.8; // Reduce to 80%
        
        for (const [agent, allocation] of this.resourceAllocations) {
            allocation[conflict.resource] *= reduction;
        }
        
        return { action: 'reduced', resource: conflict.resource, factor: reduction };
    }

    /**
     * Handle dependency conflicts
     */
    async handleDependencyConflict(conflict) {
        console.warn(`⚠️ Dependency conflict: ${conflict.description}`);
        
        // Reorder execution to resolve dependency
        return { action: 'reorder', conflict };
    }

    /**
     * Handle deadlock detection
     */
    async handleDeadlock(deadlock) {
        console.error('🔒 Deadlock detected!');
        
        // Kill lowest priority agent
        const agents = Array.from(this.activeAgents.keys());
        const lowestPriorityAgent = agents.reduce((lowest, agent) => {
            const priority = this.getAgentPriority(agent);
            const lowestPriority = this.getAgentPriority(lowest);
            return priority < lowestPriority ? agent : lowest;
        });
        
        // Terminate agent
        this.activeAgents.delete(lowestPriorityAgent);
        
        return { action: 'terminated', agent: lowestPriorityAgent };
    }

    /**
     * Helper methods
     */
    
    categorizeDocuments(documents) {
        const categories = {};
        
        for (const doc of documents) {
            const category = doc.category || 'general';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(doc);
        }
        
        return categories;
    }

    getAgentsForCategory(agents, category) {
        // Map categories to suitable agents
        const categoryAgentMap = {
            'research': ['research_agent', 'analysis_agent'],
            'requirements': ['prd_agent', 'project_manager_agent'],
            'technical': ['coder_agent', 'devops_agent', 'dba_agent'],
            'design': ['ui_ux_agent'],
            'testing': ['testing_agent'],
            'security': ['security_agent'],
            'general': agents
        };
        
        const suitable = categoryAgentMap[category] || agents;
        return agents.filter(agent => suitable.includes(agent));
    }

    findBestAgentForDocument(eligibleAgents, document, currentAssignments) {
        let bestAgent = null;
        let minWorkload = Infinity;
        
        for (const agent of eligibleAgents) {
            const assignment = currentAssignments.get(agent);
            const workload = assignment.documents.length;
            
            // Check for conflicts
            const hasConflict = assignment.documents.some(doc => 
                this.detectFileConflict(doc, document)
            );
            
            if (!hasConflict && workload < minWorkload) {
                bestAgent = agent;
                minWorkload = workload;
            }
        }
        
        return bestAgent;
    }

    detectFileConflict(doc1, doc2) {
        // Documents conflict if they're the same file or in same directory
        if (doc1.path === doc2.path) return true;
        
        const dir1 = path.dirname(doc1.path);
        const dir2 = path.dirname(doc2.path);
        
        // Avoid conflicts in same directory for certain operations
        if (dir1 === dir2 && (doc1.operation === 'write' || doc2.operation === 'write')) {
            return true;
        }
        
        return false;
    }

    getAgentPriority(agent) {
        const priorities = {
            'project_analyzer_agent': 10,
            'research_agent': 8,
            'prd_agent': 7,
            'coder_agent': 6,
            'testing_agent': 5,
            'security_agent': 9,
            'devops_agent': 4
        };
        
        return priorities[agent] || 5;
    }

    estimateDocumentDuration(doc) {
        // Estimate based on document type and size
        const baseTime = 60 * 1000; // 1 minute base
        const sizeMultiplier = (doc.size || 1000) / 1000; // Per KB
        
        return baseTime * sizeMultiplier;
    }

    calculateResourceAllocation(base, workload, priority, resourceType) {
        // Higher priority and workload get more resources
        const priorityMultiplier = priority / 5; // Normalize to 0-2
        const workloadMultiplier = Math.log(workload + 1) / Math.log(10); // Logarithmic scaling
        
        return Math.min(
            base * priorityMultiplier * workloadMultiplier,
            this.resourcePools[resourceType] * 0.5 // Max 50% of total
        );
    }

    getResourceConstraints(agent) {
        // Agent-specific resource constraints
        const constraints = {
            'research_agent': { memory: 30, cpu: 40 }, // Heavy processing
            'coder_agent': { memory: 25, cpu: 30, fileHandles: 200 },
            'testing_agent': { memory: 20, cpu: 35 }
        };
        
        return constraints[agent] || { memory: 20, cpu: 20, fileHandles: 100 };
    }

    analyzeDependencies(assignments) {
        const dependencies = new Map();
        
        // Analyze document dependencies
        for (const [agent, assignment] of assignments) {
            const deps = [];
            
            for (const doc of assignment.documents) {
                // Check if document depends on others
                if (doc.dependencies) {
                    deps.push(...doc.dependencies);
                }
            }
            
            if (deps.length > 0) {
                dependencies.set(agent, deps);
            }
        }
        
        return dependencies;
    }

    createExecutionPhases(assignments, dependencies) {
        const phases = [];
        const executed = new Set();
        const assignmentMap = new Map(assignments);
        
        while (executed.size < assignments.size) {
            const phase = {
                agents: [],
                parallel: true
            };
            
            // Find agents that can execute in this phase
            for (const [agent, assignment] of assignmentMap) {
                if (executed.has(agent)) continue;
                
                // Check if dependencies are satisfied
                const agentDeps = dependencies.get(agent) || [];
                const depsReady = agentDeps.every(dep => executed.has(dep));
                
                if (depsReady) {
                    phase.agents.push({ agent, ...assignment });
                }
            }
            
            // Add phase and mark agents as executed
            if (phase.agents.length > 0) {
                phases.push(phase);
                phase.agents.forEach(a => executed.add(a.agent));
            } else {
                // Prevent infinite loop - force progress
                const remaining = Array.from(assignmentMap.keys()).filter(a => !executed.has(a));
                if (remaining.length > 0) {
                    phase.agents.push({ agent: remaining[0], ...assignmentMap.get(remaining[0]) });
                    phases.push(phase);
                    executed.add(remaining[0]);
                }
            }
        }
        
        return phases;
    }

    optimizePhaseScheduling(phases) {
        // Balance phases for optimal parallelization
        const optimized = [];
        
        for (const phase of phases) {
            if (phase.agents.length > this.config.maxConcurrentAgents) {
                // Split large phases
                const chunks = this.chunkArray(phase.agents, this.config.maxConcurrentAgents);
                chunks.forEach(chunk => {
                    optimized.push({ agents: chunk, parallel: true });
                });
            } else {
                optimized.push(phase);
            }
        }
        
        return optimized;
    }

    calculateTotalDuration(phases) {
        let totalDuration = 0;
        
        for (const phase of phases) {
            // Duration of phase is the max duration of any agent
            const phaseDuration = Math.max(
                ...phase.agents.map(a => a.estimatedDuration || 0)
            );
            totalDuration += phaseDuration;
        }
        
        return totalDuration;
    }

    handleUnassignedDocuments(unassignedDocs, assignments) {
        // Distribute unassigned documents evenly
        const agents = Array.from(assignments.keys());
        let agentIndex = 0;
        
        for (const doc of unassignedDocs) {
            const agent = agents[agentIndex % agents.length];
            const assignment = assignments.get(agent);
            
            assignment.documents.push(doc);
            assignment.estimatedDuration += this.estimateDocumentDuration(doc);
            
            this.documentAssignments.set(doc.path, agent);
            agentIndex++;
        }
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    startProgressMonitoring(phase) {
        return setInterval(() => {
            const progress = this.calculatePhaseProgress(phase);
            this.emit('progress-update', {
                phase: phase.agents.map(a => a.agent),
                progress,
                timestamp: new Date()
            });
        }, this.config.progressUpdateInterval);
    }

    calculatePhaseProgress(phase) {
        // Calculate based on active agents
        const totalAgents = phase.agents.length;
        const completedAgents = phase.agents.filter(a => 
            !this.activeAgents.has(a.agent)
        ).length;
        
        return {
            percentage: Math.round((completedAgents / totalAgents) * 100),
            completed: completedAgents,
            total: totalAgents
        };
    }

    isAgentCritical(agent) {
        const criticalAgents = [
            'project_analyzer_agent',
            'research_agent',
            'prd_agent'
        ];
        
        return criticalAgents.includes(agent);
    }

    simulateAgentExecution(agent, documents) {
        // Simulate agent work
        return new Promise((resolve) => {
            const duration = Math.random() * 5000 + 1000; // 1-6 seconds
            
            setTimeout(() => {
                resolve({
                    agent,
                    documentsProcessed: documents.length,
                    duration,
                    status: 'completed'
                });
            }, duration);
        });
    }

    generateAssignmentSummary(assignments, resources, executionPlan) {
        const summary = {
            totalAgents: assignments.size,
            totalDocuments: Array.from(assignments.values()).reduce(
                (sum, a) => sum + a.documents.length, 0
            ),
            phases: executionPlan.phases.length,
            estimatedDuration: this.formatDuration(executionPlan.estimatedDuration),
            parallelizationRatio: this.calculateParallelizationRatio(executionPlan),
            resourceUtilization: this.calculateResourceUtilization(resources)
        };
        
        return summary;
    }

    calculateParallelizationRatio(executionPlan) {
        const totalAgents = executionPlan.phases.reduce(
            (sum, phase) => sum + phase.agents.length, 0
        );
        const phases = executionPlan.phases.length;
        
        return Math.round((totalAgents / phases) * 100) / 100;
    }

    calculateResourceUtilization(resources) {
        let totalMemory = 0;
        let totalCpu = 0;
        
        for (const allocation of resources.values()) {
            totalMemory += allocation.memory;
            totalCpu += allocation.cpu;
        }
        
        return {
            memory: Math.min(totalMemory, 100),
            cpu: Math.min(totalCpu, 100)
        };
    }

    formatDuration(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }
}

module.exports = ParallelExecutionCoordinator;