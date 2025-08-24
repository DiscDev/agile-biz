---
title: "Sub-Agent Coordination - Developer Agent Context"
type: "agent-context"
agent: "developer"
keywords: ["parallel", "sprint", "coordination", "sub-agent", "team", "collaboration", "multi", "concurrent"]
token_count: 1251
---

# Sub-Agent Coordination - Developer Agent Context

## When to Load This Context
- **Keywords**: parallel, sprint, coordination, sub-agent, team, collaboration, multi, concurrent
- **Patterns**: "parallel development", "team coordination", "sprint execution", "multiple agents"

## Sub-Agent Parallel Execution (v4.0.0+)

The Developer Agent leverages sub-agents during sprint execution to work on multiple stories simultaneously, dramatically reducing sprint completion time.

### Sprint Execution Architecture

When participating in parallel sprint execution:

```yaml
parallel_sprint_mode:
  enabled: true
  role: "story_implementer"
  
  sub_agent_capabilities:
    - Independent story implementation
    - File-level ownership management
    - Isolated context execution
    - Integration checkpoint participation
    
  coordination_document: "code-coordination.md"
  max_parallel_instances: 3
```

### Sub-Agent Responsibilities

As a developer sub-agent:

1. **Receive Work Package**:
   - Assigned stories (1-3 per sub-agent)
   - Owned files list (exclusive access)
   - Read-only files (shared dependencies)
   - Token budget allocation

2. **Implement Stories**:
   - Work only on assigned files
   - Follow existing patterns
   - Write tests for new code
   - Update documentation

3. **Status Updates**:
   - Update code-coordination.md progress
   - Signal completion or blockers
   - Report test results

4. **Integration Support**:
   - Prepare for integration phase
   - Document interfaces/dependencies
   - Support conflict resolution

### Parallel Execution Benefits

- **60% Time Reduction**: 5-day sequential → 2-day parallel
- **Realistic Simulation**: Multiple developers working simultaneously
- **Smart Conflicts**: File ownership prevents merge issues
- **Quality Maintained**: Integration testing after parallel work

### Example Sprint Coordination

```markdown
## File Ownership Map (from code-coordination.md)

| File/Module | Owner | Stories | Status |
|-------------|-------|---------|--------|
| /api/auth/* | coder_sub_1 | AUTH-001, AUTH-003 | 🟡 In Progress |
| /api/profile/* | coder_sub_2 | PROFILE-002 | 🟢 Complete |
| /utils/validation.js | orchestrator | SHARED | ⏸️ Waiting |
```

## Coordination Patterns

### With PRD Agent
**Input**: Functional requirements, acceptance criteria, and business rules
**Collaboration**: Technical feasibility assessment, requirement clarification

### With UI/UX Agent
**Input**: Design specifications, user interaction requirements, and visual guidelines
**Collaboration**: Implementation feasibility, responsive design constraints

### With Testing Agent
**Output**: Unit tests and testable code
**Collaboration**: Test automation setup, test data requirements

### With DevOps Agent
**Collaboration**: Infrastructure requirements, deployment specifications, environment configuration
**Output**: Deployable artifacts and configuration

### With Documentation Agent
**Output**: Code documentation, API specifications, and technical guides
**Collaboration**: Technical writing and code example creation

## JSON Output Structure for Agent Coordination

The Developer Agent generates structured JSON for other agents:

```json
{
  "meta": {
    "agent": "developer_agent",
    "timestamp": "ISO-8601",
    "version": "1.1.0"
  },
  "summary": "Implementation status and key decisions",
  "key_findings": {
    "modules_completed": ["auth", "api", "database"],
    "tech_stack_used": {
      "frontend": "React 18",
      "backend": "Node.js/Express",
      "database": "PostgreSQL"
    },
    "api_endpoints": ["/api/auth", "/api/users", "/api/data"],
    "deployment_ready": false
  },
  "decisions": {
    "architecture_pattern": "MVC",
    "state_management": "Redux Toolkit",
    "testing_framework": "Jest + React Testing Library"
  },
  "next_agent_needs": {
    "testing_agent": ["test_files", "coverage_requirements"],
    "devops_agent": ["deployment_config", "environment_setup"],
    "documentation_agent": ["api_docs", "code_comments"]
  }
}
```

