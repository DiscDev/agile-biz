---
allowed-tools: Task(subagent_type:devops_agent), Task(subagent_type:logger_agent), Task(subagent_type:optimization_agent)
description: System health analysis and diagnostics
---

# System Health Check

Perform comprehensive system health analysis to identify issues and ensure optimal performance.

## Health Check Process

1. **System Overview**
   - Check project structure integrity
   - Verify dependencies and versions
   - Assess configuration status
   - Review resource utilization

2. **Performance Metrics**
   Use Task tool with logger_agent to gather:
   - Response times and latency
   - Memory usage patterns
   - CPU utilization
   - Disk I/O statistics
   - Network performance

3. **Dependency Analysis**
   Use Task tool with devops_agent for:
   - Outdated dependencies check
   - Security vulnerability scan
   - License compliance review
   - Version compatibility matrix

4. **Code Health**
   Use Task tool with optimization_agent for:
   - Code complexity metrics
   - Test coverage analysis
   - Documentation completeness
   - Technical debt assessment

5. **Infrastructure Status**
   - Database connections
   - API endpoint availability
   - External service integrations
   - Cache performance

## Health Report Format

```
🏥 SYSTEM HEALTH CHECK REPORT
=============================

✅ Overall Health: [Healthy/Warning/Critical]
   Score: [85/100]

📊 Performance Metrics
   Response Time: 124ms (avg)
   Memory Usage: 512MB/2GB
   CPU Usage: 15% (avg)
   Uptime: 99.95%

⚠️ Issues Detected (3)
   1. [HIGH] Outdated dependency: express@4.17.1
   2. [MEDIUM] Missing test coverage in /api/auth
   3. [LOW] Deprecated API usage in logger.js

🔧 Recommendations
   1. Update dependencies (npm update)
   2. Add tests for authentication module
   3. Migrate to new logging API

📈 Trends
   - Memory usage increased 12% over last week
   - Response times improved by 8%
   - Error rate stable at 0.02%

Next health check: /health-check --detailed
```

## Options

Parse for options in prompt:
- `--detailed`: Include detailed metrics
- `--quick`: Fast scan only
- `--focus [area]`: Focus on specific area

## Integration Points

- Triggers optimization recommendations
- Updates monitoring dashboards
- Creates issues for problems found
- Generates health trend reports

## Follow-up Actions

Based on health check results:
- Critical issues → `/fix-bug` or `/blocker`
- Performance issues → `/optimize` or `/profile`
- Security issues → `/security-scan`
- Dependency issues → `/update-dependencies`