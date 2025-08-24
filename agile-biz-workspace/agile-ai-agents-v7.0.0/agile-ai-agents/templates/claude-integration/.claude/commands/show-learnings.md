---
allowed-tools: [Task]
argument-hint: Optional filter by technology, topic, date range, or status
---

# Show Learnings

Display all captured learnings, insights, and knowledge discoveries from project work, organized by topic, technology, or potential contribution value.

## Usage

```
/show-learnings [filter criteria]
```

**Examples:**
- `/show-learnings` - Show all captured learnings
- `/show-learnings react` - Filter by React technology
- `/show-learnings performance` - Filter by performance topic
- `/show-learnings last-month` - Filter by recent learnings
- `/show-learnings high-value` - Show learnings with high contribution potential

## What This Does

1. **Learning Inventory**: Display comprehensive list of all captured knowledge
2. **Knowledge Organization**: Group learnings by technology, topic, and impact level
3. **Contribution Assessment**: Highlight learnings suitable for community sharing
4. **Knowledge Gaps**: Identify areas where more learning capture is needed
5. **Team Knowledge Base**: Provide searchable reference for team insights

## Learning Organization Structure

### By Technology Stack
**Frontend Technologies**
- React/Vue/Angular patterns and optimizations
- JavaScript/TypeScript best practices and gotchas
- CSS/Sass techniques and responsive design insights
- Browser compatibility and performance learnings

**Backend Technologies**
- Node.js/Python/Java architecture and patterns
- Database optimization and scaling strategies
- API design and integration approaches
- Server configuration and deployment insights

**DevOps and Infrastructure**
- Docker containerization and orchestration learnings
- CI/CD pipeline optimizations and troubleshooting
- Cloud service configurations and cost optimizations
- Monitoring and logging implementation insights

### By Learning Category
**Performance Optimizations**
- Database query improvements and indexing strategies
- Application performance profiling and bottleneck resolution
- Caching strategies and implementation patterns
- Load testing insights and capacity planning

**Architecture and Design**
- System design patterns and trade-offs
- Microservices communication and coordination
- Data flow architecture and state management
- Security implementation and best practices

**Development Process**
- Team workflow improvements and collaboration tools
- Code review processes and quality standards
- Testing strategies and automation approaches
- Documentation patterns and knowledge sharing

### By Impact and Value Level
**High-Value Learnings** (Significant impact or broad applicability)
- Major performance improvements with measurable results
- Complex problem solutions with reusable patterns
- Innovative approaches to common challenges
- Cross-functional insights with business impact

**Medium-Value Learnings** (Valuable for specific contexts)
- Technology-specific optimizations and configurations
- Process improvements with measurable benefits
- Integration solutions for common tool combinations
- Debugging approaches for specific problem types

**Foundational Learnings** (Important for team knowledge)
- Best practices for new technologies or tools
- Common pitfalls and how to avoid them
- Setup and configuration insights for development tools
- Learning experiences from failed approaches

## Example Learning Inventory

### Learning Dashboard

```
📚 LEARNING INVENTORY - Updated: January 15, 2024

🎯 SUMMARY METRICS
├── Total Learnings: 47
├── High-Value: 12 learnings
├── Ready for Contribution: 8 learnings
├── Internal-Only: 15 learnings
└── Technologies Covered: 18

📋 BY STATUS
├── 📝 Recently Captured: 6 learnings (last 7 days)
├── 🔍 Under Review: 4 learnings
├── ✅ Validated: 28 learnings
├── 🚀 Contributed: 9 learnings
└── 🗄️ Archived: 3 learnings (outdated)

⭐ CONTRIBUTION READY (8)
├── React Performance Patterns - Medium audience
├── Database Query Optimization - High impact
├── Docker Multi-stage Builds - Developer focused
└── API Rate Limiting Patterns - Security focused
```

### High-Value Learnings Detail

**PERFORMANCE & OPTIMIZATION**

**1. React Dashboard Performance Optimization**
- **Impact**: 70% load time improvement, 60% bundle size reduction
- **Technologies**: React, Webpack, useMemo, lazy loading
- **Status**: ✅ Validated, 🎯 High contribution potential
- **Context**: E-commerce dashboard with 10K+ daily users
- **Key Insights**: 
  - Strategic code splitting reduced initial bundle by 60%
  - useMemo for expensive calculations improved render performance by 45%
  - Lazy loading of chart components reduced initial paint by 2.1 seconds
- **Metrics**: FCP: 2.8s → 1.2s, LCP: 4.2s → 1.8s, TTI: 5.1s → 2.1s
- **Contribution Potential**: HIGH - Addresses common React performance issues
- **Target Platform**: Medium Engineering, React community blogs

**2. PostgreSQL Query Optimization Case Study**
- **Impact**: 90% query time reduction (2000ms → 200ms)
- **Technologies**: PostgreSQL, indexing, query planning, caching
- **Status**: ✅ Validated, 🚀 Ready for contribution
- **Context**: E-commerce product search with 1M+ products
- **Key Insights**:
  - Composite indexes for query patterns vs. individual column indexes
  - Full-text search vectors outperformed LIKE queries significantly
  - Connection pooling became bottleneck before query optimization
  - EXPLAIN ANALYZE revealed non-obvious query plan changes
