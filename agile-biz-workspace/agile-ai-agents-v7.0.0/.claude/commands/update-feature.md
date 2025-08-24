---
allowed-tools: [Task]
argument-hint: Feature name or update type to perform
---

# Update Feature

Modify, enhance, or refactor existing features with proper impact analysis and quality assurance.

## Usage

```
/update-feature [feature-name or update-type]
```

**Examples:**
- `/update-feature user-authentication` - Update authentication feature
- `/update-feature payment-processing` - Modify payment functionality
- `/update-feature performance-optimization` - Optimize existing features
- `/update-feature security-enhancement` - Security improvements

## What This Does

1. **Impact Analysis**: Assess the scope and impact of feature changes
2. **Change Planning**: Plan the update approach and implementation strategy
3. **Implementation**: Execute feature modifications with proper testing
4. **Quality Assurance**: Ensure changes don't break existing functionality
5. **Documentation Updates**: Update documentation and user guides

## Feature Update Analysis

### Current Feature Assessment
```markdown
## Feature Update Analysis

**Feature Name**: [Feature being updated]
**Current Version**: [Version/Release]
**Last Updated**: [Date]
**Update Reason**: [Business driver for change]

### Current Feature State
**Functionality Overview**:
- [Core function 1]: [Current behavior]
- [Core function 2]: [Current behavior]
- [Core function 3]: [Current behavior]

**Technical Architecture**:
- **Frontend Components**: [List of UI components]
- **Backend Services**: [API endpoints and services]
- **Database Tables**: [Data structures involved]
- **External Integrations**: [Third-party services used]

**Performance Metrics**:
- **Response Time**: [Current average]
- **Throughput**: [Requests/transactions per time period]
- **Error Rate**: [Current error percentage]
- **User Adoption**: [Usage statistics]

**Known Issues**:
- [Issue 1]: [Description and impact]
- [Issue 2]: [Description and impact]
- [Technical debt items]: [List of technical concerns]
```

### Update Requirements and Scope
```markdown
## Update Specification

### Business Requirements
**Primary Objectives**:
- [Objective 1]: [Expected business outcome]
- [Objective 2]: [Expected business outcome]
- [Objective 3]: [Expected business outcome]

**Success Criteria**:
- [Metric 1]: [Target value/improvement]
- [Metric 2]: [Target value/improvement]
- [User Experience]: [Expected UX improvements]

### Functional Changes
**New Functionality**:
- [Feature addition 1]: [Description and purpose]
- [Feature addition 2]: [Description and purpose]

**Modified Functionality**:
- [Change 1]: [What changes and why]
- [Change 2]: [What changes and why]

**Removed Functionality**:
- [Removal 1]: [What's being removed and migration plan]
- [Removal 2]: [What's being removed and impact]

### Non-Functional Requirements
**Performance Requirements**:
- [Performance metric]: [Target improvement]
- [Scalability target]: [Expected capacity increase]

**Security Requirements**:
- [Security enhancement 1]: [Description]
- [Compliance requirement]: [Standards to meet]

**Usability Requirements**:
- [UX improvement 1]: [Expected user experience change]
- [Accessibility enhancement]: [Standards compliance]
```

## Impact Analysis and Risk Assessment

### Technical Impact Analysis
```markdown
## Technical Impact Assessment

### System Components Affected
| Component | Impact Level | Changes Required | Risk Level |
|-----------|--------------|------------------|------------|
| [Frontend Component] | High/Med/Low | [Description] | High/Med/Low |
| [API Service] | High/Med/Low | [Description] | High/Med/Low |
| [Database] | High/Med/Low | [Description] | High/Med/Low |
| [Integration] | High/Med/Low | [Description] | High/Med/Low |

### Dependency Analysis
**Downstream Dependencies** (Components that depend on this feature):
- [System/Feature 1]: [How it's affected]
- [System/Feature 2]: [How it's affected]

**Upstream Dependencies** (Components this feature depends on):
- [Service/API 1]: [Dependency type and risk]
- [Service/API 2]: [Dependency type and risk]

### Data Impact
**Database Changes Required**:
- **Schema Changes**: [Tables/columns to modify]
- **Data Migration**: [Data transformation needed]
- **Data Integrity**: [Constraints and validation changes]
- **Performance Impact**: [Index changes, query optimization]

**Data Migration Plan**:
1. [Step 1]: [Migration action and validation]
2. [Step 2]: [Migration action and validation]
3. [Step 3]: [Migration action and validation]
```

