---
allowed-tools: Read(*), Write(*), Bash(date:*)
description: Document important project decision
argument-hint: "<decision-text>"
---

# Save Project Decision

Document an important project decision for future reference and audit trail.

## Process Decision

1. **Validate Input**
   - Ensure $ARGUMENTS contains decision text
   - If empty, prompt user to provide decision details

2. **Create Decision Record**
   ```json
   {
     "id": "decision-[timestamp]",
     "timestamp": "[ISO timestamp]",
     "decision": "$ARGUMENTS",
     "context": "[current phase/sprint]",
     "impact": "[detected impact area]",
     "category": "[technical/business/process]"
   }
   ```

3. **Save Decision**
   - Append to `project-state/decisions/decisions-log.json`
   - Add to `project-documents/orchestration/stakeholder-decisions.md`
   - Update workflow state with decision reference

4. **Categorize Decision**
   Automatically categorize based on keywords:
   - Technical: architecture, framework, database, API
   - Business: pricing, market, customer, revenue
   - Process: workflow, sprint, timeline, team

## Output Format

```
✅ Decision Recorded
==================

📝 Decision: $ARGUMENTS
🏷️ Category: [Category]
🕐 Timestamp: [ISO timestamp]
📁 Saved to: stakeholder-decisions.md

This decision has been permanently recorded in the project history.
```

## Integration

- Decisions affect future agent recommendations
- Available in sprint reviews and retrospectives
- Included in project documentation