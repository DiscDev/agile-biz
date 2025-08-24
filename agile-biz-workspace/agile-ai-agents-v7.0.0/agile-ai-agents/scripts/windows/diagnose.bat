@echo off
REM AgileAiAgents Quick Diagnostic Script for Windows
REM This script runs diagnostics from the project root

echo.
echo AgileAiAgents Quick Diagnostics
echo ==================================
echo.

REM Change to dashboard directory
cd project-dashboard

REM Run the diagnostic tool
node diagnostics.js

REM Return to original directory
cd ..

echo.
echo Diagnostics complete!
echo.
echo Additional diagnostic commands:
echo   - Check dashboard health: curl http://localhost:3001/api/health
echo   - View health dashboard: Open http://localhost:3001/health.html in browser
echo   - Run from dashboard dir: cd project-dashboard ^&^& npm run diagnose
echo.
pause