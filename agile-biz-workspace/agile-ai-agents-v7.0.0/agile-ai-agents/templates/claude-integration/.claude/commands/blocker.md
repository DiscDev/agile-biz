---
allowed-tools: [Task]
argument-hint: Describe the blocker, dependency, or issue preventing progress
---

# Blocker

Identify, analyze, and resolve development blockers, dependencies, and issues that are preventing progress on tasks or features.

## Usage

```
/blocker [blocker description and impact]
```

**Examples:**
- `/blocker API endpoint not returning expected data format`
- `/blocker Database migration failing on production environment`
- `/blocker Waiting for third-party service access credentials`
- `/blocker Memory leak in React component causing crashes`

## What This Does

1. **Blocker Identification**: Categorize and prioritize the blocking issue
2. **Impact Analysis**: Assess the severity and scope of the blockage
3. **Solution Research**: Investigate potential solutions and workarounds
4. **Escalation Management**: Determine if escalation to other teams is needed
5. **Progress Tracking**: Monitor resolution progress and update stakeholders

## Blocker Categories

### Technical Blockers
- **Code Issues**: Bugs, performance problems, integration failures
- **Infrastructure**: Environment problems, deployment issues, service outages
- **Dependencies**: Third-party APIs, libraries, or services not working
- **Architecture**: Design limitations preventing feature implementation

### Process Blockers
- **Approvals**: Waiting for security, legal, or management approval
- **Reviews**: Code review bottlenecks or feedback cycles
- **Testing**: Testing environment issues or test failures
- **Documentation**: Missing specifications or unclear requirements

### External Blockers
- **Third-party Services**: API outages, rate limits, or access issues
- **Vendor Dependencies**: Library updates, support issues, or compatibility
- **Client Requirements**: Changing requirements or unclear specifications
- **Team Dependencies**: Waiting for other teams to complete prerequisites

### Resource Blockers
- **Knowledge Gaps**: Missing expertise or domain knowledge
- **Tool Access**: Development tool licensing or access issues
- **Environment Constraints**: Hardware limitations or capacity issues
- **Time Constraints**: Unrealistic deadlines or competing priorities

## Blocker Analysis Process

1. **Issue Classification**
   - Identify the type and severity of the blocker
   - Determine which systems or processes are affected
   - Assess the urgency and impact on project timeline
   - Identify stakeholders who need to be informed

2. **Impact Assessment**
   - Evaluate immediate impact on current development work
   - Assess downstream effects on dependent tasks
   - Determine business impact and customer effects
   - Calculate potential delay to project milestones

3. **Solution Investigation**
   - Research potential immediate solutions
   - Identify possible workarounds or alternatives
   - Evaluate solution complexity and implementation time
   - Consider risk factors for each approach

4. **Escalation and Communication**
   - Determine if escalation to other teams is required
   - Identify decision-makers who can help resolve the issue
   - Communicate impact to project managers and stakeholders
   - Document blocker for tracking and historical reference

## Blocker Resolution Strategies

### Immediate Actions
**Quick Wins**:
- Check for simple configuration or setup issues
- Verify all prerequisites and dependencies are met
- Try alternative approaches or tools if available
- Search for existing solutions or community discussions

**Workaround Development**:
- Implement temporary solutions to maintain progress
- Create mock services or data for testing
- Use feature flags to bypass problematic code
- Parallelize work on unblocked components

### Systematic Resolution
**Root Cause Analysis**:
- Trace the issue to its fundamental cause
- Identify contributing factors and conditions
- Review recent changes that might have caused the issue
- Consult logs, monitoring data, and error reports

**Solution Implementation**:
- Plan and execute the most appropriate solution
- Test fixes thoroughly in non-production environments
- Implement gradually with rollback capabilities
- Monitor results and validate resolution

## Example Blocker Analysis

### Technical Blocker: API Integration Issue

**Input**: `/blocker Third-party payment API returning 500 errors for all requests, blocking checkout implementation`

