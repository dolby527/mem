import type { EquipmentStatus, StatusSourceType } from "@/lib/types";

export interface StatusUpdateEvent {
  equipmentId: string;
  equipmentSlug: string;
  status: EquipmentStatus;
  checkedAt: string;
  statusSinceAt: string;
  statusResolvedFrom?: StatusSourceType;
  changed: boolean;
  logId?: string;
  latencyMs?: number | null;
  errorMessage?: string | null;
}
