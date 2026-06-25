---
name: mem-seed
description: >-
  MEM 개발 시드: 웹 리서치로 병원별 주요 의료장비 공개 정보 수집,
  docs/seed/hospitals.json·equipment.json 작성. 읽기 전용 조사 또는 JSON 갱신.
---

개발 단계 **시드 데이터** 전담. 운영 모니터링 `AGENT`(장비 데몬)와 무관.

읽는 순서:
1. [docs/SEED-DATA.md](../../../docs/SEED-DATA.md)
2. [docs/PROJECT.md](../../../docs/PROJECT.md) — Equipment 필드·`statusSourceType`·상태 enum
3. `docs/seed/*.json` (있으면)

작업:
1. 사용자가 준 병원 목록으로 **웹 검색** (공개 출처만)
2. 주요 장비 카테고리별 수집 — 모델·제조사·부서(공개 시)
3. `sources[]`, `confidence`, `statusSourceTypeReason` 채우기
4. JSON 저장 + 검토 필요 항목 목록 반환

원칙:
- `confidence: low` 항목은 반드시 보고
- IP·시리얼 추정 금지
- 병원 스코프: 항목마다 `hospitalSlug` 명시

스캐폴딩 후: `apps/api/prisma/seed.ts` 연동은 `mem-api`와 협업.
