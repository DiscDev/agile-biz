@echo off
setlocal enabledelayedexpansion
REM Create Release Package for AgileAiAgents
REM This script updates version numbers and creates a ZIP file ready for GitHub releases

echo Creating AgileAiAgents Release Package...

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..\..

REM Get current version from VERSION.json using PowerShell
set CURRENT_VERSION=4.0.0
for /f "delims=" %%a in ('powershell -Command "(Get-Content '%PROJECT_ROOT%\VERSION.json' | ConvertFrom-Json).version" 2^>nul') do (
    set CURRENT_VERSION=%%a
)

REM Remove quotes from version string if present
set CURRENT_VERSION=%CURRENT_VERSION:"=%

REM If version argument provided, use it; otherwise analyze and suggest
if "%~1"=="" (
    echo Current version: %CURRENT_VERSION%
    echo.
    
    REM Check if analyzer exists and node is available
    if exist "%SCRIPT_DIR%analyze-version-bump.js" (
        where node >nul 2>nul
        if !errorlevel! == 0 (
            echo Analyzing changes to suggest version bump...
            echo.
            
            REM Run analyzer
            for /f "delims=" %%i in ('node "%SCRIPT_DIR%analyze-version-bump.js" 2^>^&1') do (
                echo %%i
                echo %%i | findstr /C:"Suggested version:" >nul
                if !errorlevel! == 0 (
                    for /f "tokens=3" %%j in ("%%i") do set SUGGESTED_VERSION=%%j
                )
            )
            
            if defined SUGGESTED_VERSION (
                echo.
                set /p ACCEPT="Accept suggested version !SUGGESTED_VERSION!? (Y/n): "
                if "!ACCEPT!"=="" set ACCEPT=Y
                if /i "!ACCEPT!"=="Y" (
                    set VERSION=!SUGGESTED_VERSION!
                ) else (
                    set /p VERSION="Enter new version: "
                    if "!VERSION!"=="" set VERSION=%CURRENT_VERSION%
                )
            ) else (
                set /p VERSION="Enter new version (or press Enter to keep %CURRENT_VERSION%): "
                if "!VERSION!"=="" set VERSION=%CURRENT_VERSION%
            )
        ) else (
            REM Node not available, fallback to manual
            set /p VERSION="Enter new version (or press Enter to keep %CURRENT_VERSION%): "
            if "!VERSION!"=="" set VERSION=%CURRENT_VERSION%
        )
    ) else (
        REM Analyzer not found, fallback to manual
        set /p VERSION="Enter new version (or press Enter to keep %CURRENT_VERSION%): "
        if "!VERSION!"=="" set VERSION=%CURRENT_VERSION%
    )
) else (
    set VERSION=%~1
)

