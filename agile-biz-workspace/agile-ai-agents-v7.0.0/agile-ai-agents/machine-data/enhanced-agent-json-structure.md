# Enhanced Agent JSON Structure Documentation

## Overview

This document defines the enhanced JSON structure for AgileAiAgents that combines the sophisticated original structure with new GitHub markdown formatting standards and bidirectional references.

## Design Principles

### 1. **Progressive Loading**
- Start with minimal context (100-150 tokens)
- Load specific sections on-demand via `md_reference` links
- Scale from overview to detailed implementation as needed

### 2. **Token Efficiency**
- Target 50%+ token reduction from MD files
- Accurate token counting per section
- Clear token budgeting for context optimization

### 3. **Bidirectional References**
- JSON files reference MD sections via `md_reference`
- MD files reference JSON files for quick context
- Seamless navigation between formats

### 4. **Context Optimization**
- Inter-agent data flow requirements
- Critical vs optional data priorities
- Progressive loading recommendations

## Enhanced JSON Structure

### Core Sections

#### **meta**
```json
{
  "meta": {
    "agent": "coder_agent",
    "version": "2.1.0",
    "last_updated": "2025-01-19",
    "estimated_tokens": 400,
    "full_md_tokens": 8000,
    "token_reduction": "95%",
    "md_file": "agile-ai-agents/ai-agents/coder_agent.md",
    "companion_md": "agile-ai-agents/ai-agents/coder_agent.md",
    "usage_guide": "Load this JSON first for context efficiency, then use md_reference links for detailed sections"
  }
}
```

#### **github_formatting** (NEW)
```json
{
  "github_formatting": {
    "agent_category": "development",
    "formatting_level": "basic+intermediate",
    "standards_included": true,
    "examples_count": 5,
    "quality_checklist": true,
    "tokens": 150,
    "md_reference": "agile-ai-agents/ai-agents/coder_agent.md#github-markdown-formatting-standards"
  }
}
```

#### **context_optimization** (NEW)
```json
{
  "context_optimization": {
    "required_from_agents": {
      "prd_agent": ["requirements", "acceptance_criteria"],
      "ui_ux_agent": ["design_specs", "user_flows"]
    },
    "optional_from_agents": {
      "testing_agent": ["test_coverage", "quality_metrics"],
      "devops_agent": ["deployment_config"]
    },
    "provides_to_agents": ["testing_agent", "devops_agent", "documentation_agent"],
    "tokens": 200,
    "md_reference": "agile-ai-agents/ai-agents/coder_agent.md#context-optimization-priorities"
  }
}
```

#### **context_recommendations** (ENHANCED)
```json
{
  "context_recommendations": {
    "minimal": {
      "sections": ["meta", "summary", "core_responsibilities.summary", "github_formatting.agent_category"],
      "tokens": 100,
      "description": "Quick agent overview for basic context"
    },
    "standard": {
      "sections": ["minimal", "workflows.available", "context_optimization.required_from_agents", "coordination"],
      "tokens": 250,
      "description": "Operational context with inter-agent dependencies"
    },
    "detailed": {
      "sections": ["standard", "boundaries", "success_metrics", "tools_integrations", "all_md_references_as_needed"],
      "tokens": "400-8000",
      "description": "Progressive loading via md_reference links"
    }
  }
}
```

## Token Counting Methodology

### **Estimation Formula**
```javascript
// Base estimation using average tokens per character
const estimateTokens = (text) => {
  const avgTokensPerChar = 0.25; // Conservative estimate
  return Math.ceil(text.length * avgTokensPerChar);
};

// Section-specific counting
const sectionTokens = {
  headers: estimateTokens(headers),
  content: estimateTokens(content),
  code_blocks: estimateTokens(codeBlocks) * 1.1, // Code uses more tokens
  tables: estimateTokens(tables) * 1.2 // Tables use more tokens
};
```

