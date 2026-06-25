import type { ApiEquipment } from "@/lib/api/equipment.api";
import { EQUIPMENT_CATEGORY_LABELS } from "@/lib/status-source";
import type { EquipmentCategory } from "@/lib/types";

export type EquipmentTreeNodeKind =
  | "category"
  | "equipment"
  | "location"
  | "device";

export interface EquipmentTreeNode {
  id: string;
  kind: EquipmentTreeNodeKind;
  label: string;
  sublabel?: string;
  equipmentSlug?: string;
  children?: EquipmentTreeNode[];
}

export function formatEquipmentLocationLabel(item: {
  spatialBuilding?: string | null;
  spatialFloor?: string | null;
  spatialRoom?: string | null;
  location?: string | null;
  equipmentLocation?: string | null;
}): string {
  if (item.spatialBuilding && item.spatialFloor && item.spatialRoom) {
    return `${item.spatialBuilding} · ${item.spatialFloor} · ${item.spatialRoom}`;
  }
  return (item.location ?? item.equipmentLocation)?.trim() || "위치 미지정";
}

function formatEquipmentLocation(eq: ApiEquipment): string {
  return formatEquipmentLocationLabel(eq);
}

const CATEGORY_ORDER: EquipmentCategory[] = [
  "MRI",
  "CT",
  "ULTRASOUND",
  "VENTILATOR",
  "MAMMOGRAPHY",
  "MONITOR",
  "OTHER",
];

export function buildEquipmentTree(
  equipment: ApiEquipment[],
): EquipmentTreeNode[] {
  const byCategory = new Map<EquipmentCategory, ApiEquipment[]>();
  for (const eq of equipment) {
    const list = byCategory.get(eq.category) ?? [];
    list.push(eq);
    byCategory.set(eq.category, list);
  }

  const categories = CATEGORY_ORDER.filter((c) => byCategory.has(c));
  for (const c of byCategory.keys()) {
    if (!categories.includes(c)) categories.push(c);
  }

  return categories.map((category) => {
    const items = byCategory.get(category)!;
    const byName = new Map<string, ApiEquipment[]>();
    for (const eq of items) {
      const list = byName.get(eq.name) ?? [];
      list.push(eq);
      byName.set(eq.name, list);
    }

    const names = [...byName.keys()].sort((a, b) => a.localeCompare(b, "ko"));

    return {
      id: `cat:${category}`,
      kind: "category",
      label: EQUIPMENT_CATEGORY_LABELS[category],
      children: names.map((name) => {
        const nameItems = byName.get(name)!;
        const byLocation = new Map<string, ApiEquipment[]>();
        for (const eq of nameItems) {
          const loc = formatEquipmentLocation(eq);
          const list = byLocation.get(loc) ?? [];
          list.push(eq);
          byLocation.set(loc, list);
        }

        const locations = [...byLocation.keys()].sort((a, b) =>
          a.localeCompare(b, "ko"),
        );

        return {
          id: `cat:${category}/name:${name}`,
          kind: "equipment" as const,
          label: name,
          children: locations.map((loc) => {
            const locItems = [...byLocation.get(loc)!].sort((a, b) =>
              a.equipmentSlug.localeCompare(b.equipmentSlug, "ko"),
            );
            return {
              id: `cat:${category}/name:${name}/loc:${loc}`,
              kind: "location" as const,
              label: loc,
              children: locItems.map((eq) => ({
                id: `eq:${eq.equipmentSlug}`,
                kind: "device" as const,
                label: eq.equipmentSlug,
                sublabel: eq.vendorDeviceId ?? undefined,
                equipmentSlug: eq.equipmentSlug,
              })),
            };
          }),
        };
      }),
    };
  });
}

export function findEquipmentPath(
  tree: EquipmentTreeNode[],
  equipmentSlug: string,
): string[] {
  const path: string[] = [];
  function walk(nodes: EquipmentTreeNode[]): boolean {
    for (const node of nodes) {
      path.push(node.id);
      if (node.equipmentSlug === equipmentSlug) return true;
      if (node.children && walk(node.children)) return true;
      path.pop();
    }
    return false;
  }
  walk(tree);
  return path;
}

export function filterEquipmentTree(
  tree: EquipmentTreeNode[],
  query: string,
): EquipmentTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return tree;

  function filterNode(node: EquipmentTreeNode): EquipmentTreeNode | null {
    const selfMatch =
      node.label.toLowerCase().includes(q) ||
      node.sublabel?.toLowerCase().includes(q) ||
      node.equipmentSlug?.toLowerCase().includes(q);

    if (node.kind === "device") {
      return selfMatch ? node : null;
    }

    const children = (node.children ?? [])
      .map(filterNode)
      .filter((n): n is EquipmentTreeNode => n !== null);

    if (selfMatch || children.length > 0) {
      return { ...node, children };
    }
    return null;
  }

  return tree
    .map(filterNode)
    .filter((n): n is EquipmentTreeNode => n !== null);
}

export function collectDeviceSlugs(node: EquipmentTreeNode): string[] {
  if (node.kind === "device" && node.equipmentSlug) {
    return [node.equipmentSlug];
  }
  return (node.children ?? []).flatMap(collectDeviceSlugs);
}
