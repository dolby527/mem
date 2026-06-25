# MEM UI 디자인 (Vanilla Extract)

**단일 소스:** 이 파일의 `Design tokens` 표를 수정한 뒤 아래 명령으로 코드에 반영합니다.

```bash
pnpm --filter @mem/web tokens
```

생성물: `apps/web/src/styles/generated/tokens.ts` → `theme.css.ts`에서 Vanilla Extract 테마로 사용.

## 원칙

- **스타일:** [Vanilla Extract](https://vanilla-extract.style/) (`*.css.ts`). Tailwind 사용 안 함.
- **토큰:** 이 MD 표 → `generate-design-tokens.mjs` → TypeScript 상수.
- **상태 색:** `docs/PROJECT.md` enum과 동일 (Green / Blue / Red / Gray).
- **반응형:** `breakpoint.md` (768px) 기준 사이드바·그리드 전환.

## Design tokens

토큰 표 형식: `| token | value |` (value는 CSS 값 그대로)

### color

| token | value |
|-------|-------|
| navy | #0f2744 |
| navyLight | #1a3a5c |
| white | #ffffff |
| slate50 | #f8fafc |
| slate100 | #f1f5f9 |
| slate200 | #e2e8f0 |
| slate300 | #cbd5e1 |
| slate400 | #94a3b8 |
| slate500 | #64748b |
| slate600 | #475569 |
| slate700 | #334155 |
| slate800 | #1e293b |
| slate900 | #0f172a |
| running | #16a34a |
| runningBg | #dcfce7 |
| runningBorder | #bbf7d0 |
| runningText | #166534 |
| idle | #2563eb |
| idleBg | #dbeafe |
| idleBorder | #bfdbfe |
| idleText | #1e40af |
| fault | #dc2626 |
| faultBg | #fee2e2 |
| faultBorder | #fecaca |
| faultText | #991b1b |
| offline | #6b7280 |
| offlineBg | #f3f4f6 |
| offlineBorder | #e5e7eb |
| offlineText | #374151 |
| amber50 | #fffbeb |
| amber200 | #fde68a |
| amber800 | #92400e |
| whiteAlpha10 | rgba(255, 255, 255, 0.1) |
| whiteAlpha15 | rgba(255, 255, 255, 0.15) |
| whiteAlpha90 | rgba(255, 255, 255, 0.9) |

### space

| token | value |
|-------|-------|
| 0 | 0 |
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 5 | 20px |
| 6 | 24px |
| 8 | 32px |
| 10 | 40px |
| 12 | 48px |

### radius

| token | value |
|-------|-------|
| sm | 6px |
| md | 8px |
| lg | 12px |
| xl | 16px |
| full | 9999px |

### fontSize

| token | value |
|-------|-------|
| xs | 12px |
| sm | 14px |
| base | 16px |
| lg | 18px |
| xl | 20px |
| 2xl | 24px |
| 3xl | 30px |

### fontWeight

| token | value |
|-------|-------|
| normal | 400 |
| medium | 500 |
| semibold | 600 |

### shadow

| token | value |
|-------|-------|
| sm | 0 1px 2px 0 rgb(0 0 0 / 0.05) |
| md | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) |

### breakpoint

| token | value |
|-------|-------|
| md | 768px |
| lg | 1024px |

### layout

| token | value |
|-------|-------|
| maxWidthPage | 1152px |
| maxWidthDetail | 896px |
| sidebarWidth | 224px |

## 정보 구조 (IA) — 교차 구성

의료진·병원 관리자의 인지 흐름에 맞춰 **위치(공간)** 와 **기능/품목(도메인)** 두 트리를 동시에 제공합니다.

### 1. 위치 중심 (공간형) — 좌측 트리

```
[병원] → [건물/동] → [층/구역] → [부서/실] → [장비]
```

- UI: `/monitoring` 좌측 패널, `?view=spatial` (기본)
- 쿼리: `?loc={hospital}/{building}/{floor}/{room}` (node id)
- 시드 목업: `equipment.location` 문자열에서 건물·층·실 추론 (`lib/navigation/spatial.ts`)

### 2. 기능/품목 중심 (도메인형) — 좌측 트리 (탭 전환)

```
[대분류] → [소분류] → [장비]
```

