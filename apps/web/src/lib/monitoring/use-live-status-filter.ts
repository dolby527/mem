"use client";

import { useMemo } from "react";
import { useMonitoringLive } from "@/components/MonitoringLiveProvider";
import type { EquipmentStatus, EquipmentWithHospital } from "@/lib/types";

export function filterEquipmentByLiveStatus(
  items: EquipmentWithHospital[],
  status: EquipmentStatus | "ALL" | null | undefined,
  getStatus: (slug: string, fallback: EquipmentStatus) => EquipmentStatus,
): EquipmentWithHospital[] {
  if (!status || status === "ALL") return items;
  return items.filter(
    (item) =>
      getStatus(item.equipmentSlug, item.demoStatus) === status,
  );
}

export function useLiveStatusFilteredEquipment(
  equipment: EquipmentWithHospital[],
  statusFilter: EquipmentStatus | "ALL",
): EquipmentWithHospital[] {
  const { getStatus } = useMonitoringLive();

  return useMemo(
    () => filterEquipmentByLiveStatus(equipment, statusFilter, getStatus),
    [equipment, statusFilter, getStatus],
  );
}
