/**
 * Coverage Analyzer System
 * Implements risk-based coverage thresholds and intelligent test analysis
 */

const fs = require('fs');
const path = require('path');

class CoverageAnalyzer {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.coverageThresholdsPath = path.join(
      this.basePath,
      'machine-data',
      'coverage-thresholds.json'
    );
    
    // Default coverage thresholds by risk level
    this.defaultThresholds = {
      authentication: 95,
      payment_processing: 95,
      data_validation: 90,
      business_logic: 85,
      ui_components: 70,
      utilities: 60,
      experimental: 50
    };
    
    // Risk assessment characteristics
    this.riskCharacteristics = {
      high_risk: {
        threshold: 95,
        characteristics: [
          "Handles user data",
          "Financial transactions",
          "Authentication/authorization",
          "External API integrations",
          "Security-critical operations",
          "Payment processing",
          "Personal data handling",
          "Compliance-related code"
        ],
        keywords: [
          "auth", "login", "password", "token", "jwt", "oauth",
          "payment", "stripe", "checkout", "billing", "subscription",
          "encrypt", "decrypt", "hash", "security", "permission",
          "user_data", "personal", "private", "sensitive", "pii"
        ]
      },
      medium_risk: {
        threshold: 80,
        characteristics: [
          "Business logic",
          "Data processing",
          "Internal APIs",
          "Core functionality",
          "Data transformations",
          "Workflow management",
          "Reporting systems"
        ],
        keywords: [
          "process", "calculate", "transform", "workflow", "business",
          "report", "analytics", "aggregate", "filter", "validate",
          "crud", "database", "query", "model", "service"
        ]
      },
      low_risk: {
        threshold: 60,
        characteristics: [
          "UI components",
          "Logging",
          "Configuration",
          "Utilities",
          "Helper functions",
          "Display logic",
          "Static content"
        ],
        keywords: [
          "ui", "component", "display", "render", "style",
          "log", "debug", "trace", "info", "warn",
          "config", "setting", "preference", "option",
          "util", "helper", "format", "convert"
        ]
      }
    };
    
