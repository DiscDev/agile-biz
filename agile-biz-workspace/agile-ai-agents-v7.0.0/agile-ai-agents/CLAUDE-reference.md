# CLAUDE-reference.md

**PATH CONVENTION**: All file paths in this document are relative to the `agile-ai-agents/` directory.

This file contains the comprehensive list of core reference documents that all agents should be aware of. These documents are organized by category for easy navigation.

## Context Optimization

- **Smart Context Loading Guide**: `machine-data/aaa-documents-json/smart-context-loading-guide.json`
- **JSON Context Guide**: `machine-data/aaa-documents-json/json-context-guide.json`
- **Document Creation Rules**: `machine-data/document-creation-rules.json`

## Document Registry System (NEW)

- **Project Document Registry**: `machine-data/project-document-registry.json` - Central index of all project documents
- **Registry Manager**: `machine-data/project-document-registry-manager.js` - Core registry management
- **Registry Hook Handler**: `hooks/handlers/registry/document-registry-tracker.js` - Automatic tracking
- **Registry Queue**: `machine-data/registry-queue/` - Update queue for concurrent operations
- **Registry Commands**:
  - `/registry-stats` - Display registry statistics
  - `/registry-display` - Show full registry contents
  - `/registry-find [search]` - Search documents by name or summary
- **Key Features**:
  - Real-time document tracking (creation, updates, deletions)
  - Token counting for MD and JSON versions
  - 80-90% context reduction through targeted loading
  - Automatic summary extraction (up to 25 words)
  - Dependency tracking between documents
  - Agent attribution for document creation

## Project State Management

- **Project State Configuration**: `machine-data/aaa-documents-json/project-state-configuration-guide.json`
- **Project State Manager Agent**: `machine-data/ai-agents-json/project_state_manager_agent.json`
- **Verbosity Settings Guide**: `machine-data/aaa-documents-json/verbosity-settings-guide.json`
- **Dashboard State API**: `project-dashboard/api/project-state.js` - REST endpoints for state data
- **Dashboard State UI**: `project-dashboard/public/dashboard.js` - Real-time state display

## Project Structure & Evolution

- **Project Structure System Guide**: `machine-data/aaa-documents-json/project-structure-system-guide.json`
- **Project Structure Agent**: `machine-data/ai-agents-json/project_structure_agent.json`
- **Folder Structure Guide**: `machine-data/aaa-documents-json/folder-structure-guide.json`
- **Folder Structure Workflow**: `machine-data/aaa-documents-json/folder-structure-workflow.json`

## Orchestration & Coordination

- **Agent Index**: `machine-data/ai-agents-json/agent-index.json` - Fast agent discovery
- **Coordination Maps**: `machine-data/ai-agents-json/coordination-maps.json` - Inter-agent relationships
- **Orchestrator Workflows**: `ai-agent-coordination/orchestrator-workflows.md`
- **Auto-Project Orchestrator**: `ai-agent-coordination/auto-project-orchestrator.md`
- **Sprint Document Coordination**: `ai-agent-coordination/sprint-document-coordination.md`
- **Validation Workflows**: `ai-agent-coordination/validation-workflows.md`

## Sprint Management

- **Sprint Document Organization**: `machine-data/aaa-documents-json/sprint-document-organization-guide.json`
- **AI-Native Pulse System Guide**: `machine-data/aaa-documents-json/ai-native-pulse-system-guide.json`
- **Sprint Planning Templates**: `machine-data/aaa-documents-json/sprint-planning-templates-enhanced.json`
- **Project Document Creation Timing**: `machine-data/aaa-documents-json/project-document-creation-timing-guide.json`

## Development Standards

- **GitHub Markdown Style Guide**: `machine-data/aaa-documents-json/github-markdown-style-guide.json`
- **Markdown Examples by Category**: `aaa-documents/markdown-examples/`
  - Development Agent Example: `development-agent-example.md`
  - Business Strategy Agent Example: `business-strategy-agent-example.md`
  - Growth Revenue Agent Example: `growth-revenue-agent-example.md`
  - Technical Integration Agent Example: `technical-integration-agent-example.md`
  - Support Agent Example: `support-agent-example.md`
