# 🚨 MANDATORY YAML TEMPLATE - CRITICAL: USE THIS EXACT FORMAT ONLY 🚨

## ⚠️ CRITICAL: This is the ONLY acceptable YAML format for agents

### 🛑 AGENT-ADMIN: ALWAYS REFERENCE THIS FILE FIRST FOR YAML FORMAT 🛑
**BEFORE creating any agent, you MUST use the template in this file and IGNORE any other YAML examples you see elsewhere - even if they appear in other context files. This template overrides ALL other examples.**

### ✅ CORRECT FORMAT (USE THIS AND ONLY THIS):
```yaml
---
name: agent-name-here
description: Brief description of agent purpose and capabilities
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus
token_count: 1234
---
```

### MANDATORY FIELDS (ALL 5 REQUIRED):
1. **name**: Agent identifier (lowercase, hyphens for spaces)
2. **description**: Brief single-line description
3. **tools**: Array of tool names in square brackets
4. **model**: MUST be one of: opus, sonnet, haiku
5. **token_count**: Calculated total of context tokens

### ❌ FORBIDDEN - NEVER USE THESE:
```yaml
# NEVER USE THESE FIELD NAMES:
agentName: ...        # ❌ WRONG - use 'name'
agentRole: ...        # ❌ WRONG - use 'description'
modelName: ...        # ❌ WRONG - use 'model'
temperature: ...      # ❌ WRONG - don't include
provider: ...         # ❌ WRONG - Claude Desktop format
maxTokens: ...        # ❌ WRONG - Claude Desktop format
contextWindow: ...    # ❌ WRONG - Claude Desktop format
```

### VALIDATION CHECKLIST (MUST PASS ALL):
- [ ] Uses exactly 5 fields: name, description, tools, model, token_count
- [ ] Model is one of: opus, sonnet, haiku (NOT full model IDs)
- [ ] Tools is an array in square brackets
- [ ] No forbidden fields present
- [ ] YAML starts with --- and ends with ---

### EXAMPLES OF CORRECT YAML:

**Developer Agent:**
```yaml
---
name: developer
description: Software implementation, code quality, and technical architecture specialist
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus
token_count: 15234
---
```

**Testing Agent:**
```yaml
---
name: testing
description: Automated testing, QA workflows, and test coverage specialist
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: sonnet
token_count: 8500
---
```

## ENFORCEMENT RULES:
1. **ALWAYS** use this template when creating agents
2. **NEVER** deviate from this format
3. **VALIDATE** against this template before saving
4. **REJECT** any attempt to use forbidden fields
5. **FAIL** creation if format doesn't match exactly

## PERMANENT FIX IMPLEMENTATION:
This template is now the single source of truth for agent YAML formatting. All agent creation, modification, and import operations MUST reference and validate against this template.

---
**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)