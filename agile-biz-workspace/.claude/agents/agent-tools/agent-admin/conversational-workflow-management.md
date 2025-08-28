# Conversational Workflow Management for Agent Creation

## Overview
This context provides the agent-admin with the capability to manage the conversational workflow for creating new Claude Code agents. This enables natural, multi-turn conversations that guide users through the agent creation process.

## Core Responsibilities

### 1. Tool Categories Management
- **Read and parse** `.claude/commands/create-agent/tool-categories.json`
- **Auto-detect new shared tools** from `.claude/agents/shared-tools/` directory
- **Update categories** when new tools are discovered or user requests custom tools
- **Categorize agent purposes** based on keywords and descriptions

### 2. Conversational Flow Orchestration
- **Parse user descriptions** to identify agent category (content_creation, development, business_analysis, research)
- **Make smart tool recommendations** based on detected category
- **Handle multi-turn conversations** for gathering agent specifications
- **Build complete agent specifications** for creation

### 3. Agent Specification Building
Build comprehensive agent specifications in this format:

```json
{
  "agent_name": "user-provided-name",
  "description": "detailed description from conversation",
  "model": "haiku|sonnet|opus",
  "tools": ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "LS"],
  "shared_tools": ["Context7 MCP", "Supabase MCP", "GitHub MCP"],
  "agent_specific_tools": [
    {
      "name": "Tool Name",
      "integration_type": "api_endpoint|webhook|database_connection",
      "config_required": ["api_key", "endpoint"],
      "documentation_needed": true,
      "user_requested": true
    }
  ],
  "responsibilities": ["primary task", "secondary task"],
  "boundaries": "what to avoid or limitations",
  "context_files": ["context-file-1.md", "integration-guide.md"]
}
```

### 4. Category Detection Logic
Use these patterns to detect agent categories:

**Content Creation**: writing, blog, content, marketing, copy, documentation, articles
**Development**: code, build, deploy, dev, programming, git, software, app  
**Business Analysis**: analysis, business, finance, data, reports, analytics
**Research**: research, academic, papers, studies, literature

### 5. Smart Tool Recommendations

#### Dynamic Tool Loading from Infrastructure

**Read tool-categories.json for category-specific recommendations:**

```javascript
// Load existing tool categories
const toolCategories = JSON.parse(fs.readFileSync('.claude/commands/create-agent/tool-categories.json'));

// Get shared tools for detected category
const categoryTools = toolCategories[detected_category];
const sharedTools = categoryTools.shared_tools;
const specializedTools = categoryTools.specialized_tools;
```

#### Category-Specific Tool Mappings

**Content Creation (`content_creation`)**:
- **Shared Tools**: Context7 MCP, Supabase MCP
- **Specialized Options**: Writer AI API, SEO Analysis Tools, WordPress API integration
- **Use Case**: Writing, blogging, content management, SEO optimization

**Development (`development`)**:
- **Shared Tools**: Context7 MCP, GitHub MCP, Git, Docker  
- **Specialized Options**: Code Quality APIs, Testing Framework APIs, Deployment Webhooks
- **Use Case**: Code review, testing, deployment, quality analysis

**Business Analysis (`business_analysis`)**:
- **Shared Tools**: Context7 MCP, Supabase MCP, AWS
- **Specialized Options**: Financial Data APIs, Business Intelligence Tools
- **Use Case**: Reporting, analytics, financial analysis, data visualization

**Research (`research`)**:
- **Shared Tools**: Context7 MCP
- **Specialized Options**: Academic Database APIs, Citation Management Tools  
- **Use Case**: Academic research, literature review, citation management

#### Tool Recommendation Logic

1. **Load Category Data**: Read from tool-categories.json based on detected category
2. **Present Shared Tools**: Always recommend category-specific shared tools
3. **Offer Specialized Tools**: Present optional specialized tools with descriptions
4. **Allow Selection**: Let user choose which specialized tools they want
5. **Support Custom Tools**: Handle requests for unlisted tools

#### Tool Selection Response Templates

**Shared Tools Presentation**:
```
Excellent! For [category] agents, I recommend these shared tools:
✅ **[Tool 1]** - [Description from tool-categories.json]
✅ **[Tool 2]** - [Description from tool-categories.json]

Include these shared tools? (yes/no)
```

**Specialized Tools Options** (if user wants advanced features):
```
I also have specialized tools available for [category]:
1. **[Specialized Tool 1]** - [Description and integration_type]
2. **[Specialized Tool 2]** - [Description and integration_type]  
3. **[Specialized Tool 3]** - [Description and integration_type]

Which specialized tools would you like? (1,2,3 or 'none')
```

