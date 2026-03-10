@echo off
setlocal enabledelayedexpansion

set "appDir=%~dp0"
cd /d "%appDir%"
set "customDomain=arpschamradio.com"

echo ============================================
echo  ARPSC Public Website Launcher
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    echo Install Node.js from https://nodejs.org/ and run again.
    echo.
    pause
    exit /b 1
)

set "serverReady=0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r1 = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:8080/api/chat/rooms'; $r2 = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:8080/api/presence'; $r3 = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:8080/api/outages/live'; if($r1.StatusCode -eq 200 -and $r2.StatusCode -eq 200 -and $r3.StatusCode -eq 200){ exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    for /f "usebackq" %%p in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$c = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue ^| Select-Object -First 1 -ExpandProperty OwningProcess; if($c){ Write-Output $c }"`) do (
        echo Port 8080 is in use by PID %%p. Stopping it...
        taskkill /PID %%p /F >nul 2>&1
        timeout /t 1 /nobreak >nul
    )

    echo Starting ARPSC web server on http://127.0.0.1:8080 ...
    start "ARPSC Web Server" cmd /k "cd /d ""%appDir%"" && node server.js"
    timeout /t 4 /nobreak >nul
) else (
    echo Existing ARPSC-compatible server already running on port 8080.
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r1 = Invoke-WebRequest -UseBasicParsing -TimeoutSec 4 'http://127.0.0.1:8080/api/chat/rooms'; $r2 = Invoke-WebRequest -UseBasicParsing -TimeoutSec 4 'http://127.0.0.1:8080/api/presence'; $r3 = Invoke-WebRequest -UseBasicParsing -TimeoutSec 4 'http://127.0.0.1:8080/api/outages/live'; if($r1.StatusCode -eq 200 -and $r2.StatusCode -eq 200 -and $r3.StatusCode -eq 200){ exit 0 } else { exit 1 } } catch { exit 1 }"
if errorlevel 1 (
    echo.
    echo ERROR: Could not reach updated ARPSC server at http://127.0.0.1:8080
    echo Close any old server processes and run this launcher again.
    echo.
    pause
    exit /b 1
)

echo.
echo Server is running.
echo.

where cloudflared >nul 2>&1
if not errorlevel 1 (
    if defined ARPSC_CF_TUNNEL_TOKEN (
        echo Starting Cloudflare Named Tunnel for https://%customDomain% ...
        echo.
        echo Share this website address:
        echo   https://%customDomain%
        echo.
        start "ARPSC Public URL" cmd /k "cd /d ""%appDir%"" && cloudflared tunnel --no-autoupdate run --token %ARPSC_CF_TUNNEL_TOKEN%"
        goto :done
    )

    if exist "%appDir%cloudflared-domain.yml" (
        echo Found cloudflared-domain.yml. Starting named-domain tunnel config...
        echo This should map traffic to https://%customDomain% once DNS is set.
        echo.
        start "ARPSC Public URL" cmd /k "cd /d ""%appDir%"" && cloudflared tunnel --config cloudflared-domain.yml run"
        goto :done
    )

    echo Starting Cloudflare Quick Tunnel...
    echo When ready, copy the https://*.trycloudflare.com URL shown below.
    echo Share that website address with users anywhere.
    echo.
    start "ARPSC Public URL" cmd /k "cd /d ""%appDir%"" && cloudflared tunnel --url http://127.0.0.1:8080"
    goto :done
)

where npx >nul 2>&1
if errorlevel 1 (
    echo ERROR: Neither cloudflared nor npx is available.
    echo.
    echo Option 1 ^(recommended^):
    echo   Install cloudflared:
    echo   winget install Cloudflare.cloudflared
    echo.
    echo Option 2:
    echo   Install Node.js/npm to use LocalTunnel fallback.
    echo.
    pause
    exit /b 1
)

echo cloudflared not found, using LocalTunnel fallback...
echo When ready, copy the https://*.loca.lt URL shown below.
echo Share that website address with users anywhere.
echo.
start "ARPSC Public URL" cmd /k "cd /d ""%appDir%"" && npx --yes localtunnel --port 8080"

:done
echo.
echo Preferred domain target: https://%customDomain%
echo If you do not see this domain yet, complete setup in ARPSC-CUSTOM-DOMAIN-SETUP.md
echo.
echo Keep both server and tunnel windows open while users are connected.
echo.
pause
exit /b 0
