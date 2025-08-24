# Context Verification Examples & Scenarios

## Real-World Examples

### Example 1: The BankRolls.com Incident

**Original Intent**: Casino affiliate website for gambling enthusiasts
**What Actually Happened**: Became a bookkeeping/accounting platform

**How Context Verification Would Have Prevented This:**

#### 1. Project Truth Document
```markdown
# PROJECT TRUTH: BankRolls.com

## WHAT WE'RE BUILDING
A casino affiliate platform that reviews online casinos and provides bonus codes for gamblers.

## INDUSTRY/DOMAIN
Online gambling / Casino affiliate marketing

## TARGET USERS
- Primary: Online gambling enthusiasts aged 21-45
- Secondary: First-time online casino players

## NOT THIS
This project is NOT:
- ❌ A bookkeeping or accounting system
- ❌ A financial management tool
- ❌ A business expense tracker
- ❌ An invoice generation platform
- ❌ A tax preparation service

## COMPETITORS
- Casino.org - Casino reviews and guides
- AskGamblers.com - Player reviews and complaints
- ThePogg.com - Casino blacklist and reviews

## DOMAIN TERMS
- **RTP**: Return to Player percentage
- **Wagering Requirements**: Playthrough before withdrawal
- **No Deposit Bonus**: Free money without deposit
- **Comp Points**: Casino loyalty rewards
```

#### 2. Violation Detection Examples

**Blocked Feature Request #1**:
```javascript
{
  title: "Add invoice generation for affiliate payments",
  description: "Allow affiliates to create invoices",
  
  // Verification Result:
  status: "blocked",
  confidence: 98,
  message: "Domain mismatch: 'invoice generation' explicitly violates NOT THIS list",
  recommendation: "This feature belongs to a financial management system, not a casino affiliate platform"
}
```

**Blocked Feature Request #2**:
```javascript
{
  title: "Implement double-entry bookkeeping",
  description: "Track debits and credits for transactions",
  
  // Verification Result:
  status: "blocked",
  confidence: 95,
  message: "Domain mismatch: 'bookkeeping' is explicitly NOT THIS",
  recommendation: "Consider a separate accounting module if needed for internal use"
}
```

**Warning Example**:
```javascript
{
  title: "Add expense tracking for gambling sessions",
  description: "Help users track their gambling expenses",
  
  // Verification Result:
  status: "warning",
  confidence: 75,
  message: "Potential drift: Focus shifting from casino reviews to personal finance",
  recommendation: "Reframe as 'bankroll management tips' to align with gambling domain"
}
```

### Example 2: E-Commerce Platform Drift

**Original Intent**: B2B wholesale marketplace
**Drift Risk**: Adding B2C features

#### Project Truth Setup
```markdown
## WHAT WE'RE BUILDING
A B2B wholesale marketplace connecting manufacturers with retailers for bulk orders.

## NOT THIS
- ❌ Direct-to-consumer sales
- ❌ Individual product purchases
- ❌ Social shopping features
- ❌ Influencer integrations
```

#### Violation Examples

**Blocked**:
```javascript
{
  title: "Add Instagram shopping integration",
  confidence: 96,
  message: "User misalignment: Instagram shopping is B2C, not B2B wholesale"
}
```

**Review Required**:
```javascript
{
  title: "Implement customer reviews",
  confidence: 82,
  message: "Ambiguous: Reviews could be B2B (retailers reviewing suppliers) or B2C"
}
```

### Example 3: Healthcare App Drift

**Original Intent**: Telemedicine for primary care
**Drift Risk**: Becoming a fitness tracker

#### Violation Pattern Detection
```javascript
// Pattern: Feature Creep into Fitness
violations: [
  "Add step counter",
  "Track workout routines",
  "Calorie counting feature",
  "Integration with fitness wearables"
]

// Learning System Response:
pattern: {
  type: "domain-expansion",
  from: "telemedicine",
  to: "fitness-tracking",
  confidence: 88,
  recommendation: "Create separate fitness app or clearly scope fitness features as 'prescribed exercise tracking' for medical purposes"
}
```

## Test Scenarios

### Scenario 1: New Sprint Planning

**Setup**: Sprint for "Payment Processing" features

**Test Cases**:

1. **Valid Task - Passes**
   ```
   Task: "Integrate Stripe for subscription payments"
   Project: SaaS platform
   Result: ✅ Allowed (confidence: 15%)
   ```

