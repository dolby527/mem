"use client";

import { useEffect, useRef } from "react";
import * as styles from "./memberRowMenu.css";

interface MemberRowMenuProps {
  memberId: string;
  openMenuId: string | null;
  onToggle: (id: string) => void;
  onClose: () => void;
  onDelete: () => void;
  onChangeRole: () => void;
}

export function MemberRowMenu({
  memberId,
  openMenuId,
  onToggle,
  onClose,
  onDelete,
  onChangeRole,
}: MemberRowMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const open = openMenuId === memberId;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div className={styles.menuWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-label="사용자 메뉴"
        aria-expanded={open}
        onClick={() => onToggle(memberId)}
      >
        <span className={styles.menuIcon} aria-hidden>
          ⋮
        </span>
      </button>
      {open ? (
        <div className={styles.menuDropdown} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              onClose();
              onChangeRole();
            }}
          >
            권한 변경
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={() => {
              onClose();
              onDelete();
            }}
          >
            계정 탈퇴
          </button>
        </div>
      ) : null}
    </div>
  );
}
