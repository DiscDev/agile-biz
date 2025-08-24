/**
 * Multi-Repository Coordinator
 * Manages coordination across multiple repositories in a project
 */

const fs = require('fs');
const path = require('path');

class MultiRepositoryCoordinator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.configPath = path.join(projectRoot, 'machine-data', 'multi-repo-config.json');
    this.mappingPath = path.join(projectRoot, 'machine-data', 'repository-mapping.json');
    this.loadConfiguration();
  }

  /**
   * Load or initialize configuration
   */
  loadConfiguration() {
    if (fs.existsSync(this.configPath)) {
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } else {
      this.initializeConfig();
    }

    if (fs.existsSync(this.mappingPath)) {
      this.mapping = JSON.parse(fs.readFileSync(this.mappingPath, 'utf8'));
    } else {
      this.initializeMapping();
    }
  }

  /**
   * Initialize configuration
   */
  initializeConfig() {
    this.config = {
      version: "1.0.0",
      project_structure: "single-repo",
      repositories: {
        "main": {
          name: "main",
          path: "./",
          purpose: "Main application repository",
          active: true
        }
      },
      coordination_rules: {
        branch_naming: "feature/{ticket-id}-{description}",
        version_strategy: "synchronized",
        deployment_order: ["main"]
      },
      dependencies: {},
      last_updated: new Date().toISOString()
    };
    this.saveConfig();
  }

  /**
   * Initialize repository mapping
   */
  initializeMapping() {
    this.mapping = {
      code_boundaries: {},
      shared_interfaces: {},
      dependency_graph: {},
      feature_ownership: {},
      last_updated: new Date().toISOString()
    };
    this.saveMapping();
  }

  /**
   * Register a new repository
   */
  registerRepository(repoInfo) {
    const { name, path, purpose, dependencies } = repoInfo;
    
    this.config.repositories[name] = {
      name,
      path,
      purpose,
      active: true,
      created_at: new Date().toISOString(),
      dependencies: dependencies || []
    };

    // Update deployment order
    this.updateDeploymentOrder();
    
    // Initialize mapping for new repo
    this.mapping.code_boundaries[name] = {
      includes: [],
      excludes: [],
      primary_language: null
    };

    this.saveConfig();
    this.saveMapping();

    return {
      success: true,
      repository: name,
      message: `Repository ${name} registered successfully`
    };
  }

  /**
   * Update deployment order based on dependencies
   */
  updateDeploymentOrder() {
    const repos = Object.keys(this.config.repositories);
    const visited = new Set();
    const order = [];

    const visit = (repo) => {
      if (visited.has(repo)) return;
      visited.add(repo);
      
      const dependencies = this.config.repositories[repo]?.dependencies || [];
      dependencies.forEach(dep => visit(dep));
      
      order.push(repo);
    };

    repos.forEach(repo => visit(repo));
    this.config.coordination_rules.deployment_order = order;
  }

  /**
   * Map code to repository
   */
  mapCodeToRepository(codePattern, repository, type = 'feature') {
    if (!this.config.repositories[repository]) {
      throw new Error(`Repository ${repository} not registered`);
    }

    if (!this.mapping.code_boundaries[repository]) {
      this.mapping.code_boundaries[repository] = {
        includes: [],
        excludes: []
      };
    }

    this.mapping.code_boundaries[repository].includes.push({
      pattern: codePattern,
      type,
      added_at: new Date().toISOString()
    });

    // Update feature ownership
    if (type === 'feature') {
      this.mapping.feature_ownership[codePattern] = {
        repository,
        team: null,
        added_at: new Date().toISOString()
      };
    }

    this.saveMapping();
    return { success: true, pattern: codePattern, repository };
  }

  /**
   * Detect repository boundary violations
   */
  detectBoundaryViolations(changeSet) {
    const violations = [];
    
    Object.entries(changeSet).forEach(([file, changes]) => {
      const expectedRepo = this.findRepositoryForFile(file);
      const actualRepo = changes.repository;
      
      if (expectedRepo && expectedRepo !== actualRepo) {
        violations.push({
          file,
          expected_repository: expectedRepo,
          actual_repository: actualRepo,
          severity: 'warning',
          message: `File ${file} should be in ${expectedRepo} repository`
        });
      }
    });

    return violations;
  }

  /**
   * Find which repository a file should belong to
   */
  findRepositoryForFile(filePath) {
    for (const [repo, boundaries] of Object.entries(this.mapping.code_boundaries)) {
      for (const include of boundaries.includes) {
        if (this.matchesPattern(filePath, include.pattern)) {
          // Check excludes
          const excluded = boundaries.excludes.some(exclude => 
            this.matchesPattern(filePath, exclude.pattern)
          );
          if (!excluded) return repo;
        }
      }
    }
    return null;
  }

  /**
   * Simple pattern matching
   */
  matchesPattern(filePath, pattern) {
    // Convert glob-like pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\//g, '\\/');
    
    return new RegExp(`^${regexPattern}$`).test(filePath);
  }

  /**
   * Coordinate cross-repository feature
   */
  coordinateFeature(featureInfo) {
    const {
      ticket_id,
      description,
      affected_repositories,
      primary_repository
    } = featureInfo;

    const coordination = {
      id: `FEAT-${ticket_id}`,
      branch_name: this.generateBranchName(ticket_id, description),
      repositories: {},
      dependencies: this.analyzeDependencies(affected_repositories),
      created_at: new Date().toISOString()
    };

    // Create coordination plan for each repository
    affected_repositories.forEach(repo => {
      coordination.repositories[repo] = {
        branch: coordination.branch_name,
        status: 'pending',
        is_primary: repo === primary_repository,
        tasks: [],
        dependencies: this.getRepoDependencies(repo, affected_repositories)
      };
    });

    // Determine implementation order
    coordination.implementation_order = this.calculateImplementationOrder(
      affected_repositories,
      coordination.dependencies
    );

    return coordination;
  }

  /**
   * Generate consistent branch name
   */
  generateBranchName(ticketId, description) {
    const template = this.config.coordination_rules.branch_naming;
    const sanitizedDesc = description
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
    
    return template
      .replace('{ticket-id}', ticketId)
      .replace('{description}', sanitizedDesc);
  }

  /**
   * Analyze dependencies between repositories
   */
  analyzeDependencies(repositories) {
    const dependencies = {};
    
    repositories.forEach(repo => {
      dependencies[repo] = {
        depends_on: this.config.repositories[repo]?.dependencies || [],
        depended_by: []
      };
    });

    // Calculate reverse dependencies
    repositories.forEach(repo => {
      dependencies[repo].depends_on.forEach(dep => {
        if (dependencies[dep]) {
          dependencies[dep].depended_by.push(repo);
        }
      });
    });

    return dependencies;
  }

  /**
   * Get repository dependencies within feature scope
   */
  getRepoDependencies(repo, scopedRepos) {
    const allDeps = this.config.repositories[repo]?.dependencies || [];
    return allDeps.filter(dep => scopedRepos.includes(dep));
  }

  /**
   * Calculate implementation order
   */
  calculateImplementationOrder(repositories, dependencies) {
    const order = [];
    const visited = new Set();

    const visit = (repo) => {
      if (visited.has(repo)) return;
      visited.add(repo);
      
      const deps = dependencies[repo]?.depends_on || [];
      deps.forEach(dep => {
        if (repositories.includes(dep)) {
          visit(dep);
        }
      });
      
      order.push(repo);
    };

    repositories.forEach(repo => visit(repo));
    return order;
  }

  /**
   * Track cross-repository links
   */
  linkRepositories(linkInfo) {
    const { source_repo, target_repo, link_type, description } = linkInfo;
    
    const linkId = `LINK-${Date.now()}`;
    
    if (!this.mapping.shared_interfaces[linkId]) {
      this.mapping.shared_interfaces[linkId] = {
        source: source_repo,
        target: target_repo,
        type: link_type,
        description,
        created_at: new Date().toISOString(),
        active: true
      };
    }

    // Update dependency graph
    if (!this.mapping.dependency_graph[source_repo]) {
      this.mapping.dependency_graph[source_repo] = {
        depends_on: [],
        depended_by: []
      };
    }
    
    if (!this.mapping.dependency_graph[target_repo]) {
      this.mapping.dependency_graph[target_repo] = {
        depends_on: [],
        depended_by: []
      };
    }

    this.mapping.dependency_graph[source_repo].depends_on.push({
      repository: target_repo,
      link_id: linkId,
      type: link_type
    });

    this.mapping.dependency_graph[target_repo].depended_by.push({
      repository: source_repo,
      link_id: linkId,
      type: link_type
    });

    this.saveMapping();
    return { success: true, link_id: linkId };
  }

  /**
   * Get repository health metrics
   */
  getRepositoryHealth() {
    const health = {
      overall_score: 100,
      repositories: {},
      issues: []
    };

    Object.entries(this.config.repositories).forEach(([name, repo]) => {
      const repoHealth = {
        active: repo.active,
        dependencies_count: repo.dependencies?.length || 0,
        boundary_violations: 0,
        coupling_score: this.calculateCouplingScore(name),
        last_activity: repo.last_activity || repo.created_at
      };

      // Check for circular dependencies
      const circular = this.detectCircularDependencies(name);
      if (circular.length > 0) {
        health.issues.push({
          type: 'circular_dependency',
          severity: 'high',
          repository: name,
          details: circular
        });
        health.overall_score -= 10;
      }

      // Check for high coupling
      if (repoHealth.coupling_score > 0.7) {
        health.issues.push({
          type: 'high_coupling',
          severity: 'medium',
          repository: name,
          coupling: repoHealth.coupling_score
        });
        health.overall_score -= 5;
      }

      health.repositories[name] = repoHealth;
    });

    return health;
  }

  /**
   * Calculate coupling score for repository
   */
  calculateCouplingScore(repository) {
    const deps = this.mapping.dependency_graph[repository];
    if (!deps) return 0;

    const totalRepos = Object.keys(this.config.repositories).length;
    const connectedRepos = (deps.depends_on?.length || 0) + (deps.depended_by?.length || 0);
    
    return connectedRepos / Math.max(totalRepos - 1, 1);
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies(repository, visited = new Set(), path = []) {
    if (visited.has(repository)) {
      const cycleStart = path.indexOf(repository);
      if (cycleStart !== -1) {
        return [path.slice(cycleStart).concat(repository)];
      }
      return [];
    }

    visited.add(repository);
    path.push(repository);

    const dependencies = this.config.repositories[repository]?.dependencies || [];
    const circles = [];

    dependencies.forEach(dep => {
      const depCircles = this.detectCircularDependencies(dep, visited, [...path]);
      circles.push(...depCircles);
    });

    return circles;
  }

  /**
   * Generate repository structure visualization
   */
  visualizeStructure() {
    const nodes = Object.keys(this.config.repositories).map(name => ({
      id: name,
      label: name,
      type: this.config.repositories[name].purpose
    }));

    const edges = [];
    Object.entries(this.mapping.dependency_graph).forEach(([source, deps]) => {
      deps.depends_on?.forEach(dep => {
        edges.push({
          source,
          target: dep.repository,
          type: dep.type
        });
      });
    });

    return {
      nodes,
      edges,
      layout: this.config.project_structure
    };
  }

  /**
   * Save configuration
   */
  saveConfig() {
    this.config.last_updated = new Date().toISOString();
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Save mapping
   */
  saveMapping() {
    this.mapping.last_updated = new Date().toISOString();
    fs.writeFileSync(this.mappingPath, JSON.stringify(this.mapping, null, 2));
  }
}

module.exports = MultiRepositoryCoordinator;

// CLI interface
if (require.main === module) {
  const coordinator = new MultiRepositoryCoordinator(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'register':
      if (args.length < 2) {
        console.log('Usage: register <name> <path> [purpose]');
        process.exit(1);
      }
      const result = coordinator.registerRepository({
        name: args[0],
        path: args[1],
        purpose: args[2] || 'Repository'
      });
      console.log(result);
      break;
      
    case 'coordinate':
      if (args.length < 3) {
        console.log('Usage: coordinate <ticket> <description> <repo1,repo2,...>');
        process.exit(1);
      }
      const coordination = coordinator.coordinateFeature({
        ticket_id: args[0],
        description: args[1],
        affected_repositories: args[2].split(','),
        primary_repository: args[2].split(',')[0]
      });
      console.log(JSON.stringify(coordination, null, 2));
      break;
      
    case 'health':
      const health = coordinator.getRepositoryHealth();
      console.log(JSON.stringify(health, null, 2));
      break;
      
    case 'visualize':
      const structure = coordinator.visualizeStructure();
      console.log(JSON.stringify(structure, null, 2));
      break;
      
    default:
      console.log('Commands: register, coordinate, health, visualize');
  }
}