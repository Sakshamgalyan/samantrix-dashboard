import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  DROP_REQUEST_HEADERS,
  DROP_RESPONSE_HEADERS,
  INTERNAL_BACKEND_URL,
  NULL_BODY_STATUSES,
  REFRESH_COOKIE,
  UPSTREAM_TIMEOUT_MS,
} from "./constants";
import {
  clearSessionCookies,
  cookieIsSecure,
  publicOrigin,
  setSessionCookies,
} from "./cookies";
import { csrfFailure } from "./csrf";
import { extractTokens } from "./tokens";
import { jsonError, parseJsonObject, readRequestBody } from "./body";

export async function handleProxy(
  request: NextRequest,
  context?: { params?: Promise<{ path: string[] }> },
) {
  let path: string[] = [];
  if (context?.params) {
    const resolved = await context.params;
    path = resolved.path || [];
  } else {
    const pathname = request.nextUrl.pathname;
    if (!pathname.startsWith("/api/v1/")) {
      return NextResponse.next();
    }
    path = pathname.replace(/^\/api\/v1\/?/, "").split("/").filter(Boolean);
  }
  const joinedPath = path.map(encodeURIComponent).join("/");
  const isAuthPath = path[0] === "auth";
  const isRefresh = request.method === "POST" && joinedPath === "auth/refresh";
  const isLogout = request.method === "POST" && joinedPath === "auth/logout";
  const secure = cookieIsSecure(request);
  const noStore: HeadersInit | undefined = isAuthPath ? { "Cache-Control": "no-store" } : undefined;

  // Same-origin app: there is nothing to preflight, and foreign preflights get no CORS grant
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: { Allow: "GET, HEAD, POST, PUT, PATCH, DELETE" } });
  }

  // SAM-015: Restricted BFF paths. Public website submissions and beacon belong exclusively to Home BFF (:4000).
  const isPublicLeadSubmission =
    path[0] === "leads" &&
    (path[1] === "contact" || (path[1] === "waitlist" && path.length === 2 && request.method === "POST"));
  const isPublicVersioning = path[0] === "versioning" && path[1] === "public";
  const isPublicAnalytics = path[0] === "analytics" && path[1] === "track";

  if (isPublicLeadSubmission || isPublicVersioning || isPublicAnalytics) {
    return jsonError(404, "Not Found", noStore);
  }

  const csrf = csrfFailure(request);
  if (csrf) return jsonError(403, csrf, noStore);

  const accessCookie = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshCookie = request.cookies.get(REFRESH_COOKIE)?.value;

  if (isRefresh && !refreshCookie) {
    const response = jsonError(401, "No session", noStore);
    clearSessionCookies(response, secure);
    return response;
  }

  const { proto } = publicOrigin(request);
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (DROP_REQUEST_HEADERS.has(lower) || lower.startsWith("x-simantrix-")) return;
    forwardHeaders.set(key, value);
  });
  forwardHeaders.set(
    "x-forwarded-for",
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
  );
  forwardHeaders.set("x-forwarded-host", request.headers.get("host") || "localhost");
  forwardHeaders.set("x-forwarded-proto", proto);
  if (accessCookie && !forwardHeaders.has("authorization")) {
    forwardHeaders.set("authorization", `Bearer ${accessCookie}`);
  }

  // SAM-BFF: Attach gateway secret so backend validates this trusted proxy
  const gatewaySecret = process.env.GATEWAY_SECRET;
  if (gatewaySecret) {
    forwardHeaders.set("x-simantrix-gateway-secret", gatewaySecret);
  }

  let body = await readRequestBody(request);
  if (isRefresh) {
    body = JSON.stringify({ refreshToken: refreshCookie });
    forwardHeaders.set("content-type", "application/json");
  } else if (isLogout && refreshCookie) {
    body = JSON.stringify({ ...parseJsonObject(body), refreshToken: refreshCookie });
    forwardHeaders.set("content-type", "application/json");
  }

  // With the access cookie gone (idle > 15 min) the refresh token alone ends the session
  const logoutByRefreshToken = () => {
    const headers = new Headers(forwardHeaders);
    headers.delete("authorization");
    headers.set("content-type", "application/json");
    return fetch(`${INTERNAL_BACKEND_URL}/api/v1/auth/logout/refresh-token`, {
      method: "POST",
      headers,
      body: JSON.stringify({ refreshToken: refreshCookie }),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  };

  let upstream: Response;
  try {
    if (isLogout && refreshCookie && !accessCookie) {
      upstream = await logoutByRefreshToken();
    } else {
      upstream = await fetch(`${INTERNAL_BACKEND_URL}/api/v1/${joinedPath}${request.nextUrl.search}`, {
        method: request.method,
        headers: forwardHeaders,
        body,
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
      if (isLogout && refreshCookie && upstream.status === 401) upstream = await logoutByRefreshToken();
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Payload too large") {
      return jsonError(413, "Payload too large", noStore);
    }
    console.error(
      "[Simantrix Dashboard BFF] upstream error:",
      error instanceof Error ? error.message : error,
    );
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    const status = isTimeout ? 504 : 503;
    const msg = isTimeout ? "Gateway timeout" : "Unable to connect to internal services.";
    const response = jsonError(status, msg, noStore);
    if (isLogout) clearSessionCookies(response, secure);
    return response;
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!DROP_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
  });
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-Frame-Options", "SAMEORIGIN");
  if (isAuthPath) responseHeaders.set("Cache-Control", "no-store");

  let responseBody: BodyInit | null = NULL_BODY_STATUSES.has(upstream.status)
    ? null
    : await upstream.arrayBuffer();
  let tokens: ReturnType<typeof extractTokens> = null;

  const contentType = upstream.headers.get("content-type") || "";
  if (responseBody && contentType.includes("application/json")) {
    const text = new TextDecoder().decode(responseBody as ArrayBuffer);
    try {
      const json: unknown = JSON.parse(text);
      tokens = extractTokens(json);
      if (tokens) responseBody = JSON.stringify(json);
    } catch {
      // Not JSON after all: pass it through untouched
    }
  }

  const response = new NextResponse(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });

  if (isLogout || (isRefresh && upstream.status === 401)) {
    clearSessionCookies(response, secure);
  } else if (tokens) {
    setSessionCookies(response, secure, tokens.accessToken, tokens.refreshToken);
  }

  return response;
}
