---
description: "Interactive agent creation through guided conversation"
model: opus
---

# Create Agent - Interactive Conversation

I'll help you create a new Claude Code agent through a friendly, step-by-step conversation.

## Request Analysis

**Your Request**: "$ARGUMENTS"

### Category Detection & Analysis

Let me analyze your request to determine the best agent category:

**Analyzing keywords in**: "$ARGUMENTS"

**Category Matching**:
- **Content Creation**: writing, blog, content, marketing, copy, documentation, articles
- **Development**: code, build, deploy, dev, programming, git, software, app  
- **Business Analysis**: analysis, business, finance, data, reports, analytics
- **Research**: research, academic, papers, studies, literature

**Detected Category**: 
*[Based on keyword analysis, I'll determine if this appears to be content_creation, development, business_analysis, or research]*

---

## Starting Our Conversation

Based on your description "$ARGUMENTS", I can see you want to create an agent for this purpose.

**What would you like to name your agent?**

*Examples based on common patterns:*
- Content agents: `blog-helper`, `content-writer`, `copywriter`
- Development agents: `code-reviewer`, `dev-assistant`, `build-helper`  
- Business agents: `data-analyst`, `finance-helper`, `report-generator`
- Research agents: `research-assistant`, `paper-analyzer`, `study-helper`

**Enter your agent name** (lowercase-with-dashes format):

---

## Conversation State Management

*I'll detect your response and guide you through the next appropriate step:*

### State 1: Agent Name Provided
**When you provide an agent name, I'll:**
1. ✅ Check if the name is available (scan existing agents)
2. ⚠️ Suggest alternatives if there's a conflict  
3. Guide you to enhanced capabilities based on detected category

### State 2: Enhanced Capabilities Discussion
**After name confirmation, I'll suggest category-specific enhancements:**
- **Content Creation**: SEO optimization, editing, social media adaptation, research
- **Development**: code review, testing, debugging, documentation
- **Business Analysis**: reporting, forecasting, data visualization, compliance  
- **Research**: data analysis, citation management, literature review, summarization

### State 3: Smart Tool Recommendations
**Based on your category and capabilities, I'll recommend:**
- **Shared Tools** from our proven infrastructure
- **Specialized Tools** for advanced functionality (optional)

### State 4: Model Selection & Final Confirmation
**I'll help you choose the right Claude model:**
- **Haiku**: Fast, simple tasks, cost-effective
- **Sonnet**: Balanced performance (recommended for most agents)
- **Opus**: Complex reasoning, advanced analysis

---

## Dynamic Conversation Flow

### Example: Content Creation Agent
```
You: blog-helper
Me: ✅ "blog-helper" is available!

I detected this is a **Content Creation** agent. Should it also handle:
• SEO optimization and keyword analysis
• Content editing and proofreading  
• Social media content adaptation
• Research and fact-checking

Which additional capabilities? (1,2,3,4 or 'none')

You: 1,3
Me: Excellent! For content creation agents, I recommend:
✅ **Context7 MCP** - Research, documentation, API access
✅ **Supabase MCP** - Content storage and management

Include these shared tools? (yes/no)

You: yes
Me: Perfect! Which Claude model?
• **Haiku** - Fast, simple content tasks
• **Sonnet** - Balanced creativity and accuracy ⭐ **Recommended**
• **Opus** - Complex content strategy and analysis

Choose: haiku/sonnet/opus
```

---

## Implementation: Category Detection Logic

**I will analyze "$ARGUMENTS" using these patterns:**

### Content Creation Keywords
`writing, blog, content, marketing, copy, documentation, articles, social, seo`
**→ Suggests**: Context7 MCP, Supabase MCP
**→ Model**: Sonnet (balanced creativity)

### Development Keywords  
`code, build, deploy, programming, software, app, git, frontend, backend, react`
**→ Suggests**: Context7 MCP, GitHub MCP, Git, Docker
**→ Model**: Opus (complex reasoning)

### Business Analysis Keywords
`analysis, business, finance, data, reports, analytics, dashboard, metrics`  
**→ Suggests**: Context7 MCP, Supabase MCP, AWS
**→ Model**: Sonnet (balanced analysis)

### Research Keywords
`research, academic, papers, studies, literature, analysis, investigation`
**→ Suggests**: Context7 MCP
**→ Model**: Opus (deep analysis)

---

## Ready to Start!

**Just provide your agent name and I'll continue the conversation based on:**
1. **Real-time name validation** against existing agents
2. **Category-specific capability suggestions**  
3. **Smart tool recommendations** from our infrastructure
4. **Appropriate model suggestions** based on complexity
5. **Final agent creation** via agent-admin delegation

**Enter your agent name now to begin!**

---

## Conversation State Detection & Response

### State Detection Logic

**I'll analyze your response to determine the conversation state:**

#### State 1: Agent Name Detection
**Patterns**: `^[a-z][a-z0-9-]*[a-z0-9]$` (lowercase-with-dashes)
**Examples**: `blog-helper`, `code-reviewer`, `data-analyst`
**Response**: Name validation + category-specific capability suggestions

#### State 2: Capability Selection
**Patterns**: Numbers like `1,2,3`, `1`, `none`, combinations
**Examples**: `1,3`, `2`, `none`, `1,2,4`  
**Response**: Tool recommendations based on category

#### State 3: Tool Confirmation
**Patterns**: `yes`, `no`, `y`, `n`
**Examples**: `yes`, `y`, `no`
**Response**: Model selection guidance

#### State 4: Model Selection  
**Patterns**: `haiku`, `sonnet`, `opus`, `1`, `2`, `3`
**Examples**: `sonnet`, `2`, `opus`
**Response**: Boundaries discussion or final confirmation

#### State 5: Final Confirmation
**Patterns**: `yes`, `no`, `create`, `modify`
**Examples**: `yes`, `create`, `no`  
**Response**: Agent creation via agent-admin delegation

---

## Live Conversation Management

### When You Respond, I Will:

1. **Detect the conversation state** based on your input pattern
2. **Validate your input** (name conflicts, valid selections)
3. **Provide appropriate next step** based on state machine logic
4. **Remember conversation context** (category, capabilities, tools, model)
5. **Guide you naturally** through the complete agent creation process

### Conversation Context Tracking

**I maintain these variables throughout our conversation:**
- `detected_category`: content_creation | development | business_analysis | research
- `agent_name`: Your chosen agent name
- `selected_capabilities`: Array of enhanced capabilities
- `recommended_tools`: Shared tools for your category
- `selected_model`: haiku | sonnet | opus  
- `boundaries`: Any restrictions or limitations

### Ready for Natural Conversation!

**Just respond with your agent name and I'll:**
✅ Validate availability against existing agents  
✅ Detect appropriate category from context  
✅ Guide you through capability enhancements  
✅ Recommend optimal tools and model  
✅ Create your agent using agent-admin  

**Go ahead - tell me your agent name!**