```markdown
## Blocker Analysis: Payment API Integration Failure

### Blocker Summary
- **Type**: Technical - Third-party Service
- **Severity**: CRITICAL 🚨
- **Affected Feature**: User checkout process
- **Impact**: Complete blockage of payment functionality
- **Discovery Date**: January 15, 2024, 10:30 AM
- **Reporter**: Alex Chen (Backend Developer)

### Detailed Description
The Stripe payment API is consistently returning HTTP 500 errors for all API calls, including test transactions. This affects:
- Payment processing during checkout
- Subscription management
- Refund processing
- Payment method management

**Error Details**:
```json
{
  "error": {
    "code": "api_error",
    "message": "We encountered an internal error. Please try again later.",
    "type": "api_error"
  },
  "status": 500
}
```

### Impact Analysis

**Immediate Impact**:
- 🛑 **User Experience**: Customers cannot complete purchases
- 💰 **Revenue**: All payment processing halted (estimated $2,400/hour loss)
- ⚠️ **Development**: 3 developers blocked on payment-related features
- 📅 **Timeline**: Sprint delivery at risk (demo scheduled for January 18)

**Affected Components**:
- Checkout flow (100% blocked)
- Subscription management (75% blocked)
- Order processing (50% blocked)  
- Admin payment dashboard (100% blocked)

**Downstream Dependencies**:
- Frontend checkout UI testing delayed
- Integration testing cannot proceed
- User acceptance testing postponed
- Production deployment blocked

### Investigation Progress

**Timeline of Events**:
- **10:30 AM**: First 500 error detected in staging environment
- **10:45 AM**: Confirmed issue affects all API endpoints
- **11:00 AM**: Verified API credentials and configuration
- **11:15 AM**: Tested with different API keys (same result)
- **11:30 AM**: Checked Stripe Status Page (no reported issues)

**Investigation Steps Completed**:
✅ Verified API credentials are valid and active
✅ Tested from different networks/IPs (same error)
✅ Confirmed issue affects both test and live API keys
✅ Reviewed recent code changes (no payment API changes)
✅ Checked application logs (no client-side errors)
✅ Verified SSL certificates and TLS versions

**Still Investigating**:
🔍 Stripe support ticket submitted (Ticket #12345)
🔍 Testing with curl commands to isolate application vs. API issue
🔍 Reviewing Stripe webhook configuration changes
🔍 Checking for rate limiting or account restrictions

### Current Workaround Options

**Option 1: Alternative Payment Processor** ⭐ RECOMMENDED
- **Approach**: Implement PayPal Express Checkout as backup
- **Implementation Time**: 4-6 hours
- **Pros**: Unblocks development, provides redundancy
- **Cons**: Additional integration complexity, dual payment setup
- **Risk Level**: Low

```javascript
// Quick PayPal integration structure
const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  sandbox: process.env.NODE_ENV !== 'production'
};

