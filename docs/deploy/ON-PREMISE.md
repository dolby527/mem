# MEM — 온프레미스 배포 (병원 내부망)

> 골격 문서. VPN·에이전트·보안 정책 확정 후 상세화합니다.

## 사용 시나리오

- 장비·PACS·HIS가 **병원 폐쇄망**에만 존재
- 외부 클라우드 API가 장비 IP에 직접 Ping 불가
- 데이터가 병원 밖으로 나가면 안 되는 규정

## 권장 구성

| 컴포넌트 | 배치 |
|----------|------|
| Web + API | 병원 DMZ 또는 내부 서버 (단일 또는 분리) |
| PostgreSQL | 동일망 DB 서버 |
| 장비 에이전트 | `AGENT` / 역방향 Heartbeat — 장비 또는 게이트웨이에 설치 |
| HL7/DICOM | 내부 브로커·MIS 연동 (`MEDICAL_PROTOCOL`) |

## 네트워크 패턴

### A) 전체 내부 배포 (권장)

```
[병원 내부망]
  Web/API/DB ──직접──► 장비 IP (PING)
  Web/API ◄── HL7/DICOM ── PACS/HIS
  클라이언트(태블릿/PC) ──► Web (내부 DNS)
```

### B) 하이브리드 (원격 관리 필요 시)

```
[병원] 에이전트/게이트웨이 ──VPN/터널──► [EC2 API] (선택)
```

- 폐쇄망 정책이 허용할 때만 VPN
- Heartbeat는 **장비 → API** 방향(`AGENT`)으로 설계하면 인바운드 포트 개방 최소화

## 보안·운영

- `apps/*/env/.env.production` — 병원별 로컬 관리, git 미포함
- 에이전트 바이너리 서명·버전 관리 (추후)
- 오프라인 업데이트·백업 절차 (추후)

## 체크리스트 (배포 시)

- [ ] API가 장비 대역 전체에 라우팅 가능 (패턴 A)
- [ ] PING 불가 장비는 `statusSourceType=AGENT` + Heartbeat URL 등록
- [ ] SSE: 내부 프록시 버퍼링·타임아웃 (`docs/MONITORING.md` 상수 참고)
- [ ] PostgreSQL 백업·복구 (병원 IT 정책)
