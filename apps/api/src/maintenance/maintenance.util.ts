import { randomUUID } from "node:crypto";
import {
  MaintenanceScheduleStatus,
  MaintenanceScheduleType,
  MaintenanceStatus,
  RecurrenceInterval,
} from "@prisma/client";

export function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function generateRecurrenceDates(
  startIso: string,
  endIso: string,
  interval: RecurrenceInterval,
): string[] {
  if (interval === RecurrenceInterval.NONE) {
    return [startIso.slice(0, 10)];
  }

  const dates: string[] = [];
  const end = parseDateOnly(endIso);
  const current = parseDateOnly(startIso);

  while (current <= end) {
    dates.push(toDateOnlyString(current));
    if (interval === RecurrenceInterval.MONTHLY) {
      current.setUTCMonth(current.getUTCMonth() + 1);
    } else if (interval === RecurrenceInterval.QUARTERLY) {
      current.setUTCMonth(current.getUTCMonth() + 3);
    } else if (interval === RecurrenceInterval.YEARLY) {
      current.setUTCFullYear(current.getUTCFullYear() + 1);
    } else {
      break;
    }
  }

  return dates;
}

export function newRecurrenceGroupId(): string {
  return randomUUID();
}

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceScheduleType, string> = {
  PM: "정기 PM",
  CONSUMABLE: "소모품 교체",
  CALIBRATION: "법적·정기 검사",
  PERFORMANCE: "자체 성능점검",
  REPAIR: "수리(계획)",
};

export const MAINTENANCE_STATUS_LABELS: Record<
  MaintenanceScheduleStatus,
  string
> = {
  SCHEDULED: "예정",
  IN_PROGRESS: "수행 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
  OVERDUE: "기한 초과",
};

export function mapScheduleToEquipmentMaintenance(
  hasUpcoming: boolean,
): MaintenanceStatus {
  return hasUpcoming ? MaintenanceStatus.PM_SCHEDULED : MaintenanceStatus.NONE;
}
