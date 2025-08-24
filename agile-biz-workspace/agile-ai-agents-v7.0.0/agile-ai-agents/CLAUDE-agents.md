# CLAUDE-agents.md

**PATH CONVENTION**: All file paths in this document are relative to the `agile-ai-agents/` directory.

This file contains the Universal Agent Guidelines that all agents in the AgileAiAgents system MUST follow. These guidelines ensure consistency, quality, and proper coordination across all 38 specialized agents.

## Agent File Locations and Usage Guide

**CRITICAL**: There are three locations for agent files, each serving a specific purpose. Claude Code must understand when to use each:

### 📁 Agent File Locations

#### 1. **`ai-agents/`** - Original Markdown Documentation
- **What**: Full agent documentation in markdown format
- **Size**: 8,000-12,000 tokens per agent (38 agents total)
- **When to Use**:
  - Initial agent understanding and learning
  - When full context and examples are needed
  - For human reading and documentation updates
  - When creating new agents or modifying existing ones
- **Example**: `ai-agents/coder_agent.md`

#### 2. **`machine-data/ai-agents-json/`** - Optimized JSON Format
- **What**: Token-optimized JSON versions (85% reduction)
- **Size**: 800-1,500 tokens per agent summary
- **When to Use**:
  - **PRIMARY CHOICE for agent operations**
  - Quick agent capability matching
  - Inter-agent coordination planning
  - Progressive loading (minimal → standard → detailed)
  - When context budget is limited
- **Key Files**:
  - `agent-index.json` - Fast agent discovery
  - `coordination-maps.json` - Inter-agent relationships
  - Individual agent JSONs (e.g., `coder_agent.json`)

#### 3. **`.claude/agents/`** - Native Claude Code Sub-Agents
- **What**: Claude Code's native sub-agent definitions
- **Size**: Variable, optimized for Claude Code
- **When to Use**:
  - When using the `/agents` command
  - For parallel task execution via Task tool
  - When Claude Code needs to spawn sub-agents
  - For autonomous task delegation
- **Example**: `.claude/agents/coder_agent.md`

### 🎯 Usage Decision Tree

```
Need Agent Information?
├── Quick capability check? → Use ai-agents-json/agent-index.json
├── Planning coordination? → Use ai-agents-json/coordination-maps.json
├── Implementing with agent? → Use ai-agents-json/[agent].json (standard load)
├── Spawning sub-agent? → Use .claude/agents/ via Task tool
├── Reading full docs? → Use ai-agents/[agent].md
└── Updating agent? → Edit ai-agents/[agent].md

Context Budget?
├── < 500 tokens → Use JSON minimal load
├── 500-1000 tokens → Use JSON standard load
├── 1000-2000 tokens → Use JSON detailed load
└── > 2000 tokens → Can use full markdown if needed
```

### 💡 Best Practices

1. **Always start with JSON** (`ai-agents-json/`) for agent operations
2. **Use progressive loading** to minimize token usage:
   - Minimal: Meta + summary only (180 tokens)
   - Standard: + capabilities + workflows (320 tokens)
   - Detailed: + coordination + tools (580 tokens)
3. **Reference markdown** only when full examples needed
4. **Use Task tool** with `.claude/agents/` for parallel execution
5. **Check coordination-maps.json** before multi-agent workflows

## 1. GitHub Markdown Formatting Standards

**CRITICAL**: All agents must follow GitHub markdown best practices when creating or editing documents.

### Core Formatting Requirements

**Reference Documentation:**
- **Complete Style Guide**: `machine-data/aaa-documents-json/github-markdown-style-guide.json`
- **Agent Examples**: `aaa-documents/markdown-examples/` (5 category examples)

