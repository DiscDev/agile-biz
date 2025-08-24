---
allowed-tools: Read(*), Write(*), Task(subagent_type:project_manager_agent), Task(subagent_type:scrum_master_agent)
description: Record major project achievement or milestone
argument-hint: "<milestone-description>"
---

# Project Milestone Recording

Document significant project achievements, major deliveries, and strategic milestones.

## Milestone Documentation Process

1. **Milestone Validation**
   - Verify $ARGUMENTS contains milestone description
   - If empty, prompt for milestone details
   - Assess milestone significance and impact

2. **Achievement Analysis**
   - Calculate project progress percentage
   - Identify completed features and capabilities
   - Measure business value delivered
   - Document technical accomplishments

3. **Milestone Classification**
   Automatically categorize based on content:
   - **Feature Milestone**: Major feature completion
   - **Technical Milestone**: Architecture or infrastructure achievement
   - **Business Milestone**: Market delivery or revenue milestone
   - **Process Milestone**: Team or methodology achievement
   - **Quality Milestone**: Performance or security achievement

4. **Stakeholder Impact Assessment**
   - User-facing improvements delivered
   - Business objectives advanced
   - Technical debt reduced
   - System capabilities enhanced

## Milestone Documentation

```
🏆 Project Milestone Achieved
=============================

🎯 Milestone: $ARGUMENTS
📅 Achievement Date: [Current timestamp]
🏷️ Category: [Auto-detected category]
📊 Project Progress: [X]% complete

Achievement Details:
├── Features Completed: [List key features]
├── Technical Accomplishments: [Infrastructure, performance, etc.]
├── Business Value: [Revenue, user impact, efficiency gains]
├── Quality Improvements: [Test coverage, security, performance]
└── Team Achievements: [Process improvements, skill development]

Metrics at Milestone:
├── Total Story Points Delivered: [X]
├── Sprint Velocity Average: [Y] points/sprint  
├── System Performance: [Response times, uptime, etc.]
├── Test Coverage: [X]%
├── Security Posture: [Vulnerabilities addressed]
└── User Satisfaction: [Score if available]

Stakeholder Benefits:
• [Benefit 1]: [Impact description]
• [Benefit 2]: [Value delivered]
• [Benefit 3]: [Capability enabled]
```

## Milestone Record Structure

Create milestone documentation in `project-documents/milestones/`:
```json
{
  "milestone_id": "milestone-YYYY-MM-DD-HHMMSS",
  "timestamp": "[ISO timestamp]",
  "description": "$ARGUMENTS",
  "category": "[Feature|Technical|Business|Process|Quality]",
  "project_phase": "[Current phase]",
  "sprint_context": "[Current sprint if applicable]",
  "achievements": {
    "features": ["Feature 1", "Feature 2"],
    "technical": ["Tech achievement 1", "Tech achievement 2"],
    "business_value": ["Value 1", "Value 2"],
    "quality": ["Quality improvement 1", "Quality improvement 2"]
  },
  "metrics": {
    "project_completion": "percentage",
    "story_points_total": "number",
    "velocity_average": "points per sprint",
    "quality_score": "score out of 10"
  },
  "stakeholder_impact": {
    "user_benefits": ["Benefit 1", "Benefit 2"],
    "business_impact": ["Impact 1", "Impact 2"],  
    "technical_enablement": ["Enabler 1", "Enabler 2"]
  },
  "next_objectives": ["Objective 1", "Objective 2"]
}
```

## Project Progress Analysis

The project_manager_agent provides:
- **Strategic Alignment**: How milestone advances project goals
- **Resource Efficiency**: Cost and time optimization achieved
- **Risk Reduction**: Risks mitigated by this achievement
- **Market Readiness**: Steps toward product launch/delivery

The scrum_master_agent analyzes:
- **Team Velocity**: Sprint performance leading to milestone
- **Process Improvements**: Workflow optimizations achieved
- **Quality Metrics**: Defect rates, test coverage, automation
- **Collaboration Effectiveness**: Agent coordination success

## Milestone Communication

Generate stakeholder communication:
```
📢 Milestone Achievement Announcement
=====================================

We're excited to announce a significant project milestone:

🎯 Achievement: $ARGUMENTS

This milestone represents [X]% completion of our project goals and delivers:

Key Benefits:
• [User Benefit]: [Description]  
• [Business Benefit]: [Description]
• [Technical Benefit]: [Description]

What's Next:
Our next major focus will be [Next objective] with an estimated delivery of [Timeline].

Technical Highlights:
• [Technical achievement 1]
• [Technical achievement 2] 
• [Performance/security/quality improvement]

Thank you for your continued support as we progress toward our project vision.
```

## Historical Milestone Tracking

Update `project-documents/orchestration/project-timeline.md`:
```markdown
## Project Milestones

| Date | Milestone | Category | Progress | Impact |
|------|-----------|----------|----------|---------|
| [Date] | $ARGUMENTS | [Category] | [X]% | [High/Medium/Low] |
| [Previous] | [Previous milestone] | [Category] | [Y]% | [Impact] |

## Milestone Velocity
- Average time between milestones: [X] days
- Milestone delivery accuracy: [Y]% 
- Stakeholder satisfaction trend: [Direction]
```

## Output Format

```
🏆 Milestone Recorded Successfully
==================================

📝 Milestone: $ARGUMENTS
🏷️ Category: [Category]
📊 Project Progress: [X]% complete
📅 Achievement Date: [Timestamp]

Business Value Delivered:
  💰 [Financial impact if applicable]
  👥 [User impact metrics]  
  🚀 [Strategic advancement]

Documentation Saved:
  📁 project-documents/milestones/milestone-[timestamp].json
  📈 project-timeline.md updated
  📊 Progress metrics updated

Next Major Milestone: [Predicted next milestone]
Estimated Timeline: [Estimated completion]

Use /aaa-status to see updated project progress
Use /sprint-status to continue current sprint work
```

## Integration Benefits

- **Progress Tracking**: Visual project advancement
- **Stakeholder Updates**: Automated communication content
- **Team Motivation**: Recognition of achievements  
- **Historical Analysis**: Velocity and efficiency trends
- **Risk Management**: Early warning for delivery issues

Coordinate with project_manager_agent for strategic analysis and scrum_master_agent for team performance insights.