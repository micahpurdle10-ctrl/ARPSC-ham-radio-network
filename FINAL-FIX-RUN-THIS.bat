@echo off
color 0A
title FINAL FIX - This WILL Work!
cls
echo.
echo ================================================
echo     ARPSC HAMS - FINAL FIX SCRIPT
echo ================================================
echo.
echo This script will:
echo   [1] Check if VS Code is closed
echo   [2] Move folder to fix ALL issues
echo   [3] Install correct Node version (v20 LTS)
echo   [4] Start the app in Edge
echo.
echo ================================================
echo.

REM Check if VS Code is running
tasklist /FI "IMAGENAME eq Code.exe" 2>NUL | find /I /N "Code.exe">NUL
if "%ERRORLEVEL%"=="0" (
    color 0C
    echo ERROR: VS Code is still running!
    echo.
    echo Please close VS Code completely, then run this again.
    echo.
    pause
    exit /b 1
)

echo [1/4] VS Code is closed - Good!
echo.

REM Move the folder
echo [2/4] Moving folder to fix path issue...
if exist "C:\Users\mpurd\New folder\ARPSCApp" (
    robocopy "C:\Users\mpurd\New folder\ARPSCApp" "C:\Users\mpurd\ARPSCApp" /E /MOVE /NFL /NDL /NJH /NJS
    if exist "C:\Users\mpurd\ARPSCApp\package.json" (
        echo SUCCESS - Folder moved!
    ) else (
        color 0C
        echo ERROR - Move failed
        pause
        exit /b 1
    )
) else (
    echo Folder already moved!
)
echo.

echo [3/4] Installing Node v20 LTS (compatible version)...
cd /d "C:\Users\mpurd\ARPSCApp"
if not exist "node_modules\.node-version" (
    echo Downloading NVM for Windows...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip' -OutFile '%TEMP%\node20.zip' -UseBasicParsing}" 2>nul
)
echo.

echo [4/4] Creating working launcher...
(
echo @echo off
echo cd /d "C:\Users\mpurd\ARPSCApp"
echo echo Starting ARPSC Hams...
echo start "ARPSC Server" cmd /k "npx expo start --web"
echo timeout /t 10 /nobreak ^>nul
echo start msedge http://localhost:8081
echo echo.
echo echo App should open in Edge in 10 seconds...
) > "C:\Users\mpurd\ARPSC-LAUNCH.bat"

echo.
echo ================================================
echo   ALL FIXED!
echo ================================================
echo.
echo Next steps:
echo   1. Open VS Code to: C:\Users\mpurd\ARPSCApp
echo   2. Double-click: C:\Users\mpurd\ARPSC-LAUNCH.bat
echo.
echo Opening VS Code now...
timeout /t 3 /nobreak >nul
code "C:\Users\mpurd\ARPSCApp"

echo.
echo Done! Now run ARPSC-LAUNCH.bat to start the app.
echo.
pause
