---
title: "Context7 MCP Integration - Shared Tool"
type: "shared-tool"
keywords: ["context7", "mcp", "documentation", "library", "api", "framework", "current", "latest"]
agents: ["developer", "devops", "testing", "dba", "api"]
token_count: 926
---

# Context7 MCP Integration - Shared Tool

## When to Load This Context
- **Keywords**: context7, mcp, documentation, library, api, framework, current, latest
- **Patterns**: "get documentation", "current API", "latest syntax", "framework reference"
- **Shared by**: Developer, Testing, DevOps, DBA, API, Research, ML, LLM agents

## Context7 MCP Server Overview

**Context7 MCP Server**: Up-to-date documentation and code examples
- **Setup Guide**: See `project-mcps/context7-mcp-setup.md` for configuration  
- **Capabilities**: Real-time library documentation, version-specific APIs, current best practices
- **Tools Available**: `resolve-library-id`, `get-library-docs`
- **Benefits**: Eliminates outdated information, prevents API hallucinations, current framework patterns

## Agent-Specific Usage

### For Developer Agents
- Get implementation patterns and syntax
- Find current API documentation for frameworks
- Access latest best practices and code examples
- Verify breaking changes between versions

### For Testing Agents
- Get testing framework documentation
- Find assertion patterns and test configurations
- Access current testing best practices
- Verify test runner configurations

### For DevOps Agents
- Get deployment tool documentation
- Find infrastructure configuration patterns
- Access current DevOps best practices
- Verify container and orchestration configs

### For DBA Agents
- Get database migration documentation
- Find query optimization patterns
- Access current database best practices
- Verify ORM and database driver configs

### For API Agents
- Get API framework documentation
- Find endpoint and middleware patterns
- Access current API design best practices
- Verify authentication and validation configs

## Core MCP Tools

### resolve-library-id
**Purpose**: Convert package names to Context7-compatible library IDs
**Usage**: Always call this first before `get-library-docs`

```javascript
// Examples of library resolution
await mcp.resolve_library_id("react");           // → "/facebook/react"
await mcp.resolve_library_id("express");         // → "/expressjs/express"  
await mcp.resolve_library_id("jest");            // → "/facebook/jest"
await mcp.resolve_library_id("docker");          // → "/docker/cli"
```

### get-library-docs
**Purpose**: Retrieve current documentation for specific topics
**Parameters**: 
- `context7CompatibleLibraryID`: Exact ID from resolve-library-id
- `tokens`: Maximum tokens to retrieve (default: 10000)
- `topic`: Specific topic to focus on (optional)

```javascript
// Get React hooks documentation
await mcp.get_library_docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "hooks",
  tokens: 5000
});

// Get Express middleware patterns
await mcp.get_library_docs({
  context7CompatibleLibraryID: "/expressjs/express", 
  topic: "middleware",
  tokens: 3000
});

// Get Jest testing patterns
await mcp.get_library_docs({
  context7CompatibleLibraryID: "/facebook/jest",
  topic: "testing patterns",
  tokens: 4000
});
```

## Common Workflows

### Documentation-Driven Development
```
1. Identify required framework/library
2. Use resolve-library-id to get Context7 ID
3. Use get-library-docs with specific topic
4. Implement using current, accurate patterns
5. Avoid deprecated or outdated approaches
```

### Version-Specific Implementation
```
1. Check project's package.json for exact versions
2. Get documentation for exact version used
3. Handle breaking changes correctly
4. Use current migration guides for upgrades
```

### Problem-Solving Workflow
```
1. Get specific documentation for implementation challenges
2. Access troubleshooting guides and solutions
3. Find current workarounds for known issues
4. Get performance optimization patterns
```

## Best Practices

### Token Management
- Use specific `topic` parameters to focus documentation
- Start with smaller token limits (3000-5000) for focused queries
- Increase tokens only for comprehensive overviews

### Effective Topics
- **Specific**: "hooks", "middleware", "authentication", "testing"
- **Avoid Generic**: "documentation", "overview", "getting started"
- **Implementation-Focused**: "deployment", "configuration", "optimization"

### Error Handling
```javascript
try {
  const libraryId = await mcp.resolve_library_id(packageName);
  if (!libraryId) {
    console.warn(`Could not resolve library: ${packageName}`);
    return null;
  }
  
  const docs = await mcp.get_library_docs({
    context7CompatibleLibraryID: libraryId,
    topic: specificTopic,
    tokens: 5000
  });
  
  return docs;
} catch (error) {
  console.error('Context7 MCP error:', error);
  // Fallback to manual documentation lookup
  return null;
}
```

## Setup Requirements

### Prerequisites
- Context7 MCP server must be configured in Claude Code
- Network access to Context7 services
- Valid API credentials (if required)

### Configuration File
Location: `project-mcps/context7-mcp-setup.md`
- Contains step-by-step setup instructions
- Includes authentication configuration
- Provides troubleshooting guidelines

### Verification
Test the integration with a simple query:
```javascript
// Test basic functionality
const reactId = await mcp.resolve_library_id("react");
console.log("React library ID:", reactId);

const docs = await mcp.get_library_docs({
  context7CompatibleLibraryID: reactId,
  topic: "useState",
  tokens: 1000
});
console.log("Documentation retrieved:", !!docs);
```

## Troubleshooting

### Common Issues
1. **Library not found**: Use exact package names, check spelling
2. **No documentation returned**: Try broader topics or increase token limit
3. **Outdated information**: Verify you're using latest Context7 server version
4. **Rate limiting**: Implement retry logic with exponential backoff

### Support
- Check Context7 service status
- Verify MCP server configuration
- Review network connectivity
- Consult project-specific setup documentation