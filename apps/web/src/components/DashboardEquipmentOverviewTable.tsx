import Link from "next/link";
import { aggregateEquipmentOverview } from "@/lib/equipment/aggregate-overview";
import { equipmentGroupPath } from "@/lib/navigation/paths";
import {
  EQUIPMENT_CATEGORY_LABELS,
  STATUS_SOURCE_LABELS,
} from "@/lib/status-source";
import type { EquipmentWithHospital } from "@/lib/types";
import * as l from "@/styles/layout.css";

interface DashboardEquipmentOverviewTableProps {
  equipment: EquipmentWithHospital[];
}

export function DashboardEquipmentOverviewTable({
  equipment,
}: DashboardEquipmentOverviewTableProps) {
  const rows = aggregateEquipmentOverview(equipment);
  const totalCount = equipment.length;
  const kindCount = rows.length;

  if (rows.length === 0) {
    return (
      <p className={l.sectionHint}>등록된 장비가 없습니다.</p>
    );
  }

  return (
    <div className={l.tableWrap}>
      <table className={l.table}>
        <thead className={l.tableHead}>
          <tr>
            <th className={l.th}>분류</th>
            <th className={l.th}>장비명</th>
            <th className={`${l.th} ${l.thNumeric}`}>개수</th>
            <th className={l.thHiddenMobile}>판별</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const showCategory =
              index === 0 || rows[index - 1].category !== row.category;
            const isGroupStart = index > 0 && showCategory;
            const isContinuation = index > 0 && !showCategory;
            const dividerFromName = isGroupStart || isContinuation;

            return (
              <tr
                key={`${row.category}-${row.name}-${row.statusSourceType}`}
                className={l.trOverview}
              >
                <td
                  className={`${l.td} ${
                    isGroupStart
                      ? l.tableOverviewDivider
                      : isContinuation
                        ? l.tableOverviewCategoryContinuation
                        : ""
                  }`}
                >
                  {showCategory ? (
                    <span className={l.tableCategory}>
                      {EQUIPMENT_CATEGORY_LABELS[row.category]}
                    </span>
                  ) : null}
                  <p className={l.tableSubtext}>
                    {STATUS_SOURCE_LABELS[row.statusSourceType]}
                  </p>
                </td>
                <td
                  className={`${l.td} ${dividerFromName ? l.tableOverviewDivider : ""}`}
                >
                  <Link
                    href={equipmentGroupPath({
                      category: row.category,
                      name: row.name,
                      statusSourceType: row.statusSourceType,
                    })}
                    className={l.tableLink}
                  >
                    {row.name}
                  </Link>
                </td>
                <td
                  className={`${l.td} ${l.tdNumeric} ${dividerFromName ? l.tableOverviewDivider : ""}`}
                >
                  {row.count}
                </td>
                <td
                  className={`${l.tdHiddenMobile} ${dividerFromName ? l.tableOverviewDivider : ""}`}
                >
                  {STATUS_SOURCE_LABELS[row.statusSourceType]}
                </td>
              </tr>
            );
          })}
          <tr className={l.tr}>
            <td className={`${l.td} ${l.tableFooterLabel}`} colSpan={2}>
              합계 · {kindCount}종
            </td>
            <td className={`${l.td} ${l.tdNumeric} ${l.tableFooterLabel}`}>
              {totalCount}
            </td>
            <td className={l.tdHiddenMobile} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
