Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  AeroCast Weather Dashboard - Java 21 Launcher" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

Write-Host "[+] Compiling Java source files..." -ForegroundColor Green
javac -encoding UTF-8 -d bin src/com/weather/*.java

if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Compilation failed. Please make sure Java 21 JDK is installed and in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "[+] Launching Weather Dashboard on http://localhost:8080 ..." -ForegroundColor Green
java -cp bin com.weather.Main 8080
