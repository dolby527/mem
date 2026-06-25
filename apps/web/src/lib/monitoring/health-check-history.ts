import type { ApiHealthCheckLog } from "@/lib/api/equipment.api";
import type { HealthCheckEntry } from "@/lib/types";

export function mapHealthCheckLog(log: ApiHealthCheckLog): HealthCheckEntry {
  return {
    id: log.id,
    checkedAt: log.checkedAt,
    status: log.status,
    latencyMs: log.latencyMs,
    errorMessage: log.errorMessage,
  };
}

export function mapHealthCheckLogs(
  logs: ApiHealthCheckLog[],
): HealthCheckEntry[] {
  return logs.map(mapHealthCheckLog);
}
