# Project State Directory (v7.0.0+)

This directory contains the AgileAiAgents state management system.

## Three-File Structure

When you start using AgileAiAgents, three state files will be created:

1. **runtime.json** - Current workflow and session state
   - Resets when starting a new workflow
   - Contains active workflow, phase, queues, and agent coordination

2. **persistent.json** - Historical data and metrics
   - Survives resets
   - Contains decisions, learnings, sprints, documents created, and progress

3. **configuration.json** - User preferences and settings
   - Ships with defaults in clean-slate
   - Modified via `/aaa-config` command
   - Single source of truth for all configuration

## Initial State

This directory ships with only `configuration.json` containing sensible defaults.
The other files are created automatically when you start your first workflow.

## State Management Commands

- `/aaa-config` - View and modify configuration settings
- `/reset-project-state` - Reset state with various options
- `/checkpoint` - Create a backup checkpoint
- `/aaa-status` - View current state

## Archives

Checkpoints and backups are stored in the `archives/` subdirectory (created automatically).

## Migration from v6

If upgrading from v6.x, your old state files are backed up with `.v6.backup` extension.
The new structure is not backwards compatible - you'll need to start fresh workflows.

---

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)