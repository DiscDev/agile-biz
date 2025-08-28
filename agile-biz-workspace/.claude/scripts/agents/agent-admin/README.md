# Agent-Admin Scripts

This folder contains all scripts specifically used by the agent-admin for managing Claude Code agents in the AgileBiz workspace.

## Scripts

### `validate-agent-yaml.js`
**Purpose**: YAML frontmatter validation and compliance checking
- Validates agent YAML against mandatory format requirements
- Ensures no forbidden fields are used (agentName, agentRole, temperature, etc.)
- Provides correct YAML template when run with --help

**Usage**:
```bash
node validate-agent-yaml.js [agent-file.md]
node validate-agent-yaml.js --help  # Show correct YAML format
```

### `manage-agent-hooks.js`
**Purpose**: Direct hook file management for agent detection
- Updates agent detection patterns in hook files
- Adds/removes/updates agent keywords for logging system
- Validates hook syntax after modifications

**Usage**:
```bash
node manage-agent-hooks.js add <agent-name> <keywords>
node manage-agent-hooks.js remove <agent-name>
node manage-agent-hooks.js update <agent-name> <keywords>
node manage-agent-hooks.js validate
```

### `agent-lifecycle-manager.js`
**Purpose**: Complete agent lifecycle management with hook integration
- Handles full agent creation, modification, and deletion workflows
- Integrates with hook management system automatically
- Updates CLAUDE.md documentation and logging configurations

**Usage**:
```bash
node agent-lifecycle-manager.js create <agent-name> <description>
node agent-lifecycle-manager.js delete <agent-name>
node agent-lifecycle-manager.js update <agent-name> <field> <value>
```

## Integration

These scripts are used by:
- **Agent-Admin Agent**: Direct Task tool integration for conversational workflow
- **Hook System**: Automatic agent detection and logging
- **YAML Validation**: Ensuring compliance with mandatory format requirements
- **Infrastructure Management**: Maintaining consistent agent structure

## File Organization

Scripts are organized by agent type:
```
.claude/scripts/agents/
├── agent-admin/          # Agent-admin specific scripts
│   ├── validate-agent-yaml.js
│   ├── manage-agent-hooks.js
│   └── agent-lifecycle-manager.js
└── [future-agent-types]/ # Other agent-specific scripts
```

## Path Updates

All references to these scripts have been updated from:
- `❌ .claude/scripts/validate-agent-yaml.js` 
- `✅ .claude/scripts/agents/agent-admin/validate-agent-yaml.js`

Updated files:
- `.claude/agents/agent-admin.md`
- `.claude/agents/agent-tools/agent-admin/core-agent-management.md`
- `.claude/agents/agent-tools/agent-admin/agent-modify-guide.md`

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)