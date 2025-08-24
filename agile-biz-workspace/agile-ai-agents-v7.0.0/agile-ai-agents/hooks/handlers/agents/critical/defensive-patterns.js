const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs-extra');
const path = require('path');

/**
 * Defensive Patterns Hook
 * Enforces defensive programming patterns in code
 * Checks for optional chaining, null checks, error boundaries, etc.
 */
class DefensivePatterns extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'defensive-patterns',
      agent: 'coder_agent',
      category: 'critical',
      impact: 'low', // Fast AST analysis
      cacheEnabled: true,
      cacheTTL: 600000, // 10 minutes
      ...config
    });

    this.patterns = {
      javascript: {
        optionalChaining: {
          pattern: /(\w+)\.(\w+)\.(\w+)/g,
          fix: '$1?.$2?.$3',
          message: 'Use optional chaining for nested property access'
        },
        nullishCoalescing: {
          pattern: /(\w+)\s*\|\|\s*(['"`].*?['"`]|\d+|true|false)/g,
          fix: '$1 ?? $2',
          message: 'Use nullish coalescing for default values'
        },
        arrayAccess: {
          pattern: /(\w+)\[(\d+)\]/g,
          fix: '$1?.[$2]',
          message: 'Use optional chaining for array access'
        },
        functionCall: {
          pattern: /(\w+)\.(\w+)\(/g,
          fix: '$1?.$2?.(', 
          message: 'Use optional chaining for method calls'
        }
      },
      react: {
        errorBoundary: {
          pattern: /class\s+(\w+)\s+extends\s+(React\.)?Component/g,
          check: 'componentDidCatch',
          message: 'Add error boundary to React components'
        },
        propTypes: {
          pattern: /function\s+(\w+)\s*\(/g,
          check: 'propTypes',
          message: 'Add PropTypes validation'
        },
        defaultProps: {
          pattern: /function\s+(\w+)\s*\(/g,
          check: 'defaultProps',
          message: 'Define default props for optional props'
        }
      }
    };

    this.fileExtensions = {
      javascript: ['.js', '.jsx', '.ts', '.tsx'],
      react: ['.jsx', '.tsx']
    };
  }

  async handle(context) {
    const { filePath, content, action } = context;

    // Only check on file modifications
    if (!['created', 'modified'].includes(action)) {
      return { skipped: true, reason: 'Not a file modification' };
    }

    // Check if file is a code file we should analyze
    const ext = path.extname(filePath);
    const isJavaScript = this.fileExtensions.javascript.includes(ext);
    const isReact = this.fileExtensions.react.includes(ext);

    if (!isJavaScript) {
      return { skipped: true, reason: 'Not a JavaScript file' };
    }

    const issues = [];
    const suggestions = [];

    // Check JavaScript patterns
    if (isJavaScript) {
      const jsIssues = this.checkJavaScriptPatterns(content);
      issues.push(...jsIssues);
    }

    // Check React patterns
    if (isReact) {
      const reactIssues = this.checkReactPatterns(content);
      issues.push(...reactIssues);
    }

    // Generate fix suggestions
    if (issues.length > 0) {
      suggestions.push(...this.generateSuggestions(content, issues));
    }

    return {
      success: true,
      issues: issues.length,
      patterns: issues,
      suggestions,
      blocked: issues.length > this.config.blockingThreshold || 0,
      message: this.generateMessage(issues)
    };
  }

  checkJavaScriptPatterns(content) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip comments and strings
      if (this.isCommentOrString(line)) return;

      // Check for missing optional chaining
      if (this.needsOptionalChaining(line)) {
        issues.push({
          type: 'missing-optional-chaining',
          line: index + 1,
          code: line.trim(),
          severity: 'warning',
          fix: this.addOptionalChaining(line)
        });
      }

      // Check for unsafe array access
      const arrayAccess = line.match(/(\w+)\[([^\]]+)\]/g);
      if (arrayAccess && !line.includes('?.[')) {
        issues.push({
          type: 'unsafe-array-access',
          line: index + 1,
          code: line.trim(),
          severity: 'warning',
          message: 'Consider using optional chaining for array access'
        });
      }

      // Check for missing null checks
      const assignments = line.match(/const\s+(\w+)\s*=\s*(\w+)\.(\w+)/g);
      if (assignments && !line.includes('?.')) {
        issues.push({
          type: 'missing-null-check',
          line: index + 1,
          code: line.trim(),
          severity: 'warning',
          message: 'Add null check before property access'
        });
      }

      // Check for console.error without try-catch
      if (line.includes('console.error') && !this.isInTryCatch(lines, index)) {
        issues.push({
          type: 'unhandled-error-logging',
          line: index + 1,
          code: line.trim(),
          severity: 'info',
          message: 'Consider wrapping error logging in try-catch'
        });
      }
    });

    return issues;
  }

  checkReactPatterns(content) {
    const issues = [];

    // Check for error boundaries
    const componentMatches = content.match(/class\s+(\w+)\s+extends\s+(React\.)?Component/g);
    if (componentMatches) {
      componentMatches.forEach(match => {
        const componentName = match.match(/class\s+(\w+)/)[1];
        if (!content.includes('componentDidCatch')) {
          issues.push({
            type: 'missing-error-boundary',
            component: componentName,
            severity: 'warning',
            message: `Component ${componentName} should implement error boundary`
          });
        }
      });
    }

    // Check for unhandled promises in useEffect
    const effectMatches = content.match(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]+\}/g);
    if (effectMatches) {
      effectMatches.forEach(match => {
        if (match.includes('async') && !match.includes('catch')) {
          issues.push({
            type: 'unhandled-async-effect',
            severity: 'error',
            message: 'Async operations in useEffect should handle errors'
          });
        }
      });
    }

    // Check for missing fallback in lazy loading
    const lazyMatches = content.match(/React\.lazy\s*\(/g);
    if (lazyMatches && !content.includes('Suspense')) {
      issues.push({
        type: 'missing-suspense',
        severity: 'error',
        message: 'React.lazy requires Suspense with fallback'
      });
    }

    return issues;
  }

  needsOptionalChaining(line) {
    // Check for patterns like obj.prop.nested without optional chaining
    const chainPattern = /(\w+)\.(\w+)\.(\w+)/;
    const hasChaining = chainPattern.test(line);
    const hasOptional = line.includes('?.');
    
    return hasChaining && !hasOptional && !this.isSafePattern(line);
  }

  isSafePattern(line) {
    // Some patterns are safe without optional chaining
    const safePatterns = [
      /console\.\w+/,
      /Math\.\w+/,
      /Object\.\w+/,
      /Array\.\w+/,
      /JSON\.\w+/,
      /process\.env/,
      /window\.location/,
      /document\.\w+/
    ];

    return safePatterns.some(pattern => pattern.test(line));
  }

  isCommentOrString(line) {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || 
           trimmed.startsWith('*') ||
           trimmed.startsWith('/*') ||
           /^['"`].*['"`]$/.test(trimmed);
  }

  isInTryCatch(lines, index) {
    // Simple check - look backwards for try block
    for (let i = index - 1; i >= Math.max(0, index - 10); i--) {
      if (lines[i].includes('try {')) return true;
      if (lines[i].includes('}')) break;
    }
    return false;
  }

  addOptionalChaining(line) {
    return line.replace(/(\w+)\.(\w+)\.(\w+)/g, (match, p1, p2, p3) => {
      if (this.isSafePattern(match)) return match;
      return `${p1}?.${p2}?.${p3}`;
    });
  }

  generateSuggestions(content, issues) {
    const suggestions = [];
    const severityGroups = {};

    // Group by severity
    issues.forEach(issue => {
      if (!severityGroups[issue.severity]) {
        severityGroups[issue.severity] = [];
      }
      severityGroups[issue.severity].push(issue);
    });

    // Generate fix suggestions
    if (severityGroups.error?.length > 0) {
      suggestions.push({
        type: 'auto-fix',
        description: 'Critical defensive patterns missing',
        fixes: severityGroups.error.map(issue => ({
          line: issue.line,
          original: issue.code,
          suggested: issue.fix
        }))
      });
    }

    if (severityGroups.warning?.length > 0) {
      suggestions.push({
        type: 'recommendation',
        description: 'Recommended defensive patterns',
        count: severityGroups.warning.length,
        examples: severityGroups.warning.slice(0, 3)
      });
    }

    return suggestions;
  }

  generateMessage(issues) {
    if (issues.length === 0) {
      return '✅ All defensive programming patterns are properly implemented';
    }

    const byType = {};
    issues.forEach(issue => {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });

    const summary = Object.entries(byType)
      .map(([type, count]) => `${count} ${type.replace(/-/g, ' ')}`)
      .join(', ');

    return `⚠️ Found ${issues.length} defensive pattern issues: ${summary}`;
  }

  getDescription() {
    return 'Enforces defensive programming patterns like optional chaining and null checks';
  }

  getConfigurableOptions() {
    return {
      blockingThreshold: {
        type: 'number',
        default: 10,
        description: 'Number of issues that blocks the operation'
      },
      autoFix: {
        type: 'boolean',
        default: false,
        description: 'Automatically apply safe fixes'
      },
      strictMode: {
        type: 'boolean',
        default: false,
        description: 'Enforce all patterns strictly'
      },
      ignorePatterns: {
        type: 'array',
        default: [],
        description: 'Patterns to ignore (regex strings)'
      }
    };
  }
}

module.exports = DefensivePatterns;