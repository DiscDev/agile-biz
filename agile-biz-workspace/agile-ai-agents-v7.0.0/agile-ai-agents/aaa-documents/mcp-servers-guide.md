# MCP Servers Guide for AgileAiAgents

## Overview

Model Context Protocol (MCP) servers extend Claude Code's capabilities by connecting to external tools and data sources. This guide shows how AgileAiAgents agents leverage MCP servers for enhanced functionality, real-time data access, and seamless integrations.

## What is MCP?

MCP (Model Context Protocol) is an open protocol that allows Claude Code to:
- Connect to external services and databases
- Access real-time information beyond training data
- Execute specialized operations through dedicated servers
- Maintain secure, authenticated connections

## MCP Setup and Configuration

### Adding MCP Servers

```bash
# Add a server interactively
claude mcp add

# Add specific server
claude mcp add github
claude mcp add perplexity
claude mcp add postgres

# List configured servers
claude mcp list

# Remove a server
claude mcp remove <server-name>

# View server logs
claude mcp logs <server-name>
```

### Configuration Locations

MCP configurations are stored in:
- User level: `~/.claude/mcp-settings.json`
- Project level: `.claude/mcp-settings.json`
- Local overrides: `.claude/mcp-settings.local.json`

### Configuration Structure

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      },
      "transport": "stdio"
    },
    "perplexity": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-perplexity"],
      "env": {
        "PERPLEXITY_API_KEY": "pplx_your_key_here"
      },
      "transport": "stdio"
    }
  }
}
```

## Recommended MCP Servers by Agent Type

### 🔍 Research & Analysis Agents

#### Perplexity MCP
**Used by**: Research Agent, Market Analysis Agent, Competitive Analysis Agent
```bash
claude mcp add perplexity
```

**Features**:
- Real-time web searches with citations
- Current market data and trends
- Competitor information
- News and industry updates

**Agent Usage Example**:
```
Research Agent: @perplexity:search("AI task management market size 2024")
Returns: Current market data with sources
```

#### Firecrawl MCP
**Used by**: SEO Agent, Competitive Analysis Agent
```bash
claude mcp add firecrawl
```

**Features**:
- Website scraping and analysis
- SEO metrics extraction
- Competitor website analysis
- Content extraction

**Agent Usage Example**:
```
SEO Agent: @firecrawl:scrape("competitor.com/features")
Returns: Structured data from competitor's features page
```

### 💻 Development Agents

#### GitHub MCP
**Used by**: Coder Agent, DevOps Agent, Project Manager Agent
```bash
claude mcp add github
```

**Features**:
- Repository management
- Issue and PR creation
- Code reviews
- Workflow automation

**Agent Usage Example**:
```
Coder Agent: @github:create-pr(title: "Add authentication", branch: "feature/auth")
DevOps Agent: @github:create-issue(title: "Setup CI/CD pipeline")
```

**Slash Commands**:
```bash
/mcp__github__list_prs        # List open pull requests
/mcp__github__create_issue     # Create new issue
/mcp__github__view_issue 123   # View specific issue
```

#### PostgreSQL/Supabase MCP
**Used by**: DBA Agent, Data Engineer Agent
```bash
claude mcp add postgres
```

**Features**:
- Database schema exploration
- Query execution
- Performance analysis
- Migration management

**Agent Usage Example**:
```
DBA Agent: @postgres:schema("users")
Returns: Complete table structure and relationships
```

### 📝 Documentation & Design Agents

#### Notion MCP
**Used by**: Documentation Agent, PRD Agent, Project Manager Agent
```bash
claude mcp add notion
```

**Features**:
- Document creation and updates
- Database management
- Template usage
- Collaborative editing

**Agent Usage Example**:
```
Documentation Agent: @notion:create-page(title: "API Documentation", parent: "docs")
```

#### Figma MCP
**Used by**: UI/UX Agent, Design System Agent
```bash
claude mcp add figma
```

**Features**:
- Design file access
- Component extraction
- Design system sync
- Asset management

### 🧪 Testing & Quality Agents

#### Playwright MCP
**Used by**: Testing Agent, UI/UX Agent
```bash
claude mcp add playwright
```

**Features**:
- Browser automation
- E2E test execution
- Visual regression testing
- Performance testing

**Agent Usage Example**:
```
Testing Agent: @playwright:test("login-flow.spec.ts")
Returns: Test results with screenshots
```

#### BrowserStack MCP
**Used by**: Testing Agent, DevOps Agent
```bash
claude mcp add browserstack
```

**Features**:
- Cross-browser testing
- Mobile device testing
- Real device access
- Test result aggregation

### 🚀 Deployment & Monitoring Agents

#### AWS MCP
**Used by**: DevOps Agent, Infrastructure Agent
```bash
claude mcp add aws
```

**Features**:
- Infrastructure management
- Deployment automation
- Service monitoring
- Cost analysis

#### Datadog MCP
**Used by**: Logger Agent, Monitoring Agent
```bash
claude mcp add datadog
```

**Features**:
- Real-time monitoring
- Log aggregation
- Performance metrics
- Alert management

## Agent-Specific Integration Patterns

### Research Agent Pattern

```javascript
// Research Agent checking for MCP availability
async function performResearch(topic) {
  // Check if Perplexity MCP is available
  if (isMCPAvailable('perplexity')) {
    // Use real-time search
    const results = await mcp.perplexity.search(topic, {
      recency: 'month',
      sources: 'academic,industry'
    });
    return processRealTimeData(results);
  } else {
    // Fallback to LLM knowledge
    return performLLMResearch(topic);
  }
}
```

### Coder Agent Pattern

```javascript
// Coder Agent creating PR after implementation
async function completeFeature(featureName, files) {
  // Implementation complete, create PR
  if (isMCPAvailable('github')) {
    const pr = await mcp.github.createPR({
      title: `feat: ${featureName}`,
      body: generatePRDescription(files),
      branch: `feature/${featureName}`,
      reviewers: ['team-lead']
    });
    return pr.url;
  } else {
    // Manual PR creation instructions
    return generateManualPRInstructions(featureName, files);
  }
}
```

### Testing Agent Pattern

```javascript
// Testing Agent running cross-browser tests
async function runE2ETests(testSuite) {
  const servers = [];
  
  // Use Playwright for local testing
  if (isMCPAvailable('playwright')) {
    servers.push('playwright');
  }
  
  // Use BrowserStack for cross-browser
  if (isMCPAvailable('browserstack')) {
    servers.push('browserstack');
  }
  
  // Run tests on available platforms
  return Promise.all(
    servers.map(server => runTestsOnServer(server, testSuite))
  );
}
```

## MCP Server Authentication

### Environment Variables

Most MCP servers require authentication via environment variables:

```bash
# In .env file
GITHUB_TOKEN=ghp_your_github_token
PERPLEXITY_API_KEY=pplx_your_api_key
NOTION_API_KEY=secret_your_notion_key
FIGMA_ACCESS_TOKEN=figd_your_figma_token
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### OAuth Authentication

