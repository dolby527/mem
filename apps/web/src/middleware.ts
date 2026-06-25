import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { postLoginPath, requiresAuth } from "@/lib/auth/authPaths";
import { verifyAccessToken } from "@/lib/auth/verifyAccessToken";

function isFrameworkOrApiPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/mem-api") ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("accessToken")?.value;

  if (isFrameworkOrApiPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/signup/platform-admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname === "/" || pathname === "/login") && authToken) {
    const verified = await verifyAccessToken(authToken);
    if (verified) {
      return NextResponse.redirect(new URL(postLoginPath(), request.url));
    }
  }

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  if (!authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const verified = await verifyAccessToken(authToken);
  if (!verified) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/settings") &&
    verified.role !== "HOSPITAL_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|mem-api|_next/static|_next/image|favicon.ico).*)"],
};