### 6. Name Validation & Conflict Resolution

#### Real-time Name Checking Process
1. **Scan Existing Agents**: Check `.claude/agents/` directory for conflicts
2. **Validate Format**: Ensure lowercase-with-dashes pattern `^[a-z][a-z0-9-]*[a-z0-9]$`
3. **Generate Alternatives**: Suggest similar names if conflict exists

#### Name Validation Implementation
```bash
# Check if agent exists
ls .claude/agents/ | grep "^${agent_name}.md$"

# Generate alternatives based on category
content_creation: blog-writer, content-helper, copywriter, blog-assistant
development: code-reviewer, dev-helper, build-assistant, dev-buddy  
business_analysis: data-analyst, biz-helper, report-generator, analytics-assistant
research: research-helper, study-assistant, paper-analyzer, lit-reviewer
```

#### Alternative Name Generation Logic
**Pattern**: `[base-name]-[modifier]` or `[modifier]-[base-name]`

**Modifiers by Category**:
- **Content**: writer, helper, creator, assistant, pro, expert
- **Development**: reviewer, helper, buddy, assistant, pro, expert  
- **Business**: analyst, helper, generator, assistant, pro, expert
- **Research**: helper, assistant, analyzer, reviewer, pro, expert

**Example Conflict Resolution**:
```
User Input: "blog-helper" 
Conflict: blog-helper.md exists
Suggestions: "blog-writer", "content-helper", "blog-assistant", "blog-pro"
```

### 7. Documentation Generation
When creating agents with specialized tools:
- Create integration documentation files
- Generate configuration templates
- Update tool-categories.json with new user-requested tools
- Create context files for agent-specific tools

## Conversation Flow Implementation

### Dynamic State Detection & Response System

**When user responds to /create-agent command, detect conversation state and respond appropriately:**

### State 1: Agent Name Provided
**Detection**: User input matches pattern `^[a-z][a-z0-9-]*[a-z0-9]$`
**Example**: "blog-helper", "code-reviewer", "data-analyst"

**Response Process**:
1. **Name Validation**: Check if name exists in `.claude/agents/` directory
   - If available: "✅ '[name]' is available!"
   - If conflict: "⚠️ '[name]' already exists. Try: [suggestions]"

2. **Category Detection**: Use original $ARGUMENTS from create-agent command
   - Analyze keywords against conversation-templates.json categories
   - Determine: content_creation | development | business_analysis | research

3. **Capability Enhancement Suggestions**: Based on detected category
   ```
   I detected this is a **[Category]** agent. Should it also handle:
   • [Capability 1] 
   • [Capability 2]
   • [Capability 3]
   
   Which additional capabilities? (1,2,3 or 'none')
   ```

### State 2: Capability Selection
**Detection**: User input matches pattern `^(\d+,)*\d+$|^none$|^\d+$`
**Examples**: "1,3", "2", "none", "1,2,4"

**Response Process**:
1. **Parse Selections**: Convert numbers to capability names
2. **Tool Recommendations**: Use tool-categories.json for category
   ```
   Excellent! For [category] agents, I recommend:
   ✅ **[Tool 1]** - [Description]
   ✅ **[Tool 2]** - [Description]
   
   Include these shared tools? (yes/no)
   ```

### State 3: Tool Confirmation  
**Detection**: User input matches pattern `^(yes|no|y|n)$`
**Examples**: "yes", "no", "y", "n"

**Response Process**:
1. **Finalize Tool Selection**: Based on yes/no response
2. **Model Recommendation**: Based on category complexity
   ```
   Perfect! Which Claude model?
   • **Haiku** - Fast, simple tasks
   • **Sonnet** - Balanced ⭐ **Recommended for [category]**
   • **Opus** - Complex reasoning
   
   Choose: haiku/sonnet/opus
   ```

### State 4: Model Selection
**Detection**: User input matches pattern `^(haiku|sonnet|opus|1|2|3)$`
**Examples**: "sonnet", "2", "opus"

**Response Process**:
1. **Normalize Model**: Convert numbers to model names (1=haiku, 2=sonnet, 3=opus)  
2. **Final Confirmation**: Build complete specification
   ```
   Perfect! Here's your agent configuration:
   
   **Name**: [name]
   **Purpose**: [derived from original arguments + capabilities]
   **Category**: [detected_category] 
   **Model**: [selected_model]
   **Tools**: [selected_tools]
   
   Create this agent? (yes/no)
   ```

