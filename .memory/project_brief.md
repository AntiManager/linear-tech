# linear-tech — Project Brief
> Updated: 2026-08-02

## Overview
Полная переделка сайта [linear-tech.ru](https://www.linear-tech.ru) — официальный дистрибьютор HIWIN (Тайвань) в России.
Клиент: ООО «Линейные системы» (Екатеринбург).
Старый сайт: Joomla, 2011 г.

## Stack
- **Frontend**: Next.js (TypeScript) — `frontend/`
- **CMS**: Strapi (headless CMS) — `cms/`
- **Infra**: Docker (dev stack: `docker/`)
- **Tests**: Playwright E2E (`tests/`)
- **Scripts**: Node.js (`scripts/`), Python (`scripts/download_media.py`, `scripts/parse_site.py`)

## Structure
- `frontend/` — Next.js app (package.json: next dev/build/start)
- `cms/` — Strapi app (package.json: strapi develop/build/start)
- `data/` — content: pages, images (202 WebP images)
- `design/` — design files
- `docker/` — Docker Compose dev stack
- `tests/` — Playwright E2E specs
- `scripts/` — migrations, parsers (Node + Python)
- `research/` — research docs
- `package.json` — root workspace (dev, build, test:e2e, lint, typecheck)
- `.kilo/` — agents (architect, competitor, designer, marketer, parser, seo), commands (audit, deploy, scrape), plans, skills (10 skills)

## Constraints
- No VPS secrets for deploy (CI deploy job removed)
- Content migration in progress (from old Joomla site)
- Russian-language content (каталог комплектующих)
- Master branch (not main)
