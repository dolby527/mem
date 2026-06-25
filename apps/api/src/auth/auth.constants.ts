const DEV_FALLBACK =
  "mem_dev_jwt_secret_change_in_production_32chars_min";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret) {
      throw new Error("JWT_SECRET is required in production");
    }
    return secret;
  }
  return secret ?? DEV_FALLBACK;
}

export const PLATFORM_HOSPITAL_SLUG = "__platform__";
