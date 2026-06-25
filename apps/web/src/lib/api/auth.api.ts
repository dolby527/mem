import type { AuthUser } from "@/types/auth";
import { getApiBaseUrl } from "./config";

async function throwAuthError(response: Response, fallback: string): Promise<never> {
  const errorData = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };
  const msg = errorData.message;
  const text = Array.isArray(msg) ? msg.join(" ") : (msg ?? fallback);
  throw new Error(text);
}

export async function loginApi(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!response.ok) {
    await throwAuthError(response, "로그인에 실패했습니다");
  }
  const result = (await response.json()) as { user: AuthUser };
  return result.user;
}

export async function logoutApi(): Promise<void> {
  await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
}

export interface InviteInfo {
  id: string;
  name: string;
  email: string;
  expiresAt: string;
  isUsed: boolean;
  role: string;
}

export async function getInviteInfoApi(inviteId: string): Promise<InviteInfo> {
  const response = await fetch(
    `${getApiBaseUrl()}/invite/${encodeURIComponent(inviteId)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    await throwAuthError(response, "초대 정보를 불러오지 못했습니다");
  }
  return response.json() as Promise<InviteInfo>;
}

export async function signUpInviteApi(data: {
  inviteId: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthUser> {
  const response = await fetch(`${getApiBaseUrl()}/auth/signup-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    await throwAuthError(response, "회원가입에 실패했습니다");
  }
  const result = (await response.json()) as { user: AuthUser };
  return result.user;
}

export async function signUpHospitalApi(data: {
  email: string;
  name: string;
  hospitalName: string;
  hospitalSlug: string;
  password: string;
  confirmPassword: string;
}): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/auth/signup-hospital`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    await throwAuthError(response, "회원가입에 실패했습니다");
  }
}

export async function signUpPlatformApi(data: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/auth/signup-platform`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    await throwAuthError(response, "회원가입에 실패했습니다");
  }
}