REM Only update files if version changed
if not "%VERSION%"=="%CURRENT_VERSION%" (
    echo Updating version from %CURRENT_VERSION% to %VERSION%...
    
    REM Update VERSION.json
    echo Updating VERSION.json...
    powershell -Command "$json = Get-Content '%PROJECT_ROOT%\VERSION.json' -Raw | ConvertFrom-Json; $json.version = '%VERSION%'; $json.releaseTag = 'v%VERSION%'; $json | ConvertTo-Json -Depth 10 | Set-Content '%PROJECT_ROOT%\VERSION.json'"
    
    REM Update package.json files
    echo Updating package.json files...
    powershell -Command "$json = Get-Content '%PROJECT_ROOT%\package.json' -Raw | ConvertFrom-Json; $json.version = '%VERSION%'; $json | ConvertTo-Json -Depth 10 | Set-Content '%PROJECT_ROOT%\package.json'"
    powershell -Command "$json = Get-Content '%PROJECT_ROOT%\project-dashboard\package.json' -Raw | ConvertFrom-Json; $json.version = '%VERSION%'; $json | ConvertTo-Json -Depth 10 | Set-Content '%PROJECT_ROOT%\project-dashboard\package.json'"
    
    REM Update machine-data package.json (if version matches)
    if exist "%PROJECT_ROOT%\machine-data\package.json" (
        findstr /C:"\"%CURRENT_VERSION%\"" "%PROJECT_ROOT%\machine-data\package.json" >nul 2>&1
        if !errorlevel! == 0 (
            echo Updating machine-data package.json...
            powershell -Command "$json = Get-Content '%PROJECT_ROOT%\machine-data\package.json' -Raw | ConvertFrom-Json; $json.version = '%VERSION%'; $json | ConvertTo-Json -Depth 10 | Set-Content '%PROJECT_ROOT%\machine-data\package.json'"
        )
    )
    
    REM Update README.md
    echo Updating README.md...
    powershell -Command "(Get-Content '%PROJECT_ROOT%\README.md' -Raw) -replace '# AgileAiAgents v%CURRENT_VERSION%', '# AgileAiAgents v%VERSION%' | Set-Content '%PROJECT_ROOT%\README.md' -NoNewline"
    powershell -Command "(Get-Content '%PROJECT_ROOT%\README.md' -Raw) -replace 'Version %CURRENT_VERSION%', 'Version %VERSION%' | Set-Content '%PROJECT_ROOT%\README.md' -NoNewline"
    powershell -Command "(Get-Content '%PROJECT_ROOT%\README.md' -Raw) -replace 'v%CURRENT_VERSION%', 'v%VERSION%' | Set-Content '%PROJECT_ROOT%\README.md' -NoNewline"
    powershell -Command "(Get-Content '%PROJECT_ROOT%\README.md' -Raw) -replace 'agile-ai-agents-v%CURRENT_VERSION%', 'agile-ai-agents-v%VERSION%' | Set-Content '%PROJECT_ROOT%\README.md' -NoNewline"
    
    REM Update CLAUDE.md version references
    echo Updating CLAUDE.md...
    powershell -Command "(Get-Content '%PROJECT_ROOT%\CLAUDE.md' -Raw) -replace 'v%CURRENT_VERSION%', 'v%VERSION%' | Set-Content '%PROJECT_ROOT%\CLAUDE.md' -NoNewline"
    powershell -Command "(Get-Content '%PROJECT_ROOT%\CLAUDE.md' -Raw) -replace 'agile-ai-agents-v%CURRENT_VERSION%', 'agile-ai-agents-v%VERSION%' | Set-Content '%PROJECT_ROOT%\CLAUDE.md' -NoNewline"
    
    REM Update dashboard HTML files (if they have hardcoded versions)
    findstr /C:">v%CURRENT_VERSION%<" "%PROJECT_ROOT%\project-dashboard\public\index.html" >nul 2>&1
    if !errorlevel! == 0 (
        echo Updating dashboard HTML...
        powershell -Command "(Get-Content '%PROJECT_ROOT%\project-dashboard\public\index.html' -Raw) -replace '>v%CURRENT_VERSION%<', '>v%VERSION%<' | Set-Content '%PROJECT_ROOT%\project-dashboard\public\index.html' -NoNewline"
    )
    
    REM Update any documentation with version references
    echo Updating documentation version references...
    for %%f in ("%PROJECT_ROOT%\aaa-documents\*.md") do (
        findstr /C:"v%CURRENT_VERSION%" "%%f" >nul 2>&1
        if !errorlevel! == 0 (
            powershell -Command "(Get-Content '%%f' -Raw) -replace 'v%CURRENT_VERSION%', 'v%VERSION%' | Set-Content '%%f' -NoNewline"
        )
    )
    
    REM Add new version section to CHANGELOG.md
    echo Adding new version section to CHANGELOG.md...
    set CURRENT_DATE=%date:~-4%-%date:~4,2%-%date:~7,2%
    powershell -Command "$content = Get-Content '%PROJECT_ROOT%\CHANGELOG.md' -Raw; if($content -notmatch '## %VERSION% - %CURRENT_DATE%') { $newSection = '## %VERSION% - %CURRENT_DATE%`n`n### Added`n- `n`n### Changed`n- `n`n### Fixed`n- `n`n### Removed`n- `n`n'; $content = $content -replace '(## \[Unreleased\])', '$1`n`n' + $newSection; $content | Set-Content '%PROJECT_ROOT%\CHANGELOG.md' -NoNewline; Write-Host 'Added new version section to CHANGELOG.md' }"
    
    echo Version updated to %VERSION%
    echo.
    echo Version updated in:
    echo    - VERSION.json
    echo    - package.json (root)
    echo    - project-dashboard\package.json
    if exist "%PROJECT_ROOT%\machine-data\package.json" findstr /C:"\"%VERSION%\"" "%PROJECT_ROOT%\machine-data\package.json" >nul 2>&1 && echo    - machine-data\package.json
    echo    - README.md
    echo    - CLAUDE.md
    echo    - CHANGELOG.md
    if exist "%PROJECT_ROOT%\project-dashboard\public\index.html" findstr /C:">v%VERSION%<" "%PROJECT_ROOT%\project-dashboard\public\index.html" >nul 2>&1 && echo    - Dashboard HTML
    echo    - Documentation files (if applicable)
    echo.
) else (
    echo Using existing version: %VERSION%
)

