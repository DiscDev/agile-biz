/**
 * Project Structure Agent Coordinator
 * Handles integration between Project Structure Agent and other agents
 */

const fs = require('fs');
const path = require('path');
const RepositoryRecommendationEngine = require('./repository-recommendation-engine');
const MultiRepositoryCoordinator = require('./multi-repo-coordinator');
const RepositoryPatternRecognizer = require('./repository-pattern-recognizer');

class ProjectStructureAgentCoordinator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.recommendationEngine = new RepositoryRecommendationEngine(projectRoot);
    this.repoCoordinator = new MultiRepositoryCoordinator(projectRoot);
    this.patternRecognizer = new RepositoryPatternRecognizer(projectRoot);
    this.integrationsPath = path.join(projectRoot, 'machine-data', 'agent-integrations', 'project-structure-integrations.json');
    this.loadIntegrations();
  }

  /**
   * Load integration configuration
   */
  loadIntegrations() {
    if (fs.existsSync(this.integrationsPath)) {
      this.integrations = JSON.parse(fs.readFileSync(this.integrationsPath, 'utf8'));
    }
  }

  /**
   * Handle request from Project Manager Agent
   */
  async handleProjectManagerRequest(requestType, data) {
    switch (requestType) {
      case 'initial_structure':
        return await this.provideInitialStructureRecommendation(data);
      
      case 'evolution_check':
        return await this.checkEvolutionNeeds(data);
      
      case 'sprint_repository_mapping':
        return await this.mapSprintTasksToRepositories(data);
      
      default:
        throw new Error(`Unknown request type: ${requestType}`);
    }
  }

  /**
   * Provide initial structure recommendation
   */
  async provideInitialStructureRecommendation(projectDetails) {
    // Generate recommendation
    const recommendation = this.recommendationEngine.generateRecommendation(projectDetails);
    
    // Record decision point
    await this.recordDecisionPoint({
      type: 'initial_structure',
      project_details: projectDetails,
      recommendation: recommendation,
      timestamp: new Date().toISOString()
    });

    return {
      recommendation,
      implementation_guide: this.generateImplementationGuide(recommendation),
      monitoring_plan: this.generateMonitoringPlan(projectDetails)
    };
  }

  /**
   * Check if repository evolution is needed
   */
  async checkEvolutionNeeds(metrics) {
    const triggers = [];
    const config = this.repoCoordinator.config;
    
    // Check each metric against thresholds
    if (metrics.build_time > 600) {
      triggers.push({
        metric: 'build_time',
        current: metrics.build_time,
        threshold: 600,
        action: 'Consider splitting largest module',
        confidence: 0.8
      });
    }

    if (metrics.merge_conflicts_per_week > 5) {
      triggers.push({
        metric: 'merge_conflicts',
        current: metrics.merge_conflicts_per_week,
        threshold: 5,
        action: 'Review code ownership boundaries',
        confidence: 0.7
      });
    }

    if (metrics.deployment_failures_per_sprint > 2) {
      triggers.push({
        metric: 'deployment_failures',
        current: metrics.deployment_failures_per_sprint,
        threshold: 2,
        action: 'Isolate unstable components',
        confidence: 0.9
      });
    }

    // Check repository health
    const health = this.repoCoordinator.getRepositoryHealth();
    if (health.overall_score < 70) {
      triggers.push({
        metric: 'repository_health',
        current: health.overall_score,
        threshold: 70,
        action: 'Review repository structure',
        confidence: 0.75,
        details: health.issues
      });
    }

    return {
      evolution_needed: triggers.length > 0,
      triggers,
      current_structure: config.project_structure,
      recommendations: triggers.length > 0 ? await this.generateEvolutionPlan(triggers) : null
    };
  }

  /**
   * Map sprint tasks to repositories
   */
  async mapSprintTasksToRepositories(sprintData) {
    const { tasks, current_structure } = sprintData;
    const mapping = {
      sprint_id: sprintData.sprint_id,
      tasks: {},
      cross_repo_features: [],
      warnings: []
    };

    for (const task of tasks) {
      const repository = await this.determineTaskRepository(task, current_structure);
      
      mapping.tasks[task.id] = {
        title: task.title,
        repository: repository.primary,
        confidence: repository.confidence,
        related_repos: repository.related || []
      };

      // Check for cross-repo features
      if (repository.related && repository.related.length > 0) {
        mapping.cross_repo_features.push({
          task_id: task.id,
          repositories: [repository.primary, ...repository.related],
          coordination_needed: true
        });
      }

      // Add warnings for low confidence mappings
      if (repository.confidence < 0.7) {
        mapping.warnings.push({
          task_id: task.id,
          message: 'Low confidence in repository assignment',
          suggested_review: true
        });
      }
    }

    return mapping;
  }

  /**
   * Handle request from Coder Agent
   */
  async handleCoderRequest(requestType, data) {
    switch (requestType) {
      case 'file_location':
        return await this.determineFileLocation(data);
      
      case 'repository_boundaries':
        return this.repoCoordinator.getRepositoryBoundaries(data.repository);
      
      case 'cross_repo_coordination':
        return await this.coordinateCrossRepoFeature(data);
      
      default:
        throw new Error(`Unknown request type: ${requestType}`);
    }
  }

  /**
   * Determine correct repository for a file
   */
  async determineFileLocation(fileInfo) {
    const { path: filePath, type, purpose } = fileInfo;
    
    // Check existing mappings
    const mappedRepo = this.repoCoordinator.findRepositoryForFile(filePath);
    if (mappedRepo) {
      return {
        repository: mappedRepo,
        confidence: 0.9,
        source: 'existing_mapping'
      };
    }

    // Use pattern matching based on file type and purpose
    const recommendation = this.recommendFileLocation(filePath, type, purpose);
    
    // Record the mapping for future use
    if (recommendation.confidence > 0.7) {
      await this.repoCoordinator.mapCodeToRepository(
        path.dirname(filePath),
        recommendation.repository,
        type
      );
    }

    return recommendation;
  }

  /**
   * Coordinate cross-repository feature
   */
  async coordinateCrossRepoFeature(featureInfo) {
    const coordination = this.repoCoordinator.coordinateFeature(featureInfo);
    
    // Add implementation guidance
    coordination.implementation_guide = this.generateCrossRepoImplementationGuide(
      coordination,
      featureInfo
    );

    // Add testing strategy
    coordination.testing_strategy = this.generateCrossRepoTestingStrategy(
      coordination.repositories
    );

    return coordination;
  }

  /**
   * Handle request from DevOps Agent
   */
  async handleDevOpsRequest(requestType, data) {
    switch (requestType) {
      case 'deployment_order':
        return this.getDeploymentOrder(data.repositories);
      
      case 'ci_cd_config':
        return this.generateCICDConfig(data);
      
      case 'deployment_coordination':
        return this.coordinateDeployment(data);
      
      default:
        throw new Error(`Unknown request type: ${requestType}`);
    }
  }

  /**
   * Get deployment order for repositories
   */
  getDeploymentOrder(repositories) {
    const order = this.repoCoordinator.config.coordination_rules.deployment_order;
    
    // Filter to only requested repositories
    const filteredOrder = order.filter(repo => repositories.includes(repo));
    
    return {
      order: filteredOrder,
      parallel_groups: this.identifyParallelDeployments(filteredOrder),
      dependencies: this.getDeploymentDependencies(filteredOrder)
    };
  }

  /**
   * Generate CI/CD configuration for multi-repo project
   */
  generateCICDConfig(projectInfo) {
    const { repositories, platform } = projectInfo;
    const config = {
      platform,
      repositories: {},
      coordination: {
        branch_protection: this.generateBranchProtectionRules(repositories),
        deployment_gates: this.generateDeploymentGates(repositories),
        integration_tests: this.generateIntegrationTestConfig(repositories)
      }
    };

    // Generate repo-specific CI/CD config
    repositories.forEach(repo => {
      config.repositories[repo] = this.generateRepoSpecificCICD(repo, platform);
    });

    return config;
  }

  /**
   * Handle Learning Analysis Agent broadcasts
   */
  async handleLearningBroadcast(broadcast) {
    if (broadcast.type !== 'repository_structure') return null;

    const { pattern, confidence, source } = broadcast;
    
    // Evaluate pattern relevance
    const relevance = this.evaluatePatternRelevance(pattern);
    
    if (relevance.score > 0.7) {
      // Update pattern recognizer
      await this.patternRecognizer.updatePatterns({
        ...pattern,
        source: `learning_broadcast_${source}`,
        imported_at: new Date().toISOString()
      });

      // Update recommendation engine
      this.recommendationEngine.patternRecognizer = this.patternRecognizer;

      return {
        accepted: true,
        relevance_score: relevance.score,
        expected_impact: relevance.expected_impact
      };
    }

    return {
      accepted: false,
      reason: 'Low relevance score',
      relevance_score: relevance.score
    };
  }

  /**
   * Track structure evolution for learning
   */
  async trackStructureEvolution(evolution) {
    // Add to pattern recognizer
    await this.patternRecognizer.updatePatterns(evolution);
    
    // Prepare for community contribution
    const learningData = {
      evolution,
      metrics: await this.collectEvolutionMetrics(evolution),
      timestamp: new Date().toISOString()
    };

    // Save to project state
    await this.saveToProjectState('repository_evolution', learningData);

    return {
      tracked: true,
      learning_id: `EVO-${Date.now()}`,
      will_contribute: true
    };
  }

  /**
   * Generate implementation guide
   */
  generateImplementationGuide(recommendation) {
    const guide = {
      steps: [],
      estimated_time: '1-2 hours',
      prerequisites: []
    };

    // Initial setup steps
    guide.steps.push({
      order: 1,
      action: 'Initialize repository structure',
      command: `mkdir -p ${recommendation.initial_structure}`,
      description: 'Create initial directory structure'
    });

    // Add evolution timeline
    recommendation.recommended_evolution.forEach((evolution, index) => {
      guide.steps.push({
        order: index + 2,
        action: `Evolution at week ${evolution.avg_week}`,
        description: `Split ${evolution.from} into ${evolution.to}`,
        trigger: evolution.reasons.join(', '),
        estimated_week: evolution.avg_week
      });
    });

    return guide;
  }

  /**
   * Generate monitoring plan
   */
  generateMonitoringPlan(projectDetails) {
    return {
      metrics_to_track: [
        {
          name: 'build_time',
          frequency: 'per_commit',
          threshold: 600,
          action: 'Notify if exceeded'
        },
        {
          name: 'merge_conflicts',
          frequency: 'weekly',
          threshold: 5,
          action: 'Review boundaries'
        },
        {
          name: 'deployment_success_rate',
          frequency: 'per_deployment',
          threshold: 0.95,
          action: 'Investigate failures'
        }
      ],
      review_schedule: 'Weekly during retrospectives',
      evolution_checkpoints: this.calculateEvolutionCheckpoints(projectDetails)
    };
  }

  /**
   * Helper methods
   */
  
  async recordDecisionPoint(decision) {
    const decisionsPath = path.join(
      this.projectRoot,
      'project-documents',
      '00-orchestration',
      'structure-decisions.json'
    );
    
    let decisions = [];
    if (fs.existsSync(decisionsPath)) {
      decisions = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'));
    }
    
    decisions.push(decision);
    fs.writeFileSync(decisionsPath, JSON.stringify(decisions, null, 2));
  }

  async generateEvolutionPlan(triggers) {
    // Use recommendation engine to generate evolution plan
    const plan = {
      current_state: this.repoCoordinator.config.project_structure,
      recommended_changes: [],
      implementation_order: [],
      risk_assessment: 'medium'
    };

    // Analyze triggers and generate recommendations
    triggers.forEach(trigger => {
      if (trigger.confidence > 0.7) {
        plan.recommended_changes.push({
          trigger: trigger.metric,
          action: trigger.action,
          confidence: trigger.confidence
        });
      }
    });

    return plan;
  }

  determineTaskRepository(task, currentStructure) {
    // Simple heuristic-based assignment
    const { title, type, tags } = task;
    
    if (type === 'frontend' || tags?.includes('ui')) {
      return {
        primary: currentStructure.includes('marketing') ? 'application' : 'main',
        confidence: 0.8
      };
    }
    
    if (type === 'backend' || tags?.includes('api')) {
      return {
        primary: currentStructure.includes('api') ? 'api' : 'main',
        confidence: 0.85
      };
    }

    return {
      primary: 'main',
      confidence: 0.6
    };
  }

  recommendFileLocation(filePath, type, purpose) {
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // Marketing site patterns
    if (fileName.includes('seo') || pathParts.includes('content') || pathParts.includes('blog')) {
      return { repository: 'marketing', confidence: 0.9 };
    }
    
    // API patterns
    if (pathParts.includes('api') || pathParts.includes('routes') || fileName.includes('controller')) {
      return { repository: 'api', confidence: 0.85 };
    }
    
    // Mobile patterns
    if (pathParts.includes('ios') || pathParts.includes('android') || fileName.includes('native')) {
      return { repository: 'mobile', confidence: 0.9 };
    }
    
    // Default to main/application
    return { repository: 'application', confidence: 0.6 };
  }

  generateCrossRepoImplementationGuide(coordination, featureInfo) {
    return {
      overview: `Implementing ${featureInfo.description} across ${coordination.repositories.length} repositories`,
      steps: coordination.implementation_order.map((repo, index) => ({
        order: index + 1,
        repository: repo,
        branch: coordination.branch_name,
        tasks: coordination.repositories[repo]?.tasks || [],
        dependencies: coordination.repositories[repo]?.dependencies || []
      })),
      coordination_points: [
        'Use same branch name across all repositories',
        'Link PRs in descriptions',
        'Coordinate merges according to dependency order'
      ]
    };
  }

  async saveToProjectState(key, data) {
    const statePath = path.join(this.projectRoot, 'project-state', 'current-state.json');
    let state = {};
    
    if (fs.existsSync(statePath)) {
      state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }
    
    if (!state.project_structure_data) {
      state.project_structure_data = {};
    }
    
    state.project_structure_data[key] = data;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }
}

module.exports = ProjectStructureAgentCoordinator;

// CLI interface
if (require.main === module) {
  const coordinator = new ProjectStructureAgentCoordinator(path.join(__dirname, '..'));
  const command = process.argv[2];
  
  async function main() {
    switch (command) {
      case 'recommend':
        const projectDetails = {
          project_type: 'saas-b2b',
          industry: 'productivity',
          technology: { frontend: 'React', backend: 'Node.js' },
          team_size: 3
        };
        
        const result = await coordinator.handleProjectManagerRequest(
          'initial_structure',
          projectDetails
        );
        
        console.log(JSON.stringify(result, null, 2));
        break;
        
      case 'check-evolution':
        const metrics = {
          build_time: 720,
          merge_conflicts_per_week: 8,
          deployment_failures_per_sprint: 1
        };
        
        const evolution = await coordinator.handleProjectManagerRequest(
          'evolution_check',
          metrics
        );
        
        console.log(JSON.stringify(evolution, null, 2));
        break;
        
      default:
        console.log('Commands: recommend, check-evolution');
    }
  }
  
  main().catch(console.error);
}