**Basic Standards (ALL agents must follow):**
- Use `*` for unordered lists, never `-` or `+`
- Start document sections with `##` (reserve `#` for document title only)
- Always specify language in code blocks: ` ```javascript`, ` ```bash`, ` ```yaml`
- Use descriptive link text: `[GitHub documentation](url)` not `[click here](url)`
- Right-align numeric columns in tables: `| Numbers |` with `|--------:|`
- Use proper heading hierarchy (don't skip levels)

**Agent-Specific Formatting Levels:**

**Development Agents** (Basic + Intermediate):
- Code blocks with specific language identifiers
- Technical tables for configurations and parameters  
- Collapsible sections `<details>` for verbose technical details
- Task lists `- [ ]` for implementation steps

**Business & Strategy Agents** (Basic + Intermediate + Advanced):
- Mathematical expressions using LaTeX: `$ROI = \frac{Revenue - Cost}{Cost}$`
- Tables with right-aligned numeric data
- Blockquotes `>` for key insights
- Financial calculations in block format: `$$formula$$`

**Growth & Revenue Agents** (Basic + Intermediate):
- Metrics tables with right-aligned numbers
- Mermaid diagrams for funnel visualization: ` ```mermaid`
- Code blocks for tracking implementations
- Conversion calculation formulas

**Technical Integration Agents** (Basic + Advanced):
- Multi-language code blocks (JavaScript, Python, Go, etc.)
- API parameter tables with proper alignment
- System architecture diagrams using Mermaid
- Complex technical documentation structures

**Support Agents** (All formatting levels as needed):
- Accessibility requirements (alt text, semantic headers)
- Cross-references to other documents
- Comprehensive formatting for maximum clarity
- All GitHub extended syntax when appropriate

### Quality Validation Checklist

Before creating any document, verify:
- [ ] Headers start with `##` (not `#`)
- [ ] Lists use `*` (not `-`)
- [ ] Code blocks specify language
- [ ] Links use descriptive text
- [ ] Tables use proper alignment
- [ ] Mathematical expressions use LaTeX syntax (when applicable)
- [ ] Diagrams use Mermaid (when applicable)
- [ ] Collapsible sections for complex content (when applicable)
- [ ] Document serves AgileAiAgents system goals
- [ ] Structure is logical and scannable
- [ ] Cross-references are working and relevant

## 2. Workflow Command Awareness

All agents must recognize and handle workflow commands appropriately:

### Primary Commands
- `/new-project-workflow` - Initiates structured new project discovery
- `/existing-project-workflow` - Analyzes code then plans enhancements
- `/quickstart` - Shows interactive menu
- `/aaa-help` - Displays available AgileAiAgents commands

### Agent-Specific Command Responsibilities
- **Project Analyzer Agent**: Handles initial interviews for both workflow commands
- **Scrum Master Agent**: Manages `/quickstart` and `/aaa-help` commands
- **Code Analyzer Agent**: Performs initial analysis for existing project workflow
- **Research Coordinator Agent**: Presents research depth options
- **All Agents**: Must check for commands before processing direct input

### Implementation Requirements
- Check `machine-data/aaa-documents-json/command-detection.json` for complete registry
- Update `workflow_state` when commands initiate workflows
- Follow section-by-section interview patterns with approvals
- Support minimal/medium/thorough research depth selection
- Support quick/standard/deep analysis for existing projects

## 3. Auto-Save and State Management Awareness

All agents must properly signal state-worthy events:

### Auto-Save Triggers
- Document creation: When creating any .md file
- Section completion: When stakeholder approves interview section
- Phase transitions: When workflow moves to next phase
- Decisions: When recording decisions with rationale
- Errors: When catching or handling errors

### State Commands (New Format)
- `/checkpoint` - Create manual checkpoint
- `/aaa-status` - Show project status
- `/update-state` - Manual state update
- `/save-decision` - Save important decision
- `/continue` - Resume previous work

### Agent Responsibilities
- Signal appropriate events to Project State Manager
- Include context with state updates
- Don't save state directly - let Project State Manager handle it
- Respect confirmation_style setting (silent/minimal/verbose)

## 4. Community Contribution Awareness

