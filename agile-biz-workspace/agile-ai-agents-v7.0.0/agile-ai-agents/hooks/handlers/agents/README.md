# Agent-Specific Hooks

This directory contains specialized hooks designed for specific AgileAiAgents agents. Hooks are organized by their performance impact and value proposition.

## Hook Categories

### 🚨 Critical Hooks (`/critical`)
**Always enabled** - Essential security and quality gates that protect your codebase.

* **Performance Budget**: 50ms average, 200ms max
* **Default**: Always ON for all agents
* **Examples**:
  - `vulnerability-scanner` - Scans dependencies for security vulnerabilities
  - `defensive-patterns` - Enforces defensive programming practices
  - `coverage-gatekeeper` - Maintains minimum test coverage
  - `secret-rotation-reminder` - Tracks secret expiration
  - `deployment-window-enforcer` - Enforces deployment schedules

### ⭐ Valuable Hooks (`/valuable`)
**High-value development support** - Recommended hooks that improve code quality and developer productivity.

* **Performance Budget**: 100ms average, 500ms max
* **Default**: ON for Standard and Advanced profiles
* **Examples**:
  - `import-validator` - Validates imports and module resolution
  - `test-categorizer` - Organizes and validates test structure
  - `error-boundary-enforcer` - Ensures proper error handling
  - `api-contract-validator` - Validates API schemas
  - `accessibility-checker` - Ensures UI accessibility

### ✨ Enhancement Hooks (`/enhancement`)
**Code quality improvements** - Optional hooks that enhance code quality and maintainability.

* **Performance Budget**: 200ms average, 1000ms max
* **Default**: OFF (enable as needed)
* **Examples**:
  - `code-complexity` - Monitors and reports complexity metrics
  - `naming-conventions` - Enforces naming standards
  - `bundle-size-monitor` - Tracks build size changes
  - `dead-code-detector` - Identifies unused code
  - `style-consistency` - Ensures consistent styling

### 🔬 Specialized Hooks (`/specialized`)
**Domain-specific validations** - Highly specialized hooks for specific use cases.

* **Performance Budget**: 500ms average, 2000ms max
* **Default**: OFF (enable for specific domains)
* **Examples**:
  - `gdpr-compliance-checker` - GDPR compliance validation
  - `ml-model-validator` - Machine learning model validation
  - `multi-tenant-validator` - Multi-tenancy isolation checks
  - `blockchain-audit` - Smart contract auditing
  - `quantum-readiness` - Quantum-safe cryptography checks

## Usage

### Enabling Hooks for an Agent

Hooks are configured in `/hooks/config/agent-hooks/agent-defaults.json`:

```json
{
  "agent_defaults": {
    "coder_agent": {
      "profile": "advanced",
      "overrides": {
        "critical": ["all"],
        "valuable": ["all"],
        "enhancement": ["code-complexity", "naming-conventions"],
        "specialized": []
      }
    }
  }
}
```

### Creating a New Hook

1. **Choose the appropriate category** based on performance impact and value
2. **Extend BaseAgentHook**:

```javascript
const BaseAgentHook = require('../../shared/base-agent-hook');

class MyNewHook extends BaseAgentHook {
  constructor() {
    super('my-new-hook', 'valuable'); // name and category
  }

  getDefaultConfig() {
    return {
      // Hook-specific configuration
    };
  }

  async execute() {
    // Hook implementation
  }
}
```

3. **Register in hook registry** (`/hooks/registry/hook-registry.json`)
4. **Test thoroughly** with performance budgets in mind

## Performance Guidelines

### Critical Hooks
- Must complete in < 200ms
- No external API calls
- Minimal file I/O
- Cache aggressively

### Valuable Hooks
- Target < 500ms completion
- Use async operations
- Cache results when possible
- Batch operations

### Enhancement Hooks
- Can take up to 1 second
- Should provide clear value
- Consider debouncing
- Offer quick vs thorough modes

### Specialized Hooks
- Can take up to 2 seconds
- Should be highly configurable
- Provide progress indicators
- Allow cancellation

## Agent-Specific Recommendations

### Coder Agent
- **Recommended**: All critical + valuable hooks
- **Consider**: code-complexity, naming-conventions
- **Profile**: Advanced

### Security Agent
- **Recommended**: All critical + valuable + enhancement hooks
- **Consider**: gdpr-compliance-checker, multi-tenant-validator
- **Profile**: Advanced

### Testing Agent
- **Recommended**: All critical + valuable hooks
- **Consider**: test-quality-scorer
- **Profile**: Advanced

### UI/UX Agent
- **Recommended**: Critical + accessibility-checker
- **Consider**: design-token-validator, user-flow-validator
- **Profile**: Standard

## Monitoring Hook Performance

View hook performance in the dashboard:
1. Navigate to the Agent Hooks section
2. Select your agent
3. Monitor real-time performance metrics
4. Adjust configuration based on recommendations

## Best Practices

1. **Start with a profile** (minimal, standard, or advanced)
2. **Monitor performance** regularly
3. **Disable slow hooks** that exceed budgets consistently
4. **Use caching** to improve performance
5. **Test in your environment** - performance varies by project size

## Troubleshooting

### Hook Running Too Slowly
1. Check performance metrics in dashboard
2. Review hook implementation for optimization opportunities
3. Consider moving to a lower-priority category
4. Implement caching or debouncing

### Hook Not Running
1. Verify hook is enabled for your agent
2. Check trigger conditions match your use case
3. Review logs for errors
4. Test with `node hooks/test-hooks.js test [hook-name]`

### Too Many Hooks Running
1. Review your profile selection
2. Disable non-essential enhancement hooks
3. Use custom profile for fine-grained control
4. Monitor total execution time in dashboard