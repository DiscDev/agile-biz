/**
 * Story Point Calibration System
 * Provides reference stories and calibration functions for agent-specific story point estimation
 */

const fs = require('fs');
const path = require('path');

class StoryPointCalibration {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    
    // Fibonacci sequence for story points
    this.fibonacciScale = [1, 2, 3, 5, 8, 13, 21];
    
    // Reference stories for calibration
    this.referenceStories = {
      // 2-point reference
      simpleLoginForm: {
        points: 2,
        title: "Simple login form implementation",
        description: "Create a basic login form with email/password fields and validation",
        complexity: {
          ui_design: "low",
          frontend_dev: "low", 
          backend_dev: "low",
          testing: "low",
          documentation: "low"
        },
        typicalTasks: [
          "Design simple form layout",
          "Implement form fields and basic validation",
          "Create login endpoint",
          "Write unit tests",
          "Document usage"
        ]
      },
      
      // 3-point reference
      basicCrudApi: {
        points: 3,
        title: "Basic CRUD API endpoint",
        description: "Implement Create, Read, Update, Delete operations for a single resource",
        complexity: {
          ui_design: "none",
          frontend_dev: "none",
          backend_dev: "medium",
          testing: "medium",
          documentation: "low"
        },
        typicalTasks: [
          "Design API structure",
          "Implement all CRUD operations",
          "Add input validation",
          "Write comprehensive tests",
          "Create API documentation"
        ]
      },
      
      // 5-point reference
      marketingStrategy: {
        points: 5,
        title: "Marketing strategy document",
        description: "Create comprehensive marketing strategy with analysis and recommendations",
        complexity: {
          research: "high",
          analysis: "high",
          writing: "high",
          visuals: "medium",
          review: "medium"
        },
        typicalTasks: [
          "Market research and competitor analysis",
          "Define target audience and personas",
          "Develop marketing channels strategy",
          "Create budget and timeline",
          "Design presentation materials"
        ]
      }
    };
    
