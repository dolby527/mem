import Image from "next/image";
import type { EquipmentCategory, SeedEquipment } from "@/lib/types";
import { getEquipmentImageSrc } from "@/lib/equipment-image";

const PLACEHOLDER: Record<EquipmentCategory, string> = {
  MRI: "/api/seed-image/placeholders/mri.svg",
  CT: "/api/seed-image/placeholders/ct.svg",
  ULTRASOUND: "/api/seed-image/placeholders/ultrasound.svg",
  VENTILATOR: "/api/seed-image/placeholders/ventilator.svg",
  MAMMOGRAPHY: "/api/seed-image/placeholders/xray.svg",
  MONITOR: "/api/seed-image/placeholders/other.svg",
  OTHER: "/api/seed-image/placeholders/other.svg",
};

interface EquipmentThumbnailProps {
  item: SeedEquipment;
  imageClassName?: string;
  priority?: boolean;
}

export function EquipmentThumbnail({
  item,
  imageClassName,
  priority = false,
}: EquipmentThumbnailProps) {
  const src = getEquipmentImageSrc(item) ?? PLACEHOLDER[item.category];

  return (
    <Image
      src={src}
      alt={item.image?.alt ?? item.name}
      width={400}
      height={300}
      className={imageClassName}
      priority={priority}
      unoptimized={src.endsWith(".svg")}
    />
  );
}
