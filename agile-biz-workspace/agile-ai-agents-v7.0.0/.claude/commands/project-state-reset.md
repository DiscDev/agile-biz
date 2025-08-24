---
allowed-tools: [Task]
argument-hint: Reset scope or project area to reset
---

# Project State Reset

Reset project state to a clean or previous state, maintaining data integrity and providing rollback capabilities.

## Usage

```
/project-state-reset [reset-scope]
```

**Examples:**
- `/project-state-reset full` - Complete project state reset
- `/project-state-reset development` - Reset development environment only
- `/project-state-reset configuration` - Reset configurations to defaults
- `/project-state-reset selective` - Reset specific components

## What This Does

1. **State Assessment**: Analyze current project state and dependencies
2. **Backup Creation**: Create comprehensive backups before reset
3. **Selective Reset**: Reset chosen components while preserving critical data
4. **State Restoration**: Restore project to clean or target state
5. **Validation**: Verify reset completion and system integrity

## Reset Scope Analysis

### Current State Assessment
```markdown
## Project State Analysis

**Project**: [Project Name]
**Current State**: [Development/Testing/Production/etc.]
**Last Reset**: [Date of last reset or "Never"]
**Reset Trigger**: [Reason for reset request]

### Current Project Components
**Development Environment**:
- **Local Development**: [Status and configuration]
- **Database State**: [Current data and schema version]
- **Dependencies**: [Installed packages and versions]
- **Configuration Files**: [Custom settings and modifications]

**Code Repository**:
- **Current Branch**: [Active branch]
- **Uncommitted Changes**: [Any unstaged or staged changes]
- **Local Branches**: [List of local branches]
- **Stash Status**: [Any stashed changes]

**Project Documentation**:
- **Documentation Files**: [Current documentation state]
- **Project Decisions**: [Recorded decisions and rationale]
- **Configuration Documentation**: [Setup and config docs]

**Data and Artifacts**:
- **Development Data**: [Test data and development records]
- **Build Artifacts**: [Compiled code and assets]
- **Logs and Reports**: [Development logs and analysis reports]
- **External Integrations**: [Connected services and APIs]

### Dependencies and Integrations
**Internal Dependencies**:
- [Component 1]: [Dependency relationship]
- [Component 2]: [Dependency relationship]
- [Component 3]: [Dependency relationship]

**External Dependencies**:
- [Service 1]: [Integration status and data]
- [Service 2]: [Integration status and data]
- [API Keys/Credentials]: [Authentication status]
```

## Reset Strategy Planning

### Reset Scope Definition
```markdown
## Reset Strategy Selection

### Available Reset Strategies

1. **Full Project Reset**
   - **Scope**: Complete project environment and state
   - **Impact**: All local changes, data, and configuration lost
   - **Recovery Time**: [Estimated time to restore productivity]
   - **Data Preservation**: None (complete fresh start)
   - **Use Case**: Major corruption or starting over

2. **Development Environment Reset**
   - **Scope**: Local development setup and dependencies
   - **Impact**: Development tools and local data reset
   - **Recovery Time**: [Estimated time]
   - **Data Preservation**: Code repository and project files
   - **Use Case**: Development environment issues

3. **Configuration Reset**
   - **Scope**: Configuration files and environment settings
   - **Impact**: Custom settings return to defaults
   - **Recovery Time**: [Estimated time]
   - **Data Preservation**: Code and development data
   - **Use Case**: Configuration conflicts or corruption

4. **Selective Component Reset**
   - **Scope**: Specific components or features
   - **Impact**: Only selected components affected
   - **Recovery Time**: [Estimated time]
   - **Data Preservation**: Non-selected components unchanged
   - **Use Case**: Targeted issue resolution

**Selected Strategy**: [Chosen reset strategy]
**Rationale**: [Why this strategy was selected]

### Reset Timeline
**Phase 1: Preparation and Backup** ([Duration])
- Create comprehensive backups
- Document current state
- Prepare restoration resources
- Validate backup integrity

**Phase 2: Reset Execution** ([Duration])
- Execute reset procedures
- Remove/restore selected components
- Validate reset completion
- Initial functionality testing

**Phase 3: Restoration and Validation** ([Duration])
- Restore preserved components
- Reconfigure necessary settings
- Validate full system functionality
- Performance and integration testing
```