Some servers support OAuth:

```bash
# GitHub OAuth setup
claude mcp add github --auth oauth

# Opens browser for authentication
# Tokens stored securely in system keychain
```

### Connection Security

- All MCP connections use encrypted transport
- Credentials never sent to Claude's servers
- Local execution only
- Audit logs available for compliance

## Using MCP in Conversations

### Resource References

Use `@` to reference MCP resources:

```
# GitHub resources
@github:repo://anthropic/claude-code
@github:issue://123
@github:pr://456

# Database resources
@postgres:table://users
@postgres:query://get-active-users

# Web resources
@perplexity:search("latest React best practices")
@firecrawl:analyze("https://example.com")
```

### Slash Commands

MCP servers can provide slash commands:

```
# GitHub commands
/mcp__github__create_issue
/mcp__github__list_prs
/mcp__github__merge_pr

# Database commands
/mcp__postgres__show_tables
/mcp__postgres__explain_query

# Search commands
/mcp__perplexity__search
/mcp__perplexity__news
```

## Performance Optimization

### Connection Pooling

MCP servers maintain connection pools:

```json
{
  "servers": {
    "postgres": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://...",
        "POOL_SIZE": "10",
        "IDLE_TIMEOUT": "30000"
      }
    }
  }
}
```

### Caching Strategies

