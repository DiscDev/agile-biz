# Claude Code Commands Reference Card

## Quick Reference

This reference card provides a complete list of Claude Code commands and keyboard shortcuts that work alongside AgileAiAgents commands.

## Command Line Interface (CLI)

### Starting Claude Code
```bash
claude                          # Start interactive REPL
claude "question"               # Start with initial prompt
claude -p "question"            # Get answer and exit (SDK mode)
cat file.txt | claude -p "fix" # Process piped input
claude -c                       # Continue most recent conversation
claude -c -p "question"         # Continue via SDK
claude -r "<session-id>"        # Resume specific session
```

### CLI Flags
```bash
--add-dir <path>               # Add working directories
--continue/-c                  # Load most recent conversation
--resume/-r <id>               # Resume specific session
--print/-p                     # Print response without interaction
--model <model>                # Set model for session
--verbose                      # Enable detailed logging
--max-turns <n>                # Limit agentic turns
--version/-v                   # Show version
--help/-h                      # Show CLI help
```

### Utility Commands
```bash
claude update                  # Update to latest version
claude mcp                     # Configure MCP servers
claude config list             # View configuration
claude config set <key> <val>  # Change settings
```

## Interactive Mode Commands (REPL)

### Core Commands
| Command | Description |
|---------|-------------|
| `/help` | Show Claude Code built-in commands |
| `/clear` | Clear conversation history and free context |
| `/compact` | Clear history but keep summary |
| `/cost` | Show token usage and costs for session |
| `/model` | Change AI model mid-session |
| `/exit` or `/quit` | Exit the REPL |

### File and Directory Commands
| Command | Description |
|---------|-------------|
| `/add-dir <path>` | Add additional working directory |
| `/export` | Export conversation to file/clipboard |
| `/memory` | Edit CLAUDE.md memory files |

### Configuration Commands
| Command | Description |
|---------|-------------|
| `/config` | Open configuration panel |
| `/terminal-setup` | Configure terminal for multiline input |
| `/vim` | Toggle vim mode editing |
| `/login` | Switch Anthropic accounts |

### Development Commands
| Command | Description |
|---------|-------------|
| `/review` | Request code review of changes |
| `/bug` | Submit feedback to Anthropic |
| `/doctor` | Diagnose Claude Code installation |

## Keyboard Shortcuts

### Essential Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current input/generation |
| `Ctrl+D` | Exit Claude Code session |
| `Ctrl+L` | Clear terminal screen |
| `Ctrl+R` | Reverse search command history |
| `↑/↓` | Navigate command history |
| `Tab` | Autocomplete file paths |

### Editing Shortcuts
| Shortcut | Action |
|----------|--------|
| `Esc+Esc` | Edit previous message |
| `Ctrl+A` | Go to beginning of line |
| `Ctrl+E` | Go to end of line |
| `Ctrl+K` | Delete from cursor to end of line |
| `Ctrl+U` | Delete from cursor to beginning |

### Multiline Input
| Method | Description |
|--------|-------------|
| `\` + `Enter` | Quick escape (all terminals) |
| `Option+Enter` | macOS default |
| `Shift+Enter` | After `/terminal-setup` |

## Special Input Prefixes

### Memory Shortcut
```bash
# This adds to CLAUDE.md
```
Starting input with `#` adds the rest to project memory.

### Command Prefix
```bash
/command [args]
```
Starting with `/` triggers command mode.

### File References
```bash
@path/to/file.txt
```
Reference files in prompts using `@` prefix.

## Vim Mode

Enable with `/vim` command.

### Normal Mode Commands
| Command | Action |
|---------|--------|
| `h/j/k/l` | Move left/down/up/right |
| `w` | Next word |
| `b` | Previous word |
| `0` | Beginning of line |
| `$` | End of line |
| `dd` | Delete line |
| `x` | Delete character |
| `i` | Enter INSERT mode |
| `a` | Append (enter INSERT after cursor) |
| `o` | Open line below |
| `O` | Open line above |

### Mode Switching
| Command | Action |
|---------|--------|
| `Esc` | Return to NORMAL mode |
| `i/a/o/O` | Enter INSERT mode |

## MCP (Model Context Protocol) Commands

### MCP Management
```bash
claude mcp add <name>          # Add MCP server
claude mcp list                # List configured servers
claude mcp remove <name>       # Remove server
claude mcp logs <name>         # View server logs
```

### Using MCP in Chat
```bash
@server:resource               # Reference MCP resource
/mcp__server__command          # Execute server command
```

## Custom Slash Commands

### Creating Custom Commands
1. Project commands: `.claude/commands/mycommand.md`
2. Personal commands: `~/.claude/commands/mycommand.md`

### Command Syntax
```markdown
# mycommand.md
Do something with $ARGUMENTS
!echo "Running command"
@file-to-include.txt
```

## Environment Variables

### Authentication
```bash
ANTHROPIC_API_KEY              # API authentication
ANTHROPIC_BASE_URL             # Custom API endpoint
```

### Model Selection
```bash
ANTHROPIC_MODEL                # Default model
CLAUDE_CODE_MODEL              # Override for Claude Code
```

### Configuration
```bash
CLAUDE_CODE_CONFIG_DIR         # Config directory
DISABLE_TELEMETRY              # Disable usage analytics
CLAUDE_CODE_VERBOSE            # Enable verbose logging
```

## Cost Management Commands

### Monitoring Usage
```bash
/cost                          # Current session cost
/cost --detailed               # Breakdown by operation
```

### Context Management
```bash
/clear                         # Full context reset (saves most tokens)
/compact                       # Smart compression (keeps key info)
```

## Common Command Combinations

### Start New Project
```bash
# 1. Start Claude Code
claude

# 2. Add project directory
/add-dir /path/to/project

# 3. Start AgileAiAgents workflow
/start-new-project-workflow
```

### Resume Work
```bash
# Continue last conversation
claude -c

# Or resume specific session
claude -r "session-id"

# Then continue AgileAiAgents work
/continue
```

### Cost-Conscious Workflow
```bash
# Check cost regularly
/cost

# Compact when context grows
/compact

# Checkpoint before clearing
/checkpoint "Feature complete"
/clear
```

## Integration with AgileAiAgents

### Command Precedence
1. Claude Code processes `/` commands first
2. Unknown commands passed to AgileAiAgents
3. Use `/help` for Claude Code commands
4. Use `/aaa-help` for AgileAiAgents commands

### Shared Features
- Both use CLAUDE.md for memory
- Both respect MCP configurations
- Both work with same file system
- Commands can be combined in workflows

## Quick Troubleshooting

### Command Not Found
- Is it a Claude Code command? Check `/help`
- Is it an AgileAiAgents command? Check `/aaa-help`
- Check spelling and syntax

### High Token Usage
- Run `/cost` to check usage
- Use `/compact` to reduce context
- Consider `/clear` for fresh start

### Session Issues
- List sessions: `ls ~/.claude/sessions/`
- Resume specific: `claude -r <session-id>`
- Start fresh: `claude` (without -c flag)

## Related Documentation
- AgileAiAgents Commands: `/aaa-help`
- Integration Guide: `claude-code-integration-guide.md`
- Memory Optimization: `claude-code-memory-optimization.md`