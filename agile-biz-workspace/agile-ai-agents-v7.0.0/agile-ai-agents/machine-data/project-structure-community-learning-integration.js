/**
 * Project Structure Agent - Community Learning Integration
 * Integrates with the Community Learning System to learn from repository patterns
 */

const fs = require('fs');
const path = require('path');
const RepositoryPatternRecognizer = require('./repository-pattern-recognizer');
const RepositoryRecommendationEngine = require('./repository-recommendation-engine');

class ProjectStructureCommunityLearningIntegration {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.patternRecognizer = new RepositoryPatternRecognizer(projectRoot);
    this.recommendationEngine = new RepositoryRecommendationEngine(projectRoot);
    this.contributionsPath = path.join(projectRoot, 'community-learnings', 'contributions');
    this.learningDataPath = path.join(projectRoot, 'machine-data', 'community-learning-data.json');
    this.loadLearningData();
  }

  /**
   * Load or initialize community learning data
   */
  loadLearningData() {
    if (fs.existsSync(this.learningDataPath)) {
      this.learningData = JSON.parse(fs.readFileSync(this.learningDataPath, 'utf8'));
    } else {
      this.initializeLearningData();
    }
  }

  /**
   * Initialize learning data structure
   */
  initializeLearningData() {
    this.learningData = {
      version: "1.0.0",
      last_updated: new Date().toISOString(),
      patterns: {
        repository_evolutions: [],
        industry_patterns: {},
        technology_patterns: {},
        team_size_patterns: {}
      },
      learning_history: [],
      broadcast_subscriptions: [
        "repository_structure",
        "evolution_patterns",
        "multi_repo_coordination"
      ],
      confidence_thresholds: {
        min_pattern_occurrences: 3,
        min_confidence_score: 0.7,
        validation_period_days: 7
      }
    };
    this.saveLearningData();
  }

  /**
   * Analyze repository evolution patterns from community contributions
   */
  async analyzeContributions() {
    if (!fs.existsSync(this.contributionsPath)) {
      console.log('No community contributions found');
      return;
    }

    const contributions = fs.readdirSync(this.contributionsPath);
    let newPatterns = 0;

    for (const contributionDir of contributions) {
      const contributionPath = path.join(this.contributionsPath, contributionDir);
      
      if (fs.statSync(contributionPath).isDirectory()) {
        try {
          const patterns = await this.extractRepositoryPatternsFromContribution(contributionPath);
          if (patterns.length > 0) {
            newPatterns += patterns.length;
            this.integratePatternsIntoLearning(patterns);
          }
        } catch (error) {
          console.error(`Error processing contribution ${contributionDir}:`, error.message);
        }
      }
    }

    if (newPatterns > 0) {
      await this.generateUpdatedRecommendations();
      this.saveLearningData();
      console.log(`Processed ${newPatterns} new repository patterns from community contributions`);
    }

    return {
      contributions_processed: contributions.length,
      new_patterns: newPatterns,
      total_patterns: this.learningData.patterns.repository_evolutions.length
    };
  }

  /**
   * Extract repository patterns from a single contribution
   */
  async extractRepositoryPatternsFromContribution(contributionPath) {
    const patterns = [];
    
    // Check for required files
    const learningsPath = path.join(contributionPath, 'learnings.md');
    const summaryPath = path.join(contributionPath, 'project-summary.md');
    const privacyScanPath = path.join(contributionPath, 'privacy-scan-report.json');

    if (!fs.existsSync(learningsPath) || !fs.existsSync(summaryPath)) {
      return patterns;
    }

    // Load and parse files
    const learnings = fs.readFileSync(learningsPath, 'utf8');
    const summary = fs.readFileSync(summaryPath, 'utf8');
    let privacyScan = null;
    
    if (fs.existsSync(privacyScanPath)) {
      privacyScan = JSON.parse(fs.readFileSync(privacyScanPath, 'utf8'));
    }

    // Extract repository evolution data
    const evolution = this.extractEvolutionData(learnings);
    if (evolution) {
      const projectInfo = this.extractProjectInfo(summary);
      const anonymizedPattern = this.anonymizePattern({
        id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        project_type: projectInfo.type,
        industry: projectInfo.industry,
        technology_stack: projectInfo.technology,
        team_size: projectInfo.team_size,
        evolution: evolution,
        metrics: this.extractMetrics(learnings),
        lessons_learned: this.extractLessonsLearned(learnings),
        success_indicators: this.extractSuccessIndicators(learnings),
        timestamp: new Date().toISOString(),
        source: 'community_contribution',
        privacy_validated: privacyScan?.passed || false
      });

      patterns.push(anonymizedPattern);
    }

    return patterns;
  }

  /**
   * Extract evolution timeline from learnings markdown
   */
  extractEvolutionData(learnings) {
    const evolutionSection = this.extractSection(learnings, 'Repository Evolution');
    if (!evolutionSection) return null;

    const timeline = [];
    const timelineMatches = evolutionSection.match(/- date: "([^"]+)"\s+action: "([^"]+)"\s+from: "([^"]+)"\s+to: "([^"]+)"\s+impact: \[([^\]]+)\]/g);
    
    if (timelineMatches) {
      timelineMatches.forEach(match => {
        const [, date, action, from, to, impact] = match.match(/- date: "([^"]+)"\s+action: "([^"]+)"\s+from: "([^"]+)"\s+to: "([^"]+)"\s+impact: \[([^\]]+)\]/);
        timeline.push({
          date,
          action,
          from,
          to,
          impact: impact.split(',').map(i => i.trim().replace(/"/g, ''))
        });
      });
    }

    return timeline.length > 0 ? timeline : null;
  }

  /**
   * Extract project information from summary
   */
  extractProjectInfo(summary) {
    const info = {
      type: 'general',
      industry: 'general',
      technology: {},
      team_size: 'unknown'
    };

    // Extract project type
    const typeMatch = summary.match(/Type:\s*([^\n]+)/i);
    if (typeMatch) {
      info.type = typeMatch[1].trim().toLowerCase();
    }

    // Extract industry
    const industryMatch = summary.match(/Industry:\s*([^\n]+)/i);
    if (industryMatch) {
      info.industry = industryMatch[1].trim().toLowerCase();
    }

    // Extract technology stack
    const techSection = this.extractSection(summary, 'Technology Stack');
    if (techSection) {
      const frontendMatch = techSection.match(/Frontend:\s*([^\n]+)/i);
      const backendMatch = techSection.match(/Backend:\s*([^\n]+)/i);
      const databaseMatch = techSection.match(/Database:\s*([^\n]+)/i);
      
      if (frontendMatch) info.technology.frontend = frontendMatch[1].trim();
      if (backendMatch) info.technology.backend = backendMatch[1].trim();
      if (databaseMatch) info.technology.database = databaseMatch[1].trim();
    }

    // Extract team size
    const teamMatch = summary.match(/Team Size:\s*(\d+)/i);
    if (teamMatch) {
      const size = parseInt(teamMatch[1]);
      if (size <= 3) info.team_size = 'small';
      else if (size <= 10) info.team_size = 'medium';
      else info.team_size = 'large';
    }

    return info;
  }

  /**
   * Extract metrics from learnings
   */
  extractMetrics(learnings) {
    const metrics = {};
    
    // Look for metrics in various formats
    const buildTimeMatch = learnings.match(/build time.*?(\d+).*?seconds/i);
    if (buildTimeMatch) {
      metrics.build_time_improvement = parseInt(buildTimeMatch[1]);
    }

    const deploymentMatch = learnings.match(/deployment.*?(\d+)%.*?improvement/i);
    if (deploymentMatch) {
      metrics.deployment_improvement = parseInt(deploymentMatch[1]);
    }

    const conflictMatch = learnings.match(/merge conflicts.*?reduced.*?(\d+)%/i);
    if (conflictMatch) {
      metrics.conflict_reduction = parseInt(conflictMatch[1]);
    }

    return metrics;
  }

  /**
   * Extract lessons learned
   */
  extractLessonsLearned(learnings) {
    const lessonsSection = this.extractSection(learnings, 'Lessons Learned');
    if (!lessonsSection) return [];

    const lessons = [];
    const bulletPoints = lessonsSection.match(/^- (.+)$/gm);
    if (bulletPoints) {
      bulletPoints.forEach(bullet => {
        lessons.push(bullet.replace(/^- /, '').trim());
      });
    }

    return lessons;
  }

  /**
   * Extract success indicators
   */
  extractSuccessIndicators(learnings) {
    const indicators = [];
    
    // Look for positive outcome indicators
    const positivePatterns = [
      /reduced.*?(\d+)%/gi,
      /improved.*?(\d+)%/gi,
      /faster.*?(\d+)%/gi,
      /eliminated.*?conflicts/gi,
      /streamlined.*?deployment/gi
    ];

    positivePatterns.forEach(pattern => {
      const matches = learnings.match(pattern);
      if (matches) {
        indicators.push(...matches);
      }
    });

    return indicators;
  }

  /**
   * Anonymize pattern data for privacy
   */
  anonymizePattern(pattern) {
    // Remove or anonymize sensitive information
    const anonymized = { ...pattern };
    
    // Anonymize company names
    if (anonymized.lessons_learned) {
      anonymized.lessons_learned = anonymized.lessons_learned.map(lesson => 
        lesson.replace(/\b[A-Z][a-z]+ (Inc|Corp|LLC|Ltd|Company)\b/g, '[Company Name]')
               .replace(/\bhttps?:\/\/[^\s]+/g, '[URL]')
               .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP Address]')
      );
    }

    // Remove any potential PII
    delete anonymized.project_name;
    delete anonymized.company_name;
    delete anonymized.developer_names;

    return anonymized;
  }

  /**
   * Integrate new patterns into learning system
   */
  integratePatternsIntoLearning(patterns) {
    patterns.forEach(pattern => {
      // Add to repository evolutions
      this.learningData.patterns.repository_evolutions.push(pattern);

      // Update industry patterns
      if (!this.learningData.patterns.industry_patterns[pattern.industry]) {
        this.learningData.patterns.industry_patterns[pattern.industry] = [];
      }
      this.learningData.patterns.industry_patterns[pattern.industry].push(pattern.id);

      // Update technology patterns
      if (pattern.technology_stack.frontend) {
        const frontend = pattern.technology_stack.frontend.toLowerCase();
        if (!this.learningData.patterns.technology_patterns[frontend]) {
          this.learningData.patterns.technology_patterns[frontend] = [];
        }
        this.learningData.patterns.technology_patterns[frontend].push(pattern.id);
      }

      // Update team size patterns
      if (!this.learningData.patterns.team_size_patterns[pattern.team_size]) {
        this.learningData.patterns.team_size_patterns[pattern.team_size] = [];
      }
      this.learningData.patterns.team_size_patterns[pattern.team_size].push(pattern.id);
    });

    // Record learning event
    this.learningData.learning_history.push({
      timestamp: new Date().toISOString(),
      event: 'patterns_integrated',
      count: patterns.length,
      sources: patterns.map(p => p.source)
    });
  }

  /**
   * Generate updated recommendations based on new patterns
   */
  async generateUpdatedRecommendations() {
    // Update pattern recognizer with new data
    await this.patternRecognizer.updatePatternsFromCommunityData(this.learningData.patterns);
    
    // Update recommendation engine
    this.recommendationEngine.patternRecognizer = this.patternRecognizer;
    
    // Generate pattern summary for broadcasting
    const patternSummary = this.generatePatternSummary();
    
    // Prepare for learning broadcast
    await this.prepareLearningBroadcast(patternSummary);
  }

  /**
   * Generate pattern summary for learning broadcasts
   */
  generatePatternSummary() {
    const patterns = this.learningData.patterns.repository_evolutions;
    const summary = {
      total_patterns: patterns.length,
      recent_patterns: patterns.filter(p => 
        new Date(p.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      industry_insights: {},
      technology_insights: {},
      common_evolutions: []
    };

    // Analyze industry patterns
    Object.entries(this.learningData.patterns.industry_patterns).forEach(([industry, patternIds]) => {
      const industryPatterns = patterns.filter(p => patternIds.includes(p.id));
      summary.industry_insights[industry] = {
        count: industryPatterns.length,
        common_evolution: this.findMostCommonEvolution(industryPatterns),
        avg_team_size: this.calculateAverageTeamSize(industryPatterns)
      };
    });

    // Analyze technology patterns
    Object.entries(this.learningData.patterns.technology_patterns).forEach(([tech, patternIds]) => {
      const techPatterns = patterns.filter(p => patternIds.includes(p.id));
      summary.technology_insights[tech] = {
        count: techPatterns.length,
        preferred_structure: this.findPreferredStructure(techPatterns),
        success_rate: this.calculateSuccessRate(techPatterns)
      };
    });

    // Find common evolution patterns
    summary.common_evolutions = this.identifyCommonEvolutionPatterns(patterns);

    return summary;
  }

  /**
   * Handle learning broadcast from Learning Analysis Agent
   */
  async handleLearningBroadcast(broadcast) {
    if (!this.learningData.broadcast_subscriptions.includes(broadcast.type)) {
      return { accepted: false, reason: 'Not subscribed to this broadcast type' };
    }

    const { pattern, confidence, validation_data } = broadcast;
    
    // Validate confidence threshold
    if (confidence < this.learningData.confidence_thresholds.min_confidence_score) {
      return { accepted: false, reason: 'Confidence below threshold' };
    }

    // Integrate the broadcast pattern
    const integration_result = await this.integrateBroadcastPattern(pattern, confidence, validation_data);
    
    // Update version if successful
    if (integration_result.success) {
      await this.updateAgentVersion(broadcast);
    }

    return integration_result;
  }

  /**
   * Integrate pattern from learning broadcast
   */
  async integrateBroadcastPattern(pattern, confidence, validation_data) {
    try {
      // Add pattern to learning data
      const integratedPattern = {
        ...pattern,
        source: 'learning_broadcast',
        confidence: confidence,
        validation_data: validation_data,
        integrated_at: new Date().toISOString()
      };

      this.learningData.patterns.repository_evolutions.push(integratedPattern);
      
      // Update pattern recognizer
      await this.patternRecognizer.updatePatterns(integratedPattern);
      
      // Update recommendation engine
      this.recommendationEngine.patternRecognizer = this.patternRecognizer;
      
      this.saveLearningData();
      
      return {
        success: true,
        pattern_id: integratedPattern.id,
        expected_impact: this.estimatePatternImpact(integratedPattern)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update agent version after successful learning integration
   */
  async updateAgentVersion(broadcast) {
    const versionPath = path.join(this.projectRoot, 'machine-data', 'ai-agents-json', 'project_structure_agent.json');
    
    if (fs.existsSync(versionPath)) {
      const agentData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      const currentVersion = agentData.meta.version || '1.0.0';
      const dateSuffix = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const newVersion = `${currentVersion}+${dateSuffix}.${broadcast.improvement_id || '1'}`;
      
      agentData.meta.version = newVersion;
      agentData.meta.last_learning_update = new Date().toISOString();
      agentData.meta.learning_source = broadcast.source;
      
      fs.writeFileSync(versionPath, JSON.stringify(agentData, null, 2));
    }
  }

  /**
   * Helper methods
   */
  
  extractSection(content, sectionTitle) {
    const regex = new RegExp(`## ${sectionTitle}([\\s\\S]*?)(?=## |$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  findMostCommonEvolution(patterns) {
    const evolutions = {};
    patterns.forEach(pattern => {
      if (pattern.evolution && pattern.evolution.length > 0) {
        const evolution = pattern.evolution[pattern.evolution.length - 1]; // Last evolution
        const key = `${evolution.from}->${evolution.to}`;
        evolutions[key] = (evolutions[key] || 0) + 1;
      }
    });
    
    return Object.entries(evolutions).reduce((a, b) => evolutions[a[0]] > evolutions[b[0]] ? a : b, ['', 0])[0];
  }

  calculateAverageTeamSize(patterns) {
    const sizes = patterns.map(p => {
      switch (p.team_size) {
        case 'small': return 2;
        case 'medium': return 6;
        case 'large': return 15;
        default: return 5;
      }
    });
    return sizes.reduce((a, b) => a + b, 0) / sizes.length;
  }

  findPreferredStructure(patterns) {
    const structures = {};
    patterns.forEach(pattern => {
      if (pattern.evolution && pattern.evolution.length > 0) {
        const finalStructure = pattern.evolution[pattern.evolution.length - 1].to;
        structures[finalStructure] = (structures[finalStructure] || 0) + 1;
      }
    });
    
    return Object.entries(structures).reduce((a, b) => structures[a[0]] > structures[b[0]] ? a : b, ['single-repo', 0])[0];
  }

  calculateSuccessRate(patterns) {
    const successful = patterns.filter(p => 
      p.success_indicators && p.success_indicators.length > 0
    ).length;
    return patterns.length > 0 ? (successful / patterns.length) * 100 : 0;
  }

  identifyCommonEvolutionPatterns(patterns) {
    const evolutions = {};
    patterns.forEach(pattern => {
      if (pattern.evolution) {
        pattern.evolution.forEach(evo => {
          const key = `${evo.from}->${evo.to}`;
          if (!evolutions[key]) {
            evolutions[key] = { count: 0, reasons: {}, impacts: [] };
          }
          evolutions[key].count++;
          
          if (evo.reason) {
            evolutions[key].reasons[evo.reason] = (evolutions[key].reasons[evo.reason] || 0) + 1;
          }
          
          if (evo.impact) {
            evolutions[key].impacts.push(...evo.impact);
          }
        });
      }
    });
    
    // Return evolutions with at least 3 occurrences
    return Object.entries(evolutions)
      .filter(([, data]) => data.count >= this.learningData.confidence_thresholds.min_pattern_occurrences)
      .map(([evolution, data]) => ({
        evolution,
        count: data.count,
        confidence: Math.min(data.count / 10, 1), // Cap at 1.0
        common_reasons: Object.entries(data.reasons).sort((a, b) => b[1] - a[1]).slice(0, 3),
        typical_impacts: [...new Set(data.impacts)].slice(0, 5)
      }));
  }

  estimatePatternImpact(pattern) {
    const impact = {
      recommendation_accuracy: '+15%',
      pattern_confidence: '+10%',
      evolution_prediction: '+20%'
    };
    
    if (pattern.metrics) {
      if (pattern.metrics.build_time_improvement) {
        impact.build_time_predictions = `+${Math.min(pattern.metrics.build_time_improvement, 50)}%`;
      }
      if (pattern.metrics.deployment_improvement) {
        impact.deployment_success = `+${Math.min(pattern.metrics.deployment_improvement, 30)}%`;
      }
    }
    
    return impact;
  }

  async prepareLearningBroadcast(patternSummary) {
    // This would integrate with the Learning Broadcast System
    const broadcast = {
      type: 'repository_structure_patterns',
      source: 'project_structure_agent',
      timestamp: new Date().toISOString(),
      data: patternSummary,
      confidence: this.calculateOverallConfidence(patternSummary),
      target_agents: [
        'project_manager_agent',
        'coder_agent',
        'devops_agent',
        'prd_agent'
      ]
    };

    // Save broadcast for learning system pickup
    const broadcastPath = path.join(
      this.projectRoot,
      'machine-data',
      'learning-broadcasts',
      `psa-broadcast-${Date.now()}.json`
    );
    
    fs.writeFileSync(broadcastPath, JSON.stringify(broadcast, null, 2));
    
    return broadcast;
  }

  calculateOverallConfidence(patternSummary) {
    const totalPatterns = patternSummary.total_patterns;
    if (totalPatterns < 3) return 0.3;
    if (totalPatterns < 10) return 0.5;
    if (totalPatterns < 25) return 0.7;
    if (totalPatterns < 50) return 0.8;
    return 0.9;
  }

  saveLearningData() {
    this.learningData.last_updated = new Date().toISOString();
    
    // Ensure directory exists
    const dir = path.dirname(this.learningDataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.learningDataPath, JSON.stringify(this.learningData, null, 2));
  }

  /**
   * Generate community learning report
   */
  generateLearningReport() {
    const patterns = this.learningData.patterns.repository_evolutions;
    const report = {
      summary: {
        total_patterns: patterns.length,
        last_updated: this.learningData.last_updated,
        learning_sources: [...new Set(patterns.map(p => p.source))],
        confidence_level: this.calculateOverallConfidence({ total_patterns: patterns.length })
      },
      insights: {
        industry_patterns: Object.entries(this.learningData.patterns.industry_patterns).map(([industry, patternIds]) => ({
          industry,
          pattern_count: patternIds.length,
          insights: this.generateIndustryInsights(industry, patternIds)
        })),
        technology_patterns: Object.entries(this.learningData.patterns.technology_patterns).map(([tech, patternIds]) => ({
          technology: tech,
          pattern_count: patternIds.length,
          insights: this.generateTechnologyInsights(tech, patternIds)
        })),
        evolution_trends: this.identifyCommonEvolutionPatterns(patterns)
      },
      recommendations: this.generateLearningBasedRecommendations()
    };

    return report;
  }

  generateIndustryInsights(industry, patternIds) {
    const patterns = this.learningData.patterns.repository_evolutions.filter(p => patternIds.includes(p.id));
    
    return {
      common_evolution: this.findMostCommonEvolution(patterns),
      typical_team_size: this.calculateAverageTeamSize(patterns),
      success_rate: this.calculateSuccessRate(patterns),
      key_lessons: this.extractKeyLessons(patterns)
    };
  }

  generateTechnologyInsights(technology, patternIds) {
    const patterns = this.learningData.patterns.repository_evolutions.filter(p => patternIds.includes(p.id));
    
    return {
      preferred_structure: this.findPreferredStructure(patterns),
      evolution_timeline: this.calculateAverageEvolutionTimeline(patterns),
      success_indicators: this.getMostCommonSuccessIndicators(patterns)
    };
  }

  extractKeyLessons(patterns) {
    const allLessons = patterns.flatMap(p => p.lessons_learned || []);
    const lessonCounts = {};
    
    allLessons.forEach(lesson => {
      const key = lesson.toLowerCase().substring(0, 50); // First 50 chars as key
      lessonCounts[key] = (lessonCounts[key] || 0) + 1;
    });
    
    return Object.entries(lessonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lesson]) => lesson);
  }

  calculateAverageEvolutionTimeline(patterns) {
    const timelines = patterns.filter(p => p.evolution && p.evolution.length > 1);
    if (timelines.length === 0) return null;
    
    const avgSteps = timelines.reduce((sum, p) => sum + p.evolution.length, 0) / timelines.length;
    return Math.round(avgSteps);
  }

  getMostCommonSuccessIndicators(patterns) {
    const allIndicators = patterns.flatMap(p => p.success_indicators || []);
    const indicatorCounts = {};
    
    allIndicators.forEach(indicator => {
      indicatorCounts[indicator] = (indicatorCounts[indicator] || 0) + 1;
    });
    
    return Object.entries(indicatorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([indicator, count]) => ({ indicator, frequency: count }));
  }

  generateLearningBasedRecommendations() {
    return [
      'Start with single repository for new projects',
      'Split when team size exceeds 5 developers',
      'Monitor build times - split when consistently > 10 minutes',
      'Healthcare projects benefit from early API separation',
      'SaaS platforms typically evolve to marketing|app|api structure',
      'E-commerce projects should separate admin early for security'
    ];
  }
}

module.exports = ProjectStructureCommunityLearningIntegration;

// CLI interface
if (require.main === module) {
  const integration = new ProjectStructureCommunityLearningIntegration(path.join(__dirname, '..'));
  const command = process.argv[2];

  async function main() {
    switch (command) {
      case 'analyze':
        const result = await integration.analyzeContributions();
        console.log('Community Contribution Analysis');
        console.log('=================================');
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'report':
        const report = integration.generateLearningReport();
        console.log('Community Learning Report');
        console.log('=========================');
        console.log(JSON.stringify(report, null, 2));
        break;

      case 'patterns':
        const patterns = integration.learningData.patterns.repository_evolutions;
        console.log('Repository Evolution Patterns');
        console.log('=============================');
        console.log(`Total patterns: ${patterns.length}`);
        patterns.slice(0, 5).forEach((pattern, index) => {
          console.log(`\n${index + 1}. ${pattern.project_type} (${pattern.industry})`);
          console.log(`   Evolution: ${pattern.evolution?.map(e => `${e.from}->${e.to}`).join(', ') || 'No evolution'}`);
          console.log(`   Source: ${pattern.source}`);
        });
        break;

      default:
        console.log('Commands: analyze, report, patterns');
    }
  }

  main().catch(console.error);
}