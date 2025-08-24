/**
 * Violation Learning System
 * 
 * Automatically learns from context violations to improve future detection
 */

const fs = require('fs-extra');
const path = require('path');

class ViolationLearningSystem {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.learningsPath = path.join(
      this.projectRoot, 'community-learnings',
      'analysis', 'context-violations'
    );
    this.patternsPath = path.join(
      this.projectRoot, 'community-learnings',
      'analysis', 'violation-patterns.json'
    );
    this.patterns = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the learning system
   */
  async initialize() {
    try {
      // Ensure directories exist
      await fs.ensureDir(this.learningsPath);
      
      // Load existing patterns
      await this.loadPatterns();
      
      this.initialized = true;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Load existing violation patterns
   */
  async loadPatterns() {
    if (await fs.pathExists(this.patternsPath)) {
      const data = await fs.readJSON(this.patternsPath);
      
      // Convert array to Map
      if (data.patterns) {
        data.patterns.forEach(pattern => {
          this.patterns.set(pattern.id, pattern);
        });
      }
    }
  }

  /**
   * Learn from a context violation
   */
  async learnFromViolation(violation) {
    if (!this.initialized) {
      await this.initialize();
    }

    const learning = {
      id: `violation-${Date.now()}`,
      timestamp: new Date().toISOString(),
      violation: {
        item: violation.item,
        confidence: violation.confidence,
        reason: violation.reason,
        details: violation.details
      },
      context: {
        projectTruth: violation.projectTruth,
        violationType: violation.type || 'general'
      },
      patterns: [],
      insights: []
    };

    // Extract patterns from the violation
    const patterns = await this.extractPatterns(violation);
    learning.patterns = patterns;

    // Generate insights
    const insights = await this.generateInsights(violation, patterns);
    learning.insights = insights;

    // Update pattern database
    await this.updatePatterns(patterns);

    // Save individual learning
    await this.saveLearning(learning);

    // Generate prevention recommendations
    const prevention = await this.generatePreventionRecommendations(learning);
    
    return {
      learningId: learning.id,
      patterns: patterns.length,
      insights: insights.length,
      prevention
    };
  }

  /**
   * Extract patterns from violation
   */
  async extractPatterns(violation) {
    const patterns = [];
    const itemText = this.getItemText(violation.item).toLowerCase();
    
    // Pattern 1: Domain mismatch patterns
    if (violation.details && violation.details.domainAlignment > 80) {
      const domainPattern = {
        type: 'domain-mismatch',
        industry: violation.projectTruth.industry,
        violatingTerms: this.extractViolatingTerms(itemText, violation.projectTruth),
        confidence: violation.details.domainAlignment
      };
      patterns.push(domainPattern);
    }

    // Pattern 2: Target user misalignment
    if (violation.details && violation.details.userAlignment > 70) {
      const userPattern = {
        type: 'user-misalignment',
        targetUsers: violation.projectTruth.targetUsers,
        actualFocus: this.detectActualUserFocus(itemText),
        confidence: violation.details.userAlignment
      };
      patterns.push(userPattern);
    }

    // Pattern 3: Feature creep patterns
    if (this.detectFeatureCreep(violation)) {
      patterns.push({
        type: 'feature-creep',
        originalScope: violation.projectTruth.whatWereBuilding,
        creepIndicators: this.extractCreepIndicators(itemText),
        confidence: violation.confidence
      });
    }

    // Pattern 4: Not-this violations
    const notThisViolations = this.checkNotThisViolations(itemText, violation.projectTruth.notThis);
    if (notThisViolations.length > 0) {
      patterns.push({
        type: 'not-this-violation',
        violated: notThisViolations,
        confidence: 95
      });
    }

    // Pattern 5: Terminology drift
    const termDrift = this.detectTerminologyDrift(itemText, violation.projectTruth.domainTerms);
    if (termDrift.driftScore > 50) {
      patterns.push({
        type: 'terminology-drift',
        expectedTerms: termDrift.expected,
        actualTerms: termDrift.actual,
        driftScore: termDrift.driftScore
      });
    }

    return patterns;
  }

  /**
   * Generate insights from violation and patterns
   */
  async generateInsights(violation, patterns) {
    const insights = [];

    // Insight 1: Root cause analysis
    const rootCause = this.analyzeRootCause(patterns);
    if (rootCause) {
      insights.push({
        type: 'root-cause',
        description: rootCause,
        actionable: true
      });
    }

    // Insight 2: Trend detection
    const trend = await this.detectTrend(patterns);
    if (trend) {
      insights.push({
        type: 'trend',
        description: trend.description,
        frequency: trend.frequency,
        severity: trend.severity
      });
    }

    // Insight 3: Prevention opportunity
    const prevention = this.identifyPreventionOpportunity(violation, patterns);
    if (prevention) {
      insights.push({
        type: 'prevention',
        description: prevention.description,
        implementation: prevention.implementation
      });
    }

    // Insight 4: Process improvement
    if (patterns.some(p => p.type === 'feature-creep')) {
      insights.push({
        type: 'process-improvement',
        description: 'Feature creep detected - strengthen scope management',
        recommendation: 'Implement stricter change control process'
      });
    }

    return insights;
  }

  /**
   * Update pattern database
   */
  async updatePatterns(newPatterns) {
    for (const pattern of newPatterns) {
      const patternId = this.generatePatternId(pattern);
      
      if (this.patterns.has(patternId)) {
        // Update existing pattern
        const existing = this.patterns.get(patternId);
        existing.occurrences++;
        existing.lastSeen = new Date().toISOString();
        existing.confidence = (existing.confidence + pattern.confidence) / 2;
        
        // Update examples
        if (!existing.examples) existing.examples = [];
        existing.examples.push({
          timestamp: new Date().toISOString(),
          pattern: pattern
        });
        
        // Keep only last 10 examples
        if (existing.examples.length > 10) {
          existing.examples = existing.examples.slice(-10);
        }
      } else {
        // Create new pattern entry
        this.patterns.set(patternId, {
          id: patternId,
          type: pattern.type,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          occurrences: 1,
          confidence: pattern.confidence || 0,
          pattern: pattern,
          examples: [{
            timestamp: new Date().toISOString(),
            pattern: pattern
          }]
        });
      }
    }

    // Save updated patterns
    await this.savePatterns();
  }

  /**
   * Save patterns to file
   */
  async savePatterns() {
    const patternsData = {
      lastUpdated: new Date().toISOString(),
      totalPatterns: this.patterns.size,
      patterns: Array.from(this.patterns.values())
        .sort((a, b) => b.occurrences - a.occurrences)
    };

    await fs.writeJSON(this.patternsPath, patternsData, { spaces: 2 });
  }

  /**
   * Save individual learning
   */
  async saveLearning(learning) {
    const learningPath = path.join(
      this.learningsPath,
      `${learning.id}.json`
    );

    await fs.writeJSON(learningPath, learning, { spaces: 2 });
  }

  /**
   * Generate prevention recommendations
   */
  async generatePreventionRecommendations(learning) {
    const recommendations = [];

    // Check each pattern for prevention strategies
    for (const pattern of learning.patterns) {
      switch (pattern.type) {
        case 'domain-mismatch':
          recommendations.push({
            type: 'vocabulary-enforcement',
            description: 'Add domain-specific vocabulary validation',
            implementation: {
              hook: 'pre-commit',
              validation: 'domain-terms-check',
              blockedTerms: pattern.violatingTerms
            }
          });
          break;

        case 'user-misalignment':
          recommendations.push({
            type: 'user-story-template',
            description: 'Enforce user story format that explicitly mentions target users',
            implementation: {
              template: 'As a [TARGET_USER], I want...',
              validation: 'user-mention-required',
              allowedUsers: pattern.targetUsers
            }
          });
          break;

        case 'feature-creep':
          recommendations.push({
            type: 'scope-change-control',
            description: 'Require explicit approval for scope expansions',
            implementation: {
              process: 'change-request-required',
              approvers: ['product-owner', 'project-manager'],
              threshold: 'any-new-feature'
            }
          });
          break;

        case 'not-this-violation':
          recommendations.push({
            type: 'blacklist-enforcement',
            description: 'Block items containing NOT THIS terms',
            implementation: {
              validation: 'not-this-check',
              blockedTerms: pattern.violated,
              severity: 'error'
            }
          });
          break;

        case 'terminology-drift':
          recommendations.push({
            type: 'glossary-enforcement',
            description: 'Require use of approved domain terminology',
            implementation: {
              validation: 'term-consistency-check',
              glossary: pattern.expectedTerms,
              minUsage: 1
            }
          });
          break;
      }
    }

    // Add general recommendations based on insights
    for (const insight of learning.insights) {
      if (insight.type === 'prevention' && insight.implementation) {
        recommendations.push({
          type: 'insight-based',
          description: insight.description,
          implementation: insight.implementation
        });
      }
    }

    return recommendations;
  }

  /**
   * Get insights for a specific project
   */
  async getProjectInsights(projectTruth) {
    if (!this.initialized) {
      await this.initialize();
    }

    const insights = {
      commonViolations: [],
      preventionStrategies: [],
      riskFactors: [],
      recommendations: []
    };

    // Find patterns relevant to this project
    const relevantPatterns = Array.from(this.patterns.values())
      .filter(p => this.isPatternRelevant(p, projectTruth));

    // Identify common violations
    insights.commonViolations = relevantPatterns
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5)
      .map(p => ({
        type: p.type,
        occurrences: p.occurrences,
        description: this.describePattern(p)
      }));

    // Generate prevention strategies
    for (const pattern of relevantPatterns) {
      const strategy = this.generatePreventionStrategy(pattern);
      if (strategy) {
        insights.preventionStrategies.push(strategy);
      }
    }

    // Identify risk factors
    insights.riskFactors = this.identifyRiskFactors(projectTruth, relevantPatterns);

    // Generate recommendations
    insights.recommendations = this.generateProjectRecommendations(projectTruth, insights);

    return insights;
  }

  /**
   * Helper methods
   */
  
  getItemText(item) {
    if (typeof item === 'string') return item;
    
    const parts = [
      item.title || '',
      item.description || '',
      item.acceptanceCriteria || ''
    ];
    
    return parts.join(' ');
  }

  extractViolatingTerms(text, projectTruth) {
    const industry = projectTruth.industry.toLowerCase();
    const violatingTerms = [];
    
    // Check against known mismatches
    const domainMismatches = {
      'casino affiliate': ['invoice', 'tax', 'bookkeeping', 'accounting'],
      'bookkeeping': ['casino', 'gambling', 'betting', 'odds'],
      'e-commerce': ['patient', 'medical', 'diagnosis', 'treatment'],
      'healthcare': ['product catalog', 'shopping cart', 'checkout']
    };
    
    const mismatches = domainMismatches[industry] || [];
    mismatches.forEach(term => {
      if (text.includes(term)) {
        violatingTerms.push(term);
      }
    });
    
    return violatingTerms;
  }

  detectActualUserFocus(text) {
    // Simple heuristic to detect who the feature actually targets
    const userTypes = {
      'business': ['company', 'enterprise', 'organization', 'corporate'],
      'consumer': ['user', 'customer', 'individual', 'personal'],
      'developer': ['api', 'integration', 'webhook', 'sdk'],
      'admin': ['admin', 'management', 'configuration', 'settings']
    };
    
    for (const [type, keywords] of Object.entries(userTypes)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return type;
      }
    }
    
    return 'unknown';
  }

