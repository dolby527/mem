"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUpHospitalApi } from "@/lib/api/auth.api";
import * as s from "../../auth.css";

export default function HospitalAdminSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalSlug, setHospitalSlug] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await signUpHospitalApi({
        email: email.trim(),
        name: name.trim(),
        hospitalName: hospitalName.trim(),
        hospitalSlug: hospitalSlug.trim().toLowerCase(),
        password,
        confirmPassword,
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>병원 관리자 가입</h1>
        <p className={s.subtitle}>
          새 병원을 등록하고 첫 HOSPITAL_ADMIN 계정을 만듭니다.
        </p>
        <form className={s.form} onSubmit={onSubmit}>
          <label className={s.field}>
            <span className={s.label}>이메일</span>
            <input
              className={s.input}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>이름</span>
            <input
              className={s.input}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>병원명</span>
            <input
              className={s.input}
              type="text"
              required
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>병원 슬러그 (kebab-case)</span>
            <input
              className={s.input}
              type="text"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="my-hospital"
              value={hospitalSlug}
              onChange={(e) => setHospitalSlug(e.target.value)}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>비밀번호</span>
            <input
              className={s.input}
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>비밀번호 확인</span>
            <input
              className={s.input}
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          {error && <p className={s.error}>{error}</p>}
          <button className={s.button} type="submit" disabled={pending}>
            {pending ? "가입 중…" : "가입 완료"}
          </button>
        </form>
        <p className={s.linkRow}>
          <Link href="/login" className={s.link}>
            로그인으로
          </Link>
        </p>
      </div>
    </div>
  );
}
