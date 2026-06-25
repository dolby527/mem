"use client";

import { useState } from "react";
import type { HospitalMember } from "@/lib/api/users.api";
import * as btn from "./manageButtons.css";
import * as styles from "./memberRow.css";
import { MemberRowMenu } from "./MemberRowMenu";
import { RoleLabel } from "./RoleLabel";

interface MemberRowProps {
  member?: HospitalMember;
  placeholder?: boolean;
  currentUserId?: string;
  onDelete?: () => void;
  onChangeRole?: () => void;
}

export function MemberRow({
  member,
  placeholder = false,
  currentUserId,
  onDelete,
  onChangeRole,
}: MemberRowProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (placeholder || !member) {
    return (
      <div className={styles.memberRowPlaceholder} role="row" aria-hidden />
    );
  }

  const isSelf = currentUserId === member.id;

  return (
    <div className={styles.memberRow} role="row">
      <div className={styles.cellIdentity}>
        <div className={styles.avatar}>
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.identityText}>
          <div className={styles.nameRoleRow}>
            <span className={styles.nameCell}>{member.name}</span>
            <RoleLabel
              role={member.role}
              variant="badge"
              className={styles.roleBadgeInline}
            />
          </div>
          <span className={styles.emailInLead}>{member.email}</span>
        </div>
      </div>

      <div className={styles.cellEmail}>
        <span className={styles.emailCell}>{member.email}</span>
      </div>

      <div className={styles.cellRole}>
        <RoleLabel role={member.role} variant="text" />
      </div>

      <div className={styles.cellActions}>
        {isSelf ? (
          <span className={styles.selfNote}>본인</span>
        ) : (
          <>
            <div className={styles.actionsMobile}>
              <MemberRowMenu
                memberId={member.id}
                openMenuId={openMenuId}
                onToggle={(id) =>
                  setOpenMenuId((prev) => (prev === id ? null : id))
                }
                onClose={() => setOpenMenuId(null)}
                onDelete={() => onDelete?.()}
                onChangeRole={() => onChangeRole?.()}
              />
            </div>
            <div className={styles.actionsDesktop}>
              <button
                type="button"
                className={btn.btnGray}
                onClick={onDelete}
              >
                계정 탈퇴
              </button>
              <button
                type="button"
                className={btn.btnNavy}
                onClick={onChangeRole}
              >
                권한 변경
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
