import type { EquipmentStatus, HealthCheckEntry } from "./types";

const STATUSES: EquipmentStatus[] = ["RUNNING", "IDLE", "IDLE", "IDLE", "FAULT", "OFFLINE"];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i)) % 997;
  return h;
}

export function buildMockHealthChecks(
  equipmentSlug: string,
  currentStatus: EquipmentStatus,
): HealthCheckEntry[] {
  const base = hashSlug(equipmentSlug);
  const now = Date.now();

  return Array.from({ length: 8 }, (_, i) => {
    const status =
      i === 0
        ? currentStatus
        : STATUSES[(base + i) % STATUSES.length] ?? "IDLE";
    const minutesAgo = i * 7 + (base % 5);
    const checkedAt = new Date(now - minutesAgo * 60_000).toISOString();
    const isOffline = status === "OFFLINE";
    const isFault = status === "FAULT";

    return {
      id: `${equipmentSlug}-${i}`,
      checkedAt,
      status,
      latencyMs: isOffline ? null : 12 + ((base + i * 3) % 80),
      errorMessage: isFault
        ? "Probe timeout — device reported hardware alarm"
        : isOffline
          ? "Ping failed (3/3)"
          : null,
    };
  });
}
