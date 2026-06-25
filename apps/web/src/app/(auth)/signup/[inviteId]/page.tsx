"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getInviteInfoApi, signUpInviteApi } from "@/lib/api/auth.api";
import { postLoginPath } from "@/lib/auth/authPaths";
import * as s from "../../auth.css";

interface InviteSignupPageProps {
  params: Promise<{ inviteId: string }>;
}

export default function InviteSignupPage({ params }: InviteSignupPageProps) {
  const router = useRouter();
  const [inviteId, setInviteId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void params.then(async ({ inviteId: id }) => {
      setInviteId(id);
      try {
        const info = await getInviteInfoApi(id);
        if (info.isUsed) {
          setError("이미 사용된 초대 링크입니다.");
          return;
        }
        setInviteEmail(info.email);
        setInviteName(info.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "초대 정보를 불러올 수 없습니다.");
      }
    });
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await signUpInviteApi({
        inviteId,
        password,
        confirmPassword,
      });
      router.push(postLoginPath());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>초대 회원가입</h1>
        {inviteName && (
          <p className={s.hint}>
            {inviteName} ({inviteEmail}) 님, 비밀번호를 설정해 주세요.
          </p>
        )}
        <form className={s.form} onSubmit={onSubmit}>
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
          <button className={s.button} type="submit" disabled={pending || !inviteId}>
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
