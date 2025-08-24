---
allowed-tools: Task(subagent_type:coder_agent), Read(*), Write(*)
description: Implement specific feature or task
argument-hint: "[feature-description]"
---

Use the Task tool with coder_agent to implement the feature described in $ARGUMENTS.

Requirements for implementation:
- Use latest stable versions of all dependencies
- Apply defensive programming patterns (null checks, error handling)
- Configure dynamic port management for server applications
- Include comprehensive error handling and validation
- Generate unit tests for new functionality
- Follow security best practices
- Provide setup instructions and integration guide