import type { EquipmentCategory, StatusSourceType, VendorInterfaceType } from "@/lib/types";

export const STATUS_SOURCE_LABELS: Record<StatusSourceType, string> = {
  PING: "네트워크 Ping",
  MEDICAL_PROTOCOL: "HL7 / DICOM",
  IOT_SENSOR: "IoT 전력 센서",
  AGENT: "장비 에이전트",
  INTERFACE_VENDOR: "인터페이스 연동",
};

export const VENDOR_INTERFACE_LABELS: Record<VendorInterfaceType, string> = {
  PATIENT_MONITOR: "Patient Monitor Interface",
  EKG: "EKG Interface",
  OUTPATIENT: "일반외래장비 Interface",
  LIS: "LIS 진단검사 Interface",
  OTHER: "기타 인터페이스",
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  MRI: "MRI",
  CT: "CT",
  ULTRASOUND: "초음파",
  VENTILATOR: "인공호흡기",
  MAMMOGRAPHY: "유방촬영",
  MONITOR: "모니터",
  OTHER: "기타",
};

export const PRIMARY_SOURCE_TYPES: StatusSourceType[] = [
  "INTERFACE_VENDOR",
  "MEDICAL_PROTOCOL",
  "PING",
  "AGENT",
  "IOT_SENSOR",
];

export const FALLBACK_SOURCE_TYPES: StatusSourceType[] = [
  "PING",
  "AGENT",
  "IOT_SENSOR",
];

export function formatStatusResolvedLabel(
  resolvedFrom: StatusSourceType | null | undefined,
  vendorInterfaceType?: VendorInterfaceType | null,
): string {
  if (!resolvedFrom) return "—";
  if (
    resolvedFrom === "INTERFACE_VENDOR" ||
    resolvedFrom === "MEDICAL_PROTOCOL"
  ) {
    const vendor =
      vendorInterfaceType != null
        ? VENDOR_INTERFACE_LABELS[vendorInterfaceType]
        : null;
    return vendor ?? STATUS_SOURCE_LABELS[resolvedFrom];
  }
  return STATUS_SOURCE_LABELS[resolvedFrom];
}

export function formatPrimarySourceLabel(
  sourceType: StatusSourceType,
  vendorInterfaceType?: VendorInterfaceType | null,
): string {
  if (sourceType === "INTERFACE_VENDOR" && vendorInterfaceType) {
    return VENDOR_INTERFACE_LABELS[vendorInterfaceType];
  }
  return STATUS_SOURCE_LABELS[sourceType];
}
