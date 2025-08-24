---
allowed-tools: Read(*), Write(*), Task(subagent_type:project_state_manager_agent)
description: Select development velocity profile for project
argument-hint: "[profile-name] or --list or --custom"
---

# Select Velocity Profile

Configure development velocity settings to match project requirements and team capacity.

## Velocity Profile Options

1. **Startup Speed** (Default)
   - Rapid prototyping focus
   - Minimal documentation overhead
   - Quick decision making
   - Fast iteration cycles

2. **Enterprise Steady**
   - Comprehensive documentation
   - Thorough review processes
   - Risk-averse decision making
   - Structured development phases

3. **Research & Development**
   - Exploration-focused workflow
   - Extensive experimentation
   - Knowledge capture priority
   - Flexible pivot capability

4. **Production Critical**
   - Maximum stability focus
   - Extensive testing requirements
   - Change management protocols
   - Quality gate enforcement

## Profile Configuration

### Startup Speed Profile
```yaml
velocity_profile: "startup_speed"
settings:
  sprint_duration: "1 week"
  documentation_level: "minimal"
  review_threshold: "major_changes_only"
  decision_speed: "fast"
  testing_coverage: "critical_paths"
  
workflow_adjustments:
  skip_detailed_analysis: true
  abbreviated_retrospectives: true
  streamlined_planning: true
  reduced_ceremony: true
```

### Enterprise Steady Profile
```yaml
velocity_profile: "enterprise_steady"
settings:
  sprint_duration: "2 weeks"
  documentation_level: "comprehensive"
  review_threshold: "all_changes"
  decision_speed: "deliberate"
  testing_coverage: "full_suite"
  
workflow_adjustments:
  mandatory_approvals: true
  detailed_impact_analysis: true
  stakeholder_reviews: true
  compliance_checks: true
```

## Profile Selection

Parse $ARGUMENTS for profile selection:
- Specific profile name: Apply that profile
- `--list`: Show all available profiles
- `--custom`: Create custom profile configuration
- No arguments: Show current profile and options

## Available Profiles Display

```
⚡ VELOCITY PROFILES
===================

🚀 Startup Speed (Current)
   • 1-week sprints
   • Minimal documentation  
   • Fast decisions
   • Critical testing only
   • Best for: MVPs, prototypes

🏢 Enterprise Steady
   • 2-week sprints
   • Comprehensive docs
   • Deliberate decisions  
   • Full test coverage
   • Best for: Production systems

🔬 Research & Development
   • Flexible sprints
   • Extensive documentation
   • Experimental focus
   • Research-driven testing
   • Best for: Innovation projects

🛡️  Production Critical
   • 3-week sprints
   • Maximum documentation
   • Risk-averse decisions
   • Exhaustive testing
   • Best for: Mission-critical systems

Use: /select-velocity-profile [profile-name]
```

## Profile Implementation

1. **Workflow Updates**
   - Adjust sprint templates
   - Modify decision processes
   - Update documentation requirements
   - Configure testing standards

2. **Agent Configuration**
   - Update agent priorities
   - Adjust review criteria  
   - Modify escalation thresholds
   - Configure automation levels

3. **Template Customization**
   - Select appropriate document templates
   - Adjust ceremony requirements
   - Configure approval workflows
   - Set quality gates

## Custom Profile Creation

For `--custom` option, guide through configuration:

```
🔧 Custom Profile Builder
========================

1. Sprint Duration
   Options: 1 week, 2 weeks, 3 weeks, flexible
   Selection: [User input]

2. Documentation Level
   Options: minimal, standard, comprehensive, exhaustive
   Selection: [User input]

3. Decision Speed
   Options: fast, standard, deliberate, consensus
   Selection: [User input]

4. Testing Coverage
   Options: critical, standard, comprehensive, exhaustive
   Selection: [User input]

5. Review Requirements
   Options: optional, major_changes, all_changes, peer_required
   Selection: [User input]
```

## Output Format

```
⚡ VELOCITY PROFILE UPDATED
===========================

📊 Profile Selected: [Profile Name]

⚙️  Configuration Applied
  • Sprint Duration: [Duration]
  • Documentation: [Level]
  • Decision Speed: [Speed]
  • Testing Coverage: [Coverage]
  • Review Requirements: [Requirements]

🔄 Workflow Adjustments
  ✅ Sprint templates updated
  ✅ Agent priorities configured
  ✅ Documentation templates selected
  ✅ Quality gates configured

📋 Impact on Current Project
  • Next sprint will use new settings
  • Existing work continues with current rules
  • Documentation updated for new standards
  • Team notification sent (if configured)

🎯 Profile Benefits
  [Profile-specific benefits and characteristics]

Profile applied successfully!
Use /aaa-status to see updated workflow configuration.
```

## Profile Validation

After selection, validate:
- Configuration consistency
- Team capacity alignment
- Project requirement matching
- Stakeholder expectation alignment

## Profile Migration

When changing profiles:
- Preserve existing work integrity
- Migrate templates gradually
- Update team expectations
- Monitor adjustment period

## Performance Tracking

Monitor profile effectiveness:
- Sprint velocity metrics
- Quality indicators
- Team satisfaction
- Delivery predictability