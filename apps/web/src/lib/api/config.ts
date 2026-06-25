export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
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
