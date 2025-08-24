/**
 * Repository Pattern Recognition System
 * Learns from project structure evolutions to provide better recommendations
 */

const fs = require('fs');
const path = require('path');

class RepositoryPatternRecognizer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.patternsFile = path.join(projectRoot, 'machine-data', 'repository-patterns.json');
    this.contributionsPath = path.join(projectRoot, 'community-learnings', 'contributions');
    this.confidenceThreshold = 0.7;
    this.minimumOccurrences = 3;
    this.loadPatterns();
  }

  /**
   * Load existing patterns
   */
  loadPatterns() {
    if (fs.existsSync(this.patternsFile)) {
      this.patterns = JSON.parse(fs.readFileSync(this.patternsFile, 'utf8'));
    } else {
      this.initializePatterns();
    }
  }

  /**
   * Initialize pattern storage
   */
  initializePatterns() {
    this.patterns = {
      version: "1.0.0",
      last_updated: new Date().toISOString(),
      total_patterns: 0,
      confidence_threshold: this.confidenceThreshold,
      minimum_occurrences: this.minimumOccurrences,
      patterns: {},
      industry_patterns: {},
      technology_correlations: {},
      evolution_timelines: {},
      anti_patterns: {},
      success_metrics: {
        pattern_accuracy: 0,
        recommendation_acceptance: 0,
        evolution_success: 0,
        community_contributions: 0
      }
    };
    this.savePatterns();
  }

  /**
   * Analyze repository evolution from contribution
   */
  analyzeRepositoryEvolution(contributionPath) {
    const learningsPath = path.join(contributionPath, 'learnings.md');
    const summaryPath = path.join(contributionPath, 'project-summary.md');
    
    if (!fs.existsSync(learningsPath) || !fs.existsSync(summaryPath)) {
      return null;
    }

    const learnings = fs.readFileSync(learningsPath, 'utf8');
    const summary = fs.readFileSync(summaryPath, 'utf8');

    // Extract repository evolution data
    const evolution = this.extractEvolutionData(learnings);
    const projectInfo = this.extractProjectInfo(summary);
    
    return {
      project_type: projectInfo.type,
      industry: projectInfo.industry,
      technology: projectInfo.technology,
      evolution: evolution,
      metrics: this.extractMetrics(learnings),
      success_indicators: this.extractSuccessIndicators(learnings)
    };
  }

  /**
   * Extract evolution timeline from learnings
   */
  extractEvolutionData(learnings) {
    const evolutionSection = learnings.match(/## Repository Evolution[\s\S]*?(?=##|\Z)/);
    if (!evolutionSection) return [];

    const timeline = [];
    const timelineMatch = evolutionSection[0].match(/timeline:[\s\S]*?(?=###|\Z)/);
    
    if (timelineMatch) {
      // Parse YAML-like timeline
      const lines = timelineMatch[0].split('\n');
      let currentEntry = null;
      
      lines.forEach(line => {
        if (line.includes('date:')) {
          if (currentEntry) timeline.push(currentEntry);
          currentEntry = {
            date: line.match(/"([^"]+)"/)?.[1],
            action: '',
            from: '',
            to: '',
            reason: '',
            impact: []
          };
        } else if (currentEntry) {
          if (line.includes('action:')) {
            currentEntry.action = line.match(/"([^"]+)"/)?.[1] || '';
          } else if (line.includes('from:')) {
            currentEntry.from = line.match(/"([^"]+)"/)?.[1] || '';
          } else if (line.includes('to:')) {
            currentEntry.to = line.match(/"([^"]+)"/)?.[1] || '';
          } else if (line.includes('reason:')) {
            currentEntry.reason = line.match(/"([^"]+)"/)?.[1] || '';
          } else if (line.includes('- "') && currentEntry.impact !== undefined) {
            const impact = line.match(/"([^"]+)"/)?.[1];
            if (impact) currentEntry.impact.push(impact);
          }
        }
      });
      
      if (currentEntry) timeline.push(currentEntry);
    }

    return timeline;
  }

  /**
   * Extract project information
   */
  extractProjectInfo(summary) {
    const typeMatch = summary.match(/\*\*Project Type\*\*:\s*(.+)/);
    const industryMatch = summary.match(/\*\*Industry\*\*:\s*(.+?)\s*\*/);
    const techMatch = summary.match(/\*\*Frontend\*\*:\s*(.+?)\s*\*/);
    const backendMatch = summary.match(/\*\*Backend\*\*:\s*(.+?)\s*\*/);

    return {
      type: typeMatch?.[1]?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
      industry: industryMatch?.[1]?.toLowerCase() || 'unknown',
      technology: {
        frontend: techMatch?.[1] || 'unknown',
        backend: backendMatch?.[1] || 'unknown'
      }
    };
  }

  /**
   * Extract success metrics
   */
  extractMetrics(learnings) {
    const metrics = {};
    
    // Look for deployment time improvements
    const deployMatch = learnings.match(/deployment.*?([+-]?\d+%)/i);
    if (deployMatch) metrics.deployment_improvement = deployMatch[1];
    
    // Look for build time improvements
    const buildMatch = learnings.match(/build.*?time.*?([+-]?\d+%)/i);
    if (buildMatch) metrics.build_time_improvement = buildMatch[1];
    
    // Look for velocity improvements
    const velocityMatch = learnings.match(/velocity.*?([+-]?\d+%)/i);
    if (velocityMatch) metrics.velocity_improvement = velocityMatch[1];

    return metrics;
  }

  /**
   * Extract success indicators
   */
  extractSuccessIndicators(learnings) {
    const indicators = [];
    
    const successPatterns = [
      /independent deployment/i,
      /clear ownership/i,
      /faster ci\/cd/i,
      /reduced conflicts/i,
      /better performance/i,
      /easier scaling/i
    ];

    successPatterns.forEach(pattern => {
      if (pattern.test(learnings)) {
        indicators.push(pattern.source.replace(/[/\\]/g, ''));
      }
    });

    return indicators;
  }

  /**
   * Update patterns with new learning
   */
  updatePatterns(evolution) {
    if (!evolution || !evolution.evolution || evolution.evolution.length === 0) {
      return;
    }

    const patternKey = `${evolution.project_type}-${evolution.industry}`;
    
    // Initialize pattern if new
    if (!this.patterns.patterns[patternKey]) {
      this.patterns.patterns[patternKey] = {
        occurrences: 0,
        evolutions: [],
        common_timeline: [],
        success_rate: 0,
        avg_metrics: {}
      };
    }

    const pattern = this.patterns.patterns[patternKey];
    pattern.occurrences++;
    pattern.evolutions.push(evolution);
    
    // Update common timeline
    this.updateCommonTimeline(pattern, evolution);
    
    // Update success metrics
    this.updateSuccessMetrics(pattern, evolution);
    
    // Update industry patterns
    this.updateIndustryPatterns(evolution);
    
    // Update technology correlations
    this.updateTechnologyCorrelations(evolution);
    
    // Check for anti-patterns
    this.detectAntiPatterns(evolution);
    
    this.patterns.total_patterns = Object.keys(this.patterns.patterns).length;
    this.patterns.last_updated = new Date().toISOString();
    
    this.savePatterns();
  }

  /**
   * Update common timeline for pattern
   */
  updateCommonTimeline(pattern, evolution) {
    const timeline = evolution.evolution;
    
    timeline.forEach(step => {
      const existingStep = pattern.common_timeline.find(s => 
        s.from === step.from && s.to === step.to
      );
      
      if (existingStep) {
        existingStep.occurrences++;
        existingStep.reasons.push(step.reason);
        existingStep.avg_week = (existingStep.avg_week * (existingStep.occurrences - 1) + 
          this.calculateWeekFromDate(step.date)) / existingStep.occurrences;
      } else {
        pattern.common_timeline.push({
          from: step.from,
          to: step.to,
          occurrences: 1,
          reasons: [step.reason],
          avg_week: this.calculateWeekFromDate(step.date),
          confidence: 0
        });
      }
    });
    
    // Update confidence scores
    pattern.common_timeline.forEach(step => {
      step.confidence = step.occurrences / pattern.occurrences;
    });
  }

  /**
   * Calculate week number from date
   */
  calculateWeekFromDate(dateStr) {
    // This is simplified - in real implementation would calculate from project start
    const date = new Date(dateStr);
    const projectStart = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - projectStart) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  }

  /**
   * Update success metrics
   */
  updateSuccessMetrics(pattern, evolution) {
    const metrics = evolution.metrics;
    
    if (!pattern.avg_metrics.deployment) {
      pattern.avg_metrics = {
        deployment: 0,
        build_time: 0,
        velocity: 0,
        count: 0
      };
    }
    
    pattern.avg_metrics.count++;
    
    // Parse and average metrics
    Object.entries(metrics).forEach(([key, value]) => {
      const numValue = parseFloat(value) || 0;
      const metricKey = key.replace(/_improvement$/, '');
      
      if (pattern.avg_metrics[metricKey] !== undefined) {
        pattern.avg_metrics[metricKey] = 
          (pattern.avg_metrics[metricKey] * (pattern.avg_metrics.count - 1) + numValue) / 
          pattern.avg_metrics.count;
      }
    });
    
    // Calculate success rate based on positive metrics
    const positiveMetrics = Object.values(pattern.avg_metrics)
      .filter(v => typeof v === 'number' && v > 0).length;
    pattern.success_rate = positiveMetrics / 3; // Assuming 3 key metrics
  }

  /**
   * Update industry-specific patterns
   */
  updateIndustryPatterns(evolution) {
    const industry = evolution.industry;
    
    if (!this.patterns.industry_patterns[industry]) {
      this.patterns.industry_patterns[industry] = {
        common_evolutions: [],
        project_types: {},
        avg_timeline_weeks: []
      };
    }
    
    const industryPattern = this.patterns.industry_patterns[industry];
    
    // Track project types in this industry
    industryPattern.project_types[evolution.project_type] = 
      (industryPattern.project_types[evolution.project_type] || 0) + 1;
    
    // Track evolution patterns
    evolution.evolution.forEach(step => {
      const evoKey = `${step.from}->${step.to}`;
      const existing = industryPattern.common_evolutions.find(e => e.pattern === evoKey);
      
      if (existing) {
        existing.count++;
      } else {
        industryPattern.common_evolutions.push({
          pattern: evoKey,
          count: 1,
          reasons: [step.reason]
        });
      }
    });
  }

  /**
   * Update technology correlations
   */
  updateTechnologyCorrelations(evolution) {
    const techKey = `${evolution.technology.frontend}-${evolution.technology.backend}`;
    
    if (!this.patterns.technology_correlations[techKey]) {
      this.patterns.technology_correlations[techKey] = {
        occurrences: 0,
        common_structures: {},
        evolution_triggers: []
      };
    }
    
    const techPattern = this.patterns.technology_correlations[techKey];
    techPattern.occurrences++;
    
    // Track final structure
    const finalStructure = evolution.evolution[evolution.evolution.length - 1]?.to || 'single-repo';
    techPattern.common_structures[finalStructure] = 
      (techPattern.common_structures[finalStructure] || 0) + 1;
  }

  /**
   * Detect anti-patterns
   */
  detectAntiPatterns(evolution) {
    // Check for rapid back-and-forth changes
    const changes = evolution.evolution;
    for (let i = 1; i < changes.length; i++) {
      if (changes[i].from === changes[i-1].to && changes[i].to === changes[i-1].from) {
        this.addAntiPattern('flip-flop', {
          description: 'Repository structure changed back and forth',
          example: `${changes[i-1].from} -> ${changes[i-1].to} -> ${changes[i].to}`,
          consequence: 'Wasted effort and team confusion'
        });
      }
    }
    
    // Check for too many repos too early
    if (changes.length > 0 && this.calculateWeekFromDate(changes[0].date) < 2) {
      const repoCount = (changes[0].to.match(/\|/g) || []).length + 1;
      if (repoCount > 2) {
        this.addAntiPattern('premature-split', {
          description: 'Split into multiple repositories too early',
          repos: repoCount,
          week: this.calculateWeekFromDate(changes[0].date),
          consequence: 'Unnecessary complexity'
        });
      }
    }
  }

  /**
   * Add anti-pattern
   */
  addAntiPattern(type, details) {
    if (!this.patterns.anti_patterns[type]) {
      this.patterns.anti_patterns[type] = {
        occurrences: 0,
        examples: []
      };
    }
    
    this.patterns.anti_patterns[type].occurrences++;
    this.patterns.anti_patterns[type].examples.push({
      ...details,
      date: new Date().toISOString()
    });
  }

  /**
   * Get recommendation for project
   */
  getRecommendation(projectType, industry, technology) {
    const patternKey = `${projectType}-${industry}`;
    const pattern = this.patterns.patterns[patternKey];
    
    if (!pattern || pattern.occurrences < this.minimumOccurrences) {
      // Fall back to industry patterns
      return this.getIndustryRecommendation(industry);
    }
    
    // Filter timeline by confidence
    const confidentSteps = pattern.common_timeline
      .filter(step => step.confidence >= this.confidenceThreshold)
      .sort((a, b) => a.avg_week - b.avg_week);
    
    return {
      initial_structure: 'single-repo',
      evolution_timeline: confidentSteps,
      expected_metrics: pattern.avg_metrics,
      confidence: pattern.occurrences / 10, // Normalize to 0-1
      based_on: `${pattern.occurrences} similar projects`
    };
  }

  /**
   * Get industry-based recommendation
   */
  getIndustryRecommendation(industry) {
    const industryPattern = this.patterns.industry_patterns[industry];
    
    if (!industryPattern) {
      return this.getDefaultRecommendation();
    }
    
    const mostCommon = industryPattern.common_evolutions
      .sort((a, b) => b.count - a.count)[0];
    
    return {
      initial_structure: 'single-repo',
      evolution_timeline: [{
        from: 'single-repo',
        to: mostCommon?.pattern.split('->')[1] || 'single-repo',
        confidence: 0.5,
        avg_week: 4,
        reasons: mostCommon?.reasons || []
      }],
      expected_metrics: { general: 'positive' },
      confidence: 0.5,
      based_on: `Industry patterns for ${industry}`
    };
  }

  /**
   * Get default recommendation
   */
  getDefaultRecommendation() {
    return {
      initial_structure: 'single-repo',
      evolution_timeline: [],
      expected_metrics: {},
      confidence: 0.3,
      based_on: 'Default recommendation - insufficient data'
    };
  }

  /**
   * Analyze all contributions
   */
  async analyzeAllContributions() {
    if (!fs.existsSync(this.contributionsPath)) {
      console.log('No contributions found');
      return;
    }

    const contributions = fs.readdirSync(this.contributionsPath)
      .filter(dir => fs.statSync(path.join(this.contributionsPath, dir)).isDirectory());

    let analyzed = 0;
    contributions.forEach(contrib => {
      const contribPath = path.join(this.contributionsPath, contrib);
      const evolution = this.analyzeRepositoryEvolution(contribPath);
      
      if (evolution) {
        this.updatePatterns(evolution);
        analyzed++;
      }
    });

    console.log(`Analyzed ${analyzed} contributions`);
    console.log(`Found ${this.patterns.total_patterns} patterns`);
    
    return this.patterns;
  }

  /**
   * Save patterns to file
   */
  savePatterns() {
    fs.writeFileSync(this.patternsFile, JSON.stringify(this.patterns, null, 2));
  }

  /**
   * Get pattern statistics
   */
  getStatistics() {
    return {
      total_patterns: this.patterns.total_patterns,
      industry_coverage: Object.keys(this.patterns.industry_patterns).length,
      technology_combinations: Object.keys(this.patterns.technology_correlations).length,
      anti_patterns_detected: Object.keys(this.patterns.anti_patterns).length,
      average_confidence: this.calculateAverageConfidence(),
      last_updated: this.patterns.last_updated
    };
  }

  /**
   * Calculate average confidence across patterns
   */
  calculateAverageConfidence() {
    const patterns = Object.values(this.patterns.patterns);
    if (patterns.length === 0) return 0;
    
    const totalConfidence = patterns.reduce((sum, pattern) => {
      const avgStepConfidence = pattern.common_timeline.reduce((s, step) => 
        s + step.confidence, 0) / (pattern.common_timeline.length || 1);
      return sum + avgStepConfidence;
    }, 0);
    
    return totalConfidence / patterns.length;
  }
}

module.exports = RepositoryPatternRecognizer;

// CLI interface
if (require.main === module) {
  const recognizer = new RepositoryPatternRecognizer(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      recognizer.analyzeAllContributions().then(patterns => {
        console.log('Analysis complete');
        console.log(JSON.stringify(recognizer.getStatistics(), null, 2));
      });
      break;
      
    case 'recommend':
      const [projectType, industry] = process.argv.slice(3);
      if (!projectType || !industry) {
        console.log('Usage: node repository-pattern-recognizer.js recommend <project-type> <industry>');
        process.exit(1);
      }
      const recommendation = recognizer.getRecommendation(projectType, industry, {});
      console.log(JSON.stringify(recommendation, null, 2));
      break;
      
    case 'stats':
      console.log(JSON.stringify(recognizer.getStatistics(), null, 2));
      break;
      
    default:
      console.log('Commands: analyze, recommend <type> <industry>, stats');
  }
}