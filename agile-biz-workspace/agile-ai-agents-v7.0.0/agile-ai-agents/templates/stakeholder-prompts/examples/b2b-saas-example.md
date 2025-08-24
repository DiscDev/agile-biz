# Stakeholder Project Prompt - B2B SaaS Example

*This is a filled example for a B2B SaaS project management tool*

---

## Project Information

**Project Name**: TaskFlow Pro  
**Date Prepared**: 2025-01-30  
**Prepared By**: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (Head of Product)  
**Project Type**: [X] New Project  [ ] Existing Project Enhancement

---

## 1. Project Vision* (Required)

### What are we building? (one sentence)
TaskFlow Pro is an AI-powered project management platform that automatically prioritizes tasks and predicts bottlenecks for mid-size software teams.

### Why does this need to exist?
Current project management tools require constant manual updates and don't provide predictive insights, leaving teams reactive rather than proactive to project risks.

### What problem does it solve?
Software teams waste 30% of their time in status meetings and updating project boards, while still missing critical bottlenecks until it's too late to prevent delays.

### What's the vision 3 years from now?
TaskFlow Pro becomes the standard project intelligence platform for software teams of 20-200 people, known for reducing project delays by 40% through AI-driven insights.

---

## 2. Boundaries - What This Is NOT* (Critical - Minimum 5 items)

- This is NOT a general-purpose project management tool like Monday.com or Asana
- This will NOT include time tracking or billing features
- This is NOT for non-technical teams (marketing, sales, HR)
- This will NOT integrate with legacy on-premise systems
- This is NOT competing with Jira for enterprise clients
- This will NOT support waterfall methodology
- This is NOT a code repository or CI/CD platform
- This will NOT include video conferencing or chat

---

## 3. Target Users* (Required)

### Primary User Persona
**Name/Title**: "Alex" - Engineering Manager at growing SaaS company  
**Demographics**: 32-45 years old, based in tech hubs, highly technical  
**Goals**: Ship features on time, keep team productive, identify risks early  
**Pain Points**: Too many status meetings, surprises in sprint reviews, unclear resource allocation  
**Day in the Life**: Starts morning reviewing TaskFlow's AI-generated daily brief showing critical path items and risk alerts, adjusts assignments based on predictions, runs 50% fewer status meetings

### Secondary Users
- **Senior Engineers**: Need clear priorities without micromanagement
- **Product Managers**: Want visibility into realistic timelines
- **CTOs/VPs**: Need high-level metrics and forecasting

### User Problems We're Solving
1. Manual project updates waste 6+ hours per week per manager
2. Bottlenecks aren't visible until they cause delays
3. Resource allocation is based on gut feel rather than data

---

## 4. Success Metrics* (Required)

### Launch Success Criteria
- [X] 10 beta customers using daily within 3 months
- [X] 85% accuracy in bottleneck predictions
- [X] 50% reduction in status meeting time for beta users
- [X] <2 second load time for dashboard

### 6-Month Goals
- 100 paying customers
- $50K MRR
- 4.5+ star rating on review sites
- 80% monthly active user rate

### Growth Metrics
- User activation rate: 60% complete setup within 24 hours
- Team expansion: 70% of accounts add 5+ users within 30 days
- Retention: 90% month-over-month retention

### Quality Metrics
- API response time: <200ms for 95th percentile
- Uptime: 99.9% availability
- Prediction accuracy: >85% for bottleneck detection

---

## 5. Technical Preferences

### Preferred Technology Stack
- Frontend: React with TypeScript
- Backend: Node.js with NestJS
- Database: PostgreSQL for transactions, Redis for caching
- Hosting: AWS with multi-region support

### Must-Have Integrations
- GitHub/GitLab (pull PR and commit data)
- Jira (import existing projects)
- Slack (notifications and daily briefs)
- Google Calendar (meeting analysis)

### Performance Requirements
- Page load time: <2 seconds
- Concurrent users: 10,000+
- Data processing: Analyze 1M events per hour

