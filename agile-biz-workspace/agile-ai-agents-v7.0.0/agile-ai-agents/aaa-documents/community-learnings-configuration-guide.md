# Community Learnings Configuration Guide

## Overview
This guide explains how to configure the community learnings system in AgileAiAgents to control when and how project insights are captured, anonymized, and contributed to improve the system for everyone.

## Configuration Location

Community learnings settings are configured in the **CLAUDE.md** file at the root of your agile-ai-agents directory.

### Location
`agile-ai-agents/CLAUDE.md`

### Configuration Section
```yaml
community_learnings:
  contribution:
    enabled: true               # Enable community learning contributions
    auto_prompt:                # When to prompt for contributions
      - sprint_complete         # After sprint retrospective
      - milestone_reached       # After major milestones
      - deployment_success      # After successful deployments
      - project_complete        # At project completion
    prompt_delay_minutes: 10    # Wait before prompting (allows reflection)
    
  capture:
    include_metrics: true       # Capture performance metrics
    include_patterns: true      # Capture identified patterns
    include_agent_feedback: true # Include agent-specific learnings
    anonymize_data: true        # Auto-anonymize sensitive information
    min_sprint_duration: 2      # Minimum days before capturing learnings
    
  analysis:
    enabled: true               # Enable Learning Analysis Agent
    confidence_threshold: 0.7   # Min confidence for pattern identification
    min_pattern_samples: 3      # Min contributions for pattern detection
    auto_implementation: 0.9    # Auto-implement if confidence >= 0.9
    
  privacy:
    scan_for_secrets: true      # Scan for API keys, passwords, etc.
    remove_identifiers: true    # Remove names, emails, domains
    replace_paths: true         # Replace absolute paths with relative
    review_before_submit: true  # User reviews before contribution
```

## Configuration Options Explained

### contribution Section

#### enabled
- **Type**: boolean
- **Default**: true
- **Description**: Master switch for community learning contributions
- **Note**: Set to false to disable all prompts and contributions

#### auto_prompt
- **Type**: array of strings
- **Description**: Events that trigger contribution prompts
- **Available Triggers**:
  - `sprint_complete` - After sprint retrospective is completed
  - `milestone_reached` - When project milestones are achieved
  - `deployment_success` - After successful production deployments
  - `project_complete` - When project is marked complete
  - `feature_complete` - After major features are completed
  - `weekly` - Weekly prompts (every 7 days)
  - `manual_only` - Only when manually triggered

#### prompt_delay_minutes
- **Type**: number (minutes)
- **Default**: 10
- **Description**: Wait time before showing contribution prompt
- **Range**: 0-60 minutes
- **Purpose**: Allows time for reflection before capturing learnings

### capture Section

#### include_metrics
- **Type**: boolean
- **Default**: true
- **Description**: Include quantitative metrics in learnings
- **Metrics**: Token usage, execution time, error rates, success rates

#### include_patterns
- **Type**: boolean
- **Default**: true
- **Description**: Capture workflow patterns and agent collaborations
- **Examples**: Agent handoff sequences, successful tool combinations

#### include_agent_feedback
- **Type**: boolean
- **Default**: true
- **Description**: Include agent-specific performance insights
- **Details**: Which agents excelled, areas for improvement

#### anonymize_data
- **Type**: boolean
- **Default**: true
- **Description**: Automatically anonymize before contribution
- **Important**: Always recommended for privacy

#### min_sprint_duration
- **Type**: number (days)
- **Default**: 2
- **Description**: Minimum sprint duration before capturing learnings
- **Purpose**: Ensures sufficient data for meaningful insights

### analysis Section

#### enabled
- **Type**: boolean
- **Default**: true
- **Description**: Enable Learning Analysis Agent processing
- **Note**: Required for pattern detection and improvements

#### confidence_threshold
- **Type**: number (0.0-1.0)
- **Default**: 0.7
- **Description**: Minimum confidence for pattern identification
- **Range**: 0.5 (loose) to 0.9 (strict)

#### min_pattern_samples
- **Type**: number
- **Default**: 3
- **Description**: Minimum similar contributions to identify pattern
- **Note**: Higher values = more reliable patterns

#### auto_implementation
- **Type**: number (0.0-1.0)
- **Default**: 0.9
- **Description**: Confidence threshold for automatic implementation
- **Note**: High-confidence improvements applied automatically

### privacy Section

#### scan_for_secrets
- **Type**: boolean
- **Default**: true
- **Description**: Scan for API keys, passwords, tokens
- **Technology**: Uses regex patterns and entropy analysis

#### remove_identifiers
- **Type**: boolean
- **Default**: true
- **Description**: Remove personal identifiers
- **Removes**: Names, emails, domains, IP addresses

#### replace_paths
- **Type**: boolean
- **Default**: true
- **Description**: Convert absolute paths to relative
- **Example**: `/Users/john/project/` → `./`

