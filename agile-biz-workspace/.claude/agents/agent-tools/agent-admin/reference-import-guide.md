---
title: Reference Import Guide
type: agent-context
token_count: 1345
keywords: [import, reference, migrate, adapt, convert]
agents: [agent-admin]
---

# Reference Import Guide - Specialized Context

## Importing and Adapting Agents from Reference Files

### Reference System Analysis
The reference system at `agile-ai-agents-v7.0.0/.claude/agents/` contains previous agent implementations that can be imported and adapted to our current infrastructure.

### Pre-Import Assessment

#### Step 1: Reference System Exploration
```bash
# List available reference agents
ls -la agile-ai-agents-v7.0.0/.claude/agents/

# Preview agent structure
head -20 agile-ai-agents-v7.0.0/.claude/agents/[agent-name].md

# Check for associated context files
find agile-ai-agents-v7.0.0/.claude/agents/ -name "*[agent-name]*"
```

#### Step 2: Compatibility Analysis
```markdown
Import Assessment Template:
- **Reference Agent**: Name and location in reference system
- **Current Relevance**: Is the agent still needed/relevant?
- **Infrastructure Gaps**: What needs to be adapted/updated?
- **Integration Requirements**: Logging, documentation, shared tools
- **Complexity Level**: Simple import vs. major refactoring needed
- **Context Dependencies**: Additional files and dependencies
```

### Import Workflow Process

#### Step 1: Reference Agent Analysis
1. **Read Agent File**: Understand purpose, capabilities, and structure
2. **Identify Dependencies**: Find related context files and references
3. **Assess Architecture**: Compare to current agent patterns
4. **Evaluate Currency**: Determine if information is still accurate
5. **Plan Adaptations**: List required changes for current infrastructure

#### Step 2: Structure Mapping

**Reference vs. Current Architecture:**
```markdown
# Reference System Pattern (Old)
---
title: Agent Name
description: Agent description  
version: 1.0
capabilities: [list, of, capabilities]
---

# Current System Pattern (Target)
---
title: Agent Name - Brief Description
type: agent
model: opus
token_count: [calculated]
keywords: [keyword, patterns, for, context, loading]
specialization: domain-expertise
agents: [agent-name]
---
```

#### Step 3: Content Adaptation Strategy

**Infrastructure Updates Required:**
1. **YAML Frontmatter**: Convert to current standard format
2. **Context Loading Logic**: Implement current conditional loading patterns  
3. **Shared Tools Integration**: Replace old patterns with shared tools
4. **Logging Integration**: Add automatic logging system integration
5. **Documentation Standards**: Update to current documentation format

### Import Implementation Process

#### Phase 1: Structure Conversion
```yaml
# Convert reference frontmatter to current standard
---
name: [imported-agent-name]
description: [Brief description from reference updated for current capabilities]
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: [opus|sonnet|haiku]
token_count: [to be calculated]
---
```

**Keyword Extraction Strategy:**
1. **Analyze Reference Content**: Identify key terms and concepts
2. **Map to Current Patterns**: Align with shared tools and contexts
3. **Add New Keywords**: Include modern terminology and patterns
4. **Test Loading**: Verify keywords trigger appropriate contexts

#### Phase 2: Content Integration

**Shared Tools Mapping:**
```markdown
# Reference content analysis
Old content: "Git workflow procedures..."
Current mapping: → `shared-tools/git-version-control.md`

Old content: "Docker deployment steps..."  
Current mapping: → `shared-tools/docker-containerization.md`

Old content: "AWS infrastructure setup..."
Current mapping: → `shared-tools/aws-infrastructure.md`
```

**Content Modernization:**
1. **Update Technologies**: Replace outdated tools/versions with current
2. **Add New Capabilities**: Enhance with modern practices and tools
3. **Remove Obsolete**: Delete outdated or irrelevant information
4. **Enhance Integration**: Add integration with current infrastructure

#### Phase 3: Context Architecture Design

**Determine Context Strategy:**
```markdown
Import Context Decision Tree:

Simple Agent (Basic functionality):
├── Use shared tools only
└── No agent-specific contexts needed

Specialized Agent (Complex domain):
├── Create agent-tools/[agent-name]/ directory
├── Extract specialized knowledge to agent contexts
└── Map common functionality to shared tools

Multi-Domain Agent (Broad capabilities):
├── Extensive shared tools usage
├── Multiple agent-specific contexts
└── Complex conditional loading logic
```

### Adaptation Procedures

#### Content Extraction and Conversion
```markdown
Reference Content Analysis:
1. **Core Purpose**: Extract main agent function and scope
2. **Capabilities List**: Identify specific features and functions  
3. **Domain Knowledge**: Extract specialized expertise content
4. **Procedures**: Convert workflows to current patterns
5. **Examples**: Update examples with current tools/syntax
6. **Integration**: Add current infrastructure integration
```

