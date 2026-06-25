import type { EquipmentStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/status";
import { statusChip } from "@/styles/status.css";

interface StatusBadgeProps {
  status: EquipmentStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span className={statusChip({ status, size })}>{STATUS_LABELS[status]}</span>
  );
}
