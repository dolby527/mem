import type { EquipmentCategory, SeedEquipment } from "../types";
import type { DomainNode, DomainPath } from "./types";

export interface DomainSub {
  id: string;
  label: string;
  match: (item: SeedEquipment) => boolean;
}

export interface DomainGroup {
  id: string;
  label: string;
  subs: DomainSub[];
}

/** 기능/품목 중심 트리 (의공학·자산 관리 뷰) */
export const DOMAIN_GROUPS: DomainGroup[] = [
  {
    id: "imaging",
    label: "영상 진단 장비",
    subs: [
      {
        id: "pet-ct",
        label: "PET/CT",
        match: (e) =>
          /pet/i.test(e.name) ||
          /pet/i.test(e.location ?? "") ||
          (/discovery/i.test(e.name) && e.category === "OTHER"),
      },
      {
        id: "mri",
        label: "MRI",
        match: (e) => e.category === "MRI",
      },
      {
        id: "ct",
        label: "CT",
        match: (e) => e.category === "CT",
      },
      {
        id: "ultrasound",
        label: "초음파",
        match: (e) => e.category === "ULTRASOUND",
      },
      {
        id: "nm",
        label: "핵의학/감마",
        match: (e) => /gamma|nm\s|cardiac camera/i.test(e.name),
      },
    ],
  },
  {
    id: "life-support",
    label: "생명 유지 장비",
    subs: [
      {
        id: "ventilator",
        label: "인공호흡기",
        match: (e) => e.category === "VENTILATOR",
      },
    ],
  },
  {
    id: "therapy",
    label: "수술/치료 장비",
    subs: [
      {
        id: "linac",
        label: "방사선 치료",
        match: (e) =>
          /linac|linear accelerator|versa hd|unity/i.test(e.name),
      },
      {
        id: "cyclotron",
        label: "Cyclotron",
        match: (e) => /cyclotron|cyclone/i.test(e.name),
      },
    ],
  },
  {
    id: "monitoring",
    label: "환자 감시 장비",
    subs: [
      {
        id: "bedside-monitor",
        label: "침상 모니터",
        match: (e) => e.category === "MONITOR",
      },
      {
        id: "mammography",
        label: "유방촬영",
        match: (e) => e.category === "MAMMOGRAPHY",
      },
    ],
  },
];

const FALLBACK_SUB: DomainSub = {
  id: "other",
  label: "기타",
  match: () => true,
};

export function resolveDomainPath(item: SeedEquipment): DomainPath {
  for (const group of DOMAIN_GROUPS) {
    for (const sub of group.subs) {
      if (sub.match(item)) {
        return { domainId: group.id, subId: sub.id };
      }
    }
  }
  return { domainId: "imaging", subId: FALLBACK_SUB.id };
}

export function domainNodeIds(path: DomainPath): string[] {
  return [path.domainId, `${path.domainId}/${path.subId}`];
}

export function buildDomainTree(
  items: SeedEquipment[],
): DomainNode[] {
  return DOMAIN_GROUPS.map((group) => {
    const children = group.subs.map((sub) => ({
      id: `${group.id}/${sub.id}`,
      label: sub.label,
      equipmentCount: items.filter(sub.match).length,
    }));
    return {
      id: group.id,
      label: group.label,
      equipmentCount: children.reduce((n, c) => n + c.equipmentCount, 0),
      children,
    };
  });
}

export function categoryLabel(category: EquipmentCategory): string {
  const map: Record<EquipmentCategory, string> = {
    MRI: "MRI",
    CT: "CT",
    ULTRASOUND: "초음파",
    VENTILATOR: "인공호흡기",
    MAMMOGRAPHY: "유방촬영",
    MONITOR: "모니터",
    OTHER: "기타",
  };
  return map[category] ?? category;
}
