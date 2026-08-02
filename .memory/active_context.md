# linear-tech — Active Context
> Updated: 2026-08-02

## Current Task
Initial Memory Bank setup. Project freshly cloned to this laptop.

## Recent Activity (from remote commits)
- Markdown rendering + content cleanup (strip headings, broken PDF links, \r)
- Homepage UX overhaul: real images, 17 categories, clean names, clickable tabs, CTA
- Content migration: images, categories, proxy, fetch cache
- Catalog root page + SEO + search results page
- RFQ basket badge (reactive via custom events)
- 202 WebP images added
- CI: deploy job removed (no VPS secrets)

## Open Questions
- [ ] Docker dev stack working on this laptop? (Docker daemon not running at last check)
- [ ] GitVerse remote needed? (currently GitHub-only)
- [ ] Next.js build working locally?
- [ ] Strapi CMS setup — DB connection?
- [ ] Deploy target: VPS, when available?

## Key Files to Review
- `frontend/` — Next.js pages, components
- `cms/` — Strapi content types
- `docker/docker-compose.yml` — dev environment
- `.kilo/AGENTS.md` — project-specific agent rules
