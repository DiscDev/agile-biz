/**
 * Token Budget Manager for Sub-Agent System
 * Calculates and enforces token budgets for parallel sub-agent execution
 */

class TokenBudgetManager {
  constructor() {
    this.baseAllocation = 10000;
    this.sessionLimit = 100000;
    this.warningThreshold = 0.8;
    this.usageTracking = new Map();
    
    // Multipliers for different factors
    this.multipliers = {
      researchLevel: {
        minimal: 0.5,
        medium: 1.0,
        thorough: 2.0
      },
      complexity: {
        simple: 0.8,    // Basic CRUD operations
        standard: 1.0,  // Standard business logic
        complex: 1.5    // Complex algorithms, integrations
      },
      documentCount: {
        // Progressive scaling - more documents need proportionally more tokens
        formula: (count) => 1 + (count - 1) * 0.3
      },
      priority: {
        low: 0.7,
        medium: 1.0,
        high: 1.3,
        critical: 1.5
      },
      taskType: {
        research: 1.2,      // Research needs more exploration
        coding: 1.0,        // Standard allocation
        analysis: 1.1,      // Slightly more for deep analysis
        documentation: 0.8, // Less intensive
        testing: 0.9        // Moderate usage
      }
    };
  }

  /**
   * Calculate token budget for a sub-agent task
   * @param {Object} task - Task configuration
   * @returns {number} Allocated token budget
   */
  calculateBudget(task) {
    // Start with base allocation
    let budget = this.baseAllocation;
    
    // Apply research level multiplier if applicable
    if (task.researchLevel && this.multipliers.researchLevel[task.researchLevel]) {
      budget *= this.multipliers.researchLevel[task.researchLevel];
    }
    
    // Apply complexity multiplier
    const complexity = task.complexity || 'standard';
    budget *= this.multipliers.complexity[complexity];
    
    // Apply document count multiplier
    if (task.documentCount && task.documentCount > 0) {
      budget *= this.multipliers.documentCount.formula(task.documentCount);
    }
    
    // Apply priority multiplier
    const priority = task.priority || 'medium';
    budget *= this.multipliers.priority[priority];
    
    // Apply task type multiplier
    if (task.taskType && this.multipliers.taskType[task.taskType]) {
      budget *= this.multipliers.taskType[task.taskType];
    }
    
    // Round to nearest 1000 for cleaner budgets
    return Math.round(budget / 1000) * 1000;
  }

  /**
   * Calculate budgets for specific workflow phases
   */
  calculatePhaseBudgets(phase, config) {
    const phaseBudgets = {
      research: {
        minimal: {
          perGroup: 5000,
          groups: ['market', 'business', 'technical'],
          total: 15000
        },
        medium: {
          perGroup: 10000,
          groups: ['market', 'business', 'technical'],
          total: 30000
        },
        thorough: {
          perGroup: 20000,
          groups: ['market', 'business', 'technical', 'strategic', 'operational'],
          total: 100000
        }
      },
      
      sprintExecution: {
        simple: 8000,      // Basic CRUD story
        standard: 10000,   // Standard feature
        complex: 15000,    // Complex integration
        spike: 5000        // Research/investigation
      },
      
      projectAnalysis: {
        quick: {
          perCategory: 5000,
          categories: ['architecture', 'quality', 'security', 'performance'],
          total: 20000
        },
        standard: {
          perCategory: 10000,
          categories: ['architecture', 'quality', 'security', 'performance'],
          total: 40000
        },
        deep: {
          perCategory: 20000,
          categories: ['architecture', 'quality', 'security', 'performance'],
          total: 80000
        }
      }
    };
    
    return phaseBudgets[phase]?.[config] || this.baseAllocation;
  }

  /**
   * Track token usage for a sub-agent
   */
  trackUsage(subAgentId, tokensUsed) {
    if (!this.usageTracking.has(subAgentId)) {
      this.usageTracking.set(subAgentId, {
        allocated: 0,
        used: 0,
        warnings: []
      });
    }
    
    const tracking = this.usageTracking.get(subAgentId);
    tracking.used += tokensUsed;
    
    // Check thresholds
    const usageRatio = tracking.used / tracking.allocated;
    
    if (usageRatio >= this.warningThreshold && usageRatio < 1.0) {
      tracking.warnings.push({
        timestamp: new Date().toISOString(),
        message: `Approaching token limit: ${Math.round(usageRatio * 100)}% used`,
        tokensRemaining: tracking.allocated - tracking.used
      });
    }
    
    if (usageRatio >= 1.0) {
      tracking.warnings.push({
        timestamp: new Date().toISOString(),
        message: 'Token budget exceeded',
        overage: tracking.used - tracking.allocated
      });
    }
    
    return tracking;
  }

  /**
   * Allocate tokens to a sub-agent
   */
  allocateTokens(subAgentId, budget) {
    if (!this.usageTracking.has(subAgentId)) {
      this.usageTracking.set(subAgentId, {
        allocated: budget,
        used: 0,
        warnings: []
      });
    } else {
      this.usageTracking.get(subAgentId).allocated = budget;
    }
  }

  /**
   * Check if sub-agent has budget remaining
   */
  hasRemainingBudget(subAgentId) {
    const tracking = this.usageTracking.get(subAgentId);
    if (!tracking) return true; // No tracking yet
    
    return tracking.used < tracking.allocated;
  }

  /**
   * Get remaining budget for sub-agent
   */
  getRemainingBudget(subAgentId) {
    const tracking = this.usageTracking.get(subAgentId);
    if (!tracking) return this.baseAllocation;
    
    return Math.max(0, tracking.allocated - tracking.used);
  }

  /**
   * Generate usage report for session
   */
  generateUsageReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalAllocated: 0,
      totalUsed: 0,
      subAgents: []
    };
    
    for (const [subAgentId, tracking] of this.usageTracking.entries()) {
      report.totalAllocated += tracking.allocated;
      report.totalUsed += tracking.used;
      
      report.subAgents.push({
        id: subAgentId,
        allocated: tracking.allocated,
        used: tracking.used,
        efficiency: Math.round((tracking.used / tracking.allocated) * 100) + '%',
        warnings: tracking.warnings
      });
    }
    
    report.overallEfficiency = Math.round((report.totalUsed / report.totalAllocated) * 100) + '%';
    
    return report;
  }

  /**
   * Adjust future allocations based on historical usage
   */
  optimizeAllocations(historicalData) {
    const optimizations = {
      adjustments: [],
      recommendations: []
    };
    
    // Analyze patterns
    for (const session of historicalData) {
      for (const subAgent of session.subAgents) {
        const efficiency = subAgent.used / subAgent.allocated;
        
        if (efficiency < 0.5) {
          optimizations.recommendations.push({
            pattern: 'underutilization',
            taskType: subAgent.taskType,
            suggestion: 'Reduce allocation by 30%',
            currentMultiplier: this.multipliers.taskType[subAgent.taskType],
            suggestedMultiplier: this.multipliers.taskType[subAgent.taskType] * 0.7
          });
        } else if (efficiency > 0.95) {
          optimizations.recommendations.push({
            pattern: 'near-limit',
            taskType: subAgent.taskType,
            suggestion: 'Increase allocation by 20%',
            currentMultiplier: this.multipliers.taskType[subAgent.taskType],
            suggestedMultiplier: this.multipliers.taskType[subAgent.taskType] * 1.2
          });
        }
      }
    }
    
    return optimizations;
  }
}

module.exports = TokenBudgetManager;