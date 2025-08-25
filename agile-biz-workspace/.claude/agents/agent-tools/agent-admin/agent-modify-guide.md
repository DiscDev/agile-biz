---
title: Agent Modification Guide
type: agent-context
token_count: 1234
keywords: [edit, modify, update, change, refactor, improve]
agents: [agent-admin]
---

# Agent Modification Guide - Specialized Context

## Editing Existing Agents Safely

### Pre-Modification Analysis
1. **Current State Assessment**: Review existing agent structure and functionality
2. **Change Impact Analysis**: Identify what will be affected by modifications
3. **Backup Strategy**: Create backups before making significant changes
4. **Testing Plan**: Plan validation of changes after implementation
5. **Documentation Updates**: Identify required documentation changes

### Agent Modification Workflow

#### Step 1: Agent Assessment
```markdown
Modification Assessment Template:
- **Agent Name**: Which agent is being modified
- **Current Version**: Document existing state and capabilities
- **Modification Goals**: What needs to be changed and why
- **Impact Scope**: Which components will be affected
- **Risk Level**: Low/Medium/High complexity and risk assessment
- **Testing Requirements**: How to validate changes
```

#### Step 2: Backup and Safety
1. **Create Backup**: Copy current agent file and contexts
2. **Document Current State**: Record existing functionality and behavior
3. **Version Control**: Use git to track changes if possible
4. **Rollback Plan**: Plan how to revert changes if needed

#### Step 3: Modification Types and Procedures

### YAML Frontmatter Modifications

**Updating Keywords:**
```yaml
# Before
keywords: [old, keywords, patterns]

# After - Adding new capabilities
keywords: [old, keywords, patterns, new, capability, words]
```

**Model Changes:**
- **Upgrading**: haiku → sonnet → opus (increased capability)
- **Downgrading**: opus → sonnet → haiku (cost optimization)
- **Rationale**: Document why model change is needed

**Token Count Updates:**
- Recalculate after any content changes
- Use token counting tools for accuracy
- Update frontmatter with new counts

### Content Structure Modifications

**Adding New Capabilities:**
1. Update "Core Responsibilities" section
2. Add new keyword patterns for context loading
3. Review and update shared tools (add only relevant ones)
4. Create new context files if needed
5. Update task analysis examples
6. Test new functionality

**Removing Capabilities:**
1. Remove from "Core Responsibilities"
2. Remove keyword patterns
3. Remove irrelevant shared tools
4. Delete unused context files
5. Clean up task examples
6. Update documentation

**Reorganizing Structure:**
1. Maintain standard agent structure pattern
2. Preserve required sections (Purpose, Responsibilities, etc.)
3. Keep context loading logic intact
4. Update navigation and cross-references

### Context Loading Logic Modifications

**Adding New Context Loading:**
```markdown
# Adding new shared tool integration
- **new, keywords, patterns** → `shared-tools/new-tool.md`

# Adding agent-specific context
- **specialized, domain, words** → `agent-tools/agent-name/new-context.md`
```

**Optimizing Context Loading:**
1. **Consolidate**: Merge similar contexts
2. **Prioritize**: Load most important contexts first
3. **Condition**: Add more specific keyword patterns
4. **Remove**: Delete unused context mappings

**Context Dependencies:**
- Ensure all referenced contexts exist
- Validate context file paths are correct
- Test keyword patterns trigger correctly
- Check for circular dependencies

### Shared Tools Relevance Review (CRITICAL)

**When modifying any agent, review shared tools for relevance:**

**Shared Tools Audit Checklist:**
- ✅ **context7-mcp-integration.md**: Does agent need API/documentation access?
- ✅ **github-mcp-integration.md**: Does agent work with code repositories?
- ✅ **docker-containerization.md**: Does agent handle container deployments?
- ✅ **git-version-control.md**: Does agent need basic git workflows?
- ✅ **supabase-mcp-integration.md**: Does agent work with databases/backends?
- ✅ **aws-infrastructure.md**: Does agent manage cloud infrastructure?

**Remove Irrelevant Tools:**
- Weather agents don't need Docker or AWS
- Music agents don't need Supabase or GitHub  
- Domain specialists usually only need Context7
- Developer agents need most tools
- DevOps agents need infrastructure tools

