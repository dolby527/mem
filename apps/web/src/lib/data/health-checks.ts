import type { ApiHealthCheckLogsPage } from "@/lib/api/equipment.api";
import { serverCookieFetch } from "@/lib/api/server-cookie-fetch";
import { HEALTH_CHECK_HISTORY_PAGE_SIZE } from "@/lib/monitoring/constants";
import { mapHealthCheckLogs } from "@/lib/monitoring/health-check-history";
import { buildMockHealthChecks } from "@/lib/mock-health-checks";
import type { EquipmentStatus, HealthCheckEntry } from "@/lib/types";

export interface HealthCheckHistoryPage {
  entries: HealthCheckEntry[];
  nextCursor: string | null;
  mockFallback?: HealthCheckEntry[];
}

export async function fetchInitialHealthCheckHistory(
  equipmentSlug: string,
  status: EquipmentStatus,
): Promise<HealthCheckHistoryPage> {
  try {
    const page = await serverCookieFetch<ApiHealthCheckLogsPage>(
      `/equipment/${encodeURIComponent(equipmentSlug)}/health-checks?limit=${HEALTH_CHECK_HISTORY_PAGE_SIZE}`,
    );
    return {
      entries: mapHealthCheckLogs(page.items),
      nextCursor: page.nextCursor,
    };
  } catch {
    const all = buildMockHealthChecks(equipmentSlug, status);
    return {
      entries: all.slice(0, HEALTH_CHECK_HISTORY_PAGE_SIZE),
      nextCursor:
        all.length > HEALTH_CHECK_HISTORY_PAGE_SIZE ? "mock" : null,
      mockFallback: all,
    };
  }
}
