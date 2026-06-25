import {
  EquipmentStatus,
  StatusSourceType,
  VendorInterfaceType,
} from "@prisma/client";

/** 벤더·인터페이스 솔루션 이벤트 → MEM 4상태 */
const COMMON_EVENT_STATUS: Record<string, EquipmentStatus> = {
  RUNNING: EquipmentStatus.RUNNING,
  IDLE: EquipmentStatus.IDLE,
  FAULT: EquipmentStatus.FAULT,
  OFFLINE: EquipmentStatus.OFFLINE,
  STUDY_STARTED: EquipmentStatus.RUNNING,
  STUDY_COMPLETED: EquipmentStatus.IDLE,
  EXAM_STARTED: EquipmentStatus.RUNNING,
  EXAM_COMPLETED: EquipmentStatus.IDLE,
  IN_USE: EquipmentStatus.RUNNING,
  STANDBY: EquipmentStatus.IDLE,
  QC_FAILED: EquipmentStatus.FAULT,
  QC_FAIL: EquipmentStatus.FAULT,
  ERROR: EquipmentStatus.FAULT,
  ALARM: EquipmentStatus.FAULT,
  DEVICE_FAULT: EquipmentStatus.FAULT,
  LINK_DOWN: EquipmentStatus.OFFLINE,
  LINK_UP: EquipmentStatus.IDLE,
  DISCONNECTED: EquipmentStatus.OFFLINE,
  CONNECTED: EquipmentStatus.IDLE,
};

const LIS_EVENT_STATUS: Record<string, EquipmentStatus> = {
  ...COMMON_EVENT_STATUS,
  ANALYZING: EquipmentStatus.RUNNING,
  SAMPLE_RUNNING: EquipmentStatus.RUNNING,
  RESULT_SENT: EquipmentStatus.IDLE,
  MAINTENANCE: EquipmentStatus.IDLE,
};

const MONITOR_EVENT_STATUS: Record<string, EquipmentStatus> = {
  ...COMMON_EVENT_STATUS,
  PATIENT_CONNECTED: EquipmentStatus.RUNNING,
  PATIENT_DISCONNECTED: EquipmentStatus.IDLE,
  TECHNICAL_ALARM: EquipmentStatus.FAULT,
};

const EKG_EVENT_STATUS: Record<string, EquipmentStatus> = {
  ...COMMON_EVENT_STATUS,
  RECORDING: EquipmentStatus.RUNNING,
  RECORDING_COMPLETE: EquipmentStatus.IDLE,
};

const OUTPATIENT_EVENT_STATUS: Record<string, EquipmentStatus> = {
  ...COMMON_EVENT_STATUS,
  TEST_IN_PROGRESS: EquipmentStatus.RUNNING,
  TEST_COMPLETE: EquipmentStatus.IDLE,
};

function tableFor(
  vendorInterfaceType: VendorInterfaceType | null | undefined,
): Record<string, EquipmentStatus> {
  switch (vendorInterfaceType) {
    case VendorInterfaceType.LIS:
      return LIS_EVENT_STATUS;
    case VendorInterfaceType.PATIENT_MONITOR:
      return MONITOR_EVENT_STATUS;
    case VendorInterfaceType.EKG:
      return EKG_EVENT_STATUS;
    case VendorInterfaceType.OUTPATIENT:
      return OUTPATIENT_EVENT_STATUS;
    default:
      return COMMON_EVENT_STATUS;
  }
}

export function mapVendorEventToStatus(
  eventType: string,
  vendorInterfaceType?: VendorInterfaceType | null,
): EquipmentStatus | null {
  const key = eventType.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const table = tableFor(vendorInterfaceType);
  return table[key] ?? COMMON_EVENT_STATUS[key] ?? null;
}

export function isPrimaryVendorSource(
  sourceType: StatusSourceType,
): boolean {
  return (
    sourceType === StatusSourceType.INTERFACE_VENDOR ||
    sourceType === StatusSourceType.MEDICAL_PROTOCOL
  );
}

export const FALLBACK_SOURCE_TYPES: StatusSourceType[] = [
  StatusSourceType.PING,
  StatusSourceType.AGENT,
  StatusSourceType.IOT_SENSOR,
];

export function isAllowedFallback(
  sourceType: StatusSourceType | null | undefined,
): boolean {
  if (!sourceType) return false;
  return FALLBACK_SOURCE_TYPES.includes(sourceType);
}
