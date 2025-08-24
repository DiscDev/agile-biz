---
allowed-tools: [Task]
argument-hint: Sprint or burndown data to update
---

# Update Burndown

Update sprint burndown charts and velocity tracking with current progress data and projections.

## Usage

```
/update-burndown [sprint-data]
```

**Examples:**
- `/update-burndown current` - Update current sprint burndown
- `/update-burndown sprint-3` - Update specific sprint data
- `/update-burndown daily` - Daily burndown update
- `/update-burndown velocity` - Update velocity calculations

## What This Does

1. **Burndown Tracking**: Updates story point and task hour burndown charts
2. **Velocity Calculation**: Recalculates team velocity based on latest data
3. **Progress Projection**: Updates sprint completion forecasts
4. **Trend Analysis**: Analyzes burndown patterns and team performance
5. **Visual Reporting**: Generates updated burndown charts and graphs

## Burndown Chart Updates

### Story Point Burndown
```markdown
## Sprint Burndown Chart Update

**Sprint**: [Sprint Name/Number]
**Sprint Goal**: [Primary objective]
**Total Story Points**: [Initial commitment]
**Days in Sprint**: [Total sprint days]
**Current Day**: [Current sprint day]

### Daily Story Point Burndown
| Day | Date | Ideal | Actual | Variance | Stories Completed |
|-----|------|-------|---------|----------|-------------------|
| 1 | [Date] | [Points] | [Points] | [±Points] | [Story list] |
| 2 | [Date] | [Points] | [Points] | [±Points] | [Story list] |
| 3 | [Date] | [Points] | [Points] | [±Points] | [Story list] |
| ... | ... | ... | ... | ... | ... |
| [Current] | [Today] | [Points] | [Points] | [±Points] | [Story list] |

### Burndown Chart Visualization
```
Story Points Remaining:

Day 1:  ████████████████████  [X] pts (Ideal: [Y] pts)
Day 2:  ██████████████████▒▒  [X] pts (Ideal: [Y] pts)
Day 3:  ████████████████▒▒▒▒  [X] pts (Ideal: [Y] pts)
Day 4:  ██████████████▒▒▒▒▒▒  [X] pts (Ideal: [Y] pts)
Day 5:  ████████████▒▒▒▒▒▒▒▒  [X] pts (Ideal: [Y] pts)
...
Today:  ████████▒▒▒▒▒▒▒▒▒▒▒▒  [X] pts (Ideal: [Y] pts)
Target: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  0 pts

Legend: ████ Actual Progress  ▒▒▒▒ Ideal Progress  ░░░░ Projected
```

### Task Hours Burndown (if tracked)
| Day | Ideal Hours | Actual Hours | Variance | Completion % |
|-----|-------------|--------------|----------|---------------|
| [Current] | [Hours] | [Hours] | [±Hours] | [Percentage]% |
```

## Velocity Tracking and Analysis

### Sprint Velocity Update
```markdown
## Velocity Analysis

### Current Sprint Velocity
- **Committed Points**: [Points] 
- **Completed Points**: [Points] (as of [Date])
- **Projected Final Velocity**: [Points] (based on current trend)
- **Velocity vs Target**: [On Track/Behind/Ahead] by [X] points

### Historical Velocity Comparison
| Sprint | Committed | Completed | Velocity | Team Capacity |
|--------|-----------|-----------|----------|---------------|
| Sprint 1 | [Points] | [Points] | [Points] | [Hours] |
| Sprint 2 | [Points] | [Points] | [Points] | [Hours] |
| Sprint 3 | [Points] | [Points] | [Points] | [Hours] |
| Current | [Points] | [In Progress] | [Projected] | [Hours] |

### Velocity Trends
- **3-Sprint Average**: [Points]
- **Velocity Trend**: [Increasing/Stable/Decreasing] by [X]%
- **Consistency**: ±[Points] variation (Target: ±[X] points)
- **Predictability Score**: [High/Medium/Low] based on variance

### Capacity vs Velocity Analysis
- **Team Capacity**: [Hours] available this sprint
- **Capacity Utilization**: [Percentage]% of available hours used
- **Points per Hour**: [Ratio] (velocity/capacity ratio)
- **Efficiency Trend**: [Improving/Stable/Declining]
```

## Progress Patterns and Analysis