### Contribution Commands
- `/sprint-retrospective` - Triggers contribution after retrospective
- `/milestone [description]` - Records milestone and triggers contribution
- `/deployment-success` - Marks deployment and triggers contribution
- `/project-complete` - Final project contribution
- `/capture-learnings` - Manually capture learnings
- `/learn-from-contributions-workflow` - Run 7-phase learning analysis

### Agent Trigger Responsibilities
- **Scrum Master**: Signal after `/sprint-retrospective`
- **Project Manager**: Signal after `/milestone` and `/project-complete`
- **DevOps**: Signal after `/deployment-success`
- **Learning Analysis**: Handle all contribution commands and workflow

### Archive System
- `archive/implemented/` - Successfully implemented patterns
- `archive/rejected/` - Patterns not implemented
- `archive/failed/` - Failed implementation attempts
- `archive/partial/` - Partially successful implementations
- All implementations archived immediately

## 5. JSON Context Optimization

### System Overview
- All agents create documents as `.md` files first
- Document Manager Agent auto-converts to JSON
- JSON format uses 80-90% fewer tokens
- Never manually create or edit JSON files

### Conversion Commands
```bash
/convert-md-to-json-aaa-documents      # Convert aaa-documents
/convert-md-to-json-ai-agents          # Convert agents
/convert-md-to-json-project-documents  # Convert project docs
/convert-all-md-to-json                # Run all conversions
```

### Best Practices
- Always create documents as markdown first
- Load from JSON paths for agent operations
- Check conversion reports in `machine-data/conversion-reports/`

## 5a. Document Registry System (NEW)

### Registry Overview
- **Location**: `machine-data/project-document-registry.json`
- **Purpose**: Central index of all project documents for efficient agent access
- **Token Savings**: Enables 80-90% context reduction through targeted loading
- **Real-time Updates**: Automatically tracks document creation, updates, and deletions

### How Agents Use the Registry

#### Finding Documents
```javascript
// Load the registry
const registry = JSON.parse(fs.readFileSync('machine-data/project-document-registry.json'));

// Find all documents in a category
const orchestrationDocs = registry.documents.orchestration;

// Search for specific documents
const sprintDocs = Object.entries(registry.documents)
  .flatMap(([category, docs]) => 
    Object.entries(docs).filter(([name, doc]) => 
      name.includes('sprint') || doc.summary.includes('sprint')
    )
  );

// Load only JSON versions for efficiency
for (const [name, doc] of Object.entries(sprintDocs)) {
  if (doc.json) {
    // Load JSON version (80-90% fewer tokens)
    const content = JSON.parse(fs.readFileSync(doc.json));
  } else {
    // Fallback to MD if JSON not available
    const content = fs.readFileSync(doc.md);
  }
}
```

#### Registry Commands for Agents
- `/registry-stats` - Check document coverage and token usage
- `/registry-display` - View full registry contents
- `/registry-find "search-term"` - Search for specific documents

### Registry Structure
```json
{
  "version": 2,
  "last_updated": "2025-08-11T23:05:20.241Z",
  "document_count": 142,
  "documents": {
    "orchestration": {
      "project_log": {
        "md": "project-documents/orchestration/project-log.md",
        "json": "machine-data/project-documents-json/orchestration/project-log.json",
        "tokens": { "md": 1234, "json": 456 },
        "summary": "Tracks all project activities and decisions made during development",
        "deps": ["stakeholder-decisions.md"],
        "agent": "Scrum Master",
        "created": "2025-08-11T10:00:00Z",
        "modified": "2025-08-11T23:00:00Z"
      }
    }
  }
}
```

### Agent Best Practices with Registry
1. **Always check registry first** before searching for documents
2. **Prefer JSON versions** when available (check `doc.json` field)
3. **Use summaries** to determine relevance before loading full documents
4. **Track dependencies** to load related documents when needed
5. **Monitor token usage** via `doc.tokens` to stay within limits

### Registry Maintenance
- **Automatic Updates**: Hooks track all document changes
- **Queue System**: Prevents conflicts during concurrent updates
- **Version Tracking**: Each update increments registry version
- **Token Counting**: Automatic calculation for both MD and JSON

