const BaseAgentHook = require('../../shared/base-agent-hook');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs-extra');
const path = require('path');

/**
 * Coverage Gatekeeper Hook
 * Enforces minimum code coverage requirements before commits/deployments
 * Supports multiple testing frameworks and coverage tools
 */
class CoverageGatekeeper extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'coverage-gatekeeper',
      agent: 'testing_agent',
      category: 'critical',
      impact: 'medium', // Runs tests but can use cached results
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      ...config
    });

    this.thresholds = {
      overall: config.config?.thresholds?.overall ?? 80,
      branches: config.config?.thresholds?.branches ?? 75,
      functions: config.config?.thresholds?.functions ?? 80,
      lines: config.config?.thresholds?.lines ?? 80,
      statements: config.config?.thresholds?.statements ?? 80
    };

    this.criticalPaths = config.config?.criticalPaths || [
      'src/auth/',
      'src/payments/',
      'src/security/',
      'src/api/auth/',
      'src/core/'
    ];

    this.criticalThresholds = {
      overall: config.config?.criticalThresholds?.overall ?? 90,
      branches: config.config?.criticalThresholds?.branches ?? 85,
      functions: config.config?.criticalThresholds?.functions ?? 90,
      lines: config.config?.criticalThresholds?.lines ?? 90,
      statements: config.config?.criticalThresholds?.statements ?? 90
    };

    this.coverageTools = {
      jest: this.getJestCoverage.bind(this),
      nyc: this.getNycCoverage.bind(this),
      istanbul: this.getIstanbulCoverage.bind(this),
      pytest: this.getPytestCoverage.bind(this),
      go: this.getGoCoverage.bind(this)
    };
  }

  async handle(context) {
    const { projectPath, action, trigger } = context;

    // Only check on commits, PRs, or deployments
    if (!['pre-commit', 'pre-push', 'deployment', 'pull-request'].includes(trigger)) {
      return { skipped: true, reason: 'Not a coverage check trigger' };
    }

    // Detect testing framework
    const framework = await this.detectTestingFramework(projectPath);
    if (!framework) {
      return { 
        skipped: true, 
        reason: 'No supported testing framework detected',
        suggestion: 'Install Jest, NYC, or another supported coverage tool'
      };
    }

    try {
      // Check if coverage data exists and is recent
      const coverageData = await this.getCoverageData(projectPath, framework);
      
      if (!coverageData) {
        // Run tests to generate coverage
        const runResult = await this.runCoverageCommand(projectPath, framework);
        if (!runResult.success) {
          return {
            success: false,
            blocked: true,
            error: 'Failed to generate coverage data',
            details: runResult.error,
            message: '❌ Coverage check failed: Unable to run tests'
          };
        }
      }

      // Get coverage metrics
      const coverage = await this.coverageTools[framework](projectPath);
      
      // Check thresholds
      const violations = this.checkThresholds(coverage);
      const criticalViolations = await this.checkCriticalPaths(projectPath, coverage, framework);
      
      // Generate detailed report
      const report = this.generateReport(coverage, violations, criticalViolations);

      return {
        success: violations.length === 0 && criticalViolations.length === 0,
        coverage,
        violations,
        criticalViolations,
        blocked: violations.length > 0 || criticalViolations.length > 0,
        report,
        message: this.generateMessage(coverage, violations, criticalViolations)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blocked: this.config.blockOnError ?? true,
        message: `⚠️ Coverage check error: ${error.message}`
      };
    }
  }

  async detectTestingFramework(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    try {
      // Check JavaScript/TypeScript projects
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJSON(packageJsonPath);
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };

        if (deps.jest || deps['@jest/core']) return 'jest';
        if (deps.nyc) return 'nyc';
        if (deps.istanbul) return 'istanbul';
      }

      // Check Python projects
      if (await fs.pathExists(path.join(projectPath, 'pytest.ini')) ||
          await fs.pathExists(path.join(projectPath, 'setup.cfg'))) {
        return 'pytest';
      }

      // Check Go projects
      if (await fs.pathExists(path.join(projectPath, 'go.mod'))) {
        return 'go';
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async getCoverageData(projectPath, framework) {
    const coveragePaths = {
      jest: 'coverage/coverage-summary.json',
      nyc: '.nyc_output/coverage-summary.json',
      istanbul: 'coverage/coverage-summary.json',
      pytest: 'coverage.json',
      go: 'coverage.out'
    };

    const coveragePath = path.join(projectPath, coveragePaths[framework]);
    
    try {
      if (await fs.pathExists(coveragePath)) {
        const stats = await fs.stat(coveragePath);
        const ageMinutes = (Date.now() - stats.mtime.getTime()) / 60000;
        
        // Use cached coverage if less than 5 minutes old
        if (ageMinutes < 5) {
          return await fs.readJSON(coveragePath);
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async runCoverageCommand(projectPath, framework) {
    const commands = {
      jest: 'npm run test -- --coverage --coverageReporters=json-summary',
      nyc: 'nyc --reporter=json-summary npm test',
      istanbul: 'istanbul cover _mocha -- --reporter json',
      pytest: 'pytest --cov --cov-report=json',
      go: 'go test -cover -coverprofile=coverage.out ./...'
    };

    try {
      const { stdout, stderr } = await execAsync(commands[framework], {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024,
        timeout: 300000 // 5 minutes
      });

      return { success: true, stdout, stderr };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getJestCoverage(projectPath) {
    try {
      const summaryPath = path.join(projectPath, 'coverage/coverage-summary.json');
      const summary = await fs.readJSON(summaryPath);
      
      return {
        overall: summary.total.lines.pct,
        branches: summary.total.branches.pct,
        functions: summary.total.functions.pct,
        lines: summary.total.lines.pct,
        statements: summary.total.statements.pct,
        files: Object.keys(summary).filter(k => k !== 'total').map(file => ({
          path: file,
          lines: summary[file].lines.pct,
          branches: summary[file].branches.pct,
          functions: summary[file].functions.pct,
          statements: summary[file].statements.pct
        }))
      };
    } catch (error) {
      throw new Error(`Failed to read Jest coverage: ${error.message}`);
    }
  }

  async getNycCoverage(projectPath) {
    // Similar structure to Jest
    return this.getJestCoverage(projectPath);
  }

  async getIstanbulCoverage(projectPath) {
    // Similar structure to Jest
    return this.getJestCoverage(projectPath);
  }

  async getPytestCoverage(projectPath) {
    try {
      const coveragePath = path.join(projectPath, 'coverage.json');
      const coverage = await fs.readJSON(coveragePath);
      
      // Convert pytest format to our standard format
      const totals = coverage.totals;
      return {
        overall: totals.percent_covered,
        branches: totals.percent_covered_branches || totals.percent_covered,
        functions: totals.percent_covered, // Pytest doesn't separate functions
        lines: totals.percent_covered_lines || totals.percent_covered,
        statements: totals.percent_covered,
        files: Object.entries(coverage.files).map(([file, data]) => ({
          path: file,
          lines: data.summary.percent_covered,
          branches: data.summary.percent_covered_branches || data.summary.percent_covered,
          functions: data.summary.percent_covered,
          statements: data.summary.percent_covered
        }))
      };
    } catch (error) {
      throw new Error(`Failed to read pytest coverage: ${error.message}`);
    }
  }

  async getGoCoverage(projectPath) {
    try {
      // Parse Go coverage output
      const { stdout } = await execAsync('go tool cover -func=coverage.out', {
        cwd: projectPath
      });

      // Parse the output to get total coverage
      const lines = stdout.trim().split('\n');
      const totalLine = lines[lines.length - 1];
      const match = totalLine.match(/total:\s+\(statements\)\s+(\d+\.\d+)%/);
      
      if (match) {
        const overall = parseFloat(match[1]);
        return {
          overall,
          branches: overall, // Go doesn't separate branch coverage
          functions: overall,
          lines: overall,
          statements: overall,
          files: [] // Would need more parsing for file-level
        };
      }
      
      throw new Error('Could not parse Go coverage output');
    } catch (error) {
      throw new Error(`Failed to read Go coverage: ${error.message}`);
    }
  }

  checkThresholds(coverage) {
    const violations = [];

    Object.entries(this.thresholds).forEach(([metric, threshold]) => {
      if (coverage[metric] < threshold) {
        violations.push({
          metric,
          current: coverage[metric],
          required: threshold,
          gap: threshold - coverage[metric]
        });
      }
    });

    return violations;
  }

  async checkCriticalPaths(projectPath, coverage, framework) {
    const violations = [];

    if (!coverage.files || coverage.files.length === 0) {
      return violations;
    }

    // Check each critical path
    for (const criticalPath of this.criticalPaths) {
      const criticalFiles = coverage.files.filter(file => 
        file.path.includes(criticalPath)
      );

      if (criticalFiles.length === 0) continue;

      // Calculate average coverage for critical path
      const pathCoverage = {
        lines: 0,
        branches: 0,
        functions: 0,
        statements: 0
      };

      criticalFiles.forEach(file => {
        pathCoverage.lines += file.lines || 0;
        pathCoverage.branches += file.branches || 0;
        pathCoverage.functions += file.functions || 0;
        pathCoverage.statements += file.statements || 0;
      });

      // Average the coverage
      const fileCount = criticalFiles.length;
      Object.keys(pathCoverage).forEach(metric => {
        pathCoverage[metric] = pathCoverage[metric] / fileCount;
      });

      // Check against critical thresholds
      Object.entries(this.criticalThresholds).forEach(([metric, threshold]) => {
        if (metric !== 'overall' && pathCoverage[metric] < threshold) {
          violations.push({
            path: criticalPath,
            metric,
            current: pathCoverage[metric],
            required: threshold,
            gap: threshold - pathCoverage[metric],
            files: criticalFiles.filter(f => f[metric] < threshold).map(f => f.path)
          });
        }
      });
    }

    return violations;
  }

  generateReport(coverage, violations, criticalViolations) {
    const report = {
      summary: {
        overall: `${coverage.overall.toFixed(2)}%`,
        branches: `${coverage.branches.toFixed(2)}%`,
        functions: `${coverage.functions.toFixed(2)}%`,
        lines: `${coverage.lines.toFixed(2)}%`,
        statements: `${coverage.statements.toFixed(2)}%`
      },
      status: violations.length === 0 && criticalViolations.length === 0 ? 'PASS' : 'FAIL',
      violations,
      criticalViolations
    };

    // Add worst covered files
    if (coverage.files && coverage.files.length > 0) {
      report.worstFiles = coverage.files
        .sort((a, b) => a.lines - b.lines)
        .slice(0, 5)
        .map(file => ({
          path: file.path,
          coverage: `${file.lines.toFixed(2)}%`
        }));
    }

    return report;
  }

  generateMessage(coverage, violations, criticalViolations) {
    if (violations.length === 0 && criticalViolations.length === 0) {
      return `✅ Coverage check passed: ${coverage.overall.toFixed(2)}% (lines: ${coverage.lines.toFixed(2)}%, branches: ${coverage.branches.toFixed(2)}%)`;
    }

    let message = `❌ Coverage check failed:\n`;
    
    if (violations.length > 0) {
      message += `\nGlobal threshold violations:\n`;
      violations.forEach(v => {
        message += `  - ${v.metric}: ${v.current.toFixed(2)}% < ${v.required}% (gap: ${v.gap.toFixed(2)}%)\n`;
      });
    }

    if (criticalViolations.length > 0) {
      message += `\nCritical path violations:\n`;
      criticalViolations.forEach(v => {
        message += `  - ${v.path} [${v.metric}]: ${v.current.toFixed(2)}% < ${v.required}%\n`;
      });
    }

    return message;
  }

  getDescription() {
    return 'Enforces minimum code coverage requirements before commits and deployments';
  }

  getConfigurableOptions() {
    return {
      thresholds: {
        overall: {
          type: 'number',
          default: 80,
          description: 'Minimum overall coverage percentage'
        },
        branches: {
          type: 'number',
          default: 75,
          description: 'Minimum branch coverage percentage'
        },
        functions: {
          type: 'number',
          default: 80,
          description: 'Minimum function coverage percentage'
        },
        lines: {
          type: 'number',
          default: 80,
          description: 'Minimum line coverage percentage'
        },
        statements: {
          type: 'number',
          default: 80,
          description: 'Minimum statement coverage percentage'
        }
      },
      criticalPaths: {
        type: 'array',
        default: ['src/auth/', 'src/payments/', 'src/security/'],
        description: 'Paths requiring higher coverage'
      },
      criticalThresholds: {
        type: 'object',
        default: { overall: 90, branches: 85, functions: 90, lines: 90, statements: 90 },
        description: 'Higher thresholds for critical paths'
      },
      blockOnError: {
        type: 'boolean',
        default: true,
        description: 'Block operation if coverage check errors'
      },
      allowDecrease: {
        type: 'boolean',
        default: false,
        description: 'Allow coverage to decrease from baseline'
      }
    };
  }
}

module.exports = CoverageGatekeeper;