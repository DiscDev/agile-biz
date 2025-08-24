# Document Markdown Structure Standard

## Overview
This document defines the standardized structure for all markdown documents in the AgileAiAgents system to enable the enhanced JSON reference system with section-based progressive loading.

## Document Categories

### aaa-documents (System Documentation)
Core system documentation, guides, templates, and standards.

### project-documents (Project Deliverables)
Project-specific documents organized in 30 categorized folders.

## Standard Document Structure

### Required Sections

All documents MUST include these top-level sections:

```markdown
# Document Title

## Overview
Brief summary of the document's purpose and scope.

## [Main Content Sections]
Core content organized by logical topics.

## Key Concepts (if applicable)
Important concepts, definitions, or principles.

## Examples (if applicable)
Practical examples or use cases.

## Reference Documentation (if applicable)
Links to related documents or external resources.

## Version History (if applicable)
Document version and change tracking.
```

### Heading Standards

1. **Document Title**: Use single `#` for the main title
2. **Major Sections**: Use `##` for top-level sections
3. **Subsections**: Use `###` for subsections
4. **Sub-subsections**: Use `####` for detailed breakdowns
5. **No Numbering**: Don't use numbers in headings (e.g., "## 1. Overview")
6. **Consistent Naming**: Use these standard section names when applicable:
   - Overview
   - Core Concepts
   - Implementation Guide
   - Workflows
   - Examples
   - Best Practices
   - Troubleshooting
   - Reference Documentation
   - Version History

### Anchor Generation Rules

Anchors are generated from headings following GitHub's format:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters (except hyphens)
- Handle duplicates by appending numbers

Examples:
- `## Overview` → `#overview`
- `## Key Concepts` → `#key-concepts`
- `### Implementation Guide` → `#implementation-guide`

## Document Type Templates

### Guide Documents
```markdown
# [Guide Name] Guide

## Overview
What this guide covers and who it's for.

## Prerequisites
What you need before using this guide.

## Core Concepts
Key concepts explained.

## Step-by-Step Instructions
### Step 1: [Action]
### Step 2: [Action]
### Step 3: [Action]

## Examples
Practical examples.

## Troubleshooting
Common issues and solutions.

## Reference Documentation
Related guides and resources.
```

### Template Documents
```markdown
# [Template Name] Template

## Overview
Purpose and use cases for this template.

## Template Structure
Explanation of the template components.

## Usage Instructions
How to use this template.

## Template
```[template content]```

## Customization Guide
How to adapt for specific needs.

## Examples
Real-world examples using this template.
```

### Standard/Specification Documents
```markdown
# [Standard Name] Standard

## Overview
What this standard defines.

## Scope
What is and isn't covered.

## Prerequisites
### Mandatory Requirements
### Recommended Practices
### Optional Enhancements

## Implementation Guidelines
How to implement this standard.

## Validation Criteria
How to verify compliance.

## Examples
Compliant and non-compliant examples.
```

### Technical Documentation
```markdown
# [Feature/System Name] Documentation

## Overview
System or feature description.

## Architecture
System design and components.

## API Reference (if applicable)
### Endpoints
### Data Models
### Authentication

## Configuration
Setup and configuration options.

## Usage Guide
How to use the system/feature.

## Monitoring & Maintenance
Operational considerations.

## Troubleshooting
Common issues and debugging.
```

## Progressive Loading Sections

To optimize token usage, structure documents with progressive disclosure:

### Minimal Context Sections
- Overview
- Summary (if different from overview)
- Key Points or Quick Reference

### Standard Context Sections
- Core Concepts
- Main workflows or procedures
- Primary examples

### Detailed Context Sections
- Implementation details
- Advanced configurations
- Troubleshooting guides
- Complete API references

## Best Practices

1. **Front-load Important Information**: Put critical information in Overview
2. **Use Clear Section Names**: Avoid ambiguous headings
3. **Consistent Hierarchy**: Don't skip heading levels
4. **Meaningful Anchors**: Section names should be self-explanatory
5. **Progressive Disclosure**: Structure from general to specific
6. **Cross-references**: Use relative paths with anchors for internal links

## JSON Generation Metadata

Documents should include metadata comments for JSON generation:

```markdown
<!-- 
metadata:
  category: guide|template|standard|technical|reference
  priority: high|medium|low
  tokens_estimate: approximate_count
  dependencies: [list of related documents]
-->
```

## Section Token Guidelines

Target token counts for optimal loading:
- Overview: 100-300 tokens
- Core sections: 500-1500 tokens each
- Detailed sections: Can be larger, loaded on demand
- Total document: Aim for < 10,000 tokens

## Migration Checklist

When updating existing documents:
- [ ] Remove numbered headings (e.g., "## 1. Overview" → "## Overview")
- [ ] Standardize section names
- [ ] Add Overview if missing
- [ ] Ensure consistent heading hierarchy
- [ ] Add metadata comment if applicable
- [ ] Verify anchor-friendly heading names

## Examples of Well-Structured Documents

### Good Structure
```markdown
# Sprint Planning Guide

## Overview
This guide helps teams plan effective sprints...

## Prerequisites
- Understanding of Agile principles
- Access to project backlog

## Planning Process
### Preparation Phase
...
### Planning Meeting
...
### Finalization
...

## Templates
### Sprint Goal Template
...
### Task Breakdown Template
...

## Best Practices
...
```

### Avoid This Structure
```markdown
# Sprint Planning Guide

## Introduction  ❌ (numbered)
...

## How to Plan  ❌ (numbered + vague)
### 1 First Step  ❌ (sub-numbered)
...

## Conclusion  ❌ (not useful section)
```

## Version History
- v1.0.0 (2024-01-10): Initial standard for document structure with JSON reference support