/**
 * Project Analysis Orchestrator
 * Manages parallel analysis of existing projects across multiple dimensions
 */

const SubAgentOrchestrator = require('./sub-agent-orchestrator');
const TokenBudgetManager = require('./token-budget-manager');
const DocumentRegistryManager = require('./document-registry-manager');
const fs = require('fs').promises;
const path = require('path');

class ProjectAnalysisOrchestrator {
  constructor() {
    this.orchestrator = new SubAgentOrchestrator();
    this.tokenManager = new TokenBudgetManager();
    this.registryManager = new DocumentRegistryManager();
    this.analysisBasePath = path.join(__dirname, '..', 'project-documents', 'business-strategy', 'existing-project-analysis');
  }

  /**
   * Initialize the analysis orchestrator
   */
  async initialize() {
    await this.orchestrator.initialize();
    await this.registryManager.initialize();
    await fs.mkdir(this.analysisBasePath, { recursive: true });
  }

  /**
   * Execute parallel project analysis
   * @param {Object} projectInfo - Information about the project to analyze
   * @param {String} analysisLevel - quick, standard, or deep
   */
  async analyzeProject(projectInfo, analysisLevel = 'standard') {
    console.log(`\n🔍 Starting parallel project analysis (${analysisLevel} level)...`);
    
    const startTime = Date.now();
    
    // Define analysis categories based on level
    const categories = this.getAnalysisCategories(analysisLevel);
    
    // Create analysis tasks
    const analysisTasks = this.createAnalysisTasks(categories, projectInfo, analysisLevel);
    
    // Calculate token budgets
    this.allocateTokenBudgets(analysisTasks, analysisLevel);
    
    // Launch parallel analysis
    console.log(`\n🚀 Launching ${analysisTasks.length} analysis sub-agents in parallel...`);
    
    const results = await this.orchestrator.launchSubAgents(analysisTasks);
    
    // Process results
    const analysis = await this.processAnalysisResults(results, categories);
    
    // Generate consolidated report
    const report = await this.generateConsolidatedReport(analysis, projectInfo, analysisLevel);
    
    const duration = (Date.now() - startTime) / 1000 / 60; // minutes
    console.log(`\n✅ Analysis completed in ${duration.toFixed(1)} minutes`);
    
    // Calculate time savings
    const sequentialTime = this.estimateSequentialTime(analysisLevel);
    const timeSavings = Math.round(((sequentialTime - duration) / sequentialTime) * 100);
    console.log(`⏱️  Time savings: ${timeSavings}% (${sequentialTime} min → ${duration.toFixed(1)} min)`);
    
    return {
      report,
      metrics: {
        duration,
        categories: categories.length,
        timeSavings,
        tokensUsed: this.tokenManager.getTotalUsage()
      }
    };
  }

  /**
   * Get analysis categories based on level
   */
  getAnalysisCategories(level) {
    const categories = {
      quick: [
        'architecture',
        'security-critical',
        'performance-bottlenecks'
      ],
      standard: [
        'architecture',
        'code-quality',
        'security',
        'performance',
        'dependencies',
        'testing',
        'technical-debt'
      ],
      deep: [
        'architecture',
        'code-quality',
        'security',
        'performance',
        'dependencies',
        'testing',
        'technical-debt',
        'scalability',
        'maintainability',
        'documentation',
        'deployment',
        'monitoring'
      ]
    };
    
    return categories[level] || categories.standard;
  }

  /**
   * Create analysis tasks for parallel execution
   */
  createAnalysisTasks(categories, projectInfo, level) {
    return categories.map((category, index) => {
      const scope = this.getAnalysisScope(category, level);
      
      return {
        id: `analysis-${category}-${Date.now()}`,
        subAgentId: `analyzer_${index + 1}`,
        description: `Analyze ${category} aspects of the project`,
        analysisCategory: category,
        scope,
        projectInfo,
        prompt: this.generateAnalysisPrompt(category, scope, projectInfo),
        timeout: this.getTimeoutForCategory(category, level)
      };
    });
  }