const createPayPalOrder = async (amount, currency = 'USD') => {
  // Implementation for PayPal order creation
  return paypalAPI.orders.create({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount
      }
    }]
  });
};
```

**Option 2: Mock Payment Service** 
- **Approach**: Create mock payment service for development/testing
- **Implementation Time**: 2-3 hours
- **Pros**: Fast implementation, continues development flow
- **Cons**: No real payment processing, requires later rework
- **Risk Level**: Low (development only)

**Option 3: Wait for Stripe Resolution**
- **Approach**: Continue monitoring and wait for API restoration
- **Implementation Time**: Unknown (0-24+ hours)
- **Pros**: No code changes required
- **Cons**: Unpredictable timeline, continued development blockage
- **Risk Level**: High (timeline uncertainty)

### Escalation Actions Taken

**Internal Escalation**:
- **10:45 AM**: Notified Development Team Lead (Sarah Kim)
- **11:00 AM**: Informed Product Manager (Mike Rodriguez) 
- **11:30 AM**: Escalated to CTO (Lisa Zhang) due to revenue impact
- **12:00 PM**: Customer support team alerted about potential checkout issues

**External Communication**:
- **11:15 AM**: Stripe support ticket created (Priority: High)
- **11:45 AM**: Follow-up call to Stripe account manager requested
- **12:30 PM**: Stripe developer community forum post created
- **1:00 PM**: Twitter status update prepared (pending approval)

### Resolution Action Plan

**Immediate Actions (Next 2 Hours)**:
1. **Implement PayPal Backup** (Alex Chen, David Park)
   - Set up PayPal developer account and credentials
   - Create basic PayPal integration in payment service
   - Test PayPal flow in development environment
   - Deploy PayPal option to staging for testing

2. **Continue Stripe Investigation** (Maria Santos)
   - Monitor Stripe support ticket for updates
   - Test API from different geographic locations
   - Review Stripe webhook logs for any clues
   - Contact Stripe account manager directly

3. **Stakeholder Communication** (Mike Rodriguez)
   - Update executive team on situation and timeline
   - Prepare customer communication for potential issues
   - Coordinate with customer support on handling inquiries
   - Plan go-live decision process for PayPal backup

**Short-term Actions (Next 24 Hours)**:
- Complete PayPal integration testing and QA
- Monitor Stripe API status and resolution progress
- Implement payment processor selection in admin panel
- Update checkout UI to handle multiple payment options
- Prepare rollback plan if issues arise with workaround

**Long-term Actions (Next Week)**:
- Conduct post-incident review of payment system resilience
- Implement payment processor redundancy as standard practice
- Create monitoring alerts for payment API health
- Document incident response procedures for payment issues

### Communication Plan

**Internal Updates**:
- **Hourly**: Development team Slack updates
- **Every 2 Hours**: Management status email
- **Major Changes**: Immediate notification to all stakeholders

**External Communication**:
- **Customer Support**: Updated scripts for payment-related inquiries
- **Marketing Team**: Prepared social media response if needed
- **Customers**: Proactive communication only if issues persist >4 hours

### Success Metrics

**Resolution Criteria**:
✅ Payment processing restored (either Stripe or PayPal)
✅ All blocked development work can resume
✅ Zero customer checkout failures
✅ Sprint timeline impact minimized (<8 hour delay)

**Quality Gates**:
- Full payment flow testing completed
- Error monitoring and alerting verified  
- Rollback procedures tested and documented
- Post-incident review scheduled within 48 hours

### Learning Opportunities

**Process Improvements Identified**:
1. **Payment Redundancy**: Implement multiple payment processors from start
2. **API Health Monitoring**: Set up automated monitoring for critical third-party APIs
3. **Incident Response**: Improve escalation procedures for revenue-impacting issues
4. **Communication**: Streamline stakeholder notification process

**Technical Improvements**:
1. **Circuit Breaker Pattern**: Implement for external API calls
2. **Fallback Mechanisms**: Design automatic fallback to backup services
3. **Monitoring Dashboards**: Create real-time payment processing health dashboard
4. **Testing Strategy**: Include third-party service failure scenarios in testing

### Current Status: IN PROGRESS

**Next Update**: January 15, 2024 at 2:00 PM
**Assigned Resolver**: Alex Chen (Primary), Maria Santos (Support)
**Expected Resolution**: PayPal backup live by 4:00 PM today
**Stripe Resolution**: Monitoring for updates (unknown timeline)
```

### Process Blocker: Code Review Bottleneck

**Input**: `/blocker Code reviews taking 3+ days to complete, blocking feature delivery`

