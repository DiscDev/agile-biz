---
allowed-tools: Read(*), Glob(*)
description: Display all project decisions in organized format
argument-hint: "[filter] or --recent or --by-category"
---

# Show Decisions

Display all project decisions with filtering and organization options.

## Decision Data Sources

1. **Primary Sources**
   - `project-state/decisions/decisions-log.json`
   - Individual decision files in `project-state/decisions/`
   - Embedded decisions in checkpoint files
   - Decision references in project documents

2. **Decision Categories**
   - Architecture decisions
   - Technology choices
   - Business decisions
   - Process decisions
   - Design decisions

## Display Options

Parse $ARGUMENTS for display preferences:
- `--recent`: Show last 10 decisions
- `--by-category`: Group by decision type
- `--by-date`: Chronological order
- `[filter]`: Filter by keyword or category
- No arguments: Show all decisions organized

## Decision Information

For each decision, display:
- Decision ID and title
- Date and time made
- Category/type
- Current status (active/superseded)
- Impact level
- Decision maker
- Rationale summary

## Output Formats

### Default View (All Decisions)
```
📋 PROJECT DECISIONS
====================

🏗️  Architecture Decisions
  [001] Microservices Architecture          2025-01-15  ✅ Active
        → Chose microservices over monolithic for scalability
        
  [003] Database Selection                  2025-01-14  ✅ Active  
        → PostgreSQL for ACID compliance and performance
        
  [007] API Design Pattern                  2025-01-12  ✅ Active
        → RESTful APIs with GraphQL for complex queries

💻 Technology Decisions  
  [002] Frontend Framework                  2025-01-15  ✅ Active
        → React with TypeScript for type safety
        
  [005] State Management                    2025-01-13  ❌ Superseded
        → Redux (superseded by decision #012)
        
  [012] State Management v2                 2025-01-11  ✅ Active
        → Zustand for simpler state management

🔄 Process Decisions
  [004] Sprint Duration                     2025-01-14  ✅ Active
        → 2-week sprints for better predictability
        
  [008] Code Review Process                 2025-01-12  ✅ Active
        → Mandatory peer review for all PRs

Total: 15 decisions (12 active, 3 superseded)
```

### Recent View (--recent)
```
📋 RECENT DECISIONS (Last 10)
==============================

[015] 🏗️  API Rate Limiting Strategy        2025-01-16 14:30
      Implement token bucket algorithm for API rate limiting
      Impact: High | Status: Active

[014] 💻 Testing Framework Selection         2025-01-16 10:15  
      Jest + React Testing Library for frontend testing
      Impact: Medium | Status: Active

[013] 🔄 Deployment Strategy                 2025-01-15 16:45
      Blue-green deployment for zero downtime
      Impact: High | Status: Active

[Shows 10 most recent decisions with timestamp and impact]
```

### Category View (--by-category)
```
📋 DECISIONS BY CATEGORY
========================

🏗️  ARCHITECTURE (5 decisions)
├── [001] Microservices Architecture ✅
├── [003] Database Selection ✅  
├── [007] API Design Pattern ✅
├── [013] Deployment Strategy ✅
└── [015] API Rate Limiting ✅

💻 TECHNOLOGY (4 decisions)  
├── [002] Frontend Framework ✅
├── [005] State Management ❌ (superseded)
├── [012] State Management v2 ✅
└── [014] Testing Framework ✅

🔄 PROCESS (3 decisions)
├── [004] Sprint Duration ✅
├── [008] Code Review Process ✅  
└── [011] Definition of Done ✅
```

## Decision Details

Show detailed information for specific decisions:
- Full rationale and context
- Alternative options considered
- Decision criteria used
- Implementation status
- Related decisions
- Review schedule

## Search and Filtering

Support various filters:
- By keyword: `/show-decisions authentication`
- By date range: `/show-decisions --since 2025-01-10`
- By status: `/show-decisions --active`
- By impact: `/show-decisions --high-impact`

## Decision Analytics

- Decision velocity (decisions per week)
- Most common decision categories
- Average time to implement decisions
- Decision reversal rate