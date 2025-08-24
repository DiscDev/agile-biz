# Stakeholder Prompt Template - Existing Project Enhancement Example

*This is a filled example for enhancing an existing e-commerce marketplace*

---

## Project Information

**Project Name**: ArtisanMarket  
**Date Prepared**: 2025-01-30  
**Prepared By**: Jennifer Wu (CTO), Carlos Rodriguez (Head of Product), Amy Chen (Customer Success Lead)  
**Project Age**: 3.5 years in production  
**Current Version**: v2.8.4

---

## 1. Current State Assessment* (Required)

### What is this project? (one sentence)
ArtisanMarket is a curated online marketplace connecting independent artisans with customers seeking unique, handmade products.

### Original Vision vs. Reality
**Original Intent**: Premium marketplace for high-end artisan goods with careful curation  
**Current Reality**: Became a general handmade goods platform with quality variance  
**Drift Areas**: Lost curation focus, allowed mass-produced items, pricing race to bottom

### What's Working Well
1. Strong artisan community (12,000 active sellers)
2. Excellent mobile experience (65% of traffic)
3. Robust review and rating system

### What's Not Working
1. Search is terrible - customers can't find quality items
2. No way to distinguish premium artisans from hobbyists
3. Checkout abandonment at 68% (industry avg: 45%)

---

## 2. Enhancement Goals* (Required)

### Primary Enhancement Objective (one sentence)
Transform ArtisanMarket back into a premium curated marketplace with AI-powered discovery and streamlined purchasing.

### Why Enhance Now?
- Business driver: Revenue per transaction down 40% due to quality dilution
- User feedback: "Can't find the good stuff anymore" (repeated in 60% of surveys)
- Technical debt: Search built on 2019 tech, can't handle current scale
- Market pressure: New premium competitors gaining our high-value customers

### Success Definition
Return to premium positioning with 50% increase in average order value and 30% reduction in checkout abandonment within 6 months.

---

## 3. What Must NOT Change* (Critical)

- MUST maintain: Existing seller accounts and product listings
- MUST preserve: Current URL structure (SEO rankings)
- CANNOT break: Payment processing integrations (Stripe, PayPal)
- MUST support: Existing mobile apps until v3 ready
- CANNOT remove: Seller analytics dashboard (even if redesigned)
- MUST keep: All transaction history and reviews
- CANNOT change: Seller payout schedules or fee structure

---

## 4. Current Users & Usage* (Required)

### Current User Base
- Total users: 850,000 registered
- Active users: 125,000 monthly active buyers
- User segments: 
  - Premium buyers (15%): $200+ average order
  - Regular buyers (60%): $50-200 orders  
  - Bargain hunters (25%): <$50 orders

### Usage Patterns
- Most used features: Browse by category, seller profiles, wishlists
- Least used features: Advanced search, gift registry, wholesale ordering
- Peak usage times: Weekends, holiday seasons (3x normal traffic)

### User Feedback Summary
**Common Complaints**:
1. "Search never shows what I'm looking for"
2. "Too many cheap knockoffs now"
3. "Checkout takes forever with too many steps"

**Common Requests**:
1. "Bring back the curated collections"
2. "Let me filter by truly handmade/artisan quality"
3. "Save my payment info securely"

---

## 5. Technical Current State* (Required)

### Technology Stack
- Frontend: React 16 (needs update)
- Backend: Ruby on Rails 5.2
- Database: PostgreSQL 11, Redis
- Hosting: AWS US-East-1 only
- Key dependencies: Elasticsearch 6.8, Sidekiq, ImageMagick

### Technical Debt
1. **Search Infrastructure**: Elasticsearch cluster can't handle current load, no ML capabilities
2. **Frontend Performance**: Bundle size 2.4MB, Core Web Vitals failing
3. **Database**: Need sharding strategy, currently hitting connection limits

### Performance Issues
- Current bottlenecks: Search queries timeout, image processing backlog
- Scaling challenges: Single region, no CDN for international users
- Reliability issues: 99.5% uptime (need 99.9%), search downtime weekly

### Security Status
- Known vulnerabilities: 3 medium CVEs in dependencies
- Compliance gaps: Need PCI DSS Level 1 (currently Level 2)
- Security debt: No 2FA for sellers, basic password requirements

---

## 6. Enhancement Scope* (Required)

