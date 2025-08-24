---
allowed-tools: [Task]
argument-hint: Development phase or feature area to start
---

# Start Development

Initialize active development phase with proper setup, team coordination, and development environment preparation.

## Usage

```
/start-development [phase-or-feature]
```

**Examples:**
- `/start-development sprint-1` - Start first development sprint
- `/start-development feature-auth` - Start authentication feature development
- `/start-development mvp` - Start MVP development phase
- `/start-development full-development` - Start comprehensive development

## What This Does

1. **Development Setup**: Prepares development environment and tooling
2. **Team Coordination**: Aligns team on development approach and standards
3. **Sprint Planning**: Sets up sprint structure and development cadence
4. **Quality Framework**: Establishes code quality and testing standards
5. **Progress Tracking**: Initializes development monitoring and reporting

## Development Initialization

### Environment Setup Verification
```markdown
## Development Environment Checklist

### Code Repository Setup
- [ ] Repository initialized with proper branching strategy
- [ ] Development, staging, and main branches created
- [ ] Branch protection rules configured
- [ ] Code review requirements set up
- [ ] Continuous integration pipeline configured

### Development Tools
- [ ] IDE configurations shared across team
- [ ] Code formatting and linting rules established
- [ ] Pre-commit hooks configured
- [ ] Testing frameworks set up
- [ ] Documentation tools configured

### Local Development Environment
- [ ] Database setup scripts available
- [ ] Environment variables template provided
- [ ] Docker configurations (if applicable) ready
- [ ] API documentation tools configured
- [ ] Local testing data prepared
```

### Team Development Standards
```markdown
## Development Standards and Guidelines

### Code Quality Standards
**Coding Conventions**:
- Language: [Programming Language] following [Style Guide]
- Naming conventions: [Specific naming patterns]
- File organization: [Directory structure standards]
- Comment requirements: [Documentation standards]

**Quality Gates**:
- Code review required for all changes
- Minimum test coverage: [Percentage]%
- All tests must pass before merge
- Security scan requirements
- Performance impact assessment for significant changes

### Git Workflow
**Branching Strategy**: [GitFlow/Feature Branch/etc.]
- Feature branches: `feature/[ticket-number]-[description]`
- Bug fix branches: `bugfix/[ticket-number]-[description]`
- Release branches: `release/[version-number]`
- Hotfix branches: `hotfix/[ticket-number]-[description]`

**Commit Standards**:
- Commit message format: [Conventional Commits/Custom format]
- Atomic commits with clear descriptions
- Reference ticket numbers in commits
- Sign commits for security compliance

### Testing Requirements
**Test Categories**:
- Unit Tests: [Coverage requirement]% minimum
- Integration Tests: All API endpoints and database interactions
- End-to-End Tests: Critical user workflows
- Performance Tests: Key functionality under load
- Security Tests: Authentication and authorization flows

**Test Automation**:
- Tests run automatically on pull requests
- Failed tests block merging
- Performance regression detection
- Security vulnerability scanning
```

## Sprint and Development Planning

### Sprint Structure Setup
```markdown
## Development Sprint Configuration

### Sprint Planning
**Sprint Duration**: [1-4 weeks]
**Sprint Ceremonies**:
- Sprint Planning: [Day/Time] - [Duration]
- Daily Standups: [Time] - [Duration] 
- Sprint Review: [Day/Time] - [Duration]
- Sprint Retrospective: [Day/Time] - [Duration]

**Sprint Goals and Capacity**:
- Team Velocity: [Story Points] per sprint (initial estimate)
- Development Capacity: [Hours] per sprint
- Buffer for bug fixes: [Percentage]% of sprint capacity
- Technical debt allocation: [Percentage]% of sprint capacity

### Story Management
**Story Definition of Ready**:
- [ ] Acceptance criteria clearly defined
- [ ] UI/UX designs available (if applicable)
- [ ] Technical approach discussed and approved
- [ ] Dependencies identified and resolved
- [ ] Story sized and estimated
- [ ] Security and performance requirements identified

**Story Definition of Done**:
- [ ] Code implemented and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Code documentation updated
- [ ] Feature tested in development environment
- [ ] Security review completed (if required)
- [ ] Performance impact assessed
- [ ] Story accepted by product owner
```

