@echo off
COLOR 0A
cls
echo ============================================
echo      ARPSC Hams - WORKING LAUNCHER
echo ============================================
echo.
echo Starting Expo with tunnel (works around path issue)...
echo.

cd /d "C:\Users\mpurd\New folder\ARPSCApp"

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

echo Opening Expo with tunnel mode...
echo.
echo This will take 30-60 seconds...
echo.

REM Start with tunnel to bypass path issues
npx expo start --tunnel --clear

echo.
echo ============================================
echo  QR Code should appear above!
echo ============================================
echo.
echo Scan it with:
echo  iPhone: Camera app
echo  Android: Expo Go app
echo.
pause
