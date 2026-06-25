"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cookieFetch } from "@/lib/api/cookie-fetch";
import {
  APP_HOME,
  EQUIPMENTS_BASE,
  MAINTENANCE_BASE,
  MONITORING_BASE,
} from "@/lib/navigation/paths";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileAvatar } from "./ProfileAvatar";
import * as s from "./appGnb.css";

const BASE_NAV = [
  { href: APP_HOME, label: "대시보드" },
  { href: MONITORING_BASE, label: "모니터링" },
  { href: EQUIPMENTS_BASE, label: "장비 현황" },
  { href: MAINTENANCE_BASE, label: "장비 보전" },
  { href: "/faq" as const, label: "FAQ" },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === APP_HOME) return pathname === APP_HOME;
  if (href === "/settings/users") {
    return pathname.startsWith("/settings");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AuthenticatedGnb() {
  const pathname = usePathname();
  const { user, logout, isSessionLoading } = useAuth();
  const [resolvedHospitalName, setResolvedHospitalName] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      setResolvedHospitalName(null);
      return;
    }
    if (user.role !== "PLATFORM_ADMIN") {
      setResolvedHospitalName(user.hospital.name);
      return;
    }
    void cookieFetch<{ name: string }>("/hospitals/current")
      .then((h) => setResolvedHospitalName(h.name))
      .catch(() => setResolvedHospitalName(null));
  }, [user]);

  const navItems = [
    ...BASE_NAV,
    ...(user?.role === "HOSPITAL_ADMIN"
      ? [{ href: "/settings/users" as const, label: "관리" }]
      : []),
  ];

  const hospitalName =
    resolvedHospitalName ?? user?.hospital.name ?? "병원";

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Link href={APP_HOME} className={s.logoLink}>
          <span className={s.brandPrimary}>{hospitalName}</span>
          <span className={s.brandSecondary}>MEM(의료장비 관리)</span>
        </Link>

        <nav className={s.authNav} aria-label="주 메뉴">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${s.authNavLink} ${active ? s.authNavLinkActive : s.authNavLinkInactive}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={s.authRight}>
          {user && (
            <Link
              href="/profile"
              className={`${s.profileLink} ${pathname.startsWith("/profile") ? s.profileLinkActive : ""}`}
              aria-label="내 프로필"
            >
              <ProfileAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="sm"
              />
              <span className={s.userName}>{user.name}</span>
            </Link>
          )}
          <button
            type="button"
            className={s.logoutBtn}
            disabled={isSessionLoading}
            onClick={() => void logout()}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
