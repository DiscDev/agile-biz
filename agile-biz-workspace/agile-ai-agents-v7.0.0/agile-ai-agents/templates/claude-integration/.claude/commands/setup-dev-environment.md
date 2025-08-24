---
allowed-tools: [Task]
argument-hint: Development environment type or technology stack to setup
---

# Setup Development Environment

Configure and initialize complete development environment with all necessary tools, dependencies, and configurations for productive development.

## Usage

```
/setup-dev-environment [environment-type]
```

**Examples:**
- `/setup-dev-environment full-stack` - Complete development environment setup
- `/setup-dev-environment frontend` - Frontend development environment
- `/setup-dev-environment backend` - Backend development environment
- `/setup-dev-environment mobile` - Mobile development environment

## What This Does

1. **Environment Analysis**: Assess current system and requirements
2. **Tool Installation**: Install and configure development tools
3. **Project Setup**: Initialize project structure and configurations
4. **Database Setup**: Configure development databases
5. **Validation**: Verify environment functionality and performance

## Environment Requirements Assessment

### System Requirements Analysis
```markdown
## Development Environment Requirements

**Project Type**: [Web App/Mobile App/API/Desktop/etc.]
**Technology Stack**: [Specific technologies and frameworks]
**Team Size**: [Number of developers]
**Operating Systems**: [Windows/macOS/Linux requirements]

### Technology Stack Requirements
**Frontend Technologies**:
- **Framework**: [React/Vue/Angular/Next.js/etc.]
- **Language**: [JavaScript/TypeScript/etc.]
- **Build Tools**: [Vite/Webpack/Parcel/etc.]
- **Styling**: [CSS/Sass/Tailwind/Styled Components]
- **State Management**: [Redux/Zustand/Context API]

**Backend Technologies**:
- **Runtime/Platform**: [Node.js/Python/Java/Go/.NET]
- **Framework**: [Express/FastAPI/Spring/Gin/ASP.NET]
- **Database**: [PostgreSQL/MySQL/MongoDB/Redis]
- **Authentication**: [JWT/OAuth/Passport/etc.]
- **API Style**: [REST/GraphQL/gRPC]

**DevOps and Tools**:
- **Version Control**: [Git/GitHub/GitLab/Bitbucket]
- **Containerization**: [Docker/Podman]
- **Package Management**: [npm/yarn/pip/composer]
- **Testing**: [Jest/Cypress/PyTest/JUnit]
- **Code Quality**: [ESLint/Prettier/SonarQube]

### Development Machine Requirements
**Minimum System Specifications**:
- **CPU**: [Processor requirements]
- **RAM**: [Memory requirements] 
- **Storage**: [Disk space needs]
- **Network**: [Bandwidth requirements]
- **GPU**: [Graphics requirements if applicable]

**Recommended Specifications**:
- **CPU**: [Optimal processor]
- **RAM**: [Optimal memory]
- **Storage**: [SSD recommendations]
- **Additional**: [External monitors, peripherals]
```

## Core Development Tools Installation

### Essential Development Tools
```markdown
## Development Tools Installation Checklist

### Code Editors and IDEs
- [ ] **Primary IDE**: [VS Code/IntelliJ/WebStorm/etc.]
  - Installation: [Download link and instructions]
  - Configuration: [Essential settings and extensions]
  - Themes and Appearance: [Recommended setup]
  - Productivity Extensions: [Must-have extensions list]

- [ ] **Alternative Editor**: [Vim/Emacs/Sublime Text] (optional)
  - Purpose: [When to use alternative editor]
  - Configuration: [Basic setup requirements]

### Version Control
- [ ] **Git Installation**
  ```bash
  # macOS (using Homebrew)
  brew install git
  
  # Windows (using Chocolatey)
  choco install git
  
  # Linux (Ubuntu/Debian)
  sudo apt-get install git
  ```
  
- [ ] **Git Configuration**
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  git config --global init.defaultBranch main
  git config --global core.autocrlf input  # macOS/Linux
  git config --global core.autocrlf true   # Windows
  ```

- [ ] **SSH Key Setup**
  ```bash
  # Generate SSH key
  ssh-keygen -t ed25519 -C "your.email@example.com"
  
  # Add to SSH agent
  eval "$(ssh-agent -s)"
  ssh-add ~/.ssh/id_ed25519
  
  # Add public key to GitHub/GitLab
  cat ~/.ssh/id_ed25519.pub
  ```