## Context Optimization for Agent Communication

### JSON Data Requirements

#### From PRD Agent
**Critical Data** (Always Load):
- `tech_requirements` - Technical specifications
- `api_specs` - API design requirements
- `database_schema` - Data model requirements
- `core_features` - Must-have functionality

**Optional Data** (Load if Context Allows):
- `nice_to_have_features` - Additional features
- `performance_benchmarks` - Performance targets
- `scalability_requirements` - Growth planning
- `integration_requirements` - Third-party integrations

#### From UI/UX Agent
**Critical Data**:
- `component_structure` - UI component hierarchy
- `state_management` - Data flow requirements
- `api_endpoints` - Frontend-backend contracts

**Optional Data**:
- `design_tokens` - Styling variables
- `animation_specs` - Motion design
- `responsive_breakpoints` - Device specifications

#### From Testing Agent
**Critical Data**:
- `failed_tests` - Test failures to fix
- `coverage_gaps` - Missing test areas
- `critical_bugs` - High-priority issues

**Optional Data**:
- `performance_issues` - Optimization needs
- `code_smells` - Refactoring suggestions
- `test_recommendations` - Testing improvements

#### From Security Agent
**Critical Data**:
- `critical_vulnerabilities` - Must-fix security issues
- `auth_requirements` - Authentication specs
- `data_encryption` - Security requirements

**Optional Data**:
- `security_best_practices` - Recommendations
- `compliance_requirements` - Regulatory needs
- `security_testing_results` - Vulnerability scans

## File Ownership and Conflict Resolution

### File Assignment Strategy
```yaml
file_ownership:
  exclusive_files:
    - "src/components/auth/*"
    - "src/api/users/*"
    - "src/services/payment/*"
  
  shared_files:
    - "src/utils/validation.js"
    - "src/types/api.ts"
    - "src/config/database.js"
  
  read_only_files:
    - "package.json"
    - "README.md"
    - "src/constants/*"
```

### Conflict Prevention
1. **Pre-assignment**: Files assigned before work begins
2. **Dependency Mapping**: Shared dependencies identified upfront
3. **Interface Contracts**: API contracts defined before implementation
4. **Communication Protocol**: Regular status updates in coordination document

### Integration Checkpoints
```markdown
## Integration Checkpoint Process

### Phase 1: Pre-Integration
- [ ] All assigned stories completed
- [ ] Unit tests passing
- [ ] Dependencies documented
- [ ] API contracts validated

### Phase 2: Integration
- [ ] Merge conflicts resolved
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Code review completed

### Phase 3: Validation
- [ ] End-to-end tests passing
- [ ] User acceptance criteria met
- [ ] Documentation updated
- [ ] Deployment ready
```

## Success Metrics for Parallel Execution

### Performance Metrics
- **Development Velocity**: Story points completed per sprint
- **Time Reduction**: Sequential vs parallel execution time
- **Quality Maintenance**: Bug rate, test coverage
- **Resource Utilization**: Agent efficiency, context usage

### Quality Metrics
- **Code Quality**: Technical debt ratio, code coverage
- **Integration Success**: Merge conflict resolution time
- **Test Coverage**: Unit, integration, and e2e test coverage
- **Documentation**: API docs, code comments, technical guides

### Coordination Metrics
- **Communication Efficiency**: Status update frequency and quality
- **Blocker Resolution**: Time to resolve dependencies and conflicts
- **Context Optimization**: Token usage per story, context relevance
- **Handoff Quality**: Information completeness for next agents

## Version History

### v1.1.0 (2025-01-29)
- **Sub-Agent Support**: Added parallel sprint execution capabilities
- **Sprint Coordination**: Integration with SprintCodeCoordinator
- **File Ownership**: Respects file-level ownership assignments
- **Performance**: 60% reduction in sprint completion time

### v1.0.0 (2025-01-28)
- **Initial Release**: Core agent capabilities established
- **Capabilities**: Software implementation, code quality management, architecture design
- **Integration**: Integrated with AgileAiAgents system