"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { AdminFaqItem } from "@/lib/api/faqAdmin.api";
import * as btn from "../users/manageButtons.css";
import * as modal from "../users/inviteUserModal.css";

interface DeleteFaqModalProps {
  open: boolean;
  item: AdminFaqItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function DeleteFaqModal({
  open,
  item,
  onClose,
  onConfirm,
  isSubmitting,
}: DeleteFaqModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item || typeof document === "undefined") return null;

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
          aria-labelledby="faq-del-title"
        >
          <div className={modal.deleteModalBody}>
            <h2 id="faq-del-title" className={modal.deleteModalTitle}>
              FAQ 삭제
            </h2>
            <p className={modal.deleteMsg}>
              &quot;{item.question}&quot; 항목을 삭제할까요?
              <br />
              <br />
              삭제 후에는 복구할 수 없습니다.
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
              {isSubmitting ? "처리 중…" : "삭제하기"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
