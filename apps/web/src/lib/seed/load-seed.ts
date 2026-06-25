import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { EquipmentWithHospital, Hospital, SeedEquipment } from "../types";
import { getDemoStatus } from "../status";

const SEED_ROOT = join(process.cwd(), "../../docs/seed");

interface HospitalsFile {
  hospitals: Hospital[];
}

interface EquipmentFile {
  equipment: SeedEquipment[];
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadHospitals(): Hospital[] {
  const data = readJson<HospitalsFile>(join(SEED_ROOT, "hospitals.json"));
  return data.hospitals;
}

export function loadEquipment(): SeedEquipment[] {
  const data = readJson<EquipmentFile>(join(SEED_ROOT, "equipment.json"));
  return data.equipment;
}

export function loadEquipmentWithHospitals(): EquipmentWithHospital[] {
  const hospitals = loadHospitals();
  const bySlug = new Map(hospitals.map((h) => [h.slug, h.name]));

  return loadEquipment().map((item) => ({
    ...item,
    hospitalName: bySlug.get(item.hospitalSlug) ?? item.hospitalSlug,
    demoStatus: getDemoStatus(item.equipmentSlug, item.currentStatus),
    maintenanceStatus: item.maintenanceStatus ?? "NONE",
    pmScheduledAt: item.pmScheduledAt ?? null,
    manufacturedAt: item.manufacturedAt ?? null,
  }));
}

export function getHospitalBySlug(slug: string): Hospital | undefined {
  return loadHospitals().find((h) => h.slug === slug);
}

export function getEquipmentBySlug(slug: string): EquipmentWithHospital | undefined {
  return loadEquipmentWithHospitals().find((e) => e.equipmentSlug === slug);
}

export function getSeedImagePath(filename: string): string {
  return join(SEED_ROOT, "images", "equipment", filename);
}

export function getPlaceholderPath(category: string): string {
  const map: Record<string, string> = {
    MRI: "mri.svg",
    CT: "ct.svg",
    ULTRASOUND: "ultrasound.svg",
    VENTILATOR: "ventilator.svg",
    MAMMOGRAPHY: "xray.svg",
    MONITOR: "other.svg",
    OTHER: "other.svg",
  };
  const file = map[category] ?? "other.svg";
  return join(SEED_ROOT, "images", "placeholders", file);
}

export { getEquipmentImageSrc } from "../equipment-image";
