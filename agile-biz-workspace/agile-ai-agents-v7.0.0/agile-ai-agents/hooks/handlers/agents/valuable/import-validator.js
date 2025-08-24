const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs-extra');
const path = require('path');

/**
 * Import Validator Hook
 * Validates imports, checks for circular dependencies, unused imports, and missing modules
 */
class ImportValidator extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'import-validator',
      agent: 'coder_agent',
      category: 'valuable',
      impact: 'medium', // Needs to analyze multiple files
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      ...config
    });

    this.importPatterns = {
      es6Import: /import\s+(?:(?:\{[^}]*\})|(?:\*\s+as\s+\w+)|(?:\w+))?\s*(?:,\s*(?:\{[^}]*\}|\w+))?\s*from\s*['"`]([^'"`]+)['"`]/g,
      commonJsRequire: /(?:const|let|var)\s+(?:\{[^}]*\}|\w+)\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      dynamicImport: /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    };

    this.builtinModules = new Set([
      'fs', 'path', 'http', 'https', 'crypto', 'util', 'stream',
      'events', 'child_process', 'cluster', 'os', 'url', 'querystring',
      'assert', 'buffer', 'process', 'console', 'zlib', 'net'
    ]);
  }

  async handle(context) {
    const { filePath, content, action, projectPath } = context;

    if (!['created', 'modified'].includes(action)) {
      return { skipped: true, reason: 'Not a file modification' };
    }

    const ext = path.extname(filePath);
    if (!['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(ext)) {
      return { skipped: true, reason: 'Not a JavaScript/TypeScript file' };
    }

    const issues = [];
    const imports = this.extractImports(content);
    
    // Check each import
    for (const imp of imports) {
      const importIssues = await this.validateImport(imp, filePath, projectPath);
      issues.push(...importIssues);
    }

    // Check for unused imports
    const unusedImports = this.findUnusedImports(imports, content);
    issues.push(...unusedImports);

    // Check for circular dependencies
    const circularDeps = await this.checkCircularDependencies(filePath, imports, projectPath);
    issues.push(...circularDeps);

    return {
      success: true,
      issues: issues.length,
      imports: imports.length,
      problems: issues,
      blocked: issues.some(i => i.severity === 'error'),
      message: this.generateMessage(issues)
    };
  }

  extractImports(content) {
    const imports = [];
    
    // ES6 imports
    let match;
    const es6Regex = new RegExp(this.importPatterns.es6Import);
    while ((match = es6Regex.exec(content)) !== null) {
      const importStatement = match[0];
      const source = match[1];
      
      // Parse what's being imported
      const namedImports = this.parseNamedImports(importStatement);
      const defaultImport = this.parseDefaultImport(importStatement);
      const namespaceImport = this.parseNamespaceImport(importStatement);
      
      imports.push({
        type: 'es6',
        source,
        line: content.substring(0, match.index).split('\n').length,
        statement: importStatement,
        named: namedImports,
        default: defaultImport,
        namespace: namespaceImport
      });
    }
    
    // CommonJS requires
    const requireRegex = new RegExp(this.importPatterns.commonJsRequire);
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push({
        type: 'commonjs',
        source: match[1],
        line: content.substring(0, match.index).split('\n').length,
        statement: match[0]
      });
    }
    
    // Dynamic imports
    const dynamicRegex = new RegExp(this.importPatterns.dynamicImport);
    while ((match = dynamicRegex.exec(content)) !== null) {
      imports.push({
        type: 'dynamic',
        source: match[1],
        line: content.substring(0, match.index).split('\n').length,
        statement: match[0]
      });
    }
    
    return imports;
  }

  parseNamedImports(statement) {
    const match = statement.match(/\{([^}]+)\}/);
    if (!match) return [];
    
    return match[1].split(',').map(imp => {
      const parts = imp.trim().split(/\s+as\s+/);
      return {
        imported: parts[0].trim(),
        local: parts[1]?.trim() || parts[0].trim()
      };
    });
  }

  parseDefaultImport(statement) {
    const match = statement.match(/import\s+(\w+)\s+from/);
    return match ? match[1] : null;
  }

  parseNamespaceImport(statement) {
    const match = statement.match(/import\s+\*\s+as\s+(\w+)\s+from/);
    return match ? match[1] : null;
  }

  async validateImport(imp, filePath, projectPath) {
    const issues = [];
    
    // Check if module exists
    const moduleExists = await this.checkModuleExists(imp.source, filePath, projectPath);
    if (!moduleExists.exists) {
      issues.push({
        type: 'missing-module',
        severity: 'error',
        line: imp.line,
        module: imp.source,
        message: `Cannot find module '${imp.source}'`,
        suggestion: moduleExists.suggestion
      });
    }
    
    // Check for relative imports that could use aliases
    if (imp.source.startsWith('../../../')) {
      issues.push({
        type: 'deep-relative-import',
        severity: 'warning',
        line: imp.line,
        module: imp.source,
        message: 'Consider using path aliases for deep imports',
        suggestion: 'Configure module aliases in your build tool'
      });
    }
    
    // Check for importing from node_modules directly
    if (imp.source.includes('node_modules/')) {
      issues.push({
        type: 'direct-node-modules-import',
        severity: 'error',
        line: imp.line,
        module: imp.source,
        message: 'Never import from node_modules directly',
        suggestion: `Use '${imp.source.split('node_modules/')[1]}'`
      });
    }
    
    // Check for missing file extensions in relative imports (for ESM)
    if (imp.type === 'es6' && imp.source.startsWith('.') && !path.extname(imp.source)) {
      const withExtension = await this.findFileWithExtension(imp.source, filePath, projectPath);
      if (withExtension && this.config.requireExtensions) {
        issues.push({
          type: 'missing-file-extension',
          severity: 'warning',
          line: imp.line,
          module: imp.source,
          message: 'ESM imports should include file extension',
          suggestion: `${imp.source}${withExtension}`
        });
      }
    }
    
    return issues;
  }

  async checkModuleExists(source, filePath, projectPath) {
    // Built-in module
    if (this.builtinModules.has(source)) {
      return { exists: true };
    }
    
    // Node module
    if (!source.startsWith('.') && !source.startsWith('/')) {
      const packageJsonPath = path.join(projectPath, 'package.json');
      try {
        const packageJson = await fs.readJSON(packageJsonPath);
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        };
        
        const packageName = source.split('/')[0];
        if (deps[packageName]) {
          return { exists: true };
        }
        
        return {
          exists: false,
          suggestion: `Run 'npm install ${packageName}' or add to package.json`
        };
      } catch (error) {
        return { exists: true }; // Assume it exists if we can't check
      }
    }
    
    // Relative import
    const resolvedPath = path.resolve(path.dirname(filePath), source);
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs'];
    
    // Check exact path
    if (await fs.pathExists(resolvedPath)) {
      return { exists: true };
    }
    
    // Check with extensions
    for (const ext of extensions) {
      if (await fs.pathExists(resolvedPath + ext)) {
        return { exists: true };
      }
    }
    
    // Check if it's a directory with index file
    for (const indexFile of ['index.js', 'index.jsx', 'index.ts', 'index.tsx']) {
      if (await fs.pathExists(path.join(resolvedPath, indexFile))) {
        return { exists: true };
      }
    }
    
    return {
      exists: false,
      suggestion: `File not found: ${source}`
    };
  }

  async findFileWithExtension(source, filePath, projectPath) {
    const resolvedPath = path.resolve(path.dirname(filePath), source);
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
    
    for (const ext of extensions) {
      if (await fs.pathExists(resolvedPath + ext)) {
        return ext;
      }
    }
    
    return null;
  }

  findUnusedImports(imports, content) {
    const issues = [];
    
    imports.forEach(imp => {
      // Skip dynamic imports as they might be conditionally used
      if (imp.type === 'dynamic') return;
      
      let used = false;
      
      // Check default import
      if (imp.default && content.includes(imp.default)) {
        used = true;
      }
      
      // Check namespace import
      if (imp.namespace && content.includes(imp.namespace)) {
        used = true;
      }
      
      // Check named imports
      if (imp.named) {
        imp.named.forEach(({ local }) => {
          if (content.includes(local)) {
            used = true;
          }
        });
      }
      
      if (!used && !this.isSpecialImport(imp.source)) {
        issues.push({
          type: 'unused-import',
          severity: 'warning',
          line: imp.line,
          module: imp.source,
          message: `Import '${imp.source}' is not used`,
          suggestion: 'Remove unused import'
        });
      }
    });
    
    return issues;
  }

  isSpecialImport(source) {
    // Some imports have side effects and shouldn't be removed
    const sideEffectPatterns = [
      /\.css$/,
      /\.scss$/,
      /\.less$/,
      /polyfill/,
      /^core-js/,
      /^regenerator-runtime/
    ];
    
    return sideEffectPatterns.some(pattern => pattern.test(source));
  }

  async checkCircularDependencies(filePath, imports, projectPath, visited = new Set()) {
    const issues = [];
    
    if (visited.has(filePath)) {
      return [{
        type: 'circular-dependency',
        severity: 'error',
        message: `Circular dependency detected: ${Array.from(visited).join(' → ')} → ${filePath}`,
        chain: Array.from(visited)
      }];
    }
    
    visited.add(filePath);
    
    // Limited depth to prevent performance issues
    if (visited.size > 5) {
      return issues;
    }
    
    // Check each import
    for (const imp of imports) {
      if (!imp.source.startsWith('.')) continue; // Only check relative imports
      
      const resolvedPath = await this.resolveImportPath(imp.source, filePath, projectPath);
      if (resolvedPath && await fs.pathExists(resolvedPath)) {
        try {
          const content = await fs.readFile(resolvedPath, 'utf8');
          const subImports = this.extractImports(content);
          const subIssues = await this.checkCircularDependencies(
            resolvedPath,
            subImports,
            projectPath,
            new Set(visited)
          );
          issues.push(...subIssues);
        } catch (error) {
          // Ignore read errors
        }
      }
    }
    
    return issues;
  }

  async resolveImportPath(source, fromFile, projectPath) {
    const resolved = path.resolve(path.dirname(fromFile), source);
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    // Try exact path
    if (await fs.pathExists(resolved)) {
      return resolved;
    }
    
    // Try with extensions
    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (await fs.pathExists(withExt)) {
        return withExt;
      }
    }
    
    // Try index files
    for (const indexFile of ['index.js', 'index.jsx', 'index.ts', 'index.tsx']) {
      const indexPath = path.join(resolved, indexFile);
      if (await fs.pathExists(indexPath)) {
        return indexPath;
      }
    }
    
    return null;
  }

  generateMessage(issues) {
    if (issues.length === 0) {
      return '✅ All imports are valid and properly structured';
    }
    
    const byType = {};
    issues.forEach(issue => {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });
    
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    
    return `⚠️ Import validation found ${errors} errors, ${warnings} warnings`;
  }

  getDescription() {
    return 'Validates imports, checks for circular dependencies and missing modules';
  }

  getConfigurableOptions() {
    return {
      requireExtensions: {
        type: 'boolean',
        default: false,
        description: 'Require file extensions in imports (ESM)'
      },
      aliasConfig: {
        type: 'object',
        default: {},
        description: 'Path alias configuration'
      },
      maxImportDepth: {
        type: 'number',
        default: 3,
        description: 'Maximum relative import depth before warning'
      },
      checkCircular: {
        type: 'boolean',
        default: true,
        description: 'Check for circular dependencies'
      }
    };
  }
}

module.exports = ImportValidator;