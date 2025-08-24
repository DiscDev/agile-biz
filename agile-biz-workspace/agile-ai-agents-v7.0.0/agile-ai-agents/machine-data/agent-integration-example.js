#!/usr/bin/env node

/**
 * Agent Integration Example for Document Router
 * 
 * This file shows how all 38 agents should integrate with the Document Router
 * to ensure proper document placement using the 4-tier routing strategy
 */

const fs = require('fs').promises;
const path = require('path');

// Import Document Router
const DocumentRouter = require('./document-router');

/**
 * Example: Research Agent Integration
 */
class ResearchAgentExample {
  constructor() {
    this.agentName = 'research_agent';
    this.projectRoot = path.join(__dirname, '..');
    this.router = new DocumentRouter(this.projectRoot);
  }

  /**
   * BEFORE: Old way with hardcoded paths
   */
  async createDocumentOldWay(content, fileName) {
    // ❌ BAD: Hardcoded path
    const documentPath = 'project-documents/business-strategy/research/' + fileName;
    await fs.writeFile(documentPath, content);
    console.log(`Document created at: ${documentPath}`);
  }

  /**
   * AFTER: New way with Document Router
   */
  async createDocumentNewWay(content, fileName, metadata = {}) {
    // ✅ GOOD: Use Document Router for dynamic routing
    
    // Step 1: Prepare document information
    const document = {
      fileName: fileName,
      agent: this.agentName,
      content: content,
      category: metadata.category || this.detectCategory(fileName),
      sprint: metadata.sprint || this.getCurrentSprint(),
      client: metadata.client,
      metadata: metadata
    };

    // Step 2: Route the document
    const routedPath = await this.router.route(document);
    
    // Step 3: Ensure directory exists
    const fullPath = path.join(this.projectRoot, routedPath);
    const directory = path.dirname(fullPath);
    await fs.mkdir(directory, { recursive: true });
    
    // Step 4: Write the document
    await fs.writeFile(fullPath, content);
    
    console.log(`✅ Document routed to: ${routedPath}`);
    
    // Step 5: Return the path for reference
    return routedPath;
  }

  /**
   * Helper: Detect category from filename
   */
  detectCategory(fileName) {
    if (fileName.includes('market')) return 'market';
    if (fileName.includes('competitive')) return 'competitive';
    if (fileName.includes('customer')) return 'customer';
    if (fileName.includes('financial')) return 'financial';
    return 'research';
  }

  /**
   * Helper: Get current sprint
   */
  getCurrentSprint() {
    try {
      const statePath = path.join(this.projectRoot, 'project-state/workflow-state.json');
      const state = JSON.parse(require('fs').readFileSync(statePath, 'utf8'));
      return state.current_sprint || 'sprint-001';
    } catch {
      return 'sprint-001';
    }
  }
}

/**
 * Example: Marketing Agent Integration
 */
class MarketingAgentExample {
  constructor() {
    this.agentName = 'marketing_agent';
    this.projectRoot = path.join(__dirname, '..');
    this.router = new DocumentRouter(this.projectRoot);
  }

  async createMarketingDocument(content, fileName, campaignType) {
    // Prepare document with marketing-specific metadata
    const document = {
      fileName: fileName,
      agent: this.agentName,
      content: content,
      category: 'marketing',
      metadata: {
        campaignType: campaignType,
        targetAudience: this.extractTargetAudience(content),
        channels: this.extractChannels(content)
      }
    };

    // Route and create
    const routedPath = await this.router.route(document);
    const fullPath = path.join(this.projectRoot, routedPath);
    
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    
    return routedPath;
  }

  extractTargetAudience(content) {
    // Extract target audience from content
    const match = content.match(/target audience[:\s]+([^\n]+)/i);
    return match ? match[1].trim() : 'general';
  }

  extractChannels(content) {
    // Extract marketing channels
    const channels = [];
    if (content.includes('social media')) channels.push('social');
    if (content.includes('email')) channels.push('email');
    if (content.includes('ppc') || content.includes('paid')) channels.push('ppc');
    if (content.includes('seo')) channels.push('seo');
    return channels;
  }
}

