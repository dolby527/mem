"use client";

import { useCallback, useState } from "react";
import { recheckEquipment } from "@/lib/api/monitoring.api";
import { recheckResultToLiveUpdate } from "@/lib/monitoring/recheck";
import { useMonitoringLive } from "../MonitoringLiveProvider";

export function useRecheckEquipment() {
  const { applyLiveUpdate } = useMonitoringLive();
  const [pendingSlugs, setPendingSlugs] = useState<Set<string>>(() => new Set());
  const [bulkPending, setBulkPending] = useState(false);

  const recheckOne = useCallback(
    async (equipmentSlug: string) => {
      setPendingSlugs((prev) => new Set(prev).add(equipmentSlug));
      try {
        const result = await recheckEquipment(equipmentSlug);
        applyLiveUpdate(recheckResultToLiveUpdate(result));
      } finally {
        setPendingSlugs((prev) => {
          const next = new Set(prev);
          next.delete(equipmentSlug);
          return next;
        });
      }
    },
    [applyLiveUpdate],
  );

  const recheckMany = useCallback(
    async (equipmentSlugs: string[]) => {
      if (equipmentSlugs.length === 0) return;
      setBulkPending(true);
      try {
        for (const slug of equipmentSlugs) {
          const result = await recheckEquipment(slug);
          applyLiveUpdate(recheckResultToLiveUpdate(result));
        }
      } finally {
        setBulkPending(false);
      }
    },
    [applyLiveUpdate],
  );

  return {
    bulkPending,
    pendingSlugs,
    isSlugPending: (slug: string) => pendingSlugs.has(slug),
    recheckOne,
    recheckMany,
  };
}
