import Link from "next/link";
import { DashboardAttentionTable } from "@/components/DashboardAttentionTable";
import { MaintenanceSummaryLive } from "@/components/MaintenanceSummaryLive";
import { StatusSummaryLive } from "@/components/StatusSummaryLive";
import { fetchEquipmentList } from "@/lib/data/equipment";
import { MONITORING_BASE } from "@/lib/navigation/paths";
import * as l from "@/styles/layout.css";
import { dashboardSignalsStack } from "@/styles/dashboard.css";

export default async function DashboardPage() {
  const equipment = await fetchEquipmentList();

  return (
    <div className={l.pageContainer}>
      <header className={l.pageHeader}>
        <h2 className={l.pageTitle}>대시보드</h2>
        <p className={l.pageSubtitle}>
          등록 장비 {equipment.length}대 · 실시간 상태 요약
        </p>
      </header>

      <div className={dashboardSignalsStack}>
        <StatusSummaryLive equipment={equipment} />
        <MaintenanceSummaryLive />
      </div>

      <section className={l.section}>
        <div className={l.sectionHeaderRow}>
          <h3 className={l.sectionTitle}>주의 필요</h3>
          <Link href={MONITORING_BASE} className={l.linkAccent}>
            모니터링으로
          </Link>
        </div>
        <DashboardAttentionTable equipment={equipment} />
      </section>

      <section className={l.infoBox}>
        <p className={l.infoBoxTitle}>다음 단계</p>
        <ul className={l.infoBoxList}>
          <li>
            <code className={l.inlineCode}>MEDICAL_PROTOCOL</code> 어댑터 — HL7/DICOM
            검사 이벤트 수신·4상태 반영
          </li>
        </ul>
      </section>
    </div>
  );
}
