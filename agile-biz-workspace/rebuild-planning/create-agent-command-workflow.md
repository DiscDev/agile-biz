# /create-agent Command Workflow Design Plan

## Overview
Design and implement an interactive `/create-agent` Claude Code command that guides users through creating new agents with proper validation, conflict detection, and integration with the existing agent-admin infrastructure.

## Revised Workflow Design

### Step 1: Basic Agent Information & Validation
```
/create-agent
→ Claude Code: "Let's create a new agent! What would you like to name it? example: weather-helper"
→ User: "weather-helper"
→ Claude Code: [Validates against existing agents and synonyms]
   - Check existing agent names
   - Check for semantic similarities (weather vs meteorology, music vs audio, etc.)
   - If conflicts found: "An agent with similar functionality already exists: 'weather'. 
     Would you like to add capabilities to the existing agent instead? (yes/no)"
→ Claude Code: "Great! What is the primary purpose of this agent? (one clear sentence)"
→ User: "Analyze weather patterns and provide forecasting guidance"
→ Claude Code: [Validates the users input for the agents purpose]
   - Checks the agents purpose is not to vauge or too specific
   - if to vague or too specific, help the user refine the purpose
   - if the purpose is valid, continue to the next step
```

### Step 2: Core Responsibilities Definition
```
→ Claude Code: "What are the main responsibilities this agent should handle? (one per line)
   Example:
   - Weather forecast analysis and interpretation
   - Climate data processing
   - Emergency weather planning
   
   Your core responsibilities:"
→ User: [provides list]
```

### Step 3: Agent Boundaries (What it's NOT)
```
→ Claude Code: "To ensure clear scope, what should this agent NOT handle?
   Example: 'Not for real-time weather alerts or emergency response'
   
   What this agent should NOT do:"
→ User: [provides boundaries/limitations]
```

### Step 4: Model Selection
```
→ Claude Code: "Select the Claude model for this agent:
   1. Haiku - Fast, simple tasks, cost-effective
   2. Sonnet - Balanced performance and cost (recommended for most agents)
   3. Opus - Complex reasoning, highest capability
   
   Which model? (1/2/3)"
→ User: "2"
```

### Step 5: Shared Tools Selection (Simplified)
```
→ Claude Code: "Which shared tools should this agent have access to?
   ✓ Context7 MCP - API access, documentation (recommended for most agents)
   ☐ GitHub MCP - Code repositories, PRs (for development tasks)
   ☐ Git - Version control (for code-related tasks)
   ☐ Supabase MCP - Database, backend services (for data tasks)
   ☐ AWS Infrastructure - Cloud services (for infrastructure tasks)
   
   Type the numbers you want (e.g., '1,3,5') or 'recommended' for Context7 only:"
→ User: "1"
```

### Step 6: Keyword Triggers (Auto-generate with Override)
```
→ Claude Code: "Based on your agent description, I'll auto-generate trigger keywords.
   You can add additional ones if needed.
   
   Auto-generated: weather, forecast, climate, pattern, meteorology
   
   Add any additional keywords (or press Enter to continue):"
→ User: [optional additional keywords]
```

### Step 7: Specialized Context & External Tools
```
→ Claude Code: "Should this agent have specialized context files for tools this agent would use for specific cases?
   Are there any APIs, MCPs, Webhooks, etc. this agent should have as tools?
   
   Examples:
   - Weather APIs (NOAA, OpenWeatherMap)
   - Specialized databases
   - External webhooks
   - Domain-specific tools
   
   Describe any specialized tools/APIs this agent needs (or 'none'):"
→ User: [describes external tools or 'none']
```

### Step 8: Navigation & Correction
```
→ Claude Code: "Would you like to review or change any of your answers?
   1. Agent name and purpose
   2. Core responsibilities  
   3. Agent boundaries (what it's NOT)
   4. Model selection
   5. Shared tools
   6. Keywords
   7. Specialized tools/APIs
   8. Continue to creation
   
   Select number to modify or 8 to continue:"
→ User: [can modify any previous step or continue]
```

### Step 9: Final Review & Confirmation
```
→ Claude Code: "Review your agent configuration:
   
   Name: weather-helper
   Purpose: Analyze weather patterns and provide forecasting guidance
   Model: Claude 3.5 Sonnet
   Shared Tools: Context7 MCP only
   Core Responsibilities: [lists provided responsibilities]
   NOT Responsible For: [lists boundaries]
   Keywords: weather, forecast, climate, pattern, meteorology [+ any additions]
   Specialized Tools: NOAA API integration, weather data webhooks
   
   Create this agent? (yes/no/modify)"
→ User: "yes"
```

### Step 10: Agent Creation via Agent-Admin Integration
```
→ Claude Code: [Constructs comprehensive specification]
→ Claude Code: [Spawns agent-admin with complete specification via Task tool]
→ Agent-admin: [Creates agent with all requirements]
→ Claude Code: "Agent 'weather-helper' created successfully!
   
   IMPORTANT: Please restart Claude Code for the new agent to appear in the /agents list.
   
   Files created:
   - .claude/agents/weather-helper.md
   - .claude/agents/agent-tools/weather-helper/ (context files generated)
   
   The agent has been registered in the logging system and CLAUDE.md documentation."
```

## Implementation Architecture

