"use client";

import Link from "next/link";
import { MONITORING_BASE } from "@/lib/navigation/paths";
import * as l from "@/styles/layout.css";
import { EquipmentManageActions } from "./EquipmentManageActions";

interface EquipmentDetailToolbarProps {
  equipmentSlug: string;
  equipmentName: string;
}

export function EquipmentDetailToolbar({
  equipmentSlug,
  equipmentName,
}: EquipmentDetailToolbarProps) {
  return (
    <div className={l.sectionHeaderRow}>
      <Link href={MONITORING_BASE} className={l.linkAccent}>
        ← 모니터링 목록
      </Link>
      <EquipmentManageActions
        equipmentSlug={equipmentSlug}
        equipmentName={equipmentName}
      />
    </div>
  );
}
