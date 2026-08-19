@echo off
setlocal

echo =============================================================
echo   AeroCast Weather Dashboard - Java 21 Launcher
echo =============================================================

cd /d "%~dp0"

echo [+] Compiling Java sources...
if not exist "bin" mkdir bin
javac -encoding UTF-8 -d bin src/com/weather/*.java

if %ERRORLEVEL% NEQ 0 (
    echo [!] Compilation failed! Please check that JDK 21+ is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo [+] Launching Java Weather Dashboard Server...
java -cp bin com.weather.Main 8080

pause
