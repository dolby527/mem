# MEM 개발 세션 로그

에이전트·개발자가 **이어서 작업할 때** 누락 방지용 누적 메모. 상세 도메인은 [`PROJECT.md`](./PROJECT.md), UI는 [`DESIGN.md`](./DESIGN.md).

---

## 2026-06-12 — 사용자 관리·FAQ·프로필

### GNB·라우팅 (갱신)

| 경로 | 설명 |
|------|------|
| `/faq` | FAQ 아코디언 (전 로그인 사용자, 병원 스코프) |
| `/profile` | 내 프로필 — 아바타 URL·비밀번호 변경 |
| `/settings/users` | 사용자 관리 (`HOSPITAL_ADMIN`) |
| `/settings/faq` | FAQ 관리 CRUD (`HOSPITAL_ADMIN`) |
| `/settings/invite` | → `/settings/users` 리다이렉트 (레거시) |

- **GNB** (`AuthenticatedGnb`): 대시보드·모니터링·장비 현황·장비 보전·FAQ·(관리자) **관리**
- GNB 우측: **아바타 + 이름** → `/profile` (모바일은 아바타만)
- **관리** 레이아웃: 하위 탭 **사용자 관리** \| **FAQ 관리** (`settings/layout.tsx`)
- `middleware`: `/settings/*` → `HOSPITAL_ADMIN` 아니면 `/unauthorized`
- 모바일 `AppBottomNav`: FAQ·(관리자) 관리 탭 포함

### 사용자 관리 (`/settings/users`)

| 기능 | API | 비고 |
|------|-----|------|
| 멤버 목록 | `GET /users/members` | `PLATFORM_ADMIN` 제외 |
| 초대 | `POST /invite` | 모달에서 생성 |
| 권한 변경 | `PATCH /users/members/:userId/role` | 본인 불가 |
| 계정 삭제 | `DELETE /users/members/:userId` | soft delete, 본인 불가 |

- UI: 검색·페이지네이션(6명/페이지)·케밥 메뉴(권한 변경/삭제)
- Snack 패턴: 자기 계정에 대한 삭제·역할 변경 차단

### FAQ

| 구분 | 경로·API |
|------|----------|
| 공개 조회 | `GET /faq` · Web `/faq` |
| 관리 CRUD | `GET/POST/PATCH/DELETE /admin/faq` · Web `/settings/faq` |

- 답변 줄바꿈: `white-space: pre-wrap` (Enter 유지)
- 관리 목록: 6건 이하 내부 스크롤 없음, 초과 시 스크롤 · 케밥 포털 드롭다운
- 시드: `docs/seed/faq.json` — 병원당 6건 (`seedFaqItems` in `prisma/seed.ts`)

### 프로필 (`/profile`)

| 항목 | API | 비고 |
|------|-----|------|
| 아바타 | `PATCH /users/me/profile` `{ avatarUrl }` | HTTPS URL 또는 `null`(이니셜) |
| 비밀번호 | `PATCH /users/me/password` | 8자 이상, 확인 일치 |
| 세션 | `GET /users/me` | `avatarUrl` 포함 |

- Prisma: `User.avatarUrl String?`
- UI: `ProfileAvatar` (이미지 또는 이름 첫 글자) — GNB·프로필 페이지 공용
- 파일 업로드 미구현 — URL 방식만

### 주요 파일 인덱스

| 영역 | 경로 |
|------|------|
| GNB 프로필 링크 | `apps/web/src/components/layout/AuthenticatedGnb.tsx` |
| 프로필 페이지 | `apps/web/src/components/profile/ProfilePage.tsx` |
| 사용자 관리 | `apps/web/src/components/settings/users/` |
| FAQ 관리 | `apps/web/src/components/settings/faq/` |
| 공개 FAQ | `apps/web/src/components/faq/FaqPage.tsx` |
| API 클라이언트 | `profile.api.ts`, `users.api.ts`, `faq.api.ts`, `faqAdmin.api.ts` |
| Users API | `apps/api/src/users/users.controller.ts` |
| FAQ API | `apps/api/src/faq/` |

