"use client";

import { useMemo } from "react";
import * as styles from "./paginationBar.css";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: "default" | "large";
  mode?: "ellipsis" | "all";
  className?: string;
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  size = "default",
  mode = "all",
  className,
}: PaginationBarProps) {
  const items = useMemo(() => {
    if (mode === "all") {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return [currentPage];
  }, [currentPage, totalPages, mode]);

  if (totalPages <= 1) return null;

  const isLarge = size === "large";
  const btnClass = isLarge ? styles.btnLarge : styles.btn;
  const arrowBtnClass = isLarge ? styles.arrowBtnLarge : styles.arrowBtn;
  const navClass = [styles.nav, className].filter(Boolean).join(" ");

  return (
    <nav className={navClass} aria-label="페이지">
      <button
        type="button"
        className={arrowBtnClass}
        disabled={currentPage <= 1}
        aria-label="이전 페이지"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        ‹
      </button>
      {items.map((p) => (
        <button
          key={p}
          type="button"
          className={`${btnClass} ${p === currentPage ? styles.btnActive : ""}`}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {String(p)}
        </button>
      ))}
      <button
        type="button"
        className={arrowBtnClass}
        disabled={currentPage >= totalPages}
        aria-label="다음 페이지"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        ›
      </button>
    </nav>
  );
}
