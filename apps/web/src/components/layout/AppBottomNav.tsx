"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  APP_HOME,
  EQUIPMENTS_BASE,
  MAINTENANCE_BASE,
  MONITORING_BASE,
} from "@/lib/navigation/paths";
import { useAuth } from "@/providers/AuthProvider";
import * as s from "./appBottomNav.css";

const BASE_NAV = [
  { href: APP_HOME, label: "대시보드", icon: "◫" },
  { href: MONITORING_BASE, label: "모니터링", icon: "◎" },
  { href: EQUIPMENTS_BASE, label: "장비 현황", icon: "▤" },
  { href: MAINTENANCE_BASE, label: "보전", icon: "🔧" },
  { href: "/faq" as const, label: "FAQ", icon: "?" },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === APP_HOME) return pathname === APP_HOME;
  if (href === "/settings/users") {
    return pathname.startsWith("/settings");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    ...BASE_NAV,
    ...(user?.role === "HOSPITAL_ADMIN"
      ? [{ href: "/settings/users" as const, label: "관리", icon: "⚙" }]
      : []),
  ];

  const isAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/equipments") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile");

  if (!isAppRoute) return null;

  return (
    <nav className={s.root} aria-label="모바일 메뉴">
      {navItems.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${s.link} ${active ? s.linkActive : s.linkInactive}`}
          >
            <span className={s.icon}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