#### review_before_submit
- **Type**: boolean
- **Default**: true
- **Description**: Show anonymized data for review before submission
- **Recommendation**: Keep enabled for maximum privacy

## What Gets Captured

### 1. Performance Metrics
- Token usage by agent and phase
- Execution times for workflows
- Error rates and recovery patterns
- Resource utilization

### 2. Agent Collaboration Patterns
- Successful handoff sequences
- Parallel vs sequential workflows
- Communication patterns
- Decision points

### 3. Tool Usage Insights
- MCP server effectiveness
- Tool combination patterns
- Integration challenges
- Performance optimizations

### 4. Process Improvements
- Workflow optimizations discovered
- Time-saving techniques
- Quality improvements
- Automation opportunities

### 5. Challenge Resolutions
- Problems encountered
- Solutions implemented
- Workarounds discovered
- Lessons learned

## Privacy Protection Process

1. **Automatic Scanning**
   - Regex patterns for secrets
   - Entropy analysis for keys
   - Known pattern matching

2. **Data Sanitization**
   - Replace identifiers with placeholders
   - Convert paths to relative
   - Remove environment-specific data

3. **Manual Review**
   - Display sanitized version
   - Highlight replacements
   - Allow edits before submission

4. **Secure Submission**
   - Encrypted transmission
   - No raw data storage
   - Audit trail maintained

## Best Practices

### 1. Active Development
```yaml
community_learnings:
  contribution:
    enabled: true
    auto_prompt: [sprint_complete, milestone_reached]
    prompt_delay_minutes: 10
  capture:
    include_metrics: true
    include_patterns: true
```

### 2. Privacy-Conscious Teams
```yaml
community_learnings:
  contribution:
    enabled: true
  privacy:
    scan_for_secrets: true
    remove_identifiers: true
    replace_paths: true
    review_before_submit: true  # Always review
```

### 3. High-Security Projects
```yaml
community_learnings:
  contribution:
    enabled: false  # Disable completely
```

### 4. Research Projects
```yaml
community_learnings:
  contribution:
    auto_prompt: [weekly, project_complete]
  capture:
    include_metrics: true
    include_patterns: true
    include_agent_feedback: true
  analysis:
    confidence_threshold: 0.6  # More experimental
```

## Command Line Interface

### Manual Commands
```bash
# Capture learnings manually
npm run capture-summary

# Review and contribute learnings
npm run contribute-learnings

# Skip current contribution prompt
npm run skip-contribution

# Generate learning report
npm run learning-report

# Check contribution status
npm run contribution-status
```

### Environment Variables
```bash
# Override configuration
export LEARNING_CONTRIBUTION_ENABLED=false
export LEARNING_AUTO_ANONYMIZE=true
export LEARNING_REVIEW_REQUIRED=true
```

## Integration with Project State

Community learnings are automatically integrated with project state:

1. **Milestone Triggers**: Project state tracks milestones that trigger prompts
2. **Sprint Completion**: State manager notifies learning system
3. **Capture Context**: Current state included in learnings
4. **Version Tracking**: Learnings tied to system versions

## Contribution Workflow

1. **Trigger Event** (sprint complete, milestone, etc.)
2. **Delay Period** (10 minutes default)
3. **Prompt Display** ("Would you like to contribute learnings?")
4. **Data Capture** (metrics, patterns, insights)
5. **Anonymization** (automatic sanitization)
6. **Review Screen** (user reviews/edits)
7. **Submission** (encrypted upload)
8. **Confirmation** (contribution ID provided)

## Impact Tracking

Your contributions are tracked and measured:

- **Contribution ID**: Unique identifier for your submission
- **Pattern Matches**: How many similar patterns found
- **Implementation Status**: Which improvements were made
- **Impact Metrics**: How improvements affected other projects
- **Recognition**: Contributors acknowledged in releases

## Troubleshooting

### Prompts Not Appearing
1. Check `enabled: true` in configuration
2. Verify trigger events are configured
3. Check minimum sprint duration met
4. Look for prompt delay still active

### Anonymization Issues
1. Enable all privacy settings
2. Review sanitization results carefully
3. Check for custom patterns needed
4. Report missed sensitive data

### Contribution Failures
1. Check network connectivity
2. Verify configuration syntax
3. Review error messages
4. Try manual contribution

## External Projects

When using AgileAiAgents in external projects:

1. Copy community_learnings configuration to project's CLAUDE.md
2. Adjust privacy settings for project requirements
3. Consider organizational policies
4. Test anonymization thoroughly

## Summary

The community learnings configuration provides:
- ✅ Flexible contribution triggers
- ✅ Comprehensive privacy protection
- ✅ Automatic pattern analysis
- ✅ Impact tracking
- ✅ Continuous improvement cycle

Proper configuration ensures your project insights help improve AgileAiAgents while maintaining complete privacy and control over what's shared.