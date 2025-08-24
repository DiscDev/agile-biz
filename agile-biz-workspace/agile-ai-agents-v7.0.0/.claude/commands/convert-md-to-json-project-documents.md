---
allowed-tools: [Task]
argument-hint: Optional: project name or document type to convert (prd, research, sprints, business)
---

# Convert MD to JSON - Project Documents

Convert project documentation files from markdown to JSON format for 80-90% token reduction and faster project context loading. Transform PRDs, research reports, sprint documentation, business plans, and technical specifications into structured JSON while preserving all project-specific information.

## Usage

```
/convert-md-to-json-project-documents [optional: project name or document type]
```

**Examples:**
- `/convert-md-to-json-project-documents` - Convert all project documentation
- `/convert-md-to-json-project-documents current-project` - Convert specific project
- `/convert-md-to-json-project-documents prd` - Convert all PRD documents
- `/convert-md-to-json-project-documents research` - Convert research and analysis documents

## What This Does

1. **Project Discovery**: Scans `project-documents/` for all project documentation
2. **Document Classification**: Categorizes by type (PRD, research, sprint, business)
3. **Content Structuring**: Extracts key information, requirements, and project data
4. **JSON Optimization**: Achieves 80-90% token reduction with preserved project context
5. **Cross-Reference Mapping**: Maintains relationships between project documents

## Token Savings Benefits

### Before Conversion (Project Markdown)
- **Large PRDs**: 15,000-25,000 tokens per comprehensive PRD
- **Research Reports**: 8,000-12,000 tokens per market analysis
- **Sprint Documentation**: 5,000-8,000 tokens per sprint cycle
- **Business Plans**: 12,000-20,000 tokens per business strategy

### After Conversion (Project JSON)
- **PRD Summaries**: 2,000-3,000 tokens with drill-down capability
- **Research Summaries**: 1,000-1,500 tokens with key insights
- **Sprint Summaries**: 800-1,200 tokens with progress tracking
- **Business Summaries**: 1,500-2,500 tokens with strategic overview

**Result**: 85% average token reduction with enhanced project navigation

## Project Document Categories

### Product Requirements & Planning
- **PRDs**: Product Requirements Documents with user stories and acceptance criteria
- **Technical Specifications**: Architecture decisions and implementation requirements
- **User Research**: User interviews, surveys, and behavioral analysis
- **Competitive Analysis**: Market positioning and competitor feature comparison

### Research & Strategy Documents
- **Market Research**: Industry analysis, TAM/SAM calculations, and growth projections
- **Business Plans**: Go-to-market strategy, revenue models, and financial projections
- **Risk Analysis**: Technical risks, market risks, and mitigation strategies
- **Partnership Documents**: Integration requirements and collaboration plans

### Sprint & Development Documentation
- **Sprint Plans**: Sprint goals, user stories, and acceptance criteria
- **Sprint Reviews**: Completion summaries, demos, and stakeholder feedback
- **Sprint Retrospectives**: Team insights, process improvements, and lessons learned
- **Backlog Documents**: Prioritized features, epic breakdowns, and story mapping

### Business & Presentation Documents
- **Pitch Decks**: Investor presentations with market opportunity and financial models
- **Executive Summaries**: High-level project overviews for stakeholder communication
- **Financial Models**: Revenue projections, cost analysis, and ROI calculations
- **Compliance Documentation**: Legal requirements, privacy policies, and regulatory compliance

## Conversion Process

This command uses the Task tool to engage document_manager_agent for:

1. **Project Document Discovery**
   ```json
   {
     "task": "discover_project_documents",
     "target_directory": "project-documents/",
     "classification_criteria": [
       "document_type_identification",
       "project_association",
       "completion_status",
       "information_density"
     ]
   }
   ```

2. **Content Structure Analysis**
   ```json
   {
     "task": "analyze_document_structures",
     "analysis_focus": {
       "requirements_extraction": "user stories, acceptance criteria, business rules",
       "research_insights": "key findings, market data, strategic recommendations",
       "progress_tracking": "sprint status, completion metrics, blockers",
       "business_intelligence": "financial data, market positioning, growth strategy"
     }
   }
   ```

3. **Cross-Document Relationship Mapping**
   ```json
   {
     "task": "map_document_relationships",
     "relationship_types": [
       "requirement_dependencies",
       "sprint_progression_chains",
       "research_to_strategy_links",
       "business_to_technical_alignment"
     ]
   }
   ```

