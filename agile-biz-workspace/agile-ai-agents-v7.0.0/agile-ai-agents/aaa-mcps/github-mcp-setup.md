# GitHub MCP Server Setup Guide

## Overview

The GitHub MCP (Model Context Protocol) server enables the Coder and DevOps agents to directly interact with GitHub repositories. This integration allows agents to manage code, create pull requests, handle issues, and automate Git workflows without manual intervention.

## What This Enables

With GitHub MCP configured, the Coder and DevOps agents can:

### Coder Agent Capabilities
- 🔀 **Create branches** directly from issues or feature requests
- 📝 **Commit code changes** with proper commit messages
- 🔄 **Create pull requests** with detailed descriptions
- 📊 **Review code changes** and provide feedback
- 🐛 **Create and update issues** for bug tracking
- 🏷️ **Manage labels and milestones** for project organization
- 🔍 **Search repositories** for code patterns and files
- 📂 **Read and write files** directly in the repository

### DevOps Agent Capabilities
- 🚀 **Manage releases** and version tags
- 🔧 **Configure GitHub Actions** workflows
- 🔐 **Manage repository settings** and permissions
- 📦 **Handle deployment workflows** via GitHub
- 🏗️ **Set up CI/CD pipelines** using GitHub Actions
- 🌿 **Manage branch protection** rules
- 🔔 **Configure webhooks** for integrations
- 📈 **Monitor repository activity** and metrics

## Prerequisites

1. **GitHub Account**: You need a GitHub account with repository access
2. **Personal Access Token (PAT)**: Required for API authentication
3. **Repository Permissions**: Appropriate access to target repositories
4. **Claude Desktop**: MCP servers work with Claude Desktop app

## Step 1: Generate GitHub Personal Access Token

1. **Log in to GitHub** at https://github.com
2. **Go to Settings**:
   - Click your profile picture (top-right)
   - Select "Settings"
3. **Navigate to Developer Settings**:
   - Scroll down to "Developer settings" (bottom of sidebar)
   - Click "Personal access tokens"
   - Select "Tokens (classic)" or "Fine-grained tokens"

### For Classic Token (Recommended for full access):
4. **Click "Generate new token"** → "Generate new token (classic)"
5. **Configure token**:
   - **Note**: "AgileAiAgents Coder/DevOps MCP"
   - **Expiration**: Choose appropriate duration
   - **Select scopes**:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)
     - ✅ `delete_repo` (Delete repositories - use cautiously)
     - ✅ `admin:org` (Full control of orgs and teams)
     - ✅ `admin:repo_hook` (Full control of repository hooks)
     - ✅ `gist` (Create gists)
