---
allowed-tools: [Read, LS]
argument-hint: Optional: filter or project name to show specific documents
---

# List Documents

Display all project documents created by AgileAiAgents, including PRDs, research reports, sprint documentation, business documents, and technical specifications. Get a comprehensive overview of project documentation with quick access and summaries.

## Usage

```
/list-documents [optional: filter or project name]
```

**Examples:**
- `/list-documents` - Show all project documents
- `/list-documents current-project` - Show documents for specific project
- `/list-documents prd` - Show only PRD documents
- `/list-documents research` - Show research and analysis documents

## What This Does

1. **Document Discovery**: Scans project-documents directory for all AgileAiAgents files
2. **Content Analysis**: Reads document headers and summaries
3. **Categorization**: Groups documents by type and project
4. **Status Overview**: Shows completion status and recent updates
5. **Quick Access**: Provides file paths and key information

## Document Categories

### Project Requirements & Planning
- **PRDs**: Product Requirements Documents with user stories
- **Market Research**: Industry analysis and competitive intelligence
- **Business Plans**: Go-to-market strategies and business models
- **Technical Specifications**: Architecture and implementation plans

### Sprint & Development
- **Sprint Plans**: Sprint goals, stories, and acceptance criteria
- **Sprint Reviews**: Completion summaries and retrospectives
- **Implementation Notes**: Development decisions and code documentation
- **Testing Reports**: Test results and quality assurance documentation

### Business & Strategy
- **Pitch Decks**: Investor presentations and business cases
- **Financial Models**: Revenue projections and business metrics
- **Partnership Documents**: Collaboration and integration plans
- **Compliance Documentation**: Legal and regulatory requirements

### Technical Documentation
- **API Documentation**: Endpoint specifications and integration guides
- **Architecture Diagrams**: System design and component relationships
- **User Guides**: Feature documentation and help resources
- **Deployment Guides**: Infrastructure and operations documentation

## Document List Implementation

The command will:

1. **Scan Document Directory**
   ```bash
   # Check if project-documents exists
   ls -la project-documents/
   
   # List all document categories
   find project-documents/ -name "*.md" -o -name "*.json" | head -20
   ```

2. **Read Document Headers**
   - Extract title, date, and summary from each document
   - Identify document type and project association
   - Check last modified date and file size

3. **Generate Organized Listing**
   - Group by project and document type
   - Show completion status and key metrics
   - Provide quick access links and summaries

## Output Format

