/**
 * Sprint Code Coordinator
 * Manages parallel code execution during sprints with smart conflict prevention
 */

const SubAgentOrchestrator = require('./sub-agent-orchestrator');
const TokenBudgetManager = require('./token-budget-manager');
const DocumentRegistryManager = require('./document-registry-manager');
const fs = require('fs').promises;
const path = require('path');

class SprintCodeCoordinator {
  constructor() {
    this.orchestrator = new SubAgentOrchestrator();
    this.tokenManager = new TokenBudgetManager();
    this.registryManager = new DocumentRegistryManager();
    this.sprintBasePath = path.join(__dirname, '..', 'project-documents', 'orchestration', 'sprints');
    this.maxParallelCoders = 3;
  }

  /**
   * Initialize the sprint coordination system
   */
  async initialize(sprintName) {
    await this.orchestrator.initialize();
    await this.registryManager.initialize();
    this.currentSprint = sprintName;
    this.sprintPath = path.join(this.sprintBasePath, sprintName);
    await fs.mkdir(this.sprintPath, { recursive: true });
  }

  /**
   * Coordinate parallel sprint execution
   * @param {Array} sprintBacklog - Stories in the sprint
   * @param {Object} projectContext - Project information
   */
  async coordinateSprintExecution(sprintBacklog, projectContext) {
    console.log(`\n🚀 Starting parallel sprint execution for ${this.currentSprint}...`);
    
    // Step 1: Analyze story dependencies
    const dependencies = await this.analyzeStoryDependencies(sprintBacklog);
    
    // Step 2: Create ownership map
    const ownership = await this.assignFileOwnership(dependencies);
    
    // Step 3: Write coordination document
    await this.writeCoordinationDocument(ownership);
    
    // Step 4: Create work packages
    const workPackages = this.createWorkPackages(ownership, projectContext);
    
    // Step 5: Launch parallel execution
    console.log(`\n👥 Launching ${workPackages.length} coder sub-agents in parallel...`);
    const startTime = Date.now();
    
    const results = await this.orchestrator.launchSubAgents(workPackages);
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Parallel development completed in ${duration} seconds`);
    
    // Step 6: Handle integration phase
    const integrated = await this.integrateCode(results, ownership.sharedFiles);
    
    // Step 7: Update coordination status
    await this.updateCoordinationStatus('completed', integrated);
    
    return {
      execution: integrated,
      metrics: {
        duration,
        parallelCoders: workPackages.length,
        storiesCompleted: integrated.completedStories,
        conflicts: integrated.conflicts
      }
    };
  }

  /**
   * Analyze story dependencies to identify conflicts
   */
  async analyzeStoryDependencies(stories) {
    const dependencies = {
      fileUsage: new Map(),     // file -> [stories using it]
      storyDeps: new Map(),     // story -> [files it needs]
      conflicts: [],
      sharedFiles: new Set()
    };

    // Analyze each story
    for (const story of stories) {
      const files = this.extractFilesFromStory(story);
      dependencies.storyDeps.set(story.id, files);
      
      // Track file usage
      for (const file of files) {
        if (!dependencies.fileUsage.has(file)) {
          dependencies.fileUsage.set(file, []);
        }
        dependencies.fileUsage.get(file).push(story.id);
        
        // Mark as shared if multiple stories use it
        if (dependencies.fileUsage.get(file).length > 1) {
          dependencies.sharedFiles.add(file);
        }
      }
    }

    // Identify conflicts
    for (const [file, stories] of dependencies.fileUsage) {
      if (stories.length > 1) {
        dependencies.conflicts.push({
          file,
          stories,
          severity: this.assessConflictSeverity(file, stories)
        });
      }
    }

    return dependencies;
  }

  /**
   * Extract files that a story will modify (simplified version)
   */
  extractFilesFromStory(story) {
    const files = [];
    
    // Extract from story description and acceptance criteria
    const content = `${story.title} ${story.description} ${story.acceptanceCriteria}`;
    
    // Common patterns
    const patterns = [
      /(?:update|modify|create|implement|add)\s+(?:in\s+)?([\/\w\-\.]+\.(?:js|ts|jsx|tsx|css|html))/gi,
      /(?:file|component|module|class):\s*([\/\w\-\.]+)/gi,
      /([\/\w\-]+\/[\w\-\.]+\.(?:js|ts|jsx|tsx|css|html))/gi
    ];
    
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !files.includes(match[1])) {
          files.push(match[1]);
        }
      }
    }
    
    // If no files found, infer from story type
    if (files.length === 0) {
      files.push(...this.inferFilesFromStoryType(story));
    }
    
    return files;
  }

  /**
   * Infer files based on story type
   */
  inferFilesFromStoryType(story) {
    const title = story.title.toLowerCase();
    const files = [];
    
    if (title.includes('api') || title.includes('endpoint')) {
      files.push('/api/routes.js', '/api/controllers/*.js');
    } else if (title.includes('ui') || title.includes('component')) {
      files.push('/components/*.jsx', '/styles/*.css');
    } else if (title.includes('auth')) {
      files.push('/api/auth/*.js', '/middleware/auth.js');
    } else if (title.includes('database') || title.includes('model')) {
      files.push('/models/*.js', '/db/migrations/*.js');
    }
    
    return files;
  }

  /**
   * Assess conflict severity
   */
  assessConflictSeverity(file, stories) {
    // Critical files that shouldn't be modified in parallel
    const criticalFiles = ['package.json', 'db/schema.js', 'config/index.js'];
    
    if (criticalFiles.some(cf => file.includes(cf))) {
      return 'critical';
    }
    
    if (stories.length > 2) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Assign file ownership to prevent conflicts
   */
  async assignFileOwnership(dependencies) {
    const ownership = {
      assignments: [],
      sharedFiles: Array.from(dependencies.sharedFiles),
      conflictResolution: []
    };

    // Group stories by non-conflicting sets
    const storyGroups = this.groupNonConflictingStories(dependencies);
    
    // Create assignments
    let subAgentId = 1;
    for (const group of storyGroups) {
      if (subAgentId > this.maxParallelCoders) {
        // Merge with existing assignment
        ownership.assignments[0].stories.push(...group.stories);
        ownership.assignments[0].ownedFiles.push(...group.files);
      } else {
        ownership.assignments.push({
          id: subAgentId++,
          stories: group.stories,
          ownedFiles: group.files,
          readOnlyFiles: this.getReadOnlyFiles(group.files)
        });
      }
    }

    // Handle critical conflicts
    for (const conflict of dependencies.conflicts) {
      if (conflict.severity === 'critical') {
        ownership.conflictResolution.push({
          file: conflict.file,
          resolution: 'sequential',
          order: conflict.stories
        });
      }
    }

    return ownership;
  }

  /**
   * Group stories that don't conflict
   */
  groupNonConflictingStories(dependencies) {
    const groups = [];
    const assigned = new Set();
    
    for (const [storyId, files] of dependencies.storyDeps) {
      if (assigned.has(storyId)) continue;
      
      const group = {
        stories: [storyId],
        files: [...files]
      };
      
      // Try to add more non-conflicting stories
      for (const [otherId, otherFiles] of dependencies.storyDeps) {
        if (assigned.has(otherId) || otherId === storyId) continue;
        
        // Check if files conflict
        const hasConflict = otherFiles.some(f => group.files.includes(f));
        if (!hasConflict) {
          group.stories.push(otherId);
          group.files.push(...otherFiles);
          assigned.add(otherId);
        }
      }
      
      assigned.add(storyId);
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Get read-only files (common dependencies)
   */
  getReadOnlyFiles(ownedFiles) {
    const commonFiles = [
      '/config/*',
      '/utils/*',
      '/types/*',
      '/constants/*'
    ];
    
    return commonFiles.filter(f => !ownedFiles.some(of => of.includes(f)));
  }

  /**
   * Write coordination document
   */
  async writeCoordinationDocument(ownership) {
    const coordPath = path.join(this.sprintPath, 'code-coordination.md');
    
    let content = `# Sprint Code Coordination

**Sprint**: ${this.currentSprint}
**Generated**: ${new Date().toISOString()}
**Parallel Coders**: ${ownership.assignments.length}

## File Ownership Map

| File/Module | Owner | Stories | Status | Updated |
|-------------|-------|---------|--------|---------|
`;

    // Add ownership entries
    for (const assignment of ownership.assignments) {
      for (const file of assignment.ownedFiles) {
        content += `| ${file} | coder_sub_${assignment.id} | ${assignment.stories.join(', ')} | 🔵 Assigned | - |\n`;
      }
    }

    // Add shared files
    if (ownership.sharedFiles.length > 0) {
      content += `\n### Shared Files (Sequential Handling)\n\n`;
      for (const file of ownership.sharedFiles) {
        content += `| ${file} | orchestrator | SHARED | ⏸️ Waiting | - |\n`;
      }
    }

