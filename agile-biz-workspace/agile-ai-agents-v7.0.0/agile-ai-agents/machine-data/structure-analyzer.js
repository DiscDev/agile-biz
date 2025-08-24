#!/usr/bin/env node

/**
 * Structure Analyzer Tool
 * Analyzes existing project structures and compares them with recommended scaffolds
 * Used by Project Analyzer Agent during stakeholder interviews
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class StructureAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.scaffoldsPath = path.join(__dirname, '../templates/project-scaffolds');
    this.analysis = {
      currentStructure: {},
      detectedStack: null,
      recommendedScaffold: null,
      antiPatterns: [],
      improvements: [],
      migrationComplexity: 'low'
    };
  }

  /**
   * Main analysis entry point
   */
  async analyze() {
    try {
      // Step 1: Scan current structure
      this.analysis.currentStructure = await this.scanProjectStructure();
      
      // Step 2: Detect tech stack
      this.analysis.detectedStack = await this.detectTechStack();
      
      // Step 3: Find recommended scaffold
      this.analysis.recommendedScaffold = await this.findRecommendedScaffold();
      
      // Step 4: Identify anti-patterns
      this.analysis.antiPatterns = await this.identifyAntiPatterns();
      
      // Step 5: Generate improvements
      this.analysis.improvements = await this.generateImprovements();
      
      // Step 6: Calculate migration complexity
      this.analysis.migrationComplexity = await this.calculateMigrationComplexity();
      
      return this.analysis;
    } catch (error) {
      console.error('Structure analysis failed:', error);
      throw error;
    }
  }

  /**
   * Scan the current project structure
   */
  async scanProjectStructure() {
    const structure = {};
    
    const scanDir = (dirPath, relativePath = '') => {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        // Skip common ignored directories
        if (['.git', 'node_modules', '.next', 'dist', 'build', '__pycache__'].includes(item)) {
          return;
        }
        
        const fullPath = path.join(dirPath, item);
        const relPath = path.join(relativePath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          structure[relPath] = { type: 'directory', children: [] };
          scanDir(fullPath, relPath);
        } else {
          structure[relPath] = { type: 'file', size: stats.size };
        }
      });
    };
    
    scanDir(this.projectPath);
    return structure;
  }

  /**
   * Detect the technology stack from project files
   */
  async detectTechStack() {
    const stack = {
      frontend: null,
      backend: null,
      database: null,
      fullstack: null,
      mobile: null,
      architecture: 'unknown'
    };
    
    // Check for package.json
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Frontend detection
      if (deps.react) stack.frontend = 'react';
      if (deps.vue) stack.frontend = 'vue';
      if (deps.angular) stack.frontend = 'angular';
      if (deps.svelte) stack.frontend = 'svelte';
      
      // Backend detection
      if (deps.express) stack.backend = 'express';
      if (deps.fastify) stack.backend = 'fastify';
      if (deps.koa) stack.backend = 'koa';
      if (deps.nestjs) stack.backend = 'nestjs';
      
      // Fullstack frameworks
      if (deps.next) stack.fullstack = 'nextjs';
      if (deps.nuxt) stack.fullstack = 'nuxtjs';
      if (deps['@sveltejs/kit']) stack.fullstack = 'sveltekit';
      
      // Mobile
      if (deps['react-native']) stack.mobile = 'react-native';
    }
    
    // Check for requirements.txt (Python)
    const requirementsPath = path.join(this.projectPath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      const requirements = fs.readFileSync(requirementsPath, 'utf8');
      if (requirements.includes('django')) stack.backend = 'django';
      if (requirements.includes('flask')) stack.backend = 'flask';
      if (requirements.includes('fastapi')) stack.backend = 'fastapi';
    }
    
    // Check for composer.json (PHP)
    const composerPath = path.join(this.projectPath, 'composer.json');
    if (fs.existsSync(composerPath)) {
      const composer = JSON.parse(fs.readFileSync(composerPath, 'utf8'));
      if (composer.require && composer.require['laravel/framework']) {
        stack.backend = 'laravel';
      }
    }
    
    // Determine architecture
    if (stack.fullstack) {
      stack.architecture = 'fullstack-framework';
    } else if (stack.frontend && stack.backend) {
      // Check if they're in separate directories
      const hasFrontendDir = fs.existsSync(path.join(this.projectPath, 'frontend'));
      const hasBackendDir = fs.existsSync(path.join(this.projectPath, 'backend'));
      
      if (hasFrontendDir && hasBackendDir) {
        stack.architecture = 'separated-stack';
      } else {
        stack.architecture = 'mixed-stack';
      }
    } else if (stack.backend && !stack.frontend) {
      stack.architecture = 'monolithic';
    } else if (stack.mobile) {
      stack.architecture = 'mobile';
    }
    
    // Check for microservices
    const hasServicesDir = fs.existsSync(path.join(this.projectPath, 'services'));
    if (hasServicesDir) {
      stack.architecture = 'microservices';
    }
    
    return stack;
  }

  /**
   * Find the recommended scaffold based on detected stack
   */
  async findRecommendedScaffold() {
    const { frontend, backend, fullstack, mobile, architecture } = this.analysis.detectedStack;
    
    // Map to scaffold templates
    const scaffoldMap = {
      'separated-stack': {
        'react-express': 'separated-stack/react-node',
        'vue-django': 'separated-stack/vue-django',
        'react-laravel': 'separated-stack/laravel-react'
      },
      'fullstack-framework': {
        'nextjs': 'fullstack-frameworks/nextjs',
        'nuxtjs': 'fullstack-frameworks/nuxtjs',
        'sveltekit': 'fullstack-frameworks/sveltekit'
      },
      'monolithic': {
        'django': 'monolithic/django',
        'laravel': 'monolithic/laravel',
        'rails': 'monolithic/rails'
      },
      'microservices': {
        'nodejs': 'microservices/nodejs-microservices'
      },
      'mobile': {
        'react-native': 'mobile/react-native-node'
      }
    };
    
    let scaffoldPath = null;
    
    if (fullstack && scaffoldMap['fullstack-framework'][fullstack]) {
      scaffoldPath = scaffoldMap['fullstack-framework'][fullstack];
    } else if (architecture === 'separated-stack' && frontend && backend) {
      const key = `${frontend}-${backend}`;
      scaffoldPath = scaffoldMap['separated-stack'][key] || 'separated-stack/react-node';
    } else if (architecture === 'monolithic' && backend) {
      scaffoldPath = scaffoldMap['monolithic'][backend] || 'monolithic/django';
    } else if (architecture === 'microservices') {
      scaffoldPath = 'microservices/nodejs-microservices';
    } else if (mobile) {
      scaffoldPath = scaffoldMap['mobile'][mobile];
    }
    
    if (!scaffoldPath) {
      scaffoldPath = 'separated-stack/react-node'; // Default
    }
    
    // Load the scaffold structure
    const scaffoldYamlPath = path.join(this.scaffoldsPath, scaffoldPath, 'structure.yaml');
    if (fs.existsSync(scaffoldYamlPath)) {
      const scaffoldContent = fs.readFileSync(scaffoldYamlPath, 'utf8');
      return yaml.load(scaffoldContent);
    }
    
    return null;
  }

  /**
   * Identify anti-patterns in current structure
   */
  async identifyAntiPatterns() {
    const antiPatterns = [];
    const structure = this.analysis.currentStructure;
    const stack = this.analysis.detectedStack;
    
    // Anti-pattern 1: Frontend code in root with backend
    if (stack.frontend && stack.backend) {
      const hasRootComponents = Object.keys(structure).some(path => 
        path.includes('components/') && !path.startsWith('frontend/') && !path.startsWith('client/')
      );
      const hasRootSrc = 'src/' in structure;
      const hasBackendDirs = Object.keys(structure).some(path => 
        path.includes('controllers/') || path.includes('models/') || path.includes('routes/')
      );
      
      if (hasRootComponents && hasBackendDirs) {
        antiPatterns.push({
          type: 'mixed-concerns',
          severity: 'high',
          description: 'Frontend and backend code mixed in root directory',
          impact: 'Makes repository splits difficult, confuses developers',
          fix: 'Separate into frontend/ and backend/ directories'
        });
      }
    }
    
    // Anti-pattern 2: No clear separation of concerns
    const hasMixedAssets = Object.keys(structure).some(path => {
      const dir = path.split('/')[0];
      return ['public', 'static', 'assets'].includes(dir) && !path.startsWith('frontend/');
    });
    
    if (hasMixedAssets && stack.architecture !== 'monolithic') {
      antiPatterns.push({
        type: 'unclear-boundaries',
        severity: 'medium',
        description: 'Static assets not clearly organized',
        impact: 'Difficult to manage CDN, caching strategies',
        fix: 'Move assets to appropriate frontend directory'
      });
    }
    
    // Anti-pattern 3: Test files scattered
    const testPaths = Object.keys(structure).filter(path => 
      path.includes('test') || path.includes('spec') || path.includes('__tests__')
    );
    const hasScatteredTests = testPaths.length > 3 && 
      !testPaths.every(path => path.startsWith('tests/') || path.startsWith('test/'));
    
    if (hasScatteredTests) {
      antiPatterns.push({
        type: 'scattered-tests',
        severity: 'low',
        description: 'Test files scattered throughout codebase',
        impact: 'Harder to run all tests, maintain test coverage',
        fix: 'Consolidate tests in dedicated test directory'
      });
    }
    
    // Anti-pattern 4: Missing environment examples
    const hasEnvExample = Object.keys(structure).some(path => 
      path === '.env.example' || path === 'env.example'
    );
    
    if (!hasEnvExample) {
      antiPatterns.push({
        type: 'missing-env-example',
        severity: 'medium',
        description: 'No .env.example file found',
        impact: 'New developers struggle with setup',
        fix: 'Create .env.example with all required variables'
      });
    }
    
    return antiPatterns;
  }

  /**
   * Generate improvement recommendations
   */
  async generateImprovements() {
    const improvements = [];
    const scaffold = this.analysis.recommendedScaffold;
    const currentStructure = this.analysis.currentStructure;
    
    if (!scaffold) return improvements;
    
    // Check for missing recommended directories
    scaffold.structure.forEach(item => {
      if (item.type === 'directory' && !currentStructure[item.path]) {
        improvements.push({
          type: 'missing-directory',
          path: item.path,
          description: item.description || `Missing ${item.path} directory`,
          priority: 'high',
          effort: 'low'
        });
      }
    });
    
    // Check for missing important files
    const importantFiles = ['.env.example', 'README.md', 'docker-compose.yml'];
    importantFiles.forEach(file => {
      if (!currentStructure[file]) {
        improvements.push({
          type: 'missing-file',
          path: file,
          description: `Missing ${file}`,
          priority: 'medium',
          effort: 'low'
        });
      }
    });
    
    // Structure-specific improvements
    if (this.analysis.detectedStack.architecture === 'mixed-stack') {
      improvements.push({
        type: 'structure-reorganization',
        description: 'Separate frontend and backend into distinct directories',
        priority: 'high',
        effort: 'medium',
        steps: [
          'Create frontend/ and backend/ directories',
          'Move React/Vue/Angular code to frontend/',
          'Move API/server code to backend/',
          'Update import paths',
          'Update build scripts'
        ]
      });
    }
    
    return improvements;
  }

  /**
   * Calculate migration complexity
   */
  async calculateMigrationComplexity() {
    const { antiPatterns, improvements } = this.analysis;
    
    const highSeverityCount = antiPatterns.filter(p => p.severity === 'high').length;
    const totalImprovements = improvements.length;
    const hasStructureReorg = improvements.some(i => i.type === 'structure-reorganization');
    
    if (highSeverityCount > 2 || hasStructureReorg) {
      return 'high';
    } else if (highSeverityCount > 0 || totalImprovements > 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate markdown report
   */
  generateReport() {
    const { currentStructure, detectedStack, recommendedScaffold, antiPatterns, improvements, migrationComplexity } = this.analysis;
    
    let report = '## Project Structure Analysis Report\n\n';
    
    // Detected Stack
    report += '### Detected Technology Stack\n';
    report += `* **Frontend**: ${detectedStack.frontend || 'Not detected'}\n`;
    report += `* **Backend**: ${detectedStack.backend || 'Not detected'}\n`;
    report += `* **Architecture**: ${detectedStack.architecture}\n`;
    if (detectedStack.fullstack) {
      report += `* **Fullstack Framework**: ${detectedStack.fullstack}\n`;
    }
    report += '\n';
    
    // Current Structure Summary
    report += '### Current Structure Summary\n';
    report += '```\n';
    const topLevelDirs = Object.keys(currentStructure)
      .filter(path => !path.includes('/') && currentStructure[path].type === 'directory')
      .slice(0, 10);
    topLevelDirs.forEach(dir => {
      report += `${dir}/\n`;
    });
    if (Object.keys(currentStructure).length > 10) {
      report += '... and more\n';
    }
    report += '```\n\n';
    
    // Recommended Structure
    if (recommendedScaffold) {
      report += `### Recommended Structure (${recommendedScaffold.name})\n`;
      report += `Based on your ${detectedStack.architecture} architecture with ${detectedStack.frontend || detectedStack.backend || 'detected'} stack.\n\n`;
      report += '```\n';
      recommendedScaffold.structure.forEach(item => {
        if (item.type === 'directory') {
          report += `${item.path}/\n`;
          if (item.subdirs) {
            item.subdirs.forEach(subdir => {
              report += `  ${subdir}\n`;
            });
          }
        }
      });
      report += '```\n\n';
    }
    
    // Anti-patterns
    if (antiPatterns.length > 0) {
      report += '### ⚠️ Anti-Patterns Detected\n';
      antiPatterns.forEach((pattern, index) => {
        report += `\n${index + 1}. **${pattern.description}**\n`;
        report += `   * Severity: ${pattern.severity.toUpperCase()}\n`;
        report += `   * Impact: ${pattern.impact}\n`;
        report += `   * Fix: ${pattern.fix}\n`;
      });
      report += '\n';
    }
    
    // Improvements
    if (improvements.length > 0) {
      report += '### 📈 Recommended Improvements\n';
      improvements.forEach((improvement, index) => {
        report += `\n${index + 1}. **${improvement.description}**\n`;
        report += `   * Priority: ${improvement.priority}\n`;
        report += `   * Effort: ${improvement.effort}\n`;
        if (improvement.steps) {
          report += '   * Steps:\n';
          improvement.steps.forEach(step => {
            report += `     - ${step}\n`;
          });
        }
      });
      report += '\n';
    }
    
    // Migration Complexity
    report += '### Migration Complexity\n';
    report += `**Overall Complexity**: ${migrationComplexity.toUpperCase()}\n\n`;
    
    if (migrationComplexity === 'high') {
      report += 'This migration will require significant refactoring. Consider a phased approach.\n';
    } else if (migrationComplexity === 'medium') {
      report += 'This migration has moderate complexity. Plan for 2-3 days of work.\n';
    } else {
      report += 'This migration is straightforward and can be completed quickly.\n';
    }
    
    return report;
  }
}

// CLI usage
if (require.main === module) {
  const projectPath = process.argv[2] || process.cwd();
  
  console.log(`Analyzing project structure at: ${projectPath}\n`);
  
  const analyzer = new StructureAnalyzer(projectPath);
  
  analyzer.analyze()
    .then(() => {
      const report = analyzer.generateReport();
      console.log(report);
      
      // Save report to file
      const reportPath = path.join(projectPath, 'structure-analysis-report.md');
      fs.writeFileSync(reportPath, report);
      console.log(`\nReport saved to: ${reportPath}`);
    })
    .catch(error => {
      console.error('Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = StructureAnalyzer;