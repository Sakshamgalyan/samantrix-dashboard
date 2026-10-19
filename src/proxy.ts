import { NextRequest, NextResponse } from "next/server";
import { handleProxy } from "@/lib/server-proxy/handlers";
import { ACCESS_COOKIE } from "@/lib/server-proxy/constants";

interface UserSessionInfo {
  isAuthenticated: boolean;
  isDeveloper: boolean;
  portal: "admin" | "organization";
}

/**
 * Parses JWT access token payload safely across Edge and Node runtimes
 * without external dependencies.
 */
function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extracts and validates session strictly from the JWT access token cookie.
 */
function getSessionFromRequest(request: NextRequest): UserSessionInfo {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return {
      isAuthenticated: false,
      isDeveloper: false,
      portal: "organization",
    };
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return { isAuthenticated: false, isDeveloper: false, portal: "organization" };
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    return { isAuthenticated: false, isDeveloper: false, portal: "organization" };
  }

  const platformRole = payload.platformRole as string | undefined;
  const role = payload.role as string | undefined;
  const organizationId = payload.organizationId as string | undefined;

  const isDeveloper =
    platformRole === "SUPERADMIN" ||
    platformRole === "MANAGER" ||
    platformRole === "MEMBER" ||
    platformRole === "AUDITOR" ||
    role === "DEVELOPER" ||
    (!organizationId && Boolean(platformRole));

  return {
    isAuthenticated: true,
    isDeveloper,
    portal: isDeveloper ? "admin" : "organization",
  };
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. BFF API requests are proxied upstream to backend
  if (pathname.startsWith("/api/v1/")) {
    return handleProxy(request);
  }

  // 2. Next.js internal files and static assets pass through
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg"
  ) {
    return NextResponse.next();
  }

  // 3. Developer console path normalization (/developer/* -> /admin/*)
  if (pathname === "/developer") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname.startsWith("/developer/")) {
    const rest = pathname.replace(/^\/developer/, "/admin");
    return NextResponse.redirect(new URL(rest, request.url));
  }

  // 4. Valid known routes pass through to Next.js page handlers without looping
  // Client-side AuthGate and AuthProvider handle verified session lifecycle & token renewal
  const isKnownRoute =
    pathname === "/" ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/organization" ||
    pathname.startsWith("/organization/");

  if (isKnownRoute) {
    return NextResponse.next();
  }

  // 5. Unknown / unmatched top-level routes (e.g. /adffa)
  // Redirect authenticated users to their console home, unauthenticated to /auth
  const session = getSessionFromRequest(request);
  if (session.isAuthenticated) {
    const homePath = session.isDeveloper ? "/admin" : "/organization";
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return NextResponse.redirect(new URL("/auth", request.url));
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};
