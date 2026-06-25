# MEM — Medical Equipment Management (프로젝트 전용)

병원별 의료 장비 등록·상태 관리. **이 파일에 도메인·API·환경별 내용을 누적**합니다.

## Repository

| 항목 | 값 |
|------|-----|
| GitHub repo name | `mem` |
| 로컬 경로 (예) | `.../mem` |
| 루트 package name | `mem` |
| 워크스페이스 패키지 | `@mem/web`, `@mem/api`, `@mem/eslint-config` |

## 목적

- 각 **병원(Hospital)** 에 대해 의료 **장비(Equipment)** 등록
- 병원 소속 **유저**가 자기 병원 장비만 등록·수정·조회 (데스크탑 / 태블릿 / 모바일 Web)
- 서버가 **주기적으로** 장비 상태를 점검하고, 클라이언트에서 **실시간** 가동 상태 확인

## 테넌트·권한

| 개념 | 설명 |
|------|------|
| **Hospital** | 테넌트. 장비·유저·상태 데이터 격리 단위 |
| **User** | **정확히 1개 병원** 소속. 다중 병원 소속 불가 |
| **Role** | `HOSPITAL_USER`, `HOSPITAL_ADMIN`, `PLATFORM_ADMIN` |

- `HOSPITAL_USER` / `HOSPITAL_ADMIN`: 자기 `hospitalId`만
- `PLATFORM_ADMIN`: 전체 병원 (필요 시, guard 필수)
- User ↔ Hospital: **1:1** (`User.hospitalId` FK, 복수 병원 멤버십 테이블 없음)

## 핵심 엔티티 (초안)

| 엔티티 | 역할 |
|--------|------|
| Hospital | 병원 마스터 |
| User | 병원 소속 계정 (`hospitalId` 단일, 선택 `avatarUrl`) |
| Equipment | 장비 마스터 (이름, 분류, 위치, `statusSourceType`, 연결 정보, **이미지**) |
| FaqItem | 병원별 FAQ (`question`, `answer`, `sortOrder`, `isPublished`) |
| EquipmentStatusSnapshot | 현재 상태 스냅샷 (또는 Equipment 필드) |
| HealthCheckLog | 점검 시각, 결과, 지연, 오류 메시지 |

Prisma 스키마는 다음 세션에서 확정.

## 장비 상태 (확정)

대시보드 UI와 API enum을 아래 4가지로 통일합니다.

| Status | 화면 표시 | 의미 |
|--------|-----------|------|
| `RUNNING` | 가동 중 (Green) | 환자 검사 중 / 전류 임계치 이상 / 에이전트 가동 신호 |
| `IDLE` | 대기 중 (Blue) | 전원은 켜져 있으나 미사용 / 대기 전력 상태 |
| `FAULT` | 고장·에러 (Red) | 장비 자체 에러 로그·하드웨어 알람 |
| `OFFLINE` | 연결 끊김 (Gray) | Ping 무응답 / 에이전트 하트비트 두절 (전원 꺼짐 포함) |

## 상태 판별 소스 (확정 — 하이브리드)

장비마다 `statusSourceType`을 등록하고, 서버 스케줄러가 타입별로 분기 probe 합니다.
모든 장비에 동일한 방식을 강제하지 않습니다.

| `statusSourceType` | 방식 | 판별 요약 |
|--------------------|------|-----------|
| `PING` | 네트워크 Ping / Heartbeat | IP·URL 응답 여부 → `IDLE` 또는 `OFFLINE` |
| `MEDICAL_PROTOCOL` | HL7 / DICOM / IoT GW | 검사 시작·전송 → `RUNNING`, 완료 후 → `IDLE` |
| `IOT_SENSOR` | 스마트 플러그·전류 센서 | 전력량 임계치·패턴 → `RUNNING` / `IDLE` / `FAULT` / `OFFLINE` |
| `AGENT` | 장비 내 경량 에이전트 | 로그·하트비트 리포트 → `RUNNING` / `IDLE` / `FAULT` / `OFFLINE` |

상세 probe 흐름·타이밍: [`docs/MONITORING.md`](./MONITORING.md)

## API 스코프 규칙

- Equipment / status / monitoring API는 **항상 `hospitalId` 필터**
- JWT(또는 세션)의 `hospitalId`와 요청 리소스 일치 검증
- 목록·상세·점검 결과·SSE 스트림 모두 동일 규칙

## 클라이언트