### Development Workflow Setup
```markdown
## Development Workflow

### Feature Development Process
1. **Story Assignment**
   - Developer picks up story from sprint backlog
   - Creates feature branch from develop/main
   - Updates story status to "In Progress"

2. **Implementation Phase**
   - Follows coding standards and guidelines
   - Writes tests alongside implementation
   - Commits frequently with clear messages
   - Updates documentation as needed

3. **Code Review Process**
   - Creates pull request with detailed description
   - Requests review from designated reviewers
   - Addresses feedback and makes necessary changes
   - Ensures all CI/CD checks pass

4. **Integration and Testing**
   - Merges to development branch after approval
   - Deploys to development/testing environment
   - Conducts integration testing
   - Updates story status to "Done"

### Daily Development Activities
**Morning Standup**:
- What did you complete yesterday?
- What will you work on today?
- Are there any blockers or impediments?
- Any help needed from team members?

**Continuous Activities**:
- Regular commits to feature branches
- Update task/story status throughout the day
- Collaborate on blocked or complex items
- Participate in code reviews for team members
- Monitor CI/CD pipeline status
```

## Quality Assurance Framework

### Automated Quality Checks
```markdown
## Continuous Quality Assurance

### Automated Testing Pipeline
**Pre-commit Hooks**:
- Code formatting check (Prettier, Black, etc.)
- Lint checks (ESLint, Pylint, etc.)
- Basic syntax validation
- Commit message format validation

**Pull Request Checks**:
- All unit tests must pass
- Code coverage must meet minimum threshold
- Integration tests must pass
- Security scan (dependency vulnerabilities)
- Performance impact assessment (for significant changes)

**Deployment Pipeline Checks**:
- End-to-end test suite execution
- Load testing for performance-critical changes
- Security penetration testing (periodic)
- Database migration validation
- Environment-specific configuration validation

### Manual Quality Reviews
**Code Review Checklist**:
- [ ] Code follows established patterns and conventions
- [ ] Business logic is correctly implemented
- [ ] Error handling is comprehensive
- [ ] Security best practices are followed
- [ ] Performance implications are considered
- [ ] Code is maintainable and well-documented
- [ ] Tests adequately cover the implementation

**Security Review (as needed)**:
- [ ] Input validation and sanitization
- [ ] Authentication and authorization logic
- [ ] Data encryption and secure storage
- [ ] API security best practices
- [ ] Dependency security assessment
```

## Development Monitoring and Tracking

### Progress Tracking Setup
```markdown
## Development Progress Monitoring

### Sprint Tracking Metrics
**Daily Metrics**:
- Stories completed vs planned
- Story points burned down
- Blockers and impediments count
- Code review turnaround time
- CI/CD pipeline success rate

**Sprint Metrics**:
- Sprint velocity (story points completed)
- Sprint goal achievement percentage
- Bug discovery rate during development
- Technical debt items added/resolved
- Team capacity utilization

### Development Health Indicators
**Code Quality Metrics**:
- Code coverage percentage
- Cyclomatic complexity trends
- Code duplication percentage
- Technical debt ratio
- Security vulnerability count

**Team Performance Indicators**:
- Average pull request size
- Code review participation rate
- Knowledge sharing frequency
- Cross-team collaboration instances
- Individual contribution balance
```

### Communication and Reporting
```markdown
## Development Communication

### Daily Communication
- **Stand-up Updates**: Brief progress reports
- **Slack/Teams Updates**: Async progress sharing
- **Blocker Escalation**: Immediate notification of blockers
- **Code Review Requests**: Timely review requests

### Weekly Reporting
- **Sprint Progress Report**: Progress against sprint goals
- **Quality Metrics Summary**: Code quality and test coverage
- **Risk and Issue Summary**: Current risks and mitigation plans
- **Next Week Planning**: Priorities and focus areas

### Stakeholder Updates
- **Development Dashboard**: Real-time progress visibility
- **Demo Preparation**: Regular demo of completed features
- **Milestone Updates**: Progress against major milestones
- **Risk Communication**: Proactive communication of risks
```

