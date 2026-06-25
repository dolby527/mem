import type { EquipmentStatus, EquipmentWithHospital } from "@/lib/types";
import { STATUS_LABELS, countByStatus } from "@/lib/status";
import {
  statusSummaryCard,
  statusSummaryCount,
  statusSummaryGrid,
  statusSummaryLabel,
} from "@/styles/status.css";

const ORDER: EquipmentStatus[] = ["RUNNING", "IDLE", "FAULT", "OFFLINE"];

interface StatusSummaryProps {
  equipment: EquipmentWithHospital[];
}

export function StatusSummary({ equipment }: StatusSummaryProps) {
  const counts = countByStatus(equipment);

  return (
    <div className={statusSummaryGrid}>
      {ORDER.map((status) => (
        <div key={status} className={statusSummaryCard({ status })}>
          <p className={statusSummaryLabel}>{STATUS_LABELS[status]}</p>
          <p className={statusSummaryCount}>{counts[status]}</p>
        </div>
      ))}
    </div>
  );
}