### Command Structure
```
/create-agent
├── Validation Engine
│   ├── Name conflict detection
│   ├── Synonym detection
│   └── Existing agent analysis
├── Interactive Workflow Manager
│   ├── Step navigation
│   ├── Answer modification
│   └── Input validation
├── Specification Builder
│   ├── Compile user inputs
│   ├── Generate agent spec
│   └── Validate completeness
└── Agent-Admin Integration
    ├── Task tool invocation
    ├── Specification formatting
    └── Result processing
```

### Agent-Admin Integration Specification

The `/create-agent` command will spawn agent-admin with a structured specification:

```json
{
  "action": "create-agent",
  "specification": {
    "name": "weather-helper",
    "purpose": "Analyze weather patterns and provide forecasting guidance",
    "model": "sonnet",
    "shared_tools": ["context7-mcp-integration"],
    "core_responsibilities": [
      "Weather forecast analysis and interpretation",
      "Climate data processing",
      "Emergency weather planning"
    ],
    "boundaries": [
      "Not for real-time weather alerts",
      "Not for emergency response"
    ],
    "keywords": ["weather", "forecast", "climate", "pattern", "meteorology"],
    "specialized_tools": [
      "NOAA API integration",
      "weather data webhooks"
    ],
    "context_files_needed": true
  }
}
```

## Technical Implementation Requirements

### 1. Validation Systems
- **Name Conflict Detection**: Check existing agent names in `.claude/agents/`
- **Synonym Detection**: Use semantic similarity to detect potential conflicts
- **Capability Overlap**: Analyze existing agents to suggest modifications instead of new creation

### 2. Navigation System  
- **Step History**: Track user answers for easy modification
- **Back Navigation**: Allow users to return to previous steps
- **Answer Modification**: Enable editing of any previous response

### 3. Agent-Admin Integration
- **Specification Format**: Standardized JSON format for agent creation
- **Task Tool Usage**: Proper invocation of agent-admin with complete spec
- **Error Handling**: Graceful handling of creation failures

### 4. User Experience Features
- **Smart Suggestions**: Auto-complete for keywords, model selection
- **Validation Feedback**: Real-time validation of inputs
- **Progress Indicators**: Show current step and progress
- **Help System**: Context-sensitive help at each step

## Validation & Conflict Detection Logic

### Name Validation
```javascript
// Check exact matches
existingAgents.includes(proposedName)

// Check semantic similarity
semanticSimilarity(proposedName, existingAgent) > 0.8

// Check synonym detection
synonyms = {
  weather: ["meteorology", "climate", "forecast"],
  music: ["audio", "sound", "composition"],
  development: ["coding", "programming", "software"]
}
```

### Capability Overlap Detection
- Analyze existing agent descriptions and responsibilities
- Identify potential overlap in functionality
- Suggest enhancing existing agents vs creating new ones

## Error Handling & Edge Cases

### Common Scenarios
1. **Duplicate Names**: Suggest alternatives or modifications
2. **Similar Functionality**: Recommend enhancing existing agents
3. **Invalid Inputs**: Provide clear error messages and retry options
4. **Agent Creation Failure**: Rollback and provide diagnostic information
5. **User Cancellation**: Clean exit without creating incomplete agents

### Recovery Mechanisms
- **Draft Saving**: Save progress for later completion
- **Rollback**: Undo partial creations on failure
- **Retry Logic**: Automatic retry for transient failures

## Files to Create/Modify

### New Files
1. **Command Implementation**: `/create-agent` command handler
2. **Validation Engine**: Name/conflict detection system
3. **Specification Builder**: JSON specification compiler
4. **Navigation Manager**: Step management and history

### Modified Files
1. **Agent-Admin Contexts**: Update to handle specification-based creation
2. **Core Management**: Enhance to process JSON specifications
3. **Creation Guide**: Update for specification-driven workflow

## Testing Strategy

### Test Scenarios
1. **Happy Path**: Complete agent creation flow
2. **Name Conflicts**: Various conflict detection scenarios  
3. **Navigation**: Back/forth navigation through steps
4. **Validation**: Invalid input handling at each step
5. **Integration**: Agent-admin specification processing
6. **Error Handling**: Creation failures and recovery

### Validation Tests
- Name conflict detection accuracy
- Synonym recognition effectiveness
- Specification compilation correctness
- Agent-admin integration reliability

## Success Metrics

### User Experience
- Reduced time to create functional agents
- Decreased agent creation errors
- Improved agent quality and consistency
- Higher user satisfaction with creation process

### Technical Quality
- Zero naming conflicts
- 100% specification accuracy
- Reliable agent-admin integration
- Comprehensive error handling coverage

## Implementation Timeline

### Phase 1: Core Infrastructure (Week 1)
- Command structure and routing
- Basic workflow implementation
- Validation engine foundation

### Phase 2: Advanced Features (Week 2)
- Navigation and modification system
- Conflict detection and resolution
- Agent-admin integration

### Phase 3: Polish & Testing (Week 3)
- User experience refinements
- Comprehensive testing
- Error handling improvements

### Phase 4: Documentation & Deployment (Week 4)
- User documentation
- Technical documentation
- Deployment and monitoring

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)

## Approval Required

This plan requires review and approval before implementation. Key decisions needed:

1. **Validation Strictness**: How aggressive should conflict detection be?
2. **Navigation Complexity**: Should we allow jumping to any step or only sequential?
3. **Integration Method**: Confirm Task tool approach for agent-admin spawning
4. **Error Recovery**: Preferred approach for handling creation failures
5. **Feature Scope**: Any additional features to include in initial release?

Please review and provide approval or requested modifications.