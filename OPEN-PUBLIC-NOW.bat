@echo off
setlocal

set "appDir=%~dp0ARPSCApp"
if not exist "%appDir%\START-PUBLIC-WEB.bat" (
    echo ERROR: Could not find ARPSCApp\START-PUBLIC-WEB.bat
    pause
    exit /b 1
)

cd /d "%appDir%"
call START-PUBLIC-WEB.bat

endlocal
