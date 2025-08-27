# /create-agent

I'll launch the interactive agent creation workflow.

```bash
node .claude/scripts/commands/create-agent/index.js
```

## Features
- **Interactive workflow** with 9 guided steps
- **Name conflict detection** (exact matches, synonyms, semantic similarity)  
- **Purpose validation** (prevents vague or overly specific definitions)
- **Specification compilation** for agent-admin integration
- **Standards compliance** with Claude Code YAML requirements

## Workflow Steps
1. **Basic Information** - Name and purpose with validation
2. **Core Responsibilities** - Primary functions the agent handles
3. **Agent Boundaries** - What the agent should NOT do  
4. **Model Selection** - Haiku, Sonnet, or Opus
5. **Shared Tools** - Multi-agent tool access
6. **Keywords** - Auto-generated trigger words
7. **Specialized Tools** - APIs, MCPs, webhooks
8. **Final Review** - Complete specification preview
9. **Agent Creation** - Spawn agent-admin with specification

## Architecture
The implementation consists of 4 modular JavaScript files:

### Main Components
- **`index.js`** - Command orchestration and agent-admin integration
- **`validation.js`** - Name conflicts, synonyms, purpose quality checks
- **`workflow.js`** - Interactive step management and user input
- **`compiler.js`** - JSON specification generation for agent-admin

### Integration
- Calls `agent-admin` via `claude-code chat --agent agent-admin` 
- Passes structured JSON specification for standards-compliant agent creation
- Automatically handles infrastructure updates (logging, documentation)

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)