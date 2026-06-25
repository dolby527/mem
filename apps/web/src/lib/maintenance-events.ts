/** 보전 일정 생성·상태 변경·삭제 후 대시보드 등이 집계를 갱신하도록 알립니다. */
export const MAINTENANCE_CHANGED_EVENT = "mem:maintenance-changed";

export function notifyMaintenanceChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MAINTENANCE_CHANGED_EVENT));
}
