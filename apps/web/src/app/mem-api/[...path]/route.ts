import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveApiInternalUrl } from "@/lib/api/resolve-api-internal-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROXY_TIMEOUT_MS = 120_000;

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
  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  // Fetch merges Set-Cookie; re-append each cookie for browser auth.
  headers.delete("set-cookie");
  for (const cookie of upstream.headers.getSetCookie()) {
    headers.append("set-cookie", cookie);
  }
  return headers;
}

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const target = buildTargetUrl(request, path);
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const init: RequestInit = {
      method,
      headers: forwardRequestHeaders(request),
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
    };

    if (hasBody) {
      init.body = await request.arrayBuffer();
    }

    const upstream = await fetch(target, init);
    const responseHeaders = copyResponseHeaders(upstream);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } finally {
    clearTimeout(timeout);
  }
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
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "API 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
        : error instanceof Error
          ? error.message
          : "API proxy failed";
    return NextResponse.json({ message }, { status: 502 });
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
