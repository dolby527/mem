import type { ApiEquipment } from "@/lib/api/equipment.api";
import { getHospitalSlug } from "@/lib/api/config";
import { serverCookieFetch } from "@/lib/api/server-cookie-fetch";
import { loadEquipmentWithHospitals } from "@/lib/seed/load-seed";
import type { EquipmentWithHospital } from "@/lib/types";

function resolveIsoTime(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return null;
}

function resolveLastCheckedAt(row: ApiEquipment): string | null {
  return resolveIsoTime(row.lastCheckedAt);
}

function resolveStatusSinceAt(row: ApiEquipment): string | null {
  return resolveIsoTime(row.currentStatusSinceAt);
}

function mapApiRow(
  row: ApiEquipment,
  hospitalName: string,
  hospitalSlug: string,
): EquipmentWithHospital {
  return {
    hospitalSlug,
    equipmentSlug: row.equipmentSlug,
    name: row.name,
    category: row.category,
    location: row.location ?? undefined,
    spatialBuilding: row.spatialBuilding,
    spatialFloor: row.spatialFloor,
    spatialRoom: row.spatialRoom,
    manufacturer: row.manufacturer ?? undefined,
    model: row.model ?? undefined,
    manufacturedAt: resolveIsoTime(row.manufacturedAt),
    statusSourceType: row.statusSourceType,
    statusSourceTypeReason: row.statusSourceTypeReason ?? undefined,
    fallbackSourceType: row.fallbackSourceType,
    vendorDeviceId: row.vendorDeviceId,
    vendorInterfaceType: row.vendorInterfaceType,
    iotIdleThresholdW: row.iotIdleThresholdW,
    iotRunningThresholdW: row.iotRunningThresholdW,
    currentStatus: row.currentStatus,
    maintenanceStatus: row.maintenanceStatus ?? "NONE",
    pmScheduledAt: resolveIsoTime(row.pmScheduledAt),
    notes: row.notes ?? undefined,
    devProbeHost: row.devProbeHost,
    hospitalName,
    demoStatus: row.currentStatus,
    lastCheckedAt: resolveLastCheckedAt(row),
    statusSinceAt: resolveStatusSinceAt(row),
    statusResolvedFrom: row.statusResolvedFrom ?? row.statusSourceType,
    image: row.imageUrl
      ? { alt: row.imageAlt ?? row.name, remoteUrl: row.imageUrl }
      : undefined,
  };
}

async function getHospitalContext(): Promise<{
  name: string;
  slug: string;
}> {
  try {
    const h = await serverCookieFetch<{ name: string; slug: string }>(
      "/hospitals/current",
    );
    return { name: h.name, slug: h.slug };
  } catch {
    const slug =
      getHospitalSlug() ??
      process.env.NEXT_PUBLIC_DEV_HOSPITAL_SLUG ??
      "asan";
    const { loadHospitals } = await import("@/lib/seed/load-seed");
    return {
      slug,
      name: loadHospitals().find((x) => x.slug === slug)?.name ?? slug,
    };
  }
}

/** API 우선, 실패 시 시드 JSON fallback (DB 미기동 개발용) */
export async function fetchEquipmentList(): Promise<EquipmentWithHospital[]> {
  try {
    const [rows, hospital] = await Promise.all([
      serverCookieFetch<ApiEquipment[]>("/equipment"),
      getHospitalContext(),
    ]);
    return rows.map((r) => mapApiRow(r, hospital.name, hospital.slug));
  } catch {
    const slug =
      getHospitalSlug() ??
      process.env.NEXT_PUBLIC_DEV_HOSPITAL_SLUG ??
      "asan";
    return loadEquipmentWithHospitals().filter(
      (e) => e.hospitalSlug === slug,
    );
  }
}

export async function fetchEquipmentBySlug(
  equipmentSlug: string,
): Promise<EquipmentWithHospital | undefined> {
  try {
    const [row, hospital] = await Promise.all([
      serverCookieFetch<ApiEquipment>(
        `/equipment/${encodeURIComponent(equipmentSlug)}`,
      ),
      getHospitalContext(),
    ]);
    return mapApiRow(row, hospital.name, hospital.slug);
  } catch {
    const slug =
      getHospitalSlug() ??
      process.env.NEXT_PUBLIC_DEV_HOSPITAL_SLUG ??
      "asan";
    const { getEquipmentBySlug } = await import("@/lib/seed/load-seed");
    const item = getEquipmentBySlug(equipmentSlug);
    if (item && item.hospitalSlug !== slug) return undefined;
    return item;
  }
}
