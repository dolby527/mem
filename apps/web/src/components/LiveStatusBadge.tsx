"use client";

import type { EquipmentStatus } from "@/lib/types";
import { useLiveEquipmentStatus } from "./MonitoringLiveProvider";
import { StatusBadge } from "./StatusBadge";

interface LiveStatusBadgeProps {
  equipmentSlug: string;
  fallback: EquipmentStatus;
  size?: "sm" | "md";
}

export function LiveStatusBadge({
  equipmentSlug,
  fallback,
  size = "md",
}: LiveStatusBadgeProps) {
  const status = useLiveEquipmentStatus(equipmentSlug, fallback);
  return <StatusBadge status={status} size={size} />;
}
