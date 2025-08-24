/**
 * Story Breakdown Intelligence
 * Automatically suggests story splits for large stories
 */

const fs = require('fs');
const path = require('path');
const { calibration } = require('./story-point-calibration');

class StorySplitter {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    
    // Large story threshold
    this.largeStoryThreshold = 8;
    
    // Common patterns for story breakdown
    this.breakdownPatterns = {
      crud: {
        pattern: 'CRUD operations',
        subtasks: [
          { name: 'Create {entity} endpoint', points: 2 },
          { name: 'Read {entity} endpoint', points: 1 },
          { name: 'Update {entity} endpoint', points: 2 },
          { name: 'Delete {entity} endpoint', points: 1 },
          { name: '{entity} validation', points: 1 },
          { name: '{entity} tests', points: 1 }
        ]
      },
      authentication: {
        pattern: 'User authentication',
        subtasks: [
          { name: 'Login endpoint', points: 3 },
          { name: 'Logout endpoint', points: 1 },
          { name: 'Password reset flow', points: 3 },
          { name: 'Token management', points: 2 },
          { name: 'Session handling', points: 2 },
          { name: 'Authentication tests', points: 2 }
        ]
      },
      dashboard: {
        pattern: 'Dashboard implementation',
        subtasks: [
          { name: 'Dashboard layout', points: 2 },
          { name: 'Data aggregation API', points: 3 },
          { name: 'Chart components', points: 3 },
          { name: 'Real-time updates', points: 3 },
          { name: 'Export functionality', points: 2 },
          { name: 'Dashboard tests', points: 2 }
        ]
      },
      payment: {
        pattern: 'Payment processing',
        subtasks: [
          { name: 'Payment gateway integration', points: 5 },
          { name: 'Checkout flow UI', points: 3 },
          { name: 'Payment validation', points: 2 },
          { name: 'Receipt generation', points: 2 },
          { name: 'Refund handling', points: 3 },
          { name: 'Payment security', points: 3 },
          { name: 'Payment tests', points: 3 }
        ]
      },
      reporting: {
        pattern: 'Reporting feature',
        subtasks: [
          { name: 'Report data collection', points: 3 },
          { name: 'Report generation engine', points: 3 },
          { name: 'Report templates', points: 2 },
          { name: 'Report scheduling', points: 2 },
          { name: 'Report distribution', points: 2 },
          { name: 'Report UI', points: 3 }
        ]
      },
      search: {
        pattern: 'Search functionality',
        subtasks: [
          { name: 'Search index setup', points: 3 },
          { name: 'Search API endpoint', points: 2 },
          { name: 'Search UI component', points: 2 },
          { name: 'Advanced filters', points: 3 },
          { name: 'Search results ranking', points: 2 },
          { name: 'Search performance optimization', points: 3 }
        ]
      },
      notification: {
        pattern: 'Notification system',
        subtasks: [
          { name: 'Notification service', points: 3 },
          { name: 'Email notifications', points: 2 },
          { name: 'Push notifications', points: 3 },
          { name: 'In-app notifications', points: 2 },
          { name: 'Notification preferences', points: 2 },
          { name: 'Notification tests', points: 2 }
        ]
      }
    };
    
