@echo off
title FSM Lexical Preprocessor Launcher
echo ========================================================
echo   Starting FSM Compiler Preprocessor (Lex + React)
echo ========================================================
echo.

echo [1/2] Starting Backend Server (FastAPI + Lex Engine)...
start "FSM Backend (FastAPI + Lex)" cmd /k "python backend/run.py"

echo [2/2] Starting Frontend Server (Vite + React)...
start "FSM Frontend (Vite + React)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting!
echo Opening browser to http://127.0.0.1:5173 ...
timeout /t 3 >nul
start http://127.0.0.1:5173

echo.
echo You can close this window now. The servers run in their own windows.
exit
