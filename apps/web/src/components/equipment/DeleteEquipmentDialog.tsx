"use client";

import { useState } from "react";
import * as s from "./DeleteEquipmentDialog.css";

interface DeleteEquipmentDialogProps {
  open: boolean;
  equipmentName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteEquipmentDialog({
  open,
  equipmentName,
  onClose,
  onConfirm,
}: DeleteEquipmentDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleConfirm() {
    setError(null);
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={s.overlay}
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-equipment-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 id="delete-equipment-title" className={s.title}>
          장비 삭제
        </h2>
        <p className={s.message}>
          <strong>{equipmentName}</strong> 장비를 삭제할까요? 연결된 점검 이력도
          함께 삭제되며 되돌릴 수 없습니다.
        </p>
        {error && <p className={s.error}>{error}</p>}
        <div className={s.actions}>
          <button type="button" className={s.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={s.deleteBtn}
            disabled={pending}
            onClick={() => void handleConfirm()}
          >
            {pending ? "삭제 중…" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
