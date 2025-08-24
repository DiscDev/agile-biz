---
title: "Development Tools - Developer Agent Context"
type: "agent-context"
agent: "developer"
keywords: ["tool", "ide", "vscode", "git", "testing", "debug", "editor", "extension", "setup"]
token_count: 973
---

# Development Tools - Developer Agent Context

## When to Load This Context
- **Keywords**: tool, ide, vscode, git, testing, debug, editor, extension, setup
- **Patterns**: "set up development environment", "configure tools", "what tools", "IDE setup"

## Developer-Specific Tools

### Shared Tools Integration
For comprehensive tool information, see shared tool documentation:
- **Context7 MCP Integration**: `shared-tools/context7-mcp-integration.md`
- **GitHub MCP Integration**: `shared-tools/github-mcp-integration.md` 
- **Git Version Control**: `shared-tools/git-version-control.md`
- **Docker Containerization**: `shared-tools/docker-containerization.md`

### Development Environment Setup

#### IDE Configurations
- **VS Code**: Primary development environment with extensions
  - Essential extensions for development workflows
  - Integrated debugging and Git support
- **IntelliJ IDEA**: Java/Kotlin development and advanced debugging
- **PyCharm**: Python development and data science tools
- **WebStorm**: JavaScript/TypeScript and web development

### Code Quality & Analysis
- **SonarQube**: Code quality analysis and technical debt tracking
- **ESLint/Prettier**: JavaScript/TypeScript code formatting and linting
- **Black/Flake8**: Python code formatting and style checking
- **CodeClimate**: Automated code review and quality metrics

### Testing & Debugging Tools
- **Jest/Mocha**: JavaScript testing frameworks
- **PyTest**: Python testing framework
- **JUnit**: Java testing framework
- **Debuggers**: Integrated debugging tools and profilers

### Database & API Tools
- **Supabase MCP Server**: For backend integration, see `shared-tools/supabase-mcp-integration.md`
- **PostgreSQL/MySQL**: Database development and management
- **MongoDB**: NoSQL database operations
- **Postman/Insomnia**: API testing and development
- **Redis**: Caching and session management

### Security & Monitoring
- **OWASP ZAP**: Security testing and vulnerability scanning
- **Snyk**: Dependency vulnerability scanning
- **New Relic/Datadog**: Application performance monitoring
- **Logging frameworks**: Structured logging implementation

## VS Code Configuration

### Essential Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.flake8",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Settings Configuration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true
}
```

### Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Launch React",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"]
    }
  ]
}
```

## Git Configuration

### Global Git Setup
```bash
# Basic configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Useful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# Better diff and merge tools
git config --global diff.tool vscode
git config --global merge.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

### Git Hooks Setup
```bash
#!/bin/sh
# .git/hooks/pre-commit
# Run linting and tests before commit

# Run ESLint
npm run lint
if [ $? -ne 0 ]; then
  echo "ESLint failed. Fix errors before committing."
  exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Fix tests before committing."
  exit 1
fi
```

## Testing Tools Configuration

### Jest Configuration
```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/index.js",
    "!src/reportWebVitals.js"
  ],
  "coverageReporters": ["text", "lcov", "html"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### PyTest Configuration
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
```

## Database Tools

### PostgreSQL Setup
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb myapp_development
createdb myapp_test

# Connection string
DATABASE_URL=postgresql://username:password@localhost:5432/myapp_development
```

### Redis Setup
```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Connection string
REDIS_URL=redis://localhost:6379
```

## API Development Tools

### Postman Collection Template
```json
{
  "info": {
    "name": "MyApp API",
    "description": "API collection for MyApp",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api"
    }
  ]
}
```

### OpenAPI/Swagger Setup
```yaml
openapi: 3.0.0
info:
  title: MyApp API
  version: 1.0.0
  description: API documentation for MyApp
servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.myapp.com
    description: Production server
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Performance Monitoring

### Application Performance
```javascript
// Performance monitoring setup
import { createPerformanceMonitor } from './performance';

const monitor = createPerformanceMonitor({
  apiKey: process.env.APM_API_KEY,
  serviceName: 'myapp',
  environment: process.env.NODE_ENV
});

// Custom metrics
monitor.recordMetric('user.login', {
  userId: user.id,
  timestamp: Date.now(),
  duration: Date.now() - startTime
});
```