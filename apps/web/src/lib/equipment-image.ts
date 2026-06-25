import type { SeedEquipment } from "./types";

/** Client-safe — no filesystem access */
export function getEquipmentImageSrc(item: SeedEquipment): string | null {
  const remote = item.image?.remoteUrl;
  if (remote?.startsWith("http") || remote?.startsWith("/")) {
    return remote;
  }
  if (!item.image?.localPath) return null;
  const filename = item.image.localPath.split("/").pop();
  if (!filename) return null;
  return `/api/seed-image/equipment/${encodeURIComponent(filename)}`;
}