#### Modern Infrastructure Integration

**Logging System Integration:**
```markdown
### Context Loading Logic:
1. **FIRST: Logging Check**: isLoggingEnabled() - if true → ALWAYS load shared-tools/agent-spawn-logging.md and execute logging
   - **MANDATORY EXECUTION**: node .claude/agents/scripts/logging/logging-functions.js full-log [agent-type] "[user request]"
   - **Error Handling**: Continue if logging fails (non-blocking)
2. **Always Load**: agent-tools/[agent-name]/core-[agent]-principles.md
3. **Shared Tools**: [Mapped shared tools based on reference content]
4. **Agent-Specific**: [Extracted domain-specific contexts]
```

**CLAUDE.md Documentation Generation:**
```markdown
#### **[Agent Name]** (`agent-keyword`)
- **Purpose**: [Extracted from reference + modernized]
- **Triggers**: "[Generated from keywords and reference patterns]"
- **Capabilities**:
  - [Modernized capability 1 from reference]
  - [Enhanced capability 2 with current tools]
  - [New capability 3 added during import]
  - [Integration capabilities from current infrastructure]
- **Model**: [Selected based on complexity analysis]
```

### Common Import Scenarios

#### Scenario 1: Direct Import (Minimal Changes)
**When**: Reference agent maps well to current patterns
**Process**:
1. Convert YAML frontmatter to current format
2. Add logging integration
3. Map to appropriate shared tools
4. Update examples and references
5. Test and validate functionality

#### Scenario 2: Enhanced Import (Significant Improvements)
**When**: Reference agent needs modernization and enhancement
**Process**:
1. Extract core purpose and capabilities
2. Research current best practices for domain
3. Design enhanced agent architecture
4. Create modern context structure
5. Add new capabilities and integrations
6. Comprehensive testing and validation

#### Scenario 3: Hybrid Import (Partial Integration)
**When**: Only portions of reference agent are useful
**Process**:
1. Extract valuable content and procedures
2. Integrate into existing agents as additional contexts
3. Update shared tools with useful reference content
4. Enhance existing agents rather than creating new one

### Quality Assurance for Imports

#### Import Validation Checklist
```markdown
Pre-Import Validation:
- ✅ Reference agent content reviewed and understood
- ✅ Adaptation requirements identified
- ✅ Integration plan created
- ✅ Testing strategy defined

Post-Import Validation:
- ✅ YAML frontmatter correct and parses properly
- ✅ Keywords trigger appropriate context loading
- ✅ Agent functionality matches intended purpose  
- ✅ Logging integration works correctly
- ✅ CLAUDE.md documentation complete and accurate
- ✅ No conflicts with existing agents
- ✅ Token counts calculated and optimized
- ✅ All references and dependencies resolved
```

#### Testing Imported Agents
1. **Basic Functionality**: Test core agent capabilities
2. **Context Loading**: Verify keyword patterns work correctly
3. **Integration**: Check logging and documentation systems
4. **Performance**: Monitor token usage and response quality
5. **Compatibility**: Ensure no conflicts with existing infrastructure

### Import Best Practices

#### Planning and Preparation
- Thoroughly analyze reference agent before starting import
- Plan adaptations required for current infrastructure  
- Identify opportunities for enhancement during import
- Create comprehensive testing plan

#### Adaptation Excellence
- Don't just copy - improve and modernize content
- Integrate fully with current infrastructure patterns
- Add value through enhanced capabilities and integration
- Maintain consistency with existing agent standards

#### Quality Control
- Test imported agents extensively
- Validate all integrations work correctly
- Document changes and adaptations made
- Monitor performance and adjust as needed

#### Documentation and Maintenance
- Document import process and decisions made
- Record adaptations and enhancements
- Establish maintenance plan for imported agent
- Create usage examples and guidance

### Troubleshooting Common Import Issues

#### YAML Frontmatter Problems
- **Syntax Errors**: Validate YAML format carefully
- **Missing Fields**: Ensure all required fields present
- **Invalid Values**: Check model, type, and other field values

#### Context Loading Issues  
- **Broken References**: Verify all context files exist
- **Keyword Conflicts**: Check for overlapping patterns with existing agents
- **Path Problems**: Ensure file paths are correct

#### Integration Failures
- **Logging Errors**: Test logging integration thoroughly
- **Documentation Missing**: Verify CLAUDE.md updates complete
- **Shared Tool Conflicts**: Check for compatibility issues

#### Performance Problems
- **High Token Usage**: Optimize context loading and content
- **Slow Response**: Review context complexity and loading patterns
- **Memory Issues**: Check for circular dependencies or excessive loading

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)