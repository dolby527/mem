/** Same-origin API proxy prefix (Render / split-host deploy). */
export const API_PROXY_PREFIX = "/mem-api";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const internalUrl = process.env.API_INTERNAL_URL?.trim();

  if (typeof window !== "undefined") {
    if (publicUrl) return trimTrailingSlash(publicUrl);
    return API_PROXY_PREFIX;
  }

  if (internalUrl) return trimTrailingSlash(internalUrl);
  if (publicUrl) return trimTrailingSlash(publicUrl);
  return "http://localhost:3001";
}

/** PLATFORM_ADMIN 병원 전환; 일반 사용자는 세션 병원 slug */
export function getHospitalSlug(): string | undefined {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_DEV_HOSPITAL_SLUG ?? "asan";
  }
  const w = window as Window & { __MEM_HOSPITAL_SLUG__?: string };
  return w.__MEM_HOSPITAL_SLUG__ ?? process.env.NEXT_PUBLIC_DEV_HOSPITAL_SLUG ?? "asan";
}

export function setHospitalSlug(slug: string | undefined) {
  if (typeof window === "undefined") return;
  const w = window as Window & { __MEM_HOSPITAL_SLUG__?: string };
  if (slug) w.__MEM_HOSPITAL_SLUG__ = slug;
  else delete w.__MEM_HOSPITAL_SLUG__;
}
