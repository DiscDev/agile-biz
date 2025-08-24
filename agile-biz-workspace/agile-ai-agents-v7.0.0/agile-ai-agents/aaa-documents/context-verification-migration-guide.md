# Context Verification Migration Guide

## Overview

This guide helps you integrate the Context Verification System into existing projects that are already using AgileAiAgents.

## Migration Paths

### Path 1: Full Migration (Recommended)
Complete integration with historical analysis and learning

**Timeline**: 2-4 hours
**Disruption**: Minimal
**Benefits**: Maximum protection and insights

### Path 2: Gradual Migration
Phase-based approach for active projects

**Timeline**: 1-2 weeks
**Disruption**: None
**Benefits**: Smooth transition, team adaptation

### Path 3: Minimal Migration
Basic context verification only

**Timeline**: 30 minutes
**Disruption**: None
**Benefits**: Immediate drift protection

## Pre-Migration Checklist

- [ ] Current project phase documented
- [ ] Active sprint identified
- [ ] Backlog accessible
- [ ] Stakeholder availability confirmed
- [ ] 2-4 hours allocated for full migration
- [ ] Team notified of changes

## Step-by-Step Migration

### Step 1: Analyze Current State

```bash
# 1. Check project status
/aaa-status

# 2. Document current context understanding
/checkpoint "Pre-context-verification migration checkpoint"

# 3. Export current backlog state (backup)
cp project-documents/orchestration/product-backlog/backlog-state.json \
   project-documents/orchestration/product-backlog/backlog-state-pre-migration.json
```

### Step 2: Create Project Truth

#### Option A: Interactive Creation
```bash
/verify-context --create-truth

# Answer questions based on:
# - Original project brief
# - Stakeholder interviews
# - Current implementation
# - Team understanding
```

#### Option B: Import from Existing Documentation
```bash
# If you have existing PRD or project brief
/verify-context --create-truth --import-from project-documents/requirements/prd-document.md
```

#### Example for Existing E-commerce Project:
```
Project name: ShopFlow Pro
What is this product? A B2B e-commerce platform for wholesale electronics distributors
Industry/domain: B2B E-commerce / Electronics wholesale
Primary users: Electronics distributors with 50-500 SKUs
Secondary users: Their business customers (retailers)

NOT THIS:
- Consumer electronics store
- Marketplace for individual sellers
- Dropshipping platform
- Electronic repair service platform
- General inventory management

Competitors:
- Alibaba B2B - Global wholesale platform
- ThomasNet - Industrial supplier network
- Wholesale Central - B2B directory
```

### Step 3: Baseline Verification

```bash
# 1. Run initial backlog audit
/verify-context --audit-backlog

# 2. Save baseline report
/verify-context --export

# 3. Review violations with team
# Expected: 10-30% initial violations for projects >3 months old
```

#### Handling Initial Violations

**High Confidence Violations (>90%)**
```bash
# Option 1: Remove if truly out of scope
/remove-backlog-item [item-id]

# Option 2: Revise if misunderstood
/edit-backlog-item [item-id] --align-with-context

# Option 3: Update truth if scope legitimately changed
/verify-context --create-truth --reason "Approved scope expansion"
```

**Medium Confidence (60-90%)**
```bash
# Schedule team review
/create-meeting "Context Alignment Review" --attendees "PO, SM, Tech Lead"

# Document decisions
/save-decision "Kept [item] because [reason]" "Aligns with future roadmap"
```

### Step 4: Configure Monitoring

```bash
# 1. Start drift monitoring
/verify-context --monitor-drift start

# 2. Configure thresholds (optional)
# Edit CLAUDE.md or use:
/configure-context-verification --drift-threshold-major 50

# 3. Enable hooks
/enable-hook pre-sprint-verification
/enable-hook backlog-item-validator
```

### Step 5: Sprint Integration

#### For Active Sprint
```bash
# 1. Verify current sprint
/verify-context --verify-sprint current

# 2. Handle any blockers
# If blocked, either:
# a) Revise tasks
# b) Get stakeholder approval
# c) Update project truth

# 3. Continue sprint with verification active
```

#### For Next Sprint
```bash
# During sprint planning:
1. Run verification before finalizing
2. Address all blockers
3. Document any approved exceptions
```

### Step 6: Team Training

#### Quick Team Briefing (15 minutes)
```markdown
## Context Verification System

**What's New:**
- Automated checking that features align with project goals
- Warnings when items might cause drift
- Protection against scope creep

**What You Need to Do:**
1. Nothing changes in daily work
2. If item is blocked, review the reason
3. Either revise item or escalate if you disagree

**Benefits:**
- Fewer pivot surprises
- Clearer project direction
- Less wasted effort
```

#### Documentation to Share
- Quick Reference: `aaa-documents/context-verification-quick-reference.md`
- Examples: `aaa-documents/context-verification-examples.md`

### Step 7: Historical Learning (Optional)

```bash
# Import historical patterns
/verify-context --import-violations

# Review past pivots or scope changes
/analyze-project-history --detect-patterns

# This helps the system learn from your project's history
```

## Migration Scenarios

### Scenario 1: Mid-Sprint Migration

**Situation**: Sprint 5 is active with 3 days remaining

**Approach**:
1. Create project truth (30 min)
2. Verify remaining sprint tasks only
3. Full backlog audit after sprint
4. Enable monitoring immediately

```bash
# Quick migration
/verify-context --create-truth
/verify-context --verify-sprint current --remaining-only
/verify-context --monitor-drift start
# Full audit after sprint completes
```

