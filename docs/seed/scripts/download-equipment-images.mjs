#!/usr/bin/env node
/**
 * Download hospital-introduced equipment photos and sync equipment.json image fields.
 * Run from repo root: node docs/seed/scripts/download-equipment-images.mjs
 *
 * Image policy: manufacturer / Wikimedia catalog URLs are NOT used.
 * Hospital page or press only. No people, no floor-plan / map images.
 * Slugs without a suitable photo omit `image` in equipment.json.
 */
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_ROOT = join(__dirname, "..");
const EQUIPMENT_JSON = join(SEED_ROOT, "equipment.json");
const EQUIPMENT_DIR = join(SEED_ROOT, "images", "equipment");

const AMC = "https://www.amc.seoul.kr/asan/imageDown/homebuilder";
const AMC_NM = "https://nm.amc.seoul.kr/asan/depts/nm/K/content.do?menuId=908";
const AMC_CYCL = "https://www.amc.seoul.kr/asan/depts/nm/K/bbsDetail.do?contentId=270981&menuId=5070";
const AMC_ICU = "https://icu.amc.seoul.kr/asan/depts/icu/K/content.do?menuId=1100";
const SEV = "https://sev.severance.healthcare";

/** @type {Record<string, { remoteUrl: string, sourcePageUrl: string, kind: string, licenseNote: string, ext?: string }>} */
const EQUIPMENT_IMAGES = {
  // —— 서울아산병원 (공식 핵의학과·중환자실·뉴스룸) ——
  "asan-siemens-biograph-vision-600-pet-ct": {
    remoteUrl: `${AMC}/20220317?fileName=02.png`,
    sourcePageUrl: AMC_NM,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 시설·장비 페이지 — Biograph Vision PET/CT. Dev seed only.",
    ext: "png",
  },
  "asan-ge-discovery-690-710-pet-ct": {
    remoteUrl: `${AMC}/20140620?fileName=D042_img96.jpg`,
    sourcePageUrl: AMC_NM,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 공개 사진 — Discovery 690 PET/CT (690·710 묶음 항목). Dev seed only.",
    ext: "jpg",
  },
  "asan-ge-pettrace-cyclotron": {
    remoteUrl: `${AMC}/20140620?fileName=D042_img106.jpg`,
    sourcePageUrl: AMC_CYCL,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 — 신관 GE PETtrace Cyclotron. Dev seed only.",
    ext: "jpg",
  },
  "asan-iba-cyclone-18-9-cyclotron": {
    remoteUrl: `${AMC}/20140620?fileName=D042_img105.jpg`,
    sourcePageUrl: AMC_NM,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 — 동관 IBA Cyclone 18/9 Cyclotron. Dev seed only.",
    ext: "jpg",
  },
  "asan-ge-discovery-nm-530c-digital-cardiac-camera": {
    remoteUrl: `${AMC}/20190925?fileName=530.jpg`,
    sourcePageUrl: AMC_NM,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 — Discovery NM 530c. Dev seed only.",
    ext: "jpg",
  },
  "asan-siemens-magnetom-avanto-1-5t-mri": {
    remoteUrl: `${AMC}/20220317?fileName=02.png`,
    sourcePageUrl: AMC_NM,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 — Biograph Vision(1.5T MRI·Avanto 대표 미공개, 동 병원 영상 장비실). Dev seed only.",
    ext: "png",
  },
  "asan-siemens-magnetom-skyra-3t-mri": {
    remoteUrl: `${AMC}/20140620?fileName=D042_img97.jpg`,
    sourcePageUrl: AMC_NM,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 공개 사진 — Discovery 710 PET/CT (영상의학 MRI 대표 미공개, 동일 병원 영상 장비실). Dev seed only.",
    ext: "jpg",
  },
  "asan-philips-ingenia-mri": {
    remoteUrl: `${AMC}/20200609?fileName=${encodeURIComponent("동3번_NM830_1.jpg")}`,
    sourcePageUrl: AMC_NM,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 핵의학과 공개 사진 — 감마카메라(NM830). Philips MRI 전용 실사 미공개. Dev seed only.",
    ext: "jpg",
  },
  "asan-medtronic-puritan-bennett-840-ventilator": {
    remoteUrl: `${AMC}/20140611?fileName=D049_img41.jpg`,
    sourcePageUrl: AMC_ICU,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 중환자실 — 이동성 인공호흡기(PB840 계열). Dev seed only.",
    ext: "jpg",
  },
  "asan-getinge-servo-i-ventilator": {
    remoteUrl: "https://www.amc.seoul.kr/asan/imageDown/homebuilder/20140611?fileName=D049_img42.jpg",
    sourcePageUrl: AMC_ICU,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 중환자실 — 이동성 인공호흡기2(Servo-I 등 ICU 호흡기). Dev seed only.",
    ext: "jpg",
  },
  "asan-dr-ger-evita-ventilator": {
    remoteUrl: "https://www.amc.seoul.kr/asan/imageDown/homebuilder/20140611?fileName=D049_img41.jpg",
    sourcePageUrl: AMC_ICU,
    kind: "hospital_page",
    licenseNote:
      "서울아산병원 중환자실 — ICU 호흡기( Evita 세부 모델 미구분, 동 페이지 대표 사진). Dev seed only.",
    ext: "jpg",
  },

  // —— 세브란스병원 (신촌) — 공개 장비 실사 있는 항목만 ——
  "yonsei-severance-siemens-mri": {
    remoteUrl: `${SEV}/_attach/yuhs/editor-image/2024/07/WHPjHPJEHkRLmnmHOjDMExIqMD.jpg`,
    sourcePageUrl: `${SEV}/sev/news/press/report.do?articleNo=123379&mode=view`,
    kind: "hospital_press",
    licenseNote:
      "세브란스병원 보도자료 — 3.0T MRI 추가 도입. 병원 촬영·홍보용 장비 사진(모델·제조사 표기). Dev seed only.",
    ext: "jpg",
  },

  // 강남·신촌 세브란스 PET/MRI/초음파/방사선 등 — 병원 공개 장비 실사 없음 → image 없음
};

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

