"use client";

import { useCallback, useState } from "react";
import { HealthCheckTimeline } from "@/components/HealthCheckTimeline";
import { useEquipmentStatusChange } from "@/components/MonitoringLiveProvider";
import { listHealthCheckLogs } from "@/lib/api/equipment.api";
import { HEALTH_CHECK_HISTORY_PAGE_SIZE } from "@/lib/monitoring/constants";
import { mapHealthCheckLogs } from "@/lib/monitoring/health-check-history";
import { statusUpdateToHealthCheckEntry } from "@/lib/monitoring/recheck";
import type { HealthCheckEntry } from "@/lib/types";
import * as l from "@/styles/layout.css";

interface HealthCheckHistorySectionProps {
  equipmentSlug: string;
  initialEntries: HealthCheckEntry[];
  initialNextCursor: string | null;
  mockFallback?: HealthCheckEntry[];
}

export function HealthCheckHistorySection({
  equipmentSlug,
  initialEntries,
  initialNextCursor,
  mockFallback,
}: HealthCheckHistorySectionProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  const prependStatusChange = useCallback(
    (event: Parameters<typeof statusUpdateToHealthCheckEntry>[0]) => {
      const entry = statusUpdateToHealthCheckEntry(event);
      if (!entry) return;
      setEntries((prev) => {
        if (prev.some((row) => row.id === entry.id)) return prev;
        return [entry, ...prev];
      });
    },
    [],
  );

  useEquipmentStatusChange(equipmentSlug, prependStatusChange);

  const hasMore = mockFallback
    ? entries.length < mockFallback.length
    : Boolean(nextCursor);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      if (mockFallback) {
        const more = mockFallback.slice(
          entries.length,
          entries.length + HEALTH_CHECK_HISTORY_PAGE_SIZE,
        );
        setEntries((prev) => [...prev, ...more]);
        return;
      }

      const page = await listHealthCheckLogs(equipmentSlug, {
        cursor: nextCursor ?? undefined,
        limit: HEALTH_CHECK_HISTORY_PAGE_SIZE,
      });
      setEntries((prev) => [...prev, ...mapHealthCheckLogs(page.items)]);
      setNextCursor(page.nextCursor);
    } catch {
      /* keep current list */
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    hasMore,
    mockFallback,
    entries.length,
    equipmentSlug,
    nextCursor,
  ]);

  if (entries.length === 0) {
    return <p className={l.sectionHint}>상태 변경 이력이 없습니다.</p>;
  }

  return (
    <>
      <HealthCheckTimeline entries={entries} />
      {hasMore ? (
        <button
          type="button"
          className={l.loadMoreButton}
          onClick={() => void handleLoadMore()}
          disabled={loading}
        >
          {loading ? "불러오는 중…" : "더 보기"}
        </button>
      ) : null}
    </>
  );
}