## Risk Management and Issue Tracking

### Common Development Risks
```markdown
## Risk Mitigation Planning

### Technical Risks
1. **Integration Complexity**
   - Risk: Third-party integrations may be complex
   - Mitigation: Early integration testing, fallback plans
   - Monitoring: Regular integration test execution

2. **Performance Bottlenecks**  
   - Risk: System may not meet performance requirements
   - Mitigation: Early performance testing, optimization planning
   - Monitoring: Continuous performance monitoring

### Process Risks
1. **Scope Creep**
   - Risk: Requirements may expand beyond planned scope
   - Mitigation: Clear change control process
   - Monitoring: Regular scope reviews with stakeholders

2. **Resource Availability**
   - Risk: Team members may become unavailable
   - Mitigation: Knowledge sharing, cross-training
   - Monitoring: Resource utilization tracking

### Quality Risks
1. **Technical Debt Accumulation**
   - Risk: Pressure to deliver may compromise code quality
   - Mitigation: Dedicated technical debt allocation
   - Monitoring: Code quality metrics tracking

2. **Testing Coverage Gaps**
   - Risk: Insufficient testing may lead to production issues
   - Mitigation: Automated coverage tracking, test requirements
   - Monitoring: Coverage reports and quality gates
```

## Development Kickoff Activities

### Team Kickoff Session
```markdown
## Development Kickoff Agenda

### Session 1: Technical Alignment (2 hours)
1. **Architecture Review** (30 mins)
   - System architecture overview
   - Key technical decisions rationale
   - Integration points and dependencies

2. **Development Standards** (45 mins)
   - Coding conventions and standards
   - Git workflow and branching strategy
   - Code review process and expectations

3. **Development Environment** (30 mins)
   - Local setup verification
   - CI/CD pipeline walkthrough  
   - Testing and debugging tools

4. **Q&A and Planning** (15 mins)
   - Questions and clarifications
   - Next steps and immediate priorities

### Session 2: Process and Planning (1.5 hours)
1. **Sprint Process** (45 mins)
   - Sprint ceremonies and cadence
   - Story estimation and planning
   - Definition of Ready and Done

2. **Communication and Collaboration** (30 mins)
   - Daily communication expectations
   - Issue escalation process
   - Knowledge sharing practices

3. **Quality and Testing** (15 mins)
   - Testing strategy and requirements
   - Quality gates and review process
```

## Success Criteria and Metrics

### Development Success Indicators
```markdown
## Success Metrics

### Delivery Metrics
- **Sprint Goal Achievement**: >80% of sprint goals met
- **Velocity Consistency**: ±20% variation in sprint velocity
- **Story Completion Rate**: >90% of committed stories completed
- **Delivery Predictability**: Delivery dates met within ±10%

### Quality Metrics
- **Code Coverage**: >80% test coverage maintained
- **Bug Escape Rate**: <5% of delivered features have post-release bugs
- **Code Review Coverage**: 100% of code changes reviewed
- **Technical Debt**: <10% of development time spent on technical debt

### Team Performance
- **Team Satisfaction**: >4/5 in team retrospective ratings
- **Knowledge Sharing**: Regular cross-team knowledge transfer
- **Continuous Improvement**: Action items from retrospectives completed
- **Innovation**: Time allocated for experimentation and improvement
```

## Follow-up Actions

Development phase initialization:
- `/sprint-planning` - Plan first development sprint
- `/update-burndown` - Set up burndown tracking
- `/setup-dev-environment` - Ensure development environment is ready
- `/sprint-progress` - Begin progress tracking and reporting
- Schedule team kickoff and alignment sessions
- Set up development monitoring and dashboards