2. **Invalid Task - Blocked**
   ```
   Task: "Add cryptocurrency mining rewards"
   Project: E-learning platform
   Result: ❌ Blocked (confidence: 92%)
   Reason: Domain mismatch - cryptocurrency mining not related to education
   ```

3. **Ambiguous Task - Review**
   ```
   Task: "Implement blockchain certificates"
   Project: E-learning platform
   Result: 🔍 Review Required (confidence: 78%)
   Reason: Blockchain could be for secure certificates (valid) or crypto features (invalid)
   ```

### Scenario 2: Continuous Drift Monitoring

**Project**: Food Delivery App
**Timeline**: 3-month simulation

**Month 1**: Baseline
- Drift: 5% (healthy)
- Focus: Restaurant partnerships, delivery logistics

**Month 2**: Warning Signs
- Drift: 35% (moderate)
- New features: Recipe sharing, cooking tutorials
- Alert: "Drifting from food delivery to cooking education"

**Month 3**: Critical Drift
- Drift: 75% (major)
- New features: Grocery shopping, meal planning
- Action: Emergency stakeholder meeting required

### Scenario 3: Learning System Evolution

**Initial State**: No patterns detected

**After 10 Violations**:
```javascript
learnedPatterns: {
  "admin-feature-creep": {
    occurrences: 8,
    description: "Tendency to add admin features in consumer app",
    prevention: "Implement strict user role validation"
  },
  "payment-complexity": {
    occurrences: 5,
    description: "Payment features expanding beyond simple transactions",
    prevention: "Define payment scope boundaries upfront"
  }
}
```

**Improved Detection**: Future violations caught at 85%+ confidence

## Command Examples

### Creating Project Truth
```bash
$ /verify-context --create-truth

📋 Project Truth Document Creation

Project name: FitTracker Pro
In one sentence, what is this product? A mobile app for personal trainers to manage client workouts
What industry/domain is this in? Fitness / Personal Training
Who are the primary target users? Certified personal trainers
Who are the secondary target users? (optional) Gym owners

❌ What this project is NOT (helps prevent drift):
This is NOT: A general fitness app for consumers
This is NOT: A gym management system
This is NOT: A nutrition tracking app
This is NOT: A social fitness platform
This is NOT: [empty line to finish]

🏢 Competitor products (3-5 recommended):
Competitor: Trainerize - Client workout and nutrition tracking
Competitor: TrueCoach - Personal training software
Competitor: MyFitnessPal - [user corrects] "No, that's for consumers"
Competitor: PTminder - Business management for trainers
Competitor: [empty line to finish]

✅ Project truth created successfully!
```

### Checking Drift
```bash
$ /verify-context --check-drift

🔍 Checking for Context Drift...

📊 Context Alignment Summary:
   Total Items: 47
   ✅ Aligned: 38 (81%)
   ⚠️  Warnings: 5
   🔍 Need Review: 3
   ❌ Violations: 1
   📈 Purity Score: 81%

⚠️ Items Requiring Attention:

❌ Create social feed for workout sharing
   Status: blocked (95% confidence)
   Reason: Violates "NOT a social fitness platform"
   Action: Remove or revise to focus on trainer-client sharing only

🔍 Add nutrition macro tracking
   Status: review (82% confidence)  
   Reason: Close to "NOT a nutrition tracking app"
   Action: Clarify if this is basic guidance or full tracking

⚠️ Integrate with Apple Health
   Status: warning (68% confidence)
   Reason: May shift focus to consumer features
   Action: Ensure integration serves trainers, not end consumers
```

### Monitoring Dashboard Output
```
┌─────────────────────────────────────┐
│ 🎯 Context Verification             │
├─────────────────────────────────────┤
│ ✅ 15%  ████░░░░░░░░░░░░░         │
│ Minor drift detected                │
│                                     │
│ Monitoring: Active                  │
│                                     │
│ Recent Issues:                      │
│ ⚠️ Payment feature expanding        │
│ ⚠️ User roles becoming unclear     │
│                                     │
│ Last check: 5 min ago              │
│ Full Dashboard →                    │
└─────────────────────────────────────┘
```