    content += `
## Integration Schedule

### Phase 1: Parallel Development (Hour 1-4)
- Sub-agents work on owned files
- No conflicts possible due to ownership assignment

### Phase 2: Integration Checkpoint (Hour 5)
- Collect all implementations
- Validate interfaces and dependencies
- Run integration tests

### Phase 3: Shared File Updates (Hour 6)
- Sequential handling of shared files
- Orchestrator manages updates
- Final integration testing

## Conflict Resolution

`;

    if (ownership.conflictResolution.length > 0) {
      for (const resolution of ownership.conflictResolution) {
        content += `- **${resolution.file}**: ${resolution.resolution} execution order: ${resolution.order.join(' → ')}\n`;
      }
    } else {
      content += `No critical conflicts identified. All stories can execute in parallel.\n`;
    }

    content += `
## Status Legend

- 🔵 Assigned - Work not yet started
- 🟡 In Progress - Active development
- 🟢 Complete - Development finished
- 🔴 Blocked - Requires attention
- ⏸️ Waiting - Pending dependencies
`;

    await fs.writeFile(coordPath, content);
    console.log(`📋 Code coordination document created: ${coordPath}`);
  }

  /**
   * Create work packages for sub-agents
   */
  createWorkPackages(ownership, projectContext) {
    const packages = [];
    
    for (const assignment of ownership.assignments) {
      const storyDetails = assignment.stories.map(id => 
        `Story ${id}: ${this.getStoryDescription(id)}`
      ).join('\n');
      
      const budget = this.tokenManager.calculateBudget({
        taskType: 'coding',
        complexity: this.assessComplexity(assignment),
        documentCount: assignment.stories.length,
        priority: 'high'
      });
      
      packages.push({
        id: `sprint-coder-${assignment.id}`,
        subAgentId: `coder_sub_${assignment.id}`,
        description: `Implement ${assignment.stories.length} stories for ${this.currentSprint}`,
        stories: assignment.stories,
        ownedFiles: assignment.ownedFiles,
        readOnlyFiles: assignment.readOnlyFiles,
        context: {
          ...projectContext,
          sprintName: this.currentSprint,
          storyDetails
        },
        tokenBudget: budget
      });
      
      this.tokenManager.allocateTokens(`coder_sub_${assignment.id}`, budget);
    }
    
    return packages;
  }

  /**
   * Get story description (placeholder)
   */
  getStoryDescription(storyId) {
    // In real implementation, would look up from backlog
    return `Implementation for ${storyId}`;
  }

  /**
   * Assess complexity based on assignment
   */
  assessComplexity(assignment) {
    const fileCount = assignment.ownedFiles.length;
    const storyCount = assignment.stories.length;
    
    if (fileCount > 10 || storyCount > 3) {
      return 'complex';
    } else if (fileCount > 5 || storyCount > 1) {
      return 'standard';
    }
    
    return 'simple';
  }

  /**
   * Integrate code from parallel execution
   */
  async integrateCode(results, sharedFiles) {
    const integration = {
      completedStories: [],
      failedStories: [],
      conflicts: [],
      sharedFileUpdates: []
    };

    // Process results
    for (const result of results) {
      if (result.status === 'success') {
        integration.completedStories.push(...(result.data.stories || []));
      } else {
        integration.failedStories.push({
          stories: result.data?.stories || [],
          error: result.error
        });
      }
    }

    // Handle shared files sequentially
    if (sharedFiles.length > 0) {
      console.log(`\n🔄 Handling ${sharedFiles.length} shared files sequentially...`);
      
      for (const file of sharedFiles) {
        const update = await this.updateSharedFile(file, results);
        integration.sharedFileUpdates.push(update);
      }
    }

    // Check for integration conflicts
    integration.conflicts = await this.detectIntegrationConflicts(results);

    return integration;
  }

  /**
   * Update shared file based on parallel work
   */
  async updateSharedFile(file, results) {
    // In real implementation, would merge changes
    return {
      file,
      status: 'updated',
      mergedFrom: results.filter(r => r.status === 'success').length + ' sub-agents'
    };
  }

  /**
   * Detect integration conflicts
   */
  async detectIntegrationConflicts(results) {
    const conflicts = [];
    
    // Simple conflict detection
    // In real implementation, would analyze actual code changes
    
    return conflicts;
  }

  /**
   * Update coordination status
   */
  async updateCoordinationStatus(status, integration) {
    const statusPath = path.join(this.sprintPath, 'code-coordination-status.json');
    
    const statusData = {
      sprint: this.currentSprint,
      status,
      timestamp: new Date().toISOString(),
      completedStories: integration.completedStories,
      failedStories: integration.failedStories,
      conflicts: integration.conflicts,
      sharedFileUpdates: integration.sharedFileUpdates
    };
    
    await fs.writeFile(statusPath, JSON.stringify(statusData, null, 2));
    
    // Update master registry
    await this.registryManager.consolidateRegistries();
  }

  /**
   * Monitor sprint progress
   */
  async getSprintStatus() {
    const status = await this.orchestrator.getSessionStatus();
    
    return {
      sprint: this.currentSprint,
      activeCoders: status.activeSubAgents.filter(a => 
        a.id.startsWith('coder_sub_')
      ),
      progress: await this.calculateProgress()
    };
  }

  /**
   * Calculate sprint progress
   */
  async calculateProgress() {
    // Read coordination document and calculate progress
    try {
      const coordPath = path.join(this.sprintPath, 'code-coordination.md');
      const content = await fs.readFile(coordPath, 'utf-8');
      
      const total = (content.match(/🔵/g) || []).length +
                   (content.match(/🟡/g) || []).length +
                   (content.match(/🟢/g) || []).length;
      
      const completed = (content.match(/🟢/g) || []).length;
      
      return {
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total
      };
    } catch (error) {
      return { percentage: 0, completed: 0, total: 0 };
    }
  }
}

module.exports = SprintCodeCoordinator;