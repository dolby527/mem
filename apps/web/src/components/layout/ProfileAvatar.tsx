"use client";

import { useEffect, useState } from "react";
import * as s from "./profileAvatar.css";

type ProfileAvatarSize = "sm" | "md" | "lg";

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: ProfileAvatarSize;
  className?: string;
}

function avatarInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !imgFailed;

  useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  const rootClass = [s.root, s.size[size], className].filter(Boolean).join(" ");

  if (showImage && avatarUrl) {
    return (
      <span className={rootClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
          className={s.image}
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={rootClass} aria-hidden>
      <span className={s.letter[size]}>{avatarInitial(name)}</span>
    </span>
  );
}