- **Verbosity Guide**: `machine-data/aaa-documents-json/verbosity-guide.json`
- **Verbosity Agent Implementation**: `machine-data/aaa-documents-json/verbosity-agent-implementation.json`
- **Research Verification Guide**: `machine-data/aaa-documents-json/research-verification-guide.json`
- **Testing Guide**: `machine-data/aaa-documents-json/TESTING-GUIDE.json` (fallback: `tests/TESTING-GUIDE.md`)
- **Testing Agent Protocol**: `machine-data/ai-agents-json/testing_agent.json`
- **Code Review Checklists**: `machine-data/aaa-documents-json/code-review-checklists.json`
- **Defensive Programming Guide**: `machine-data/aaa-documents-json/defensive-programming-guide.json`
- **Linting Rules**: `machine-data/aaa-documents-json/linting-rules-defensive-programming.json`

## Deployment & Operations

- **Deployment Guide**: `machine-data/aaa-documents-json/deployment.json`
- **CI/CD Setup**: `machine-data/aaa-documents-json/ci-cd-setup.json`
- **Deployment Validation Gates**: `ai-agent-coordination/deployment-validation-gates.md`

## Error Handling & Debugging

- **Error Codes Reference**: `machine-data/aaa-documents-json/error-codes.json`
- **Troubleshooting Guide**: `machine-data/aaa-documents-json/troubleshooting.json`
- **Verbosity Implementation**: `machine-data/aaa-documents-json/verbosity-implementation-guide.json`

## Evolution & Learning

- **Community Learnings Configuration**: `machine-data/aaa-documents-json/community-learnings-configuration-guide.json`
- **Community Learnings README**: `community-learnings/README.md`
- **Learning Analysis Guide**: `machine-data/aaa-documents-json/learning-analysis-agent-guide.json`
- **Learn From Contributions Workflow**: `machine-data/aaa-documents-json/workflow-templates/learn-from-contributions-workflow.json`
- **Community Learnings Archive**: `community-learnings/archive/README.md`
- **Evolution Tracking Guide**: `machine-data/aaa-documents-json/evolution-tracking-guide.json`
- **Evolution Examples**: `machine-data/aaa-documents-json/evolution-tracking-examples.json`
- **Learning Implementation Workflow**: `aaa-documents/archive/learning-implementation-workflow-2025-07-01-completed.md` (archived - fully implemented)
- **Security Guidelines**: `community-learnings/SECURITY-GUIDELINES.md`

## Hooks System

- **Hook Registry**: `hooks/registry.json` - All available hooks
- **Hook Handlers**: `hooks/handlers/` - Hook implementations
  - `handlers/shared/base-agent-hook.js` - Base class for agent-specific hooks
  - `handlers/agents/critical/` - Critical security and quality hooks
  - `handlers/agents/valuable/` - Team productivity hooks
  - `handlers/agents/enhancement/` - Code quality enhancements
  - `handlers/agents/specialized/` - Domain-specific hooks
- **Agent Hook Defaults**: `hooks/config/agent-hooks/agent-defaults.json`
- **Agent Hook Profiles**: `hooks/config/agent-hooks/profiles/`
- **Configuration UI**: `project-dashboard/public/hooks.html` - Web interface
  - General hooks tab for system-wide hooks
  - Agent hooks tab for agent-specific hooks with profile selection
- **Hooks API**: `project-dashboard/api/hooks.js` - REST endpoints
- **Claude Code Hooks Guide**: `machine-data/aaa-documents-json/claude-code-hooks-guide.json`

## Stakeholder Management

- **Stakeholder Context Integration**: `machine-data/aaa-documents-json/stakeholder-context-integration-pattern.json`
- **Stakeholder Interview Templates**: `machine-data/aaa-documents-json/stakeholder-interview-templates.json`

## Version Management

- **Version Management Guide**: `machine-data/aaa-documents-json/version-management-guide.json`

## Key Implementation Files

### Agent Organization (38 Specialized Agents)
- **Agent JSON**: `machine-data/ai-agents-json/` - PRIMARY: Token-optimized JSON (85% reduction)
- **Agent Index**: `machine-data/ai-agents-json/agent-index.json` - Fast agent discovery
- **Coordination Maps**: `machine-data/ai-agents-json/coordination-maps.json` - Inter-agent workflows
- **Agent Definitions**: `ai-agents/` - Markdown source files (use JSON instead)
- **Claude Native Agents**: `.claude/agents/` - Direct Claude Code integration

### Project Structure Files
- **Project Documents**: `project-documents/` - All deliverables (30 categorized folders)
- **Project Documents JSON**: `machine-data/project-documents-json/` - Auto-converted versions
- **Project Dashboard**: `project-dashboard/` - Real-time monitoring interface
- **Project State**: `project-state/` - Session state and checkpoints

