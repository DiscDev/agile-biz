@echo off
setlocal enabledelayedexpansion

REM AgileAiAgents Setup Script for Windows
REM This script automates the initial setup process for AgileAiAgents

REM Get version from VERSION.json
set VERSION=6.2.0
if exist VERSION.json (
    for /f "tokens=2 delims=:," %%a in ('findstr /r "\"version\"" VERSION.json') do (
        set VERSION=%%a
        set VERSION=!VERSION:"=!
        set VERSION=!VERSION: =!
    )
)

REM Colors don't work well in batch, so using simple text
echo.
echo ===================================================
echo           AgileAiAgents Setup Wizard
echo                  Version !VERSION!
echo ===================================================
echo.

REM Step 1: Check prerequisites
echo Step 1: Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel%==0 (
    for /f "tokens=2 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
    for /f "tokens=1 delims=." %%i in ("!NODE_VERSION!") do set NODE_MAJOR=%%i
    
    if !NODE_MAJOR! geq 16 (
        echo [OK] Node.js v!NODE_VERSION! detected
    ) else (
        echo [ERROR] Node.js 16+ required. Current version: v!NODE_VERSION!
        echo Please install Node.js from https://nodejs.org/
        pause
        exit /b 1
    )
) else (
    echo [ERROR] Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm
where npm >nul 2>nul
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm v!NPM_VERSION! detected
) else (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

REM Check Git (optional)
where git >nul 2>nul
if %errorlevel%==0 (
    echo [OK] Git detected
) else (
    echo [WARNING] Git not found. Recommended for version control
)

echo.

REM Step 2: Create .env file
echo Step 2: Setting up environment configuration...
echo.

if exist .env (
    echo [WARNING] .env file already exists
    set /p UPDATE_ENV=Do you want to update it? (y/N): 
    if /i "!UPDATE_ENV!"=="y" (
        REM Create backup with timestamp
        for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
        set "timestamp=!dt:~0,8!_!dt:~8,6!"
        copy .env .env.backup.!timestamp! >nul
        echo [OK] Created backup of existing .env file
    ) else (
        echo [INFO] Keeping existing .env file
    )
) else (
    if exist .env_example (
        copy .env_example .env >nul
        echo [OK] Created .env file from template
    ) else (
        echo [ERROR] .env_example not found
        pause
        exit /b 1
    )
)

echo.

REM Step 3: Configure essential credentials
echo Step 3: Configuring essential credentials...
echo Enter your API credentials (or type 'skip' to configure later):
echo.

REM OpenAI Configuration
echo [INFO] OpenAI Configuration (for LLM capabilities)
set /p OPENAI_KEY=OpenAI API Key [skip]: 
if "!OPENAI_KEY!"=="" set OPENAI_KEY=skip
if not "!OPENAI_KEY!"=="skip" (
    powershell -Command "(gc .env) -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=!OPENAI_KEY!' | Out-File -encoding ASCII .env"
)

REM Anthropic Configuration
echo.
echo [INFO] Anthropic Configuration (for Claude integration)
set /p ANTHROPIC_KEY=Anthropic API Key [skip]: 
if "!ANTHROPIC_KEY!"=="" set ANTHROPIC_KEY=skip
if not "!ANTHROPIC_KEY!"=="skip" (
    powershell -Command "(gc .env) -replace 'ANTHROPIC_API_KEY=.*', 'ANTHROPIC_API_KEY=!ANTHROPIC_KEY!' | Out-File -encoding ASCII .env"
)

REM Dashboard Configuration
echo.
echo [INFO] Dashboard Configuration
set /p DASHBOARD_PORT=Dashboard Port [3001]: 
if "!DASHBOARD_PORT!"=="" set DASHBOARD_PORT=3001
powershell -Command "(gc .env) -replace 'DASHBOARD_PORT=.*', 'DASHBOARD_PORT=!DASHBOARD_PORT!' | Out-File -encoding ASCII .env"

REM Project Configuration
echo.
echo [INFO] Project Configuration
set /p PROJECT_NAME=Enter your project name (e.g., 'My Awesome App'): 
if "!PROJECT_NAME!"=="" set PROJECT_NAME=My AgileAI Project

REM Create or update project-config.json
echo Creating project configuration...
(
echo {
echo   "projectName": "!PROJECT_NAME!",
echo   "projectDescription": "",
echo   "createdAt": "%date:~-4%-%date:~-10,2%-%date:~-7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%.000Z",
echo   "lastUpdated": "%date:~-4%-%date:~-10,2%-%date:~-7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%.000Z",
echo   "configuration": {
echo     "dashboardTheme": "default",
echo     "autoRefreshInterval": 5000
echo   }
echo }
) > project-config.json

echo [OK] Project name set to: !PROJECT_NAME!

REM MCP Servers
echo.
echo MCP Server Configuration (Optional)
set /p CONFIGURE_MCP=Do you want to configure MCP servers now? (y/N): 

if /i "!CONFIGURE_MCP!"=="y" (
    REM Zen MCP
    echo.
    echo [INFO] Zen MCP Server (60-80%% cost savings)
    set /p ENABLE_ZEN=Enable Zen MCP? (y/N): 
    if /i "!ENABLE_ZEN!"=="y" (
        powershell -Command "(gc .env) -replace 'ZEN_MCP_ENABLED=.*', 'ZEN_MCP_ENABLED=true' | Out-File -encoding ASCII .env"
        set /p ZEN_KEY=Zen MCP API Key [skip]: 
        if not "!ZEN_KEY!"=="skip" if not "!ZEN_KEY!"=="" (
            powershell -Command "(gc .env) -replace 'ZEN_MCP_API_KEY=.*', 'ZEN_MCP_API_KEY=!ZEN_KEY!' | Out-File -encoding ASCII .env"
        )
    )
    
    REM GitHub MCP
    echo.
    echo [INFO] GitHub MCP (for Coder and DevOps Agents)
    set /p ENABLE_GITHUB=Enable GitHub MCP? (y/N): 
    if /i "!ENABLE_GITHUB!"=="y" (
        powershell -Command "(gc .env) -replace 'GITHUB_MCP_ENABLED=.*', 'GITHUB_MCP_ENABLED=true' | Out-File -encoding ASCII .env"
        set /p GITHUB_TOKEN=GitHub Personal Access Token [skip]: 
        if not "!GITHUB_TOKEN!"=="skip" if not "!GITHUB_TOKEN!"=="" (
            powershell -Command "(gc .env) -replace 'GITHUB_TOKEN=.*', 'GITHUB_TOKEN=!GITHUB_TOKEN!' | Out-File -encoding ASCII .env"
        )
    )
)

echo.

REM Step 4: Install dependencies
echo Step 4: Installing dependencies...
echo.

REM Install root dependencies first (for machine-data scripts)
if exist package.json (
    echo [INFO] Installing root dependencies for machine-data scripts...
    
    REM Clear npm cache first to avoid potential issues
    call npm cache clean --force 2>nul
    
    REM Remove node_modules and package-lock if they exist to ensure clean install
    if exist node_modules (
        echo [INFO] Removing existing node_modules for clean install...
        rmdir /s /q node_modules 2>nul
    )
    if exist package-lock.json (
        del /f /q package-lock.json 2>nul
    )
    
    REM Run npm install with error handling
    call npm install --no-audit --no-fund
    if !errorlevel!==0 (
        REM Verify fs-extra specifically was installed
        if exist "node_modules\fs-extra\package.json" (
            echo [OK] Root dependencies installed successfully
        ) else (
            echo [WARNING] fs-extra module not found, attempting to install it specifically...
            call npm install fs-extra --no-audit --no-fund
            if exist "node_modules\fs-extra\package.json" (
                echo [OK] fs-extra installed successfully
            ) else (
                echo [ERROR] Failed to install fs-extra module
                echo [INFO] Please try running 'npm install' manually in the root directory
                pause
                exit /b 1
            )
        )
    ) else (
        echo [ERROR] Failed to install root dependencies
        echo [INFO] Please try running 'npm install' manually in the root directory
        pause
        exit /b 1
    )
) else (
    echo [WARNING] Root package.json not found, skipping root dependencies
)

echo.
echo [INFO] Installing dashboard dependencies...

if exist project-dashboard (
    cd project-dashboard
    
    if exist package.json (
        echo [INFO] Installing Node.js packages (this may take a moment^)...
        
        REM Clear npm cache first to avoid potential issues
        call npm cache clean --force 2>nul
        
        REM Remove node_modules and package-lock if they exist to ensure clean install
        if exist node_modules (
            echo [INFO] Removing existing node_modules for clean install...
            rmdir /s /q node_modules 2>nul
        )
        if exist package-lock.json (
            del /f /q package-lock.json 2>nul
        )
        
        REM Run npm install with error handling
        call npm install --no-audit --no-fund
        if !errorlevel!==0 (
            REM Verify fs-extra specifically was installed
            if exist "node_modules\fs-extra\package.json" (
                echo [OK] Dashboard dependencies installed successfully
            ) else (
                echo [WARNING] fs-extra module not found, attempting to install it specifically...
                call npm install fs-extra --no-audit --no-fund
                if exist "node_modules\fs-extra\package.json" (
                    echo [OK] fs-extra installed successfully
                ) else (
                    echo [ERROR] Failed to install fs-extra module
                    echo [INFO] Please try running 'npm install' manually in the project-dashboard directory
                    pause
                    exit /b 1
                )
            )
        ) else (
            echo [ERROR] Failed to install dashboard dependencies
            echo [INFO] Please try running 'npm install' manually in the project-dashboard directory
            pause
            exit /b 1
        )
    ) else (
        echo [ERROR] package.json not found in project-dashboard
        pause
        exit /b 1
    )
    
    cd ..
) else (
    echo [ERROR] project-dashboard directory not found
    pause
    exit /b 1
)

echo.

REM Step 5: Create necessary directories
echo Step 5: Setting up project structure...
echo.

REM Create project-documents directory with category-based structure
if not exist project-documents (
    mkdir project-documents
    echo [OK] Created project-documents directory
)

REM Clean up old numbered folders if they exist (v3.0.0 migration)
echo [INFO] Checking for old numbered folders...
set folders_removed=0

for %%f in (00-orchestration 01-existing-project-analysis 02-research 03-marketing 04-business-documents 04-finance 05-market-validation 06-customer-success 07-monetization 08-analysis 09-investment 10-security 11-requirements 12-llm-analysis 13-api-analysis 14-mcp-analysis 15-seo 16-tech-documentation 17-monitoring 18-project-planning 19-environment 20-design 21-implementation 22-testing 23-deployment 24-launch 25-analytics 26-optimization 27-email-marketing 28-media-buying 29-social-media) do (
    if exist "project-documents\%%f" (
        REM Check if folder is empty
        dir /b "project-documents\%%f" >nul 2>&1
        if errorlevel 1 (
            rmdir "project-documents\%%f" 2>nul
            if not errorlevel 1 set /a folders_removed+=1
        ) else (
            echo [WARNING] Found non-empty old folder: %%f (not removed - manual migration needed^)
        )
    )
)

if !folders_removed! gtr 0 (
    echo [OK] Removed !folders_removed! empty numbered folders
)

REM Create category-based folders (v3.0.0 structure)
if not exist project-documents\orchestration mkdir project-documents\orchestration
if not exist project-documents\business-strategy mkdir project-documents\business-strategy
if not exist project-documents\implementation mkdir project-documents\implementation
if not exist project-documents\operations mkdir project-documents\operations
echo [OK] Created category-based directories

REM Create sprint directory
if not exist project-documents\orchestration\sprints (
    mkdir project-documents\orchestration\sprints
    echo [OK] Created sprints directory
)

REM Create project state directories
if not exist project-state (
    mkdir project-state
    mkdir project-state\checkpoints
    mkdir project-state\session-history
    mkdir project-state\decisions
    echo [OK] Created project-state directories
    
    REM Initialize current-state.json
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "CURRENT_DATE=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!T!dt:~8,2!:!dt:~10,2!:!dt:~12,2!Z"
    
    (
    echo {
    echo   "project_info": {
    echo     "name": "",
    echo     "version": "0.0.1",
    echo     "created_at": "!CURRENT_DATE!",
    echo     "last_updated": "!CURRENT_DATE!"
    echo   },
    echo   "workflow_state": {
    echo     "active_workflow": null,
    echo     "workflow_phase": null,
    echo     "initiated_by": null,
    echo     "started_at": null
    echo   },
    echo   "current_sprint": null,
    echo   "active_tasks": [],
    echo   "recent_decisions": [],
    echo   "contribution_state": {
    echo     "last_prompt": null,
    echo     "pending_prompt": null,
    echo     "skip_until": null,
    echo     "contribution_history": []
    echo   }
    echo }
    ) > project-state\current-state.json
    echo [OK] Initialized project state
)

REM Create community learnings directories
if not exist community-learnings (
    mkdir community-learnings
    mkdir community-learnings\contributions
    mkdir community-learnings\analysis
    mkdir community-learnings\implementation
    echo [OK] Created community-learnings directories
)

REM Create verification cache directory
if not exist project-state\verification-cache (
    mkdir project-state\verification-cache
    echo [OK] Created verification cache directory
)

REM Check for .claude folder (hidden folder often missed during extraction)
echo.
echo Checking for Claude Code integration...

REM Determine if we're in workspace or repository mode
set CLAUDE_DIR=
set TEMPLATE_CLAUDE_DIR=

REM Check if we're in parent workspace with agile-ai-agents folder
if exist "..\agile-ai-agents" if exist "..\agile-ai-agents\CLAUDE.md" (
    REM We're in parent workspace
    set CLAUDE_DIR=..\.claude
    set TEMPLATE_CLAUDE_DIR=templates\claude-integration\.claude
    echo [INFO] Running in workspace mode
) else if exist "CLAUDE.md" (
    REM We're inside the repository
    set CLAUDE_DIR=.claude
    set TEMPLATE_CLAUDE_DIR=templates\claude-integration\.claude
    echo [INFO] Running in repository mode
) else (
    echo [WARNING] Unable to determine execution context
)

REM Check if .claude directory exists
if defined CLAUDE_DIR (
    if not exist "!CLAUDE_DIR!" (
        echo [WARNING] .claude folder not found ^(this hidden folder is often missed during extraction^)
        
        REM Check if template exists
        if exist "!TEMPLATE_CLAUDE_DIR!" (
            echo [INFO] Creating .claude folder from template...
            
            REM Copy the template
            xcopy /E /I /H /Y "!TEMPLATE_CLAUDE_DIR!" "!CLAUDE_DIR!" >nul 2>&1
            
            if !errorlevel!==0 (
                echo [OK] Created .claude folder with Claude Code integration
                
                REM Update settings.json with actual paths if template exists
                if exist "!CLAUDE_DIR!\settings.json.template" (
                    echo [INFO] Configuring hook paths for your installation...
                    
                    REM Get the absolute path to the project root
                    for %%I in ("!CLAUDE_DIR!\..") do set PROJECT_ROOT=%%~fI
                    
                    REM Replace placeholders in template and create settings.json
                    powershell -Command "(gc '!CLAUDE_DIR!\settings.json.template') -replace '{{USER_PATH}}', '!PROJECT_ROOT!' | Out-File -encoding ASCII '!CLAUDE_DIR!\settings.json'"
                    
                    if !errorlevel!==0 (
                        echo [OK] Hook paths configured for: !PROJECT_ROOT!
                    ) else (
                        echo [WARNING] Failed to configure hook paths. You may need to update settings.json manually
                    )
                )
                
                echo [INFO] Claude Code agents and hooks are now available
            ) else (
                echo [ERROR] Failed to create .claude folder
                echo [INFO] You may need to manually copy from: !TEMPLATE_CLAUDE_DIR!
            )
        ) else (
            echo [ERROR] Template .claude folder not found at: !TEMPLATE_CLAUDE_DIR!
            echo [INFO] Your installation may be incomplete
        )
    ) else (
        echo [OK] .claude folder detected
        
        REM Check if it has content
        dir /b "!CLAUDE_DIR!" >nul 2>&1
        if errorlevel 1 (
            echo [WARNING] .claude folder is empty
            if exist "!TEMPLATE_CLAUDE_DIR!" (
                echo [INFO] Populating .claude folder from template...
                xcopy /E /I /H /Y "!TEMPLATE_CLAUDE_DIR!\*" "!CLAUDE_DIR!\" >nul 2>&1
                echo [OK] Populated .claude folder
            )
        ) else (
            REM Check if settings.json exists and has placeholders
            if exist "!CLAUDE_DIR!\settings.json" (
                findstr /C:"{{USER_PATH}}" "!CLAUDE_DIR!\settings.json" >nul
                if !errorlevel!==0 (
                    echo [WARNING] settings.json still contains placeholders. Updating...
                    
                    REM Get the absolute path to the project root
                    for %%I in ("!CLAUDE_DIR!\..") do set PROJECT_ROOT=%%~fI
                    
                    REM Backup the old file
                    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
                    set "timestamp=!dt:~0,8!_!dt:~8,6!"
                    copy "!CLAUDE_DIR!\settings.json" "!CLAUDE_DIR!\settings.json.backup.!timestamp!" >nul
                    
                    REM Replace placeholders
                    powershell -Command "(gc '!CLAUDE_DIR!\settings.json') -replace '{{USER_PATH}}', '!PROJECT_ROOT!' | Out-File -encoding ASCII '!CLAUDE_DIR!\settings.json'"
                    
                    if !errorlevel!==0 (
                        echo [OK] Updated settings.json with correct paths: !PROJECT_ROOT!
                    ) else (
                        echo [WARNING] Failed to update settings.json. You may need to update it manually
                    )
                )
            ) else if exist "!CLAUDE_DIR!\settings.json.template" (
                echo [INFO] Configuring Claude Code settings...
                
                REM Get the absolute path to the project root
                for %%I in ("!CLAUDE_DIR!\..") do set PROJECT_ROOT=%%~fI
                
                REM Replace placeholders in template and create settings.json
                powershell -Command "(gc '!CLAUDE_DIR!\settings.json.template') -replace '{{USER_PATH}}', '!PROJECT_ROOT!' | Out-File -encoding ASCII '!CLAUDE_DIR!\settings.json'"
                
                if !errorlevel!==0 (
                    echo [OK] Claude Code settings configured
                ) else (
                    echo [WARNING] Failed to configure settings. You may need to update settings.json manually
                )
            )
        )
    )
)

echo.

REM Step 6: Test dashboard connectivity
echo Step 6: Testing dashboard connectivity...
echo.

REM Create test script
(
echo const http = require('http'^);
echo const fs = require('fs'^);
echo.
echo // Read port from .env
echo const envContent = fs.readFileSync('.env', 'utf8'^);
echo const portMatch = envContent.match(/DASHBOARD_PORT=(\d+^)/^);
echo const port = portMatch ? portMatch[1] : '3001';
echo.
echo console.log(`Testing connection to dashboard on port ${port}...`^);
echo.
echo const options = {
echo     hostname: 'localhost',
echo     port: port,
echo     path: '/',
echo     method: 'GET',
echo     timeout: 5000
echo };
echo.
echo const req = http.request(options, (res^) =^> {
echo     if (res.statusCode === 200 ^|^| res.statusCode === 304^) {
echo         console.log('[OK] Dashboard is accessible'^);
echo         process.exit(0^);
echo     } else {
echo         console.log(`[WARNING] Dashboard returned status code: ${res.statusCode}`^);
echo         process.exit(1^);
echo     }
echo }^);
echo.
echo req.on('error', (error^) =^> {
echo     if (error.code === 'ECONNREFUSED'^) {
echo         console.log('[INFO] Dashboard is not running (this is normal during setup^)'^);
echo     } else {
echo         console.log(`[ERROR] Error testing dashboard: ${error.message}`^);
echo     }
echo     process.exit(0^);
echo }^);
echo.
echo req.on('timeout', (^) =^> {
echo     console.log('[WARNING] Dashboard connection timeout'^);
echo     req.destroy(^);
echo     process.exit(1^);
echo }^);
echo.
echo req.end(^);
) > test-dashboard.js

REM Run test
node test-dashboard.js
del test-dashboard.js

echo.

REM Step 7: Setup completion
echo Step 7: Setup complete!
echo.

echo [SUCCESS] AgileAiAgents setup completed successfully!
echo.
echo Next Steps:
echo 1. Review and update your .env file with any additional credentials
echo 2. Start the dashboard: cd project-dashboard and npm start
echo 3. Access the dashboard at http://localhost:!DASHBOARD_PORT!
echo 4. Read the documentation in README.md and CLAUDE.md
echo.
echo New Features:
echo - Command-based workflows: /new-project-workflow, /existing-project-workflow, or /rebuild-project-workflow
echo - Auto-save state management: /checkpoint, /status, /continue
echo - Community contributions: /milestone, /contribute-now, /contribution-status
echo - Category-based folder structure for better organization
echo.
echo Type /aaa-help in Claude Code to see all available commands

echo.

REM Check for missing credentials
echo Configuration Status:
findstr /r "your_.*_here skip" .env >nul
if %errorlevel%==0 (
    echo [WARNING] Some credentials are not configured. Update .env before starting.
) else (
    echo [OK] All configured credentials are set
)

echo.

REM Offer to start dashboard
set /p START_DASHBOARD=Would you like to start the dashboard now? (y/N): 

if /i "!START_DASHBOARD!"=="y" (
    echo.
    echo Starting AgileAiAgents Dashboard...
    
    REM First ensure root dependencies are present
    if not exist "node_modules\fs-extra\package.json" (
        echo [WARNING] Root dependencies missing. Installing now...
        call npm install --no-audit --no-fund
        if not exist "node_modules\fs-extra\package.json" (
            echo [ERROR] Failed to install root dependencies
            echo [INFO] Please run 'npm install' manually in the root directory
            pause
            exit /b 1
        )
    )
    
    cd project-dashboard
    
    REM Check if dashboard node_modules exists
    if not exist node_modules (
        goto :install_deps
    )
    if not exist "node_modules\express\package.json" (
        goto :install_deps
    )
    goto :start_dashboard
    
    :install_deps
    echo [WARNING] Dashboard dependencies not found or incomplete. Installing now...
    
    REM Clear cache and reinstall
    call npm cache clean --force 2>nul
    if exist node_modules rmdir /s /q node_modules 2>nul
    if exist package-lock.json del /f /q package-lock.json 2>nul
    
    call npm install --no-audit --no-fund
    if !errorlevel!==0 (
        echo [OK] Dashboard dependencies installed successfully
    ) else (
        echo [ERROR] Failed to install dashboard dependencies
        echo [INFO] Please run 'npm install' manually in the project-dashboard directory
        pause
        exit /b 1
    )
    
    :start_dashboard
    call npm start
)

endlocal
pause