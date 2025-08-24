/**
 * Repository-Aware Context Loader
 * Extension of Smart Context Loader that understands repository boundaries
 */

const SmartContextLoader = require('./smart-context-loader');
const MultiRepositoryCoordinator = require('./multi-repo-coordinator');
const fs = require('fs');
const path = require('path');

class RepositoryAwareContextLoader extends SmartContextLoader {
  constructor() {
    super();
    this.repoCoordinator = new MultiRepositoryCoordinator(this.projectRoot);
    this.repositoryContexts = new Map();
  }

  /**
   * Load context with repository awareness
   */
  async loadRepositoryContext(agentName, level = 1, options = {}) {
    const {
      repository = 'main',
      relatedRepos = [],
      excludeRepos = [],
      feature = null
    } = options;

    // Get base context
    const baseContext = await this.loadContext(agentName, level);
    
    // Enhance with repository-specific information
    const repoContext = {
      ...baseContext,
      repository_context: {
        primary: repository,
        related: relatedRepos,
        excluded: excludeRepos,
        boundaries: this.getRepositoryBoundaries(repository),
        dependencies: this.getRepositoryDependencies(repository)
      }
    };

    // If working on a cross-repo feature, add coordination context
    if (feature) {
      repoContext.feature_context = await this.loadFeatureContext(feature);
    }

    // Filter context based on repository
    repoContext.data = this.filterContextByRepository(
      repoContext.data,
      repository,
      relatedRepos,
      excludeRepos
    );

    return repoContext;
  }

  /**
   * Get repository boundaries for an agent
   */
  getRepositoryBoundaries(repository) {
    const mapping = this.repoCoordinator.mapping.code_boundaries[repository];
    if (!mapping) return null;

    return {
      includes: mapping.includes.map(inc => inc.pattern),
      excludes: mapping.excludes.map(exc => exc.pattern),
      primary_language: mapping.primary_language,
      file_patterns: this.generateFilePatterns(repository)
    };
  }

  /**
   * Get repository dependencies
   */
  getRepositoryDependencies(repository) {
    const config = this.repoCoordinator.config.repositories[repository];
    if (!config) return [];

    return {
      depends_on: config.dependencies || [],
      deployment_order: this.repoCoordinator.config.coordination_rules.deployment_order,
      shared_interfaces: this.getSharedInterfaces(repository)
    };
  }

  /**
   * Generate file patterns for repository
   */
  generateFilePatterns(repository) {
    const templates = {
      'marketing': {
        includes: ['pages/*', 'content/*', 'public/*'],
        excludes: ['**/node_modules/**', '**/dist/**']
      },
      'application': {
        includes: ['src/*', 'components/*', 'hooks/*'],
        excludes: ['**/build/**', '**/coverage/**']
      },
      'api': {
        includes: ['src/*', 'routes/*', 'models/*'],
        excludes: ['**/logs/**', '**/tmp/**']
      },
      'mobile': {
        includes: ['src/*', 'ios/*', 'android/*'],
        excludes: ['**/build/**', '**/node_modules/**']
      }
    };

    return templates[repository] || {
      includes: ['src/*', 'lib/*'],
      excludes: ['**/node_modules/**', '**/dist/**']
    };
  }

  /**
   * Get shared interfaces for repository
   */
  getSharedInterfaces(repository) {
    const interfaces = [];
    
    Object.entries(this.repoCoordinator.mapping.shared_interfaces).forEach(([id, link]) => {
      if (link.source === repository || link.target === repository) {
        interfaces.push({
          id,
          type: link.type,
          connected_repo: link.source === repository ? link.target : link.source,
          description: link.description
        });
      }
    });

    return interfaces;
  }

  /**
   * Filter context based on repository boundaries
   */
  filterContextByRepository(data, primaryRepo, relatedRepos, excludeRepos) {
    if (!data || typeof data !== 'object') return data;

    const filtered = JSON.parse(JSON.stringify(data)); // Deep clone

    // Filter file references
    if (filtered.files) {
      filtered.files = this.filterFilesByRepository(
        filtered.files,
        primaryRepo,
        relatedRepos,
        excludeRepos
      );
    }

    // Filter code examples
    if (filtered.code_examples) {
      filtered.code_examples = this.filterCodeByRepository(
        filtered.code_examples,
        primaryRepo,
        relatedRepos
      );
    }

    // Filter features
    if (filtered.features) {
      filtered.features = this.filterFeaturesByRepository(
        filtered.features,
        primaryRepo
      );
    }

    return filtered;
  }

