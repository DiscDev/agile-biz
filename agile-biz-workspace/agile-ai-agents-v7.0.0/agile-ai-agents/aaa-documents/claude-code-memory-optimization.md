# Claude Code Memory and Context Optimization Guide

## Overview

This guide explains how AgileAiAgents optimizes Claude Code's memory system and context window usage, achieving 80-90% token reduction through intelligent document management and loading strategies.

## Understanding the Two Memory Systems

### 1. Claude Code Memory System (CLAUDE.md)
- **Purpose**: Persistent instructions and context
- **Files**:
  - `./CLAUDE.md` - Project-specific memory (team-shared)
  - `~/.claude/CLAUDE.md` - User preferences (personal)
- **Loading**: Automatic when Claude Code starts
- **Token Impact**: Direct - these files consume context tokens

### 2. AgileAiAgents Document System
- **Purpose**: Project deliverables and agent coordination
- **Files**:
  - `project-documents/` - Human-readable markdown
  - `machine-data/project-documents-json/` - Token-optimized JSON
- **Loading**: On-demand by agents
- **Token Impact**: Optimized - JSON uses 80-90% fewer tokens

## The MD → JSON Conversion System

### How It Works

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Agent Creates     │     │  Document Manager    │     │  Agents Load    │
│   Markdown File     │────▶│  Auto-Converts to    │────▶│  JSON for       │
│ (Human-Readable)    │     │  JSON (Optimized)    │     │  Operations     │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         100%                        20-10%                      20-10%
       tokens                       tokens                      tokens
```

### Key Components

1. **Markdown Creation** (`project-documents/`)
   - All agents create documents as `.md` files
   - Full formatting, headers, lists, code blocks
   - Version control friendly
   - Human-readable for reviews

2. **Automatic Conversion** (`machine-data/`)
   - Document Manager Agent monitors for changes
   - Converts MD to structured JSON
   - Preserves content, strips formatting
   - Creates on-demand (no empty folders)

3. **JSON Loading** (`machine-data/project-documents-json/`)
   - Agents load JSON versions for operations
   - 80-90% fewer tokens than markdown
   - Structured data for easier parsing
   - Fallback to MD if JSON unavailable

### Example Token Savings

**Markdown Document** (market-analysis.md):
```markdown
# Market Analysis for AI Task Manager

## Executive Summary
The AI-powered task management market is experiencing rapid growth...

### Key Findings
- Market size: $2.3B in 2024
- Growth rate: 45% CAGR
- Main competitors: Notion AI, Taskade, ClickUp

## Detailed Analysis
[... 2000 more words ...]
```
**Token Count**: ~3,500 tokens

**JSON Equivalent**:
```json
{
  "title": "Market Analysis for AI Task Manager",
  "sections": {
    "executive_summary": "The AI-powered task management market is experiencing rapid growth...",
    "key_findings": {
      "market_size": "$2.3B in 2024",
      "growth_rate": "45% CAGR",
      "competitors": ["Notion AI", "Taskade", "ClickUp"]
    },
    "detailed_analysis": "[... content ...]"
  }
}
```
**Token Count**: ~700 tokens (80% reduction!)

## Memory Optimization Strategies

### 1. CLAUDE.md Optimization

**Keep It Focused**:
```markdown
# BAD - Too verbose
The system should always make sure to validate all user inputs including checking 
for null values, undefined values, empty strings, and ensuring type safety...

# GOOD - Concise
Always validate inputs: null checks, type safety, bounds validation.
```

**Use Structured Lists**:
```markdown
# GOOD - Easy to parse
Security Rules:
- Validate all inputs
- Sanitize outputs  
- Log security events
- Never expose secrets
```

**Import Shared Configs**:
```markdown
# Import common settings instead of duplicating
@../shared/security-rules.md
@../shared/coding-standards.md
```

### 2. Smart Context Loading

AgileAiAgents implements intelligent context loading priorities:

**Always Loaded** (High Priority):
1. System rules and configurations
2. Current task and active blockers
3. Recent decisions (last 10)
4. Active sprint information
5. Recently modified files (last 10)

**Loaded As Needed** (Medium Priority):
- Completed tasks from current sprint
- Previous sprint summaries
- Stakeholder communications
- Architecture decisions

**Compressed/Archived** (Low Priority):
- Historical data older than 30 days
- Completed project phases
- Resolved issues and decisions
- Old sprint retrospectives

### 3. Document Loading Patterns

**For Research Operations**:
```javascript
// Agents should load JSON for analysis
const marketData = loadJSON('business-strategy/research/market-analysis.json');
// Not: loadMarkdown('business-strategy/research/market-analysis.md');
```

**For User Display**:
```javascript
// Load markdown only when showing to users
const userDoc = loadMarkdown('business-strategy/research/market-analysis.md');
// JSON lacks formatting for display
```

**For Cross-References**:
```javascript
// Load only needed sections
const competitors = loadJSON('research/competitive-analysis.json').competitors;
// Not: Load entire document for one section
```

## Context Window Management

### Understanding Token Limits

Claude Code models have context windows:
- **Haiku**: ~100k tokens
- **Sonnet**: ~200k tokens  
- **Opus**: ~200k tokens

AgileAiAgents typically uses:
- **Initial Load**: 5-10k tokens (CLAUDE.md + active context)
- **Working Memory**: 20-50k tokens (active documents + conversation)
- **Buffer**: 50% of window for generation and growth

### When to Clear Context

**Use `/compact`** (Recommended):
- Between major project phases
- After completing a sprint
- When switching focus areas
- Preserves essential context

**Use `/clear`** (Last Resort):
- Context above 90% capacity
- Persistent errors or confusion
- Starting completely new project
- Loses all context

### Checkpoint Before Clearing

Always checkpoint before context management:
```bash
# 1. Save current state
/checkpoint "Completed authentication feature, starting payments"