**Example Cleanup:**
```markdown
# Before (incorrect - weather agent)
- **docker, container** → `shared-tools/docker-containerization.md`
- **aws, cloud** → `shared-tools/aws-infrastructure.md`

# After (correct - weather agent)  
- **context7, mcp, weather-api** → `shared-tools/context7-mcp-integration.md`
```

### Agent-Specific Context Modifications

**Modifying Existing Contexts:**
1. **Content Updates**: Improve or correct information
2. **Structure Changes**: Reorganize for better clarity
3. **Token Optimization**: Reduce unnecessary content
4. **Integration Updates**: Add new tool or API integrations

**Adding New Context Files:**
1. **Create Context File**: In `agent-tools/{agent-name}/`
2. **Update Agent Keywords**: Add triggering patterns
3. **Test Context Loading**: Verify contexts load correctly
4. **Update Documentation**: Record new context purpose

**Removing Context Files:**
1. **Remove File References**: Delete from agent keyword patterns
2. **Delete Context Files**: Remove from agent-tools directory
3. **Test Functionality**: Ensure agent still works correctly
4. **Clean Documentation**: Remove from any documentation

### Integration Updates

**Logging Integration Changes:**
- Verify logging still functions after modifications
- Update agent type in logging calls if agent renamed
- Test logging integration with new keywords

**CLAUDE.md Documentation Updates:**
```markdown
# Before
#### **Old Agent Name** (`old-keyword`)
- **Purpose**: Old description
- **Triggers**: "old", "keywords"
- **Capabilities**: Old capabilities list

# After
#### **Updated Agent Name** (`new-keyword`)
- **Purpose**: Updated description
- **Triggers**: "updated", "keywords", "new patterns"
- **Capabilities**: 
  - Updated capabilities list
  - New functionality added
  - Improved integrations
```

### Common Modification Scenarios

#### Capability Enhancement
**Adding New Features:**
1. Identify new capability requirements
2. Add keywords for new functionality
3. Create or update context files
4. Update agent responsibilities
5. Add task analysis examples
6. Test new capabilities
7. Update documentation

#### Performance Optimization
**Improving Efficiency:**
1. Analyze current token usage
2. Identify optimization opportunities
3. Consolidate duplicate content
4. Optimize context loading patterns
5. Update token counts
6. Test performance improvements
7. Document optimizations

#### Integration Updates
**Adding New Tool Integration:**
1. Identify shared tool or create new context
2. Add keyword patterns for new tool
3. Update capabilities and responsibilities
4. Create usage examples
5. Test integration functionality
6. Update documentation

#### Bug Fixes and Corrections
**Fixing Issues:**
1. Identify root cause of issue
2. Plan minimal fix to resolve problem
3. Implement correction
4. Test fix thoroughly
5. Validate no new issues introduced
6. Document fix in change log

### Validation and Testing

#### Post-Modification Testing
```markdown
Modification Validation Checklist:
- ✅ YAML frontmatter parses correctly
- ✅ All referenced contexts exist and load
- ✅ Keywords trigger appropriate contexts
- ✅ Agent functionality works as expected
- ✅ No conflicts with other agents
- ✅ Logging integration still functions
- ✅ Token counts updated accurately
- ✅ CLAUDE.md documentation updated
- ✅ Performance acceptable
- ✅ No broken references or dependencies
```

#### Regression Testing
1. **Basic Functionality**: Test core agent capabilities
2. **Context Loading**: Verify all context patterns work
3. **Integration**: Check logging and documentation
4. **Performance**: Monitor token usage and response time
5. **Compatibility**: Ensure no conflicts with other agents

#### Rollback Procedures
If modifications cause issues:
1. **Immediate Rollback**: Restore from backup
2. **Partial Rollback**: Revert specific problematic changes
3. **Debug and Fix**: Identify and correct issues
4. **Re-test**: Validate fixes before final deployment
5. **Document**: Record lessons learned

### Best Practices for Agent Modification

#### Safety First
- Always create backups before major changes
- Test modifications thoroughly
- Make incremental changes when possible
- Document all changes and reasoning

#### Consistency Maintenance
- Follow established agent structure patterns
- Maintain consistent keyword strategies
- Preserve integration standards
- Keep documentation current

#### Performance Awareness
- Monitor token usage impacts
- Optimize context loading efficiency
- Balance capability vs. performance
- Test with realistic usage scenarios

#### Documentation Excellence
- Update all relevant documentation
- Provide clear change descriptions
- Include before/after comparisons
- Document any breaking changes

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)