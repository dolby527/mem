"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postLoginPath } from "@/lib/auth/authPaths";
import { useAuth } from "@/providers/AuthProvider";
import * as s from "../auth.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      router.push(postLoginPath());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>로그인</h1>
        <p className={s.subtitle}>MEM 의료장비 관리</p>
        <form className={s.form} onSubmit={onSubmit}>
          <label className={s.field}>
            <span className={s.label}>이메일</span>
            <input
              className={s.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>비밀번호</span>
            <input
              className={s.input}
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className={s.error}>{error}</p>}
          <button className={s.button} type="submit" disabled={pending}>
            {pending ? "로그인 중…" : "로그인"}
          </button>
        </form>
        <p className={s.linkRow}>
          병원 최초 등록 ·{" "}
          <Link href="/signup/hospital-admin" className={s.link}>
            병원 관리자 가입
          </Link>
        </p>
      </div>
    </div>
  );
}
