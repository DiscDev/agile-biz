/**
 * Improvement Analyzer Module
 * Analyzes codebase findings and generates categorized improvement recommendations
 */

const fs = require('fs').promises;
const path = require('path');

class ImprovementAnalyzer {
  constructor() {
    this.categories = {
      critical_security: {
        name: 'Critical Security',
        icon: '🔴',
        priority_weight: 10,
        description: 'Security vulnerabilities that need immediate attention'
      },
      performance: {
        name: 'Performance',
        icon: '⚡',
        priority_weight: 7,
        description: 'Optimizations to improve speed and efficiency'
      },
      technical_debt: {
        name: 'Technical Debt',
        icon: '🏗️',
        priority_weight: 5,
        description: 'Code quality and architecture improvements'
      },
      features: {
        name: 'Features',
        icon: '✨',
        priority_weight: 4,
        description: 'New functionality and enhancements'
      },
      modernization: {
        name: 'Modernization',
        icon: '🚀',
        priority_weight: 3,
        description: 'Technology stack updates and migrations'
      },
      testing: {
        name: 'Testing',
        icon: '🧪',
        priority_weight: 6,
        description: 'Test coverage and quality improvements'
      },
      documentation: {
        name: 'Documentation',
        icon: '📚',
        priority_weight: 2,
        description: 'Documentation updates and improvements'
      }
    };
  }

  /**
   * Analyze project findings and generate improvements
   */
  async analyzeProject(analysisResults) {
    const improvements = [];
    let improvementIdCounter = 1;

    // Analyze security findings
    if (analysisResults.security) {
      improvements.push(...this.analyzeSecurityFindings(
        analysisResults.security,
        improvementIdCounter
      ));
      improvementIdCounter += improvements.length;
    }

    // Analyze performance metrics
    if (analysisResults.performance) {
      improvements.push(...this.analyzePerformanceMetrics(
        analysisResults.performance,
        improvementIdCounter
      ));
      improvementIdCounter += improvements.filter(i => !improvements.includes(i)).length;
    }

    // Analyze code quality
    if (analysisResults.codeQuality) {
      improvements.push(...this.analyzeCodeQuality(
        analysisResults.codeQuality,
        improvementIdCounter
      ));
      improvementIdCounter += improvements.filter(i => !improvements.includes(i)).length;
    }

    // Analyze test coverage
    if (analysisResults.testCoverage) {
      improvements.push(...this.analyzeTestCoverage(
        analysisResults.testCoverage,
        improvementIdCounter
      ));
      improvementIdCounter += improvements.filter(i => !improvements.includes(i)).length;
    }

    // Analyze dependencies
    if (analysisResults.dependencies) {
      improvements.push(...this.analyzeDependencies(
        analysisResults.dependencies,
        improvementIdCounter
      ));
    }

    return {
      improvements,
      totalIdentified: improvements.length,
      categories: this.categorizeImprovements(improvements),
      metadata: {
        analyzedAt: new Date().toISOString(),
        projectType: analysisResults.projectType || 'unknown'
      }
    };
  }

