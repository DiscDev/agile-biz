/**
 * Benchmark Analyzer
 * Compares team performance against community benchmarks
 */

const fs = require('fs');
const path = require('path');

class BenchmarkAnalyzer {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.communityDbPath = path.join(__dirname, 'community-velocity-db.json');
    
    // Load community database
    this.communityDb = this.loadCommunityDatabase();
  }
  
  /**
   * Load community velocity database
   */
  loadCommunityDatabase() {
    try {
      if (fs.existsSync(this.communityDbPath)) {
        return JSON.parse(fs.readFileSync(this.communityDbPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading community database:', error.message);
    }
    
    return null;
  }
  
  /**
   * Analyze team performance against benchmarks
   */
  analyzeTeamPerformance(teamMetrics) {
    if (!this.communityDb) {
      return {
        error: 'Community database not available',
        recommendations: ['Unable to compare against benchmarks']
      };
    }
    
    const analysis = {
      meta: {
        analysis_date: new Date().toISOString(),
        team_type: teamMetrics.project_type,
        team_size: teamMetrics.team_size
      },
      
      // Velocity comparison
      velocity_analysis: this.analyzeVelocity(teamMetrics),
      
      // Estimation comparison
      estimation_analysis: this.analyzeEstimation(teamMetrics),
      
      // Technology impact
      tech_stack_analysis: this.analyzeTechStack(teamMetrics),
      
      // Story pattern analysis
      story_pattern_analysis: this.analyzeStoryPatterns(teamMetrics),
      
      // Coverage comparison
      coverage_analysis: this.analyzeCoverage(teamMetrics),
      
      // Overall ranking
      overall_ranking: this.calculateOverallRanking(teamMetrics),
      
      // Improvement recommendations
      recommendations: []
    };
    
    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis);
    
    return analysis;
  }
  
  /**
   * Analyze velocity against benchmarks
   */
  analyzeVelocity(teamMetrics) {
    const benchmarks = this.getBenchmarks(teamMetrics.project_type, teamMetrics.team_size);
    const peerTeams = this.getPeerTeams(teamMetrics);
    
    const analysis = {
      team_velocity: teamMetrics.avg_velocity,
      benchmark_velocity: benchmarks.avg_velocity,
      peer_average: this.calculatePeerAverage(peerTeams, 'avg_velocity'),
      
      // Percentile ranking
      percentile: this.calculatePercentile(
        teamMetrics.avg_velocity,
        peerTeams.map(t => t.metrics.avg_velocity)
      ),
      
      // Variance analysis
      variance_from_benchmark: this.calculateVariance(
        teamMetrics.avg_velocity,
        benchmarks.avg_velocity
      ),
      
      // Trend
      performance_level: this.getPerformanceLevel(teamMetrics.avg_velocity, benchmarks),
      
      // Consistency
      velocity_consistency: this.analyzeVelocityConsistency(teamMetrics, peerTeams)
    };
    
    return analysis;
  }
  
  /**
   * Analyze estimation accuracy
   */
  analyzeEstimation(teamMetrics) {
    const benchmarks = this.getBenchmarks(teamMetrics.project_type, teamMetrics.team_size);
    const peerTeams = this.getPeerTeams(teamMetrics);
    
    const analysis = {
      team_accuracy: teamMetrics.estimation_accuracy,
      benchmark_accuracy: benchmarks.estimation_accuracy,
      peer_average: this.calculatePeerAverage(peerTeams, 'estimation_accuracy'),
      
      percentile: this.calculatePercentile(
        teamMetrics.estimation_accuracy,
        peerTeams.map(t => t.metrics.estimation_accuracy)
      ),
      
      accuracy_gap: teamMetrics.estimation_accuracy - benchmarks.estimation_accuracy,
      
      performance_level: 
        teamMetrics.estimation_accuracy >= 0.85 ? 'excellent' :
        teamMetrics.estimation_accuracy >= 0.75 ? 'good' :
        teamMetrics.estimation_accuracy >= 0.65 ? 'fair' : 'needs_improvement'
    };
    
    return analysis;
  }
  
  /**
   * Analyze technology stack impact
   */
  analyzeTechStack(teamMetrics) {
    const techStackTeams = this.getTeamsByTechStack(teamMetrics.tech_stack);
    
    const analysis = {
      tech_stack: teamMetrics.tech_stack,
      teams_with_similar_stack: techStackTeams.length,
      
      // Performance by tech stack
      tech_stack_velocity: {
        average: this.calculateAverage(techStackTeams, 'avg_velocity'),
        team_performance: teamMetrics.avg_velocity,
        relative_performance: 'calculating'
      },
      
      // Popular combinations
      common_patterns: this.findCommonTechPatterns(techStackTeams),
      
      // Technology-specific insights
      tech_insights: this.generateTechInsights(teamMetrics.tech_stack, techStackTeams)
    };
    
    // Calculate relative performance
    if (analysis.tech_stack_velocity.average > 0) {
      const ratio = teamMetrics.avg_velocity / analysis.tech_stack_velocity.average;
      analysis.tech_stack_velocity.relative_performance = 
        ratio > 1.1 ? 'above_average' :
        ratio < 0.9 ? 'below_average' : 'average';
    }
    
    return analysis;
  }
  
  /**
   * Analyze story patterns
   */
  analyzeStoryPatterns(teamMetrics) {
    const analysis = {
      team_patterns: teamMetrics.story_patterns || {},
      benchmark_patterns: this.getBenchmarkStoryPatterns(teamMetrics.project_type),
      insights: []
    };
    
    // Compare story sizes
    for (const [storyType, teamData] of Object.entries(analysis.team_patterns)) {
      const benchmarkData = analysis.benchmark_patterns[storyType];
      
      if (benchmarkData) {
        const variance = (teamData.avg_points - benchmarkData) / benchmarkData;
        
        if (Math.abs(variance) > 0.3) {
          analysis.insights.push({
            story_type: storyType,
            team_points: teamData.avg_points,
            benchmark_points: benchmarkData,
            variance: variance,
            interpretation: variance > 0 
              ? `Team estimates ${storyType} higher than average`
              : `Team estimates ${storyType} lower than average`
          });
        }
      }
    }
    
    return analysis;
  }
  
  /**
   * Analyze coverage achievements
   */
  analyzeCoverage(teamMetrics) {
    if (!teamMetrics.coverage_achievements) {
      return {
        available: false,
        message: 'No coverage data provided'
      };
    }
    
    const peerTeams = this.getPeerTeams(teamMetrics);
    const coverageTeams = peerTeams.filter(t => t.metrics.coverage_achievements);
    
    if (coverageTeams.length === 0) {
      return {
        available: false,
        message: 'No peer coverage data for comparison'
      };
    }
    
    const analysis = {
      team_coverage: teamMetrics.coverage_achievements.overall,
      peer_average: this.calculateCoverageAverage(coverageTeams),
      
      critical_code_coverage: {
        team: teamMetrics.coverage_achievements.critical_code,
        peer_average: this.calculateCoverageAverage(coverageTeams, 'critical_code')
      },
      
      improvement_rate: {
        team: teamMetrics.coverage_achievements.improvement_rate,
        peer_average: this.calculateCoverageAverage(coverageTeams, 'improvement_rate')
      },
      
      performance_level: this.getCoveragePerformanceLevel(teamMetrics.coverage_achievements)
    };
    
    return analysis;
  }
  
  /**
   * Calculate overall team ranking
   */
  calculateOverallRanking(teamMetrics) {
    const peerTeams = this.getPeerTeams(teamMetrics);
    
    if (peerTeams.length < 3) {
      return {
        rank: 'insufficient_data',
        total_teams: peerTeams.length,
        percentile: 0
      };
    }
    
    // Calculate composite score
    const scores = peerTeams.map(team => this.calculateCompositeScore(team.metrics));
    const teamScore = this.calculateCompositeScore(teamMetrics);
    
    scores.push(teamScore);
    scores.sort((a, b) => b - a);
    
    const rank = scores.indexOf(teamScore) + 1;
    const percentile = ((scores.length - rank) / scores.length * 100).toFixed(0);
    
    return {
      rank: rank,
      total_teams: scores.length,
      percentile: parseInt(percentile),
      score: teamScore,
      performance_tier: 
        percentile >= 80 ? 'top_performer' :
        percentile >= 60 ? 'above_average' :
        percentile >= 40 ? 'average' :
        percentile >= 20 ? 'below_average' : 'needs_improvement'
    };
  }
  
  /**
   * Calculate composite performance score
   */
  calculateCompositeScore(metrics) {
    let score = 0;
    
    // Velocity (40% weight)
    score += (metrics.avg_velocity / 50) * 40; // Normalize to 50 as baseline
    
    // Estimation accuracy (30% weight)
    score += metrics.estimation_accuracy * 30;
    
    // Coverage (30% weight) if available
    if (metrics.coverage_achievements) {
      score += metrics.coverage_achievements.overall * 30;
    } else {
      score += 0.7 * 30; // Default 70% if not provided
    }
    
    return score;
  }
  
  /**
   * Generate improvement recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Velocity recommendations
    if (analysis.velocity_analysis.performance_level === 'below_average') {
      recommendations.push({
        category: 'velocity',
        priority: 'high',
        recommendation: 'Focus on removing blockers and improving team efficiency',
        specific_actions: [
          'Conduct retrospective on common blockers',
          'Improve story breakdown to reduce complexity',
          'Consider pair programming for knowledge sharing'
        ]
      });
    }
    
    if (analysis.velocity_analysis.velocity_consistency === 'low') {
      recommendations.push({
        category: 'velocity',
        priority: 'medium',
        recommendation: 'Improve sprint planning consistency',
        specific_actions: [
          'Standardize story point estimation',
          'Maintain consistent sprint capacity',
          'Track and address scope changes'
        ]
      });
    }
    
    // Estimation recommendations
    if (analysis.estimation_analysis.accuracy_gap < -0.1) {
      recommendations.push({
        category: 'estimation',
        priority: 'high',
        recommendation: 'Improve estimation accuracy',
        specific_actions: [
          'Implement planning poker for all stories',
          'Review historical estimates vs actuals',
          'Break down large stories into smaller tasks'
        ]
      });
    }
    
    // Technology recommendations
    if (analysis.tech_stack_analysis.tech_stack_velocity.relative_performance === 'below_average') {
      recommendations.push({
        category: 'technology',
        priority: 'medium',
        recommendation: 'Optimize technology usage',
        specific_actions: [
          'Review common patterns from high-performing teams',
          'Invest in team training for key technologies',
          'Consider automation tools used by peer teams'
        ]
      });
    }
    
    // Story pattern recommendations
    for (const insight of analysis.story_pattern_analysis.insights) {
      if (insight.variance > 0.5) {
        recommendations.push({
          category: 'story_patterns',
          priority: 'low',
          recommendation: `Review estimation for ${insight.story_type} stories`,
          specific_actions: [
            `Current estimate (${insight.team_points}) is significantly higher than benchmark (${insight.benchmark_points})`,
            'Consider if additional complexity is justified',
            'Look for opportunities to simplify implementation'
          ]
        });
      }
    }
    
    // Coverage recommendations
    if (analysis.coverage_analysis.available && 
        analysis.coverage_analysis.team_coverage < analysis.coverage_analysis.peer_average - 0.1) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        recommendation: 'Improve test coverage',
        specific_actions: [
          'Allocate dedicated time for test writing',
          'Focus on critical code paths first',
          'Implement test coverage gates in CI/CD'
        ]
      });
    }
    
    // Overall performance recommendations
    if (analysis.overall_ranking.performance_tier === 'needs_improvement') {
      recommendations.push({
        category: 'overall',
        priority: 'critical',
        recommendation: 'Comprehensive performance improvement needed',
        specific_actions: [
          'Conduct detailed retrospective with external facilitator',
          'Review and optimize all team processes',
          'Consider mentoring from high-performing teams',
          'Set incremental improvement goals for each sprint'
        ]
      });
    }
    
    return recommendations;
  }
  
  /**
   * Get benchmarks for project type and team size
   */
  getBenchmarks(projectType, teamSize) {
    const benchmarks = this.communityDb.industry_benchmarks[projectType];
    
    if (!benchmarks) {
      return {
        avg_velocity: 25,
        estimation_accuracy: 0.75,
        common_story_sizes: {}
      };
    }
    
    // Select appropriate team size category
    const sizeCategory = teamSize <= 3 ? 'small_team' : 
                        teamSize <= 6 ? 'medium_team' : 'large_team';
    
    return benchmarks[sizeCategory] || benchmarks.small_team || {
      avg_velocity: 25,
      estimation_accuracy: 0.75,
      common_story_sizes: {}
    };
  }
  
  /**
   * Get peer teams with similar characteristics
   */
  getPeerTeams(teamMetrics) {
    if (!this.communityDb.contributions) return [];
    
    return this.communityDb.contributions.filter(team => 
      team.project_type === teamMetrics.project_type &&
      Math.abs(team.team_size - teamMetrics.team_size) <= 2
    );
  }
  
  /**
   * Get teams by technology stack
   */
  getTeamsByTechStack(techStack) {
    if (!this.communityDb.contributions) return [];
    
    return this.communityDb.contributions.filter(team => {
      const overlap = team.tech_stack.filter(tech => techStack.includes(tech));
      return overlap.length >= Math.min(2, techStack.length);
    });
  }
  
  /**
   * Calculate percentile ranking
   */
  calculatePercentile(value, values) {
    if (values.length === 0) return 50;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    
    if (index === -1) return 100;
    if (index === 0) return 0;
    
    return Math.round((index / values.length) * 100);
  }
  
  /**
   * Calculate variance
   */
  calculateVariance(actual, expected) {
    if (expected === 0) return 0;
    return ((actual - expected) / expected * 100).toFixed(1);
  }
  
  /**
   * Get performance level
   */
  getPerformanceLevel(velocity, benchmarks) {
    const ratio = velocity / benchmarks.avg_velocity;
    
    if (ratio >= 1.2) return 'excellent';
    if (ratio >= 1.0) return 'above_average';
    if (ratio >= 0.8) return 'average';
    return 'below_average';
  }
  
  /**
   * Analyze velocity consistency
   */
  analyzeVelocityConsistency(teamMetrics, peerTeams) {
    if (!teamMetrics.velocity_range) return 'unknown';
    
    const range = teamMetrics.velocity_range.max - teamMetrics.velocity_range.min;
    const variability = range / teamMetrics.avg_velocity;
    
    if (variability < 0.3) return 'high';
    if (variability < 0.5) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate peer average
   */
  calculatePeerAverage(peerTeams, metric) {
    if (peerTeams.length === 0) return 0;
    
    const sum = peerTeams.reduce((total, team) => {
      const value = metric.includes('.') 
        ? metric.split('.').reduce((obj, key) => obj[key], team.metrics)
        : team.metrics[metric];
      return total + (value || 0);
    }, 0);
    
    return sum / peerTeams.length;
  }
  
  /**
   * Calculate average
   */
  calculateAverage(teams, metric) {
    if (teams.length === 0) return 0;
    
    const sum = teams.reduce((total, team) => 
      total + (team.metrics[metric] || 0), 0
    );
    
    return sum / teams.length;
  }
  
  /**
   * Find common technology patterns
   */
  findCommonTechPatterns(teams) {
    const patterns = {};
    
    for (const team of teams) {
      const stackKey = team.tech_stack.sort().join(',');
      patterns[stackKey] = (patterns[stackKey] || 0) + 1;
    }
    
    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([stack, count]) => ({
        stack: stack.split(','),
        teams: count,
        percentage: ((count / teams.length) * 100).toFixed(0) + '%'
      }));
  }
  
  /**
   * Generate technology insights
   */
  generateTechInsights(techStack, teams) {
    const insights = [];
    
    // Framework-specific insights
    if (techStack.includes('react')) {
      insights.push('React teams typically show 10-15% higher velocity after 3 sprints');
    }
    
    if (techStack.includes('node')) {
      insights.push('Node.js teams excel at API development (3-5 points per endpoint)');
    }
    
    // Database insights
    if (techStack.includes('postgres')) {
      insights.push('PostgreSQL teams show consistent performance with complex queries');
    }
    
    return insights;
  }
  
  /**
   * Get benchmark story patterns
   */
  getBenchmarkStoryPatterns(projectType) {
    const benchmarks = this.getBenchmarks(projectType, 3);
    return benchmarks.common_story_sizes || {};
  }
  
  /**
   * Calculate coverage average
   */
  calculateCoverageAverage(teams, metric = 'overall') {
    const values = teams
      .map(t => t.metrics.coverage_achievements[metric])
      .filter(v => v !== undefined);
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }
  
  /**
   * Get coverage performance level
   */
  getCoveragePerformanceLevel(coverage) {
    if (coverage.overall >= 0.9 && coverage.critical_code >= 0.95) return 'excellent';
    if (coverage.overall >= 0.8 && coverage.critical_code >= 0.9) return 'good';
    if (coverage.overall >= 0.7 && coverage.critical_code >= 0.85) return 'fair';
    return 'needs_improvement';
  }
  
  /**
   * Generate benchmark report
   */
  generateBenchmarkReport(teamMetrics) {
    const analysis = this.analyzeTeamPerformance(teamMetrics);
    
    return {
      executive_summary: {
        overall_performance: analysis.overall_ranking.performance_tier,
        percentile_rank: analysis.overall_ranking.percentile,
        key_strengths: this.identifyStrengths(analysis),
        key_weaknesses: this.identifyWeaknesses(analysis),
        top_recommendation: analysis.recommendations[0] || null
      },
      
      detailed_analysis: analysis,
      
      action_plan: this.createActionPlan(analysis.recommendations),
      
      peer_comparison: {
        similar_teams: analysis.velocity_analysis.peer_average ? 'available' : 'limited_data',
        your_position: analysis.overall_ranking
      }
    };
  }
  
  /**
   * Identify team strengths
   */
  identifyStrengths(analysis) {
    const strengths = [];
    
    if (analysis.velocity_analysis.performance_level === 'excellent' || 
        analysis.velocity_analysis.performance_level === 'above_average') {
      strengths.push('Strong velocity performance');
    }
    
    if (analysis.estimation_analysis.performance_level === 'excellent' || 
        analysis.estimation_analysis.performance_level === 'good') {
      strengths.push('Accurate estimation capabilities');
    }
    
    if (analysis.coverage_analysis.available && 
        analysis.coverage_analysis.performance_level === 'excellent') {
      strengths.push('Excellent test coverage');
    }
    
    return strengths;
  }
  
  /**
   * Identify team weaknesses
   */
  identifyWeaknesses(analysis) {
    const weaknesses = [];
    
    if (analysis.velocity_analysis.performance_level === 'below_average') {
      weaknesses.push('Below average velocity');
    }
    
    if (analysis.estimation_analysis.performance_level === 'needs_improvement') {
      weaknesses.push('Poor estimation accuracy');
    }
    
    if (analysis.velocity_analysis.velocity_consistency === 'low') {
      weaknesses.push('Inconsistent sprint velocity');
    }
    
    return weaknesses;
  }
  
  /**
   * Create action plan from recommendations
   */
  createActionPlan(recommendations) {
    const plan = {
      immediate_actions: [],
      short_term_goals: [],
      long_term_improvements: []
    };
    
    for (const rec of recommendations) {
      if (rec.priority === 'critical' || rec.priority === 'high') {
        plan.immediate_actions.push({
          action: rec.recommendation,
          category: rec.category,
          timeline: 'Next sprint'
        });
      } else if (rec.priority === 'medium') {
        plan.short_term_goals.push({
          action: rec.recommendation,
          category: rec.category,
          timeline: 'Next 3 sprints'
        });
      } else {
        plan.long_term_improvements.push({
          action: rec.recommendation,
          category: rec.category,
          timeline: 'Next quarter'
        });
      }
    }
    
    return plan;
  }
}

// Export the class and create instance
const benchmarkAnalyzer = new BenchmarkAnalyzer();

module.exports = {
  BenchmarkAnalyzer,
  benchmarkAnalyzer,
  
  // Convenience exports
  analyzeTeamPerformance: (metrics) => benchmarkAnalyzer.analyzeTeamPerformance(metrics),
  generateBenchmarkReport: (metrics) => benchmarkAnalyzer.generateBenchmarkReport(metrics)
};

// If run directly, demonstrate benchmark analysis
if (require.main === module) {
  console.log('📊 Benchmark Analysis Demo');
  
  // Example team metrics
  const teamMetrics = {
    project_type: 'web_application',
    tech_stack: ['react', 'node', 'postgres'],
    team_size: 3,
    avg_velocity: 26,
    velocity_range: { min: 20, max: 32 },
    estimation_accuracy: 0.78,
    story_patterns: {
      authentication: { avg_points: 5, completion_rate: 0.92 },
      crud_operations: { avg_points: 3, completion_rate: 0.95 },
      ui_components: { avg_points: 5, completion_rate: 0.90 }
    },
    coverage_achievements: {
      overall: 0.82,
      critical_code: 0.90,
      improvement_rate: 0.04
    }
  };
  
  const report = benchmarkAnalyzer.generateBenchmarkReport(teamMetrics);
  
  console.log('\nExecutive Summary:');
  console.log('Overall Performance:', report.executive_summary.overall_performance);
  console.log('Percentile Rank:', report.executive_summary.percentile_rank + '%');
  console.log('Key Strengths:', report.executive_summary.key_strengths);
  console.log('Key Weaknesses:', report.executive_summary.key_weaknesses);
  
  console.log('\nTop Recommendation:');
  if (report.executive_summary.top_recommendation) {
    console.log('-', report.executive_summary.top_recommendation.recommendation);
  }
  
  console.log('\nAction Plan:');
  console.log('Immediate Actions:', report.action_plan.immediate_actions.length);
  console.log('Short-term Goals:', report.action_plan.short_term_goals.length);
  console.log('Long-term Improvements:', report.action_plan.long_term_improvements.length);
}