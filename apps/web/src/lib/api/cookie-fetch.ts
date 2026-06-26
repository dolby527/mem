import { getApiBaseUrl, getHospitalSlug } from "./config";
import { parseJsonText } from "./parse-json-response";

export type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return `HTTP error! status: ${String(response.status)}`;
  const data = parseJsonText<{ message?: string | string[] }>(text);
  if (data) {
    const msg = data.message;
    if (Array.isArray(msg)) return msg.join(" ");
    if (msg) return msg;
  } else if (text.length < 200) {
    return text;
  }
  return `HTTP error! status: ${String(response.status)}`;
}

async function postRefresh(): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("refresh failed");
}

export async function cookieFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const { headers: optHeaders, body, ...rest } = init ?? {};
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = new Headers();
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  const slug = getHospitalSlug();
  if (slug) headers.set("x-hospital-slug", slug);

  if (optHeaders instanceof Headers) {
    for (const [k, v] of optHeaders.entries()) headers.set(k, v);
  } else if (optHeaders && typeof optHeaders === "object") {
    for (const [k, v] of Object.entries(optHeaders as Record<string, string>)) {
      if (typeof v === "string") headers.set(k, v);
    }
  }

  const request = () =>
    fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
      credentials: "include",
      cache: "no-store",
      ...rest,
      body,
      headers,
    });

  let response = await request();
  const isRefresh = path === "/auth/refresh-token";

  if (response.status === 401 && !isRefresh) {
    try {
      await postRefresh();
      response = await request();
    } catch {
      sessionExpiredHandler?.();
      throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return null as T;
  const parsed = parseJsonText<T>(text);
  if (parsed == null) {
    throw new Error("서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
  return parsed;
}
