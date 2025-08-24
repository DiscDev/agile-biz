/**
 * AI Velocity Tracker for AgileAiAgents
 * Tracks story points per hour velocity for AI agent teams
 * Updated for AI-speed sprints based on story point completion
 */

const fs = require('fs');
const path = require('path');
const { storyTracker } = require('./story-tracker');
const { monitor } = require('./performance-monitor');

class AIVelocityTracker {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.velocityPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'velocity-history.json'
    );
    this.sprintHistory = [];
    this.currentSprint = null;
    this.agentVelocities = new Map();
    this.teamBaseline = null;
    
    // Load velocity history
    this.velocityHistory = this.loadVelocityHistory();
    
    // Velocity calculation window (sprints)
    this.rollingWindow = 3;
  }
  
  /**
   * Load velocity history from file
   */
  loadVelocityHistory() {
    try {
      if (fs.existsSync(this.velocityPath)) {
        return JSON.parse(fs.readFileSync(this.velocityPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading velocity history:', error.message);
    }
    
    // Initialize with empty history
    return {
      meta: {
        document_type: "velocity_history",
        version: "1.0.0",
        updated_at: new Date().toISOString()
      },
      team_velocity: {
        sprints: [],
        current_velocity: 0,
        average_velocity: 0,
        trend: 'stable'
      },
      agent_velocity: {},
      predictions: {
        next_sprint_velocity: 0,
        confidence: 'low',
        factors: []
      }
    };
  }
  
  /**
   * Record sprint velocity
   */
  recordSprintVelocity(sprintData) {
    const sprintVelocity = {
      sprint_id: sprintData.sprint_id,
      sprint_number: this.velocityHistory.team_velocity.sprints.length + 1,
      start_date: sprintData.start_date,
      end_date: sprintData.end_date,
      
      // Points
      planned_points: sprintData.planned_points || 0,
      completed_points: sprintData.completed_points || 0,
      velocity: sprintData.completed_points || 0,
      
      // Stories
      stories_planned: sprintData.stories_planned || 0,
      stories_completed: sprintData.stories_completed || 0,
      stories_carried_over: sprintData.stories_carried_over || 0,
      
      // Time metrics
      total_hours_worked: sprintData.total_hours_worked || 0,
      blocked_hours: sprintData.blocked_hours || 0,
      efficiency: this.calculateEfficiency(sprintData),
      
      // Quality metrics
      defects_found: sprintData.defects_found || 0,
      defects_fixed: sprintData.defects_fixed || 0,
      
      // By agent breakdown
      agent_contributions: this.calculateAgentContributions(sprintData.sprint_id)
    };
    
    // Add to history
    this.velocityHistory.team_velocity.sprints.push(sprintVelocity);
    
    // Update current and average velocity
    this.updateTeamVelocityMetrics();
    
    // Update agent velocities
    this.updateAgentVelocities(sprintVelocity);
    
    // Generate predictions
    this.generateVelocityPredictions();
    
    // Save updated history
    this.saveVelocityHistory();
    
    console.log(`📈 Recorded velocity for ${sprintData.sprint_id}: ${sprintVelocity.velocity} points`);
    
    return {
      sprint_velocity: sprintVelocity,
      team_metrics: this.getTeamVelocityMetrics(),
      agent_metrics: this.getAgentVelocityMetrics(),
      predictions: this.velocityHistory.predictions
    };
  }
  
  /**
   * Calculate efficiency
   */
  calculateEfficiency(sprintData) {
    if (!sprintData.total_hours_worked || sprintData.total_hours_worked === 0) {
      return 100; // Default efficiency
    }
    
    const plannedHours = sprintData.planned_hours || sprintData.total_hours_worked;
    const efficiency = (plannedHours / sprintData.total_hours_worked) * 100;
    
    return Math.min(150, Math.max(50, efficiency)); // Cap between 50-150%
  }
  
  /**
   * Calculate agent contributions
   */
  calculateAgentContributions(sprintId) {
    const contributions = {};
    const stories = storyTracker.getSprintStories(sprintId);
    
    // Get task metrics by agent
    const taskMetrics = monitor.getTaskMetricsByAgent();
    
    // Calculate points completed by each agent
    for (const storyData of stories) {
      const story = storyData.story;
      
      if (story.status === 'completed' && story.story_points) {
        const points = typeof story.story_points === 'object' 
          ? story.story_points.by_agent 
          : { default_agent: story.story_points };
        
        for (const [agent, agentPoints] of Object.entries(points)) {
          if (!contributions[agent]) {
            contributions[agent] = {
              points_completed: 0,
              stories_completed: 0,
              tasks_completed: 0,
              average_cycle_time: 0,
              efficiency: 100
            };
          }
          
          contributions[agent].points_completed += agentPoints;
          contributions[agent].stories_completed++;
        }
      }
    }
    
    // Add task metrics
    for (const [agent, metrics] of Object.entries(taskMetrics)) {
      if (contributions[agent]) {
        contributions[agent].tasks_completed = metrics.tasks_completed;
        contributions[agent].average_cycle_time = metrics.average_time;
        contributions[agent].efficiency = metrics.efficiency_score;
      }
    }
    
    return contributions;
  }
  
  /**
   * Update team velocity metrics
   */
  updateTeamVelocityMetrics() {
    const sprints = this.velocityHistory.team_velocity.sprints;
    
    if (sprints.length === 0) return;
    
    // Current velocity (last sprint)
    this.velocityHistory.team_velocity.current_velocity = 
      sprints[sprints.length - 1].velocity;
    
    // Calculate rolling average
    const recentSprints = sprints.slice(-this.rollingWindow);
    const totalVelocity = recentSprints.reduce((sum, s) => sum + s.velocity, 0);
    this.velocityHistory.team_velocity.average_velocity = 
      totalVelocity / recentSprints.length;
    
    // Calculate trend
    this.velocityHistory.team_velocity.trend = this.calculateTrend(
      recentSprints.map(s => s.velocity)
    );
    
    // Update timestamp
    this.velocityHistory.meta.updated_at = new Date().toISOString();
  }
  
  /**
   * Update individual agent velocities
   */
  updateAgentVelocities(sprintVelocity) {
    for (const [agent, contribution] of Object.entries(sprintVelocity.agent_contributions)) {
      if (!this.velocityHistory.agent_velocity[agent]) {
        this.velocityHistory.agent_velocity[agent] = {
          sprints: [],
          current_velocity: 0,
          average_velocity: 0,
          capacity: 0,
          trend: 'stable'
        };
      }
      
      const agentVelocity = this.velocityHistory.agent_velocity[agent];
      
      // Add sprint data
      agentVelocity.sprints.push({
        sprint_id: sprintVelocity.sprint_id,
        points: contribution.points_completed,
        efficiency: contribution.efficiency
      });
      
      // Update current velocity
      agentVelocity.current_velocity = contribution.points_completed;
      
      // Calculate rolling average
      const recentSprints = agentVelocity.sprints.slice(-this.rollingWindow);
      const totalPoints = recentSprints.reduce((sum, s) => sum + s.points, 0);
      agentVelocity.average_velocity = totalPoints / recentSprints.length;
      
      // Estimate capacity (velocity + 20% buffer)
      agentVelocity.capacity = Math.ceil(agentVelocity.average_velocity * 1.2);
      
      // Calculate trend
      agentVelocity.trend = this.calculateTrend(
        recentSprints.map(s => s.points)
      );
    }
  }
  
  /**
   * Calculate velocity trend
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    // Simple linear regression
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Determine trend based on slope
    if (slope > 0.5) return 'increasing';
    if (slope < -0.5) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Generate velocity predictions
   */
  generateVelocityPredictions() {
    const sprints = this.velocityHistory.team_velocity.sprints;
    
    if (sprints.length < 3) {
      this.velocityHistory.predictions = {
        next_sprint_velocity: this.velocityHistory.team_velocity.current_velocity,
        confidence: 'low',
        factors: ['Insufficient historical data']
      };
      return;
    }
    
    // Base prediction on rolling average
    let predictedVelocity = this.velocityHistory.team_velocity.average_velocity;
    const factors = [];
    
    // Adjust for trend
    const trend = this.velocityHistory.team_velocity.trend;
    if (trend === 'increasing') {
      predictedVelocity *= 1.05;
      factors.push('Positive velocity trend (+5%)');
    } else if (trend === 'decreasing') {
      predictedVelocity *= 0.95;
      factors.push('Negative velocity trend (-5%)');
    }
    
    // Adjust for recent efficiency
    const recentSprints = sprints.slice(-3);
    const avgEfficiency = recentSprints.reduce((sum, s) => sum + s.efficiency, 0) / recentSprints.length;
    
    if (avgEfficiency > 110) {
      predictedVelocity *= 1.03;
      factors.push('High team efficiency (+3%)');
    } else if (avgEfficiency < 90) {
      predictedVelocity *= 0.97;
      factors.push('Low team efficiency (-3%)');
    }
    
    // Check for carry-over pattern
    const carryOverRate = recentSprints.reduce((sum, s) => 
      sum + (s.stories_carried_over / Math.max(1, s.stories_planned)), 0
    ) / recentSprints.length;
    
    if (carryOverRate > 0.2) {
      predictedVelocity *= 0.95;
      factors.push('High carry-over rate (-5%)');
    }
    
    // Determine confidence
    const variance = this.calculateVariance(recentSprints.map(s => s.velocity));
    let confidence = 'medium';
    
    if (variance < 0.15) {
      confidence = 'high';
    } else if (variance > 0.3) {
      confidence = 'low';
      factors.push('High velocity variance');
    }
    
    // Round to nearest whole number
    predictedVelocity = Math.round(predictedVelocity);
    
    this.velocityHistory.predictions = {
      next_sprint_velocity: predictedVelocity,
      confidence: confidence,
      factors: factors,
      based_on_sprints: recentSprints.length,
      prediction_range: {
        min: Math.round(predictedVelocity * 0.8),
        max: Math.round(predictedVelocity * 1.2)
      }
    };
  }
  
  /**
   * Calculate variance (coefficient of variation)
   */
  calculateVariance(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    return mean > 0 ? Math.sqrt(variance) / mean : 0;
  }
  
  /**
   * Get team velocity metrics
   */
  getTeamVelocityMetrics() {
    return {
      current_velocity: this.velocityHistory.team_velocity.current_velocity,
      average_velocity: this.velocityHistory.team_velocity.average_velocity.toFixed(1),
      trend: this.velocityHistory.team_velocity.trend,
      sprint_count: this.velocityHistory.team_velocity.sprints.length,
      
      // Historical range
      velocity_range: this.getVelocityRange(),
      
      // Consistency
      consistency: this.calculateConsistency()
    };
  }
  
  /**
   * Get agent velocity metrics
   */
  getAgentVelocityMetrics() {
    const metrics = {};
    
    for (const [agent, data] of Object.entries(this.velocityHistory.agent_velocity)) {
      metrics[agent] = {
        current_velocity: data.current_velocity,
        average_velocity: data.average_velocity.toFixed(1),
        capacity: data.capacity,
        trend: data.trend,
        utilization: data.average_velocity > 0 
          ? ((data.current_velocity / data.average_velocity) * 100).toFixed(1) + '%'
          : 'N/A'
      };
    }
    
    return metrics;
  }
  
  /**
   * Get velocity range
   */
  getVelocityRange() {
    const velocities = this.velocityHistory.team_velocity.sprints.map(s => s.velocity);
    
    if (velocities.length === 0) {
      return { min: 0, max: 0 };
    }
    
    return {
      min: Math.min(...velocities),
      max: Math.max(...velocities)
    };
  }
  
  /**
   * Calculate team consistency
   */
  calculateConsistency() {
    const recentSprints = this.velocityHistory.team_velocity.sprints.slice(-5);
    
    if (recentSprints.length < 2) {
      return 'insufficient_data';
    }
    
    const variance = this.calculateVariance(recentSprints.map(s => s.velocity));
    
    if (variance < 0.15) return 'high';
    if (variance < 0.3) return 'medium';
    return 'low';
  }
  
  /**
   * Forecast completion for epic
   */
  forecastEpicCompletion(remainingPoints) {
    const avgVelocity = this.velocityHistory.team_velocity.average_velocity;
    
    if (avgVelocity === 0) {
      return {
        sprints_required: 'unknown',
        estimated_completion: 'unknown',
        confidence: 'none'
      };
    }
    
    const sprintsRequired = Math.ceil(remainingPoints / avgVelocity);
    const sprintDuration = 2; // hours
    
    const estimatedCompletion = new Date(
      Date.now() + sprintsRequired * sprintDuration * 60 * 60 * 1000
    );
    
    return {
      sprints_required: sprintsRequired,
      estimated_completion: estimatedCompletion.toISOString(),
      confidence: this.velocityHistory.predictions.confidence,
      velocity_assumption: avgVelocity,
      range: {
        best_case: Math.ceil(remainingPoints / (avgVelocity * 1.2)),
        worst_case: Math.ceil(remainingPoints / (avgVelocity * 0.8))
      }
    };
  }
  
  /**
   * Get velocity chart data
   */
  getChartData() {
    const sprints = this.velocityHistory.team_velocity.sprints;
    
    return {
      // Team velocity over time
      team_velocity: sprints.map(s => ({
        sprint: s.sprint_id,
        velocity: s.velocity,
        planned: s.planned_points
      })),
      
      // Average line
      average_line: sprints.map(() => 
        this.velocityHistory.team_velocity.average_velocity
      ),
      
      // Agent breakdown for recent sprints
      agent_breakdown: this.getAgentBreakdown(),
      
      // Predictions
      prediction: {
        next_sprint: this.velocityHistory.predictions.next_sprint_velocity,
        confidence: this.velocityHistory.predictions.confidence,
        range: this.velocityHistory.predictions.prediction_range
      }
    };
  }
  
  /**
   * Get agent breakdown for recent sprints
   */
  getAgentBreakdown() {
    const recentSprints = this.velocityHistory.team_velocity.sprints.slice(-5);
    const breakdown = {};
    
    for (const sprint of recentSprints) {
      breakdown[sprint.sprint_id] = sprint.agent_contributions;
    }
    
    return breakdown;
  }
  
  /**
   * Save velocity history
   */
  saveVelocityHistory() {
    try {
      fs.writeFileSync(this.velocityPath, JSON.stringify(this.velocityHistory, null, 2));
      console.log('💾 Velocity history saved');
    } catch (error) {
      console.error('Error saving velocity history:', error.message);
    }
  }
}

// Export the class and create instance
const velocityTracker = new VelocityTracker();

module.exports = {
  VelocityTracker,
  velocityTracker,
  
  // Convenience exports
  recordSprintVelocity: (sprintData) => velocityTracker.recordSprintVelocity(sprintData),
  getTeamVelocityMetrics: () => velocityTracker.getTeamVelocityMetrics(),
  getAgentVelocityMetrics: () => velocityTracker.getAgentVelocityMetrics(),
  forecastEpicCompletion: (points) => velocityTracker.forecastEpicCompletion(points),
  getChartData: () => velocityTracker.getChartData()
};

// If run directly, simulate velocity tracking
if (require.main === module) {
  console.log('📈 Simulating Velocity Tracking');
  
  // Simulate multiple sprints
  const sprints = [
    {
      sprint_id: 'sprint_1',
      start_date: '2024-01-01',
      end_date: '2024-01-02',
      planned_points: 25,
      completed_points: 20,
      stories_planned: 8,
      stories_completed: 6,
      stories_carried_over: 2,
      total_hours_worked: 8,
      blocked_hours: 1
    },
    {
      sprint_id: 'sprint_2',
      start_date: '2024-01-03',
      end_date: '2024-01-04',
      planned_points: 30,
      completed_points: 28,
      stories_planned: 10,
      stories_completed: 9,
      stories_carried_over: 1,
      total_hours_worked: 9,
      blocked_hours: 0.5
    },
    {
      sprint_id: 'sprint_3',
      start_date: '2024-01-05',
      end_date: '2024-01-06',
      planned_points: 25,
      completed_points: 25,
      stories_planned: 8,
      stories_completed: 8,
      stories_carried_over: 0,
      total_hours_worked: 7,
      blocked_hours: 0
    }
  ];
  
  // Record each sprint
  for (const sprint of sprints) {
    console.log(`\nRecording ${sprint.sprint_id}...`);
    const result = velocityTracker.recordSprintVelocity(sprint);
    console.log('Team metrics:', result.team_metrics);
  }
  
  // Show predictions
  console.log('\nVelocity Predictions:', velocityTracker.velocityHistory.predictions);
  
  // Forecast epic completion
  const epicForecast = velocityTracker.forecastEpicCompletion(100);
  console.log('\nEpic Forecast (100 points):', epicForecast);
  
  // Get chart data
  const chartData = velocityTracker.getChartData();
  console.log('\nChart data ready with', chartData.team_velocity.length, 'sprints');
}