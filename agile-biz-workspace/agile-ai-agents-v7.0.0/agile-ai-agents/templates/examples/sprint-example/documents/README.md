# Sprint Documents Folder

## Purpose
This `documents/` folder is a flexible space for any additional documentation that doesn't fit into the standard sprint folder structure but is specific to this sprint.

## What Goes Here

### Technical Documentation
- Architecture decision records (ADRs)
- Technical design documents
- API contracts and specifications
- Database schema changes
- Performance benchmarks

### Process Documentation  
- Special procedures for this sprint
- Temporary workarounds
- Migration guides
- Configuration changes

### Communication Records
- Important email threads
- Slack conversations archived
- Meeting notes outside standard ceremonies
- Vendor communications

### Research & Analysis
- Spike results
- POC documentation
- Technology evaluations
- Competitive analysis

### Compliance & Security
- Security review reports
- Compliance checklists
- Audit preparations
- Risk assessments

## Guidelines

1. **Naming Convention**: Use descriptive names with dates where relevant
   - `2025-01-15-oauth-provider-comparison.md`
   - `api-contract-v2-draft.md`
   - `security-review-findings.md`

2. **Organization**: Create subfolders if many documents accumulate
   - `documents/security/`
   - `documents/research/`
   - `documents/decisions/`

3. **Lifecycle**: These documents live with the sprint
   - Reference them in sprint reviews if relevant
   - Archive with the sprint when complete
   - Extract reusable content to permanent locations

## What Does NOT Go Here

- Sprint planning documents → Use `planning/` folder
- Test artifacts → Use `testing/` folder  
- Daily standups → Use `daily-updates/` folder
- Sprint reviews → Use `reviews/` folder
- Retrospectives → Use `retrospectives/` folder
- Items for other sprints → Create in appropriate sprint folder
- Permanent documentation → Move to project-wide docs

## Examples

- Performance testing results that influenced design decisions
- Vendor API documentation referenced during implementation
- Spike outcome that led to architecture choice
- Emergency hotfix documentation
- Customer feedback that changed requirements mid-sprint

---

Remember: This folder provides flexibility while maintaining sprint organization. Use it for sprint-specific content that doesn't fit elsewhere.