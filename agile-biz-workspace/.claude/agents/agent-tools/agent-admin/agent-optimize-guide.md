---
title: Agent Optimization Guide
type: agent-context
token_count: 1189
keywords: [optimize, token, performance, efficiency, improve, reduce]
agents: [agent-admin]
---

# Agent Optimization Guide - Specialized Context

## Token Usage Optimization and Performance Tuning

### Optimization Assessment Framework
1. **Current Performance Baseline**: Measure existing token usage patterns
2. **Bottleneck Identification**: Find inefficient context loading patterns
3. **Optimization Opportunities**: Identify areas for improvement
4. **Impact Analysis**: Estimate optimization benefits vs. effort
5. **Success Metrics**: Define measurable improvement targets

### Token Usage Analysis

#### Token Counting Methodology
```bash
# Calculate agent definition tokens
wc -w .claude/agents/agent-name.md

# Calculate context file tokens  
wc -w .claude/agents/agent-tools/agent-name/*.md

# Calculate shared tool tokens
wc -w .claude/agents/shared-tools/*.md
```

#### Token Usage Patterns
1. **Agent Definition**: Base agent file token count
2. **Always Loaded**: Contexts loaded for every request
3. **Conditional**: Contexts loaded based on keywords
4. **Shared Tools**: Multi-agent contexts (amortized cost)
5. **Total Context**: Sum of all loaded contexts per request

### Optimization Strategies

#### 1. Shared Tools Migration
**Convert Duplicate Content to Shared Tools:**

**Before (Inefficient):**
```markdown
# In multiple agent files
## Git Workflow
- Create branches for features
- Use pull requests for code review
- Maintain clean commit history
- Follow conventional commit messages
```

**After (Optimized):**
```markdown
# In shared-tools/git-version-control.md
- **git, branch, commit, pull request** → `shared-tools/git-version-control.md`

# In agent files
- **git, version control, workflow** → `shared-tools/git-version-control.md`
```

**Benefits:**
- ✅ Reduced duplication across agents
- ✅ Single source of truth for git procedures
- ✅ Token savings multiplied across all agents using git

#### 2. Context Loading Optimization

**Keyword Pattern Refinement:**
```markdown
# Before - Broad patterns (loads too much)
- **code, develop, build** → loads multiple contexts

# After - Specific patterns (targeted loading)  
- **react, component, jsx** → `shared-tools/react-development.md`
- **node, server, api** → `shared-tools/nodejs-backend.md`
- **build, webpack, vite** → `shared-tools/build-tools.md`
```

**Conditional Loading Logic:**
```markdown
# Optimized loading logic
1. **Always Load**: Only essential base knowledge
2. **Primary Keywords**: Load most relevant contexts first
3. **Secondary Keywords**: Load additional contexts if needed
4. **Fallback**: Only load comprehensive contexts for ambiguous requests
```

#### 3. Content Consolidation

**Context File Optimization:**
1. **Remove Redundancy**: Eliminate duplicate information
2. **Merge Related**: Combine similar contexts into single files
3. **Prioritize Content**: Most important information first
4. **Remove Verbosity**: Concise, actionable content only

**Example Consolidation:**
```markdown
# Before - Multiple small contexts
- docker-basics.md (200 tokens)
- docker-compose.md (300 tokens)  
- docker-deployment.md (250 tokens)

# After - Single comprehensive context
- docker-containerization.md (600 tokens)
# Net savings: 150 tokens + reduced loading overhead
```

#### 4. Agent-Specific Context Optimization

**Context File Structure:**
```markdown
# Optimized structure
.claude/agents/agent-tools/agent-name/
├── core-principles.md           # 400-600 tokens (always loaded)
├── primary-workflows.md         # 600-800 tokens (common patterns)
└── specialized-procedures.md    # 400-600 tokens (specific tasks)

# Avoid: Many small files (loading overhead)
# Avoid: One massive file (loads unnecessary content)
```

### Performance Optimization Techniques

#### 1. Token Count Accuracy
```yaml
# Always update token counts after changes
---
title: Agent Name
token_count: 1247  # Accurate count after optimization
---
```

**Token Calculation Tools:**
- Word count approximation: `wc -w filename.md`
- Character count estimation: `wc -c filename.md | awk '{print int($1/4)}'`
- Manual validation with actual usage

#### 2. Context Loading Efficiency

**Loading Priority:**
```markdown
### Context Loading Logic:
1. **FIRST: Logging Check** (minimal overhead)
2. **Always Load**: Core agent knowledge (essential only)
3. **High-Value Contexts**: Most frequently needed contexts
4. **Specialized Contexts**: Task-specific contexts
5. **Fallback Contexts**: Comprehensive contexts (last resort)
```

