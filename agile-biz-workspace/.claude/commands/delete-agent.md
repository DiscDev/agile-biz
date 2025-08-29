---
description: "Interactive agent deletion through guided workflow"
model: sonnet
---

# Delete Agent - Interactive Workflow

I'll help you delete an existing Claude Code agent from your workspace.

## Request Analysis

**Your Request**: "$ARGUMENTS"

Let me first scan your workspace to see what agents are available for deletion.

---

## Available Agents Detection

**Scanning `.claude/agents/` directory for available agents...**

*I'll automatically detect and list all available agents excluding shared tools and system files.*

---

## Agent Selection Prompt

**Available agents in your workspace:**

*[I'll dynamically list all .md files in .claude/agents/ that are actual agent files]*

**Which agent would you like to delete?**

*Enter the agent name (without .md extension):*

---

## Conversation State Management

### State 1: Agent Selection
**When you provide an agent name, I'll:**
1. ✅ Validate the agent exists in the workspace
2. ⚠️ Show warning about deletion being permanent
3. 📋 Display what will be deleted (files, references, etc.)
4. ❓ Ask for final confirmation

### State 2: Deletion Confirmation
**After showing deletion details, I'll ask:**
- "Are you sure you want to delete [agent-name]? (yes/no)"
- "This action cannot be undone. Confirm deletion? (yes/no)"

### State 3: Agent Deletion Execution
**Upon confirmation, I'll:**
1. 🚀 Spawn the agent-admin with deletion instructions
2. 📊 Show real-time deletion progress
3. ✅ Confirm successful deletion and cleanup

---

## Dynamic Agent Discovery

### Agent Scanning Logic

**I will scan for agents using this approach:**
1. **List** all `.md` files in `.claude/agents/`
2. **Filter** out shared tools and system files
3. **Read** each file's frontmatter to confirm it's an agent
4. **Present** clean list of deletable agents

### Detection Patterns

**Valid Agent Files**: Files ending in `.md` with agent frontmatter
**Exclude**: 
- Files in `shared-tools/` subdirectory
- System files like `agent-spawn-logging.md`
- Template files
- **agent-admin** (PROTECTED: System-critical, cannot be deleted)

---

## Safety & Confirmation Flow

### Pre-Deletion Validation

**Before deletion, I'll show:**
```
⚠️  DELETION WARNING ⚠️

Agent: [agent-name]
Files to be deleted:
• .claude/agents/[agent-name].md
• Any agent-specific context files
• References in CLAUDE.md
• Hook configurations
• Logging configurations

This action CANNOT be undone.

Are you sure? (yes/no)
```

### Final Confirmation Required

**I will require explicit confirmation before proceeding:**
- Must type "yes" or "y" to confirm
- "no" or "n" will cancel the operation
- Any other response will re-prompt

### 🔒 Self-Protection Protocol

**If someone attempts to delete agent-admin:**
```
❌ DELETION REJECTED

Agent: agent-admin
Status: SYSTEM-CRITICAL - CANNOT BE DELETED
Reason: agent-admin is required for all agent management operations

This protection cannot be overridden or bypassed under any circumstances.

Please select a different agent to delete.
```

---

## Agent-Admin Integration

### Delegation to Agent-Admin

**Upon confirmation, I'll spawn agent-admin with:**
```
Delete the [agent-name] agent from the Claude Code workspace. Remove all associated files including:
- The agent configuration file
- Any context files specific to this agent  
- Clean up any references in documentation or shared configurations
- Update hook files to remove agent references
- Update shared logging configurations

Ensure the deletion is complete and the agent is no longer available in the workspace.
```

### Progress Monitoring

**I'll track the agent-admin's progress and report:**
1. 🔍 **Scanning** for agent files and references
2. 🗑️  **Deleting** agent configuration file
3. 🧹 **Cleaning** references in CLAUDE.md
4. ⚙️  **Updating** hook configurations
5. 📝 **Updating** logging configurations
6. ✅ **Verifying** complete removal

---

## Conversation State Detection

### State Detection Logic

**I'll analyze your response to determine the conversation state:**

#### State 1: Agent Name Selection
**Patterns**: Valid agent names from the scanned list
**Examples**: `developer`, `content-writer`, `my-custom-agent`
**Response**: Show deletion preview + confirmation prompt

#### State 2: Deletion Confirmation  
**Patterns**: `yes`, `no`, `y`, `n`, `confirm`, `cancel`
**Examples**: `yes`, `y`, `no`, `cancel`
**Response**: Execute deletion or cancel operation

#### Error Handling
**Invalid agent name**: Re-prompt with available options
**Ambiguous response**: Ask for clarification
**System errors**: Provide troubleshooting guidance

---

## Live Agent Scanning

### When You Start, I Will:

1. **Automatically scan** `.claude/agents/` directory
2. **Filter and validate** actual agent files
3. **Present clean list** of deletable agents
4. **Wait for your selection** with clear prompting

### Dynamic Response Based on Available Agents

**If agents found:**
```
Available agents for deletion:
• developer - Smart development agent
• content-writer - Content creation specialist  
• my-custom-agent - Custom agent description

Which agent would you like to delete?
```

**If no agents found:**
```
No deletable agents found in your workspace.
All agents appear to be system-required or shared tools.
```

---

## Ready to Start!

**I'll begin by scanning your workspace for available agents.**

**Available actions:**
- 📋 **List** all deletable agents in your workspace
- ❓ **Select** an agent to delete with guided confirmation
- 🚀 **Execute** deletion via agent-admin
- ✅ **Confirm** successful removal and cleanup

**Just respond with the agent name you want to delete, and I'll guide you through the safe deletion process!**