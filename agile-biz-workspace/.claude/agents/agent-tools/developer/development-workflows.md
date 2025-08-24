---
title: "Development Workflows - Developer Agent Context"
type: "agent-context"
agent: "developer"
keywords: ["workflow", "process", "feature", "bug", "fix", "implement", "development", "git", "deploy"]
token_count: 1842
---

# Development Workflows - Developer Agent Context

## When to Load This Context
- **Keywords**: workflow, process, feature, bug, fix, implement, development, git, deploy
- **Patterns**: "how to implement", "development process", "fix this bug", "add feature", "workflow"

## Core Development Workflows

### Feature Development Workflow
```
Input: Requirements & Acceptance Criteria from PRD Agent
↓
1. Technical Analysis
   - Review functional requirements
   - Assess technical constraints and dependencies
   - Identify integration points and data requirements
↓
2. Architecture Design
   - Design system components and interfaces
   - Choose appropriate technologies and patterns
   - Plan data models and API structures
↓
3. Implementation
   - Write production code following standards
   - Implement business logic and data handling
   - Create unit tests for new functionality
↓
4. Code Review & Integration
   - Self-review code for quality and standards
   - Submit for peer review (if available)
   - Integrate code following git workflow
↓
Output: Working Feature Implementation
↓
Handoff to: Testing Agent (for comprehensive testing)
```

### Bug Fix Workflow
```
Input: Bug Report with Reproduction Steps
↓
1. Investigation
   - Reproduce the issue locally
   - Analyze error logs and stack traces
   - Identify root cause and affected components
↓
2. Impact Assessment
   - Assess scope of the bug and affected areas
   - Determine if immediate hotfix is needed
   - Plan rollback strategy if necessary
↓
3. Fix Implementation
   - Implement minimal necessary changes
   - Add tests to prevent regression
   - Verify fix resolves original issue
↓
4. Validation
   - Test fix in development environment
   - Ensure no new issues introduced
   - Document fix and lessons learned
↓
Output: Tested Bug Fix
↓
Handoff to: Testing Agent (for regression testing)
```

### Code Refactoring Workflow
```
Input: Technical Debt or Performance Issues
↓
1. Analysis
   - Identify problematic code areas
   - Assess impact and benefits of refactoring
   - Plan refactoring approach and scope
↓
2. Preparation
   - Ensure comprehensive test coverage
   - Create feature branch for refactoring
   - Document current behavior
↓
3. Refactoring
   - Implement improvements incrementally
   - Maintain existing functionality
   - Update tests and documentation
↓
4. Validation
   - Run full test suite
   - Verify performance improvements
   - Conduct thorough code review
↓
Output: Improved Code Quality
```

### Latest Dependencies Research & Implementation Workflow
```
Input: Project setup or new feature requiring dependencies
↓
1. Dependency Research Phase
   - Research latest stable versions of all required packages/libraries
   - Check official package registries (npm, pip, gem, composer, etc.)
   - Verify latest version stability and compatibility
   - Review changelogs for breaking changes and new features
   - Check security advisories for all dependencies
↓
2. Version Selection & Validation
   - Select latest stable (non-beta/alpha) versions
   - Ensure compatibility between all dependencies
   - Verify framework/runtime compatibility
   - Check for deprecated packages and find modern alternatives
   - Document version selections with rationale
↓
3. Implementation with Latest Versions
   - Update package.json/requirements.txt/Gemfile with latest versions
   - Install and configure latest dependency versions
   - Update import statements and usage patterns for new versions
   - Implement any new recommended patterns from latest versions
   - Test compatibility and functionality with latest versions
↓
4. Documentation & Handoff
   - Document all dependency versions used and why
   - Create dependency update log for Testing Agent verification
   - Report to Project Manager with version details
   - Provide Testing Agent with version verification requirements
↓
Output: Project using latest stable dependency versions + Version documentation for testing
```

## MCP-Enhanced Workflows

### GitHub MCP Development Workflow (WHEN CONFIGURED)
```
Input: Feature requirements and GitHub repository access
↓
1. Issue Creation & Branch Setup
   - Use github_create_issue to create tracking issue
   - Use github_create_branch from main/develop
   - Branch naming: feature/issue-{number}-{description}
↓
2. Development & Commits
   - Use github_read_file to understand existing code
   - Implement features following project patterns
   - Use github_write_file for new files
   - Use github_commit_changes with descriptive messages:
     ```
     feat: Add user authentication module
     
     - Implement JWT token generation
     - Add login/logout endpoints
     - Create user middleware
     
     Closes #123
     ```
↓
3. Pull Request Creation
   - Use github_create_pull_request with detailed description
   - Link to related issues automatically
   - Add appropriate labels (feature, bugfix, etc.)
   - Include testing checklist in PR description
↓
4. Code Review Process
   - Monitor PR comments via GitHub MCP
   - Update code based on feedback
   - Push additional commits as needed
   - Update PR status when ready for merge
↓
5. Issue Management
   - Update issue status during development
   - Link commits to issues for traceability
   - Close issues automatically via PR merge
   - Create follow-up issues if needed
↓
Output: Feature branch with PR ready for review + Updated issue tracking
```

