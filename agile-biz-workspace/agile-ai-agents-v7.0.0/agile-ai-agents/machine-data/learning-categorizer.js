/**
 * Learning Categorizer
 * Categorizes and prioritizes learnings for implementation
 */

const fs = require('fs');
const path = require('path');

class LearningCategorizer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.categoriesPath = path.join(projectRoot, 'machine-data', 'learning-categories.json');
    this.categories = this.loadCategories();
  }

  /**
   * Load category definitions
   */
  loadCategories() {
    return JSON.parse(fs.readFileSync(this.categoriesPath, 'utf8'));
  }

  /**
   * Categorize a learning based on its content
   */
  categorizeLearning(learning) {
    const categorization = {
      primary_category: null,
      secondary_categories: [],
      priority: null,
      confidence: 0,
      tags: [],
      implementation_speed: null
    };

    // Analyze learning content
    const content = JSON.stringify(learning).toLowerCase();
    const scores = {};

    // Score each category based on keyword matching
    Object.entries(this.categories.categories).forEach(([category, config]) => {
      scores[category] = this.calculateCategoryScore(content, config.examples);
    });

    // Find primary category (highest score)
    const topCategory = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory[1] > 0) {
      categorization.primary_category = topCategory[0];
      categorization.priority = this.categories.categories[topCategory[0]].priority;
      categorization.implementation_speed = this.categories.categories[topCategory[0]].implementation_speed;
    }

    // Find secondary categories
    Object.entries(scores).forEach(([category, score]) => {
      if (score > 0 && category !== categorization.primary_category) {
        categorization.secondary_categories.push(category);
      }
    });

    // Calculate confidence
    categorization.confidence = this.calculateConfidence(learning);

    // Generate tags
    categorization.tags = this.generateTags(learning, categorization);

    return categorization;
  }

  /**
   * Calculate category score based on keyword matching
   */
  calculateCategoryScore(content, examples) {
    let score = 0;
    examples.forEach(example => {
      const keywords = example.toLowerCase().split(' ');
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          score += 1;
        }
      });
    });
    return score;
  }

  /**
   * Calculate confidence score for a learning
   */
  calculateConfidence(learning) {
    const factors = this.categories.confidence_factors;
    let totalScore = 0;

    // Sample size factor
    const sampleSize = learning.sample_size || 1;
    const sizeScore = this.getConfidenceLevel(sampleSize, factors.sample_size.thresholds);
    totalScore += sizeScore * factors.sample_size.weight;

    // Success rate factor
    const successRate = learning.success_rate || 0.5;
    const successScore = this.getConfidenceLevel(successRate, factors.success_rate.thresholds);
    totalScore += successScore * factors.success_rate.weight;

    // Consistency factor
    const consistency = learning.consistency || 0.5;
    const consistencyScore = this.getConfidenceLevel(consistency, factors.consistency.thresholds);
    totalScore += consistencyScore * factors.consistency.weight;

    return totalScore;
  }

  /**
   * Get confidence level based on thresholds
   */
  getConfidenceLevel(value, thresholds) {
    if (value >= thresholds.high) return 1.0;
    if (value >= thresholds.medium) return 0.7;
    if (value >= thresholds.low) return 0.4;
    return 0.2;
  }

  /**
   * Generate tags for a learning
   */
  generateTags(learning, categorization) {
    const tags = [];

    // Required tags
    tags.push(`category:${categorization.primary_category}`);
    tags.push(`priority:${categorization.priority}`);
    tags.push(`confidence:${categorization.confidence.toFixed(2)}`);
    
    if (learning.agent) {
      tags.push(`agent:${learning.agent}`);
    }

    // Optional tags
    if (learning.technology) {
      tags.push(`tech:${learning.technology}`);
    }
    
    if (learning.phase) {
      tags.push(`phase:${learning.phase}`);
    }

    if (learning.project_type) {
      tags.push(`project:${learning.project_type}`);
    }

    return tags;
  }

  /**
   * Prioritize a list of learnings for implementation
   */
  prioritizeLearnings(learnings) {
    // Categorize all learnings
    const categorized = learnings.map(learning => ({
      learning,
      categorization: this.categorizeLearning(learning)
    }));

    // Sort by priority and confidence
    const priorityOrder = this.categories.implementation_rules.priority_order;
    
    categorized.sort((a, b) => {
      // First sort by category priority
      const aPriority = priorityOrder.indexOf(a.categorization.primary_category);
      const bPriority = priorityOrder.indexOf(b.categorization.primary_category);
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then by confidence
      return b.categorization.confidence - a.categorization.confidence;
    });

    // Group by implementation batches
    const batches = this.createImplementationBatches(categorized);

    return {
      total_learnings: learnings.length,
      categorized: categorized,
      implementation_batches: batches,
      priority_summary: this.generatePrioritySummary(categorized)
    };
  }

  /**
   * Create implementation batches based on priority
   */
  createImplementationBatches(categorizedLearnings) {
    const batches = [];
    const batchSizes = this.categories.implementation_rules.batch_size;
    
    let currentBatch = [];
    let currentPriority = null;

    categorizedLearnings.forEach(item => {
      const priority = item.categorization.priority;
      const maxSize = batchSizes[priority];

      if (currentPriority !== priority || currentBatch.length >= maxSize) {
        if (currentBatch.length > 0) {
          batches.push({
            batch_number: batches.length + 1,
            priority: currentPriority,
            learnings: currentBatch,
            estimated_days: this.estimateImplementationTime(currentBatch)
          });
        }
        currentBatch = [];
        currentPriority = priority;
      }

      currentBatch.push(item);
    });

    // Add final batch
    if (currentBatch.length > 0) {
      batches.push({
        batch_number: batches.length + 1,
        priority: currentPriority,
        learnings: currentBatch,
        estimated_days: this.estimateImplementationTime(currentBatch)
      });
    }

    return batches;
  }

  /**
   * Estimate implementation time for a batch
   */
  estimateImplementationTime(batch) {
    const baseTime = {
      'high': 1,
      'medium': 2,
      'low': 3
    };

    const priority = batch[0].categorization.priority;
    const complexity = batch.length * 0.5;
    
    return Math.ceil(baseTime[priority] + complexity);
  }

  /**
   * Generate priority summary
   */
  generatePrioritySummary(categorized) {
    const summary = {
      by_category: {},
      by_priority: {},
      high_confidence: 0,
      total_confidence: 0
    };

    categorized.forEach(item => {
      const cat = item.categorization;
      
      // By category
      summary.by_category[cat.primary_category] = 
        (summary.by_category[cat.primary_category] || 0) + 1;
      
      // By priority
      summary.by_priority[cat.priority] = 
        (summary.by_priority[cat.priority] || 0) + 1;
      
      // Confidence
      if (cat.confidence > 0.8) {
        summary.high_confidence++;
      }
      summary.total_confidence += cat.confidence;
    });

    summary.average_confidence = 
      summary.total_confidence / categorized.length;

    return summary;
  }

  /**
   * Check if a learning should be implemented
   */
  shouldImplement(learning, categorization) {
    // Check confidence threshold
    if (categorization.confidence < 0.7) {
      return { implement: false, reason: 'Low confidence score' };
    }

    // Check if validation is required
    const category = this.categories.categories[categorization.primary_category];
    if (category.validation_required && !learning.validated) {
      return { implement: false, reason: 'Validation required' };
    }

    // Check implementation rules
    const rules = this.categories.implementation_rules;
    if (learning.error_rate && learning.error_rate > rules.rollback_thresholds.error_rate_increase) {
      return { implement: false, reason: 'High error rate risk' };
    }

    return { implement: true, reason: 'Meets all criteria' };
  }

  /**
   * Generate implementation report
   */
  generateReport(learnings) {
    const prioritized = this.prioritizeLearnings(learnings);
    
    return {
      summary: prioritized.priority_summary,
      implementation_plan: {
        total_batches: prioritized.implementation_batches.length,
        estimated_days: prioritized.implementation_batches
          .reduce((sum, batch) => sum + batch.estimated_days, 0),
        high_priority_count: prioritized.priority_summary.by_priority.high || 0,
        categories_covered: Object.keys(prioritized.priority_summary.by_category)
      },
      recommendations: this.generateRecommendations(prioritized)
    };
  }

  /**
   * Generate recommendations based on categorization
   */
  generateRecommendations(prioritized) {
    const recommendations = [];

    // High priority items
    if (prioritized.priority_summary.by_priority.high > 5) {
      recommendations.push({
        type: 'urgent',
        message: `${prioritized.priority_summary.by_priority.high} high-priority items require immediate attention`,
        action: 'Allocate resources for critical fixes'
      });
    }

    // Low confidence items
    if (prioritized.priority_summary.average_confidence < 0.6) {
      recommendations.push({
        type: 'quality',
        message: 'Overall confidence is low, more validation needed',
        action: 'Gather more data before implementation'
      });
    }

    // Category imbalance
    const categories = Object.keys(prioritized.priority_summary.by_category);
    if (categories.length === 1) {
      recommendations.push({
        type: 'diversity',
        message: 'All learnings are in a single category',
        action: 'Consider broader analysis scope'
      });
    }

    return recommendations;
  }
}

module.exports = LearningCategorizer;

// CLI interface
if (require.main === module) {
  const categorizer = new LearningCategorizer(path.join(__dirname, '..'));
  
  // Example usage
  const exampleLearnings = [
    {
      id: 'L001',
      content: 'Fixed TypeScript compilation error in React components',
      agent: 'coder_agent',
      sample_size: 5,
      success_rate: 0.95
    },
    {
      id: 'L002',
      content: 'Optimized token usage by caching API responses',
      agent: 'api_agent',
      sample_size: 3,
      success_rate: 0.8
    }
  ];

  const report = categorizer.generateReport(exampleLearnings);
  
  console.log('📊 Learning Categorization Report');
  console.log('=================================');
  console.log(JSON.stringify(report, null, 2));
}