4. **JSON Schema Optimization**
   ```json
   {
     "task": "optimize_project_schemas",
     "optimization_goals": {
       "fast_project_overview": true,
       "progressive_detail_loading": true,
       "cross_reference_navigation": true,
       "search_and_filter_capability": true
     }
   }
   ```

## Expected JSON Output Structure

### Project Document Index
```json
{
  "meta": {
    "conversion_date": "2025-01-29T12:00:00Z",
    "source_directory": "project-documents/",
    "total_projects": 5,
    "total_documents": 67,
    "token_reduction": "85%",
    "original_tokens": 720000,
    "optimized_tokens": 108000
  },
  "project_index": {
    "current_project": {
      "project_name": "AI Task Management Platform",
      "status": "active_development",
      "total_documents": 23,
      "token_reduction": "87%",
      "documents": {
        "prd": {
          "file": "current-project-prd.json",
          "summary": "Comprehensive PRD for AI-powered task management with 45 user stories",
          "token_count": 2800,
          "original_tokens": 22000,
          "last_updated": "2025-01-28"
        },
        "market_research": {
          "file": "current-project-research.json",
          "summary": "$2.3B TAM analysis with competitor insights and growth projections",
          "token_count": 1400,
          "original_tokens": 11500,
          "last_updated": "2025-01-25"
        }
      }
    }
  }
}
```

### PRD Document Structure
```json
{
  "meta": {
    "document_type": "product_requirements_document",
    "project_name": "AI Task Management Platform",
    "version": "1.2",
    "source_file": "current-project/prd-v1.2.md",
    "conversion_date": "2025-01-29T12:00:00Z",
    "token_reduction": "87%",
    "original_tokens": 22000,
    "optimized_tokens": 2800
  },
  "executive_summary": {
    "product_vision": "AI-powered task management platform for remote teams",
    "target_market": "SMB and enterprise teams (10-500 employees)",
    "key_differentiators": ["AI-powered prioritization", "Real-time collaboration", "Advanced analytics"],
    "success_metrics": ["50% productivity improvement", "90% user retention", "$10M ARR target"]
  },
  "market_opportunity": {
    "tam": "$2.3B",
    "sam": "$450M", 
    "som": "$45M",
    "growth_rate": "15% CAGR",
    "key_trends": ["Remote work adoption", "AI automation demand", "Productivity tool consolidation"]
  },
  "user_stories": {
    "total_stories": 45,
    "epic_breakdown": {
      "authentication": 8,
      "project_management": 15,
      "collaboration": 12,
      "analytics": 10
    },
    "priority_distribution": {
      "must_have": 28,
      "should_have": 12, 
      "could_have": 5
    },
    "completion_status": {
      "completed": 18,
      "in_progress": 12,
      "not_started": 15
    }
  },
  "technical_requirements": {
    "architecture": "Microservices with React frontend",
    "database": "PostgreSQL with Redis caching",
    "authentication": "OAuth 2.0 with JWT tokens",
    "apis": "RESTful with GraphQL for complex queries",
    "performance": "Sub-200ms response times, 99.9% uptime"
  },
  "business_requirements": {
    "revenue_model": "Freemium with tiered subscriptions",
    "pricing_strategy": "$0/$15/$45 per user per month",
    "go_to_market": "Product-led growth with content marketing",
    "success_metrics": ["MRR growth", "User activation rate", "Feature adoption"]
  },
  "md_reference": {
    "full_document_path": "project-documents/current-project/prd-v1.2.md",
    "section_references": {
      "complete_user_stories": "Lines 200-800",
      "technical_specifications": "Lines 850-1200",
      "business_model_details": "Lines 1250-1500"
    }
  }
}
```

