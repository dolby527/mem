import type { EquipmentStatus } from "@/lib/types";

/** 현재 상태가 시작된 시각 — 상태별 툴팁·라벨 */
export function statusSinceLabel(status: EquipmentStatus): string {
  switch (status) {
    case "RUNNING":
      return "가동 시작";
    case "IDLE":
      return "대기 시작";
    case "FAULT":
      return "고장 발생";
    case "OFFLINE":
      return "연결 끊김";
  }
}

/** 마지막 health check 시각 — 상태별 툴팁·라벨 */
export function lastCheckedLabel(status: EquipmentStatus): string {
  return status === "RUNNING" ? "가동 확인" : "점검 확인";
}
