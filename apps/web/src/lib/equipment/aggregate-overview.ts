import type { EquipmentCategory, EquipmentWithHospital, StatusSourceType } from "@/lib/types";

export interface EquipmentOverviewRow {
  category: EquipmentCategory;
  name: string;
  count: number;
  statusSourceType: StatusSourceType;
}

function groupKey(item: EquipmentWithHospital): string {
  return `${item.category}\0${item.name}\0${item.statusSourceType}`;
}

export function matchesOverviewGroup(
  item: EquipmentWithHospital,
  category: EquipmentCategory,
  name: string,
  statusSourceType: StatusSourceType,
): boolean {
  return (
    item.category === category &&
    item.name === name &&
    item.statusSourceType === statusSourceType
  );
}

export function filterEquipmentOverviewGroup(
  items: EquipmentWithHospital[],
  group: Pick<EquipmentOverviewRow, "category" | "name" | "statusSourceType">,
): EquipmentWithHospital[] {
  return items
    .filter((item) =>
      matchesOverviewGroup(
        item,
        group.category,
        group.name,
        group.statusSourceType,
      ),
    )
    .sort((a, b) => a.equipmentSlug.localeCompare(b.equipmentSlug));
}

export function aggregateEquipmentOverview(
  items: EquipmentWithHospital[],
): EquipmentOverviewRow[] {
  const map = new Map<string, EquipmentOverviewRow>();

  for (const item of items) {
    const key = groupKey(item);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        category: item.category,
        name: item.name,
        count: 1,
        statusSourceType: item.statusSourceType,
      });
    }
  }

  return [...map.values()].sort((a, b) => {
    const byCategory = a.category.localeCompare(b.category);
    if (byCategory !== 0) return byCategory;
    return a.name.localeCompare(b.name, "ko");
  });
}
