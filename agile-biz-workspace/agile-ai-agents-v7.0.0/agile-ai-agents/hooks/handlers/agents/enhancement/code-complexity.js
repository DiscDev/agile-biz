#!/usr/bin/env node

/**
 * Code Complexity Monitor Hook
 * Monitors and reports on code complexity metrics
 * Category: Enhancement (Default OFF)
 */

const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs');
const path = require('path');

class CodeComplexityMonitor extends BaseAgentHook {
  constructor() {
    super('code-complexity', 'enhancement');
    this.complexityHistory = new Map();
  }

  getDefaultConfig() {
    return {
      complexity_threshold: 10,
      suggest_refactoring: true,
      track_trends: true,
      ignore_test_files: true,
      report_format: 'detailed', // 'simple' | 'detailed'
      metrics: {
        cyclomatic: true,
        cognitive: true,
        halstead: false,
        maintainability: true
      }
    };
  }

  async execute() {
    const { filePath } = this.context;
    
    if (!filePath || !this.isAnalyzableFile(filePath)) {
      return this.createSuccessResult('Not an analyzable file');
    }

    // Skip test files if configured
    if (this.config.ignore_test_files && this.isTestFile(filePath)) {
      return this.createSuccessResult('Test file - skipping complexity analysis');
    }

    const fileContent = await this.readFile(filePath);
    const language = this.detectLanguage(filePath);
    
    // Analyze complexity
    const complexityMetrics = await this.analyzeComplexity(fileContent, language, filePath);
    
    // Track trends if enabled
    if (this.config.track_trends) {
      await this.trackComplexityTrends(filePath, complexityMetrics);
    }
    
    // Evaluate results
    return this.evaluateComplexity(complexityMetrics, filePath);
  }

  isAnalyzableFile(filePath) {
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.cs'];
    return extensions.some(ext => filePath.endsWith(ext));
  }

