# JSON Reference Resolution Guide

## Overview

This guide explains how to use the enhanced JSON reference system that enables progressive context loading with 70-85% token reduction while maintaining access to detailed information when needed.

## Reference Format

References follow a consistent format:
```
agile-ai-agents/path/to/file.md#section-anchor
```

Components:
- **Base Path**: Always starts with `agile-ai-agents/`
- **File Path**: Path to the markdown file
- **Anchor**: Section identifier (lowercase, hyphenated)

## Using References in Agent Code

### Loading Agent JSON with References

```javascript
const { createContextLoader } = require('./machine-data/agent-context-loader');

// Create loader for your agent
const contextLoader = createContextLoader('coder_agent');

// Load the enhanced JSON
const agentJson = await contextLoader.loadAgentData('testing_agent');

// Access available references
console.log(agentJson.data.workflows.available);
// Output: [
//   { name: "Comprehensive Feature Testing", tokens: 1800, md_reference: "agile-ai-agents/ai-agents/testing_agent.md#comprehensive-feature-testing" },
//   { name: "Regression Testing", tokens: 1200, md_reference: "agile-ai-agents/ai-agents/testing_agent.md#regression-testing" }
// ]
```

### Progressive Context Loading

Load context based on your needs:

```javascript
// Minimal context (fastest, ~500-1000 tokens)
const minimalContext = await contextLoader.loadProgressiveContext(agentJson.data, 'minimal');
// Contains: meta, summary, core_responsibilities.summary

// Standard context (balanced, ~1500-3000 tokens)
const standardContext = await contextLoader.loadProgressiveContext(agentJson.data, 'standard');
// Contains: minimal + workflows.available + coordination

// Detailed context (comprehensive, ~5000-8000 tokens)
const detailedContext = await contextLoader.loadProgressiveContext(agentJson.data, 'detailed');
// Contains: standard + reference_documentation + workflow references
```

### Loading Specific Sections via Reference

When you need detailed information about a specific workflow or section:

```javascript
// Load a specific workflow
const workflowDetails = await contextLoader.loadSectionByReference(
  'agile-ai-agents/ai-agents/testing_agent.md#regression-testing-workflow'
);

if (workflowDetails.success) {
  console.log(`Loaded ${workflowDetails.tokens} tokens for ${workflowDetails.heading}`);
  console.log(workflowDetails.content);
}
```

### Batch Loading Multiple References

Load multiple sections efficiently:

```javascript
// Get all workflow references for an agent
const workflowRefs = agentJson.data.workflows.available.map(w => w.md_reference);

// Load all workflows
const workflowDetails = await Promise.all(
  workflowRefs.map(ref => contextLoader.loadSectionByReference(ref))
);

// Calculate total tokens
const totalTokens = workflowDetails.reduce((sum, w) => sum + (w.tokens || 0), 0);
```

## Token Optimization Strategies

### Start Small, Expand as Needed

```javascript
// Initial load - minimal context
let context = await contextLoader.loadProgressiveContext(agentJson.data, 'minimal');
let tokensUsed = agentJson.data.meta.estimated_tokens;

// User asks about testing workflows
if (userQuery.includes('testing')) {
  const testingWorkflow = await contextLoader.loadSectionByReference(
    agentJson.data.workflows.available.find(w => w.name.includes('Testing')).md_reference
  );
  tokensUsed += testingWorkflow.tokens;
}
```

### Cache Frequently Used Sections

The context loader automatically caches sections for 5 minutes:

```javascript
// First call - loads from file
const workflow1 = await contextLoader.loadSectionByReference(reference);

// Second call within 5 minutes - returns from cache
const workflow2 = await contextLoader.loadSectionByReference(reference);
```

### Use Token Estimates for Planning

Before loading sections, check token requirements:

```javascript
// Check available token budget
const tokenBudget = 10000;
let tokensUsed = agentJson.data.meta.estimated_tokens;

// Plan what to load
for (const workflow of agentJson.data.workflows.available) {
  if (tokensUsed + workflow.tokens <= tokenBudget) {
    const details = await contextLoader.loadSectionByReference(workflow.md_reference);
    tokensUsed += workflow.tokens;
  }
}
```

## Reference Resolution Patterns

### Pattern 1: Lazy Loading

Load details only when needed:

```javascript
class AgentWorkflowHandler {
  constructor(agentJson) {
    this.agentJson = agentJson;
    this.loadedWorkflows = new Map();
  }
  
  async getWorkflow(workflowName) {
    if (!this.loadedWorkflows.has(workflowName)) {
      const workflow = this.agentJson.workflows.available.find(w => w.name === workflowName);
      if (workflow) {
        const details = await contextLoader.loadSectionByReference(workflow.md_reference);
        this.loadedWorkflows.set(workflowName, details);
      }
    }
    return this.loadedWorkflows.get(workflowName);
  }
}
```

