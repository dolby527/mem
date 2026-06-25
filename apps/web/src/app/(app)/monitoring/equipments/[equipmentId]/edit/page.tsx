import Link from "next/link";
import { notFound } from "next/navigation";
import { EquipmentForm } from "@/components/EquipmentForm";
import { fetchEquipmentBySlug } from "@/lib/data/equipment";
import { equipmentDetailPath } from "@/lib/navigation/paths";
import * as l from "@/styles/layout.css";

interface EditEquipmentPageProps {
  params: Promise<{ equipmentId: string }>;
}

export default async function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  const { equipmentId } = await params;
  const item = await fetchEquipmentBySlug(equipmentId);
  if (!item) notFound();

  return (
    <div className={l.pageContainer}>
      <Link href={equipmentDetailPath(equipmentId)} className={l.linkAccent}>
        ← 상세로
      </Link>
      <header className={l.pageHeader}>
        <h2 className={l.pageTitle}>장비 수정</h2>
        <p className={l.pageSubtitle}>{item.name}</p>
      </header>
      <EquipmentForm
        mode="edit"
        equipmentSlug={equipmentId}
        initial={{
          equipmentSlug: item.equipmentSlug,
          name: item.name,
          category: item.category,
          location: item.location ?? "",
          spatialBuilding: item.spatialBuilding ?? "",
          spatialFloor: item.spatialFloor ?? "",
          spatialRoom: item.spatialRoom ?? "",
          manufacturer: item.manufacturer ?? "",
          model: item.model ?? "",
          manufacturedAt: item.manufacturedAt
            ? item.manufacturedAt.slice(0, 10)
            : "",
          statusSourceType: item.statusSourceType,
          fallbackSourceType: item.fallbackSourceType ?? "",
          vendorDeviceId: item.vendorDeviceId ?? "",
          vendorInterfaceType: item.vendorInterfaceType ?? "",
          statusSourceTypeReason: item.statusSourceTypeReason ?? "",
          currentStatus: item.currentStatus,
          maintenanceStatus: item.maintenanceStatus,
          pmScheduledAt: item.pmScheduledAt
            ? item.pmScheduledAt.slice(0, 16)
            : "",
          devProbeHost: item.devProbeHost ?? "",
          iotIdleThresholdW: String(item.iotIdleThresholdW ?? 5),
          iotRunningThresholdW: String(item.iotRunningThresholdW ?? 50),
          notes: item.notes ?? "",
          imageAlt: item.image?.alt ?? item.name,
          existingImageUrl: item.image?.remoteUrl ?? undefined,
        }}
      />
    </div>
  );
}