### Burndown Pattern Analysis
```markdown
## Burndown Pattern Insights

### Current Burndown Pattern
**Pattern Type**: [Linear/S-Curve/Late Finish/Early Finish/Irregular]

**Pattern Description**:
[Description of current burndown pattern and what it indicates]

**Implications**:
- **Sprint Goal Risk**: [Low/Medium/High] risk to sprint goal
- **Team Performance**: [Analysis of team productivity patterns]
- **Work Distribution**: [Even/Front-loaded/Back-loaded]

### Pattern Comparison to Historical
**Similar Patterns**:
- Sprint [X]: [Similar pattern] resulted in [Outcome]
- Sprint [Y]: [Similar pattern] resulted in [Outcome]

**Pattern Lessons**:
- [Lesson learned from similar burndown patterns]
- [Prediction based on historical data]

### Leading Indicators
**Positive Indicators**:
- [Indicator]: [Current status] suggests [Positive outcome]
- [Indicator]: [Current status] indicates [Good trend]

**Warning Indicators**:  
- [Indicator]: [Current status] suggests [Risk or concern]
- [Indicator]: [Current status] may lead to [Potential issue]
```

### Story Completion Trends
```markdown
## Story Progress Analysis

### Story Completion Rate
- **Stories Completed**: [Number] of [Total] ([Percentage]%)
- **Average Story Completion Time**: [Days/Hours]
- **Stories in Progress**: [Number] currently being worked
- **Stories Blocked**: [Number] waiting for resolution

### Story Size vs Completion Time
| Story Size | Average Completion | Current Sprint |
|------------|-------------------|----------------|
| 1 point | [Time] | [Time] |
| 2 points | [Time] | [Time] |
| 3 points | [Time] | [Time] |
| 5 points | [Time] | [Time] |
| 8+ points | [Time] | [Time] |

### Story Flow Metrics
- **Cycle Time**: [Average days] from start to done
- **Lead Time**: [Average days] from commitment to done  
- **Work in Progress**: [Number] stories in active development
- **Throughput**: [Number] stories completed per day/week
```

## Forecast and Projections

### Sprint Completion Forecast
```markdown
## Sprint Completion Projections

### Completion Probability Analysis
Based on current burndown rate and historical data:

**Highly Likely** (>80% confidence):
- Complete [X] of [Y] committed story points
- Achieve [Percentage]% of sprint goal
- Finish [Number] of [Total] stories

**Moderately Likely** (60-80% confidence):  
- Complete [X] of [Y] committed story points
- Achieve [Percentage]% of sprint goal
- May need to carry over [Number] stories

**Less Likely** (<60% confidence):
- Complete [X] of [Y] committed story points
- Partial achievement of sprint goal
- Significant carryover expected

### Forecast Scenarios
**Best Case Scenario**:
- Conditions: [What would need to happen]
- Outcome: [Optimistic completion projection]
- Probability: [Percentage]%

**Most Likely Scenario**:
- Conditions: [Current trend continues]
- Outcome: [Realistic completion projection]  
- Probability: [Percentage]%

**Worst Case Scenario**:
- Conditions: [What could go wrong]
- Outcome: [Pessimistic completion projection]
- Probability: [Percentage]%
```

### Velocity Projection for Future Sprints
```markdown
## Future Sprint Planning Data

### Projected Velocity Range
Based on current and historical data:
- **Conservative Estimate**: [Points] (80% confidence)
- **Most Likely**: [Points] (60% confidence)  
- **Optimistic**: [Points] (40% confidence)

### Capacity Planning Insights
- **Stable Team Velocity**: [Points] ±[Variance]
- **Recommended Sprint Commitment**: [Points] for next sprint
- **Capacity Factors**: [Factors affecting team capacity]
- **Velocity Improvement Opportunities**: [Areas for enhancement]

### Long-term Velocity Trends
- **6-Sprint Trend**: [Trend direction and magnitude]
- **Seasonal Factors**: [Holiday/event impacts on velocity]
- **Team Maturity Impact**: [How team development affects velocity]
- **Process Improvement Impact**: [Effect of process changes]
```

## Burndown Health and Quality Metrics