    // Template library
    this.templates = this.loadTemplates();
  }
  
  /**
   * Analyze story and suggest breakdown
   */
  analyzeStory(story) {
    const analysis = {
      story_id: story.id,
      story_title: story.title,
      original_points: story.story_points,
      is_large: this.isLargeStory(story),
      
      // Breakdown suggestions
      suggestions: [],
      
      // Recommended approach
      recommendation: null
    };
    
    if (!analysis.is_large) {
      analysis.recommendation = {
        action: 'keep_as_is',
        reason: 'Story size is appropriate for single sprint'
      };
      return analysis;
    }
    
    // Analyze story for patterns
    const patterns = this.detectPatterns(story);
    
    // Generate suggestions based on patterns
    for (const pattern of patterns) {
      const suggestion = this.generateSuggestion(story, pattern);
      if (suggestion) {
        analysis.suggestions.push(suggestion);
      }
    }
    
    // If no pattern matches, suggest generic breakdown
    if (analysis.suggestions.length === 0) {
      analysis.suggestions.push(this.generateGenericSuggestion(story));
    }
    
    // Select best recommendation
    analysis.recommendation = this.selectBestRecommendation(analysis.suggestions);
    
    return analysis;
  }
  
  /**
   * Check if story is large
   */
  isLargeStory(story) {
    const points = typeof story.story_points === 'object' 
      ? story.story_points.total 
      : story.story_points;
    
    return points > this.largeStoryThreshold;
  }
  
  /**
   * Detect patterns in story
   */
  detectPatterns(story) {
    const patterns = [];
    const storyText = `${story.title} ${story.description || ''}`.toLowerCase();
    
    // Check each pattern
    for (const [key, pattern] of Object.entries(this.breakdownPatterns)) {
      const keywords = this.getPatternKeywords(key);
      
      if (keywords.some(keyword => storyText.includes(keyword))) {
        patterns.push({
          type: key,
          pattern: pattern,
          confidence: this.calculatePatternConfidence(storyText, keywords)
        });
      }
    }
    
    // Sort by confidence
    patterns.sort((a, b) => b.confidence - a.confidence);
    
    return patterns;
  }
  
  /**
   * Get pattern keywords
   */
  getPatternKeywords(patternType) {
    const keywords = {
      crud: ['crud', 'create', 'read', 'update', 'delete', 'manage', 'api'],
      authentication: ['auth', 'login', 'logout', 'password', 'session', 'token'],
      dashboard: ['dashboard', 'overview', 'analytics', 'charts', 'metrics'],
      payment: ['payment', 'checkout', 'billing', 'subscription', 'stripe'],
      reporting: ['report', 'export', 'pdf', 'excel', 'generate'],
      search: ['search', 'find', 'filter', 'query', 'lookup'],
      notification: ['notification', 'alert', 'email', 'push', 'notify']
    };
    
    return keywords[patternType] || [];
  }
  
  /**
   * Calculate pattern confidence
   */
  calculatePatternConfidence(text, keywords) {
    let matches = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }
    
    return matches / keywords.length;
  }
  
  /**
   * Generate suggestion based on pattern
   */
  generateSuggestion(story, patternMatch) {
    const pattern = patternMatch.pattern;
    const entity = this.extractEntity(story.title);
    
    const suggestion = {
      pattern_type: patternMatch.type,
      confidence: patternMatch.confidence,
      
      breakdown: pattern.subtasks.map(task => ({
        title: task.name.replace('{entity}', entity),
        points: task.points,
        description: `Part of ${story.title}`,
        dependencies: [],
        assigned_agents: this.suggestAgents(task.name)
      })),
      
      total_points: pattern.subtasks.reduce((sum, task) => sum + task.points, 0),
      
      benefits: [
        'Clear separation of concerns',
        'Easier to test individual components',
        'Can be developed in parallel',
        'Better progress tracking'
      ]
    };
    
    // Add dependencies
    this.addDependencies(suggestion.breakdown);
    
    return suggestion;
  }
  
  /**
   * Generate generic suggestion
   */
  generateGenericSuggestion(story) {
    const totalPoints = typeof story.story_points === 'object' 
      ? story.story_points.total 
      : story.story_points;
    
    // Suggest breaking into 3-5 smaller stories
    const numParts = Math.min(5, Math.max(3, Math.ceil(totalPoints / 5)));
    const pointsPerPart = Math.ceil(totalPoints / numParts);
    
    const breakdown = [];
    const components = this.identifyComponents(story);
    
    for (let i = 0; i < numParts; i++) {
      const component = components[i] || `Part ${i + 1}`;
      
      breakdown.push({
        title: `${story.title} - ${component}`,
        points: calibration.roundToFibonacci(pointsPerPart),
        description: `Component ${i + 1} of ${story.title}`,
        dependencies: i > 0 ? [`${story.title} - ${components[i - 1] || `Part ${i}`}`] : [],
        assigned_agents: this.suggestAgentsForComponent(component)
      });
    }
    
    return {
      pattern_type: 'generic',
      confidence: 0.5,
      breakdown: breakdown,
      total_points: breakdown.reduce((sum, task) => sum + task.points, 0),
      benefits: [
        'Reduces complexity',
        'Enables incremental delivery',
        'Easier estimation',
        'Flexible prioritization'
      ]
    };
  }
  
  /**
   * Extract entity from story title
   */
  extractEntity(title) {
    // Simple entity extraction
    const words = title.split(' ');
    
    // Look for nouns (simplified)
    const nouns = words.filter(word => 
      word.length > 3 && 
      !['create', 'update', 'delete', 'manage', 'implement'].includes(word.toLowerCase())
    );
    
    return nouns[0] || 'item';
  }
  
  /**
   * Identify components in story
   */
  identifyComponents(story) {
    const components = [];
    const description = (story.description || '').toLowerCase();
    
    // Common component patterns
    if (description.includes('frontend') || description.includes('ui')) {
      components.push('Frontend');
    }
    if (description.includes('backend') || description.includes('api')) {
      components.push('Backend');
    }
    if (description.includes('database') || description.includes('data')) {
      components.push('Data Layer');
    }
    if (description.includes('test')) {
      components.push('Testing');
    }
    if (description.includes('document')) {
      components.push('Documentation');
    }
    
    // If no components found, use generic ones
    if (components.length === 0) {
      components.push('Core Implementation', 'Integration', 'Testing & Polish');
    }
    
    return components;
  }
  
  /**
   * Suggest agents for task
   */
  suggestAgents(taskName) {
    const agents = [];
    const task = taskName.toLowerCase();
    
    if (task.includes('ui') || task.includes('layout') || task.includes('component')) {
      agents.push('ui_ux_agent');
    }
    
    if (task.includes('endpoint') || task.includes('api') || task.includes('backend')) {
      agents.push('coder_agent');
    }
    
    if (task.includes('test')) {
      agents.push('testing_agent');
    }
    
    if (task.includes('database') || task.includes('data')) {
      agents.push('dba_agent');
    }
    
    if (task.includes('security') || task.includes('auth')) {
      agents.push('security_agent');
    }
    
    // Default to coder if no specific match
    if (agents.length === 0) {
      agents.push('coder_agent');
    }
    
    return agents;
  }
  
  /**
   * Suggest agents for component
   */
  suggestAgentsForComponent(component) {
    const comp = component.toLowerCase();
    
    if (comp.includes('frontend')) return ['ui_ux_agent', 'coder_agent'];
    if (comp.includes('backend')) return ['coder_agent', 'api_agent'];
    if (comp.includes('data')) return ['dba_agent', 'data_engineer_agent'];
    if (comp.includes('test')) return ['testing_agent'];
    if (comp.includes('doc')) return ['documentation_agent'];
    
    return ['coder_agent'];
  }
  
  /**
   * Add dependencies between tasks
   */
  addDependencies(breakdown) {
    // Add sequential dependencies for certain patterns
    for (let i = 0; i < breakdown.length; i++) {
      const task = breakdown[i];
      
      // Tests depend on implementation
      if (task.title.includes('test') && i > 0) {
        task.dependencies = breakdown.slice(0, i)
          .filter(t => !t.title.includes('test'))
          .map(t => t.title);
      }
      
      // UI depends on API
      if (task.title.includes('UI') || task.title.includes('component')) {
        const apiTasks = breakdown
          .filter(t => t.title.includes('endpoint') || t.title.includes('API'))
          .map(t => t.title);
        
        task.dependencies.push(...apiTasks);
      }
    }
  }
  
  /**
   * Select best recommendation
   */
  selectBestRecommendation(suggestions) {
    if (suggestions.length === 0) {
      return null;
    }
    
    // Select highest confidence suggestion
    const best = suggestions[0];
    
    return {
      action: 'break_down',
      pattern: best.pattern_type,
      confidence: best.confidence,
      num_stories: best.breakdown.length,
      total_points: best.total_points,
      reason: best.confidence > 0.7 
        ? `High confidence match with ${best.pattern_type} pattern`
        : 'Story is too large for single sprint'
    };
  }
  
  /**
   * Apply breakdown to story
   */
  applyBreakdown(story, suggestion) {
    const newStories = [];
    
    for (const task of suggestion.breakdown) {
      const newStory = {
        title: task.title,
        description: task.description,
        story_points: task.points,
        assigned_agents: task.assigned_agents,
        dependencies: task.dependencies,
        parent_story: story.id,
        sprint_id: story.sprint_id,
        priority: story.priority,
        labels: [...(story.labels || []), 'split_story']
      };
      
      newStories.push(newStory);
    }
    
    return newStories;
  }
  
  /**
   * Load template library
   */
  loadTemplates() {
    const templatesPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'story-templates.json'
    );
    
    try {
      if (fs.existsSync(templatesPath)) {
        return JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading templates:', error.message);
    }
    
    // Return default templates
    return {
      templates: [
        {
          name: 'Basic CRUD',
          category: 'api',
          total_points: 8,
          stories: [
            { title: 'Create API endpoint', points: 2 },
            { title: 'Read API endpoints', points: 2 },
            { title: 'Update API endpoint', points: 2 },
            { title: 'Delete API endpoint', points: 1 },
            { title: 'API tests', points: 1 }
          ]
        },
        {
          name: 'User Feature',
          category: 'fullstack',
          total_points: 13,
          stories: [
            { title: 'Database schema', points: 2 },
            { title: 'Backend API', points: 3 },
            { title: 'Frontend UI', points: 3 },
            { title: 'Integration', points: 2 },
            { title: 'Testing', points: 2 },
            { title: 'Documentation', points: 1 }
          ]
        }
      ]
    };
  }
  
  /**
   * Save custom template
   */
  saveTemplate(template) {
    if (!this.templates.templates) {
      this.templates.templates = [];
    }
    
    this.templates.templates.push({
      name: template.name,
      category: template.category,
      total_points: template.total_points,
      stories: template.stories,
      created_at: new Date().toISOString()
    });
    
    // Save to file
    const templatesPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'story-templates.json'
    );
    
    try {
      fs.writeFileSync(templatesPath, JSON.stringify(this.templates, null, 2));
      console.log('💾 Template saved');
    } catch (error) {
      console.error('Error saving template:', error.message);
    }
  }
  
  /**
   * Get matching templates
   */
  getMatchingTemplates(story) {
    const matches = [];
    const storyText = `${story.title} ${story.description || ''}`.toLowerCase();
    
    for (const template of this.templates.templates) {
      const categoryMatch = storyText.includes(template.category);
      const nameMatch = template.name.toLowerCase().split(' ')
        .some(word => storyText.includes(word));
      
      if (categoryMatch || nameMatch) {
        matches.push({
          template: template,
          confidence: categoryMatch && nameMatch ? 0.8 : 0.5
        });
      }
    }
    
    return matches;
  }
}

