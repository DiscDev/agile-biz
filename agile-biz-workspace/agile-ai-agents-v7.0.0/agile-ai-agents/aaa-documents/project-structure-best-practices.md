# Project Structure Best Practices Guide

## Overview

This guide provides best practices for organizing project structures based on technology stack, team size, and project requirements. Following these practices ensures maintainability, scalability, and smooth evolution as projects grow.

## Core Principles

### 1. Start Simple, Evolve Intentionally
* Always begin with a single repository
* Monitor metrics to identify when splits are needed
* Evolution triggers: build time > 10min, merge conflicts > 5/week, team size > 6
* Plan for growth but don't over-engineer from the start

### 2. Separation of Concerns
* Keep frontend and backend code clearly separated
* Use distinct directories for different domains
* Avoid mixing UI components with business logic
* Maintain clear boundaries between services

### 3. Convention Over Configuration
* Follow framework conventions when available
* Use standard directory names (src/, tests/, docs/)
* Keep configuration files at appropriate levels
* Document any deviations from conventions

## Architecture-Specific Best Practices

### Separated Stack (Frontend + Backend)

**Recommended Structure**:
```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── public/
│   ├── tests/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── tests/
│   └── package.json
├── shared/
│   └── types/
├── docker-compose.yml
└── README.md
```

**Best Practices**:
* Keep all frontend code in `frontend/` directory
* Keep all backend code in `backend/` directory
* Share TypeScript types via `shared/` directory
* Use separate package.json for each part
* Configure proxy in frontend for API calls

**Anti-Patterns to Avoid**:
* ❌ Mixing React components in root directory
* ❌ Backend routes in frontend folder
* ❌ Shared node_modules between frontend/backend
* ❌ Configuration files scattered across root

### Full-Stack Frameworks (Next.js, Nuxt, SvelteKit)

**Recommended Structure**:
```
project/
├── app/                    # App Router (Next.js 13+)
│   ├── api/               # API routes
│   ├── (auth)/            # Route groups
│   └── dashboard/         # Pages
├── components/
│   ├── ui/                # UI components
│   └── features/          # Feature components
├── lib/
│   ├── api/               # API utilities
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── prisma/                # Database schema
├── public/                # Static assets
├── styles/                # Global styles
└── tests/
```

**Best Practices**:
* Leverage framework conventions
* Keep API routes with pages (co-location)
* Use framework's built-in patterns
* Organize by feature when it makes sense

### Monolithic Applications (Django, Rails, Laravel)

**Recommended Structure**:
```
project/
├── app/                    # Main application
│   ├── controllers/
│   ├── models/
│   ├── views/
│   └── services/
├── config/                 # Configuration
├── database/              # Migrations, seeds
├── public/                # Static assets
├── resources/             # Frontend resources
│   ├── js/
│   ├── css/
│   └── views/
├── tests/
└── vendor/                # Dependencies
```

**Best Practices**:
* Follow framework conventions strictly
* Keep business logic in services/models
* Use framework's asset pipeline
* Organize tests to mirror app structure

### Microservices Architecture

**Recommended Structure**:
```
project/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── payment-service/
│   └── notification-service/
├── api-gateway/
├── shared/
│   ├── proto/             # Protocol buffers
│   ├── types/             # Shared types
│   └── utils/             # Shared utilities
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
└── scripts/
```

**Best Practices**:
* Each service is self-contained
* Shared code minimal and versioned
* Clear service boundaries
* Consistent structure across services

## Common Patterns

### Test Organization

**Unit Tests**:
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx    # Co-located
tests/
└── unit/
    └── utils/             # Centralized
```

**Integration/E2E Tests**:
```
tests/
├── integration/
│   ├── api/
│   └── services/
└── e2e/
    ├── user-flows/
    └── smoke-tests/
```

### Configuration Management

**Environment-Specific**:
```
config/
├── default.json           # Base configuration
├── development.json       # Dev overrides
├── production.json        # Prod overrides
└── test.json             # Test overrides