```markdown
# Project Documents Overview

## Summary Statistics
- 📁 **Total Documents**: [X] files
- 📋 **Active Projects**: [X] projects
- 📅 **Last Updated**: [Most recent document date]
- 💾 **Total Size**: [Combined file sizes]

---

## Current Project: [Project Name]

### 📋 Requirements & Planning
**Product Requirements Document (PRD)**
- 📄 File: `project-documents/current-project/prd-v1.2.md`
- 📅 Updated: 2024-01-15 10:30 AM
- 📊 Status: ✅ Complete (45 user stories, 12 epics)
- 🔍 Summary: Comprehensive PRD for AI-powered task management platform with user authentication, project management, and collaboration features.

**Market Research Report**
- 📄 File: `project-documents/current-project/market-research.md`
- 📅 Updated: 2024-01-14 2:15 PM
- 📊 Status: ✅ Complete ($2.3B TAM analysis)
- 🔍 Summary: Task management software market analysis showing 15% CAGR growth and key competitor insights.

### 🏃‍♂️ Sprint Documentation
**Sprint 1 Plan**
- 📄 File: `project-documents/current-project/sprint-1-plan.md`
- 📅 Updated: 2024-01-16 9:00 AM
- 📊 Status: 🟡 In Progress (Sprint Day 3/10)
- 🔍 Summary: Authentication system implementation with OAuth integration (8 stories, 21 story points).

**Sprint Retrospective - Sprint 0**
- 📄 File: `project-documents/current-project/sprint-0-retro.md`
- 📅 Updated: 2024-01-10 4:45 PM
- 📊 Status: ✅ Complete
- 🔍 Summary: Setup phase retrospective - infrastructure decisions, team coordination, and initial architecture.

### 💼 Business Documents
**Investor Pitch Deck**
- 📄 File: `project-documents/current-project/pitch-deck-v2.md`
- 📅 Updated: 2024-01-12 11:20 AM
- 📊 Status: ✅ Complete (15 slides)
- 🔍 Summary: Series A pitch deck for $2M funding round - market opportunity, product demo, financial projections.

**Go-to-Market Strategy**
- 📄 File: `project-documents/current-project/gtm-strategy.md`
- 📅 Updated: 2024-01-11 3:30 PM
- 📊 Status: ✅ Complete
- 🔍 Summary: Customer acquisition strategy focusing on SMB market with freemium model and content marketing.

### 🛠️ Technical Documentation
**API Documentation**
- 📄 File: `project-documents/current-project/api-docs.md`
- 📅 Updated: 2024-01-15 1:45 PM
- 📊 Status: 🟡 In Progress (12/18 endpoints documented)
- 🔍 Summary: REST API documentation with authentication, user management, and project endpoints.

**System Architecture**
- 📄 File: `project-documents/current-project/architecture.md`
- 📅 Updated: 2024-01-13 10:15 AM
- 📊 Status: ✅ Complete
- 🔍 Summary: Microservices architecture with React frontend, Node.js backend, PostgreSQL database.

---

## Previous Projects

### 📁 E-commerce Platform (Completed)
- 📋 **PRD**: `project-documents/ecommerce-platform/prd-final.md` (✅ Complete)
- 🏃‍♂️ **Sprints**: 4 sprints completed, all retrospectives documented
- 💼 **Business**: Pitch deck, financial model, market analysis
- 🛠️ **Technical**: Full API docs, deployment guides, user manuals
- 📅 **Completed**: 2023-12-20

### 📁 Healthcare App (In Progress)
- 📋 **PRD**: `project-documents/healthcare-app/prd-v1.0.md` (🟡 Draft)
- 🔍 **Research**: `project-documents/healthcare-app/market-research.md` (✅ Complete)
- 📊 **Status**: Requirements phase, sprint planning in progress

---

## Document Types Summary

### 📋 Requirements (5 documents)
- PRDs: 3 complete, 1 in progress
- User stories: 127 total across all projects
- Acceptance criteria: 89% coverage

### 🔍 Research (8 documents)
- Market analysis: 4 completed
- Competitive intelligence: 3 completed  
- Technology assessments: 1 in progress

### 🏃‍♂️ Sprint Management (12 documents)
- Sprint plans: 6 completed
- Sprint reviews: 5 completed
- Retrospectives: 4 completed
- Backlog documents: 3 active

### 💼 Business Documents (6 documents)
- Pitch decks: 2 completed
- Business plans: 2 completed
- Financial models: 1 completed
- Partnership docs: 1 in progress

### 🛠️ Technical (9 documents)
- API documentation: 3 completed, 1 in progress
- Architecture docs: 3 completed
- User guides: 2 completed
- Deployment guides: 1 completed

---

## Quick Actions

### Recently Updated (Last 7 Days)
1. 📄 `project-documents/current-project/prd-v1.2.md` - 2 days ago
2. 📄 `project-documents/current-project/sprint-1-plan.md` - 1 day ago
3. 📄 `project-documents/healthcare-app/prd-v1.0.md` - 3 days ago

### Needs Attention
- 🔄 **API Documentation**: 6 endpoints pending documentation
- ⏰ **Sprint Review**: Sprint 1 review scheduled for tomorrow
- 📝 **PRD Update**: Healthcare app PRD needs stakeholder review

### Document Health
- ✅ **Up to Date**: 23 documents (82%)
- ⚠️ **Needs Review**: 4 documents (14%)
- 🔄 **In Progress**: 1 document (4%)

## Navigation Shortcuts

### By Project
- [Current Project Documents](#current-project-project-name)
- [Previous Projects](#previous-projects)
- [Templates and Examples](#templates)

### By Document Type
- [Requirements & PRDs](#requirements--planning)
- [Research & Analysis](#research--analysis)
- [Sprint Documentation](#sprint--development)
- [Business Documents](#business--strategy)
- [Technical Documentation](#technical-documentation)

### By Status
- [Active Documents](#active-documents)
- [Completed Documents](#completed-documents)
- [Draft Documents](#draft-documents)

## Search and Filter Options

To find specific documents:
- **By content**: Use `/list-documents api` to find API-related docs
- **By date**: Use `/list-documents recent` for last 30 days
- **By status**: Use `/list-documents draft` for incomplete documents
- **By project**: Use `/list-documents [project-name]` for project-specific docs

## Document Statistics

### Content Metrics
- **Average PRD Length**: 2,400 words
- **User Stories per Project**: 32 average
- **Documentation Coverage**: 94% of features documented
- **Update Frequency**: 3.2 documents updated per week

### Quality Indicators
- **Completeness**: 87% of documents marked complete
- **Recency**: 78% updated within last 30 days
- **Cross-references**: 156 internal links validated
- **Stakeholder Approval**: 92% approval rate
```

## Implementation Logic

The command will execute:

1. **Directory Scanning**
   ```bash
   # Find all project documents
   find agile-ai-agents/project-documents/ -type f \( -name "*.md" -o -name "*.json" \) | sort
   ```

2. **Document Analysis**
   - Read first 200 characters of each file for summary
   - Extract metadata from YAML frontmatter if present
   - Determine document type from filename and content
   - Check file modification dates and sizes

3. **Content Organization**
   - Group documents by project folder
   - Categorize by document type (PRD, research, sprint, etc.)
   - Sort by recency and importance
   - Generate status indicators based on content

4. **Summary Generation**
   - Calculate totals and statistics
   - Identify recently updated documents
   - Flag documents needing attention
   - Create quick navigation links

## Quality Standards

**Document Discovery**
- [ ] All project documents found and catalogued
- [ ] File metadata accurately captured
- [ ] Document types correctly identified
- [ ] Project associations properly mapped

**Content Analysis**
- [ ] Document summaries accurately reflect content
- [ ] Status indicators based on actual completion
- [ ] Cross-references validated and working
- [ ] Update timestamps accurate

**Organization & Navigation**
- [ ] Logical grouping by project and type
- [ ] Clear status indicators and progress tracking
- [ ] Quick access links and shortcuts provided
- [ ] Search and filter options functional

## Follow-up Commands

After reviewing document list:
- `/generate-prd` - Create new product requirements document
- `/generate-pitch-deck` - Create investor presentation
- `/generate-documentation` - Generate technical documentation
- `/research-only` - Conduct additional research
- `/sprint-status` - Check current sprint progress
- `/milestone` - Review project milestones