  /**
   * Get analysis scope for category and level
   */
  getAnalysisScope(category, level) {
    const scopes = {
      architecture: {
        quick: ['high-level structure', 'major components', 'obvious issues'],
        standard: ['detailed structure', 'design patterns', 'component relationships', 'architectural decisions'],
        deep: ['complete architecture audit', 'scalability analysis', 'evolution recommendations', 'refactoring opportunities']
      },
      'code-quality': {
        quick: ['code smell detection', 'obvious issues'],
        standard: ['comprehensive quality metrics', 'maintainability index', 'complexity analysis', 'duplication detection'],
        deep: ['line-by-line review', 'refactoring recommendations', 'best practice compliance', 'style consistency']
      },
      security: {
        quick: ['critical vulnerabilities', 'authentication issues'],
        standard: ['OWASP top 10', 'dependency vulnerabilities', 'security misconfigurations', 'data exposure'],
        deep: ['comprehensive security audit', 'penetration test recommendations', 'compliance assessment', 'threat modeling']
      },
      performance: {
        quick: ['obvious bottlenecks', 'N+1 queries', 'missing indexes'],
        standard: ['performance profiling', 'database optimization', 'caching opportunities', 'algorithm efficiency'],
        deep: ['complete performance audit', 'load testing recommendations', 'scalability limits', 'optimization roadmap']
      }
    };
    
    return scopes[category]?.[level] || ['general analysis'];
  }

  /**
   * Generate analysis prompt for sub-agent
   */
  generateAnalysisPrompt(category, scope, projectInfo) {
    const prompts = {
      architecture: `Analyze the architecture of ${projectInfo.name}. Focus on: ${scope.join(', ')}. 
                    Examine folder structure, module organization, design patterns, and architectural decisions.
                    Identify strengths, weaknesses, and improvement opportunities.`,
      
      'code-quality': `Assess code quality for ${projectInfo.name}. Analyze: ${scope.join(', ')}.
                       Look for code smells, complexity issues, duplication, and maintainability concerns.
                       Provide specific examples and actionable recommendations.`,
      
      security: `Perform security analysis on ${projectInfo.name}. Check for: ${scope.join(', ')}.
                 Identify vulnerabilities, insecure practices, and compliance issues.
                 Prioritize findings by severity and provide remediation steps.`,
      
      performance: `Analyze performance characteristics of ${projectInfo.name}. Investigate: ${scope.join(', ')}.
                    Identify bottlenecks, inefficiencies, and optimization opportunities.
                    Provide specific recommendations with expected impact.`,
      
      dependencies: `Analyze dependencies in ${projectInfo.name}. Check for outdated packages, vulnerabilities,
                     license compliance, and unnecessary dependencies. Recommend updates and alternatives.`,
      
      testing: `Evaluate testing in ${projectInfo.name}. Analyze test coverage, test quality, testing strategies,
                and missing test scenarios. Recommend improvements for better quality assurance.`,
      
      'technical-debt': `Assess technical debt in ${projectInfo.name}. Identify legacy code, outdated patterns,
                         accumulated shortcuts, and maintenance burdens. Prioritize debt reduction efforts.`
    };
    
    return prompts[category] || `Analyze ${category} aspects of the project focusing on: ${scope.join(', ')}`;
  }

  /**
   * Get timeout for analysis category
   */
  getTimeoutForCategory(category, level) {
    const baseTimeouts = {
      quick: 60000,    // 1 minute
      standard: 180000, // 3 minutes
      deep: 300000     // 5 minutes
    };
    
    const categoryMultipliers = {
      architecture: 1.2,
      'code-quality': 1.5,
      security: 1.3,
      performance: 1.4,
      dependencies: 0.8,
      testing: 1.0,
      'technical-debt': 1.1
    };
    
    const baseTimeout = baseTimeouts[level] || baseTimeouts.standard;
    const multiplier = categoryMultipliers[category] || 1.0;
    
    return Math.round(baseTimeout * multiplier);
  }

  /**
   * Allocate token budgets for analysis tasks
   */
  allocateTokenBudgets(tasks, level) {
    const baseBudgets = {
      quick: 5000,
      standard: 10000,
      deep: 20000
    };
    
    const baseBudget = baseBudgets[level] || baseBudgets.standard;
    
    tasks.forEach(task => {
      const complexity = this.assessAnalysisComplexity(task.analysisCategory, level);
      const budget = this.tokenManager.calculateBudget({
        taskType: 'analysis',
        complexity,
        analysisLevel: level,
        category: task.analysisCategory
      });
      
      task.tokenBudget = budget;
      this.tokenManager.allocateTokens(task.subAgentId, budget);
    });
  }

  /**
   * Assess complexity of analysis task
   */
  assessAnalysisComplexity(category, level) {
    const complexityMatrix = {
      architecture: { quick: 'simple', standard: 'standard', deep: 'complex' },
      'code-quality': { quick: 'simple', standard: 'complex', deep: 'complex' },
      security: { quick: 'standard', standard: 'complex', deep: 'complex' },
      performance: { quick: 'standard', standard: 'complex', deep: 'complex' }
    };
    
    return complexityMatrix[category]?.[level] || 'standard';
  }