## Backup and Preservation Strategy

### Comprehensive Backup Plan
```markdown
## Data Preservation and Backup

### Critical Data Backup
**Code Repository Backup**:
```bash
# Create complete repository backup
git bundle create ../project-backup-$(date +%Y%m%d).bundle --all

# Export all branches and tags
git for-each-ref --format="%(refname)" refs/heads refs/tags | \
  while read ref; do
    git archive --format=tar --prefix="$ref/" "$ref" >> "../project-code-backup-$(date +%Y%m%d).tar"
  done

# Backup uncommitted changes
git stash push -m "Pre-reset backup $(date)" --include-untracked
git stash show -p > "../uncommitted-changes-$(date +%Y%m%d).patch"
```

**Database Backup** (if applicable):
```sql
-- PostgreSQL backup
pg_dump -h localhost -U username -d database_name > database_backup_$(date +%Y%m%d).sql

-- MySQL backup  
mysqldump -u username -p database_name > database_backup_$(date +%Y%m%d).sql

-- MongoDB backup
mongodump --db database_name --out backup_$(date +%Y%m%d)
```

**Configuration Backup**:
```bash
# Backup environment files
cp .env .env.backup.$(date +%Y%m%d)
cp .env.local .env.local.backup.$(date +%Y%m%d)

# Backup IDE settings
cp -r .vscode .vscode.backup.$(date +%Y%m%d)

# Backup package files
cp package.json package.json.backup.$(date +%Y%m%d)
cp package-lock.json package-lock.json.backup.$(date +%Y%m%d)

# Backup custom configurations
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  .prettierrc .eslintrc.json tsconfig.json vite.config.js
```

### Backup Validation
**Backup Integrity Checks**:
```bash
# Verify git bundle
git bundle verify ../project-backup-$(date +%Y%m%d).bundle

# Test database backup restoration
createdb test_restore_db
psql -d test_restore_db -f database_backup_$(date +%Y%m%d).sql
dropdb test_restore_db

# Verify configuration files
tar -tzf config-backup-$(date +%Y%m%d).tar.gz
```

**Backup Documentation**:
- **Backup Location**: [Where backups are stored]
- **Backup Contents**: [What is included in each backup]
- **Restoration Procedures**: [How to restore from backup]
- **Backup Retention**: [How long backups are kept]
```

## Reset Execution Procedures

### Development Environment Reset
```markdown
## Development Environment Reset Procedure

### Pre-Reset Checklist
- [ ] Current work committed or stashed
- [ ] Backups created and validated
- [ ] Team members notified (if shared environment)
- [ ] External service dependencies noted
- [ ] Reset rollback plan documented

### Node.js Environment Reset
```bash
# Clean npm cache and node_modules
npm cache clean --force
rm -rf node_modules package-lock.json

# Reset global npm packages (optional)
npm list -g --depth=0 > global-packages-backup.txt
npm uninstall -g [package-names]

# Reinstall from package.json
npm install

# Verify installation
npm audit
npm run build  # Test build process
```

### Database Reset
```bash
# PostgreSQL reset
dropdb myproject_dev
dropdb myproject_test
createdb myproject_dev
createdb myproject_test

# Run fresh migrations
npm run migrate
npm run migrate:test

# Seed development data
npm run seed:dev
```

### Docker Environment Reset
```bash
# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Clean docker system (optional - affects all projects)
docker system prune -a

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### IDE and Configuration Reset
```bash
# Reset VS Code workspace settings
rm -rf .vscode/settings.json

# Reset git configuration (local repository)
git config --unset-all user.name
git config --unset-all user.email

# Remove IDE-specific files
rm -rf .idea/  # IntelliJ
rm -rf *.code-workspace  # VS Code workspaces
```
```

### Repository State Reset
```markdown
## Git Repository Reset Options

