---
name: mem-monitoring
description: >-
  MEM 핵심 과제: 주기 장비 health check, 하이브리드 statusSourceType,
  RUNNING/IDLE/FAULT/OFFLINE, HealthCheckLog, SSE 실시간 push, 대시보드 집계.
---

장비 **가동 모니터링** 전담.

읽는 순서:
1. [docs/MONITORING.md](../../../docs/MONITORING.md)
2. [docs/PROJECT.md](../../../docs/PROJECT.md) 상태 enum·소스 타입
3. `apps/api/src/monitoring/` (생성 후)

설계 시 명시:
- `statusSourceType`별 probe (`PING`, `MEDICAL_PROTOCOL`, `IOT_SENSOR`, `AGENT`)
- 타이밍 상수: `monitoring.constants.ts` + env (매직 넘버 금지)
- 실시간: **SSE** only (`/monitoring/stream`, `statusUpdate`)
- 실패 → `OFFLINE` / `FAULT` 규칙 (`PING_FAILURE_THRESHOLD`, 에이전트 stale)

병원 스코프 누수 없이 dashboard·SSE stream API 설계.
