const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs').promises;
const path = require('path');

class ComplexityAnalyzerHook extends BaseAgentHook {
  constructor() {
    super({
      name: 'complexity-analyzer',
      description: 'Analyzes cyclomatic complexity and suggests refactoring',
      events: ['file.modified', 'analysis.requested', 'pre-commit'],
      performanceImpact: 'medium',
      cacheTTL: 1800000, // Cache for 30 minutes
      warningThreshold: 3000,
      disableThreshold: 5000
    });
    
    this.complexityThresholds = {
      low: 5,      // Simple, easy to test
      medium: 10,  // Moderate complexity
      high: 15,    // Complex, needs refactoring
      critical: 20 // Very complex, must refactor
    };
  }

  async handle(data) {
    const { filePath, eventType } = data;
    
    if (!filePath) {
      return { analyzed: false, message: 'No file path provided' };
    }
    
    const ext = path.extname(filePath).toLowerCase();
    if (!['.js', '.jsx', '.ts', '.tsx', '.py'].includes(ext)) {
      return {
        analyzed: false,
        message: `Complexity analysis not supported for ${ext} files`
      };
    }
    
    try {
      // Check cache
      const cacheKey = `complexity:${filePath}`;
      const cached = this.cache.get(cacheKey);
      if (cached && eventType !== 'analysis.requested') {
        return cached;
      }
      
      const content = await fs.readFile(filePath, 'utf8');
      const analysis = this.analyzeComplexity(content, ext);
      
      const result = {
        analyzed: true,
        filePath,
        complexity: analysis,
        suggestions: this.generateSuggestions(analysis),
        refactoringPriority: this.calculateRefactoringPriority(analysis)
      };
      
      // Cache results
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      return {
        analyzed: false,
        error: error.message,
        message: `Failed to analyze complexity for ${path.basename(filePath)}`
      };
    }
  }

  analyzeComplexity(content, ext) {
    const isJavaScript = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
    const isPython = ext === '.py';
    
    if (isJavaScript) {
      return this.analyzeJavaScriptComplexity(content);
    } else if (isPython) {
      return this.analyzePythonComplexity(content);
    }
    
    return { functions: [], classes: [], overall: { score: 0 } };
  }

