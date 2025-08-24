/**
 * Streaming Infrastructure Usage Examples
 * Demonstrates how agents use the streaming system for real-time communication
 */

const { streaming } = require('./streaming-infrastructure');

// Example 1: Progress Updates from All Agents to Project Manager
function exampleProgressUpdates() {
  console.log('📊 Example: Progress Updates to Project Manager');

  // PRD Agent reports progress
  streaming.streamProgressUpdate('prd_agent', {
    taskCompleted: 'Requirements gathering completed',
    progressPercentage: 85,
    currentPhase: 'stakeholder_review',
    eta: '2024-01-20T16:00:00Z',
    achievements: ['User stories defined', 'Acceptance criteria completed']
  });

  // Coder Agent reports progress
  streaming.streamProgressUpdate('coder_agent', {
    taskCompleted: 'Authentication module implemented',
    progressPercentage: 60,
    currentPhase: 'feature_development',
    blockers: ['Waiting for database schema approval'],
    achievements: ['JWT implementation', 'Password hashing', 'Session management']
  });

  // Testing Agent reports progress
  streaming.streamProgressUpdate('testing_agent', {
    taskCompleted: 'Unit tests for auth module',
    progressPercentage: 75,
    currentPhase: 'test_automation',
    achievements: ['100% code coverage for auth', 'Integration tests setup']
  });
}

// Example 2: Real-time Dashboard Updates
function exampleDashboardUpdates() {
  console.log('📱 Example: Real-time Dashboard Updates');

  // Document creation updates
  streaming.streamDashboardUpdate('research_agent', 'document_created', {
    document_path: 'business-strategy/research/market-analysis.md',
    document_type: 'market_analysis',
    word_count: 2500,
    key_findings: ['Market size $2.5B', 'High competition', 'Growth opportunity in SMB segment']
  });

  // Agent status updates
  streaming.streamDashboardUpdate('coder_agent', 'agent_status', {
    status: 'active',
    current_task: 'Implementing user registration API',
    estimated_completion: '2024-01-20T14:30:00Z',
    files_modified: ['src/auth/register.js', 'src/models/user.js']
  });

  // Milestone achievements
  streaming.streamDashboardUpdate('project_manager_agent', 'milestone_achieved', {
    milestone: 'MVP Backend Complete',
    completion_date: '2024-01-20T12:00:00Z',
    deliverables: ['REST API', 'Database schema', 'Authentication system'],
    next_milestone: 'Frontend Implementation'
  });
}

// Example 3: Incremental Testing Requests
function exampleIncrementalTesting() {
  console.log('🧪 Example: Incremental Testing Flows');

  // Coder Agent requests focused testing after code changes
  streaming.streamIncrementalTesting({
    changedFiles: [
      'src/auth/login.js',
      'src/middleware/auth.js',
      'src/routes/auth.js'
    ],
    priority: 'high',
    branch: 'feature/auth-improvements',
    commitHash: 'abc123def456'
  }, 'affected_and_integration');

  // Another example with broader testing scope
  streaming.streamIncrementalTesting({
    changedFiles: [
      'src/database/migrations/001_add_user_roles.sql',
      'src/models/user.js'
    ],
    priority: 'medium',
    branch: 'feature/user-roles'
  }, 'full_regression');
}

// Example 4: Cross-Agent Coordination
function exampleAgentCoordination() {
  console.log('🤝 Example: Agent Coordination');

  // Research Agent hands off to Marketing Agent
  streaming.streamCoordinationEvent(
    'research_agent',
    'marketing_agent',
    'handoff',
    {
      deliverable: 'Market research complete',
      documents: ['business-strategy/research/market-analysis.md', 'business-strategy/research/competitor-analysis.md'],
      next_actions: ['Develop marketing strategy', 'Create brand positioning'],
      key_insights: [
        'Target market: B2B SaaS companies 10-500 employees',
        'Primary pain point: Manual workflow management',
        'Budget range: $50-500/month per team'
      ]
    }
  );

  // UI/UX Agent requests approval from stakeholders
  streaming.streamCoordinationEvent(
    'ui_ux_agent',
    'project_manager_agent',
    'approval',
    {
      approval_type: 'design_review',
      deliverable: 'Dashboard wireframes',
      documents: ['11-design/dashboard-wireframes.md'],
      decision_required: 'Approve final dashboard layout',
      stakeholders: ['Product Manager', 'Lead Developer']
    }
  );
}

// Example 5: Error and Alert Streams
function exampleAlerts() {
  console.log('🚨 Example: Alerts and Error Handling');

  // Critical security alert
  streaming.streamAlert('security_agent', 'critical', {
    message: 'High-severity vulnerability detected in authentication module',
    severity: 'critical',
    requiresAction: true,
    recommendedActions: [
      'Stop deployment pipeline',
      'Review authentication implementation',
      'Apply security patches immediately'
    ],
    context: {
      vulnerability_id: 'CVE-2024-1234',
      affected_files: ['src/auth/login.js'],
      cvss_score: 9.1
    }
  });

  // Performance warning
  streaming.streamAlert('optimization_agent', 'warning', {
    message: 'API response time exceeded threshold',
    severity: 'medium',
    requiresAction: false,
    recommendedActions: [
      'Review database query performance',
      'Consider implementing caching',
      'Monitor during peak hours'
    ],
    context: {
      endpoint: '/api/users',
      average_response_time: '850ms',
      threshold: '500ms'
    }
  });
}