### State 5: Final Confirmation
**Detection**: User input matches pattern `^(yes|no|create)$`
**Examples**: "yes", "create", "no"

**Response Process**: 
1. **If yes/create**: Delegate to agent creation with complete specification
2. **If no**: Offer to modify or start over

**Agent Creation Specification Format**:
```json
{
  "agent_name": "[user_provided_name]",
  "description": "[generated from original_arguments + selected_capabilities]",
  "model": "[haiku|sonnet|opus]",
  "category": "[detected_category]", 
  "shared_tools": ["[tools_from_category]"],
  "responsibilities": ["[derived_from_capabilities]"],
  "keywords": ["[generated_from_category_and_purpose]"]
}
```

## Tool Categories Auto-Update Process

When creating new agents:

1. **Scan for new shared tools**: Check `.claude/agents/shared-tools/` for files not in categories
2. **Analyze new tools**: Determine category based on filename and content
3. **Update tool-categories.json**: Add new shared tools to appropriate categories
4. **Handle custom tools**: Add user-requested specialized tools to categories
5. **Create documentation**: Generate integration guides for specialized tools

## Integration with Existing Agent Creation

Use the existing agent creation workflow in `core-agent-management.md` but enhance it with:
- Dynamic tool selection based on categories
- Automatic context file generation for specialized tools
- Smart YAML template selection based on agent type
- Integration guide creation for custom tools

## Error Handling

Handle these scenarios gracefully:
- Invalid agent names (suggest alternatives)
- Missing tool categories file (create default)
- Unknown tool requests (offer to create custom integration)
- Conversation interruption (prompt to continue or start over)

## Success Metrics

- Agent name validation accuracy: 100%
- Category detection accuracy: >95%
- Tool recommendation relevance: User satisfaction
- Complete conversation flow: >90% completion rate
- Successful agent creation: 100% when specifications are complete

## Practical Implementation: Conversation Response Templates

### Category-Specific Capability Suggestions

#### Content Creation Agents
```
I detected this is a **Content Creation** agent. Should it also handle:
• SEO optimization and keyword analysis
• Content editing and proofreading  
• Social media content adaptation
• Research and fact-checking

Which additional capabilities? (1,2,3,4 or 'none')
```

#### Development Agents
```
I detected this is a **Development** agent. Should it also handle:
• Code review and quality analysis
• Testing and debugging assistance
• Documentation generation
• Deployment and DevOps integration

Which additional capabilities? (1,2,3,4 or 'none')  
```

#### Business Analysis Agents
```
I detected this is a **Business Analysis** agent. Should it also handle:
• Financial reporting and forecasting
• Data visualization and dashboards
• Compliance and risk assessment  
• Performance metrics tracking

Which additional capabilities? (1,2,3,4 or 'none')
```

#### Research Agents
```
I detected this is a **Research** agent. Should it also handle:
• Literature review and synthesis
• Citation management and formatting
• Data analysis and statistics
• Academic writing assistance

Which additional capabilities? (1,2,3,4 or 'none')
```

### Tool Recommendation Templates

#### Content Creation Tools
```
Excellent! For content creation agents, I recommend:
✅ **Context7 MCP** - Research, documentation, API access
✅ **Supabase MCP** - Content storage and management

Include these shared tools? (yes/no)
```

#### Development Tools  
```
Excellent! For development agents, I recommend:
✅ **Context7 MCP** - Documentation and API access
✅ **GitHub MCP** - Repository management and code collaboration
✅ **Git** - Version control workflows
✅ **Docker** - Containerization and deployment

Include these shared tools? (yes/no)
```

#### Business Analysis Tools
```
Excellent! For business analysis agents, I recommend:
✅ **Context7 MCP** - Research and documentation access
✅ **Supabase MCP** - Database and data management  
✅ **AWS** - Cloud infrastructure and analytics

Include these shared tools? (yes/no)
```

#### Research Tools
```
Excellent! For research agents, I recommend:
✅ **Context7 MCP** - Academic documentation and API access

Include these shared tools? (yes/no)
```

### Model Recommendation Templates

#### Content Creation Model Recommendation
```
Perfect! Which Claude model?
• **Haiku** - Fast, simple content tasks
• **Sonnet** - Balanced creativity and accuracy ⭐ **Recommended**
• **Opus** - Complex content strategy and analysis

Choose: haiku/sonnet/opus
```

