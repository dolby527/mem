import { cookieFetch } from "./cookie-fetch";

export type HospitalMemberRole = "HOSPITAL_USER" | "HOSPITAL_ADMIN";

export interface HospitalMember {
  id: string;
  name: string;
  email: string;
  role: HospitalMemberRole;
}

/** @deprecated Use HospitalMember */
export type ApiHospitalMember = HospitalMember;

export function listHospitalMembers() {
  return cookieFetch<HospitalMember[]>("/users/members");
}

export function deleteHospitalMember(userId: string) {
  return cookieFetch<{ message: string }>(
    `/users/members/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
}

export function updateHospitalMemberRole(
  userId: string,
  role: HospitalMemberRole,
) {
  return cookieFetch<{ message: string; role: HospitalMemberRole }>(
    `/users/members/${encodeURIComponent(userId)}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );
}