  /**
   * Filter files by repository
   */
  filterFilesByRepository(files, primaryRepo, relatedRepos, excludeRepos) {
    return files.filter(file => {
      const repo = this.repoCoordinator.findRepositoryForFile(file.path);
      
      if (excludeRepos.includes(repo)) return false;
      if (repo === primaryRepo) return true;
      if (relatedRepos.includes(repo)) return true;
      
      return false;
    });
  }

  /**
   * Filter code examples by repository
   */
  filterCodeByRepository(codeExamples, primaryRepo, relatedRepos) {
    const allowedRepos = [primaryRepo, ...relatedRepos];
    
    return codeExamples.filter(example => {
      if (!example.repository) return true; // Keep if no repo specified
      return allowedRepos.includes(example.repository);
    });
  }

  /**
   * Filter features by repository
   */
  filterFeaturesByRepository(features, primaryRepo) {
    const boundaries = this.repoCoordinator.mapping.code_boundaries[primaryRepo];
    if (!boundaries) return features;

    return features.filter(feature => {
      // Check if feature belongs to this repository
      const ownership = this.repoCoordinator.mapping.feature_ownership[feature.id];
      return !ownership || ownership.repository === primaryRepo;
    });
  }

  /**
   * Load feature context for cross-repo work
   */
  async loadFeatureContext(featureId) {
    const prHelper = require('./cross-repo-pr-helper');
    const helper = new prHelper(this.projectRoot);
    
    const feature = helper.prTracking.active_features[featureId];
    if (!feature) return null;

    return {
      id: featureId,
      description: feature.description,
      repositories: Object.keys(feature.repositories),
      merge_order: feature.merge_order,
      status: feature.status,
      coordination: {
        branch_name: feature.repositories[Object.keys(feature.repositories)[0]]?.branch,
        pr_status: this.summarizePRStatus(feature.repositories)
      }
    };
  }

  /**
   * Summarize PR status across repositories
   */
  summarizePRStatus(repositories) {
    const summary = {
      total: Object.keys(repositories).length,
      created: 0,
      approved: 0,
      merged: 0
    };

    Object.values(repositories).forEach(repo => {
      if (repo.pr_number) summary.created++;
      if (repo.status === 'approved') summary.approved++;
      if (repo.status === 'merged') summary.merged++;
    });

    return summary;
  }

  /**
   * Load interface context between repositories
   */
  async loadInterfaceContext(sourceRepo, targetRepo) {
    const interfaces = this.getSharedInterfaces(sourceRepo)
      .filter(int => int.connected_repo === targetRepo);

    if (interfaces.length === 0) return null;

    const context = {
      repositories: [sourceRepo, targetRepo],
      interfaces: interfaces,
      shared_types: await this.loadSharedTypes(sourceRepo, targetRepo),
      api_contracts: await this.loadAPIContracts(sourceRepo, targetRepo),
      dependencies: this.analyzeDependencyDirection(sourceRepo, targetRepo)
    };

    return context;
  }

