"use client";

import type { StatusSourceType, VendorInterfaceType } from "@/lib/types";
import {
  formatPrimarySourceLabel,
  formatStatusResolvedLabel,
} from "@/lib/status-source";
import * as s from "./StatusSourceBadge.css";

interface StatusSourceBadgeProps {
  statusSourceType: StatusSourceType;
  statusResolvedFrom?: StatusSourceType | null;
  vendorInterfaceType?: VendorInterfaceType | null;
  fallbackSourceType?: StatusSourceType | null;
  compact?: boolean;
}

export function StatusSourceBadge({
  statusSourceType,
  statusResolvedFrom,
  vendorInterfaceType,
  fallbackSourceType,
  compact = false,
}: StatusSourceBadgeProps) {
  const resolved = formatStatusResolvedLabel(
    statusResolvedFrom ?? statusSourceType,
    vendorInterfaceType,
  );
  const primary = formatPrimarySourceLabel(
    statusSourceType,
    vendorInterfaceType,
  );

  if (compact) {
    return (
      <span className={s.badge} title={`판별: ${resolved}`}>
        {resolved}
      </span>
    );
  }

  return (
    <div className={s.wrap}>
      <span className={s.badge} title="최근 판별 근거">
        판별: {resolved}
      </span>
      {fallbackSourceType ? (
        <span className={s.sub} title="primary / fallback">
          {primary} · fallback {fallbackSourceType}
        </span>
      ) : (
        <span className={s.sub}>{primary}</span>
      )}
    </div>
  );
}