set RELEASE_NAME=agile-ai-agents-v%VERSION%
set TEMP_DIR=%TEMP%\%RELEASE_NAME%

echo Creating release package for version: %VERSION%

REM Clean up any existing temp directory
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM Create release notes templates
echo Creating release notes templates...
set RELEASE_NOTES_DIR=%PROJECT_ROOT%\release-notes
if not exist "%RELEASE_NOTES_DIR%" mkdir "%RELEASE_NOTES_DIR%"

REM Create RELEASE-NOTES template if it doesn't exist
if not exist "%RELEASE_NOTES_DIR%\RELEASE-NOTES-v%VERSION%.md" (
    echo Creating RELEASE-NOTES-v%VERSION%.md template...
    (
        echo # Release Notes - v%VERSION%
        echo.
        echo **Release Date**: %date:~-4%-%date:~4,2%-%date:~7,2%  
        echo **Release Name**: [Add release name]
        echo.
        echo ## Overview
        echo.
        echo [Add release overview]
        echo.
        echo ## Major Features
        echo.
        echo [Add major features]
        echo.
        echo ## Quick Start
        echo.
        echo 1. Extract the release package
        echo 2. Run setup script
        echo 3. Check system health: `node scripts/validate-system-health.js`
        echo 4. Start dashboard: `npm run dashboard`
        echo.
        echo ## Important Changes
        echo.
        echo [Add important changes]
        echo.
        echo ## Documentation Updates
        echo.
        echo [Add documentation updates]
        echo.
        echo ## For Upgraders
        echo.
        echo [Add upgrade instructions]
        echo.
        echo ---
        echo.
        echo For detailed changes, see CHANGELOG.md
        echo For questions or issues: https://github.com/DiscDev/agile-ai-agents/issues
    ) > "%RELEASE_NOTES_DIR%\RELEASE-NOTES-v%VERSION%.md"
    echo [OK] Created RELEASE-NOTES-v%VERSION%.md template
)

REM Create GITHUB-RELEASE-NOTES template if it doesn't exist
if not exist "%RELEASE_NOTES_DIR%\GITHUB-RELEASE-NOTES-v%VERSION%.md" (
    echo Creating GITHUB-RELEASE-NOTES-v%VERSION%.md template...
    (
        echo # AgileAiAgents v%VERSION% - [Release Name]
        echo.
        echo ## Release Summary
        echo.
        echo [Add release summary]
        echo.
        echo ## Key Highlights
        echo.
        echo [Add key highlights]
        echo.
        echo ## What's New
        echo.
        echo [Copy from CHANGELOG.md]
        echo.
        echo ## Installation
        echo.
        echo 1. Download `agile-ai-agents-v%VERSION%.zip`
        echo 2. Extract to your workspace:
        echo    ```bash
        echo    unzip agile-ai-agents-v%VERSION%.zip -d ~/workspace/
        echo    cd ~/workspace/agile-ai-agents
        echo    ```
        echo 3. Run setup:
        echo    ```bash
        echo    ./scripts/bash/setup.sh  # Unix/macOS
        echo    .\scripts\windows\setup.bat  # Windows
        echo    ```
        echo.
        echo ## Documentation
        echo.
        echo [Add relevant documentation links]
        echo.
        echo ## Contributors
        echo.
        echo Thanks to all contributors who helped shape this release through the Community Learnings System!
        echo.
        echo ---
        echo.
        echo **Full Changelog**: https://github.com/DiscDev/agile-ai-agents/compare/v%CURRENT_VERSION%...v%VERSION%
    ) > "%RELEASE_NOTES_DIR%\GITHUB-RELEASE-NOTES-v%VERSION%.md"
    echo [OK] Created GITHUB-RELEASE-NOTES-v%VERSION%.md template
)

