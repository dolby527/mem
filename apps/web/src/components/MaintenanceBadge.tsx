import type { MaintenanceStatus } from "@/lib/types";
import { MAINTENANCE_LABELS } from "@/lib/maintenance";
import { maintenanceBadge } from "@/styles/maintenance.css";

interface MaintenanceBadgeProps {
  status: MaintenanceStatus;
  size?: "sm" | "md";
}

export function MaintenanceBadge({ status, size = "md" }: MaintenanceBadgeProps) {
  if (status === "NONE") return null;

  return (
    <span className={maintenanceBadge({ status, size })}>
      {MAINTENANCE_LABELS[status]}
    </span>
  );
}
