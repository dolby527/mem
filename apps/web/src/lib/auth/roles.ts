import type { UserRole } from "@/types/auth";

/** 장비 등록·수정·삭제 — 병원 관리자 및 플랫폼 운영자 */
export function canManageEquipment(role: UserRole | undefined): boolean {
  return role === "HOSPITAL_ADMIN" || role === "PLATFORM_ADMIN";
}