REM Copy CLAUDE.md from template
echo Copying workspace CLAUDE.md...
copy "%PROJECT_ROOT%\templates\CLAUDE-workspace-template.md" "%TEMP_DIR%\CLAUDE.md" >nul

REM Create agile-ai-agents directory
mkdir "%TEMP_DIR%\agile-ai-agents"

REM Copy all files except git-related and temp files
echo Copying AgileAiAgents system files...
xcopy "%PROJECT_ROOT%\*" "%TEMP_DIR%\agile-ai-agents\" /E /I /Q /EXCLUDE:%SCRIPT_DIR%exclude-list.txt >nul 2>&1

REM Create exclude list temporarily
echo .git\ > "%SCRIPT_DIR%exclude-list.txt"
echo .github\ >> "%SCRIPT_DIR%exclude-list.txt"
echo node_modules\ >> "%SCRIPT_DIR%exclude-list.txt"
echo .DS_Store >> "%SCRIPT_DIR%exclude-list.txt"
echo .env >> "%SCRIPT_DIR%exclude-list.txt"
echo diagnostic-report.json >> "%SCRIPT_DIR%exclude-list.txt"
echo templates\CLAUDE-workspace-template.md >> "%SCRIPT_DIR%exclude-list.txt"
echo RELEASE-NOTES-v*.md >> "%SCRIPT_DIR%exclude-list.txt"
echo GITHUB-RELEASE-NOTES-v*.md >> "%SCRIPT_DIR%exclude-list.txt"
echo agile-ai-agents-v*.zip >> "%SCRIPT_DIR%exclude-list.txt"
echo project-documents\ >> "%SCRIPT_DIR%exclude-list.txt"
echo project-state\ >> "%SCRIPT_DIR%exclude-list.txt"
echo community-learnings\ >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\conversion-reports\ >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\project-documents-json\streams\ >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\test-output\ >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\broadcast-log.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\implementation-tracking.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\learning-capture-points.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\captured-learnings.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\stakeholder-interactions.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\learning-dashboard.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\self-improvements.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\learning-analysis-workflow.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\community-learning-data.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\privacy-scan-log.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\project-progress.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\repository-evolution-tracking.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\repository-learning-data.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\repository-metrics.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\version-history.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\implementation-metrics.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\improvement-proposals.json >> "%SCRIPT_DIR%exclude-list.txt"
echo machine-data\learning-network.json >> "%SCRIPT_DIR%exclude-list.txt"
echo hooks\logs\ >> "%SCRIPT_DIR%exclude-list.txt"

REM Copy with exclusions
xcopy "%PROJECT_ROOT%\*" "%TEMP_DIR%\agile-ai-agents\" /E /I /Q /EXCLUDE:%SCRIPT_DIR%exclude-list.txt >nul 2>&1

REM Clean up exclude list
del "%SCRIPT_DIR%exclude-list.txt"

REM Create empty project-documents directories (category-based structure v3.0.0)
echo Creating empty project directories (category-based)...

REM Orchestration category
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\sprints"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\backlog-items"

REM Business Strategy category
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\existing-project"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\research"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\marketing"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\finance"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\market-validation"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\customer-success"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\monetization"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\analysis"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\business-strategy\investment"

REM Implementation category
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\requirements"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\security"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\llm-analysis"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\api-analysis"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\mcp-analysis"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\project-planning"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\environment"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\design"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\implementation"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\testing"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\implementation\documentation"

REM Operations category
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\deployment"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\launch"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\analytics"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\monitoring"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\optimization"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\seo"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\crm-marketing"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\media-buying"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\operations\social-media"

