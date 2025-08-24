# Context7 MCP Server Setup Guide

## Overview

The Context7 MCP (Model Context Protocol) server provides the Coder and DevOps agents with access to up-to-date, version-specific documentation and code examples directly within their prompts. This integration eliminates outdated information and prevents API hallucinations by fetching current documentation for libraries, frameworks, and tools in real-time.

## What This Enables

With Context7 MCP configured, agents can:
- 📚 **Up-to-date Documentation** - Access current, version-specific library documentation
- 🔧 **Accurate Code Examples** - Get real, tested code examples instead of hallucinated APIs
- 🌐 **Multi-framework Support** - Access docs for JavaScript, Python, Go, Rust, and more
- ⚡ **Real-time Retrieval** - Fetch documentation during development workflow
- 🎯 **Focused Documentation** - Get specific documentation sections by topic
- 📊 **Token Control** - Configure documentation length to fit context windows
- 🚫 **No Hallucinations** - Eliminate outdated or incorrect API information
- 🔍 **Smart Library Resolution** - Automatically find correct library IDs from names
- 📖 **Version-Specific** - Get documentation for exact library versions
- 🛠️ **Development Integration** - Seamlessly integrate with coding workflows

## Prerequisites

1. **Claude Desktop**: MCP servers work with Claude Desktop app
2. **Internet Connection**: Required for real-time documentation retrieval
3. **Development Knowledge**: Understanding of library/framework identification
4. **Node.js**: For MCP server installation and execution

## Step 1: Install Context7 MCP Server

### Option A: NPX Installation (Recommended)
```bash
# Run directly with NPX
npx @upstash/context7-mcp
```

### Option B: Global Installation
```bash
# Install globally with npm
npm install -g @upstash/context7-mcp
```

### Option C: Local Project Installation
```bash
# Install in project directory
npm install @upstash/context7-mcp
```

## Step 2: Configure Claude Desktop

Add Context7 MCP to your Claude Desktop configuration:

### NPX Configuration (Recommended)
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["@upstash/context7-mcp"]
    }
  }
}
```

### Global Installation Configuration
```json
{
  "mcpServers": {
    "context7": {
      "command": "context7-mcp"
    }
  }
}
```

### Local Installation Configuration
```json
{
  "mcpServers": {
    "context7": {
      "command": "node",
      "args": ["./node_modules/@upstash/context7-mcp/dist/index.js"]
    }
  }
}
```

## Step 3: Update AgileAiAgents .env File

Add Context7 configuration to the `.env` file:

```bash
# Context7 MCP (Coder, DevOps Agents)
CONTEXT7_MCP_ENABLED=true
# Optional: Default settings
CONTEXT7_DEFAULT_TOKENS=10000
CONTEXT7_AUTO_RESOLVE=true  # Automatically resolve library IDs
CONTEXT7_CACHE_DOCS=false   # Cache documentation locally
```

## Available MCP Tools

### Library Resolution Tool

#### **resolve-library-id**
Find Context7-compatible library ID from library name
```
Purpose: Resolves a package/product name to a Context7-compatible library ID
Parameters:
- libraryName (string, required): Library name to search for
Matching Criteria:
- Name similarity
- Description relevance  
- Documentation coverage
- Trust score
Returns: Context7-compatible library ID
Example: "react" → "facebook/react" or "facebook/react/18.2.0"
```

### Documentation Retrieval Tool

#### **get-library-docs**
Fetch up-to-date documentation for a library
```
Purpose: Fetches current, version-specific documentation
Parameters:
- context7CompatibleLibraryID (string, required): Library ID from resolve-library-id
- topic (string, optional): Focus on specific documentation area
- tokens (number, optional): Maximum documentation tokens (default: 10,000)
Supported Formats:
- /org/project (latest version)
- /org/project/version (specific version)
Example: "facebook/react/18.2.0" with topic "hooks"
```

## Library ID Formats

### Standard Formats
```
# Latest version
/org/project
Examples: facebook/react, microsoft/typescript, nodejs/node

# Specific version
/org/project/version
Examples: facebook/react/18.2.0, nodejs/node/20.10.0

# Framework examples
next.js: vercel/next.js
express: expressjs/express
vue: vuejs/vue
angular: angular/angular
```

### Popular Libraries and IDs
```
# Frontend Frameworks
React: facebook/react
Vue.js: vuejs/vue
Angular: angular/angular
Svelte: sveltejs/svelte

# Backend Frameworks
Express.js: expressjs/express
Next.js: vercel/next.js
Nest.js: nestjs/nest
Fastify: fastify/fastify

