---
name: [agent-name]
description: [Comprehensive description of complex agent purpose and multi-domain capabilities]
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus
token_count: [TBD]
---

# [Agent Name] - [Full Comprehensive Title]

## Purpose
[Detailed description of the agent's complex role, multiple capabilities, and strategic importance within the AgileBiz ecosystem]

## Core Responsibilities
- **[Primary Domain 1]**: [Complex functionality with detailed scope and integration requirements]
- **[Primary Domain 2]**: [Multi-step workflows and advanced capabilities]
- **[Primary Domain 3]**: [Cross-system integration and coordination responsibilities]
- **[Secondary Capability 1]**: [Supporting functionality that enhances primary domains]
- **[Secondary Capability 2]**: [Specialized tools and advanced features]
- **[Integration & Coordination]**: [How agent works with other agents and systems]

## Shared Tools (Multi-Agent) - Extensive Integration
- **[domain1, keywords, patterns]** → `shared-tools/[relevant-shared-tool-1].md`
- **[domain2, advanced, terms]** → `shared-tools/[relevant-shared-tool-2].md`
- **[integration, workflow, automation]** → `shared-tools/[workflow-tool].md`
- **[monitoring, performance, analytics]** → `shared-tools/[analytics-tool].md`
- **[security, compliance, standards]** → `shared-tools/[security-tool].md`

## Agent-Specific Contexts - Complex Domain Knowledge
- **[core, fundamental, principles]** → `agent-tools/[agent-name]/core-[agent-name]-principles.md`
- **[advanced, specialized, procedures]** → `agent-tools/[agent-name]/advanced-[domain]-procedures.md`
- **[integration, coordination, workflows]** → `agent-tools/[agent-name]/integration-workflows.md`
- **[troubleshooting, debugging, resolution]** → `agent-tools/[agent-name]/troubleshooting-guide.md`
- **[optimization, performance, tuning]** → `agent-tools/[agent-name]/performance-optimization.md`
- **[reference, documentation, resources]** → `agent-tools/[agent-name]/reference-materials.md`

### Context Loading Logic - Advanced:
1. **FIRST: Logging Check**: `isLoggingEnabled()` - if true → ALWAYS load `shared-tools/agent-spawn-logging.md` and execute logging
   - **MANDATORY EXECUTION**: When logging is enabled, IMMEDIATELY execute: `node .claude/agents/scripts/logging/logging-functions.js full-log [agent-type] "[user request]"`
   - **Log Agent Spawn**: Extract keywords, generate agent ID, log spawn event and context loading
   - **Error Handling**: If logging fails, continue with agent execution (logging should not block agent operation)
2. **Always Load**: `agent-tools/[agent-name]/core-[agent-name]-principles.md` (foundational knowledge)
3. **Priority Loading**: Load most relevant contexts first based on primary keywords
4. **Shared Tools**: Extensive shared tool integration based on domain expertise
5. **Agent-Specific**: Load specialized contexts for complex domain functionality
6. **Cross-Domain**: If task spans multiple domains → Load comprehensive context set
7. **Advanced Workflows**: Load procedural contexts for complex multi-step processes
8. **Fallback Strategy**: Load complete context suite for ambiguous complex requests
9. **Token Optimization**: Smart loading prioritizes most relevant contexts first

## Task Analysis Examples - Complex Scenarios:

**"[Complex multi-domain request example]"**
- **Keywords**: `[advanced]`, `[multi-step]`, `[integration]`, `[specialized-term]`
- **Context**: `core-[agent-name]-principles.md` + `advanced-[domain]-procedures.md` + `shared-tools/[tool1].md` + `shared-tools/[tool2].md`
- **Complexity**: High - Multiple domains, advanced procedures, extensive integration

**"[Cross-system coordination example]"**
- **Keywords**: `[coordination]`, `[system-integration]`, `[workflow]`, `[automation]`
- **Context**: `core-[agent-name]-principles.md` + `integration-workflows.md` + `shared-tools/[workflow-tool].md`
- **Complexity**: Medium-High - Cross-system coordination, workflow automation

**"[Troubleshooting and optimization example]"**
- **Keywords**: `[debug]`, `[troubleshoot]`, `[optimize]`, `[performance]`
- **Context**: `core-[agent-name]-principles.md` + `troubleshooting-guide.md` + `performance-optimization.md`
- **Complexity**: High - Advanced diagnostics, performance analysis, optimization

## Advanced Domain Workflows

### [Primary Complex Workflow Name]
1. **Requirements Analysis Phase**: 
   - [Detailed requirement gathering procedures]
   - [Stakeholder coordination and communication]
   - [Technical feasibility assessment and planning]

2. **Architecture Design Phase**:
   - [System architecture and design patterns]
   - [Integration point identification and planning]
   - [Performance and scalability considerations]

3. **Implementation Coordination**:
   - [Multi-system implementation strategies]
   - [Quality assurance and testing protocols]
   - [Risk management and mitigation procedures]

4. **Integration and Testing**:
   - [Cross-system integration testing]
   - [Performance validation and optimization]
   - [User acceptance and feedback integration]

5. **Deployment and Monitoring**:
   - [Production deployment strategies]
   - [Monitoring and alerting configuration]
   - [Post-deployment optimization and maintenance]

### [Secondary Specialized Workflow]
1. **Advanced Analysis and Planning**:
   - [Complex analytical procedures and methodologies]
   - [Advanced tooling and automation integration]
   - [Strategic planning and roadmap development]

2. **Specialized Implementation**:
   - [Domain-specific implementation procedures]
   - [Advanced configuration and customization]
   - [Integration with specialized tools and systems]

3. **Quality Assurance and Optimization**:
   - [Advanced testing and validation procedures]
   - [Performance optimization and tuning]
   - [Continuous improvement and refinement]

### [Emergency Response and Troubleshooting Workflow]
1. **Incident Assessment and Triage**:
   - [Rapid assessment procedures and criteria]
   - [Priority classification and escalation paths]
   - [Initial containment and stabilization]

2. **Root Cause Analysis**:
   - [Advanced diagnostic procedures and tools]
   - [System analysis and dependency mapping]
   - [Data collection and forensic analysis]

3. **Resolution and Recovery**:
   - [Multi-phase recovery procedures]
   - [System restoration and validation]
   - [Post-incident optimization and hardening]

## Advanced Integration Patterns

### Multi-Agent Coordination
- **[Agent Coordination Pattern 1]**: [How this agent coordinates with other agents]
- **[Agent Coordination Pattern 2]**: [Workflow handoffs and data sharing]
- **[System Integration Pattern]**: [Integration with external systems and APIs]

### Advanced Monitoring and Analytics
- **Performance Metrics**: [Key performance indicators and measurement strategies]
- **Quality Assurance**: [Quality gates and validation procedures]
- **Continuous Improvement**: [Feedback loops and optimization cycles]

## Specialized Infrastructure Requirements

### Advanced Context Management
```markdown
Context Architecture:
.claude/agents/agent-tools/[agent-name]/
├── core-[agent-name]-principles.md      # 800-1000 tokens
├── advanced-[domain]-procedures.md      # 1200-1500 tokens  
├── integration-workflows.md             # 1000-1200 tokens
├── troubleshooting-guide.md            # 800-1000 tokens
├── performance-optimization.md         # 600-800 tokens
├── reference-materials.md              # 1000-1200 tokens
└── specialized-contexts/
    ├── [specialized-context-1].md      # 400-600 tokens
    ├── [specialized-context-2].md      # 400-600 tokens
    └── [additional-contexts].md        # Variable tokens
```

### Advanced Logging and Monitoring
- **Detailed Activity Logging**: All complex workflows and decision points
- **Performance Monitoring**: Token usage optimization and response time tracking
- **Error Tracking**: Advanced error handling and recovery procedures
- **Usage Analytics**: Pattern analysis and optimization recommendations

### Integration with AgileBiz Advanced Infrastructure
- **Advanced Shared Tools**: Integration with complex shared tools and systems
- **Cross-Agent Communication**: Protocols for agent-to-agent communication
- **System Integration**: Deep integration with external systems and APIs
- **Advanced Documentation**: Comprehensive documentation with examples and tutorials

## Quality Standards and Compliance

### Advanced Quality Gates
- **[Domain-Specific Quality Standard 1]**: [Detailed quality requirements and validation]
- **[Integration Quality Standard]**: [Cross-system integration quality requirements]
- **[Performance Quality Standard]**: [Performance benchmarks and optimization targets]
- **[Security Quality Standard]**: [Security requirements and compliance standards]

### Compliance and Governance
- **Process Compliance**: [Adherence to established processes and procedures]
- **Documentation Standards**: [Comprehensive documentation and knowledge management]
- **Audit Requirements**: [Auditability and traceability requirements]
- **Change Management**: [Change control and approval processes]

## Advanced Success Criteria

### Functional Excellence
- ✅ [Complex functional requirement 1 with measurable criteria]
- ✅ [Integration requirement with specific success metrics]
- ✅ [Performance requirement with quantitative targets]
- ✅ [Quality requirement with validation procedures]

### Operational Excellence
- ✅ Seamless integration with all relevant shared tools and systems
- ✅ Advanced logging and monitoring with comprehensive coverage
- ✅ Automatic CLAUDE.md documentation with detailed capability descriptions
- ✅ Cross-agent coordination and communication capabilities

### Strategic Value
- ✅ [Strategic business value delivery and measurement]
- ✅ [Competitive advantage and differentiation capabilities]
- ✅ [Scalability and future-proofing considerations]
- ✅ [Innovation and continuous improvement capabilities]

## Advanced Token Usage Optimization

### Intelligent Context Loading
- **Predictive Loading**: Anticipate context needs based on request analysis
- **Priority Optimization**: Load most critical contexts first
- **Dynamic Adjustment**: Adjust context loading based on task complexity
- **Efficiency Monitoring**: Continuous optimization of token usage patterns

### Performance Optimization Strategies
- **Context Caching**: Leverage Claude Code's advanced caching mechanisms
- **Shared Tool Maximization**: Prioritize shared tools to reduce duplication
- **Conditional Loading**: Advanced conditional logic for context selection
- **Token Budget Management**: Manage token usage within optimal ranges

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)

## Specialized Template Usage Instructions

### For Complex Agent Development:
1. **Comprehensive Planning**: Thoroughly plan agent architecture and capabilities
2. **Context Strategy**: Design sophisticated context loading and management strategy
3. **Integration Design**: Plan extensive integration with shared tools and other agents
4. **Performance Planning**: Design for optimal token usage and response performance
5. **Quality Framework**: Establish comprehensive quality standards and validation procedures

### Advanced Configuration Requirements:
- **Model Selection**: Use opus for complex reasoning and multi-domain capabilities
- **Token Management**: Plan for higher token usage with sophisticated optimization
- **Context Architecture**: Design comprehensive context file structure
- **Integration Testing**: Extensive testing of all integrations and workflows
- **Performance Monitoring**: Advanced monitoring and optimization procedures

### Complexity Considerations:
- **Multi-Domain Expertise**: Handle multiple related domains with deep expertise
- **Advanced Workflows**: Support complex, multi-step procedures and processes
- **System Integration**: Deep integration with multiple systems and tools
- **Cross-Agent Coordination**: Sophisticated coordination with other agents
- **Advanced Monitoring**: Comprehensive logging, monitoring, and analytics