### Package Managers
- [ ] **Node.js and npm**
  ```bash
  # Install Node Version Manager (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  
  # Install latest LTS Node.js
  nvm install --lts
  nvm use --lts
  nvm alias default lts/*
  
  # Verify installation
  node --version
  npm --version
  ```

- [ ] **Python and pip** (if applicable)
  ```bash
  # macOS (using Homebrew)
  brew install python
  
  # Windows (using Python installer)
  # Download from python.org
  
  # Linux (Ubuntu/Debian)
  sudo apt-get install python3 python3-pip
  
  # Virtual environment setup
  pip install virtualenv
  ```

### Development Runtime and Frameworks
**Frontend Setup** (if applicable):
```bash
# Create new React project with TypeScript
npx create-react-app my-project --template typescript
# or
npm create vite@latest my-project -- --template react-ts

# Vue.js setup
npm create vue@latest my-project

# Next.js setup
npx create-next-app@latest my-project --typescript
```

**Backend Setup** (if applicable):
```bash
# Node.js/Express setup
mkdir my-backend
cd my-backend
npm init -y
npm install express cors helmet morgan
npm install -D nodemon @types/node typescript

# Python/FastAPI setup
mkdir my-backend
cd my-backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate  # Windows
pip install fastapi uvicorn sqlalchemy
```
```

## Database and Storage Setup

### Database Installation and Configuration
```markdown
## Database Development Environment

### PostgreSQL Setup
**Installation**:
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows (using Chocolatey)
choco install postgresql

# Linux (Ubuntu/Debian)  
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Initial Configuration**:
```bash
# Create development database
createdb myproject_dev
createdb myproject_test

# Create database user
psql -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE myproject_dev TO myuser;"
psql -c "GRANT ALL PRIVILEGES ON DATABASE myproject_test TO myuser;"
```

### MongoDB Setup (if applicable)
**Installation**:
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows (using Chocolatey)
choco install mongodb

# Linux (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get install mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Redis Setup (if applicable)
```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Windows (using Chocolatey)
choco install redis-64

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Database GUI Tools
- [ ] **PostgreSQL**: [pgAdmin/TablePlus/DBeaver]
- [ ] **MongoDB**: [MongoDB Compass/Studio 3T]
- [ ] **Redis**: [RedisInsight/Redis Desktop Manager]
- [ ] **Multi-database**: [DBeaver Universal Database Tool]
```

## Container and Infrastructure Setup

### Docker Development Environment
```markdown
## Containerization Setup

### Docker Installation
**Docker Desktop Installation**:
- **macOS**: Download from Docker Hub
- **Windows**: Download Docker Desktop for Windows
- **Linux**: Install Docker Engine and Docker Compose

**Installation Verification**:
```bash
docker --version
docker-compose --version
docker run hello-world
```

### Development Docker Configuration
**Docker Compose for Development**:
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: myproject_dev
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://myuser:mypassword@database:5432/myproject_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - database
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:3000

volumes:
  postgres_data:
  redis_data:
```

**Development Scripts**:
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment
docker-compose -f docker-compose.dev.yml down
```
```

## IDE and Editor Configuration

### VS Code Setup and Extensions
```markdown
## VS Code Development Setup

### Essential Extensions
**Language Support**:
- [ ] **JavaScript/TypeScript**: Built-in support
- [ ] **Python**: Microsoft Python extension
- [ ] **Go**: Go Team at Google extension
- [ ] **Java**: Extension Pack for Java
- [ ] **PHP**: PHP Intelephense

**Framework-Specific**:
- [ ] **ES7+ React/Redux/React-Native snippets**: React development
- [ ] **Vetur/Volar**: Vue.js development  
- [ ] **Angular Language Service**: Angular development
- [ ] **Flutter**: Flutter development

**Development Tools**:
- [ ] **GitLens**: Enhanced Git capabilities
- [ ] **Docker**: Docker container management
- [ ] **REST Client**: API testing
- [ ] **Thunder Client**: Alternative API testing
- [ ] **Database Client**: Database management

**Code Quality**:
- [ ] **ESLint**: JavaScript/TypeScript linting
- [ ] **Prettier**: Code formatting
- [ ] **SonarLint**: Code quality analysis
- [ ] **Code Spell Checker**: Spelling verification

**Productivity**:
- [ ] **Auto Rename Tag**: HTML tag renaming
- [ ] **Bracket Pair Colorizer**: Visual bracket matching
- [ ] **Path Intellisense**: File path completion
- [ ] **Live Share**: Collaborative development

### VS Code Configuration
**settings.json Configuration**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "onFocusChange",
  "workbench.iconTheme": "material-icon-theme",
  "terminal.integrated.defaultProfile.osx": "zsh",
  "git.autofetch": true,
  "editor.minimap.enabled": false,
  "workbench.editor.enablePreview": false,
  "explorer.confirmDelete": false,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

**keybindings.json** (Custom shortcuts):
```json
[
  {
    "key": "cmd+d",
    "command": "editor.action.deleteLines"
  },
  {
    "key": "cmd+shift+d",
    "command": "editor.action.copyLinesDownAction"
  }
]
```
```

