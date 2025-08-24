---
allowed-tools: Read(*), Write(*), Bash(*), Task(subagent_type:project_state_manager_agent)
description: Initialize Claude context in project folder
---

# Initialize Claude Context

Set up Claude context and project configuration for development work in a project folder.

## Context Initialization Process

1. **Project Detection**
   - Analyze current directory structure
   - Identify project type and technology stack
   - Detect existing configuration files
   - Scan for package managers and frameworks

2. **Technology Stack Analysis**
   ```
   Package files: package.json, requirements.txt, Gemfile, etc.
   Config files: webpack.config.js, tsconfig.json, etc.  
   Framework markers: React, Vue, Django, Rails, etc.
   Language indicators: .py, .js, .rb, .java, .go files
   ```

3. **CLAUDE.md Generation**
   - Create project-specific CLAUDE.md
   - Include detected technology stack
   - Add project structure documentation
   - Set up development commands
   - Configure deployment instructions

## Project Type Detection

1. **Frontend Projects**
   - React, Vue, Angular applications
   - Static sites, SPAs
   - Mobile applications

2. **Backend Projects**  
   - API servers, microservices
   - Databases and data layers
   - Background job processors

3. **Full-Stack Projects**
   - Combined frontend/backend
   - Monorepo structures
   - Integrated development environments

## CLAUDE.md Template Selection

Based on detected stack, use appropriate template:
```
templates/claude-integration/project-types/
├── react-typescript/
├── node-express/
├── python-django/
├── full-stack-separated/
├── monolithic/
└── generic/
```

## Context Configuration

1. **Development Environment**
   - Set up development commands
   - Configure build processes
   - Add testing instructions
   - Set up debugging guides

2. **Project Standards**
   - Code formatting rules
   - Testing requirements
   - Git workflow configuration
   - Documentation standards

3. **Tool Integration**
   - IDE settings recommendations
   - Extension suggestions
   - Linting configuration
   - CI/CD setup guidance

## Generated CLAUDE.md Structure

```markdown
# Project Name

## Overview
[Auto-generated project description]

## Technology Stack
- Frontend: [Detected framework]
- Backend: [Detected technology]
- Database: [Detected database]
- Testing: [Detected test framework]

## Development
### Commands
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production

### Project Structure
[Auto-generated structure documentation]

## Deployment
[Auto-generated deployment instructions]
```

## Integration Setup

1. **AgileAI Connection**
   - Link to AgileAiAgents system if detected
   - Set up project coordination
   - Configure document sync
   - Enable workflow integration

2. **Development Workflow**
   - Set up git hooks if needed
   - Configure automated testing
   - Set up linting and formatting
   - Enable hot reloading

## Output Format

```
🚀 CLAUDE CONTEXT INITIALIZED
==============================

📁 Project Type: [Detected Type]
💻 Technology Stack:
  • Frontend: [Framework]
  • Backend: [Technology]
  • Database: [Database]
  • Package Manager: [npm/yarn/pip/etc]

📋 Configuration Created:
  ✅ CLAUDE.md with project context
  ✅ Development commands configured
  ✅ Project structure documented
  ✅ Technology-specific settings applied

🔗 Integration Status:
  • AgileAI Integration: [Available/Not Found]
  • Git Repository: [Detected/Not Found]  
  • CI/CD: [Configured/Manual Setup]

📖 Documentation Generated:
  • Development workflow
  • Testing procedures
  • Deployment instructions
  • Code standards

Ready for development!
Use /help to see available project commands.
```

## Customization Options

- Override auto-detection with manual configuration
- Add custom development commands  
- Configure specific tool integrations
- Set up project-specific standards
- Enable advanced features (testing, deployment, monitoring)

## Error Handling

- Handle unrecognized project types gracefully
- Provide manual configuration options
- Suggest missing dependencies
- Guide setup for unsupported frameworks