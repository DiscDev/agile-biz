---
allowed-tools: [Task]
argument-hint: Optional: specific agent or agent category to convert (coder, prd, testing, etc.)
---

# Convert MD to JSON - AI Agents

Convert AI Agent documentation files from markdown to JSON format for 80-90% token reduction and optimized context loading. Transform individual agent guides, capabilities, workflows, and coordination patterns into structured JSON while preserving all agent-specific information.

## Usage

```
/convert-md-to-json-ai-agents [optional: agent name or category]
```

**Examples:**
- `/convert-md-to-json-ai-agents` - Convert all agent documentation
- `/convert-md-to-json-ai-agents coder` - Convert Coder Agent only
- `/convert-md-to-json-ai-agents development` - Convert development-related agents
- `/convert-md-to-json-ai-agents coordination` - Convert coordination and management agents

## What This Does

1. **Agent Discovery**: Scans `ai-agents/` directory for agent markdown files
2. **Capability Analysis**: Extracts agent responsibilities, tools, and workflows  
3. **JSON Transformation**: Converts to structured JSON with preserved agent semantics
4. **Context Optimization**: Achieves 80-90% token reduction for faster agent loading
5. **Relationship Mapping**: Maintains inter-agent coordination patterns

## Token Savings Benefits

### Before Conversion (Agent Markdown)
- **Average Agent MD**: 8,000-12,000 tokens per agent
- **38 Agents Total**: ~380,000 tokens for complete agent context
- **Context Loading**: Must load full agent documentation
- **Agent Selection**: Slow - requires reading all agent capabilities

### After Conversion (Agent JSON)
- **Average Agent JSON**: 800-1,500 tokens per agent summary
- **38 Agents Total**: ~45,000 tokens for agent index
- **Context Loading**: Fast structured summaries with drill-down
- **Agent Selection**: Instant - structured capability matching

**Result**: 88% token reduction with enhanced agent discovery

## Agent Categories

### Development Agents
- **Coder Agent**: Software implementation and code quality
- **Frontend Agent**: UI/UX implementation and user experience
- **Backend Agent**: Server-side development and APIs
- **Database Agent**: Data modeling and database optimization
- **Testing Agent**: Quality assurance and test automation

### Business & Strategy Agents  
- **PRD Agent**: Product requirements and feature specifications
- **Business Analyst Agent**: Market research and business strategy
- **Project Manager Agent**: Project coordination and timeline management
- **Scrum Master Agent**: Agile process facilitation and sprint management
- **Stakeholder Agent**: Requirements gathering and stakeholder communication

### Specialized Agents
- **DevOps Agent**: Infrastructure and deployment automation  
- **Security Agent**: Security assessment and vulnerability management
- **Performance Agent**: Optimization and monitoring
- **Documentation Agent**: Technical writing and knowledge management
- **Integration Agent**: Third-party service integration and APIs

### Support & Coordination Agents
- **Logger Agent**: Activity logging and audit trails
- **State Manager Agent**: Project state and workflow management
- **Notification Agent**: Communication and alerting
- **Analytics Agent**: Metrics and performance analysis
- **Quality Assurance Agent**: Process validation and compliance

## Conversion Process

This command uses the Task tool to engage document_manager_agent for:

1. **Agent Discovery & Classification**
   ```json
   {
     "task": "discover_and_classify_agents",
     "target_directory": "ai-agents/",
     "classification_criteria": [
       "primary_responsibilities",
       "tool_requirements", 
       "coordination_patterns",
       "workflow_complexity"
     ]
   }
   ```

2. **Capability Extraction**
   ```json
   {
     "task": "extract_agent_capabilities",
     "extraction_focus": {
       "core_responsibilities": "primary functions and tasks",
       "tools_integrations": "required tools and external services", 
       "workflows": "process flows and decision trees",
       "coordination_patterns": "inter-agent communication protocols"
     }
   }
   ```

