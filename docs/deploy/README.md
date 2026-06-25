# MEM 배포

MEM은 **AWS EC2**, **온프레미스(병원 내부망)**, **Render(데모/스테이징)** 배포를 지원합니다.

## 공통 요구사항

| 항목 | 설명 |
|------|------|
| Node | 24.14.0 (`.nvmrc`) |
| DB | PostgreSQL (EC2 RDS 또는 온프레미스 인스턴스) |
| `JWT_SECRET` | Web·API 동일 값 필수 |
| Secrets | `apps/*/env/.env.production` 커밋 금지 |

## 배포 옵션

| 문서 | 환경 | 요약 |
|------|------|------|
| [RENDER.md](./RENDER.md) | Render | 데모 URL, Blueprint `render.yaml`, 시드·시뮬레이션 헬스체크 |
| [EC2.md](./EC2.md) | AWS EC2 | VPC, ALB, RDS, systemd 또는 Docker |
| [ON-PREMISE.md](./ON-PREMISE.md) | 병원 내부망 | VPN, 에이전트, 리버스 프록시, air-gap 고려 |

## 아키텍처 차이

```
[EC2]
  Internet → ALB → Web (Next) + API (Nest) → RDS PostgreSQL
  장비(PING): API가 공인/VPC IP로 probe

[온프레미스]
  병원 내부망 → Web + API (동일 서버 또는 분리) → 로컬 PostgreSQL
  장비 probe: 내부 IP 직접 접근
  외부 SaaS 불가 시: 에이전트가 Heartbeat를 API로 push (AGENT / PING 역방향)
```

## 모니터링·네트워크

- **PING** probe: API 서버가 장비 네트워크에 도달 가능해야 함
- 내부망만 있는 장비: `AGENT`가 API(또는 게이트웨이)로 Heartbeat 전송
- HL7/DICOM: 병원 MIS·PACS와 동일 세그먼트 또는 메시지 브로커 연동
- 상세 probe 설계: [`docs/MONITORING.md`](../MONITORING.md)

## 문서 상태

| 파일 | 상태 |
|------|------|
| README.md | 확정 (플랫폼 선택) |
| RENDER.md | 데모 Blueprint (`render.yaml`) |
| EC2.md | 골격 (구현·인프라 확정 후 상세화) |
| ON-PREMISE.md | 골격 (VPN·에이전트 확정 후 상세화) |