**Keyword Optimization:**
- Use specific keywords for targeted loading
- Avoid overly broad patterns that load unnecessary contexts
- Test keyword effectiveness with real usage patterns
- Monitor which contexts are actually used vs. loaded

#### 3. Shared Tools Strategy

**Maximizing Shared Tool Benefits:**
1. **Identify Common Patterns**: Find content duplicated across agents
2. **Extract to Shared Tools**: Create reusable context files
3. **Update Agent References**: Replace duplicated content with shared tool references
4. **Validate Functionality**: Ensure agents still work correctly
5. **Measure Improvements**: Calculate token savings

**Shared Tool Design Principles:**
- **Focused Purpose**: Each shared tool serves specific functionality
- **Comprehensive Coverage**: Include all necessary information
- **Clear Keywords**: Obvious patterns for context loading
- **Regular Updates**: Keep shared tools current and relevant

### Optimization Implementation Process

#### Step 1: Performance Baseline
```markdown
Optimization Assessment Template:
- **Agent Name**: Target agent for optimization
- **Current Token Usage**: Baseline measurements
  - Agent definition: X tokens
  - Always loaded contexts: Y tokens  
  - Average conditional contexts: Z tokens
  - Total average per request: X+Y+Z tokens
- **Pain Points**: Identified inefficiencies
- **Optimization Targets**: Specific improvement goals
```

#### Step 2: Optimization Planning
1. **Prioritize Opportunities**: Focus on highest-impact optimizations
2. **Sequence Changes**: Plan optimization order to avoid conflicts
3. **Risk Assessment**: Identify potential issues and mitigation strategies
4. **Testing Strategy**: Plan validation of optimizations

#### Step 3: Implementation
1. **Backup Current State**: Create safety backups
2. **Implement Optimizations**: Make planned changes
3. **Update Token Counts**: Recalculate accurate token usage
4. **Test Functionality**: Verify agent still works correctly
5. **Measure Results**: Compare performance to baseline

#### Step 4: Validation and Testing

**Optimization Validation Checklist:**
- ✅ Token usage reduced compared to baseline
- ✅ Agent functionality preserved
- ✅ Context loading works correctly
- ✅ No broken references or dependencies
- ✅ Performance improved (response time/efficiency)
- ✅ Token counts updated accurately
- ✅ Documentation reflects changes

### Common Optimization Scenarios

#### High Token Count Agent
**Problem**: Agent uses too many tokens per request
**Solutions**:
- Extract common content to shared tools
- Remove unnecessary verbose content
- Optimize context loading patterns
- Consolidate related contexts

#### Slow Context Loading
**Problem**: Agent takes too long to load contexts
**Solutions**:
- Reduce number of context files loaded
- Optimize keyword patterns for specificity
- Prioritize most important contexts
- Remove redundant context loading

#### Duplicate Content Across Agents
**Problem**: Same information repeated in multiple agents
**Solutions**:
- Create shared tools for common content
- Update all agents to reference shared tools
- Remove duplicated content from agent files
- Establish shared tool maintenance process

### Advanced Optimization Techniques

#### Dynamic Context Loading
**Conditional Loading Based on Request Complexity:**
```markdown
# Simple requests - minimal context
"create a component" → core-principles.md only

# Complex requests - comprehensive context  
"create a full-stack application with authentication" → all relevant contexts
```

#### Context Caching Strategy
**Leverage Claude Code's Context Caching:**
- Keep frequently used contexts at consistent positions
- Use stable shared tools that don't change often
- Design context patterns that benefit from caching

#### Performance Monitoring
**Ongoing Optimization:**
1. **Usage Analytics**: Track which contexts are actually used
2. **Performance Metrics**: Monitor token usage trends
3. **User Feedback**: Identify areas for improvement
4. **Regular Reviews**: Periodic optimization assessments

### Optimization Best Practices

#### Design for Efficiency
- Plan optimization during agent creation
- Use shared tools from the beginning
- Design keyword patterns for specificity
- Consider token usage in all decisions

#### Measure and Monitor  
- Establish baseline measurements
- Track optimization results
- Monitor ongoing performance
- Regular performance reviews

#### Balance Optimization and Functionality
- Don't sacrifice functionality for token savings
- Maintain comprehensive coverage of agent domain
- Ensure optimization doesn't break existing workflows
- Test extensively after optimization changes

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)