## 6. Document Creation Protocol

### CRITICAL Security Rules
- **MANDATORY**: Use `FileOperationManager` for ALL file operations
- **PROHIBITED**: Direct use of `fs.writeFile`, `fs.mkdir`
- **REQUIRED**: Pre-flight path validation for every operation
- **BLOCKED**: Autonomous directory creation is disabled

### Secure File Operations Example
```javascript
// CORRECT: Use FileOperationManager
const FileOperationManager = require('./machine-data/file-operation-manager');
const fileManager = new FileOperationManager();
await fileManager.writeDocument(content, 'business-strategy/research', 'market-analysis.md', 'research_agent');

// INCORRECT: Direct file operations (WILL FAIL)
// fs.writeFile('file.md', content); // BLOCKED
// fs.mkdirSync('folder'); // DISABLED
```

### Document Requirements
- Use category-based folders (v3.0.0) - NO numbered folders
- ALL document creation coordinated through Scrum Master Agent
- Follow folder structure in `project-folder-structure-categories.json`
- Include proper metadata headers
- NEVER create new folders - use existing 30 folders only
- For research documents, follow verification standards

## 7. Sprint Organization Structure

- Sprint naming: `sprint-YYYY-MM-DD-feature-name`
- All sprint docs in: `project-documents/orchestration/sprints/[sprint-name]/`
- Each sprint folder contains: planning, tracking, review, retrospective, testing
- State transitions: planning → active → testing → review → retrospective → completed
- Update document-registry.md for every document created

## 8. AI-Native Sprint Pulse System

**CRITICAL FOR SCRUM MASTER**:
- NO time-based updates (no daily standups)
- All updates are EVENT-DRIVEN
- Pulse naming: `pulse-YYYY-MM-DD-HHMMSS-[event-type].md`
- Event types: sprint-start, story-done, blocker-new, blocker-resolved, milestone
- Located in: `sprints/[sprint-name]/pulse-updates/`
- Benefits: Real-time visibility, meaningful updates only

## 9. Defensive Programming Standards

- MANDATORY for all frontend code
- Use optional chaining (?.) for all object property access
- Provide meaningful fallbacks for all data operations
- Validate API responses before state updates
- Never assume data structure or availability
- Implement error boundaries for React components

## 10. Inter-Agent Communication

- Use standardized handoff patterns (Sequential, Parallel, Collaborative, Iterative)
- Document all agent interactions in `agent-coordination.md`
- Include clear input/output contracts between agents
- Maintain handoff state in Project State Manager

## 11. File Path Standards

- ALWAYS use relative paths from the agile-ai-agents directory
- Never use relative paths that could be ambiguous
- Quote paths with spaces in bash commands
- Verify parent directory exists before creating new directories

## 12. Error Handling and Reporting

- Log all errors to `project-documents/orchestration/project-log.md`
- Include timestamp, agent name, error type, and remediation steps
- Escalate blocking errors to Project Manager Agent
- Never fail silently - always provide meaningful error messages

## 13. Project State Management

- Use relative paths only (never absolute paths like /Users/...)
- State includes: current task, decisions, files, sprint info, learnings
- Checkpoints created automatically every 30 minutes
- Dashboard Integration at http://localhost:3001
- Commands: `/aaa-status`, `/continue`, `/checkpoint`, `/save-decision`

## 14. Product Backlog State

- **Project Manager Agent**: Owns `backlog-state.json`
- **Scrum Master Agent**: Owns `velocity-metrics.json`
- Files in `project-documents/orchestration/product-backlog/`
- Clean templates with 0 items/points in new releases
- Velocity profiles: Web App (45pts), API (65pts), SaaS MVP (40pts), etc.

## 15. Research Verification Standards

All research and data-driven documents MUST:
- Use configured verification level (document > agent > global)
- Utilize MCP servers when available for real-time data
- Separate verified facts from analysis and opinions
- Include source metadata for all claims requiring verification
- Apply confidence scores and uncertainty flags

