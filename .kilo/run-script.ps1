# Linear Tech — Run Script (Windows)
# Запускается при нажатии Run в Agent Manager

Write-Host "=== Linear Tech Dev Server ===" -ForegroundColor Green

# Определяем тип запуска
if (Test-Path "package.json") {
    Write-Host "Node.js проект — запуск dev сервера..." -ForegroundColor Cyan
    # npm run dev
} elseif (Test-Path "manage.py") {
    Write-Host "Django проект — запуск dev сервера..." -ForegroundColor Cyan
    # python manage.py runserver
} elseif (Test-Path "requirements.txt") {
    Write-Host "Python проект — ожидание запуска..." -ForegroundColor Cyan
    # python app.py
} else {
    Write-Host "Стек пока не определён. Запустите npm install / pip install и настройте проект." -ForegroundColor Yellow
}

Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Gray
