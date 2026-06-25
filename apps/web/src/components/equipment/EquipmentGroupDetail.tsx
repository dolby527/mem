"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EquipmentThumbnail } from "@/components/EquipmentThumbnail";
import { LiveStatusBadge } from "@/components/LiveStatusBadge";
import { MaintenanceBadge } from "@/components/MaintenanceBadge";
import { formatDateTimeKorea, formatManufacturedDate } from "@/lib/datetime";
import { equipmentDetailPath } from "@/lib/navigation/paths";
import { formatSpatialLabel } from "@/lib/navigation/spatial";
import type { EquipmentWithHospital } from "@/lib/types";
import * as l from "@/styles/layout.css";

interface EquipmentGroupDetailProps {
  equipment: EquipmentWithHospital[];
}

function formatManufacturerModel(item: EquipmentWithHospital): string {
  return [item.manufacturer, item.model].filter(Boolean).join(" · ") || "—";
}

function compareByLocation(
  a: EquipmentWithHospital,
  b: EquipmentWithHospital,
): number {
  const loc = formatSpatialLabel(a).localeCompare(
    formatSpatialLabel(b),
    "ko",
  );
  if (loc !== 0) return loc;
  return a.equipmentSlug.localeCompare(b.equipmentSlug, "ko");
}

export function EquipmentGroupDetail({ equipment }: EquipmentGroupDetailProps) {
  const sorted = useMemo(
    () => [...equipment].sort(compareByLocation),
    [equipment],
  );

  const representative = sorted[0];
  if (!representative) return null;

  return (
    <article className={l.card}>
      <div className={l.detailHero}>
        <EquipmentThumbnail
          item={representative}
          imageClassName={l.detailHeroImage}
          priority
        />
      </div>
      <div className={l.cardBody}>
        <p className={l.sectionHint}>
          동일 품목 {sorted.length}대 · 아래 목록에서 개별 장비를 확인할 수
          있습니다.
        </p>
        <div className={l.tableWrap}>
          <table className={l.table}>
            <thead className={l.tableHead}>
              <tr>
                <th className={l.th}>장비 위치</th>
                <th className={l.thHiddenMobile}>제조사 / 모델</th>
                <th className={l.th}>제조연월일</th>
                <th className={l.th}>장비 ID</th>
                <th className={l.th}>가동 상태</th>
                <th className={l.th}>PM 예정</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.equipmentSlug} className={l.tr}>
                  <td className={l.td}>
                    <span className={l.tableCategory}>
                      {formatSpatialLabel(item)}
                    </span>
                    <p className={l.tableSubtext}>
                      {formatManufacturerModel(item)}
                    </p>
                  </td>
                  <td className={l.tdHiddenMobile}>
                    {formatManufacturerModel(item)}
                  </td>
                  <td className={l.td}>
                    <span className={l.tableDateCell}>
                      {formatManufacturedDate(item.manufacturedAt)}
                    </span>
                  </td>
                  <td className={l.td}>
                    <Link
                      href={equipmentDetailPath(item.equipmentSlug)}
                      className={l.tableLink}
                    >
                      {item.equipmentSlug}
                    </Link>
                  </td>
                  <td className={l.td}>
                    <LiveStatusBadge
                      equipmentSlug={item.equipmentSlug}
                      fallback={item.demoStatus}
                      size="sm"
                    />
                  </td>
                  <td className={l.td}>
                    {item.maintenanceStatus === "PM_SCHEDULED" ? (
                      <span className={l.tablePmCell}>
                        <MaintenanceBadge
                          status={item.maintenanceStatus}
                          size="sm"
                        />
                        {item.pmScheduledAt ? (
                          <span className={l.tablePmDate}>
                            {formatDateTimeKorea(item.pmScheduledAt, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span className={l.tableSubtext}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