  /**
   * Load shared types between repositories
   */
  async loadSharedTypes(repo1, repo2) {
    const sharedPath = path.join(this.projectRoot, '..', 'shared', 'types');
    if (!fs.existsSync(sharedPath)) return [];

    const types = [];
    const files = fs.readdirSync(sharedPath);
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.d.ts')) {
        const content = fs.readFileSync(path.join(sharedPath, file), 'utf8');
        // Simple check if type is used by both repos
        if (content.includes(repo1) && content.includes(repo2)) {
          types.push({
            file,
            exports: this.extractTypeExports(content)
          });
        }
      }
    }

    return types;
  }

  /**
   * Extract type exports from TypeScript file
   */
  extractTypeExports(content) {
    const exports = [];
    const exportRegex = /export\s+(interface|type|enum|class)\s+(\w+)/g;
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push({
        kind: match[1],
        name: match[2]
      });
    }
    
    return exports;
  }

  /**
   * Load API contracts between repositories
   */
  async loadAPIContracts(sourceRepo, targetRepo) {
    // Look for OpenAPI specs or similar
    const contractPaths = [
      path.join(this.projectRoot, '..', sourceRepo, 'api', 'openapi.yaml'),
      path.join(this.projectRoot, '..', sourceRepo, 'api', 'swagger.json'),
      path.join(this.projectRoot, '..', 'contracts', `${sourceRepo}-${targetRepo}.yaml`)
    ];

    for (const contractPath of contractPaths) {
      if (fs.existsSync(contractPath)) {
        return {
          path: contractPath,
          type: contractPath.endsWith('.yaml') ? 'openapi' : 'swagger',
          exists: true
        };
      }
    }

    return { exists: false };
  }

  /**
   * Analyze dependency direction
   */
  analyzeDependencyDirection(repo1, repo2) {
    const deps1 = this.repoCoordinator.config.repositories[repo1]?.dependencies || [];
    const deps2 = this.repoCoordinator.config.repositories[repo2]?.dependencies || [];

    return {
      [repo1]: {
        depends_on_target: deps1.includes(repo2),
        dependencies: deps1
      },
      [repo2]: {
        depends_on_target: deps2.includes(repo1),
        dependencies: deps2
      },
      circular: deps1.includes(repo2) && deps2.includes(repo1)
    };
  }

  /**
   * Generate repository-specific loading strategy
   */
  generateRepositoryLoadingStrategy(agents, repositories, totalTokenBudget) {
    const strategy = super.generateLoadingStrategy(agents, totalTokenBudget);
    
    // Enhance with repository allocation
    strategy.repository_allocation = {};
    
    const repoCount = repositories.length;
    const tokensPerRepo = Math.floor(totalTokenBudget * 0.6 / repoCount);
    
    repositories.forEach(repo => {
      strategy.repository_allocation[repo] = {
        tokens: tokensPerRepo,
        focus_areas: this.getRepositoryFocusAreas(repo),
        excluded_areas: this.getRepositoryExclusions(repo)
      };
    });

    // Allocate remaining tokens to cross-repo coordination
    strategy.coordination_budget = Math.floor(totalTokenBudget * 0.2);
    
    return strategy;
  }

  /**
   * Get focus areas for repository
   */
  getRepositoryFocusAreas(repository) {
    const focusMap = {
      'marketing': ['SEO', 'content', 'performance', 'analytics'],
      'application': ['features', 'state_management', 'user_experience'],
      'api': ['endpoints', 'authentication', 'data_models', 'performance'],
      'mobile': ['native_features', 'offline_support', 'platform_specific'],
      'admin': ['dashboards', 'reports', 'user_management']
    };

    return focusMap[repository] || ['general'];
  }

  /**
   * Get exclusions for repository
   */
  getRepositoryExclusions(repository) {
    const exclusionMap = {
      'marketing': ['backend_logic', 'database', 'authentication'],
      'application': ['SEO', 'static_content'],
      'api': ['UI_components', 'styling'],
      'mobile': ['web_specific', 'SEO']
    };

    return exclusionMap[repository] || [];
  }

  /**
   * Optimize context for multi-repo project
   */
  optimizeMultiRepoContext(contexts, tokenBudget) {
    const optimized = {
      repositories: {},
      shared: {},
      coordination: {},
      total_tokens: 0
    };

    // Calculate token distribution
    const repoCount = Object.keys(contexts).length;
    const baseTokensPerRepo = Math.floor(tokenBudget * 0.7 / repoCount);
    const sharedTokens = Math.floor(tokenBudget * 0.2);
    const coordinationTokens = Math.floor(tokenBudget * 0.1);

    // Optimize each repository context
    Object.entries(contexts).forEach(([repo, context]) => {
      optimized.repositories[repo] = this.trimContextToTokens(context, baseTokensPerRepo);
      optimized.total_tokens += this.estimateTokens(JSON.stringify(optimized.repositories[repo]));
    });

    // Add shared context
    optimized.shared = this.extractSharedContext(contexts, sharedTokens);
    optimized.total_tokens += this.estimateTokens(JSON.stringify(optimized.shared));

    // Add coordination context
    optimized.coordination = this.extractCoordinationContext(contexts, coordinationTokens);
    optimized.total_tokens += this.estimateTokens(JSON.stringify(optimized.coordination));

    return optimized;
  }

  /**
   * Trim context to fit token budget
   */
  trimContextToTokens(context, maxTokens) {
    let trimmed = JSON.parse(JSON.stringify(context));
    let currentTokens = this.estimateTokens(JSON.stringify(trimmed));

    // Progressive trimming
    const trimOrder = ['examples', 'detailed_descriptions', 'historical_data', 'metadata'];
    
    for (const field of trimOrder) {
      if (currentTokens <= maxTokens) break;
      
      if (trimmed[field]) {
        delete trimmed[field];
        currentTokens = this.estimateTokens(JSON.stringify(trimmed));
      }
    }

    return trimmed;
  }

  /**
   * Extract shared context across repositories
   */
  extractSharedContext(contexts, tokenBudget) {
    return {
      shared_types: this.findCommonTypes(contexts),
      api_contracts: this.findAPIContracts(contexts),
      common_patterns: this.findCommonPatterns(contexts),
      dependencies: this.buildDependencyMap(contexts)
    };
  }

  /**
   * Extract coordination context
   */
  extractCoordinationContext(contexts, tokenBudget) {
    return {
      repository_structure: this.repoCoordinator.config.project_structure,
      active_features: this.getActiveFeatures(),
      coordination_rules: this.repoCoordinator.config.coordination_rules,
      health_status: this.repoCoordinator.getRepositoryHealth()
    };
  }

  /**
   * Find common types across contexts
   */
  findCommonTypes(contexts) {
    const typeMap = new Map();
    
    Object.entries(contexts).forEach(([repo, context]) => {
      if (context.data?.types) {
        context.data.types.forEach(type => {
          if (!typeMap.has(type.name)) {
            typeMap.set(type.name, { repos: [], definition: type });
          }
          typeMap.get(type.name).repos.push(repo);
        });
      }
    });

    // Return types used in multiple repos
    return Array.from(typeMap.entries())
      .filter(([_, info]) => info.repos.length > 1)
      .map(([name, info]) => ({
        name,
        used_in: info.repos,
        definition: info.definition
      }));
  }

  /**
   * Find API contracts
   */
  findAPIContracts(contexts) {
    const contracts = [];
    
    Object.entries(contexts).forEach(([repo, context]) => {
      if (context.data?.api_contracts) {
        contracts.push({
          repository: repo,
          contracts: context.data.api_contracts
        });
      }
    });

    return contracts;
  }

  /**
   * Find common patterns
   */
  findCommonPatterns(contexts) {
    // This would analyze contexts for common architectural patterns
    return [];
  }

  /**
   * Build dependency map
   */
  buildDependencyMap(contexts) {
    const map = {};
    
    Object.keys(contexts).forEach(repo => {
      map[repo] = this.getRepositoryDependencies(repo);
    });

    return map;
  }

  /**
   * Get active features
   */
  getActiveFeatures() {
    try {
      const prHelper = require('./cross-repo-pr-helper');
      const helper = new prHelper(this.projectRoot);
      return Object.keys(helper.prTracking.active_features);
    } catch {
      return [];
    }
  }
}