- **Metrics**: Search queries: 2000ms → 200ms, DB CPU: 80% → 35%
- **Contribution Potential**: HIGH - Database performance universally applicable
- **Target Platform**: PostgreSQL community, database engineering blogs

**3. Docker Multi-stage Build Optimization**
- **Impact**: 78% image size reduction, 65% build time improvement
- **Technologies**: Docker, Alpine Linux, build optimization
- **Status**: ✅ Validated, 🎯 Medium contribution potential
- **Context**: Node.js microservices deployment pipeline
- **Key Insights**:
  - Multi-stage builds with Alpine base reduced image from 1.2GB to 280MB
  - Build caching strategy reduced CI/CD pipeline time by 65%
  - Security scanning time decreased due to smaller attack surface
  - Production runtime performance improved due to reduced image layers
- **Metrics**: Image size: 1.2GB → 280MB, Build time: 12min → 4.2min
- **Contribution Potential**: MEDIUM - DevOps teams, container optimization
- **Target Platform**: Docker community, DevOps blogs

**ARCHITECTURE & DESIGN**

**4. Microservices Communication Patterns**
- **Impact**: 50% reduction in inter-service latency, improved reliability
- **Technologies**: gRPC, message queues, circuit breakers
- **Status**: 🔍 Under review (contains some proprietary details)
- **Context**: Migration from monolith to microservices architecture
- **Key Insights**:
  - gRPC performed better than REST for internal service communication
  - Circuit breaker pattern prevented cascade failures during peak load
  - Event-driven architecture reduced coupling between services
  - Service mesh added complexity but improved observability significantly
- **Metrics**: Inter-service latency: 180ms → 90ms, 99.9% uptime achieved
- **Contribution Potential**: HIGH - Microservices adoption guidance
- **Review Needed**: Remove company-specific architecture details

**5. API Rate Limiting Implementation**
- **Impact**: 99.8% uptime during traffic spikes, prevented service abuse
- **Technologies**: Redis, Express middleware, sliding window algorithm
- **Status**: ✅ Validated, 🚀 Ready for contribution
- **Context**: Public API serving 1M+ requests/day
- **Key Insights**:
  - Sliding window algorithm more accurate than fixed window
  - Redis cluster for rate limit state improved performance vs. single instance
  - Progressive backoff better user experience than hard limits
  - Rate limiting metrics essential for capacity planning
- **Metrics**: API uptime: 99.2% → 99.8%, abuse incidents: 15/day → 0.2/day
- **Contribution Potential**: HIGH - API security fundamental pattern
- **Target Platform**: API design communities, security blogs

**DEVELOPMENT PROCESS & TOOLS**

**6. Jest Testing Strategy for Complex React Applications**
- **Impact**: Test coverage increased to 87%, bug detection improved 65%
- **Technologies**: Jest, React Testing Library, MSW, Cypress
- **Status**: ✅ Validated, 🎯 Medium contribution potential
- **Context**: Large React application with complex state interactions
- **Key Insights**:
  - Testing Library approach found more real user bugs than enzyme
  - MSW for API mocking simplified integration testing significantly
  - Custom render function with providers reduced test boilerplate
  - Snapshot testing caused maintenance overhead, better for stable components
- **Metrics**: Test coverage: 45% → 87%, Production bugs: 2.3/week → 0.8/week
- **Contribution Potential**: MEDIUM - React testing best practices
- **Target Platform**: React community, testing focused publications

**7. Git Workflow Optimization for Distributed Team**
- **Impact**: 40% reduction in merge conflicts, improved code review efficiency
- **Technologies**: Git, GitHub Actions, conventional commits
- **Status**: ✅ Validated, 🔍 Internal use primarily
- **Context**: 12-person distributed development team
- **Key Insights**:
  - Feature branch naming conventions improved PR organization
  - Automated lint/test checks reduced reviewer cognitive load
  - Conventional commit format enabled automated changelog generation
  - Squash merging reduced main branch complexity without losing history
- **Metrics**: Merge conflicts: 3.2/week → 1.9/week, Review time: 2.1 days → 1.3 days
- **Contribution Potential**: MEDIUM - Team process optimization
- **Target Platform**: Developer productivity blogs, team management content

### Medium-Value Learnings Summary

**CONFIGURATION & SETUP**

**8. Webpack Bundle Analyzer Integration**
- **Context**: Build optimization project
- **Insight**: Identified 23% of bundle was unused lodash functions
- **Solution**: Tree-shaking configuration and selective imports
- **Impact**: Bundle size reduced by 340KB
- **Status**: ✅ Validated for internal use

**9. ESLint Custom Rules for Team Standards**
- **Context**: Code quality standardization initiative
- **Insight**: Custom rules for business logic patterns more effective than generic rules
- **Solution**: Domain-specific lint rules with auto-fix capabilities
- **Impact**: Code review comments on style reduced by 78%
- **Status**: ✅ Validated, internal documentation created

