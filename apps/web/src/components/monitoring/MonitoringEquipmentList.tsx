"use client";

import { EquipmentCard } from "@/components/EquipmentCard";
import { useLiveStatusFilteredEquipment } from "@/lib/monitoring/use-live-status-filter";
import type { EquipmentStatus, EquipmentWithHospital } from "@/lib/types";
import * as monitoring from "@/app/(app)/monitoring/layout.css";
import * as l from "@/styles/layout.css";

interface MonitoringEquipmentListProps {
  equipment: EquipmentWithHospital[];
  statusFilter: EquipmentStatus | "ALL";
  showDomainHint?: boolean;
}

export function MonitoringEquipmentList({
  equipment,
  statusFilter,
  showDomainHint,
}: MonitoringEquipmentListProps) {
  const visible = useLiveStatusFilteredEquipment(equipment, statusFilter);

  if (visible.length === 0) {
    return (
      <div className={l.emptyState}>
        선택한 위치·장비 종류·상태에 맞는 장비가 없습니다.
        {showDomainHint && (
          <p style={{ marginTop: 8, fontSize: 13 }}>
            다른 소분류를 선택하거나 좌측 트리 위치를 바꿔 보세요.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={monitoring.equipmentGrid}>
      {visible.map((item) => (
        <EquipmentCard key={item.equipmentSlug} item={item} compact />
      ))}
    </div>
  );
}