## 16. Testing and Quality Gates

- Console error detection is MANDATORY
- Authentication testing MUST start with unauthenticated state
- Use real browser testing for UI validation
- Run `npm test` before committing code changes
- Document test coverage in sprint testing documents

## 17. Project Structure and Repository Evolution

All agents must be aware of:
- Always start with single repository
- Monitor health metrics (build time, team size, merge conflicts)
- Evolution triggers: 15min builds, 6+ team size, 25%+ merge conflicts
- Common patterns: marketing split (month 2-3), API extraction (month 4-6)
- Coordinate with Project Structure Agent for evolution decisions

## 18. Tech Stack-Specific Scaffolding

- Templates in `templates/project-scaffolds/`
- Structure must be approved in Phase 1 Section 2.5
- NEVER put frontend code in project root when backend exists
- ALWAYS use template matching approved stack
- Update CLAUDE.md with structure documentation after scaffolding

## 19. Hooks System Awareness

Key Hook Events Agents Should Trigger:
- `file.created` - When creating any document
- `file.modified` - When updating documents
- `sprint.state.changed` - When sprint status changes
- `command.executed` - When processing commands
- `threshold.exceeded` - When limits are reached

Agent Responsibilities:
- Trigger appropriate events for hook system
- Respect hook configuration settings
- Handle hook responses appropriately

## 20. Sub-Agent System Awareness (v4.0.0+)

### When to Use Sub-Agents
- Research phase: Multiple research domains in parallel (75% faster)
- Sprint execution: Multiple stories worked simultaneously (60% faster)  
- Project analysis: Different aspects analyzed concurrently (70-75% faster)
- Integration setup: Multiple APIs configured in parallel (78% faster)

### Agent Responsibilities
- Research Agent: Orchestrate parallel research groups
- Scrum Master: Coordinate parallel sprint execution
- Project Analyzer: Run parallel analysis categories
- API Agent: Configure multiple integrations simultaneously
- Coder Agent: Work as multiple sub-agents during sprints
- All Agents: Consider sub-agent use for time-intensive tasks

### Benefits
- 60-78% time reduction across all workflows
- Better token efficiency through isolated contexts
- Realistic team simulation (multiple "developers")
- Consistent quality through specialized focus

## Workflow Integration for All Agents

### New Project Workflow Phases
1. **Discovery**: Project Analyzer Agent leads interviews
2. **Research**: Research, Market, Finance Agents work in parallel
3. **Analysis**: Analysis Agent synthesizes findings
4. **Planning**: PRD, Project Manager, Architecture Agents collaborate
5. **Implementation**: Coder, Testing, DevOps Agents execute
6. **Sprint Setup**: Scrum Master configures sprints
7. **Backlog Creation**: Project Manager transforms PRD to stories

### Existing Project Workflow Phases
1. **Analysis**: Code Analyzer, Security, Performance Agents analyze first
2. **Discovery**: Project Analyzer conducts informed interviews
3. **Enhancement Planning**: PRD Agent creates enhancement requirements
4. **Implementation**: Same as new project with backward compatibility

### Agent Handoff Protocols
1. Check Workflow State to understand current phase
2. Follow templates from `workflow-templates/`
3. Record stakeholder approvals with timestamps
4. Mark phase complete in workflow state
5. Signal next agent by updating phase

### Section-by-Section Process
1. One Section at a Time - Never present all questions at once
2. Record Responses - Save to MD file immediately
3. Clarify Ambiguity - Ask follow-ups for vague responses
4. Present Understanding - "Based on your answers, I understand..."
5. Get Approval - "Is this correct? (yes/no)"
6. Iterate if Needed - Maximum 5 clarification rounds
7. Move to Next - Only after explicit approval

---

For complete details on other topics, see:
- **Core Information**: CLAUDE-core.md
- **Configuration**: CLAUDE-config.md
- **Reference Documents**: CLAUDE-reference.md

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)