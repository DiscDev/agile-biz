---
title: "Project Scaffolding Patterns - Developer Agent Context"
type: "agent-context"
agent: "developer"
keywords: ["scaffold", "setup", "structure", "template", "framework", "project", "init", "create"]
token_count: 845
---

# Project Scaffolding Patterns - Developer Agent Context

## When to Load This Context
- **Keywords**: scaffold, setup, structure, template, framework, project, init, create
- **Patterns**: "new project", "set up", "project structure", "create template", "initialize"

## Project Scaffolding Protocol

### Overview
The Developer Agent is responsible for creating proper project structure based on stakeholder-approved templates during Phase 8 of the new project workflow and when implementing structure migrations for existing projects.

### Stack Detection and Template Selection
When creating or restructuring a project:

1. **Identify Technology Stack**:
   - Frontend framework (React/Vue/Angular/Next.js/None)
   - Backend framework (Node/Python/Ruby/Java/Go/PHP)
   - Architecture pattern (Separated/Monolithic/Microservices)

2. **Load Approved Template**:
   - Reference structure decision from Phase 1 Section 2.5
   - Load template from `/templates/project-scaffolds/[category]/[stack]/`
   - Use `structure.yaml` for folder creation instructions

### Structure Enforcement Rules

**CRITICAL**: Never put frontend code in project root when backend exists

1. **Separated Stack** (React+Node, Vue+Django, etc.):
   ```bash
   cd [project-folder]  # User already created this
   mkdir frontend backend shared docs scripts
   cd frontend && npm create vite@latest . -- --template react-ts
   cd ../backend && npm init -y
   ```

2. **Monolithic Framework** (Django, Rails, Laravel):
   - Follow framework conventions exactly
   - Don't create unnecessary separation

3. **Microservices**:
   ```bash
   mkdir services infrastructure shared-libs
   ```

### Implementation Sequence

1. **Navigate to Project Directory**:
   - Project folder ALREADY EXISTS (user created it)
   - CLAUDE.md ALREADY EXISTS (from /add-agile-context)
   - DO NOT recreate the project root

2. **Create Structure**:
   - Create subdirectories from template
   - Initialize each component per `init_command`
   - Set up shared directories if applicable

3. **Configure Integration**:
   - Frontend proxy to backend (Vite config)
   - CORS settings for separated stacks
   - Environment variables (.env files)

4. **Update CLAUDE.md**:
   ```markdown
   ## Project Structure
   
   This project uses [Stack Name] with [Pattern] structure:
   
   ```
   ├── frontend/    # React application
   ├── backend/     # Node.js API
   └── shared/      # TypeScript types
   ```
   
   ### Development Commands
   - `npm run dev` - Start full stack
   - `npm run dev:frontend` - Frontend only
   - `npm run dev:backend` - Backend only
   ```

### Common Mistakes to Avoid

1. ❌ Putting React files in root with package.json
2. ❌ Mixing frontend/backend dependencies
3. ❌ Creating src/ in root for separated projects
4. ❌ Not respecting framework conventions
5. ❌ Creating the project folder (it exists!)

### Structure Validation

After creating structure, verify:
- [ ] Frontend code is isolated in `frontend/`
- [ ] Backend code is isolated in `backend/`
- [ ] Each has its own package.json
- [ ] Root has orchestration scripts only
- [ ] CLAUDE.md updated with structure docs

### Technology Stack Configuration Template

```yaml
backend_technologies:
  languages: ["Python", "JavaScript", "Java", "Go", "php"]
  frameworks: ["Django", "Express.js", "Spring Boot", "Gin", "Laravel"]
  databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis"]
  
frontend_technologies:
  languages: ["JavaScript", "TypeScript", "html", "css"]
  frameworks: ["React", "Vue.js", "Angular", "Next.js", "Nuxt.js"]
  styling: ["CSS3", "Sass", "Tailwind CSS"]
  
mobile_technologies:
  native: ["Swift", "Kotlin"]
  cross_platform: ["React Native", "Flutter"]
  
cloud_platforms:
  primary: "AWS"
  services: ["EC2", "RDS", "S3", "Lambda"]
```

### Framework-Specific Setup Examples

#### React + Node.js (Separated)
```bash
# Frontend (Vite + React + TypeScript)
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# Backend (Express + TypeScript)
cd ../backend
npm init -y
npm install express cors helmet morgan
npm install -D @types/node @types/express typescript nodemon ts-node
npx tsc --init
```

#### Next.js (Monolithic)
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

#### Python Django
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install django djangorestframework python-decouple
django-admin startproject . .
```

### Environment Configuration

#### .env Template
```bash
# Development
NODE_ENV=development
FRONTEND_PORT=5173
BACKEND_PORT=3000
DATABASE_URL=postgresql://localhost:5432/myapp
JWT_SECRET=your-jwt-secret-here

# Production
PRODUCTION_URL=https://yourapp.com
```

#### Package.json Scripts (Root)
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```