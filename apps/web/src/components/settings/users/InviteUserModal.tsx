"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { HospitalMemberRole } from "@/lib/api/users.api";
import * as btn from "./manageButtons.css";
import * as modal from "./inviteUserModal.css";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    role: HospitalMemberRole;
  }) => void;
  isSubmitting?: boolean;
}

const ROLE_LABELS: Record<HospitalMemberRole, string> = {
  HOSPITAL_ADMIN: "병원 관리자",
  HOSPITAL_USER: "병원 사용자",
};

function InviteUserModalBody({
  onClose,
  onSubmit,
  isSubmitting,
}: Omit<InviteUserModalProps, "open">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<HospitalMemberRole>("HOSPITAL_USER");

  return (
    <>
      <div
        className={modal.modalBackdrop}
        role="presentation"
        onClick={onClose}
      />
      <div className={modal.inviteModalViewport}>
        <div
          className={modal.inviteModalCard}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-title"
        >
          <div className={modal.inviteModalScroll}>
            <h2 id="invite-title" className={modal.modalTitle}>
              사용자 초대
            </h2>
            <div className={modal.modalField}>
              <label className={modal.modalLabel} htmlFor="invite-name">
                이름
              </label>
              <input
                id="invite-name"
                className={modal.modalInput}
                placeholder="이름을 입력해 주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={modal.modalField}>
              <label className={modal.modalLabel} htmlFor="invite-email">
                이메일
              </label>
              <input
                id="invite-email"
                type="email"
                className={modal.modalInput}
                placeholder="이메일을 입력해 주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={modal.modalField}>
              <label className={modal.modalLabel} htmlFor="invite-role">
                권한
              </label>
              <select
                id="invite-role"
                className={modal.modalSelect}
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as HospitalMemberRole)
                }
              >
                {(Object.keys(ROLE_LABELS) as HospitalMemberRole[]).map(
                  (r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div className={btn.modalFooterEqual}>
            <button
              type="button"
              className={btn.modalFooterCancelHalf}
              onClick={onClose}
            >
              취소
            </button>
            <div className={btn.modalFooterPrimaryHalf}>
              <button
                type="button"
                className={btn.modalFooterPrimaryBtn}
                disabled={isSubmitting || !name.trim() || !email.trim()}
                onClick={() =>
                  onSubmit({
                    name: name.trim(),
                    email: email.trim(),
                    role,
                  })
                }
              >
                {isSubmitting ? "처리 중…" : "초대 링크 생성"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function InviteUserModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: InviteUserModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <InviteUserModalBody
      key="invite"
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />,
    document.body,
  );
}
