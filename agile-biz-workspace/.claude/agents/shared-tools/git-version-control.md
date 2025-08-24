---
title: "Git Version Control - Shared Tool"
type: "shared-tool"
keywords: ["git", "version control", "branch", "merge", "commit", "repository", "workflow", "collaboration"]
agents: ["developer", "devops", "testing", "dba", "api", "security"]
token_count: 2024
---

# Git Version Control - Shared Tool

## When to Load This Context
- **Keywords**: git, version control, branch, merge, commit, repository, workflow, collaboration
- **Patterns**: "git workflow", "branching strategy", "version control", "code collaboration"
- **Shared by**: Developer, DevOps, Testing, Project Manager, Documentator agents

## Git Overview

**Git**: Distributed version control system for tracking code changes
- **Capabilities**: Version tracking, branch management, collaboration, code history
- **Core Commands**: `git add`, `git commit`, `git push`, `git pull`, `git branch`, `git merge`
- **Benefits**: Distributed development, complete history, branching flexibility, collaboration support

## Agent-Specific Usage

### For Developer Agents
- Manage feature development with branching
- Commit code changes with descriptive messages
- Collaborate through pull requests and code reviews
- Track and resolve merge conflicts

### For DevOps Agents
- Manage deployment branches and releases
- Configure Git hooks for automation
- Integrate with CI/CD pipelines
- Handle production hotfixes and rollbacks

### For Testing Agents
- Create test branches for validation
- Track test-related commits and changes
- Manage test data and configuration versioning
- Integrate with automated testing workflows

### For Project Manager Agents
- Track project progress through commits
- Monitor branch activity and merge status
- Generate reports from Git activity
- Coordinate releases and version management

### For Documentator Agents
- Version control documentation changes
- Manage documentation branches and updates
- Collaborate on documentation through pull requests
- Track documentation history and changes

## Core Git Workflows

### GitFlow Branch Strategy
```bash
# Main branches
main        # Production-ready code
develop     # Integration branch for features

# Supporting branches
feature/*   # New feature development
release/*   # Release preparation
hotfix/*    # Emergency production fixes

# Feature development workflow
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication
# ... develop feature ...
git add .
git commit -m "feat: add JWT authentication system"
git push origin feature/user-authentication
# ... create pull request to develop ...
```

### GitHub Flow (Simplified)
```bash
# Simpler workflow for continuous deployment
main        # Always deployable branch

# Feature development
git checkout main
git pull origin main
git checkout -b feature/new-feature
# ... develop feature ...
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature
# ... create pull request to main ...
# ... deploy after merge ...
```

### Release Management
```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Finalize release
git add .
git commit -m "chore: prepare release 1.2.0"

# Merge to main and tag
git checkout main
git merge release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/1.2.0
git push origin develop
```

## Commit Message Standards

### Conventional Commits Format
```
type(scope): description

[optional body]

[optional footer]
```

### Commit Types
- **feat**: New feature for users
- **fix**: Bug fix for users
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code restructuring without changing functionality
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

### Examples
```bash
# Feature commit
git commit -m "feat(auth): add JWT token authentication

Implements secure token-based authentication system:
- JWT token generation and validation
- Middleware for protected routes
- User session management

Closes #123"

# Bug fix commit
git commit -m "fix(api): resolve timeout issues in user endpoints

- Increase database connection timeout from 5s to 30s
- Add retry logic for failed database queries
- Improve error handling and user feedback

Fixes #456"

# Documentation commit
git commit -m "docs(readme): update installation instructions

- Add prerequisites section
- Update environment setup steps
- Include troubleshooting guide"
```

## Branch Management

### Branch Naming Conventions
```bash
# Feature branches
feature/user-authentication
feature/payment-integration
feature/dashboard-redesign

# Bug fix branches
fix/login-validation-error
fix/memory-leak-in-processor
fix/broken-image-uploads

# Hotfix branches
hotfix/critical-security-patch
hotfix/payment-processing-bug

# Release branches
release/1.2.0
release/2.0.0-beta

# Experimental branches
experiment/new-architecture
experiment/performance-optimization
```

### Branch Operations
```bash
# Create and switch to branch
git checkout -b feature/new-feature

# Switch between branches
git checkout main
git checkout develop
git checkout feature/new-feature

# List all branches
git branch -a

# Delete merged branch
git branch -d feature/completed-feature

# Force delete unmerged branch
git branch -D feature/abandoned-feature

# Push new branch to remote
git push -u origin feature/new-feature
```

## Collaboration Workflows

### Pull Request Process
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: implement new feature"

