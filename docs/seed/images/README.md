# Equipment seed images

모니터링 UI용 **실제 의료장비·시설 사진** (JPG/PNG).

## 경로

```
images/equipment/{equipmentSlug}.jpg   ← 장비별 파일 (21개)
images/placeholders/                   ← 스크립트 미사용 시 fallback
```

## 이미지 종류 (`image.kind`)

| kind | 설명 |
|------|------|
| `manufacturer_product` | Siemens, GE, Elekta, Getinge, Philips 공식·마케팅 |
| `dealer_catalog` | 딜러 카탈로그 (GE PET/CT 등 — 운영 전 교체 권장) |
| `wikimedia_commons` | CC 라이선스 (사이클로트론 시설, ICU ventilator 대표) |

**이전 `seed_illustration` SVG(색상 박스)는 제거됨.**

## 재다운로드

```bash
node docs/seed/scripts/download-equipment-images.mjs
```

## `evidence`와 구분

- **이 폴더** = UI 썸네일용 **사진**
- **`equipment.json`의 `evidence`** = 병원이 해당 장비를 **보유한다는 근거 URL** (사진 아님)
