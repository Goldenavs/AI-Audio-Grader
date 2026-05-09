@echo off
title AI Audio Grader Launcher
:: Ensure the script runs from its own folder regardless of how it was opened
cd /d "%~dp0"

echo ==============================================
echo   LAUNCHING AI AUDIO GRADER PROTOTYPE
echo ==============================================

:: 1. Launch the Backend silently in the background
echo Starting Backend Server...
start "BACKEND - Python/FastAPI" /min cmd /k "cd backend && venv\Scripts\activate && python main.py"

:: 2. Launch the Frontend silently in the background
echo Starting Frontend Server...
start "FRONTEND - Vite/React" /min cmd /k "cd frontend && npm run dev"

echo ==============================================
echo   SYSTEM IS READY! 
echo   Opening browser in 10 seconds...
echo ==============================================
ping 127.0.0.1 -n 11 > nul
start http://localhost:5173

:: Auto-close this launcher window so the screen is completely clean
exit