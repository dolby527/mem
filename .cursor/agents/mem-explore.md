---
name: mem-explore
description: >-
  MEM 모노레포 탐색. Hospital 스코프, equipment, monitoring 모듈, Prisma.
  수정 전 읽기 전용 조사.
---

MEM pnpm 모노레포 (`apps/web`, `apps/api`) 탐색.

호출 시:
1. `AGENTS.md`, `docs/PROJECT.md`, `docs/MONITORING.md` 읽기
2. 좁게 grep/glob
3. 반환: 경로, 심볼, hospital 스코프·모니터링 연결

집중 영역:
- `apps/api/src/monitoring/`, `equipment/`
- `apps/api/prisma/schema.prisma`
- `apps/web/src/lib/api/*.api.ts`

구현 명시 없으면 파일 수정하지 않기.