### Scenario 2: Large Backlog (100+ items)

**Situation**: 6-month old project with 150 backlog items

**Approach**:
1. Create truth collaboratively (1 hour)
2. Batch verify by epic/category
3. Focus on upcoming sprint items first
4. Background verify remainder

```bash
# Prioritized verification
/verify-context --create-truth
/verify-context --verify-epic "Payment Processing" # Next sprint
/verify-context --verify-epic "User Management"   # Sprint after
/verify-context --audit-backlog --background     # Everything else
```

### Scenario 3: Post-Pivot Project

**Situation**: Project pivoted 2 months ago, old items still in backlog

**Approach**:
1. Create truth reflecting NEW direction
2. Bulk review old items
3. Archive or remove outdated items
4. Clean slate going forward

```bash
# Pivot-aware migration
/verify-context --create-truth --post-pivot
/mark-pre-pivot-items --before "2024-11-30"
/verify-context --audit-backlog --exclude-marked
/archive-marked-items --reason "Pre-pivot scope"
```

## Common Migration Issues

### Issue 1: "Too Many False Positives"

**Symptoms**: 50%+ items flagged, team frustration

**Solutions**:
```bash
# 1. Refine project truth
/verify-context --create-truth --refine

# 2. Add more domain terms
/add-domain-terms

# 3. Expand NOT THIS with examples
/update-not-this --add-examples

# 4. Lower confidence thresholds temporarily
/configure-context-verification --warning-threshold 70
```

### Issue 2: "Truth Doesn't Match Reality"

**Symptoms**: Project evolved but truth outdated

**Solutions**:
```bash
# 1. Version the truth with changes
/verify-context --update-truth --version "2.0"

# 2. Document the evolution
/document-scope-change "Added B2C after Series A funding"

# 3. Keep old truth for reference
/verify-context --archive-truth "Original B2B only scope"
```

### Issue 3: "Team Resistance"

**Symptoms**: Developers bypassing checks, complaints

**Solutions**:
1. **Education**: Show prevented issues from examples
2. **Adjustment**: Start with warnings only
3. **Collaboration**: Let team refine truth document
4. **Metrics**: Show time saved after 1 month

```bash
# Gentle introduction
/configure-context-verification --mode "warning-only"
/schedule-review --after "2 weeks" --topic "Adjust thresholds"
```

## Progressive Enhancement

### Week 1: Basic Protection
- Project truth created
- Monitoring active
- Team aware

### Week 2: Active Verification  
- Sprint verification required
- Backlog items checked
- First patterns detected

### Week 3: Learning Active
- System learns from decisions
- Fewer false positives
- Team trusts system

### Week 4: Full Integration
- Pre-commit hooks added
- CI/CD integration
- Metrics dashboard active

## Rollback Plan

If migration causes issues:

```bash
# 1. Disable active blocking
/configure-context-verification --mode "monitor-only"

# 2. Keep monitoring for insights
/verify-context --monitor-drift continue

# 3. Address issues
/generate-migration-report

# 4. Re-enable gradually
/configure-context-verification --enable-feature "sprint-verification"
```

## Success Metrics

### Week 1 Targets
- ✅ Project truth created
- ✅ <30% initial violations
- ✅ Monitoring active
- ✅ No sprint disruption

### Month 1 Targets  
- ✅ Drift maintained <20%
- ✅ 90% team compliance
- ✅ 5+ patterns learned
- ✅ 1+ prevented drift incident

### Month 3 Targets
- ✅ Drift consistently <15%
- ✅ Automated workflows
- ✅ Measurable time savings
- ✅ Team advocates for system

## Quick Migration Commands

```bash
# Fastest migration (30 minutes)
/verify-context --create-truth
/verify-context --monitor-drift start
/enable-hook backlog-item-validator

# Standard migration (2 hours)
/verify-context --create-truth
/verify-context --audit-backlog
/verify-context --verify-sprint current
/verify-context --monitor-drift start
/enable-all-context-hooks

# Comprehensive migration (4 hours)
/verify-context --create-truth --collaborative
/verify-context --import-history
/verify-context --audit-backlog --detailed
/verify-context --analyze-patterns
/verify-context --configure-thresholds
/verify-context --monitor-drift start
/enable-all-context-hooks
/configure-ci-cd-integration
```

## Post-Migration Checklist

- [ ] Project truth documented and approved
- [ ] Initial audit completed
- [ ] Violations addressed or documented  
- [ ] Monitoring active
- [ ] Team briefed
- [ ] Hooks enabled
- [ ] First sprint verified
- [ ] Dashboard bookmarked
- [ ] Success metrics defined
- [ ] Review scheduled for 2 weeks

## Getting Help

### Resources
- Full Guide: `aaa-documents/context-verification-system-guide.md`
- Quick Reference: `aaa-documents/context-verification-quick-reference.md`
- Examples: `aaa-documents/context-verification-examples.md`

### Support Channels
- Dashboard: Check widget for current status
- Logs: `project-documents/orchestration/context-verification-logs/`
- Community: Share patterns in `community-learnings/`

### Emergency Contacts
If critical issues during migration:
1. Disable blocking: `/configure-context-verification --emergency-disable`
2. Document issue: `/report-context-issue`
3. Create checkpoint: `/checkpoint "Context verification issue"`

## Summary

Migrating to Context Verification is straightforward and can be done without disrupting active development. Start with basic protection and progressively enhance based on team comfort and project needs. Most teams see positive ROI within 2 weeks through prevented drift and clearer project direction.