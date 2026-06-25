"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as menuStyles from "../users/memberRowMenu.css";

const MENU_WIDTH = 140;
const MENU_APPROX_HEIGHT = 96;

interface FaqRowMenuProps {
  itemId: string;
  openMenuId: string | null;
  onToggle: (id: string) => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function FaqRowMenuDropdown({
  anchorRef,
  onClose,
  onEdit,
  onDelete,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const btn = anchorRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    let top = rect.bottom + 4;
    if (top + MENU_APPROX_HEIGHT > window.innerHeight - 8) {
      top = Math.max(8, rect.top - MENU_APPROX_HEIGHT - 4);
    }
    let left = rect.right - MENU_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));
    setPos({ top, left });
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchorRef, onClose]);

  if (!pos || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      className={menuStyles.menuDropdownFixed}
      style={{ top: pos.top, left: pos.left }}
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        className={menuStyles.menuItem}
        onClick={() => {
          onClose();
          onEdit();
        }}
      >
        수정
      </button>
      <button
        type="button"
        role="menuitem"
        className={`${menuStyles.menuItem} ${menuStyles.menuItemDanger}`}
        onClick={() => {
          onClose();
          onDelete();
        }}
      >
        삭제
      </button>
    </div>,
    document.body,
  );
}

export function FaqRowMenu({
  itemId,
  openMenuId,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}: FaqRowMenuProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const open = openMenuId === itemId;

  return (
    <div className={menuStyles.menuWrap}>
      <button
        ref={btnRef}
        type="button"
        className={menuStyles.menuBtn}
        aria-label="FAQ 메뉴"
        aria-expanded={open}
        onClick={() => onToggle(itemId)}
      >
        <span className={menuStyles.menuIcon} aria-hidden>
          ⋮
        </span>
      </button>
      {open ? (
        <FaqRowMenuDropdown
          anchorRef={btnRef}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  );
}
