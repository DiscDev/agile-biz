# Verbosity Agent Implementation Guide

## Quick Reference

**Configuration Location**: `CLAUDE.md` → `verbosity` section
**User Documentation**: `verbosity-guide.md`
**Current Setting Check**: Look for `verbosity.level` in CLAUDE.md

## Implementation Checklist

- [ ] Add verbosity configuration section to your agent
- [ ] Identify multi-phase or long-running operations
- [ ] Implement appropriate display templates
- [ ] Test output at all verbosity levels
- [ ] Handle errors consistently regardless of verbosity

## Core Implementation Rules

### 1. Verbosity Level Behaviors

**quiet**:
- Show ONLY: Critical errors, final results
- Hide: All progress, timing, status updates

**normal**:
- Show: Key milestones, phase transitions, warnings, errors
- Hide: Progress bars, detailed timing, subtasks

**verbose**:
- Show: Everything - detailed progress, timing, subtasks, percentages
- Use: Full display templates with progress bars

**debug**:
- Show: Everything from verbose PLUS internal state, decision logic
- Include: Token usage, file paths, state transitions

### 2. Required Agent Section

Add this section to your agent document:

```markdown
### Verbosity Configuration

This agent respects the verbosity settings in CLAUDE.md:
- Shows detailed progress for [list key operations] in verbose mode
- Displays phase-by-phase updates with timing information
- Always shows critical errors regardless of verbosity level
- Supports all verbosity levels: quiet, normal, verbose, debug

Reference: See `verbosity-agent-implementation.md` for display templates.
```

## Standard Display Templates

### Agent Initialization Template

**When to use**: Agent starts a major workflow

**Verbose/Debug mode**:
```
[AGENT_NAME] AGENT INITIALIZING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Starting Time: [TIME] [TIMEZONE]
Verbosity Level: [LEVEL]
Total Phases: [NUMBER]
Estimated Duration: [TIME_ESTIMATE]

Configuration:
• [Key setting 1]
• [Key setting 2]
• [Key setting 3]
```

**Normal mode**: `[Agent Name]: Starting [workflow name]...`
**Quiet mode**: No output

### Multi-Phase Progress Template

**When to use**: Operations with multiple sequential phases

**Verbose/Debug mode**:
```
[PHASE_NAME] - PHASE [X] OF [Y] [[TIME] [TIMEZONE]] | Elapsed: [DURATION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[EMOJI] [TASK_NAME]                                  ▓▓▓▓░░░ [%] | [ELAPSED]
├─ ✓ [Completed subtask 1] [[DURATION]]
├─ ✓ [Completed subtask 2] [[DURATION]]
├─ ⟳ [Current subtask in progress]...
└─ ○ [Pending subtask]

Current Activity: [DETAILED_DESCRIPTION]
Items Processed: [X] of [Y]
```

**Normal mode**: `[Agent Name]: [Phase name] complete ([duration])`
**Quiet mode**: No output

### Parallel Operations Template

**When to use**: Multiple concurrent operations

**Verbose/Debug mode**:
```
PARALLEL OPERATIONS - [OPERATION_NAME] [[TIME] [TIMEZONE]]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Parallel Tasks ([X] active):

[EMOJI] [Task 1]     ▓▓▓▓▓▓░░ [%] | [Status]
[EMOJI] [Task 2]     ▓▓▓░░░░░ [%] | [Status]
[EMOJI] [Task 3]     ▓▓▓▓▓▓▓▓ [%] | [Status]

Overall Progress: [%] | Elapsed: [DURATION]
Estimated Completion: [TIME]
```

**Normal mode**: `[Agent Name]: Running [X] parallel tasks...`
**Quiet mode**: No output

### Error Display Template

**When to use**: ANY error (shown at ALL verbosity levels)

```
❌ ERROR in [Agent Name] [[TIME] [TIMEZONE]]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error Type: [ERROR_TYPE]
Message: [ERROR_MESSAGE]

Details:
[DETAILED_ERROR_INFORMATION]

Suggested Fix:
[ACTIONABLE_SOLUTION]

[If verbose/debug, add:]
Stack Trace:
[STACK_TRACE]
Context: [WHAT_AGENT_WAS_DOING]
```

### Warning Display Template

**When to use**: Non-critical issues (show in normal, verbose, debug)

```
⚠️  WARNING in [Agent Name] [[TIME] [TIMEZONE]]
[WARNING_MESSAGE]
[If verbose: Add suggested action]
```

### Completion Summary Template

**When to use**: Major workflow completes

