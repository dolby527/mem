"use client";

import Link from "next/link";
import { useMemo } from "react";
import { monitoringListPath } from "@/lib/navigation/paths";
import type { EquipmentStatus, EquipmentWithHospital } from "@/lib/types";
import { STATUS_LABELS, countByStatus } from "@/lib/status";
import { useMonitoringLive } from "./MonitoringLiveProvider";
import {
  statusSummaryCard,
  statusSummaryCardLink,
  statusSummaryCount,
  statusSummaryGrid,
  statusSummaryHeading,
  statusSummaryLabel,
  statusSummarySection,
} from "@/styles/status.css";

type SummaryStatus = EquipmentStatus | "ALL";

const ORDER: SummaryStatus[] = [
  "ALL",
  "RUNNING",
  "IDLE",
  "FAULT",
  "OFFLINE",
];

const SUMMARY_LABELS: Record<SummaryStatus, string> = {
  ALL: "전체",
  ...STATUS_LABELS,
};

function monitoringStatusHref(status: SummaryStatus): string {
  if (status === "ALL") {
    return monitoringListPath();
  }
  return monitoringListPath({ status });
}

interface StatusSummaryLiveProps {
  equipment: EquipmentWithHospital[];
}

export function StatusSummaryLive({ equipment }: StatusSummaryLiveProps) {
  const { getStatus } = useMonitoringLive();

  const { counts, total } = useMemo(() => {
    const live = equipment.map((item) => ({
      ...item,
      demoStatus: getStatus(item.equipmentSlug, item.demoStatus),
    }));
    return { counts: countByStatus(live), total: live.length };
  }, [equipment, getStatus]);

  return (
    <section className={statusSummarySection} aria-label="운영 상태">
      <h3 className={statusSummaryHeading}>운영 상태</h3>
      <div className={statusSummaryGrid}>
        {ORDER.map((status) => (
          <Link
            key={status}
            href={monitoringStatusHref(status)}
            className={statusSummaryCardLink}
          >
            <div className={statusSummaryCard({ status })}>
              <p className={statusSummaryLabel}>{SUMMARY_LABELS[status]}</p>
              <p className={statusSummaryCount}>
                {status === "ALL" ? total : counts[status]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