### Context7 MCP Documentation-Driven Development Workflow (WHEN CONFIGURED)
```
Input: Feature requirements with specific technology stack needs
↓
1. Library Documentation Research
   - Use resolve-library-id to find current library IDs for project frameworks
   - Examples: React, Express, TypeScript, Jest, etc.
   - Get Context7-compatible IDs for all major dependencies
↓
2. Current API Documentation Retrieval
   - Use get-library-docs for each framework with specific topics
   - React: get hooks, component patterns, performance best practices
   - Node.js: get latest async/await patterns, file system APIs
   - Database ORM: get current query patterns, migration syntax
↓
3. Implementation with Current Patterns
   - Implement features using up-to-date API documentation
   - Follow current best practices from official documentation
   - Use exact syntax and patterns from retrieved docs
   - Avoid deprecated or outdated approaches
↓
4. Version-Specific Development
   - Get documentation for exact versions in package.json
   - Handle breaking changes between versions correctly
   - Use migration guides for version upgrades
   - Ensure compatibility with current dependency versions
↓
5. Real-time Problem Solving
   - Get specific documentation for complex implementation challenges
   - Access troubleshooting guides and common solutions
   - Find current workarounds for known issues
   - Get performance optimization patterns
↓
Output: Implementation using current, accurate APIs + Version-specific documentation
```

## Git Workflow Patterns

### GitFlow Branch Strategy
```bash
# Main branches
main        # Production-ready code
develop     # Integration branch

# Supporting branches
feature/*   # New features
release/*   # Release preparation
hotfix/*    # Emergency fixes

# Feature development
git checkout develop
git checkout -b feature/user-authentication
# ... develop feature ...
git checkout develop
git merge feature/user-authentication
git branch -d feature/user-authentication

# Release process
git checkout develop
git checkout -b release/1.2.0
# ... final testing and bug fixes ...
git checkout main
git merge release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git checkout develop
git merge release/1.2.0
```

### Commit Message Standards
```bash
# Format: type(scope): description
feat(auth): add JWT token authentication
fix(api): resolve user profile update issue
docs(readme): update installation instructions
style(css): fix indentation in main stylesheet
refactor(utils): extract validation functions
test(auth): add unit tests for login flow
chore(deps): update dependencies to latest versions

# Breaking changes
feat(api)!: change user endpoint response format

BREAKING CHANGE: User endpoint now returns nested user object
instead of flat structure.
```

## Testing Integration Workflows

### Test-Driven Development (TDD)
```javascript
// 1. Write failing test
describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    const items = [{ price: 10 }, { price: 20 }];
    const taxRate = 0.1;
    const result = calculateTotal(items, taxRate);
    expect(result).toBe(33); // 30 + 3 tax
  });
});

// 2. Write minimal code to pass
function calculateTotal(items = [], taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item?.price || 0), 0);
  return subtotal + (subtotal * taxRate);
}

// 3. Refactor while keeping tests green
function calculateTotal(items = [], taxRate = 0) {
  if (!Array.isArray(items)) return 0;
  
  const subtotal = items
    .filter(item => item?.price && typeof item.price === 'number')
    .reduce((sum, item) => sum + item.price, 0);
    
  return Number((subtotal + (subtotal * taxRate)).toFixed(2));
}
```

### Continuous Integration Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Deployment Workflows

### Environment Management
```bash
# Environment variables per stage
# .env.development
NODE_ENV=development
API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://localhost:5432/myapp_dev

# .env.staging
NODE_ENV=staging
API_URL=https://api-staging.myapp.com
DATABASE_URL=postgresql://staging-db:5432/myapp_staging

# .env.production
NODE_ENV=production
API_URL=https://api.myapp.com
DATABASE_URL=postgresql://prod-db:5432/myapp_prod
```

### Database Migration Workflow
```javascript
// Migration file: 2024_01_15_create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

// Run migrations
npm run migrate:latest        # Apply all pending migrations
npm run migrate:rollback     # Rollback last batch
npm run migrate:status       # Check migration status
```