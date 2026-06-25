# MEM — AWS EC2 배포

> 골격 문서. 인스턴스 스펙·도메인 확정 후 절차를 보강합니다.

## 권장 구성

| 컴포넌트 | 권장 |
|----------|------|
| Web | EC2 또는 별도 인스턴스 — Next.js (`pnpm build` + `next start` 또는 Node PM2) |
| API | EC2 — NestJS (`node dist/main`) |
| DB | Amazon RDS PostgreSQL |
| TLS | ALB + ACM 또는 Nginx + Let's Encrypt |
| 장비 probe | API가 VPC/보안그룹으로 장비 IP·URL 접근 허용 |

## 네트워크

- API → 장비 **PING** probe: 보안그룹 아웃바운드 ICMP/TCP 허용
- Web → API: 동일 VPC 내부 또는 ALB 경유
- SSE: ALB idle timeout ≥ `SSE_KEEPALIVE_MS` (기본 15s, [`MONITORING.md`](../MONITORING.md) 참고)

## 환경 변수 (예시)

- API: `DATABASE_URL`, `JWT_SECRET`, `HEALTH_CHECK_INTERVAL_MS`, …
- Web: `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, …

파일 위치: `apps/api/env/.env.production`, `apps/web/env/.env.production` (gitignore)

## 체크리스트 (배포 시)

- [ ] RDS 마이그레이션 (`prisma migrate deploy`)
- [ ] Web·API `JWT_SECRET` 일치
- [ ] 헬스체크 대상 장비 IP 대역 라우팅·방화벽
- [ ] SSE 스트림 프록시 버퍼링 비활성 (Nginx `proxy_buffering off` 등)
