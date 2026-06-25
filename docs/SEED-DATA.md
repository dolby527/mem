# MEM 시드 데이터 (개발 단계)

**목적:** Cursor Agent가 인터넷 공개 자료를 조사해 병원·장비 **마스터 데이터 초안**을 만들고, Prisma `seed` 또는 로컬 개발 DB에 반영하기 위한 워크플로.

> 운영 기능이 아님. 앱 내 “자동 장비 수집” API와 무관. 개발·데모·통합 테스트용.

## `evidence` vs `image` (핵심)

| 필드 | 역할 | 예시 URL |
|------|------|----------|
| **`evidence`** | **이 병원에 이 장비가 있다**는 근거 (시드 검증·감사) | 서울아산병원 핵의학과 페이지, Nature 논문 |
| **`image`** | **UI에 보여줄 장비 사진** (모니터링 대시보드) | Siemens/GE/Elekta 제품 페이지, Wikimedia |

- `evidence` URL은 **장비 사진이 아님** — 병원·논문·보도에서 **모델명·보유**를 확인한 출처.
- `image.remoteUrl` / `image.localPath`는 **제품·시설 사진** — `image.sourcePageUrl`은 그 사진의 출처 페이지.
- **운영 DB(Prisma):** `Equipment`에는 `imageUrl`·`imageAlt` 등만 저장. `evidence`는 시드 JSON에만 두거나 별도 `EquipmentEvidence` 테이블로 선택 이관.

## 언제 사용

- `apps/api` 스캐폴딩 **전·후** 모두 가능
- 병원별 주요 장비 공개 정보 리서치 + **실사/제품 이미지** 다운로드
- 모니터링 UI·스케줄러 개발용 준실데이터

## Cursor에서 호출 방법

### 스킬

`.cursor/skills/mem-seed/SKILL.md`

### 프롬프트 예시

```
mem-seed 스킬로 장비 evidence를 보강하고,
node docs/seed/scripts/download-equipment-images.mjs 로 실사 이미지를 동기화해줘.
```

## 워크플로

```
1. 병원 목록 (hospitals.json)
2. Agent: 장비 보유 근거 리서치 → equipment.json (evidence, confidence)
3. node docs/seed/scripts/download-equipment-images.mjs  ← 제품/시설 실사 이미지
4. 사람 검토 (evidence·이미지 라이선스·모델명)
5. Prisma seed 연동 (apps/api 스캐폴딩 후)
```

## 산출물 경로

| 파일 | 내용 |
|------|------|
| `docs/seed/hospitals.json` | 병원 마스터 |
| `docs/seed/equipment.json` | 장비 + `evidence` + `image` |
| `docs/seed/faq.json` | 병원별 FAQ 6건 (`sortOrder`, `question`, `answer`, `isPublished`) |
| `docs/seed/images/equipment/` | 장비별 JPG/PNG (실사·제품 사진) |
| `docs/seed/images/placeholders/` | (예비) 카테고리 fallback |
| `docs/seed/scripts/download-equipment-images.mjs` | 이미지 다운로드·JSON 동기화 |

## 스키마 요약

### Equipment (`equipment.json`)

| 필드 | 필수 | 설명 |
|------|------|------|
| `hospitalSlug` | ✅ | 병원 FK |
| `equipmentSlug` | ✅ | 전역 고유 ID·이미지 파일명 |
| `name`, `category`, `manufacturer`, `model` | | 마스터 |
| `statusSourceType`, `statusSourceTypeReason` | ✅ | 모니터링 probe |
| `currentStatus` | | 시드 초기값 `IDLE` |
| **`evidence`** | ✅ | 장비 **보유 확인** 출처 (아래) |
| **`image`** | ✅ | UI **사진** 메타 (아래) |
| `confidence` | ✅ | evidence 품질 |
| `devProbeHost` | | 개발 전용 |

### `evidence[]` — 장비 보유 근거 (이미지 아님)

| 하위 필드 | 설명 |
|-----------|------|
| `url` | 병원 공식 페이지, 학술 논문, 보도 등 |
| `title` | 출처 제목 |
| `accessedAt` | 조사일 |
| `purpose` | `hospital_or_vendor_page` \| `research_paper` \| `other_public` |

**필요한가?** 시드 단계에서는 **권장** — “왜 이 장비를 넣었는지” 추적. 운영 앱 필수 아님.

### `image` — 모니터링 UI 사진

| 하위 필드 | 설명 |
|-----------|------|
| `alt` | 접근성 |
| `localPath` | `docs/seed/images/equipment/{equipmentSlug}.jpg` |
| `remoteUrl` | 원본 다운로드 URL |
| `kind` | `manufacturer_product` \| `dealer_catalog` \| `wikimedia_commons` |
| `mimeType` | `image/jpeg` 등 |
| `sourcePageUrl` | 사진 출처 페이지 |
| `licenseNote` | 저작권·교체 안내 |

일부 항목은 동일 제품군 사진 공유(예: 여러 PET/CT → GE Discovery 이미지). `licenseNote`에 대표/대체 여부 명시.

## Prisma seed 연동 (스캐폴딩 후)

1. `Hospital` upsert
2. `Equipment` — `imagePath` / `imageUrl` ← `image.localPath` 복사 또는 정적 호스팅
3. `FaqItem` — `docs/seed/faq.json` (`seedFaqItems`, 병원당 동일 6건)
4. `evidence` — 생략 또는 `EquipmentSeedEvidence` (선택)

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-12 | 시드 워크플로·스키마 |
| 2026-06-12 | 병원 3·장비 21 리서치 |
| 2026-06-12 | `sources` → `evidence`, 실사 이미지 다운로드 |
| 2026-06-12 | asan `Dräger Evita Ventilator` 10대 추가 (총 약 30대), 병원별 admin/user 시드 (`test1234!`) |
| 2026-06-12 | `docs/seed/faq.json` + Prisma `seedFaqItems` (병원당 FAQ 6건) |