3. **JSON Schema Optimization**
   ```json
   {
     "task": "optimize_agent_schemas",
     "optimization_goals": {
       "fast_agent_matching": true,
       "context_minimization": true,
       "capability_searchability": true,
       "workflow_accessibility": true
     }
   }
   ```

4. **Inter-Agent Relationship Mapping**
   ```json
   {
     "task": "map_agent_relationships",
     "relationship_types": [
       "direct_collaboration",
       "input_output_chains",
       "coordination_dependencies", 
       "conflict_resolution_patterns"
     ]
   }
   ```

## Expected JSON Output Structure

### Agent Index Structure
```json
{
  "meta": {
    "conversion_date": "2025-01-29T11:00:00Z",
    "source_directory": "ai-agents/",
    "total_agents": 38,
    "token_reduction": "88%",
    "original_tokens": 380000,
    "optimized_tokens": 45000
  },
  "agent_index": {
    "development": {
      "coder_agent": {
        "file": "coder-agent.json",
        "summary": "Software implementation, code quality, and technical architecture",
        "token_count": 1250,
        "original_tokens": 10666,
        "primary_tools": ["Read", "Write", "Edit", "Bash", "Task"],
        "coordination_level": "high"
      },
      "testing_agent": {
        "file": "testing-agent.json", 
        "summary": "Quality assurance, test automation, and validation",
        "token_count": 980,
        "original_tokens": 8420,
        "primary_tools": ["Bash", "Read", "Task"],
        "coordination_level": "medium"
      }
    },
    "business": {
      "prd_agent": {
        "file": "prd-agent.json",
        "summary": "Product requirements definition and feature specification",
        "token_count": 1150,
        "original_tokens": 9850,
        "primary_tools": ["Task", "Read", "Write"],
        "coordination_level": "high"
      }
    }
  }
}
```

### Individual Agent Structure
```json
{
  "meta": {
    "agent_name": "coder_agent",
    "title": "Coder Agent - Software Development & Implementation",
    "source_file": "coder-agent.md",
    "conversion_date": "2025-01-29T11:00:00Z",
    "token_reduction": "88%",
    "original_tokens": 10666,
    "optimized_tokens": 1275,
    "version": "1.1.0"
  },
  "summary": "Specializes in software implementation, code quality, and technical architecture. Focuses on the HOW of building software solutions.",
  "core_responsibilities": {
    "code_development": [
      "Feature implementation based on requirements",
      "Code architecture and technical standards", 
      "Database development and optimization",
      "API development and integration"
    ],
    "code_quality": [
      "Code review and bug analysis",
      "Refactoring and technical debt management",
      "Security implementation and best practices",
      "Performance optimization"
    ]
  },
  "key_workflows": {
    "feature_development": {
      "input": "Requirements from PRD Agent",
      "process": "Technical analysis → Architecture design → Implementation → Testing",
      "output": "Working feature implementation",
      "handoff": "Testing Agent"
    },
    "bug_fix": {
      "input": "Bug report with reproduction steps",
      "process": "Investigation → Impact assessment → Fix implementation → Validation", 
      "output": "Tested bug fix",
      "handoff": "Testing Agent"
    }
  },
  "coordination_patterns": {
    "input_agents": ["prd_agent", "ui_ux_agent"],
    "output_agents": ["testing_agent", "devops_agent", "documentation_agent"],
    "collaboration_agents": ["project_manager_agent", "security_agent"]
  },
  "tools_required": ["Read", "Write", "Edit", "Bash", "Task"],
  "specializations": [
    "Dynamic port management",
    "Latest dependency management", 
    "Defensive programming patterns",
    "Multi-language implementation"
  ],
  "context_priorities": {
    "critical_data": ["tech_requirements", "api_specs", "database_schema"],
    "optional_data": ["performance_benchmarks", "scalability_requirements"]
  },
  "md_reference": {
    "full_document_path": "ai-agents/coder-agent.md",
    "section_references": {
      "complete_workflows": "Lines 150-300", 
      "coordination_details": "Lines 400-500",
      "tool_integrations": "Lines 550-650"
    }
  }
}
```

