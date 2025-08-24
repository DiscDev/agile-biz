#!/usr/bin/env node

/**
 * Agent Context Updater Hook Handler
 * Tracks and updates active agent context based on conversation
 */

const fs = require('fs');
const path = require('path');

class AgentContextUpdater {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.stateDir = path.join(this.projectRoot, 'project-state');
    this.agentContextPath = path.join(this.stateDir, 'agent-context.json');
    this.agentPatterns = this.loadAgentPatterns();
  }

  parseContext() {
    return {
      prompt: process.env.USER_PROMPT || process.argv[2] || '',
      currentAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadAgentPatterns() {
    // Patterns to detect agent mentions and activations
    return {
      explicit: {
        pattern: /(?:acting as|as the|using)\s+(?:the\s+)?(\w+(?:_\w+)*)\s+agent/i,
        priority: 10
      },
      command: {
        pattern: /^\/(\w+)[-_]?agent\s+(.+)/i,
        priority: 9
      },
      reference: {
        pattern: /(?:ask|tell|have|let)\s+(?:the\s+)?(\w+(?:_\w+)*)\s+agent/i,
        priority: 7
      },
      workflow: {
        patterns: {
          '/start-new-project-workflow': 'project_analyzer',
          '/start-existing-project-workflow': 'code_analyzer',
          '/quickstart': 'scrum_master',
          '/sprint-retrospective': 'scrum_master',
          '/milestone': 'project_manager',
          '/deployment-success': 'devops'
        },
        priority: 8
      },
      context_keywords: {
        'prd_agent': ['requirements', 'prd', 'product requirements'],
        'coder_agent': ['implement', 'code', 'develop', 'function', 'class'],
        'testing_agent': ['test', 'testing', 'unit test', 'integration test'],
        'security_agent': ['security', 'vulnerability', 'penetration', 'secure'],
        'ui_ux_agent': ['design', 'ui', 'ux', 'interface', 'mockup'],
        'devops_agent': ['deploy', 'deployment', 'ci/cd', 'pipeline'],
        'scrum_master': ['sprint', 'scrum', 'agile', 'retrospective'],
        'project_manager': ['project', 'timeline', 'milestone', 'backlog'],
        'research_agent': ['research', 'market analysis', 'competitor'],
        'finance_agent': ['finance', 'budget', 'roi', 'cost'],
        'marketing_agent': ['marketing', 'campaign', 'brand', 'promotion'],
        'analytics_agent': ['analytics', 'metrics', 'kpi', 'dashboard']
      },
      priority: 5
    };
  }

  async execute() {
    try {
      const { prompt, currentAgent } = this.context;
      
      if (!prompt) {
        return { status: 'skipped', reason: 'No prompt provided' };
      }

      // Load current agent context
      const agentContext = this.loadAgentContext();

      // Detect agent from prompt
      const detectedAgent = this.detectAgent(prompt);
      
      // Update context if agent detected or changed
      if (detectedAgent && detectedAgent !== currentAgent) {
        agentContext.active_agent = detectedAgent;
        agentContext.agent_history.push({
          agent: detectedAgent,
          timestamp: this.context.timestamp,
          trigger: 'detected',
          confidence: this.getDetectionConfidence(prompt, detectedAgent)
        });
      }

      // Track agent interactions
      this.trackInteraction(agentContext, prompt, detectedAgent || currentAgent);

      // Update workflow context
      this.updateWorkflowContext(agentContext, prompt);

      // Save updated context
      this.saveAgentContext(agentContext);

      return {
        status: 'success',
        activeAgent: agentContext.active_agent,
        detected: detectedAgent,
        confidence: detectedAgent ? this.getDetectionConfidence(prompt, detectedAgent) : null,
        workflowPhase: agentContext.workflow_phase
      };

    } catch (error) {
      console.error('Agent context update failed:', error);
      throw error;
    }
  }

  loadAgentContext() {
    if (fs.existsSync(this.agentContextPath)) {
      return JSON.parse(fs.readFileSync(this.agentContextPath, 'utf8'));
    }

    // Initialize new context
    return {
      active_agent: 'unknown',
      agent_history: [],
      agent_interactions: {},
      workflow_phase: null,
      collaboration_patterns: [],
      last_updated: this.context.timestamp
    };
  }

  detectAgent(prompt) {
    let bestMatch = null;
    let highestPriority = -1;

    // Check explicit patterns
    const explicitMatch = prompt.match(this.agentPatterns.explicit.pattern);
    if (explicitMatch) {
      const agentName = this.normalizeAgentName(explicitMatch[1]);
      if (this.isValidAgent(agentName)) {
        return agentName;
      }
    }

    // Check command patterns
    const commandMatch = prompt.match(this.agentPatterns.command.pattern);
    if (commandMatch) {
      const agentName = this.normalizeAgentName(commandMatch[1]);
      if (this.isValidAgent(agentName)) {
        return agentName;
      }
    }

    // Check workflow commands
    for (const [command, agent] of Object.entries(this.agentPatterns.workflow.patterns)) {
      if (prompt.startsWith(command)) {
        return agent;
      }
    }

    // Check reference patterns
    const referenceMatch = prompt.match(this.agentPatterns.reference.pattern);
    if (referenceMatch) {
      const agentName = this.normalizeAgentName(referenceMatch[1]);
      if (this.isValidAgent(agentName)) {
        return agentName;
      }
    }

    // Check context keywords
    const promptLower = prompt.toLowerCase();
    let bestKeywordMatch = null;
    let bestKeywordScore = 0;

    for (const [agent, keywords] of Object.entries(this.agentPatterns.context_keywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (promptLower.includes(keyword)) {
          score += keyword.split(' ').length; // Multi-word keywords score higher
        }
      }
      
      if (score > bestKeywordScore) {
        bestKeywordScore = score;
        bestKeywordMatch = agent;
      }
    }

    if (bestKeywordScore > 2) { // Threshold for keyword matching
      return bestKeywordMatch;
    }

    return null;
  }

  normalizeAgentName(name) {
    // Convert various formats to standard agent name
    return name.toLowerCase()
      .replace(/[\s-]/g, '_')
      .replace(/_agent$/, '') // Remove _agent suffix if not needed
      + '_agent';
  }

  isValidAgent(agentName) {
    // List of valid agent names
    const validAgents = [
      'prd_agent', 'project_manager', 'scrum_master', 'coder_agent',
      'testing_agent', 'ui_ux_agent', 'devops_agent', 'security_agent',
      'dba_agent', 'ml_agent', 'data_engineer_agent', 'research_agent',
      'finance_agent', 'analysis_agent', 'marketing_agent',
      'business_documents_agent', 'seo_agent', 'ppc_media_buyer_agent',
      'social_media_agent', 'email_marketing_agent', 'revenue_optimization_agent',
      'analytics_growth_intelligence_agent', 'customer_lifecycle_agent',
      'api_agent', 'llm_agent', 'mcp_agent', 'documentator_agent',
      'logger_agent', 'optimization_agent', 'dashboard_agent',
      'project_analyzer', 'document_manager', 'project_state_manager',
      'project_structure_agent', 'learning_analysis_agent', 'vc_report_agent',
      'code_analyzer', 'market_validation_pmf_agent'
    ];

    return validAgents.includes(agentName);
  }

  getDetectionConfidence(prompt, detectedAgent) {
    // Calculate confidence based on detection method
    if (prompt.match(this.agentPatterns.explicit.pattern)) {
      return 0.95;
    }
    if (prompt.match(this.agentPatterns.command.pattern)) {
      return 0.90;
    }
    if (Object.keys(this.agentPatterns.workflow.patterns).some(cmd => prompt.startsWith(cmd))) {
      return 0.85;
    }
    if (prompt.match(this.agentPatterns.reference.pattern)) {
      return 0.80;
    }
    
    // Keyword-based detection
    return 0.60;
  }

  trackInteraction(agentContext, prompt, agent) {
    // Initialize agent interaction tracking
    if (!agentContext.agent_interactions[agent]) {
      agentContext.agent_interactions[agent] = {
        count: 0,
        first_interaction: this.context.timestamp,
        last_interaction: this.context.timestamp,
        interaction_types: {}
      };
    }

    const interaction = agentContext.agent_interactions[agent];
    interaction.count++;
    interaction.last_interaction = this.context.timestamp;

    // Categorize interaction type
    const interactionType = this.categorizeInteraction(prompt);
    interaction.interaction_types[interactionType] = 
      (interaction.interaction_types[interactionType] || 0) + 1;

    // Track collaboration patterns
    if (agentContext.agent_history.length > 0) {
      const previousAgent = agentContext.agent_history[agentContext.agent_history.length - 1].agent;
      if (previousAgent !== agent) {
        const pattern = `${previousAgent} -> ${agent}`;
        if (!agentContext.collaboration_patterns.includes(pattern)) {
          agentContext.collaboration_patterns.push(pattern);
        }
      }
    }
  }

  categorizeInteraction(prompt) {
    const categories = {
      implementation: /(?:implement|create|build|add|code|develop)/i,
      analysis: /(?:analyze|review|check|evaluate|assess)/i,
      planning: /(?:plan|design|architect|structure|organize)/i,
      testing: /(?:test|validate|verify|check|debug)/i,
      documentation: /(?:document|write|describe|explain)/i,
      deployment: /(?:deploy|release|launch|publish)/i,
      research: /(?:research|investigate|explore|study)/i,
      management: /(?:manage|coordinate|track|monitor)/i
    };

    for (const [category, pattern] of Object.entries(categories)) {
      if (pattern.test(prompt)) {
        return category;
      }
    }

    return 'general';
  }

  updateWorkflowContext(agentContext, prompt) {
    // Update workflow phase based on agent and interaction
    const workflowTransitions = {
      'project_analyzer': {
        implementation: 'discovery',
        planning: 'requirements'
      },
      'prd_agent': {
        documentation: 'requirements',
        planning: 'requirements'
      },
      'coder_agent': {
        implementation: 'development',
        testing: 'development'
      },
      'testing_agent': {
        testing: 'testing',
        analysis: 'testing'
      },
      'devops_agent': {
        deployment: 'deployment',
        implementation: 'deployment'
      }
    };

    const agent = agentContext.active_agent;
    const interactionType = this.categorizeInteraction(prompt);

    if (workflowTransitions[agent] && workflowTransitions[agent][interactionType]) {
      agentContext.workflow_phase = workflowTransitions[agent][interactionType];
    }
  }

  saveAgentContext(agentContext) {
    agentContext.last_updated = this.context.timestamp;
    
    // Ensure state directory exists
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
    
    fs.writeFileSync(this.agentContextPath, JSON.stringify(agentContext, null, 2));
    
    // Also update main state if exists
    const mainStatePath = path.join(this.stateDir, 'current-state.json');
    if (fs.existsSync(mainStatePath)) {
      const mainState = JSON.parse(fs.readFileSync(mainStatePath, 'utf8'));
      mainState.active_agent = agentContext.active_agent;
      mainState.workflow_phase = agentContext.workflow_phase;
      fs.writeFileSync(mainStatePath, JSON.stringify(mainState, null, 2));
    }
  }
}

if (require.main === module) {
  const updater = new AgentContextUpdater();
  updater.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = AgentContextUpdater;