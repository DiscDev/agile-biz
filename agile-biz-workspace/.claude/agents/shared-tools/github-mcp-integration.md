---
title: "GitHub MCP Integration - Shared Tool"
type: "shared-tool"
keywords: ["github", "git", "repository", "pr", "pull request", "branch", "commit", "issue", "workflow", "ci/cd"]
agents: ["developer", "devops", "testing", "api"]
token_count: 1609
---

# GitHub MCP Integration - Shared Tool

## When to Load This Context
- **Keywords**: github, git, repository, pr, pull request, branch, commit, issue, workflow, ci/cd
- **Patterns**: "create PR", "manage repository", "git workflow", "automated deployment"
- **Shared by**: Developer, DevOps, Testing, Project Manager, Documentator agents

## GitHub MCP Server Overview

**GitHub MCP Server**: Direct integration with GitHub for repository and CI/CD management
- **Setup Guide**: See `project-mcps/github-mcp-setup.md` for configuration
- **Capabilities**: Create branches, commit code, create PRs, manage issues, trigger workflows
- **Tools Available**: `github_create_branch`, `github_commit_changes`, `github_create_pull_request`, `github_create_issue`, `github_trigger_workflow`
- **Benefits**: Automated Git workflows without manual commands, integrated CI/CD management

## Agent-Specific Usage

### For Developer Agents
- Create feature branches for development
- Commit code changes with proper messages
- Create pull requests with detailed descriptions
- Link commits to issues for traceability

### For DevOps Agents
- Manage deployment workflows and releases
- Configure CI/CD pipelines and triggers
- Monitor workflow status and deployments
- Manage repository settings and permissions

### For Testing Agents
- Create test branches for validation
- Report bugs as GitHub issues
- Link test results to pull requests
- Trigger automated test workflows

### For Project Manager Agents
- Create and manage project issues
- Track progress through PR reviews
- Monitor workflow completion status
- Generate project reports from repository data

### For Documentator Agents
- Commit documentation changes
- Create PRs for documentation updates
- Manage wiki and documentation repositories
- Link documentation to related issues

## Core MCP Tools

### github_create_branch
**Purpose**: Create a new branch from existing branch
**Parameters**: 
- `repository`: Owner/repo format (e.g., "user/project")
- `branch_name`: Name for the new branch
- `from_branch`: Source branch (default: "main")

```javascript
// Create feature branch
await mcp.github_create_branch({
  repository: "myorg/myproject",
  branch_name: "feature/user-authentication",
  from_branch: "develop"
});

// Create hotfix branch
await mcp.github_create_branch({
  repository: "myorg/myproject", 
  branch_name: "hotfix/critical-bug-fix",
  from_branch: "main"
});
```

### github_commit_changes
**Purpose**: Commit changes to a repository
**Parameters**:
- `repository`: Owner/repo format
- `branch`: Target branch name
- `message`: Commit message
- `files`: Array of file changes

```javascript
// Commit code changes
await mcp.github_commit_changes({
  repository: "myorg/myproject",
  branch: "feature/user-auth", 
  message: "feat: Add JWT authentication middleware\n\n- Implement token validation\n- Add user context extraction\n- Include error handling",
  files: [
    {
      path: "src/middleware/auth.js",
      content: "// New authentication middleware code"
    },
    {
      path: "tests/auth.test.js", 
      content: "// Authentication tests"
    }
  ]
});
```

### github_create_pull_request
**Purpose**: Create pull request with detailed information
**Parameters**:
- `repository`: Owner/repo format
- `title`: PR title
- `body`: PR description (supports markdown)
- `head`: Source branch
- `base`: Target branch (default: "main")

```javascript
// Create comprehensive PR
await mcp.github_create_pull_request({
  repository: "myorg/myproject",
  title: "feat: Add user authentication system",
  body: `## Summary
- Implement JWT-based authentication
- Add user registration and login endpoints
- Include middleware for protected routes

## Testing
- [x] Unit tests for auth functions
- [x] Integration tests for endpoints  
- [x] Manual testing with Postman

## Checklist
- [x] Code follows style guidelines
- [x] Tests added and passing
- [x] Documentation updated

