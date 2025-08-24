---
allowed-tools: Task(subagent_type:coder_agent), Read(*), Glob(*)
description: Analyze codebase quality and architecture
argument-hint: "[path-or-focus-area]"
---

Use the Task tool with coder_agent to analyze the codebase specified in $ARGUMENTS.

Provide comprehensive analysis covering:
- Code quality metrics and maintainability assessment
- Architecture patterns and design review
- Security vulnerabilities and compliance issues
- Performance bottlenecks and optimization opportunities
- Technical debt identification with prioritized improvement roadmap
- Specific code examples and actionable recommendations