"use client";

import { useEffect } from "react";
import type { EquipmentWithHospital } from "@/lib/types";
import { useMonitoringLiveSeed } from "./MonitoringLiveProvider";

interface MonitoringEquipmentSeedProps {
  equipment: Pick<
    EquipmentWithHospital,
    "equipmentSlug" | "demoStatus" | "lastCheckedAt" | "statusSinceAt"
  >[];
}

/** SSR 장비 목록의 상태·점검 시각을 live context에 초기 주입 */
export function MonitoringEquipmentSeed({
  equipment,
}: MonitoringEquipmentSeedProps) {
  const seed = useMonitoringLiveSeed();

  useEffect(() => {
    seed(equipment);
  }, [equipment, seed]);

  return null;
}
