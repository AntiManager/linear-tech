# Linear Tech — Setup Script (Windows)
# Выполняется при создании worktree для Agent Manager

Write-Host "=== Установка зависимостей Linear Tech ===" -ForegroundColor Green

# Проверить Python
$pyVersion = python --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Python: $pyVersion" -ForegroundColor Cyan
    python -m pip install --upgrade pip -q
} else {
    Write-Warning "Python не установлен. Установите Python 3.11+"
}

# Проверить Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Cyan
} else {
    Write-Warning "Node.js не установлен"
}

# Создать директории для данных
$dataDirs = @("data/content", "data/images", "data/pdf", "docs/architecture", "docs/decisions", "research/competitors")
foreach ($dir in $dataDirs) {
    $path = Join-Path $env:REPO_PATH $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "  Создано: $dir" -ForegroundColor Gray
    }
}

Write-Host "=== Setup завершён ===" -ForegroundColor Green
