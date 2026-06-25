---
name: mem
description: >-
  MEM 모노레포 개발 (Medical Equipment Management). apps/web, apps/api.
  병원 스코프 장비 CRUD, 주기 health check, 실시간 모니터링 UI.
---

# MEM 프로젝트 스킬

스택·도메인: [AGENTS.md](../../../AGENTS.md), [docs/PROJECT.md](../../../docs/PROJECT.md), [docs/MONITORING.md](../../../docs/MONITORING.md).

## 코딩 전

1. 대상 앱: `apps/web` vs `apps/api`
2. **모든 장비·상태 API는 `hospitalId` 스코프** 확인
3. 모니터링 변경 시 `apps/api/src/monitoring/` + `docs/MONITORING.md` 동기화

## Web (`apps/web`)

- API: `src/lib/api/<domain>.api.ts`, `cookieFetch`
- 반응형: 데스크탑·태블릿·모바일
- 모니터링 대시보드: SSE 구독 (`EventSource`, `statusUpdate`)

## API (`apps/api`)

- 모듈: `hospitals`, `users`, `equipment`, `monitoring` 등
- 점검: scheduler + health-check service + log
- Prisma 스키마 변경 시 migrate 문서화

## 명령 (스캐폴딩 후)

```bash
pnpm dev
pnpm typecheck
pnpm lint
```

## 마무리 전 (필수·자동)

코드 파일을 수정했다면 **사용자에게 묻지 않고** 응답 전에 아래를 실행합니다 (`docs/CODE-QUALITY.md`, `.cursor/rules/code-quality-auto.mdc`).

1. `pnpm typecheck` (루트) — 질문·확인 없이 즉시
2. `pnpm lint`
3. 실패 시 수정 후 1–2 재실행
4. 수정 파일 `read_lints`