# Build Tools
Webpack: webpack/webpack
Vite: vitejs/vite
Rollup: rollup/rollup
Parcel: parcel-bundler/parcel

# Testing Frameworks
Jest: jestjs/jest
Mocha: mochajs/mocha
Cypress: cypress-io/cypress
Playwright: microsoft/playwright

# Database & ORM
Prisma: prisma/prisma
TypeORM: typeorm/typeorm
Mongoose: Automattic/mongoose
Sequelize: sequelize/sequelize

# Cloud & DevOps
AWS SDK: aws/aws-sdk-js
Docker: docker/docker
Kubernetes: kubernetes/kubernetes
Terraform: hashicorp/terraform
```

## Agent Workflows with Context7 MCP

### For Coder Agent - Development Documentation

1. **Framework Documentation Access**
   ```
   Workflow:
   1. Use resolve-library-id to find React library ID
   2. Use get-library-docs with topic "hooks" for specific documentation
   3. Get current API patterns and best practices
   4. Implement features using up-to-date examples
   ```

2. **API Integration Development**
   ```
   Workflow:
   1. Resolve library ID for AWS SDK or specific service
   2. Get documentation for specific service (e.g., S3, Lambda)
   3. Access current authentication and configuration patterns
   4. Implement integration with correct, current APIs
   ```

3. **New Technology Adoption**
   ```
   Workflow:
   1. Search for emerging framework or library
   2. Get latest documentation and getting started guides
   3. Review current best practices and patterns
   4. Implement using most recent stable APIs
   ```

### For DevOps Agent - Infrastructure Documentation

1. **Infrastructure as Code**
   ```
   Workflow:
   1. Resolve Terraform or CloudFormation documentation
   2. Get current resource syntax and configuration
   3. Access latest provider documentation
   4. Implement infrastructure with current patterns
   ```

2. **Container Orchestration**
   ```
   Workflow:
   1. Get current Kubernetes or Docker documentation
   2. Access latest configuration syntax
   3. Review current security and best practices
   4. Deploy using up-to-date manifests and configs
   ```

3. **CI/CD Pipeline Configuration**
   ```
   Workflow:
   1. Access GitHub Actions, GitLab CI, or Jenkins docs
   2. Get current workflow syntax and available actions
   3. Review latest security and optimization practices
   4. Configure pipelines with current best practices
   ```

## Example Usage Patterns

### Basic Library Documentation
```javascript
// Step 1: Resolve library ID
resolve-library-id({
  "libraryName": "react"
})
// Returns: "facebook/react" or specific version

// Step 2: Get documentation
get-library-docs({
  "context7CompatibleLibraryID": "facebook/react/18.2.0",
  "topic": "hooks",
  "tokens": 5000
})
// Returns: Current React hooks documentation
```

### Specific Version Documentation
```javascript
// Get documentation for specific version
get-library-docs({
  "context7CompatibleLibraryID": "nodejs/node/20.10.0",
  "topic": "fs promises",
  "tokens": 3000
})
// Returns: Node.js 20.10.0 filesystem promises documentation
```

### Framework-Specific Topics
```javascript
// Next.js App Router documentation
resolve-library-id({"libraryName": "next.js"})
get-library-docs({
  "context7CompatibleLibraryID": "vercel/next.js/14.0.0",
  "topic": "app router",
  "tokens": 8000
})

// Express.js middleware documentation  
resolve-library-id({"libraryName": "express"})
get-library-docs({
  "context7CompatibleLibraryID": "expressjs/express/4.18.0",
  "topic": "middleware",
  "tokens": 4000
})
```

### DevOps Tools Documentation
```javascript
// Terraform AWS provider
resolve-library-id({"libraryName": "terraform aws"})
get-library-docs({
  "context7CompatibleLibraryID": "hashicorp/terraform-provider-aws",
  "topic": "ec2 instances",
  "tokens": 6000
})

