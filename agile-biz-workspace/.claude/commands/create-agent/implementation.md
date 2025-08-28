# Create Agent - Conversational Flow Implementation

## Flow State Management

This implementation manages a conversational flow for agent creation with the following steps:

### Current Flow State: STEP_1_PURPOSE_ANALYSIS

**User Input**: $ARGUMENTS

## Step 1: Purpose Analysis & Agent Name

Based on your request: "$ARGUMENTS"

Let me help you create the perfect agent. 

**First, what would you like to name your agent?**

Examples:
- blog-helper
- finance-advisor  
- dev-assistant
- research-buddy
- content-creator

Please provide a name (lowercase with dashes): 

---

## Conversation Flow Logic

### Step 2: Name Validation (After user provides name)
```
✅ "[name]" is available and follows naming conventions.
```
OR
```
❌ "[name]" conflicts with existing agent. Try: [suggestions]
```

### Step 3: Enhanced Capabilities (After name confirmed)
```
Great! Based on "[purpose]", I can see this is a [category] agent.

Should it also handle these related tasks?
• [suggestion 1] (recommended)
• [suggestion 2] 
• [suggestion 3]

Which additional capabilities would you like? (1,2,3 or 'none')
```

### Step 4: Tool Recommendations (After capabilities confirmed)
```
For [category] agents, I recommend these shared tools:
• Context7 MCP (research & documentation) ✓
• [tool 2] ([description])
• [tool 3] ([description])

Include these? (y/n)

I also have specialized tools:
• [specialized tool 1] ([description])
• [specialized tool 2] ([description])

Which would you like? (1,2 or 'none')
```

### Step 5: Model Selection (After tools confirmed)
```
Which Claude model?
• Haiku (fast/simple tasks)
• Sonnet (balanced - recommended for [category])
• Opus (complex reasoning)

Your choice:
```

### Step 6: Boundaries (After model selected)
```
Should this agent avoid any specific content or tasks?
(e.g., "no technical documentation" or "family-friendly content only")

Enter restrictions or 'none':
```

### Step 7: Final Confirmation (After boundaries set)
```
Here's your agent configuration:

**Name**: [name]
**Purpose**: [purpose] + [additional capabilities]
**Category**: [category]
**Model**: Claude [model]
**Tools**: [tool list]
**Restrictions**: [boundaries or "none"]

Create this agent? (yes/no)
```

### Step 8: Agent Creation (After confirmation)
```
✅ Creating [name] agent...
[Delegate to agent-admin for creation]
✅ Agent created successfully! 
📝 Restart Claude Code to see your new agent.
```

## Implementation Notes

- Each step waits for user input before proceeding
- Smart defaults and recommendations based on category detection
- Category-based tool suggestions from shared tools system
- Clear examples and guidance at each step
- Graceful error handling and suggestions
- Final confirmation before creation

## Category Detection Rules

- **Content/Writing**: blog, write, content, article, copy, marketing
- **Development**: code, dev, react, javascript, frontend, backend, api
- **Research**: research, academic, analyze, study, investigate, data
- **Financial**: finance, budget, invest, accounting, tax, money
- **Creative**: design, creative, art, music, video, graphics
- **General**: assistant, helper, support, utility, tool

## Next Steps

This framework is ready to be implemented with the actual conversational logic that responds to user inputs and guides them through each step.