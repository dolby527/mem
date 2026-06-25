"use client";

import { usePathname } from "next/navigation";
import { AuthenticatedGnb } from "./AuthenticatedGnb";
import { GuestGnb } from "./GuestGnb";

function isInviteSignupPath(pathname: string): boolean {
  return /^\/signup\/[^/]+$/.test(pathname) && pathname !== "/signup/hospital-admin";
}

function isAppRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/equipments") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile")
  );
}

export function AppGnb() {
  const pathname = usePathname();

  if (
    pathname === "/login" ||
    pathname === "/signup/hospital-admin" ||
    isInviteSignupPath(pathname)
  ) {
    return null;
  }

  if (pathname === "/" || pathname === "/unauthorized") {
    return <GuestGnb />;
  }

  if (isAppRoute(pathname)) {
    return <AuthenticatedGnb />;
  }

  return null;
}
