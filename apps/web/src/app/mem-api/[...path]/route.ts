import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveApiInternalUrl } from "@/lib/api/resolve-api-internal-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROXY_TIMEOUT_MS = 120_000;
const PROXY_RETRY_MS = 4_000;
const PROXY_MAX_ATTEMPTS = 4;

function buildTargetUrl(request: NextRequest, path: string[]): string {
  const suffix = path.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;
  return `${resolveApiInternalUrl()}/${suffix}${search}`;
}

function forwardRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  return headers;
}

function copyResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const cacheControl = upstream.headers.get("cache-control");
  if (cacheControl) headers.set("cache-control", cacheControl);
  // Do not forward content-length / transfer-encoding / content-encoding — fetch may
  // decompress the body while upstream headers still describe the compressed stream,
  // which truncates JSON (e.g. login at ~395 bytes).
  for (const cookie of upstream.headers.getSetCookie()) {
    headers.append("set-cookie", cookie);
  }
  return headers;
}

async function fetchUpstream(
  target: string,
  init: RequestInit,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= PROXY_MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    try {
      const response = await fetch(target, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < PROXY_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, PROXY_RETRY_MS));
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const target = buildTargetUrl(request, path);
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const init: RequestInit = {
    method,
    headers: forwardRequestHeaders(request),
    redirect: "manual",
    cache: "no-store",
  };

  if (hasBody) {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetchUpstream(target, init);
  const responseHeaders = copyResponseHeaders(upstream);
  // Buffer body — streaming upstream.body can truncate JSON (e.g. login + Set-Cookie).
  const body =
    upstream.status === 204 || upstream.status === 304
      ? null
      : await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  if (!path?.length || path.some((segment) => segment.includes(".."))) {
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  }
  try {
    return await proxy(request, path);
  } catch (error) {
    const detail =
      error instanceof Error && error.name === "AbortError"
        ? "API 요청 시간이 초과되었습니다."
        : error instanceof Error
          ? error.message
          : "API proxy failed";
    return NextResponse.json(
      {
        message: `${detail} (mem-api가 슬립 중이면 1분 후 다시 시도하세요.)`,
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}
