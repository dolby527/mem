import type { SeedEquipment } from "../types";
import type { SpatialPath } from "./types";

function slugPart(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .slice(0, 48);
}

/** Infer building / floor / room from seed `location` (목업 — 운영 시 DB spatial FK) */
export function inferSpatialPath(item: SeedEquipment): SpatialPath {
  const loc = item.location ?? "미지정 구역";
  let building = "본관";

  if (loc.includes("신관")) building = "신관";
  else if (loc.includes("동관")) building = "동관";
  else if (item.hospitalSlug === "gangnam-severance") building = "암센터";

  let floor = "3층";
  if (/B1|b1/i.test(loc)) floor = "B1층";
  else if (loc.includes("1층")) floor = "1층";
  else if (loc.includes("중환자")) floor = "5층";
  else if (loc.toLowerCase().includes("cyclotron")) floor = "B1층";
  else if (loc.includes("영상의학")) floor = "2층";
  else if (loc.includes("방사선종양")) floor = "1층";
  else if (loc.includes("핵의학")) floor = "3층";

  const room = loc.replace(/\s*\([^)]*\)/g, "").trim() || loc;
  const nodeId = [
    item.hospitalSlug,
    slugPart(building),
    slugPart(floor),
    slugPart(room),
  ].join("/");

  return {
    hospitalSlug: item.hospitalSlug,
    building,
    floor,
    room,
    nodeId,
  };
}

type SpatialFields = SeedEquipment & {
  spatialBuilding?: string | null;
  spatialFloor?: string | null;
  spatialRoom?: string | null;
};

/** 카드·목록용 — 건물 · 층 · 실 (병원명은 GNB에서 표시) */
export function formatSpatialLabel(item: SpatialFields): string {
  if (item.spatialBuilding && item.spatialFloor && item.spatialRoom) {
    return `${item.spatialBuilding} · ${item.spatialFloor} · ${item.spatialRoom}`;
  }
  const { building, floor, room } = inferSpatialPath(item);
  return `${building} · ${floor} · ${room}`;
}

export function spatialNodeIds(path: SpatialPath): string[] {
  const { hospitalSlug, building, floor, room } = path;
  const b = slugPart(building);
  const f = slugPart(floor);
  const r = slugPart(room);
  return [
    hospitalSlug,
    `${hospitalSlug}/${b}`,
    `${hospitalSlug}/${b}/${f}`,
    `${hospitalSlug}/${b}/${f}/${r}`,
  ];
}
