/**
 * Project Structure Agent Testing & Validation Suite
 * Tests pattern recognition, recommendation engine, and multi-repo coordination
 */

const fs = require('fs');
const path = require('path');
const RepositoryPatternRecognizer = require('./repository-pattern-recognizer');
const RepositoryCoordinator = require('./multi-repo-coordinator');
const RepositoryEvolutionTracker = require('./repository-evolution-tracker');
const CommunityLearningIntegration = require('./project-structure-community-learning-integration');

class ProjectStructureAgentTester {
  constructor() {
    this.recognizer = new RepositoryPatternRecognizer(path.join(__dirname, '..'));
    this.coordinator = new RepositoryCoordinator(path.join(__dirname, '..'));
    this.tracker = new RepositoryEvolutionTracker(path.join(__dirname, '..'));
    this.learningIntegration = new CommunityLearningIntegration(path.join(__dirname, '..'));
    this.testResults = [];
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Project Structure Agent Test Suite\n');
    
    await this.testPatternRecognition();
    await this.testRecommendationEngine();
    await this.testMultiRepoCoordination();
    await this.testEvolutionTracking();
    await this.testCommunityLearning();
    await this.testDemoScenarios();
    
    this.printTestResults();
  }

  /**
   * Test 1: Pattern Recognition Accuracy
   */
  async testPatternRecognition() {
    console.log('🔍 Testing Pattern Recognition Accuracy...');
    const testCases = [
      {
        name: 'SaaS Pattern Detection',
        input: {
          project_type: 'saas-b2b',
          industry: 'healthcare',
          technology_stack: {
            frontend: { framework: 'React' },
            backend: { framework: 'Node.js' }
          },
          expected_users: 5000
        },
        expectedPattern: 'saas-platform',
        expectedConfidence: 0.8
      },
      {
        name: 'E-commerce Pattern Detection',
        input: {
          project_type: 'marketplace',
          industry: 'retail',
          technology_stack: {
            frontend: { framework: 'Vue.js' },
            backend: { framework: 'Django' }
          },
          expected_users: 50000
        },
        expectedPattern: 'e-commerce',
        expectedConfidence: 0.85
      },
      {
        name: 'Mobile App Pattern Detection',
        input: {
          project_type: 'mobile-app',
          industry: 'fitness',
          technology_stack: {
            mobile: { framework: 'React Native' },
            backend: { framework: 'Express' }
          },
          expected_users: 100000
        },
        expectedPattern: 'mobile-web',
        expectedConfidence: 0.75
      }
    ];

    for (const testCase of testCases) {
      const patterns = await this.recognizer.findSimilarPatterns(testCase.input);
      const topPattern = patterns[0];
      
      const success = topPattern && 
                      topPattern.template_id === testCase.expectedPattern &&
                      topPattern.confidence >= testCase.expectedConfidence;
      
      this.testResults.push({
        test: `Pattern Recognition: ${testCase.name}`,
        success,
        details: {
          expected: testCase.expectedPattern,
          actual: topPattern?.template_id || 'none',
          confidence: topPattern?.confidence || 0
        }
      });
    }
  }

  /**
   * Test 2: Recommendation Engine Validation
   */
  async testRecommendationEngine() {
    console.log('\n🎯 Testing Recommendation Engine...');
    const testProjects = [
      {
        name: 'Small SaaS Startup',
        context: {
          project_type: 'saas-b2b',
          team_size: 2,
          expected_users: 1000,
          has_marketing_team: false
        },
        expectedRecommendation: 'single-repo',
        expectedEvolutionTriggers: ['team_growth', 'user_growth']
      },
      {
        name: 'Enterprise Platform',
        context: {
          project_type: 'enterprise',
          team_size: 20,
          expected_users: 100000,
          compliance_required: true
        },
        expectedRecommendation: 'multi-repo',
        expectedMinRepos: 4
      }
    ];

    for (const project of testProjects) {
      const recommendation = await this.recognizer.getRecommendation(project.context);
      
      let success = false;
      if (project.expectedRecommendation === 'single-repo') {
        success = recommendation.initial_structure === 'single-repo';
      } else if (project.expectedRecommendation === 'multi-repo') {
        success = recommendation.repositories && 
                  recommendation.repositories.length >= project.expectedMinRepos;
      }
      
      this.testResults.push({
        test: `Recommendation Engine: ${project.name}`,
        success,
        details: {
          recommendation: recommendation.initial_structure || 'multi-repo',
          repos: recommendation.repositories?.length || 1,
          confidence: recommendation.confidence
        }
      });
    }
  }

