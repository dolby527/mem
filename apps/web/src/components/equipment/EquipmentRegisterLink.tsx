"use client";

import Link from "next/link";
import { canManageEquipment } from "@/lib/auth/roles";
import { MONITORING_BASE } from "@/lib/navigation/paths";
import { useAuth } from "@/providers/AuthProvider";
import * as l from "@/styles/layout.css";

export function EquipmentRegisterLink() {
  const { user } = useAuth();
  if (!canManageEquipment(user?.role)) return null;

  return (
    <Link href={`${MONITORING_BASE}/equipments/new`} className={l.linkAccent}>
      + 장비 등록
    </Link>
  );
}
