export type MaintenanceScheduleType =
  | "PM"
  | "CONSUMABLE"
  | "CALIBRATION"
  | "PERFORMANCE"
  | "REPAIR";

export type MaintenanceScheduleStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "OVERDUE";

export type RecurrenceInterval = "NONE" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceScheduleType, string> =
  {
    PM: "정기 PM",
    CONSUMABLE: "소모품 교체",
    CALIBRATION: "캘리브레이션",
    PERFORMANCE: "성능 점검",
    REPAIR: "수리",
  };

export const MAINTENANCE_SCHEDULE_STATUS_LABELS: Record<
  MaintenanceScheduleStatus,
  string
> = {
  SCHEDULED: "예정",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
  OVERDUE: "지연",
};

export const RECURRENCE_INTERVAL_LABELS: Record<RecurrenceInterval, string> = {
  NONE: "없음",
  MONTHLY: "매월",
  QUARTERLY: "분기",
  YEARLY: "매년",
};

export const MAINTENANCE_SUMMARY_KEYS = [
  "scheduled",
  "inProgress",
  "overdue",
  "upcomingWeek",
] as const;

export type MaintenanceSummaryKey = (typeof MAINTENANCE_SUMMARY_KEYS)[number];

export const MAINTENANCE_SUMMARY_LABELS: Record<MaintenanceSummaryKey, string> =
  {
    scheduled: "예정",
    inProgress: "진행 중",
    overdue: "지연",
    upcomingWeek: "7일 이내",
  };

export function maintenanceSummaryHref(key: MaintenanceSummaryKey): string {
  const params = new URLSearchParams();
  if (key === "scheduled") params.set("status", "SCHEDULED");
  if (key === "inProgress") params.set("status", "IN_PROGRESS");
  if (key === "overdue") params.set("status", "OVERDUE");
  if (key === "upcomingWeek") params.set("range", "week");
  const qs = params.toString();
  return qs ? `/maintenance?${qs}` : "/maintenance";
}