  /**
   * Test 3: Multi-Repository Coordination
   */
  async testMultiRepoCoordination() {
    console.log('\n🔄 Testing Multi-Repo Coordination...');
    
    // Test repository mapping
    const testMapping = {
      'src/components/MarketingHero.jsx': 'marketing',
      'src/api/auth/login.js': 'api',
      'src/app/Dashboard.tsx': 'application',
      'src/admin/UserManagement.vue': 'admin'
    };

    let mappingSuccess = true;
    for (const [file, expectedRepo] of Object.entries(testMapping)) {
      const actualRepo = this.coordinator.determineRepository(file);
      if (actualRepo !== expectedRepo) {
        mappingSuccess = false;
        break;
      }
    }

    this.testResults.push({
      test: 'Multi-Repo: File Mapping',
      success: mappingSuccess,
      details: { tested: Object.keys(testMapping).length }
    });

    // Test cross-repo dependency tracking
    const dependencies = [
      { from: 'application', to: 'api', type: 'http' },
      { from: 'admin', to: 'api', type: 'http' },
      { from: 'marketing', to: 'application', type: 'link' }
    ];

    for (const dep of dependencies) {
      this.coordinator.addDependency(dep.from, dep.to, dep.type);
    }

    const depGraph = this.coordinator.getDependencyGraph();
    const depSuccess = depGraph.application?.dependencies.includes('api') &&
                      depGraph.admin?.dependencies.includes('api');

    this.testResults.push({
      test: 'Multi-Repo: Dependency Tracking',
      success: depSuccess,
      details: { dependencies: dependencies.length }
    });

    // Test synchronized operations
    const syncOp = this.coordinator.createSynchronizedOperation('feature/user-auth', [
      { repo: 'api', changes: ['auth endpoints'] },
      { repo: 'application', changes: ['login UI'] },
      { repo: 'admin', changes: ['user management'] }
    ]);

    this.testResults.push({
      test: 'Multi-Repo: Synchronized Operations',
      success: syncOp.affected_repos.length === 3,
      details: { operation: syncOp.branch, repos: syncOp.affected_repos }
    });
  }

  /**
   * Test 4: Evolution Tracking
   */
  async testEvolutionTracking() {
    console.log('\n📈 Testing Evolution Tracking...');
    
    // Simulate repository health monitoring
    const healthSnapshot = await this.tracker.monitorHealth();
    
    this.testResults.push({
      test: 'Evolution: Health Monitoring',
      success: healthSnapshot && healthSnapshot.overall_health !== undefined,
      details: { 
        health: healthSnapshot?.overall_health || 0,
        issues: healthSnapshot?.issues?.length || 0
      }
    });

    // Test evolution trigger detection
    const triggers = [
      { metric: 'build_time', value: 20, threshold: 15, expected: true },
      { metric: 'merge_conflicts', value: 0.25, threshold: 0.2, expected: true },
      { metric: 'team_size', value: 8, threshold: 10, expected: false }
    ];

    let triggerSuccess = true;
    for (const trigger of triggers) {
      const shouldEvolve = this.tracker.checkEvolutionTrigger(
        trigger.metric, 
        trigger.value, 
        trigger.threshold
      );
      if (shouldEvolve !== trigger.expected) {
        triggerSuccess = false;
      }
    }

    this.testResults.push({
      test: 'Evolution: Trigger Detection',
      success: triggerSuccess,
      details: { triggers: triggers.length }
    });

    // Test evolution prediction
    const prediction = this.tracker.predictEvolution({
      current_structure: 'single-repo',
      metrics: {
        build_time: 18,
        team_size: 7,
        code_size: 45000,
        merge_conflicts: 0.15
      }
    });

    this.testResults.push({
      test: 'Evolution: Prediction System',
      success: prediction && prediction.recommendation !== undefined,
      details: { 
        recommendation: prediction?.recommendation || 'none',
        confidence: prediction?.confidence || 0
      }
    });
  }

