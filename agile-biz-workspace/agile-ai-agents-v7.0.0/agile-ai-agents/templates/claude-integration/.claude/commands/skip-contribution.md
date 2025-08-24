---
allowed-tools: [Task]
argument-hint: Specify the learning or contribution to skip with reason
---

# Skip Contribution

Remove a captured learning from the community contribution pipeline while preserving it for internal reference and team knowledge sharing.

## Usage

```
/skip-contribution [learning/contribution item] [reason]
```

**Examples:**
- `/skip-contribution React optimization guide - too specific to our use case`
- `/skip-contribution Database migration strategy - company confidential information`
- `/skip-contribution API design patterns - already covered by existing community content`
- `/skip-contribution Authentication implementation - security concerns with public sharing`

## What This Does

1. **Pipeline Management**: Remove item from active contribution workflow
2. **Reason Documentation**: Record why contribution was skipped for future reference
3. **Internal Preservation**: Keep learning available for team and company use
4. **Resource Reallocation**: Free up resources for more suitable contribution candidates
5. **Alternative Actions**: Suggest other ways to leverage the learning internally

## Common Skip Reasons

### Confidentiality and Security
- **Proprietary Information**: Contains company-specific details or trade secrets
- **Security Concerns**: Could expose vulnerabilities or sensitive implementation details
- **Client Data**: Includes confidential client information or case studies
- **Competitive Advantage**: Sharing would reduce company's competitive position

### Content Suitability
- **Too Specific**: Solution too narrow or specific to be broadly applicable
- **Incomplete Solution**: Learning doesn't provide complete, actionable guidance
- **Temporary Workaround**: Represents temporary fix rather than best practice
- **Outdated Technology**: Based on deprecated or soon-to-be-replaced technology

### Community Landscape
- **Already Covered**: Existing community content addresses the same topic adequately
- **Low Community Interest**: Topic has limited audience or engagement potential
- **Platform Mismatch**: Content doesn't align with target community standards
- **Timing Issues**: Market timing not right for this type of contribution

### Resource Constraints
- **High Maintenance**: Would require ongoing maintenance beyond available resources
- **Complex Preparation**: Requires more effort than potential community impact justifies
- **Missing Prerequisites**: Lacks necessary supporting materials or context
- **Team Capacity**: Current team bandwidth insufficient for proper contribution development

## Skip Decision Process

1. **Learning Assessment**
   - Review the captured learning for contribution potential
   - Identify any barriers to public sharing
   - Assess resource requirements vs. community impact
   - Consider alternative internal applications

2. **Reason Documentation**
   - Record specific reason for skipping
   - Note any confidentiality or security concerns
   - Document potential future reconsideration conditions
   - Identify lessons for future contribution selection

3. **Internal Value Preservation**
   - Maintain learning in internal knowledge base
   - Tag for team reference and training use
   - Consider for internal documentation or best practices
   - Evaluate for internal training or workshop material

4. **Resource Reallocation**
   - Remove from contribution development timeline
   - Reallocate assigned resources to other contributions
   - Update contribution pipeline and metrics
   - Notify team members of pipeline changes

## Alternative Applications

### Internal Knowledge Sharing
- **Team Documentation**: Convert to internal best practices guide
- **Training Material**: Use for onboarding or skill development sessions
- **Process Improvement**: Apply insights to improve internal workflows
- **Code Standards**: Incorporate into company coding standards and guidelines

### Modified Contribution Approaches
- **Abstracted Version**: Remove company-specific details and create generalized version
- **Collaborative Post**: Partner with other companies to create industry best practices
- **Academic Sharing**: Share with research institutions or educational platforms
- **Conference Presentation**: Present at industry conferences with permission

### Future Reconsideration
- **Technology Evolution**: Revisit when technology or market conditions change
- **Policy Changes**: Reconsider if company sharing policies evolve
- **Competitive Landscape**: Reevaluate if competitive concerns change
- **Community Needs**: Monitor for increased community interest in the topic

## Example Skip Decisions

### Skip Decision: Database Migration Strategy

**Input**: `/skip-contribution Database migration strategy - contains proprietary customer data and specific infrastructure details`

