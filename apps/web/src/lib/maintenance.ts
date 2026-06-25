import type { MaintenanceStatus } from "./types";

export const MAINTENANCE_LABELS: Record<MaintenanceStatus, string> = {
  NONE: "",
  PM_SCHEDULED: "PM 예정",
};

/** 대시보드 보전·일정 시그널에 표시할 상태 */
export const MAINTENANCE_SIGNAL_STATUSES = ["PM_SCHEDULED"] as const;

export type MaintenanceSignalStatus = (typeof MAINTENANCE_SIGNAL_STATUSES)[number];

export function isMaintenanceSignalStatus(
  status: MaintenanceStatus,
): status is MaintenanceSignalStatus {
  return (MAINTENANCE_SIGNAL_STATUSES as readonly MaintenanceStatus[]).includes(
    status,
  );
}

export function countByMaintenanceStatus(
  items: { maintenanceStatus: MaintenanceStatus }[],
) {
  return items.reduce(
    (acc, item) => {
      if (isMaintenanceSignalStatus(item.maintenanceStatus)) {
        acc[item.maintenanceStatus] += 1;
      }
      return acc;
    },
    { PM_SCHEDULED: 0 } as Record<MaintenanceSignalStatus, number>,
  );
}
