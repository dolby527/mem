"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EquipmentStatusTimeCell } from "@/components/equipment/EquipmentStatusTimes";
import { equipmentDetailPath } from "@/lib/navigation/paths";
import { formatSpatialLabel } from "@/lib/navigation/spatial";
import { EQUIPMENT_CATEGORY_LABELS } from "@/lib/status-source";
import { compareAttentionEquipment, isAttentionStatus } from "@/lib/status";
import type { EquipmentWithHospital } from "@/lib/types";
import { useMonitoringLive } from "./MonitoringLiveProvider";
import { LiveStatusBadge } from "./LiveStatusBadge";
import { StatusSourceBadge } from "./equipment/StatusSourceBadge";
import {
  AttentionRecheckAllButton,
  EquipmentRecheckButton,
} from "./monitoring/EquipmentRecheckButton";
import { useRecheckEquipment } from "./monitoring/useRecheckEquipment";
import * as l from "@/styles/layout.css";

interface DashboardAttentionTableProps {
  equipment: EquipmentWithHospital[];
}

export function DashboardAttentionTable({
  equipment,
}: DashboardAttentionTableProps) {
  const { getStatus, getLastCheckedAt, getStatusSinceAt } = useMonitoringLive();
  const {
    bulkPending,
    pendingSlugs,
    isSlugPending,
    recheckOne,
    recheckMany,
  } = useRecheckEquipment();

  const attention = useMemo(
    () =>
      equipment
        .map((item) => {
          const demoStatus = getStatus(item.equipmentSlug, item.demoStatus);
          const lastCheckedAt =
            getLastCheckedAt(item.equipmentSlug, item.lastCheckedAt) ??
            item.lastCheckedAt ??
            null;
          const statusSinceAt =
            getStatusSinceAt(item.equipmentSlug, item.statusSinceAt) ??
            item.statusSinceAt ??
            null;
          return {
            ...item,
            demoStatus,
            lastCheckedAt,
            statusSinceAt,
          };
        })
        .filter((e) => isAttentionStatus(e.demoStatus))
        .sort(compareAttentionEquipment),
    [equipment, getStatus, getLastCheckedAt, getStatusSinceAt],
  );

  const attentionSlugs = useMemo(
    () => attention.map((item) => item.equipmentSlug),
    [attention],
  );

  if (attention.length === 0) {
    return (
      <p className={l.sectionHint}>주의가 필요한 장비가 없습니다.</p>
    );
  }

  return (
    <>
      <p className={l.sectionHint}>
        {attention.length}건 · 고장 · 연결 끊김
      </p>
      <div className={l.tableWrap}>
        <table className={l.table}>
          <thead className={l.tableHead}>
            <tr>
              <th className={l.th}>분류</th>
              <th className={l.th}>장비명</th>
              <th className={l.thHiddenMobile}>위치</th>
              <th className={l.th}>상태</th>
              <th className={l.thCenter}>발생시간</th>
              <th className={l.thCenter}>확인시간</th>
              <th className={l.thHiddenMobile}>판별방식</th>
              <th className={l.thCenter}>
                <AttentionRecheckAllButton
                  pending={bulkPending}
                  disabled={bulkPending || pendingSlugs.size > 0}
                  onClick={() => void recheckMany(attentionSlugs)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {attention.map((item) => (
              <tr key={item.equipmentSlug} className={l.tr}>
                <td className={l.td}>
                  <span className={l.tableCategory}>
                    {EQUIPMENT_CATEGORY_LABELS[item.category]}
                  </span>
                </td>
                <td className={l.td}>
                  <Link
                    href={equipmentDetailPath(item.equipmentSlug)}
                    className={l.tableLink}
                  >
                    {item.name}
                  </Link>
                  <p className={l.tableSubtext}>
                    {formatSpatialLabel(item)}
                  </p>
                </td>
                <td className={l.tdHiddenMobile}>
                  {formatSpatialLabel(item)}
                </td>
                <td className={l.td}>
                  <LiveStatusBadge
                    equipmentSlug={item.equipmentSlug}
                    fallback={item.demoStatus}
                    size="sm"
                  />
                </td>
                <td className={l.tdCenter}>
                  <EquipmentStatusTimeCell
                    status={item.demoStatus}
                    iso={item.statusSinceAt}
                    kind="since"
                  />
                </td>
                <td className={l.tdCenter}>
                  <EquipmentStatusTimeCell
                    status={item.demoStatus}
                    iso={item.lastCheckedAt}
                    kind="checked"
                  />
                </td>
                <td className={l.tdHiddenMobile}>
                  <StatusSourceBadge
                    statusSourceType={item.statusSourceType}
                    statusResolvedFrom={item.statusResolvedFrom}
                    vendorInterfaceType={item.vendorInterfaceType}
                    fallbackSourceType={item.fallbackSourceType}
                    compact
                  />
                </td>
                <td className={l.tdCenter}>
                  <span className={l.tableRecheckWrap}>
                    <EquipmentRecheckButton
                      pending={isSlugPending(item.equipmentSlug)}
                      disabled={bulkPending}
                      onClick={() => void recheckOne(item.equipmentSlug)}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
