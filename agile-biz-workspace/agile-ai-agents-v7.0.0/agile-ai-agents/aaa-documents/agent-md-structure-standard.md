# Agent Markdown Structure Standard

## Overview

This document defines the standardized structure for all agent markdown files in the AgileAiAgents system. Consistent structure enables reliable JSON reference generation and section-based content loading.

## Required Structure

All agent files MUST follow this heading hierarchy:

```markdown
# [Agent Name]

*This agent follows the Universal Agent Guidelines in CLAUDE.md*

## Overview
Brief description of the agent's purpose and primary focus.

## Reference Documentation
- **Guide Name**: `agile-ai-agents/path/to/guide.md`
- Additional references specific to this agent

## Core Responsibilities
### [Responsibility Category 1]
- Detailed responsibility points
- Specific capabilities

### [Responsibility Category 2]
- Additional responsibilities

## Workflows

### [Workflow Name 1]
#### Overview
Brief description of the workflow

#### Steps
1. Step one description
2. Step two description
3. Step three description

#### Input Requirements
- Required input from other agents
- Data format specifications

#### Output Deliverables
- What this workflow produces
- Format and location of outputs

### [Workflow Name 2]
[Same structure as above]

## Agent Coordination

### Inputs From Other Agents
- **[Agent Name]**: What this agent provides
- Additional agent inputs

### Outputs To Other Agents
- **[Agent Name]**: What this agent receives
- Additional agent outputs

### Coordination Patterns
- Sequential handoffs
- Parallel coordination
- Specific integration points

## Input/Output Contracts

### Expected Inputs
```json
{
  "example": "structure"
}
```

### Produced Outputs
```json
{
  "example": "structure"
}
```

## Success Metrics
- Metric 1: Description and target
- Metric 2: Description and target
- Quality gates and validation criteria

## Clear Boundaries
❌ **What This Agent Does NOT Do**
- Responsibility that belongs to another agent
- Another boundary clarification

## Version History
### v2.0.0
- **Released**: Date
- **Changes**: What changed
- **Status**: Active/Deprecated
```

## Heading Standards

### Naming Conventions
1. Use title case for main headings
2. Use sentence case for sub-headings
3. Keep headings concise but descriptive
4. Avoid special characters except hyphens

### Anchor-Friendly IDs
All headings automatically generate anchors based on these rules:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Example: "Agent Coordination" becomes `#agent-coordination`

## Section-Specific Guidelines

### Overview Section
- 2-3 sentences maximum
- Focus on primary purpose
- Mention key differentiators

### Reference Documentation
- Use complete paths starting with `agile-ai-agents/`
- Group related references
- Include brief description of each reference's purpose

### Core Responsibilities
- Group into logical categories
- Use bullet points for specific capabilities
- Be specific about what the agent does

### Workflows
- Each workflow must have Overview, Steps, Input Requirements, and Output Deliverables
- Number steps sequentially
- Include decision points and branches
- Specify error handling

### Agent Coordination
- Clearly define inputs and outputs
- Specify data formats
- Include timing and sequencing requirements

### Success Metrics
- Include quantifiable metrics where possible
- Define quality gates
- Specify validation criteria

## Token Optimization

To support efficient JSON reference generation:

1. **Keep sections focused** - Each section should be independently useful
2. **Avoid redundancy** - Don't repeat information across sections
3. **Use consistent formatting** - Enables reliable parsing
4. **Include examples sparingly** - Link to separate example documents

## Migration Checklist

When updating existing agent files:

- [ ] Verify all required sections are present
- [ ] Ensure heading hierarchy matches standard
- [ ] Update Reference Documentation section
- [ ] Validate workflow structure
- [ ] Check coordination patterns documentation
- [ ] Add success metrics if missing
- [ ] Update version history

## Validation

Use this checklist to validate agent markdown files:

1. **Structure Compliance**: All required sections present
2. **Heading Format**: Consistent with standards
3. **Reference Paths**: Complete and accurate
4. **Workflow Completeness**: All subsections included
5. **Coordination Clarity**: Inputs/outputs clearly defined
6. **Metrics Defined**: Success criteria specified

## Examples

See these well-structured agent files as references:
- `agile-ai-agents/ai-agents/coder_agent.md`
- `agile-ai-agents/ai-agents/testing_agent.md`
- `agile-ai-agents/ai-agents/project_manager_agent.md`

---

**Version**: 1.0.0
**Last Updated**: 2025-01-10
**Status**: Active