# GitHub Markdown Style Guide for AgileAiAgents

## Overview

This guide establishes consistent GitHub markdown formatting standards for all AI agents in the AgileAiAgents system. Following these standards ensures professional, readable, and accessible documentation that leverages GitHub's full formatting capabilities.

## Table of Contents

* [Basic Formatting Standards](#basic-formatting-standards)
* [Advanced Formatting Features](#advanced-formatting-features)
* [Agent-Specific Guidelines](#agent-specific-guidelines)
* [Quality Standards](#quality-standards)
* [Common Patterns](#common-patterns)

## Basic Formatting Standards

### Headers

Always start with `##` for main sections (reserve `#` for document title only):

```markdown
# Document Title

## Main Section
### Subsection
#### Detail Level
##### Minor Detail (use sparingly)
```

### Lists

**Unordered Lists - Use asterisks (`*`), never dashes (`-`) or plus (`+`):**

```markdown
* First item
* Second item
  * Nested item (2-space indentation)
  * Another nested item
    * Deep nesting (use sparingly)
```

**Ordered Lists:**

```markdown
1. First step
2. Second step
   * Mixed nesting is allowed
   * Use 3-space indentation for mixed lists
3. Third step
```

**Task Lists (for actionable items):**

```markdown
* [ ] Incomplete task
* [x] Completed task
* [ ] Another pending task
```

### Text Formatting

```markdown
**Bold text** for emphasis and important terms
*Italic text* for subtle emphasis or technical terms
`inline code` for commands, variables, file names, and code snippets
~~Strikethrough~~ for deprecated or removed content (use sparingly)
```

### Links

Always use descriptive link text:

```markdown
<!-- Good -->
[GitHub markdown documentation](https://docs.github.com/en/get-started/writing-on-github)

<!-- Bad -->
[Click here](https://docs.github.com/en/get-started/writing-on-github)
```

### Code Blocks

Always specify the language for syntax highlighting:

```markdown
​```javascript
const config = {
  apiKey: process.env.API_KEY,
  timeout: 5000
};
​```

​```bash
npm install agile-ai-agents
cd agile-ai-agents
​```

​```yaml
version: 3.0.0
services:
  api:
    build: .
    ports:
      - "3000:3000"
​```
```

## Advanced Formatting Features

### Tables

Use proper alignment for different data types:

```markdown
| Feature | Description | Priority | Cost |
|:--------|:------------|:--------:|-----:|
| Auth    | User login  | High     | $500 |
| API     | Data access | Medium   | $300 |
| UI      | Interface   | High     | $800 |
```

**Alignment Rules:**
* Left align: `:---` (text, descriptions)
* Center align: `:---:` (short codes, priorities)
* Right align: `---:` (numbers, currency, metrics)

### Collapsible Sections

Use for detailed information that doesn't need immediate visibility:

```markdown
<details>
<summary>Technical Implementation Details</summary>

This section contains verbose technical information that users can
optionally expand to view.

* Implementation approach
* Technical considerations
* Code examples

​```javascript
// Example implementation
function handleAuth(token) {
  return validateToken(token);
}
​```

</details>
```

### Mathematical Expressions

For financial calculations, algorithms, and formulas:

**Inline math:**
```markdown
The ROI calculation is $ROI = \frac{Revenue - Cost}{Cost} \times 100$
```

**Block math:**
```markdown
$$CAGR = \left(\frac{End\_Value}{Start\_Value}\right)^{\frac{1}{Years}} - 1$$
```

### Diagrams

Use Mermaid for system architecture, workflows, and process flows:

```markdown
​```mermaid
graph TD
    A[User Request] --> B{Auth Check}
    B -->|Valid| C[Process Request]
    B -->|Invalid| D[Return Error]
    C --> E[Return Response]
​```
```

### Blockquotes

For important insights, quotes, or highlighted information:

```markdown
> **Key Insight**: Performance improvements of 80-90% achieved through JSON optimization.

> According to industry research: "AI-driven development can reduce project timelines by 60%."
```

## Agent-Specific Guidelines

### Development Agents (Coder, Testing, DevOps, Security, DBA, UI/UX)

**Required Elements:**
* Code blocks with specific language identifiers
* Technical tables for configurations and parameters
* Collapsible sections for verbose technical details
* Task lists for implementation steps

**Example Pattern:**
```markdown
## Implementation Guide

### Quick Start
​```bash
npm install package-name
​```

### Configuration
| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
| timeout   | number | 5000  | Request timeout in ms |
| retries   | number | 3     | Max retry attempts |

<details>
<summary>Advanced Configuration</summary>

​```javascript
const advancedConfig = {
  timeout: 10000,
  retries: 5,
  backoff: 'exponential'
};
​```

</details>

### Implementation Steps
* [ ] Install dependencies
* [ ] Configure environment
* [ ] Run tests
* [x] Deploy to staging
```

### Business & Strategy Agents (Research, Finance, Marketing, Analysis, Business Documents)

**Required Elements:**
* Tables with right-aligned numeric data
* Mathematical expressions for calculations
* Blockquotes for key insights
* Collapsible sections for detailed analysis

**Example Pattern:**
```markdown
## Market Analysis Report

### Executive Summary
> **Key Finding**: Market opportunity of $2.3B with 15% annual growth rate.

### Financial Projections
| Year | Revenue (M) | Growth | Market Share |
|:-----|------------:|:------:|:------------:|
| 2024 | $1.2        | 25%    | 3.5%         |
| 2025 | $1.5        | 25%    | 4.2%         |
| 2026 | $1.9        | 27%    | 5.1%         |

### Market Size Calculation
The Total Addressable Market (TAM) is calculated as:

$$TAM = \sum_{i=1}^{n} Segment_i \times PenetrationRate_i$$

<details>
<summary>Detailed Market Analysis</summary>

* Competitive landscape assessment
* Customer segment analysis
* Growth driver identification

</details>
```

### Growth & Revenue Agents (SEO, PPC, Social Media, Email Marketing, Revenue Optimization, Analytics, Customer Lifecycle)

**Required Elements:**
* Metrics tables with right-aligned numbers
* Code blocks for tracking implementations
* Mathematical expressions for conversion calculations
* Mermaid diagrams for funnel visualization

**Example Pattern:**
```markdown
## Campaign Performance Report

### Key Metrics
| Channel | Impressions | Clicks | CTR  | Conversions | CPA   |
|:--------|------------:|-------:|:----:|------------:|------:|
| Google  | 125,000     | 3,200  | 2.6% | 85          | $45.2 |
| Facebook| 89,000      | 1,800  | 2.0% | 42          | $52.1 |

### Conversion Funnel
​```mermaid
graph TD
    A[100,000 Impressions] --> B[2,500 Clicks]
    B --> C[750 Landing Page Views]
    C --> D[127 Conversions]
    D --> E[Revenue: $15,240]
​```

### ROI Calculation
$$ROI = \frac{Revenue - Cost}{Cost} \times 100 = \frac{15240 - 5890}{5890} \times 100 = 158.8\%$$
```

### Technical Integration Agents (API, LLM, MCP, ML, Data Engineer)

**Required Elements:**
* Multi-language code blocks
* Technical parameter tables
* Architecture diagrams
* API endpoint documentation

**Example Pattern:**
```markdown
## API Integration Guide

### Authentication
​```bash
curl -H "Authorization: Bearer $TOKEN" \
     https://api.example.com/v1/users
​```

### Endpoints
| Method | Endpoint | Parameters | Response |
|:-------|:---------|:-----------|:---------|
| GET    | /users   | limit, offset | User array |
| POST   | /users   | user object | Created user |

### Response Format
​```json
{
  "users": [
    {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "total": 1500,
    "page": 1,
    "limit": 50
  }
}
​```

### System Architecture
​```mermaid
graph LR
    A[Client] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[User Service]
    D --> E[Database]
​```
```

### Support Agents (Documentation, Logger, Optimization, Dashboard, Project Analyzer, Document Manager, Project State Manager, Project Structure, Learning Analysis, VC Report)

**Required Elements:**
* Clear documentation structure
* All formatting types as needed for context
* Cross-references to other documents
* Accessibility considerations

**Example Pattern:**
```markdown
## System Documentation

### Overview
This document provides comprehensive guidance for [specific function].

### Quick Reference
* [Related Guide 1](link-to-guide-1.md)
* [Related Guide 2](link-to-guide-2.md)
* [Troubleshooting](troubleshooting.md)

### Configuration Options
| Option | Default | Description |
|:-------|:--------|:------------|
| enabled | true   | Enable feature |
| timeout | 30s    | Operation timeout |

<details>
<summary>Advanced Configuration</summary>

Detailed configuration options for power users.

</details>

### Common Patterns
​```javascript
// Standard implementation pattern
const service = new DocumentService({
  format: 'markdown',
  validation: true
});
​```
```

## Quality Standards

### Document Structure

Every document should include:

```markdown
# Document Title

Brief description of document purpose.

## Table of Contents
* [Section 1](#section-1)
* [Section 2](#section-2)

## Main Content Sections

### Consistent Structure
* Clear headings
* Logical flow
* Scannable format

## Summary or Conclusion
Key takeaways and next steps.
```

### Accessibility Requirements

* **Alt text for images**: `![Description of image](image.png)`
* **Descriptive link text**: Never use "click here" or "read more"
* **Logical heading hierarchy**: Don't skip heading levels
* **Clear table headers**: Use header rows for data tables

### Content Guidelines

* **Scannable**: Use lists, headers, and white space effectively
* **Concise**: Remove unnecessary words and phrases
* **Accurate**: Verify all technical information and links
* **Current**: Update dates, versions, and references regularly

## Common Patterns

### Error Documentation
```markdown
### Error: Connection Timeout

**Symptoms:**
* API requests fail after 30 seconds
* Browser shows "Request timeout" message

**Causes:**
* Network connectivity issues
* Server overload
* Firewall blocking requests

**Solutions:**
1. Check network connection
2. Retry the request
3. Contact system administrator

​```bash
# Test connectivity
curl -I https://api.example.com/health
​```
```

### Feature Documentation
```markdown
### Feature: User Authentication

**Description:**
Secure user login and session management.

**Requirements:**
* [ ] Password validation
* [ ] Session timeout
* [ ] Multi-factor authentication
* [x] Password reset

**Implementation:**
​```javascript
const auth = new AuthService({
  sessionTimeout: 3600,
  requireMFA: true
});
​```

**Testing:**
* Unit tests: 95% coverage
* Integration tests: All endpoints
* Security audit: Completed
```

### Process Documentation
```markdown
### Deployment Process

1. **Pre-deployment Checklist**
   * [ ] Tests passing
   * [ ] Code review approved
   * [ ] Staging environment tested

2. **Deployment Steps**
   ​```bash
   npm run build
   npm run test
   npm run deploy:production
   ​```

3. **Post-deployment Verification**
   * [ ] Health check endpoints
   * [ ] Core functionality testing
   * [ ] Monitor error rates

<details>
<summary>Rollback Procedure</summary>

​```bash
npm run deploy:rollback
​```

Verify previous version is active.

</details>
```

## Validation Checklist

Before publishing any document, verify:

**Basic Format:**
* [ ] Headers start with `##` (not `#`)
* [ ] Lists use `*` (not `-`)
* [ ] Code blocks specify language
* [ ] Links use descriptive text
* [ ] Tables use proper alignment

**Advanced Features:**
* [ ] Mathematical expressions use LaTeX syntax
* [ ] Diagrams use Mermaid when appropriate
* [ ] Collapsible sections for complex content
* [ ] Task lists for actionable items

**Content Quality:**
* [ ] Purpose clearly stated
* [ ] Information accurate and current
* [ ] Structure logical and scannable
* [ ] Cross-references working
* [ ] Accessibility guidelines followed

**Agent-Specific:**
* [ ] Required elements for agent category included
* [ ] Formatting level appropriate for content
* [ ] Examples relevant and helpful
* [ ] Integration with system workflows considered

---

This style guide is a living document. Update it as new formatting needs are identified or GitHub introduces new features.

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained by**: AgileAiAgents Documentation Team