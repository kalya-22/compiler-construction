@echo off
echo ========================================================
echo   Compiling Lex / Flex Comment and Whitespace Remover
echo ========================================================

where flex >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'flex' command not found in your PATH.
    echo.
    echo To install Flex on Windows:
    echo   1. Using Chocolatey:  choco install winflexbison3
    echo   2. Using Winget:      winget install -e --id GnuWin32.Flex
    echo   3. Or compile inside WSL / Linux / Online GDB Lex Compiler
    echo.
    pause
    exit /b 1
)

where gcc >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'gcc' command not found in your PATH.
    echo Please install MinGW / GCC (e.g. winget install -e --id MSYS2.MSYS2 or MinGW).
    pause
    exit /b 1
)

echo [1/2] Running flex remover.l ...
flex remover.l
if %errorlevel% neq 0 (
    echo [ERROR] Flex generation failed.
    exit /b 1
)

echo [2/2] Compiling lex.yy.c with gcc ...
gcc lex.yy.c -o remover.exe
if %errorlevel% neq 0 (
    echo [ERROR] GCC compilation failed.
    exit /b 1
)

echo.
echo [SUCCESS] remover.exe built successfully!
echo.
echo Running test with input_test.c:
echo --------------------------------------------------------
remover.exe input_test.c
echo --------------------------------------------------------
pause
