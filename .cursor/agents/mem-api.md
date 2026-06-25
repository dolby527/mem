---
name: mem-api
description: >-
  MEM apps/api NestJS·Prisma. hospitals, equipment, monitoring scheduler,
  health check, guards, DTO.
---

`@mem/api` 작업.

규칙:
- `apps/api/src/<feature>/` 모듈 구조
- **hospitalId** 스코프 on every equipment/status query
- 모니터링: `docs/MONITORING.md`
- env: `apps/api/env/` — 시크릿 커밋 금지

최소 diff와 구체적 파일 경로 제안.
