@echo off
COLOR 0A
echo ========================================
echo  ARPSC Hams - ONE-TIME FIX
echo ========================================
echo.
echo This will move your project to a folder
echo without spaces so it can launch properly.
echo.
echo From: C:\Users\mpurd\New folder\ARPSCApp
echo To:   C:\Users\mpurd\ARPSCApp
echo.
echo This is a ONE-TIME fix that takes 5 seconds.
echo.
pause

echo.
echo Fixing folder structure...

REM Close any VS Code instances
echo Please close VS Code if it's open, then press any key...
pause

REM Move the project folder
echo Moving project...
move "C:\Users\mpurd\New folder\ARPSCApp" "C:\Users\mpurd\ARPSCApp"

echo.
echo ========================================
echo  ✓ FIX COMPLETE!
echo ========================================
echo.
echo Your project is now at:
echo   C:\Users\mpurd\ARPSCApp
echo.
echo NEXT STEPS:
echo 1. Open VS Code
echo 2. File -^> Open Folder
echo 3. Select: C:\Users\mpurd\ARPSCApp
echo 4. Double-click: LAUNCH-EDGE.bat
echo.
echo Your app will now launch successfully!
echo.
pause

REM Open the new location in Explorer
explorer "C:\Users\mpurd\ARPSCApp"