REM Additional folders
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\analysis-reports"
mkdir "%TEMP_DIR%\agile-ai-agents\project-documents\planning"

REM Copy stakeholder files to orchestration category
if exist "%PROJECT_ROOT%\project-documents\orchestration\stakeholder-decisions.md" (
    copy "%PROJECT_ROOT%\project-documents\orchestration\stakeholder-decisions.md" "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\" >nul
)
if exist "%PROJECT_ROOT%\project-documents\orchestration\stakeholder-escalations.md" (
    copy "%PROJECT_ROOT%\project-documents\orchestration\stakeholder-escalations.md" "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\" >nul
)

REM Copy clean backlog templates (commented out for v7.0.0 clean slate)
REM echo Copying clean backlog templates...
REM copy "%PROJECT_ROOT%\templates\release-templates\product-backlog\backlog-state-template.json" "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\backlog-state.json" >nul
REM copy "%PROJECT_ROOT%\templates\release-templates\product-backlog\velocity-metrics-template.json" "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\velocity-metrics.json" >nul

REM Copy velocity profiles
mkdir "%TEMP_DIR%\agile-ai-agents\templates\release-templates\product-backlog"
copy "%PROJECT_ROOT%\templates\release-templates\product-backlog\velocity-profiles.json" "%TEMP_DIR%\agile-ai-agents\templates\release-templates\product-backlog\" >nul

copy "%PROJECT_ROOT%\templates\release-templates\product-backlog\README.md" "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\" >nul

REM Copy estimation guidelines if exists
if exist "%PROJECT_ROOT%\project-documents\orchestration\product-backlog\estimation-guidelines.md" (
    copy "%PROJECT_ROOT%\project-documents\orchestration\product-backlog\estimation-guidelines.md" "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\" >nul
)

REM Update timestamps in JSON files (only if they exist)
if exist "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\backlog-state.json" (
    echo Updating timestamps in backlog files...
    powershell -Command "(Get-Content '%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\backlog-state.json' -Raw) -replace 'TEMPLATE_TIMESTAMP', (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') | Set-Content '%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\backlog-state.json'"
)
if exist "%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\velocity-metrics.json" (
    powershell -Command "(Get-Content '%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\velocity-metrics.json' -Raw) -replace 'TEMPLATE_TIMESTAMP', (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') | Set-Content '%TEMP_DIR%\agile-ai-agents\project-documents\orchestration\product-backlog\velocity-metrics.json'"
)

REM Copy clean slate community-learnings from templates
echo Copying clean slate community-learnings...

if exist "%PROJECT_ROOT%\templates\clean-slate\community-learnings" (
    echo Using clean slate community-learnings template
    xcopy "%PROJECT_ROOT%\templates\clean-slate\community-learnings" "%TEMP_DIR%\agile-ai-agents\community-learnings\" /E /I /Q >nul 2>&1
) else (
    echo Warning: Clean slate community-learnings template not found, creating empty structure
    REM Fallback to create minimal structure
    mkdir "%TEMP_DIR%\agile-ai-agents\community-learnings\contributions\examples"
    mkdir "%TEMP_DIR%\agile-ai-agents\community-learnings\analysis"
    mkdir "%TEMP_DIR%\agile-ai-agents\community-learnings\archive"
    mkdir "%TEMP_DIR%\agile-ai-agents\community-learnings\implementation"
    mkdir "%TEMP_DIR%\agile-ai-agents\community-learnings\CONTRIBUTING"
    
    REM Copy essential files if available
    if exist "%PROJECT_ROOT%\community-learnings\README.md" (
        copy "%PROJECT_ROOT%\community-learnings\README.md" "%TEMP_DIR%\agile-ai-agents\community-learnings\" >nul
    )
    if exist "%PROJECT_ROOT%\community-learnings\SECURITY-GUIDELINES.md" (
        copy "%PROJECT_ROOT%\community-learnings\SECURITY-GUIDELINES.md" "%TEMP_DIR%\agile-ai-agents\community-learnings\" >nul
    )
)

echo [OK] Clean slate community-learnings created

REM Set up Claude Code integration at parent level
echo Setting up Claude Code integration...
mkdir "%TEMP_DIR%\.claude"

