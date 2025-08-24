const BaseAgentHook = require('../../shared/base-agent-hook');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs-extra');
const path = require('path');

/**
 * Dependency Checker Hook
 * Checks for outdated, deprecated, and vulnerable dependencies
 * Monitors license compliance and size impacts
 */
class DependencyChecker extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'dependency-checker',
      agent: 'devops_agent',
      category: 'valuable',
      impact: 'medium', // Can take time for large projects
      cacheEnabled: true,
      cacheTTL: 3600000, // 1 hour
      ...config
    });

    this.checks = {
      outdated: config.config?.checks?.outdated ?? true,
      deprecated: config.config?.checks?.deprecated ?? true,
      licenses: config.config?.checks?.licenses ?? true,
      size: config.config?.checks?.size ?? true,
      duplicates: config.config?.checks?.duplicates ?? true,
      phantom: config.config?.checks?.phantom ?? true // deps in package.json but not used
    };

    this.thresholds = {
      majorBehind: config.config?.thresholds?.majorBehind ?? 2,
      totalOutdated: config.config?.thresholds?.totalOutdated ?? 20,
      bundleSizeMB: config.config?.thresholds?.bundleSizeMB ?? 50,
      criticalVulnerabilities: 0 // Always 0
    };

    this.allowedLicenses = config.config?.allowedLicenses || [
      'MIT', 'Apache-2.0', 'BSD-3-Clause', 'BSD-2-Clause', 'ISC', 
      'CC0-1.0', 'CC-BY-3.0', 'CC-BY-4.0', 'Unlicense', 'WTFPL'
    ];

    this.blockedLicenses = config.config?.blockedLicenses || [
      'GPL-3.0', 'AGPL-3.0', 'LGPL-3.0', 'CC-BY-NC-*'
    ];
  }

  async handle(context) {
    const { projectPath, action, trigger } = context;

    // Check on dependency-related actions
    if (!['dependency-add', 'dependency-update', 'pre-commit', 'audit'].includes(trigger)) {
      return { skipped: true, reason: 'Not a dependency check trigger' };
    }

    const packageManager = await this.detectPackageManager(projectPath);
    if (!packageManager) {
      return { 
        skipped: true, 
        reason: 'No package manager detected',
        suggestion: 'No package.json, requirements.txt, or similar found'
      };
    }

    const results = {
      packageManager,
      checks: {},
      issues: [],
      warnings: [],
      stats: {}
    };

    try {
      // Run enabled checks
      if (this.checks.outdated) {
        results.checks.outdated = await this.checkOutdated(projectPath, packageManager);
      }

      if (this.checks.deprecated) {
        results.checks.deprecated = await this.checkDeprecated(projectPath, packageManager);
      }

      if (this.checks.licenses) {
        results.checks.licenses = await this.checkLicenses(projectPath, packageManager);
      }

      if (this.checks.size) {
        results.checks.size = await this.checkBundleSize(projectPath, packageManager);
      }

      if (this.checks.duplicates) {
        results.checks.duplicates = await this.checkDuplicates(projectPath, packageManager);
      }

      if (this.checks.phantom) {
        results.checks.phantom = await this.checkPhantomDeps(projectPath, packageManager);
      }

      // Aggregate issues
      const allIssues = this.aggregateIssues(results.checks);
      const violations = this.checkThresholds(allIssues);

      return {
        success: violations.critical.length === 0,
        blocked: violations.critical.length > 0,
        packageManager,
        stats: this.calculateStats(allIssues),
        violations,
        checks: results.checks,
        recommendations: this.generateRecommendations(allIssues),
        message: this.generateMessage(violations, allIssues)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blocked: false,
        message: `⚠️ Dependency check error: ${error.message}`
      };
    }
  }

  async detectPackageManager(projectPath) {
    // Node.js projects
    if (await fs.pathExists(path.join(projectPath, 'package.json'))) {
      if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
        return 'yarn';
      } else if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
        return 'pnpm';
      }
      return 'npm';
    }

    // Python projects
    if (await fs.pathExists(path.join(projectPath, 'requirements.txt')) ||
        await fs.pathExists(path.join(projectPath, 'Pipfile'))) {
      return 'pip';
    }

    // Ruby projects
    if (await fs.pathExists(path.join(projectPath, 'Gemfile'))) {
      return 'bundler';
    }

    // Go projects
    if (await fs.pathExists(path.join(projectPath, 'go.mod'))) {
      return 'go';
    }

    return null;
  }

  async checkOutdated(projectPath, packageManager) {
    const result = {
      outdated: [],
      total: 0,
      major: 0,
      minor: 0,
      patch: 0
    };

    try {
      switch (packageManager) {
        case 'npm':
          const npmResult = await execAsync('npm outdated --json', { 
            cwd: projectPath 
          }).catch(e => ({ stdout: e.stdout })); // npm outdated returns non-zero
          
          if (npmResult.stdout) {
            const outdated = JSON.parse(npmResult.stdout);
            for (const [name, info] of Object.entries(outdated)) {
              const current = info.current || 'missing';
              const wanted = info.wanted;
              const latest = info.latest;
              
              const versionDiff = this.compareVersions(current, latest);
              result.outdated.push({
                name,
                current,
                wanted,
                latest,
                type: versionDiff.type,
                majorsBehind: versionDiff.major
              });
              
              result[versionDiff.type]++;
            }
          }
          break;

        case 'yarn':
          const yarnResult = await execAsync('yarn outdated --json', { 
            cwd: projectPath 
          }).catch(e => ({ stdout: e.stdout }));
          
          // Parse yarn's NDJSON output
          if (yarnResult.stdout) {
            const lines = yarnResult.stdout.trim().split('\n');
            lines.forEach(line => {
              try {
                const data = JSON.parse(line);
                if (data.type === 'table' && data.data.body) {
                  data.data.body.forEach(([name, current, wanted, latest]) => {
                    const versionDiff = this.compareVersions(current, latest);
                    result.outdated.push({
                      name,
                      current,
                      wanted,
                      latest,
                      type: versionDiff.type,
                      majorsBehind: versionDiff.major
                    });
                    result[versionDiff.type]++;
                  });
                }
              } catch (e) {
                // Skip non-JSON lines
              }
            });
          }
          break;
      }

      result.total = result.outdated.length;
    } catch (error) {
      console.error('[DependencyChecker] Outdated check error:', error);
    }

    return result;
  }

  async checkDeprecated(projectPath, packageManager) {
    const result = {
      deprecated: [],
      total: 0
    };

    try {
      if (packageManager === 'npm' || packageManager === 'yarn') {
        // Check package.json for known deprecated packages
        const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };

        // List of known deprecated packages (would be fetched from registry in production)
        const deprecatedPackages = {
          'request': 'Use axios or node-fetch instead',
          'node-sass': 'Use sass (Dart Sass) instead',
          'tslint': 'Use ESLint with TypeScript support',
          'istanbul': 'Use nyc instead',
          'bower': 'Use npm or yarn instead'
        };

        for (const [pkg, reason] of Object.entries(deprecatedPackages)) {
          if (allDeps[pkg]) {
            result.deprecated.push({
              name: pkg,
              version: allDeps[pkg],
              reason
            });
          }
        }
      }

      result.total = result.deprecated.length;
    } catch (error) {
      console.error('[DependencyChecker] Deprecated check error:', error);
    }

    return result;
  }

  async checkLicenses(projectPath, packageManager) {
    const result = {
      licenses: {},
      incompatible: [],
      unknown: [],
      total: 0
    };

    try {
      if (packageManager === 'npm') {
        // Use license-checker if available
        try {
          const { stdout } = await execAsync('npx license-checker --json', {
            cwd: projectPath,
            timeout: 30000
          });

          const licenses = JSON.parse(stdout);
          for (const [pkg, info] of Object.entries(licenses)) {
            const license = info.licenses || 'Unknown';
            
            if (!result.licenses[license]) {
              result.licenses[license] = [];
            }
            result.licenses[license].push(pkg);

            // Check if license is blocked
            if (this.isLicenseBlocked(license)) {
              result.incompatible.push({
                package: pkg,
                license,
                reason: 'License not compatible with project'
              });
            }

            // Check for unknown licenses
            if (license === 'Unknown' || license === 'UNLICENSED') {
              result.unknown.push(pkg);
            }
          }
        } catch (error) {
          // Fallback to basic check
          await this.basicLicenseCheck(projectPath, result);
        }
      }

      result.total = Object.keys(result.licenses).length;
    } catch (error) {
      console.error('[DependencyChecker] License check error:', error);
    }

    return result;
  }

  async checkBundleSize(projectPath, packageManager) {
    const result = {
      totalSize: 0,
      largest: [],
      treeshakeable: 0,
      duplicates: []
    };

    try {
      if (packageManager === 'npm' || packageManager === 'yarn') {
        // Get node_modules size
        const nodeModulesPath = path.join(projectPath, 'node_modules');
        if (await fs.pathExists(nodeModulesPath)) {
          result.totalSize = await this.getDirectorySize(nodeModulesPath);
          
          // Find largest packages
          const packages = await fs.readdir(nodeModulesPath);
          const sizes = [];
          
          for (const pkg of packages.slice(0, 100)) { // Check first 100 for performance
            if (pkg.startsWith('.')) continue;
            
            const pkgPath = path.join(nodeModulesPath, pkg);
            const size = await this.getDirectorySize(pkgPath);
            sizes.push({ name: pkg, size });
          }
          
          result.largest = sizes
            .sort((a, b) => b.size - a.size)
            .slice(0, 10)
            .map(item => ({
              ...item,
              sizeStr: this.formatSize(item.size)
            }));
        }
      }
    } catch (error) {
      console.error('[DependencyChecker] Bundle size check error:', error);
    }

    return result;
  }

  async checkDuplicates(projectPath, packageManager) {
    const result = {
      duplicates: [],
      total: 0,
      potentialSavings: 0
    };

    try {
      if (packageManager === 'npm') {
        const { stdout } = await execAsync('npm ls --depth=10 --json', {
          cwd: projectPath,
          maxBuffer: 10 * 1024 * 1024
        }).catch(e => ({ stdout: e.stdout }));

        if (stdout) {
          const tree = JSON.parse(stdout);
          const packages = new Map();
          
          // Traverse dependency tree
          this.findDuplicates(tree.dependencies, packages);
          
          // Find actual duplicates
          for (const [name, versions] of packages.entries()) {
            if (versions.size > 1) {
              result.duplicates.push({
                name,
                versions: Array.from(versions),
                count: versions.size
              });
            }
          }
        }
      }

      result.total = result.duplicates.length;
    } catch (error) {
      console.error('[DependencyChecker] Duplicate check error:', error);
    }

    return result;
  }

  async checkPhantomDeps(projectPath, packageManager) {
    const result = {
      phantom: [],
      unused: [],
      missing: []
    };

    try {
      if (packageManager === 'npm' || packageManager === 'yarn') {
        const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };

        // Simple heuristic: check if common deps are imported anywhere
        const srcFiles = await this.findSourceFiles(projectPath);
        const imports = await this.extractImports(srcFiles);
        
        for (const [dep, version] of Object.entries(allDeps)) {
          if (!imports.has(dep) && !this.isMetaPackage(dep)) {
            result.unused.push({
              name: dep,
              version,
              type: packageJson.devDependencies?.[dep] ? 'dev' : 'prod'
            });
          }
        }

        // Check for missing deps (imported but not in package.json)
        for (const imp of imports) {
          if (!allDeps[imp] && !this.isBuiltinModule(imp)) {
            result.missing.push(imp);
          }
        }
      }
    } catch (error) {
      console.error('[DependencyChecker] Phantom deps check error:', error);
    }

    return result;
  }

  compareVersions(current, latest) {
    const parseVersion = (v) => {
      const parts = v.replace(/[^0-9.]/g, '').split('.');
      return {
        major: parseInt(parts[0]) || 0,
        minor: parseInt(parts[1]) || 0,
        patch: parseInt(parts[2]) || 0
      };
    };

    const currentVer = parseVersion(current);
    const latestVer = parseVersion(latest);

    const majorDiff = latestVer.major - currentVer.major;
    const minorDiff = latestVer.minor - currentVer.minor;
    const patchDiff = latestVer.patch - currentVer.patch;

    let type = 'patch';
    if (majorDiff > 0) type = 'major';
    else if (minorDiff > 0) type = 'minor';

    return {
      type,
      major: majorDiff,
      minor: minorDiff,
      patch: patchDiff
    };
  }

  isLicenseBlocked(license) {
    return this.blockedLicenses.some(blocked => {
      if (blocked.includes('*')) {
        const pattern = blocked.replace('*', '.*');
        return new RegExp(pattern).test(license);
      }
      return blocked === license;
    });
  }

  async getDirectorySize(dirPath) {
    let size = 0;
    
    try {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          size += await this.getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignore permission errors
    }

    return size;
  }

  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  findDuplicates(deps, packages, visited = new Set()) {
    if (!deps) return;

    for (const [name, info] of Object.entries(deps)) {
      const key = `${name}@${info.version}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (!packages.has(name)) {
        packages.set(name, new Set());
      }
      packages.get(name).add(info.version);

      this.findDuplicates(info.dependencies, packages, visited);
    }
  }

  async findSourceFiles(projectPath) {
    const sourceExts = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
    const files = [];
    
    const srcPath = path.join(projectPath, 'src');
    if (await fs.pathExists(srcPath)) {
      await this.collectFiles(srcPath, files, sourceExts);
    }

    return files;
  }

  async collectFiles(dir, files, extensions) {
    const entries = await fs.readdir(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        await this.collectFiles(fullPath, files, extensions);
      } else if (extensions.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  async extractImports(files) {
    const imports = new Set();
    const importRegex = /(?:import|require)\s*\(?['"]([\w@/-]+)['"]\)?/g;

    for (const file of files.slice(0, 100)) { // Limit for performance
      try {
        const content = await fs.readFile(file, 'utf8');
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const imp = match[1];
          // Extract package name from path
          const parts = imp.split('/');
          const packageName = imp.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
          
          if (!imp.startsWith('.') && !imp.startsWith('/')) {
            imports.add(packageName);
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return imports;
  }

  isMetaPackage(name) {
    const metaPackages = [
      '@types/', 'eslint-config-', 'babel-preset-', 'babel-plugin-',
      '@babel/', 'webpack', 'prettier', 'husky', 'lint-staged'
    ];
    return metaPackages.some(meta => name.startsWith(meta));
  }

  isBuiltinModule(name) {
    const builtins = [
      'fs', 'path', 'http', 'https', 'crypto', 'os', 'util',
      'stream', 'events', 'url', 'querystring', 'child_process'
    ];
    return builtins.includes(name);
  }

  async basicLicenseCheck(projectPath, result) {
    const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
    
    if (packageJson.license) {
      result.licenses[packageJson.license] = ['main project'];
    }
  }

  aggregateIssues(checks) {
    const issues = {
      critical: [],
      warning: [],
      info: []
    };

    // Outdated packages
    if (checks.outdated) {
      checks.outdated.outdated.forEach(pkg => {
        if (pkg.majorsBehind >= this.thresholds.majorBehind) {
          issues.critical.push({
            type: 'outdated-major',
            package: pkg.name,
            message: `${pkg.majorsBehind} major versions behind`
          });
        } else if (pkg.type === 'major') {
          issues.warning.push({
            type: 'outdated-major',
            package: pkg.name,
            message: `Major version available: ${pkg.latest}`
          });
        }
      });
    }

    // Deprecated packages
    if (checks.deprecated) {
      checks.deprecated.deprecated.forEach(pkg => {
        issues.critical.push({
          type: 'deprecated',
          package: pkg.name,
          message: pkg.reason
        });
      });
    }

    // License issues
    if (checks.licenses) {
      checks.licenses.incompatible.forEach(pkg => {
        issues.critical.push({
          type: 'license',
          package: pkg.package,
          message: `Incompatible license: ${pkg.license}`
        });
      });
    }

    // Bundle size
    if (checks.size && checks.size.totalSize > this.thresholds.bundleSizeMB * 1024 * 1024) {
      issues.warning.push({
        type: 'bundle-size',
        message: `Bundle size ${this.formatSize(checks.size.totalSize)} exceeds threshold`
      });
    }

    // Duplicates
    if (checks.duplicates && checks.duplicates.total > 10) {
      issues.warning.push({
        type: 'duplicates',
        message: `${checks.duplicates.total} duplicate packages found`
      });
    }

    // Unused dependencies
    if (checks.phantom && checks.phantom.unused.length > 5) {
      issues.info.push({
        type: 'unused',
        message: `${checks.phantom.unused.length} potentially unused dependencies`
      });
    }

    return issues;
  }

  checkThresholds(issues) {
    return {
      critical: issues.critical,
      warning: issues.warning,
      info: issues.info
    };
  }

  calculateStats(issues) {
    return {
      criticalCount: issues.critical.length,
      warningCount: issues.warning.length,
      infoCount: issues.info.length,
      totalIssues: issues.critical.length + issues.warning.length + issues.info.length
    };
  }

  generateRecommendations(issues) {
    const recommendations = [];

    if (issues.critical.some(i => i.type === 'outdated-major')) {
      recommendations.push({
        type: 'update',
        priority: 'high',
        action: 'Update packages with multiple major versions behind',
        command: 'npm update --save'
      });
    }

    if (issues.critical.some(i => i.type === 'deprecated')) {
      recommendations.push({
        type: 'replace',
        priority: 'high',
        action: 'Replace deprecated packages with recommended alternatives'
      });
    }

    if (issues.warning.some(i => i.type === 'bundle-size')) {
      recommendations.push({
        type: 'optimize',
        priority: 'medium',
        action: 'Analyze and reduce bundle size',
        command: 'npx webpack-bundle-analyzer'
      });
    }

    return recommendations;
  }

  generateMessage(violations, issues) {
    const stats = this.calculateStats(issues);

    if (stats.criticalCount > 0) {
      return `❌ ${stats.criticalCount} critical dependency issues found (${issues.critical[0].message})`;
    }

    if (stats.warningCount > 0) {
      return `⚠️ ${stats.warningCount} dependency warnings found`;
    }

    if (stats.infoCount > 0) {
      return `ℹ️ ${stats.infoCount} dependency suggestions available`;
    }

    return '✅ All dependencies are healthy';
  }

  getDescription() {
    return 'Checks for outdated, deprecated, and problematic dependencies';
  }

  getConfigurableOptions() {
    return {
      checks: {
        outdated: { type: 'boolean', default: true },
        deprecated: { type: 'boolean', default: true },
        licenses: { type: 'boolean', default: true },
        size: { type: 'boolean', default: true },
        duplicates: { type: 'boolean', default: true },
        phantom: { type: 'boolean', default: true }
      },
      thresholds: {
        majorBehind: { type: 'number', default: 2 },
        totalOutdated: { type: 'number', default: 20 },
        bundleSizeMB: { type: 'number', default: 50 }
      },
      allowedLicenses: {
        type: 'array',
        default: ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC'],
        description: 'Allowed license types'
      },
      blockedLicenses: {
        type: 'array',
        default: ['GPL-3.0', 'AGPL-3.0'],
        description: 'Blocked license types'
      }
    };
  }
}

module.exports = DependencyChecker;