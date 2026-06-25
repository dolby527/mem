import type { EquipmentStatus, StatusSourceType } from "@/lib/types";
import { cookieFetch } from "./cookie-fetch";

export interface EquipmentRecheckResult {
  equipmentSlug: string;
  status: EquipmentStatus;
  checkedAt: string;
  statusSinceAt: string;
  statusResolvedFrom: StatusSourceType;
  latencyMs: number | null;
  changed: boolean;
  logId: string | null;
  errorMessage: string | null;
}

export function recheckEquipment(equipmentSlug: string) {
  return cookieFetch<EquipmentRecheckResult>(
    `/monitoring/equipments/${encodeURIComponent(equipmentSlug)}/recheck`,
    { method: "POST" },
  );
}
