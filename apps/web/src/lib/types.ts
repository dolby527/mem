export type EquipmentStatus = "RUNNING" | "IDLE" | "FAULT" | "OFFLINE";

export type MaintenanceStatus = "NONE" | "PM_SCHEDULED";

export type EquipmentCategory =
  | "MRI"
  | "CT"
  | "ULTRASOUND"
  | "VENTILATOR"
  | "MAMMOGRAPHY"
  | "MONITOR"
  | "OTHER";

export type StatusSourceType =
  | "PING"
  | "MEDICAL_PROTOCOL"
  | "IOT_SENSOR"
  | "AGENT"
  | "INTERFACE_VENDOR";

export type VendorInterfaceType =
  | "PATIENT_MONITOR"
  | "EKG"
  | "OUTPATIENT"
  | "LIS"
  | "OTHER";

export interface Hospital {
  slug: string;
  name: string;
  nameEn: string;
  region: string;
  website: string;
  notes?: string;
}

export interface EquipmentImage {
  alt: string;
  localPath?: string;
  remoteUrl?: string;
  kind?: string;
  mimeType?: string;
  sourcePageUrl?: string;
  licenseNote?: string;
}

export interface SeedEquipment {
  hospitalSlug: string;
  equipmentSlug: string;
  name: string;
  category: EquipmentCategory;
  location?: string;
  spatialBuilding?: string | null;
  spatialFloor?: string | null;
  spatialRoom?: string | null;
  manufacturer?: string;
  model?: string;
  manufacturedAt?: string | null;
  statusSourceType: StatusSourceType;
  statusSourceTypeReason?: string;
  fallbackSourceType?: StatusSourceType | null;
  vendorDeviceId?: string | null;
  vendorInterfaceType?: VendorInterfaceType | null;
  statusResolvedFrom?: StatusSourceType | null;
  iotIdleThresholdW?: number | null;
  iotRunningThresholdW?: number | null;
  currentStatus: EquipmentStatus;
  maintenanceStatus?: MaintenanceStatus;
  pmScheduledAt?: string | null;
  devProbeHost?: string | null;
  confidence?: string;
  notes?: string;
  image?: EquipmentImage;
}

export interface EquipmentWithHospital extends SeedEquipment {
  hospitalName: string;
  demoStatus: EquipmentStatus;
  maintenanceStatus: MaintenanceStatus;
  /** PM 예정 일시 (ISO) */
  pmScheduledAt?: string | null;
  /** 마지막 health check 시각 (ISO). SSE로 갱신 */
  lastCheckedAt?: string | null;
  /** 현재 상태가 시작된 시각 (ISO) */
  statusSinceAt?: string | null;
  /** 최근 상태 판별에 사용된 소스 */
  statusResolvedFrom?: StatusSourceType | null;
}

export interface HealthCheckEntry {
  id: string;
  checkedAt: string;
  status: EquipmentStatus;
  latencyMs: number | null;
  errorMessage: string | null;
}
