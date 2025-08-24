const BaseAgentHook = require('../../shared/base-agent-hook');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

class DeadCodeDetectorHook extends BaseAgentHook {
  constructor() {
    super({
      name: 'dead-code-detector',
      description: 'Detects unused code, imports, and exports',
      events: ['file.modified', 'analysis.requested', 'pre-commit'],
      performanceImpact: 'high',
      cacheTTL: 3600000, // Cache for 1 hour
      warningThreshold: 5000,
      disableThreshold: 10000
    });
    
    this.patterns = {
      javascript: {
        unusedImports: /import\s+(?:{[^}]+}|[\w\s,]+)\s+from\s+['"][^'"]+['"]/g,
        unusedVariables: /(?:const|let|var)\s+(\w+)\s*=/g,
        unusedFunctions: /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g,
        unusedClasses: /class\s+(\w+)/g,
        exports: /export\s+(?:default\s+)?(?:{[^}]+}|[\w\s,]+)/g
      },
      typescript: {
        unusedImports: /import\s+(?:type\s+)?(?:{[^}]+}|[\w\s,]+)\s+from\s+['"][^'"]+['"]/g,
        unusedTypes: /(?:type|interface)\s+(\w+)/g,
        unusedEnums: /enum\s+(\w+)/g
      },
      python: {
        unusedImports: /(?:from\s+[\w.]+\s+)?import\s+[\w\s,]+/g,
        unusedVariables: /(\w+)\s*=/g,
        unusedFunctions: /def\s+(\w+)\s*\(/g,
        unusedClasses: /class\s+(\w+)/g
      }
    };
  }

  async handle(data) {
    const { filePath, projectPath, eventType } = data;
    
    if (!filePath) {
      return { 
        analyzed: false, 
        message: 'No file path provided' 
      };
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const language = this.detectLanguage(ext);
    
    if (!language) {
      return {
        analyzed: false,
        message: `Unsupported file type: ${ext}`
      };
    }
    
    try {
      // Check if we have cached results
      const cacheKey = `dead-code:${filePath}`;
      const cached = this.cache.get(cacheKey);
      if (cached && eventType !== 'analysis.requested') {
        return cached;
      }
      
      const content = await fs.readFile(filePath, 'utf8');
      const analysis = await this.analyzeFile(content, filePath, language, projectPath);
      
      const result = {
        analyzed: true,
        filePath,
        language,
        deadCode: analysis.deadCode,
        stats: {
          totalItems: analysis.totalItems,
          unusedItems: analysis.unusedItems,
          deadCodePercentage: analysis.deadCodePercentage
        },
        suggestions: analysis.suggestions
      };
      
      // Cache the results
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      return {
        analyzed: false,
        error: error.message,
        message: `Failed to analyze ${path.basename(filePath)}`
      };
    }
  }

  detectLanguage(ext) {
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.mjs': 'javascript',
      '.cjs': 'javascript'
    };
    
    return languageMap[ext];
  }

  async analyzeFile(content, filePath, language, projectPath) {
    const deadCode = {
      unusedImports: [],
      unusedVariables: [],
      unusedFunctions: [],
      unusedClasses: [],
      unusedExports: []
    };
    
    const patterns = this.patterns[language];
    if (!patterns) {
      return { deadCode, totalItems: 0, unusedItems: 0, deadCodePercentage: 0, suggestions: [] };
    }
    
    // Extract all declarations
    const declarations = this.extractDeclarations(content, patterns, language);
    
    // Find usages
    const usages = this.findUsages(content, declarations);
    
    // Identify unused items
    for (const [type, items] of Object.entries(declarations)) {
      for (const item of items) {
        if (!usages.has(item.name) && !this.isExported(item, content)) {
          deadCode[type].push({
            name: item.name,
            line: item.line,
            column: item.column
          });
        }
      }
    }
    
    // Special handling for imports
    if (language === 'javascript' || language === 'typescript') {
      deadCode.unusedImports = await this.findUnusedImports(content, filePath);
    }
    
    // Calculate statistics
    const totalItems = Object.values(declarations).reduce((sum, items) => sum + items.length, 0);
    const unusedItems = Object.values(deadCode).reduce((sum, items) => sum + items.length, 0);
    const deadCodePercentage = totalItems > 0 ? Math.round((unusedItems / totalItems) * 100) : 0;
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(deadCode, deadCodePercentage);
    
    return {
      deadCode,
      totalItems,
      unusedItems,
      deadCodePercentage,
      suggestions
    };
  }

  extractDeclarations(content, patterns, language) {
    const declarations = {
      unusedVariables: [],
      unusedFunctions: [],
      unusedClasses: []
    };
    
    const lines = content.split('\n');
    
    // Extract variables
    if (patterns.unusedVariables) {
      const matches = content.matchAll(patterns.unusedVariables);
      for (const match of matches) {
        const name = match[1];
        if (name && !this.isBuiltIn(name, language)) {
          const line = this.getLineNumber(content, match.index);
          declarations.unusedVariables.push({
            name,
            line,
            column: match.index - content.lastIndexOf('\n', match.index) - 1
          });
        }
      }
    }
    
    // Extract functions
    if (patterns.unusedFunctions) {
      const matches = content.matchAll(patterns.unusedFunctions);
      for (const match of matches) {
        const name = match[1] || match[2];
        if (name && !this.isBuiltIn(name, language)) {
          const line = this.getLineNumber(content, match.index);
          declarations.unusedFunctions.push({
            name,
            line,
            column: match.index - content.lastIndexOf('\n', match.index) - 1
          });
        }
      }
    }
    
    // Extract classes
    if (patterns.unusedClasses) {
      const matches = content.matchAll(patterns.unusedClasses);
      for (const match of matches) {
        const name = match[1];
        if (name) {
          const line = this.getLineNumber(content, match.index);
          declarations.unusedClasses.push({
            name,
            line,
            column: match.index - content.lastIndexOf('\n', match.index) - 1
          });
        }
      }
    }
    
    return declarations;
  }

  findUsages(content, declarations) {
    const usages = new Set();
    const allNames = new Set();
    
    // Collect all declared names
    for (const items of Object.values(declarations)) {
      for (const item of items) {
        allNames.add(item.name);
      }
    }
    
    // Find usages of each name
    for (const name of allNames) {
      // Create regex to find uses (not declarations)
      const useRegex = new RegExp(`\\b${name}\\b`, 'g');
      const matches = content.matchAll(useRegex);
      
      let usageCount = 0;
      for (const match of matches) {
        // Check if this is not the declaration itself
        const beforeMatch = content.substring(Math.max(0, match.index - 20), match.index);
        const afterMatch = content.substring(match.index + name.length, match.index + name.length + 10);
        
        // Skip if this looks like a declaration
        if (beforeMatch.match(/(?:const|let|var|function|class|def)\s+$/) ||
            beforeMatch.match(/import\s+(?:{[^}]*)?$/) ||
            afterMatch.match(/^\s*=/)) {
          continue;
        }
        
        usageCount++;
      }
      
      if (usageCount > 0) {
        usages.add(name);
      }
    }
    
    return usages;
  }

  async findUnusedImports(content, filePath) {
    const unusedImports = [];
    const importRegex = /import\s+(?:type\s+)?(?:(\w+)|{([^}]+)}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    
    const matches = content.matchAll(importRegex);
    for (const match of matches) {
      const defaultImport = match[1];
      const namedImports = match[2];
      const namespaceImport = match[3];
      const line = this.getLineNumber(content, match.index);
      
      if (defaultImport && !this.isUsedInCode(defaultImport, content, match.index)) {
        unusedImports.push({
          name: defaultImport,
          line,
          type: 'default'
        });
      }
      
      if (namedImports) {
        const names = namedImports.split(',').map(n => n.trim().split(/\s+as\s+/)[0]);
        for (const name of names) {
          if (!this.isUsedInCode(name, content, match.index)) {
            unusedImports.push({
              name,
              line,
              type: 'named'
            });
          }
        }
      }
      
      if (namespaceImport && !this.isUsedInCode(namespaceImport, content, match.index)) {
        unusedImports.push({
          name: namespaceImport,
          line,
          type: 'namespace'
        });
      }
    }
    
    return unusedImports;
  }

  isUsedInCode(name, content, afterIndex) {
    const useRegex = new RegExp(`\\b${name}\\b`, 'g');
    const remainingContent = content.substring(afterIndex + 100); // Skip the import statement
    return useRegex.test(remainingContent);
  }

  isExported(item, content) {
    // Check if the item is exported
    const exportRegex = new RegExp(`export\\s+(?:default\\s+)?(?:{[^}]*\\b${item.name}\\b[^}]*}|\\b${item.name}\\b)`);
    return exportRegex.test(content);
  }

  isBuiltIn(name, language) {
    const builtIns = {
      javascript: ['console', 'window', 'document', 'global', 'process', 'require', 'module', 'exports'],
      typescript: ['console', 'window', 'document', 'global', 'process', 'require', 'module', 'exports'],
      python: ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set']
    };
    
    return builtIns[language]?.includes(name) || false;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  generateSuggestions(deadCode, percentage) {
    const suggestions = [];
    
    if (percentage > 30) {
      suggestions.push('Consider removing unused code to improve maintainability');
    }
    
    if (deadCode.unusedImports.length > 5) {
      suggestions.push('Many unused imports detected - run an import cleaner');
    }
    
    if (deadCode.unusedFunctions.length > 0) {
      suggestions.push('Remove unused functions or mark them for future use');
    }
    
    if (deadCode.unusedClasses.length > 0) {
      suggestions.push('Unused classes may indicate incomplete refactoring');
    }
    
    return suggestions;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      supportedLanguages: ['javascript', 'typescript', 'python'],
      thresholds: {
        warning: 20, // Warn if >20% dead code
        error: 40    // Error if >40% dead code
      },
      ignorePatterns: ['test', 'spec', 'mock'],
      checkExports: true
    };
  }
}

module.exports = DeadCodeDetectorHook;