### Research Document Structure  
```json
{
  "meta": {
    "document_type": "market_research",
    "project_name": "AI Task Management Platform",
    "source_file": "current-project/market-research.md",
    "conversion_date": "2025-01-29T12:00:00Z",
    "token_reduction": "88%",
    "original_tokens": 11500,
    "optimized_tokens": 1380
  },
  "executive_summary": {
    "market_size": "$2.3B TAM with 15% CAGR growth",
    "key_opportunity": "AI-powered productivity tools market gap",
    "competitive_landscape": "Fragmented market with room for innovation",
    "strategic_recommendation": "Focus on SMB segment with freemium model"
  },
  "market_analysis": {
    "tam": "$2.3B",
    "sam": "$450M",
    "som": "$45M",
    "growth_drivers": [
      "Remote work trend acceleration",
      "AI/ML adoption in productivity tools", 
      "Team collaboration tool consolidation"
    ],
    "market_trends": [
      "15% annual growth in task management software",
      "67% increase in remote work since 2020",
      "AI feature adoption rate: 34% YoY growth"
    ]
  },
  "competitive_analysis": {
    "direct_competitors": {
      "asana": {
        "market_share": "23%",
        "strengths": ["User experience", "Integrations"],
        "weaknesses": ["Limited AI features", "Complex pricing"]
      },
      "trello": {
        "market_share": "18%",
        "strengths": ["Simplicity", "Atlassian ecosystem"],
        "weaknesses": ["Limited advanced features", "Scalability issues"]
      }
    },
    "competitive_advantages": [
      "AI-powered task prioritization",
      "Real-time collaborative editing",
      "Advanced analytics and insights"
    ]
  },
  "target_customers": {
    "primary": {
      "segment": "SMB teams (10-50 employees)",
      "pain_points": ["Task prioritization", "Team coordination", "Progress tracking"],
      "buying_criteria": ["Ease of use", "Integration capabilities", "Cost effectiveness"]
    },
    "secondary": {
      "segment": "Enterprise teams (50-500 employees)",
      "pain_points": ["Cross-team visibility", "Resource allocation", "Performance analytics"],
      "buying_criteria": ["Security", "Scalability", "Advanced reporting"]
    }
  },
  "md_reference": {
    "full_document_path": "project-documents/current-project/market-research.md",
    "section_references": {
      "detailed_competitor_analysis": "Lines 300-600",
      "customer_interview_insights": "Lines 650-850",
      "market_sizing_methodology": "Lines 900-1000"
    }
  }
}
```

## Progressive Loading Strategy

1. **Project Overview (300 tokens)**: Load project index with summary statistics
2. **Document Summaries (500 tokens)**: Load key insights and executive summaries  
3. **Detailed Content (Full MD)**: Load complete documentation when needed

## Implementation Steps

1. **Project Structure Analysis**
   - Scan project-documents directory for all projects
   - Identify document types and classification patterns
   - Analyze document relationships and dependencies
   - Generate project completion and health metrics

2. **Content Extraction & Structuring**
   - Extract key information from each document type
   - Preserve critical project data and requirements
   - Maintain cross-document relationships and references
   - Create searchable summaries and insights

3. **JSON Schema Generation**
   - Convert to optimized JSON structure with progressive loading
   - Create project-level indices for fast navigation
   - Generate cross-reference links and relationships
   - Implement search and filtering capabilities

4. **Quality Validation**
   - Ensure all project information is preserved
   - Validate cross-references and document relationships
   - Test progressive loading and drill-down functionality
   - Confirm token reduction targets are met

## Success Metrics

**Token Optimization**
- [ ] 80-90% token reduction across all project documents
- [ ] Project overviews loadable in <300 tokens
- [ ] Document summaries accessible in <500 tokens
- [ ] Preserved ability to access full detail when needed

**Information Preservation**
- [ ] All user stories and requirements preserved
- [ ] Market research insights and data maintained
- [ ] Sprint progress and metrics accurately represented
- [ ] Business strategy and financial data intact

**Navigation Enhancement**
- [ ] Fast project switching and document discovery
- [ ] Cross-document relationship navigation
- [ ] Search and filtering capabilities improved
- [ ] Progressive detail loading functional

## Output Summary

```
📋 Project Documents Conversion Complete
=======================================

📊 Conversion Statistics:
  Projects Processed: [X] projects
  Documents Converted: [X] files
  Token Reduction: 85% average
  Original Tokens: 720,000
  Optimized Tokens: 108,000

📁 Generated Files:
  Project JSON Files: [X] files created
  Project Index: project-documents-index.json
  Cross-Reference Map: project-relationships.json

⚡ Performance Gains:
  Project Loading: 80% faster
  Document Discovery: 90% improvement
  Context Switching: Instant
  Memory Usage: 85% reduction

📈 Project Health Overview:
  Active Projects: [X]
  Completed Projects: [X] 
  Total User Stories: [XXX]
  Documentation Coverage: XX%

✅ Quality Validation:
  Information Completeness: 100%
  Cross-Reference Integrity: 100%
  Progressive Loading: Functional
  Search Capabilities: Enhanced
```

## Follow-up Commands

After project document conversion:
- `/convert-md-to-json-ai-agents` - Convert agent documentation
- `/convert-md-to-json-aaa-documents` - Convert system documentation  
- `/convert-all-md-to-json` - Complete system-wide conversion
- `/list-documents` - View optimized project document structure