.env.example              # Template
.env                      # Local (gitignored)
```

### Documentation Structure

```
docs/
├── api/                   # API documentation
├── architecture/          # System design
├── deployment/           # Deployment guides
└── development/          # Dev setup guides

README.md                 # Project overview
CONTRIBUTING.md          # Contribution guide
```

## Evolution Patterns

### When to Split Repositories

**Marketing Site Split (Month 2-3)**:
* Different deployment needs (CDN vs servers)
* SEO requirements conflict with app framework
* Different team working on marketing
* Frequent marketing updates slow app deploys

**API Service Split (Month 4-6)**:
* Build times exceed 10 minutes
* Multiple frontends need same API
* API versioning becomes complex
* Different scaling requirements

**Admin Panel Split (Month 6-12)**:
* Different user base (internal vs external)
* Different security requirements
* Less frequent deployment needs
* Different tech stack preferences

### Migration Strategies

**Gradual Migration**:
1. Create new directory structure
2. Move components one at a time
3. Update imports progressively
4. Maintain backward compatibility
5. Remove old structure when complete

**Big Bang Migration**:
1. Plan structure completely
2. Create migration scripts
3. Execute in single operation
4. Update all imports at once
5. Test thoroughly before merge

## Monitoring and Metrics

### Health Indicators

**Build Performance**:
* Target: < 5 minutes for CI builds
* Warning: 5-10 minutes
* Critical: > 10 minutes

**Merge Conflicts**:
* Healthy: < 2 per week
* Warning: 2-5 per week
* Critical: > 5 per week

**Codebase Size**:
* Small: < 10K LOC
* Medium: 10K-50K LOC
* Large: 50K-200K LOC
* Critical: > 200K LOC (consider splitting)

### Team Indicators

**Team Size vs Structure**:
* 1-3 developers: Single repo optimal
* 4-8 developers: Consider feature splits
* 9-15 developers: Multiple repos likely needed
* 15+ developers: Microservices consideration

## Common Mistakes to Avoid

### Structure Anti-Patterns

1. **Premature Optimization**
   * Creating 10 repos for 2-person team
   * Microservices for simple CRUD app
   * Over-engineering from day one

2. **Under-Engineering**
   * 100K LOC in single file
   * No clear module boundaries
   * Everything in root directory

3. **Mixed Concerns**
   * Frontend code in backend folders
   * Business logic in controllers
   * Database queries in views

4. **Poor Naming**
   * Generic names (utils/, helpers/, misc/)
   * Inconsistent naming conventions
   * Deeply nested structures

## Implementation Checklist

### New Project Setup
- [ ] Choose appropriate scaffold template
- [ ] Initialize version control
- [ ] Set up .gitignore properly
- [ ] Create .env.example
- [ ] Set up README.md
- [ ] Configure linting/formatting
- [ ] Set up test structure
- [ ] Configure CI/CD pipelines

### Existing Project Migration
- [ ] Analyze current structure
- [ ] Identify anti-patterns
- [ ] Plan migration approach
- [ ] Create migration scripts
- [ ] Update build processes
- [ ] Update documentation
- [ ] Test thoroughly
- [ ] Coordinate team training

## Scaffold Template Reference

Available templates in `/agile-ai-agents/templates/project-scaffolds/`:

* **Separated Stack**: React+Node, Vue+Django, Laravel+React
* **Full-Stack Frameworks**: Next.js, Nuxt.js, SvelteKit
* **Monolithic**: Django, Rails, Laravel
* **Microservices**: Node.js microservices
* **Mobile**: React Native+Node, Flutter+Django

Use the decision tree at `/agile-ai-agents/templates/project-scaffolds/decision-tree.md` to select the right template.

## Conclusion

Good project structure is essential for maintainability and team productivity. Start simple, follow conventions, and evolve based on actual needs rather than speculation. Monitor metrics continuously and be ready to adapt as your project grows.

Remember: The best structure is one that your team understands and can work with efficiently. When in doubt, choose clarity over cleverness.