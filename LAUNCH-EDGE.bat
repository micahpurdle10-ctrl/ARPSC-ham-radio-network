@echo off
echo ========================================
echo  ARPSC Hams Emergency Communications
echo  Launching Browser App in Microsoft Edge...
echo ========================================
echo.

set "launcher=%~dp0index.html"
if not exist "%launcher%" (
	echo ERROR: Launcher file not found:
	echo %launcher%
	pause
	exit /b 1
)

set "url=file:///%launcher%"
set "url=%url:\=/%"
set "url=%url: =%%20%"

REM Open Edge browser
echo Opening Microsoft Edge...
start msedge "%url%"

echo.
echo ========================================
echo  App is running from local file URL
echo  %url%
echo  Press any key to close this window
echo ========================================
pause >nul
