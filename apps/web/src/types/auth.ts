export type UserRole =
  | "HOSPITAL_USER"
  | "HOSPITAL_ADMIN"
  | "PLATFORM_ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  hospital: { id: string; slug: string; name: string };
}

export interface AuthContextValue {
  user: AuthUser | null;
  isSessionLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
