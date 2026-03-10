# ARPSC Hams - Launch in Chrome Browser
# Double-click this file to start the browser-native app in Google Chrome

Write-Host "Starting ARPSC Hams Browser App..." -ForegroundColor Cyan
Write-Host ""

# Open Google Chrome
Write-Host "Opening in Google Chrome..." -ForegroundColor Green
$launcher = Join-Path $PSScriptRoot 'WORKING-LAUNCHER.html'
if (-not (Test-Path $launcher)) {
	Write-Host "ERROR: Launcher file not found: $launcher" -ForegroundColor Red
	pause
	exit 1
}
$uri = (New-Object System.Uri ($launcher)).AbsoluteUri
Start-Process "chrome" -ArgumentList $uri

Write-Host ""
Write-Host "ARPSC Hams browser app is now running in Chrome." -ForegroundColor Green
Write-Host ""
Write-Host "No Expo server is required for this mode." -ForegroundColor Yellow
Write-Host "URL: $uri" -ForegroundColor Cyan
Write-Host ""
pause
