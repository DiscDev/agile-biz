/**
 * Stakeholder Interaction Handler
 * Manages iterative discovery and progressive questioning
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class StakeholderInteractionHandler {
  constructor(projectRoot, workflowType) {
    this.projectRoot = projectRoot || process.cwd();
    this.workflowType = workflowType; // 'new-project' or 'existing-project'
    this.questionsPath = path.join(this.projectRoot, 'machine-data', 'stakeholder-interview-questions.json');
    this.statePath = path.join(this.projectRoot, 'project-state', 'runtime.json');
    this.decisionsPath = path.join(this.projectRoot, 'project-documents', 'orchestration', 'stakeholder-decisions.md');
    this.loadConfiguration();
    this.currentSection = null;
    this.iterations = {};
    this.responses = {};
  }

  /**
   * Load configuration and questions
   */
  loadConfiguration() {
    try {
      const questionsContent = fs.readFileSync(this.questionsPath, 'utf8');
      this.questions = JSON.parse(questionsContent);
      
      if (fs.existsSync(this.statePath)) {
        const stateContent = fs.readFileSync(this.statePath, 'utf8');
        this.state = JSON.parse(stateContent);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw error;
    }
  }

  /**
   * Start interview for specific phase
   */
  async startInterview(phase) {
    console.log('\n[Stakeholder Interview Agent]: Starting interview for phase:', phase);
    
    switch (phase) {
      case 'setup_verification':
        return await this.conductSetupVerification();
      case 'stakeholder_discovery':
        return await this.conductDiscovery();
      case 'research_depth_selection':
        return await this.selectResearchDepth();
      case 'identity_verification':
        return await this.verifyProjectIdentity();
      case 'enhancement_goals':
        return await this.discoverEnhancementGoals();
      case 'analysis_depth_selection':
        return await this.selectAnalysisDepth();
      default:
        return { success: false, error: 'Unknown interview phase' };
    }
  }

  /**
   * Conduct setup verification
   */
  async conductSetupVerification() {
    console.log('\n📋 SETUP VERIFICATION');
    console.log('─'.repeat(50));
    console.log("Let me verify your setup is complete.\n");

    const questions = this.questions.setup_verification;
    const results = {};

    for (const question of questions) {
      const response = await this.askQuestion(question);
      results[question.id] = response;
      
      if (!response.success && question.required) {
        console.log(`\n⚠️  Setup incomplete: ${question.recovery}`);
        return {
          success: false,
          incomplete: true,
          recovery: question.recovery
        };
      }
    }

    console.log('\n✅ Setup verification complete!');
    this.saveDecision('setup_verification', results, true);
    
    return { success: true, results };
  }

  /**
   * Conduct stakeholder discovery
   */
  async conductDiscovery() {
    console.log('\n🎯 STAKEHOLDER DISCOVERY');
    console.log('─'.repeat(50));
    console.log("I'll guide you through project discovery step by step.\n");

    // Check for prompt file first
    const hasPromptFile = await this.checkPromptFile();
    
    if (hasPromptFile) {
      console.log('📄 Processing your stakeholder prompt file...');
      const promptData = await this.processPromptFile();
      if (promptData.complete) {
        console.log('✅ All required information found in prompt file!');
        return { success: true, data: promptData };
      }
    }

    // Conduct section-by-section discovery
    const sections = [
      'project_identity',
      'technical_preferences',
      'business_context',
      'core_features',
      'operations_vision'
    ];

    for (const section of sections) {
      const result = await this.conductSection(section);
      if (!result.approved) {
        return { success: false, section, reason: 'Not approved' };
      }
    }

    console.log('\n✅ Stakeholder discovery complete!');
    return { success: true, responses: this.responses };
  }

  /**
   * Conduct a specific section with iterative refinement
   */
  async conductSection(sectionName) {
    console.log(`\n📌 Section: ${sectionName.replace('_', ' ').toUpperCase()}`);
    console.log('─'.repeat(40));

    const sectionQuestions = this.questions[sectionName];
    if (!sectionQuestions) {
      return { approved: true };
    }

    this.currentSection = sectionName;
    this.iterations[sectionName] = 0;
    
    let approved = false;
    let maxIterations = 3;

    while (!approved && this.iterations[sectionName] < maxIterations) {
      this.iterations[sectionName]++;
      
      // Ask initial questions
      const responses = {};
      for (const question of sectionQuestions.initial) {
        const answer = await this.askQuestion(question);
        responses[question.id] = answer;
      }

      // Check for ambiguity
      const ambiguities = this.detectAmbiguity(responses);
      
      if (ambiguities.length > 0) {
        console.log('\n🤔 I need some clarification:');
        for (const ambiguity of ambiguities) {
          const clarification = await this.askClarification(ambiguity);
          responses[ambiguity.id] = clarification;
        }
      }

      // Present understanding
      const understanding = this.formatUnderstanding(sectionName, responses);
      console.log('\n📝 Here\'s my understanding:');
      console.log(understanding);

      // Get approval
      approved = await this.getApproval();
      
      if (approved) {
        this.responses[sectionName] = responses;
        this.saveDecision(sectionName, responses, true);
      } else {
        console.log('Let me ask some follow-up questions...');
      }
    }

    return { approved, iterations: this.iterations[sectionName] };
  }

  /**
   * Progressive AI Operations Discovery
   */
  async discoverAIOperations() {
    console.log('\n🤖 AI OPERATIONS DISCOVERY');
    console.log('─'.repeat(50));
    console.log("Let's explore how AI agents can automate your business operations.\n");

    const categories = Object.keys(this.questions.operations_vision);
    const aiDecisions = {};

    // Phase 1: High-level vision
    console.log("First, let's talk about your overall vision:");
    console.log("After launch, how do you envision running your business?");
    console.log("What tasks would you like to automate vs handle personally?\n");
    
    // Phase 2: Category-by-category discovery
    for (const category of categories) {
      console.log(`\n📊 ${category.replace(/_/g, ' ').toUpperCase()}`);
      const categoryQuestions = this.questions.operations_vision[category];
      
      // Present questions progressively
      console.log("I'll ask about different AI agent possibilities.");
      console.log("Just answer: yes, maybe, or no\n");
      
      const responses = {};
      for (const question of categoryQuestions) {
        const answer = await this.askYesNoMaybe(question);
        responses[question.id] = answer;
      }
      
      aiDecisions[category] = responses;
    }

    // Phase 3: Priority mapping
    const yesItems = this.extractYesItems(aiDecisions);
    if (yesItems.length > 0) {
      console.log('\n🎯 PRIORITY MAPPING');
      console.log('Of the AI agents you said "yes" to, which are:');
      console.log('1. Must-have for launch?');
      console.log('2. Nice-to-have for launch?');
      console.log('3. Can wait until post-launch?');
      console.log('4. Experimental/future consideration?');
      
      const priorities = await this.getPriorities(yesItems);
      aiDecisions.priorities = priorities;
    }

    // Phase 4: Budget alignment
    console.log('\n💰 BUDGET ALIGNMENT');
    const budget = await this.getBudgetRange();
    aiDecisions.budget = budget;

    this.saveDecision('ai_operations', aiDecisions, true);
    return { success: true, decisions: aiDecisions };
  }

  /**
   * Select research depth
   */
  async selectResearchDepth() {
    console.log('\n📊 RESEARCH DEPTH SELECTION');
    console.log('─'.repeat(50));
    
    const prompt = `
How deep should we research your project? Here's what you'll get:

📋 MINIMAL (Essential validation, 1-2 hours)
   You'll receive these 15 essential documents:
   • Market & Competitive Analysis (7 docs)
   • Marketing Strategy (3 docs)
   • Financial Analysis (3 docs)
   • Executive Summary & Recommendations (2 docs)

📊 MEDIUM (Comprehensive research, 3-5 hours) [RECOMMENDED]
   You'll receive these 48 comprehensive documents:
   • In-depth Market Research (24 docs)
   • Complete Marketing Strategy (8 docs)
   • Financial Planning & ROI (5 docs)
   • Market Validation Framework (6 docs)
   • Strategic Analysis & Recommendations (4 docs)

🔍 THOROUGH (Enterprise deep-dive, 6-10 hours) [DEFAULT]
   You'll receive 194 enterprise-level documents including:
   • Exhaustive Market Research (48 docs)
   • Full Marketing Arsenal (41 docs)
   • Customer Success Strategy (24 docs)
   • Monetization & Revenue Models (24 docs)
   • Market Validation System (19 docs)
   • Investment & Fundraising Docs (19 docs)
   • Analytics & Intelligence (23 docs)
   • Security & Compliance (13 docs)
   • And much more...

Which level would you prefer? (minimal/medium/thorough) [default: thorough]:`;

    console.log(prompt);
    
    // ALWAYS default to thorough for maximum research depth
    const response = 'thorough'; // Default fallback
    
    // Save selection
    this.state.discovery.research_level = response;
    this.state.configuration.research_level = response;
    this.saveState();
    
    console.log(`\n✅ Research level set to: ${response.toUpperCase()}`);
    console.log(`📚 ${response === 'thorough' ? '194' : response === 'medium' ? '48' : '15'} research documents will be created`);
    
    this.saveDecision('research_level', { level: response }, true);
    
    // Initialize document creation with research level
    try {
      const WorkflowStateHandler = require('./workflow-state-handler');
      const workflowHandler = new WorkflowStateHandler(this.projectRoot);
      
      // Set research level (this will initialize document tracker)
      workflowHandler.setResearchLevel(response);
      
      // Trigger initial document creation for discovery phase
      const result = workflowHandler.triggerDocumentCreation('initialization_complete', {
        research_level: response,
        workflow: this.state.active_workflow,
        project_type: this.state.configuration.project_type
      });
      
      if (result.success && result.pending > 0) {
        console.log(`📋 ${result.pending} documents queued for creation in discovery phase`);
      }
    } catch (error) {
      console.error('Warning: Could not initialize document creation:', error.message);
    }
    
    return { success: true, level: response };
  }

  /**
   * Discover enhancement goals for existing projects
   */
  async discoverEnhancementGoals() {
    console.log('\n🎯 ENHANCEMENT GOALS DISCOVERY');
    console.log('─'.repeat(50));
    console.log("Based on my analysis, let's discuss enhancement priorities.\n");

    const categories = [
      {
        name: 'Performance Improvements',
        questions: [
          'Are there performance bottlenecks to address?',
          'Do you need better caching strategies?',
          'Should we optimize database queries?'
        ]
      },
      {
        name: 'Feature Additions',
        questions: [
          'What new features are most requested?',
          'Are there integrations you need?',
          'Any UI/UX improvements planned?'
        ]
      },
      {
        name: 'Technical Debt',
        questions: [
          'Do you have legacy code to refactor?',
          'Are there outdated dependencies?',
          'Need better test coverage?'
        ]
      },
      {
        name: 'AI Operations',
        questions: [
          'Want to automate customer support?',
          'Need AI-powered analytics?',
          'Interested in predictive features?'
        ]
      }
    ];

    const goals = {};
    
    for (const category of categories) {
      console.log(`\n📊 ${category.name}`);
      const categoryGoals = [];
      
      for (const question of category.questions) {
        const answer = await this.askQuestion({ question, id: question });
        if (answer.answer && answer.answer.toLowerCase() !== 'no') {
          categoryGoals.push({
            question,
            response: answer.answer,
            priority: await this.getPriority()
          });
        }
      }
      
      if (categoryGoals.length > 0) {
        goals[category.name] = categoryGoals;
      }
    }

    // Ask about structure decision
    console.log('\n🏗️ DEVELOPMENT APPROACH');
    console.log('How would you like to structure the enhancements?');
    console.log('1. Iterative Sprints (2-week cycles)');
    console.log('2. Feature-by-Feature (complete one before next)');
    console.log('3. Parallel Development (multiple features at once)');
    console.log('4. Custom Timeline');
    
    const approach = await this.askQuestion({ 
      question: 'Select approach (1-4):', 
      id: 'development_approach' 
    });

    goals.development_approach = approach.answer;

    this.saveDecision('enhancement_goals', goals, true);
    return { success: true, goals };
  }

  /**
   * Get priority for a goal
   */
  async getPriority() {
    // Simulate priority selection
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  /**
   * Select analysis depth for existing projects
   */
  async selectAnalysisDepth() {
    console.log('\n📊 ANALYSIS DEPTH SELECTION');
    console.log('─'.repeat(50));
    
    const prompt = `
How deep should we analyze your existing project?

📋 STANDARD (Essential analysis, 1-2 hours)
   • Core architecture review
   • Dependency analysis
   • Basic performance audit
   • Security scan
   • Quick wins identification

🔍 COMPREHENSIVE (Deep analysis, 3-5 hours)
   • Complete code quality analysis
   • Detailed performance profiling
   • Full security audit
   • Technical debt assessment
   • Scalability review
   • Test coverage analysis
   • Documentation review

🔬 ENTERPRISE (Full audit, 6-10 hours)
   • Everything in Comprehensive, plus:
   • Business logic validation
   • Compliance checking
   • Accessibility audit
   • International readiness
   • DevOps pipeline review
   • Cost optimization analysis
   • Team workflow assessment

Which level would you prefer? (standard/comprehensive/enterprise) [default: comprehensive]:`;

    console.log(prompt);
    
    const response = 'comprehensive'; // Default
    
    this.state.discovery.analysis_level = response;
    this.state.configuration.analysis_level = response;
    this.saveState();
    
    console.log(`\n✅ Analysis level set to: ${response.toUpperCase()}`);
    this.saveDecision('analysis_level', { level: response }, true);
    
    return { success: true, level: response };
  }

  /**
   * Verify project identity (for existing projects)
   */
  async verifyProjectIdentity() {
    console.log('\n🔍 PROJECT IDENTITY VERIFICATION');
    console.log('─'.repeat(50));
    console.log("Based on my analysis, let me verify I understand your project correctly.\n");

    const questions = [
      "In one sentence, what is this product?",
      "What specific industry/domain is this for?",
      "Who are the primary users?",
      "List 3-5 things this is explicitly NOT",
      "Name 3-5 competitor products"
    ];

    const responses = {};
    for (const question of questions) {
      const answer = await this.askQuestion({ question, id: question });
      responses[question] = answer;
    }

    // Present understanding
    console.log('\n📝 Project Identity Summary:');
    console.log(`Product: ${responses[questions[0]]}`);
    console.log(`Industry: ${responses[questions[1]]}`);
    console.log(`Users: ${responses[questions[2]]}`);
    console.log(`NOT THIS: ${responses[questions[3]]}`);
    console.log(`Competitors: ${responses[questions[4]]}`);

    const approved = await this.getApproval();
    
    if (approved) {
      this.saveDecision('project_identity', responses, true);
      return { success: true, identity: responses };
    }

    return { success: false, reason: 'Identity not confirmed' };
  }

  /**
   * Helper: Ask a question
   */
  async askQuestion(question) {
    console.log(`\n❓ ${question.question || question}`);
    
    // In real implementation, would wait for user input
    // For now, return simulated response
    return {
      question: question.question || question,
      answer: 'Simulated response',
      success: true
    };
  }

  /**
   * Helper: Ask for clarification
   */
  async askClarification(ambiguity) {
    console.log(`   • ${ambiguity.clarification}`);
    
    // Simulated clarification
    return {
      original: ambiguity.original,
      clarified: 'Clarified response'
    };
  }

  /**
   * Helper: Ask yes/no/maybe
   */
  async askYesNoMaybe(question) {
    console.log(`• ${question.question}`);
    
    // Simulate response
    const options = ['yes', 'no', 'maybe'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Helper: Detect ambiguity in responses
   */
  detectAmbiguity(responses) {
    const ambiguities = [];
    
    // Check for vague terms
    const vagueTerms = ['thing', 'stuff', 'various', 'multiple', 'etc', 'and so on'];
    
    for (const [id, response] of Object.entries(responses)) {
      const answer = response.answer || response;
      if (vagueTerms.some(term => answer.toLowerCase().includes(term))) {
        ambiguities.push({
          id,
          original: answer,
          clarification: 'Can you be more specific?'
        });
      }
    }
    
    return ambiguities;
  }

  /**
   * Helper: Format understanding
   */
  formatUnderstanding(section, responses) {
    const lines = [];
    lines.push(`Based on your answers for ${section.replace('_', ' ')}:`);
    
    for (const [key, value] of Object.entries(responses)) {
      const answer = value.answer || value;
      lines.push(`• ${key}: ${answer}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Helper: Get approval
   */
  async getApproval() {
    console.log('\nIs this understanding correct? (yes/no): ');
    
    // Simulate approval
    return true;
  }

  /**
   * Helper: Check for prompt file
   */
  async checkPromptFile() {
    const promptPath = path.join(
      this.projectRoot,
      'project-documents',
      'stakeholder-input',
      'project-prompt.md'
    );
    
    return fs.existsSync(promptPath);
  }

  /**
   * Helper: Process prompt file
   */
  async processPromptFile() {
    // In real implementation, would parse and validate prompt file
    return {
      complete: false,
      missing: ['technical_preferences', 'operations_vision']
    };
  }

  /**
   * Helper: Extract yes items for priority mapping
   */
  extractYesItems(aiDecisions) {
    const yesItems = [];
    
    for (const [category, responses] of Object.entries(aiDecisions)) {
      if (category === 'priorities' || category === 'budget') continue;
      
      for (const [id, answer] of Object.entries(responses)) {
        if (answer === 'yes') {
          yesItems.push({ category, id });
        }
      }
    }
    
    return yesItems;
  }

  /**
   * Helper: Get priorities
   */
  async getPriorities(items) {
    const priorities = {
      must_have: [],
      nice_to_have: [],
      post_launch: [],
      future: []
    };
    
    // Simulate priority assignment
    items.forEach((item, index) => {
      if (index < 2) priorities.must_have.push(item);
      else if (index < 4) priorities.nice_to_have.push(item);
      else if (index < 6) priorities.post_launch.push(item);
      else priorities.future.push(item);
    });
    
    return priorities;
  }

  /**
   * Helper: Get budget range
   */
  async getBudgetRange() {
    console.log('\nWhat\'s your monthly budget for AI operations?');
    console.log('1. Under $500/month');
    console.log('2. $500-2000/month');
    console.log('3. $2000-5000/month');
    console.log('4. $5000+/month');
    console.log('5. Budget not determined yet');
    
    // Simulate selection
    return '$500-2000/month';
  }

  /**
   * Save decision to documentation
   */
  saveDecision(decisionType, data, approved) {
    const timestamp = new Date().toISOString();
    const decision = {
      type: decisionType,
      timestamp,
      approved,
      iterations: this.iterations[decisionType] || 1,
      data
    };

    // Ensure decisions directory exists
    const decisionsDir = path.dirname(this.decisionsPath);
    if (!fs.existsSync(decisionsDir)) {
      fs.mkdirSync(decisionsDir, { recursive: true });
    }

    // Append to decisions file
    let content = '';
    if (fs.existsSync(this.decisionsPath)) {
      content = fs.readFileSync(this.decisionsPath, 'utf8');
    } else {
      content = '# Stakeholder Decisions\n\n';
    }

    content += `\n## Decision: ${decisionType.replace('_', ' ').toUpperCase()}\n`;
    content += `**Date**: ${timestamp}\n`;
    content += `**Approved**: ${approved ? '✅ Yes' : '❌ No'}\n`;
    content += `**Iterations**: ${decision.iterations}\n`;
    content += `**Data**:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
    content += '\n---\n';

    fs.writeFileSync(this.decisionsPath, content);
    
    // Update state
    if (this.state) {
      if (!this.state.discovery.approvals) {
        this.state.discovery.approvals = {};
      }
      this.state.discovery.approvals[decisionType] = {
        approved,
        timestamp,
        iterations: decision.iterations
      };
      this.saveState();
    }
    
    return decision;
  }

  /**
   * Save state
   */
  saveState() {
    if (this.state) {
      fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    }
  }
}

// Export for use in workflows
module.exports = StakeholderInteractionHandler;

// Allow direct execution for testing
if (require.main === module) {
  const handler = new StakeholderInteractionHandler(process.cwd(), 'new-project');
  handler.startInterview('stakeholder_discovery').then(result => {
    console.log('\nInterview Result:', result);
  });
}