```markdown
## Skip Decision: Database Migration Strategy Learning

### Learning Details
- **Topic**: Zero-downtime database migration for high-traffic e-commerce platform
- **Source**: Customer X migration project (Q4 2023)
- **Original Value**: Detailed case study with performance metrics and lessons learned
- **Potential Impact**: High - addresses common enterprise challenge

### Skip Reason: Confidentiality Concerns
**Primary Reason**: Proprietary customer information
- Contains specific customer traffic patterns and business metrics
- Includes infrastructure details that could reveal system vulnerabilities
- References proprietary tools and internal processes
- Customer data sharing agreement prohibits public case studies

**Secondary Concerns**:
- Migration strategy reveals competitive advantages in our platform
- Specific performance metrics could impact customer relationships
- Internal tooling references not suitable for public sharing

### Alternative Applications

**Internal Use**:
✅ **Team Training Material**
- Use as case study for database team onboarding
- Create internal workshop on migration best practices
- Develop standard operating procedures for future migrations

✅ **Process Documentation**
- Update internal migration playbook with lessons learned
- Create checklist template for future zero-downtime migrations
- Document rollback procedures and contingency planning

✅ **Client Presentations**
- Create anonymized success story for sales presentations
- Develop case study template for marketing materials (with approval)
- Use metrics for capacity planning and resource estimation

**Modified Contribution Potential**:
🔄 **Future Consideration**
- Create generalized version removing customer-specific details
- Partner with other companies to create industry best practices guide
- Consider academic collaboration for research publication
- Revisit in 12 months when customer agreement allows

### Documentation Updates
- Removed from contribution pipeline (Jan 15, 2024)
- Added to internal knowledge base under "Enterprise Migration Patterns"
- Tagged for future reconsideration (Jan 2025)
- Assigned to database team for internal process improvement

### Lessons for Future Contributions
1. Evaluate customer data exposure earlier in capture process
2. Create anonymized templates during project execution
3. Establish clear guidelines for customer data in learnings
4. Consider contribution potential during project planning phase

### Resource Reallocation
- **Development Time**: 15 hours freed up for other contributions
- **Review Resources**: Senior database architect available for other reviews
- **Priority Shift**: Focus resources on React optimization guide (ready for publication)
```

### Skip Decision: Authentication Implementation

**Input**: `/skip-contribution OAuth implementation approach - security concerns with detailed implementation sharing`

```markdown
## Skip Decision: OAuth Implementation Learning

### Learning Details
- **Topic**: Custom OAuth provider implementation with advanced security features
- **Source**: User authentication system redesign (Q1 2024)
- **Technical Depth**: Detailed implementation with security configurations
- **Potential Audience**: Authentication specialists, security engineers

### Skip Reason: Security Concerns
**Primary Reason**: Security implementation exposure
- Detailed security configurations could reveal attack vectors
- Custom implementation details might expose vulnerabilities
- Token generation and validation logic too sensitive for public sharing
- Compliance requirements restrict sharing of authentication internals

**Risk Assessment**:
- High: Could aid malicious actors in finding system weaknesses
- Medium: Competitors could replicate competitive security features
- Low: General community impact from withholding this information

### Alternative Applications

**Internal Security Enhancement**:
✅ **Security Training Program**
- Use as advanced training material for security team
- Create internal workshops on OAuth implementation best practices
- Develop security review checklist for authentication systems

✅ **Internal Standards Development**
- Update company authentication standards with new insights
- Create reusable authentication components for internal projects
- Establish security review process for authentication changes

**Modified Sharing Approach**:
🔄 **High-Level Best Practices**
- Create general authentication security principles blog post
- Share architectural patterns without implementation details
- Focus on decision-making process rather than specific code
- Emphasize testing and validation approaches

### Resource Reallocation
- **Security Review Time**: 8 hours reallocated to API security documentation
- **Writing Resources**: Redirect to database performance optimization guide
- **Community Engagement**: Focus on less sensitive technical topics

### Future Consideration Criteria
- Industry security landscape changes
- Company policy updates on security sharing
- Community development of security-focused contribution guidelines
- Availability of sanitized, generic implementation examples

### Team Communication
- Notified security team of decision (Jan 16, 2024)
- Updated contribution pipeline dashboard
- Communicated resource reallocation to documentation team
- Added to internal authentication best practices repository
```

## Quality Assurance for Skip Decisions

### Decision Review Checklist
- [ ] **Reason Clarity**: Skip reason clearly documented and justified
- [ ] **Internal Value**: Learning preserved for internal use
- [ ] **Alternative Paths**: Other applications or modified sharing considered
- [ ] **Resource Impact**: Resources properly reallocated to other priorities
- [ ] **Future Review**: Conditions for reconsideration documented

### Skip Decision Categories Tracking
- **Security/Confidentiality**: 40% of skipped contributions
- **Content Quality**: 25% of skipped contributions  
- **Community Duplication**: 20% of skipped contributions
- **Resource Constraints**: 15% of skipped contributions

### Process Improvements from Skip Analysis
1. **Earlier Evaluation**: Assess contribution potential during learning capture
2. **Clear Guidelines**: Develop criteria for contribution suitability assessment
3. **Template Creation**: Create templates for sanitizing sensitive information
4. **Policy Documentation**: Establish clear company policies on technical sharing

## Follow-up Actions

After skipping a contribution:
- `/capture-learnings` - Document new insights about contribution selection
- `/contribution-status` - Review updated contribution pipeline
- `/best-practice` - Update internal best practices with skipped learning
- `/generate-documentation` - Create internal documentation from skipped content