Closes #123`,
  head: "feature/user-authentication",
  base: "develop"
});
```

### github_create_issue
**Purpose**: Create detailed issue for tracking
**Parameters**:
- `repository`: Owner/repo format
- `title`: Issue title
- `body`: Issue description
- `labels`: Array of label names
- `assignees`: Array of usernames

```javascript
// Create bug report
await mcp.github_create_issue({
  repository: "myorg/myproject",
  title: "Bug: Authentication fails with special characters in password",
  body: `## Description
Users cannot login when their password contains special characters like @, #, $.

## Steps to Reproduce
1. Register with password containing special characters
2. Attempt to login with same credentials
3. Login fails with 401 error

## Expected Behavior
Authentication should succeed with valid credentials regardless of special characters.

## Environment
- Browser: Chrome 118
- OS: macOS 14.1
- App Version: 1.2.3`,
  labels: ["bug", "authentication", "high-priority"],
  assignees: ["developer-username"]
});
```

### github_trigger_workflow
**Purpose**: Trigger GitHub Actions workflow
**Parameters**:
- `repository`: Owner/repo format
- `workflow_id`: Workflow file name or ID
- `branch`: Branch to run workflow on
- `inputs`: Workflow input parameters

```javascript
// Trigger deployment workflow
await mcp.github_trigger_workflow({
  repository: "myorg/myproject",
  workflow_id: "deploy.yml",
  branch: "main",
  inputs: {
    environment: "staging",
    version: "1.2.3"
  }
});
```

## Common Workflows

### Feature Development Workflow
```
1. Create feature branch from develop
   └─ github_create_branch()
   
2. Implement feature with commits
   └─ github_commit_changes() (multiple)
   
3. Create pull request
   └─ github_create_pull_request()
   
4. Address review feedback
   └─ github_commit_changes() (additional)
   
5. Merge and cleanup
   └─ Done via GitHub UI or additional MCP calls
```

### Bug Fix Workflow  
```
1. Create issue for bug report
   └─ github_create_issue()
   
2. Create hotfix branch
   └─ github_create_branch()
   
3. Implement fix
   └─ github_commit_changes()
   
4. Create PR linking to issue
   └─ github_create_pull_request() (with "Closes #123")
   
5. Trigger tests
   └─ github_trigger_workflow()
```

### Deployment Workflow
```
1. Verify all tests pass
   └─ github_trigger_workflow() (test workflow)
   
2. Create release branch if needed
   └─ github_create_branch()
   
3. Trigger deployment
   └─ github_trigger_workflow() (deploy workflow)
   
4. Monitor deployment status
   └─ Additional monitoring tools
```

## Commit Message Standards

### Format Template
```
type(scope): description

Detailed explanation of changes including:
- What was changed and why
- Any breaking changes
- References to related issues

Closes #123
```

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```javascript
// Feature commit
message: `feat(auth): add JWT token authentication

- Implement token generation and validation
- Add middleware for protected routes
- Include refresh token functionality

Closes #45`

// Bug fix commit  
message: `fix(api): resolve timeout issues in user endpoints

- Increase database connection timeout
- Add retry logic for failed queries
- Improve error handling and logging

Fixes #78`

// Documentation commit
message: `docs(readme): update installation instructions

- Add prerequisites section
- Update environment setup steps
- Include troubleshooting guide

Closes #92`
```

## Best Practices

### Branch Naming
- **Features**: `feature/description` or `feature/issue-number-description`
- **Hotfixes**: `hotfix/description` or `hotfix/issue-number-description`  
- **Releases**: `release/version-number`
- **Bugfixes**: `bugfix/description` or `bugfix/issue-number-description`

### PR Guidelines
- **Clear titles**: Summarize the change in 50 characters or less
- **Detailed descriptions**: Include summary, testing, and checklist
- **Link issues**: Use "Closes #123" or "Fixes #456" 
- **Request reviews**: Add relevant team members as reviewers

### Issue Management
- **Descriptive titles**: Clearly state the problem or feature
- **Detailed descriptions**: Include steps to reproduce, expected behavior
- **Appropriate labels**: Use consistent labeling system
- **Assign owners**: Assign issues to appropriate team members

## Error Handling

### Common Errors
```javascript
try {
  await mcp.github_create_branch({
    repository: "myorg/myproject",
    branch_name: "feature/new-feature"
  });
} catch (error) {
  if (error.message.includes("already exists")) {
    console.log("Branch already exists, continuing...");
  } else if (error.message.includes("not found")) {
    console.error("Repository not found or access denied");
  } else {
    console.error("GitHub API error:", error.message);
  }
}
```

### Retry Logic
```javascript
async function githubWithRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

## Setup Requirements

### Prerequisites
- GitHub account with repository access
- Personal Access Token with appropriate permissions
- GitHub MCP server configured in Claude Code

### Required Permissions
- **repo**: Full repository access
- **workflow**: Trigger workflows
- **admin:repo_hook**: Manage webhooks (if needed)
- **read:user**: Read user information

### Configuration
Location: `project-mcps/github-mcp-setup.md`
- Contains authentication setup
- Includes permission configuration
- Provides security best practices