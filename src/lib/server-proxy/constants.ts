export const INTERNAL_BACKEND_URL = (
  process.env.INTERNAL_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/** httpOnly access token cookie, sent to every `/api/v1` route (15 min, like the JWT). */
export const ACCESS_COOKIE = "sx_dash_at";
/** httpOnly refresh token cookie, sent only to `/api/v1/auth/*` (30 days, single use). */
export const REFRESH_COOKIE = "sx_dash_rt";

export const ACCESS_COOKIE_PATH = "/";
export const REFRESH_COOKIE_PATH = "/api/v1/auth";
export const ACCESS_MAX_AGE = 15 * 60;
export const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

export const TOKEN_FIELDS = ["accessToken", "refreshToken", "tokens"] as const;

// Hop-by-hop and identity headers that are never forwarded upstream
export const DROP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-length",
  "cookie",
  "origin",
  "referer",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
]);

// Headers that are never passed back to the browser (the body is re-serialised and already decoded)
export const DROP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-length",
  "content-encoding",
  "server",
  "x-powered-by",
  "set-cookie",
]);

export const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

export const MAX_BODY_BYTES = 15 * 1024 * 1024; // 15 MB cap
export const UPSTREAM_TIMEOUT_MS = 60_000;
