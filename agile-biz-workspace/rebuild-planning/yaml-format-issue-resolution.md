# YAML Format Issue Resolution - Critical Investigation Results

## Problem Summary
Agent-admin was repeatedly creating agents with the WRONG YAML format, despite corrections. This investigation reveals the root cause and provides permanent fixes.

## Root Cause Analysis

### 1. Conflicting Documentation
The `reference-import-guide.md` contained CONTRADICTORY examples:
- Some sections showed the CORRECT format
- One section (lines 102-110) showed WRONG format with `keywords` and `specialization` fields
- This confusion led to mixing agent YAML format with context file YAML format

### 2. Format Confusion
There are TWO distinct YAML formats in the system:

#### AGENT Files Format (`.claude/agents/*.md`):
```yaml
---
name: agent-name
description: Brief description
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus|sonnet|haiku
token_count: [number]
---
```

#### CONTEXT Files Format (`.claude/agents/agent-tools/**/*.md`):
```yaml
---
title: Context Title
type: agent-context
token_count: [number]
keywords: [trigger, words, for, loading]
agents: [agent-name]
---
```

The confusion between these two formats was causing incorrect agent creation.

## Fixes Applied

### 1. Updated reference-import-guide.md
- **Removed** conflicting wrong template showing `keywords` and `specialization`
- **Added** clear warning at the top about mandatory YAML format
- **Clarified** that `keywords`, `specialization`, `purpose` are FORBIDDEN in agent files

### 2. Updated agent-creation-guide.md
- **Added** prominent warning section with ⚠️ symbols
- **Listed** forbidden fields explicitly
- **Emphasized** the distinction between agent and context file formats

### 3. Key Changes Made:
```diff
# reference-import-guide.md
- keywords: [keyword, patterns, for, context, loading]
- specialization: domain-expertise
+ # CRITICAL: NEVER use 'keywords', 'specialization', etc in agent YAML
+ # Those are for CONTEXT files only, NOT agent files!

# agent-creation-guide.md
+ ## ⚠️ MANDATORY YAML FORMAT - NEVER DEVIATE ⚠️
+ **FORBIDDEN fields for agent files:** keywords, specialization, purpose, agents, type, title
```

## Verification Results

All current agents NOW have the correct format:
- ✅ agent-admin.md - Correct
- ✅ developer.md - Correct
- ✅ devops.md - Correct
- ✅ car-salesman.md - Correct
- ✅ finance.md - Correct
- ✅ lonely-hearts-club-band.md - Correct

## Prevention Strategy

### 1. Clear Documentation
- All agent creation guides now have prominent warnings
- Forbidden fields are explicitly listed
- Examples are consistent and correct

### 2. Template Enforcement
- `yaml-template-mandatory.md` remains the source of truth
- All creation guides reference this mandatory template
- Conflicting examples have been removed

### 3. Context Isolation
- Agent YAML format is clearly separated from context YAML format
- Different fields for different file types are now documented
- No more mixing of formats

## Testing Checklist

When creating new agents, verify:
1. ✅ Uses `name` not `agentName` or other variations
2. ✅ Uses `description` not `purpose` or `agentRole`
3. ✅ Includes `tools` array
4. ✅ Uses short model names (opus/sonnet/haiku) not full IDs
5. ✅ Has `token_count` field
6. ❌ NO `keywords` field (context files only)
7. ❌ NO `specialization` field (obsolete)
8. ❌ NO `purpose` field (use description)
9. ❌ NO `agents` field (context files only)
10. ❌ NO `type` field (context files only)

## Conclusion

The issue was caused by conflicting documentation that mixed agent file format with context file format. The fixes ensure:
1. All documentation is consistent
2. Warnings are prominent and clear
3. Forbidden fields are explicitly listed
4. The distinction between agent and context files is maintained

This should permanently resolve the YAML format confusion.

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)