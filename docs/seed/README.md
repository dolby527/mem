# Seed data (development)

Cursor Agent(`mem-seed`)가 작성하는 병원·장비 마스터 JSON.

| File | Status |
|------|--------|
| `template.hospitals.json` | 스키마 템플릿 |
| `template.equipment.json` | 스키마 템플릿 |
| `hospitals.json` | 병원 3곳 등록됨 |
| `equipment.json` | 장비 21건 — `evidence` + `image` (실사 JPG/PNG) |
| `faq.json` | FAQ 6건 템플릿 (병원당 시드) |
| `images/equipment/` | `{equipmentSlug}.jpg` 21개 |
| `scripts/download-equipment-images.mjs` | 제품 사진 다운로드 |
| `research-notes.md` | 조사 요약·검토 필요 항목 |

워크플로: [docs/SEED-DATA.md](../SEED-DATA.md)
