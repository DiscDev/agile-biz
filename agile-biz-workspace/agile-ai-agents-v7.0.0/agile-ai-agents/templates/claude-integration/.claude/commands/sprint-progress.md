---
allowed-tools: [Task]
argument-hint: Sprint number or progress reporting type
---

# Sprint Progress

Track and report development sprint progress, including velocity, burndown, blockers, and team performance metrics.

## Usage

```
/sprint-progress [sprint-identifier]
```

**Examples:**
- `/sprint-progress current` - Current sprint progress report
- `/sprint-progress sprint-3` - Progress for specific sprint
- `/sprint-progress weekly` - Weekly progress summary
- `/sprint-progress daily` - Daily standup preparation

## What This Does

1. **Progress Tracking**: Monitors story completion and sprint burndown
2. **Velocity Analysis**: Tracks team velocity and capacity utilization
3. **Blocker Management**: Identifies and tracks impediments
4. **Quality Metrics**: Reports on code quality and testing progress
5. **Team Performance**: Analyzes team collaboration and productivity

## Sprint Progress Dashboard

### Current Sprint Overview
```markdown
## Sprint Progress Report

**Sprint**: [Sprint Name/Number]
**Sprint Goal**: [Primary sprint objective]
**Sprint Duration**: [Start Date] to [End Date]
**Days Remaining**: [Number] days
**Progress**: [Percentage]% complete

### Sprint Metrics Summary
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Story Points Committed | [Points] | - | - |
| Story Points Completed | - | [Points] | [On Track/Behind/Ahead] |
| Stories Committed | [Count] | - | - |
| Stories Completed | - | [Count] | [Percentage]% |
| Velocity | [Target Points] | [Projected Points] | [On Track/Behind/Ahead] |
| Team Capacity | [Hours] | [Used Hours] | [Percentage]% utilized |

### Sprint Burndown
```
Story Points Remaining:
Day 1:  ████████████████████  [Points]
Day 2:  ██████████████████▒▒  [Points]  
Day 3:  ████████████████▒▒▒▒  [Points]
Day 4:  ██████████████▒▒▒▒▒▒  [Points]
Day 5:  ████████████▒▒▒▒▒▒▒▒  [Points]
...
Target: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  0 Points
```

### Sprint Goal Progress
**Primary Goal**: [Sprint goal description]
- Status: [On Track/At Risk/Behind]
- Completion: [Percentage]%
- Key Deliverables:
  - [Deliverable 1]: [Status]
  - [Deliverable 2]: [Status]
  - [Deliverable 3]: [Status]

**Secondary Goals**:
- [Goal 1]: [Status and progress]
- [Goal 2]: [Status and progress]
```

## Story-Level Progress Tracking

### Story Status Breakdown
```markdown
## Story Progress Details

### Completed Stories ✅
1. **[Story Title]** - [Story Points] pts
   - Acceptance Criteria: All met
   - Testing: Complete
   - Code Review: Approved
   - Demo Ready: Yes

2. **[Story Title]** - [Story Points] pts
   - Acceptance Criteria: All met
   - Testing: Complete  
   - Code Review: Approved
   - Demo Ready: Yes

### In Progress Stories 🟡
1. **[Story Title]** - [Story Points] pts
   - Progress: [Percentage]% complete
   - Developer: [Name]
   - Estimated Completion: [Date]
   - Blockers: [Any blockers]

2. **[Story Title]** - [Story Points] pts
   - Progress: [Percentage]% complete
   - Developer: [Name]
   - Estimated Completion: [Date]
   - Status: Waiting for review

### Blocked Stories 🔴
1. **[Story Title]** - [Story Points] pts
   - Blocker: [Description of impediment]
   - Impact: [Effect on sprint]
   - Resolution Plan: [How being addressed]
   - ETA: [Expected resolution date]

### Not Started Stories ⚪
1. **[Story Title]** - [Story Points] pts
   - Reason: [Why not started]
   - Dependencies: [Prerequisites]
   - Planned Start: [Date]
```

### Individual Developer Progress
```markdown
## Team Member Progress

### [Developer Name]
- **Current Workload**: [Story Points] in progress
- **Completed This Sprint**: [Story Points]
- **Capacity Utilization**: [Percentage]%
- **Current Stories**:
  - [Story Name]: [Status]
  - [Story Name]: [Status]

### [Developer Name]  
- **Current Workload**: [Story Points] in progress
- **Completed This Sprint**: [Story Points]
- **Capacity Utilization**: [Percentage]%
- **Current Stories**:
  - [Story Name]: [Status]
  - [Story Name]: [Status]
```

