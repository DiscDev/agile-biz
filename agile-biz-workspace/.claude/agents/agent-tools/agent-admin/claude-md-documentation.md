---
title: CLAUDE.md Documentation Guide
type: agent-context
token_count: 876
keywords: [claude.md, document, documentation, update, readme]
agents: [agent-admin]
---

# CLAUDE.md Documentation Guide - Specialized Context

## Automatic CLAUDE.md Documentation Updates

### Purpose and Importance
The `CLAUDE.md` file serves as the primary configuration and instruction file for Claude Code. All agents must be documented here to ensure Claude Code is aware of their existence and capabilities.

### CLAUDE.md Location and Structure
**File Path**: `/Users/phillipbrown/No-iCloud-Folder/AgileBiz/agile-bz-workspace/CLAUDE.md`

**Relevant Section**: 
```markdown
## Specialized Agents

### Available Claude Code Agents

#### **Developer Agent** (`developer`)
[Existing documentation...]

#### **DevOps Agent** (`devops`)
[Existing documentation...]

#### **Agent Admin** (`agent-admin`)
[Existing documentation...]

### Agent Usage Examples
[Usage patterns and examples...]
```

### Agent Documentation Format Standard

#### Required Documentation Template
```markdown
#### **[Agent Display Name]** (`agent-keyword`)
- **Purpose**: [One sentence description of primary function]
- **Triggers**: "[trigger phrase 1]", "[trigger phrase 2]", "[keyword patterns]"
- **Capabilities**:
  - [Specific capability 1 with clear description]
  - [Specific capability 2 with integration details]
  - [Specific capability 3 with value proposition]
  - [Additional capabilities as needed]
- **Model**: [Claude model - opus/sonnet/haiku with reasoning]
```

#### Field Requirements and Guidelines

**Agent Display Name:**
- Use proper Title Case formatting
- Keep concise but descriptive
- Match the agent's primary identity

**Agent Keyword:**
- Use the primary trigger keyword in lowercase
- Should match main keyword from agent's YAML frontmatter
- Used in parentheses after display name

**Purpose:**
- Single, clear sentence describing main function
- Focus on what the agent does, not how
- Should be immediately understandable

**Triggers:**
- List primary phrases users would naturally use
- Include both formal and casual trigger patterns
- Comma-separated, each in quotes
- Should cover main use cases

**Capabilities:**
- 3-6 specific capabilities listed
- Each item should be concrete and actionable
- Highlight integration with infrastructure/tools
- Focus on value delivered to users

**Model:**
- Specify Claude model used (opus, sonnet, haiku)
- Include brief reasoning for model choice
- Consider complexity and performance requirements

### Documentation Update Process

#### Step 1: Read Current CLAUDE.md
```markdown
Documentation Update Procedure:
1. **Read File**: Load current CLAUDE.md content
2. **Locate Section**: Find "### Available Claude Code Agents"
3. **Identify Position**: Determine alphabetical placement
4. **Check Existing**: Verify if agent already documented
5. **Plan Update**: Prepare insert/update operation
```

#### Step 2: Generate Agent Documentation
```markdown
Agent Documentation Generation:
1. **Extract Information**: From agent YAML frontmatter and content
2. **Format Purpose**: Create clear, concise purpose statement
3. **Compile Triggers**: List natural trigger phrases and keywords
4. **Summarize Capabilities**: Extract key capabilities and value propositions
5. **Specify Model**: Include model choice with reasoning
6. **Validate Format**: Ensure matches template exactly
```

#### Step 3: Update File Content
```markdown
File Update Process:
1. **Preserve Structure**: Maintain existing CLAUDE.md formatting
2. **Alphabetical Order**: Insert new agent in correct alphabetical position
3. **Consistent Formatting**: Match existing agent documentation style
4. **Validate Syntax**: Ensure Markdown formatting is correct
5. **Test Readability**: Review documentation for clarity
```

### Documentation Examples

