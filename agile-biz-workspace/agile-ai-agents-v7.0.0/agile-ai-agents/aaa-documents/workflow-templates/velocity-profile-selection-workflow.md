# Velocity Profile Selection Workflow

## Overview
This workflow enables users to select community-learned velocity profiles during project initialization, providing realistic sprint planning estimates from day one.

## When This Workflow Runs
- During `/start-new-project-workflow` Phase 7 (Backlog Creation)
- During `/start-existing-project-workflow` Phase 7 (Enhancement Planning)
- Manually via `/select-velocity-profile` command
- When creating first sprint if no profile selected

## Workflow Steps

### Step 1: Profile Selection Prompt
**Agent**: Scrum Master Agent
**Action**: Present velocity profile options

```
🎯 Select a velocity profile for your project:

1. Standard Web Application
   Typical web application with frontend and backend components
   Initial velocity: 45 points (confidence: 75%)
   Best for: E-commerce sites, Content management systems

2. API-Only Service
   Backend API service without user interface
   Initial velocity: 65 points (confidence: 80%)
   Best for: Microservices, Mobile app backends

3. SaaS MVP
   Minimum viable product for Software-as-a-Service
   Initial velocity: 40 points (confidence: 70%)
   Best for: Startup MVPs, Product validation

4. Mobile Application
   Native or cross-platform mobile application
   Initial velocity: 35 points (confidence: 65%)
   Best for: iOS/Android apps, React Native projects

5. Data Pipeline/ETL
   Data processing, ETL, or analytics projects
   Initial velocity: 55 points (confidence: 85%)
   Best for: ETL pipelines, Data warehousing

6. Enterprise System
   Large-scale enterprise application with complex requirements
   Initial velocity: 30 points (confidence: 60%)
   Best for: ERP systems, Financial applications

7. Custom Project
   Start with zero velocity and build your own baseline
   Initial velocity: 0 points
   Best for: Unique projects, When unsure

Please select a profile (1-7):
```

### Step 2: Profile Confirmation
**Agent**: Scrum Master Agent
**Action**: Confirm selection and show implications

```
✅ Selected: Standard Web Application

This profile will:
- Set initial velocity to 45 story points per sprint
- Base estimates on 127 similar projects
- Provide 75% confidence in initial estimates
- Allow comparison with community benchmarks

The velocity will adjust based on your team's actual performance after 2-3 sprints.

Proceed with this profile? (yes/no):
```

### Step 3: Apply Profile
**Agent**: Scrum Master Agent
**Action**: Update velocity-metrics.json with selected profile

```json
{
  "meta": {
    "velocity_profile": "standard_web_app",
    "profile_selected_at": "2025-01-23T10:30:00Z"
  },
  "metrics": {
    "average_velocity": 45,
    "velocity_range": {
      "min": 35,
      "max": 55
    },
    "confidence_level": 0.75,
    "is_community_default": true
  }
}
```

### Step 4: Dashboard Update
**Agent**: Project Dashboard Agent
**Action**: Display community indicator

The dashboard will show:
- Velocity: 45 📊 (hover shows "Using community defaults (75% confidence)")
- Sprints Remaining: Calculated based on community velocity

### Step 5: Sprint Planning Impact
**Agent**: Project Manager Agent
**Action**: Use profile velocity for sprint planning

When planning first sprint:
```
Based on your Standard Web Application profile:
- Recommended sprint capacity: 45 points
- Suggested items for Sprint 1: [list of stories totaling ~45 points]
- Confidence level: 75%

Note: This is a community-based estimate. Your team's actual velocity will emerge after 2-3 sprints.
```

## Command Integration

### `/select-velocity-profile`
Manually trigger profile selection or change current profile:
```
/select-velocity-profile [profile-id]
```

Examples:
- `/select-velocity-profile` - Show selection menu
- `/select-velocity-profile standard_web_app` - Direct selection
- `/select-velocity-profile reset` - Return to custom (0 velocity)

### `/show-velocity-profile`
Display current profile and performance comparison:
```
Current Profile: Standard Web Application
Community Average: 45 points/sprint
Your Average: 52 points/sprint
Performance: Above Average (87th percentile)
Confidence: High (based on 5 completed sprints)
```

## Integration Points

### 1. New Project Workflow
In Phase 7, after PRD transformation:
```
Acting as Scrum Master Agent, before we plan our first sprint, 
let's select a velocity profile that matches your project type...
```

### 2. Existing Project Workflow
In Phase 7, when setting up enhancement sprints:
```
Acting as Scrum Master Agent, I notice you don't have velocity history.
Let's select a profile based on similar projects...
```

### 3. Sprint Planning
When velocity is 0 or using defaults:
```
Acting as Scrum Master Agent, you're using the Standard Web App profile 
with 45 points capacity. This is based on community data and will be 
refined as we complete sprints.
```

## Profile Adjustment Logic

### After Each Sprint
1. Calculate actual velocity
2. Update velocity metrics
3. Reduce reliance on community defaults
4. After 3 sprints: Use actual data primarily

### Confidence Progression
- Sprint 1: 100% community defaults
- Sprint 2: 70% community, 30% actual
- Sprint 3: 40% community, 60% actual
- Sprint 4+: 100% actual data

## Error Handling

### No Profiles Available
If velocity-profiles.json is missing:
```
⚠️ Community velocity profiles not available.
Starting with default velocity of 0.
Velocity will be established after completing first sprint.
```

### Invalid Selection
If user selects invalid option:
```
❌ Invalid selection. Please choose 1-7 or type 'skip' to start with 0 velocity.
```

## Benefits Communication

When using community defaults, remind users:
```
📊 You're benefiting from insights from 127 similar projects!
This helps with:
- Realistic sprint planning from day one
- Better project timeline estimates
- Reduced uncertainty in early sprints
- Benchmarking against similar projects
```

## Privacy Note
Always include when showing profiles:
```
🔒 Privacy: All community data is fully anonymized. No project names, 
code, or business logic is shared - only aggregate velocity metrics.
```