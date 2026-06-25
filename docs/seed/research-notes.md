# 시드 리서치 메모 (2026-06-12)

대상: `asan`, `yonsei-severance`, `gangnam-severance`

## 요약

| 병원 | 장비 항목 수 | high | medium | low |
|------|-------------|------|--------|-----|
| 서울아산병원 | 11 | 8 | 3 | 0 |
| 세브란스병원 | 5 | 3 | 0 | 2 |
| 강남세브란스병원 | 5 | 3 | 0 | 2 |
| **합계** | **21** | **14** | **3** | **4** |

## 사람 검토 필요 (`confidence: low`)

1. **yonsei-severance — Siemens MRI (다기종)** — 모델·대수 없음. 논문 시퀀스·층별 안내만 근거.
2. **yonsei-severance — 초음파** — 보유 확인만. 제조사·모델 없음.
3. **gangnam-severance — MRI 검사실** — 층별 안내·영상의학과 소개만. 진단용 MRI 제조사 미확인.
4. **gangnam-severance — 초음파** — 층별 안내(초음파실)만.

## 미수집·추가 조사 권장

| 카테고리 | 사유 |
|----------|------|
| **CT (전용)** | 세 병원 모두 CT 운영은 확인되나 **신촌 세브란스·강남**의 구체 CT 모델 공개 출처 부족. 아산은 PET/CT·SPECT/CT 위주로 수집. |
| **세브란스 인공호흡기** | ICU 장비 목록 공개 페이지 미확인(아산만 PB840/Servo-I/Evita 확인). |
| **아산 초음파** | 공식 모델명 공개 페이지 미확인. |

## 출처 품질 메모

- **최우수:** 서울아산병원 핵의학과·중환자실 **공식 부서 페이지**, AMC 영문 Nuclear Medicine 페이지.
- **양호:** Nature Scientific Reports (세브란스 신촌·강남 PET/CT 코호트), Elekta·보도자료 (강남 Unity).
- **주의:** KJR·Cell 논문은 AMC **다기종 MRI 사용** 근거이나 개별 장비 대수·현재 가동 여부는 시점 확인 필요.

## 이미지 (2026-06-12 갱신)

- **실사 JPG/PNG** 21개 — `docs/seed/images/equipment/`
- 출처: Siemens/Elekta/Getinge/Philips 공식, GE 딜러 카탈로그, Wikimedia (CC)
- **이전 SVG(색상 박스) 제거**

## `evidence` vs `image`

| | `evidence` | `image` |
|---|------------|---------|
| **용도** | 병원이 장비를 **보유한다는 근거** | UI **썸네일 사진** |
| **URL 예** | amc.seoul.kr, nature.com | siemens-healthineers.com, elekta.com |
| **운영 DB** | 선택 (시드 감사용) | **필요** (`imageUrl`) |

## 다음 단계

1. `low` 4건 — 병원 공식 자료 또는 의공팀 장비 목록 추가 조사 후 모델·전용 이미지 보강.
2. `apps/api` 스캐폴딩 후 `prisma/seed.ts`에서 `docs/seed/*.json` + 이미지 경로 로드.
3. 개발용 `devProbeHost`는 로컬 테스트 시에만 수동 추가 (git에 실제 IP 금지).