**Verbose/Debug mode**:
```
✅ [WORKFLOW_NAME] COMPLETED [[TIME] [TIMEZONE]]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Duration: [DURATION]
Phases Completed: [X] of [Y]

Summary:
• [Key outcome 1]
• [Key outcome 2]
• [Key outcome 3]

[If any warnings occurred:]
⚠️  Warnings ([X]):
• [Warning 1]
• [Warning 2]

Next Steps:
• [Next action 1]
• [Next action 2]
```

**Normal mode**: `✓ [Workflow] completed successfully ([duration])`
**Quiet mode**: `✓ [Workflow] completed`

## Implementation Examples

### Example 1: Simple Operation

```markdown
When analyzing code (in verbose mode):
\```
CODE ANALYSIS - PHASE 1 OF 3 [10:30:15 AM PST] | Elapsed: 00:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 SCANNING CODEBASE                                ▓▓▓░░░░░ 45% | 00:01:30
├─ ✓ Found 156 source files
├─ ⟳ Analyzing dependencies...
└─ ○ Generating report

Files Analyzed: 70 of 156
Current File: /src/components/AuthModule.js
\```
```

### Example 2: Error Handling

```markdown
If an error occurs (shown at all verbosity levels):
\```
❌ ERROR in Security Agent [11:45:32 AM PST]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error Type: VulnerabilityDetected
Message: SQL injection vulnerability found

Details:
- File: /api/users/query.js
- Line: 45
- Severity: CRITICAL

Suggested Fix:
Use parameterized queries instead of string concatenation
Example: db.query('SELECT * FROM users WHERE id = ?', [userId])
\```
```

## Special Formatting Elements

### Progress Bars
- Use 8 blocks: `▓▓▓▓░░░░`
- Always show percentage after bar
- Include elapsed time

### Status Symbols
- `✓` - Completed successfully
- `✗` - Failed
- `⟳` - In progress
- `○` - Pending
- `⚠️` - Warning
- `❌` - Error
- `⚡` - Parallel operation
- `🔍` - Analysis/Search
- `💻` - Code/Implementation
- `📋` - Documentation/Planning
- `🧪` - Testing
- `🚀` - Deployment
- `🔒` - Security

### Time Formatting
- Use configured timezone from CLAUDE.md
- 12h format: `10:30:15 AM PST`
- 24h format: `22:30:15 PST`
- Always show timezone if `show_timezone: true`

## Testing Your Implementation

### Test Checklist

1. **Quiet Mode Test**:
   - Start operation → Should see nothing
   - Complete operation → Should see minimal result
   - Trigger error → Should see error

2. **Normal Mode Test**:
   - Start operation → Should see start message
   - Phase transitions → Should see phase completions
   - Complete operation → Should see summary
   - Trigger warning → Should see warning

3. **Verbose Mode Test**:
   - All display templates should render
   - Progress bars should update
   - Timing should be accurate
   - All subtasks should be visible

4. **Debug Mode Test**:
   - Should include internal state
   - Token usage visible
   - Decision logic explained

### Common Implementation Mistakes

1. **Don't hardcode verbosity** - Always check CLAUDE.md settings
2. **Don't skip error displays** - Errors show at ALL levels
3. **Don't forget timezone** - Use configured timezone
4. **Don't mix formats** - Stick to templates for consistency

## Integration with Other Systems

### State Management
- Verbosity doesn't affect state saving
- Progress displays are separate from state updates
- Include verbosity level in state for consistency

### Error Handling
- Errors ALWAYS display regardless of verbosity
- Use error template for consistency
- Include actionable fixes when possible

### Performance
- Minimize string operations in quiet mode
- Cache verbosity level at start of operation
- Don't calculate progress if not displaying

## Quick Implementation Guide

1. **Add Configuration Section**
```markdown
### Verbosity Configuration
[Copy from template above]
```

2. **Identify Long Operations**
- Anything over 30 seconds
- Multi-phase workflows  
- Operations users wait for

3. **Add Display Blocks**
```markdown
When in verbose mode, displays:
\```
[Copy appropriate template]
\```
```

4. **Test All Levels**
- Change CLAUDE.md verbosity
- Run your agent
- Verify correct output

5. **Document Behaviors**
- What shows at each level
- Which operations have progress
- Any agent-specific overrides

## Examples from Other Agents

### Testing Agent (Comprehensive)
- Shows all test phases with progress
- Detailed error reporting with fixes
- Summary with metrics

### Coder Agent
- Implementation phases with file counts
- Real-time file modification tracking
- Completion summary with changes

### PRD Agent  
- Requirements gathering progress
- Document generation status
- Section-by-section completion

## Reference

- **User Guide**: `verbosity-guide.md` - For users configuring verbosity
- **Configuration**: `CLAUDE.md` - Current verbosity settings
- **Examples**: Testing Agent, Coder Agent - Full implementations