---
name: mem-deploy
description: >-
  MEM 배포·env 트러블슈팅. EC2·온프레미스. docs/deploy 문서와 함께 사용.
---

# MEM 배포 스킬

지원 플랫폼: **AWS EC2**, **온프레미스(병원 내부망)**. Render 등 PaaS는 범위 외.

## 문서

- [docs/deploy/README.md](../../../docs/deploy/README.md) — 개요
- [docs/deploy/EC2.md](../../../docs/deploy/EC2.md)
- [docs/deploy/ON-PREMISE.md](../../../docs/deploy/ON-PREMISE.md)

## 공통

- `JWT_SECRET` Web/API 동일
- `apps/*/env/.env.production` 커밋 금지
- `NEXT_PUBLIC_*` 변경 시 Web 재빌드

## EC2

- ALB SSE idle timeout, RDS `DATABASE_URL`
- API → 장비 PING: 보안그룹·VPC 라우팅

## 온프레미스

- 폐쇄망: `AGENT` Heartbeat(장비→API) 우선 검토
- PING 불가 장비는 `statusSourceType`·네트워크 패턴 문서화
- VPN은 정책 허용 시만

## 모니터링 env

- `HEALTH_CHECK_INTERVAL_MS`, `HEALTH_CHECK_TIMEOUT_MS`, `PING_FAILURE_THRESHOLD`
- 상세: [docs/MONITORING.md](../../../docs/MONITORING.md)
