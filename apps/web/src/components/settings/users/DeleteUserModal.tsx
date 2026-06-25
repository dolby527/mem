"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { HospitalMember } from "@/lib/api/users.api";
import * as btn from "./manageButtons.css";
import * as modal from "./inviteUserModal.css";

interface DeleteUserModalProps {
  open: boolean;
  member: HospitalMember | null;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function DeleteUserModal({
  open,
  member,
  onClose,
  onConfirm,
  isSubmitting,
}: DeleteUserModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !member || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className={modal.modalBackdrop}
        role="presentation"
        onClick={onClose}
      />
      <div className={modal.deleteModalViewport}>
        <div
          className={modal.deleteModalCard}
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-title"
        >
          <div className={modal.deleteModalBody}>
            <h2 id="del-title" className={modal.deleteModalTitle}>
              계정 탈퇴
            </h2>
            <p className={modal.deleteMsg}>
              {member.name}({member.email})님의 계정을 탈퇴 처리할까요?
              <br />
              <br />
              탈퇴 후에는 복구할 수 없습니다.
            </p>
          </div>
          <div className={modal.deleteModalFooter}>
            <button
              type="button"
              className={btn.btnCreamOutline}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className={btn.btnDangerBlock}
              disabled={isSubmitting}
              onClick={onConfirm}
            >
              {isSubmitting ? "처리 중…" : "탈퇴 처리"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