## Project Structure and Configuration

### Project Initialization
```markdown
## Project Structure Setup

### Full-Stack Project Structure
```
my-project/
├── frontend/                 # Frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Backend API
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── server.js
├── shared/                   # Shared utilities and types
│   ├── types/
│   └── utils/
├── docs/                     # Documentation
│   ├── api/
│   └── setup/
├── scripts/                  # Development scripts
│   ├── setup.sh
│   └── dev.sh
├── .github/                  # CI/CD workflows
│   └── workflows/
├── docker-compose.dev.yml
├── .gitignore
├── README.md
└── package.json             # Root package.json for scripts
```

### Root Package.json Scripts
```json
{
  "name": "my-project",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && npm test",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:stop": "docker-compose -f docker-compose.dev.yml down",
    "setup": "./scripts/setup.sh"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### Environment Configuration
**.env.development**:
```env
# Database
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/myproject_dev
DATABASE_URL_TEST=postgresql://myuser:mypassword@localhost:5432/myproject_test

# Redis
REDIS_URL=redis://localhost:6379

# API
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# External APIs
EXTERNAL_API_KEY=your-api-key
```

**.env.template**:
```env
# Copy this file to .env and fill in your values
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
EXTERNAL_API_KEY=
```
```

## Code Quality and Testing Setup

### Linting and Formatting Configuration
```markdown
## Code Quality Tools Setup

### ESLint Configuration
**.eslintrc.json**:
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "react-hooks",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "warn"
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  }
}
```

### Prettier Configuration
**.prettierrc**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Pre-commit Hooks Setup
**Install Husky and lint-staged**:
```bash
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**package.json lint-staged configuration**:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### Testing Framework Setup
**Jest Configuration** (jest.config.js):
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```
```

## Development Scripts and Automation

### Development Automation Scripts
```markdown
## Development Scripts

### Setup Script (scripts/setup.sh)
```bash
#!/bin/bash
set -e

echo "🚀 Setting up development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Setup environment files
echo "🔧 Setting up environment files..."
cp .env.template .env
echo "Please edit .env file with your configuration"

# Start databases with Docker
echo "🐳 Starting development databases..."
docker-compose -f docker-compose.dev.yml up -d database redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
cd backend && npm run migrate && cd ..

# Create test database
echo "🧪 Setting up test database..."
cd backend && npm run migrate:test && cd ..

echo "✅ Development environment setup complete!"
echo "🎯 Run 'npm run dev' to start development servers"
```

### Development Helper Scripts
**scripts/dev.sh**:
```bash
#!/bin/bash
# Start full development environment

echo "🚀 Starting development environment..."

# Start databases if not running
docker-compose -f docker-compose.dev.yml up -d database redis

# Start development servers
npm run dev
```

**scripts/test.sh**:
```bash
#!/bin/bash  
# Run all tests

echo "🧪 Running all tests..."

# Run frontend tests
echo "Testing frontend..."
cd frontend && npm test -- --watchAll=false && cd ..

# Run backend tests
echo "Testing backend..."
cd backend && npm test && cd ..

echo "✅ All tests completed!"
```

**scripts/build.sh**:
```bash
#!/bin/bash
# Build production assets

echo "🏗️  Building production assets..."

# Build frontend
echo "Building frontend..."
cd frontend && npm run build && cd ..

# Build backend  
echo "Building backend..."
cd backend && npm run build && cd ..

echo "✅ Build completed!"
```
```

## Environment Validation and Testing

