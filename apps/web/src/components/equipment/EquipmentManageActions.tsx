"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteEquipment } from "@/lib/api/equipment.api";
import { canManageEquipment } from "@/lib/auth/roles";
import { equipmentDetailPath, MONITORING_BASE } from "@/lib/navigation/paths";
import { useAuth } from "@/providers/AuthProvider";
import { DeleteEquipmentDialog } from "./DeleteEquipmentDialog";
import { EquipmentActionsMenu } from "./EquipmentActionsMenu";

interface EquipmentManageActionsProps {
  equipmentSlug: string;
  equipmentName: string;
  /** 삭제 후 이동 경로 (기본: 모니터링 목록) */
  afterDeleteHref?: string;
}

export function EquipmentManageActions({
  equipmentSlug,
  equipmentName,
  afterDeleteHref = MONITORING_BASE,
}: EquipmentManageActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!canManageEquipment(user?.role)) return null;

  const editHref = `${equipmentDetailPath(equipmentSlug)}/edit`;

  async function handleDelete() {
    await deleteEquipment(equipmentSlug);
    router.push(afterDeleteHref);
    router.refresh();
  }

  return (
    <>
      <EquipmentActionsMenu
        onEdit={() => router.push(editHref)}
        onDelete={() => setDeleteOpen(true)}
      />
      <DeleteEquipmentDialog
        open={deleteOpen}
        equipmentName={equipmentName}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