### Business Impact Analysis
```markdown
## Business Impact Assessment

### User Impact
**Affected User Groups**:
- [User Type 1]: [How they're affected, impact level]
- [User Type 2]: [How they're affected, impact level]
- [Admin Users]: [Changes to admin functionality]

**User Experience Changes**:
- [Change 1]: [Positive/Negative/Neutral impact]
- [Change 2]: [User training or communication needed]

### Business Process Impact
**Process Changes**:
- [Business Process 1]: [How workflow changes]
- [Business Process 2]: [Impact on operations]

**Operational Impact**:
- **Support Team**: [Changes in support requirements]
- **Content Management**: [Changes in content/configuration]
- **Monitoring**: [New monitoring or alerting needs]

### Stakeholder Impact
| Stakeholder | Impact | Communication Needed | Timeline |
|-------------|--------|---------------------|----------|
| [End Users] | [Impact] | [Message] | [When] |
| [Business Owner] | [Impact] | [Message] | [When] |
| [Support Team] | [Impact] | [Message] | [When] |
```

## Update Implementation Strategy

### Implementation Approach
```markdown
## Implementation Strategy

### Development Approach
**Implementation Method**: [Big Bang/Phased/Feature Toggle/etc.]
- **Rationale**: [Why this approach was chosen]
- **Benefits**: [Advantages of this approach]
- **Risks**: [Risks and mitigation strategies]

### Phased Implementation Plan (if applicable)
**Phase 1**: [Scope and timeline]
- **Goal**: [What this phase achieves]
- **Deliverables**: [Specific outputs]
- **Success Criteria**: [How success is measured]
- **Duration**: [Time estimate]

**Phase 2**: [Scope and timeline]
- **Dependencies**: [What must be complete from Phase 1]
- **New Capabilities**: [What this phase adds]
- **User Impact**: [How users are affected]

**Phase 3**: [Final implementation]
- **Completion Goals**: [Final state achievement]
- **Cleanup Activities**: [Legacy code removal, etc.]

### Feature Toggle Strategy (if applicable)
**Toggle Configuration**:
- **Feature Flag Name**: [Flag identifier]
- **Toggle Scope**: [User groups/percentage/conditions]
- **Rollout Plan**: [Gradual rollout strategy]
- **Rollback Plan**: [How to quickly disable if issues occur]
```

### Technical Implementation Plan
```markdown
## Technical Implementation

### Development Tasks
**Backend Changes**:
- [ ] [API endpoint modification] - [Effort estimate]
- [ ] [Database schema update] - [Effort estimate]
- [ ] [Business logic changes] - [Effort estimate]
- [ ] [Integration updates] - [Effort estimate]

**Frontend Changes**:
- [ ] [UI component updates] - [Effort estimate]
- [ ] [State management changes] - [Effort estimate]
- [ ] [User workflow modifications] - [Effort estimate]
- [ ] [Responsive design updates] - [Effort estimate]

**Infrastructure Changes**:
- [ ] [Configuration updates] - [Effort estimate]
- [ ] [Environment variable changes] - [Effort estimate]
- [ ] [Monitoring/logging enhancements] - [Effort estimate]

### Code Quality Standards
**Code Review Requirements**:
- All changes must be reviewed by [Number] senior developers
- Security review required for authentication/authorization changes
- Performance review required for database or API changes
- UX review required for user-facing changes

**Testing Requirements**:
- Unit test coverage: ≥[Percentage]% for new/modified code
- Integration tests: All API changes must have integration tests
- End-to-end tests: Critical user workflows must be tested
- Performance tests: Changes affecting performance must be load tested
```

## Quality Assurance and Testing

