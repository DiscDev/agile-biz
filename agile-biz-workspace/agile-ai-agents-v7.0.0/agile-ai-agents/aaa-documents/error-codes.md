# AgileAiAgents Error Code Reference

## 🚨 Error Code Format

All errors follow the format: `CATEGORY-XXX`

- **CATEGORY**: Error category (e.g., SYS, AUTH, CFG)
- **XXX**: Three-digit error number

## 📊 Error Severity Levels

- **🔴 Critical**: System cannot function, immediate action required
- **🟠 Error**: Operation failed, user action needed
- **🟡 Warning**: Operation completed with issues
- **🔵 Info**: Informational message

## 📋 Error Categories

### System Errors (SYS-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| SYS-001 | System initialization failed | Dashboard failed to start properly | Check logs, run diagnostics | 🔴 Critical |
| SYS-002 | Node.js version incompatible | Node.js < 16.0.0 | Update Node.js to v16+ | 🔴 Critical |
| SYS-003 | Out of memory | Insufficient memory | Free memory or increase heap | 🔴 Critical |
| SYS-004 | Process terminated unexpectedly | Unexpected shutdown | Check for crashes, restart | 🟠 Error |

### Authentication Errors (AUTH-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| AUTH-001 | Authentication required | No credentials provided | Provide credentials or disable auth | 🟠 Error |
| AUTH-002 | Invalid credentials | Wrong username/password | Check credentials in .env | 🟠 Error |
| AUTH-003 | Auth configuration error | Auth not properly configured | Set username/password in .env | 🟠 Error |

### Configuration Errors (CFG-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| CFG-001 | Missing .env file | Configuration file not found | Copy .env_example to .env | 🔴 Critical |
| CFG-002 | Invalid port configuration | Port number invalid | Use port 1024-65535 | 🟠 Error |
| CFG-003 | Missing required configuration | Required variable not set | Check .env for missing vars | 🟠 Error |
| CFG-004 | Invalid API credentials | API key format invalid | Verify API credentials | 🟡 Warning |

### File System Errors (FS-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| FS-001 | Directory not found | Required directory missing | Run setup or check path | 🟠 Error |
| FS-002 | Permission denied | Insufficient permissions | Fix file permissions | 🟠 Error |
| FS-003 | Disk space full | No space for operation | Free up disk space | 🔴 Critical |
| FS-004 | File watcher limit exceeded | System limit reached | Increase watcher limit | 🟡 Warning |

### Network Errors (NET-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| NET-001 | Port already in use | Port occupied by another process | Change port or stop process | 🟠 Error |
| NET-002 | Connection refused | Cannot connect to service | Verify service is running | 🟠 Error |
| NET-003 | Request timeout | Network request timed out | Check connectivity | 🟡 Warning |
| NET-004 | Rate limit exceeded | Too many requests | Wait 15 minutes | 🟡 Warning |

### Dashboard Errors (DASH-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| DASH-001 | Dashboard initialization failed | Failed to start server | Check logs, run npm install | 🔴 Critical |
| DASH-002 | WebSocket connection failed | Real-time connection failed | Check firewall/WebSocket support | 🟠 Error |
| DASH-003 | Missing dependencies | npm packages not installed | Run: npm install | 🔴 Critical |
| DASH-004 | Health check failed | Dashboard health issues | Check /api/health endpoint | 🟡 Warning |

### Agent Errors (AGT-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| AGT-001 | Agent file not found | Agent config file missing | Verify ai-agents directory | 🟠 Error |
| AGT-002 | Agent workflow error | Coordination error | Check coordination patterns | 🟠 Error |
| AGT-003 | Agent output directory missing | Cannot write output | Check project-documents permissions | 🟠 Error |

### API Errors (API-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| API-001 | Invalid API request | Request format invalid | Check API documentation | 🟠 Error |
| API-002 | API key missing | Required key not configured | Add API key to .env | 🟠 Error |
| API-003 | API quota exceeded | Usage limit reached | Wait or upgrade plan | 🟡 Warning |
| API-004 | External API unavailable | Third-party API down | Check service status | 🟡 Warning |

### MCP Errors (MCP-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| MCP-001 | MCP server not configured | MCP enabled but not configured | Configure MCP in .env | 🟡 Warning |
| MCP-002 | MCP connection failed | Cannot connect to MCP | Verify MCP URL/credentials | 🟠 Error |
| MCP-003 | MCP feature not available | Feature disabled/unavailable | Enable MCP in .env | 🔵 Info |

### Validation Errors (VAL-XXXX)

| Code | Message | Description | Solution | Severity |
|------|---------|-------------|----------|----------|
| VAL-001 | Invalid input | Input validation failed | Check input format | 🟠 Error |
| VAL-002 | Path traversal attempt | Security validation blocked | Use valid project paths | 🟠 Error |
| VAL-003 | Invalid file type | File type not supported | Use .md or .json files | 🟠 Error |

## 🛠️ Using Error Codes

### In Code
```javascript
const { AgileError } = require('./error-codes');

// Throw a specific error
throw new AgileError('NET_001', { port: 3001 });

// Handle errors
try {
  // operation
} catch (error) {
  if (error.code === 'NET_001') {
    console.log(error.solution); // "Change port or stop process"
  }
}
```

### In API Responses
```json
{
  "error": true,
  "code": "AUTH-002",
  "message": "Invalid credentials",
  "description": "Username or password is incorrect",
  "solution": "Check DASHBOARD_USERNAME and DASHBOARD_PASSWORD in .env",
  "severity": "error",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🔍 Quick Diagnosis

When you see an error code:

1. **Look up the code** in this reference
2. **Read the solution** provided
3. **Check severity** to understand impact
4. **Run diagnostics** if multiple errors: `npm run diagnose`

## 📞 Common Error Patterns

### Startup Failures
- `CFG-001` → Copy .env_example to .env
- `DASH-003` → Run npm install
- `NET-001` → Change port or stop conflicting process

### Runtime Issues
- `AUTH-002` → Check credentials
- `FS-002` → Fix file permissions
- `NET-004` → Wait for rate limit reset

### API Problems
- `API-002` → Configure API keys
- `API-003` → Check API quotas
- `MCP-001` → Configure MCP servers

## 🚀 Error Recovery

### Automatic Recovery
Some errors trigger automatic recovery:
- File watcher restarts on `FS-004`
- Reconnection attempts on `NET-002`
- Retry logic on `NET_003`

### Manual Recovery Steps
1. **Read error code and solution**
2. **Run diagnostics**: `npm run diagnose`
3. **Check health**: `/api/health`
4. **Review logs**: `logs/errors-YYYY-MM-DD.log`
5. **Restart if needed**: `npm run start:prod`

---

**Remember**: Error codes help identify issues quickly. Always check the solution first! 🎯