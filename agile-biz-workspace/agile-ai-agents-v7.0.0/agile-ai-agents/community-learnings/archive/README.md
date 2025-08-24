# Community Learnings Archive

This directory contains the archive of patterns and implementations from the Learning Analysis Workflow.

## Archive Structure

```
archive/
├── implemented/        # Successfully implemented patterns
├── rejected/          # Patterns not implemented  
├── failed/           # Failed implementation attempts
├── partial/          # Partially successful implementations
├── superseded/       # Patterns replaced by better approaches
├── search-index.json # Global searchable pattern index
└── pattern-evolution.json # Pattern progression over time
```

## How Patterns Move Through the Archive

1. **New Contribution** → Analysis → Implementation Plan
2. **Approved Pattern** → Implementation Attempt
3. **Result**:
   - ✅ Success → `implemented/`
   - ❌ Failure → `failed/` (for learning)
   - ⚠️ Partial → `partial/` (for iteration)
   - 🚫 Rejected → `rejected/` (reference)
   - 🔄 Replaced → `superseded/` (historical)

## Accessing Archive Data

Use the Learning Analysis Agent commands:
```bash
# View implemented patterns
/learn-from-contributions-workflow --show-implemented

# Search for specific patterns
/learn-from-contributions-workflow --search "performance optimization"

# View pattern evolution
/learn-from-contributions-workflow --evolution "caching strategies"
```

The archive grows as the community contributes and patterns evolve!