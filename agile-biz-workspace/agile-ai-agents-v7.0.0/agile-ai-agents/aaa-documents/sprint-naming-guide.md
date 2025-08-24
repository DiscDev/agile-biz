# Sprint Naming Guide

## Overview
This guide ensures consistent sprint naming across the AgileAiAgents system using current dates rather than hardcoded examples.

## Sprint Naming Format

### Standard Format
```
sprint-YYYY-MM-DD-feature-name
```

### Examples
- `sprint-2025-08-13-authentication-foundation`
- `sprint-2025-08-14-payment-integration`
- `sprint-2025-08-15-dashboard-improvements`

## Implementation

### Automatic Sprint Name Generation

#### Using the Sprint Name Generator Script
```bash
# Generate sprint name with current date
.claude/hooks/sprint-name-generator.sh "feature name"
# Output: sprint-2025-08-13-feature-name
```

#### Using the JavaScript Utility
```javascript
const { generateSprintName } = require('agile-ai-agents/machine-data/utils/sprint-naming');

// Generate with current date
const sprintName = generateSprintName('authentication foundation');
// Result: sprint-2025-08-13-authentication-foundation

// Generate with specific date
const customDate = new Date('2025-09-01');
const futureSprint = generateSprintName('future feature', customDate);
// Result: sprint-2025-09-01-future-feature
```

### Manual Sprint Creation
When creating sprints manually, always use the current date:

1. Get current date: `date +%Y-%m-%d`
2. Format feature name: lowercase, hyphens only
3. Combine: `sprint-[date]-[feature]`

## Common Mistakes to Avoid

### ❌ DON'T Use Hardcoded Example Dates
```
sprint-2025-01-09-authentication  # Wrong - hardcoded January date
```

### ✅ DO Use Current Date
```
sprint-2025-08-13-authentication  # Correct - actual current date
```

### ❌ DON'T Copy Example Sprints Without Updating
When copying from templates, always update the date to the current date.

### ✅ DO Generate Fresh Names
Use the generator scripts or utilities to ensure correct dates.

## Templates and Examples

### For Documentation
When writing documentation or examples, use placeholders:
```
sprint-YYYY-MM-DD-feature-name
```

### For Actual Sprints
Always use the actual current date when creating real sprint folders.

## Migration from Old Sprints

If you have sprints with incorrect dates (e.g., January 2025 when created in August 2025):

1. **Document the actual creation date** in the sprint's README
2. **Keep the folder name** for consistency if work is already done
3. **Use correct dates** for all new sprints going forward

## Sprint Folder Structure

```
project-documents/orchestration/sprints/
├── sprint-2025-08-13-authentication/     # Correct: current date
├── sprint-2025-08-14-payment-gateway/    # Correct: sequential dates
└── sprint-YYYY-MM-DD-feature-name/       # Template placeholder
```

## Integration Points

### Commands
- `/start-sprint [feature-name]` - Automatically uses current date
- `/sprint-status` - Shows active sprint with correct date

### Agents
- `scrum_master_agent` - Creates sprints with current date
- `project_manager_agent` - References sprints by actual date

## Validation

Use the validation utility to check sprint names:
```javascript
const { isValidSprintName } = require('agile-ai-agents/machine-data/utils/sprint-naming');

isValidSprintName('sprint-2025-08-13-auth');  // true
isValidSprintName('sprint-2025-01-09-test');  // true (valid format)
isValidSprintName('sprint-jan-09-test');      // false (invalid date format)
```

## Best Practices

1. **Always use current date** for new sprints
2. **Use placeholders** (YYYY-MM-DD) in templates
3. **Validate sprint names** before creation
4. **Document actual dates** if they differ from folder names
5. **Use generator utilities** rather than manual formatting

## Summary

Correct sprint naming with actual dates ensures:
- Clear timeline tracking
- Accurate historical records
- Proper sprint sequencing
- Easier debugging and auditing

Always generate sprint names dynamically using the current date, never copy hardcoded example dates from templates.

---

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)