# 2. Then compact
/compact

# 3. Continue with fresh context
/continue
```

## Agent-Specific Optimizations

### Research Agent
- Creates large MD files during research
- Should immediately trigger JSON conversion
- Load JSON for all analysis operations
- Only show MD to users for review

### Coder Agent
- Generate code directly (no JSON needed)
- Reference JSON for requirements/specs
- Keep active file context minimal
- Clear after major implementations

### Documentation Agent
- Create MD for readability
- Trigger JSON for cross-references
- Load templates as JSON
- Output final docs as MD

### Project State Manager
- Always works with JSON
- Compresses old states
- Maintains sliding window
- Prunes unnecessary history

## Best Practices

### 1. For Users

**Optimize CLAUDE.md**:
- Keep instructions concise
- Use bullet points over paragraphs
- Import shared configurations
- Remove outdated instructions

**Monitor Context Usage**:
```bash
# Check regularly
/cost

# Compact proactively
/compact

# Clear only when necessary
/checkpoint "reason" && /clear
```

### 2. For Agents

**Always Prefer JSON**:
```javascript
// ✅ CORRECT
const data = await fileManager.loadJSON('path/to/document.json');

// ❌ AVOID
const data = await fileManager.readFile('path/to/document.md');
```

**Load Selectively**:
```javascript
// ✅ CORRECT - Load only what's needed
const sprintTasks = loadJSON('sprint.json').active_tasks;

// ❌ AVOID - Loading everything
const entireSprint = loadMarkdown('sprint.md');
```

**Clean Up After Operations**:
```javascript
// ✅ CORRECT - Release memory
delete largeDataSet;
context.prune('completed_analysis');

// ❌ AVOID - Keeping everything in memory
// Just adding more and more to context
```

## Monitoring and Metrics

### Check Token Usage
```bash
# Current session
/cost

# Detailed breakdown
/cost --detailed
```

### Analyze Document Sizes
```bash
# In project root
find project-documents -name "*.md" -exec wc -w {} \; | sort -n
```

### JSON Compression Rates
```bash
# Compare MD vs JSON sizes
du -sh project-documents/
du -sh machine-data/project-documents-json/
```

## Troubleshooting

### High Token Usage Despite Optimizations

1. **Check CLAUDE.md Size**:
   ```bash
   wc -w CLAUDE.md
   # Should be under 1000 words
   ```

2. **Verify JSON Loading**:
   - Check logs for MD loading warnings
   - Ensure Document Manager is running
   - Verify JSON files are being created

3. **Review Agent Patterns**:
   - Agents loading full documents vs sections
   - Multiple agents loading same data
   - Not releasing old context

### JSON Files Not Being Created

1. **Check Document Manager**:
   - Verify it's initialized
   - Check write permissions
   - Look for error logs

2. **Manual Trigger**:
   ```bash
   node machine-data/document-json-generator.js
   ```

### Context Still Growing

1. **Check Auto-Save Frequency**:
   - May be creating too many checkpoints
   - Adjust in CLAUDE.md settings

2. **Review Conversation Length**:
   - Long conversations accumulate context
   - Use `/compact` more frequently

## Advanced Optimizations

### Custom JSON Schemas

Create targeted JSON structures for specific use cases:

```javascript
// research-optimizer.js
function optimizeResearch(markdown) {
  return {
    summary: extractSummary(markdown),
    keyPoints: extractBulletPoints(markdown),
    data: extractDataTables(markdown),
    // Omit verbose sections
  };
}
```

### Lazy Loading Implementation

Load documents only when accessed:

```javascript
class LazyDocumentLoader {
  constructor() {
    this.cache = new Map();
  }
  
  async getDocument(path) {
    if (!this.cache.has(path)) {
      const json = await this.loadJSON(path);
      this.cache.set(path, json);
    }
    return this.cache.get(path);
  }
}
```

### Context Sliding Window

Maintain only recent context:

```javascript
class ContextWindow {
  constructor(maxSize = 10) {
    this.contexts = [];
    this.maxSize = maxSize;
  }
  
  add(context) {
    this.contexts.push(context);
    if (this.contexts.length > this.maxSize) {
      this.contexts.shift(); // Remove oldest
    }
  }
}
```

## Summary

Effective memory optimization in AgileAiAgents involves:

1. **Automatic MD → JSON conversion** for 80-90% token savings
2. **Smart context loading** based on priority and relevance
3. **Proactive context management** with `/compact` and `/checkpoint`
4. **Agent-specific patterns** for optimal performance
5. **Regular monitoring** with `/cost` and metrics

By following these practices, you can run complex, long-running projects while maintaining excellent performance and staying within token limits.