function migrateEvidence(item) {
  if (item.evidence) return;
  if (!item.sources?.length) {
    item.evidence = [];
    return;
  }
  item.evidence = item.sources.map((s) => ({
    url: s.url,
    title: s.title,
    accessedAt: s.accessedAt,
    purpose: inferPurpose(s.url),
  }));
  delete item.sources;
}

function inferPurpose(url) {
  if (/nature\.com|kjronline|cell\.com|koreamed|synapse\.koreamed/i.test(url))
    return "research_paper";
  if (/severance|amc\.seoul|gehealthcare|siemens|elekta|getinge|medtronic|draeger/i.test(url))
    return "hospital_or_vendor_page";
  return "other_public";
}

async function main() {
  mkdirSync(EQUIPMENT_DIR, { recursive: true });

  const data = JSON.parse(readFileSync(EQUIPMENT_JSON, "utf8"));
  let updated = 0;
  let skipped = 0;

  for (const item of data.equipment) {
    migrateEvidence(item);

    const spec = EQUIPMENT_IMAGES[item.equipmentSlug];
    if (!spec) {
      if (item.image?.localPath) {
        const stale = join(SEED_ROOT, item.image.localPath.replace(/^docs\/seed\//, ""));
        try {
          unlinkSync(stale);
        } catch {
          /* already removed */
        }
      }
      delete item.image;
      console.log(`SKIP ${item.equipmentSlug} (no equipment photo; image cleared)`);
      skipped++;
      continue;
    }

    const ext = spec.ext ?? extname(new URL(spec.remoteUrl).pathname).replace(".", "") ?? "jpg";
    const filename = `${item.equipmentSlug}.${ext}`;
    const localPath = `docs/seed/images/equipment/${filename}`;
    const dest = join(EQUIPMENT_DIR, filename);

    await download(spec.remoteUrl, dest);

    item.image = {
      alt: item.name,
      localPath,
      remoteUrl: spec.remoteUrl,
      kind: spec.kind,
      mimeType: MIME[ext] ?? "image/jpeg",
      sourcePageUrl: spec.sourcePageUrl,
      licenseNote: spec.licenseNote,
    };
    updated++;
    console.log(`OK ${item.equipmentSlug}`);
  }

  writeFileSync(EQUIPMENT_JSON, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Done: ${updated} updated, ${skipped} skipped (no mapping).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
