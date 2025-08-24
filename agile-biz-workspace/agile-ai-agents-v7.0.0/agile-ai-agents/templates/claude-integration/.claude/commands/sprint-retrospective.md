---
allowed-tools: Read(*), Write(*), Task(subagent_type:scrum_master_agent), Task(subagent_type:project_manager_agent)
description: Run comprehensive sprint retrospective with AI agents
argument-hint: "[focus-area]"
---

# Sprint Retrospective & Process Improvement

Conduct thorough sprint retrospective with AI agent team to identify improvements and optimize future sprints.

## Retrospective Process

1. **Sprint Data Collection**
   - Gather sprint metrics from `state.md` and pulse updates
   - Analyze velocity, burndown, and completion rates
   - Review blockers, delays, and resolution times
   - Collect agent collaboration feedback

2. **What Went Well Analysis**
   - Identify successful processes and decisions
   - Highlight effective agent coordination
   - Recognize optimal workflow patterns
   - Document best practices to repeat

3. **What Went Wrong Analysis**
   - Pinpoint process breakdowns
   - Analyze communication gaps
   - Identify inefficient workflows
   - Document antipatterns to avoid

4. **Process Improvement Planning**
   - Generate actionable improvement items
   - Prioritize changes by impact
   - Assign ownership for improvements
   - Set success metrics for changes

## Retrospective Framework

```
🔄 Sprint Retrospective Session
===============================

Sprint: [Name] - [Duration] ([Start] to [End])
Participants: AI Agent Team + Stakeholder Input

Sprint Metrics:
├── Planned Story Points: [X]
├── Completed Story Points: [Y]
├── Velocity Achievement: [Z]%
├── Blockers Encountered: [A]
└── Resolution Time Avg: [B] hours

Focus Area: $ARGUMENTS or "Full sprint analysis"

WHAT WENT WELL ✅
├── [Success 1]: [Description and impact]
├── [Success 2]: [Agent coordination highlight]
├── [Success 3]: [Process efficiency win]
└── [Success 4]: [Quality achievement]

WHAT WENT WRONG ❌
├── [Issue 1]: [Problem and root cause]
├── [Issue 2]: [Communication breakdown]
├── [Issue 3]: [Process inefficiency]
└── [Issue 4]: [Technical obstacle]

WHAT TO IMPROVE 🚀
├── [Improvement 1]: [Specific action]
├── [Improvement 2]: [Process change]
├── [Improvement 3]: [Tool/method update]
└── [Improvement 4]: [Agent coordination enhancement]
```

## Agent-Specific Retrospective

If $ARGUMENTS specifies focus area:
- "collaboration": Agent coordination and handoff analysis
- "planning": Sprint planning and estimation accuracy
- "execution": Development workflow and delivery process
- "quality": Testing, review, and defect prevention
- "communication": Stakeholder interaction and documentation

### AI Agent Feedback Collection

The scrum_master_agent analyzes:
- **Sprint Planning Accuracy**: Estimation vs. actual effort
- **Daily Workflow**: Agent coordination efficiency  
- **Blocker Resolution**: Response time and effectiveness
- **Velocity Trends**: Sprint-over-sprint improvements

The project_manager_agent evaluates:
- **Resource Utilization**: Agent capacity and allocation
- **Risk Management**: Issue prediction and mitigation
- **Stakeholder Satisfaction**: Communication effectiveness
- **Delivery Quality**: On-time, on-scope achievement

## Improvement Action Items

Generate concrete action items with:
```json
{
  "improvement_id": "retro-[sprint]-[number]",
  "category": "process|communication|technical|planning",
  "priority": "high|medium|low", 
  "description": "Specific improvement action",
  "owner": "scrum_master_agent|project_manager_agent|team",
  "success_criteria": "How to measure improvement",
  "target_sprint": "When to implement",
  "effort_estimate": "Hours or story points needed"
}
```

## Retrospective Documentation

Create in `sprints/sprint-[name]/retrospectives/`:
- `sprint-retrospective.md`: Full retrospective summary
- `improvement-actions.md`: Action items with owners
- `metrics-analysis.md`: Data-driven insights
- `lessons-learned.md`: Key takeaways for future sprints

## Process Evolution Tracking

```
📈 Sprint Evolution Metrics
============================

Velocity Trend:
Sprint 1: [X] points
Sprint 2: [Y] points  
Sprint 3: [Z] points (current)
Trajectory: [Improving/Stable/Declining]

Quality Trend:
├── Bug Rate: [X]% (previous: [Y]%)
├── Test Coverage: [A]% (previous: [B]%)
├── Code Review Time: [C]h (previous: [D]h)
└── Rework Rate: [E]% (previous: [F]%)

Process Efficiency:
├── Planning Accuracy: [X]% (target: 85%)
├── Blocker Resolution: [Y]h avg (target: <4h)
├── Agent Handoff Time: [Z]min avg
└── Documentation Quality: [Score]/10
```

## Output Format

```
🔄 Sprint Retrospective Complete
=================================

📊 Sprint Performance: [Score]/10
🎯 Process Improvements: [X] action items identified
📈 Velocity Trend: [Direction] ([X] points this sprint)

Key Insights:
  ✅ [Top success to continue]
  ❌ [Critical issue to address]
  🚀 [Biggest opportunity for improvement]

Action Items for Next Sprint:
  🔧 [Priority 1 improvement]
  📋 [Priority 2 process change]
  🤝 [Priority 3 coordination enhancement]

Retrospective documentation saved to:
  sprints/sprint-[name]/retrospectives/

Use /start-sprint to begin next iteration with improvements
Use /save-decision to record major process changes
```

Coordinate with scrum_master_agent for process analysis and project_manager_agent for strategic improvements and team optimization.