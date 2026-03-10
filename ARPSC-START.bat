@echo off
REM ARPSC Hams Web App - Universal Launcher
REM Starts local web mode first, then falls back to file mode if needed

setlocal enabledelayedexpansion

REM Get the full path of this script's directory
set "appDir=%~dp0"
set "htmlFile=%appDir%index.html"
set "serverFile=%appDir%server.js"
set "webUrl=http://127.0.0.1:8080/index.html?v=%RANDOM%"

REM Check if HTML file exists
if not exist "%htmlFile%" (
    echo.
    echo ERROR: index.html not found in %appDir%
    echo Please make sure the HTML file is in the same folder as this launcher.
    echo.
    pause
    exit /b 1
)

REM Convert path to file:/// URL for fallback mode
set "fileUrl=%htmlFile:\=/%"
set "fileUrl=file:///%fileUrl:~3%"

echo Launching ARPSC Hams Web App...
echo.

set "needStart=1"

REM Check if local web server is already running
powershell -NoProfile -ExecutionPolicy Bypass -Command "$r = Test-NetConnection -ComputerName 127.0.0.1 -Port 8080 -WarningAction SilentlyContinue; if($r.TcpTestSucceeded){ exit 0 } else { exit 1 }" >nul 2>&1

if errorlevel 1 (
    set "needStart=1"
) else (
    REM Validate that the running server is this app (has chat API)
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:8080/api/chat/rooms'; if($r.StatusCode -eq 200){ exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if errorlevel 1 (
        echo Existing server on port 8080 is stale. Restarting with latest ARPSC app...
        for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
            taskkill /PID %%p /F >nul 2>&1
        )
        timeout /t 1 /nobreak >nul
        set "needStart=1"
    ) else (
        set "needStart=0"
    )
)

if "%needStart%"=="1" (
    echo Starting local web server on http://127.0.0.1:8080 ...

    where node >nul 2>&1
    if errorlevel 1 (
        echo Node.js not found. Falling back to direct file launch.
        goto :open_file
    )

    if not exist "%serverFile%" (
        echo server.js not found. Falling back to direct file launch.
        goto :open_file
    )

    start "ARPSC Web Server" cmd /c "cd /d ""%appDir%"" && node server.js"
    timeout /t 3 /nobreak >nul
)

goto :open_web

:open_web
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "%webUrl%"
    goto :success_web
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%webUrl%"
    goto :success_web
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%webUrl%"
    goto :success_web
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%webUrl%"
    goto :success_web
)

start "" "%webUrl%"
goto :success_web

:open_file
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "!fileUrl!"
    goto :success_file
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "!fileUrl!"
    goto :success_file
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "!fileUrl!"
    goto :success_file
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "!fileUrl!"
    goto :success_file
)

start "" "!fileUrl!"
goto :success_file

:success_web
echo App launched successfully in web mode.
echo URL: %webUrl%
echo.
pause
exit /b 0

:success_file
echo App launched successfully in file mode.
echo URL: !fileUrl!
echo.
pause
exit /b 0