  detectFeatureCreep(violation) {
    // Check if the violation represents scope expansion
    return violation.confidence > 80 && 
           violation.reason && 
           violation.reason.includes('outside project domain');
  }

  extractCreepIndicators(text) {
    const indicators = [];
    
    // Common feature creep indicators
    const creepPhrases = [
      'also include',
      'additionally',
      'expand to',
      'add support for',
      'integrate with',
      'extend to cover'
    ];
    
    creepPhrases.forEach(phrase => {
      if (text.includes(phrase)) {
        indicators.push(phrase);
      }
    });
    
    return indicators;
  }

  checkNotThisViolations(text, notThisList) {
    return notThisList.filter(notItem => {
      const notItemLower = notItem.toLowerCase();
      return text.includes(notItemLower) || 
             notItemLower.split(' ').some(word => text.includes(word));
    });
  }

  detectTerminologyDrift(text, domainTerms) {
    const expectedTerms = domainTerms.map(t => t.term.toLowerCase());
    const actualTerms = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    expectedTerms.forEach(term => {
      if (text.includes(term)) matches++;
    });
    
    const driftScore = expectedTerms.length > 0 
      ? 100 - (matches / expectedTerms.length * 100)
      : 0;
      
    return {
      expected: expectedTerms,
      actual: actualTerms.filter(t => t.length > 3), // Filter short words
      driftScore
    };
  }

