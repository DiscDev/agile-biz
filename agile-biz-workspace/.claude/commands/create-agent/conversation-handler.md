# Create Agent Conversation Handler

This document handles the conversational state and flow for agent creation.

## State Detection Logic

The conversation state is determined by analyzing the user's input:

1. **Initial Request** - User says something like "create agent for blog writing"
2. **Name Provided** - User provides just a name like "blog-helper" 
3. **Capability Response** - User responds with numbers/choices like "1,3" or "none"
4. **Tool Response** - User responds with "y/n" or tool selections
5. **Model Response** - User selects model like "sonnet" or "2"
6. **Boundaries Response** - User provides restrictions or "none"
7. **Final Confirmation** - User says "yes" or "no" to create

## Conversation State Machine

### State 1: Purpose Analysis → Name Request
```
Input: "$ARGUMENTS" (initial purpose)
Action: Analyze category, ask for agent name
Output: Category detection + name request
```

### State 2: Name Validation → Capability Enhancement  
```
Input: Agent name (e.g., "blog-helper")
Action: Check availability, suggest capabilities
Output: Name confirmation + capability options
```

### State 3: Capability Selection → Tool Recommendations
```
Input: Capability choices (e.g., "1,3" or "none")  
Action: Build capability list, recommend tools
Output: Tool recommendations based on category
```

### State 4: Tool Selection → Model Choice
```
Input: Tool selections (e.g., "y" or "1,2")
Action: Finalize tool list, present model options
Output: Model selection with recommendations
```

### State 5: Model Selection → Boundaries Discussion
```
Input: Model choice (e.g., "sonnet" or "2")
Action: Confirm model, ask about restrictions
Output: Boundaries/restrictions request
```

### State 6: Boundaries → Final Confirmation
```
Input: Boundaries (e.g., "none" or "family-friendly")
Action: Build complete config, show summary
Output: Final confirmation request
```

### State 7: Creation → Success
```
Input: Confirmation ("yes")  
Action: Delegate to agent-admin for creation
Output: Success message + next steps
```

## Category-Based Recommendations

### Content/Writing Agents
**Keywords**: blog, write, content, article, copy, marketing, social
**Capabilities**: SEO optimization, editing, social media adaptation, research
**Tools**: Context7 MCP, Supabase MCP
**Model**: Sonnet (balanced creativity/accuracy)

### Development Agents  
**Keywords**: code, dev, react, javascript, frontend, backend, api
**Capabilities**: code review, testing, debugging, documentation
**Tools**: GitHub MCP, Git, Docker
**Model**: Opus (complex reasoning)

### Research Agents
**Keywords**: research, academic, analyze, study, investigate, data  
**Capabilities**: data analysis, summarization, citation management
**Tools**: Context7 MCP, web search capabilities
**Model**: Opus (deep analysis)

### Financial Agents
**Keywords**: finance, budget, invest, accounting, tax, money
**Capabilities**: reporting, analysis, forecasting, compliance
**Tools**: Supabase MCP, specialized financial APIs
**Model**: Sonnet (balanced math/reasoning)

### Creative Agents
**Keywords**: design, art, music, video, graphics, creative
**Capabilities**: ideation, project management, feedback
**Tools**: Minimal tools, focus on creativity
**Model**: Sonnet (creative balance)

## Implementation Strategy

The conversation handler uses pattern matching and context to:
1. Determine current conversation state
2. Provide appropriate response for that state
3. Guide user to next step
4. Maintain conversation context throughout
5. Delegate final creation to agent-admin

This creates a natural, flowing conversation that feels intuitive while systematically gathering all needed information.