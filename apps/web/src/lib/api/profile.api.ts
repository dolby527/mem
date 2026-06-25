import type { AuthUser } from "@/types/auth";
import { cookieFetch } from "./cookie-fetch";

export async function updateProfileApi(
  avatarUrl: string | null,
): Promise<AuthUser> {
  const result = await cookieFetch<{ user: AuthUser }>("/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify({ avatarUrl }),
  });
  return result.user;
}

export async function updatePasswordApi(
  newPassword: string,
  newPasswordConfirm: string,
): Promise<void> {
  await cookieFetch<void>("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ newPassword, newPasswordConfirm }),
  });
}
