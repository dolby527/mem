"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { loginApi, logoutApi } from "@/lib/api/auth.api";
import { setHospitalSlug } from "@/lib/api/config";
import { setSessionExpiredHandler } from "@/lib/api/cookie-fetch";
import { getUserApi } from "@/lib/api/user.api";
import { shouldFetchAuthSession } from "@/lib/auth/authPaths";
import type { AuthContextValue, AuthUser } from "@/types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function applyHospitalSlug(user: AuthUser | null) {
  if (!user) {
    setHospitalSlug(undefined);
    return;
  }
  if (user.role === "PLATFORM_ADMIN") {
    setHospitalSlug(process.env.NEXT_PUBLIC_DEV_HOSPITAL_SLUG ?? "asan");
  } else {
    setHospitalSlug(user.hospital.slug);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionEnabled = shouldFetchAuthSession(pathname);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(sessionEnabled);

  const refreshSession = useCallback(async () => {
    if (!sessionEnabled) return;
    setIsSessionLoading(true);
    try {
      const me = await getUserApi();
      setUser(me);
      applyHospitalSlug(me);
    } catch {
      setUser(null);
      applyHospitalSlug(null);
    } finally {
      setIsSessionLoading(false);
    }
  }, [sessionEnabled]);

  useEffect(() => {
    if (sessionEnabled) {
      void refreshSession();
    } else {
      setIsSessionLoading(false);
    }
  }, [sessionEnabled, refreshSession]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      applyHospitalSlug(null);
      void logoutApi();
      router.replace("/login");
    });
    return () => setSessionExpiredHandler(null);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const me = await loginApi(email, password);
    setUser(me);
    applyHospitalSlug(me);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      applyHospitalSlug(null);
      router.replace("/");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isSessionLoading: sessionEnabled && isSessionLoading,
      login,
      logout,
      refreshSession,
    }),
    [user, sessionEnabled, isSessionLoading, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
