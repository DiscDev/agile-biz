# Project Structure System Guide

## Overview

The Project Structure Agent (#38) is a self-learning agent that manages repository structures for projects, learning from patterns and outcomes to provide increasingly better recommendations over time. It helps teams make data-driven decisions about when to evolve from single to multi-repository architectures.

## Core Principles

1. **Start Simple** - Always begin with a single repository
2. **Evolve Based on Need** - Split only when concrete triggers appear
3. **Learn from Patterns** - Leverage community experiences
4. **Data-Driven Decisions** - Use metrics, not opinions
5. **Minimize Disruption** - Phased migrations with clear benefits

## When to Use the Project Structure Agent

### Initial Project Setup
- Starting a new project and unsure about repository structure
- Want to avoid over-engineering from the start
- Need industry-specific structure recommendations

### Existing Project Evolution
- Build times exceeding 15 minutes
- Frequent merge conflicts (>25% of PRs)
- Team size approaching coordination limits (6-8 developers)
- Different deployment cycles needed for different parts

### Multi-Repository Coordination
- Implementing features across multiple repositories
- Managing cross-repository dependencies
- Synchronizing releases and deployments

## Common Evolution Patterns

### Pattern 1: Marketing Site Split (Most Common)

**Trigger**: SEO requirements conflict with app framework  
**Timeline**: Usually within first 2-3 months  
**Success Rate**: 92% report improved metrics

```
Before:
  my-app/
    ├── pages/
    │   ├── index.js (marketing)
    │   ├── about.js (marketing)
    │   └── app/    (application)
    
After:
  my-app-marketing/  (Next.js with SSG)
    ├── pages/
    │   ├── index.js
    │   └── about.js
    
  my-app/           (React SPA)
    └── src/
        └── app/
```

**Benefits**:
- Independent SEO optimization
- Faster Core Web Vitals
- Marketing team autonomy
- Separate deployment cycles

### Pattern 2: API Service Extraction

**Trigger**: Backend complexity requires versioning  
**Timeline**: 4-6 months into project  
**Success Rate**: 83% report better stability

```
Before:
  my-app/
    ├── client/
    └── server/
    
After:
  my-app-frontend/
    └── src/
    
  my-app-api/
    ├── v1/
    └── v2/
```

**Benefits**:
- API versioning support
- Independent scaling
- Clear service boundaries
- Better security isolation

### Pattern 3: Admin Dashboard Split

**Trigger**: Admin features exceed 20+ screens  
**Timeline**: 6-12 months  
**Success Rate**: 88% report faster feature development

```
Before:
  my-app/
    ├── src/
    │   ├── customer/
    │   └── admin/
    
After:
  my-app/
    └── src/customer/
    
  my-app-admin/
    └── src/admin/
```

**Benefits**:
- Dedicated admin team ownership
- Specialized security requirements
- Different tech stack possible
- Reduced customer app bundle size

## Repository Health Metrics

The Project Structure Agent monitors these key indicators:

### Build Time Thresholds
- **Green**: < 10 minutes
- **Yellow**: 10-15 minutes (monitor closely)
- **Red**: > 15 minutes (consider splitting)

### Team Size Boundaries
- **Small**: 1-3 developers (single repo optimal)
- **Medium**: 4-6 developers (monitor friction)
- **Large**: 7+ developers (multi-repo likely beneficial)

### Merge Conflict Frequency
- **Healthy**: < 10% of PRs have conflicts
- **Warning**: 10-25% conflict rate
- **Critical**: > 25% conflict rate

### Deployment Complexity
- **Simple**: Single deployment, all features together
- **Moderate**: Feature flags for independent releases
- **Complex**: Coordination required for most deploys

## Migration Guide

### Step 1: Initial Analysis

```
Acting as the Project Structure Agent, analyze my existing project structure and identify:
1. Current repository health metrics
2. Potential evolution triggers
3. Recommended timeline for any structure changes
```

### Step 2: Migration Planning

If evolution is recommended, the agent provides:
1. **Phased approach** - Start with highest-impact splits
2. **Risk mitigation** - Minimize disruption
3. **Success metrics** - Track improvements

### Step 3: Implementation Checklist

#### Pre-Migration
- [ ] Current structure analyzed
- [ ] Evolution triggers documented
- [ ] Team aligned on benefits
- [ ] CI/CD update plan ready
- [ ] Dependencies mapped

#### During Migration
- [ ] Create new repositories
- [ ] Move code incrementally
- [ ] Update import paths
- [ ] Configure workflows
- [ ] Set up pipelines

#### Post-Migration
- [ ] Verify functionality
- [ ] Monitor metrics
- [ ] Document workflow
- [ ] Train team
- [ ] Track success (30 days)

## Industry-Specific Considerations

### Healthcare/Fintech (High Compliance)
- **Isolate**: PHI/PII processing into separate repository
- **Audit**: Dedicated logging service
- **Compliance**: Reports in isolated repository
- **Example**: `patient-data-api` | `healthcare-app` | `compliance-reports`

### E-commerce
- **Performance**: Separate storefront for speed
- **Real-time**: Inventory service isolation
- **Analytics**: Big data processing separation
- **Example**: `storefront` | `admin` | `inventory-api` | `analytics`

### SaaS B2B
- **Marketing**: SEO-optimized public site
- **Application**: Core product features
- **API**: Versioned service layer
- **Example**: `marketing` | `app` | `api` | `admin`

## Anti-Patterns to Avoid

### ❌ Premature Splitting
**Signs**: 
- Team < 3 developers
- Codebase < 10,000 lines
- No friction points

**Better**: Wait for concrete triggers

### ❌ Over-Fragmentation
**Signs**:
- More repos than developers
- Every feature separate
- High coordination overhead

**Better**: Logical domain boundaries

### ❌ Technology-Based Splits
**Signs**:
- Frontend/backend only
- No clear ownership
- Tight coupling remains

**Better**: Split by business domain

## Multi-Repository Coordination

### Feature Implementation Across Repos

```yaml
Feature: User Authentication
Repositories Affected:
  - api: Auth endpoints, JWT management
  - app: Login UI, auth context
  - admin: User management
  - marketing: Login links

Coordination:
  1. Branch naming: feature/user-auth-system
  2. Implementation order: api → app → admin → marketing
  3. Testing: Unit → Integration → E2E
  4. Release: Synchronized deployment
```

### Cross-Repository Dependencies

The agent tracks and manages:
- Shared types and interfaces
- API contracts
- Common UI components
- Deployment dependencies

## Success Patterns from Community

Based on analysis of 35+ similar projects:

### Early Wins (95% confidence)
1. **Mobile + API Split** - Start with separate mobile/API repos
2. **Marketing Independence** - Split by month 3 for SEO
3. **Progressive Admin** - Extract after 20+ screens

### Common Timelines
- **Month 0-2**: Single repository development
- **Month 2-3**: Marketing site extraction
- **Month 4-5**: API service separation
- **Month 6-7**: Admin dashboard split

### Metric Improvements
- **Build time**: 50-70% reduction per repo
- **Deploy frequency**: 2-3x increase
- **Merge conflicts**: 60-80% reduction
- **Team velocity**: 40% average improvement

## Quick Reference Commands

### Analyze Current Structure
```
Acting as the Project Structure Agent, analyze my repository structure and provide health metrics.
```

### Get Evolution Recommendation
```
Acting as the Project Structure Agent, evaluate if my repository needs to be split based on current metrics.
```

### Create Migration Plan
```
Acting as the Project Structure Agent, create a detailed migration plan for evolving from single to multi-repo.
```

### Coordinate Cross-Repo Feature
```
Acting as the Project Structure Agent, coordinate the implementation of [feature] across our multiple repositories.
```

### Monitor Repository Health
```
Acting as the Project Structure Agent, provide a health assessment of our current repository structure.
```

## Continuous Learning

The Project Structure Agent continuously improves through:

### Community Patterns
- Learns from every project evolution
- Identifies successful patterns
- Warns about anti-patterns
- Confidence scoring based on sample size

### Success Tracking
- Before/after metrics comparison
- Developer satisfaction surveys
- Deployment frequency improvements
- Build time reductions

### Pattern Recognition
- Minimum 3 similar cases for recommendations
- Industry-specific pattern detection
- Technology stack considerations
- Team size correlations

## Getting Started

### For New Projects
1. Start with single repository (always)
2. Let agent monitor health metrics
3. Evolve when triggers appear
4. Follow phased migration approach

### For Existing Projects
1. Run initial health analysis
2. Review evolution recommendations
3. Plan migration if triggered
4. Track success metrics

### For Multi-Repo Teams
1. Use agent for coordination
2. Standardize workflows
3. Monitor coupling between repos
4. Optimize based on patterns

## Summary

The Project Structure Agent helps teams:
- ✅ Start simple and evolve based on real needs
- ✅ Make data-driven structure decisions
- ✅ Avoid common pitfalls and anti-patterns
- ✅ Coordinate multi-repository development
- ✅ Learn from community experiences

Remember: **Repository structure should serve your team's needs, not the other way around.** The Project Structure Agent ensures you evolve your structure at the right time for the right reasons.

---

**Version**: 2.0.0  
**Agent**: Project Structure Agent (#38)  
**Last Updated**: 2025-07-17