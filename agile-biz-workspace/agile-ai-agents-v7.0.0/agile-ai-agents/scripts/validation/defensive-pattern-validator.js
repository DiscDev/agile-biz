#!/usr/bin/env node

/**
 * Defensive Pattern Validator
 * Scans code for unsafe patterns and suggests fixes
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Defensive pattern rules
const RULES = {
  unsafePropertyAccess: {
    name: 'Unsafe Property Access',
    pattern: /(?<![\?\.])\b(\w+)\.(\w+)\.(\w+)/g,
    message: 'Use optional chaining for nested property access',
    severity: 'error',
    fix: (match) => {
      const parts = match.split('.');
      return parts.join('?.');
    },
    exclude: ['console.log', 'Math.', 'JSON.', 'Object.', 'Array.', 'String.', 'Number.']
  },
  
  unsafeArrayLength: {
    name: 'Unsafe Array Length',
    pattern: /(\w+)\.length(?!\s*\|\|)/g,
    message: 'Array length access should have fallback',
    severity: 'error',
    fix: (match) => `${match} || 0`,
    exclude: ['".length', "'.length", 'string.length']
  },
  
  unsafeArrayMethod: {
    name: 'Unsafe Array Method',
    pattern: /(?<!Array\.isArray\([^)]*\)\s*\?\s*)(\w+)\.(map|filter|reduce|forEach|find|some|every)\(/g,
    message: 'Array methods should be preceded by Array.isArray check',
    severity: 'error',
    fix: (match, variable, method) => `Array.isArray(${variable}) ? ${variable}.${method}(`,
    exclude: []
  },
  
  missingFallback: {
    name: 'Missing Fallback Value',
    pattern: /const\s+(\w+)\s*=\s*(\w+)\.(\w+)(?!\s*\|\|)(?!\s*\?)[\s;]/g,
    message: 'Provide fallback value for property access',
    severity: 'warning',
    fix: (match) => match.replace(/;$/, ' || null;'),
    exclude: []
  },
  
  unsafeDestructuring: {
    name: 'Unsafe Destructuring',
    pattern: /const\s*{\s*([^}]+)\s*}\s*=\s*(\w+)(?!\s*\|\|)/g,
    message: 'Object destructuring should have default',
    severity: 'warning',
    fix: (match, props, obj) => `const { ${props} } = ${obj} || {}`,
    exclude: []
  },
  
  directApiAccess: {
    name: 'Direct API Response Access',
    pattern: /response\.data\.(\w+)(?!\?)/g,
    message: 'API response access should use optional chaining',
    severity: 'error',
    fix: (match) => match.replace(/\./g, '?.'),
    exclude: []
  },
  
  missingTryCatch: {
    name: 'Missing Try-Catch',
    pattern: /async\s+function[^{]+{[^}]*await\s+[^}]*(?!try)[^}]*}/g,
    message: 'Async functions should have try-catch blocks',
    severity: 'warning',
    exclude: []
  },
  
  unsafeFunctionCall: {
    name: 'Unsafe Function Call',
    pattern: /(\w+)\((.*)\)(?<!typeof\s+\1\s*===\s*['"]function['"])/g,
    message: 'Check if variable is a function before calling',
    severity: 'info',
    exclude: ['console.', 'Math.', 'JSON.', 'parseInt', 'parseFloat', 'require']
  }
};

class DefensivePatternValidator {
  constructor(options = {}) {
    this.options = {
      fix: options.fix || false,
      verbose: options.verbose || false,
      failOnError: options.failOnError || true,
      ...options
    };
    this.violations = [];
  }

  /**
   * Validate a single file
   */
  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileViolations = [];

    Object.entries(RULES).forEach(([ruleName, rule]) => {
      const matches = [...content.matchAll(rule.pattern)];
      
      matches.forEach(match => {
        // Check if match should be excluded
        const shouldExclude = rule.exclude.some(exclude => 
          match[0].includes(exclude)
        );
        
        if (!shouldExclude) {
          const lineNumber = this.getLineNumber(content, match.index);
          const violation = {
            rule: ruleName,
            ruleName: rule.name,
            message: rule.message,
            severity: rule.severity,
            file: filePath,
            line: lineNumber,
            column: match.index - content.lastIndexOf('\n', match.index),
            match: match[0],
            fix: rule.fix ? rule.fix(...match) : null
          };
          
          fileViolations.push(violation);
        }
      });
    });

    return fileViolations;
  }

  /**
   * Get line number from string index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Validate multiple files
   */
  async validateFiles(patterns) {
    const files = [];
    
    // Resolve file patterns
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
      });
      files.push(...matches);
    }

    // Validate each file
    for (const file of files) {
      if (this.options.verbose) {
        console.log(chalk.dim(`Validating ${file}...`));
      }
      
      const violations = this.validateFile(file);
      this.violations.push(...violations);
    }

    return this.violations;
  }

  /**
   * Apply fixes to violations
   */
  applyFixes() {
    const fixedFiles = new Map();
    
    this.violations.forEach(violation => {
      if (violation.fix) {
        if (!fixedFiles.has(violation.file)) {
          const content = fs.readFileSync(violation.file, 'utf8');
          fixedFiles.set(violation.file, content);
        }
        
        let fileContent = fixedFiles.get(violation.file);
        fileContent = fileContent.replace(violation.match, violation.fix);
        fixedFiles.set(violation.file, fileContent);
      }
    });

    // Write fixed files
    fixedFiles.forEach((content, filePath) => {
      fs.writeFileSync(filePath, content);
      console.log(chalk.green(`✓ Fixed ${filePath}`));
    });
  }

  /**
   * Format and display results
   */
  displayResults() {
    if (this.violations.length === 0) {
      console.log(chalk.green('\n✓ No defensive pattern violations found!'));
      return;
    }

    // Group violations by file
    const violationsByFile = {};
    this.violations.forEach(violation => {
      if (!violationsByFile[violation.file]) {
        violationsByFile[violation.file] = [];
      }
      violationsByFile[violation.file].push(violation);
    });

    // Display violations
    console.log(chalk.red(`\n✗ Found ${this.violations.length} defensive pattern violations:\n`));
    
    Object.entries(violationsByFile).forEach(([file, violations]) => {
      console.log(chalk.underline(file));
      
      violations.forEach(violation => {
        const icon = violation.severity === 'error' ? '✗' : 
                    violation.severity === 'warning' ? '⚠' : 'ℹ';
        const color = violation.severity === 'error' ? 'red' : 
                      violation.severity === 'warning' ? 'yellow' : 'blue';
        
        console.log(
          chalk[color](`  ${icon} Line ${violation.line}:${violation.column} - ${violation.ruleName}`)
        );
        console.log(chalk.dim(`    ${violation.message}`));
        console.log(chalk.dim(`    Found: ${chalk.red(violation.match)}`));
        
        if (violation.fix) {
          console.log(chalk.dim(`    Fix:   ${chalk.green(violation.fix)}`));
        }
        console.log();
      });
    });

    // Summary
    const errors = this.violations.filter(v => v.severity === 'error').length;
    const warnings = this.violations.filter(v => v.severity === 'warning').length;
    const infos = this.violations.filter(v => v.severity === 'info').length;
    
    console.log(chalk.bold('\nSummary:'));
    if (errors > 0) console.log(chalk.red(`  ${errors} errors`));
    if (warnings > 0) console.log(chalk.yellow(`  ${warnings} warnings`));
    if (infos > 0) console.log(chalk.blue(`  ${infos} info`));
  }

  /**
   * Generate report
   */
  generateReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.violations.length,
        errors: this.violations.filter(v => v.severity === 'error').length,
        warnings: this.violations.filter(v => v.severity === 'warning').length,
        info: this.violations.filter(v => v.severity === 'info').length
      },
      violations: this.violations
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`\nReport saved to ${outputPath}`));
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    failOnError: !args.includes('--no-fail'),
    report: args.includes('--report')
  };

  // Get file patterns
  const patterns = args.filter(arg => !arg.startsWith('-'));
  if (patterns.length === 0) {
    patterns.push('**/*.{js,jsx,ts,tsx}');
  }

  // Run validator
  const validator = new DefensivePatternValidator(options);
  
  validator.validateFiles(patterns).then(() => {
    validator.displayResults();
    
    if (options.fix) {
      validator.applyFixes();
    }
    
    if (options.report) {
      validator.generateReport('defensive-pattern-report.json');
    }
    
    // Exit with error code if violations found
    if (options.failOnError && validator.violations.some(v => v.severity === 'error')) {
      process.exit(1);
    }
  }).catch(error => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  });
}

module.exports = DefensivePatternValidator;