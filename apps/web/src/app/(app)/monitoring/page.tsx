import { Suspense } from "react";
import { MonitoringEquipmentList } from "@/components/monitoring/MonitoringEquipmentList";
import { MonitoringEquipmentSeed } from "@/components/MonitoringEquipmentSeed";
import { MonitoringPageSubtitle } from "@/components/monitoring/MonitoringPageSubtitle";
import { CategoryFilterBar } from "@/components/monitoring/CategoryFilterBar";
import { fetchEquipmentList } from "@/lib/data/equipment";
import { filterMonitoringEquipment } from "@/lib/navigation/filter-equipment";
import { inferSpatialPath } from "@/lib/navigation/spatial";
import { EquipmentRegisterLink } from "@/components/equipment/EquipmentRegisterLink";
import { MonitoringConnectionBadge } from "@/components/MonitoringConnectionBadge";
import type { EquipmentStatus, MaintenanceStatus } from "@/lib/types";
import * as l from "@/styles/layout.css";

interface MonitoringPageProps {
  searchParams: Promise<{
    view?: string;
    loc?: string;
    domain?: string;
    sub?: string;
    status?: string;
    maintenance?: string;
  }>;
}

function contextLabel(
  loc: string | undefined,
  domain: string | undefined,
  sub: string | undefined,
): string {
  const parts: string[] = [];
  if (loc) parts.push("선택 위치");
  if (domain) parts.push(sub ? "대분류·소분류" : "대분류");
  return parts.length ? parts.join(" + ") : "병원 전체";
}

export default async function MonitoringPage({ searchParams }: MonitoringPageProps) {
  const { loc, domain, sub, status = "ALL", maintenance = "ALL" } =
    await searchParams;
  const all = await fetchEquipmentList();
  const equipment = filterMonitoringEquipment(all, {
    loc: loc ?? null,
    domain: domain ?? null,
    sub: sub ?? null,
    maintenance: maintenance as MaintenanceStatus | "ALL",
  });
  const statusFilter = status as EquipmentStatus | "ALL";

  const spatialHint =
    loc && equipment[0] ? inferSpatialPath(equipment[0]) : null;
  const spatialSuffix = spatialHint
    ? ` · ${spatialHint.building} ${spatialHint.floor}`
    : undefined;

  return (
    <>
      <MonitoringEquipmentSeed equipment={all} />
      <header className={l.pageHeader}>
        <div className={l.sectionHeaderRow}>
          <div>
            <h2 className={l.pageTitle}>실시간 모니터링</h2>
            <MonitoringPageSubtitle
              contextLabel={contextLabel(loc, domain, sub)}
              equipment={equipment}
              statusFilter={statusFilter}
              spatialSuffix={spatialSuffix}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MonitoringConnectionBadge />
            <EquipmentRegisterLink />
          </div>
        </div>
      </header>

      <Suspense fallback={null}>
        <CategoryFilterBar />
      </Suspense>

      <MonitoringEquipmentList
        equipment={equipment}
        statusFilter={statusFilter}
        showDomainHint={Boolean(domain && equipment.length > 0)}
      />
    </>
  );
}
