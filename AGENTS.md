# MEM — Agent guide

**Medical Equipment Management** — hospital-scoped medical equipment CRUD and **real-time operational monitoring**.

pnpm + Turborepo monorepo (Korean UI planned). **GitHub repository name:** `mem`.

## Stack

| App | Path | Tech |
|-----|------|------|
| Web | `apps/web` | Next.js (App Router), React, responsive UI (desktop / tablet / mobile) |
| API | `apps/api` | NestJS, Prisma, PostgreSQL |
| Shared lint | `packages/eslint-config` | ESLint flat (추가 예정) |

- **Node** 24.14.0 (`.nvmrc`), **pnpm** 9.x
- Root scripts (추가 예정): `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`

## Domain model (high level)

- **Hospital** — equipment and users belong to one hospital
- **User** — belongs to **exactly one** hospital (no multi-hospital membership)
- **Equipment** — medical device master (identity, location, `statusSourceType`, connection info)
- **Equipment status** — `RUNNING` / `IDLE` / `FAULT` / `OFFLINE` (see `docs/PROJECT.md`)
- **Status source** — hybrid: `PING` | `MEDICAL_PROTOCOL` | `IOT_SENSOR` | `AGENT`
- **HealthCheck** — server-initiated periodic probe and result log
- **Monitoring** — aggregate status + **real-time client updates** (core feature)

Roles (draft): `HOSPITAL_USER`, `HOSPITAL_ADMIN`, `PLATFORM_ADMIN`

Detail and change log: [`docs/PROJECT.md`](./docs/PROJECT.md)  
Monitoring design: [`docs/MONITORING.md`](./docs/MONITORING.md)  
Dev seed workflow: [`docs/SEED-DATA.md`](./docs/SEED-DATA.md) (`mem-seed` skill)  
**Session log (이어하기):** [`docs/DEV-LOG.md`](./docs/DEV-LOG.md)

## Auth architecture (Snack pattern — implemented)

- API: httpOnly cookies `accessToken`, `refreshToken`
- Web: middleware JWT verify with **`JWT_SECRET`** (must match API)
- Client: `cookieFetch` + `getApiBaseUrl()` under `apps/web/src/lib/api/`
- All equipment APIs scoped by `hospitalId` from JWT / session
- Dev login example: `admin@asan.dev` / `test1234!`
- **관리** (`/settings/*`): `HOSPITAL_ADMIN` only (middleware)
- **프로필** `/profile`: 아바타 URL·비밀번호 (`PATCH /users/me/*`)

## Environment files

- **Never commit secrets.** Gitignored: `apps/*/env/.env.production`, `apps/*/env/.env.development`
- Examples: `apps/api/env/.env.example`, `apps/web/env/.env.example` (추가 예정)

## Code conventions

- **Minimize scope** — match existing patterns in the touched app
- **Web API clients** — one module per domain: `apps/web/src/lib/api/*.api.ts`
- **API modules** — `apps/api/src/<feature>/` (include `monitoring/` for health checks)
- **Comments** — non-obvious business logic only

## Deploy docs

| Platform | Doc |
|----------|-----|
| AWS EC2 | [`docs/deploy/EC2.md`](./docs/deploy/EC2.md) |
| On-premise | [`docs/deploy/ON-PREMISE.md`](./docs/deploy/ON-PREMISE.md) |
| Overview | [`docs/deploy/README.md`](./docs/deploy/README.md) |

## Common pitfalls

1. **Cross-hospital leak** — every query must filter by `hospitalId`
2. **Monitoring overload** — tune `HEALTH_CHECK_INTERVAL_MS` and batch size before scaling equipment count
3. **Stale UI** — dashboard must subscribe to real-time channel or short poll (`docs/MONITORING.md`)
4. **Secrets in git** — never commit `env/.env.production`

## Verification commands

코드 변경 마무리 시 **사용자 확인 없이** 아래를 순서대로 실행합니다. 상세: [`docs/CODE-QUALITY.md`](./docs/CODE-QUALITY.md)

```bash
pnpm typecheck
pnpm lint
```

배포 전 추가 (필요 시):

```bash
pnpm --filter @mem/api run build
pnpm --filter @mem/web run build
```

**Agent 규칙:** `typecheck` / `lint`는 **묻지 않고 즉시 실행**. "실행할까요?" 질문 금지. 규칙: `.cursor/rules/code-quality-auto.mdc`

## Cursor project config

Skills, rules, hooks, subagents: `.cursor/` — see `.cursor/README.md` and `docs/CURSOR-SETUP.md`

## Documentation order (new contributors)

1. `docs/PROJECT.md` — domain & hospital scope
2. `docs/MONITORING.md` — probes & real-time
3. `AGENTS.md` (this file)
4. `docs/CODE-QUALITY.md`, `docs/CURSOR-SETUP.md`
