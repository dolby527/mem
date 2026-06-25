import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiOrigin(): string {
  const url = process.env.API_INTERNAL_URL?.trim();
  if (!url) {
    throw new Error("API_INTERNAL_URL is required for /mem-api proxy");
  }
  return url.replace(/\/$/, "");
}

function buildTargetUrl(request: NextRequest, path: string[]): string {
  const suffix = path.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;
  return `${apiOrigin()}/${suffix}${search}`;
}

function forwardRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  return headers;
}

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const target = buildTargetUrl(request, path);
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: forwardRequestHeaders(request),
    redirect: "manual",
    cache: "no-store",
  };

  if (hasBody) {
    init.body = request.body;
    init.duplex = "half";
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");

  return new NextResponse(upstream.body, {
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
    const message =
      error instanceof Error ? error.message : "API proxy failed";
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