```json
{
  "servers": {
    "perplexity": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-perplexity"],
      "env": {
        "CACHE_TTL": "3600",
        "CACHE_SIZE": "100"
      }
    }
  }
}
```

### Rate Limiting

Respect API rate limits:

```javascript
// AgileAiAgents automatically handles rate limiting
const rateLimiter = {
  perplexity: { requests: 100, window: '1h' },
  github: { requests: 5000, window: '1h' },
  notion: { requests: 3, window: '1s' }
};
```

## Troubleshooting MCP Servers

### Server Not Starting

```bash
# Check logs
claude mcp logs <server-name>

# Common issues:
# - Missing API keys
# - Network connectivity
# - Incorrect configuration
```

### Authentication Failures

```bash
# Verify credentials
echo $GITHUB_TOKEN
echo $PERPLEXITY_API_KEY

# Re-authenticate
claude mcp remove github
claude mcp add github
```

### Connection Issues

```bash
# Test server directly
npx @anthropic/mcp-server-github --test

# Check firewall/proxy settings
# MCP servers need outbound HTTPS
```

### Performance Issues

```bash
# Monitor server resources
claude mcp stats <server-name>

# Restart server
claude mcp restart <server-name>
```

## Best Practices

### 1. Server Selection

**Choose servers based on agent needs**:
- Research agents: Perplexity, Firecrawl
- Development agents: GitHub, database servers
- Testing agents: Playwright, BrowserStack
- Documentation agents: Notion, Confluence

### 2. Fallback Strategies

**Always implement fallbacks**:
```javascript
// Good practice
if (isMCPAvailable('perplexity')) {
  return await searchWithPerplexity(query);
} else {
  return await searchWithLLM(query);
}
```

### 3. Error Handling

**Handle MCP errors gracefully**:
```javascript
try {
  const result = await mcp.github.createPR(prData);
  return result;
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    return waitAndRetry(prData);
  }
  // Fallback to manual instructions
  return manualPRInstructions(prData);
}
```

### 4. Security Considerations

- Store credentials in `.env`, never in code
- Use project-specific tokens with minimal permissions
- Rotate tokens regularly
- Monitor access logs

### 5. Performance Monitoring

```bash
# Regular health checks
claude mcp health

# Performance metrics
claude mcp stats --detailed

# Resource usage
claude mcp resources
```

## Advanced MCP Configurations

### Custom MCP Servers

Create project-specific MCP servers:

```javascript
// custom-mcp-server.js
const { MCPServer } = require('@anthropic/mcp-sdk');

class CustomProjectServer extends MCPServer {
  async handleRequest(request) {
    switch (request.method) {
      case 'project.metrics':
        return this.getProjectMetrics();
      case 'project.deploy':
        return this.deployProject();
    }
  }
}
```

### MCP Server Chaining

Chain multiple servers for complex operations:

```javascript
// Research + Database + Documentation
async function comprehensiveAnalysis(topic) {
  // 1. Search for current info
  const research = await mcp.perplexity.search(topic);
  
  // 2. Store in database
  await mcp.postgres.insert('research', research);
  
  // 3. Create documentation
  await mcp.notion.createPage({
    title: `Research: ${topic}`,
    content: research
  });
}
```

### Conditional Server Loading

Load servers based on project type:

```javascript
// In CLAUDE.md
const projectType = 'web-app';

const requiredServers = {
  'web-app': ['github', 'postgres', 'playwright'],
  'mobile-app': ['github', 'firebase', 'browserstack'],
  'api': ['github', 'postgres', 'postman'],
  'ml-project': ['github', 'mlflow', 'wandb']
};

// Load only needed servers
requiredServers[projectType].forEach(server => {
  loadMCPServer(server);
});
```

## Summary

MCP servers significantly enhance AgileAiAgents capabilities by:

1. **Providing real-time data** - Current information beyond training cutoff
2. **Enabling integrations** - Direct connections to tools teams already use
3. **Automating workflows** - From research to deployment
4. **Improving accuracy** - Verified data from authoritative sources
5. **Accelerating development** - Direct operations instead of instructions

By configuring appropriate MCP servers for your project type, AgileAiAgents agents can work more effectively, access current information, and integrate seamlessly with your existing tool stack.