### Security Requirements
- Authentication: SSO via SAML 2.0
- Data encryption: At rest and in transit
- Compliance: SOC 2 Type II within year 1

### Scalability Needs
- Expected user growth: 10x year over year
- Data growth: 100GB/month increasing
- Geographic distribution: US and EU to start

---

## 6. Business Model

### Revenue Model
- [X] Subscription (SaaS)
- [ ] One-time purchase
- [ ] Freemium
- [ ] Transaction fees
- [ ] Advertising
- [ ] Other

### Pricing Strategy
- Starter: $15/user/month (up to 10 users)
- Professional: $25/user/month (up to 50 users)
- Enterprise: Custom pricing (50+ users)
- Annual discount: 20% off

### Cost Considerations
- Development budget: $500K initial
- Ongoing operational budget: $20K/month
- Time to market: MVP in 6 months

### Market Positioning
- Target market size: 50,000 mid-size software companies
- Our unique position: Only PM tool with true AI predictions, not just automation

---

## 7. Constraints & Risks

### Timeline Constraints
- Must launch before September 2025 (major conference)
- Beta must start by June 2025

### Budget Limitations
- Total budget: $500K for MVP
- Must reach break-even within 18 months

### Technical Constraints
- Must work with: Modern browsers only (no IE support)
- Cannot use: Proprietary AI models (OpenAI/Anthropic OK)
- Platform limitations: SaaS only, no on-premise option

### Known Risks
1. AI predictions could be wrong - mitigation: clear confidence scores
2. Integration complexity - mitigation: phased integration approach
3. User adoption curve - mitigation: excellent onboarding

### Compliance Requirements
- Data privacy laws: GDPR and CCPA compliant
- Accessibility standards: WCAG 2.1 AA

---

## 8. Competition & Differentiation

### Direct Competitors
1. **Linear**
   - What they do well: Beautiful UI, fast performance
   - Where they fall short: No predictive features
   
2. **Height**
   - What they do well: Flexible workflows
   - Where they fall short: Overwhelming for new users
   
3. **Shortcut**
   - What they do well: Developer-focused features
   - Where they fall short: Limited AI capabilities

### How We're Different
- Key differentiator #1: True AI predictions, not just automation
- Key differentiator #2: Focused solely on software teams
- Key differentiator #3: Bottleneck prevention vs. tracking

### Market Gaps We're Filling
Current tools show what happened; we predict what will happen. No existing tool prevents delays before they occur.

### Our Competitive Advantages
- Founding team's 20+ years in project management
- Proprietary prediction algorithm
- Focus on prevention vs. reporting

---

## SaaS-Specific Section

### Subscription Tiers
- **Starter**: Basic predictions, 1 project, email support
- **Professional**: Advanced AI, unlimited projects, chat support
- **Enterprise**: Custom models, dedicated success manager, SLA

### Multi-tenancy Requirements
- Shared infrastructure with isolated databases per customer
- No data bleed between accounts
- Ability to fully export/delete customer data

### User Onboarding Flow
1. Connect GitHub/GitLab (30 seconds)
2. Import current project (2 minutes)
3. AI generates first predictions (instant)
4. See first value in under 5 minutes

### Churn Prevention Strategy
- Weekly AI insights emails showing value
- Quarterly business reviews for large accounts
- Feature usage tracking with proactive outreach

---

## Additional Context

### Existing Materials
- [X] We have design mockups
- [X] We have user research data
- [ ] We have a PRD we can share
- [ ] We have technical specifications
- [X] Other: Competitive analysis deck

### Team Information
- Team size: 8 people (3 eng, 2 product, 1 design, 2 business)
- Key stakeholders: CEO, CTO, VP Product, Lead Investor
- Decision maker: CEO with input from CTO

### Inspirations
- Linear's UI elegance
- Datadog's predictive alerting
- Notion's flexibility

### Open Questions
1. Should we build our own AI or use existing models?
2. How much historical data is needed for accurate predictions?
3. Mobile app in MVP or wait for v2?

---

*This example shows the level of detail and specificity that leads to successful project outcomes.*