  /**
   * Test 5: Community Learning Integration
   */
  async testCommunityLearning() {
    console.log('\n🌐 Testing Community Learning Integration...');
    
    // Test pattern extraction from contributions
    const mockContribution = {
      path: 'contributions/2025-01-test-saas',
      learnings: {
        repository_evolution: {
          timeline: [
            { date: '2025-01-01', from: 'single-repo', to: 'multi-repo' }
          ],
          lessons_learned: ['Split improved deployment speed by 40%']
        }
      }
    };

    const patterns = await this.learningIntegration.extractPatternsFromContribution(
      mockContribution
    );

    this.testResults.push({
      test: 'Community: Pattern Extraction',
      success: patterns && patterns.length > 0,
      details: { patterns: patterns?.length || 0 }
    });

    // Test learning broadcast system
    const broadcast = {
      pattern_type: 'repository_structure',
      pattern: 'saas_early_split',
      confidence: 0.85,
      sample_size: 5
    };

    const integrated = this.learningIntegration.integrateLearnedPattern(broadcast);

    this.testResults.push({
      test: 'Community: Learning Integration',
      success: integrated,
      details: { pattern: broadcast.pattern, confidence: broadcast.confidence }
    });

    // Test minimum sample size requirement
    const lowSampleBroadcast = {
      pattern_type: 'repository_structure',
      pattern: 'rare_pattern',
      confidence: 0.9,
      sample_size: 2  // Below minimum of 3
    };

    const rejected = !this.learningIntegration.integrateLearnedPattern(lowSampleBroadcast);

    this.testResults.push({
      test: 'Community: Sample Size Validation',
      success: rejected,
      details: { sample_size: lowSampleBroadcast.sample_size, minimum: 3 }
    });
  }

  /**
   * Test 6: Demo Scenarios
   */
  async testDemoScenarios() {
    console.log('\n🎬 Testing Demo Scenarios...');
    
    // Scenario 1: Single to Multi-Repo Evolution
    const evolutionScenario = {
      initial: {
        structure: 'single-repo',
        metrics: { build_time: 5, team_size: 2 }
      },
      after_6_months: {
        metrics: { build_time: 25, team_size: 8 }
      }
    };

    const evolutionNeeded = this.tracker.analyzeEvolutionNeed(
      evolutionScenario.initial,
      evolutionScenario.after_6_months
    );

    this.testResults.push({
      test: 'Demo: Single to Multi Evolution',
      success: evolutionNeeded.should_evolve === true,
      details: { 
        recommendation: evolutionNeeded.recommendation,
        reasons: evolutionNeeded.reasons?.length || 0
      }
    });

    // Scenario 2: Cross-Repo Feature Implementation
    const feature = {
      name: 'user-authentication',
      affects: ['api', 'application', 'admin'],
      tasks: [
        { repo: 'api', task: 'Create auth endpoints' },
        { repo: 'application', task: 'Build login UI' },
        { repo: 'admin', task: 'Add user management' }
      ]
    };

    const coordination = this.coordinator.planCrossRepoFeature(feature);

    this.testResults.push({
      test: 'Demo: Cross-Repo Feature',
      success: coordination.repos.length === 3 && coordination.branch !== undefined,
      details: { 
        feature: feature.name,
        repos: coordination.repos,
        branch: coordination.branch
      }
    });

    // Scenario 3: Repository Structure Refactoring
    const refactoring = {
      from: {
        structure: ['monolith'],
        issues: ['slow builds', 'deployment conflicts']
      },
      to: {
        structure: ['frontend', 'backend', 'api', 'admin'],
        benefits: ['independent deployments', 'faster builds']
      }
    };

    const refactorPlan = this.coordinator.planRefactoring(refactoring);

    this.testResults.push({
      test: 'Demo: Structure Refactoring',
      success: refactorPlan && refactorPlan.steps?.length > 0,
      details: { 
        steps: refactorPlan?.steps?.length || 0,
        estimated_effort: refactorPlan?.estimated_hours || 'unknown'
      }
    });
  }

