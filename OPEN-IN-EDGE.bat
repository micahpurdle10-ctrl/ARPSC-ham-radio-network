@echo off
COLOR 0B
cls
echo ============================================
echo    Opening ARPSC Hams Safety Web in Edge
echo ============================================
echo.
cd /d "C:\Users\mpurd\New folder\ARPSCApp"

echo [1/2] Starting local web server...
echo.

REM Start the local Node web server on port 8080
start "ARPSC Web Server" cmd /k "node server.js"

echo [2/2] Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Opening Edge browser...
start msedge http://localhost:8080/index.html

echo.
echo ============================================
echo  Opening in Edge!
echo ============================================
echo.
echo Keep the "ARPSC Web Server" window open.
echo Close it to stop the app.
echo.
pause
