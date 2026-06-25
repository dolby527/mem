# Render 배포 (데모 / 스테이징)

로컬과 동일한 UI·시드 데이터·모니터링을 **공개 URL**로 보여줄 때 사용합니다.  
실서비스(EC2·온프레미스)는 [EC2.md](./EC2.md), [ON-PREMISE.md](./ON-PREMISE.md)를 참고하세요.

## 아키텍처

```
브라우저
  └─ mem-web.onrender.com (Next.js)
        ├─ /api/seed-image/*     → 시드 이미지 (repo 내 docs/seed)
        └─ /mem-api/*  (rewrite) → mem-api.onrender.com (NestJS)
              └─ PostgreSQL (Render managed)
```

- **인증 쿠키**: Web이 `/mem-api`로 API를 프록시해 **같은 도메인**에서 쿠키가 동작합니다.
- **헬스체크**: 실제 병원망 IP가 없으므로 `HEALTH_CHECK_SIMULATE=true` (시드 장비 상태·모니터링 데모).
- **시드 이미지**: Web 서비스가 `docs/seed/images`를 서빙 — 로컬과 동일.
- **앱에서 업로드한 장비 이미지**: Render 디스크는 휘발성·Web/API 분리라 **데모에서는 비권장** (시드 장비 위주로 시연).

## 1. Blueprint로 배포

1. [Render](https://render.com) 가입 후 GitHub 연동
2. **New → Blueprint**
3. 저장소 `dolby527/mem` 선택 → `render.yaml` 적용
4. 첫 배포가 끝나면 **mem-web** URL 확인 (예: `https://mem-web-xxxx.onrender.com`)

### 배포 후 env 수동 설정 (mem-api)

Blueprint가 `CORS_ORIGIN`, `FRONTEND_URL`은 비워 둡니다. **mem-api → Environment**에서 추가:

| Key | Value |
|-----|--------|
| `CORS_ORIGIN` | mem-web URL (예: `https://mem-web-xxxx.onrender.com`) |
| `FRONTEND_URL` | mem-web URL (초대 링크용) |

저장 후 **mem-api**만 재배포합니다.

## 2. DB·시드

`render.yaml`의 `preDeployCommand`가 매 배포마다 실행합니다:

```bash
pnpm --filter @mem/api db:deploy   # prisma db push + seed
```

시드는 upsert라 재실행해도 안전합니다.

### 데모 로그인

| 계정 | 비밀번호 |
|------|----------|
| `admin@asan.dev` | `test1234!` |

(시드에 정의된 병원 관리자 — [SEED-DATA.md](../SEED-DATA.md))

## 3. 로컬 vs Render env

| 변수 | 로컬 | Render (mem-web) | Render (mem-api) |
|------|------|------------------|------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | `/mem-api` | — |
| `API_INTERNAL_URL` | — | API `RENDER_EXTERNAL_URL` | — |
| `JWT_SECRET` | 동일 값 | `mem-shared` 그룹 | `mem-shared` 그룹 |
| `DATABASE_URL` | docker Postgres | — | Render Postgres |
| `HEALTH_CHECK_SIMULATE` | `true` (dev) | — | `true` |

로컬은 `apps/*/env/.env.development` (gitignore). Render는 Dashboard env만 사용합니다.

## 4. Free tier 참고

- **슬립**: 15분 비활성 후 첫 요청 시 콜드 스타트 (수십 초)
- **Postgres free**: 90일 후 만료 — 데모만 장기 운영 시 유료 플랜 또는 외부 DB 검토
- **디스크**: 업로드 파일은 재배포 시 사라질 수 있음

## 5. 트러블슈팅

| 증상 | 확인 |
|------|------|
| 로그인 후 바로 로그아웃 | `JWT_SECRET` Web·API 동일한지, `mem-shared` 그룹 연결 여부 |
| API 502 / 타임아웃 | mem-api 로그, DB `DATABASE_URL`, `preDeployCommand` 성공 여부 |
| 모니터링 실시간 안 됨 | `/mem-api/monitoring/stream` — mem-api 가동·로그인 세션 |
| 이미지 안 보임 (시드) | Web 로그, `docs/seed/images` 경로 |
| 초대 링크 깨짐 | `FRONTEND_URL` = mem-web URL |

## 6. 수동 서비스 생성 (Blueprint 없이)

동일하게 **Web 2개 + Postgres 1개**를 만들고 [render.yaml](../../render.yaml)의 `buildCommand`, `startCommand`, `envVars`를 복사하면 됩니다.

## 관련 코드

- API 프록시: `apps/web/next.config.ts` (`/mem-api` rewrite)
- API URL: `apps/web/src/lib/api/config.ts`
- 미들웨어 제외: `apps/web/src/middleware.ts` (`/mem-api`)