### Audit Report Summary
```bash
$ /verify-context --export

📊 Generating Comprehensive Context Verification Report...

Include all sections in the report? n
Include backlog analysis? y
Include sprint analysis? y
Include document analysis? n
Include decision analysis? y
Include version history? y
Include learning insights? y
Include recommendations? y

🔍 Analyzing project context...

✅ Audit report generated successfully!

📁 Report locations:
   JSON: .../context-audits/audit-2025-01-30.json
   Markdown: .../context-audits/audit-2025-01-30.md
   HTML: .../context-audits/audit-2025-01-30.html

📊 Summary:
   Overall Score: 76% (Good)
   Issues Found: 12
   Critical Findings: 2

⚠️ Critical Findings:
   - Backlog Alignment: 5 items violate project context
   - Sprint Context Alignment: Sprint blocked due to violations

View the full report at: .../context-audits/audit-2025-01-30.html
```

## Prevention Success Stories

### Story 1: Caught Early
**Project**: LegalDoc AI
**Attempted Feature**: "Add medical document templates"
**Result**: Blocked immediately
**Outcome**: Stayed focused on legal documents, avoided 3-month detour

### Story 2: Learning Applied
**Project**: RestaurantPOS
**Pattern Detected**: "delivery-feature-creep" (from 3 previous projects)
**Prevention**: Auto-flagged all delivery-related features
**Outcome**: Maintained focus on in-restaurant operations

### Story 3: Stakeholder Alignment
**Project**: StudyBuddy
**Drift Detected**: 45% drift toward social networking
**Action**: Emergency stakeholder review
**Resolution**: Created separate "StudyBuddy Social" project
**Outcome**: Both products succeeded with clear boundaries

## Integration Patterns

### With Git Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check commit message for context alignment
commit_msg=$(cat "$1")
drift_check=$(/verify-context --check-commit "$commit_msg")

if [[ $drift_check == *"blocked"* ]]; then
  echo "❌ Commit blocked: Message indicates context drift"
  echo "$drift_check"
  exit 1
fi
```

### With CI/CD Pipeline
```yaml
# .github/workflows/context-check.yml
name: Context Verification
on: [pull_request]

jobs:
  verify-context:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check PR for context drift
        run: |
          npm run verify-context -- --check-pr ${{ github.event.pull_request.number }}
      - name: Comment on PR if drift detected
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.issues.createComment({
              issue_number: context.issue.number,
              body: '❌ Context drift detected! Please review violations.'
            })
```

### With Story Estimation
```javascript
// During backlog grooming
async function estimateStory(story) {
  const verification = await verifyContext(story);
  
  if (verification.status === 'blocked') {
    return {
      points: null,
      blocked: true,
      reason: verification.message
    };
  }
  
  // Add confidence penalty to estimation
  const basePoints = calculateBasePoints(story);
  const confidencePenalty = Math.floor(verification.confidence / 20);
  
  return {
    points: basePoints + confidencePenalty,
    warning: verification.status === 'warning' ? verification.message : null
  };
}
```

## Metrics and KPIs

### Success Metrics
1. **Drift Prevention Rate**: 94% of drift caught before implementation
2. **False Positive Rate**: <5% of legitimate features flagged
3. **Learning Effectiveness**: 78% improvement in detection after 30 days
4. **Time Saved**: Average 2.5 weeks per project avoiding wrong features

### Health Indicators
- **Green (Healthy)**: <20% drift, <5 violations/sprint
- **Yellow (Caution)**: 20-40% drift, 5-10 violations/sprint  
- **Red (Critical)**: >40% drift, >10 violations/sprint

### ROI Calculation
```
Prevented Feature Cost = Developer Hours × Hourly Rate × Prevented Features
ROI = (Prevented Feature Cost - Context System Time) / Context System Time

Example:
- Prevented: 3 features × 80 hours × $150/hr = $36,000
- System Time: 10 hours × $150/hr = $1,500
- ROI = ($36,000 - $1,500) / $1,500 = 2,300%
```

## Summary

These examples demonstrate how the Context Verification System prevents real-world project drift through:

1. **Clear Boundaries**: Explicit NOT THIS definitions
2. **Continuous Monitoring**: Catching drift early
3. **Intelligent Learning**: Improving detection over time
4. **Stakeholder Alignment**: Keeping everyone on the same page
5. **Measurable Impact**: Quantifiable time and cost savings

The system transforms context verification from a manual, often-skipped process into an automated, intelligent guardian of project vision.