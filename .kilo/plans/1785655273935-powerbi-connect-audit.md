---
title: Подключение к Power BI Desktop и аудит модели
status: ready
created: 2026-08-02
owner: architect
---

# План: подключение к Power BI и аудит модели «НДС»

## Цель
Подключиться к открытому в Power BI Desktop файлу (проект «НДС», PID 3716) через официальный
MCP `@microsoft/powerbi-modeling-mcp`, провести аудит семантической модели и задокументировать её.

## Предусловия (уже выполнены)
- [x] MCP `powerbi-modeling-mcp` добавлен в `kilo.json` (`npx -y @microsoft/powerbi-modeling-mcp@latest --start`)
- [x] Power BI Desktop запущен (PID 3716, заголовок «НДС»)
- [x] Пакет на npm существует (v0.5.0-beta.12), npx резолвится из PATH

## Диагностика (02.08, решено)
Корневая причина — **таймаут старта MCP на первом запуске**:
- Kilo стартует все 6 MCP одновременно через `npx`; при старте новой сессии
  `@microsoft/powerbi-modeling-mcp@latest` долго скачивал .NET-пакет (win32-x64),
  не уложился в таймаут → лог `server unavailable status=failed`, сервер убит.
- После того как пакет закэшировался (`D:\cache\npm\_npx\...`), сервер стартует и
  отвечает на `initialize` за ~5 c (проверено stdio-пробой, 21 инструмент,
  есть `connection_operations`/`database_operations`).

Что исправлено в `kilo.json`:
- Версия powerbi закреплена: `@microsoft/powerbi-modeling-mcp@0.5.0-beta.12` (без `@latest`).
- Удалён мёртвый MCP `web-scraper` (`@kaliop/mcp-server-web-scraper` — 404 на npm).
- `npm cache verify` выполнен — устранены `ECOMPROMISED / Lock compromised`
  (гонка за npm-кэш при одновременном старте MCP).

Решение: перезапустить сессию Kilo. Теперь powerbi MCP стартует быстро и должен подхватиться.

## Шаги после перезапуска сессии

### 1. Подключение
- Выполнить промпт `ConnectToPowerBIDesktop` или команду
  `Connect to 'НДС' in Power BI Desktop` (имя файла уточнить по заголовку окна Desktop).
- Проверить подключение через `database_operations` (list databases) — ожидается одна
  локальная база открытого файла.

### 2. Аудит модели (readonly)
- `model_operations` (get) — список таблиц, количество мер/колонок.
- `table_operations` (list) + `measure_operations` (list) — состав модели.
- `relationship_operations` (list) — связи, направление фильтрации, кардинальность.
- `dax_query_operations` — валидация ключевых мер, поиск ошибок.
- Скрипт аудита по скиллу `.kilo/skill/powerbi-analytics/SKILL.md`:
  структура/связи → naming → DAX-аномалии → производительность → документация.

### 3. Докрутка (только по согласованию)
- Стандартизация naming мер/таблиц.
- Исправление DAX-аномалий (DIVIDE, CALCULATE, FormatString, Description, DisplayFolder).
- Перед записью — бэкап модели. MCP работает в режиме `--start` (readwrite с подтверждениями).

### 4. Документирование
- Markdown-описание модели: таблицы, колонки, меры (DAX + бизнес-логика), связи, lineage.
- Mermaid-диаграмма связей.

## Критерий готовности
- Модель подключена, аудит проведён, отчёт сохранён в `docs/` (или research/).
- Итоговый отчёт: scorecard, список issues, план докрутки.

## Риски
- Если `npx` не найдёт пакет — проверить PATH/Node на машине (глобальный конфиг как fallback).
- MCP изменяет только семантическую модель, не отчётные страницы.
- Подтверждения (elicitation) требуют интерактивного согласия перед записью — не
  использовать `--skipconfirmation` без бэкапа.
