# Troubleshooting Dashboard Dependencies

## Issue: "Cannot find module 'fs-extra'" Error

### Symptoms
When starting the dashboard, you see:
```
Error: Cannot find module 'fs-extra'
Require stack:
- .../machine-data/profile-selector.js
- .../project-dashboard/server.js
```

### Cause
The dashboard dependencies were not properly installed during setup. This typically happens when:
1. Network issues prevent npm from downloading packages
2. Node/npm version incompatibility
3. Permissions issues in the directory

### Solution

#### Quick Fix
```bash
cd agile-ai-agents/project-dashboard
npm install
npm start
```

#### Detailed Steps

1. **Navigate to the dashboard directory**:
   ```bash
   cd agile-ai-agents/project-dashboard
   ```

2. **Clean any partial installations**:
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Verify installation**:
   ```bash
   # Check if fs-extra is installed
   npm list fs-extra
   ```

5. **Start the dashboard**:
   ```bash
   npm start
   ```

### Alternative Solutions

#### If npm install fails:

1. **Check Node.js version**:
   ```bash
   node --version  # Should be >= 16.0.0
   npm --version   # Should be >= 7.0.0
   ```

2. **Try with different npm registry**:
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```

3. **Install with verbose logging**:
   ```bash
   npm install --verbose
   ```

#### Manual dependency installation:
```bash
cd project-dashboard
npm install fs-extra@11.3.0
npm install
```

### Prevention

The setup.sh script has been updated (v3.8.0+) to:
1. Remove the `--silent` flag from npm install for better error visibility
2. Check if installation succeeded before continuing
3. Verify node_modules exists before starting the dashboard
4. Re-attempt installation if dependencies are missing

### Related Issues

- **EACCES errors**: Permission issues - try with `sudo` or fix npm permissions
- **ECONNRESET**: Network issues - check internet connection or proxy settings
- **Version conflicts**: Clear npm cache with `npm cache clean --force`

### Still Having Issues?

1. Check the full error log:
   ```bash
   cat npm-debug.log
   ```

2. Verify all dependencies:
   ```bash
   cd project-dashboard
   npm ls
   ```

3. Report the issue with:
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Operating system
   - Full error message

Report issues at: https://github.com/DiscDev/agile-ai-agents/issues