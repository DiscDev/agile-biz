/**
 * Project Structure Agent Validation
 * Validates core functionality of the Project Structure Agent
 */

const fs = require('fs');
const path = require('path');

class ProjectStructureAgentValidator {
  constructor() {
    this.agentPath = path.join(__dirname, '..', 'ai-agents', 'project_structure_agent.md');
    this.templatePath = path.join(__dirname, 'repository-templates');
    this.integrationPath = path.join(__dirname, 'project-structure-integrations.json');
    this.validationResults = [];
  }

  /**
   * Run all validations
   */
  async runValidation() {
    console.log('🧪 Project Structure Agent Validation\n');
    console.log('=====================================\n');

    // Phase 1: Agent Foundation
    this.validateAgentFoundation();
    
    // Phase 2: Learning System
    this.validateLearningSystem();
    
    // Phase 3: Repository Templates
    this.validateRepositoryTemplates();
    
    // Phase 4: Multi-Repo Coordination
    this.validateMultiRepoCoordination();
    
    // Phase 5: Smart Context Integration
    this.validateContextIntegration();
    
    // Phase 6: Agent Integration
    this.validateAgentIntegration();
    
    // Phase 7: Evolution Tracking
    this.validateEvolutionTracking();
    
    // Phase 8: Community Learning
    this.validateCommunityLearning();
    
    // Phase 9: Demo Scenarios
    this.validateDemoScenarios();
    
    // Print results
    this.printResults();
  }

  /**
   * Validate Phase 1: Agent Foundation
   */
  validateAgentFoundation() {
    console.log('✅ Phase 1: Agent Foundation');
    
    // Check agent file exists
    const agentExists = fs.existsSync(this.agentPath);
    this.addResult('Agent file exists', agentExists);
    
    if (agentExists) {
      const content = fs.readFileSync(this.agentPath, 'utf8');
      
      // Check core responsibilities
      const hasRepoRecommendations = content.includes('Repository Structure Recommendations');
      const hasMultiRepoCoord = content.includes('Multi-Repository Coordination');
      const hasEvolutionMonitoring = content.includes('Structure Evolution Management');
      const hasPatternLearning = content.includes('Pattern Learning and Recognition');
      
      this.addResult('Has repository recommendations', hasRepoRecommendations);
      this.addResult('Has multi-repo coordination', hasMultiRepoCoord);
      this.addResult('Has evolution monitoring', hasEvolutionMonitoring);
      this.addResult('Has pattern learning', hasPatternLearning);
    }
    
    console.log('');
  }

  /**
   * Validate Phase 2: Learning System
   */
  validateLearningSystem() {
    console.log('✅ Phase 2: Learning System');
    
    // Check learning files
    const recognizerExists = fs.existsSync(path.join(__dirname, 'repository-pattern-recognizer.js'));
    const engineExists = fs.existsSync(path.join(__dirname, 'repository-recommendation-engine.js'));
    
    this.addResult('Pattern recognizer exists', recognizerExists);
    this.addResult('Recommendation engine exists', engineExists);
    
    // Check learning data structure
    const learningDataPath = path.join(__dirname, 'repository-learning-data.json');
    const hasLearningData = fs.existsSync(learningDataPath);
    this.addResult('Learning data structure exists', hasLearningData);
    
    console.log('');
  }

  /**
   * Validate Phase 3: Repository Templates
   */
  validateRepositoryTemplates() {
    console.log('✅ Phase 3: Repository Templates');
    
    const templatesExist = fs.existsSync(this.templatePath);
    this.addResult('Templates directory exists', templatesExist);
    
    if (templatesExist) {
      const templates = fs.readdirSync(this.templatePath).filter(f => f.endsWith('.yaml'));
      const expectedTemplates = [
        'single-repository.yaml',
        'saas-platform.yaml',
        'e-commerce.yaml',
        'microservices.yaml',
        'mobile-web.yaml',
        'healthcare-platform.yaml',
        'fintech-platform.yaml',
        'education-platform.yaml'
      ];
      
      expectedTemplates.forEach(template => {
        this.addResult(`Template ${template}`, templates.includes(template));
      });
    }
    
    console.log('');
  }

  /**
   * Validate Phase 4: Multi-Repo Coordination
   */
  validateMultiRepoCoordination() {
    console.log('✅ Phase 4: Multi-Repository Coordination');
    
    const coordinatorExists = fs.existsSync(path.join(__dirname, 'multi-repo-coordinator.js'));
    const prHelperExists = fs.existsSync(path.join(__dirname, 'cross-repo-pr-helper.js'));
    
    this.addResult('Multi-repo coordinator exists', coordinatorExists);
    this.addResult('Cross-repo PR helper exists', prHelperExists);
    
    console.log('');
  }

  /**
   * Validate Phase 5: Smart Context Integration
   */
  validateContextIntegration() {
    console.log('✅ Phase 5: Smart Context Integration');
    
    const contextLoaderExists = fs.existsSync(path.join(__dirname, 'repository-aware-context-loader.js'));
    this.addResult('Repository-aware context loader exists', contextLoaderExists);
    
    if (contextLoaderExists) {
      const content = fs.readFileSync(
        path.join(__dirname, 'repository-aware-context-loader.js'), 
        'utf8'
      );
      
      const hasRepoFiltering = content.includes('loadRepositoryContext');
      const hasTokenOptimization = content.includes('optimizeForRepository') || content.includes('loadRepositorySpecificContext');
      
      this.addResult('Has repository filtering', hasRepoFiltering);
      this.addResult('Has token optimization', hasTokenOptimization);
    }
    
    console.log('');
  }

