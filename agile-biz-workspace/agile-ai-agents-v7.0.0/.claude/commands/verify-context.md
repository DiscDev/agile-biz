---
allowed-tools: Read(*), Bash(test:*, ls:*, cat:*)
description: Verify project context and configuration integrity
---

# Verify Context

Perform comprehensive verification of project context, configuration, and system integration.

## Verification Categories

1. **CLAUDE.md Validation**
   - Check CLAUDE.md exists and is readable
   - Verify required sections are present
   - Validate command syntax and references
   - Check for configuration conflicts

2. **Project Structure**
   - Verify expected directories exist
   - Check file permissions
   - Validate symbolic links (if used)
   - Confirm project type detection accuracy

3. **System Integration**
   - Test AgileAI integration (if configured)
   - Verify command availability
   - Check document access
   - Validate workflow coordination

## CLAUDE.md Verification

Check for essential CLAUDE.md components:
```markdown
Required Sections:
- Project overview
- Technology stack
- Development commands
- Project structure
- Deployment instructions

Optional Sections:
- AgileAI integration
- Testing procedures
- Contributing guidelines
- Troubleshooting guide
```

## Integration Checks

1. **AgileAI Integration** (if present)
   - Verify system path accessibility
   - Test document linking
   - Check command integration
   - Validate state synchronization

2. **Development Environment**
   - Verify package manager detection
   - Check build tool configuration
   - Test development commands
   - Validate dependency resolution

3. **Tool Configuration**
   - Check linting setup
   - Verify testing framework
   - Validate IDE configuration
   - Test CI/CD integration

## Command Validation

Test all configured commands:
- Development server startup
- Testing execution
- Build processes
- Deployment procedures
- AgileAI coordination (if enabled)

## Output Format

```
🔍 CONTEXT VERIFICATION REPORT
===============================

📋 CLAUDE.md Status
  ✅ File exists and readable
  ✅ Required sections present
  ✅ Command syntax valid
  ✅ Technology stack documented
  ⚠️  Missing: Contributing guidelines

📁 Project Structure
  ✅ Core directories present
  ✅ File permissions correct
  ✅ Symbolic links valid
  ✅ Project type: React TypeScript

🔗 System Integration
  ✅ AgileAI integration active
  ✅ Commands accessible
  ✅ Document linking functional
  ✅ State synchronization working

⚙️  Development Environment
  ✅ Package manager: npm
  ✅ Build tool: Vite
  ✅ Testing: Jest + RTL
  ✅ Linting: ESLint + Prettier

🧪 Command Testing
  ✅ npm run dev - starts successfully
  ✅ npm test - executes tests
  ✅ npm run build - builds project
  ✅ /aaa-status - AgileAI responds
  ❌ npm run deploy - command not found

📊 Overall Health: GOOD (8/9 checks passed)

⚠️  Issues Found:
  • Deploy command missing or misconfigured
  • Contributing guidelines not documented

💡 Recommendations:
  1. Add deployment configuration
  2. Create CONTRIBUTING.md file
  3. Consider adding pre-commit hooks
```

## Detailed Diagnostics

### File System Checks
- Verify all referenced paths exist
- Check read/write permissions
- Test symbolic link integrity
- Validate directory structure

### Configuration Validation
- Parse and validate JSON/YAML configs
- Check environment variable references
- Verify API endpoints and connections
- Test authentication configurations

### Dependency Analysis
- Check for missing dependencies
- Verify version compatibility
- Test package manager functionality
- Validate dependency security

## Quick Fix Suggestions

For common issues found:
1. **Missing Commands**: Provide template commands
2. **Broken Links**: Suggest path corrections
3. **Permission Issues**: Offer fix commands
4. **Configuration Errors**: Provide corrected configs

## Performance Metrics

Track verification performance:
- Time to complete full verification
- Number of checks performed
- Success rate percentage
- Most common issues found

## Advanced Verification

Optional deep checks:
- Security vulnerability scanning
- Performance baseline testing
- Code quality analysis
- Documentation completeness review