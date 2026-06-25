"use client";

import * as l from "@/styles/layout.css";

interface EquipmentRecheckButtonProps {
  pending?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}

export function EquipmentRecheckButton({
  pending = false,
  disabled = false,
  onClick,
  label = "재확인",
}: EquipmentRecheckButtonProps) {
  return (
    <button
      type="button"
      className={l.tableRecheckBtn}
      onClick={onClick}
      disabled={disabled || pending}
      title="연결 상태 즉시 재확인"
      aria-busy={pending}
    >
      {pending ? "확인 중…" : label}
    </button>
  );
}

interface AttentionRecheckAllButtonProps {
  pending?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function AttentionRecheckAllButton({
  pending = false,
  disabled = false,
  onClick,
}: AttentionRecheckAllButtonProps) {
  return (
    <EquipmentRecheckButton
      pending={pending}
      disabled={disabled}
      onClick={onClick}
      label="전체 재확인"
    />
  );
}
