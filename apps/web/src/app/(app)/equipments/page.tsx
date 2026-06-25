import Link from "next/link";
import { DashboardEquipmentOverviewTable } from "@/components/DashboardEquipmentOverviewTable";
import { fetchEquipmentList } from "@/lib/data/equipment";
import { MONITORING_BASE } from "@/lib/navigation/paths";
import * as l from "@/styles/layout.css";

export default async function EquipmentsPage() {
  const equipment = await fetchEquipmentList();
  const totalCount = equipment.length;

  return (
    <div className={l.pageContainer}>
      <header className={l.pageHeader}>
        <div className={l.sectionHeaderRow}>
          <div>
            <h2 className={l.pageTitle}>장비 현황</h2>
            <p className={l.pageSubtitle}>
              등록 장비 {totalCount}대 · 분류·품목별 집계
            </p>
          </div>
          <Link href={MONITORING_BASE} className={l.linkAccent}>
            모니터링으로
          </Link>
        </div>
      </header>

      <section className={l.section}>
        <p className={l.sectionHint}>
          동일 장비명·판별 기준으로 집계합니다. 장비명을 선택하면 해당 품목
          장비 목록을 볼 수 있습니다.
        </p>
        <DashboardEquipmentOverviewTable equipment={equipment} />
      </section>
    </div>
  );
}
