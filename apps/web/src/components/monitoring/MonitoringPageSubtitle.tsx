"use client";

import { useLiveStatusFilteredEquipment } from "@/lib/monitoring/use-live-status-filter";
import type { EquipmentStatus, EquipmentWithHospital } from "@/lib/types";
import * as l from "@/styles/layout.css";

interface MonitoringPageSubtitleProps {
  contextLabel: string;
  equipment: EquipmentWithHospital[];
  statusFilter: EquipmentStatus | "ALL";
  spatialSuffix?: string;
}

export function MonitoringPageSubtitle({
  contextLabel,
  equipment,
  statusFilter,
  spatialSuffix,
}: MonitoringPageSubtitleProps) {
  const visible = useLiveStatusFilteredEquipment(equipment, statusFilter);

  return (
    <p className={l.pageSubtitle}>
      {contextLabel} · {visible.length}대
      {spatialSuffix}
    </p>
  );
}
