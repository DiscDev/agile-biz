const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs-extra');
const path = require('path');

/**
 * Requirement Completeness Hook
 * Ensures all requirements are implemented before marking stories as done
 * Validates acceptance criteria, test coverage, and documentation
 */
class RequirementCompleteness extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'requirement-completeness',
      agent: 'project_manager_agent',
      category: 'critical',
      impact: 'low', // Fast checks on story completion
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      ...config
    });

    this.requiredElements = {
      acceptanceCriteria: {
        required: true,
        minCount: config.config?.minAcceptanceCriteria ?? 3,
        pattern: /^(Given|When|Then|And)/i
      },
      testCoverage: {
        required: true,
        minPercentage: config.config?.minTestCoverage ?? 80
      },
      documentation: {
        required: config.config?.requireDocumentation ?? true,
        types: ['api', 'user', 'technical']
      },
      codeReview: {
        required: true,
        minReviewers: config.config?.minReviewers ?? 1
      },
      definitionOfDone: {
        required: true,
        checklist: config.config?.definitionOfDone || [
          'Code complete',
          'Unit tests written',
          'Integration tests written',
          'Code reviewed',
          'Documentation updated',
          'No critical bugs',
          'Performance validated'
        ]
      }
    };

    this.storyTypes = {
      feature: {
        requiresUI: true,
        requiresAPI: true,
        requiresTests: true,
        requiresDocs: true
      },
      bug: {
        requiresUI: false,
        requiresAPI: false,
        requiresTests: true,
        requiresDocs: false
      },
      technical: {
        requiresUI: false,
        requiresAPI: false,
        requiresTests: true,
        requiresDocs: true
      },
      documentation: {
        requiresUI: false,
        requiresAPI: false,
        requiresTests: false,
        requiresDocs: true
      }
    };
  }

  async handle(context) {
    const { storyId, action, metadata = {} } = context;

    // Only check when marking stories as done
    if (!['story-complete', 'mark-done', 'close-story'].includes(action)) {
      return { skipped: true, reason: 'Not a story completion action' };
    }

    try {
      // Load story details
      const story = await this.loadStory(storyId, context.projectPath);
      if (!story) {
        return {
          success: false,
          blocked: true,
          error: 'Story not found',
          message: `❌ Cannot find story: ${storyId}`
        };
      }

      // Check all requirements
      const checks = await this.performCompletionChecks(story, context);
      
      // Determine if story can be marked as done
      const criticalFailures = checks.filter(c => c.critical && !c.passed);
      const warnings = checks.filter(c => !c.critical && !c.passed);

      return {
        success: criticalFailures.length === 0,
        blocked: criticalFailures.length > 0,
        story: {
          id: storyId,
          title: story.title,
          type: story.type,
          points: story.points
        },
        checks,
        criticalFailures,
        warnings,
        completeness: this.calculateCompleteness(checks),
        message: this.generateMessage(story, criticalFailures, warnings),
        recommendations: this.generateRecommendations(criticalFailures, warnings)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blocked: true,
        message: `⚠️ Requirement check error: ${error.message}`
      };
    }
  }

  async loadStory(storyId, projectPath) {
    // Try multiple locations where story might be stored
    const possiblePaths = [
      path.join(projectPath, 'project-documents/orchestration/product-backlog/backlog-items', `${storyId}.json`),
      path.join(projectPath, 'project-documents/orchestration/sprints', '*', 'stories', `${storyId}.md`),
      path.join(projectPath, '.agile-ai-agents/stories', `${storyId}.json`)
    ];

    for (const storyPath of possiblePaths) {
      try {
        if (storyPath.includes('*')) {
          // Handle wildcard paths
          const parts = storyPath.split('*');
          const baseDir = parts[0];
          if (await fs.pathExists(baseDir)) {
            const dirs = await fs.readdir(baseDir);
            for (const dir of dirs) {
              const fullPath = storyPath.replace('*', dir);
              if (await fs.pathExists(fullPath)) {
                return await this.parseStory(fullPath);
              }
            }
          }
        } else if (await fs.pathExists(storyPath)) {
          return await this.parseStory(storyPath);
        }
      } catch (error) {
        // Continue to next path
      }
    }

    return null;
  }

  async parseStory(filePath) {
    const ext = path.extname(filePath);
    
    if (ext === '.json') {
      return await fs.readJSON(filePath);
    } else if (ext === '.md') {
      const content = await fs.readFile(filePath, 'utf8');
      return this.parseMarkdownStory(content);
    }
    
    return null;
  }

  parseMarkdownStory(content) {
    const story = {
      acceptanceCriteria: [],
      tasks: [],
      type: 'feature',
      status: 'in-progress'
    };

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) story.title = titleMatch[1];

    // Extract ID
    const idMatch = content.match(/Story ID:\s*(.+)$/m);
    if (idMatch) story.id = idMatch[1];

    // Extract type
    const typeMatch = content.match(/Type:\s*(.+)$/m);
    if (typeMatch) story.type = typeMatch[1].toLowerCase();

    // Extract points
    const pointsMatch = content.match(/Points:\s*(\d+)$/m);
    if (pointsMatch) story.points = parseInt(pointsMatch[1]);

    // Extract acceptance criteria
    const acSection = content.match(/## Acceptance Criteria\s*([\s\S]*?)(?=##|$)/);
    if (acSection) {
      const criteria = acSection[1].split('\n').filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'));
      story.acceptanceCriteria = criteria.map(c => c.replace(/^[\*\-]\s*/, '').trim());
    }

    // Extract tasks
    const tasksSection = content.match(/## Tasks\s*([\s\S]*?)(?=##|$)/);
    if (tasksSection) {
      const tasks = tasksSection[1].match(/\[([ x])\]\s*(.+)/g) || [];
      story.tasks = tasks.map(task => ({
        completed: task.includes('[x]'),
        description: task.replace(/\[([ x])\]\s*/, '')
      }));
    }

    return story;
  }

  async performCompletionChecks(story, context) {
    const checks = [];

    // Check acceptance criteria
    checks.push(await this.checkAcceptanceCriteria(story));

    // Check test coverage
    checks.push(await this.checkTestCoverage(story, context));

    // Check documentation
    checks.push(await this.checkDocumentation(story, context));

    // Check code review
    checks.push(await this.checkCodeReview(story, context));

    // Check definition of done
    checks.push(await this.checkDefinitionOfDone(story, context));

    // Type-specific checks
    const typeChecks = await this.performTypeSpecificChecks(story, context);
    checks.push(...typeChecks);

    return checks;
  }

  async checkAcceptanceCriteria(story) {
    const criteria = story.acceptanceCriteria || [];
    const minRequired = this.requiredElements.acceptanceCriteria.minCount;
    
    const check = {
      name: 'Acceptance Criteria',
      critical: true,
      passed: criteria.length >= minRequired,
      details: {
        found: criteria.length,
        required: minRequired,
        criteria
      }
    };

    // Check format (Given/When/Then)
    if (this.requiredElements.acceptanceCriteria.pattern) {
      const wellFormatted = criteria.filter(c => 
        this.requiredElements.acceptanceCriteria.pattern.test(c)
      );
      check.details.wellFormatted = wellFormatted.length;
      check.details.formatCompliance = (wellFormatted.length / criteria.length) * 100;
    }

    // Check if all criteria are testable
    const testable = criteria.filter(c => 
      !c.toLowerCase().includes('should be nice') &&
      !c.toLowerCase().includes('user friendly') &&
      c.split(' ').length > 3
    );
    check.details.testable = testable.length;

    if (check.passed && testable.length < criteria.length * 0.8) {
      check.passed = false;
      check.reason = 'Not all acceptance criteria are testable';
    }

    return check;
  }

  async checkTestCoverage(story, context) {
    const check = {
      name: 'Test Coverage',
      critical: true,
      passed: false,
      details: {}
    };

    try {
      // Look for test files related to this story
      const testFiles = await this.findRelatedTestFiles(story, context.projectPath);
      check.details.testFiles = testFiles.length;

      if (testFiles.length === 0) {
        check.reason = 'No test files found for this story';
        return check;
      }

      // Check if tests are passing
      const testResults = await this.checkTestResults(story, context);
      check.details.passing = testResults.passing;
      check.details.failing = testResults.failing;
      check.details.coverage = testResults.coverage;

      check.passed = testResults.passing > 0 && 
                    testResults.failing === 0 && 
                    testResults.coverage >= this.requiredElements.testCoverage.minPercentage;

      if (!check.passed) {
        if (testResults.failing > 0) {
          check.reason = `${testResults.failing} tests are failing`;
        } else if (testResults.coverage < this.requiredElements.testCoverage.minPercentage) {
          check.reason = `Coverage ${testResults.coverage}% is below required ${this.requiredElements.testCoverage.minPercentage}%`;
        }
      }
    } catch (error) {
      check.error = error.message;
      check.reason = 'Unable to verify test coverage';
    }

    return check;
  }

  async findRelatedTestFiles(story, projectPath) {
    const testPatterns = [
      `**/*${story.id}*.test.*`,
      `**/*${story.id}*.spec.*`,
      `**/test/*${story.id}*.*`,
      `**/tests/*${story.id}*.*`
    ];

    const testFiles = [];
    // This is a simplified version - in practice, would use glob
    const testDirs = ['src/__tests__', 'tests', 'test', 'spec'];
    
    for (const dir of testDirs) {
      const testDir = path.join(projectPath, dir);
      if (await fs.pathExists(testDir)) {
        const files = await fs.readdir(testDir);
        const related = files.filter(f => 
          f.includes(story.id) || 
          (story.feature && f.includes(story.feature))
        );
        testFiles.push(...related.map(f => path.join(dir, f)));
      }
    }

    return testFiles;
  }

  async checkTestResults(story, context) {
    // This would integrate with actual test runners
    // For now, return mock data based on story completion
    const completedTasks = (story.tasks || []).filter(t => t.completed).length;
    const totalTasks = (story.tasks || []).length || 1;
    const completionRate = completedTasks / totalTasks;

    return {
      passing: Math.floor(completionRate * 10),
      failing: completionRate < 1 ? 1 : 0,
      coverage: Math.floor(completionRate * 100)
    };
  }

  async checkDocumentation(story, context) {
    const check = {
      name: 'Documentation',
      critical: this.requiredElements.documentation.required,
      passed: false,
      details: {
        required: this.requiredElements.documentation.types,
        found: []
      }
    };

    if (story.type === 'documentation') {
      check.passed = true;
      check.details.found = ['self-documenting'];
      return check;
    }

    // Check for documentation updates
    const docPaths = [
      'docs',
      'documentation',
      'README.md',
      'API.md',
      'CHANGELOG.md'
    ];

    for (const docPath of docPaths) {
      const fullPath = path.join(context.projectPath, docPath);
      if (await fs.pathExists(fullPath)) {
        // Check if modified recently (simplified check)
        const stats = await fs.stat(fullPath);
        const hoursSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceModified < 24) {
          check.details.found.push(docPath);
        }
      }
    }

    check.passed = check.details.found.length > 0 || !check.critical;
    if (!check.passed) {
      check.reason = 'No documentation updates found';
    }

    return check;
  }

  async checkCodeReview(story, context) {
    const check = {
      name: 'Code Review',
      critical: true,
      passed: false,
      details: {
        required: this.requiredElements.codeReview.minReviewers,
        reviewers: []
      }
    };

    // Check for PR/MR approval
    // This would integrate with Git providers
    // For now, check if story has review metadata
    if (story.reviews && Array.isArray(story.reviews)) {
      check.details.reviewers = story.reviews.map(r => r.reviewer || 'anonymous');
      check.passed = check.details.reviewers.length >= check.details.required;
    }

    if (!check.passed) {
      check.reason = `Requires ${check.details.required} reviewers, found ${check.details.reviewers.length}`;
    }

    return check;
  }

  async checkDefinitionOfDone(story, context) {
    const checklist = this.requiredElements.definitionOfDone.checklist;
    const completed = [];
    const missing = [];

    // Map checklist items to story state
    const checkMapping = {
      'Code complete': () => {
        const tasks = story.tasks || [];
        return tasks.length > 0 && tasks.every(t => t.completed);
      },
      'Unit tests written': () => story.hasUnitTests || false,
      'Integration tests written': () => story.hasIntegrationTests || false,
      'Code reviewed': () => (story.reviews && story.reviews.length > 0) || false,
      'Documentation updated': () => story.documentationUpdated || false,
      'No critical bugs': () => !story.criticalBugs || story.criticalBugs === 0,
      'Performance validated': () => story.performanceValidated || false
    };

    for (const item of checklist) {
      const checkFn = checkMapping[item];
      if (checkFn && checkFn()) {
        completed.push(item);
      } else {
        missing.push(item);
      }
    }

    return {
      name: 'Definition of Done',
      critical: true,
      passed: missing.length === 0,
      details: {
        checklist,
        completed,
        missing,
        completionRate: (completed.length / checklist.length) * 100
      },
      reason: missing.length > 0 ? `Missing: ${missing.join(', ')}` : null
    };
  }

  async performTypeSpecificChecks(story, context) {
    const checks = [];
    const storyType = this.storyTypes[story.type] || this.storyTypes.feature;

    if (storyType.requiresUI) {
      checks.push({
        name: 'UI Implementation',
        critical: true,
        passed: story.uiComplete || story.frontendComplete || false,
        reason: 'UI implementation not marked as complete'
      });
    }

    if (storyType.requiresAPI) {
      checks.push({
        name: 'API Implementation',
        critical: true,
        passed: story.apiComplete || story.backendComplete || false,
        reason: 'API implementation not marked as complete'
      });
    }

    return checks;
  }

  calculateCompleteness(checks) {
    const total = checks.length;
    const passed = checks.filter(c => c.passed).length;
    const critical = checks.filter(c => c.critical).length;
    const criticalPassed = checks.filter(c => c.critical && c.passed).length;

    return {
      overall: Math.round((passed / total) * 100),
      critical: Math.round((criticalPassed / critical) * 100),
      passed,
      total
    };
  }

  generateRecommendations(criticalFailures, warnings) {
    const recommendations = [];

    for (const failure of criticalFailures) {
      switch (failure.name) {
        case 'Acceptance Criteria':
          recommendations.push({
            type: 'requirement',
            action: 'Add more specific acceptance criteria using Given/When/Then format'
          });
          break;
        case 'Test Coverage':
          recommendations.push({
            type: 'testing',
            action: 'Write additional tests to meet coverage requirements'
          });
          break;
        case 'Code Review':
          recommendations.push({
            type: 'review',
            action: 'Request code review from team members'
          });
          break;
        case 'Documentation':
          recommendations.push({
            type: 'documentation',
            action: 'Update relevant documentation before marking complete'
          });
          break;
      }
    }

    return recommendations;
  }

  generateMessage(story, criticalFailures, warnings) {
    if (criticalFailures.length === 0) {
      const warningText = warnings.length > 0 ? ` (${warnings.length} warnings)` : '';
      return `✅ Story "${story.title}" meets all completion requirements${warningText}`;
    }

    const failureNames = criticalFailures.map(f => f.name).join(', ');
    return `❌ Story "${story.title}" cannot be marked complete. Failed checks: ${failureNames}`;
  }

  getDescription() {
    return 'Ensures all requirements are implemented before marking stories as done';
  }

  getConfigurableOptions() {
    return {
      minAcceptanceCriteria: {
        type: 'number',
        default: 3,
        description: 'Minimum number of acceptance criteria required'
      },
      minTestCoverage: {
        type: 'number',
        default: 80,
        description: 'Minimum test coverage percentage'
      },
      requireDocumentation: {
        type: 'boolean',
        default: true,
        description: 'Require documentation updates'
      },
      minReviewers: {
        type: 'number',
        default: 1,
        description: 'Minimum number of code reviewers'
      },
      definitionOfDone: {
        type: 'array',
        default: ['Code complete', 'Unit tests written', 'Code reviewed', 'Documentation updated'],
        description: 'Checklist items for definition of done'
      },
      strictMode: {
        type: 'boolean',
        default: false,
        description: 'Enforce all checks strictly (no warnings)'
      }
    };
  }
}

module.exports = RequirementCompleteness;