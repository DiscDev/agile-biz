# Research Level Configuration

## Overview

The AgileAiAgents system now supports three research levels that control the depth and breadth of document generation during workflows. The default level has been set to **"thorough"** to ensure comprehensive project analysis and planning.

## Research Levels

### 1. Minimal (1-2 hours)
- **Documents**: 15 essential documents
- **Focus**: Core market validation and feasibility
- **Use Case**: Quick proof-of-concept or MVP validation
- **Key Categories**:
  - Essential research (7 docs)
  - Basic marketing strategy (3 docs)
  - Core financial analysis (3 docs)
  - Go/no-go decision (2 docs)

### 2. Medium (3-5 hours)
- **Documents**: 48 comprehensive documents
- **Focus**: Standard business and technical analysis
- **Use Case**: Most startup and SMB projects
- **Key Categories**:
  - Comprehensive research (24 docs)
  - Full marketing strategy (8 docs)
  - Complete financial analysis (5 docs)
  - Market validation (6 docs)
  - Strategic analysis (4 docs)

### 3. Thorough (6-10 hours) - DEFAULT
- **Documents**: 194 documents across all categories
- **Focus**: Enterprise-level deep analysis
- **Use Case**: Complex projects, enterprise clients, or high-stakes ventures
- **Key Categories**:
  - Complete research suite (48 docs)
  - Full marketing arsenal (41 docs)
  - Customer success framework (24 docs)
  - Revenue optimization (24 docs)
  - Analytics & intelligence (23 docs)
  - Investment materials (19 docs)
  - Market validation (19 docs)
  - Performance optimization (18 docs)
  - Security framework (13 docs)

## Implementation Details

### Configuration Files

1. **research-level-documents.json**
   - Maps each research level to specific document sets
   - Defines document priorities within each level
   - Maintains document-to-category associations

2. **workflow-document-manager.js**
   - New manager class for research-level based document creation
   - Handles document-to-agent mapping
   - Calculates execution time estimates
   - Generates phase-based document queues

3. **Updated Files**:
   - `CLAUDE-config.md` - Default set to "thorough"
   - `project-folder-structure-categories.json` - All 331 documents mapped
   - `document-creation-tracker.js` - Integrated with research levels

### How It Works

1. **Workflow Start**: User initiates workflow with `/start-new-project-workflow` or `/start-existing-project-workflow`

2. **Research Level Selection**: 
   - System defaults to "thorough" level
   - User can override during discovery phase
   - Level stored in project context

3. **Document Queue Generation**:
   - WorkflowDocumentManager loads appropriate document set
   - Documents organized by workflow phase
   - Agents assigned based on category mapping

4. **Parallel Execution**:
   - Documents grouped by responsible agent
   - Multiple agents work simultaneously within phase
   - 60-78% time reduction vs sequential execution

5. **Progress Tracking**:
   - Real-time progress based on document completion
   - Dashboard shows percentage complete
   - Stuck states detected and reported

## Usage Examples

### Setting Research Level

```javascript
// During workflow initialization
tracker.updateContext({
  research_level: 'thorough',  // or 'medium', 'minimal'
  project_type: 'saas',
  existing_project: false
});
```

### Checking Document Queue

```bash
# View execution plan
node machine-data/workflow-document-manager.js plan new-project thorough

# List documents for a level
node machine-data/workflow-document-manager.js list medium

# View document queue
node machine-data/workflow-document-manager.js queue existing-project minimal
```

## Benefits

1. **Flexibility**: Projects can scale documentation to their needs
2. **Efficiency**: Minimal research for quick validation (1-2 hours)
3. **Completeness**: Thorough research for enterprise projects
4. **Predictability**: Clear time estimates for each level
5. **Quality**: All levels maintain high documentation standards

## Migration Notes

- Existing projects will default to "thorough" level
- No changes required to existing workflows
- Backward compatible with current document creation rules
- All 331 documents now properly mapped to agents

## Future Enhancements

1. **Dynamic Level Adjustment**: Upgrade research level mid-workflow
2. **Custom Document Sets**: User-defined document combinations
3. **Industry Templates**: Pre-configured levels by industry
4. **AI Recommendations**: Suggest optimal level based on project type
5. **Progressive Enhancement**: Start minimal, add documents as needed