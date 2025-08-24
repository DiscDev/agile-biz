/**
 * Burndown Chart Generator
 * Creates real-time burndown data for sprint tracking
 */

const fs = require('fs');
const path = require('path');
const { storyTracker } = require('./story-tracker');
const { monitor } = require('./performance-monitor');

class BurndownGenerator {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.burndownPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'sprint-tracking',
      'burndown'
    );
    
    // Active burndown charts
    this.activeBurndowns = {};
    
    // Ensure burndown directory exists
    this.ensureBurndownDirectory();
  }
  
  ensureBurndownDirectory() {
    if (!fs.existsSync(this.burndownPath)) {
      fs.mkdirSync(this.burndownPath, { recursive: true });
      console.log(`📁 Created burndown directory: ${this.burndownPath}`);
    }
  }
  
  /**
   * Initialize burndown chart for sprint
   */
  initializeBurndown(sprintData) {
    const burndownId = `burndown_${sprintData.sprint_id}`;
    
    const burndown = {
      meta: {
        document_type: "sprint_burndown",
        version: "1.0.0",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      burndown: {
        sprint_id: sprintData.sprint_id,
        sprint_goal: sprintData.sprint_goal,
        start_date: sprintData.start_date,
        end_date: sprintData.end_date,
        duration_hours: sprintData.duration_hours || 2,
        
        // Total scope
        total_points: sprintData.total_points || 0,
        total_hours: sprintData.total_hours || 0,
        
        // Ideal burndown line
        ideal_burndown: this.calculateIdealBurndown(sprintData),
        
        // Actual progress tracking
        actual_burndown: [{
          timestamp: new Date().toISOString(),
          elapsed_hours: 0,
          remaining_points: sprintData.total_points || 0,
          remaining_hours: sprintData.total_hours || 0,
          completed_points: 0,
          completed_hours: 0,
          stories_completed: 0,
          stories_in_progress: 0,
          stories_blocked: 0
        }],
        
        // Scope changes
        scope_changes: [],
        
        // Velocity metrics
        velocity_metrics: {
          current_velocity: 0,
          projected_velocity: 0,
          required_velocity: 0
        },
        
        // Completion prediction
        completion_prediction: {
          on_track: true,
          projected_completion: sprintData.end_date,
          confidence: 'high'
        }
      }
    };
    
    this.activeBurndowns[burndownId] = burndown;
    this.saveBurndown(burndown);
    
    console.log(`📊 Initialized burndown chart for ${sprintData.sprint_id}`);
    return burndown;
  }
  
  /**
   * Calculate ideal burndown line
   */
  calculateIdealBurndown(sprintData) {
    const totalPoints = sprintData.total_points || 0;
    const durationHours = sprintData.duration_hours || 2;
    const intervals = 10; // 10 data points for ideal line
    
    const idealBurndown = [];
    const pointsPerInterval = totalPoints / intervals;
    
    for (let i = 0; i <= intervals; i++) {
      idealBurndown.push({
        interval: i,
        elapsed_hours: (durationHours / intervals) * i,
        remaining_points: totalPoints - (pointsPerInterval * i),
        percentage_complete: (i / intervals * 100).toFixed(1)
      });
    }
    
    return idealBurndown;
  }
  
  /**
   * Update burndown with current progress
   */
  updateBurndown(sprintId, progressData) {
    const burndownId = `burndown_${sprintId}`;
    const burndown = this.activeBurndowns[burndownId];
    
    if (!burndown) {
      console.error(`Burndown for sprint ${sprintId} not found`);
      return null;
    }
    
    // Calculate current metrics
    const stories = storyTracker.getSprintStories(sprintId);
    const metrics = this.calculateCurrentMetrics(stories);
    
    // Calculate elapsed time
    const startTime = new Date(burndown.burndown.start_date);
    const currentTime = new Date();
    const elapsedHours = (currentTime - startTime) / (1000 * 60 * 60);
    
    // Add data point
    const dataPoint = {
      timestamp: currentTime.toISOString(),
      elapsed_hours: elapsedHours,
      remaining_points: metrics.remaining_points,
      remaining_hours: metrics.remaining_hours,
      completed_points: metrics.completed_points,
      completed_hours: metrics.completed_hours,
      stories_completed: metrics.stories_completed,
      stories_in_progress: metrics.stories_in_progress,
      stories_blocked: metrics.stories_blocked,
      
      // Additional tracking
      velocity: this.calculateVelocity(burndown, elapsedHours, metrics.completed_points),
      
      // Scope at this point
      total_scope_points: burndown.burndown.total_points
    };
    
    burndown.burndown.actual_burndown.push(dataPoint);
    
    // Update velocity metrics
    this.updateVelocityMetrics(burndown, dataPoint);
    
    // Update completion prediction
    this.updateCompletionPrediction(burndown, dataPoint);
    
    // Update metadata
    burndown.meta.updated_at = new Date().toISOString();
    
    // Save updated burndown
    this.saveBurndown(burndown);
    
    // Check for alerts
    this.checkBurndownAlerts(burndown, dataPoint);
    
    console.log(`📈 Updated burndown: ${metrics.completed_points}/${burndown.burndown.total_points} points complete`);
    
    return {
      current_progress: dataPoint,
      velocity_metrics: burndown.burndown.velocity_metrics,
      completion_prediction: burndown.burndown.completion_prediction,
      alerts: this.generateAlerts(burndown, dataPoint)
    };
  }
  
  /**
   * Calculate current metrics from stories
   */
  calculateCurrentMetrics(stories) {
    const metrics = {
      total_points: 0,
      remaining_points: 0,
      completed_points: 0,
      total_hours: 0,
      remaining_hours: 0,
      completed_hours: 0,
      stories_completed: 0,
      stories_in_progress: 0,
      stories_blocked: 0
    };
    
    for (const storyData of stories) {
      const story = storyData.story;
      const points = typeof story.story_points === 'object' 
        ? story.story_points.total 
        : story.story_points;
      
      metrics.total_points += points;
      
      switch (story.status) {
        case 'completed':
          metrics.completed_points += points;
          metrics.stories_completed++;
          if (story.timing.actual_hours) {
            metrics.completed_hours += story.timing.actual_hours;
          }
          break;
          
        case 'in_progress':
          metrics.remaining_points += points;
          metrics.stories_in_progress++;
          // Estimate remaining based on progress
          const remainingHours = story.timing.estimated_hours - (story.timing.actual_hours || 0);
          metrics.remaining_hours += Math.max(0, remainingHours);
          break;
          
        case 'blocked':
          metrics.remaining_points += points;
          metrics.stories_blocked++;
          metrics.remaining_hours += story.timing.estimated_hours;
          break;
          
        default: // not_started
          metrics.remaining_points += points;
          metrics.remaining_hours += story.timing.estimated_hours;
      }
      
      metrics.total_hours += story.timing.estimated_hours;
    }
    
    return metrics;
  }
  
  /**
   * Calculate current velocity
   */
  calculateVelocity(burndown, elapsedHours, completedPoints) {
    if (elapsedHours === 0) return 0;
    
    // Points per hour
    return completedPoints / elapsedHours;
  }
  
  /**
   * Update velocity metrics
   */
  updateVelocityMetrics(burndown, dataPoint) {
    const totalDuration = burndown.burndown.duration_hours;
    const remainingHours = totalDuration - dataPoint.elapsed_hours;
    
    // Current velocity (points per hour)
    burndown.burndown.velocity_metrics.current_velocity = dataPoint.velocity;
    
    // Required velocity to complete on time
    if (remainingHours > 0) {
      burndown.burndown.velocity_metrics.required_velocity = 
        dataPoint.remaining_points / remainingHours;
    } else {
      burndown.burndown.velocity_metrics.required_velocity = 0;
    }
    
    // Projected velocity (weighted average of recent data points)
    const recentPoints = burndown.burndown.actual_burndown.slice(-5);
    if (recentPoints.length >= 2) {
      const recentVelocities = [];
      
      for (let i = 1; i < recentPoints.length; i++) {
        const timeDiff = recentPoints[i].elapsed_hours - recentPoints[i-1].elapsed_hours;
        const pointsDiff = recentPoints[i].completed_points - recentPoints[i-1].completed_points;
        
        if (timeDiff > 0) {
          recentVelocities.push(pointsDiff / timeDiff);
        }
      }
      
      if (recentVelocities.length > 0) {
        burndown.burndown.velocity_metrics.projected_velocity = 
          recentVelocities.reduce((sum, v) => sum + v, 0) / recentVelocities.length;
      }
    } else {
      burndown.burndown.velocity_metrics.projected_velocity = dataPoint.velocity;
    }
  }
  
  /**
   * Update completion prediction
   */
  updateCompletionPrediction(burndown, dataPoint) {
    const projectedVelocity = burndown.burndown.velocity_metrics.projected_velocity;
    const remainingPoints = dataPoint.remaining_points;
    
    if (projectedVelocity > 0) {
      const hoursToComplete = remainingPoints / projectedVelocity;
      const projectedCompletionTime = new Date(
        new Date(dataPoint.timestamp).getTime() + hoursToComplete * 60 * 60 * 1000
      );
      
      const sprintEndTime = new Date(burndown.burndown.end_date);
      
      burndown.burndown.completion_prediction.projected_completion = 
        projectedCompletionTime.toISOString();
      
      // Check if on track
      burndown.burndown.completion_prediction.on_track = 
        projectedCompletionTime <= sprintEndTime;
      
      // Calculate confidence based on velocity consistency
      const velocityVariance = this.calculateVelocityVariance(burndown);
      
      if (velocityVariance < 0.2) {
        burndown.burndown.completion_prediction.confidence = 'high';
      } else if (velocityVariance < 0.4) {
        burndown.burndown.completion_prediction.confidence = 'medium';
      } else {
        burndown.burndown.completion_prediction.confidence = 'low';
      }
    } else {
      // No velocity - can't predict
      burndown.burndown.completion_prediction.on_track = false;
      burndown.burndown.completion_prediction.confidence = 'none';
    }
  }
  
  /**
   * Calculate velocity variance
   */
  calculateVelocityVariance(burndown) {
    const dataPoints = burndown.burndown.actual_burndown;
    if (dataPoints.length < 3) return 0;
    
    const velocities = dataPoints.slice(1).map(p => p.velocity).filter(v => v > 0);
    
    if (velocities.length < 2) return 0;
    
    const mean = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }
  
  /**
   * Add scope change
   */
  addScopeChange(sprintId, scopeChange) {
    const burndownId = `burndown_${sprintId}`;
    const burndown = this.activeBurndowns[burndownId];
    
    if (!burndown) {
      console.error(`Burndown for sprint ${sprintId} not found`);
      return null;
    }
    
    const change = {
      timestamp: new Date().toISOString(),
      type: scopeChange.type, // 'added' or 'removed'
      points: scopeChange.points,
      story_ids: scopeChange.story_ids || [],
      reason: scopeChange.reason,
      impact: scopeChange.type === 'added' 
        ? `Increased scope by ${scopeChange.points} points`
        : `Reduced scope by ${scopeChange.points} points`
    };
    
    burndown.burndown.scope_changes.push(change);
    
    // Update total points
    if (scopeChange.type === 'added') {
      burndown.burndown.total_points += scopeChange.points;
    } else {
      burndown.burndown.total_points -= scopeChange.points;
    }
    
    // Recalculate ideal burndown
    burndown.burndown.ideal_burndown = this.calculateIdealBurndown({
      total_points: burndown.burndown.total_points,
      duration_hours: burndown.burndown.duration_hours
    });
    
    // Save updated burndown
    this.saveBurndown(burndown);
    
    console.log(`📊 Scope change recorded: ${change.impact}`);
    
    return burndown;
  }
  
  /**
   * Check for burndown alerts
   */
  checkBurndownAlerts(burndown, dataPoint) {
    const alerts = this.generateAlerts(burndown, dataPoint);
    
    // Log critical alerts
    for (const alert of alerts) {
      if (alert.severity === 'critical') {
        console.log(`🚨 CRITICAL: ${alert.message}`);
      } else if (alert.severity === 'warning') {
        console.log(`⚠️ WARNING: ${alert.message}`);
      }
    }
  }
  
  /**
   * Generate alerts based on burndown status
   */
  generateAlerts(burndown, dataPoint) {
    const alerts = [];
    const totalDuration = burndown.burndown.duration_hours;
    const percentComplete = (dataPoint.elapsed_hours / totalDuration) * 100;
    const percentPointsComplete = (dataPoint.completed_points / burndown.burndown.total_points) * 100;
    
    // Check if behind schedule
    if (percentComplete > 50 && percentPointsComplete < 40) {
      alerts.push({
        type: 'behind_schedule',
        severity: 'warning',
        message: `Only ${percentPointsComplete.toFixed(1)}% complete at ${percentComplete.toFixed(1)}% time elapsed`,
        recommendation: 'Consider reducing scope or increasing velocity'
      });
    }
    
    // Check if significantly behind
    if (percentComplete > 75 && percentPointsComplete < 50) {
      alerts.push({
        type: 'at_risk',
        severity: 'critical',
        message: 'Sprint at risk of not completing on time',
        recommendation: 'Immediate action needed: reduce scope or extend sprint'
      });
    }
    
    // Check velocity
    const requiredVelocity = burndown.burndown.velocity_metrics.required_velocity;
    const currentVelocity = burndown.burndown.velocity_metrics.current_velocity;
    
    if (requiredVelocity > currentVelocity * 1.5) {
      alerts.push({
        type: 'velocity_gap',
        severity: 'warning',
        message: `Current velocity (${currentVelocity.toFixed(2)}) is below required (${requiredVelocity.toFixed(2)})`,
        recommendation: 'Address blockers or reduce remaining scope'
      });
    }
    
    // Check blocked stories
    if (dataPoint.stories_blocked > 0) {
      alerts.push({
        type: 'blocked_stories',
        severity: 'warning',
        message: `${dataPoint.stories_blocked} stories are blocked`,
        recommendation: 'Prioritize unblocking to maintain velocity'
      });
    }
    
    // Check scope volatility
    if (burndown.burndown.scope_changes.length > 2) {
      alerts.push({
        type: 'scope_volatility',
        severity: 'info',
        message: 'Multiple scope changes detected',
        recommendation: 'Consider sprint planning improvements'
      });
    }
    
    return alerts;
  }
  
  /**
   * Get burndown chart data
   */
  getBurndownData(sprintId) {
    const burndownId = `burndown_${sprintId}`;
    const burndown = this.activeBurndowns[burndownId];
    
    if (!burndown) {
      // Try to load from file
      const filePath = path.join(this.burndownPath, `${burndownId}.json`);
      
      if (fs.existsSync(filePath)) {
        const loaded = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.activeBurndowns[burndownId] = loaded;
        return loaded;
      }
      
      return null;
    }
    
    return burndown;
  }
  
  /**
   * Get chart-ready data
   */
  getChartData(sprintId) {
    const burndown = this.getBurndownData(sprintId);
    
    if (!burndown) return null;
    
    return {
      sprint_id: sprintId,
      
      // Ideal line
      ideal: burndown.burndown.ideal_burndown.map(point => ({
        x: point.elapsed_hours,
        y: point.remaining_points
      })),
      
      // Actual line
      actual: burndown.burndown.actual_burndown.map(point => ({
        x: point.elapsed_hours,
        y: point.remaining_points
      })),
      
      // Scope changes
      scope_changes: burndown.burndown.scope_changes.map(change => ({
        x: new Date(change.timestamp).getTime(),
        type: change.type,
        points: change.points,
        reason: change.reason
      })),
      
      // Current status
      status: {
        on_track: burndown.burndown.completion_prediction.on_track,
        completion_percentage: burndown.burndown.actual_burndown.length > 0
          ? ((burndown.burndown.actual_burndown[burndown.burndown.actual_burndown.length - 1].completed_points / 
              burndown.burndown.total_points) * 100).toFixed(1)
          : 0,
        velocity: burndown.burndown.velocity_metrics.current_velocity.toFixed(2),
        projected_completion: burndown.burndown.completion_prediction.projected_completion
      }
    };
  }
  
  /**
   * Save burndown to file
   */
  saveBurndown(burndown) {
    const burndownId = `burndown_${burndown.burndown.sprint_id}`;
    const filePath = path.join(this.burndownPath, `${burndownId}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(burndown, null, 2));
  }
}

// Export the class and create instance
const burndownGenerator = new BurndownGenerator();

module.exports = {
  BurndownGenerator,
  burndownGenerator,
  
  // Convenience exports
  initializeBurndown: (sprintData) => burndownGenerator.initializeBurndown(sprintData),
  updateBurndown: (sprintId, progressData) => burndownGenerator.updateBurndown(sprintId, progressData),
  addScopeChange: (sprintId, scopeChange) => burndownGenerator.addScopeChange(sprintId, scopeChange),
  getBurndownData: (sprintId) => burndownGenerator.getBurndownData(sprintId),
  getChartData: (sprintId) => burndownGenerator.getChartData(sprintId)
};

// If run directly, simulate burndown
if (require.main === module) {
  console.log('📊 Simulating Sprint Burndown');
  
  // Initialize burndown
  const sprint = {
    sprint_id: 'sprint_1',
    sprint_goal: 'Complete authentication features',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    duration_hours: 2,
    total_points: 25,
    total_hours: 10
  };
  
  const burndown = burndownGenerator.initializeBurndown(sprint);
  
  // Simulate progress updates
  setTimeout(() => {
    console.log('\n--- 30 minutes elapsed ---');
    const update1 = burndownGenerator.updateBurndown('sprint_1', {});
    console.log('Velocity:', update1.velocity_metrics);
  }, 100);
  
  setTimeout(() => {
    // Mark some stories complete
    console.log('\n--- 1 hour elapsed, completing stories ---');
    // In real usage, stories would be updated via storyTracker
    const update2 = burndownGenerator.updateBurndown('sprint_1', {});
    console.log('Prediction:', update2.completion_prediction);
    console.log('Alerts:', update2.alerts);
  }, 200);
  
  // Add scope change
  setTimeout(() => {
    console.log('\n--- Adding scope change ---');
    burndownGenerator.addScopeChange('sprint_1', {
      type: 'added',
      points: 5,
      reason: 'Critical bug fix added to sprint',
      story_ids: ['BUG-001']
    });
  }, 300);
  
  // Get chart data
  setTimeout(() => {
    console.log('\n--- Chart Data ---');
    const chartData = burndownGenerator.getChartData('sprint_1');
    console.log('Chart ready:', chartData.status);
  }, 400);
}