/**
 * Integration Orchestrator
 * Manages parallel execution of integration tasks across multiple systems
 */

const SubAgentOrchestrator = require('./sub-agent-orchestrator');
const TokenBudgetManager = require('./token-budget-manager');
const DocumentRegistryManager = require('./document-registry-manager');
const fs = require('fs').promises;
const path = require('path');

class IntegrationOrchestrator {
  constructor() {
    this.orchestrator = new SubAgentOrchestrator();
    this.tokenManager = new TokenBudgetManager();
    this.registryManager = new DocumentRegistryManager();
    this.integrationBasePath = path.join(__dirname, '..', 'project-documents', 'implementation');
  }

  /**
   * Initialize the integration orchestrator
   */
  async initialize() {
    await this.orchestrator.initialize();
    await this.registryManager.initialize();
  }

  /**
   * Execute parallel integration setup
   * @param {Object} integrationRequirements - Systems and APIs to integrate
   * @param {Object} projectContext - Project information
   */
  async setupIntegrations(integrationRequirements, projectContext) {
    console.log(`\n🔌 Starting parallel integration setup...`);
    
    const startTime = Date.now();
    
    // Categorize integrations
    const categories = this.categorizeIntegrations(integrationRequirements);
    
    // Create integration tasks
    const integrationTasks = this.createIntegrationTasks(categories, projectContext);
    
    // Allocate token budgets
    this.allocateIntegrationBudgets(integrationTasks);
    
    // Launch parallel integration
    console.log(`\n🚀 Launching ${integrationTasks.length} integration sub-agents...`);
    
    const results = await this.orchestrator.launchSubAgents(integrationTasks);
    
    // Process results
    const integrations = await this.processIntegrationResults(results);
    
    // Generate integration guide
    const guide = await this.generateIntegrationGuide(integrations, projectContext);
    
    const duration = (Date.now() - startTime) / 1000 / 60;
    console.log(`\n✅ Integration setup completed in ${duration.toFixed(1)} minutes`);
    
    return {
      guide,
      integrations,
      metrics: {
        duration,
        integrationsSetup: integrations.successful.length,
        tokensUsed: this.tokenManager.getTotalUsage()
      }
    };
  }

  /**
   * Categorize integrations by type
   */
  categorizeIntegrations(requirements) {
    const categories = {
      authentication: [],
      payment: [],
      messaging: [],
      storage: [],
      analytics: [],
      ai: [],
      database: [],
      monitoring: []
    };
    
    // Categorize each integration
    Object.entries(requirements).forEach(([system, config]) => {
      const category = this.detectIntegrationCategory(system, config);
      if (categories[category]) {
        categories[category].push({ system, config });
      }
    });
    
    // Remove empty categories
    return Object.entries(categories)
      .filter(([_, items]) => items.length > 0)
      .reduce((acc, [cat, items]) => ({ ...acc, [cat]: items }), {});
  }