    // Agent-specific calibration factors
    this.agentCalibrationFactors = {
      coder_agent: {
        speed_factor: 1.0,
        complexity_weights: {
          algorithm_complexity: 0.3,
          integration_complexity: 0.2,
          testing_requirements: 0.2,
          performance_requirements: 0.15,
          security_requirements: 0.15
        }
      },
      ui_ux_agent: {
        speed_factor: 0.9,
        complexity_weights: {
          design_complexity: 0.35,
          user_research: 0.2,
          prototyping: 0.2,
          responsive_design: 0.15,
          accessibility: 0.1
        }
      },
      testing_agent: {
        speed_factor: 1.1,
        complexity_weights: {
          test_coverage: 0.3,
          test_types: 0.25,
          automation_required: 0.2,
          edge_cases: 0.15,
          performance_testing: 0.1
        }
      },
      devops_agent: {
        speed_factor: 0.95,
        complexity_weights: {
          infrastructure_complexity: 0.3,
          deployment_complexity: 0.25,
          monitoring_setup: 0.2,
          security_config: 0.15,
          scaling_requirements: 0.1
        }
      },
      documentation_agent: {
        speed_factor: 1.2,
        complexity_weights: {
          content_volume: 0.35,
          technical_depth: 0.25,
          audience_diversity: 0.2,
          visual_requirements: 0.1,
          update_frequency: 0.1
        }
      },
      marketing_agent: {
        speed_factor: 0.85,
        complexity_weights: {
          research_depth: 0.3,
          content_creation: 0.25,
          strategy_complexity: 0.2,
          channel_diversity: 0.15,
          measurement_setup: 0.1
        }
      }
    };
  }
  
  /**
   * Get reference story by points
   */
  getReferenceStory(points) {
    for (const [key, story] of Object.entries(this.referenceStories)) {
      if (story.points === points) {
        return story;
      }
    }
    return null;
  }
  
  /**
   * Calibrate story points for a specific agent
   */
  calibrateForAgent(basePoints, agentType, complexityFactors = {}) {
    const agentCalibration = this.agentCalibrationFactors[agentType];
    if (!agentCalibration) {
      return basePoints;
    }
    
    // Calculate complexity score
    let complexityScore = 0;
    let totalWeight = 0;
    
    for (const [factor, weight] of Object.entries(agentCalibration.complexity_weights)) {
      if (complexityFactors[factor] !== undefined) {
        complexityScore += complexityFactors[factor] * weight;
        totalWeight += weight;
      }
    }
    
    // Normalize complexity score
    const normalizedComplexity = totalWeight > 0 ? complexityScore / totalWeight : 1;
    
    // Apply agent speed factor and complexity adjustment
    const adjustedPoints = basePoints * agentCalibration.speed_factor * normalizedComplexity;
    
    // Round to nearest Fibonacci number
    return this.roundToFibonacci(adjustedPoints);
  }
  
  /**
   * Round to nearest Fibonacci number
   */
  roundToFibonacci(points) {
    let closest = this.fibonacciScale[0];
    let minDiff = Math.abs(points - closest);
    
    for (const fib of this.fibonacciScale) {
      const diff = Math.abs(points - fib);
      if (diff < minDiff) {
        minDiff = diff;
        closest = fib;
      }
    }
    
    return closest;
  }
  
  /**
   * Normalize points across agents for multi-agent stories
   */
  normalizeMultiAgentPoints(agentPoints) {
    const agents = Object.keys(agentPoints);
    const totalRawPoints = Object.values(agentPoints).reduce((sum, points) => sum + points, 0);
    
    // Calculate normalized distribution
    const normalizedPoints = {};
    let normalizedTotal = 0;
    
    for (const [agent, points] of Object.entries(agentPoints)) {
      const proportion = points / totalRawPoints;
      const normalized = Math.max(1, Math.round(proportion * totalRawPoints));
      normalizedPoints[agent] = this.roundToFibonacci(normalized);
      normalizedTotal += normalizedPoints[agent];
    }
    
    return {
      by_agent: normalizedPoints,
      total: this.roundToFibonacci(normalizedTotal)
    };
  }
  
  /**
   * Get calibration guidelines for an agent
   */
  getAgentGuidelines(agentType) {
    const calibration = this.agentCalibrationFactors[agentType];
    if (!calibration) {
      return null;
    }
    
    return {
      agent: agentType,
      speed_factor: calibration.speed_factor,
      complexity_factors: Object.keys(calibration.complexity_weights),
      guidelines: this.generateGuidelines(agentType, calibration)
    };
  }
  
  /**
   * Generate estimation guidelines for an agent
   */
  generateGuidelines(agentType, calibration) {
    const guidelines = [];
    
    // Speed factor interpretation
    if (calibration.speed_factor < 0.95) {
      guidelines.push("This agent typically requires more time than baseline estimates");
    } else if (calibration.speed_factor > 1.05) {
      guidelines.push("This agent typically completes work faster than baseline estimates");
    }
    
    // Complexity factor guidelines
    const topFactors = Object.entries(calibration.complexity_weights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([factor, weight]) => ({
        factor: factor.replace(/_/g, ' '),
        impact: weight >= 0.3 ? 'high' : weight >= 0.2 ? 'medium' : 'low'
      }));
    
    guidelines.push(`Key complexity factors: ${topFactors.map(f => `${f.factor} (${f.impact} impact)`).join(', ')}`);
    
    return guidelines;
  }
  
  /**
   * Save calibration data to JSON
   */
  saveCalibrationData() {
    const outputPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      'orchestration',
      'reference-stories.json'
    );
    
    const calibrationData = {
      meta: {
        document_type: "story_point_calibration",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      },
      fibonacci_scale: this.fibonacciScale,
      reference_stories: this.referenceStories,
      agent_calibration_factors: this.agentCalibrationFactors,
      estimation_guidelines: {}
    };
    
    // Add guidelines for each agent
    for (const agentType of Object.keys(this.agentCalibrationFactors)) {
      calibrationData.estimation_guidelines[agentType] = this.getAgentGuidelines(agentType);
    }
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(calibrationData, null, 2));
    console.log(`✅ Saved calibration data to ${outputPath}`);
    
    return calibrationData;
  }
}

// Export the class and create instance
const calibration = new StoryPointCalibration();

module.exports = {
  StoryPointCalibration,
  calibration,
  
  // Convenience exports
  fibonacciScale: calibration.fibonacciScale,
  referenceStories: calibration.referenceStories,
  calibrateForAgent: (points, agent, factors) => calibration.calibrateForAgent(points, agent, factors),
  normalizeMultiAgentPoints: (points) => calibration.normalizeMultiAgentPoints(points),
  roundToFibonacci: (points) => calibration.roundToFibonacci(points)
};

// If run directly, save calibration data
if (require.main === module) {
  calibration.saveCalibrationData();
  console.log('📊 Story Point Calibration System initialized');
  console.log('📋 Reference stories:', Object.keys(calibration.referenceStories));
  console.log('🤖 Calibrated agents:', Object.keys(calibration.agentCalibrationFactors).length);
}