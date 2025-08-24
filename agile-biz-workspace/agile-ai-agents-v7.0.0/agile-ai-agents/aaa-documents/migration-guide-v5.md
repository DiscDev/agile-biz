# Migration Guide - AgileAiAgents v5.0.0

## 🚀 Overview

Version 5.0.0 introduces the **Stakeholder Interview Agent** and a completely redesigned workflow system with two-stage execution, parallel processing, and enhanced error recovery.

## 🎯 Key Changes

### 1. New Stakeholder Interview Agent
- **Interactive Discovery**: Progressive questioning with iterative refinement
- **AI Operations Vision**: 37+ questions across 6 categories for AI automation planning
- **Ambiguity Detection**: Automatic clarification requests for vague responses
- **Decision Documentation**: All decisions saved with timestamps and approval tracking

### 2. Two-Stage Workflow System

#### New Project Workflow
**Stage 1: Development (Sequential - Phases 1-11)**
1. Setup Verification ✅
2. Stakeholder Discovery 🎯
3. Research Depth Selection 📊
4. Research Execution 🔬
5. Requirements Synthesis 📋
6. Architecture Design 🏗️
7. Development Planning 📅
8. First Sprint 🏃
9. Testing & QA 🧪
10. Documentation 📚
11. MVP Deployment 🚀

**Stage 2: Operations (Flexible - Choose from 29 phases)**
- Quick Packages: Startup, Enterprise, Growth
- Individual phase selection
- Parallel execution option (60% time reduction)

#### Existing Project Workflow
**Stage 1: Analysis (Sequential - Phases 1-8)**
1. Setup Verification ✅
2. Code Analysis 🔍
3. Identity Verification 🆔
4. Enhancement Goals 🎯
5. Analysis Depth Selection 📊
6. Deep Analysis 🔬
7. Enhancement Planning 📋
8. Recommendations 💡

**Stage 2: Enhancements (Flexible - Choose from 25 phases)**

### 3. Command Changes

#### New Commands (Recommended)
```bash
/new-project-workflow        # Replaces /start-new-project-workflow
/existing-project-workflow   # Replaces /start-existing-project-workflow
/select-phases               # New - Select operational phases
/checkpoint                  # Create manual checkpoint
/save-decision              # Document important decisions
```

#### Command Aliases (Backward Compatible)
Old commands still work but show gentle deprecation notices:
- `/start-new-project-workflow` → `/new-project-workflow`
- `/start-existing-project-workflow` → `/existing-project-workflow`

#### New Command Flags
```bash
--dry-run     # Preview without executing
--resume      # Continue from last state
--status      # Get command information
--save-state  # Force state save
```

### 4. Enhanced Features

#### Parallel Execution System
- **60% Time Reduction**: Execute independent phases simultaneously
- **Resource Management**: Automatic allocation of memory, CPU, file handles
- **Conflict Resolution**: Smart document locking and queue management
- **Dependency Graph**: Automatic phase ordering based on dependencies

#### Auto-Save System
- **Automatic Triggers**: Document creation, phase transitions, approvals
- **Backup System**: Rolling backups with configurable retention
- **State Validation**: Automatic validation before saves
- **Recovery Options**: Restore from any checkpoint

#### Error Recovery
- **Smart Retry Logic**: Network, timeout, resource errors handled automatically
- **Safe Mode**: Reduced functionality mode for critical failures
- **State Repair**: Automatic fixing of corrupted state
- **Recovery Options**: Retry, skip, safe mode, restore, repair

## 📋 Migration Steps

### For New Projects

1. **No Changes Required**: Start normally with `/new-project-workflow`
2. **Enjoy New Features**: 
   - Stakeholder interview guides you through setup
   - Research level selection (defaults to THOROUGH)
   - Phase selection menu after MVP

### For Existing Projects

1. **Update Commands** (Optional):
   ```bash
   # Old way (still works)
   /start-existing-project-workflow
   
   # New way (recommended)
   /existing-project-workflow
   ```

2. **Enhancement Goals Discovery**: New interactive process for planning improvements

3. **Analysis Depth Selection**: Choose from Standard, Comprehensive, or Enterprise

### For Ongoing Projects

1. **Resume Support**: Use `--resume` flag to continue from last state
   ```bash
   /continue
   # or
   /new-project-workflow --resume
   ```

2. **State Migration**: Existing state files are automatically upgraded

3. **Checkpoint System**: Create manual checkpoints anytime
   ```bash
   /checkpoint sprint-2-complete
   ```

## 🔧 Configuration

### Research Levels
- **MINIMAL**: 15 essential documents (1-2 hours)
- **MEDIUM**: 48 comprehensive documents (3-5 hours)
- **THOROUGH** (Default): 194 enterprise documents (6-10 hours)

### Verification Levels (from CLAUDE-config.md)
- **PARANOID**: Maximum validation, all checks enabled
- **THOROUGH**: Comprehensive validation (recommended)
- **BALANCED**: Standard validation
- **FAST**: Minimal validation for speed

### Auto-Save Configuration
Location: `machine-data/auto-save-config.json`
```json
{
  "triggers": {
    "document_creation": true,
    "phase_transition": true,
    "time_interval": 300000  // 5 minutes
  },
  "backup": {
    "max_backups": 20,
    "compress_old": true
  }
}
```

## 🚨 Breaking Changes

### None!
All existing commands and workflows continue to work. New features are additive.

## 🎯 Quick Start Examples

### Start New Project with AI Operations
```bash
/new-project-workflow
# Answer stakeholder questions
# Select research level (or wait 24h for default THOROUGH)
# System handles the rest!
```

### Analyze Existing Project
```bash
/existing-project-workflow
# Code analysis runs automatically
# Answer enhancement goal questions
# Choose analysis depth
# Get recommendations
```

### Select Operational Phases
```bash
/select-phases
# Choose Quick Package or individual phases
# Select execution mode (sequential/parallel)
# Watch parallel execution save 60% time!
```

## 📊 Performance Improvements

- **60% Faster**: Parallel execution for independent phases
- **Auto-Recovery**: Automatic retry for transient failures
- **Smart Caching**: Reduced redundant operations
- **Efficient State**: Optimized state management

## 🆘 Troubleshooting

### State Issues
```bash
# Validate state
node hooks/handlers/error-recovery-handler.js

# List backups
node hooks/handlers/auto-save-manager.js

# Restore from backup
/checkpoint --restore
```

### Command Not Found
- Ensure you're in the agile-ai-agents directory
- Check `templates/claude-integration/.claude/commands.json` exists
- Verify hooks are properly initialized

### Workflow Stuck
1. Check current status: `/aaa-status`
2. Review state: `cat project-state/workflow-state.json`
3. Resume or reset as needed

## 📚 Additional Resources

- **Full Documentation**: See `aaa-documents/new-project-workflow-enhancement-plan.md`
- **Implementation Details**: See `project-documents/orchestration/workflow-enhancement-implementation-checklist.md`
- **Test Suite**: Run `node tests/integration/workflow-test-suite.js`

## 🎉 What's Next

### Coming in v5.1
- Visual workflow designer
- Real-time collaboration features
- Extended AI agent capabilities
- Cloud state synchronization

### Coming in v6.0
- Full project automation
- AI-driven sprint planning
- Predictive issue detection
- Advanced analytics dashboard

---

**Need Help?**
- Check `/aaa-help` for all commands
- Review logs in `logs/` directory
- Contact support with error details

**Upgrade Confidence: HIGH** ✅
All changes are backward compatible. Existing workflows continue working while you gain powerful new capabilities!