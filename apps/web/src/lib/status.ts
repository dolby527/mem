import type { EquipmentStatus } from "./types";

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  RUNNING: "가동 중",
  IDLE: "대기 중",
  FAULT: "고장·에러",
  OFFLINE: "연결 끊김",
};

const DEMO_STATUSES: EquipmentStatus[] = [
  "RUNNING",
  "IDLE",
  "IDLE",
  "IDLE",
  "FAULT",
  "OFFLINE",
];

/** Deterministic demo status so the mock dashboard is not all IDLE. */
export function getDemoStatus(slug: string, seedStatus: EquipmentStatus): EquipmentStatus {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i) * (i + 1)) % DEMO_STATUSES.length;
  }
  if (seedStatus !== "IDLE") return seedStatus;
  return DEMO_STATUSES[hash] ?? "IDLE";
}

export function countByStatus(items: { demoStatus: EquipmentStatus }[]) {
  return items.reduce(
    (acc, item) => {
      acc[item.demoStatus] += 1;
      return acc;
    },
    { RUNNING: 0, IDLE: 0, FAULT: 0, OFFLINE: 0 } as Record<EquipmentStatus, number>,
  );
}

/** 주의 필요 — FAULT · OFFLINE (표시 우선순위) */
export const ATTENTION_STATUSES: EquipmentStatus[] = [
  "FAULT",
  "OFFLINE",
];

const ATTENTION_STATUS_RANK: Record<EquipmentStatus, number> = {
  FAULT: 0,
  OFFLINE: 1,
  RUNNING: 2,
  IDLE: 3,
};

export function isAttentionStatus(status: EquipmentStatus): boolean {
  return ATTENTION_STATUSES.includes(status);
}

export function compareAttentionEquipment(
  a: { demoStatus: EquipmentStatus; name: string },
  b: { demoStatus: EquipmentStatus; name: string },
): number {
  const byStatus =
    ATTENTION_STATUS_RANK[a.demoStatus] - ATTENTION_STATUS_RANK[b.demoStatus];
  if (byStatus !== 0) return byStatus;
  return a.name.localeCompare(b.name, "ko");
}