```markdown
## Blocker Analysis: Code Review Process Bottleneck

### Blocker Summary
- **Type**: Process - Review Workflow
- **Severity**: HIGH ⚠️
- **Impact**: Development velocity significantly reduced
- **Affected**: All feature development (5 developers)
- **Pattern**: Consistent issue over past 2 weeks

### Detailed Description
Code review process has become a significant bottleneck with reviews taking 3-5 days on average to complete. This is causing:
- Feature delivery delays
- Developer context-switching overhead
- Merge conflicts due to delayed integration
- Reduced team productivity and morale

**Current Review Metrics**:
- Average review time: 3.2 days (target: <1 day)
- Reviews pending: 12 PRs (normal: 3-4)
- Reviewers per PR: 2.3 average (policy: minimum 2)
- Review cycles per PR: 2.8 average (target: <2)

### Root Cause Analysis

**Contributing Factors Identified**:

1. **Reviewer Availability** (Primary Cause)
   - Only 2 senior developers qualified for complex reviews
   - Sarah Kim (Lead) reviewing 60% of all PRs
   - Mike Rodriguez traveling 40% of recent period
   - No backup reviewers for specialized components

2. **PR Size and Complexity**
   - Average PR size: 847 lines (recommended: <300)
   - Large features not broken into smaller PRs
   - Complex architectural changes requiring extensive review

3. **Review Process Issues**
   - No automated code quality checks before review
   - Missing PR templates and checklists
   - Unclear review criteria and expectations
   - No escalation process for urgent reviews

4. **Tool and Workflow Problems**
   - GitHub notifications not reaching all reviewers
   - No review assignment rotation system
   - Manual tracking of review status and priorities

### Immediate Solutions Being Implemented

**Solution 1: Expand Reviewer Pool** ⭐ IN PROGRESS
- **Action**: Train 3 mid-level developers as additional reviewers
- **Timeline**: Training sessions this week (Jan 15-19)
- **Owner**: Sarah Kim (Lead Developer)
- **Expected Impact**: 50% reduction in review wait times

```markdown
## New Reviewer Training Plan
### Week 1: Code Review Fundamentals
- Review criteria and standards
- Security considerations checklist
- Performance review guidelines
- Testing requirements verification

### Week 2: Domain-Specific Training
- Frontend component patterns
- Backend API design standards  
- Database change review process
- Integration testing requirements

### Week 3: Shadow Reviews
- Paired reviews with senior developers
- Feedback and coaching sessions
- Independent review practice
- Certification and authorization
```

**Solution 2: Implement PR Size Guidelines** 🚀 STARTING TODAY
- **Policy**: Maximum 300 lines per PR (excluding generated code)
- **Enforcement**: Automated checks in CI/CD pipeline
- **Exception Process**: Architectural changes require pre-approval
- **Support**: Guidelines document and PR template created

**Solution 3: Automated Quality Gates** 🔧 DEPLOYING THIS WEEK
```yaml
# .github/workflows/pr-quality-check.yml
name: PR Quality Check
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR Size
        run: |
          if [ ${{ github.event.pull_request.additions }} -gt 300 ]; then
            echo "PR exceeds 300 line limit. Consider breaking into smaller PRs."
            exit 1
          fi
      
      - name: Run Automated Tests
        run: npm test
        
      - name: Code Quality Analysis
        run: npm run lint:strict
        
      - name: Security Scan
        run: npm audit --audit-level=moderate