  generatePatternId(pattern) {
    return `${pattern.type}-${JSON.stringify(pattern).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)}`;
  }

  analyzeRootCause(patterns) {
    if (patterns.length === 0) return null;
    
    // Look for common root causes
    if (patterns.some(p => p.type === 'not-this-violation')) {
      return 'Direct violation of explicitly prohibited features/concepts';
    }
    
    if (patterns.some(p => p.type === 'domain-mismatch')) {
      return 'Using terminology from wrong industry/domain';
    }
    
    if (patterns.some(p => p.type === 'user-misalignment')) {
      return 'Feature targets wrong user type';
    }
    
    if (patterns.some(p => p.type === 'feature-creep')) {
      return 'Scope expansion beyond original project boundaries';
    }
    
    return 'Context drift from original project goals';
  }

  async detectTrend(patterns) {
    // Look for trends in recent violations
    const recentPatterns = Array.from(this.patterns.values())
      .filter(p => {
        const daysSince = (Date.now() - new Date(p.lastSeen)) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });
    
    if (recentPatterns.length < 3) return null;
    
    // Find most common pattern type
    const typeCounts = {};
    recentPatterns.forEach(p => {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + p.occurrences;
    });
    
    const mostCommon = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostCommon && mostCommon[1] > 5) {
      return {
        description: `Increasing ${mostCommon[0]} violations`,
        frequency: mostCommon[1],
        severity: mostCommon[1] > 10 ? 'high' : 'medium'
      };
    }
    
