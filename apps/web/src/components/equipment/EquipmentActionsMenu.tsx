"use client";

import { useEffect, useRef, useState } from "react";
import * as s from "./EquipmentActionsMenu.css";

interface EquipmentActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  label?: string;
}

export function EquipmentActionsMenu({
  onEdit,
  onDelete,
  label = "장비 메뉴",
}: EquipmentActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={s.wrap}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={s.kebabBtn}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={s.kebabIcon} aria-hidden>
          <span className={s.kebabDot} />
          <span className={s.kebabDot} />
          <span className={s.kebabDot} />
        </span>
      </button>
      {open && (
        <div className={s.dropdown} role="menu">
          <button
            type="button"
            className={s.menuItem}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            수정
          </button>
          <button
            type="button"
            className={`${s.menuItem} ${s.menuItemDanger}`}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
