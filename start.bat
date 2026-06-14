@echo off
title Teddy Label Printer
echo ========================================
echo    Teddy Label Printer
echo ========================================
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Download it from: https://nodejs.org
    echo.
    pause
    exit /b
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    echo.
    npm install
    echo.
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b
    )
    echo Dependencies installed successfully!
    echo.
)

echo Starting server...
echo.
start http://localhost:3333
node server.js
