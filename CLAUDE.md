# MEM (Claude / agent context)

Full guide: **[AGENTS.md](./AGENTS.md)**

## Quick facts

- Monorepo: `apps/web` (Next.js), `apps/api` (Nest + Prisma)
- **Hospital-scoped:** users manage equipment for their hospital only
- **Core feature:** periodic server health checks → equipment status → real-time UI
- Project-specific: `docs/PROJECT.md`, `docs/MONITORING.md`, `docs/SEED-DATA.md`

## Do not

- Commit `apps/*/env/.env.production` or real secrets
- Cross-hospital data access without `PLATFORM_ADMIN` guard
- Force-push `main` without explicit user request

## Cursor skills

- `.cursor/skills/mem/SKILL.md` — feature work
- `.cursor/skills/mem-seed/SKILL.md` — dev seed JSON (web research)
- `.cursor/skills/mem-deploy/SKILL.md` — deploy / env
