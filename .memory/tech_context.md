# linear-tech — Tech Context
> Updated: 2026-08-02

## Development
```bash
# Full stack (Docker)
docker compose -f docker/docker-compose.yml up -d

# Frontend only
cd frontend && npm run dev    # Next.js on localhost:3000

# CMS only
cd cms && npm run develop     # Strapi on localhost:1337

# Tests
npm run test:e2e               # Playwright
npm run test:e2e:ui            # Playwright UI mode
npm run lint                   # ESLint
npm run typecheck              # TypeScript
```

## Docker Stack (docker/)
Services: frontend (Next.js), cms (Strapi), db (PostgreSQL), etc.

## Content Pipeline
```
Strapi CMS → API → Next.js frontend (SSR/ISR)
Old site data → parse_site.py → data/ → Strapi import
```

## Git
- Branch: `master` (not `main`)
- Remote: origin (GitHub only — GitVerse not yet added)
- No dual-push setup (to do)
- Has its own AGENTS.md, kilo.json
- Kilo agents: architect, competitor, designer, marketer, parser, seo
- Kilo skills: 10 skills in .kilo/skill/
- `.gigacode/` — plan files

## Environment
- `.env` per service (frontend, cms, root)
- CI: GitHub Actions (`.github/`)
- Deploy: manual until VPS secrets available
