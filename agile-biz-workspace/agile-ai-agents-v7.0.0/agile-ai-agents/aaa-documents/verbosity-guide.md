# Verbosity Guide

## Overview

The AgileAiAgents verbosity system controls how much detail AI agents display during their operations. This guide helps you configure verbosity to match your needs, whether you want minimal output for production or detailed progress tracking during development.

## Quick Start

Set your verbosity level in `CLAUDE.md`:
```yaml
verbosity:
  level: "verbose"  # Choose: quiet, normal, verbose, debug
```

## Configuration

### Location
All verbosity settings are configured in the `CLAUDE.md` file at the root of your agile-ai-agents directory.

### Full Configuration Options
```yaml
verbosity:
  level: "verbose"              # Output detail level
  display:
    format: "grouped_by_agent"  # How to group status messages
    timezone: "America/Los_Angeles"  # Your timezone (IANA format)
    time_format: "12h"          # Time format: 12h or 24h
    show_timezone: true         # Show timezone in timestamps
```

### Timezone Configuration
- Use IANA timezone format (e.g., "America/New_York", "Europe/London", "Asia/Tokyo")
- Find your timezone: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
- Default is "America/Los_Angeles" (PST/PDT)

## Verbosity Levels Explained

### 🔇 quiet
**When to use**: Production environments, automated scripts, minimal logging needs

**What you'll see**:
- Critical errors only
- Final results
- No progress indicators
- No timing information

**Example output**:
```
✓ Sprint planning completed
✗ Error: API rate limit exceeded
```

### 📢 normal (default)
**When to use**: Regular development work, balanced information

**What you'll see**:
- Key milestones and phase transitions
- Important status updates
- Errors and warnings
- Basic timing for major operations

**Example output**:
```
PRD Agent: Starting requirements analysis...
PRD Agent: Requirements analysis complete (5 min)
Coder Agent: Implementation started
⚠️ Warning: Deprecated dependency detected
Coder Agent: Implementation complete (15 min)
```

### 📊 verbose (recommended for development)
**When to use**: Development, debugging, learning agent workflows

**What you'll see**:
- Detailed progress tracking with progress bars
- Phase-by-phase updates with timing
- Real-time status indicators
- Percentage completion
- Elapsed time tracking
- Subtask breakdowns

**Example output**:
```
CODER AGENT INITIALIZING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Starting Time: 10:30:15 AM PST
Verbosity Level: verbose
Total Phases: 4
Estimated Duration: 20-30 minutes

IMPLEMENTATION - PHASE 2 OF 4 [10:35:22 AM PST] | Elapsed: 00:05:07
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💻 FEATURE DEVELOPMENT                              ▓▓▓▓▓░░░ 65% | 00:03:20
├─ ✓ Authentication module implemented [00:01:15]
├─ ✓ Database schema updated [00:00:45]
├─ ⟳ Writing API endpoints...
└─ ○ Integration tests pending

Current Activity: Implementing user profile endpoints
Files Modified: 12 of 18
```

### 🔍 debug
**When to use**: Troubleshooting, deep debugging, development of agents

**What you'll see**:
- Everything from verbose mode
- Internal state information
- Detailed error traces with stack traces
- Token usage statistics
- Agent decision logic
- File operation details

**Example output**:
```
[DEBUG] Token usage: 1,250/4,000 (31%)
[DEBUG] Agent state: { phase: "analysis", confidence: 0.95 }
[DEBUG] File operation: Writing to /project-documents/requirements/user-stories.md
[DEBUG] Decision tree: Selecting defensive programming pattern due to security requirements
```

## What Different Agents Show

### During Multi-Phase Operations
Agents with complex workflows (PRD, Coder, Testing) show:
- Phase initialization with time estimates
- Progress bars with percentages
- Subtask completion status
- Current activity descriptions
- Elapsed time tracking

### During Parallel Operations
When multiple agents work together:
```
PARALLEL AGENT OPERATIONS [10:45:30 AM PST]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Parallel Tasks (3 active):

📋 PRD Agent         ▓▓▓▓▓▓░░ 75% | Finalizing requirements
🎨 UI/UX Agent       ▓▓▓░░░░░ 40% | Creating wireframes
🔒 Security Agent    ▓▓▓▓▓▓▓▓ 95% | Completing audit

Overall Progress: 70% | Elapsed: 00:12:45
```

### Error Displays
Errors are ALWAYS shown regardless of verbosity level:
```
❌ ERROR in Coder Agent [10:50:15 AM PST]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error Type: DependencyConflict
Message: Package versions incompatible

Details:
- Required: react@18.0.0
- Conflicts with: react-dom@17.0.0

Suggested Fix:
Update react-dom to version 18.0.0 in package.json
```

## Best Practices

### For Different Scenarios

**New to AgileAiAgents**:
- Start with `verbose` to understand agent workflows
- Watch how agents collaborate and hand off work
- Learn the typical duration of different operations

**Active Development**:
- Use `verbose` during feature development
- Switch to `normal` for routine tasks
- Use `debug` when troubleshooting issues

**Production/Automation**:
- Use `quiet` for automated scripts
- Set up separate logging for critical errors
- Consider `normal` for monitored environments

**Team Environments**:
- Agree on a standard verbosity level
- Use `verbose` for shared debugging sessions
- Document any agent-specific verbosity overrides

### Performance Considerations

- `quiet` and `normal` have minimal performance impact
- `verbose` adds ~2-5% overhead due to progress tracking
- `debug` can add 10-15% overhead - use only when needed

## Troubleshooting

### Not Seeing Expected Output?

1. **Check verbosity level**: Ensure it's set correctly in CLAUDE.md
2. **Verify file location**: CLAUDE.md must be in the agile-ai-agents root
3. **Agent-specific overrides**: Some agents may have custom verbosity settings
4. **Terminal compatibility**: Ensure your terminal supports Unicode characters

### Timezone Issues?

1. **Verify timezone format**: Use IANA format (e.g., "America/New_York")
2. **Check daylight saving**: System handles DST automatically
3. **Update timezone**: Simply change in CLAUDE.md and restart

### Progress Bars Not Displaying?

- Ensure terminal width is at least 80 characters
- Check terminal Unicode support
- Try switching to a different terminal emulator

## Examples by Workflow

### Sprint Planning (Verbose)
```
SPRINT PLANNING - PHASE 1 OF 3 [09:00:00 AM PST] | Elapsed: 00:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ANALYZING BACKLOG                                ▓▓▓░░░░░ 45% | 00:02:30
├─ ✓ Loaded 47 user stories
├─ ⟳ Calculating story points...
└─ ○ Prioritizing by business value

Sprint Capacity: 40 points
Stories Analyzed: 21 of 47
```

### Code Generation (Normal)
```
Coder Agent: Starting implementation of user authentication
Coder Agent: Generated auth module (2 min)
Coder Agent: Added test coverage (1 min)
✓ Implementation complete
```

### Error Handling (All Levels)
```
❌ ERROR: Database connection failed
Connection timeout after 30 seconds
Check database server status and credentials
```

## Related Documentation

- **For Agents**: See `verbosity-agent-implementation.md` for implementation details
- **Configuration**: Full settings reference in `CLAUDE.md`
- **Examples**: Testing Agent demonstrates comprehensive verbosity implementation