### Soft Reset (Preserve Changes)
```bash
# Reset to specific commit, keep changes staged
git reset --soft [commit-hash]

# Reset to previous commit
git reset --soft HEAD~1
```

### Mixed Reset (Default - Unstage Changes)
```bash
# Reset to specific commit, unstage changes
git reset [commit-hash]

# Clean up untracked files
git clean -fd
```

### Hard Reset (Discard All Changes)
```bash
# ⚠️  WARNING: This discards all uncommitted changes
git reset --hard [commit-hash]

# Reset to specific branch state
git reset --hard origin/main

# Clean all untracked files
git clean -fdx
```

### Branch Management Reset
```bash
# Delete all local branches except main
git branch | grep -v "main" | xargs git branch -D

# Reset branch to match remote
git checkout main
git fetch origin
git reset --hard origin/main

# Remove all local tracking of deleted remote branches
git remote prune origin
```
```

## Configuration and Environment Reset

### Environment Configuration Reset
```markdown
## Configuration Reset Procedures

### Environment Variables Reset
```bash
# Restore environment files from template
cp .env.example .env
cp .env.local.example .env.local

# Reset to development defaults
cat > .env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/myproject_dev
REDIS_URL=redis://localhost:6379
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
EOF
```

### Application Configuration Reset
```javascript
// Reset configuration files to defaults

// vite.config.js reset
export default {
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost'
  },
  build: {
    outDir: 'dist'
  }
};

// Package.json scripts reset to standard
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx"
  }
}
```

### Database Schema Reset
```sql
-- PostgreSQL schema reset
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO username;

-- Run initial migrations
-- npm run migrate
```

### Dependencies Reset
```bash
# Reset to package.json dependencies
npm ci  # Clean install from package-lock.json

# Or complete reinstall
rm package-lock.json
rm -rf node_modules
npm install

# Update to latest versions (optional)
npm update
npm audit fix
```
```

## Post-Reset Validation and Testing

### System Validation Checklist
```markdown
## Post-Reset Validation

### Environment Validation
- [ ] **Node.js Environment**: `node --version` and `npm --version` work
- [ ] **Dependencies**: `npm install` completes without errors
- [ ] **Database Connection**: Can connect to development database
- [ ] **Environment Variables**: All required variables are set
- [ ] **Development Servers**: Frontend and backend start successfully

### Functionality Testing
- [ ] **Build Process**: `npm run build` completes successfully
- [ ] **Test Suite**: `npm test` passes all tests
- [ ] **Linting**: `npm run lint` passes without errors
- [ ] **API Endpoints**: Backend API responds correctly
- [ ] **Frontend**: UI loads and basic functionality works

### Integration Testing
- [ ] **Database Operations**: CRUD operations work correctly
- [ ] **Authentication**: Login/logout functionality works
- [ ] **External APIs**: Third-party integrations respond
- [ ] **File Operations**: File upload/download works (if applicable)
- [ ] **Email/Notifications**: Notification systems work (if applicable)

### Performance Validation
- [ ] **Development Server Speed**: Servers start in reasonable time
- [ ] **Hot Reload**: Code changes trigger automatic reload
- [ ] **Database Queries**: Database responds quickly
- [ ] **API Response Times**: API endpoints respond within targets
- [ ] **Frontend Performance**: UI is responsive and fast

### Data Integrity Verification
```bash
# Verify database structure
psql -d myproject_dev -c "\dt"  # List tables
psql -d myproject_dev -c "\d users"  # Describe users table

# Verify seed data
psql -d myproject_dev -c "SELECT COUNT(*) FROM users;"

# Verify migrations applied
npm run migrate:status
```
```

## Recovery and Rollback Procedures

### Rollback Strategies
```markdown
## Reset Recovery Procedures

### Immediate Rollback (Reset Failed)
If reset fails or causes critical issues:

