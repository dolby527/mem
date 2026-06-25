import { formatCheckedAtCompact } from "@/lib/datetime";
import {
  lastCheckedLabel,
  statusSinceLabel,
} from "@/lib/equipment/status-display-time";
import type { EquipmentStatus } from "@/lib/types";
import * as l from "@/styles/layout.css";
import * as s from "../EquipmentCard.css";

interface EquipmentStatusTimesProps {
  status: EquipmentStatus;
  statusSinceAt: string | null;
  lastCheckedAt: string | null;
}

interface EquipmentTimeValueProps {
  iso: string | null;
  label: string;
  className?: string;
}

function EquipmentTimeValue({ iso, label, className }: EquipmentTimeValueProps) {
  if (!iso) {
    return <span className={className ?? l.tableCheckedAt}>—</span>;
  }

  return (
    <time className={className ?? l.tableCheckedAt} dateTime={iso} title={label}>
      {formatCheckedAtCompact(iso)}
    </time>
  );
}

/** 장비 카드 — 발생 · 확인 2행 */
export function EquipmentStatusTimes({
  status,
  statusSinceAt,
  lastCheckedAt,
}: EquipmentStatusTimesProps) {
  const sinceLabel = statusSinceLabel(status);
  const checkedLabel = lastCheckedLabel(status);

  return (
    <div className={s.timeRow}>
      <div className={s.timeItem}>
        <span className={s.timeLabel}>{sinceLabel}</span>
        <EquipmentTimeValue
          iso={statusSinceAt}
          label={sinceLabel}
          className={s.timeValue}
        />
      </div>
      <div className={s.timeItem}>
        <span className={s.timeLabel}>{checkedLabel}</span>
        <EquipmentTimeValue
          iso={lastCheckedAt}
          label={checkedLabel}
          className={s.timeValue}
        />
      </div>
    </div>
  );
}

interface EquipmentStatusTimeCellProps {
  status: EquipmentStatus;
  iso: string | null;
  kind: "since" | "checked";
}

/** 테이블 셀 — 발생시간 또는 확인시간 한 칸 */
export function EquipmentStatusTimeCell({
  status,
  iso,
  kind,
}: EquipmentStatusTimeCellProps) {
  const label = kind === "since" ? statusSinceLabel(status) : lastCheckedLabel(status);

  return (
    <EquipmentTimeValue
      iso={iso}
      label={label}
      className={l.tableCheckedAt}
    />
  );
}