6. **Generate and copy token** immediately (you won't see it again!)

### For Fine-grained Token (More secure, limited scope):
4. **Click "Generate new token"** → "Generate new token (fine-grained)"
5. **Configure token**:
   - **Token name**: "AgileAiAgents MCP"
   - **Expiration**: Choose appropriate duration
   - **Repository access**: Select specific repositories
   - **Permissions**:
     - Contents: Read/Write
     - Issues: Read/Write
     - Pull requests: Read/Write
     - Actions: Read/Write
     - Metadata: Read
6. **Generate and copy token**

## Step 2: Install GitHub MCP Server

### Option A: Using NPX (Recommended)
```bash
# No installation needed, will run directly
npx @smithery-ai/github
```

### Option B: Global Installation
```bash
npm install -g @smithery-ai/github
```

## Step 3: Configure Claude Desktop

1. **Open Claude Desktop settings**
2. **Navigate to MCP Servers section**
3. **Add GitHub MCP configuration**:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@smithery-ai/github"],
      "env": {
        "GITHUB_TOKEN": "your-github-personal-access-token-here"
      }
    }
  }
}
```

## Step 4: Update AgileAiAgents .env File

Add your GitHub credentials to the `.env` file:

```bash
# GitHub MCP (Coder & DevOps Agents)
GITHUB_MCP_ENABLED=true
GITHUB_TOKEN=your-github-personal-access-token-here
GITHUB_DEFAULT_OWNER=your-github-username-or-org  # Optional
GITHUB_DEFAULT_REPO=your-default-repo-name        # Optional
```

## Available MCP Tools

### Repository Management Tools

#### **github_create_repository**
Create new GitHub repositories
```
Example: Create a new repository for the task management app
```

#### **github_get_repository**
Get repository information and settings
```
Example: Get repository details including default branch, visibility, etc.
```

#### **github_list_repositories**
List repositories for a user or organization
```
Example: List all repositories in the organization
```

### File Operations Tools

#### **github_read_file**
Read file contents from a repository
```
Example: Read README.md from the main branch
```

#### **github_write_file**
Create or update files in a repository
```
Example: Update package.json with new dependencies
```

#### **github_delete_file**
Delete files from a repository
```
Example: Remove deprecated configuration files
```

#### **github_list_files**
List files in a repository directory
```
Example: List all files in the src/ directory
```

### Branch and Commit Tools

#### **github_create_branch**
Create new branches from existing refs
```
Example: Create feature/user-authentication from main
```

#### **github_list_branches**
List all branches in a repository
```
Example: Get all feature branches for cleanup
```

#### **github_commit_changes**
Commit multiple file changes in a single commit
```
Example: Commit all changes for a feature implementation
```

### Pull Request Tools

#### **github_create_pull_request**
Create pull requests with title and description
```
Example: Create PR for feature branch to main
```

#### **github_list_pull_requests**
List pull requests with filters
```
Example: List all open PRs assigned to the team
```

#### **github_update_pull_request**
Update PR title, description, or status
```
Example: Update PR description with test results
```

### Issue Management Tools

#### **github_create_issue**
Create new issues with labels and assignees
```
Example: Create bug report with reproduction steps
```

#### **github_list_issues**
List issues with various filters
```
Example: List all open bugs labeled "high-priority"
```

#### **github_update_issue**
Update issue status, labels, or assignees
```
Example: Close issue after PR is merged
```

### GitHub Actions Tools

#### **github_list_workflows**
List GitHub Actions workflows
```
Example: Get all CI/CD workflows in the repository
```

#### **github_trigger_workflow**
Manually trigger a workflow run
```
Example: Trigger deployment workflow for production
```

## Coder Agent Workflow with GitHub MCP

When the Coder Agent uses GitHub MCP, the typical workflow is:

1. **Create Feature Branch**
   ```
   Agent creates branch from issue: feature/issue-123-user-auth
   ```

2. **Implement Code Changes**
   ```
   - Read existing files to understand structure
   - Write new code files
   - Update existing files
   - Commit changes with descriptive messages
   ```

3. **Create Pull Request**
   ```
   - Create PR with detailed description
   - Link to related issues
   - Add appropriate labels
   - Request reviews if needed
   ```

4. **Handle Code Review**
   ```
   - Update PR based on feedback
   - Add additional commits
   - Respond to review comments
   ```

## DevOps Agent Workflow with GitHub MCP

When the DevOps Agent uses GitHub MCP, typical tasks include:

1. **Set Up CI/CD**
   ```
   - Create .github/workflows directory
   - Write GitHub Actions workflow files
   - Configure build, test, and deploy steps
   ```

2. **Manage Releases**
   ```
   - Create release branches
   - Tag versions
   - Generate release notes
   - Trigger deployment workflows
   ```

3. **Configure Repository**
   ```
   - Set up branch protection rules
   - Configure webhooks
   - Manage repository settings
   - Set up deployment environments
   ```

## Example Agent Prompts with GitHub MCP

### For Coder Agent
```
Acting as the Coder Agent, use the GitHub MCP to:
1. Create a new feature branch for user authentication
2. Implement the authentication module
3. Commit the changes with proper commit messages
4. Create a pull request with a detailed description
```

### For DevOps Agent
```
Acting as the DevOps Agent, use the GitHub MCP to:
1. Set up GitHub Actions workflow for CI/CD
2. Configure automated testing on pull requests
3. Create deployment workflow for production
4. Set up branch protection for main branch
```

## Best Practices

### Security
1. **Use fine-grained tokens** when possible
2. **Limit token scope** to only necessary permissions
3. **Rotate tokens** regularly
4. **Never commit tokens** to repositories
5. **Use repository secrets** for sensitive data

### Workflow
1. **Follow Git flow** or GitHub flow patterns
2. **Use descriptive branch names**: `feature/`, `bugfix/`, `hotfix/`
3. **Write clear commit messages** following conventional commits
4. **Create detailed PR descriptions** with context
5. **Link issues to PRs** for traceability

### Collaboration
1. **Use draft PRs** for work in progress
2. **Add reviewers** appropriately
3. **Respond to feedback** promptly
4. **Keep PRs focused** and small
5. **Update issues** as work progresses

## Troubleshooting

### "Authentication failed" Error
- Verify your GitHub token is correct
- Check token hasn't expired
- Ensure token has necessary permissions
- Try regenerating the token

### "Repository not found" Error
- Check repository name and owner
- Verify token has access to the repository
- Ensure repository exists and isn't deleted

### "Permission denied" Error
- Token may lack required scopes
- Repository permissions may have changed
- Organization may require SSO authorization

### Rate Limiting
- GitHub API has rate limits
- Authenticated requests: 5,000/hour
- Check rate limit status in response headers
- Implement exponential backoff for retries

## Multi-Repository Configuration

AgileAiAgents supports projects with multiple repositories (e.g., separate repos for marketing site, API, and application). Here are the configuration approaches:

### Approach 1: Single Token with Multi-Repo Access (Simplest)

Use one GitHub token that has access to all project repositories:

```bash
# .env configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxx  # Token with access to all repos
GITHUB_PROJECT_REPOS=owner/marketing-site,owner/app,owner/api
```

**Pros**: Simple setup, easy management
**Cons**: Token has broad access

### Approach 2: Repository-Specific Configuration

Configure each repository separately in your `.env`:

```bash
# Marketing Site Repository
GITHUB_MARKETING_REPO=owner/marketing-site
GITHUB_MARKETING_BRANCH=main

