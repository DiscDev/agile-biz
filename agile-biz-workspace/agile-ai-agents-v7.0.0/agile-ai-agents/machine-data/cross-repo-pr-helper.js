/**
 * Cross-Repository PR Helper
 * Helps coordinate pull requests across multiple repositories
 */

const fs = require('fs');
const path = require('path');

class CrossRepoPRHelper {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.prTrackingPath = path.join(projectRoot, 'machine-data', 'cross-repo-prs.json');
    this.loadPRTracking();
  }

  /**
   * Load or initialize PR tracking
   */
  loadPRTracking() {
    if (fs.existsSync(this.prTrackingPath)) {
      this.prTracking = JSON.parse(fs.readFileSync(this.prTrackingPath, 'utf8'));
    } else {
      this.initializePRTracking();
    }
  }

  /**
   * Initialize PR tracking
   */
  initializePRTracking() {
    this.prTracking = {
      version: "1.0.0",
      active_features: {},
      completed_features: {},
      pr_templates: {
        default: {
          title: "[{ticket}] {description}",
          body: `## Related PRs
{related_prs}

## Description
{description}

## Changes
- {changes}

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manually tested

## Dependencies
{dependencies}

---
Part of cross-repository feature: {feature_id}`
        }
      },
      last_updated: new Date().toISOString()
    };
    this.savePRTracking();
  }

  /**
   * Create coordinated PR set
   */
  createCoordinatedPRs(featureInfo) {
    const {
      ticket_id,
      description,
      repositories,
      changes_by_repo,
      dependencies
    } = featureInfo;

    const featureId = `FEAT-${ticket_id}`;
    const prSet = {
      id: featureId,
      ticket: ticket_id,
      description,
      status: 'draft',
      created_at: new Date().toISOString(),
      repositories: {},
      merge_order: this.calculateMergeOrder(repositories, dependencies)
    };

    // Generate PR info for each repository
    repositories.forEach(repo => {
      const prInfo = this.generatePRInfo({
        repo,
        ticket_id,
        description,
        changes: changes_by_repo[repo] || [],
        related_repos: repositories.filter(r => r !== repo),
        dependencies: dependencies[repo] || []
      });

      prSet.repositories[repo] = {
        ...prInfo,
        status: 'pending',
        pr_number: null,
        pr_url: null
      };
    });

    // Save to tracking
    this.prTracking.active_features[featureId] = prSet;
    this.savePRTracking();

    return prSet;
  }

  /**
   * Generate PR information for a repository
   */
  generatePRInfo(params) {
    const {
      repo,
      ticket_id,
      description,
      changes,
      related_repos,
      dependencies
    } = params;

    const template = this.prTracking.pr_templates.default;
    
    // Generate title
    const title = template.title
      .replace('{ticket}', ticket_id)
      .replace('{description}', description);

    // Generate related PRs section
    const relatedPRs = related_repos.map(r => `- [ ] ${r}: PR pending`).join('\n');

    // Generate dependencies section
    const depsSection = dependencies.length > 0
      ? `This PR depends on:\n${dependencies.map(d => `- ${d}`).join('\n')}`
      : 'No dependencies';

    // Generate body
    const body = template.body
      .replace('{related_prs}', relatedPRs)
      .replace('{description}', description)
      .replace('{changes}', changes.join('\n- '))
      .replace('{dependencies}', depsSection)
      .replace('{feature_id}', `FEAT-${ticket_id}`)
      .replace('{ticket}', ticket_id);

    return {
      title,
      body,
      branch: `feature/${ticket_id}-${this.sanitizeBranchName(description)}`,
      labels: ['cross-repo', `feat-${ticket_id}`],
      reviewers: []
    };
  }

  /**
   * Calculate merge order based on dependencies
   */
  calculateMergeOrder(repositories, dependencies) {
    const order = [];
    const visited = new Set();

    const visit = (repo) => {
      if (visited.has(repo)) return;
      visited.add(repo);

      const repoDeps = dependencies[repo] || [];
      repoDeps.forEach(dep => {
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
   * Update PR status
   */
  updatePRStatus(featureId, repository, updates) {
    const feature = this.prTracking.active_features[featureId];
    if (!feature) {
      throw new Error(`Feature ${featureId} not found`);
    }

    if (!feature.repositories[repository]) {
      throw new Error(`Repository ${repository} not part of feature ${featureId}`);
    }

    Object.assign(feature.repositories[repository], updates);
    feature.last_updated = new Date().toISOString();

    // Check if all PRs are ready
    this.checkFeatureReadiness(featureId);

    this.savePRTracking();
    return feature.repositories[repository];
  }

  /**
   * Check if feature is ready for merge
   */
  checkFeatureReadiness(featureId) {
    const feature = this.prTracking.active_features[featureId];
    const repos = Object.values(feature.repositories);
    
    const allCreated = repos.every(r => r.pr_number !== null);
    const allApproved = repos.every(r => r.status === 'approved');
    const allTestsPassing = repos.every(r => r.tests_passing === true);

    if (allCreated && !feature.all_prs_created) {
      feature.all_prs_created = true;
      feature.status = 'in_review';
    }

    if (allApproved && allTestsPassing && !feature.ready_to_merge) {
      feature.ready_to_merge = true;
      feature.status = 'ready';
    }

    return {
      all_created: allCreated,
      all_approved: allApproved,
      all_tests_passing: allTestsPassing,
      ready_to_merge: feature.ready_to_merge || false
    };
  }

  /**
   * Generate merge instructions
   */
  generateMergeInstructions(featureId) {
    const feature = this.prTracking.active_features[featureId];
    if (!feature) {
      throw new Error(`Feature ${featureId} not found`);
    }

    const instructions = {
      feature_id: featureId,
      merge_order: feature.merge_order,
      steps: []
    };

    feature.merge_order.forEach((repo, index) => {
      const repoInfo = feature.repositories[repo];
      instructions.steps.push({
        order: index + 1,
        repository: repo,
        pr_number: repoInfo.pr_number,
        pr_url: repoInfo.pr_url,
        action: `Merge PR #${repoInfo.pr_number} in ${repo}`,
        wait_for: index > 0 ? `After ${feature.merge_order[index - 1]} is merged` : 'Can merge immediately'
      });
    });

    instructions.post_merge = [
      'Verify all services are running correctly',
      'Run integration tests across all repositories',
      'Update feature documentation',
      'Close related tickets'
    ];

    return instructions;
  }

  /**
   * Complete feature
   */
  completeFeature(featureId) {
    const feature = this.prTracking.active_features[featureId];
    if (!feature) {
      throw new Error(`Feature ${featureId} not found`);
    }

    feature.completed_at = new Date().toISOString();
    feature.status = 'completed';

    // Move to completed
    this.prTracking.completed_features[featureId] = feature;
    delete this.prTracking.active_features[featureId];

    this.savePRTracking();
    return {
      success: true,
      feature_id: featureId,
      duration: this.calculateDuration(feature.created_at, feature.completed_at)
    };
  }

  /**
   * Get PR checklist
   */
  getPRChecklist(featureId) {
    const feature = this.prTracking.active_features[featureId];
    if (!feature) {
      throw new Error(`Feature ${featureId} not found`);
    }

    const checklist = {
      feature_id: featureId,
      repositories: {}
    };

    Object.entries(feature.repositories).forEach(([repo, info]) => {
      checklist.repositories[repo] = {
        pr_created: info.pr_number !== null,
        tests_passing: info.tests_passing || false,
        approved: info.status === 'approved',
        no_conflicts: info.conflicts === false || info.conflicts === undefined,
        ready_to_merge: info.status === 'approved' && (info.tests_passing || false)
      };
    });

    checklist.overall = {
      all_prs_created: Object.values(checklist.repositories).every(r => r.pr_created),
      all_tests_passing: Object.values(checklist.repositories).every(r => r.tests_passing),
      all_approved: Object.values(checklist.repositories).every(r => r.approved),
      no_conflicts: Object.values(checklist.repositories).every(r => r.no_conflicts),
      ready_to_merge: Object.values(checklist.repositories).every(r => r.ready_to_merge)
    };

    return checklist;
  }

  /**
   * Generate PR status report
   */
  generateStatusReport() {
    const report = {
      active_features: Object.keys(this.prTracking.active_features).length,
      completed_features: Object.keys(this.prTracking.completed_features).length,
      features: []
    };

    Object.entries(this.prTracking.active_features).forEach(([id, feature]) => {
      const repoStatuses = Object.entries(feature.repositories).map(([repo, info]) => ({
        repository: repo,
        pr_number: info.pr_number,
        status: info.status,
        tests: info.tests_passing ? 'passing' : 'pending'
      }));

      report.features.push({
        id,
        description: feature.description,
        status: feature.status,
        created: feature.created_at,
        repositories: repoStatuses,
        ready_to_merge: feature.ready_to_merge || false
      });
    });

    return report;
  }

  /**
   * Sanitize branch name
   */
  sanitizeBranchName(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30)
      .replace(/^-|-$/g, '');
  }

  /**
   * Calculate duration
   */
  calculateDuration(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = endDate - startDate;
    
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${hours} hours`;
  }

  /**
   * Save PR tracking
   */
  savePRTracking() {
    this.prTracking.last_updated = new Date().toISOString();
    fs.writeFileSync(this.prTrackingPath, JSON.stringify(this.prTracking, null, 2));
  }
}

module.exports = CrossRepoPRHelper;

// CLI interface
if (require.main === module) {
  const helper = new CrossRepoPRHelper(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'create':
      if (args.length < 3) {
        console.log('Usage: create <ticket> <description> <repo1,repo2,...>');
        process.exit(1);
      }
      const repos = args[2].split(',');
      const prSet = helper.createCoordinatedPRs({
        ticket_id: args[0],
        description: args[1],
        repositories: repos,
        changes_by_repo: repos.reduce((acc, r) => ({ ...acc, [r]: ['Changes'] }), {}),
        dependencies: {}
      });
      console.log(JSON.stringify(prSet, null, 2));
      break;
      
    case 'status':
      const report = helper.generateStatusReport();
      console.log(JSON.stringify(report, null, 2));
      break;
      
    case 'checklist':
      if (!args[0]) {
        console.log('Usage: checklist <feature-id>');
        process.exit(1);
      }
      const checklist = helper.getPRChecklist(args[0]);
      console.log(JSON.stringify(checklist, null, 2));
      break;
      
    case 'merge-order':
      if (!args[0]) {
        console.log('Usage: merge-order <feature-id>');
        process.exit(1);
      }
      const instructions = helper.generateMergeInstructions(args[0]);
      console.log(JSON.stringify(instructions, null, 2));
      break;
      
    default:
      console.log('Commands: create, status, checklist, merge-order');
  }
}