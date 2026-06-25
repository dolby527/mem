"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { HospitalMember, HospitalMemberRole } from "@/lib/api/users.api";
import * as btn from "./manageButtons.css";
import * as modal from "./inviteUserModal.css";

interface ChangeRoleModalProps {
  open: boolean;
  member: HospitalMember | null;
  onClose: () => void;
  onSave: (userId: string, role: HospitalMemberRole) => void;
  isSubmitting?: boolean;
}

const ROLE_LABELS: Record<HospitalMemberRole, string> = {
  HOSPITAL_ADMIN: "병원 관리자",
  HOSPITAL_USER: "병원 사용자",
};

function ChangeRoleModalBody({
  member,
  onClose,
  onSave,
  isSubmitting,
}: {
  member: HospitalMember;
  onClose: () => void;
  onSave: (userId: string, role: HospitalMemberRole) => void;
  isSubmitting?: boolean;
}) {
  const [role, setRole] = useState<HospitalMemberRole>(() => member.role);

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
          aria-labelledby="role-title"
        >
          <div className={modal.inviteModalScroll}>
            <h2 id="role-title" className={modal.modalTitle}>
              권한 변경
            </h2>
            <div className={modal.modalField}>
              <label className={modal.modalLabel}>이름</label>
              <input
                className={modal.modalInput}
                readOnly
                value={member.name}
              />
            </div>
            <div className={modal.modalField}>
              <label className={modal.modalLabel}>이메일</label>
              <input
                className={modal.modalInput}
                readOnly
                value={member.email}
              />
            </div>
            <div className={modal.modalField}>
              <label className={modal.modalLabel} htmlFor="role-select">
                권한
              </label>
              <select
                id="role-select"
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
                disabled={isSubmitting || role === member.role}
                onClick={() => onSave(member.id, role)}
              >
                {isSubmitting ? "저장 중…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ChangeRoleModal({
  open,
  member,
  onClose,
  onSave,
  isSubmitting,
}: ChangeRoleModalProps) {
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
    <ChangeRoleModalBody
      key={member.id}
      member={member}
      onClose={onClose}
      onSave={onSave}
      isSubmitting={isSubmitting}
    />,
    document.body,
  );
}
