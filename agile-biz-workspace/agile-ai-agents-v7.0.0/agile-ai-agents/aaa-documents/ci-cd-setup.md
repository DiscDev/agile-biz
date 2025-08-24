# CI/CD Setup Guide for AgileAiAgents

## 🚀 Overview

This guide explains how to set up and use the Continuous Integration and Continuous Deployment (CI/CD) pipelines for AgileAiAgents.

## 📋 GitHub Actions Workflows

### Test Workflow (`test.yml`)

**Triggers:**
- On push to `main` or `develop` branches
- On pull requests to `main`
- Manual trigger via workflow_dispatch

**What it does:**
- Tests on multiple OS (Ubuntu, Windows, macOS)
- Tests on multiple Node.js versions (16, 18, 20)
- Runs diagnostic tests
- Checks code style
- Runs unit tests
- Tests health endpoint
- Performs security audit
- Builds and tests Docker image

**Usage:**
```bash
# Runs automatically on push/PR
# Or trigger manually from GitHub Actions tab
```

### Release Workflow (`release.yml`)

**Triggers:**
- On push of version tags (e.g., `v1.2.0`)
- Manual trigger with version input

**What it does:**
- Creates GitHub release with changelog
- Updates version.json
- Generates release notes
- Creates release archives (.tar.gz, .zip)
- Builds and pushes Docker images
- Updates documentation

**Usage:**
```bash
# Create a release by pushing a tag
git tag v1.2.0
git push origin v1.2.0

# Or trigger manually from GitHub Actions tab
```

### Dependency Check Workflow (`dependency-check.yml`)

**Triggers:**
- Weekly on Mondays at 8 AM UTC
- Manual trigger via workflow_dispatch

**What it does:**
- Checks for outdated dependencies
- Runs security audit
- Checks license compatibility
- Creates issue if updates needed
- Can auto-update patch versions

**Usage:**
```bash
# Runs automatically weekly
# Or trigger manually from GitHub Actions tab
```

## 🔧 Setup Requirements

### GitHub Repository Settings

Enable GitHub Actions:
1. Go to Settings → Actions → General
2. Set "Actions permissions" to "Allow all actions"
3. Enable "Read and write permissions" for GITHUB_TOKEN

### Required Secrets

Add these secrets in Settings → Secrets and variables → Actions:

```yaml
DOCKER_USERNAME    # Docker Hub username
DOCKER_PASSWORD    # Docker Hub password/token
```

### Branch Protection (Recommended)

For `main` branch:
1. Go to Settings → Branches
2. Add rule for `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

## 📦 Version Management

### Semantic Versioning

We follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

1. **Update version in code** (if needed):
   ```bash
   # Update version.json manually or via script
   ```

2. **Create and push tag**:
   ```bash
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push origin v1.2.0
   ```

3. **Release workflow automatically**:
   - Creates GitHub release
   - Generates changelog
   - Builds Docker images
   - Updates documentation

## 🐳 Docker Registry

### Docker Hub Setup

1. Create account at [hub.docker.com](https://hub.docker.com)
2. Create repository: `agileaiagents/dashboard`
3. Generate access token:
   - Account Settings → Security → Access Tokens
   - Create token with `Read, Write, Delete` permissions
4. Add token as `DOCKER_PASSWORD` secret in GitHub

### Published Images

After release:
- `agileaiagents/dashboard:latest` - Latest stable
- `agileaiagents/dashboard:1.2.0` - Specific version

## 📊 Monitoring CI/CD

### Check Workflow Status

1. Go to Actions tab in GitHub
2. View workflow runs
3. Click on a run for details

### Troubleshooting

**Tests failing:**
```bash
# Run tests locally first
cd project-dashboard
npm test
npm run diagnose
```

**Docker build failing:**
```bash
# Test Docker build locally
docker build -t test -f scripts/docker/Dockerfile .
```

**Release not creating:**
```bash
# Ensure tag format is correct
git tag -l  # List tags
git push --tags  # Push all tags
```

## 🔄 Local CI/CD Testing

### Run CI Tests Locally

```bash
# Install act (GitHub Actions locally)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# Run tests workflow
act -W .github/workflows/test.yml
```

### Test Release Process

```bash
# Dry run of release
act -W .github/workflows/release.yml --dry-run
```

## 📝 Best Practices

### Pre-commit Checks

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
cd project-dashboard
npm run lint
npm test
npm run diagnose
```

### Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `chore:` Maintenance
- `test:` Tests
- `security:` Security fixes

### Pull Request Template

Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Updated documentation

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] No console.log statements
- [ ] Updated version if needed
```

## 🚨 Security Scanning

### Automated Security Checks

1. **npm audit** - Runs on every test
2. **Trivy scanning** - Container vulnerability scanning
3. **CodeQL** - Code security analysis (if enabled)

### Manual Security Check

```bash
# Run security audit
cd project-dashboard
npm audit

# Fix vulnerabilities
npm audit fix

# Force fixes (careful!)
npm audit fix --force
```

## 📈 Performance Monitoring

### Build Time Optimization

Monitor and optimize:
- Docker build cache
- Dependency installation
- Test execution time

### GitHub Actions Insights

1. Go to Actions → Insights
2. View:
   - Workflow run duration
   - Success/failure rates
   - Resource usage

## 🎯 Next Steps

1. **Enable all workflows** in your repository
2. **Add required secrets** for Docker Hub
3. **Create first release** to test the pipeline
4. **Monitor weekly dependency** checks
5. **Set up branch protection** rules

---

For more details, see individual workflow files in `.github/workflows/`