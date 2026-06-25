# MEM — Medical Equipment Management

병원별 의료 장비 등록·상태 관리 및 **실시간 가동 모니터링** 모노레포 (pnpm + Turborepo).

**Repository name:** `mem` (GitHub·로컬 디렉터리·루트 npm 패키지명 동일)

## Requirements

- Node.js **24.14.0** (`.nvmrc`)
- pnpm **9.x**

## Layout

| Path | Description |
|------|-------------|
| `apps/web` | `@mem/web` — Next.js, 반응형 UI (데스크탑/태블릿/모바일) |
| `apps/api` | `@mem/api` — NestJS, Prisma, 모니터링·점검 스케줄러 |
| `packages/eslint-config` | `@mem/eslint-config` (추가 예정) |
| `docs/PROJECT.md` | 도메인·권한·API 스코프 (프로젝트 누적 문서) |
| `docs/DESIGN.md` | UI 디자인 토큰 (MD → Vanilla Extract) |
| `docs/MONITORING.md` | 주기 점검·실시간 상태 전달 (핵심 과제) |
| `docs/SEED-DATA.md` | 개발 시드 — Cursor `mem-seed`로 병원·장비 JSON |
| `docs/seed/` | `hospitals.json`, `equipment.json`, `images/` (장비 SVG) |

## Cursor AI

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](AGENTS.md) | 에이전트 컨텍스트 (스택, 도메인, 검증) |
| [CLAUDE.md](CLAUDE.md) | 짧은 요약 |
| [docs/CURSOR-SETUP.md](docs/CURSOR-SETUP.md) | skills, rules, agents, hooks |

## Status

앱 스캐폴딩·Prisma 스키마는 다음 단계. 시드 JSON은 **지금** Agent(`mem-seed`)로 `docs/seed/`에 채울 수 있습니다.
