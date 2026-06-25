---
name: mem-seed
description: >-
  MEM 개발용 시드 데이터. 웹 리서치로 병원별 주요 의료장비 공개 정보를 수집하고
  docs/seed/*.json을 작성·갱신. Prisma seed 연동 전 마스터 데이터 초안.
---

# MEM 시드 데이터 (개발)

도메인: [docs/PROJECT.md](../../../docs/PROJECT.md), [docs/SEED-DATA.md](../../../docs/SEED-DATA.md).

## 트리거

- 병원·장비 **시드 JSON** 작성·갱신
- 공개 자료 기반 주요 장비 리서치 (CT, MRI, 초음파, 인공호흡기 등)
- Prisma `seed.ts` 구현 **전** 마스터 데이터 준비

## 작업 순서

1. `docs/SEED-DATA.md`·기존 `docs/seed/*.json` 읽기
2. 대상 병원 `slug` 확인 또는 `hospitals.json`에 추가
3. **웹 검색** — 병원 공식 사이트, 보도자료, 제조사 case study, 공개 입찰
4. `equipment.json` — `evidence`(보유 근거), `confidence`, `equipmentSlug` (이미지 URL을 evidence에 넣지 말 것)
5. `node docs/seed/scripts/download-equipment-images.mjs` — 제품/시설 **실사 이미지** 다운로드
6. (선택) `research-notes.md`에 미확인·충돌 출처 기록
7. 요약 보고: 추가 건수, `low` confidence 목록, 이미지 종류(`seed_illustration` vs `category_placeholder`)

## 출력 규칙

- 파일: `docs/seed/hospitals.json`, `docs/seed/equipment.json`
- `hospitalSlug`는 `hospitals.json`의 `slug`와 일치
- `statusSourceType`: MVP 기본 `PING`. DICOM/HL7 근거 있으면 `MEDICAL_PROTOCOL` + `statusSourceTypeReason`
- `currentStatus`: 시드 기본 `IDLE` (모니터링 개발용)
- JSON 유효성·배열 병합 시 기존 항목 **덮어쓰지 말고** 병원별 idempotency (`equipmentSlug` 중복 검사)
- `evidence`: 병원·논문 URL — **장비 보유 확인용** (사진 아님)
- `image`: `manufacturer_product` / `dealer_catalog` / `wikimedia_commons` 실사 JPG·PNG

## 금지

- 내부 IP, 시리얼, 환자정보 **추정·생성** 금지
- 비공개 추정을 `high` confidence로 표기 금지
- `apps/*/env/.env*` 에 시크릿 기록 금지

## Prisma 연동 시

`apps/api/prisma/seed.ts`가 있으면 JSON → DB 매핑만 수정. 스키마 없으면 JSON만 산출.

## 참고 템플릿

`docs/seed/template.hospitals.json`, `docs/seed/template.equipment.json`
