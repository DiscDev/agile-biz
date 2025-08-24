const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs').promises;
const path = require('path');

class PRTemplateCheckerHook extends BaseAgentHook {
  constructor() {
    super({
      name: 'pr-template-checker',
      description: 'Ensures PR descriptions follow the template',
      events: ['pr.created', 'pr.updated', 'pre-pr'],
      performanceImpact: 'low',
      cacheTTL: 300000, // Cache template for 5 minutes
      warningThreshold: 1000,
      disableThreshold: 2000
    });
    
    this.requiredSections = [
      '## Description',
      '## Type of Change',
      '## Testing',
      '## Checklist'
    ];
    
    this.typeOfChangeOptions = [
      'Bug fix',
      'New feature',
      'Breaking change',
      'Documentation update',
      'Performance improvement',
      'Refactoring',
      'Test update',
      'Build/CI update'
    ];
    
    this.checklistItems = [
      'My code follows the project style guidelines',
      'I have performed a self-review',
      'I have added tests that prove my fix/feature works',
      'New and existing unit tests pass locally',
      'I have updated the documentation accordingly'
    ];
  }

  async handle(data) {
    const { prBody, prTitle, templatePath } = data;
    
    if (!prBody) {
      return {
        valid: false,
        errors: ['PR body is empty'],
        template: await this.getTemplate(templatePath),
        suggestions: ['Please fill out the PR template']
      };
    }
    
    const validation = await this.validatePRBody(prBody, templatePath);
    
    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        warnings: validation.warnings,
        template: await this.getTemplate(templatePath),
        suggestions: validation.suggestions,
        completeness: validation.completeness
      };
    }
    
    // Check PR title
    const titleValidation = this.validatePRTitle(prTitle);
    
    return {
      valid: true,
      message: 'PR follows template guidelines',
      completeness: validation.completeness,
      warnings: [...validation.warnings, ...titleValidation.warnings],
      stats: {
        sectionsFound: validation.sectionsFound,
        checklistComplete: validation.checklistStats.completed,
        checklistTotal: validation.checklistStats.total,
        hasTests: validation.hasTests,
        hasBreakingChanges: validation.hasBreakingChanges
      }
    };
  }

  async validatePRBody(body, templatePath) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    const sectionsFound = [];
    
    // Check required sections
    for (const section of this.requiredSections) {
      if (!body.includes(section)) {
        errors.push(`Missing required section: ${section}`);
        suggestions.push(`Add ${section} section to your PR`);
      } else {
        sectionsFound.push(section);
      }
    }
    
    // Check if description is meaningful
    const descriptionMatch = body.match(/## Description\s*\n+([^#]+)/);
    if (descriptionMatch) {
      const description = descriptionMatch[1].trim();
      if (description.length < 30) {
        warnings.push('Description seems too short (< 30 chars)');
        suggestions.push('Provide a more detailed description');
      }
      if (description.includes('TODO') || description.includes('TBD')) {
        errors.push('Description contains placeholder text (TODO/TBD)');
      }
    }
    
    // Check type of change
    const typeMatch = body.match(/## Type of Change\s*\n+([^#]+)/);
    const hasValidType = typeMatch && this.typeOfChangeOptions.some(type => 
      typeMatch[1].includes(`[x] ${type}`) || typeMatch[1].includes(`[X] ${type}`)
    );
    
    if (!hasValidType) {
      errors.push('No type of change selected');
      suggestions.push('Select at least one type of change');
    }
    
    // Check testing section
    const testingMatch = body.match(/## Testing\s*\n+([^#]+)/);
    const hasTests = testingMatch && testingMatch[1].trim().length > 20;
    
    if (!hasTests) {
      warnings.push('Testing section seems incomplete');
      suggestions.push('Describe how you tested your changes');
    }
    
    // Check checklist
    const checklistStats = this.validateChecklist(body);
    if (checklistStats.completed < 3) {
      warnings.push(`Only ${checklistStats.completed}/${checklistStats.total} checklist items completed`);
      suggestions.push('Complete all applicable checklist items');
    }
    
    // Check for breaking changes
    const hasBreakingChanges = body.includes('[x] Breaking change') || 
                              body.includes('[X] Breaking change') ||
                              body.includes('BREAKING CHANGE');
    
    if (hasBreakingChanges && !body.includes('## Breaking Changes')) {
      errors.push('Breaking change marked but no Breaking Changes section found');
      suggestions.push('Add a Breaking Changes section explaining the impact');
    }
    
    // Calculate completeness score
    const completeness = this.calculateCompleteness(
      sectionsFound.length,
      checklistStats,
      hasTests,
      errors.length
    );
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      sectionsFound,
      checklistStats,
      hasTests,
      hasBreakingChanges,
      completeness
    };
  }

  validatePRTitle(title) {
    const warnings = [];
    
    if (!title) {
      warnings.push('PR title is empty');
      return { warnings };
    }
    
    // Check length
    if (title.length < 10) {
      warnings.push('PR title too short (< 10 chars)');
    } else if (title.length > 72) {
      warnings.push('PR title too long (> 72 chars)');
    }
    
    // Check for issue reference
    if (!title.match(/#\d+/)) {
      warnings.push('Consider adding issue reference to PR title');
    }
    
    // Check for conventional format
    const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?:/;
    if (!conventionalPattern.test(title)) {
      warnings.push('Consider using conventional commit format for PR title');
    }
    
    return { warnings };
  }

  validateChecklist(body) {
    let completed = 0;
    let total = this.checklistItems.length;
    
    for (const item of this.checklistItems) {
      if (body.includes(`[x] ${item}`) || body.includes(`[X] ${item}`)) {
        completed++;
      }
    }
    
    return { completed, total };
  }

  calculateCompleteness(sectionsFound, checklistStats, hasTests, errorCount) {
    let score = 0;
    
    // Sections (40%)
    score += (sectionsFound / this.requiredSections.length) * 40;
    
    // Checklist (30%)
    score += (checklistStats.completed / checklistStats.total) * 30;
    
    // Testing (20%)
    if (hasTests) score += 20;
    
    // No errors (10%)
    if (errorCount === 0) score += 10;
    
    return Math.round(score);
  }

  async getTemplate(templatePath) {
    const cacheKey = 'pr-template';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Try common PR template locations
      const possiblePaths = [
        templatePath,
        '.github/pull_request_template.md',
        '.github/PULL_REQUEST_TEMPLATE.md',
        'docs/pull_request_template.md',
        'PULL_REQUEST_TEMPLATE.md'
      ].filter(Boolean);
      
      for (const path of possiblePaths) {
        try {
          const template = await fs.readFile(path, 'utf8');
          this.cache.set(cacheKey, template);
          return template;
        } catch {
          // Try next path
        }
      }
      
      // Return default template if none found
      const defaultTemplate = this.getDefaultTemplate();
      this.cache.set(cacheKey, defaultTemplate);
      return defaultTemplate;
    } catch (error) {
      return this.getDefaultTemplate();
    }
  }

  getDefaultTemplate() {
    return `## Description
Please provide a brief description of the changes in this PR.

## Type of Change
Please select the type of change:
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Test update
- [ ] Build/CI update

## Testing
Please describe the tests that you ran to verify your changes:

## Checklist
- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] I have updated the documentation accordingly

## Related Issues
Closes #

## Screenshots (if applicable)
`;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      requiredSections: this.requiredSections,
      minimumCompleteness: 80,
      enforceChecklist: true,
      requireTests: true
    };
  }
}

module.exports = PRTemplateCheckerHook;