---

## 2026-06-12 — 인증·GNB·대시보드·장비 현황

### 로컬 개발

```bash
pnpm dev                    # web + api
pnpm db:seed                # 시드 재적용 시
pnpm prisma:studio          # 루트 스크립트 → @mem/api
pnpm typecheck && pnpm lint # 변경 마무리 필수
```

**테스트 계정 (asan):** `admin@asan.dev` / `test1234!`  
병원별 `운영자`(HOSPITAL_ADMIN) + `사용자`(HOSPITAL_USER) 시드.  
플랫폼: `platform@mem.dev` (시드 전용, UI 가입 없음).

---

### 인증·권한 (Snack 패턴 구현 완료)

| 항목 | 구현 |
|------|------|
| 로그인 | `POST /auth/login`, httpOnly 쿠키 |
| 병원 최초 가입 | `POST /auth/signup-hospital` (병원 관리자) |
| 초대 | `HOSPITAL_ADMIN` → `POST /invite`, `/signup/[inviteId]` |
| Web | `middleware.ts` JWT, `AuthProvider`, `cookieFetch` |
| 장비 CUD | `EquipmentManageGuard` — `HOSPITAL_ADMIN` / `PLATFORM_ADMIN` |

**API:** `apps/api/src/auth/`, `invite/`, `users/`  
**Web:** `app/(auth)/`, `providers/AuthProvider.tsx`, `lib/api/*.api.ts`

---

### 레이아웃·라우팅

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 (비로그인). 로그인·병원 관리자 가입만 |
| `/dashboard` | **모니터링 대시보드** (로그인 후 홈, `APP_HOME`) |
| `/dashboard/equipment` | **장비 현황** — 대시보드 집계 행별 카드 목록 |
| `/monitoring` | 실시간 모니터링 (트리 + 필터 + 카드) |
| `/monitoring/equipments/:id` | 장비 상세 |
| `/settings/users` | 병원 관리자 — 사용자 관리·초대 (구 `/settings/invite` 리다이렉트) |

- **GNB** 상단 네비 (`AppGnb`, `AuthenticatedGnb`, `GuestGnb`). 사이드바 제거.
- GNB: 병원명(크게) + `MEM(의료장비 관리)` 하단. `PLATFORM_ADMIN`은 API로 병원명.
- 모바일 하단 `AppBottomNav`: 대시보드·모니터링·장비 현황·보전·FAQ·(관리자) 관리.
- 상세 GNB·FAQ·프로필·관리 메뉴: 위 **「사용자 관리·FAQ·프로필」** 섹션 참고.

---

### 대시보드 (`/dashboard`)

구성 (위→아래):

1. **상태 요약** — `StatusSummaryLive`  
   - 카드 5개: **전체** + RUNNING / IDLE / FAULT / OFFLINE  
   - SSE 실시간 집계  
   - 각 카드 → `/monitoring` 또는 `/monitoring?status=…`  
   - 모니터링 `CategoryFilterBar` **가동 상태** 필터와 동일 조건

2. **전체 장비 현황** — `DashboardEquipmentOverviewTable`  
   - 집계: `category` + `name` + `statusSourceType`  
   - 컬럼: 분류 · 장비명 · 개수 · 판별  
   - 동일 분류 연속 행: 분류는 첫 행만, 구분선은 장비명 열부터  
   - **장비명 링크** → `dashboardEquipmentGroupPath()` → 장비 현황 페이지

3. **주의 필요** — `DashboardAttentionTable`  
   - 컬럼: **분류 · 장비명 · 위치 · 상태 · 발생/확인시간 · 재확인**  
   - **FAULT / OFFLINE** 만 표시, SSE 반영  
   - 장비명 → 장비 상세

4. 다음 단계 info 박스 (로드맵 메모)

