# Protocol / Interface 이벤트 시뮬레이터 (개발용)

`MEDICAL_PROTOCOL`(HL7/DICOM) 본구현 전에, **벤더·인터페이스 ingest 경로**로 4상태 파이프라인을 검증하는 CLI입니다.

실제 DB에 직접 넣지 않고 `POST /monitoring/ingest/interface/events`를 호출하므로 `statusEngine` · SSE · 상태 변경 이력이 운영과 동일하게 동작합니다.

## 사전 조건

1. DB + API 실행 (`pnpm db:up`, `pnpm db:seed`, `pnpm dev`)
2. 대상 장비에 `vendorDeviceId`가 등록되어 있어야 함 (`INTERFACE_VENDOR` 또는 `MEDICAL_PROTOCOL` primary)
3. 병원에 interface ingest 토큰이 설정되어 있어야 함 (시드: asan)

시드 예시 (서울아산):

| 항목 | 값 |
|------|-----|
| 장비 slug | `asan-dr-ger-evita-ventilator-01` |
| vendorDeviceId | `ICU-VENT-01` |
| x-hospital-slug | `asan` |
| x-interface-token | `asan-interface-dev-token` |

## 실행

레포 루트에서:

```bash
pnpm sim:protocol -- --help
```

`--` 뒤에 시뮬레이터 인자를 넘깁니다.

### 1) 검사 시작 → 완료 (RUNNING → IDLE)

```bash
pnpm sim:protocol -- \
  --equipment-slug asan-dr-ger-evita-ventilator-01 \
  --scenario exam
```

기본 `--interval-ms` 5000: `EXAM_STARTED` 후 5초 뒤 `EXAM_COMPLETED`.

### 2) 단일 이벤트

```bash
pnpm sim:protocol -- \
  --vendor-device-id ICU-VENT-01 \
  --event EXAM_STARTED
```

### 3) 고장 시나리오 (RUNNING → FAULT)

```bash
pnpm sim:protocol -- \
  --vendor-device-id ICU-VENT-01 \
  --scenario fault
```

### 4) 연결 끊김 (OFFLINE)

```bash
pnpm sim:protocol -- \
  --vendor-device-id ICU-VENT-01 \
  --scenario offline
```

이후 `INTERFACE_VENDOR_STALE_MS`(기본 5분) 동안 이벤트가 없으면 스케줄러가 fallback(PING) 또는 OFFLINE 처리합니다.

### 5) 반복 재생 (데모·UI 확인)

```bash
pnpm sim:protocol -- \
  --vendor-device-id ICU-VENT-01 \
  --scenario cycle \
  --interval-ms 8000
```

`Ctrl+C`로 종료.

### 6) dry-run (API 호출 없이 payload만 확인)

```bash
pnpm sim:protocol -- \
  --vendor-device-id ICU-VENT-01 \
  --event STUDY_STARTED \
  --dry-run
```

## 시나리오 목록

| `--scenario` | 이벤트 흐름 | 기대 상태 |
|--------------|-------------|-----------|
| `exam` (기본) | EXAM_STARTED → EXAM_COMPLETED | RUNNING → IDLE |
| `study` | STUDY_STARTED → STUDY_COMPLETED | RUNNING → IDLE |
| `fault` | EXAM_STARTED → ERROR | RUNNING → FAULT |
| `offline` | DISCONNECTED | OFFLINE |
| `reconnect` | DISCONNECTED → CONNECTED | OFFLINE → IDLE |
| `cycle` | `exam` 반복 | 주기적 RUNNING/IDLE |

이벤트 → 상태 매핑: `apps/api/src/monitoring/vendor-event-mapping.ts`

## 확인 방법

1. **모니터링 UI** — 해당 장비 카드 상태·판별방식·점검 확인 시각
2. **장비 상세** — 상태 변경 이력에 새 항목 (상태가 바뀐 경우만)
3. **SSE** — 대시보드/모니터링 실시간 갱신

## MEDICAL_PROTOCOL과의 관계

| 단계 | 내용 |
|------|------|
| **지금 (시뮬레이터)** | HL7/DICOM **대신** `eventType` 문자열을 ingest API로 전송 |
| **다음 (어댑터)** | HL7 ORU / DICOM 이벤트 파싱 → 동일 `eventType`으로 정규화 |
| **운영** | 병원 MIS/브로커가 ingest API 또는 전용 리스너로 전송 |

시뮬레이터는 본구현 후에도 **회귀 테스트·데모**용으로 유지할 수 있습니다.

## 트러블슈팅

| 증상 | 확인 |
|------|------|
| 401 Unauthorized | `x-interface-token`, `x-hospital-slug` · 시드 후 토큰 일치 |
| 404 vendorDeviceId not mapped | 장비 `vendorDeviceId` · 병원 slug 일치 |
| 상태가 안 바뀜 | 동일 상태 이벤트는 로그/SSE 없음 (의도된 동작) |
| API 연결 실패 | `pnpm dev:api` · `PORT=3001` · `--api-url` |

## 관련 문서

- [`docs/MONITORING.md`](./MONITORING.md) — ingest 엔드포인트·타이밍 상수
- [`docs/SEED-DATA.md`](./SEED-DATA.md) — 시드 장비
