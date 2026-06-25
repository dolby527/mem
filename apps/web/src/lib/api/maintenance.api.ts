import type {
  MaintenanceScheduleStatus,
  MaintenanceScheduleType,
  RecurrenceInterval,
} from "@/lib/maintenance-schedule";
import { cookieFetch } from "./cookie-fetch";

export interface ApiMaintenanceAssignee {
  id: string;
  name: string;
  email: string;
}

export interface ApiMaintenanceSchedule {
  id: string;
  equipmentSlug: string;
  equipmentName: string;
  equipmentLocation: string | null;
  spatialBuilding: string | null;
  spatialFloor: string | null;
  spatialRoom: string | null;
  manufacturer: string | null;
  model: string | null;
  maintenanceType: MaintenanceScheduleType;
  status: MaintenanceScheduleStatus;
  scheduledDate: string;
  startedAt: string | null;
  completedAt: string | null;
  assignedTo: ApiMaintenanceAssignee | null;
  vendorEngineer: string | null;
  estimatedHours: number | null;
  estimatedCost: number | null;
  checklistSnapshot: unknown;
  recurrenceGroupId: string | null;
  recurrenceInterval: RecurrenceInterval;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMaintenanceSummary {
  scheduled: number;
  inProgress: number;
  overdue: number;
  upcomingWeek: number;
}

export interface ApiChecklistItem {
  id: string;
  label: string;
  required?: boolean;
}

export interface ApiMaintenanceTemplate {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
  maintenanceType: MaintenanceScheduleType;
  items: ApiChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchedulePayload {
  equipmentSlug: string;
  maintenanceType: MaintenanceScheduleType;
  scheduledDate: string;
  assignedToUserId?: string;
  vendorEngineer?: string;
  estimatedHours?: number;
  estimatedCost?: number;
  templateId?: string;
  notes?: string;
  recurrenceInterval?: RecurrenceInterval;
}

export interface GenerateRecurrencePayload extends CreateSchedulePayload {
  recurrenceInterval: RecurrenceInterval;
  rangeEndDate: string;
  equipmentSlugs?: string[];
}

export interface BulkImportRow {
  equipmentSlug: string;
  maintenanceType: MaintenanceScheduleType;
  scheduledDate: string;
  assignedEmail?: string;
  templateCode?: string;
  estimatedHours?: number;
  vendorEngineer?: string;
  notes?: string;
}

export interface CreateTemplatePayload {
  name: string;
  manufacturer?: string;
  model?: string;
  category?: string;
  maintenanceType: MaintenanceScheduleType;
  items: ApiChecklistItem[];
}

export function listMaintenanceSchedules(query?: {
  from?: string;
  to?: string;
  status?: MaintenanceScheduleStatus;
  equipmentSlug?: string;
}) {
  const params = new URLSearchParams();
  if (query?.from) params.set("from", query.from);
  if (query?.to) params.set("to", query.to);
  if (query?.status) params.set("status", query.status);
  if (query?.equipmentSlug) params.set("equipmentSlug", query.equipmentSlug);
  const qs = params.toString();
  return cookieFetch<ApiMaintenanceSchedule[]>(
    `/maintenance/schedules${qs ? `?${qs}` : ""}`,
  );
}

export function getMaintenanceSummary() {
  return cookieFetch<ApiMaintenanceSummary>("/maintenance/schedules/summary");
}

export function createMaintenanceSchedule(payload: CreateSchedulePayload) {
  return cookieFetch<ApiMaintenanceSchedule>("/maintenance/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateRecurrenceSchedules(payload: GenerateRecurrencePayload) {
  return cookieFetch<{ count: number; schedules: ApiMaintenanceSchedule[] }>(
    "/maintenance/schedules/generate-recurrence",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function bulkImportSchedules(rows: BulkImportRow[]) {
  return cookieFetch<{
    count: number;
    schedules: ApiMaintenanceSchedule[];
    errors?: { row: number; message: string }[];
  }>("/maintenance/schedules/bulk-import", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
}

export function updateMaintenanceSchedule(
  id: string,
  payload: {
    scheduledDate?: string;
    status?: MaintenanceScheduleStatus;
    assignedToUserId?: string | null;
    vendorEngineer?: string;
    estimatedHours?: number;
    notes?: string;
  },
) {
  return cookieFetch<ApiMaintenanceSchedule>(
    `/maintenance/schedules/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteMaintenanceSchedule(id: string) {
  return cookieFetch<{ ok: boolean }>(
    `/maintenance/schedules/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export function listMaintenanceTemplates() {
  return cookieFetch<ApiMaintenanceTemplate[]>("/maintenance/templates");
}

export function createMaintenanceTemplate(payload: CreateTemplatePayload) {
  return cookieFetch<ApiMaintenanceTemplate>("/maintenance/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMaintenanceTemplate(
  id: string,
  payload: { name?: string; items?: ApiChecklistItem[] },
) {
  return cookieFetch<ApiMaintenanceTemplate>(
    `/maintenance/templates/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteMaintenanceTemplate(id: string) {
  return cookieFetch<{ ok: boolean }>(
    `/maintenance/templates/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
