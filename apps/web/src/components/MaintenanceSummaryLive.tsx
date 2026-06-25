"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getMaintenanceSummary } from "@/lib/api/maintenance.api";
import { MAINTENANCE_CHANGED_EVENT } from "@/lib/maintenance-events";
import {
  MAINTENANCE_SUMMARY_KEYS,
  MAINTENANCE_SUMMARY_LABELS,
  maintenanceSummaryHref,
  type MaintenanceSummaryKey,
} from "@/lib/maintenance-schedule";
import { APP_HOME } from "@/lib/navigation/paths";
import {
  maintenanceSummaryCard,
  maintenanceSummaryCardLink,
  maintenanceSummaryCount,
  maintenanceSummaryGrid,
  maintenanceSummaryHeading,
  maintenanceSummaryLabel,
  maintenanceSummarySection,
} from "@/styles/maintenance.css";

const SUMMARY_POLL_MS = 30_000;

export function MaintenanceSummaryLive() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<MaintenanceSummaryKey, number>>({
    scheduled: 0,
    inProgress: 0,
    overdue: 0,
    upcomingWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshSummary = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const next = await getMaintenanceSummary();
      setCounts(next);
    } catch {
      /* dashboard fallback */
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSummary(true);

    const onMaintenanceChanged = () => {
      void refreshSummary(false);
    };
    const onFocus = () => {
      void refreshSummary(false);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshSummary(false);
      }
    };

    window.addEventListener(MAINTENANCE_CHANGED_EVENT, onMaintenanceChanged);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const pollId = window.setInterval(() => {
      void refreshSummary(false);
    }, SUMMARY_POLL_MS);

    return () => {
      window.removeEventListener(MAINTENANCE_CHANGED_EVENT, onMaintenanceChanged);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(pollId);
    };
  }, [refreshSummary]);

  useEffect(() => {
    if (pathname === APP_HOME) {
      void refreshSummary(false);
    }
  }, [pathname, refreshSummary]);

  return (
    <section className={maintenanceSummarySection} aria-label="보전·일정">
      <h3 className={maintenanceSummaryHeading}>
        보전·일정{loading ? " (불러오는 중…)" : ""}
      </h3>
      <div className={maintenanceSummaryGrid}>
        {MAINTENANCE_SUMMARY_KEYS.map((key) => (
          <Link
            key={key}
            href={maintenanceSummaryHref(key)}
            className={maintenanceSummaryCardLink}
          >
            <div className={maintenanceSummaryCard({ summaryKey: key })}>
              <p className={maintenanceSummaryLabel}>
                {MAINTENANCE_SUMMARY_LABELS[key]}
              </p>
              <p className={maintenanceSummaryCount}>{counts[key]}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
