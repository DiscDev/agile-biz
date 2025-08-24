# /aaa-config

Display and manage AgileAI Agents configuration settings

## Usage

```bash
# View all configuration
/aaa-config

# View specific section
/aaa-config preferences
/aaa-config project_state.auto_save

# Set a value
/aaa-config set preferences.verbosity verbose
/aaa-config set preferences.research_level minimal
/aaa-config set sub_agents.orchestration.max_concurrent 3

# Reset configuration
/aaa-config reset preferences        # Reset section to defaults
/aaa-config reset --all             # Reset entire configuration
/aaa-config reset --all --force     # Skip confirmation

# Interactive mode
/aaa-config interactive             # Menu-driven configuration
```

## Examples

### View current research level
```bash
/aaa-config preferences.research_level
```

### Change verbosity
```bash
/aaa-config set preferences.verbosity verbose
```

### Reset all settings to defaults
```bash
/aaa-config reset --all --force
```

## Configuration Sections

- **preferences**: User preferences (research level, verbosity, timezone)
- **project_state**: Auto-save and checkpoint settings
- **community_learnings**: Contribution and privacy settings
- **hooks**: Hook system configuration
- **research_verification**: Anti-hallucination settings
- **sub_agents**: Parallel execution configuration
- **workflow**: Workflow and model routing settings

## Notes

- Invalid values are auto-corrected to the nearest valid option
- Changes show what features are affected
- Configuration persists across sessions
- Use `/aaa-config` without arguments to see all current settings