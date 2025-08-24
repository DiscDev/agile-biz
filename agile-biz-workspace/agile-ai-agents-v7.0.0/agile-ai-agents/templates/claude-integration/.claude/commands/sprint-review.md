---
allowed-tools: Read(*), Write(*), Task(subagent_type:scrum_master_agent), Task(subagent_type:project_manager_agent)
description: Conduct formal sprint review with stakeholder demonstration
argument-hint: "[demo-focus-area]"
---

# Sprint Review & Demonstration

Facilitate formal sprint review meeting with stakeholder demonstration and feedback collection.

## Sprint Review Process

1. **Pre-Review Preparation**
   - Load completed sprint items from `state.md`
   - Gather deliverables and demo materials
   - Prepare demonstration script
   - Collect metrics and achievements

2. **Stakeholder Demonstration**
   - Present sprint goal achievement
   - Demonstrate working features
   - Show tangible deliverables
   - Highlight technical accomplishments

3. **Stakeholder Feedback Collection**
   ```
   Sprint Review Session
   =====================
   
   Sprint: [Name] - [Start Date] to [End Date]
   Goal: [Sprint Goal]
   
   Completed Items:
   ✅ [Item 1] - [Description]
   ✅ [Item 2] - [Description]
   ✅ [Item 3] - [Description]
   
   Demo Focus: $ARGUMENTS or "Full sprint demonstration"
   
   Stakeholder Questions:
   1. What aspects would you like to see demonstrated?
   2. How well does this meet your expectations?
   3. What adjustments are needed for next sprint?
   4. Any new requirements or priorities?
   ```

4. **Review Documentation**
   Create in `sprints/sprint-[name]/review/`:
   - `sprint-review.md`: Meeting summary
   - `stakeholder-feedback.md`: Collected feedback
   - `demo-script.md`: Demonstration outline
   - `acceptance-decisions.md`: Acceptance criteria verification

## Demo Script Generation

The scrum_master_agent will create:
- **Demo Flow**: Logical presentation sequence
- **Key Features**: Highlight major accomplishments
- **User Journey**: Show end-to-end functionality
- **Technical Achievements**: Backend/infrastructure progress

Focus areas if $ARGUMENTS provided:
- "frontend": Emphasize UI/UX improvements
- "backend": Showcase API and data features  
- "integration": Demonstrate system connectivity
- "performance": Highlight optimization results

## Stakeholder Interaction

```
🎯 Sprint Review Meeting
========================

👥 Participants: Product Owner, Stakeholders, Development Team
📅 Sprint Period: [Start] - [End]
🏆 Sprint Goal: [Goal Statement]

Sprint Achievements:
├── Story Points Completed: [X]/[Y] ([Z]%)
├── Features Delivered: [List]
├── Technical Debt Reduced: [Metrics]
└── Quality Metrics: [Test coverage, performance]

Live Demonstration:
[Interactive demo session with stakeholder]

Stakeholder Feedback:
Q: How satisfied are you with sprint results? (1-10)
Q: What should we prioritize next sprint?
Q: Any concerns or blockers from your perspective?
Q: Additional requirements or changes needed?
```

## Review Outcomes

Document the following:
- **Acceptance Status**: Which items are accepted/rejected
- **Change Requests**: New requirements from stakeholders
- **Priority Adjustments**: Backlog reprioritization
- **Next Sprint Input**: Stakeholder requests for next sprint

## Sprint Metrics Summary

```
📊 Sprint Performance Metrics
==============================

🎯 Goal Achievement: [Achieved/Partially/Not Achieved]
📈 Velocity: [X] points ([Y] planned)  
⏱️ Timeline: [On time/Early/Late]
🐛 Quality: [X] bugs found, [Y] fixed
🔄 Scope Changes: [X] items added/removed during sprint

Stakeholder Satisfaction: [Score/10]
Key Feedback Themes:
• [Theme 1]
• [Theme 2] 
• [Theme 3]

Recommendations for Next Sprint:
• [Recommendation 1]
• [Recommendation 2]
```

## Output Format

```
✅ Sprint Review Completed
==========================

🎉 Sprint: [Name] - REVIEWED
📊 Achievement: [X]% goal completion
💬 Stakeholder Satisfaction: [Score/10]

Key Outcomes:
  ✓ [X] items accepted by stakeholder
  🔄 [Y] change requests captured
  📋 [Z] items for next sprint backlog

Review documentation saved to:
  sprints/sprint-[name]/review/

Use /sprint-retrospective for team retrospective
Use /start-sprint to begin next iteration
```

Coordinate with scrum_master_agent for meeting facilitation and project_manager_agent for stakeholder communication and next sprint planning.