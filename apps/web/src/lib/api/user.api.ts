import type { AuthUser } from "@/types/auth";
import { cookieFetch } from "./cookie-fetch";

export async function getUserApi(): Promise<AuthUser> {
  const result = await cookieFetch<{ user: AuthUser }>("/users/me");
  return result.user;
}
