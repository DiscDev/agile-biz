# Version Management Guide

## Overview

AgileAiAgents uses a dual versioning system to track both official system releases and continuous improvements from community learnings. This guide explains how versions work and how to manage them.

## Version Format

### System Version
- **Format**: `MAJOR.MINOR.PATCH` (Semantic Versioning)
- **Example**: `1.2.0`
- **Used for**: Official AgileAiAgents releases
- **Updated**: During coordinated system updates

### Agent Self-Improvement Version
- **Format**: `MAJOR.MINOR.PATCH+YYYYMMDD.N`
- **Example**: `1.2.0+20250128.1`
- **Used for**: Individual agent improvements from learnings
- **Updated**: When implementing community learnings

### Version Components
- `MAJOR`: Breaking changes to agent interfaces or system architecture
- `MINOR`: New capabilities, patterns, or non-breaking features
- `PATCH`: Bug fixes, optimizations, or minor improvements
- `+YYYYMMDD`: Date of self-improvement (optional)
- `.N`: Increment number for multiple improvements on same day

## Version History Location

### In Agent MD Files
Each agent maintains its version history in a dedicated section:

```markdown
## Version History

### v1.2.0+20250128.1
- **Source**: contributions/2025-01-27-saas-dashboard
- **Changes**: Added browser testing patterns for SPAs
- **Impact**: +15% bug detection rate
- **Validated**: 2025-01-29

### v1.2.0 (2025-01-15)
- **Release**: Added new testing strategies
- **Features**: E2E testing, visual regression
- **Breaking**: Changed test configuration format
```

### Central Version Tracking
- **File**: `/machine-data/version-history.json`
- **Contents**: Complete version history for all agents
- **Purpose**: Tracking, rollback, and reporting

## Managing Versions

### When to Update Versions

#### System Version Updates (MAJOR.MINOR.PATCH)
- **MAJOR**: 
  - Breaking changes to agent interfaces
  - Major architectural changes
  - Incompatible workflow updates
  
- **MINOR**:
  - New agent capabilities
  - New workflow patterns
  - Additional integrations
  - Backward-compatible features
  
- **PATCH**:
  - Bug fixes
  - Performance optimizations
  - Documentation updates
  - Minor improvements

#### Self-Improvement Updates (+YYYYMMDD.N)
- Applied when implementing learnings from community contributions
- Maintains base version, adds date suffix
- Multiple improvements on same day increment N

### Version Update Process

#### For System Releases
1. Coordinate across all agents
2. Update `version.json`
3. Create release notes
4. Tag in version control
5. Update all agent base versions

#### For Self-Improvements
1. Learning Analysis Agent implements approved changes
2. Version Manager updates agent version
3. Changes tracked in version history
4. Success metrics validated
5. Rollback available if needed

## Version Management Commands

### Using Version Manager
```bash
# Update agent version with improvement
node machine-data/version-manager.js update coder_agent "contribution-2025-01-27" "Added React 18 patterns" "+30% render performance"

# Generate version report
node machine-data/version-manager.js report
```

### Checking Versions
```bash
# View all agent versions
cat machine-data/version-history.json | jq '.agents'

# Check specific agent version
grep -A1 "Version History" ai-agents/coder_agent.md
```

## Version Validation

### Success Criteria
Before marking a version as validated:
- All tests pass
- Performance metrics meet or exceed baseline
- No critical errors in production
- Positive user feedback

### Validation Process
1. Implement changes with new version
2. Monitor metrics for validation period (7 days)
3. Compare before/after performance
4. Mark as validated or rollback

## Rollback Procedures

### When to Rollback
- Test failure rate > 20%
- Performance degradation > 10%
- Critical errors detected
- Negative user feedback

### Rollback Process
1. Version Manager identifies issue
2. Restore previous version from history
3. Update version records
4. Notify about rollback
5. Analyze failure for future learning

## Best Practices

### Version Documentation
- Always include clear change description
- Reference source contribution
- Document measurable impact
- Track validation status

### Version Coordination
- Keep related agents in sync
- Test version compatibility
- Document dependencies
- Plan rollback strategy

### Communication
- Announce major version updates
- Document breaking changes clearly
- Provide migration guides
- Track version adoption

## Example Scenarios

### Scenario 1: Bug Fix from Contribution
```
Current: v1.2.0
Learning: "Fix TypeScript inference bug"
New Version: v1.2.0+20250128.1
```

### Scenario 2: New Feature Pattern
```
Current: v1.2.0+20250125.2
Learning: "Add WebSocket patterns"
New Version: v1.2.0+20250128.3
```

### Scenario 3: Official Release
```
Current: v1.2.0+20250128.3
Release: Include all validated improvements
New Version: v1.3.0
```

## Version History Schema

```json
{
  "agent": "testing_agent",
  "current_version": "1.2.0+20250128.1",
  "base_version": "1.2.0",
  "improvements": [
    {
      "date": "2025-01-28T10:00:00Z",
      "from_version": "1.2.0",
      "to_version": "1.2.0+20250128.1",
      "source": "contributions/2025-01-27-saas-dashboard",
      "changes": "Added browser testing patterns",
      "impact": "+15% bug detection",
      "validated": true,
      "validation_date": "2025-02-04T10:00:00Z"
    }
  ]
}
```

## Integration with Learning System

The version management system is tightly integrated with the Learning Analysis workflow:

1. **Contribution Analysis** → Identify improvements
2. **Implementation Plan** → Propose version updates
3. **Implementation** → Apply changes with new versions
4. **Validation** → Track success metrics
5. **Broadcast** → Share validated improvements

This ensures every improvement is tracked, validated, and reversible.

---

*Version management is critical for maintaining system stability while enabling continuous improvement from community learnings.*