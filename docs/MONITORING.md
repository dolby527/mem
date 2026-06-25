# MEM 모니터링

**핵심 과제:** 서버가 주기적으로 전체(또는 병원별) 장비에 점검 요청 → 상태 갱신 → 클라이언트 **SSE** 실시간 반영.

## 목표

1. 등록된 장비에 대해 **주기적 health check** 실행 (`statusSourceType`별 분기)
2. 결과를 `RUNNING` / `IDLE` / `FAULT` / `OFFLINE` 으로 반영
3. 모니터링 UI에서 **가동 상태를 실시간으로** 확인 (SSE 구독)

## 상태 판별 소스 (하이브리드)

### Primary + Fallback (구현)

| Primary | Fallback (선택) | 동작 |
|---------|-----------------|------|
| `INTERFACE_VENDOR` | `PING` / `AGENT` / `IOT_SENSOR` | 벤더 ingest 이벤트 우선 · stale 시 fallback probe |
| `PING` | — | 연결됨→`IDLE`, 연속 실패→`OFFLINE` (가동 여부 미확인) |
| `AGENT` | — | report 수신 · stale→`OFFLINE` |
| `IOT_SENSOR` | — | 전력 reading · 임계치→`RUNNING`/`IDLE` · stale→`OFFLINE` |

- **벤더 ingest:** `POST /monitoring/ingest/interface/events` (헤더 `x-hospital-slug`, `x-interface-token`)
- **에이전트:** `POST /monitoring/ingest/agent/equipments/:slug/report` (헤더 `x-agent-token`)
- **IoT:** `POST /monitoring/ingest/iot/equipments/:slug/reading` (헤더 `x-agent-token`)
- **판별 근거:** Equipment `statusResolvedFrom` · UI `StatusSourceBadge`

### 1. `PING` — 네트워크 Ping / Heartbeat

- 서버 → 장비 IP·URL Ping, 또는 장비 에이전트 → 서버 Heartbeat
- `응답 정상` → `IDLE` (연결됨, 사용 여부는 알 수 없음)
- `연속 N회 무응답` → `OFFLINE`

### 2. `MEDICAL_PROTOCOL` — HL7 / DICOM / IoT GW

- DICOM C-STORE·전송, HL7 ORM/ORU 등 검사 이벤트 수신
- 검사 시작·전송 중 → `RUNNING`
- 검사 완료 후 대기 → `IDLE`
- 프로토콜 에러·알람 → `FAULT`
- **개발용 시뮬레이터:** [`docs/PROTOCOL-SIMULATOR.md`](./PROTOCOL-SIMULATOR.md) (`pnpm sim:protocol`) — ingest API로 벤더 이벤트 재생

### 3. `IOT_SENSOR` — 전류·전력 센서

- 스마트 플러그 등으로 소비 전력(W) 수집
- `0W` 또는 센서 무응답 → `OFFLINE`
- 대기 전력(임계치 미만) → `IDLE`
- 임계치 이상(모터·레이저 가동) → `RUNNING`
- 비정상 전류 패턴 지속 → `FAULT`

### 4. `AGENT` — 로그·하트비트 에이전트

- 장비 내 데몬이 로그·시스템 상태·에러 코드를 서버에 전송
- Error/Fault/Fatal 키워드 → `FAULT`
- 정상 리포트·가동 신호 → `RUNNING` 또는 `IDLE` (에이전트 규칙에 따름)
- `AGENT_HEARTBEAT_STALE_MS` 초과 무응답 → `OFFLINE`

## 서버 (API — `apps/api/src/monitoring/`)

| 구성요소 | 역할 |
|----------|------|
| `monitoring.scheduler` | cron / interval — `HEALTH_CHECK_INTERVAL_MS` |
| `health-check.service` | `statusSourceType`별 probe, DB 갱신, SSE 이벤트 발행 |
| `sse.controller` | 병원 스코프 SSE 스트림 (`/monitoring/stream`) |
| `monitoring.constants` (또는 `config/monitoring.ts`) | 초·밀리초 단위 타이밍 상수 중앙 관리 |

### 점검 흐름

```
Scheduler tick
  → 병원별 또는 전체 Equipment 목록 조회 (batch)
  → 각 장비: statusSourceType 분기 probe
  → currentStatus + HealthCheckLog 저장
  → 변경 시 SSE로 hospitalId 룸에 broadcast
```

### 분기 예시 (개념)

```typescript
async function checkDeviceStatus(device: Equipment) {
  switch (device.statusSourceType) {
    case 'PING': {
      const alive = await pingService.check(device.ipAddress);
      return alive ? 'IDLE' : 'OFFLINE';
    }
    case 'IOT_SENSOR': {
      const watts = await iotService.getCurrentPower(device.sensorId);
      if (watts === 0) return 'OFFLINE';
      if (watts > device.thresholdPowerW) return 'RUNNING';
      return 'IDLE';
    }
    case 'AGENT': {
      const report = await agentService.getLastReport(device.id);
      if (report.isError) return 'FAULT';
      if (Date.now() - report.timestamp > AGENT_HEARTBEAT_STALE_MS) return 'OFFLINE';
      return report.isRunning ? 'RUNNING' : 'IDLE';
    }
    case 'MEDICAL_PROTOCOL': {
      return medicalProtocolService.deriveStatus(device.id);
    }
  }
}
```