- 반응형 Web: 데스크탑·태블릿·모바일
- **랜딩** `/` · **대시보드** `/dashboard` · **장비 현황** `/dashboard/equipment` · **모니터링** `/monitoring` · **장비 보전** `/maintenance`
- **FAQ** `/faq` (전 사용자) · **내 프로필** `/profile` (아바타·비밀번호)
- **관리** `/settings/*` (`HOSPITAL_ADMIN` 전용) — 사용자 관리 · FAQ 관리
- 대시보드: 상태 요약(5카드, 모니터링 링크) · 전체 장비 현황(집계 테이블) · **주의 필요(FAULT·OFFLINE)** · 장비 현황(품목별 카드)
- 모니터링: 위치/도메인 트리 + 교차 필터 + 장비 카드 · 등록/수정/삭제(병원 관리자)
- 실시간 반영: **SSE** (`docs/MONITORING.md`)
- 세션별 구현 메모: [`docs/DEV-LOG.md`](./DEV-LOG.md)

## 배포 (확정 방향)

| 환경 | 지원 | 비고 |
|------|------|------|
| **AWS EC2** | ✅ | 공개망·VPC 배포 |
| **온프레미스** | ✅ | 병원 내부망 — VPN·에이전트·리버스 프록시 설계 필요 |

Render 등 PaaS는 범위에서 제외. 상세: [`docs/deploy/README.md`](./deploy/README.md)

## 스택 (확정)

| 레이어 | 선택 |
|--------|------|
| Web | Next.js App Router |
| API | NestJS + Prisma + PostgreSQL |
| 주기 점검 | `@nestjs/schedule` (+ 필요 시 Queue) |
| 실시간 | **SSE** (`sse.controller`) |

## 장비 이미지 (모니터링 UI)

| 필드 (Prisma 초안) | 설명 |
|--------------------|------|
| `equipmentSlug` | 안정 식별자 (시드·파일명) |
| `imageUrl` | API/정적 경로 또는 CDN URL |
| `imageAlt` | 접근성 대체 텍스트 |
| `imageKind` | `seed_illustration` \| `category_placeholder` \| `manufacturer_product` \| `hospital_upload` |

- 시드: `docs/seed/images/` + `equipment.json`의 `image` 객체
- 대시보드·목록·상세에서 장비 카드 썸네일로 사용
- 운영: 병원 관리자 업로드 또는 제조사 허가 자산으로 교체 (`docs/SEED-DATA.md`)

## 시드 데이터 (개발)

- Cursor `mem-seed` 스킬·Agent로 공개 자료 기반 병원·장비 마스터 JSON 작성
- 경로: `docs/seed/`, 워크플로: [`docs/SEED-DATA.md`](./SEED-DATA.md)
- Prisma `seed` 연동은 `apps/api` 스캐폴딩 후

## 인증 (구현 — Snack 패턴)

| 항목 | 설명 |
|------|------|
| 로그인 | httpOnly `accessToken` / `refreshToken` |
| 병원 가입 | `POST /auth/signup-hospital` (병원 관리자) |
| 초대 | `HOSPITAL_ADMIN` → invite 링크 가입 |
| `PLATFORM_ADMIN` | 시드 전용 (`platform@mem.dev`), UI 자가가입 없음 |
| 스코프 | JWT `hospitalId` — Equipment·모니터링·FAQ API 전역 |
| 프로필 | `PATCH /users/me/profile` (`avatarUrl`), `PATCH /users/me/password` |
| 병원 멤버 관리 | `HOSPITAL_ADMIN` — `GET/DELETE/PATCH /users/members` (본인 삭제·권한 변경 불가) |
| FAQ | `GET /faq` (공개) · `admin/faq` CRUD (관리자) |

## 미확정 (구현 시 결정)

- [ ] 알림 (이메일 / in-app / 없음)
- [ ] `MEDICAL_PROTOCOL`·`IOT_SENSOR`·`AGENT` 1차 구현 우선순위 (MVP는 `PING` + 스케줄러 골격)
- [ ] 모니터링 status 필터 vs SSE 라이브 상태 정합 (`DEV-LOG.md` 참고)

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-08 | 프로젝트 정의, md·`.cursor` 골격 생성 |
| 2026-06-12 | 상태 enum·소스 타입·SSE·1병원 1유저·EC2/온프레미스 배포·repo 이름 `mem`·시드 워크플로 확정 |
| 2026-06-12 | 인증·GNB·대시보드(상태 요약·장비 현황·주의 필요)·`/dashboard/equipment`·장비 관리 CRUD 가드 — [`DEV-LOG.md`](./DEV-LOG.md) |
| 2026-06-12 | 사용자 관리·FAQ(공개/관리)·GNB 프로필(아바타)·`/profile` — [`DEV-LOG.md`](./DEV-LOG.md) |
