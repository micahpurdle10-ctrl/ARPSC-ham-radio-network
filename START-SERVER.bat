@echo off
setlocal enabledelayedexpansion

:: Get the directory where this script is located
set "appDir=%~dp0"
cd /d "%appDir%"

:: Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo After installing, run this script again.
    echo.
    pause
    exit /b 1
)

:: Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "localIP=%%a"
    set "localIP=!localIP:~1!"
    goto :foundIP
)
:foundIP

if not defined localIP set "localIP=127.0.0.1"

set "port=8080"

echo Starting ARPSC Web Server...
echo.

:: Start Node.js HTTP server
node server.js

endlocal
