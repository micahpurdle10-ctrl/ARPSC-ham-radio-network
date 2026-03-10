@echo off
COLOR 0E
cls
echo ============================================
echo      ARPSC Hams - SAFETY WEB LAUNCH
echo ============================================
echo.
echo Starting your web app...
echo.

cd /d "C:\Users\mpurd\New folder\ARPSCApp"

echo [1/2] Starting local web server...
start "ARPSC Web Server" cmd /k "node server.js"

echo [2/2] Opening in your browser...
timeout /t 3 /nobreak >nul

REM Open the browser to the web page
start msedge http://localhost:8080/index.html

echo.
echo ============================================
echo  ARPSC Hams Safety Web is starting!
echo ============================================
echo.
echo Check your browser - it should open shortly.
echo If not, open Edge and go to:
echo   http://localhost:8080/index.html
echo.
echo Keep this window open while using the app.
echo Press Ctrl+C to stop the server.
echo.
pause