### Testing Strategy
```markdown
## Feature Update Testing Plan

### Test Coverage Areas
**Functional Testing**:
- [Test Area 1]: [What functionality to test]
- [Test Area 2]: [Specific scenarios to validate]
- [Test Area 3]: [Edge cases and error conditions]

**Regression Testing**:
- **Automated Tests**: [Existing test suite coverage]
- **Manual Testing**: [Areas requiring manual verification]
- **Cross-browser Testing**: [Browser/device compatibility]
- **Integration Testing**: [Third-party service connectivity]

### Test Environments
**Development Testing**:
- **Unit Tests**: Run automatically on code changes
- **Integration Tests**: Run on pull request creation
- **Local Testing**: Developer responsibility checklist

**Staging Testing**:
- **Full Feature Testing**: Complete functionality verification
- **Performance Testing**: Load and stress testing
- **Security Testing**: Vulnerability and penetration testing
- **User Acceptance Testing**: Stakeholder validation

**Pre-Production Testing**:
- **Smoke Tests**: Critical functionality verification
- **Database Migration Testing**: Data integrity validation
- **Rollback Testing**: Verify rollback procedures work
```

### Test Cases and Scenarios
```markdown
## Test Scenarios

### Core Functionality Tests
1. **Test Case**: [Primary use case]
   - **Steps**: [Test execution steps]
   - **Expected Result**: [What should happen]
   - **Pass Criteria**: [Success conditions]

2. **Test Case**: [Edge case scenario]
   - **Steps**: [Test execution steps]  
   - **Expected Result**: [What should happen]
   - **Error Handling**: [How errors should be handled]

### Regression Test Scenarios
1. **Existing Feature**: [Feature that shouldn't be affected]
   - **Test**: [How to verify it still works]
   - **Risk**: [What could go wrong]

2. **Integration Point**: [System integration to verify]
   - **Test**: [Integration verification steps]
   - **Fallback**: [What happens if integration fails]

### Performance Test Scenarios
- **Load Testing**: [Expected load and response criteria]
- **Stress Testing**: [Breaking point identification]
- **Endurance Testing**: [Long-running stability verification]
```

## Deployment and Rollout Planning

### Deployment Strategy
```markdown
## Deployment Plan

### Pre-Deployment Checklist
- [ ] All code changes reviewed and approved
- [ ] Test suite passing (unit, integration, e2e)
- [ ] Database migration scripts tested
- [ ] Configuration changes documented and ready
- [ ] Rollback plan documented and tested
- [ ] Stakeholder communication prepared
- [ ] Monitoring and alerting updated

### Deployment Sequence
**Step 1: Database Migration** (if required)
- **Action**: [Migration steps]
- **Validation**: [How to verify success]
- **Rollback**: [How to reverse if needed]

**Step 2: Application Deployment**
- **Method**: [Blue-green/Rolling/etc.]
- **Validation**: [Health checks and smoke tests]
- **Monitoring**: [Key metrics to watch]

**Step 3: Feature Activation**
- **Feature Toggle**: [How to enable the feature]
- **Gradual Rollout**: [Percentage rollout plan]
- **User Communication**: [How users are informed]

### Post-Deployment Monitoring
**Immediate Monitoring** (First 24 hours):
- **Error Rates**: Monitor for increase in errors
- **Performance**: Watch response times and throughput
- **User Behavior**: Track feature adoption and usage
- **Support Tickets**: Monitor for user issues

**Extended Monitoring** (First Week):
- **Business Metrics**: Track success criteria metrics
- **System Performance**: Ensure no degradation
- **User Feedback**: Collect and analyze user responses
```

### Rollback Planning
```markdown
## Rollback Strategy

### Rollback Triggers
**Automatic Rollback Conditions**:
- Error rate exceeds [Percentage]%
- Response time degrades by more than [Percentage]%
- Critical functionality completely broken
- Database integrity issues detected

**Manual Rollback Conditions**:
- Significant negative user feedback
- Business metric degradation beyond acceptable levels
- Security vulnerability discovered
- Stakeholder decision to revert

### Rollback Procedures
**Quick Rollback** (Feature Toggle):
1. Disable feature flag in [System]
2. Verify feature is disabled for users
3. Monitor for immediate improvement
4. Communicate status to stakeholders

**Full Rollback** (Code Revert):
1. Revert application code to previous version
2. Rollback database migrations (if safe)
3. Restore previous configuration
4. Validate system functionality
5. Communicate rollback completion

### Rollback Testing
- [ ] Rollback procedures tested in staging environment
- [ ] Data integrity verified after rollback
- [ ] All dependent systems function after rollback
- [ ] Communication plan for rollback scenarios prepared
```

