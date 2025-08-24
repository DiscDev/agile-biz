# AgileAiAgents Troubleshooting Guide

## 🔍 Quick Diagnostics

Run diagnostics first to identify issues:
```bash
scripts/bash/diagnose.sh     # Unix/macOS
scripts/windows/diagnose.bat      # Windows
```

## 🚨 Common Issues & Solutions

### Dashboard Won't Start

#### Symptom: "Cannot find module" error
**Solution:**
```bash
cd project-dashboard
npm install
npm start
```

#### Symptom: "Port already in use" error
**Solution:**
1. Check what's using the port:
   ```bash
   # Unix/macOS
   lsof -i :3001
   
   # Windows
   netstat -ano | findstr :3001
   ```
2. Either stop the conflicting service or change port in `.env`:
   ```
   DASHBOARD_PORT=3002
   ```

#### Symptom: "Node version" error
**Solution:**
- Install Node.js 16 or higher from https://nodejs.org/
- Verify: `node -v`

### Authentication Issues

#### Symptom: Can't access dashboard (401 Unauthorized)
**Solution:**
1. Check if authentication is enabled in `.env`:
   ```
   DASHBOARD_AUTH_ENABLED=true
   DASHBOARD_USERNAME=admin
   DASHBOARD_PASSWORD=your_password
   ```
2. Use correct credentials when accessing dashboard
3. To disable auth: Set `DASHBOARD_AUTH_ENABLED=false`

### Health Check Failures

#### Symptom: Health endpoint returns unhealthy status
**Solution:**
1. View detailed health status:
   ```bash
   curl http://localhost:3001/api/health | json_pp
   ```
2. Check specific failures and address them:
   - **File System**: Ensure write permissions on project-documents
   - **Memory**: Free up system memory
   - **Disk Space**: Clear disk space
   - **Dependencies**: Run `npm install`

### Real-time Updates Not Working

#### Symptom: Documents don't update in dashboard
**Solution:**
1. Check WebSocket connection in browser console
2. Ensure file watcher has permissions:
   ```bash
   chmod -R 755 project-documents  # Unix/macOS
   ```
3. Restart dashboard to reinitialize file watcher

### API Errors

#### Symptom: Rate limiting errors (429 Too Many Requests)
**Solution:**
- Wait 15 minutes for rate limit to reset
- Increase rate limit in `.env`:
  ```
  API_RATE_LIMIT=200
  ```

#### Symptom: CORS errors in browser
**Solution:**
- Ensure you're accessing dashboard from allowed origin
- Add origin to CORS whitelist in server configuration

### Configuration Issues

#### Symptom: Missing .env file
**Solution:**
```bash
cp .env_example .env
# Edit .env with your credentials
```

#### Symptom: API features not working
**Solution:**
- Ensure API keys are configured in `.env`
- Remove placeholder text like "your_api_key_here"
- Test individual API keys

### Performance Issues

#### Symptom: Dashboard running slowly
**Solution:**
1. Check system resources:
   ```bash
   npm run diagnose
   ```
2. Reduce file watcher scope if needed
3. Increase Node.js memory limit:
   ```bash
   node --max-old-space-size=4096 server.js
   ```

### MCP Server Issues

#### Symptom: MCP features not working
**Solution:**
1. Verify MCP is enabled in `.env`:
   ```
   ZEN_MCP_ENABLED=true
   ZEN_MCP_API_KEY=your_actual_key
   ```
2. Check MCP server connectivity
3. Verify API key validity

## 📊 Diagnostic Decision Tree

```
Dashboard Issue?
├─ Won't Start?
│  ├─ Check Node.js version (16+)
│  ├─ Run npm install
│  └─ Check port availability
├─ Can't Access?
│  ├─ Check authentication settings
│  ├─ Verify credentials
│  └─ Check firewall/network
├─ Not Updating?
│  ├─ Check WebSocket connection
│  ├─ Verify file permissions
│  └─ Restart dashboard
└─ Errors/Slow?
   ├─ Run diagnostics
   ├─ Check health endpoint
   └─ Review logs
```

## 🛠️ Advanced Debugging

### Enable Debug Mode
```bash
# Unix/macOS
DEBUG=* npm start

# Windows
set DEBUG=* && npm start
```

### Check Process
```bash
# View Node.js processes
ps aux | grep node  # Unix/macOS
tasklist | findstr node  # Windows
```

### Monitor Resources
```bash
# Real-time monitoring
top  # Unix/macOS
taskmgr  # Windows

# Dashboard health metrics
curl http://localhost:3001/api/health/metrics
```

### Review Logs
1. Check console output for errors
2. Look for `diagnostic-report.json` after running diagnostics
3. Enable verbose logging in production

## 🆘 Getting Help

If issues persist after troubleshooting:

1. **Run full diagnostics** and save output:
   ```bash
   npm run diagnose > diagnostic-output.txt
   ```

2. **Collect information**:
   - Node.js version: `node -v`
   - npm version: `npm -v`
   - Operating system
   - Error messages
   - `diagnostic-report.json` contents

3. **Check documentation**:
   - [Setup Guide](./setup-guide.md)
   - [Usage Guide](./usage-guide.md)
   - [README](../README.md)

4. **Report issues**:
   - Include diagnostic output
   - Describe expected vs actual behavior
   - List steps to reproduce

## 🔄 Quick Fixes

### Reset Everything
```bash
# Backup your .env first!
cp .env .env.backup

# Clean install
rm -rf node_modules package-lock.json
npm install

# Reset configuration
cp .env_example .env
# Re-add your credentials to .env
```

### Emergency Stop
```bash
# Kill all Node.js processes
pkill node  # Unix/macOS
taskkill /F /IM node.exe  # Windows
```

### Safe Mode Start
```bash
# Start without authentication or rate limiting
DASHBOARD_AUTH_ENABLED=false API_RATE_LIMIT=1000 npm start
```

---

**Remember**: Most issues can be resolved by running diagnostics first! 🔍