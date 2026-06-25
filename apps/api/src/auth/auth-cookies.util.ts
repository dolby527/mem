import type { Response } from "express";

type SameSiteOption = "lax" | "strict" | "none";

function resolveCookieDomain(): string | undefined {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  if (!isProduction) return undefined;
  if (cookieDomain === "local" || cookieDomain === "off" || !cookieDomain) {
    return undefined;
  }
  return cookieDomain;
}

function resolveSameSite(): SameSiteOption {
  const explicit = process.env.COOKIE_SAMESITE?.trim().toLowerCase();
  if (explicit === "none" || explicit === "lax" || explicit === "strict") {
    return explicit;
  }
  const domain = process.env.COOKIE_DOMAIN?.trim();
  if (process.env.NODE_ENV === "production" && (domain === "off" || domain === "local")) {
    return "none";
  }
  return "lax";
}

function cookieBase() {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = resolveSameSite();
  const secure =
    sameSite === "none"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : process.env.COOKIE_SECURE === "true"
          ? true
          : isProduction;
  const domain = resolveCookieDomain();
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const base = cookieBase();
  res.cookie("accessToken", accessToken, {
    ...base,
    expires: new Date(Date.now() + 60 * 60 * 1000),
  });
  res.cookie("refreshToken", refreshToken, {
    ...base,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export function setRefreshedAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const base = cookieBase();
  res.cookie("accessToken", accessToken, {
    ...base,
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });
  res.cookie("refreshToken", refreshToken, {
    ...base,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export function clearAuthCookies(res: Response): void {
  const base = cookieBase();
  res.clearCookie("accessToken", base);
  res.clearCookie("refreshToken", base);
}