## Documentation and Communication

### Documentation Updates
```markdown
## Documentation Requirements

### Technical Documentation
- [ ] **API Documentation**: Update Swagger/OpenAPI specs
- [ ] **Database Documentation**: Update schema documentation  
- [ ] **Architecture Documentation**: Update system diagrams
- [ ] **Deployment Documentation**: Update deployment procedures
- [ ] **Monitoring Documentation**: Update alerting and monitoring guides

### User Documentation
- [ ] **User Guides**: Update feature usage instructions
- [ ] **FAQ Updates**: Add common questions about changes
- [ ] **Video Tutorials**: Create or update instructional videos
- [ ] **Release Notes**: Document user-facing changes

### Operational Documentation
- [ ] **Support Runbooks**: Update troubleshooting procedures
- [ ] **Configuration Documentation**: Document new settings
- [ ] **Monitoring Playbooks**: Update alerting procedures
- [ ] **Security Documentation**: Update security procedures
```

### Stakeholder Communication
```markdown
## Communication Plan

### Pre-Release Communication
**Stakeholders**: [Product Owner, Users, Support Team]
- **Message**: [Summary of changes and benefits]
- **Timeline**: [When communication happens]
- **Channel**: [Email, meeting, documentation]
- **Action Required**: [What stakeholders need to do]

### Release Communication
**User Announcement**:
- **Subject**: [Clear, benefit-focused subject line]
- **Content**: [Feature benefits and how to use]
- **Training**: [Available resources for learning new features]
- **Support**: [Where to get help]

### Post-Release Communication
**Success Metrics Communication**:
- **Audience**: [Stakeholders interested in results]
- **Metrics**: [Key success indicators achieved]
- **Timeline**: [Regular reporting schedule]
- **Next Steps**: [Future improvements planned]
```

## Success Metrics and Monitoring

### Success Criteria Measurement
```markdown
## Feature Update Success Metrics

### Business Metrics
| Metric | Baseline | Target | Current | Status |
|--------|----------|---------|---------|--------|
| [Business KPI 1] | [Value] | [Target] | [Current] | [Status] |
| [Business KPI 2] | [Value] | [Target] | [Current] | [Status] |
| [User Satisfaction] | [Score] | [Target] | [Current] | [Status] |

### Technical Metrics
| Metric | Baseline | Target | Current | Status |
|--------|----------|---------|---------|--------|
| [Response Time] | [ms] | [Target ms] | [Current ms] | [Status] |
| [Error Rate] | [%] | [Target %] | [Current %] | [Status] |
| [Throughput] | [req/sec] | [Target] | [Current] | [Status] |

### User Experience Metrics
- **Feature Adoption Rate**: [Percentage] of users using new functionality
- **User Feedback Score**: [Rating] average user satisfaction
- **Support Ticket Volume**: [Change] in support requests
- **Task Completion Rate**: [Percentage] successful task completions
```

### Continuous Monitoring
```markdown
## Ongoing Monitoring Plan

### Daily Monitoring
- **Performance Dashboards**: Key metrics visualization
- **Error Tracking**: Monitor error rates and types
- **User Feedback**: Collect and categorize user reports
- **Business Metrics**: Track key business indicators

### Weekly Reviews
- **Success Metrics Review**: Progress against targets
- **User Feedback Analysis**: Themes and improvement opportunities
- **Performance Trends**: Identify degradation or improvement patterns
- **Action Item Review**: Progress on post-release improvements

### Monthly Analysis
- **Feature Usage Analytics**: Deep dive into usage patterns
- **Business Impact Assessment**: ROI and business value measurement
- **Technical Debt Assessment**: Identify areas needing attention
- **Future Enhancement Planning**: Plan next iteration of improvements
```

## Follow-up Actions

After feature update:
- `/test` - Execute comprehensive testing suite
- `/performance-report` - Generate performance analysis
- `/deployment-success` - Verify deployment completion
- Monitor feature usage and performance metrics
- Collect user feedback and plan next iteration
- Document lessons learned for future updates