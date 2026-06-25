"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import * as styles from "./settingsLayout.css";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (user?.role !== "HOSPITAL_ADMIN") {
    return null;
  }

  const usersActive =
    pathname === "/settings/users" || pathname.startsWith("/settings/users/");
  const faqActive = pathname.startsWith("/settings/faq");

  return (
    <div className={styles.shell}>
      <div
        className={styles.subNavTabs}
        role="tablist"
        aria-label="관리 하위 메뉴"
      >
        <Link
          href="/settings/users"
          role="tab"
          aria-selected={usersActive}
          className={`${styles.tabBtn} ${usersActive ? styles.tabBtnActive : ""}`}
        >
          사용자 관리
        </Link>
        <Link
          href="/settings/faq"
          role="tab"
          aria-selected={faqActive}
          className={`${styles.tabBtn} ${faqActive ? styles.tabBtnActive : ""}`}
        >
          FAQ 관리
        </Link>
      </div>
      <div className={styles.mainCol}>{children}</div>
    </div>
  );
}
