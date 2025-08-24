# Context Verification System Guide

## Overview

The Context Verification System is a comprehensive solution designed to prevent project drift and ensure all development activities align with the original project intent. Inspired by real-world incidents where projects dramatically deviated from their intended purpose, this system provides multiple layers of protection against context drift.

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [User Commands](#user-commands)
5. [Workflow Integration](#workflow-integration)
6. [Dashboard Widget](#dashboard-widget)
7. [Audit Reports](#audit-reports)
8. [Configuration](#configuration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Introduction

### Why Context Verification Matters

Projects can drift from their original intent due to:
- **Feature Creep**: Adding features that seem useful but don't align with core purpose
- **Terminology Drift**: Using language from wrong domains (e.g., "invoice" in a gaming platform)
- **Target User Confusion**: Building for the wrong audience
- **Competitive Mimicry**: Copying competitor features without considering fit
- **Scope Expansion**: Growing beyond sustainable boundaries

### The BankRolls.com Incident

The system was inspired by a real incident where a casino affiliate website project (BankRolls.com) drifted into becoming a full bookkeeping platform. Key lessons:
- Early drift indicators were ignored
- No systematic context verification
- Stakeholder intentions weren't clearly documented
- Feature additions weren't validated against project purpose

## System Architecture

### Component Overview

```
Context Verification System
├── Verification Engine (Core)
│   ├── Project Truth Management
│   ├── Confidence Scoring
│   └── Item Verification
├── Drift Detection
│   ├── Continuous Monitoring
│   ├── Multi-Area Checks
│   └── Severity Analysis
├── Violation Learning
│   ├── Pattern Detection
│   ├── Insight Generation
│   └── Prevention Recommendations
├── Truth Versioning
│   ├── Version History
│   ├── Change Tracking
│   └── Rollback Support
├── Drift Resolution
│   ├── Agent Coordination
│   ├── Emergency Response
│   └── Resolution Strategies
└── Audit Reporting
    ├── Comprehensive Analysis
    ├── Multi-Format Export
    └── Actionable Insights
```

### Data Flow

1. **Project Truth Creation**: Establish single source of truth
2. **Continuous Verification**: Check all new items against truth
3. **Drift Detection**: Monitor for gradual context changes
4. **Learning & Adaptation**: Improve detection based on violations
5. **Resolution & Prevention**: Coordinate response and prevent recurrence

## Core Components

### 1. Verification Engine

**Location**: `machine-data/context-verification/verification-engine.js`

The core engine that manages project truth and verifies items:

```javascript
// Key capabilities
- Project truth document management
- Confidence score calculation
- Individual item verification
- Batch verification for backlogs/sprints
- Learning system integration
```

### 2. Confidence Scorer

**Location**: `machine-data/context-verification/confidence-scorer.js`

Calculates violation confidence using weighted scoring:

```
Confidence Score = 
  (Domain Alignment × 0.4) +
  (User Alignment × 0.3) +
  (Competitor Feature × 0.2) +
  (Historical Pattern × 0.1)
```

Thresholds:
- **95%+**: Blocked (automatic)
- **80-94%**: Review required
- **60-79%**: Warning
- **<60%**: Allowed

### 3. Drift Detector

**Location**: `machine-data/context-verification/drift-detector.js`

Monitors project for context drift across multiple areas:

- **Backlog Items**: New user stories and features
- **Documents**: Recently created/modified documents
- **Commits**: Git commit messages
- **Sprint Goals**: Sprint objectives and planning
- **Decisions**: Architectural and product decisions

Severity Levels:
- **None**: 0-20% drift
- **Minor**: 20-40% drift
- **Moderate**: 40-60% drift
- **Major**: 60-80% drift
- **Critical**: 80-100% drift

### 4. Violation Learning System

**Location**: `machine-data/context-verification/violation-learning-system.js`

Learns from violations to improve future detection:

Pattern Types:
- **Domain Mismatch**: Wrong industry terminology
- **User Misalignment**: Wrong target audience
- **Feature Creep**: Scope expansion
- **Not-This Violations**: Explicitly prohibited features
- **Terminology Drift**: Inconsistent language

### 5. Truth Version Manager

**Location**: `machine-data/context-verification/truth-version-manager.js`

Manages project truth evolution:

- Semantic versioning (major.minor.patch)
- Complete change history
- Rollback capabilities
- Diff generation between versions
- Changelog maintenance

### 6. Drift Resolution Coordinator

**Location**: `machine-data/context-verification/drift-resolution-coordinator.js`

Coordinates agent response based on drift severity:

Resolution Strategies:
- **Emergency** (80%+ drift): Block development, emergency meeting
- **Intervention** (60-79%): PM/SM intervention, stakeholder review
- **Collaborative** (40-59%): Team discussion, alignment session
- **Informational** (20-39%): Awareness updates, minor adjustments

## User Commands

### Primary Command: `/verify-context`

```bash
# Create or update project truth
/verify-context --create-truth

# Show current project truth
/verify-context --show-truth

# Check for context drift
/verify-context --check-drift

# Full backlog audit
/verify-context --audit-backlog

# Verify sprint tasks
/verify-context --verify-sprint [sprint-name]

# Start/stop drift monitoring
/verify-context --monitor-drift start|stop|check

# Show drift status
/verify-context --drift-status

# View learning insights
/verify-context --learning-insights

# Generate comprehensive audit report
/verify-context --export
```

### Quick Status

```bash
# Show current context status
/verify-context

# Displays:
# - Project truth summary
# - Current drift level
# - Recent issues
# - Available commands
```

## Workflow Integration

### 1. Project Start (Phase 1)

During stakeholder interviews, Section 0 asks critical context questions:

```
Section 0: What Are We Building? (CRITICAL)

Q1: In one sentence, what is this product?
Q2: What specific industry/domain is this for?
Q3: Who are the primary users?
Q4: List 3-5 things this is explicitly NOT
Q5: Name 3-5 competitor products
```

### 2. Pre-Sprint Verification

Before each sprint starts:

```javascript
// Hook: pre-sprint-verification
- Verifies all sprint tasks
- Blocks sprint if violations detected
- Generates verification report
- Notifies PM/SM of issues
```

### 3. Backlog Item Creation

When new items are added:

```javascript
// Hook: backlog-item-validator
- Real-time verification
- Auto-blocks high-confidence violations
- Creates violation reports
- Triggers learning system
```

### 4. Continuous Monitoring

Throughout development:

```javascript
// Hook: drift-monitor
- Periodic drift checks
- Trend analysis
- Escalation triggers
- Sprint summaries
```

## Dashboard Widget

### Location

- **Widget**: `project-dashboard/public/js/context-verification-widget.js`
- **Styles**: `project-dashboard/public/css/context-verification-widget.css`
- **API**: `project-dashboard/api/context-verification.js`

### Features

1. **Real-time Drift Meter**
   - Visual drift percentage
   - Color-coded severity
   - Monitoring status

2. **Recent Violations**
   - Top 5 context violations
   - Confidence scores
   - Quick actions

3. **Drift Breakdown**
   - Drift by area (backlog, docs, etc.)
   - Visual progress bars
   - Trend indicators

4. **Recommendations**
   - Actionable insights
   - Priority-based
   - Context-aware

### Widget States

- **Setup Required**: No project truth exists
- **Monitoring Active**: Real-time updates
- **Drift Detected**: Shows issues and actions
- **All Clear**: Green status, no issues

## Audit Reports

### Report Generation

```bash
# Generate comprehensive audit
/verify-context --export

# Options:
- Include all sections? (y/n)
- Or select specific sections:
  - Backlog analysis
  - Sprint analysis
  - Document analysis
  - Decision analysis
  - Version history
  - Learning insights
  - Recommendations
```

### Report Formats

1. **JSON** (`audit-YYYY-MM-DD.json`)
   - Complete structured data
   - Programmatic access
   - Integration-friendly

2. **Markdown** (`audit-YYYY-MM-DD.md`)
   - Human-readable
   - Version control friendly
   - Easy to share

3. **HTML** (`audit-YYYY-MM-DD.html`)
   - Visual presentation
   - Interactive elements
   - Executive-friendly

### Report Sections

1. **Executive Summary**
   - Overall score and health status
   - Critical findings
   - Key metrics

2. **Project Truth Analysis**
   - Completeness assessment
   - Missing elements
   - Improvement suggestions

3. **Backlog Alignment**
   - Item-by-item analysis
   - Violation breakdown
   - Top issues

4. **Sprint Context**
   - Sprint-by-sprint review
   - Task alignment
   - Blocking issues

5. **Document Drift**
   - Recent document analysis
   - Content alignment
   - Terminology usage

6. **Decision Alignment**
   - Decision history review
   - Context consistency
   - Drift indicators

7. **Version History**
   - Change frequency
   - Stability analysis
   - Evolution patterns

8. **Learning Insights**
   - Common violation patterns
   - Risk factors
   - Prevention strategies

9. **Recommendations**
   - Priority-based actions
   - Process improvements
   - Tool suggestions

## Configuration

### In CLAUDE.md

```yaml
context_verification:
  # Verification thresholds
  confidence_thresholds:
    block: 95        # Auto-block threshold
    review: 80       # Review required
    warning: 60      # Warning issued
    
  # Drift thresholds
  drift_thresholds:
    minor: 20
    moderate: 40
    major: 60
    critical: 80
    
  # Monitoring settings
  monitoring:
    enabled: true
    interval_minutes: 60
    auto_escalate: true
    
  # Learning settings
  learning:
    enabled: true
    min_confidence: 70
    pattern_threshold: 3
```

### Hook Configuration

```yaml
hooks:
  pre_sprint_verification:
    enabled: true
    config:
      blockOnViolations: true
      confidenceThreshold: 80
      
  backlog_item_validator:
    enabled: true
    config:
      autoBlock: true
      blockThreshold: 95
      
  drift_monitor:
    enabled: true
    config:
      checkInterval: 3600000  # 1 hour
      escalateOnCritical: true
```

## Best Practices

### 1. Project Truth Creation

**DO:**
- Be specific about what you're building
- Define clear "NOT THIS" items
- Include real competitor examples
- Use industry-specific terminology
- Get stakeholder approval

**DON'T:**
- Use vague descriptions
- Skip the "NOT THIS" section
- Assume everyone understands
- Change without versioning
- Ignore early warnings

### 2. Regular Verification

- **Daily**: Monitor dashboard widget
- **Sprint Start**: Run pre-sprint verification
- **Sprint End**: Review drift trends
- **Monthly**: Generate full audit report
- **Quarterly**: Review and update project truth

### 3. Handling Violations

1. **Immediate Action** (95%+ confidence)
   - Item is auto-blocked
   - Review with PM immediately
   - Either revise or remove

2. **Review Required** (80-94%)
   - Schedule review session
   - Clarify alignment
   - Update item or truth

3. **Warnings** (60-79%)
   - Monitor closely
   - Discuss in retrospective
   - Prevent escalation

### 4. Learning Integration

- Review insights monthly
- Implement prevention strategies
- Update "NOT THIS" list based on patterns
- Share learnings with team
- Contribute to community learnings

## Troubleshooting

### Common Issues

#### "No project truth document found"

```bash
# Solution
/verify-context --create-truth
```

#### "High drift detected but seems incorrect"

1. Review project truth for accuracy
2. Check if legitimate scope change occurred
3. Update truth if approved by stakeholders
4. Use versioning to track changes

#### "Too many false positives"

1. Adjust confidence thresholds in config
2. Add more domain terms
3. Clarify target users
4. Expand "NOT THIS" examples

#### "Monitoring not working"

```bash
# Check status
/verify-context --drift-status

# Restart monitoring
/verify-context --monitor-drift stop
/verify-context --monitor-drift start
```

### Debug Mode

Enable verbose logging:

```javascript
// In verification-engine.js
this.debug = true;

// In drift-detector.js
this.verbose = true;
```

### Getting Help

1. Check audit reports for detailed analysis
2. Review learning insights for patterns
3. Consult with PM/SM agents
4. Submit issue to AgileAiAgents repository

## Integration Examples

### With Sprint Planning

```javascript
// In sprint-planning-handler.js
const verification = await verificationEngine.verifySprintTasks(sprintName);

if (!verification.results.canProceed) {
  console.log('❌ Sprint blocked due to context violations');
  // Show violations
  // Get stakeholder approval
  // Revise and retry
}
```

### With Backlog Management

```javascript
// In backlog-handler.js
const newItem = {
  title: "Add invoice generation feature",
  description: "Users can create and send invoices"
};

const check = await verificationEngine.verifyItem(newItem);

if (check.status === 'blocked') {
  console.log(`❌ Violation: ${check.message}`);
  // Item rejected - doesn't align with casino affiliate platform
}
```

### With Document Creation

```javascript
// In document-creator.js
const doc = await createDocument(content);
const drift = await driftDetector.checkDocumentDrift(doc.path);

if (drift > 40) {
  console.log('⚠️ Document may be drifting from project context');
}
```

## Future Enhancements

### Planned Features

1. **AI-Powered Suggestions**
   - Auto-generate "NOT THIS" items
   - Suggest domain terminology
   - Predict drift patterns

2. **Integration Expansion**
   - Git commit hooks
   - PR verification
   - IDE plugins

3. **Advanced Analytics**
   - Drift prediction models
   - Team alignment scoring
   - Success correlation analysis

4. **Automation**
   - Auto-correction suggestions
   - Drift prevention rules
   - Smart escalation

## Summary

The Context Verification System provides comprehensive protection against project drift through:

1. **Clear Context Definition**: Project truth as single source
2. **Continuous Monitoring**: Multi-layer verification
3. **Intelligent Learning**: Pattern detection and prevention
4. **Proactive Resolution**: Agent-coordinated responses
5. **Actionable Insights**: Comprehensive audit reports

By following this guide and integrating context verification throughout your workflow, you can ensure your project stays true to its original vision while adapting appropriately to legitimate changes.