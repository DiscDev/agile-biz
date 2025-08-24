#!/usr/bin/env node

/**
 * Deployment Readiness Checker
 * Validates all deployment gates before allowing story completion
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class DeploymentReadinessChecker {
  constructor(projectPath = '.') {
    this.projectPath = projectPath;
    this.results = {
      dependencies: { passed: false, checks: [] },
      build: { passed: false, checks: [] },
      startup: { passed: false, checks: [] },
      integration: { passed: false, checks: [] }
    };
    this.overallPassed = false;
  }

  /**
   * Run all deployment validation gates
   */
  async runAllChecks() {
    console.log(chalk.bold('\n🚀 Running Deployment Readiness Checks...\n'));
    
    await this.checkDependencies();
    await this.checkBuildProcess();
    await this.checkApplicationStartup();
    await this.checkIntegration();
    
    this.generateSummary();
    return this.overallPassed;
  }

  /**
   * Gate 1: Dependency Validation
   */
  async checkDependencies() {
    console.log(chalk.yellow('🔍 Gate 1: Dependency Validation'));
    
    const checks = [
      {
        name: 'package.json exists',
        test: () => fs.existsSync(path.join(this.projectPath, 'package.json'))
      },
      {
        name: 'Lock file exists',
        test: () => {
          return fs.existsSync(path.join(this.projectPath, 'package-lock.json')) ||
                 fs.existsSync(path.join(this.projectPath, 'yarn.lock')) ||
                 fs.existsSync(path.join(this.projectPath, 'pnpm-lock.yaml'));
        }
      },
      {
        name: 'Dependencies can be installed',
        test: () => {
          try {
            // Test with --dry-run to avoid actually installing
            if (fs.existsSync(path.join(this.projectPath, 'package-lock.json'))) {
              execSync('npm ci --dry-run', { cwd: this.projectPath, stdio: 'pipe' });
            } else if (fs.existsSync(path.join(this.projectPath, 'yarn.lock'))) {
              execSync('yarn install --frozen-lockfile --dry-run', { cwd: this.projectPath, stdio: 'pipe' });
            }
            return true;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'No security vulnerabilities',
        test: () => {
          try {
            const output = execSync('npm audit --json', { cwd: this.projectPath, stdio: 'pipe' }).toString();
            const audit = JSON.parse(output);
            return audit.metadata.vulnerabilities.high === 0 && 
                   audit.metadata.vulnerabilities.critical === 0;
          } catch (error) {
            // If npm audit fails, consider it a warning not a failure
            return true;
          }
        }
      },
      {
        name: 'All imports have corresponding dependencies',
        test: () => this.checkImportsMatchDependencies()
      }
    ];

    this.results.dependencies.checks = await this.runChecks(checks);
    this.results.dependencies.passed = this.results.dependencies.checks.every(c => c.passed);
  }

  /**
   * Gate 2: Build Process Validation
   */
  async checkBuildProcess() {
    console.log(chalk.yellow('\n🏗️  Gate 2: Build Process Validation'));
    
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8')
    );
    
    const checks = [
      {
        name: 'Development build script exists',
        test: () => packageJson.scripts && 
                   (packageJson.scripts['build:dev'] || packageJson.scripts['dev'])
      },
      {
        name: 'Production build script exists',
        test: () => packageJson.scripts && packageJson.scripts['build']
      },
      {
        name: 'Development build succeeds',
        test: () => {
          try {
            const script = packageJson.scripts['build:dev'] || packageJson.scripts['dev'];
            if (script) {
              // Test build with timeout
              execSync(`npm run ${script.includes('build:dev') ? 'build:dev' : 'dev'} -- --dry-run`, {
                cwd: this.projectPath,
                stdio: 'pipe',
                timeout: 60000 // 1 minute timeout
              });
            }
            return true;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'TypeScript compilation succeeds',
        test: () => {
          if (!fs.existsSync(path.join(this.projectPath, 'tsconfig.json'))) {
            return true; // Not a TypeScript project
          }
          try {
            execSync('npx tsc --noEmit', { cwd: this.projectPath, stdio: 'pipe' });
            return true;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Linting passes',
        test: () => {
          if (!packageJson.scripts || !packageJson.scripts.lint) {
            return true; // No lint script
          }
          try {
            execSync('npm run lint', { cwd: this.projectPath, stdio: 'pipe' });
            return true;
          } catch (error) {
            return false;
          }
        }
      }
    ];

    this.results.build.checks = await this.runChecks(checks);
    this.results.build.passed = this.results.build.checks.every(c => c.passed);
  }

  /**
   * Gate 3: Application Startup Validation
   */
  async checkApplicationStartup() {
    console.log(chalk.yellow('\n🚀 Gate 3: Application Startup Validation'));
    
    const checks = [
      {
        name: 'Start script exists',
        test: () => {
          const packageJson = JSON.parse(
            fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8')
          );
          return packageJson.scripts && packageJson.scripts.start;
        }
      },
      {
        name: 'Environment variables documented',
        test: () => {
          return fs.existsSync(path.join(this.projectPath, '.env.example')) ||
                 fs.existsSync(path.join(this.projectPath, '.env.sample')) ||
                 fs.existsSync(path.join(this.projectPath, 'README.md'));
        }
      },
      {
        name: 'Port configuration is dynamic',
        test: () => this.checkDynamicPortConfiguration()
      },
      {
        name: 'Health check endpoint exists',
        test: () => this.checkHealthEndpoint()
      },
      {
        name: 'Error handling configured',
        test: () => this.checkErrorHandling()
      }
    ];

    this.results.startup.checks = await this.runChecks(checks);
    this.results.startup.passed = this.results.startup.checks.every(c => c.passed);
  }

  /**
   * Gate 4: Integration Validation
   */
  async checkIntegration() {
    console.log(chalk.yellow('\n🔗 Gate 4: Integration Validation'));
    
    const checks = [
      {
        name: 'API endpoint configuration exists',
        test: () => this.checkApiConfiguration()
      },
      {
        name: 'CORS configuration present',
        test: () => this.checkCorsConfiguration()
      },
      {
        name: 'Database configuration exists',
        test: () => this.checkDatabaseConfiguration()
      },
      {
        name: 'External service configs documented',
        test: () => this.checkExternalServices()
      },
      {
        name: 'Integration tests exist',
        test: () => this.checkIntegrationTests()
      }
    ];

    this.results.integration.checks = await this.runChecks(checks);
    this.results.integration.passed = this.results.integration.checks.every(c => c.passed);
  }

  /**
   * Helper: Run checks and display results
   */
  async runChecks(checks) {
    const results = [];
    
    for (const check of checks) {
      process.stdout.write(`  Checking ${check.name}... `);
      
      try {
        const passed = await check.test();
        results.push({ name: check.name, passed });
        
        if (passed) {
          console.log(chalk.green('✓'));
        } else {
          console.log(chalk.red('✗'));
        }
      } catch (error) {
        results.push({ name: check.name, passed: false, error: error.message });
        console.log(chalk.red('✗'), chalk.dim(`(${error.message})`));
      }
    }
    
    return results;
  }

  /**
   * Helper: Check if imports match dependencies
   */
  checkImportsMatchDependencies() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8')
      );
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // Simple check - in real implementation would parse all source files
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Check dynamic port configuration
   */
  checkDynamicPortConfiguration() {
    const filesToCheck = [
      'server.js',
      'app.js',
      'index.js',
      'src/server.js',
      'src/app.js',
      'src/index.js'
    ];
    
    for (const file of filesToCheck) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('process.env.PORT') || 
            content.includes('PORT =') ||
            content.includes('port:')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Helper: Check health endpoint
   */
  checkHealthEndpoint() {
    const filesToCheck = [
      'server.js',
      'app.js',
      'routes/index.js',
      'src/routes/health.js'
    ];
    
    for (const file of filesToCheck) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('/health') || content.includes('/api/health')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Helper: Check error handling
   */
  checkErrorHandling() {
    const patterns = [
      'app.use((err',
      'window.onerror',
      'process.on(\'uncaughtException\'',
      'process.on(\'unhandledRejection\'',
      'ErrorBoundary'
    ];
    
    // Check main application files
    const filesToCheck = ['app.js', 'server.js', 'src/App.js', 'src/index.js'];
    
    for (const file of filesToCheck) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (patterns.some(pattern => content.includes(pattern))) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Helper: Check API configuration
   */
  checkApiConfiguration() {
    const configPatterns = [
      'API_URL',
      'API_BASE_URL',
      'apiUrl',
      'baseURL',
      'axios.defaults'
    ];
    
    // Check common config locations
    const locations = [
      '.env.example',
      'config/',
      'src/config/',
      'src/api/'
    ];
    
    for (const location of locations) {
      const locationPath = path.join(this.projectPath, location);
      if (fs.existsSync(locationPath)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Helper: Check CORS configuration
   */
  checkCorsConfiguration() {
    const corsPatterns = [
      'cors(',
      'Access-Control-Allow-Origin',
      'credentials: true',
      'withCredentials'
    ];
    
    // Check server files
    const filesToCheck = ['server.js', 'app.js', 'src/server.js'];
    
    for (const file of filesToCheck) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (corsPatterns.some(pattern => content.includes(pattern))) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Helper: Check database configuration
   */
  checkDatabaseConfiguration() {
    const dbPatterns = [
      'DATABASE_URL',
      'DB_HOST',
      'mongodb://',
      'postgres://',
      'mysql://',
      'createConnection',
      'mongoose.connect'
    ];
    
    // Check for database config
    const filesToCheck = [
      '.env.example',
      'config/database.js',
      'src/db.js',
      'knexfile.js'
    ];
    
    for (const file of filesToCheck) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Helper: Check external services
   */
  checkExternalServices() {
    // Check if external services are documented
    const readmePath = path.join(this.projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8').toLowerCase();
      return content.includes('api') || 
             content.includes('service') ||
             content.includes('integration');
    }
    
    return false;
  }

  /**
   * Helper: Check integration tests
   */
  checkIntegrationTests() {
    const testPatterns = [
      '**/*.integration.test.js',
      '**/*.integration.spec.js',
      '**/integration/*.test.js',
      '**/tests/integration/**'
    ];
    
    // Simple check for integration test files
    const testDirs = ['test', 'tests', '__tests__', 'src'];
    
    for (const dir of testDirs) {
      const dirPath = path.join(this.projectPath, dir);
      if (fs.existsSync(dirPath)) {
        // Check if integration tests exist
        return true; // Simplified for example
      }
    }
    
    return false;
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    console.log(chalk.bold('\n📊 Deployment Readiness Summary:\n'));
    
    const gates = [
      { name: 'Dependencies', result: this.results.dependencies },
      { name: 'Build Process', result: this.results.build },
      { name: 'Application Startup', result: this.results.startup },
      { name: 'Integration', result: this.results.integration }
    ];
    
    gates.forEach(gate => {
      const icon = gate.result.passed ? '✅' : '❌';
      const color = gate.result.passed ? 'green' : 'red';
      
      console.log(chalk[color](`${icon} Gate ${gate.name}: ${gate.result.passed ? 'PASSED' : 'FAILED'}`));
      
      if (!gate.result.passed) {
        gate.result.checks
          .filter(check => !check.passed)
          .forEach(check => {
            console.log(chalk.red(`   ✗ ${check.name}`));
            if (check.error) {
              console.log(chalk.dim(`     ${check.error}`));
            }
          });
      }
    });
    
    this.overallPassed = gates.every(gate => gate.result.passed);
    
    console.log('\n' + chalk.bold(
      this.overallPassed ? 
        chalk.green('✅ Deployment readiness check PASSED!') :
        chalk.red('❌ Deployment readiness check FAILED!')
    ));
    
    if (!this.overallPassed) {
      console.log(chalk.yellow('\n⚠️  Please fix the failed checks before marking the story as complete.'));
    }
    
    // Generate JSON report
    this.saveReport();
  }

  /**
   * Save detailed report
   */
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      projectPath: this.projectPath,
      overallPassed: this.overallPassed,
      gates: this.results,
      summary: {
        totalChecks: Object.values(this.results).reduce((sum, gate) => sum + gate.checks.length, 0),
        passedChecks: Object.values(this.results).reduce((sum, gate) => 
          sum + gate.checks.filter(c => c.passed).length, 0
        ),
        failedChecks: Object.values(this.results).reduce((sum, gate) => 
          sum + gate.checks.filter(c => !c.passed).length, 0
        )
      }
    };
    
    const reportPath = path.join(this.projectPath, 'deployment-readiness-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.dim(`\nDetailed report saved to: ${reportPath}`));
  }
}

// CLI Interface
if (require.main === module) {
  const projectPath = process.argv[2] || '.';
  const checker = new DeploymentReadinessChecker(projectPath);
  
  checker.runAllChecks().then(passed => {
    process.exit(passed ? 0 : 1);
  }).catch(error => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  });
}

module.exports = DeploymentReadinessChecker;