### Must Have Enhancements
1. [X] AI-powered search and discovery - find quality items instantly
2. [X] Premium seller tier with verification - restore curation
3. [X] One-page checkout with saved payments - reduce abandonment

### Should Have Enhancements
1. [X] Personalized homepage based on preferences and history
2. [X] Virtual artisan studio tours for premium sellers

### Nice to Have Enhancements
1. [X] AR preview for home decor items
2. [X] Social shopping features with wishlists

### Out of Scope (NOT doing)
- NOT adding: Auction functionality
- NOT changing: Commission structure
- NOT supporting: Cryptocurrency payments

---

## 7. Constraints & Risks

### Migration Constraints
- Downtime tolerance: Maximum 2 hours (3 AM EST)
- Data migration: 18TB of product images, 5M products
- User training: Sellers need 30-day notice for major changes

### Backward Compatibility
- APIs that must remain: v2 seller API (1,000+ integrations)
- Data formats to support: Current product CSV upload format
- Integrations to maintain: QuickBooks, Shopify sync

### Resource Constraints
- Budget: $1.2M total
- Timeline: Must launch before Q4 2025 (holiday season)
- Team availability: 8 engineers, 2 designers, 1 PM

### Technical Constraints
- Must stay on: AWS (3-year commitment)
- Cannot use: Competing marketplace APIs
- Must integrate with: Existing Stripe/PayPal setup

### Business Risks
1. Premium sellers might resist verification requirements
2. Bargain hunters (25% of users) might leave
3. Search improvements might surface past SEO issues

---

## 8. Success Metrics

### Enhancement KPIs
- Average order value: Increase from $67 to $100+
- Checkout abandonment: Reduce from 68% to 45%
- Premium seller percentage: Grow from 15% to 30%
- Search success rate: Improve from 34% to 70%

### Technical Metrics
- Search response time: <200ms (currently 2-3 seconds)
- Page load time: <2 seconds (currently 4.5 seconds)
- Uptime: 99.9% (currently 99.5%)
- API response time: <100ms p95

### User Metrics
- Adoption rate: 60% use new search within 30 days
- Task completion: Checkout in <3 clicks
- Support tickets: 50% reduction in search-related issues

---

## 9. Existing Documentation

### Available Resources
- [X] Current architecture diagrams
- [X] API documentation
- [ ] User manuals
- [X] Deployment guides
- [X] Test suites
- [ ] Performance benchmarks
- [X] Database schemas
- [ ] Business logic documentation

### Code Quality
- Test coverage: 67% (Rails), 45% (React)
- Code documentation: Sparse, tribal knowledge
- Technical debt tracking: Jira backlog with 200+ items

---

## 10. Migration Strategy Preferences

### Approach Preference
- [ ] Big bang (all at once)
- [X] Gradual migration
- [ ] Parallel run
- [X] Feature flags
- [ ] Blue-green deployment

### User Communication
- How to notify users: Email series, in-app notifications, seller webinars
- Training needs: Video tutorials for new search, seller verification guide
- Documentation updates: Complete overhaul of help center

---

## Additional Context

### Competitive Pressure
- Competitors who do this better: Etsy (search), Amazon Handmade (curation)
- Features we're missing: AI recommendations, virtual showrooms
- Market expectations: Instant search results, one-click checkout

### Previous Enhancement Attempts
2023: Attempted search upgrade failed due to poor planning and underestimating complexity. Rolled back after 2 weeks of customer complaints.

### Team Knowledge
- Original developers available: 2 of 8 remain
- Documentation quality: Poor
- Tribal knowledge risks: Payment integration only understood by one developer

### Open Questions
1. How aggressive should premium verification be?
2. Should we grandfather existing sellers or require all to verify?
3. Mobile app update - force update or support both versions?

### Dependencies
- External services: Stripe API v3 upgrade needed
- Other systems: Warehouse management system integration
- Scheduled changes: AWS RDS upgrade in Q3

---

## Enhancement Priority Matrix

| Enhancement | User Impact | Technical Effort | Business Value | Risk |
|------------|-------------|------------------|----------------|------|
| AI Search | High | High | High | Medium |
| Premium Tiers | High | Medium | High | High |
| One-page Checkout | High | Low | High | Low |
| Personalization | Medium | Medium | Medium | Low |
| AR Preview | Low | High | Low | Low |

---

*This example demonstrates how to provide comprehensive information about an existing project that needs enhancement, focusing on both problems and opportunities.*