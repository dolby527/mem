"use client";

import Link from "next/link";
import * as s from "./appGnb.css";

export function GuestGnb() {
  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Link href="/" className={s.logoLink}>
          <span className={s.logoKicker}>MEM</span>
          <span className={s.logoTitle}>의료장비 관리</span>
        </Link>
        <nav className={s.guestActions} aria-label="게스트 메뉴">
          <Link href="/login" className={s.guestLink}>
            로그인
          </Link>
          <Link href="/signup/hospital-admin" className={s.guestCta}>
            병원 관리자 가입
          </Link>
        </nav>
      </div>
    </header>
  );
}