// Example 6: Performance Metrics Streaming
function examplePerformanceMetrics() {
  console.log('⚡ Example: Performance Metrics');

  // Context optimization metrics
  streaming.streamPerformanceMetric('document_manager_agent', 'context_usage', {
    value: 87.5,
    unit: 'percentage_reduction',
    context: {
      agent: 'marketing_agent',
      original_size: '45KB',
      optimized_size: '5.6KB',
      query_path: 'research_agent.json#/competitive_analysis'
    },
    thresholdStatus: 'normal'
  });

  // Cache performance metrics
  streaming.streamPerformanceMetric('document_manager_agent', 'cache_hit_rate', {
    value: 92.3,
    unit: 'percentage',
    context: {
      cache_type: 'json_query_cache',
      total_requests: 1547,
      cache_hits: 1428,
      cache_misses: 119
    },
    thresholdStatus: 'normal'
  });

  // Generation performance
  streaming.streamPerformanceMetric('document_manager_agent', 'generation_time', {
    value: 1.2,
    unit: 'seconds',
    context: {
      document_type: 'agent_json',
      agent: 'coder_agent',
      file_size: '15KB'
    },
    thresholdStatus: 'warning' // Slower than expected
  });
}

// Example 7: Stakeholder Decision Requirements
function exampleStakeholderDecisions() {
  console.log('🗳️ Example: Stakeholder Decision Requests');

  // Architecture decision required
  streaming.streamStakeholderDecision(
    { type: 'choice' },
    {
      title: 'Database Architecture Decision',
      description: 'Choose between SQL and NoSQL database for user data storage',
      options: [
        {
          option: 'PostgreSQL',
          pros: ['ACID compliance', 'Complex queries', 'Mature ecosystem'],
          cons: ['Less flexible schema', 'Vertical scaling limitations'],
          impact: 'Low risk, standard choice'
        },
        {
          option: 'MongoDB',
          pros: ['Flexible schema', 'Horizontal scaling', 'JSON-native'],
          cons: ['Eventual consistency', 'Learning curve'],
          impact: 'Medium risk, future flexibility'
        }
      ],
      deadline: '2024-01-22T17:00:00Z',
      urgency: 'high',
      contextDocuments: [
        '09-project-planning/architecture-analysis.md',
        '13-implementation/database-requirements.md'
      ]
    }
  );

  // Feature prioritization decision
  streaming.streamStakeholderDecision(
    { type: 'priority' },
    {
      title: 'MVP Feature Prioritization',
      description: 'Rank features for MVP release based on development time vs business value',
      options: [
        { feature: 'User Authentication', effort: 'Medium', value: 'Critical' },
        { feature: 'Dashboard Analytics', effort: 'High', value: 'High' },
        { feature: 'Team Collaboration', effort: 'High', value: 'Medium' },
        { feature: 'Mobile App', effort: 'Very High', value: 'Low' }
      ],
      deadline: '2024-01-21T10:00:00Z',
      urgency: 'medium'
    }
  );
}

// Example 8: JSON Context Optimization Events
function exampleContextOptimization() {
  console.log('🔧 Example: Context Optimization Events');

  // Successful optimization
  streaming.streamContextOptimization('marketing_agent', {
    originalSize: 47000, // bytes
    optimizedSize: 5800,  // bytes
    reductionPercentage: 87.7,
    queryPath: 'research_agent.json#/market_analysis/target_segments',
    cacheHit: false,
    performanceGain: '2.3x faster'
  });

  // Cache hit optimization
  streaming.streamContextOptimization('coder_agent', {
    originalSize: 32000,
    optimizedSize: 4200,
    reductionPercentage: 86.9,
    queryPath: 'testing_agent.json#/test_results/unit_tests',
    cacheHit: true,
    performanceGain: '5.1x faster'
  });
}

// Run all examples
function runAllExamples() {
  console.log('🚀 Running JSON Context Optimization Streaming Examples\n');

  exampleProgressUpdates();
  console.log('');
  
  exampleDashboardUpdates();
  console.log('');
  
  exampleIncrementalTesting();
  console.log('');
  
  exampleAgentCoordination();
  console.log('');
  
  exampleAlerts();
  console.log('');
  
  examplePerformanceMetrics();
  console.log('');
  
  exampleStakeholderDecisions();
  console.log('');
  
  exampleContextOptimization();
  console.log('');

  // Show streaming statistics
  const stats = streaming.getStreamStats();
  console.log('📊 Streaming Statistics:');
  console.log(JSON.stringify(stats, null, 2));
}

// Export functions for individual testing
module.exports = {
  exampleProgressUpdates,
  exampleDashboardUpdates,
  exampleIncrementalTesting,
  exampleAgentCoordination,
  exampleAlerts,
  examplePerformanceMetrics,
  exampleStakeholderDecisions,
  exampleContextOptimization,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}