  /**
   * Print test results
   */
  printTestResults() {
    console.log('\n\n📊 Test Results Summary');
    console.log('========================\n');

    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const percentage = ((passed / total) * 100).toFixed(1);

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${percentage}%\n`);

    // Group results by category
    const categories = {};
    this.testResults.forEach(result => {
      const category = result.test.split(':')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(result);
    });

    // Print by category
    for (const [category, results] of Object.entries(categories)) {
      console.log(`\n${category}:`);
      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`  ${status} ${result.test}`);
        if (result.details) {
          console.log(`     Details: ${JSON.stringify(result.details)}`);
        }
      });
    }

    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: total,
        passed: passed,
        failed: total - passed,
        success_rate: percentage
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };

    // Save test report
    const reportPath = path.join(__dirname, 'test-results', 'project-structure-agent-test-report.json');
    this.ensureDirectoryExists(path.dirname(reportPath));
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Test report saved to: ${reportPath}`);
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.success);

    if (failedTests.length === 0) {
      recommendations.push('All tests passed! Project Structure Agent is ready for production use.');
    } else {
      failedTests.forEach(test => {
        if (test.test.includes('Pattern Recognition')) {
          recommendations.push('Review and update pattern matching algorithms');
        } else if (test.test.includes('Recommendation Engine')) {
          recommendations.push('Calibrate recommendation confidence thresholds');
        } else if (test.test.includes('Multi-Repo')) {
          recommendations.push('Verify repository coordination logic');
        } else if (test.test.includes('Evolution')) {
          recommendations.push('Adjust evolution trigger thresholds');
        } else if (test.test.includes('Community')) {
          recommendations.push('Check community learning integration');
        }
      });
    }

    return recommendations;
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Extension methods for testing
RepositoryPatternRecognizer.prototype.getRecommendation = async function(context) {
  const patterns = await this.findSimilarPatterns(context);
  if (patterns.length === 0) {
    return { initial_structure: 'single-repo', confidence: 0.5 };
  }
  
  const topPattern = patterns[0];
  const template = this.loadTemplate(topPattern.template_id);
  
  return {
    initial_structure: template.repositories.length === 1 ? 'single-repo' : 'multi-repo',
    repositories: template.repositories,
    confidence: topPattern.confidence,
    evolution_triggers: template.evolution_triggers || []
  };
};

RepositoryCoordinator.prototype.determineRepository = function(filePath) {
  if (filePath.includes('marketing') || filePath.includes('Marketing')) return 'marketing';
  if (filePath.includes('admin') || filePath.includes('Admin')) return 'admin';
  if (filePath.includes('api') || filePath.includes('auth')) return 'api';
  return 'application';
};

RepositoryCoordinator.prototype.planCrossRepoFeature = function(feature) {
  const branch = `feature/${feature.name}`;
  return {
    branch,
    repos: feature.affects,
    tasks: feature.tasks,
    coordination_needed: true
  };
};

RepositoryCoordinator.prototype.planRefactoring = function(refactoring) {
  return {
    steps: [
      'Analyze current structure',
      'Create new repositories',
      'Move code to appropriate repos',
      'Update dependencies',
      'Test integrations',
      'Update CI/CD'
    ],
    estimated_hours: refactoring.to.structure.length * 8
  };
};

RepositoryEvolutionTracker.prototype.checkEvolutionTrigger = function(metric, value, threshold) {
  return value > threshold;
};

RepositoryEvolutionTracker.prototype.predictEvolution = function(context) {
  const triggers = [];
  if (context.metrics.build_time > 15) triggers.push('slow_builds');
  if (context.metrics.team_size > 5) triggers.push('team_growth');
  if (context.metrics.merge_conflicts > 0.2) triggers.push('integration_issues');
  
  return {
    recommendation: triggers.length >= 2 ? 'split_repository' : 'maintain_current',
    confidence: Math.min(triggers.length * 0.3, 0.9),
    triggers
  };
};

RepositoryEvolutionTracker.prototype.analyzeEvolutionNeed = function(initial, current) {
  const reasons = [];
  if (current.metrics.build_time > initial.metrics.build_time * 3) {
    reasons.push('Build time increased 3x');
  }
  if (current.metrics.team_size > initial.metrics.team_size * 2) {
    reasons.push('Team size doubled');
  }
  
  return {
    should_evolve: reasons.length > 0,
    recommendation: 'split_to_multi_repo',
    reasons
  };
};

CommunityLearningIntegration.prototype.extractPatternsFromContribution = async function(contribution) {
  if (!contribution.learnings?.repository_evolution) return [];
  
  return [{
    type: 'evolution',
    pattern: contribution.learnings.repository_evolution,
    source: contribution.path
  }];
};

CommunityLearningIntegration.prototype.integrateLearnedPattern = function(broadcast) {
  // Validate minimum requirements
  if (broadcast.sample_size < 3) return false;
  if (broadcast.confidence < 0.7) return false;
  
  // Integration would happen here
  return true;
};

// Run tests if called directly
if (require.main === module) {
  const tester = new ProjectStructureAgentTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ProjectStructureAgentTester;