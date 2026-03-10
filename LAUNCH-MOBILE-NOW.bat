@echo off
echo ================================
echo  ARPSC Hams - Quick Launcher
echo ================================
echo.

REM Move to project directory
cd /d "%~dp0ARPSCApp"

REM Create the problematic directory structure as a workaround
echo Creating directory structure...
if not exist ".expo\metro\externals" mkdir ".expo\metro\externals"

REM Start Expo WITHOUT web (mobile works!)
echo.
echo Starting Expo for mobile devices...
echo.
powershell -ExecutionPolicy Bypass -Command "npm start"

pause
