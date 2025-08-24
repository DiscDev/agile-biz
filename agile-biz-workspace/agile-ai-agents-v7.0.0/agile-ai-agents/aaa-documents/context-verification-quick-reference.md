# Context Verification System - Quick Reference

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Create project truth document
/verify-context --create-truth

# 2. Start drift monitoring
/verify-context --monitor-drift start

# 3. Check current status
/verify-context --drift-status
```

## 📋 Essential Commands

| Command | Purpose |
|---------|---------|
| `/verify-context` | Show current context status |
| `/verify-context --create-truth` | Create/update project truth |
| `/verify-context --show-truth` | Display project truth |
| `/verify-context --check-drift` | Manual drift check |
| `/verify-context --audit-backlog` | Full backlog audit |
| `/verify-context --export` | Generate audit report |

## 🎯 Key Concepts

### Project Truth Document
The single source of truth containing:
- ✅ What we're building (one sentence)
- 🏭 Industry/domain
- 👥 Target users
- ❌ NOT THIS list (critical!)
- 🏢 Competitors
- 📚 Domain terms

### Confidence Thresholds
- **95%+** → 🚫 Auto-blocked
- **80-94%** → 🔍 Review required
- **60-79%** → ⚠️ Warning
- **<60%** → ✅ Allowed

### Drift Severity
- **0-20%** → 🟢 None/Minor
- **20-40%** → 🟡 Moderate
- **40-60%** → 🟠 Major
- **60-80%** → 🔴 Critical
- **80-100%** → ⚫ Severe

## 🔄 Workflow Integration Points

### 1. Project Start
```
Phase 1 Discovery → Section 0: Critical Context Questions
- What is this product?
- What is it NOT?
- Who uses it?
```

### 2. Sprint Planning
```
Pre-Sprint Hook → Verify all tasks
- Blocks if violations detected
- PM/SM notified
- Must resolve before proceeding
```

### 3. Backlog Creation
```
New Item → Auto-verification
- High confidence = auto-block
- Creates violation report
- Learns from patterns
```

### 4. Continuous Monitoring
```
Every 60 minutes → Drift check
- Backlog, documents, decisions
- Trend analysis
- Auto-escalation if critical
```

## 📊 Dashboard Widget

**Location**: Project dashboard (http://localhost:3001)

**Shows**:
- Current drift percentage
- Monitoring status
- Recent violations
- Recommendations

**Actions**:
- 🔍 Check Now - Manual drift check
- ▼ Details - Expand/collapse view
- → Full Dashboard - Complete analysis

## 🚨 Common Violations

### Domain Mismatch
**Example**: "invoice" in a gaming platform
**Fix**: Use correct domain terms

### User Misalignment
**Example**: Admin features for consumer app
**Fix**: Focus on primary users

### NOT THIS Violations
**Example**: Building explicitly excluded features
**Fix**: Review and remove

### Feature Creep
**Example**: Expanding beyond original scope
**Fix**: Validate against project truth

## 📈 Best Practices

### Daily
- ✅ Check dashboard widget
- ✅ Review any new violations
- ✅ Address warnings promptly

### Sprint Start
- ✅ Run `/verify-context --verify-sprint`
- ✅ Resolve all blockers
- ✅ Update project truth if needed

### Monthly
- ✅ Generate audit report
- ✅ Review learning insights
- ✅ Update prevention strategies

## 🛠️ Troubleshooting

### "No project truth found"
```bash
/verify-context --create-truth
```

### "High drift but seems wrong"
1. Review project truth accuracy
2. Check for approved scope changes
3. Update truth with versioning

### "Monitoring not active"
```bash
/verify-context --monitor-drift start
```

### "Too many false positives"
1. Add more NOT THIS examples
2. Define more domain terms
3. Clarify target users

## 📝 Report Types

### Quick Status
```bash
/verify-context
```

### Detailed Analysis
```bash
/verify-context --check-drift
```

### Full Audit Report
```bash
/verify-context --export
# Generates: JSON, Markdown, HTML
```

## 🎓 Learning System

The system learns from:
- ✅ Detected violations
- ✅ Resolution patterns
- ✅ Team decisions
- ✅ Historical data

Access insights:
```bash
/verify-context --learning-insights
```

## 🔗 Related Documentation

- **Full Guide**: `aaa-documents/context-verification-system-guide.md`
- **Architecture**: `machine-data/context-verification/README.md`
- **Community Learning**: `community-learnings/context-drift-prevention.md`

---

**Remember**: Context verification is not about restricting creativity—it's about ensuring everyone is building toward the same vision. When in doubt, verify!