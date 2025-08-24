const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs-extra');
const path = require('path');

/**
 * Test Categorizer Hook
 * Categorizes tests and ensures proper test organization
 * Validates test structure, naming conventions, and coverage balance
 */
class TestCategorizer extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'test-categorizer',
      agent: 'testing_agent',
      category: 'valuable',
      impact: 'low', // Fast file analysis
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      ...config
    });

    this.categories = {
      unit: {
        patterns: ['*.unit.test.*', '*.unit.spec.*', '**/unit/**'],
        characteristics: ['isolated', 'mocked dependencies', 'fast', 'deterministic'],
        maxDuration: 100 // ms
      },
      integration: {
        patterns: ['*.integration.test.*', '*.int.test.*', '**/integration/**'],
        characteristics: ['multiple components', 'real dependencies', 'database/API calls'],
        maxDuration: 5000 // ms
      },
      e2e: {
        patterns: ['*.e2e.test.*', '*.e2e.spec.*', '**/e2e/**', '**/cypress/**'],
        characteristics: ['full stack', 'browser automation', 'user flows'],
        maxDuration: 30000 // ms
      },
      performance: {
        patterns: ['*.perf.test.*', '*.performance.test.*', '**/performance/**'],
        characteristics: ['load testing', 'benchmarks', 'profiling'],
        maxDuration: 60000 // ms
      },
      smoke: {
        patterns: ['*.smoke.test.*', '**/smoke/**'],
        characteristics: ['critical paths', 'quick validation', 'deployment check'],
        maxDuration: 10000 // ms
      },
      regression: {
        patterns: ['*.regression.test.*', '**/regression/**'],
        characteristics: ['bug prevention', 'previously fixed issues'],
        maxDuration: 5000 // ms
      }
    };

    this.namingConventions = {
      unit: /^(.*\.)?unit\.(test|spec)\.[jt]sx?$/,
      integration: /^(.*\.)?(integration|int)\.(test|spec)\.[jt]sx?$/,
      e2e: /^(.*\.)?e2e\.(test|spec)\.[jt]sx?$/,
      feature: /^[a-z-]+\.(test|spec)\.[jt]sx?$/
    };

    this.balanceTargets = {
      unit: { min: 60, max: 80, ideal: 70 },
      integration: { min: 15, max: 30, ideal: 20 },
      e2e: { min: 5, max: 15, ideal: 10 }
    };
  }

  async handle(context) {
    const { projectPath, action, filePath } = context;

    // Check on test-related actions
    if (!['test-created', 'test-modified', 'test-audit'].includes(action)) {
      return { skipped: true, reason: 'Not a test categorization trigger' };
    }

    try {
      // Find all test files
      const testFiles = await this.findTestFiles(projectPath);
      
      // Categorize tests
      const categorization = await this.categorizeTests(testFiles, projectPath);
      
      // Check naming conventions
      const namingIssues = this.checkNamingConventions(testFiles);
      
      // Analyze test balance
      const balance = this.analyzeTestBalance(categorization);
      
      // Check for missing test categories
      const missingCategories = this.checkMissingCategories(categorization);
      
      // Validate test structure
      const structureIssues = await this.validateTestStructure(testFiles, projectPath);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        categorization,
        balance,
        namingIssues,
        missingCategories,
        structureIssues
      );

      return {
        success: namingIssues.length === 0 && structureIssues.length === 0,
        totalTests: testFiles.length,
        categorization,
        balance,
        namingIssues,
        missingCategories,
        structureIssues,
        recommendations,
        blocked: false,
        message: this.generateMessage(categorization, balance, namingIssues)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blocked: false,
        message: `⚠️ Test categorization error: ${error.message}`
      };
    }
  }

  async findTestFiles(projectPath) {
    const testFiles = [];
    const testPatterns = [
      '**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx',
      '**/*.spec.js', '**/*.spec.jsx', '**/*.spec.ts', '**/*.spec.tsx'
    ];

    // Common test directories
    const testDirs = [
      'src',
      'test',
      'tests',
      '__tests__',
      'spec',
      'cypress',
      'e2e'
    ];

    for (const dir of testDirs) {
      const dirPath = path.join(projectPath, dir);
      if (await fs.pathExists(dirPath)) {
        await this.scanDirectory(dirPath, testFiles);
      }
    }

    return testFiles;
  }

  async scanDirectory(dir, testFiles) {
    const entries = await fs.readdir(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        await this.scanDirectory(fullPath, testFiles);
      } else if (this.isTestFile(entry)) {
        testFiles.push({
          path: fullPath,
          name: entry,
          dir: path.dirname(fullPath)
        });
      }
    }
  }

  isTestFile(filename) {
    return /\.(test|spec)\.[jt]sx?$/.test(filename);
  }

  async categorizeTests(testFiles, projectPath) {
    const categorized = {
      unit: [],
      integration: [],
      e2e: [],
      performance: [],
      smoke: [],
      regression: [],
      uncategorized: []
    };

    for (const file of testFiles) {
      const category = await this.determineCategory(file, projectPath);
      
      if (categorized[category]) {
        categorized[category].push(file);
      } else {
        categorized.uncategorized.push(file);
      }
    }

    // Calculate percentages
    const total = testFiles.length || 1;
    const stats = {};
    
    for (const [category, files] of Object.entries(categorized)) {
      stats[category] = {
        count: files.length,
        percentage: Math.round((files.length / total) * 100)
      };
    }

    return { categorized, stats, total };
  }

  async determineCategory(file, projectPath) {
    // Check filename patterns
    for (const [category, config] of Object.entries(this.categories)) {
      for (const pattern of config.patterns) {
        if (this.matchesPattern(file.name, pattern) || 
            this.matchesPattern(file.path, pattern)) {
          return category;
        }
      }
    }

    // Check file content for hints
    try {
      const content = await fs.readFile(file.path, 'utf8');
      return this.detectCategoryFromContent(content);
    } catch (error) {
      return 'uncategorized';
    }
  }

  matchesPattern(filePath, pattern) {
    // Simple pattern matching (in production would use minimatch)
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\//g, '\\/');
    
    return new RegExp(regex).test(filePath);
  }

  detectCategoryFromContent(content) {
    // Unit test indicators
    if (content.includes('jest.mock(') || 
        content.includes('sinon.stub(') ||
        content.includes('shallow(') ||
        !content.includes('await') && content.includes('expect(')) {
      return 'unit';
    }

    // E2E test indicators
    if (content.includes('cy.visit(') || 
        content.includes('browser.url(') ||
        content.includes('page.goto(') ||
        content.includes('selenium')) {
      return 'e2e';
    }

    // Integration test indicators
    if (content.includes('supertest') ||
        content.includes('request(app)') ||
        content.includes('TestBed.configureTestingModule') ||
        content.includes('render(') && content.includes('waitFor(')) {
      return 'integration';
    }

    // Performance test indicators
    if (content.includes('benchmark') ||
        content.includes('performance.measure') ||
        content.includes('loadtest')) {
      return 'performance';
    }

    return 'unit'; // Default to unit if unclear
  }

  checkNamingConventions(testFiles) {
    const issues = [];

    for (const file of testFiles) {
      let followsConvention = false;
      
      for (const [type, pattern] of Object.entries(this.namingConventions)) {
        if (pattern.test(file.name)) {
          followsConvention = true;
          break;
        }
      }

      if (!followsConvention) {
        issues.push({
          file: file.name,
          path: file.path,
          issue: 'Does not follow naming convention',
          suggestion: this.suggestFileName(file.name)
        });
      }
    }

    return issues;
  }

  suggestFileName(currentName) {
    // Extract base name
    const base = currentName.replace(/\.(test|spec)\.[jt]sx?$/, '');
    
    // Suggest based on common patterns
    if (currentName.includes('component')) {
      return `${base}.unit.test.js`;
    } else if (currentName.includes('api') || currentName.includes('service')) {
      return `${base}.integration.test.js`;
    } else if (currentName.includes('flow') || currentName.includes('scenario')) {
      return `${base}.e2e.test.js`;
    }
    
    return `${base}.unit.test.js`;
  }

  analyzeTestBalance(categorization) {
    const { stats, total } = categorization;
    const analysis = {
      balanced: true,
      issues: [],
      score: 100
    };

    // Check each category against targets
    for (const [category, target] of Object.entries(this.balanceTargets)) {
      const actual = stats[category]?.percentage || 0;
      
      if (actual < target.min) {
        analysis.balanced = false;
        analysis.issues.push({
          category,
          type: 'insufficient',
          actual,
          target: target.min,
          gap: target.min - actual
        });
        analysis.score -= (target.min - actual) * 2;
      } else if (actual > target.max) {
        analysis.balanced = false;
        analysis.issues.push({
          category,
          type: 'excessive',
          actual,
          target: target.max,
          excess: actual - target.max
        });
        analysis.score -= (actual - target.max);
      }
    }

    analysis.score = Math.max(0, analysis.score);
    return analysis;
  }

  checkMissingCategories(categorization) {
    const missing = [];
    const requiredCategories = ['unit', 'integration'];
    const recommendedCategories = ['e2e', 'smoke'];

    for (const category of requiredCategories) {
      if (categorization.stats[category]?.count === 0) {
        missing.push({
          category,
          severity: 'critical',
          message: `No ${category} tests found`
        });
      }
    }

    for (const category of recommendedCategories) {
      if (categorization.stats[category]?.count === 0) {
        missing.push({
          category,
          severity: 'warning',
          message: `Consider adding ${category} tests`
        });
      }
    }

    return missing;
  }

  async validateTestStructure(testFiles, projectPath) {
    const issues = [];

    // Check for test organization
    const testDirs = new Set(testFiles.map(f => f.dir));
    
    // Check if tests are organized by type
    const hasUnitDir = Array.from(testDirs).some(dir => dir.includes('unit'));
    const hasIntegrationDir = Array.from(testDirs).some(dir => dir.includes('integration'));
    const hasE2EDir = Array.from(testDirs).some(dir => dir.includes('e2e'));

    if (testFiles.length > 20 && !hasUnitDir && !hasIntegrationDir) {
      issues.push({
        type: 'organization',
        severity: 'warning',
        message: 'Consider organizing tests into unit/ and integration/ directories'
      });
    }

    // Check for test utilities
    const hasTestUtils = await fs.pathExists(path.join(projectPath, 'test-utils')) ||
                       await fs.pathExists(path.join(projectPath, 'src/test-utils'));

    if (testFiles.length > 10 && !hasTestUtils) {
      issues.push({
        type: 'utilities',
        severity: 'info',
        message: 'Consider creating shared test utilities'
      });
    }

    // Check for fixture organization
    const hasFixtures = await fs.pathExists(path.join(projectPath, 'fixtures')) ||
                       await fs.pathExists(path.join(projectPath, 'test/fixtures'));

    if (testFiles.length > 15 && !hasFixtures) {
      issues.push({
        type: 'fixtures',
        severity: 'info',
        message: 'Consider organizing test data in fixtures directory'
      });
    }

    return issues;
  }

  generateRecommendations(categorization, balance, namingIssues, missingCategories, structureIssues) {
    const recommendations = [];

    // Balance recommendations
    if (!balance.balanced) {
      balance.issues.forEach(issue => {
        if (issue.type === 'insufficient') {
          recommendations.push({
            type: 'coverage',
            priority: 'high',
            message: `Increase ${issue.category} test coverage from ${issue.actual}% to at least ${issue.target}%`,
            action: `Write more ${issue.category} tests for critical components`
          });
        } else {
          recommendations.push({
            type: 'balance',
            priority: 'medium',
            message: `Consider reducing ${issue.category} tests from ${issue.actual}% to ${issue.target}%`,
            action: 'Some unit tests might be better as integration tests'
          });
        }
      });
    }

    // Naming convention recommendations
    if (namingIssues.length > 0) {
      recommendations.push({
        type: 'naming',
        priority: 'low',
        message: `${namingIssues.length} test files don't follow naming conventions`,
        action: 'Rename test files to include .unit, .integration, or .e2e in filename'
      });
    }

    // Missing category recommendations
    missingCategories.forEach(missing => {
      recommendations.push({
        type: 'missing',
        priority: missing.severity === 'critical' ? 'high' : 'medium',
        message: missing.message,
        action: `Create ${missing.category} tests for core functionality`
      });
    });

    // Structure recommendations
    structureIssues.forEach(issue => {
      recommendations.push({
        type: 'structure',
        priority: 'low',
        message: issue.message,
        action: 'Improve test organization for better maintainability'
      });
    });

    return recommendations;
  }

  generateMessage(categorization, balance, namingIssues) {
    const { stats, total } = categorization;
    
    if (total === 0) {
      return '⚠️ No tests found in project';
    }

    const balanceText = balance.balanced ? 'well-balanced' : 'imbalanced';
    const namingText = namingIssues.length === 0 ? 'proper naming' : `${namingIssues.length} naming issues`;
    
    return `📊 Found ${total} tests (${balanceText}): ` +
           `Unit ${stats.unit?.percentage || 0}%, ` +
           `Integration ${stats.integration?.percentage || 0}%, ` +
           `E2E ${stats.e2e?.percentage || 0}% - ${namingText}`;
  }

  getDescription() {
    return 'Categorizes tests and ensures proper test organization and balance';
  }

  getConfigurableOptions() {
    return {
      balanceTargets: {
        unit: {
          min: { type: 'number', default: 60 },
          max: { type: 'number', default: 80 },
          ideal: { type: 'number', default: 70 }
        },
        integration: {
          min: { type: 'number', default: 15 },
          max: { type: 'number', default: 30 },
          ideal: { type: 'number', default: 20 }
        },
        e2e: {
          min: { type: 'number', default: 5 },
          max: { type: 'number', default: 15 },
          ideal: { type: 'number', default: 10 }
        }
      },
      enforceNaming: {
        type: 'boolean',
        default: true,
        description: 'Enforce test naming conventions'
      },
      requireCategories: {
        type: 'array',
        default: ['unit', 'integration'],
        description: 'Required test categories'
      }
    };
  }
}

module.exports = TestCategorizer;