// Docker Compose
resolve-library-id({"libraryName": "docker compose"})
get-library-docs({
  "context7CompatibleLibraryID": "docker/compose",
  "topic": "services configuration",
  "tokens": 4000
})
```

## Best Practices

### Efficient Documentation Retrieval
1. **Always Resolve First**: Use resolve-library-id before get-library-docs
2. **Specific Topics**: Use topic parameter to focus documentation
3. **Token Management**: Set appropriate token limits for context
4. **Version Specification**: Use specific versions for reproducible builds
5. **Cache Results**: Cache frequently accessed documentation locally

### Query Optimization
1. **Specific Topics**: "authentication", "configuration", "api reference"
2. **Use Cases**: "getting started", "best practices", "migration guide"
3. **Component Focus**: "components", "hooks", "middleware", "plugins"
4. **Feature Areas**: "security", "performance", "testing", "deployment"

### Development Workflow Integration
1. **Before Implementation**: Get current API documentation
2. **During Development**: Access specific feature documentation
3. **Code Review**: Verify against current best practices
4. **Updates**: Check for breaking changes in new versions
5. **Migration**: Get migration guides for version upgrades

## Example Agent Prompts

### React Development with Current Hooks
```
Acting as the Coder Agent, use Context7 MCP to:
1. Get current React documentation for hooks
2. Find best practices for useState and useEffect
3. Implement a component using current patterns
4. Ensure all APIs are from the latest stable version
```

### AWS Infrastructure Setup
```
Acting as the DevOps Agent, use Context7 MCP to:
1. Get current Terraform AWS provider documentation
2. Find best practices for EC2 and RDS configuration
3. Get current security group and IAM patterns
4. Implement infrastructure using latest Terraform syntax
```

### Next.js App Router Implementation
```
Acting as the Coder Agent, use Context7 MCP to:
1. Get Next.js 14 App Router documentation
2. Find current routing and layout patterns
3. Get server actions and data fetching examples
4. Implement using most recent stable features
```

### Kubernetes Deployment Configuration
```
Acting as the DevOps Agent, use Context7 MCP to:
1. Get current Kubernetes deployment documentation
2. Find latest security and resource management practices
3. Get current ingress and service configuration patterns
4. Deploy using up-to-date manifest syntax
```

## Troubleshooting

### Library Not Found
- Try different variations of library name
- Use full organization/project format if known
- Check if library has been renamed or moved
- Verify spelling and use official library name

### Documentation Not Available
- Library might not be supported by Context7
- Try requesting specific version that exists
- Use alternative library names or IDs
- Check if documentation is publicly available

### Token Limit Issues
- Reduce token limit for shorter responses
- Use more specific topics to focus content
- Split large requests into multiple smaller ones
- Optimize topic queries for relevant sections

### Outdated Information
- Verify library ID includes correct version
- Use latest version if available
- Check if library has breaking changes
- Cross-reference with official documentation

## Integration with AgileAiAgents

Once configured, agents will automatically:

### Coder Agent
1. **Access current APIs** for all development libraries
2. **Get real-time examples** instead of potentially outdated patterns
3. **Verify syntax** against current library versions
4. **Implement features** using up-to-date best practices
5. **Handle breaking changes** by accessing migration guides

### DevOps Agent
1. **Configure infrastructure** using current tool syntax
2. **Access latest security** and deployment practices
3. **Get current configuration** patterns for all tools
4. **Implement CI/CD** with up-to-date workflow syntax
5. **Deploy applications** using current containerization patterns

Results are integrated into development workflow:
```
agile-ai-agents/project-documents/
├── 13-implementation/
│   ├── current-api-documentation/
│   ├── framework-best-practices/
│   └── version-specific-examples/
└── 15-deployment/
    ├── infrastructure-docs/
    ├── deployment-patterns/
    └── configuration-examples/
```

## Supported Ecosystems

### Frontend Development
- React, Vue, Angular, Svelte
- Next.js, Nuxt.js, SvelteKit
- Build tools: Webpack, Vite, Rollup
- Testing: Jest, Cypress, Playwright

### Backend Development
- Node.js, Express, Fastify, Nest.js
- Python: Django, Flask, FastAPI
- Database: Prisma, TypeORM, Mongoose
- Authentication: Auth0, Firebase Auth

### DevOps & Infrastructure
- Docker, Kubernetes, Helm
- Terraform, CloudFormation, Pulumi
- CI/CD: GitHub Actions, GitLab CI
- Monitoring: Prometheus, Grafana

### Cloud Services
- AWS SDK, Azure SDK, Google Cloud SDK
- Serverless frameworks
- Infrastructure as Code tools
- Container orchestration platforms

## Security Considerations

- **Public Documentation Only**: Context7 accesses only public documentation
- **No Authentication Required**: No API keys or credentials needed
- **Read-Only Access**: Tool only retrieves documentation, doesn't modify
- **Internet Dependency**: Requires internet connection for documentation retrieval
- **Rate Limiting**: Implement reasonable delays between requests
- **Version Control**: Document which library versions are being used

## Additional Resources

- **Context7 Documentation**: https://smithery.ai/server/@upstash/context7-mcp
- **MCP Specification**: https://modelcontextprotocol.io/
- **Upstash GitHub**: https://github.com/upstash/
- **Community Support**: GitHub issues and discussions

This integration ensures AgileAiAgents always work with current, accurate documentation and eliminate outdated information from development workflows!