### Development Environment Verification
```markdown
## Environment Validation Checklist

### System Verification
- [ ] **Node.js Version**: `node --version` shows [Required Version]
- [ ] **npm Version**: `npm --version` shows [Required Version]  
- [ ] **Git Configuration**: `git config --list` shows user.name and user.email
- [ ] **Docker Status**: `docker --version` and `docker ps` work correctly
- [ ] **Database Connectivity**: Can connect to PostgreSQL and Redis
- [ ] **IDE Extensions**: All required VS Code extensions installed

### Project Verification
- [ ] **Dependencies Installed**: `npm install` completes without errors
- [ ] **Environment Variables**: All required .env variables configured
- [ ] **Database Migrations**: Database schema created successfully
- [ ] **Development Servers**: Frontend and backend start without errors
- [ ] **Hot Reload**: Code changes trigger automatic reload
- [ ] **API Connectivity**: Frontend can communicate with backend API

### Code Quality Verification
- [ ] **Linting**: `npm run lint` passes without errors
- [ ] **Formatting**: `npm run format` works correctly
- [ ] **Pre-commit Hooks**: Husky hooks trigger on git commit
- [ ] **Tests**: `npm test` runs and passes all tests
- [ ] **Code Coverage**: Test coverage reports generate correctly

### Performance Verification
**Development Server Performance**:
- Frontend dev server starts in <10 seconds
- Backend API server starts in <5 seconds
- Hot reload responds in <2 seconds
- Database queries respond in <100ms average

**Development Workflow Performance**:
- Git operations complete quickly
- IDE responds without significant lag
- Terminal/command execution is responsive
- File system operations are fast
```

### Troubleshooting Common Issues
```markdown
## Common Development Environment Issues

### Node.js and npm Issues
**Problem**: npm install fails with permission errors
**Solution**: 
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm to manage Node versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

**Problem**: Node version conflicts
**Solution**: Use nvm to manage multiple Node versions
```bash
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0
```

### Database Connection Issues
**Problem**: Can't connect to PostgreSQL
**Solution**: Check if PostgreSQL is running and accessible
```bash
# Check if PostgreSQL is running
brew services list | grep postgres  # macOS
sudo systemctl status postgresql    # Linux

# Test connection
psql -h localhost -U myuser -d myproject_dev
```

**Problem**: Database migration fails
**Solution**: Check database permissions and connectivity
```bash
# Reset database
dropdb myproject_dev
createdb myproject_dev
npm run migrate
```

### Docker Issues
**Problem**: Docker containers won't start
**Solution**: Check Docker daemon and container logs
```bash
# Check Docker status
docker system info

# Check container logs
docker-compose -f docker-compose.dev.yml logs database

# Reset Docker environment
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### IDE and Extension Issues
**Problem**: VS Code extensions not working
**Solution**: Reload window and check extension compatibility
```bash
# Command Palette: Developer: Reload Window
# Check extension logs in Output panel
```

**Problem**: ESLint/Prettier conflicts
**Solution**: Ensure consistent configuration
```bash
# Reset ESLint cache
npx eslint --cache-location .eslintcache --fix src/

# Check Prettier configuration
npx prettier --check src/
```
```

## Documentation and Knowledge Sharing

### Development Environment Documentation
```markdown
## Development Environment Documentation

### Quick Start Guide
Create a README.md with essential commands:

```markdown
# Project Development Setup

## Prerequisites
- Node.js 18+ 
- Docker Desktop
- PostgreSQL (or use Docker)

## Quick Setup
1. Clone repository
2. Run setup script: `./scripts/setup.sh`
3. Start development: `npm run dev`

## Development Commands
- `npm run dev` - Start all development servers
- `npm run test` - Run all tests
- `npm run lint` - Check code quality
- `npm run build` - Build for production

## Environment URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: PostgreSQL on port 5432
```

### Team Onboarding Checklist
**New Developer Onboarding**:
- [ ] Development machine meets minimum requirements
- [ ] All prerequisite software installed
- [ ] Repository cloned and setup script executed
- [ ] IDE configured with required extensions
- [ ] Environment variables configured
- [ ] Development servers start successfully
- [ ] Can run tests and linting without errors
- [ ] Has access to necessary external services/APIs
- [ ] Understands project structure and conventions
- [ ] Familiar with development workflow and Git process

### Knowledge Sharing Resources
- **Development Wiki**: Internal documentation with setup guides
- **Video Tutorials**: Screen recordings of setup process
- **Troubleshooting FAQ**: Common issues and solutions
- **Best Practices Guide**: Coding standards and conventions
- **Architecture Documentation**: System design and patterns
```

## Follow-up Actions

After development environment setup:
- `/start-development` - Begin active development phase
- `/test` - Validate environment with comprehensive testing
- `/generate-documentation` - Create project-specific documentation
- Train team members on environment usage
- Set up continuous integration pipeline
- Configure deployment environments