  /**
   * Analyze security findings
   */
  analyzeSecurityFindings(securityData, startId) {
    const improvements = [];
    
    // SQL Injection vulnerabilities
    if (securityData.sqlInjection?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Fix SQL Injection Vulnerabilities',
        description: `Found ${securityData.sqlInjection.length} potential SQL injection points that need parameterized queries`,
        category: 'critical_security',
        impact: 'high',
        effort: 'low',
        roi_timeline: 'immediate',
        dependencies: [],
        risk_if_deferred: 'Data breach, compliance violations, reputation damage',
        estimated_hours: 4,
        affected_components: securityData.sqlInjection.map(v => v.file)
      });
    }

    // XSS vulnerabilities
    if (securityData.xss?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Fix Cross-Site Scripting (XSS) Vulnerabilities',
        description: `Found ${securityData.xss.length} XSS vulnerabilities requiring input sanitization`,
        category: 'critical_security',
        impact: 'high',
        effort: 'medium',
        roi_timeline: 'immediate',
        dependencies: [],
        risk_if_deferred: 'Account hijacking, data theft, malware distribution',
        estimated_hours: 8,
        affected_components: securityData.xss.map(v => v.file)
      });
    }

    // Authentication issues
    if (securityData.authIssues?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Strengthen Authentication System',
        description: 'Implement stronger authentication mechanisms including 2FA and rate limiting',
        category: 'critical_security',
        impact: 'high',
        effort: 'medium',
        roi_timeline: '1 week',
        dependencies: [],
        risk_if_deferred: 'Unauthorized access, brute force attacks',
        estimated_hours: 16,
        affected_components: ['auth/', 'middleware/']
      });
    }

    return improvements;
  }

  /**
   * Analyze performance metrics
   */
  analyzePerformanceMetrics(performanceData, startId) {
    const improvements = [];

    // Database query optimization
    if (performanceData.slowQueries?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Optimize Database Queries',
        description: `${performanceData.slowQueries.length} queries taking >1s need optimization`,
        category: 'performance',
        impact: 'high',
        effort: 'medium',
        roi_timeline: '2-3 days',
        dependencies: [],
        risk_if_deferred: 'Poor user experience, increased server costs',
        estimated_hours: 12,
        affected_components: performanceData.slowQueries.map(q => q.location)
      });
    }

    // Missing indexes
    if (performanceData.missingIndexes?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Add Missing Database Indexes',
        description: 'Add indexes to improve query performance',
        category: 'performance',
        impact: 'high',
        effort: 'low',
        roi_timeline: 'immediate',
        dependencies: [],
        risk_if_deferred: 'Continued slow performance',
        estimated_hours: 2,
        affected_components: ['database/migrations/']
      });
    }

    // N+1 query problems
    if (performanceData.nPlusOne?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Fix N+1 Query Problems',
        description: `Found ${performanceData.nPlusOne.length} N+1 query issues`,
        category: 'performance',
        impact: 'medium',
        effort: 'medium',
        roi_timeline: '1 week',
        dependencies: [],
        risk_if_deferred: 'Database overload at scale',
        estimated_hours: 8,
        affected_components: performanceData.nPlusOne.map(n => n.file)
      });
    }

    return improvements;
  }

  /**
   * Analyze code quality
   */
  analyzeCodeQuality(codeQualityData, startId) {
    const improvements = [];

    // High complexity functions
    if (codeQualityData.highComplexity?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Refactor High Complexity Functions',
        description: `${codeQualityData.highComplexity.length} functions exceed complexity threshold`,
        category: 'technical_debt',
        impact: 'medium',
        effort: 'high',
        roi_timeline: '2-4 weeks',
        dependencies: [],
        risk_if_deferred: 'Increased bug rate, maintenance difficulty',
        estimated_hours: 24,
        affected_components: codeQualityData.highComplexity.map(f => f.file)
      });
    }

    // Code duplication
    if (codeQualityData.duplication?.percentage > 15) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Reduce Code Duplication',
        description: `Code duplication at ${codeQualityData.duplication.percentage}% (target: <10%)`,
        category: 'technical_debt',
        impact: 'medium',
        effort: 'medium',
        roi_timeline: '1-2 weeks',
        dependencies: [],
        risk_if_deferred: 'Inconsistent behavior, higher maintenance cost',
        estimated_hours: 16,
        affected_components: codeQualityData.duplication.locations || []
      });
    }

    return improvements;
  }

  /**
   * Analyze test coverage
   */
  analyzeTestCoverage(testData, startId) {
    const improvements = [];

    if (testData.coverage < 60) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Improve Test Coverage',
        description: `Current coverage: ${testData.coverage}%. Target: 80%`,
        category: 'testing',
        impact: 'medium',
        effort: 'high',
        roi_timeline: 'ongoing',
        dependencies: [],
        risk_if_deferred: 'Increased regression bugs, deployment risks',
        estimated_hours: 40,
        affected_components: testData.uncoveredFiles || []
      });
    }

    if (testData.missingIntegrationTests) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Add Integration Tests',
        description: 'Critical paths lack integration test coverage',
        category: 'testing',
        impact: 'high',
        effort: 'medium',
        roi_timeline: '1-2 weeks',
        dependencies: [],
        risk_if_deferred: 'Undetected integration issues',
        estimated_hours: 20,
        affected_components: ['tests/integration/']
      });
    }

    return improvements;
  }

  /**
   * Analyze dependencies
   */
  analyzeDependencies(dependencyData, startId) {
    const improvements = [];

    if (dependencyData.outdated?.length > 0) {
      const criticalOutdated = dependencyData.outdated.filter(d => d.severity === 'high');
      if (criticalOutdated.length > 0) {
        improvements.push({
          id: `IMP-${startId++}`,
          title: 'Update Critical Dependencies',
          description: `${criticalOutdated.length} dependencies have critical updates`,
          category: 'critical_security',
          impact: 'high',
          effort: 'medium',
          roi_timeline: '1 week',
          dependencies: [],
          risk_if_deferred: 'Known vulnerabilities remain exploitable',
          estimated_hours: 8,
          affected_components: ['package.json', 'package-lock.json']
        });
      }
    }

    if (dependencyData.deprecated?.length > 0) {
      improvements.push({
        id: `IMP-${startId++}`,
        title: 'Replace Deprecated Dependencies',
        description: `${dependencyData.deprecated.length} dependencies are deprecated`,
        category: 'modernization',
        impact: 'medium',
        effort: 'high',
        roi_timeline: '2-4 weeks',
        dependencies: [],
        risk_if_deferred: 'Future compatibility issues',
        estimated_hours: 24,
        affected_components: dependencyData.deprecated.map(d => d.name)
      });
    }

    return improvements;
  }

  /**
   * Categorize improvements
   */
  categorizeImprovements(improvements) {
    const categorized = {};
    
    Object.keys(this.categories).forEach(category => {
      categorized[category] = improvements.filter(imp => imp.category === category);
    });

    return categorized;
  }

  /**
   * Calculate improvement score for prioritization
   */
  calculateImprovementScore(improvement) {
    const impactScore = { high: 3, medium: 2, low: 1 };
    const effortScore = { low: 3, medium: 2, high: 1 }; // Inverse for effort
    
    const categoryWeight = this.categories[improvement.category]?.priority_weight || 1;
    
    return (
      impactScore[improvement.impact] * 10 +
      effortScore[improvement.effort] * 5 +
      categoryWeight
    );
  }

  /**
   * Generate improvement report
   */
  async generateReport(improvements, outputPath) {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        total: improvements.improvements.length,
        byCategory: Object.entries(improvements.categories).map(([cat, items]) => ({
          category: cat,
          count: items.length,
          icon: this.categories[cat].icon,
          name: this.categories[cat].name
        }))
      },
      improvements: improvements.improvements.map(imp => ({
        ...imp,
        score: this.calculateImprovementScore(imp)
      })).sort((a, b) => b.score - a.score),
      recommendations: this.generateRecommendations(improvements)
    };

    await fs.writeFile(
      outputPath,
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  /**
   * Generate strategic recommendations
   */
  generateRecommendations(improvements) {
    const recommendations = [];
    const categories = improvements.categories;

    // Critical security recommendations
    if (categories.critical_security?.length > 0) {
      recommendations.push({
        priority: 'critical',
        message: `Address ${categories.critical_security.length} critical security issues immediately`,
        rationale: 'Security vulnerabilities pose immediate risk to data and compliance'
      });
    }

    // Performance recommendations
    if (categories.performance?.length > 3) {
      recommendations.push({
        priority: 'high',
        message: 'Consider a dedicated performance sprint',
        rationale: 'Multiple performance issues compound to significantly impact user experience'
      });
    }

    // Technical debt recommendations
    const debtCount = categories.technical_debt?.length || 0;
    if (debtCount > 5) {
      recommendations.push({
        priority: 'medium',
        message: 'Schedule regular refactoring sprints',
        rationale: 'High technical debt slows feature development and increases bug risk'
      });
    }

    return recommendations;
  }
}

module.exports = ImprovementAnalyzer;