  analyzeJavaScriptComplexity(content) {
    const functions = [];
    const classes = [];
    let overallComplexity = 1; // Base complexity
    
    // Function patterns
    const functionPatterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*{/g,
      /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*{/g,
      /(\w+)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>\s*{/g,
      /(\w+)\s*\([^)]*\)\s*{/g // Method shorthand
    ];
    
    // Find all functions
    for (const pattern of functionPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const functionName = match[1];
        const startIndex = match.index;
        const functionBody = this.extractFunctionBody(content, startIndex);
        const complexity = this.calculateCyclomaticComplexity(functionBody);
        
        functions.push({
          name: functionName,
          complexity,
          line: this.getLineNumber(content, startIndex),
          level: this.getComplexityLevel(complexity)
        });
        
        overallComplexity += complexity - 1;
      }
    }
    
    // Class analysis
    const classPattern = /class\s+(\w+)/g;
    const classMatches = content.matchAll(classPattern);
    
    for (const match of classMatches) {
      const className = match[1];
      const startIndex = match.index;
      const classBody = this.extractClassBody(content, startIndex);
      const methods = this.analyzeClassMethods(classBody);
      
      let classComplexity = 1;
      methods.forEach(method => {
        classComplexity += method.complexity - 1;
      });
      
      classes.push({
        name: className,
        complexity: classComplexity,
        methods,
        line: this.getLineNumber(content, startIndex),
        level: this.getComplexityLevel(classComplexity)
      });
    }
    
    // Calculate metrics
    const totalFunctions = functions.length + classes.reduce((sum, c) => sum + c.methods.length, 0);
    const avgComplexity = totalFunctions > 0 ? 
      Math.round(overallComplexity / totalFunctions) : 0;
    
    return {
      functions,
      classes,
      overall: {
        score: overallComplexity,
        average: avgComplexity,
        level: this.getComplexityLevel(avgComplexity),
        highComplexityCount: functions.filter(f => f.complexity > this.complexityThresholds.high).length +
                             classes.filter(c => c.complexity > this.complexityThresholds.high).length
      }
    };
  }

  analyzePythonComplexity(content) {
    const functions = [];
    const classes = [];
    let overallComplexity = 1;
    
    // Function pattern
    const functionPattern = /def\s+(\w+)\s*\([^)]*\)\s*:/g;
    const functionMatches = content.matchAll(functionPattern);
    
    for (const match of functionMatches) {
      const functionName = match[1];
      const startIndex = match.index;
      const functionBody = this.extractPythonFunctionBody(content, startIndex);
      const complexity = this.calculateCyclomaticComplexity(functionBody);
      
      functions.push({
        name: functionName,
        complexity,
        line: this.getLineNumber(content, startIndex),
        level: this.getComplexityLevel(complexity)
      });
      
      overallComplexity += complexity - 1;
    }
    
    // Class analysis
    const classPattern = /class\s+(\w+)/g;
    const classMatches = content.matchAll(classPattern);
    
    for (const match of classMatches) {
      const className = match[1];
      const startIndex = match.index;
      const classBody = this.extractPythonClassBody(content, startIndex);
      const methods = this.analyzePythonClassMethods(classBody);
      
      let classComplexity = 1;
      methods.forEach(method => {
        classComplexity += method.complexity - 1;
      });
      
      classes.push({
        name: className,
        complexity: classComplexity,
        methods,
        line: this.getLineNumber(content, startIndex),
        level: this.getComplexityLevel(classComplexity)
      });
    }
    
    const totalFunctions = functions.length + classes.reduce((sum, c) => sum + c.methods.length, 0);
    const avgComplexity = totalFunctions > 0 ? 
      Math.round(overallComplexity / totalFunctions) : 0;
    
    return {
      functions,
      classes,
      overall: {
        score: overallComplexity,
        average: avgComplexity,
        level: this.getComplexityLevel(avgComplexity),
        highComplexityCount: functions.filter(f => f.complexity > this.complexityThresholds.high).length +
                             classes.filter(c => c.complexity > this.complexityThresholds.high).length
      }
    };
  }

  calculateCyclomaticComplexity(code) {
    let complexity = 1; // Base complexity
    
    // Patterns that increase complexity
    const complexityPatterns = [
      /\bif\b/g,
      /\belif\b|\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\bexcept\b/g,
      /\?\s*[^:]+\s*:/g, // Ternary operator
      /\&\&/g, // Logical AND
      /\|\|/g, // Logical OR
      /\?\?/g  // Nullish coalescing
    ];
    
    for (const pattern of complexityPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  extractFunctionBody(content, startIndex) {
    let braceCount = 0;
    let inFunction = false;
    let functionBody = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
      }
      
      if (inFunction) {
        functionBody += char;
        
        if (braceCount === 0) {
          break;
        }
      }
    }
    
    return functionBody;
  }

  extractClassBody(content, startIndex) {
    // Similar to extractFunctionBody but for classes
    return this.extractFunctionBody(content, startIndex);
  }

  extractPythonFunctionBody(content, startIndex) {
    const lines = content.split('\n');
    const startLine = this.getLineNumber(content, startIndex) - 1;
    let functionBody = '';
    
    // Get indentation level
    const baseIndent = lines[startLine].match(/^\s*/)[0].length;
    
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      const currentIndent = line.match(/^\s*/)[0].length;
      
      // Stop when we reach same or lower indentation (unless empty line)
      if (line.trim() && currentIndent <= baseIndent) {
        break;
      }
      
      functionBody += line + '\n';
    }
    