```

### Short-term Workarounds (This Week)

**Priority Review Queue**:
- Urgent/blocking PRs get same-day review commitment
- Sprint-critical features reviewed within 24 hours
- Bug fixes prioritized over new features
- Clear labeling system for review priority

**Review Rotation System**:
```javascript
// Simple reviewer assignment rotation
const reviewers = ['sarah.kim', 'mike.rodriguez', 'alex.chen', 'david.park'];
const getNextReviewer = (prAuthor, prNumber) => {
  const availableReviewers = reviewers.filter(r => r !== prAuthor);
  return availableReviewers[prNumber % availableReviewers.length];
};
```

**Pair Review Sessions**:
- Daily 1-hour "review parties" at 2 PM
- Team members review PRs together in real-time
- Faster consensus and knowledge sharing
- Reduces individual review burden

### Long-term Process Improvements

**Review Workflow Redesign** (Next Sprint):
1. **Automated Pre-review Checks**
   - Code style, test coverage, security scans
   - Only human reviewers see PR after automated checks pass
   - Reduces reviewer cognitive load

2. **Domain-based Review Assignment**
   - Frontend specialists review UI changes
   - Backend specialists review API changes
   - Database specialists review schema changes
   - Reduces review time through specialization

3. **Review Metrics and Monitoring**
   - Dashboard tracking review times and bottlenecks
   - Weekly review process health reports
   - Continuous improvement based on data

4. **Knowledge Sharing Program**
   - Regular code review training sessions
   - Best practices documentation and examples
   - Peer mentoring for review skills development

### Impact Mitigation

**Developer Productivity**:
- Allow developers to work on multiple features in parallel
- Implement feature branch strategies to reduce conflicts
- Create "review-ready" branch protections to maintain code quality

**Communication Improvements**:
- Daily stand-up includes review status updates
- Slack notifications for review requests and completions
- Weekly review retrospectives to identify friction points

### Success Metrics

**Target Improvements** (30-day goal):
- Average review time: 3.2 days → <1 day
- Pending PRs: 12 average → <5 average
- Review cycles: 2.8 → <2 average
- Developer satisfaction: Survey score >8/10

**Leading Indicators** (Weekly tracking):
- Number of qualified reviewers (currently 2 → target 5)
- Average PR size (currently 847 lines → target <300)
- Automated check pass rate (target >90%)
- Review assignment distribution (currently 60% Sarah → target <30%)

### Resolution Timeline

**Week 1 (Jan 15-19)**:
- [ ] Complete reviewer training program
- [ ] Implement automated PR size checks
- [ ] Deploy review assignment rotation system
- [ ] Start daily review sessions

**Week 2 (Jan 22-26)**:
- [ ] Measure initial impact of changes
- [ ] Refine review process based on feedback
- [ ] Complete domain-based reviewer specialization
- [ ] Implement review metrics dashboard

**Week 3 (Jan 29 - Feb 2)**:
- [ ] Full process running smoothly
- [ ] Review time targets consistently met
- [ ] Conduct 30-day retrospective
- [ ] Plan next iteration improvements

### Current Status: ACTIVELY RESOLVING

**Next Milestone**: Reviewer training completion by January 19
**Process Owner**: Sarah Kim (Development Lead)
**Success Metric**: <1 day average review time by February 1
**Escalation**: If targets not met by Jan 26, consider external consultant support
```

## Blocker Severity Classification

### CRITICAL 🚨 (Immediate Action Required)
- Complete work stoppage for multiple team members
- Production system outages or security vulnerabilities
- Customer-facing functionality completely broken
- Revenue-impacting issues

### HIGH ⚠️ (Resolution Within 24 Hours)
- Significant development delays or productivity loss
- Major feature functionality impaired
- Important deadlines at risk
- Multiple developers affected

### MEDIUM 🟡 (Resolution Within 48 Hours)
- Isolated feature issues or workarounds available
- Single developer productivity impact
- Non-critical timeline delays
- Performance degradation but system functional

### LOW 🟢 (Resolution Within 1 Week)
- Minor inconveniences or process inefficiencies
- Enhancement requests disguised as blockers
- Nice-to-have features delayed
- Minimal business impact

## Blocker Resolution Best Practices

### Investigation Approach
1. **Reproduce the Issue**: Verify the blocker exists and understand conditions
2. **Gather Context**: Collect logs, error messages, and environmental factors
3. **Research Solutions**: Check documentation, community forums, and similar issues
4. **Test Hypotheses**: Systematically test potential solutions

### Communication Standards
- **Immediate**: Notify affected team members and direct manager
- **Regular Updates**: Provide status updates at defined intervals
- **Resolution Notice**: Confirm resolution and document lessons learned
- **Post-mortem**: Conduct review for critical blockers to prevent recurrence

### Documentation Requirements
- **Issue Description**: Clear, specific description of the blocking condition
- **Impact Assessment**: Business and technical impact quantification
- **Resolution Steps**: Detailed steps taken to resolve the issue
- **Prevention Measures**: Recommendations to avoid similar issues

## Follow-up Actions

After blocker resolution:
- `/task-complete` - Mark resolution complete with outcome summary
- `/capture-learnings` - Document insights gained from blocker resolution
- `/best-practice` - Establish practices to prevent similar blockers
- `/update-state` - Update project status and timeline if needed