### Pattern 2: Preload Critical Sections

Load important sections upfront:

```javascript
async function initializeAgent(agentName) {
  const contextLoader = createContextLoader(agentName);
  const agentJson = await contextLoader.loadAgentData(agentName);
  
  // Preload critical sections
  const criticalSections = [
    agentJson.data.core_responsibilities.md_reference,
    agentJson.data.coordination.md_reference
  ];
  
  await Promise.all(
    criticalSections.map(ref => contextLoader.loadSectionByReference(ref))
  );
  
  return { agentJson, contextLoader };
}
```

### Pattern 3: Context-Aware Loading

Load based on the current task:

```javascript
async function loadContextForTask(taskType, agentJson, contextLoader) {
  switch (taskType) {
    case 'implementation':
      // Load workflows and reference docs
      return contextLoader.loadProgressiveContext(agentJson, 'detailed');
      
    case 'coordination':
      // Load just coordination info
      return contextLoader.loadSectionByReference(agentJson.coordination.md_reference);
      
    case 'overview':
      // Minimal context is enough
      return contextLoader.loadProgressiveContext(agentJson, 'minimal');
      
    default:
      // Standard context for general tasks
      return contextLoader.loadProgressiveContext(agentJson, 'standard');
  }
}
```

## Performance Metrics

Track your token usage and loading performance:

```javascript
const startTokens = contextLoader.getTokensUsed();
const startTime = Date.now();

// Load various contexts
await loadContextForTask('implementation', agentJson, contextLoader);

const endTokens = contextLoader.getTokensUsed();
const loadTime = Date.now() - startTime;

console.log(`Tokens used: ${endTokens - startTokens}`);
console.log(`Load time: ${loadTime}ms`);
console.log(`Token reduction: ${(1 - endTokens / agentJson.data.meta.full_md_tokens) * 100}%`);
```

## Error Handling

Always handle reference resolution errors:

```javascript
try {
  const section = await contextLoader.loadSectionByReference(reference);
  if (!section.success) {
    console.error(`Failed to load section: ${section.error}`);
    // Fall back to full agent data or handle gracefully
  }
} catch (error) {
  console.error(`Reference resolution error: ${error.message}`);
  // Use cached data or provide alternative
}
```

## Best Practices

1. **Start with JSON**: Always load the agent JSON first to understand available references
2. **Use Progressive Loading**: Start minimal, expand based on needs
3. **Cache Strategically**: Leverage the built-in caching for frequently accessed sections
4. **Monitor Token Usage**: Track your token consumption to stay within limits
5. **Handle Errors Gracefully**: Always have fallback strategies for failed references
6. **Batch Related Loads**: Load related sections together for efficiency

## Example: Complete Agent Initialization

```javascript
async function initializeAgentWithReferences(agentName) {
  const contextLoader = createContextLoader(agentName);
  
  // 1. Load agent JSON (minimal tokens)
  const agentResult = await contextLoader.loadAgentData(agentName);
  if (!agentResult.success) {
    throw new Error(`Failed to load agent: ${agentName}`);
  }
  
  // 2. Load progressive context based on needs
  const context = await contextLoader.loadProgressiveContext(
    agentResult.data, 
    'standard'
  );
  
  // 3. Create reference-aware agent interface
  const agent = {
    name: agentName,
    data: agentResult.data,
    context: context,
    
    // Method to load specific workflow
    async loadWorkflow(workflowName) {
      const workflow = this.data.workflows.available.find(w => w.name === workflowName);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowName}`);
      }
      return contextLoader.loadSectionByReference(workflow.md_reference);
    },
    
    // Method to load reference documentation
    async loadReferenceDoc(docName) {
      const doc = this.data.reference_documentation?.[docName];
      if (!doc) {
        throw new Error(`Reference doc not found: ${docName}`);
      }
      return contextLoader.loadSectionByReference(doc.path);
    },
    
    // Get token usage
    getTokenUsage() {
      return {
        loaded: contextLoader.getTokensUsed(),
        available: this.data.meta.full_md_tokens,
        reduction: ((1 - contextLoader.getTokensUsed() / this.data.meta.full_md_tokens) * 100).toFixed(1)
      };
    }
  };
  
  return agent;
}

// Usage
const testingAgent = await initializeAgentWithReferences('testing_agent');
console.log(`Initialized with ${testingAgent.getTokenUsage().reduction}% token reduction`);

// Load specific workflow when needed
const regressionWorkflow = await testingAgent.loadWorkflow('Regression Testing Workflow');
console.log(`Loaded workflow: ${regressionWorkflow.heading} (${regressionWorkflow.tokens} tokens)`);
```

---

This reference resolution system enables efficient, progressive loading of agent information while maintaining full access to detailed documentation when needed. By starting with minimal JSON and expanding through references, agents can operate with 70-85% fewer tokens while retaining full functionality.