  isTestFile(filePath) {
    const testPatterns = [
      '.test.', '.spec.', '__tests__', 'test/', 'tests/', 
      'spec/', 'specs/', '.e2e.', '.integration.'
    ];
    return testPatterns.some(pattern => filePath.includes(pattern));
  }

  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const langMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.cs': 'csharp'
    };
    return langMap[ext] || 'unknown';
  }

  async analyzeComplexity(content, language, filePath) {
    const metrics = {
      cyclomatic: 0,
      cognitive: 0,
      maintainability: 100,
      functions: [],
      classes: [],
      totalLines: content.split('\n').length,
      codeLines: 0,
      language
    };

    // Language-specific analysis
    switch (language) {
      case 'javascript':
      case 'typescript':
        this.analyzeJavaScriptComplexity(content, metrics);
        break;
      case 'python':
        this.analyzePythonComplexity(content, metrics);
        break;
      default:
        // Basic analysis for other languages
        this.analyzeBasicComplexity(content, metrics);
    }

    // Calculate maintainability index
    if (this.config.metrics.maintainability) {
      metrics.maintainability = this.calculateMaintainabilityIndex(metrics);
    }

    // Track metrics
    this.trackMetric('cyclomatic_complexity', metrics.cyclomatic);
    this.trackMetric('cognitive_complexity', metrics.cognitive);
    this.trackMetric('maintainability_index', metrics.maintainability);

    return metrics;
  }

  analyzeJavaScriptComplexity(content, metrics) {
    // Count code lines (non-empty, non-comment)
    const lines = content.split('\n');
    metrics.codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
    }).length;

    // Analyze functions
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[^=]+)\s*=>|(\w+)\s*:\s*(?:async\s*)?(?:\([^)]*\)|[^{]+)\s*{)/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const funcName = match[1] || match[2] || match[3] || 'anonymous';
      const funcStart = match.index;
      const funcBody = this.extractFunctionBody(content, funcStart);
      
      const funcComplexity = this.calculateFunctionComplexity(funcBody);
      metrics.functions.push({
        name: funcName,
        line: this.getLineNumber(content, funcStart),
        cyclomatic: funcComplexity.cyclomatic,
        cognitive: funcComplexity.cognitive,
        length: funcBody.split('\n').length
      });
      
      metrics.cyclomatic += funcComplexity.cyclomatic;
      metrics.cognitive += funcComplexity.cognitive;
    }

    // Analyze classes
    const classRegex = /class\s+(\w+)/g;
    
    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const classStart = match.index;
      const classBody = this.extractClassBody(content, classStart);
      
      const classComplexity = this.analyzeClassComplexity(classBody);
      metrics.classes.push({
        name: className,
        line: this.getLineNumber(content, classStart),
        methods: classComplexity.methods,
        complexity: classComplexity.total
      });
    }
  }

  extractFunctionBody(content, startIndex) {
    let braceCount = 0;
    let inBody = false;
    let bodyStart = startIndex;
    
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        if (!inBody) {
          inBody = true;
          bodyStart = i;
        }
        braceCount++;
      } else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0 && inBody) {
          return content.substring(bodyStart, i + 1);
        }
      }
    }
    
    return '';
  }

  extractClassBody(content, startIndex) {
    // Similar to extractFunctionBody but for classes
    return this.extractFunctionBody(content, startIndex);
  }

  calculateFunctionComplexity(funcBody) {
    let cyclomatic = 1; // Base complexity
    let cognitive = 0;
    
    // Cyclomatic complexity patterns
    const cyclomaticPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*[^:]+:/g, // Ternary operator
      /&&/g,
      /\|\|/g
    ];
    
    cyclomaticPatterns.forEach(pattern => {
      const matches = funcBody.match(pattern);
      if (matches) {
        cyclomatic += matches.length;
      }
    });
    
    // Cognitive complexity (simplified)
    const cognitivePatterns = [
      { pattern: /\bif\s*\(/g, weight: 1 },
      { pattern: /\belse\s+if\s*\(/g, weight: 2 },
      { pattern: /\belse\s*{/g, weight: 1 },
      { pattern: /\bwhile\s*\(/g, weight: 1 },
      { pattern: /\bfor\s*\(/g, weight: 1 },
      { pattern: /\bdo\s*{/g, weight: 1 },
      { pattern: /\bcatch\s*\(/g, weight: 1 },
      { pattern: /\bswitch\s*\(/g, weight: 1 },
      { pattern: /\bnested.*function/g, weight: 3 } // Nested functions
    ];
    
    cognitivePatterns.forEach(({ pattern, weight }) => {
      const matches = funcBody.match(pattern);
      if (matches) {
        cognitive += matches.length * weight;
      }
    });
    
    // Add nesting depth penalty
    cognitive += this.calculateNestingPenalty(funcBody);
    
    return { cyclomatic, cognitive };
  }

  calculateNestingPenalty(code) {
    let maxDepth = 0;
    let currentDepth = 0;
    let penalty = 0;
    
    for (const char of code) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
        if (currentDepth > 2) {
          penalty += currentDepth - 2;
        }
      } else if (char === '}') {
        currentDepth--;
      }
    }
    
    return penalty;
  }

  analyzePythonComplexity(content, metrics) {
    // Python-specific complexity analysis
    const lines = content.split('\n');
    metrics.codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#');
    }).length;

    // Find functions
    const funcRegex = /^\s*def\s+(\w+)\s*\(/gm;
    let match;
    
    while ((match = funcRegex.exec(content)) !== null) {
      const funcName = match[1];
      const funcComplexity = this.calculatePythonFunctionComplexity(content, match.index);
      
      metrics.functions.push({
        name: funcName,
        line: this.getLineNumber(content, match.index),
        cyclomatic: funcComplexity.cyclomatic,
        cognitive: funcComplexity.cognitive
      });
      
      metrics.cyclomatic += funcComplexity.cyclomatic;
      metrics.cognitive += funcComplexity.cognitive;
    }
  }

  calculatePythonFunctionComplexity(content, startIndex) {
    // Simplified Python complexity calculation
    const funcEnd = content.indexOf('\ndef ', startIndex + 1);
    const funcBody = funcEnd > 0 
      ? content.substring(startIndex, funcEnd)
      : content.substring(startIndex);
    
    let cyclomatic = 1;
    const patterns = [
      /\bif\s+/g,
      /\belif\s+/g,
      /\bwhile\s+/g,
      /\bfor\s+/g,
      /\bexcept\s*:/g,
      /\band\b/g,
      /\bor\b/g
    ];
    
    patterns.forEach(pattern => {
      const matches = funcBody.match(pattern);
      if (matches) {
        cyclomatic += matches.length;
      }
    });
    
    return { cyclomatic, cognitive: cyclomatic }; // Simplified
  }

  analyzeBasicComplexity(content, metrics) {
    // Basic complexity for unsupported languages
    metrics.codeLines = content.split('\n').filter(line => line.trim()).length;
    metrics.cyclomatic = Math.floor(metrics.codeLines / 20); // Rough estimate
    metrics.cognitive = metrics.cyclomatic;
  }

  analyzeClassComplexity(classBody) {
    const methods = [];
    let totalComplexity = 0;
    
    // Find methods in class
    const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;
    let match;
    
    while ((match = methodRegex.exec(classBody)) !== null) {
      const methodName = match[1];
      const methodBody = this.extractFunctionBody(classBody, match.index);
      const complexity = this.calculateFunctionComplexity(methodBody);
      
      methods.push({
        name: methodName,
        cyclomatic: complexity.cyclomatic,
        cognitive: complexity.cognitive
      });
      
      totalComplexity += complexity.cyclomatic;
    }
    
    return { methods, total: totalComplexity };
  }

  calculateMaintainabilityIndex(metrics) {
    // Microsoft's Maintainability Index formula (simplified)
    const { cyclomatic, codeLines, functions } = metrics;
    
    if (codeLines === 0) return 100;
    
    const avgCyclomatic = functions.length > 0 
      ? cyclomatic / functions.length 
      : cyclomatic;
    
    const halsteadVolume = codeLines * 10; // Simplified
    
    let mi = 171 - 5.2 * Math.log(halsteadVolume) - 0.23 * avgCyclomatic - 16.2 * Math.log(codeLines);
    
    // Normalize to 0-100 scale
    mi = Math.max(0, mi * 100 / 171);
    
    return Math.round(mi);
  }

  async trackComplexityTrends(filePath, metrics) {
    const trendKey = this.getRelativePath(filePath);
    
    if (!this.complexityHistory.has(trendKey)) {
      this.complexityHistory.set(trendKey, []);
    }
    
    const history = this.complexityHistory.get(trendKey);
    history.push({
      timestamp: Date.now(),
      cyclomatic: metrics.cyclomatic,
      cognitive: metrics.cognitive,
      maintainability: metrics.maintainability
    });
    
    // Keep last 20 entries
    if (history.length > 20) {
      history.shift();
    }
    
    // Save to cache for persistence
    await this.saveToCache(`trends-${trendKey.replace(/\//g, '-')}`, history);
  }

  evaluateComplexity(metrics, filePath) {
    const issues = [];
    const suggestions = [];
    
    // Check overall file complexity
    if (metrics.cyclomatic > this.config.complexity_threshold * 3) {
      issues.push({
        type: 'high_file_complexity',
        severity: 'high',
        message: `File has very high cyclomatic complexity: ${metrics.cyclomatic}`
      });
    }
    
    // Check individual functions
    const complexFunctions = metrics.functions.filter(
      f => f.cyclomatic > this.config.complexity_threshold
    );
    
    if (complexFunctions.length > 0) {
      complexFunctions.forEach(func => {
        issues.push({
          type: 'complex_function',
          severity: func.cyclomatic > this.config.complexity_threshold * 2 ? 'high' : 'moderate',
          function: func.name,
          line: func.line,
          cyclomatic: func.cyclomatic,
          message: `Function '${func.name}' has cyclomatic complexity of ${func.cyclomatic}`
        });
        
        if (this.config.suggest_refactoring) {
          suggestions.push(...this.generateRefactoringSuggestions(func));
        }
      });
    }
    
    // Check maintainability
    if (metrics.maintainability < 50) {
      issues.push({
        type: 'low_maintainability',
        severity: 'high',
        message: `Low maintainability index: ${metrics.maintainability}`
      });
    }
    
    // Generate report
    const report = this.generateComplexityReport(metrics, issues, suggestions, filePath);
    
    if (issues.length === 0) {
      return this.createSuccessResult(
        `✅ Code complexity within acceptable limits (cyclomatic: ${metrics.cyclomatic})`,
        { metrics, report_saved: false }
      );
    }
    
    // Save detailed report
    this.saveComplexityReport(report, filePath);
    
    const highSeverityCount = issues.filter(i => i.severity === 'high').length;
    const message = highSeverityCount > 0
      ? `⚠️ Found ${highSeverityCount} high complexity issues`
      : `⚠️ Code complexity could be improved`;
    
    return this.createWarningResult(message, {
      metrics,
      issues: issues.slice(0, 5),
      suggestions: suggestions.slice(0, 3),
      report_saved: true
    });
  }

  generateRefactoringSuggestions(func) {
    const suggestions = [];
    
    if (func.cyclomatic > 20) {
      suggestions.push(
        `Consider breaking down '${func.name}' into smaller functions`,
        `Extract complex conditions in '${func.name}' into well-named variables`,
        `Use early returns in '${func.name}' to reduce nesting`
      );
    } else if (func.cyclomatic > 10) {
      suggestions.push(
        `Consider simplifying '${func.name}' by extracting helper functions`,
        `Replace nested if-else in '${func.name}' with guard clauses`
      );
    }
    
    if (func.length > 50) {
      suggestions.push(
        `Function '${func.name}' is ${func.length} lines long - consider splitting`
      );
    }
    
    return suggestions;
  }

  generateComplexityReport(metrics, issues, suggestions, filePath) {
    return {
      file: this.getRelativePath(filePath),
      timestamp: new Date().toISOString(),
      agent: this.context.activeAgent,
      summary: {
        cyclomatic_complexity: metrics.cyclomatic,
        cognitive_complexity: metrics.cognitive,
        maintainability_index: metrics.maintainability,
        total_lines: metrics.totalLines,
        code_lines: metrics.codeLines,
        function_count: metrics.functions.length,
        class_count: metrics.classes.length
      },
      functions: metrics.functions,
      classes: metrics.classes,
      issues,
      suggestions,
      thresholds: {
        cyclomatic: this.config.complexity_threshold,
        maintainability: 50
      }
    };
  }

  saveComplexityReport(report, filePath) {
    const reportDir = path.join(
      this.projectRoot,
      'project-documents/implementation/testing/complexity-reports'
    );
    
    this.ensureDirectoryExists(reportDir);
    
    const filename = `${path.basename(filePath)}-complexity-${Date.now()}.json`;
    const reportPath = path.join(reportDir, filename);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }
}

// Execute if run directly
if (require.main === module) {
  const monitor = new CodeComplexityMonitor();
  monitor.run()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = CodeComplexityMonitor;