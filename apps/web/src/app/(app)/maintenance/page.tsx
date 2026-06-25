import Link from "next/link";
import { Suspense } from "react";
import { MaintenancePlanner } from "@/components/maintenance/MaintenancePlanner";
import { serverCookieFetch } from "@/lib/api/server-cookie-fetch";
import { MAINTENANCE_BASE } from "@/lib/navigation/paths";
import * as l from "@/styles/layout.css";

async function loadTemplates() {
  try {
    return await serverCookieFetch<
      { id: string; name: string }[]
    >("/maintenance/templates");
  } catch {
    return [];
  }
}

export default async function MaintenancePage() {
  const templates = await loadTemplates();

  return (
    <div className={l.pageContainer}>
      <header className={l.pageHeader}>
        <div className={l.sectionHeaderRow}>
          <div>
            <h2 className={l.pageTitle}>장비 보전</h2>
            <p className={l.pageSubtitle}>
              PM·캘리브레이션 일정 등록 · 반복 생성 · CSV 일괄 등록
            </p>
          </div>
          <Link
            href={`${MAINTENANCE_BASE}/templates`}
            className={l.linkAccent}
          >
            체크리스트 템플릿
          </Link>
        </div>
      </header>

      <Suspense fallback={<p className={l.sectionHint}>불러오는 중…</p>}>
        <MaintenancePlanner
          templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        />
      </Suspense>
    </div>
  );
}
