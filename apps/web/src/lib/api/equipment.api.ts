import type {
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceStatus,
  StatusSourceType,
  VendorInterfaceType,
} from "@/lib/types";
import { cookieFetch } from "./cookie-fetch";

export interface ApiEquipment {
  id: string;
  hospitalId: string;
  equipmentSlug: string;
  name: string;
  category: EquipmentCategory;
  location: string | null;
  spatialBuilding: string | null;
  spatialFloor: string | null;
  spatialRoom: string | null;
  manufacturer: string | null;
  model: string | null;
  manufacturedAt: string | null;
  statusSourceType: StatusSourceType;
  statusSourceTypeReason: string | null;
  fallbackSourceType: StatusSourceType | null;
  vendorDeviceId: string | null;
  vendorInterfaceType: VendorInterfaceType | null;
  statusResolvedFrom: StatusSourceType | null;
  currentStatus: EquipmentStatus;
  maintenanceStatus: MaintenanceStatus;
  pmScheduledAt: string | null;
  devProbeHost: string | null;
  iotIdleThresholdW: number | null;
  iotRunningThresholdW: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string | null;
  currentStatusSinceAt?: string | null;
  healthCheckLogs?: ApiHealthCheckLog[];
  agentTokenPlain?: string;
}

export interface ApiHealthCheckLog {
  id: string;
  equipmentId: string;
  checkedAt: string;
  status: EquipmentStatus;
  latencyMs: number | null;
  errorMessage: string | null;
  sourceType: StatusSourceType;
}

export interface ApiHealthCheckLogsPage {
  items: ApiHealthCheckLog[];
  nextCursor: string | null;
}

export interface CreateEquipmentPayload {
  equipmentSlug: string;
  name: string;
  category: EquipmentCategory;
  location?: string;
  spatialBuilding?: string;
  spatialFloor?: string;
  spatialRoom?: string;
  manufacturer?: string;
  model?: string;
  manufacturedAt?: string | null;
  statusSourceType: StatusSourceType;
  fallbackSourceType?: StatusSourceType;
  statusSourceTypeReason?: string;
  vendorDeviceId?: string;
  vendorInterfaceType?: VendorInterfaceType;
  currentStatus?: EquipmentStatus;
  maintenanceStatus?: MaintenanceStatus;
  pmScheduledAt?: string | null;
  devProbeHost?: string;
  iotIdleThresholdW?: number;
  iotRunningThresholdW?: number;
  imageUrl?: string;
  imageAlt?: string;
  notes?: string;
}

export type UpdateEquipmentPayload = Partial<
  Omit<CreateEquipmentPayload, "equipmentSlug">
>;

function equipmentFormBody(
  payload: CreateEquipmentPayload | UpdateEquipmentPayload,
  file?: File | null,
): FormData | string {
  if (file) {
    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    form.append("image", file);
    return form;
  }
  return JSON.stringify(payload);
}

export function listEquipment() {
  return cookieFetch<ApiEquipment[]>("/equipment");
}

export function getEquipment(equipmentSlug: string) {
  return cookieFetch<ApiEquipment>(`/equipment/${encodeURIComponent(equipmentSlug)}`);
}

export function listHealthCheckLogs(
  equipmentSlug: string,
  params?: { cursor?: string; limit?: number },
) {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit != null) {
    query.set("limit", String(params.limit));
  }
  const qs = query.toString();
  return cookieFetch<ApiHealthCheckLogsPage>(
    `/equipment/${encodeURIComponent(equipmentSlug)}/health-checks${qs ? `?${qs}` : ""}`,
  );
}

export function createEquipment(
  payload: CreateEquipmentPayload,
  file?: File | null,
) {
  return cookieFetch<ApiEquipment>("/equipment", {
    method: "POST",
    body: equipmentFormBody(payload, file),
  });
}

export function updateEquipment(
  equipmentSlug: string,
  payload: UpdateEquipmentPayload,
  file?: File | null,
) {
  return cookieFetch<ApiEquipment>(
    `/equipment/${encodeURIComponent(equipmentSlug)}`,
    {
      method: "PATCH",
      body: equipmentFormBody(payload, file),
    },
  );
}

export function deleteEquipment(equipmentSlug: string) {
  return cookieFetch<void>(`/equipment/${encodeURIComponent(equipmentSlug)}`, {
    method: "DELETE",
  });
}

export function regenerateAgentToken(equipmentSlug: string) {
  return cookieFetch<{ equipmentSlug: string; agentTokenPlain: string }>(
    `/equipment/${encodeURIComponent(equipmentSlug)}/agent-token`,
    { method: "POST" },
  );
}
