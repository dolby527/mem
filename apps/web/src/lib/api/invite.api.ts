import { cookieFetch } from "./cookie-fetch";

export interface CreateInvitePayload {
  email: string;
  name: string;
  role: "HOSPITAL_USER" | "HOSPITAL_ADMIN";
  expiresInDays?: number;
}

export interface CreateInviteResult {
  message: string;
  inviteId: string;
  inviteLink: string;
  expiresAt: string;
}

export function createInviteApi(payload: CreateInvitePayload) {
  return cookieFetch<CreateInviteResult>("/invite", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
