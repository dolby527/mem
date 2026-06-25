"use client";

import { useCallback, useState } from "react";
import { createInviteApi } from "@/lib/api/invite.api";
import {
  deleteHospitalMember,
  updateHospitalMemberRole,
  type HospitalMember,
  type HospitalMemberRole,
} from "@/lib/api/users.api";
import { ChangeRoleModal } from "./ChangeRoleModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { InviteUserModal } from "./InviteUserModal";
import * as pageStyles from "./managePage.css";

interface UserModalsProps {
  inviteOpen: boolean;
  setInviteOpen: (open: boolean) => void;
  roleMember: HospitalMember | null;
  setRoleMember: (member: HospitalMember | null) => void;
  deleteMember: HospitalMember | null;
  setDeleteMember: (member: HospitalMember | null) => void;
  onMembersChanged: () => void;
}

export function UserModals({
  inviteOpen,
  setInviteOpen,
  roleMember,
  setRoleMember,
  deleteMember,
  setDeleteMember,
  onMembersChanged,
}: UserModalsProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const [toastVariant, setToastVariant] = useState<"error" | "success">(
    "success",
  );
  const [invitePending, setInvitePending] = useState(false);
  const [rolePending, setRolePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const showToast = useCallback(
    (text: string, variant: "error" | "success" = "success") => {
      setToastText(text);
      setToastVariant(variant);
      setToastOpen(true);
      globalThis.setTimeout(() => setToastOpen(false), 2800);
    },
    [],
  );

  async function handleInvite(data: {
    name: string;
    email: string;
    role: HospitalMemberRole;
  }) {
    setInvitePending(true);
    try {
      await createInviteApi(data);
      setInviteOpen(false);
      showToast("초대 링크가 생성되었습니다.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "초대 생성에 실패했습니다.",
        "error",
      );
    } finally {
      setInvitePending(false);
    }
  }

  async function handleRoleSave(userId: string, role: HospitalMemberRole) {
    setRolePending(true);
    try {
      await updateHospitalMemberRole(userId, role);
      setRoleMember(null);
      onMembersChanged();
      showToast("권한이 변경되었습니다.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "권한 변경에 실패했습니다.",
        "error",
      );
    } finally {
      setRolePending(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteMember) return;
    setDeletePending(true);
    try {
      await deleteHospitalMember(deleteMember.id);
      setDeleteMember(null);
      onMembersChanged();
      showToast("사용자가 탈퇴 처리되었습니다.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "탈퇴 처리에 실패했습니다.",
        "error",
      );
    } finally {
      setDeletePending(false);
    }
  }

  const toastClass = [
    pageStyles.toast,
    toastOpen ? pageStyles.toastVisible : "",
    toastVariant === "error" ? pageStyles.toastError : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div role="alert" className={toastClass}>
        {toastText}
      </div>
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        isSubmitting={invitePending}
        onSubmit={(data) => void handleInvite(data)}
      />
      <ChangeRoleModal
        open={roleMember !== null}
        member={roleMember}
        onClose={() => setRoleMember(null)}
        isSubmitting={rolePending}
        onSave={(id, role) => void handleRoleSave(id, role)}
      />
      <DeleteUserModal
        open={deleteMember !== null}
        member={deleteMember}
        onClose={() => setDeleteMember(null)}
        isSubmitting={deletePending}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  );
}
