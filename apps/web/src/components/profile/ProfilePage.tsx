"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  updatePasswordApi,
  updateProfileApi,
} from "@/lib/api/profile.api";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileAvatar } from "@/components/layout/ProfileAvatar";
import * as styles from "./profilePage.css";

export function ProfilePage() {
  const { user, refreshSession } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  if (!user) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>불러오는 중…</p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMessage(null);
    setError(null);

    const trimmedAvatar = avatarUrl.trim();
    const currentAvatar = user.avatarUrl ?? "";
    const avatarChanged = trimmedAvatar !== currentAvatar;
    const passwordFilled =
      newPassword.length > 0 || confirmPassword.length > 0;

    if (!avatarChanged && !passwordFilled) {
      setError("변경할 내용이 없습니다.");
      return;
    }

    if (passwordFilled) {
      if (newPassword.length < 8) {
        setError("비밀번호는 최소 8자 이상이어야 합니다.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setPending(true);
    try {
      if (avatarChanged) {
        const nextAvatar = trimmedAvatar === "" ? null : trimmedAvatar;
        await updateProfileApi(nextAvatar);
      }
      if (passwordFilled) {
        await updatePasswordApi(newPassword, confirmPassword);
        setNewPassword("");
        setConfirmPassword("");
      }
      await refreshSession();
      if (avatarChanged && passwordFilled) {
        setMessage("프로필과 비밀번호가 변경되었습니다.");
      } else if (passwordFilled) {
        setMessage("비밀번호가 변경되었습니다.");
      } else {
        setMessage("아바타가 변경되었습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "저장에 실패했습니다.",
      );
    } finally {
      setPending(false);
    }
  }

  const previewUrl = avatarUrl.trim() || null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>내 프로필</h1>
        <p className={styles.subtitle}>아바타와 비밀번호를 변경할 수 있습니다.</p>

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>계정 정보</h2>
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <dt className={styles.infoTerm}>이름</dt>
                <dd className={styles.infoValue}>{user.name}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoTerm}>이메일</dt>
                <dd className={styles.infoValue}>{user.email}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoTerm}>병원</dt>
                <dd className={styles.infoValue}>{user.hospital.name}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>아바타</h2>
            <div className={styles.avatarRow}>
              <ProfileAvatar
                name={user.name}
                avatarUrl={previewUrl}
                size="lg"
              />
              <div className={styles.avatarFields}>
                <label className={styles.label} htmlFor="avatarUrl">
                  이미지 URL
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  className={styles.input}
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className={styles.textBtn}
                  onClick={() => setAvatarUrl("")}
                >
                  기본 아바타로 되돌리기
                </button>
                <p className={styles.hint}>
                  HTTPS 이미지 URL을 입력하면 GNB에 표시됩니다.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>비밀번호 변경</h2>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="newPassword">
                새 비밀번호
              </label>
              <input
                id="newPassword"
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmPassword">
                새 비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          </section>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className={styles.success} role="status">
              {message}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? "저장 중…" : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