/**
 * Example: Coder Agent Integration
 */
class CoderAgentExample {
  constructor() {
    this.agentName = 'coder_agent';
    this.projectRoot = path.join(__dirname, '..');
    this.router = new DocumentRouter(this.projectRoot);
  }

  async createTechnicalDocument(content, fileName, docType) {
    // Technical document with implementation details
    const document = {
      fileName: fileName,
      agent: this.agentName,
      content: content,
      category: 'implementation',
      metadata: {
        documentType: docType, // 'api', 'architecture', 'design', etc.
        language: this.detectLanguage(content),
        framework: this.detectFramework(content)
      }
    };

    const routedPath = await this.router.route(document);
    const fullPath = path.join(this.projectRoot, routedPath);
    
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    
    return routedPath;
  }

  detectLanguage(content) {
    if (content.includes('javascript') || content.includes('node')) return 'javascript';
    if (content.includes('python')) return 'python';
    if (content.includes('java')) return 'java';
    return 'unknown';
  }

  detectFramework(content) {
    if (content.includes('react')) return 'react';
    if (content.includes('vue')) return 'vue';
    if (content.includes('express')) return 'express';
    if (content.includes('django')) return 'django';
    return 'none';
  }
}

/**
 * Example: Dynamic Folder Creation (Tier 4)
 */
class DynamicFolderExample {
  constructor() {
    this.agentName = 'api_agent';
    this.projectRoot = path.join(__dirname, '..');
    this.router = new DocumentRouter(this.projectRoot);
  }

  async createClientSpecificDocument(content, client) {
    // This will trigger Tier 4 dynamic folder creation
    const fileName = `${client}-api-requirements.md`;
    
    const document = {
      fileName: fileName,
      agent: this.agentName,
      content: content,
      client: client, // This helps with semantic folder naming
      metadata: {
        documentType: 'requirements',
        client: client,
        apis: this.extractAPIs(content)
      }
    };

    // Router will create a new folder like "acme-corp-requirements"
    const routedPath = await this.router.route(document);
    const fullPath = path.join(this.projectRoot, routedPath);
    
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    
    console.log(`✨ Dynamic folder created for client: ${client}`);
    console.log(`📁 Document at: ${routedPath}`);
    
    return routedPath;
  }

  extractAPIs(content) {
    const apis = [];
    if (content.includes('REST')) apis.push('rest');
    if (content.includes('GraphQL')) apis.push('graphql');
    if (content.includes('WebSocket')) apis.push('websocket');
    return apis;
  }
}

/**
 * Example: Batch Document Creation
 */
class BatchDocumentExample {
  constructor() {
    this.agentName = 'analysis_agent';
    this.projectRoot = path.join(__dirname, '..');
    this.router = new DocumentRouter(this.projectRoot);
  }

  async createMultipleDocuments(documents) {
    const results = [];
    
    for (const doc of documents) {
      const document = {
        fileName: doc.fileName,
        agent: this.agentName,
        content: doc.content,
        category: doc.category,
        metadata: doc.metadata || {}
      };
      
      const routedPath = await this.router.route(document);
      const fullPath = path.join(this.projectRoot, routedPath);
      
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, doc.content);
      
      results.push({
        fileName: doc.fileName,
        path: routedPath,
        tier: this.router.routingHistory.slice(-1)[0]?.result
      });
    }
    
    return results;
  }
}

/**
 * Integration Guidelines for All 38 Agents
 */
