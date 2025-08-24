---
allowed-tools: Task(subagent_type:*), Read(*), Write(*)
description: Use coder_agent to implement comprehensive bug fixes
argument-hint: "bug description or reference to previous analysis"
---

Use the Task tool with coder_agent to implement bug fixes based on $ARGUMENTS.

Delivers comprehensive fix implementation including code changes, testing validation, deployment planning, and monitoring setup.