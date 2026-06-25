import type { HospitalMemberRole } from "@/lib/api/users.api";
import * as styles from "./roleLabel.css";

interface RoleLabelProps {
  role: HospitalMemberRole;
  variant: "badge" | "text";
  className?: string;
}

const LABELS: Record<HospitalMemberRole, string> = {
  HOSPITAL_ADMIN: "관리자",
  HOSPITAL_USER: "사용자",
};

export function RoleLabel({ role, variant, className }: RoleLabelProps) {
  const isAdmin = role === "HOSPITAL_ADMIN";
  const label = LABELS[role];
  const extra = className ?? "";

  if (variant === "badge") {
    const badgeClass = isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser;
    return <span className={`${badgeClass} ${extra}`.trim()}>{label}</span>;
  }

  const textClass = isAdmin ? styles.roleAdmin : styles.roleUser;
  return <span className={`${textClass} ${extra}`.trim()}>{label}</span>;
}