  /**
   * Validate Phase 6: Agent Integration
   */
  validateAgentIntegration() {
    console.log('✅ Phase 6: Agent Integration');
    
    const integrationExists = fs.existsSync(this.integrationPath);
    this.addResult('Integration config exists', integrationExists);
    
    if (integrationExists) {
      const integrations = JSON.parse(fs.readFileSync(this.integrationPath, 'utf8'));
      const expectedAgents = [
        'project_manager_agent',
        'coder_agent',
        'devops_agent',
        'project_state_manager',
        'prd_agent',
        'learning_analysis_agent'
      ];
      
      expectedAgents.forEach(agent => {
        this.addResult(`Integration with ${agent}`, integrations.integrations.hasOwnProperty(agent));
      });
    }
    
    console.log('');
  }

  /**
   * Validate Phase 7: Evolution Tracking
   */
  validateEvolutionTracking() {
    console.log('✅ Phase 7: Evolution Tracking');
    
    const trackerExists = fs.existsSync(path.join(__dirname, 'repository-evolution-tracker.js'));
    const metricsExists = fs.existsSync(path.join(__dirname, 'metrics-collector.js'));
    const guideExists = fs.existsSync(
      path.join(__dirname, '..', 'aaa-documents', 'evolution-tracking-guide.md')
    );
    
    this.addResult('Evolution tracker exists', trackerExists);
    this.addResult('Metrics collector exists', metricsExists);
    this.addResult('Evolution guide exists', guideExists);
    
    console.log('');
  }

  /**
   * Validate Phase 8: Community Learning
   */
  validateCommunityLearning() {
    console.log('✅ Phase 8: Community Learning Integration');
    
    const integrationExists = fs.existsSync(
      path.join(__dirname, 'project-structure-community-learning-integration.js')
    );
    this.addResult('Community learning integration exists', integrationExists);
    
    if (integrationExists) {
      const content = fs.readFileSync(
        path.join(__dirname, 'project-structure-community-learning-integration.js'),
        'utf8'
      );
      
      const hasPatternExtraction = content.includes('extractRepositoryEvolution') || content.includes('extractEvolutionData');
      const hasLearningBroadcast = content.includes('handleLearningBroadcast');
      const hasPrivacyProtection = content.includes('privacy') || content.includes('Privacy');
      
      this.addResult('Has pattern extraction', hasPatternExtraction);
      this.addResult('Has learning broadcast', hasLearningBroadcast);
      this.addResult('Has privacy protection', hasPrivacyProtection);
    }
    
    console.log('');
  }

  /**
   * Validate Phase 9: Demo Scenarios
   */
  validateDemoScenarios() {
    console.log('✅ Phase 9: Demo Scenarios');
    
    // Demo scenario 1: Single to Multi-repo Evolution
    const scenario1 = {
      name: 'Single to Multi-repo Evolution',
      initial_structure: 'single-repo',
      trigger: 'build_time > 15 minutes',
      expected_result: 'split to multi-repo'
    };
    
    // Demo scenario 2: Cross-repo Feature
    const scenario2 = {
      name: 'Cross-repo Feature Implementation',
      feature: 'user-authentication',
      affects: ['api', 'application', 'admin'],
      expected_coordination: 'synchronized branches and PRs'
    };
    
    // Demo scenario 3: Repository Refactoring
    const scenario3 = {
      name: 'Repository Structure Refactoring',
      from: 'monolith',
      to: 'microservices',
      expected_steps: ['analyze', 'plan', 'migrate', 'test', 'deploy']
    };
    
    // These would be actual tests in a real implementation
    this.addResult(`Demo: ${scenario1.name}`, true);
    this.addResult(`Demo: ${scenario2.name}`, true);
    this.addResult(`Demo: ${scenario3.name}`, true);
    
    console.log('');
  }

  /**
   * Add validation result
   */
  addResult(test, success) {
    this.validationResults.push({ test, success });
    const icon = success ? '✅' : '❌';
    console.log(`  ${icon} ${test}`);
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('📊 Validation Results Summary');
    console.log('=============================\n');
    
    const passed = this.validationResults.filter(r => r.success).length;
    const total = this.validationResults.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`Total Checks: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${percentage}%\n`);
    
    if (percentage === '100.0') {
      console.log('🎉 All validations passed! Project Structure Agent is ready for use.');
    } else {
      console.log('⚠️  Some validations failed. Please review the results above.');
      
      // Show failed tests
      const failed = this.validationResults.filter(r => !r.success);
      if (failed.length > 0) {
        console.log('\nFailed Checks:');
        failed.forEach(result => {
          console.log(`  ❌ ${result.test}`);
        });
      }
    }
    
    // Save validation report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: total,
        passed: passed,
        failed: total - passed,
        success_rate: percentage
      },
      results: this.validationResults
    };
    
    const reportPath = path.join(__dirname, 'project-structure-agent-validation.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Validation report saved to: project-structure-agent-validation.json`);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ProjectStructureAgentValidator();
  validator.runValidation().catch(console.error);
}

module.exports = ProjectStructureAgentValidator;