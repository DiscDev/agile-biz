# Create-Agent Conversational Workflow

## Overview
This directory contains the configuration files for the conversational agent creation workflow. The system provides a natural, guided conversation interface for creating new Claude Code agents.

## Files

### `tool-categories.json`
Contains categorized tool recommendations based on agent purpose:
- **content_creation**: Writing, blogging, marketing agents
- **development**: Code, build, deployment agents  
- **business_analysis**: Data analysis, reporting agents
- **research**: Academic, literature review agents

Each category includes:
- **shared_tools**: Always available tools (Context7 MCP, Supabase, etc.)
- **specialized_tools**: Category-specific integrations with configuration requirements

### `conversation-templates.json`
Standardized prompts and responses for the conversational flow:
- **prompts**: Questions to ask users during agent creation
- **responses**: Consistent messaging for various scenarios
- **categories**: Trigger words and descriptions for category detection

## How It Works

1. **User triggers** `/create-agent` command
2. **Agent-admin loads** these configuration files
3. **Conversational flow** guides user through:
   - Agent naming and validation
   - Purpose analysis and category detection
   - Tool recommendations (shared + specialized)
   - Model selection (Haiku/Sonnet/Opus)
   - Final confirmation and creation

## Category Detection

The system automatically detects agent categories based on keywords:

- **Content Creation**: writing, blog, content, marketing, copy, documentation
- **Development**: code, build, deploy, programming, git, software
- **Business Analysis**: analysis, business, finance, data, reports
- **Research**: research, academic, papers, studies, literature

## Tool Recommendations

Based on detected category, the system suggests:

1. **Shared Tools** (always available)
   - Context7 MCP for research and documentation
   - Supabase MCP for data management
   - GitHub MCP for version control
   - Docker for containerization

2. **Specialized Tools** (category-specific)
   - API endpoints (Writer AI, Financial Data APIs)
   - Database connections (Business Intelligence tools)
   - Web scraping tools (SEO analysis)
   - Custom integrations (webhooks, automation)

## Auto-Update System

The tool categories automatically update when:
- New shared tools are added to `.claude/agents/shared-tools/`
- Users request custom specialized tools during agent creation
- Agent-admin scans and categorizes new tools

## Testing

Run the comprehensive test suite:
```bash
./.claude/scripts/tests/create-agent-workflow-tests.sh
```

Tests validate:
- File structure and JSON validity
- Category completeness and tool recommendations
- Agent-admin integration context
- Command registration and cleanup

## Integration

The system integrates with:
- **Agent-Admin**: Uses `conversational-workflow-management.md` context
- **Hook System**: Updates agent detection automatically
- **Logging**: Tracks agent creation and context loading
- **CLAUDE.md**: Maintains agent documentation

## Usage Example

```
User: /create-agent
System: What's the purpose of your agent?
User: Help with blog writing and SEO optimization
System: ✅ I detected this is a Content Creation agent.

Recommended shared tools:
• Context7 MCP (research & documentation) ✓
• Supabase MCP (content management)

Specialized tools for content creation:
• Writer AI API (AI-powered writing assistance)
• SEO Analysis Tools (keyword optimization)
• WordPress API (content publishing)

Which would you like? (1,2,3 or 'none')
User: 1,2
System: ✅ Added Writer AI API and SEO Analysis Tools.

[Continues through name, model selection, and creation]
```

## Architecture Benefits

- ✅ **Natural Conversation**: Multi-turn dialog instead of rigid forms
- ✅ **Smart Recommendations**: Category-based tool suggestions
- ✅ **Auto-Discovery**: New tools automatically integrated
- ✅ **Documentation Generation**: Integration guides created automatically
- ✅ **Clean Integration**: Direct agent-admin delegation
- ✅ **Comprehensive Testing**: Full validation suite

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)