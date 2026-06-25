import Link from "next/link";
import { redirect } from "next/navigation";
import { EquipmentGroupDetail } from "@/components/equipment/EquipmentGroupDetail";
import { MonitoringEquipmentSeed } from "@/components/MonitoringEquipmentSeed";
import { fetchEquipmentList } from "@/lib/data/equipment";
import { filterEquipmentOverviewGroup } from "@/lib/equipment/aggregate-overview";
import { EQUIPMENTS_BASE } from "@/lib/navigation/paths";
import {
  EQUIPMENT_CATEGORY_LABELS,
  PRIMARY_SOURCE_TYPES,
  STATUS_SOURCE_LABELS,
} from "@/lib/status-source";
import type { EquipmentCategory, StatusSourceType } from "@/lib/types";
import * as l from "@/styles/layout.css";

const CATEGORIES = new Set<string>([
  "MRI",
  "CT",
  "ULTRASOUND",
  "VENTILATOR",
  "MAMMOGRAPHY",
  "MONITOR",
  "OTHER",
]);

const SOURCES = new Set<string>(PRIMARY_SOURCE_TYPES);

interface EquipmentGroupPageProps {
  searchParams: Promise<{
    category?: string;
    name?: string;
    source?: string;
  }>;
}

function parseGroupParams(
  category: string | undefined,
  name: string | undefined,
  source: string | undefined,
):
  | {
      category: EquipmentCategory;
      name: string;
      statusSourceType: StatusSourceType;
    }
  | null {
  if (!category || !name || !source) return null;
  if (!CATEGORIES.has(category) || !SOURCES.has(source)) return null;
  return {
    category: category as EquipmentCategory,
    name,
    statusSourceType: source as StatusSourceType,
  };
}

export default async function EquipmentGroupPage({
  searchParams,
}: EquipmentGroupPageProps) {
  const { category, name, source } = await searchParams;
  const group = parseGroupParams(category, name, source);
  if (!group) {
    redirect(EQUIPMENTS_BASE);
  }

  const all = await fetchEquipmentList();
  const equipment = filterEquipmentOverviewGroup(all, group);

  return (
    <div className={l.pageContainer}>
      <MonitoringEquipmentSeed equipment={equipment} />
      <header className={l.pageHeader}>
        <div className={l.sectionHeaderRow}>
          <h2 className={l.pageTitle}>{group.name}</h2>
          <Link href={EQUIPMENTS_BASE} className={l.linkAccent}>
            ← 장비 현황
          </Link>
        </div>
        <p className={l.pageSubtitle}>
          {EQUIPMENT_CATEGORY_LABELS[group.category]} ·{" "}
          {STATUS_SOURCE_LABELS[group.statusSourceType]} · {equipment.length}대
        </p>
      </header>

      {equipment.length === 0 ? (
        <div className={l.emptyState}>
          해당 조건에 맞는 장비가 없습니다.
        </div>
      ) : (
        <EquipmentGroupDetail equipment={equipment} />
      )}
    </div>
  );
}
