# Cursor AI setup (MEM)

프로젝트 레벨 Cursor 설정. Snack 레포 패턴 기반.

## 문서 작성 순서 (권장)

1. `docs/PROJECT.md` — 도메인·권한·API 스코프
2. `docs/MONITORING.md` — 점검·실시간
3. `AGENTS.md` — 허브
4. `CLAUDE.md` — 요약
5. `docs/CODE-QUALITY.md`, 이 파일
6. `.cursor/rules`, `skills`, `agents`
7. `docs/deploy/*` — 배포 확정 시

## File map

| Path | Purpose |
|------|---------|
| [AGENTS.md](../AGENTS.md) | 메인 에이전트 컨텍스트 |
| [CLAUDE.md](../CLAUDE.md) | 짧은 요약 |
| [docs/PROJECT.md](./PROJECT.md) | 프로젝트 전용 누적 문서 |
| [docs/MONITORING.md](./MONITORING.md) | 모니터링·실시간 설계 |
| [docs/SEED-DATA.md](./SEED-DATA.md) | 개발 시드·Cursor 리서치 워크플로 |
| `.cursor/skills/*/SKILL.md` | 작업별 스킬 |
| `.cursor/rules/*.mdc` | 코딩 규칙 (globs / alwaysApply) |
| `.cursor/agents/*.md` | Task 서브에이전트 |
| `.cursor/hooks.json` | 훅 연결 |
| `.cursor/plugins/` | 팀 플러그인 매니페스트 |

## Skills

| Skill | Use when |
|-------|----------|
| `mem` | `apps/web` / `apps/api` 기능 구현 |
| `mem-seed` | 개발용 병원·장비 시드 JSON (웹 리서치) |
| `mem-deploy` | 배포·env (문서 추가 후) |

## Subagents

| Agent | Use when |
|-------|----------|
| `mem-explore` | 코드베이스 탐색 |
| `mem-api` | NestJS, Prisma, auth |
| `mem-web` | Next.js, 반응형 UI |
| `mem-monitoring` | 점검 스케줄러·실시간·상태 모델 |
| `mem-seed` | 공개 자료 리서치 → `docs/seed/*.json` |

## Hooks

clone 후:

```bash
chmod +x .cursor/hooks/*.sh
```

| Hook | 역할 |
|------|------|
| `session-context.sh` | 세션 시작 시 MEM 리마인더 (자동 typecheck/lint 포함) |
| `allow-quality-checks.sh` | `pnpm typecheck` / `pnpm lint` 명령 자동 허용 (사용자 승인 생략) |
| `guard-secrets.sh` | force push, `.env.production` 커밋 경고 |

코드 변경 후 검증: [`docs/CODE-QUALITY.md`](./CODE-QUALITY.md) — 에이전트는 **묻지 않고** `pnpm typecheck` → `pnpm lint` 실행.

## Always-apply (Cursor 첫 컨텍스트)

권장: `.cursor/rules/monorepo.mdc`, `CLAUDE.md`, `AGENTS.md` (Cursor Settings에서 등록)