const INTEGRATION_GUIDELINES = {
  required_steps: [
    "1. Import DocumentRouter at the top of the agent file",
    "2. Initialize router in agent constructor",
    "3. Replace all hardcoded paths with router.route() calls",
    "4. Pass agent name in document object",
    "5. Include content for better routing accuracy",
    "6. Add relevant metadata for learning"
  ],
  
  agent_specific: {
    // Business Strategy Agents
    research_agent: "Include market category and research type",
    marketing_agent: "Include campaign type and channels",
    finance_agent: "Include financial period and metrics",
    analysis_agent: "Include analysis type and scope",
    business_documents_agent: "Include document purpose and audience",
    customer_lifecycle_agent: "Include lifecycle stage",
    revenue_optimization_agent: "Include revenue model type",
    market_validation_agent: "Include validation method",
    vc_report_agent: "Include funding round and investors",
    
    // Implementation Agents
    coder_agent: "Include language and framework",
    testing_agent: "Include test type and coverage",
    ui_ux_agent: "Include design system and components",
    security_agent: "Include threat model and compliance",
    prd_agent: "Include feature priority and stakeholders",
    api_agent: "Include API type and endpoints",
    llm_agent: "Include model and token usage",
    mcp_agent: "Include MCP server type",
    ml_agent: "Include model type and dataset",
    dba_agent: "Include database type and schema",
    data_engineer_agent: "Include pipeline and data sources",
    
    // Operations Agents
    devops_agent: "Include environment and deployment type",
    analytics_agent: "Include metrics and dashboards",
    seo_agent: "Include keywords and search engines",
    ppc_media_buyer_agent: "Include platforms and budget",
    social_media_agent: "Include platforms and content type",
    email_marketing_agent: "Include campaign and segments",
    optimization_agent: "Include optimization targets",
    logger_agent: "Include log level and sources",
    
    // Orchestration Agents
    scrum_master_agent: "Include sprint and ceremonies",
    project_manager_agent: "Include milestones and dependencies",
    documentator_agent: "Include documentation type",
    document_manager_agent: "Include document category",
    project_state_manager_agent: "Include state type and checkpoint",
    project_analyzer_agent: "Include analysis scope",
    learning_analysis_agent: "Include learning patterns",
    project_structure_agent: "Include structure type"
  },
  
  benefits: [
    "✅ Automatic correct folder placement",
    "✅ Dynamic folder creation when needed",
    "✅ Sprint-aware organization",
    "✅ Learning from patterns",
    "✅ Consolidation suggestions",
    "✅ Freshness tracking",
    "✅ No more hardcoded paths"
  ]
};

// Export examples for testing
module.exports = {
  ResearchAgentExample,
  MarketingAgentExample,
  CoderAgentExample,
  DynamicFolderExample,
  BatchDocumentExample,
  INTEGRATION_GUIDELINES
};

// CLI Testing
if (require.main === module) {
  (async () => {
    console.log('🧪 Testing Agent Integration Examples\n');
    
    // Test Research Agent
    console.log('1. Testing Research Agent:');
    const researchAgent = new ResearchAgentExample();
    const marketPath = await researchAgent.createDocumentNewWay(
      '# Market Analysis\nThis is a test market analysis document.',
      'test-market-analysis.md',
      { category: 'market' }
    );
    console.log(`   Created: ${marketPath}\n`);
    
    // Test Marketing Agent
    console.log('2. Testing Marketing Agent:');
    const marketingAgent = new MarketingAgentExample();
    const campaignPath = await marketingAgent.createMarketingDocument(
      '# Email Campaign\nTarget audience: developers\nChannels: email, social media',
      'test-email-campaign.md',
      'email'
    );
    console.log(`   Created: ${campaignPath}\n`);
    
    // Test Coder Agent
    console.log('3. Testing Coder Agent:');
    const coderAgent = new CoderAgentExample();
    const apiPath = await coderAgent.createTechnicalDocument(
      '# API Design\nFramework: Express\nLanguage: JavaScript',
      'test-api-design.md',
      'api'
    );
    console.log(`   Created: ${apiPath}\n`);
    
    // Test Dynamic Folder Creation
    console.log('4. Testing Dynamic Folder Creation:');
    const dynamicAgent = new DynamicFolderExample();
    const clientPath = await dynamicAgent.createClientSpecificDocument(
      '# ACME Corp API Requirements\nREST API for customer management',
      'acme-corp'
    );
    console.log(`   Created: ${clientPath}\n`);
    
    console.log('✅ All integration tests completed!');
    console.log('\n📋 Integration Guidelines:');
    console.log(JSON.stringify(INTEGRATION_GUIDELINES, null, 2));
  })();
}