    return functionBody;
  }

  extractPythonClassBody(content, startIndex) {
    // Similar to extractPythonFunctionBody
    return this.extractPythonFunctionBody(content, startIndex);
  }

  analyzeClassMethods(classBody) {
    const methods = [];
    const methodPattern = /(\w+)\s*\([^)]*\)\s*{/g;
    const matches = classBody.matchAll(methodPattern);
    
    for (const match of matches) {
      const methodName = match[1];
      if (methodName === 'constructor') continue; // Skip constructor complexity
      
      const methodBody = this.extractFunctionBody(classBody, match.index);
      const complexity = this.calculateCyclomaticComplexity(methodBody);
      
      methods.push({
        name: methodName,
        complexity,
        level: this.getComplexityLevel(complexity)
      });
    }
    
    return methods;
  }

  analyzePythonClassMethods(classBody) {
    const methods = [];
    const methodPattern = /def\s+(\w+)\s*\([^)]*\)\s*:/g;
    const matches = classBody.matchAll(methodPattern);
    
    for (const match of matches) {
      const methodName = match[1];
      if (methodName === '__init__') continue; // Skip constructor
      
      const methodBody = this.extractPythonFunctionBody(classBody, match.index);
      const complexity = this.calculateCyclomaticComplexity(methodBody);
      
      methods.push({
        name: methodName,
        complexity,
        level: this.getComplexityLevel(complexity)
      });
    }
    
    return methods;
  }

  getComplexityLevel(score) {
    if (score <= this.complexityThresholds.low) return 'low';
    if (score <= this.complexityThresholds.medium) return 'medium';
    if (score <= this.complexityThresholds.high) return 'high';
    return 'critical';
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  generateSuggestions(analysis) {
    const suggestions = [];
    const { functions, classes, overall } = analysis;
    
    // Overall suggestions
    if (overall.average > this.complexityThresholds.medium) {
      suggestions.push('Consider breaking down complex functions into smaller, focused functions');
    }
    
    if (overall.highComplexityCount > 3) {
      suggestions.push(`${overall.highComplexityCount} functions have high complexity and should be refactored`);
    }
    
    // Function-specific suggestions
    const criticalFunctions = functions.filter(f => f.level === 'critical');
    if (criticalFunctions.length > 0) {
      suggestions.push(`Critical complexity in: ${criticalFunctions.map(f => f.name).join(', ')}`);
    }
    
    // Class-specific suggestions
    const complexClasses = classes.filter(c => c.level === 'high' || c.level === 'critical');
    if (complexClasses.length > 0) {
      suggestions.push(`Consider splitting classes: ${complexClasses.map(c => c.name).join(', ')}`);
    }
    
    // Pattern-based suggestions
    const highComplexityFunctions = functions.filter(f => f.complexity > this.complexityThresholds.high);
    for (const func of highComplexityFunctions) {
      if (func.complexity > 25) {
        suggestions.push(`${func.name}: Extract conditional logic into separate functions`);
      } else if (func.complexity > 20) {
        suggestions.push(`${func.name}: Consider using strategy pattern or lookup tables`);
      } else {
        suggestions.push(`${func.name}: Break down into smaller functions`);
      }
    }
    
    return suggestions;
  }

  calculateRefactoringPriority(analysis) {
    const { overall, functions, classes } = analysis;
    
    // Priority scoring
    let priorityScore = 0;
    
    // Overall complexity contribution
    if (overall.average > this.complexityThresholds.high) {
      priorityScore += 30;
    } else if (overall.average > this.complexityThresholds.medium) {
      priorityScore += 15;
    }
    
    // Critical functions contribution
    const criticalCount = functions.filter(f => f.level === 'critical').length +
                         classes.filter(c => c.level === 'critical').length;
    priorityScore += criticalCount * 20;
    
    // High complexity contribution
    priorityScore += overall.highComplexityCount * 10;
    
    // Determine priority level
    if (priorityScore >= 80) return 'immediate';
    if (priorityScore >= 50) return 'high';
    if (priorityScore >= 30) return 'medium';
    if (priorityScore >= 15) return 'low';
    return 'none';
  }

  getConfig() {
    return {
      ...super.getConfig(),
      thresholds: this.complexityThresholds,
      supportedLanguages: ['javascript', 'typescript', 'python'],
      includeMethodComplexity: true,
      ignorePatterns: ['test', 'spec', 'mock']
    };
  }
}

module.exports = ComplexityAnalyzerHook;