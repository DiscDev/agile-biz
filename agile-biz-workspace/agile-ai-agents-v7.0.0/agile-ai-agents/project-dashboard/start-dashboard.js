#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { promisify } = require('util');

const execAsync = promisify(exec);

const DASHBOARD_DIR = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(DASHBOARD_DIR);

console.log('🚀 Starting AI Agent Project Dashboard...');
console.log(`📁 Dashboard directory: ${DASHBOARD_DIR}`);
console.log(`📁 Project root: ${PROJECT_ROOT}`);

// Check if Node.js is available
function checkNodeJS() {
    return new Promise((resolve, reject) => {
        exec('node --version', (error, stdout) => {
            if (error) {
                reject(new Error('Node.js is not installed. Please install Node.js 16+ to run the dashboard.'));
            } else {
                const version = stdout.trim();
                console.log(`✅ Node.js version: ${version}`);
                resolve(version);
            }
        });
    });
}

// Check if dependencies are installed
function checkDependencies() {
    const packageJsonPath = path.join(DASHBOARD_DIR, 'package.json');
    const nodeModulesPath = path.join(DASHBOARD_DIR, 'node_modules');
    
    if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found in dashboard directory');
    }
    
    return fs.existsSync(nodeModulesPath);
}

// Check if port is available
function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true); // Port is available
            });
            server.close();
        });
        
        server.on('error', () => {
            resolve(false); // Port is not available
        });
    });
}

// Find available port in range
async function findAvailablePort(startPort = 3001, endPort = 3010) {
    console.log(`🔍 Scanning for available ports (${startPort}-${endPort})...`);
    
    for (let port = startPort; port <= endPort; port++) {
        const isAvailable = await checkPort(port);
        if (isAvailable) {
            console.log(`✅ Found available port: ${port}`);
            return port;
        } else {
            console.log(`❌ Port ${port} is in use`);
        }
    }
    
    throw new Error(`No available ports found in range ${startPort}-${endPort}`);
}

// Check for latest dependency versions
async function checkLatestVersions() {
    console.log('🔍 Checking for latest dependency versions...');
    
    const packageJsonPath = path.join(DASHBOARD_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const updates = {};
    
    for (const [dep, currentVersion] of Object.entries(dependencies)) {
        try {
            const { stdout } = await execAsync(`npm view ${dep} version`, { cwd: DASHBOARD_DIR });
            const latestVersion = stdout.trim();
            const currentClean = currentVersion.replace(/[\^~]/, '');
            
            if (latestVersion !== currentClean) {
                updates[dep] = {
                    current: currentVersion,
                    latest: `^${latestVersion}`
                };
                console.log(`📦 ${dep}: ${currentVersion} → ^${latestVersion}`);
            }
        } catch (error) {
            console.log(`⚠️  Could not check ${dep}: ${error.message}`);
        }
    }
    
    return updates;
}

// Update package.json with latest versions
async function updatePackageJson(updates) {
    if (Object.keys(updates).length === 0) {
        console.log('✅ All dependencies are already up to date');
        return false;
    }
    
    console.log(`📝 Updating package.json with ${Object.keys(updates).length} dependency updates...`);
    
    const packageJsonPath = path.join(DASHBOARD_DIR, 'package.json');
    const backupPath = path.join(DASHBOARD_DIR, 'package.json.backup');
    
    // Create backup
    fs.copyFileSync(packageJsonPath, backupPath);
    console.log('💾 Created backup: package.json.backup');
    
    // Update package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    for (const [dep, versions] of Object.entries(updates)) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            packageJson.dependencies[dep] = versions.latest;
        }
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
            packageJson.devDependencies[dep] = versions.latest;
        }
    }
    
    // Update version
    const [major, minor, patch] = packageJson.version.split('.').map(Number);
    packageJson.version = `${major}.${minor}.${patch + 1}`;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Package.json updated successfully');
    
    return true;
}

