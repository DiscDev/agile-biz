# JSON Context Optimization Guide

## Overview
The JSON Context Optimization system reduces AI agent context usage by 80-90% through structured data formats, smart querying, and efficient caching.

## Implementation Guide

### Automatic JSON Generation
The Document Manager Agent automatically:
- Monitors all .md files in `ai-agents/`, `aaa-documents/`, and `project-documents/`
- Generates optimized JSON versions in the `machine-data/` folder
- Maintains synchronization between .md and .json files
- Validates JSON against schemas for consistency

### Folder Structure
```
agile-ai-agents/
├── machine-data/                    # All JSON data
│   ├── ai-agents-json/             # Agent specifications
│   ├── aaa-documents-json/         # System documentation
│   ├── project-documents-json/     # Project outputs
│   └── schemas/                    # JSON schemas
```

### Context Optimization Benefits

#### Before (Reading Markdown)
```markdown
# Competitive Analysis Report

## Executive Summary
After conducting a comprehensive analysis of the competitive landscape in the task management space, we have identified 47 direct competitors. Our research methodology included market analysis, feature comparison, pricing evaluation, and user feedback analysis...

[2000+ words of prose]
```
**Context Used: ~2500 words**

#### After (Reading JSON)
```json
{
  "summary": "Analyzed 47 competitors in task management space",
  "key_findings": {
    "top_competitors": ["Asana", "Trello", "Monday.com"],
    "market_gap": "No solution for teams under 10 people",
    "price_range": "$5-25 per user/month"
  }
}
```
**Context Used: ~50 words (98% reduction)**

## Agent Usage Guide

### Reading JSON Data

#### Basic JSON Reading
```javascript
// Read entire JSON file
const agentData = readJsonPath("machine-data/ai-agents-json/prd_agent.json");

// Read specific path
const capabilities = readJsonPath("machine-data/ai-agents-json/prd_agent.json#/capabilities");

// Deep path access
const marketSize = readJsonPath("machine-data/project-documents-json/business-strategy/research/analysis.json#/key_findings/market_size");
```

#### With Automatic Fallback
If JSON doesn't exist yet, the system automatically falls back to reading the .md file:
```javascript
// This will read JSON if available, otherwise fall back to .md
const data = readJsonPath("machine-data/project-documents-json/05-requirements/prd.json");
```

### Querying Arrays

#### Simple Filtering
```javascript
// Find competitors with price under $10
const cheapCompetitors = await queryJson(
  "machine-data/project-documents-json/business-strategy/research/competitors.json",
  {
    path: "competitors",
    filter: { price: { "<": 10 } }
  }
);

// Find high-priority features
const criticalFeatures = await queryJson(
  "machine-data/project-documents-json/05-requirements/features.json",
  {
    path: "features",
    filter: { priority: "critical" }
  }
);
```

### Context-Aware Loading

#### Load Only What You Need
```javascript
// PRD Agent loading research data
const researchData = await loadOptimizedContext("research_agent", "prd_agent");

// Returns only:
// - summary (always)
// - critical fields: market_gap, target_audience, top_competitors
// - optional fields: only if context budget allows
```

### Streaming Events

#### Reading Stream Events
```javascript
// Read latest test failures
const streamFile = "machine-data/project-documents-json/22-testing/streams/latest.jsonl";
const lines = (await fs.readFile(streamFile, 'utf8')).split('\n');

const failures = lines
  .filter(line => line.trim())
  .map(line => JSON.parse(line))
  .filter(event => event.event === 'test_failed');
```

## Agent Integration Examples

### Example 1: PRD Agent Reading Research
```javascript
// Instead of reading 40+ research files...
const research = await loadOptimizedContext("research_agent", "prd_agent");

// Gets structured data:
{
  "summary": "Market research complete with 3 viable opportunities",
  "critical_data": {
    "market_gap": "No solution for teams under 10",
    "target_audience": "Small development teams",
    "top_competitors": ["Asana", "Trello", "Monday.com"]
  }
}
```

### Example 2: Coder Agent Getting Requirements
```javascript
// Instead of reading entire PRD...
const requirements = await readJsonPath(
  "machine-data/project-documents-json/05-requirements/prd.json#/key_findings/technical_requirements"
);

// Gets just what's needed:
{
  "tech_stack": ["React", "Node.js", "PostgreSQL"],
  "api_style": "REST",
  "auth_method": "JWT"
}
```

### Example 3: Testing Agent Streaming Failures
```javascript
// Stream test failures to Coder Agent
function streamTestFailure(failure) {
  const event = {
    event: "test_failed",
    timestamp: new Date().toISOString(),
    test: failure.test,
    error: failure.error,
    file: failure.file,
    line: failure.line
  };
  
  // Append to stream file
  fs.appendFileSync(
    "machine-data/project-documents-json/22-testing/streams/current.jsonl",
    JSON.stringify(event) + '\n'
  );
  
  // Coder Agent can read this immediately
}
```

## Best Practices

### Define Context Priorities
Each agent should declare what it needs from other agents:
```json
{
  "context_priorities": {
    "research_agent": {
      "critical": ["market_gap", "target_audience"],
      "optional": ["competitor_features"]
    }
  }
}
```

### Use Structured Keys
Keep JSON keys consistent and queryable:
- ✅ `market_gap`, `target_audience`, `tech_stack`
- ❌ `marketGap`, `target-audience`, `technology_stack_used`

### Progressive Loading
Start with summaries, load details only when needed:
```javascript
// Step 1: Check summary
const summary = await readJsonPath("path/to/doc.json#/summary");

// Step 2: If relevant, load key findings
if (summary.includes("authentication")) {
  const authDetails = await readJsonPath("path/to/doc.json#/key_findings/authentication");
}
```

### Cache Frequently Used Data
```javascript
// Use cached reads for frequently accessed data
const agentSpec = await readJsonCached("machine-data/ai-agents-json/prd_agent.json");
```

## Monitoring & Metrics

The Document Manager Agent tracks:
- **Generation Speed**: Files converted per minute
- **Context Savings**: Bytes saved per agent interaction
- **Cache Performance**: Hit rate and query times
- **Error Rates**: Failed conversions or validations

Access metrics at:
```
machine-data/project-documents-json/orchestration/metrics.json
```

## Troubleshooting

### JSON Not Found
- Check if Document Manager Agent is running
- Verify .md file exists and is readable
- Check logs for generation errors
- System automatically falls back to .md

### Invalid JSON Structure
- Check against schema in `machine-data/schemas/`
- Verify source .md file is properly formatted
- Document Manager logs validation errors

### Performance Issues
- Check cache hit rate in metrics
- Verify not reading same files repeatedly
- Use streaming for large datasets
- Enable query result caching if needed

## Overview
The JSON Context Optimization system enables AI agents to work efficiently with minimal context usage while maintaining access to all necessary information. By using structured data, smart queries, and progressive loading, agents can focus their context budget on actual work rather than parsing verbose documentation.