// Export the class and create instance
const storySplitter = new StorySplitter();

module.exports = {
  StorySplitter,
  storySplitter,
  
  // Convenience exports
  analyzeStory: (story) => storySplitter.analyzeStory(story),
  applyBreakdown: (story, suggestion) => storySplitter.applyBreakdown(story, suggestion),
  saveTemplate: (template) => storySplitter.saveTemplate(template),
  getMatchingTemplates: (story) => storySplitter.getMatchingTemplates(story)
};

// If run directly, demonstrate story splitting
if (require.main === module) {
  console.log('📏 Story Splitting Intelligence Demo');
  
  // Example large stories
  const stories = [
    {
      id: 'STORY-001',
      title: 'Implement user authentication system',
      description: 'Complete authentication with login, logout, password reset, and session management',
      story_points: 13
    },
    {
      id: 'STORY-002',
      title: 'Create admin dashboard',
      description: 'Dashboard with charts, metrics, real-time updates, and export functionality',
      story_points: 21
    },
    {
      id: 'STORY-003',
      title: 'Add payment processing',
      description: 'Integrate Stripe for payments, handle subscriptions, and generate receipts',
      story_points: 21
    }
  ];
  
  for (const story of stories) {
    console.log(`\n\nAnalyzing: ${story.title} (${story.story_points} points)`);
    console.log('=' . repeat(60));
    
    const analysis = storySplitter.analyzeStory(story);
    
    console.log(`Large story: ${analysis.is_large ? 'Yes' : 'No'}`);
    console.log(`Suggestions: ${analysis.suggestions.length}`);
    
    if (analysis.recommendation) {
      console.log(`\nRecommendation: ${analysis.recommendation.action}`);
      console.log(`Reason: ${analysis.recommendation.reason}`);
      
      if (analysis.recommendation.action === 'break_down' && analysis.suggestions.length > 0) {
        const suggestion = analysis.suggestions[0];
        
        console.log(`\nSuggested breakdown (${suggestion.pattern_type} pattern):`);
        for (const task of suggestion.breakdown) {
          console.log(`  - ${task.title} (${task.points} points)`);
          if (task.dependencies.length > 0) {
            console.log(`    Dependencies: ${task.dependencies.join(', ')}`);
          }
        }
        
        console.log(`\nTotal points: ${suggestion.total_points}`);
        console.log(`Benefits:`);
        suggestion.benefits.forEach(benefit => console.log(`  - ${benefit}`));
      }
    }
  }
}