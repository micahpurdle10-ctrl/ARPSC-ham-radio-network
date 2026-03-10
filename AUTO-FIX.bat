@echo off
COLOR 0C
cls
echo ============================================
echo     AUTOMATIC FIX - Edge Launcher
echo ============================================
echo.
echo This will:
echo  1. Move ARPSCApp folder to fix path
echo  2. Create new Edge launcher
echo  3. Open VS Code to new location
echo.
echo Close VS Code first, then press any key...
pause >nul

echo.
echo Moving folder...
if exist "C:\Users\mpurd\New folder\ARPSCApp" (
    move "C:\Users\mpurd\New folder\ARPSCApp" "C:\Users\mpurd\" >nul 2>&1
    if exist "C:\Users\mpurd\ARPSCApp" (
        echo SUCCESS - Folder moved!
    ) else (
        echo ERROR - Could not move folder
        echo Please close VS Code and try again
        pause
        exit /b 1
    )
) else (
    echo Folder already in correct location!
)

echo.
echo Creating Edge launcher...
cd /d "C:\Users\mpurd\"

REM Create the launcher script
(
echo @echo off
echo cd /d "C:\Users\mpurd\ARPSCApp"
echo start "ARPSC Server" cmd /k npm start -- --web
echo timeout /t 10 /nobreak ^>nul
echo start msedge http://localhost:8081
echo echo.
echo echo Edge should open in 10 seconds...
echo pause
) > "C:\Users\mpurd\LAUNCH-EDGE-FIXED.bat"

echo.
echo ============================================
echo  ALL FIXED!
echo ============================================
echo.
echo Now:
echo  1. Open VS Code to: C:\Users\mpurd\ARPSCApp
echo  2. Double-click: LAUNCH-EDGE-FIXED.bat
echo.
echo Opening VS Code now...
timeout /t 2 /nobreak >nul
code "C:\Users\mpurd\ARPSCApp"

echo.
pause