## Progressive Loading Strategy

1. **Agent Discovery (200 tokens)**: Load agent index for capability matching
2. **Agent Summary (400 tokens)**: Load core responsibilities and workflows
3. **Complete Agent (Full MD)**: Load full documentation when implementing

## Agent Matching Optimization

### Fast Agent Selection
```json
{
  "task_type": "software_implementation",
  "matching_agents": [
    {
      "agent": "coder_agent",
      "match_score": 95,
      "specializations": ["feature_development", "code_quality"]
    },
    {
      "agent": "testing_agent", 
      "match_score": 30,
      "specializations": ["quality_validation"]
    }
  ]
}
```

### Workflow Chain Discovery
```json
{
  "workflow": "feature_to_production",
  "agent_chain": [
    "prd_agent → coder_agent → testing_agent → devops_agent"
  ],
  "coordination_points": [
    "requirements_handoff",
    "implementation_review", 
    "testing_validation",
    "deployment_preparation"
  ]
}
```

## Implementation Steps

1. **Agent Documentation Analysis**
   - Scan all agent markdown files for structure and content
   - Extract core responsibilities, workflows, and coordination patterns
   - Identify tool requirements and specializations
   - Map inter-agent relationships and dependencies

2. **Structured Conversion**  
   - Transform agent capabilities to structured JSON format
   - Create searchable agent index with capability matching
   - Preserve workflow details and coordination patterns
   - Generate progressive loading metadata

3. **Relationship Preservation**
   - Maintain inter-agent coordination patterns
   - Preserve input/output chains and collaboration flows
   - Create workflow chain discovery capabilities
   - Link related agents and specializations

4. **Optimization & Validation**
   - Achieve target token reduction while preserving functionality
   - Validate agent matching and selection capabilities
   - Test progressive loading and drill-down functionality
   - Ensure all critical agent information remains accessible

## Success Metrics

**Token Optimization**
- [ ] 80-90% token reduction achieved across all agents
- [ ] Agent index loadable in <200 tokens
- [ ] Fast agent matching and selection
- [ ] Preserved workflow and coordination details

**Functional Preservation**
- [ ] All agent capabilities accurately represented
- [ ] Inter-agent relationships maintained
- [ ] Workflow chains discoverable
- [ ] Tool requirements clearly specified

**Performance Enhancement**
- [ ] Agent selection time reduced by 85%+
- [ ] Context loading optimized for agent workflows
- [ ] Search and filtering capabilities improved
- [ ] Progressive loading functional

## Output Summary

```
🤖 AI Agents Conversion Complete
================================

📊 Agent Conversion Statistics:
  Agents Processed: 38 agents
  Token Reduction: 88% average
  Original Tokens: 380,000
  Optimized Tokens: 45,000

📁 Generated Files:
  Agent JSON Files: 38 files created
  Agent Index: ai-agents-index.json
  Workflow Maps: agent-coordination.json
  
⚡ Performance Gains:
  Agent Selection: 85% faster
  Context Loading: 90% reduction
  Workflow Discovery: Instant
  Memory Usage: 88% reduction

🔗 Coordination Patterns:
  Input/Output Chains: [X] mapped
  Collaboration Flows: [X] preserved
  Workflow Dependencies: [X] documented
  Tool Requirements: [X] structured

✅ Quality Validation:
  Capability Completeness: 100%
  Relationship Integrity: 100%
  Workflow Preservation: 100%
  Progressive Loading: Functional
```

## Follow-up Commands

After agent conversion completion:
- `/convert-md-to-json-project-documents` - Convert project documents  
- `/convert-md-to-json-aaa-documents` - Convert system documentation
- `/convert-all-md-to-json` - Complete system-wide conversion
- `/context` - Test optimized agent context loading