// Fix compatibility issues for updated dependencies
async function fixCompatibilityIssues() {
    console.log('🔧 Checking for compatibility issues...');
    
    const serverJsPath = path.join(DASHBOARD_DIR, 'server.js');
    let serverJs = fs.readFileSync(serverJsPath, 'utf8');
    let modified = false;
    
    // Fix marked import for v15+
    if (serverJs.includes('const marked = require(\'marked\')')) {
        console.log('🔧 Updating marked import for v15+ compatibility...');
        serverJs = serverJs.replace(
            'const marked = require(\'marked\')',
            'const { marked } = require(\'marked\')'
        );
        modified = true;
    }
    
    // Fix marked configuration for v15+
    if (serverJs.includes('marked.setOptions({')) {
        console.log('🔧 Updating marked configuration for v15+ compatibility...');
        serverJs = serverJs.replace(
            'marked.setOptions({',
            'marked.use({'
        );
        modified = true;
    }
    
    // Add security middleware if not present
    if (!serverJs.includes('helmet')) {
        console.log('🔧 Adding security middleware...');
        
        // Add helmet import
        if (!serverJs.includes('const helmet = require(\'helmet\')')) {
            serverJs = serverJs.replace(
                'const cors = require(\'cors\');',
                'const cors = require(\'cors\');\nconst helmet = require(\'helmet\');\nconst compression = require(\'compression\');'
            );
        }
        
        // Add helmet middleware
        if (!serverJs.includes('app.use(helmet(')) {
            serverJs = serverJs.replace(
                'app.use(cors());',
                `app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(cors());`
            );
        }
        
        modified = true;
    }
    
    // Add error handling if not present
    if (!serverJs.includes('Error handling middleware')) {
        console.log('🔧 Adding error handling middleware...');
        
        const errorHandling = `
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Dashboard error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

`;
        
        serverJs = serverJs.replace(
            '// Start server',
            errorHandling + '// Start server'
        );
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(serverJsPath, serverJs);
        console.log('✅ Compatibility issues fixed');
    } else {
        console.log('✅ No compatibility issues found');
    }
}

// Install dependencies
function installDependencies() {
    return new Promise((resolve, reject) => {
        console.log('📦 Installing dashboard dependencies...');
        
        const npm = spawn('npm', ['install'], {
            cwd: DASHBOARD_DIR,
            stdio: 'inherit'
        });
        
        npm.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Dependencies installed successfully');
                resolve();
            } else {
                reject(new Error(`npm install failed with code ${code}`));
            }
        });
        
        npm.on('error', (error) => {
            reject(new Error(`Failed to run npm install: ${error.message}`));
        });
    });
}

// Start the dashboard server
function startDashboard(port) {
    return new Promise((resolve, reject) => {
        console.log(`🎯 Starting dashboard server on port ${port}...`);
        
        const server = spawn('node', ['server.js'], {
            cwd: DASHBOARD_DIR,
            stdio: 'inherit',
            env: {
                ...process.env,
                PROJECT_ROOT: PROJECT_ROOT,
                PORT: port
            }
        });
        
        server.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Dashboard stopped gracefully');
                resolve();
            } else {
                reject(new Error(`Dashboard server exited with code ${code}`));
            }
        });
        
        server.on('error', (error) => {
            reject(new Error(`Failed to start dashboard: ${error.message}`));
        });
        
        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping dashboard...');
            server.kill('SIGINT');
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Received SIGTERM, stopping dashboard...');
            server.kill('SIGTERM');
        });
    });
}

// Main startup sequence
async function main() {
    try {
        // Step 1: Check Node.js
        await checkNodeJS();
        
        // Step 2: Modernize dependencies
        console.log('\n🔄 Modernizing dashboard dependencies...');
        const updates = await checkLatestVersions();
        const wasUpdated = await updatePackageJson(updates);
        
        if (wasUpdated) {
            await fixCompatibilityIssues();
        }
        
        // Step 3: Check/Install dependencies
        const needsInstall = !checkDependencies() || wasUpdated;
        if (needsInstall) {
            console.log('📦 Installing updated dependencies...');
            await installDependencies();
        } else {
            console.log('✅ Dependencies already installed and up to date');
        }
        
        // Step 4: Find available port
        const availablePort = await findAvailablePort();
        
        // Step 5: Start dashboard on available port
        console.log(`\n🌐 Dashboard will be available at: http://localhost:${availablePort}\n`);
        await startDashboard(availablePort);
        
    } catch (error) {
        console.error('❌ Failed to start dashboard:');
        console.error(error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('1. Ensure Node.js 16+ is installed');
        console.error('2. Ensure npm registry access for dependency updates');
        console.error('3. Run "npm install" in the project-dashboard folder if auto-install fails');
        console.error('4. Ensure ports 3001-3010 have at least one available port');
        console.error('5. Check package.json.backup if dependency updates cause issues');
        process.exit(1);
    }
}

// Add helpful information
console.log(`
🤖 AI Agent Project Dashboard Launcher v2.0+
=============================================

This will start a modern, auto-updating dashboard for monitoring your AI agent coordination system.

Auto-Update Features:
🔄 Dependency modernization
🔧 Compatibility fixing
🛡️  Security updates
🚀 Performance optimizations

Dashboard Features:
✅ Live document monitoring
✅ Agent activity tracking  
✅ Real-time progress updates
✅ Stakeholder decision alerts

Dashboard will be available at: http://localhost:[AUTO-SELECTED PORT]
Auto-selects first available port in range 3001-3010

`);

main();