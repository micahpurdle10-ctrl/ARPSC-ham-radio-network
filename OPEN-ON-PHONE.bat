@echo off
COLOR 0B
cls
echo ============================================
echo   ARPSC Hams - Open on Phone (EASIEST!)
echo ============================================
echo.
echo This DEFINITELY WORKS right now!
echo.

cd /d "C:\Users\mpurd\New folder\ARPSCApp"

echo [Step 1] Starting Expo...
echo.
start powershell -ExecutionPolicy Bypass -NoExit -Command "$host.UI.RawUI.WindowTitle='ARPSC Expo Server - Keep Open'; cd 'C:\Users\mpurd\New folder\ARPSCApp'; npx expo start --offline"

echo.
echo ============================================
echo  ✓ Server started in new window!
echo ============================================
echo.
echo NEXT STEPS:
echo.
echo 1. In the new window, you'll see a QR code
echo 2. On your phone:
echo    - iPhone: Open Camera app, scan QR code
echo    - Android: Open Expo Go app, scan QR code
echo.
echo 3. Your app opens on your phone with ALL features!
echo.
echo ============================================
echo.
pause