  /**
   * Detect integration category
   */
  detectIntegrationCategory(system, config) {
    const patterns = {
      authentication: ['auth', 'oauth', 'sso', 'login', 'jwt'],
      payment: ['payment', 'stripe', 'paypal', 'checkout', 'billing'],
      messaging: ['email', 'sms', 'twilio', 'sendgrid', 'notification'],
      storage: ['s3', 'storage', 'cdn', 'upload', 'file'],
      analytics: ['analytics', 'tracking', 'metrics', 'monitoring'],
      ai: ['openai', 'claude', 'llm', 'ml', 'ai'],
      database: ['postgres', 'mysql', 'mongo', 'redis', 'database'],
      monitoring: ['sentry', 'datadog', 'newrelic', 'logging']
    };
    
    const systemLower = system.toLowerCase();
    
    for (const [category, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => systemLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  /**
   * Create integration tasks for parallel execution
   */
  createIntegrationTasks(categories, projectContext) {
    const tasks = [];
    let subAgentId = 1;
    
    Object.entries(categories).forEach(([category, integrations]) => {
      // Group related integrations
      const groups = this.groupRelatedIntegrations(integrations);
      
      groups.forEach(group => {
        tasks.push({
          id: `integration-${category}-${subAgentId}`,
          subAgentId: `integrator_${subAgentId++}`,
          description: `Set up ${category} integrations`,
          category,
          integrations: group,
          projectContext,
          prompt: this.generateIntegrationPrompt(category, group, projectContext),
          timeout: 180000 // 3 minutes
        });
      });
    });
    
    return tasks;
  }

  /**
   * Group related integrations for efficient setup
   */
  groupRelatedIntegrations(integrations) {
    // Group by max 3 integrations per sub-agent
    const groups = [];
    let currentGroup = [];
    
    integrations.forEach(integration => {
      currentGroup.push(integration);
      if (currentGroup.length >= 3) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }

  /**
   * Generate integration prompt
   */
  generateIntegrationPrompt(category, integrations, projectContext) {
    const systemsList = integrations.map(i => i.system).join(', ');
    
    const prompts = {
      authentication: `Set up authentication integrations for ${systemsList}.
                      Include OAuth flows, JWT configuration, session management, and security best practices.
                      Create integration modules with proper error handling and testing.`,
      
      payment: `Configure payment integrations for ${systemsList}.
                Implement secure payment flows, webhook handling, subscription management, and PCI compliance.
                Include error handling, retry logic, and transaction logging.`,
      
      messaging: `Set up messaging integrations for ${systemsList}.
                  Configure templates, delivery tracking, rate limiting, and error handling.
                  Implement queue-based processing for reliability.`,
      
      storage: `Configure storage integrations for ${systemsList}.
                Set up file upload/download, CDN integration, access control, and backup strategies.
                Include progress tracking and error recovery.`,
      
      ai: `Integrate AI services for ${systemsList}.
           Configure API clients, implement rate limiting, token management, and response caching.
           Include fallback strategies and error handling.`
    };
    
    return prompts[category] || `Set up integrations for ${systemsList} with proper configuration, error handling, and testing.`;
  }

  /**
   * Allocate token budgets for integration tasks
   */
  allocateIntegrationBudgets(tasks) {
    tasks.forEach(task => {
      const complexity = task.integrations.length > 2 ? 'complex' : 'standard';
      const budget = this.tokenManager.calculateBudget({
        taskType: 'integration',
        complexity,
        integrationCount: task.integrations.length,
        category: task.category
      });
      
      task.tokenBudget = budget;
      this.tokenManager.allocateTokens(task.subAgentId, budget);
    });
  }

  /**
   * Process integration results
   */
  async processIntegrationResults(results) {
    const integrations = {
      successful: [],
      failed: [],
      configurations: {},
      documentation: {},
      testSuites: {}
    };
    
    for (const result of results) {
      if (result.status === 'success') {
        const { category, implementations } = result.data;
        
        integrations.successful.push({
          category,
          systems: implementations.map(i => i.system)
        });
        
        integrations.configurations[category] = implementations.map(i => i.config);
        integrations.documentation[category] = implementations.map(i => i.docs);
        integrations.testSuites[category] = implementations.map(i => i.tests);
      } else {
        integrations.failed.push({
          category: result.data?.category || 'unknown',
          error: result.error
        });
      }
    }
    
    return integrations;
  }

  /**
   * Generate comprehensive integration guide
   */
  async generateIntegrationGuide(integrations, projectContext) {
    const guidePath = path.join(this.integrationBasePath, 'integration-guide.md');
    
    let content = `# Integration Guide: ${projectContext.name}

**Generated**: ${new Date().toISOString()}
**Total Integrations**: ${integrations.successful.reduce((sum, cat) => sum + cat.systems.length, 0)}

## Overview

This guide provides comprehensive documentation for all third-party integrations configured for the project.

## Configured Integrations

`;

    // List successful integrations
    integrations.successful.forEach(({ category, systems }) => {
      content += `### ${this.formatCategoryName(category)}
`;
      systems.forEach(system => {
        content += `* ${system}\n`;
      });
      content += '\n';
    });

    // Configuration details
    content += `## Configuration Details

`;
    
    Object.entries(integrations.configurations).forEach(([category, configs]) => {
      content += `### ${this.formatCategoryName(category)} Configuration

`;
      configs.forEach((config, index) => {
        content += `#### ${index + 1}. Configuration
\`\`\`javascript
${JSON.stringify(config, null, 2)}
\`\`\`

`;
      });
    });

    // Testing information
    content += `## Testing Integrations

Each integration includes comprehensive test suites. Run tests with:

\`\`\`bash
npm test -- --testPathPattern=integrations
\`\`\`

### Test Coverage by Category
`;

    Object.keys(integrations.testSuites).forEach(category => {
      content += `* **${this.formatCategoryName(category)}**: Unit tests, integration tests, mock implementations\n`;
    });

    // Environment variables
    content += `
## Environment Variables

Create a \`.env\` file with the following variables:

\`\`\`env
# Authentication
AUTH_SECRET=your-secret-key
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret

# Payment
STRIPE_API_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Add other integration variables as needed
\`\`\`

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Check API keys and OAuth redirect URLs
2. **Rate Limiting**: Implement exponential backoff and caching
3. **Network Timeouts**: Configure appropriate timeout values
4. **Webhook Failures**: Verify webhook URLs and implement retry logic

## Next Steps

1. Configure environment variables for each integration
2. Run integration tests to verify setup
3. Set up monitoring for each external service
4. Implement fallback strategies for service outages
`;

    await fs.writeFile(guidePath, content);
    
    // Update registry
    await this.registryManager.registerDocument(
      'integration-orchestrator',
      'integration-guide.md',
      guidePath,
      {
        integrationsCount: integrations.successful.length,
        timestamp: new Date().toISOString()
      }
    );
    
    return guidePath;
  }

  /**
   * Format category name
   */
  formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Execute parallel API documentation generation
   */
  async generateAPIDocumentation(apis, projectContext) {
    console.log(`\n📚 Generating API documentation in parallel...`);
    
    const apiTasks = apis.map((api, index) => ({
      id: `api-doc-${index}`,
      subAgentId: `api_documenter_${index + 1}`,
      description: `Document ${api.name} API`,
      api,
      projectContext,
      prompt: `Generate comprehensive API documentation for ${api.name}.
               Include endpoints, request/response formats, authentication, error codes, and examples.
               Follow OpenAPI 3.0 specification.`,
      tokenBudget: 8000,
      timeout: 120000
    }));
    
    const results = await this.orchestrator.launchSubAgents(apiTasks);
    
    // Consolidate API documentation
    const apiDocs = await this.consolidateAPIDocs(results);
    
    return apiDocs;
  }

  /**
   * Consolidate API documentation from sub-agents
   */
  async consolidateAPIDocs(results) {
    const docsPath = path.join(this.integrationBasePath, 'api-documentation');
    await fs.mkdir(docsPath, { recursive: true });
    
    const successful = [];
    
    for (const result of results) {
      if (result.status === 'success') {
        const { api, documentation } = result.data;
        const docPath = path.join(docsPath, `${api.name}-api.md`);
        
        await fs.writeFile(docPath, documentation);
        successful.push({
          api: api.name,
          path: docPath
        });
      }
    }
    
    return successful;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.orchestrator.cleanup();
    await this.registryManager.consolidateRegistries();
  }
}

module.exports = IntegrationOrchestrator;