## Velocity and Performance Analysis

### Sprint Velocity Tracking
```markdown
## Velocity Analysis

### Historical Velocity
| Sprint | Committed | Completed | Velocity | Capacity |
|--------|-----------|-----------|----------|----------|
| Sprint 1 | [Points] | [Points] | [Points] | [Hours] |
| Sprint 2 | [Points] | [Points] | [Points] | [Hours] |
| Sprint 3 | [Points] | [Points] | [Points] | [Hours] |
| Current | [Points] | [Points] | [Projected] | [Hours] |

### Velocity Trends
- **Average Velocity**: [Points] over last 3 sprints
- **Velocity Trend**: [Increasing/Stable/Decreasing]
- **Predictability**: [Variance] in velocity (±[Points])
- **Capacity Utilization**: [Average Percentage]%

### Sprint Commitment Accuracy
- **Over-commitment Rate**: [Percentage]% of sprints
- **Under-commitment Rate**: [Percentage]% of sprints  
- **Commitment Accuracy**: [Percentage]% within ±10%
- **Planning Confidence**: [High/Medium/Low]
```

### Performance Indicators
```markdown
## Sprint Performance Metrics

### Delivery Performance  
- **Story Completion Rate**: [Percentage]% of committed stories
- **Story Points Completion**: [Percentage]% of committed points
- **Sprint Goal Achievement**: [On Track/At Risk/Missed]
- **Carryover Rate**: [Percentage]% of stories carried to next sprint

### Quality Indicators
- **Code Review Cycle Time**: [Average hours] from PR to merge
- **Bug Discovery Rate**: [Number] bugs found during sprint
- **Test Coverage**: [Percentage]% code coverage
- **Technical Debt Added**: [Hours] of technical debt work needed

### Collaboration Metrics
- **Daily Standup Participation**: [Percentage]% attendance
- **Code Review Participation**: [Number] reviews per developer
- **Knowledge Sharing Events**: [Number] this sprint
- **Cross-team Collaboration**: [Number] interactions
```

## Blocker and Risk Management

### Current Blockers
```markdown
## Sprint Blockers and Impediments

### Active Blockers
1. **Blocker Type**: [Technical/Resource/External]
   - **Description**: [Detailed blocker description]
   - **Impact**: [Stories affected, points at risk]
   - **Duration**: Blocked for [Time period]
   - **Owner**: [Person responsible for resolution]
   - **Resolution Plan**: [Specific steps being taken]
   - **ETA**: [Expected resolution date]
   - **Escalation**: [If escalated, to whom and when]

2. **Blocker Type**: [Technical/Resource/External]
   - **Description**: [Detailed blocker description]
   - **Impact**: [Effect on sprint goals]
   - **Mitigation**: [Workaround or alternative approach]
   - **Status**: [Resolution progress]

### Recently Resolved Blockers
1. **[Blocker Description]**
   - Duration: [Time blocked]
   - Resolution: [How resolved]
   - Lessons Learned: [Prevention for future]

### Risk Assessment
| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|---------|
| [Risk Description] | High/Med/Low | High/Med/Low | [Plan] | [Status] |
| [Risk Description] | High/Med/Low | High/Med/Low | [Plan] | [Status] |
```

## Sprint Health Indicators

### Team Health Assessment
```markdown
## Sprint Health Dashboard

### Team Morale and Satisfaction
- **Team Mood**: [Scale 1-5] (based on retrospective feedback)
- **Workload Balance**: [Acceptable/Concerning/Critical]
- **Collaboration Quality**: [Excellent/Good/Needs Improvement]
- **Sprint Goal Clarity**: [Clear/Somewhat Clear/Unclear]

### Process Health
- **Ceremony Attendance**: 
  - Daily Standups: [Percentage]% average attendance
  - Sprint Planning: [Percentage]% participation
  - Sprint Review: [Percentage]% participation
  - Retrospective: [Percentage]% participation

### Development Process Health
- **Code Quality Trends**: [Improving/Stable/Declining]
- **Testing Coverage**: [Above/At/Below] target
- **CI/CD Pipeline Health**: [Success rate percentage]%
- **Deployment Frequency**: [Number] deployments this sprint

### Communication Effectiveness
- **Information Sharing**: [Effective/Adequate/Needs Improvement]
- **Decision Making Speed**: [Fast/Adequate/Slow]
- **Conflict Resolution**: [Proactive/Reactive/Problematic]
- **Stakeholder Engagement**: [High/Medium/Low]
```

