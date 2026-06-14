@echo off
echo ========================================
echo    Teddy Label Printer
echo ========================================
echo.

if "%~1"=="" (
    echo Usage: print.bat [excel-file.xlsx]
    echo.
    echo Drag and drop your Excel file onto this .bat
    echo Or run: print.bat products.xlsx
    echo.
    pause
    exit /b
)

node print-labels.js "%~1"
echo.
pause
