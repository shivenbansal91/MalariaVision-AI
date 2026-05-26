@echo off
title MalariaVision AI - Startup

echo.
echo  ==========================================
echo    MalariaVision AI - Starting Project
echo  ==========================================
echo.

:: ── Start Flask Backend ──────────────────────
echo  [1/2] Starting Flask Backend on port 5000...
start "MalariaVision Backend" cmd /k "cd /d d:\AI Project\backend && venv\Scripts\activate && python app.py"

:: Wait 3 seconds for backend to boot
timeout /t 3 /nobreak >nul

:: ── Start React Frontend ─────────────────────
echo  [2/2] Starting React Frontend on port 5173...
start "MalariaVision Frontend" cmd /k "cd /d d:\AI Project\frontend && npm run dev"

:: Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul

echo.
echo  ==========================================
echo   App is running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:5000
echo  ==========================================
echo.

:: Open browser automatically
start http://localhost:5173

pause
