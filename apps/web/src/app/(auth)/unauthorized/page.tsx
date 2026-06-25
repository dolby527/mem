import Link from "next/link";
import * as s from "../auth.css";

export default function UnauthorizedPage() {
  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>접근 권한 없음</h1>
        <p className={s.subtitle}>이 페이지에 접근할 수 있는 권한이 없습니다.</p>
        <p className={s.linkRow}>
          <Link href="/" className={s.link}>
            대시보드로
          </Link>
          {" · "}
          <Link href="/login" className={s.link}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
