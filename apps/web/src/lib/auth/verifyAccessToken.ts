import { jwtVerify } from "jose";
import { getJwtSecret } from "./jwtSecret";
import type { UserRole } from "@/types/auth";

export interface VerifiedAccessToken {
  role: UserRole;
}

export async function verifyAccessToken(
  token: string,
): Promise<VerifiedAccessToken | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecret()),
    );
    const role = payload.role;
    if (typeof role !== "string") return null;
    return { role: role as UserRole };
  } catch {
    return null;
  }
}
