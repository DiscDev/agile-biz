/**
 * Repository Recommendation Engine
 * Provides intelligent repository structure recommendations based on patterns
 */

const fs = require('fs');
const path = require('path');
const RepositoryPatternRecognizer = require('./repository-pattern-recognizer');

class RepositoryRecommendationEngine {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.patternRecognizer = new RepositoryPatternRecognizer(projectRoot);
    this.confidenceWeights = {
      exact_match: 1.0,
      industry_match: 0.7,
      technology_match: 0.6,
      project_type_match: 0.5,
      default: 0.3
    };
  }

  /**
   * Generate recommendation for a project
   */
  generateRecommendation(projectDetails) {
    const {
      project_type,
      industry,
      technology,
      team_size,
      timeline,
      requirements
    } = projectDetails;

    // Get pattern-based recommendation
    const patternRec = this.patternRecognizer.getRecommendation(
      project_type,
      industry,
      technology
    );

    // Enhance with additional factors
    const enhancedRec = this.enhanceRecommendation(patternRec, {
      team_size,
      timeline,
      requirements,
      technology
    });

    // Add evolution triggers
    const triggers = this.generateEvolutionTriggers(projectDetails);

    // Calculate final confidence
    const finalConfidence = this.calculateConfidence(patternRec, projectDetails);

    return {
      initial_structure: enhancedRec.initial_structure,
      recommended_evolution: enhancedRec.evolution_timeline,
      evolution_triggers: triggers,
      expected_outcomes: enhancedRec.expected_metrics,
      confidence: finalConfidence,
      reasoning: this.generateReasoning(enhancedRec, projectDetails),
      alternatives: this.generateAlternatives(projectDetails),
      anti_patterns_to_avoid: this.getRelevantAntiPatterns(projectDetails)
    };
  }

  /**
   * Enhance recommendation with additional factors
   */
  enhanceRecommendation(baseRec, factors) {
    const enhanced = { ...baseRec };

    // Adjust for team size
    if (factors.team_size) {
      if (factors.team_size === 1) {
        // Solo developer - keep it simple longer
        enhanced.evolution_timeline = enhanced.evolution_timeline.map(step => ({
          ...step,
          avg_week: step.avg_week * 1.5,
          note: 'Timeline extended for solo developer'
        }));
      } else if (factors.team_size > 5) {
        // Large team - may need structure earlier
        enhanced.evolution_timeline = enhanced.evolution_timeline.map(step => ({
          ...step,
          avg_week: step.avg_week * 0.8,
          note: 'Timeline accelerated for larger team'
        }));
      }
    }

    // Adjust for timeline pressure
    if (factors.timeline === 'urgent') {
      // Keep structure simple under pressure
      enhanced.evolution_timeline = enhanced.evolution_timeline.filter(
        step => step.confidence > 0.8
      );
    }

    // Technology-specific adjustments
    if (factors.technology) {
      enhanced.evolution_timeline = this.applyTechnologyAdjustments(
        enhanced.evolution_timeline,
        factors.technology
      );
    }

    return enhanced;
  }

  /**
   * Apply technology-specific adjustments
   */
  applyTechnologyAdjustments(timeline, technology) {
    const adjustments = {
      'React-Node.js': {
        'marketing|app': {
          reason_addon: 'Next.js for marketing, CRA for app recommended',
          week_adjustment: -1
        }
      },
      'Vue-Laravel': {
        'frontend|backend': {
          reason_addon: 'Natural separation with Laravel API',
          week_adjustment: -2
        }
      },
      'React Native-Node.js': {
        'mobile|web|api': {
          reason_addon: 'Platform-specific requirements',
          week_adjustment: -4,
          initial: true
        }
      }
    };

    const techKey = `${technology.frontend}-${technology.backend}`;
    const techAdjustment = adjustments[techKey];

    if (!techAdjustment) return timeline;

    return timeline.map(step => {
      const stepKey = step.to;
      const adjustment = techAdjustment[stepKey];
      
      if (adjustment) {
        return {
          ...step,
          avg_week: adjustment.initial ? 1 : step.avg_week + adjustment.week_adjustment,
          reasons: [...(step.reasons || []), adjustment.reason_addon]
        };
      }
      
      return step;
    });
  }

  /**
   * Generate evolution triggers
   */
  generateEvolutionTriggers(projectDetails) {
    const baseTriggers = [
      {
        metric: 'build_time',
        threshold: 600,
        unit: 'seconds',
        action: 'Consider splitting largest module',
        confidence: 0.8
      },
      {
        metric: 'merge_conflicts',
        threshold: 5,
        unit: 'per_week',
        action: 'Review code ownership boundaries',
        confidence: 0.7
      },
      {
        metric: 'deployment_failures',
        threshold: 2,
        unit: 'per_sprint',
        action: 'Isolate unstable components',
        confidence: 0.9
      }
    ];

    // Add project-specific triggers
    if (projectDetails.project_type === 'saas-b2b') {
      baseTriggers.push({
        metric: 'seo_requirements',
        threshold: 'needed',
        unit: 'boolean',
        action: 'Split marketing site from application',
        confidence: 0.95
      });
    }

    if (projectDetails.team_size > 3) {
      baseTriggers.push({
        metric: 'team_conflicts',
        threshold: 3,
        unit: 'per_sprint',
        action: 'Create team-owned repositories',
        confidence: 0.85
      });
    }

    return baseTriggers;
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(patternRec, projectDetails) {
    let confidence = patternRec.confidence;
    
    // Boost confidence for exact matches
    const patterns = this.patternRecognizer.patterns.patterns;
    const exactKey = `${projectDetails.project_type}-${projectDetails.industry}`;
    
    if (patterns[exactKey] && patterns[exactKey].occurrences >= 5) {
      confidence = Math.min(confidence * 1.2, 0.95);
    }

    // Reduce confidence for new combinations
    if (!patterns[exactKey]) {
      confidence *= 0.7;
    }

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Generate reasoning explanation
   */
  generateReasoning(recommendation, projectDetails) {
    const reasons = [];

    // Starting structure reasoning
    reasons.push(`Starting with ${recommendation.initial_structure} because:`);
    reasons.push('- Minimizes initial complexity');
    reasons.push('- Allows validating project assumptions');
    reasons.push('- Faster initial development');

    // Evolution reasoning
    if (recommendation.evolution_timeline.length > 0) {
      reasons.push('\nRecommended evolution:');
      
      recommendation.evolution_timeline.forEach(step => {
        reasons.push(`\nWeek ${Math.round(step.avg_week)}: ${step.from} → ${step.to}`);
        reasons.push(`- Triggered by: ${step.reasons.join(', ')}`);
        reasons.push(`- Confidence: ${Math.round(step.confidence * 100)}%`);
      });
    }

    // Project-specific reasoning
    if (projectDetails.project_type === 'saas-b2b') {
      reasons.push('\nSaaS-specific considerations:');
      reasons.push('- Marketing site will likely need SEO optimization');
      reasons.push('- API may need separate scaling strategy');
      reasons.push('- Admin panel often has different security requirements');
    }

    return reasons;
  }

  /**
   * Generate alternative recommendations
   */
  generateAlternatives(projectDetails) {
    const alternatives = [];

    // Conservative approach
    alternatives.push({
      name: 'Conservative',
      description: 'Keep single repository longer',
      initial_structure: 'single-repo',
      evolution_timeline: [{
        from: 'single-repo',
        to: 'frontend|backend',
        avg_week: 12,
        confidence: 0.6,
        reasons: ['Only split when absolutely necessary']
      }],
      when_to_use: 'Small team, uncertain requirements, MVP phase'
    });

    // Aggressive approach
    if (projectDetails.team_size > 3) {
      alternatives.push({
        name: 'Team-based',
        description: 'Split by team ownership from start',
        initial_structure: 'frontend|backend|shared',
        evolution_timeline: [],
        when_to_use: 'Clear team boundaries, experienced team, proven concept'
      });
    }

    // Platform-specific
    if (projectDetails.technology?.frontend?.includes('Native')) {
      alternatives.push({
        name: 'Platform-specific',
        description: 'Separate repositories per platform',
        initial_structure: 'ios|android|web|api',
        evolution_timeline: [],
        when_to_use: 'Platform-specific features, dedicated platform teams'
      });
    }

    return alternatives;
  }

  /**
   * Get relevant anti-patterns
   */
  getRelevantAntiPatterns(projectDetails) {
    const antiPatterns = [];
    const patterns = this.patternRecognizer.patterns.anti_patterns;

    // Always include common anti-patterns
    antiPatterns.push({
      name: 'Premature Splitting',
      description: 'Creating multiple repositories before validating need',
      signs: ['Low velocity', 'High coordination overhead', 'Duplicate code'],
      avoidance: 'Start simple, split based on metrics not assumptions'
    });

    // Project-specific anti-patterns
    if (projectDetails.project_type === 'startup-mvp') {
      antiPatterns.push({
        name: 'Over-architecture',
        description: 'Complex structure for unvalidated product',
        signs: ['More time on infrastructure than features', 'Slow iteration'],
        avoidance: 'Focus on validating product-market fit first'
      });
    }

    // Add detected anti-patterns from community
    Object.entries(patterns).forEach(([type, data]) => {
      if (data.occurrences > 2) {
        antiPatterns.push({
          name: type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: data.examples[0]?.description || type,
          occurrences: data.occurrences,
          from_community: true
        });
      }
    });

    return antiPatterns;
  }

  /**
   * Simulate recommendation for project
   */
  simulateEvolution(projectDetails, weeks = 12) {
    const recommendation = this.generateRecommendation(projectDetails);
    const simulation = {
      weeks: [],
      current_structure: recommendation.initial_structure,
      changes: [],
      metrics: {
        complexity: 1,
        velocity: 100,
        build_time: 60
      }
    };

    for (let week = 1; week <= weeks; week++) {
      // Check if evolution should happen
      const nextStep = recommendation.recommended_evolution.find(
        step => Math.round(step.avg_week) === week
      );

      if (nextStep) {
        simulation.changes.push({
          week,
          from: simulation.current_structure,
          to: nextStep.to,
          reason: nextStep.reasons[0]
        });
        simulation.current_structure = nextStep.to;
        
        // Simulate metric changes
        simulation.metrics.complexity *= 1.3;
        simulation.metrics.velocity *= 1.15;
        simulation.metrics.build_time *= 0.7;
      }

      simulation.weeks.push({
        week,
        structure: simulation.current_structure,
        metrics: { ...simulation.metrics }
      });
    }

    return simulation;
  }
}

module.exports = RepositoryRecommendationEngine;

// CLI interface
if (require.main === module) {
  const engine = new RepositoryRecommendationEngine(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'recommend':
      // Example: node repository-recommendation-engine.js recommend saas-b2b healthcare React Node.js 5
      const [projectType, industry, frontend, backend, teamSize] = process.argv.slice(3);
      
      if (!projectType || !industry) {
        console.log('Usage: recommend <project-type> <industry> [frontend] [backend] [team-size]');
        process.exit(1);
      }
      
      const recommendation = engine.generateRecommendation({
        project_type: projectType,
        industry: industry,
        technology: {
          frontend: frontend || 'React',
          backend: backend || 'Node.js'
        },
        team_size: parseInt(teamSize) || 1
      });
      
      console.log('\n📊 Repository Structure Recommendation\n');
      console.log(JSON.stringify(recommendation, null, 2));
      break;
      
    case 'simulate':
      const [simProjectType, simIndustry, simWeeks] = process.argv.slice(3);
      
      if (!simProjectType || !simIndustry) {
        console.log('Usage: simulate <project-type> <industry> [weeks]');
        process.exit(1);
      }
      
      const simulation = engine.simulateEvolution({
        project_type: simProjectType,
        industry: simIndustry,
        technology: { frontend: 'React', backend: 'Node.js' },
        team_size: 3
      }, parseInt(simWeeks) || 12);
      
      console.log('\n📈 Evolution Simulation\n');
      console.log(JSON.stringify(simulation, null, 2));
      break;
      
    default:
      console.log('Commands: recommend, simulate');
  }
}