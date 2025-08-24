# Analysis & Integration Sub-Agents Guide

## Overview

The Analysis & Integration sub-agent systems enable parallel execution of project analysis and API integration tasks, achieving 70-78% time reduction while maintaining comprehensive coverage and quality.

## Project Analysis Sub-Agents

### How It Works

The Project Analysis Orchestrator deploys multiple sub-agents to analyze different aspects of a project simultaneously:

```yaml
analysis_categories:
  - architecture     # System design and structure
  - code-quality    # Complexity and maintainability
  - security        # Vulnerabilities and compliance
  - performance     # Bottlenecks and optimization
  - dependencies    # Package health and updates
  - testing         # Coverage and quality
  - technical-debt  # Legacy code and burden
```

### Analysis Levels

#### Quick Analysis (30-60 min → 10-20 min)
- 3 parallel sub-agents
- Focus on critical issues
- Architecture, security-critical, performance bottlenecks
- 67% time reduction

#### Standard Analysis (2-4 hours → 30-60 min)
- 7 parallel sub-agents
- Comprehensive coverage
- All major project aspects
- 75% time reduction

#### Deep Analysis (4-8 hours → 1-2 hours)
- 12+ parallel sub-agents
- Line-by-line review
- Includes scalability, maintainability, documentation
- 75% time reduction

### Analysis Process

1. **Categorization**: Project aspects divided into analysis domains
2. **Token Allocation**: Budget assigned based on complexity
3. **Parallel Execution**: Sub-agents analyze simultaneously
4. **Consolidation**: Results merged into comprehensive report
5. **Prioritization**: Critical findings elevated

### Sample Analysis Report Structure

```markdown
# Project Analysis Report

## Executive Summary
- High-priority findings with severity scores
- Quick wins and critical fixes
- Strategic recommendations

## Detailed Analysis by Category

### Architecture
- System design assessment
- Pattern identification
- Scalability evaluation

### Security
- Vulnerability scan results
- OWASP compliance check
- Authentication analysis

### Performance
- Bottleneck identification
- Query optimization opportunities
- Caching recommendations

[Additional categories...]

## Recommended Next Steps
1. Immediate actions (security fixes)
2. Short-term improvements (quick wins)
3. Medium-term planning (refactoring)
4. Long-term strategy (architecture)
```

## Integration Sub-Agents

### How It Works

The Integration Orchestrator manages parallel setup of multiple API integrations:

```yaml
integration_categories:
  - authentication  # OAuth, JWT, SSO providers
  - payment        # Stripe, PayPal, billing
  - messaging      # Email, SMS, notifications
  - storage        # S3, CDN, file handling
  - analytics      # Tracking, metrics, BI
  - ai             # LLMs, ML services
  - monitoring     # Error tracking, APM
```

### Integration Process

1. **API Categorization**: Group by functionality
2. **Bundle Related APIs**: Efficient sub-agent allocation
3. **Parallel Configuration**: All categories simultaneously
4. **Documentation Generation**: Automated guides
5. **Test Suite Creation**: Comprehensive testing

### Integration Outputs

Each integration includes:
- Configuration code with error handling
- Environment variable templates
- Test suites (unit + integration)
- API documentation
- Troubleshooting guide
- Security best practices

### Example Integration Timeline

**8 APIs to integrate (Auth0, Stripe, SendGrid, Twilio, S3, OpenAI, Sentry, Google Analytics)**

**Sequential Approach**: 4 hours (30 min each)
**Parallel Sub-Agents**: 45 minutes (all at once)
**Time Savings**: 78%

## Combined Workflow

### Analysis → Integration Pipeline

1. **Phase 1: Parallel Analysis** (45 minutes)
   - Architecture analysis reveals microservices need
   - Security analysis identifies auth improvements
   - Performance analysis suggests caching strategy

2. **Phase 2: Parallel Integration** (30 minutes)
   - Auth improvements → Auth0 integration
   - Caching needs → Redis + CDN setup
   - Monitoring gaps → Sentry + DataDog

**Total Time**: 1.25 hours (vs 5 hours sequential)

## Configuration

### Enable in CLAUDE.md

```yaml
sub_agents:
  project_analysis:
    enabled: true
    analysis_levels:
      standard: ["architecture", "code-quality", "security", "performance", "dependencies", "testing", "technical-debt"]
    
  integration_setup:
    enabled: true
    categories: ["authentication", "payment", "messaging", "storage", "analytics", "ai", "monitoring"]
```

### Token Budget Allocation

```javascript
// Analysis tasks
const analysisComplexity = {
  'architecture': 1.2,      // 20% more tokens
  'code-quality': 1.5,      // 50% more for deep analysis
  'security': 1.3,          // 30% more for thorough scan
  'performance': 1.4        // 40% more for profiling
};

// Integration tasks
const integrationBudget = {
  simple: 5000,      // 1 API
  standard: 10000,   // 2-3 APIs
  complex: 15000     // 4+ APIs or complex setup
};
```

## Best Practices

### For Analysis
1. **Start with Standard Level**: Balance of speed and thoroughness
2. **Review Priorities First**: Address critical findings immediately
3. **Use Deep Analysis Selectively**: For critical systems or major refactoring
4. **Archive Reports**: Track improvements over time

### For Integration
1. **Group Related APIs**: Auth + user management together
2. **Prioritize Core Services**: Authentication before analytics
3. **Test in Isolation**: Verify each integration independently
4. **Document Everything**: Future maintenance depends on it

## Troubleshooting

### Common Issues

**Issue**: Analysis taking longer than expected
**Solution**: Check project size, adjust timeout settings

**Issue**: Integration conflicts between APIs
**Solution**: Review categorization, handle sequentially if needed

**Issue**: Token budget exceeded
**Solution**: Reduce analysis depth or integration scope

**Issue**: Incomplete analysis results
**Solution**: Check sub-agent errors, retry with focused scope

## Performance Metrics

### Analysis Performance
- Quick: 10-20 minutes (67% faster)
- Standard: 30-60 minutes (75% faster)
- Deep: 1-2 hours (75% faster)

### Integration Performance
- Average setup time: 45 minutes
- APIs per hour: 10-12 (vs 2-3 sequential)
- Documentation generation: Automated
- Test coverage: 100% for all integrations

## Future Enhancements

1. **Smart Categorization**: AI-driven analysis focus
2. **Predictive Integration**: Suggest APIs based on analysis
3. **Cross-Analysis Insights**: Correlate findings across categories
4. **Integration Monitoring**: Post-setup health checks

## Related Documentation

- [Sub-Agent System Guide](sub-agent-system-guide.md)
- [Project Analysis Orchestrator](../machine-data/project-analysis-orchestrator.js)
- [Integration Orchestrator](../machine-data/integration-orchestrator.js)
- [Token Budget Manager](../machine-data/token-budget-manager.js)