    // Load saved thresholds or create defaults
    this.loadThresholds();
  }
  
  /**
   * Load coverage thresholds from file
   */
  loadThresholds() {
    try {
      if (fs.existsSync(this.coverageThresholdsPath)) {
        const data = JSON.parse(fs.readFileSync(this.coverageThresholdsPath, 'utf-8'));
        this.thresholds = data.coverage_thresholds;
        console.log('📊 Loaded coverage thresholds from file');
      } else {
        this.thresholds = this.defaultThresholds;
        this.saveThresholds();
      }
    } catch (error) {
      console.error('Error loading thresholds:', error.message);
      this.thresholds = this.defaultThresholds;
    }
  }
  
  /**
   * Save coverage thresholds to file
   */
  saveThresholds() {
    const thresholdData = {
      meta: {
        document_type: "coverage_thresholds",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      },
      coverage_thresholds: this.thresholds,
      risk_levels: this.riskCharacteristics,
      improvement_targets: {
        sprint_goal: "Increase coverage by 5% each sprint",
        debt_tracking: "Flag files below threshold",
        automated_remediation: "Generate tests for uncovered code"
      }
    };
    
    try {
      fs.writeFileSync(this.coverageThresholdsPath, JSON.stringify(thresholdData, null, 2));
      console.log('💾 Saved coverage thresholds');
    } catch (error) {
      console.error('Error saving thresholds:', error.message);
    }
  }
  
  /**
   * Determine risk level for a file or module
   */
  determineRiskLevel(filePath, content = '') {
    const fileName = path.basename(filePath).toLowerCase();
    const fileContent = content.toLowerCase();
    const combined = `${fileName} ${fileContent}`;
    
    // Check high risk indicators
    for (const keyword of this.riskCharacteristics.high_risk.keywords) {
      if (combined.includes(keyword)) {
        return 'high_risk';
      }
    }
    
    // Check medium risk indicators
    for (const keyword of this.riskCharacteristics.medium_risk.keywords) {
      if (combined.includes(keyword)) {
        return 'medium_risk';
      }
    }
    
    // Default to low risk
    return 'low_risk';
  }
  
  /**
   * Get threshold for a specific file
   */
  getThresholdForFile(filePath, content = '') {
    const riskLevel = this.determineRiskLevel(filePath, content);
    return this.riskCharacteristics[riskLevel].threshold;
  }
  
  /**
   * Analyze coverage results
   */
  analyzeCoverage(coverageData) {
    const analysis = {
      summary: {
        total_files: 0,
        files_meeting_threshold: 0,
        files_below_threshold: 0,
        overall_coverage: 0,
        risk_weighted_coverage: 0
      },
      by_risk_level: {
        high_risk: { files: 0, average_coverage: 0, below_threshold: [] },
        medium_risk: { files: 0, average_coverage: 0, below_threshold: [] },
        low_risk: { files: 0, average_coverage: 0, below_threshold: [] }
      },
      improvement_opportunities: [],
      coverage_gaps: []
    };
    
    let totalCoverage = 0;
    let weightedCoverage = 0;
    let totalWeight = 0;
    
    for (const [filePath, coverage] of Object.entries(coverageData)) {
      analysis.summary.total_files++;
      
      const riskLevel = this.determineRiskLevel(filePath);
      const threshold = this.getThresholdForFile(filePath);
      const riskData = analysis.by_risk_level[riskLevel];
      
      riskData.files++;
      totalCoverage += coverage.percentage;
      
      // Calculate weighted coverage based on risk
      const weight = riskLevel === 'high_risk' ? 3 : riskLevel === 'medium_risk' ? 2 : 1;
      weightedCoverage += coverage.percentage * weight;
      totalWeight += weight;
      
      if (coverage.percentage >= threshold) {
        analysis.summary.files_meeting_threshold++;
      } else {
        analysis.summary.files_below_threshold++;
        riskData.below_threshold.push({
          file: filePath,
          current: coverage.percentage,
          threshold: threshold,
          gap: threshold - coverage.percentage
        });
        
        // Add to improvement opportunities
        analysis.improvement_opportunities.push({
          file: filePath,
          risk_level: riskLevel,
          current_coverage: coverage.percentage,
          target_coverage: threshold,
          coverage_gap: threshold - coverage.percentage,
          uncovered_lines: coverage.uncovered_lines || []
        });
      }
      
      // Track coverage gaps
      if (coverage.uncovered_lines && coverage.uncovered_lines.length > 0) {
        analysis.coverage_gaps.push({
          file: filePath,
          uncovered_lines: coverage.uncovered_lines,
          uncovered_branches: coverage.uncovered_branches || [],
          suggested_tests: this.suggestTests(filePath, coverage)
        });
      }
    }
    
    // Calculate averages
    analysis.summary.overall_coverage = 
      analysis.summary.total_files > 0 
        ? totalCoverage / analysis.summary.total_files 
        : 0;
    
    analysis.summary.risk_weighted_coverage = 
      totalWeight > 0 
        ? weightedCoverage / totalWeight 
        : 0;
    
    // Calculate risk level averages
    for (const [level, data] of Object.entries(analysis.by_risk_level)) {
      if (data.files > 0) {
        const levelFiles = Object.entries(coverageData)
          .filter(([file]) => this.determineRiskLevel(file) === level);
        
        const levelTotal = levelFiles.reduce((sum, [, cov]) => sum + cov.percentage, 0);
        data.average_coverage = levelTotal / data.files;
      }
    }
    
    // Sort improvement opportunities by priority
    analysis.improvement_opportunities.sort((a, b) => {
      // Prioritize by risk level then by coverage gap
      const riskPriority = { high_risk: 3, medium_risk: 2, low_risk: 1 };
      const riskDiff = riskPriority[b.risk_level] - riskPriority[a.risk_level];
      
      return riskDiff !== 0 ? riskDiff : b.coverage_gap - a.coverage_gap;
    });
    
    return analysis;
  }
  
  /**
   * Suggest tests for uncovered code
   */
  suggestTests(filePath, coverage) {
    const suggestions = [];
    const fileName = path.basename(filePath);
    
    // Analyze uncovered lines to suggest test types
    if (coverage.uncovered_lines && Array.isArray(coverage.uncovered_lines)) {
      // For now, uncovered_lines are line numbers, not content
      // We'll make general suggestions based on file patterns
      const hasMany = coverage.uncovered_lines.length > 5;
      const hasErrorHandling = fileName.includes('error') || fileName.includes('exception');
      const hasEdgeCases = hasMany;
      const hasConditionals = hasMany;
      
      if (hasErrorHandling) {
        suggestions.push({
          type: 'error_handling',
          description: 'Add tests for error scenarios and exception handling',
          priority: 'high'
        });
      }
      
      if (hasEdgeCases) {
        suggestions.push({
          type: 'edge_cases',
          description: 'Add tests for null, undefined, and empty input cases',
          priority: 'medium'
        });
      }
      
      if (hasConditionals) {
        suggestions.push({
          type: 'branch_coverage',
          description: 'Add tests to cover all conditional branches',
          priority: 'medium'
        });
      }
    }
    
    // Add general suggestions based on file type
    if (fileName.includes('auth') || fileName.includes('security')) {
      suggestions.push({
        type: 'security_tests',
        description: 'Add security-focused tests for authentication and authorization',
        priority: 'high'
      });
    }
    
    if (fileName.includes('api') || fileName.includes('endpoint')) {
      suggestions.push({
        type: 'integration_tests',
        description: 'Add API integration tests with various request/response scenarios',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Track coverage improvement over time
   */
  trackImprovement(currentCoverage, previousCoverage) {
    const improvement = {
      timestamp: new Date().toISOString(),
      overall_change: currentCoverage.overall - previousCoverage.overall,
      files_improved: 0,
      files_degraded: 0,
      new_files_covered: 0,
      details: []
    };
    
    // Compare file-by-file coverage
    for (const [file, current] of Object.entries(currentCoverage.files)) {
      const previous = previousCoverage.files[file];
      
      if (!previous) {
        improvement.new_files_covered++;
      } else {
        const change = current.percentage - previous.percentage;
        
        if (change > 0) {
          improvement.files_improved++;
        } else if (change < 0) {
          improvement.files_degraded++;
        }
        
        if (Math.abs(change) > 0.1) {
          improvement.details.push({
            file: file,
            previous: previous.percentage,
            current: current.percentage,
            change: change
          });
        }
      }
    }
    
    return improvement;
  }
  
  /**
   * Generate coverage improvement plan
   */
  generateImprovementPlan(analysis, sprintCapacity = 20) {
    const plan = {
      sprint_goal: "Increase coverage by 5%",
      estimated_effort: 0,
      tasks: [],
      expected_improvement: 0
    };
    
    // Allocate 20% of sprint capacity to coverage improvement
    const coverageCapacity = sprintCapacity * 0.2;
    let remainingCapacity = coverageCapacity;
    
    // Prioritize high-risk files
    for (const opportunity of analysis.improvement_opportunities) {
      if (remainingCapacity <= 0) break;
      
      const effort = this.estimateTestingEffort(opportunity);
      
      if (effort <= remainingCapacity) {
        plan.tasks.push({
          file: opportunity.file,
          risk_level: opportunity.risk_level,
          current_coverage: opportunity.current_coverage,
          target_coverage: opportunity.target_coverage,
          estimated_effort: effort,
          priority: opportunity.risk_level === 'high_risk' ? 'critical' : 'high'
        });
        
        plan.estimated_effort += effort;
        remainingCapacity -= effort;
        plan.expected_improvement += opportunity.coverage_gap;
      }
    }
    
    return plan;
  }
  
  /**
   * Estimate testing effort for a file
   */
  estimateTestingEffort(opportunity) {
    // Base effort on coverage gap and risk level
    const gapFactor = opportunity.coverage_gap / 100;
    const riskMultiplier = 
      opportunity.risk_level === 'high_risk' ? 1.5 :
      opportunity.risk_level === 'medium_risk' ? 1.0 : 0.7;
    
    // Estimate 1-3 story points based on gap and risk
    const baseEffort = 1 + (gapFactor * 2);
    return Math.round(baseEffort * riskMultiplier * 10) / 10;
  }
  
  /**
   * Generate coverage report
   */
  generateReport(analysis) {
    const report = {
      meta: {
        document_type: "coverage_analysis_report",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      },
      executive_summary: {
        overall_health: this.calculateHealthRating(analysis),
        overall_coverage: `${analysis.summary.overall_coverage.toFixed(1)}%`,
        risk_weighted_coverage: `${analysis.summary.risk_weighted_coverage.toFixed(1)}%`,
        compliance_rate: `${(analysis.summary.files_meeting_threshold / analysis.summary.total_files * 100).toFixed(1)}%`
      },
      risk_breakdown: analysis.by_risk_level,
      top_priorities: analysis.improvement_opportunities.slice(0, 10),
      improvement_plan: this.generateImprovementPlan(analysis),
      recommendations: this.generateRecommendations(analysis)
    };
    
    return report;
  }
  
  /**
   * Calculate overall health rating
   */
  calculateHealthRating(analysis) {
    const weightedCoverage = analysis.summary.risk_weighted_coverage;
    
    if (weightedCoverage >= 90) return 'excellent';
    if (weightedCoverage >= 80) return 'good';
    if (weightedCoverage >= 70) return 'fair';
    if (weightedCoverage >= 60) return 'needs_improvement';
    return 'critical';
  }
  
  /**
   * Generate recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // High-risk files below threshold
    if (analysis.by_risk_level.high_risk.below_threshold.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        recommendation: `Address ${analysis.by_risk_level.high_risk.below_threshold.length} high-risk files below coverage threshold`,
        impact: 'Reduces security vulnerabilities and compliance risks'
      });
    }
    
    // Overall coverage improvement
    if (analysis.summary.overall_coverage < 80) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        recommendation: 'Implement sprint coverage goals to reach 80% overall coverage',
        impact: 'Improves code quality and reduces defect rates'
      });
    }
    
    // Automated test generation
    if (analysis.coverage_gaps.length > 10) {
      recommendations.push({
        priority: 'medium',
        category: 'automation',
        recommendation: 'Consider automated test generation for common patterns',
        impact: 'Accelerates coverage improvement and reduces manual effort'
      });
    }
    
    return recommendations;
  }
}

// Export the class and create instance
const coverageAnalyzer = new CoverageAnalyzer();

module.exports = {
  CoverageAnalyzer,
  coverageAnalyzer,
  
  // Convenience exports
  determineRiskLevel: (file, content) => coverageAnalyzer.determineRiskLevel(file, content),
  getThresholdForFile: (file, content) => coverageAnalyzer.getThresholdForFile(file, content),
  analyzeCoverage: (data) => coverageAnalyzer.analyzeCoverage(data),
  generateReport: (analysis) => coverageAnalyzer.generateReport(analysis)
};

// If run directly, create example analysis
if (require.main === module) {
  // Example coverage data
  const exampleCoverage = {
    'src/auth/login.js': { percentage: 75, uncovered_lines: [45, 67, 89] },
    'src/payments/stripe.js': { percentage: 65, uncovered_lines: [23, 34, 56, 78] },
    'src/utils/format.js': { percentage: 90, uncovered_lines: [12] },
    'src/components/Button.js': { percentage: 55, uncovered_lines: [8, 15, 22] }
  };
  
  const analysis = coverageAnalyzer.analyzeCoverage(exampleCoverage);
  const report = coverageAnalyzer.generateReport(analysis);
  
  console.log('📊 Coverage Analysis Complete');
  console.log('Overall Health:', report.executive_summary.overall_health);
  console.log('Risk-Weighted Coverage:', report.executive_summary.risk_weighted_coverage);
  console.log('Top Priority Files:', report.top_priorities.length);
  
  // Save thresholds
  coverageAnalyzer.saveThresholds();
}