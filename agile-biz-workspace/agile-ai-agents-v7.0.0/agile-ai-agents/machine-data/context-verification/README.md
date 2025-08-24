# Context Verification Module

## Overview

The Context Verification module provides comprehensive protection against project drift by ensuring all development activities align with the established project truth.

## Module Structure

```
context-verification/
├── verification-engine.js       # Core verification logic
├── confidence-scorer.js         # Weighted confidence calculation
├── drift-detector.js           # Continuous drift monitoring
├── violation-learning-system.js # Pattern detection & learning
├── truth-version-manager.js    # Truth document versioning
├── drift-resolution-coordinator.js # Agent coordination for resolution
├── audit-report-generator.js   # Comprehensive reporting
└── README.md                   # This file
```

## Component Responsibilities

### verification-engine.js
- Manages project truth document
- Verifies individual items (backlog, tasks, etc.)
- Coordinates with other components
- Provides main API for verification operations

### confidence-scorer.js
- Calculates violation confidence scores
- Uses weighted algorithm:
  - Domain alignment: 40%
  - User alignment: 30%
  - Competitor features: 20%
  - Historical patterns: 10%

### drift-detector.js
- Monitors project artifacts for drift
- Checks: backlog, documents, commits, sprints, decisions
- Calculates overall drift percentage
- Triggers escalation based on severity

### violation-learning-system.js
- Learns from detected violations
- Identifies patterns:
  - Domain mismatches
  - User misalignment
  - Feature creep
  - NOT THIS violations
- Generates prevention recommendations

### truth-version-manager.js
- Manages project truth versions
- Semantic versioning (major.minor.patch)
- Tracks all changes with reasons
- Supports rollback to previous versions
- Generates changelogs and diffs

### drift-resolution-coordinator.js
- Coordinates agent response to drift
- Resolution strategies by severity:
  - Emergency (80%+): Block all, emergency meeting
  - Intervention (60-79%): PM/SM review required
  - Collaborative (40-59%): Team discussion
  - Informational (20-39%): Awareness updates

### audit-report-generator.js
- Creates comprehensive audit reports
- Multiple formats: JSON, Markdown, HTML
- Analyzes all aspects of context alignment
- Generates actionable recommendations

## Integration Points

### Command Handler
`machine-data/commands/handlers/context-verification.js`
- Handles `/verify-context` command and options
- User interface for all verification operations

### Hooks
- `hooks/handlers/sprint/pre-sprint-verification.js`
- `hooks/handlers/backlog/backlog-item-validator.js`
- `hooks/handlers/monitoring/drift-monitor.js`

### Dashboard
- Widget: `project-dashboard/public/js/context-verification-widget.js`
- API: `project-dashboard/api/context-verification.js`

## Data Storage

### Project Truth
- Location: `project-documents/project-truth/`
- Files:
  - `project-truth.md` - Current truth
  - `versions/` - Version history
  - `CHANGELOG.md` - Change log
  - `history.json` - Version metadata

### Drift Reports
- Location: `project-documents/orchestration/drift-reports/`
- Format: `drift-report-YYYY-MM-DD.json`

### Audit Reports
- Location: `project-documents/orchestration/context-audits/`
- Formats: JSON, Markdown, HTML

### Learning Data
- Violations: `community-learnings/analysis/context-violations/`
- Patterns: `community-learnings/analysis/violation-patterns.json`

## Key Algorithms

### Confidence Scoring

```javascript
confidence = (
  domainScore * 0.4 +
  userScore * 0.3 +
  competitorScore * 0.2 +
  historicalScore * 0.1
);
```

### Drift Calculation

```javascript
overallDrift = average([
  backlogDrift,
  documentDrift,
  commitDrift,
  sprintDrift,
  decisionDrift
]);
```

### Severity Mapping

```javascript
if (drift >= 80) return 'critical';
if (drift >= 60) return 'major';
if (drift >= 40) return 'moderate';
if (drift >= 20) return 'minor';
return 'none';
```

## Usage Examples

### Basic Verification

```javascript
const verificationEngine = require('./verification-engine');

// Initialize
await verificationEngine.initialize();

// Verify a single item
const result = await verificationEngine.verifyItem({
  title: "Add invoice feature",
  description: "..."
});

if (result.status === 'blocked') {
  console.log(`Violation: ${result.message}`);
}
```

### Drift Monitoring

```javascript
const driftDetector = require('./drift-detector');

// Start monitoring
await driftDetector.startMonitoring(60); // Check every 60 minutes

// Manual check
const report = await driftDetector.checkDriftNow();
console.log(`Current drift: ${report.overallDrift}%`);
```

### Learning from Violations

```javascript
const learningSystem = require('./violation-learning-system');

// Learn from violation
await learningSystem.learnFromViolation({
  item: violatingItem,
  confidence: 95,
  reason: "Domain mismatch",
  projectTruth: currentTruth
});

// Get insights
const insights = await learningSystem.getProjectInsights(projectTruth);
```

## Error Handling

All components follow consistent error handling:

```javascript
try {
  // Operation
  return { success: true, data };
} catch (error) {
  return { 
    success: false, 
    error: error.message 
  };
}
```

## Performance Considerations

- Confidence scoring is cached for 5 minutes
- Drift checks are debounced to prevent spam
- Learning patterns are indexed for fast lookup
- Version diffs are generated on-demand

## Testing

```bash
# Unit tests
npm test -- machine-data/context-verification/

# Integration tests
npm run test:integration -- context-verification
```

## Contributing

When adding new features:
1. Update relevant component
2. Add tests
3. Update documentation
4. Consider hook integration
5. Update dashboard if needed

## Related Documentation

- User Guide: `aaa-documents/context-verification-system-guide.md`
- Quick Reference: `aaa-documents/context-verification-quick-reference.md`
- Community Learning: `community-learnings/context-drift-prevention.md`