### Burndown Quality Indicators
```markdown
## Burndown Health Assessment

### Burndown Quality Score: [Score]/10

**Scoring Factors**:
- **Consistency**: [Score]/10 - [Regular daily progress vs irregular]
- **Predictability**: [Score]/10 - [Following historical patterns]
- **Goal Alignment**: [Score]/10 - [Progress toward sprint goal]
- **Team Collaboration**: [Score]/10 - [Even vs uneven contribution]

### Health Indicators
**Positive Indicators** ✅:
- Steady daily progress on story completion
- Burndown following or ahead of ideal trend
- Stories moving through workflow stages smoothly
- Team capacity being utilized effectively

**Warning Signs** ⚠️:
- Irregular progress with long periods of no burndown
- Significant deviation from ideal burndown line
- Many stories stuck in review or testing phases
- Uneven workload distribution among team members

**Critical Issues** 🚨:
- No progress for multiple consecutive days
- Burndown line trending away from zero
- Multiple blocked stories with no resolution plan
- Sprint goal achievement in serious jeopardy
```

## Action Items from Burndown Analysis

### Immediate Actions (This Sprint)
```markdown
## Burndown-Based Action Items

### High Priority Actions
1. **[Action Item]**
   - **Trigger**: [What burndown data indicates this is needed]
   - **Action**: [Specific steps to take]
   - **Owner**: [Responsible person]
   - **Timeline**: [When to complete]
   - **Success Measure**: [How to know it worked]

2. **[Action Item]**
   - **Risk**: [What risk this addresses]
   - **Intervention**: [Specific intervention needed]
   - **Expected Impact**: [How it should improve burndown]

### Process Adjustments
1. **Daily Standup Focus**
   - [Adjustment based on burndown pattern]
   - [Specific questions to ask based on data]

2. **Work Prioritization**
   - [Reordering work based on burndown analysis]
   - [Focus areas for remainder of sprint]

3. **Team Collaboration**
   - [Changes needed based on individual contributions]
   - [Support needed for team members]
```

### Future Sprint Planning Adjustments
```markdown
## Planning Improvements for Next Sprint

### Capacity Planning
- **Velocity Adjustment**: Use [X] points based on recent trends
- **Capacity Buffer**: Include [Percentage]% buffer for uncertainty
- **Work Distribution**: [Strategy for more even burndown]

### Sprint Structure
- **Story Sizing**: [Lessons about story size vs completion time]
- **Dependency Management**: [Improvements needed]
- **Definition of Done**: [Adjustments based on cycle time data]

### Team Process
- **Daily Standup**: [Format changes to improve progress tracking]
- **Code Review Process**: [Improvements to reduce cycle time]
- **Testing Strategy**: [Changes to improve story completion flow]
```

## Visual Burndown Reports

### Burndown Chart Generation
```markdown
## Updated Visual Reports

### Sprint Burndown Chart
[Generated burndown chart showing]:
- Ideal burndown line
- Actual progress line  
- Future projection line
- Key milestone markers
- Sprint goal target line

### Velocity Chart
[Generated velocity chart showing]:
- Historical velocity bars
- Velocity trend line
- Current sprint projection
- Capacity utilization overlay

### Cumulative Flow Diagram
[Generated CFD showing]:
- Story states over time
- Work in progress limits
- Bottlenecks and flow issues
- Lead and cycle time trends
```

## Integration and Data Sources

### Data Collection Points
```markdown
## Burndown Data Sources

### Automated Data Collection
- **Issue Tracking System**: [Jira/Azure DevOps/etc.]
  - Story point completion timestamps
  - Story state transitions
  - Time in each workflow state

- **Development Tools**: [Git/CI-CD systems]
  - Code commit frequency
  - Pull request cycle times
  - Deployment frequency

### Manual Data Entry
- **Daily Standup Updates**: Team member progress reports
- **Impediment Tracking**: Blocker identification and resolution
- **Capacity Adjustments**: Team availability changes

### Data Quality Checks
- **Completeness**: [Percentage] of expected data points collected
- **Accuracy**: [Validation checks performed]
- **Timeliness**: [Frequency of data updates]
```

## Follow-up Actions

After burndown update:
- `/sprint-progress` - Generate comprehensive progress report
- `/sprint-planning` - Adjust current or future sprint plans
- `/blocker` - Address impediments affecting burndown
- Update team dashboard and visual reports
- Communicate findings to stakeholders
- Schedule team discussion if significant pattern changes detected