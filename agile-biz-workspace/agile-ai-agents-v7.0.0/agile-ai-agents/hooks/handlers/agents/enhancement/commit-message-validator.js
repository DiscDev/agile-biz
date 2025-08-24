const BaseAgentHook = require('../../shared/base-agent-hook');

class CommitMessageValidatorHook extends BaseAgentHook {
  constructor() {
    super({
      name: 'commit-message-validator',
      description: 'Validates commit messages against conventional standards',
      events: ['pre-commit', 'commit-msg'],
      performanceImpact: 'low',
      cacheTTL: 0, // No caching for validation
      warningThreshold: 500,
      disableThreshold: 1000
    });
    
    // Conventional commit types
    this.validTypes = [
      'feat',     // New feature
      'fix',      // Bug fix
      'docs',     // Documentation only
      'style',    // Formatting, missing semicolons, etc
      'refactor', // Code change that neither fixes a bug nor adds a feature
      'perf',     // Performance improvement
      'test',     // Adding missing tests
      'chore',    // Maintain tasks
      'ci',       // CI configuration
      'build',    // Build system or dependencies
      'revert'    // Revert a previous commit
    ];
    
    // Commit message patterns
    this.patterns = {
      conventional: /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .{1,100}$/,
      header: /^.{1,100}$/,
      body: /^.{0,500}$/,
      footer: /^(BREAKING CHANGE:|Closes|Fixes|Resolves|Refs|Related to) #\d+/
    };
  }

  async handle(data) {
    const { message, filePath } = data;
    
    if (!message) {
      return {
        valid: false,
        errors: ['No commit message provided'],
        suggestions: ['Provide a commit message']
      };
    }
    
    const lines = message.trim().split('\n');
    const header = lines[0];
    const body = lines.slice(2).join('\n'); // Skip blank line after header
    
    const validation = this.validateCommitMessage(header, body);
    
    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        suggestions: validation.suggestions,
        example: this.generateExample(header)
      };
    }
    
    // Check for quality issues
    const quality = this.checkMessageQuality(header, body);
    
    return {
      valid: true,
      message: 'Commit message follows conventional standards',
      quality,
      stats: {
        type: this.extractType(header),
        scope: this.extractScope(header),
        breaking: this.isBreakingChange(message),
        headerLength: header.length,
        bodyLength: body.length
      }
    };
  }

  validateCommitMessage(header, body) {
    const errors = [];
    const suggestions = [];
    
    // Validate header format
    if (!this.patterns.conventional.test(header)) {
      errors.push('Header does not follow conventional commit format');
      suggestions.push('Use format: <type>(<scope>): <subject>');
      suggestions.push(`Valid types: ${this.validTypes.join(', ')}`);
    }
    
    // Check header length
    if (header.length > 100) {
      errors.push(`Header too long (${header.length} chars, max 100)`);
      suggestions.push('Keep header under 100 characters');
    }
    
    // Check if header starts with capital letter (after type)
    const subject = header.split(': ')[1];
    if (subject && /^[A-Z]/.test(subject)) {
      errors.push('Subject should not start with capital letter');
      suggestions.push('Use lowercase for subject start');
    }
    
    // Check for imperative mood
    if (subject && !this.isImperativeMood(subject)) {
      suggestions.push('Use imperative mood (e.g., "add" not "adds" or "added")');
    }
    
    // Validate body if present
    if (body && body.length > 500) {
      errors.push(`Body too long (${body.length} chars, max 500)`);
      suggestions.push('Keep body under 500 characters or use footer references');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      suggestions
    };
  }

  extractType(header) {
    const match = header.match(/^(\w+)(\(.+\))?:/);
    return match ? match[1] : null;
  }

  extractScope(header) {
    const match = header.match(/^\w+\((.+)\):/);
    return match ? match[1] : null;
  }

  isBreakingChange(message) {
    return message.includes('BREAKING CHANGE:') || message.includes('!:');
  }

  isImperativeMood(subject) {
    // Common non-imperative patterns
    const nonImperativePatterns = [
      /^(adds|added|adding)/i,
      /^(fixes|fixed|fixing)/i,
      /^(changes|changed|changing)/i,
      /^(updates|updated|updating)/i,
      /^(removes|removed|removing)/i
    ];
    
    return !nonImperativePatterns.some(pattern => pattern.test(subject));
  }

  checkMessageQuality(header, body) {
    const quality = {
      score: 100,
      issues: []
    };
    
    // Check for vague messages
    const vagueTerms = ['fix', 'update', 'change', 'modify'];
    const subject = header.split(': ')[1] || '';
    
    if (vagueTerms.some(term => subject.toLowerCase() === term)) {
      quality.score -= 20;
      quality.issues.push('Message is too vague, be more specific');
    }
    
    // Check for issue references
    if (!body.match(/#\d+/) && !header.match(/#\d+/)) {
      quality.score -= 10;
      quality.issues.push('Consider referencing related issues');
    }
    
    // Check for explanation in body
    if (!body && header.length < 50) {
      quality.score -= 15;
      quality.issues.push('Consider adding explanation in body for complex changes');
    }
    
    // Reward good practices
    if (this.extractScope(header)) {
      quality.score += 5;
      quality.score = Math.min(100, quality.score);
    }
    
    return quality;
  }

  generateExample(badHeader) {
    const type = this.extractType(badHeader) || 'feat';
    const validType = this.validTypes.includes(type) ? type : 'feat';
    
    return {
      header: `${validType}(component): add user authentication feature`,
      body: 'Implement JWT-based authentication with refresh tokens.\n\nCloses #123',
      full: `${validType}(component): add user authentication feature\n\nImplement JWT-based authentication with refresh tokens.\n\nCloses #123`
    };
  }

  getConfig() {
    return {
      ...super.getConfig(),
      validTypes: this.validTypes,
      maxHeaderLength: 100,
      maxBodyLength: 500,
      requireScope: false,
      requireBody: false
    };
  }
}

module.exports = CommitMessageValidatorHook;