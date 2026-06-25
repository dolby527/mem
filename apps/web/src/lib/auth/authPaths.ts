import { APP_HOME } from "@/lib/navigation/paths";

export { APP_HOME };

/** 세션 쿠키 없이 접근 가능한 경로 */
export function isPublicAuthPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/unauthorized") return true;
  if (pathname === "/login") return true;
  if (pathname === "/signup/hospital-admin") return true;
  if (pathname.startsWith("/signup/") && !pathname.startsWith("/signup/platform-admin")) {
    return true;
  }
  return false;
}

export function requiresAuth(pathname: string): boolean {
  return !isPublicAuthPath(pathname);
}

export function shouldFetchAuthSession(pathname: string): boolean {
  if (pathname === "/" || pathname === "/login" || pathname === "/unauthorized") {
    return false;
  }
  if (pathname.startsWith("/signup")) return false;
  return true;
}

/** 로그인 후 이동할 앱 홈 */
export function postLoginPath(): string {
  return APP_HOME;
}
