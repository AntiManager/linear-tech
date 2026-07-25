---
description: "Деплой на VPS / CI/CD настройка"
---
# Деплой на VPS

Выполняет деплой нового сайта на VPS клиента.

## Процесс
1. Проверить текущий статус VPS
2. Настроить Nginx + SSL (Let'\''s Encrypt / Certbot)
3. Задеплоить сборку
4. Настроить CI/CD (GitHub Actions / GitLab CI)
5. Настроить бэкапы (база, файлы, конфиги)
6. Проверить DNS и SSL
7. Мониторинг (uptime, логи, ошибки)

## Требования
- VPS: Linux Ubuntu/Debian
- Docker + Docker Compose (если применимо)
- GitHub Actions для CI/CD
- Healthchecks / Uptime Kuma для мониторинга