```bash
# Restore from git bundle
git clone ../project-backup-$(date +%Y%m%d).bundle recovered-project
cd recovered-project

# Restore database
dropdb myproject_dev
createdb myproject_dev
psql -d myproject_dev -f ../database_backup_$(date +%Y%m%d).sql

# Restore configurations
cp ../.env.backup.$(date +%Y%m%d) .env
tar -xzf ../config-backup-$(date +%Y%m%d).tar.gz

# Restore dependencies
npm install
```

### Partial Recovery (Selective Restoration)
```bash
# Restore specific files from backup
git show backup-branch:path/to/file > path/to/file

# Restore specific database tables
pg_restore -d myproject_dev -t users ../database_backup.sql

# Restore specific configurations
cp ../config-backup/.prettierrc .prettierrc
```

### Incremental Recovery
```bash
# Apply changes incrementally
git cherry-pick [commit-hash]

# Restore data incrementally
psql -d myproject_dev -c "INSERT INTO table SELECT * FROM backup_table;"

# Merge configuration changes
git merge-file current.config backup.config new.config
```

### Recovery Validation
**Post-Recovery Checklist**:
- [ ] All critical functionality restored
- [ ] Data integrity maintained
- [ ] No duplicate or corrupted data
- [ ] All integrations working
- [ ] Team can resume normal development
- [ ] Performance restored to pre-reset levels
```

## Documentation and Communication

### Reset Documentation
```markdown
## Reset Documentation Requirements

### Reset Log Documentation
**Reset Summary Report**:
- **Date**: [Reset completion date]
- **Duration**: [Time taken for complete reset]
- **Scope**: [What was reset vs what was preserved]
- **Issues Encountered**: [Problems and resolutions]
- **Data Loss**: [Any data that couldn't be recovered]
- **Performance Impact**: [System performance after reset]

### Team Communication
**Pre-Reset Communication**:
- **Notification**: [When team was notified]
- **Impact**: [How reset affects team members]
- **Timeline**: [Expected duration and completion]
- **Action Required**: [What team members need to do]

**Post-Reset Communication**:
- **Completion Notification**: [Reset completion announcement]
- **New Instructions**: [Any changes to development process]
- **Known Issues**: [Problems that may affect team]
- **Support**: [How to get help if issues arise]

### Knowledge Base Updates
**Documentation Updates**:
- [ ] Update setup documentation with any new procedures
- [ ] Document lessons learned from reset process
- [ ] Update troubleshooting guides with reset solutions
- [ ] Create or update reset runbooks for future use

**Process Improvements**:
- [ ] Identify process improvements to prevent future reset needs
- [ ] Update backup procedures based on reset experience
- [ ] Improve monitoring to detect issues earlier
- [ ] Document better practices to maintain clean development state
```

### Lessons Learned and Prevention
```markdown
## Reset Prevention and Best Practices

### Reset Prevention Strategies
**Regular Maintenance**:
- Weekly dependency updates and security patches
- Monthly development environment cleanup
- Quarterly full backup and restore testing
- Regular database maintenance and optimization

**Early Warning Systems**:
- Monitor development environment health
- Track dependency conflicts and version issues
- Monitor database performance and corruption
- Alert on configuration drift from standards

**Development Best Practices**:
- Use consistent development environments (Docker)
- Regular commits and branch management
- Automated testing to catch issues early
- Code review processes to prevent problematic changes

### Future Reset Preparedness
**Improved Backup Strategy**:
- Automated daily backups of critical components
- Version-controlled configuration management
- Documented restoration procedures
- Tested rollback scenarios

**Better Monitoring**:
- Development environment health dashboards
- Automated alerts for configuration changes
- Performance monitoring and trend analysis
- Regular system health checks
```

## Follow-up Actions

After project state reset:
- `/setup-dev-environment` - Reconfigure development environment
- `/verify-context` - Validate project context and configuration
- `/test` - Run comprehensive testing suite
- Update team on reset completion and any changes
- Document lessons learned and process improvements
- Monitor system performance and stability post-reset