- UI: `?view=domain` 탭 + 동일 좌측 패널에 분류 트리
- 쿼리: `?domain=imaging&sub=pet-ct`
- 정의: `lib/navigation/domain.ts` (`DOMAIN_GROUPS`)

### 3. 교차 필터 (권장 메인 UX)

| 영역 | 역할 |
|------|------|
| 좌측 트리 | 위치 **또는** 기능 탭으로 뎁스 탐색 |
| 상단 필터바 | 대분류·소분류·가동 상태 (위치와 **AND** 결합) |
| 본문 그리드 | 필터된 장비 카드 |

### 4. 라우팅 (장비 ID 고정)

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 (비로그인) |
| `/dashboard` | 모니터링 대시보드 (상태 요약 · 집계 테이블 · 주의 필요) |
| `/dashboard/equipment` | 장비 현황 — `?category&name&source` 집계 그룹 카드 그리드 |
| `/monitoring` | 교차 모니터링 (트리 + 필터 + 그리드) |
| `/monitoring/equipments/:equipmentId` | 실시간 상세 (트리 진입 경로와 무관) |

- `equipmentId` = 시드 `equipmentSlug` (API 연동 후 DB PK로 교체)
- 구 URL `/equipment/*` → `/monitoring/*` 리다이렉트

### 5. 쿼리 파라미터

| param | 값 | 설명 |
|-------|-----|------|
| `view` | `spatial` \| `domain` | 좌측 트리 모드 |
| `loc` | node id | 위치 트리 선택 |
| `domain` | e.g. `imaging` | 장비 대분류 |
| `sub` | e.g. `ventilator` | 장비 소분류 |
| `status` | `RUNNING` … | 가동 상태 필터 |

## 컴포넌트 (요약)

| 컴포넌트 | 스타일 파일 | 비고 |
|----------|-------------|------|
| AppGnb / AuthenticatedGnb | `AppGnb.css.ts` 등 | 상단 GNB (병원명 + MEM) |
| StatusSummaryLive | `status.css.ts` | 대시보드 5카드, 모니터링 status 링크 |
| DashboardEquipmentOverviewTable | `layout.css.ts` | 집계 테이블, 장비명→장비 현황 |
| DashboardAttentionTable | `layout.css.ts` | 분류·장비명·위치·상태 |
| MonitoringSidebar | `monitoring/layout.css.ts` | 트리 패널 + 본문 |
| LocationTree / DomainTree | `NavigationTree.css.ts` | 좌측 트리 |
| CategoryFilterBar | `CategoryFilterBar.css.ts` | 상단 교차 필터 |
| ViewModeTabs | `ViewModeTabs.css.ts` | 위치 \| 기능 탭 |
| StatusBadge | `status.css.ts` | recipe: status × size |
| EquipmentCard | `EquipmentCard.css.ts` | 장비명 + 위치(건물·층·실) + 상태; 병원명은 GNB |
| HealthCheckTimeline | `status.css.ts` | 점검 이력 |
| 페이지 공통 | `layout.css.ts` | container, heading, table |

## GNB · 테넌트 표시

- 로그인 병원 **단일 스코프** — 장비 카드·목록에 **병원명 미표시**
- GNB(헤더): **병원명** + `MEM(의료장비 관리)` 부제 · 네비(대시보드·모니터링·장비 현황·보전·FAQ·관리) · 우측 **아바타+이름** → `/profile`
- 관리(`HOSPITAL_ADMIN`): `/settings` 하위 탭 — 사용자 관리 · FAQ 관리
- 장비 카드·대시보드 테이블 보조 텍스트: `formatSpatialLabel()` → `건물 · 층 · 실` (`lib/navigation/spatial.ts`, 위치 트리와 동일 추론)

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-12 | DESIGN.md 초안 — Vanilla Extract 토큰 MD 관리 |
| 2026-06-12 | IA 교차 구성 — 위치/도메인 트리, `/monitoring` 라우팅 |
| 2026-06-12 | 장비 카드 — 병원명 제거, 공간 라벨(건물·층·실) 통일 |
| 2026-06-12 | GNB·대시보드·`/dashboard/equipment` — 상태 5카드, 집계/주의 테이블, 헤더 타이틀+우측 «대시보드» |
| 2026-06-12 | GNB 프로필(아바타)·FAQ·관리 메뉴 — `DEV-LOG.md` 참고 |