**10. Redis Caching Strategy for Session Management**
- **Context**: User session performance optimization
- **Insight**: Session partitioning by user activity level improved hit rates
- **Solution**: Tiered caching with different TTL strategies
- **Impact**: Session lookup time: 45ms → 12ms
- **Status**: ✅ Validated, 🎯 Potential for security-focused contribution

### Recent Learnings (Last 30 Days)

**NEWLY CAPTURED**

**11. TypeScript Strict Mode Migration Strategy** (Jan 12, 2024)
- **Context**: Gradual TypeScript adoption in large JavaScript codebase
- **Challenge**: Minimizing disruption while improving type safety
- **Solution**: File-by-file migration with incremental strictness levels
- **Preliminary Results**: 15% reduction in runtime type errors
- **Status**: 📝 Recently captured, validation in progress

**12. Vite vs Webpack Performance Comparison** (Jan 10, 2024)
- **Context**: Build tool evaluation for new project setup
- **Findings**: Vite 60% faster for development, Webpack more mature for complex builds
- **Decision**: Vite for new projects, Webpack for existing complex applications
- **Status**: 📝 Recently captured, need more production data

**13. GraphQL N+1 Query Resolution Patterns** (Jan 8, 2024)
- **Context**: API performance optimization project
- **Problem**: GraphQL resolver causing database query multiplication
- **Solution**: DataLoader implementation with request batching
- **Impact**: API response time improved by 73%
- **Status**: 📝 Recently captured, high contribution potential

### Learning Gap Analysis

**UNDERREPRESENTED AREAS**
- **Mobile Development**: Only 2 learnings captured, team doing React Native work
- **Machine Learning**: No ML/AI learnings despite recommendations project
- **Accessibility**: Limited a11y insights despite user feedback on accessibility
- **Internationalization**: No i18n learnings despite multi-language requirements

**RECOMMENDED FOCUS AREAS**
1. **Mobile Performance**: Document React Native optimization insights
2. **Accessibility Implementation**: Capture a11y patterns and tooling insights
3. **Database Scaling**: Document recent PostgreSQL sharding experience
4. **Security Testing**: Document penetration testing findings and fixes

### Learning Capture Quality Metrics

**DOCUMENTATION COMPLETENESS**
- Learnings with code examples: 78% (37/47)
- Learnings with performance metrics: 65% (31/47)
- Learnings with context background: 94% (44/47)
- Learnings with replication instructions: 57% (27/47)

**VALIDATION STATUS**
- Peer reviewed: 85% (40/47)
- Production validated: 72% (34/47)
- Metrics verified: 68% (32/47)
- Community potential assessed: 91% (43/47)

### Knowledge Sharing Impact

**INTERNAL TEAM BENEFITS**
- Onboarding time for new developers reduced by 35%
- Repeated solution development decreased by 42%
- Cross-team knowledge sharing increased via learning database
- Technical decision documentation improved project continuity

**COMMUNITY CONTRIBUTIONS**
- 9 learnings contributed to community (19% contribution rate)
- Average community engagement: 847 views, 23 comments per contribution
- 3 contributions referenced in other community content
- 2 contributions led to speaking opportunities

**PROCESS IMPROVEMENTS**
- Learning capture integrated into sprint retrospectives
- Weekly learning review sessions established
- Contribution decision process streamlined
- Quality standards for learning documentation established
```

## Learning Quality Assessment

### Contribution Readiness Criteria
**HIGH PRIORITY** (Ready for immediate contribution):
- ✅ Significant measurable impact
- ✅ Broad applicability across similar projects
- ✅ Complete documentation with examples
- ✅ No confidential or proprietary information
- ✅ Validated by peer review and production use

**MEDIUM PRIORITY** (Requires preparation):
- ⚠️ Good impact but needs more context
- ⚠️ Technology-specific but valuable to niche audience  
- ⚠️ Complete but needs anonymization or generalization
- ⚠️ Internal validation complete, needs external perspective

**INTERNAL ONLY** (Not suitable for contribution):
- ❌ Contains confidential business information
- ❌ Too specific to company infrastructure or processes
- ❌ Security-sensitive implementation details
- ❌ Temporary workarounds rather than best practices

### Learning Enhancement Recommendations

**For High-Value Learnings**:
1. Add comprehensive before/after metrics
2. Include complete code examples with tests
3. Document alternative approaches considered
4. Add troubleshooting and common pitfalls sections

**For Medium-Value Learnings**:
1. Assess broader applicability beyond current context
2. Add more detailed implementation steps
3. Include validation methodology and results
4. Consider combining related learnings into comprehensive guides

**For All Learnings**:
1. Regular review for continued relevance and accuracy
2. Update for new technology versions or best practices
3. Cross-reference with related learnings and contributions
4. Track community interest and feedback trends

## Follow-up Actions

Based on learning inventory:
- `/contribute-now [learning]` - Submit specific learning for community contribution
- `/capture-learnings` - Add new insights to the learning database
- `/contribution-status` - Review status of learnings in contribution pipeline
- `/skip-contribution [learning]` - Remove learning from contribution consideration
- `/best-practice` - Establish team best practices from learnings