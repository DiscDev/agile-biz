# Project Scaffolds

This directory contains tech stack-specific project structure templates used by AgileAiAgents to create properly organized projects based on stakeholder-approved structures.

## Overview

Each template provides:
- **structure.yaml** - Defines the folder structure and initialization commands
- **Configuration files** - Stack-specific config templates (package.json, tsconfig, etc.)
- **Docker setup** - Development environment configuration
- **Orchestration scripts** - Root-level scripts to manage the full stack

## Categories

### 1. Separated Stack (`separated-stack/`)
For projects with distinct frontend and backend technologies:
- **react-node/** - React + Node.js/Express
- **vue-django/** - Vue.js + Django REST
- **angular-spring/** - Angular + Spring Boot
- **react-python/** - React + FastAPI/Flask
- **laravel-react/** - React + Laravel API

### 2. Full-Stack Frameworks (`fullstack-frameworks/`)
Frameworks that handle both frontend and backend:
- **nextjs/** - Next.js (React-based)
- **nuxtjs/** - Nuxt.js (Vue-based)
- **sveltekit/** - SvelteKit
- **remix/** - Remix

### 3. Monolithic Frameworks (`monolithic/`)
Traditional server-rendered frameworks:
- **django/** - Django with templates
- **rails/** - Ruby on Rails
- **laravel/** - Laravel

### 4. Microservices (`microservices/`)
Distributed service architectures:
- **node-microservices/** - Node.js-based microservices
- **polyglot-microservices/** - Mixed language services

### 5. Mobile (`mobile/`)
Mobile app with backend API:
- **react-native-node/** - React Native + Node.js
- **flutter-django/** - Flutter + Django

## Usage

These templates are used by:
1. **Project Analyzer Agent** - During stakeholder interviews to show structure options
2. **Coder Agent** - During Phase 8 scaffolding to create the actual structure
3. **Project Structure Agent** - To validate and monitor structure health

## Template Format

Each template contains:

### structure.yaml
```yaml
name: "Human-readable name"
category: "Category name"
description: "Brief description"
structure:
  - path: "frontend/"
    type: "directory"
    description: "Frontend application"
    init_command: "npm create vite@latest . -- --template react-ts"
  - path: "backend/"
    type: "directory"
    description: "Backend API"
    init_command: "npm init -y"
  - path: "package.json"
    type: "file"
    template: "root-package.json"
```

### Configuration Files
- Stack-specific configuration templates
- Pre-configured for best practices
- Integration-ready (e.g., frontend proxy to backend)

## Best Practices

1. **Separation of Concerns** - Clear boundaries between components
2. **Independent Dependencies** - Each component manages its own
3. **Framework Conventions** - Respect each framework's standards
4. **Deployment Ready** - Structure supports easy deployment
5. **Developer Experience** - Clear, intuitive organization

## Adding New Templates

To add a new stack template:
1. Create directory under appropriate category
2. Add `structure.yaml` with complete structure definition
3. Include all necessary config file templates
4. Add Docker configuration if applicable
5. Document any special requirements

## References

- Based on learnings from ComplianceCore project
- Incorporates community best practices
- Continuously improved through community contributions