# 3. Push to remote
git push origin feature/new-feature

# 4. Create pull request (via GitHub/GitLab UI)
# 5. Code review process
# 6. Address feedback with additional commits
git add .
git commit -m "fix: address review feedback"
git push origin feature/new-feature

# 7. Merge after approval (via UI or command line)
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main
git branch -d feature/new-feature
```

### Code Review Best Practices
```bash
# Before requesting review
git log --oneline origin/main..HEAD  # Check commits
git diff origin/main..HEAD           # Review changes
git push origin feature/new-feature  # Ensure latest code

# During review process
git add .
git commit -m "review: address security concerns"
git push origin feature/new-feature
```

## Conflict Resolution

### Merge Conflict Handling
```bash
# When conflicts occur during merge
git status  # See conflicted files

# Edit conflicted files manually or use merge tool
git mergetool

# After resolving conflicts
git add <resolved-files>
git commit -m "resolve: merge conflicts in user authentication"

# Alternative: abort merge if needed
git merge --abort
```

### Rebase vs Merge
```bash
# Interactive rebase to clean up history
git rebase -i origin/main

# Rebase feature branch on latest main
git checkout feature/new-feature
git rebase main

# Standard merge (preserves branch history)
git checkout main
git merge feature/new-feature

# Squash merge (single commit)
git merge --squash feature/new-feature
git commit -m "feat: complete new feature implementation"
```

## Configuration & Setup

### Global Git Configuration
```bash
# User identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Editor preferences
git config --global core.editor "code --wait"

# Default branch name
git config --global init.defaultBranch main

# Line ending handling
git config --global core.autocrlf input  # Linux/Mac
git config --global core.autocrlf true   # Windows

# Useful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### Repository Setup
```bash
# Initialize new repository
git init
git remote add origin https://github.com/user/repo.git

# Clone existing repository
git clone https://github.com/user/repo.git

# Set up tracking branches
git branch --set-upstream-to=origin/main main
git branch --set-upstream-to=origin/develop develop
```

## Git Hooks

### Common Hooks
```bash
# Pre-commit hook (.git/hooks/pre-commit)
#!/bin/sh
# Run linting and basic tests before commit
npm run lint
npm run test:unit

# Pre-push hook (.git/hooks/pre-push)
#!/bin/sh
# Run comprehensive tests before push
npm run test
npm run build
```

### Hook Management Tools
```bash
# Using husky for hook management
npm install --save-dev husky

# Setup husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm run test"
```

## Advanced Operations

### History Manipulation
```bash
# Interactive rebase for history editing
git rebase -i HEAD~3

# Cherry-pick specific commits
git cherry-pick <commit-hash>

# Revert commits safely
git revert <commit-hash>

# Reset to specific commit (dangerous)
git reset --hard <commit-hash>
```

### Stashing Changes
```bash
# Stash current changes
git stash push -m "work in progress on feature X"

# List stashes
git stash list

# Apply and remove stash
git stash pop

# Apply without removing
git stash apply stash@{0}

# Drop specific stash
git stash drop stash@{0}
```

### Submodules
```bash
# Add submodule
git submodule add https://github.com/user/library.git libs/library

# Initialize submodules after clone
git submodule update --init --recursive

# Update submodules
git submodule update --remote
```

## Troubleshooting

### Common Issues
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Fix commit message
git commit --amend -m "new commit message"

# Remove file from Git but keep locally
git rm --cached <file>

# Clean untracked files
git clean -fd

# Restore deleted file
git checkout HEAD -- <file>
```

### Recovery Operations
```bash
# Find lost commits
git reflog
git log --all --full-history -- <file>

# Recover deleted branch
git checkout -b <branch-name> <commit-hash>

# Repair corrupted repository
git fsck --full
git gc --prune=now
```

## Security & Best Practices

### Credential Management
```bash
# Use credential helper
git config --global credential.helper store

# SSH key authentication (recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"

# GPG commit signing
git config --global user.signingkey <key-id>
git config --global commit.gpgsign true
```

### Repository Security
```bash
# Never commit sensitive data
echo "*.env" >> .gitignore
echo "*.key" >> .gitignore
echo "secrets/" >> .gitignore

# Remove sensitive data from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch secrets.txt' \
  --prune-empty --tag-name-filter cat -- --all
```

### Performance Optimization
```bash
# Optimize repository
git gc --aggressive --prune=now

# Reduce repository size
git remote prune origin
git repack -a -d --depth=250 --window=250

# Shallow clone for large repositories
git clone --depth 1 https://github.com/user/large-repo.git
```