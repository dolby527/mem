import Link from "next/link";
import { MaintenanceTemplatesPanel } from "@/components/maintenance/MaintenanceTemplatesPanel";
import { MAINTENANCE_BASE } from "@/lib/navigation/paths";
import * as l from "@/styles/layout.css";

export default function MaintenanceTemplatesPage() {
  return (
    <div className={l.pageContainer}>
      <header className={l.pageHeader}>
        <div className={l.sectionHeaderRow}>
          <div>
            <h2 className={l.pageTitle}>체크리스트 템플릿</h2>
            <p className={l.pageSubtitle}>
              장비별 PM·점검 체크리스트 마스터
            </p>
          </div>
          <Link href={MAINTENANCE_BASE} className={l.linkAccent}>
            보전 일정으로
          </Link>
        </div>
      </header>

      <MaintenanceTemplatesPanel />
    </div>
  );
}