#### Development Model Recommendation  
```
Perfect! Which Claude model?
• **Haiku** - Simple coding tasks and quick fixes
• **Sonnet** - Balanced development capabilities  
• **Opus** - Complex architecture and system design ⭐ **Recommended**

Choose: haiku/sonnet/opus
```

#### Business Analysis Model Recommendation
```
Perfect! Which Claude model?
• **Haiku** - Basic reporting and simple analysis
• **Sonnet** - Balanced business analysis ⭐ **Recommended**
• **Opus** - Complex financial modeling and strategy

Choose: haiku/sonnet/opus
```

#### Research Model Recommendation
```
Perfect! Which Claude model?
• **Haiku** - Simple research tasks and summaries
• **Sonnet** - Balanced research and analysis
• **Opus** - Deep academic analysis and complex reasoning ⭐ **Recommended**

Choose: haiku/sonnet/opus
```

### Final Agent Creation Process

When user confirms "yes" or "create", execute this agent creation workflow:

#### Step 1: Build Complete Agent Specification

**Gather all conversation data into structured format:**
```json
{
  "agent_name": "[user_provided_name]",
  "description": "[original_arguments + selected_capabilities_description]",
  "model": "[haiku|sonnet|opus]",
  "category": "[content_creation|development|business_analysis|research]",
  "shared_tools": ["[tools_selected_from_category]"],
  "selected_capabilities": ["[capability_1]", "[capability_2]"],
  "responsibilities": ["[derived_from_original_purpose_and_capabilities]"],
  "keywords": ["[generated_from_category_and_purpose]"],
  "conversation_context": {
    "original_request": "[original_$ARGUMENTS]",
    "detected_category": "[category]",
    "user_selections": "[summary_of_choices]"
  }
}
```

#### Step 2: Execute Agent Creation via Existing Infrastructure

**Use Task delegation to create agent with complete specification:**

```markdown
Creating your agent now using the proven agent creation system...

[TASK DELEGATION TO AGENT-ADMIN]:
```

#### Step 3: Task Call Implementation

**Execute this Task call with the complete specification:**

```javascript
await Task({
  subagent_type: "agent-admin",
  description: "Create new agent from conversational workflow",
  prompt: `Create a new Claude Code agent with this complete specification:

AGENT SPECIFICATION:
${JSON.stringify(agentSpecification, null, 2)}

CREATION TASKS:
1. **Agent File Creation**:
   - Create .claude/agents/[agent_name].md with proper YAML frontmatter
   - Use exact format from yaml-template-mandatory.md
   - Include all selected shared tools in agent content

2. **Infrastructure Integration**:
   - Add agent to shared-tools/agent-spawn-logging.md agents array
   - Update .claude/hooks/agent-detection-hook.sh with detection patterns
   - Update .claude/hooks/task-completion-hook.sh for type extraction

3. **Documentation Updates**:
   - Add agent to CLAUDE.md with usage examples and triggers
   - Include category, capabilities, and recommended use cases
   - Follow existing agent documentation format

4. **Context File Creation & Validation**:
   - Create agent-tools/[agent-name]/ directory
   - Generate core principles file for agent-specific knowledge
   - **⚠️ CRITICAL: Parse agent file for ALL context file references**
   - **Create EVERY referenced context file** - scan for `agent-tools/[agent-name]/filename.md` patterns
   - **Validate ALL references exist on disk** before completing creation
   - Add appropriate keywords for context loading to each file

5. **Validation**:
   - Ensure YAML frontmatter is valid and follows mandatory template
   - Verify all shared tools are correctly referenced  
   - **⚠️ VERIFY: Every context file referenced in agent exists**
   - Confirm hook integration works correctly
   - Test agent detection patterns
   - **NO BROKEN CONTEXT REFERENCES ALLOWED**

The agent should be fully functional after creation with proper infrastructure integration.

IMPORTANT: Follow all existing standards for YAML format, naming conventions, and documentation patterns.`
});
```

### Success Response Template
```
✅ Creating [agent-name] agent...

[Execute agent creation via existing agent management workflow]

✅ Agent '[agent-name]' created successfully!

**Files Created**:
- `.claude/agents/[agent-name].md`
- Agent registered in logging system
- Documentation updated in CLAUDE.md

**Next Steps**:
🔄 **Restart Claude Code** to see your new agent in the `/agents` list.

Your agent is ready to use!
```

This context enables natural, conversational agent creation while maintaining the robustness and flexibility of the underlying agent management system.