## Sprint Forecast and Projections

### Completion Projections
```markdown
## Sprint Forecast

### Story Completion Projection
Based on current progress and historical velocity:

**Likely to Complete** (>80% confidence):
- [Story Name] - [Points] pts
- [Story Name] - [Points] pts
**Total**: [Points] story points

**Possible to Complete** (50-80% confidence):
- [Story Name] - [Points] pts
- [Story Name] - [Points] pts  
**Total**: [Points] story points

**Unlikely to Complete** (<50% confidence):
- [Story Name] - [Points] pts - [Reason]
- [Story Name] - [Points] pts - [Reason]
**Total**: [Points] story points

### Sprint Goal Achievement Probability
- **Primary Sprint Goal**: [Percentage]% likely to achieve
- **Secondary Goals**: [Percentage]% likely to achieve
- **Overall Sprint Success**: [Percentage]% based on committed work

### Recommendations
Based on current progress:
1. **Focus Areas**: [What team should prioritize]
2. **Risk Mitigation**: [Actions to take for at-risk items]
3. **Scope Adjustments**: [Potential scope changes needed]
4. **Resource Needs**: [Additional support required]
```

## Daily Standup Support

### Daily Standup Preparation
```markdown
## Daily Standup Summary

**Date**: [Today's Date]
**Sprint Day**: [X] of [Y]
**Yesterday's Achievements**:
- [Points] story points completed
- [Number] stories moved to done
- [Number] blockers resolved

**Today's Focus**:
- [Number] stories in active development
- [Number] stories in review
- [Number] potential blockers to monitor

### Team Standup Talking Points

**Progress Highlights**:
- [Key achievement or milestone]
- [Story completed or significant progress]
- [Blocker resolved or process improvement]

**Concerns to Discuss**:
- [Potential blocker or risk]
- [Resource constraint or dependency]
- [Quality or technical issue]

**Decisions Needed**:
- [Scope or priority question]
- [Technical approach decision]
- [Resource allocation decision]

### Individual Updates Template

**[Developer Name]**:
- Yesterday: [Work completed]
- Today: [Planned work]
- Blockers: [Any impediments]
- Help Needed: [Support required]
```

## Quality and Testing Progress

### Testing Progress
```markdown
## Sprint Testing Status

### Test Coverage Progress
- **Unit Tests**: [Current Coverage]% ([Target]% target)
- **Integration Tests**: [Number] completed, [Number] remaining
- **End-to-End Tests**: [Status] for completed stories
- **Manual Testing**: [Number] stories tested, [Number] pending

### Quality Metrics This Sprint
- **Bugs Found**: [Number] (Target: <[X])
- **Bugs Fixed**: [Number]
- **Code Review Feedback**: [Average items] per review
- **Technical Debt**: [Hours] added, [Hours] reduced

### Testing Blockers and Risks
- **Testing Environment Issues**: [Any problems]
- **Test Data Availability**: [Status]
- **Automation Pipeline**: [Health status]
- **Manual Testing Capacity**: [Availability]
```

## Recommendations and Actions

### Sprint Optimization Recommendations
```markdown
## Sprint Improvement Actions

### Immediate Actions (This Sprint)
1. **[Action Item]**
   - Problem: [Issue description]
   - Solution: [Proposed action]
   - Owner: [Responsible person]
   - Timeline: [When to complete]

2. **[Action Item]**
   - Impact: [Expected benefit]
   - Effort: [Resources required]
   - Priority: [High/Medium/Low]

### Process Improvements (Next Sprint)
1. **[Process Change]**
   - Rationale: [Why needed]
   - Implementation: [How to implement]
   - Success Metrics: [How to measure]

### Long-term Optimizations
1. **[Strategic Improvement]**
   - Benefit: [Expected long-term value]
   - Investment: [Time/resources needed]
   - Timeline: [Implementation schedule]
```

## Follow-up Actions

Sprint progress monitoring:
- `/update-burndown` - Update sprint burndown charts
- `/sprint-planning` - Adjust current or plan next sprint
- `/blocker` - Address specific impediments
- Update sprint dashboard and metrics
- Prepare daily standup summaries
- Communicate progress to stakeholders