    return null;
  }

  identifyPreventionOpportunity(violation, patterns) {
    // Look for patterns that can be prevented systematically
    if (patterns.some(p => p.type === 'terminology-drift')) {
      return {
        description: 'Implement automated terminology validation',
        implementation: {
          type: 'pre-commit-hook',
          check: 'domain-terminology'
        }
      };
    }
    
    if (patterns.some(p => p.type === 'not-this-violation')) {
      return {
        description: 'Add NOT THIS validation to backlog creation',
        implementation: {
          type: 'backlog-validation',
          check: 'not-this-terms'
        }
      };
    }
    
    return null;
  }

  isPatternRelevant(pattern, projectTruth) {
    // Check if pattern is relevant to current project
    if (pattern.pattern.industry && 
        pattern.pattern.industry === projectTruth.industry) {
      return true;
    }
    
    if (pattern.pattern.targetUsers && 
        JSON.stringify(pattern.pattern.targetUsers) === JSON.stringify(projectTruth.targetUsers)) {
      return true;
    }
    
    // General patterns are always relevant
    return ['feature-creep', 'terminology-drift'].includes(pattern.type);
  }

  describePattern(pattern) {
    const descriptions = {
      'domain-mismatch': `Using terms from wrong domain (${pattern.occurrences} times)`,
      'user-misalignment': `Targeting wrong user type (${pattern.occurrences} times)`,
      'feature-creep': `Scope expansion attempts (${pattern.occurrences} times)`,
      'not-this-violation': `Prohibited feature attempts (${pattern.occurrences} times)`,
      'terminology-drift': `Inconsistent terminology (${pattern.occurrences} times)`
    };
    
    return descriptions[pattern.type] || `${pattern.type} (${pattern.occurrences} times)`;
  }

  generatePreventionStrategy(pattern) {
    const strategies = {
      'domain-mismatch': {
        name: 'Domain Vocabulary Enforcement',
        description: 'Validate all content against approved domain terminology',
        priority: 'high'
      },
      'user-misalignment': {
        name: 'Target User Validation',
        description: 'Ensure all features explicitly benefit target users',
        priority: 'high'
      },
      'feature-creep': {
        name: 'Scope Change Control',
        description: 'Require approval for any scope expansions',
        priority: 'critical'
      },
      'not-this-violation': {
        name: 'Blacklist Enforcement',
        description: 'Block any items containing NOT THIS terms',
        priority: 'critical'
      },
      'terminology-drift': {
        name: 'Glossary Compliance',
        description: 'Enforce consistent use of domain terms',
        priority: 'medium'
      }
    };
    
    return strategies[pattern.type];
  }

  identifyRiskFactors(projectTruth, patterns) {
    const risks = [];
    
    // Risk 1: Vague project definition
    if (!projectTruth.industry || projectTruth.industry.length < 10) {
      risks.push({
        factor: 'Vague industry definition',
        impact: 'high',
        mitigation: 'Clarify specific industry niche'
      });
    }
    
    // Risk 2: No NOT THIS list
    if (!projectTruth.notThis || projectTruth.notThis.length === 0) {
      risks.push({
        factor: 'Missing NOT THIS definitions',
        impact: 'high',
        mitigation: 'Define what the project explicitly is NOT'
      });
    }
    
    // Risk 3: Broad target users
    if (projectTruth.targetUsers.primary && 
        projectTruth.targetUsers.primary.includes('everyone') ||
        projectTruth.targetUsers.primary.includes('all')) {
      risks.push({
        factor: 'Too broad target user definition',
        impact: 'medium',
        mitigation: 'Narrow down to specific user segments'
      });
    }
    
    // Risk 4: Pattern history
    if (patterns.length > 10) {
      risks.push({
        factor: 'History of violations in this domain',
        impact: 'medium',
        mitigation: 'Implement stricter validation rules'
      });
    }
    
    return risks;
  }

  generateProjectRecommendations(projectTruth, insights) {
    const recommendations = [];
    
    // Based on common violations
    if (insights.commonViolations.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Review and address common violation patterns',
        details: `Focus on: ${insights.commonViolations[0].type}`
      });
    }
    
    // Based on risk factors
    insights.riskFactors.forEach(risk => {
      if (risk.impact === 'high') {
        recommendations.push({
          priority: 'critical',
          action: risk.mitigation,
          reason: risk.factor
        });
      }
    });
    
    // General recommendations
    recommendations.push({
      priority: 'medium',
      action: 'Implement pre-commit context validation',
      details: 'Catch violations before they enter the codebase'
    });
    
    recommendations.push({
      priority: 'medium',
      action: 'Regular team context alignment sessions',
      details: 'Weekly review of Project Truth document'
    });
    
    return recommendations;
  }
}

// Export singleton instance
module.exports = new ViolationLearningSystem();