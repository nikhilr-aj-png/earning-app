@echo off
echo ==========================================
echo      EARNFLOW - GITHUB AUTO PUSHER
echo ==========================================
echo.

:: Stage all changes
echo [1/3] Staging changes...
git add .

:: Commit changes
echo.
set /p commit_msg="[2/3] Enter commit message (Press Enter for 'Auto update'): "
if "%commit_msg%"=="" set commit_msg="Auto update"
git commit -m "%commit_msg%"

:: Push to remote
echo.
echo [3/3] Pushing to GitHub (Main & Master)...
git push origin main
git push origin master

echo.
echo ==========================================
echo           DEPLOYMENT COMPLETE
echo ==========================================
pause