### 실패·재시도

- 일시 실패: `PING_FAILURE_THRESHOLD`회 연속 실패 후 `OFFLINE`
- `MEDICAL_PROTOCOL`·`AGENT` 에러 신호: 즉시 또는 규칙에 따라 `FAULT`
- 동시 전체 probe 방지: `HEALTH_CHECK_BATCH_SIZE`·timeout 준수

## 실시간 전달 (확정: SSE)

| 항목 | 선택 |
|------|------|
| 프로토콜 | **Server-Sent Events (SSE)** |
| 엔드포인트 | `GET /monitoring/stream` (hospitalId는 JWT에서 추출) |
| 이벤트 | `statusUpdate` — `{ equipmentId, status, checkedAt }` |
| 클라이언트 | `EventSource` 또는 fetch-stream 래퍼, 재연결 백오프 |

WebSocket·짧은 폴링은 사용하지 않습니다. 대시보드는 SSE 구독을 기본으로 합니다.

### 실시간 기준

- UI 갱신은 **점검 주기 + SSE push** 조합으로 충분
- “초 단위 SLA”는 코드에 매직 넘버를 두지 않고 **모니터링 상수 모듈·env**로 관리
- 점검 주기 내 변경은 SSE로 즉시 반영; SLA는 `HEALTH_CHECK_INTERVAL_MS` 및 아래 상수로 튜닝

## 타이밍 상수 (중앙 관리)

하드코딩 금지. `apps/api/src/monitoring/monitoring.constants.ts`(가칭) + env 오버라이드.

| 상수 (env 키) | 기본값 (초안) | 설명 |
|---------------|---------------|------|
| `HEALTH_CHECK_INTERVAL_MS` | `30000` (30s) | 스케줄러 점검 주기 |
| `HEALTH_CHECK_BATCH_SIZE` | `50` | tick당 처리 장비 수 |
| `HEALTH_CHECK_TIMEOUT_MS` | `5000` | probe 타임아웃 |
| `PING_FAILURE_THRESHOLD` | `3` | 연속 Ping 실패 → `OFFLINE` |
| `INTERFACE_VENDOR_STALE_MS` | `300000` | 벤더 이벤트 무응답 → fallback 또는 `OFFLINE` |
| `AGENT_HEARTBEAT_STALE_MS` | `60000` | 에이전트 무응답 → `OFFLINE` |
| `IOT_READING_STALE_MS` | `120000` | IoT 읽기 무응답 → `OFFLINE` |
| `SSE_RETRY_MS` | `3000` | 클라이언트 재연결 대기 (Web 참고) |
| `SSE_KEEPALIVE_MS` | `15000` | SSE comment ping 주기 |

병원·장비별 override가 필요해지면 DB 설정 테이블을 추가하되, MVP는 env + 상수 모듈만 사용.

## 데이터

- **현재 상태:** Equipment `currentStatus` (또는 snapshot 테이블)
- **소스 타입:** Equipment `statusSourceType` (`PING` | `MEDICAL_PROTOCOL` | `IOT_SENSOR` | `AGENT`)
- **이력:** `HealthCheckLog` — `checkedAt`, `status`, `latencyMs`, `errorMessage`, `sourceType`

## UI (Web)

- **대시보드:** RUNNING / IDLE / FAULT / OFFLINE 카운트, 필터·정렬
- **목록:** 장비 썸네일(`imageUrl`) + 이름 + **위치(건물·층·실)** + 상태 뱃지 (Green / Blue / Red / Gray). 병원명은 GNB(테넌트 헤더)에만 표시
- **상세:** 장비 이미지·`imageAlt`, 최근 점검 이력 타임라인
- **이미지 없음:** `category_placeholder` 또는 카테고리 기본 아이콘
- **구독:** 마운트 시 SSE 연결, `statusUpdate` 수신 시 로컬 상태 갱신

## MVP 권장 순서

1. 스케줄러 + `PING` probe + `HealthCheckLog`
2. SSE controller + Web 대시보드 구독
3. `AGENT` ingest API (하트비트 수신)
4. `IOT_SENSOR`·`MEDICAL_PROTOCOL` 어댑터 (병원별 연동)

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-08 | 모니터링 요구·구성요소 초안 |
| 2026-06-12 | 하이브리드 소스 타입, 상태 enum, SSE, 타이밍 상수 정책 확정 |
| 2026-06-12 | UI 장비 이미지 필드 (`imageUrl`, `imageAlt`) — 시드 `docs/seed/images/` |
| 2026-06-12 | MVP Phase 2: PING scheduler, `HealthCheckLog`, SSE `/monitoring/stream`, Web `EventSource` |
| 2026-06-12 | Primary+Fallback: `INTERFACE_VENDOR` ingest, Agent/IoT ingest, `statusResolvedFrom` UI |