### **Token Reduction Calculation**
```javascript
const tokenReduction = ((fullMdTokens - estimatedJsonTokens) / fullMdTokens * 100).toFixed(1) + '%';
```

## MD Reference Generation

### **Format Standard**
```
{base_path}#{section_anchor}
```

### **Section Anchor Rules**
1. Convert to lowercase
2. Replace spaces with hyphens
3. Remove special characters
4. Handle duplicates with numbers

### **Examples**
```
"Core Responsibilities" → "core-responsibilities"
"GitHub Markdown Formatting Standards" → "github-markdown-formatting-standards"
"Context Optimization Priorities" → "context-optimization-priorities"
```

## Section Extraction Rules

### **GitHub Formatting Section**
- **Location**: After "## Overview" section
- **Marker**: "## GitHub Markdown Formatting Standards"
- **Extract**: Agent category, formatting level, examples count
- **Token Count**: Full section including examples

### **Context Optimization Section**
- **Location**: After "## Clear Boundaries" section
- **Marker**: "## Context Optimization Priorities"
- **Extract**: Required/optional data from other agents
- **Parse**: "#### From {Agent}" sections for dependencies

### **Core Responsibilities Section**
- **Extract**: Bold headings as responsibility areas
- **Count**: Number of main responsibilities
- **Token Count**: Full section content

## Usage Patterns

### **For Claude Code - Progressive Loading**
```javascript
// 1. Load minimal context (100 tokens)
const agent = await loadJSON('coder_agent.json');
const minimalContext = agent.context_recommendations.minimal;

// 2. Load specific sections as needed (250 tokens)
if (needsWorkflows) {
  const workflows = await loadMarkdownSection(agent.workflows.md_reference);
}

// 3. Load detailed sections on demand (400-8000 tokens)
if (needsDetailedImplementation) {
  const fullWorkflow = await loadMarkdownSection(specificWorkflow.md_reference);
}
```

### **For Human Users - Quick Reference**
```markdown
## Quick Reference

**JSON Summary**: [`machine-data/ai-agents-json/coder_agent.json`](../machine-data/ai-agents-json/coder_agent.json)
- **Estimated Tokens**: 400 (95% reduction from 8,000 MD tokens)
- **Context Loading**: Minimal (100 tokens) → Standard (250 tokens) → Detailed (full MD)
- **Key Sections**: [Responsibilities](#core-responsibilities) | [Workflows](#workflows) | [Context Priorities](#context-optimization-priorities)
```

## Quality Validation

### **JSON Structure Validation**
- Validate against `enhanced-agent-json-schema.json`
- Ensure all required fields are present
- Verify token counts are reasonable

### **MD Reference Validation**
- Verify all `md_reference` links exist in MD file
- Check anchor generation accuracy
- Validate section extraction completeness

### **Token Reduction Validation**
- Ensure 50%+ token reduction achieved
- Verify token counting accuracy
- Check progressive loading effectiveness

## Implementation Notes

### **Backward Compatibility**
- No backward compatibility required (fresh start)
- New structure optimized for Claude Code usage
- Clean separation from previous broken JSON format

### **Error Handling**
- Graceful fallback to MD files if JSON parsing fails
- Clear error messages for missing sections
- Validation warnings for incomplete data

### **Performance Optimization**
- Cache frequently accessed sections
- Lazy loading for large workflows
- Efficient token counting algorithms

## Success Metrics

### **Token Efficiency**
- ✅ 50%+ token reduction from MD files
- ✅ Accurate token counting per section
- ✅ Progressive loading capability

### **Structure Completeness**
- ✅ All original sections preserved
- ✅ New GitHub formatting section added
- ✅ Context optimization section added
- ✅ All md_reference links functional

### **System Integration**
- ✅ JSON-first loading with MD fallback
- ✅ Bidirectional references working
- ✅ All 38 agents processable

---

This enhanced structure provides optimal context efficiency for Claude Code while maintaining comprehensive documentation accessibility and bidirectional navigation between JSON and MD formats.