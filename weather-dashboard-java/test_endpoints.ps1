$endpoints = @(
    "http://localhost:8080/",
    "http://localhost:8080/css/style.css",
    "http://localhost:8080/js/app.js",
    "http://localhost:8080/js/weather-effects.js",
    "http://localhost:8080/api/health",
    "http://localhost:8080/api/favorites",
    "http://localhost:8080/api/search?q=London",
    "http://localhost:8080/api/weather?lat=51.5085&lon=-0.1257"
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Verifying AeroCast Dashboard Endpoints" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$allPassed = $true
foreach ($url in $endpoints) {
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        Write-Host "[PASS] Status $($res.StatusCode) -> $url ($($res.Content.Length) bytes)" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] -> $url : $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "`nAll endpoints verified successfully!" -ForegroundColor Green
} else {
    Write-Host "`nSome endpoints failed!" -ForegroundColor Red
}
