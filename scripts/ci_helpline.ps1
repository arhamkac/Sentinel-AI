# Sentinel AI Local CI Verification Helpline Script
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   SENTINEL AI CI/CD LOCAL HELPLINE      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$AnyFailed = $false

# 1. Run Frontend Lint
Write-Host "[1/3] Running Frontend ESLint Verification..." -ForegroundColor Yellow
Push-Location frontend
npm run lint
$LintExit = $LASTEXITCODE
Pop-Location

if ($LintExit -ne 0) {
    Write-Host "Frontend ESLint check failed!" -ForegroundColor Red
    Write-Host "Advice: Check the errors listed above. Most unused variables or styling issues can be fixed automatically by running 'npm run lint -- --fix' inside the frontend directory." -ForegroundColor DarkYellow
    $AnyFailed = $true
} else {
    Write-Host "Frontend ESLint clean!" -ForegroundColor Green
}
Write-Host ""

# 2. Run Frontend Build
Write-Host "[2/3] Verifying Frontend Compile and Build..." -ForegroundColor Yellow
Push-Location frontend
npm run build
$BuildExit = $LASTEXITCODE
Pop-Location

if ($BuildExit -ne 0) {
    Write-Host "Frontend build compilation failed!" -ForegroundColor Red
    Write-Host "Advice: Check for typescript syntax errors, missing package imports, or incorrect relative filepaths in your component files." -ForegroundColor DarkYellow
    $AnyFailed = $true
} else {
    Write-Host "Frontend compiles successfully!" -ForegroundColor Green
}
Write-Host ""

# 3. Run Backend Pytest
Write-Host "[3/3] Running Backend Python Test Suite..." -ForegroundColor Yellow
Push-Location backend
python -m pytest tests/ -v --tb=short
$TestExit = $LASTEXITCODE
Pop-Location

if ($TestExit -ne 0) {
    Write-Host "Backend pytest suite failed!" -ForegroundColor Red
    Write-Host "Advice: Make sure your PostgreSQL database service is running locally. If there is a connection drop, check your connection strings in the backend/.env file." -ForegroundColor DarkYellow
    $AnyFailed = $true
} else {
    Write-Host "Backend tests passed successfully!" -ForegroundColor Green
}
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
if ($AnyFailed) {
    Write-Host "LOCAL CI GATES FAILED. Please review the diagnostic tips above before pushing." -ForegroundColor Red
} else {
    Write-Host "ALL GATES PASSED! Your branch is clean and ready for CI/CD deployment." -ForegroundColor Green
}
Write-Host "=========================================" -ForegroundColor Cyan
