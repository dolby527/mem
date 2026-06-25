# Render 배포 (데모 / 스테이징)

로컬과 동일한 UI·시드 데이터·모니터링을 **공개 URL**로 보여줄 때 사용합니다.  
실서비스(EC2·온프레미스)는 [EC2.md](./EC2.md), [ON-PREMISE.md](./ON-PREMISE.md)를 참고하세요.

## 아키텍처

```
브라우저
  └─ mem-web.onrender.com (Next.js)
        ├─ /api/seed-image/*     → 시드 이미지 (repo 내 docs/seed)
        └─ /mem-api/*  (proxy)   → mem-api.onrender.com (NestJS)
              └─ PostgreSQL (`mem-db` — Blueprint 또는 Dashboard)
```

- **인증 쿠키**: Web이 `/mem-api`로 API를 프록시해 **같은 도메인**에서 쿠키가 동작합니다.
- **헬스체크**: 실제 병원망 IP가 없으므로 `HEALTH_CHECK_SIMULATE=true` (시드 장비 상태·모니터링 데모).
- **시드 이미지**: Web 서비스가 `docs/seed/images`를 서빙 — 로컬과 동일.
- **앱에서 업로드한 장비 이미지**: Render 디스크는 휘발성·Web/API 분리라 **데모에서는 비권장** (시드 장비 위주로 시연).

## 1. PostgreSQL (`mem-db`)

Blueprint `render.yaml`에 **`mem-db`** 가 포함됩니다. Sync 시 기존 DB와 연결되거나 새로 생성됩니다.

로그에 아래가 보이면 **mem-api가 DB에 연결되지 않은 것**입니다. 로그인이 되지 않습니다.

```
Environment variable not found: DATABASE_URL
```

### 즉시 조치 (가장 빠름)

1. Dashboard → **PostgreSQL** → **`mem-db`** (또는 보유 중인 Postgres)
2. **Connections** → **Internal Database URL** 복사
3. **mem-api** → **Environment** → `DATABASE_URL` 붙여넣기 → **Save**
4. **mem-api** → **Manual Deploy**

| 상황 | 조치 |
|------|------|
| `mem-db`가 Dashboard에 있음 | Internal URL을 `DATABASE_URL`에 설정 |
| `cannot have more than one active free tier database` | 새 DB 생성 불가 — **기존 DB URL** 사용 |
| Postgres 목록이 비어 있음 | Blueprint **Sync**로 `mem-db` 생성 |

## 2. Blueprint로 배포

1. [Render](https://render.com) → Blueprint **Sync** (최신 `main`)
2. `DATABASE_URL`이 자동 연결됐는지 **mem-api → Environment**에서 확인
3. 배포 후 **mem-web** URL 확인

### 배포 후 env 수동 설정 (mem-api)

**mem-api → Environment**에서 추가·확인:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Postgres Internal URL (필수) |
| `CORS_ORIGIN` | mem-web URL (예: `https://mem-web-xxxx.onrender.com`) |
| `FRONTEND_URL` | mem-web URL (초대 링크용) |

저장 후 **mem-api**만 재배포합니다.

## 3. DB·시드

Free tier는 `preDeployCommand`를 지원하지 않습니다. 대신 **mem-api 시작 시** 스키마 반영·시드가 실행됩니다 (`start:render`).

```bash
prisma db push && tsx prisma/seed.ts && node dist/main.js
```

시드는 upsert라 재시작·재배포해도 안전합니다.

### 데모 로그인

| 계정 | 비밀번호 |
|------|----------|
| `admin@asan.dev` | `test1234!` |

(시드에 정의된 병원 관리자 — [SEED-DATA.md](../SEED-DATA.md))

## 4. 로컬 vs Render env

| 변수 | 로컬 | Render (mem-web) | Render (mem-api) |
|------|------|------------------|------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | `/mem-api` | — |
| `API_INTERNAL_URL` | — | API `RENDER_EXTERNAL_URL` | — |
| `JWT_SECRET` | 동일 값 | `mem-shared` 그룹 | `mem-shared` 그룹 |
| `DATABASE_URL` | docker Postgres | — | Render Postgres |
| `HEALTH_CHECK_SIMULATE` | `true` (dev) | — | `true` |

로컬은 `apps/*/env/.env.development` (gitignore). Render는 Dashboard env만 사용합니다.

## 5. Free tier 참고

- **Postgres**: 계정당 Free DB **1개** — Blueprint가 DB를 자동 생성하지 않음
- **슬립**: 15분 비활성 후 첫 요청 시 콜드 스타트 (수십 초)
- **Postgres free**: 90일 후 만료 — 데모만 장기 운영 시 유료 플랜 또는 외부 DB 검토
- **디스크**: 업로드 파일은 재배포 시 사라질 수 있음

## 6. 트러블슈팅

| 증상 | 확인 |
|------|------|
| **Build failed** (status 1) | `NODE_ENV=production`이면 `pnpm install`이 devDeps 생략 → `render.yaml`은 `--prod=false` + `NODE_ENV`는 start 시에만 설정 |
| Blueprint DB 생성 실패 | Free Postgres 1개 제한 — 기존 DB URL을 `DATABASE_URL`에 연결 |
| 로그인 후 바로 로그아웃 | `JWT_SECRET` Web·API 동일한지, `mem-shared` 그룹 연결 여부 |
| **로그인 중…에서 멈춤** | mem-api 슬립(콜드 스타트 30~60초) · `API_INTERNAL_URL` = `hostport` · mem-api 로그 |
| API 502 / 타임아웃 | mem-api 로그, DB `DATABASE_URL`, 시작 시 `db push`/seed 성공 여부 |
| 모니터링 실시간 안 됨 | `/mem-api/monitoring/stream` — mem-api 가동·로그인 세션 |
| 이미지 안 보임 (시드) | Web 로그, `docs/seed/images` 경로 |
| 초대 링크 깨짐 | `FRONTEND_URL` = mem-web URL |

## 7. 수동 서비스 생성 (Blueprint 없이)

동일하게 **Web 2개 + Postgres 1개**를 만들고 [render.yaml](../../render.yaml)의 `buildCommand`, `startCommand`, `envVars`를 복사하면 됩니다.

## 관련 코드

- API 프록시: `apps/web/src/app/mem-api/[...path]/route.ts` (런타임 `API_INTERNAL_URL`)
- API URL: `apps/web/src/lib/api/config.ts`
- 미들웨어 제외: `apps/web/src/middleware.ts` (`/mem-api`)
