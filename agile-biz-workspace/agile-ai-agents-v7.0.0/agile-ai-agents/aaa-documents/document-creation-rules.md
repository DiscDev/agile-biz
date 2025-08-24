# Document Creation Rules for AgileAiAgents

## CRITICAL RULE: Document Creation Process

### ⚠️ IMPORTANT: Two-Step Process for All Project Documents

When creating ANY documentation for the AgileAiAgents system, you MUST follow this two-step process:

### Step 1: Create Markdown Document
- **Location**: `/agile-ai-agents/project-documents/{category}/`
- **Format**: Markdown (.md)
- **Purpose**: Human-readable documentation

### Step 2: Convert to JSON
- **Location**: `/agile-ai-agents/machine-data/project-documents-json/{category}/`
- **Format**: JSON (.json)
- **Purpose**: Machine-readable for Document Manager Agent

## Directory Structure (Category-Based v3.0.0)

```
agile-ai-agents/
├── project-documents/              # STEP 1: All .md files go here
│   ├── orchestration/             # Core coordination
│   ├── business-strategy/         # Business analysis & planning
│   │   ├── existing-project/
│   │   ├── research/
│   │   ├── marketing/
│   │   ├── finance/
│   │   ├── market-validation/
│   │   ├── customer-success/
│   │   ├── monetization/
│   │   ├── analysis/
│   │   └── investment/
│   ├── implementation/            # Technical development
│   │   ├── requirements/
│   │   ├── security/
│   │   ├── llm-analysis/
│   │   ├── api-analysis/
│   │   ├── mcp-analysis/
│   │   ├── project-planning/
│   │   ├── environment/
│   │   ├── design/
│   │   ├── implementation/
│   │   ├── testing/
│   │   └── documentation/
│   └── operations/                # Launch & growth
│       ├── deployment/
│       ├── launch/
│       ├── analytics/
│       ├── monitoring/
│       ├── optimization/
│       ├── seo/
│       ├── crm-marketing/
│       ├── media-buying/
│       └── social-media/
└── machine-data/
    └── project-documents-json/     # STEP 2: All .json conversions go here
        ├── orchestration/
        ├── business-strategy/
        │   ├── existing-project/
        │   ├── research/
        │   └── ... (same structure)
        ├── implementation/
        └── operations/
```

## Document Categories (Category-Based Organization)

Use the correct category and subfolder based on document type:

### Orchestration
- `orchestration/` - Sprint planning, reviews, retrospectives, coordination
- `orchestration/sprints/` - Sprint-specific documents

### Business Strategy
- `business-strategy/existing-project/` - Existing project analysis
- `business-strategy/research/` - Market research, competitive analysis
- `business-strategy/marketing/` - Marketing strategies, campaigns
- `business-strategy/finance/` - Financial analysis, budgets
- `business-strategy/market-validation/` - Product-market fit validation
- `business-strategy/customer-success/` - Customer lifecycle management
- `business-strategy/monetization/` - Revenue optimization strategies
- `business-strategy/analysis/` - Business analysis, data insights
- `business-strategy/investment/` - VC reports, investor documents

### Implementation
- `implementation/requirements/` - PRDs, feature specifications
- `implementation/security/` - Security assessments and protocols
- `implementation/llm-analysis/` - LLM model analysis and selection
- `implementation/api-analysis/` - API research and documentation
- `implementation/mcp-analysis/` - MCP server integration docs
- `implementation/project-planning/` - Project plans, timelines
- `implementation/environment/` - Environment setup, configuration
- `implementation/design/` - UI/UX designs, wireframes
- `implementation/implementation/` - Development documentation
- `implementation/testing/` - Test plans and results
- `implementation/documentation/` - Technical documentation

### Operations
- `operations/deployment/` - Deployment guides and configs
- `operations/launch/` - Launch plans and checklists
- `operations/analytics/` - Analytics setup and tracking
- `operations/monitoring/` - System monitoring and logs
- `operations/optimization/` - Performance optimization
- `operations/seo/` - SEO strategies and optimization
- `operations/crm-marketing/` - Email and CRM campaigns
- `operations/media-buying/` - PPC and media campaigns
- `operations/social-media/` - Social media strategies

## JSON Conversion Schema

When converting from MD to JSON, use this standard schema:

```json
{
  "meta": {
    "document": "filename-without-extension",
    "timestamp": "ISO-8601-datetime",
    "version": "1.0.0",
    "source_file": "relative-path-to-md-file",
    "document_type": "type-of-document",
    "category": "category-name"
  },
  "summary": "Brief overview of the document",
  "sections": [
    {
      "title": "Section Title",
      "content_preview": "First 100 characters of content..."
    }
  ],
  "key_points": [
    "Important point 1",
    "Important point 2"
  ],
  // Additional structured data based on document type
}
```

## Examples

### ❌ WRONG - Direct JSON creation in machine-data
```bash
# DON'T DO THIS
create file: /machine-data/project-documents-json/orchestration/plan.md
```

### ❌ WRONG - Using old numbered folders
```bash
# DON'T DO THIS - Old numbered system
create file: /project-documents/orchestration/plan.md
```

### ✅ CORRECT - Two-step process with category folders
```bash
# Step 1: Create MD in category folder
create file: /project-documents/orchestration/plan.md

# Step 2: Convert to JSON
convert to: /machine-data/project-documents-json/orchestration/plan.json
```

### ✅ CORRECT - Examples by category
```bash
# Business Strategy Example
create file: /project-documents/business-strategy/research/market-analysis.md
convert to: /machine-data/project-documents-json/business-strategy/research/market-analysis.json

# Implementation Example
create file: /project-documents/implementation/requirements/prd-document.md
convert to: /machine-data/project-documents-json/implementation/requirements/prd-document.json

# Operations Example
create file: /project-documents/operations/deployment/deployment-guide.md
convert to: /machine-data/project-documents-json/operations/deployment/deployment-guide.json
```

## Enforcement

1. **Document Manager Agent** should validate this process
2. **File watchers** could auto-convert MD to JSON
3. **CI/CD checks** to ensure both files exist
4. **Error messages** when process is not followed

## Benefits

1. **Human Readable**: Markdown files for documentation
2. **Machine Readable**: JSON files for agents
3. **Version Control**: Both formats tracked in git
4. **Consistency**: Standard locations and formats
5. **Searchability**: Easy to find documents
6. **Context Optimization**: JSON enables efficient loading

## Remember

> **Every project document MUST exist in BOTH formats:**
> 1. Markdown in `/project-documents/`
> 2. JSON in `/machine-data/project-documents-json/`

This ensures both humans and AI agents can efficiently access project documentation.