module.exports = RepositoryAwareContextLoader;

// CLI interface
if (require.main === module) {
  const loader = new RepositoryAwareContextLoader();
  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    switch (command) {
      case 'load-repo':
        const [agent, repo, level] = args.slice(1);
        if (!agent || !repo) {
          console.error('Usage: load-repo <agent> <repository> [level]');
          process.exit(1);
        }
        
        const context = await loader.loadRepositoryContext(agent, parseInt(level) || 2, {
          repository: repo,
          relatedRepos: args[4]?.split(',') || []
        });
        
        console.log(JSON.stringify(context, null, 2));
        break;

      case 'interface':
        const [repo1, repo2] = args.slice(1);
        if (!repo1 || !repo2) {
          console.error('Usage: interface <repo1> <repo2>');
          process.exit(1);
        }
        
        const interfaceContext = await loader.loadInterfaceContext(repo1, repo2);
        console.log(JSON.stringify(interfaceContext, null, 2));
        break;

      case 'optimize':
        console.log('Optimizing multi-repo context...');
        // Example optimization
        const contexts = {
          marketing: await loader.loadContext('marketing_agent', 2),
          application: await loader.loadContext('coder_agent', 2),
          api: await loader.loadContext('api_agent', 2)
        };
        
        const optimized = loader.optimizeMultiRepoContext(contexts, 20000);
        console.log(JSON.stringify(optimized, null, 2));
        break;

      default:
        console.log('Repository-Aware Context Loader\n');
        console.log('Commands:');
        console.log('  load-repo <agent> <repo> [level] - Load repository-specific context');
        console.log('  interface <repo1> <repo2>        - Load interface context');
        console.log('  optimize                         - Optimize multi-repo context');
    }
  }

  main().catch(console.error);
}