#### Example 1: New Agent Addition
```markdown
# Before Update
#### **DevOps Agent** (`devops`)
- **Purpose**: Infrastructure management, deployment automation, operational excellence
- **Triggers**: "devops agent", "deploy", "infrastructure", "docker", "kubernetes", "aws", "ci/cd"
- **Capabilities**:
  - Infrastructure provisioning (Terraform, CloudFormation)
  - Container orchestration (Docker, Kubernetes)
  - CI/CD pipeline management
  - Monitoring and observability setup
  - Security and compliance automation
- **Model**: Claude 3.5 Opus (complex reasoning for infrastructure tasks)

### Agent Usage Examples

# After Update (Adding Testing Agent)
#### **DevOps Agent** (`devops`)
- **Purpose**: Infrastructure management, deployment automation, operational excellence
[Same content as before...]

#### **Testing Agent** (`testing`)
- **Purpose**: Automated testing workflows, quality assurance, and test coverage analysis
- **Triggers**: "testing agent", "run tests", "qa", "test coverage", "automated testing"
- **Capabilities**:
  - Unit and integration test creation
  - Test automation framework setup
  - Code coverage analysis and reporting
  - Performance and load testing
  - Quality assurance workflow optimization
- **Model**: Claude 3.5 Sonnet (balanced reasoning for testing workflows)

### Agent Usage Examples
```

#### Example 2: Agent Update
```markdown
# Before Update
#### **Agent Admin** (`agent-admin`)
- **Purpose**: Claude Code agent infrastructure management
- **Triggers**: "agent-admin", "create agent", "new agent"
- **Capabilities**:
  - Create new agents from templates
  - Basic agent configuration
- **Model**: Claude 3.5 Opus

# After Update (Enhanced capabilities)
#### **Agent Admin** (`agent-admin`)
- **Purpose**: Claude Code agent infrastructure management and lifecycle operations
- **Triggers**: "agent-admin", "create agent", "new agent", "edit agent", "delete agent", "import agent", "agent management"
- **Capabilities**:
  - Create new agents from scratch using templates
  - Import and adapt agents from reference files
  - Edit existing agent configurations and contexts
  - Delete obsolete agents and clean up infrastructure
  - Validate agent YAML frontmatter and structure
  - Optimize context loading and token usage
  - Automatically update CLAUDE.md documentation
- **Model**: Claude 3.5 Opus (complex reasoning for infrastructure management)
```

### Update Implementation

#### Automated Documentation Process
```markdown
CLAUDE.md Update Workflow:
1. **Agent Analysis**: Extract documentation information from agent
2. **Content Generation**: Create formatted documentation block
3. **File Reading**: Load current CLAUDE.md content
4. **Position Calculation**: Determine correct alphabetical insertion point
5. **Content Injection**: Insert/update agent documentation
6. **File Writing**: Save updated CLAUDE.md content
7. **Validation**: Verify successful update and formatting
```

#### Error Handling and Validation
```markdown
Documentation Validation Checklist:
- ✅ CLAUDE.md file exists and is readable
- ✅ Agent section located correctly
- ✅ Documentation format matches template
- ✅ Alphabetical order maintained
- ✅ No duplicate agent entries
- ✅ Markdown syntax valid
- ✅ File saved successfully
- ✅ Content preserved (no accidental deletions)
```

### Special Cases and Considerations

#### Agent Renaming
```markdown
Renaming Documentation Process:
1. **Remove Old Entry**: Delete old agent documentation
2. **Add New Entry**: Insert updated agent documentation
3. **Update References**: Check for any references to old name
4. **Validate Order**: Ensure alphabetical order maintained
5. **Test Functionality**: Verify Claude Code recognizes new name
```

#### Agent Deletion
```markdown
Deletion Documentation Process:
1. **Locate Entry**: Find agent documentation in CLAUDE.md
2. **Remove Content**: Delete entire agent documentation block
3. **Check Dependencies**: Ensure no broken references remain
4. **Validate Structure**: Confirm file structure remains intact
5. **Update Examples**: Remove agent from usage examples if referenced
```

#### Bulk Updates
```markdown
Multiple Agent Updates:
1. **Plan Changes**: Organize all updates to minimize file operations
2. **Batch Processing**: Update multiple agents in single file operation
3. **Validation**: Test all changes together
4. **Rollback Plan**: Maintain backup for error recovery
```

### Best Practices for Documentation

#### Content Quality
- **Clarity**: Use clear, jargon-free language
- **Consistency**: Maintain formatting consistency with existing agents
- **Completeness**: Include all required information
- **Accuracy**: Ensure documentation matches actual agent capabilities

#### Maintenance
- **Regular Reviews**: Periodically validate documentation accuracy
- **Update Triggers**: Update documentation when agents are modified
- **Version Control**: Track documentation changes
- **User Feedback**: Incorporate feedback to improve clarity

#### Integration
- **Automatic Updates**: Always update CLAUDE.md when agents change
- **Testing**: Verify Claude Code recognizes documented agents
- **Cross-References**: Ensure consistency with other documentation
- **Examples**: Keep usage examples current and relevant

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)