REM Copy agents to parent level
if exist "%PROJECT_ROOT%\templates\claude-integration\.claude\agents" (
    xcopy "%PROJECT_ROOT%\templates\claude-integration\.claude\agents" "%TEMP_DIR%\.claude\agents\" /E /I /Q >nul 2>&1
    echo - Copied Claude agents
)

REM Copy hooks to parent level
if exist "%PROJECT_ROOT%\templates\claude-integration\.claude\hooks" (
    xcopy "%PROJECT_ROOT%\templates\claude-integration\.claude\hooks" "%TEMP_DIR%\.claude\hooks\" /E /I /Q >nul 2>&1
    echo - Copied Claude hooks
)

REM Process settings.json template - replace $CLAUDE_PROJECT_DIR with .
if exist "%PROJECT_ROOT%\templates\claude-integration\.claude\settings.json.template" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\templates\claude-integration\.claude\settings.json.template' -Raw) -replace '\$CLAUDE_PROJECT_DIR', '.' | Set-Content '%TEMP_DIR%\.claude\settings.json'"
    echo - Created Claude settings.json
)

REM Copy settings.local.json template
if exist "%PROJECT_ROOT%\templates\claude-integration\.claude\settings.local.json.template" (
    copy "%PROJECT_ROOT%\templates\claude-integration\.claude\settings.local.json.template" "%TEMP_DIR%\.claude\settings.local.json" >nul
    echo - Created Claude settings.local.json
)

REM Create .gitignore for .claude at parent level
(
echo settings.local.json
echo *.log
echo *.bak
) > "%TEMP_DIR%\.claude\.gitignore"

echo Claude Code integration set up at parent level

REM Create .gitignore.template
echo Creating .gitignore.template...
(
echo # AgileAiAgents - User Workspace .gitignore
echo # Copy this to .gitignore in your workspace root
echo.
echo # OS Files
echo .DS_Store
echo **/.DS_Store
echo Thumbs.db
echo.
echo # Environment and secrets
echo .env
echo .env.local
echo .env.*.local
echo *.pem
echo *.key
echo.
echo # Project documents (private^)
echo agile-ai-agents/project-documents/**/*.md
echo !agile-ai-agents/project-documents/**/README.md
echo !agile-ai-agents/project-documents/orchestration/stakeholder-*.md
echo.
echo # Project state
echo agile-ai-agents/project-state/
echo.
echo # Logs
echo *.log
echo npm-debug.log*
echo diagnostic-report.json
echo.
echo # Dependencies
echo node_modules/
echo .npm
echo.
echo # IDE
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # Build outputs
echo dist/
echo build/
echo *.pid
echo *.seed
echo *.pid.lock
echo.
echo # Testing
echo coverage/
echo .nyc_output
echo.
echo # Your project code
echo # Add your project-specific ignores below this line
) > "%TEMP_DIR%\.gitignore.template"

REM Create ZIP using PowerShell
set RELEASE_ZIP=%PROJECT_ROOT%\%RELEASE_NAME%.zip
if exist "%RELEASE_ZIP%" del "%RELEASE_ZIP%"

echo Creating ZIP archive...
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%RELEASE_ZIP%' -Force"

REM Clean up
rmdir /s /q "%TEMP_DIR%"

REM Show results
echo.
echo Release package created successfully!
echo File: %RELEASE_ZIP%
echo.
echo Next steps:
echo 1. Edit release notes in: release-notes\GITHUB-RELEASE-NOTES-v%VERSION%.md
echo 2. Upload %RELEASE_ZIP% to GitHub releases
echo 3. Tag as v%VERSION%
echo 4. Copy content from GITHUB-RELEASE-NOTES-v%VERSION%.md for release description
echo 5. Publish the release
echo.
echo Release notes location:
echo    - GitHub: release-notes\GITHUB-RELEASE-NOTES-v%VERSION%.md
echo    - User: release-notes\RELEASE-NOTES-v%VERSION%.md
echo.

REM Ask to open browser
set /p OPEN_BROWSER="Open GitHub releases page? (y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    start https://github.com/DiscDev/agile-ai-agents/releases/new
)

pause