**집계 로직:** `lib/equipment/aggregate-overview.ts`  
- `aggregateEquipmentOverview`, `filterEquipmentOverviewGroup`, `matchesOverviewGroup`

---

### 장비 현황 (`/dashboard/equipment`)

**쿼리 (필수):**

| param | 예 | 설명 |
|-------|-----|------|
| `category` | `VENTILATOR` | `EquipmentCategory` enum |
| `name` | URL-encoded 장비명 | 집계 키 |
| `source` | `PING` | `statusSourceType` |

잘못된 쿼리 → `/dashboard` 리다이렉트.

**UI:**

- 헤더 한 줄: 왼쪽 `장비 현황` (pageTitle) · 오른쪽 `← 대시보드` (linkAccent)
- 그 아래: **장비명** (sectionTitle)
- 부제: 분류 · 판별 · N대
- 본문: 모니터링과 동일 `EquipmentCard` 그리드 (`gridCards`)

**경로 헬퍼:** `lib/navigation/paths.ts` — `dashboardEquipmentGroupPath`, `DASHBOARD_EQUIPMENT_BASE`

---

### 장비 관리 UI

- 목록·카드·상세: 케밥 메뉴 **수정 / 삭제** (`EquipmentManageActions`)
- 삭제 확인 모달 (`DeleteEquipmentDialog`)
- 등록: `/monitoring/equipments/new`

---

### 시드 데이터 (2026-06-12)

- 병원 3곳, 장비 **약 30대** (`pnpm db:seed` 후)
- asan: `Dräger Evita Ventilator` **10대** (`asan-dr-ger-evita-ventilator-01` … `-10`, 동일 이미지)
- JSON: `docs/seed/equipment.json`, 이미지: `docs/seed/images/equipment/`
- **참고:** 예전 단일 slug `asan-dr-ger-evita-ventilator`(접미사 없음)가 DB에 남아 있을 수 있음 → Prisma Studio에서 수동 삭제 가능

---

### 주요 파일 인덱스

| 영역 | 경로 |
|------|------|
| 대시보드 페이지 | `apps/web/src/app/(app)/dashboard/page.tsx` |
| 장비 현황 페이지 | `apps/web/src/app/(app)/dashboard/equipment/page.tsx` |
| 상태 요약 | `apps/web/src/components/StatusSummaryLive.tsx` |
| 장비 현황 테이블 | `apps/web/src/components/DashboardEquipmentOverviewTable.tsx` |
| 주의 필요 테이블 | `apps/web/src/components/DashboardAttentionTable.tsx` |
| 상태 카드 스타일 | `apps/web/src/styles/status.css.ts` (5열, `ALL` variant) |
| 집계 | `apps/web/src/lib/equipment/aggregate-overview.ts` |
| 모니터링 필터 링크 | `apps/web/src/components/monitoring/CategoryFilterBar.tsx` |
| 하단 네비 활성 | `AppBottomNav` — `/dashboard/*` 대시보드 탭 활성 |

---

### 알려진 제한·미구현

- 모니터링 **서버 필터**는 `demoStatus`; 카드·대시보드는 **SSE 라이브 상태** — 필터와 카드 표시가 어긋날 수 있음 (기존 이슈).
- `MEDICAL_PROTOCOL` / `IOT_SENSOR` / `AGENT` probe 어댑터 미구현 (MVP: PING + 스케줄러).
- 알림(in-app / email) 미정.

---

### 다음 작업 후보

- [ ] 모니터링 status 필터를 라이브 상태 기준으로 통일 (클라이언트 필터 또는 API)
- [ ] AGENT ingest API
- [ ] `AGENTS.md` / 배포 env 예시 정리

---

## 변경 이력 (이 파일)

| 날짜 | 내용 |
|------|------|
| 2026-06-12 | 사용자 관리·FAQ·프로필(아바타)·GNB 갱신 |
| 2026-06-12 | 인증·GNB·대시보드·장비 현황 세션 정리 |
| 2026-06-12 | 주의 필요: FAULT·OFFLINE만 (RUNNING 제외) |
