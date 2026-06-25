"use client";

import Link from "next/link";
import { EquipmentManageActions } from "@/components/equipment/EquipmentManageActions";
import { equipmentDetailPath } from "@/lib/navigation/paths";
import { formatSpatialLabel } from "@/lib/navigation/spatial";
import type { EquipmentWithHospital } from "@/lib/types";
import { EquipmentStatusTimes } from "@/components/equipment/EquipmentStatusTimes";
import { EquipmentThumbnail } from "./EquipmentThumbnail";
import {
  useLiveEquipmentStatus,
  useLiveLastCheckedAt,
  useLiveStatusSinceAt,
} from "./MonitoringLiveProvider";
import { StatusBadge } from "./StatusBadge";
import { MaintenanceBadge } from "./MaintenanceBadge";
import * as s from "./EquipmentCard.css";

interface EquipmentCardProps {
  item: EquipmentWithHospital;
  compact?: boolean;
}

export function EquipmentCard({ item, compact = false }: EquipmentCardProps) {
  const status = useLiveEquipmentStatus(item.equipmentSlug, item.demoStatus);
  const lastCheckedAt =
    useLiveLastCheckedAt(item.equipmentSlug, item.lastCheckedAt) ??
    item.lastCheckedAt ??
    null;
  const statusSinceAt =
    useLiveStatusSinceAt(item.equipmentSlug, item.statusSinceAt) ??
    item.statusSinceAt ??
    null;

  return (
    <article className={compact ? `${s.card} ${s.cardCompact}` : s.card}>
      <Link href={equipmentDetailPath(item.equipmentSlug)} className={s.cardLink}>
        <div className={s.thumbWrap}>
          <EquipmentThumbnail item={item} imageClassName={s.thumbImage} />
        </div>
        <div className={compact ? `${s.body} ${s.bodyCompact}` : s.body}>
          <div className={s.titleRow}>
            <h3 className={s.title}>{item.name}</h3>
            <div className={s.badgeStack}>
              <StatusBadge status={status} size="sm" />
              <MaintenanceBadge status={item.maintenanceStatus} size="sm" />
            </div>
          </div>
          <div className={s.metaRow}>
            <p className={s.location}>{formatSpatialLabel(item)}</p>
          </div>
          <EquipmentStatusTimes
            status={status}
            statusSinceAt={statusSinceAt}
            lastCheckedAt={lastCheckedAt}
          />
          <p className={s.equipmentId} title={item.equipmentSlug}>
            {item.equipmentSlug}
          </p>
        </div>
      </Link>
      <div className={s.menuWrap}>
        <EquipmentManageActions
          equipmentSlug={item.equipmentSlug}
          equipmentName={item.name}
        />
      </div>
    </article>
  );
}
