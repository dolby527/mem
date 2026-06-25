import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/verifyAccessToken";
import { getApiBaseUrl } from "./config";

function buildCookieHeader(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): string {
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

/** Server Component / Route Handler용 — 브라우저 쿠키를 API로 전달 */
export async function serverCookieFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = buildCookieHeader(cookieStore);
  const headers = new Headers({ "Content-Type": "application/json" });

  if (cookieHeader) headers.set("Cookie", cookieHeader);

  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    const verified = await verifyAccessToken(accessToken);
    if (verified?.role === "PLATFORM_ADMIN") {
      const slug =
        process.env.NEXT_PUBLIC_DEV_HOSPITAL_SLUG ?? "asan";
      headers.set("x-hospital-slug", slug);
    }
  }

  const { headers: optHeaders, ...rest } = init ?? {};
  if (optHeaders instanceof Headers) {
    for (const [k, v] of optHeaders.entries()) headers.set(k, v);
  } else if (optHeaders && typeof optHeaders === "object") {
    for (const [k, v] of Object.entries(optHeaders as Record<string, string>)) {
      if (typeof v === "string") headers.set(k, v);
    }
  }

  const response = await fetch(
    `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`,
    { cache: "no-store", ...rest, headers },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${String(response.status)}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return null as T;
  return JSON.parse(text) as T;
}
