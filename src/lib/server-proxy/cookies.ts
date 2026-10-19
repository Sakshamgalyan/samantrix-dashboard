import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_PATH,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_MAX_AGE,
} from "./constants";

export function firstHeaderValue(value: string | null): string | null {
  return value ? value.split(",")[0].trim() : null;
}

/** Protocol and host the browser used to reach this app (honours a reverse proxy in front). */
export function publicOrigin(request: NextRequest): { proto: string; origin: string } {
  const proto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ||
    request.nextUrl.protocol.replace(":", "");
  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    request.headers.get("host") ||
    request.nextUrl.host;
  return { proto, origin: `${proto}://${host}` };
}

export function cookieIsSecure(request: NextRequest): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    publicOrigin(request).proto === "https" ||
    request.nextUrl.protocol === "https:"
  );
}

export function setSessionCookies(
  response: NextResponse,
  secure: boolean,
  accessToken: string | undefined,
  refreshToken: string | undefined,
) {
  if (accessToken) {
    response.cookies.set(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: ACCESS_COOKIE_PATH,
      maxAge: ACCESS_MAX_AGE,
    });
  }
  if (refreshToken) {
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export function clearSessionCookies(response: NextResponse, secure: boolean) {
  const base = { httpOnly: true, sameSite: "lax" as const, secure, maxAge: 0 };
  response.cookies.set(ACCESS_COOKIE, "", { ...base, path: ACCESS_COOKIE_PATH });
  response.cookies.set(ACCESS_COOKIE, "", { ...base, path: "/api/v1" });
  response.cookies.set(REFRESH_COOKIE, "", { ...base, path: REFRESH_COOKIE_PATH });
}
