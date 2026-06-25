import type { EquipmentRecheckResult } from "@/lib/api/monitoring.api";
import type { StatusUpdateEvent } from "@/lib/monitoring/types";

export function recheckResultToLiveUpdate(
  result: EquipmentRecheckResult,
): StatusUpdateEvent {
  return {
    equipmentId: result.equipmentSlug,
    equipmentSlug: result.equipmentSlug,
    status: result.status,
    checkedAt: result.checkedAt,
    statusSinceAt: result.statusSinceAt,
    statusResolvedFrom: result.statusResolvedFrom,
    changed: result.changed,
    logId: result.logId ?? undefined,
    latencyMs: result.latencyMs,
    errorMessage: result.errorMessage,
  };
}

export function statusUpdateToHealthCheckEntry(
  event: StatusUpdateEvent,
): {
  id: string;
  checkedAt: string;
  status: StatusUpdateEvent["status"];
  latencyMs: number | null;
  errorMessage: string | null;
} | null {
  if (!event.changed || !event.logId) return null;
  return {
    id: event.logId,
    checkedAt: event.checkedAt,
    status: event.status,
    latencyMs: event.latencyMs ?? null,
    errorMessage: event.errorMessage ?? null,
  };
}
