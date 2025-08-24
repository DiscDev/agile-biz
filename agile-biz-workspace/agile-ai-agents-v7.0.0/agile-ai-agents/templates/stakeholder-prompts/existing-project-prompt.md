# Stakeholder Prompt Template - Existing Project Enhancement

*This template helps you provide comprehensive information about your existing project and desired enhancements before the stakeholder interview. Taking time to fill this out will result in better-targeted improvements.*

**Instructions**: 
- Fill out all required sections (marked with *)
- Focus on what needs to change/improve
- Be specific about pain points and constraints
- Export from Google Docs as Markdown when complete

---

## Project Information

**Project Name**: [Your existing project name]  
**Date Prepared**: [Date]  
**Prepared By**: [Names/roles of contributors]  
**Project Age**: [How long has it been in production?]  
**Current Version**: [Version number if applicable]

---

## 1. Current State Assessment* (Required)

### What is this project? (one sentence)
[Describe what your project currently does]

### Original Vision vs. Reality
**Original Intent**: [What it was meant to be]  
**Current Reality**: [What it actually became]  
**Drift Areas**: [Where it deviated from original vision]

### What's Working Well
1. [Successful feature/aspect #1]
2. [Successful feature/aspect #2]
3. [Successful feature/aspect #3]

### What's Not Working
1. [Problem area #1]
2. [Problem area #2]
3. [Problem area #3]

---

## 2. Enhancement Goals* (Required)

### Primary Enhancement Objective (one sentence)
[What's the main thing you want to achieve with this enhancement?]

### Why Enhance Now?
- Business driver: [What's pushing this change?]
- User feedback: [What are users asking for?]
- Technical debt: [What needs fixing?]
- Market pressure: [What's changed in the market?]

### Success Definition
[How will you know the enhancement is successful?]

---

## 3. What Must NOT Change* (Critical)

*This section prevents breaking existing functionality or user workflows*

- MUST maintain: [Critical feature/integration #1]
- MUST preserve: [User workflow #2]
- CANNOT break: [Integration/API #3]
- MUST support: [Legacy requirement #4]
- CANNOT remove: [Feature some users depend on #5]
- [Add more as needed...]

---

## 4. Current Users & Usage* (Required)

### Current User Base
- Total users: [Number or range]
- Active users: [Daily/Monthly active]
- User segments: [Different types of users]

### Usage Patterns
- Most used features: [Top 3-5]
- Least used features: [Bottom 3-5]
- Peak usage times: [When/why]

### User Feedback Summary
**Common Complaints**:
1. [Complaint #1]
2. [Complaint #2]
3. [Complaint #3]

**Common Requests**:
1. [Request #1]
2. [Request #2]
3. [Request #3]

---

## 5. Technical Current State* (Required)

### Technology Stack
- Frontend: [Current technology]
- Backend: [Current technology]
- Database: [Current system]
- Hosting: [Current platform]
- Key dependencies: [Critical libraries/services]

### Technical Debt
1. **[Area #1]**: [Description and impact]
2. **[Area #2]**: [Description and impact]
3. **[Area #3]**: [Description and impact]

### Performance Issues
- Current bottlenecks: [Where/why]
- Scaling challenges: [Current limitations]
- Reliability issues: [Downtime/errors]

### Security Status
- Known vulnerabilities: [If any]
- Compliance gaps: [If any]
- Security debt: [Areas needing attention]

---

## 6. Enhancement Scope* (Required)

### Must Have Enhancements
1. [ ] [Enhancement #1 - why critical]
2. [ ] [Enhancement #2 - why critical]
3. [ ] [Enhancement #3 - why critical]

### Should Have Enhancements
1. [ ] [Enhancement #1 - why important]
2. [ ] [Enhancement #2 - why important]

### Nice to Have Enhancements
1. [ ] [Enhancement #1 - why valuable]
2. [ ] [Enhancement #2 - why valuable]

### Out of Scope (NOT doing)
- NOT adding: [Feature/capability #1]
- NOT changing: [System/process #2]
- NOT supporting: [Platform/integration #3]

---

## 7. Constraints & Risks

### Migration Constraints
- Downtime tolerance: [None/minutes/hours]
- Data migration: [Requirements/challenges]
- User training: [Needs/timeline]

### Backward Compatibility
- APIs that must remain: [List]
- Data formats to support: [List]
- Integrations to maintain: [List]

### Resource Constraints
- Budget: [Available budget]
- Timeline: [Deadline/milestones]
- Team availability: [Who can work on this]

### Technical Constraints
- Must stay on: [Platform/technology]
- Cannot use: [Prohibited tech]
- Must integrate with: [Systems]

### Business Risks
1. [Risk if we do this enhancement]
2. [Risk if we don't do this enhancement]
3. [Risk during transition]

---

## 8. Success Metrics

### Enhancement KPIs
- Performance improvement: [Target metrics]
- User satisfaction: [Target increase]
- Cost reduction: [Target savings]
- Revenue impact: [Expected change]

### Technical Metrics
- Response time: [Target improvement]
- Error rate: [Target reduction]
- Uptime: [Target percentage]
- Resource usage: [Target optimization]

### User Metrics
- Adoption rate: [Target for new features]
- Task completion: [Target improvement]
- Support tickets: [Target reduction]

---

## 9. Existing Documentation

### Available Resources
- [ ] Current architecture diagrams
- [ ] API documentation
- [ ] User manuals
- [ ] Deployment guides
- [ ] Test suites
- [ ] Performance benchmarks
- [ ] Database schemas
- [ ] Business logic documentation

### Code Quality
- Test coverage: [Current percentage]
- Code documentation: [Status]
- Technical debt tracking: [Where/how]

---

## 10. Migration Strategy Preferences

### Approach Preference
- [ ] Big bang (all at once)
- [ ] Gradual migration
- [ ] Parallel run
- [ ] Feature flags
- [ ] Blue-green deployment

### User Communication
- How to notify users: [Method]
- Training needs: [What's required]
- Documentation updates: [What needs updating]

---

## Optional Enhancement-Specific Sections

### For Performance Enhancements
- Current benchmarks: [Specific numbers]
- Target improvements: [Specific goals]
- Bottleneck analysis: [Already completed?]

### For UI/UX Enhancements
- User research data: [Available?]
- Design mockups: [Existing?]
- Accessibility audit: [Completed?]

### For Security Enhancements
- Recent security audit: [Date/findings]
- Compliance requirements: [New/changed]
- Threat model: [Current state]

### For Scalability Enhancements
- Current limits: [Users/data/transactions]
- Growth projections: [Expected increase]
- Architecture changes: [Needed modifications]

### For Integration Enhancements
- New systems to connect: [List]
- API changes needed: [List]
- Data synchronization: [Requirements]

---

## Additional Context

### Competitive Pressure
- Competitors who do this better: [Names]
- Features we're missing: [List]
- Market expectations: [What's standard now]

### Previous Enhancement Attempts
[Describe any previous attempts to enhance/fix these issues]

### Team Knowledge
- Original developers available: [Yes/No/Partial]
- Documentation quality: [Good/Fair/Poor]
- Tribal knowledge risks: [Areas only certain people know]

### Open Questions
[List any questions or uncertainties about the enhancement]

### Dependencies
- External services: [That might be affected]
- Other systems: [That depend on this]
- Scheduled changes: [That might conflict]

---

## Enhancement Priority Matrix

| Enhancement | User Impact | Technical Effort | Business Value | Risk |
|------------|-------------|------------------|----------------|------|
| [Feature 1] | High/Med/Low | High/Med/Low | High/Med/Low | High/Med/Low |
| [Feature 2] | High/Med/Low | High/Med/Low | High/Med/Low | High/Med/Low |
| [Feature 3] | High/Med/Low | High/Med/Low | High/Med/Low | High/Med/Low |

---

## Prompt Quality Self-Assessment

Before submitting, check:
- [ ] Current state honestly assessed
- [ ] "Must NOT change" list is comprehensive
- [ ] Enhancement scope is clear and prioritized
- [ ] Success metrics are measurable
- [ ] Constraints are fully documented
- [ ] Technical debt is acknowledged
- [ ] User feedback is incorporated

---

*Thank you for taking the time to provide this detailed information about your existing project. This will help us create a targeted enhancement plan that improves your project while maintaining its current strengths.*