/**
 * Story Tracking System
 * Manages story creation, tracking, and lifecycle management
 */

const fs = require('fs');
const path = require('path');
const { calibration } = require('./story-point-calibration');

class StoryTracker {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.storiesPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'sprint-tracking',
      'stories'
    );
    
    // Story status lifecycle
    this.statusLifecycle = [
      'not_started',
      'in_progress',
      'testing',
      'review',
      'completed',
      'blocked'
    ];
    
    // Ensure stories directory exists
    this.ensureStoriesDirectory();
  }
  
  ensureStoriesDirectory() {
    if (!fs.existsSync(this.storiesPath)) {
      fs.mkdirSync(this.storiesPath, { recursive: true });
      console.log(`📁 Created stories directory: ${this.storiesPath}`);
    }
  }
  
  /**
   * Create a new story
   */
  createStory(storyData) {
    const storyId = this.generateStoryId(storyData.title);
    
    const story = {
      meta: {
        document_type: "user_story",
        version: "1.0.0",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      story: {
        id: storyId,
        title: storyData.title,
        description: storyData.description || "",
        user_story_format: storyData.user_story_format || "",
        acceptance_criteria: storyData.acceptance_criteria || [],
        story_points: this.calculateStoryPoints(storyData),
        timing: {
          estimated_hours: this.estimateHours(storyData.story_points),
          actual_hours: 0,
          blocked_hours: 0,
          start_time: null,
          end_time: null
        },
        status: "not_started",
        sprint_id: storyData.sprint_id || null,
        dependencies: storyData.dependencies || [],
        assigned_agents: storyData.assigned_agents || [],
        labels: storyData.labels || [],
        priority: storyData.priority || "medium",
        coverage_requirements: this.determineCoverageRequirements(storyData),
        history: [{
          timestamp: new Date().toISOString(),
          action: "created",
          details: "Story created"
        }]
      }
    };
    
    // Save story to file
    const storyPath = path.join(this.storiesPath, `${storyId}.json`);
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
    
    console.log(`✅ Created story: ${storyId}`);
    return story;
  }
  
  /**
   * Generate unique story ID
   */
  generateStoryId(title) {
    const prefix = title
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
    
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${timestamp}`;
  }
  
  /**
   * Calculate story points for multi-agent story
   */
  calculateStoryPoints(storyData) {
    if (storyData.story_points) {
      // If points already provided, normalize them
      if (typeof storyData.story_points === 'object' && storyData.story_points.by_agent) {
        return calibration.normalizeMultiAgentPoints(storyData.story_points.by_agent);
      }
      return storyData.story_points;
    }
    
    // Calculate based on complexity and agents
    const agentPoints = {};
    let totalComplexity = 0;
    
    if (storyData.agent_complexities) {
      for (const [agent, complexity] of Object.entries(storyData.agent_complexities)) {
        const basePoints = this.complexityToPoints(complexity.overall || 'medium');
        agentPoints[agent] = calibration.calibrateForAgent(basePoints, agent, complexity.factors || {});
        totalComplexity += agentPoints[agent];
      }
    } else {
      // Default estimation
      const defaultPoints = 3;
      for (const agent of (storyData.assigned_agents || ['coder_agent'])) {
        agentPoints[agent] = defaultPoints;
      }
    }
    
    return calibration.normalizeMultiAgentPoints(agentPoints);
  }
  
  /**
   * Convert complexity rating to base points
   */
  complexityToPoints(complexity) {
    const complexityMap = {
      'trivial': 1,
      'low': 2,
      'medium': 3,
      'high': 5,
      'very_high': 8,
      'epic': 13
    };
    return complexityMap[complexity] || 3;
  }
  
  /**
   * Estimate hours based on story points
   */
  estimateHours(storyPoints) {
    // ~30 minutes per story point for AI agents
    const hoursPerPoint = 0.5;
    const totalPoints = typeof storyPoints === 'object' ? storyPoints.total : storyPoints;
    return totalPoints * hoursPerPoint;
  }
  
  /**
   * Determine coverage requirements based on story characteristics
   */
  determineCoverageRequirements(storyData) {
    const riskIndicators = {
      high: [
        'authentication', 'payment', 'security', 'user_data',
        'financial', 'compliance', 'api_integration'
      ],
      medium: [
        'business_logic', 'data_processing', 'workflow',
        'reporting', 'analytics'
      ],
      low: [
        'ui_component', 'styling', 'documentation',
        'configuration', 'logging'
      ]
    };
    
    // Check story title and description for risk indicators
    const storyText = `${storyData.title} ${storyData.description}`.toLowerCase();
    
    for (const [risk, indicators] of Object.entries(riskIndicators)) {
      for (const indicator of indicators) {
        if (storyText.includes(indicator)) {
          return {
            risk_level: risk,
            target: risk === 'high' ? 95 : risk === 'medium' ? 80 : 60,
            actual: 0
          };
        }
      }
    }
    
    // Default to medium risk
    return {
      risk_level: 'medium',
      target: 80,
      actual: 0
    };
  }
  
  /**
   * Update story status
   */
  updateStoryStatus(storyId, newStatus, details = {}) {
    const storyPath = path.join(this.storiesPath, `${storyId}.json`);
    
    if (!fs.existsSync(storyPath)) {
      throw new Error(`Story ${storyId} not found`);
    }
    
    const story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
    
    // Update status
    const oldStatus = story.story.status;
    story.story.status = newStatus;
    story.meta.updated_at = new Date().toISOString();
    
    // Update timing
    if (newStatus === 'in_progress' && !story.story.timing.start_time) {
      story.story.timing.start_time = new Date().toISOString();
    } else if (newStatus === 'completed' && !story.story.timing.end_time) {
      story.story.timing.end_time = new Date().toISOString();
      story.story.timing.actual_hours = this.calculateActualHours(story.story.timing);
    }
    
    // Add history entry
    story.story.history.push({
      timestamp: new Date().toISOString(),
      action: 'status_changed',
      from: oldStatus,
      to: newStatus,
      details: details.reason || `Status changed from ${oldStatus} to ${newStatus}`
    });
    
    // Save updated story
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
    
    console.log(`✅ Updated story ${storyId}: ${oldStatus} → ${newStatus}`);
    return story;
  }
  
  /**
   * Calculate actual hours worked
   */
  calculateActualHours(timing) {
    if (!timing.start_time || !timing.end_time) {
      return 0;
    }
    
    const start = new Date(timing.start_time);
    const end = new Date(timing.end_time);
    const hours = (end - start) / (1000 * 60 * 60);
    
    return Math.round(hours * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Add time to blocked hours
   */
  addBlockedTime(storyId, hours, reason) {
    const storyPath = path.join(this.storiesPath, `${storyId}.json`);
    
    if (!fs.existsSync(storyPath)) {
      throw new Error(`Story ${storyId} not found`);
    }
    
    const story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
    
    story.story.timing.blocked_hours += hours;
    story.meta.updated_at = new Date().toISOString();
    
    story.story.history.push({
      timestamp: new Date().toISOString(),
      action: 'blocked_time_added',
      hours: hours,
      details: reason
    });
    
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
    
    console.log(`⏱️ Added ${hours} blocked hours to story ${storyId}`);
    return story;
  }
  
  /**
   * Update story points
   */
  updateStoryPoints(storyId, newPoints) {
    const storyPath = path.join(this.storiesPath, `${storyId}.json`);
    
    if (!fs.existsSync(storyPath)) {
      throw new Error(`Story ${storyId} not found`);
    }
    
    const story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
    
    const oldPoints = story.story.story_points;
    story.story.story_points = newPoints;
    story.meta.updated_at = new Date().toISOString();
    
    // Recalculate estimated hours
    story.story.timing.estimated_hours = this.estimateHours(newPoints);
    
    story.story.history.push({
      timestamp: new Date().toISOString(),
      action: 'points_updated',
      from: oldPoints,
      to: newPoints,
      details: 'Story points re-estimated'
    });
    
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
    
    console.log(`📊 Updated story points for ${storyId}`);
    return story;
  }
  
  /**
   * Get story by ID
   */
  getStory(storyId) {
    const storyPath = path.join(this.storiesPath, `${storyId}.json`);
    
    if (!fs.existsSync(storyPath)) {
      return null;
    }
    
    return JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
  }
  
  /**
   * Get all stories for a sprint
   */
  getSprintStories(sprintId) {
    const stories = [];
    
    if (!fs.existsSync(this.storiesPath)) {
      return stories;
    }
    
    const files = fs.readdirSync(this.storiesPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const story = JSON.parse(
          fs.readFileSync(path.join(this.storiesPath, file), 'utf-8')
        );
        
        if (story.story.sprint_id === sprintId) {
          stories.push(story);
        }
      }
    }
    
    return stories;
  }
  
  /**
   * Get stories by status
   */
  getStoriesByStatus(status) {
    const stories = [];
    
    if (!fs.existsSync(this.storiesPath)) {
      return stories;
    }
    
    const files = fs.readdirSync(this.storiesPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const story = JSON.parse(
          fs.readFileSync(path.join(this.storiesPath, file), 'utf-8')
        );
        
        if (story.story.status === status) {
          stories.push(story);
        }
      }
    }
    
    return stories;
  }
  
  /**
   * Update coverage results
   */
  updateCoverageResults(storyId, coveragePercent) {
    const storyPath = path.join(this.storiesPath, `${storyId}.json`);
    
    if (!fs.existsSync(storyPath)) {
      throw new Error(`Story ${storyId} not found`);
    }
    
    const story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
    
    story.story.coverage_requirements.actual = coveragePercent;
    story.meta.updated_at = new Date().toISOString();
    
    story.story.history.push({
      timestamp: new Date().toISOString(),
      action: 'coverage_updated',
      coverage: coveragePercent,
      target: story.story.coverage_requirements.target,
      meets_target: coveragePercent >= story.story.coverage_requirements.target
    });
    
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
    
    const meetsTarget = coveragePercent >= story.story.coverage_requirements.target;
    console.log(`📊 Updated coverage for ${storyId}: ${coveragePercent}% ${meetsTarget ? '✅' : '❌'}`);
    
    return story;
  }
  
  /**
   * Add dependency to story
   */
  addDependency(storyId, dependsOnStoryId) {
    const storyPath = path.join(this.storiesPath, `${storyId}.json`);
    
    if (!fs.existsSync(storyPath)) {
      throw new Error(`Story ${storyId} not found`);
    }
    
    const story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
    
    if (!story.story.dependencies.includes(dependsOnStoryId)) {
      story.story.dependencies.push(dependsOnStoryId);
      story.meta.updated_at = new Date().toISOString();
      
      story.story.history.push({
        timestamp: new Date().toISOString(),
        action: 'dependency_added',
        dependency: dependsOnStoryId
      });
      
      fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
      
      console.log(`🔗 Added dependency: ${storyId} depends on ${dependsOnStoryId}`);
    }
    
    return story;
  }
}

// Export the class and create instance
const storyTracker = new StoryTracker();

module.exports = {
  StoryTracker,
  storyTracker,
  
  // Convenience exports
  createStory: (data) => storyTracker.createStory(data),
  updateStoryStatus: (id, status, details) => storyTracker.updateStoryStatus(id, status, details),
  getStory: (id) => storyTracker.getStory(id),
  getSprintStories: (sprintId) => storyTracker.getSprintStories(sprintId),
  getStoriesByStatus: (status) => storyTracker.getStoriesByStatus(status)
};

// If run directly, create example story
if (require.main === module) {
  const exampleStory = storyTracker.createStory({
    title: "User Authentication Implementation",
    description: "Implement secure user login with JWT tokens",
    user_story_format: "As a user, I want to log in securely so I can access my account",
    acceptance_criteria: [
      "User can log in with email and password",
      "JWT token is generated on successful login",
      "Invalid credentials show error message",
      "Token expires after 24 hours"
    ],
    agent_complexities: {
      coder_agent: {
        overall: 'high',
        factors: {
          algorithm_complexity: 0.8,
          security_requirements: 0.9
        }
      },
      testing_agent: {
        overall: 'medium',
        factors: {
          test_coverage: 0.9,
          edge_cases: 0.7
        }
      }
    },
    assigned_agents: ['coder_agent', 'testing_agent'],
    sprint_id: 'sprint_1',
    priority: 'high'
  });
  
  console.log('📝 Example story created:', exampleStory.story.id);
  console.log('📊 Story points:', exampleStory.story.story_points);
}