### Core System Files
- **AAA Documents JSON**: `machine-data/aaa-documents-json/` - PRIMARY: Token-optimized (90% reduction)
- **AAA Documents**: `aaa-documents/` - Core system documentation (use JSON instead)
- **AAA MCPs**: `aaa-mcps/` - MCP server guides
- **Community Learnings**: `community-learnings/` - Shared learnings and contributions

### Key Scripts and Tools
- **File Operation Manager**: `machine-data/file-operation-manager.js` - Secure file operations
- **Document Creation Tracker**: `machine-data/document-creation-tracker.js`
- **Folder Structure Validator**: `machine-data/folder-structure-validator.js`
- **System Rules**: `machine-data/system-rules.json` - System-wide rules

### Template Files
- **Stakeholder Prompts**: `templates/stakeholder-prompts/`
  - `universal-project-prompt.md` - New projects
  - `existing-project-prompt.md` - Enhancements
- **Project Scaffolds**: `templates/project-scaffolds/` - Tech stack templates
- **Release Templates**: `templates/release-templates/` - Clean slate structures
- **Workflow Templates**: `aaa-documents/workflow-templates/` - Structured processes
  - `help-command-template.md` - Complete AAA-help command output
  - `new-project-workflow-template.md` - New project workflow details
  - `existing-project-workflow-template.md` - Existing project workflow
  - `quickstart-menu-template.md` - Interactive menu structure
  - `contribution-commands-template.md` - Contribution command details

### Product Backlog Files
- **Backlog State**: `project-documents/orchestration/product-backlog/backlog-state.json`
- **Velocity Metrics**: `project-documents/orchestration/product-backlog/velocity-metrics.json`
- **Velocity Profiles**: `templates/release-templates/product-backlog/velocity-profiles.json`
- **Profile Selector**: `machine-data/profile-selector.js`

### Sub-Agent System Files (v4.0.0+)
- **Sub-Agent System Guide**: `machine-data/aaa-documents-json/sub-agent-system-guide.json`
- **Sub-Agent Migration Guide**: `machine-data/aaa-documents-json/sub-agent-migration-guide.json`
- **Performance Benchmarks**: `machine-data/aaa-documents-json/sub-agent-performance-benchmarks.json`
- **Sub-Agent Orchestrator**: `machine-data/sub-agent-orchestrator.js`
- **Token Budget Manager**: `machine-data/token-budget-manager.js`
- **Document Registry Manager**: `machine-data/document-registry-manager.js`
- **Research Agent Orchestrator**: `machine-data/research-agent-orchestrator.js`
- **Sprint Code Coordinator**: `machine-data/sprint-code-coordinator.js`
- **Project Analysis Orchestrator**: `machine-data/project-analysis-orchestrator.js`
- **Integration Orchestrator**: `machine-data/integration-orchestrator.js`
- **Sub-Agent Test Suite**: `tests/test-all-sub-agents.js`

### Conversion and Optimization Tools
- **Universal MD to JSON Converter**: `machine-data/scripts/universal-md-to-json-converter.js`
- **Agent Generator**: `machine-data/scripts/generate-agent-json.js`
- **Document Generator**: `machine-data/scripts/generate-document-json.js`
- **Context Loader**: `machine-data/agent-context-loader.js`

### Migration and Validation Scripts
- **Migrate to Categories**: `scripts/bash/migrate-to-categories.js`
- **Validate Folder References**: `scripts/bash/validate-folder-references-categories.js`
- **Create Release**: `scripts/bash/create-release.sh`
- **Setup Script**: `scripts/bash/setup.sh`

### Command Detection and Handling
- **Command Detection**: `machine-data/aaa-documents-json/command-detection.json`
- **Command Handlers**: `machine-data/aaa-documents-json/command-handlers.json`
- **Prompt Validator**: `machine-data/validators/prompt-validator.js`

### Structure Analysis Tools
- **Structure Analyzer**: `machine-data/structure-analyzer.js`
- **Project Structure Best Practices**: `machine-data/aaa-documents-json/project-structure-best-practices.json`
- **Folder Structure Implementation Plan**: `folder-structure-implementation-plan.md`

---

For complete details on other topics, see:
- **Core Information**: CLAUDE-core.md
- **Configuration**: CLAUDE-config.md
- **Agent Guidelines**: CLAUDE-agents.md