  /**
   * Process analysis results from sub-agents
   */
  async processAnalysisResults(results, categories) {
    const analysis = {
      successful: [],
      failed: [],
      findings: {},
      recommendations: {},
      priorities: []
    };
    
    for (const result of results) {
      if (result.status === 'success') {
        const category = result.data.category;
        analysis.successful.push(category);
        analysis.findings[category] = result.data.findings || [];
        analysis.recommendations[category] = result.data.recommendations || [];
        
        // Extract high-priority items
        if (result.data.highPriority) {
          analysis.priorities.push(...result.data.highPriority);
        }
      } else {
        analysis.failed.push({
          category: result.data?.category || 'unknown',
          error: result.error
        });
      }
    }
    
    // Sort priorities by severity/impact
    analysis.priorities.sort((a, b) => (b.severity || 0) - (a.severity || 0));
    
    return analysis;
  }

  /**
   * Generate consolidated analysis report
   */
  async generateConsolidatedReport(analysis, projectInfo, level) {
    const reportPath = path.join(this.analysisBasePath, 'consolidated-analysis-report.md');
    
    let content = `# Project Analysis Report: ${projectInfo.name}

**Analysis Date**: ${new Date().toISOString()}
**Analysis Level**: ${level}
**Categories Analyzed**: ${analysis.successful.length}

## Executive Summary

This ${level}-level analysis examined ${analysis.successful.length} aspects of the project in parallel, identifying key strengths, weaknesses, and improvement opportunities.

`;

    // High-priority findings
    if (analysis.priorities.length > 0) {
      content += `## 🚨 High-Priority Findings

`;
      analysis.priorities.slice(0, 10).forEach((item, index) => {
        content += `### ${index + 1}. ${item.title}
**Category**: ${item.category}
**Severity**: ${item.severity}/10
**Impact**: ${item.impact}

${item.description}

**Recommendation**: ${item.recommendation}

---

`;
      });
    }

    // Category-specific findings
    content += `## Detailed Analysis by Category

`;
    
    for (const category of analysis.successful) {
      content += `### ${this.formatCategoryName(category)}

`;
      
      // Findings
      const findings = analysis.findings[category] || [];
      if (findings.length > 0) {
        content += `#### Key Findings
`;
        findings.forEach(finding => {
          content += `* ${finding}\n`;
        });
        content += '\n';
      }
      
      // Recommendations
      const recommendations = analysis.recommendations[category] || [];
      if (recommendations.length > 0) {
        content += `#### Recommendations
`;
        recommendations.forEach((rec, index) => {
          content += `${index + 1}. ${rec}\n`;
        });
        content += '\n';
      }
    }
    
    // Failed analyses
    if (analysis.failed.length > 0) {
      content += `## ⚠️ Incomplete Analyses

The following categories could not be analyzed:
`;
      analysis.failed.forEach(failure => {
        content += `* **${failure.category}**: ${failure.error}\n`;
      });
    }
    
    // Next steps
    content += `
## Recommended Next Steps

1. **Immediate Actions**: Address high-priority security and performance issues
2. **Short-term**: Implement quick wins from code quality recommendations
3. **Medium-term**: Plan architectural improvements and technical debt reduction
4. **Long-term**: Consider scalability enhancements and major refactoring

## Analysis Metadata

* **Time Taken**: ${(Date.now() - this.startTime) / 60000} minutes
* **Parallel Analyses**: ${analysis.successful.length}
* **Analysis Level**: ${level}
* **Generated By**: Project Analysis Orchestrator v1.0.0
`;

    await fs.writeFile(reportPath, content);
    
    // Update registry
    await this.registryManager.registerDocument(
      'project-analysis-orchestrator',
      'consolidated-analysis-report.md',
      reportPath,
      {
        analysisLevel: level,
        categoriesAnalyzed: analysis.successful,
        timestamp: new Date().toISOString()
      }
    );
    
    return reportPath;
  }

  /**
   * Format category name for display
   */
  formatCategoryName(category) {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Estimate sequential analysis time
   */
  estimateSequentialTime(level) {
    const times = {
      quick: 30,    // 30 minutes
      standard: 120, // 2 hours
      deep: 240     // 4 hours
    };
    
    return times[level] || times.standard;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.orchestrator.cleanup();
    await this.registryManager.consolidateRegistries();
  }
}

module.exports = ProjectAnalysisOrchestrator;