# Application Repository  
GITHUB_APP_REPO=owner/app
GITHUB_APP_BRANCH=develop

# API Repository
GITHUB_API_REPO=owner/api  
GITHUB_API_BRANCH=main

# Single token for all (or use separate tokens)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### Approach 3: Multiple MCP Instances (Maximum Isolation)

For strict isolation between projects, run separate MCP instances:

```json
{
  "mcpServers": {
    "github-project-a": {
      "command": "npx",
      "args": ["@smithery-ai/github"],
      "env": {
        "GITHUB_TOKEN": "token-for-project-a"
      }
    },
    "github-project-b": {
      "command": "npx", 
      "args": ["@smithery-ai/github"],
      "env": {
        "GITHUB_TOKEN": "token-for-project-b"
      }
    }
  }
}
```

### Common Multi-Repository Patterns

#### 1. SaaS Platform Pattern
```
├── company-marketing/     # Public website (examplesite.com)
├── company-app/          # Main application (app.examplesite.com)
├── company-api/          # Backend API (api.examplesite.com)
└── company-admin/        # Admin panel (admin.examplesite.com)
```

#### 2. Microservices Pattern
```
├── company-gateway/      # API Gateway
├── company-auth/        # Authentication service
├── company-users/       # User management
├── company-payments/    # Payment processing
└── company-frontend/    # Web frontend
```

#### 3. Mobile + Web Pattern
```
├── company-web/         # Web application
├── company-mobile/      # React Native app
├── company-backend/     # Shared backend
└── company-docs/        # Documentation site
```

### Agent Coordination Across Repositories

The **Project Structure Agent** (coming soon) will coordinate multi-repo projects:

1. **Repository Mapping**: Tracks which code belongs in which repository
2. **Cross-Repo Dependencies**: Manages when changes span multiple repos
3. **Synchronized Releases**: Coordinates deployments across repositories

### Example Multi-Repository Workflow

```bash
# Coder Agent working across repos
"Acting as the Coder Agent, implement user authentication:
1. Add login UI to company-app repository
2. Create auth endpoints in company-api repository  
3. Update marketing site login button in company-marketing"

# The agent will:
- Switch between repositories as needed
- Create coordinated pull requests
- Link related PRs across repos
```

### Cross-Repository Pull Request Coordination

For changes that span multiple repositories:

1. **Use consistent branch names** across repos:
   ```
   feature/user-auth-2025-01
   ```

2. **Link PRs in descriptions**:
   ```markdown
   ## Related PRs
   - API: owner/api#123
   - Frontend: owner/app#456
   - Docs: owner/docs#789
   ```

3. **Coordinate merging** to avoid breaking changes

### Best Practices for Multi-Repository Projects

1. **Repository Naming Convention**
   ```
   {company}-{component}
   mycompany-marketing
   mycompany-app
   mycompany-api
   ```

2. **Consistent Branch Strategy**
   - Use same branch names across repos for features
   - Maintain same branching model (GitFlow, GitHub Flow)

3. **Token Scope Management**
   - Use fine-grained tokens when possible
   - Limit each token to necessary repositories
   - Document which token accesses which repos

4. **Documentation**
   - Maintain a repo-map.md in the main project
   - Document inter-repository dependencies
   - Track API contracts between services

## Integration with AgileAiAgents

Once configured, the agents will automatically:

### Coder Agent
1. Create feature branches for new development
2. Commit code changes with meaningful messages
3. Create pull requests for code review
4. Update code based on review feedback
5. Manage technical debt through issues

### DevOps Agent
1. Set up CI/CD pipelines using GitHub Actions
2. Configure automated testing and deployment
3. Manage release processes and versioning
4. Set up repository security and access controls
5. Monitor and optimize workflow performance

The agents will track all GitHub activities in:
```
agile-ai-agents/project-documents/implementation/
├── git-workflow.md
├── pull-requests.md
├── commit-history.md
└── deployment-logs.md
```

## Additional Resources

- **MCP Server Documentation**: https://smithery.ai/server/@smithery-ai/github
- **Available Tools**: https://smithery.ai/server/@smithery-ai/github/tools
- **API Reference**: https://smithery.ai/server/@smithery-ai/github/api
- **GitHub API Docs**: https://docs.github.com/en/rest
- **GitHub Actions Docs**: https://docs.github.com/en/actions

This integration significantly enhances the Coder and DevOps agents' capabilities, enabling professional-grade version control and deployment automation directly through GitHub!