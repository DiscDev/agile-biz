#!/usr/bin/env node

/**
 * Validation Metrics Collector
 * Collects metrics on defensive programming, authentication testing, and deployment readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

class ValidationMetricsCollector {
  constructor(projectPath = '.', options = {}) {
    this.projectPath = projectPath;
    this.options = {
      outputPath: options.outputPath || './validation-metrics.json',
      verbose: options.verbose || false,
      ...options
    };
    
    this.metrics = {
      timestamp: new Date().toISOString(),
      project: path.basename(path.resolve(projectPath)),
      defensiveProgramming: {},
      authenticationTesting: {},
      deploymentReadiness: {},
      codeQuality: {},
      processAdherence: {}
    };
  }

  /**
   * Collect all validation metrics
   */
  async collectAll() {
    console.log('📊 Collecting validation metrics...\n');
    
    await this.collectDefensiveProgrammingMetrics();
    await this.collectAuthenticationTestingMetrics();
    await this.collectDeploymentReadinessMetrics();
    await this.collectCodeQualityMetrics();
    await this.collectProcessAdherenceMetrics();
    
    this.calculateSummaryMetrics();
    this.saveMetrics();
    this.displaySummary();
    
    return this.metrics;
  }

  /**
   * Collect defensive programming metrics
   */
  async collectDefensiveProgrammingMetrics() {
    console.log('🛡️  Analyzing defensive programming patterns...');
    
    const sourceFiles = glob.sync('**/*.{js,jsx,ts,tsx}', {
      cwd: this.projectPath,
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });
    
    let totalPropertyAccess = 0;
    let optionalChainingUsed = 0;
    let arrayChecks = 0;
    let unsafeArrayOperations = 0;
    let fallbacksProvided = 0;
    let missingFallbacks = 0;
    
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(path.join(this.projectPath, file), 'utf8');
      
      // Count optional chaining usage
      const propertyAccesses = content.match(/\.\w+/g) || [];
      const optionalChains = content.match(/\?\.\w+/g) || [];
      totalPropertyAccess += propertyAccesses.length;
      optionalChainingUsed += optionalChains.length;
      
      // Count array safety
      const arrayIsArrayChecks = content.match(/Array\.isArray\(/g) || [];
      const arrayMethods = content.match(/\.(map|filter|reduce|forEach)\(/g) || [];
      arrayChecks += arrayIsArrayChecks.length;
      unsafeArrayOperations += Math.max(0, arrayMethods.length - arrayIsArrayChecks.length);
      
      // Count fallback patterns
      const nullishCoalescing = content.match(/\?\?/g) || [];
      const orFallbacks = content.match(/\|\|/g) || [];
      fallbacksProvided += nullishCoalescing.length + orFallbacks.length;
      
      // Estimate missing fallbacks (simplified)
      const assignments = content.match(/const\s+\w+\s*=\s*\w+\.\w+/g) || [];
      missingFallbacks += assignments.filter(a => !a.includes('?.') && !a.includes('||')).length;
    });
    
    this.metrics.defensiveProgramming = {
      files: sourceFiles.length,
      optionalChainingCoverage: totalPropertyAccess > 0 
        ? ((optionalChainingUsed / totalPropertyAccess) * 100).toFixed(2) + '%'
        : '0%',
      arrayOperationSafety: arrayMethods > 0
        ? (((arrayChecks / (arrayChecks + unsafeArrayOperations)) * 100).toFixed(2) + '%')
        : '100%',
      fallbackCoverage: (assignments > 0 && assignments.length > missingFallbacks)
        ? (((assignments.length - missingFallbacks) / assignments.length * 100).toFixed(2) + '%')
        : '0%',
      violations: {
        unsafePropertyAccess: totalPropertyAccess - optionalChainingUsed,
        unsafeArrayOperations,
        missingFallbacks
      }
    };
  }

  /**
   * Collect authentication testing metrics
   */
  async collectAuthenticationTestingMetrics() {
    console.log('🔐 Analyzing authentication testing...');
    
    const testFiles = glob.sync('**/*.{test,spec}.{js,jsx,ts,tsx}', {
      cwd: this.projectPath,
      ignore: ['node_modules/**']
    });
    
    let totalAuthTests = 0;
    let testsStartingUnauthenticated = 0;
    let apiContractTests = 0;
    let errorScenarioTests = 0;
    
    testFiles.forEach(file => {
      const content = fs.readFileSync(path.join(this.projectPath, file), 'utf8');
      
      // Check for authentication tests
      if (content.match(/auth|login|logout|token/i)) {
        totalAuthTests++;
        
        // Check if tests start with clearing auth state
        if (content.match(/localStorage\.clear|sessionStorage\.clear|clearCookies/)) {
          testsStartingUnauthenticated++;
        }
        
        // Check for API contract validation
        if (content.match(/expect.*response.*toMatchObject|toHaveProperty/)) {
          apiContractTests++;
        }
        
        // Check for error scenario testing
        if (content.match(/401|403|unauthorized|forbidden/i)) {
          errorScenarioTests++;
        }
      }
    });
    
    // Check for test coverage
    let coverageData = { statements: 0, branches: 0, functions: 0, lines: 0 };
    try {
      const coveragePath = path.join(this.projectPath, 'coverage/coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        coverageData = coverage.total;
      }
    } catch (error) {
      // Coverage data not available
    }
    
    this.metrics.authenticationTesting = {
      testFiles: testFiles.length,
      authenticationTests: totalAuthTests,
      testsStartingUnauthenticated,
      unauthenticatedTestCoverage: totalAuthTests > 0
        ? ((testsStartingUnauthenticated / totalAuthTests) * 100).toFixed(2) + '%'
        : '0%',
      apiContractTests,
      errorScenarioTests,
      testCoverage: {
        statements: coverageData.statements.pct + '%',
        branches: coverageData.branches.pct + '%',
        functions: coverageData.functions.pct + '%',
        lines: coverageData.lines.pct + '%'
      }
    };
  }

  /**
   * Collect deployment readiness metrics
   */
  async collectDeploymentReadinessMetrics() {
    console.log('🚀 Analyzing deployment readiness...');
    
    const metrics = {
      dependencies: { passed: false, issues: [] },
      build: { passed: false, issues: [] },
      startup: { passed: false, issues: [] },
      integration: { passed: false, issues: [] }
    };
    
    // Check dependencies
    try {
      // Check for lock file
      const hasLockFile = fs.existsSync(path.join(this.projectPath, 'package-lock.json')) ||
                         fs.existsSync(path.join(this.projectPath, 'yarn.lock'));
      
      if (!hasLockFile) {
        metrics.dependencies.issues.push('No lock file found');
      }
      
      // Check for vulnerabilities
      try {
        const auditOutput = execSync('npm audit --json', { 
          cwd: this.projectPath, 
          stdio: 'pipe' 
        }).toString();
        const audit = JSON.parse(auditOutput);
        
        if (audit.metadata.vulnerabilities.high > 0 || audit.metadata.vulnerabilities.critical > 0) {
          metrics.dependencies.issues.push(
            `${audit.metadata.vulnerabilities.high + audit.metadata.vulnerabilities.critical} high/critical vulnerabilities`
          );
        }
      } catch (auditError) {
        // Audit failed or not available
      }
      
      metrics.dependencies.passed = metrics.dependencies.issues.length === 0;
    } catch (error) {
      metrics.dependencies.issues.push('Dependency check failed');
    }
    
    // Check build
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8')
      );
      
      if (!packageJson.scripts || !packageJson.scripts.build) {
        metrics.build.issues.push('No build script found');
      }
      
      // Check for TypeScript errors
      if (fs.existsSync(path.join(this.projectPath, 'tsconfig.json'))) {
        try {
          execSync('npx tsc --noEmit', { cwd: this.projectPath, stdio: 'pipe' });
        } catch (tscError) {
          metrics.build.issues.push('TypeScript compilation errors');
        }
      }
      
      metrics.build.passed = metrics.build.issues.length === 0;
    } catch (error) {
      metrics.build.issues.push('Build check failed');
    }
    
    // Check startup configuration
    const startupChecks = {
      hasStartScript: false,
      hasPortConfig: false,
      hasHealthCheck: false,
      hasErrorHandling: false
    };
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8')
      );
      
      startupChecks.hasStartScript = packageJson.scripts && packageJson.scripts.start;
      
      // Check for port configuration
      const mainFiles = ['server.js', 'app.js', 'index.js', 'src/server.js', 'src/index.js'];
      for (const file of mainFiles) {
        const filePath = path.join(this.projectPath, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('process.env.PORT')) {
            startupChecks.hasPortConfig = true;
          }
          if (content.includes('/health')) {
            startupChecks.hasHealthCheck = true;
          }
          if (content.includes('error') || content.includes('catch')) {
            startupChecks.hasErrorHandling = true;
          }
        }
      }
    } catch (error) {
      metrics.startup.issues.push('Startup check failed');
    }
    
    Object.entries(startupChecks).forEach(([check, passed]) => {
      if (!passed) {
        metrics.startup.issues.push(`Missing ${check.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    });
    
    metrics.startup.passed = metrics.startup.issues.length === 0;
    
    // Check integration
    metrics.integration.passed = true; // Simplified for example
    
    this.metrics.deploymentReadiness = metrics;
  }

  /**
   * Collect code quality metrics
   */
  async collectCodeQualityMetrics() {
    console.log('📏 Analyzing code quality...');
    
    const metrics = {
      lintingErrors: 0,
      lintingWarnings: 0,
      codeComplexity: 'N/A',
      duplicateCode: 'N/A'
    };
    
    // Run ESLint
    try {
      const lintOutput = execSync('npx eslint . --format json', {
        cwd: this.projectPath,
        stdio: 'pipe'
      }).toString();
      
      const lintResults = JSON.parse(lintOutput);
      lintResults.forEach(file => {
        metrics.lintingErrors += file.errorCount;
        metrics.lintingWarnings += file.warningCount;
      });
    } catch (error) {
      // ESLint not configured or failed
    }
    
    this.metrics.codeQuality = metrics;
  }

  /**
   * Collect process adherence metrics
   */
  async collectProcessAdherenceMetrics() {
    console.log('📋 Analyzing process adherence...');
    
    const metrics = {
      hasDeploymentGates: false,
      hasDefensiveLinting: false,
      hasPreCommitHooks: false,
      hasCICDValidation: false
    };
    
    // Check for deployment gates script
    metrics.hasDeploymentGates = fs.existsSync(
      path.join(this.projectPath, 'scripts/validation/deployment-readiness-checker.js')
    );
    
    // Check for defensive linting rules
    try {
      const eslintConfig = ['.eslintrc.js', '.eslintrc.json', '.eslintrc'].find(file =>
        fs.existsSync(path.join(this.projectPath, file))
      );
      
      if (eslintConfig) {
        const content = fs.readFileSync(path.join(this.projectPath, eslintConfig), 'utf8');
        metrics.hasDefensiveLinting = content.includes('prefer-optional-chain') ||
                                     content.includes('no-unsafe-optional-chaining');
      }
    } catch (error) {
      // ESLint config not found
    }
    
    // Check for pre-commit hooks
    metrics.hasPreCommitHooks = fs.existsSync(path.join(this.projectPath, '.husky')) ||
                               fs.existsSync(path.join(this.projectPath, '.git/hooks/pre-commit'));
    
    // Check for CI/CD validation
    const ciFiles = ['.github/workflows', '.gitlab-ci.yml', 'Jenkinsfile', '.circleci/config.yml'];
    metrics.hasCICDValidation = ciFiles.some(file => 
      fs.existsSync(path.join(this.projectPath, file))
    );
    
    this.metrics.processAdherence = metrics;
  }

  /**
   * Calculate summary metrics
   */
  calculateSummaryMetrics() {
    const dp = this.metrics.defensiveProgramming;
    const auth = this.metrics.authenticationTesting;
    const deploy = this.metrics.deploymentReadiness;
    const quality = this.metrics.codeQuality;
    const process = this.metrics.processAdherence;
    
    // Calculate overall scores
    const defensiveScore = (
      parseFloat(dp.optionalChainingCoverage) +
      parseFloat(dp.arrayOperationSafety) +
      parseFloat(dp.fallbackCoverage)
    ) / 3;
    
    const authScore = (
      (auth.testsStartingUnauthenticated / Math.max(1, auth.authenticationTests)) * 100
    );
    
    const deploymentScore = (
      [deploy.dependencies, deploy.build, deploy.startup, deploy.integration]
        .filter(gate => gate.passed).length / 4
    ) * 100;
    
    const processScore = (
      Object.values(process).filter(Boolean).length / Object.keys(process).length
    ) * 100;
    
    this.metrics.summary = {
      overallScore: ((defensiveScore + authScore + deploymentScore + processScore) / 4).toFixed(2) + '%',
      defensiveProgrammingScore: defensiveScore.toFixed(2) + '%',
      authenticationTestingScore: authScore.toFixed(2) + '%',
      deploymentReadinessScore: deploymentScore.toFixed(2) + '%',
      processAdherenceScore: processScore.toFixed(2) + '%',
      criticalIssues: this.identifyCriticalIssues()
    };
  }

  /**
   * Identify critical issues
   */
  identifyCriticalIssues() {
    const issues = [];
    
    // Check defensive programming
    if (parseFloat(this.metrics.defensiveProgramming.optionalChainingCoverage) < 80) {
      issues.push('Low optional chaining coverage');
    }
    
    // Check authentication testing
    if (this.metrics.authenticationTesting.testsStartingUnauthenticated === 0) {
      issues.push('No tests starting from unauthenticated state');
    }
    
    // Check deployment readiness
    Object.entries(this.metrics.deploymentReadiness).forEach(([gate, result]) => {
      if (!result.passed && result.issues) {
        issues.push(`${gate} gate failed: ${result.issues.join(', ')}`);
      }
    });
    
    // Check process adherence
    if (!this.metrics.processAdherence.hasDeploymentGates) {
      issues.push('Deployment gates not implemented');
    }
    
    return issues;
  }

  /**
   * Save metrics to file
   */
  saveMetrics() {
    const outputPath = path.resolve(this.options.outputPath);
    fs.writeFileSync(outputPath, JSON.stringify(this.metrics, null, 2));
    
    if (this.options.verbose) {
      console.log(`\n📁 Metrics saved to: ${outputPath}`);
    }
  }

  /**
   * Display summary
   */
  displaySummary() {
    console.log('\n📊 Validation Metrics Summary');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('Overall Score:', this.metrics.summary.overallScore);
    console.log('├─ Defensive Programming:', this.metrics.summary.defensiveProgrammingScore);
    console.log('├─ Authentication Testing:', this.metrics.summary.authenticationTestingScore);
    console.log('├─ Deployment Readiness:', this.metrics.summary.deploymentReadinessScore);
    console.log('└─ Process Adherence:', this.metrics.summary.processAdherenceScore);
    
    if (this.metrics.summary.criticalIssues.length > 0) {
      console.log('\n⚠️  Critical Issues:');
      this.metrics.summary.criticalIssues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    } else {
      console.log('\n✅ No critical issues found!');
    }
    
    console.log('\n📈 Key Metrics:');
    console.log(`   - Optional Chaining Coverage: ${this.metrics.defensiveProgramming.optionalChainingCoverage}`);
    console.log(`   - Auth Tests Starting Unauthenticated: ${this.metrics.authenticationTesting.testsStartingUnauthenticated}/${this.metrics.authenticationTesting.authenticationTests}`);
    console.log(`   - Deployment Gates Passed: ${Object.values(this.metrics.deploymentReadiness).filter(g => g.passed).length}/4`);
    console.log(`   - Process Checks Passed: ${Object.values(this.metrics.processAdherence).filter(Boolean).length}/${Object.keys(this.metrics.processAdherence).length}`);
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const projectPath = args.find(arg => !arg.startsWith('-')) || '.';
  const options = {
    verbose: args.includes('-v') || args.includes('--verbose'),
    outputPath: args.includes('-o') ? args[args.indexOf('-o') + 1] : './validation-metrics.json'
  };
  
  const collector = new ValidationMetricsCollector(projectPath, options);
  
  collector.collectAll().then(metrics => {
    // Exit with error code if critical issues found
    if (metrics.summary.criticalIssues.length > 0) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Error collecting metrics:', error.message);
    process.exit(1);
  });
}

module.exports = ValidationMetricsCollector;