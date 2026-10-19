import axios from "axios";
import { getDeviceId } from "@/utils/device-id";
import { AUTH_UNAUTHORIZED_EVENT } from "./apiClient.types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(
  /\/+$/,
  "",
);

/** Names under which older builds kept tokens in localStorage / JS cookies. */
const LEGACY_TOKEN_KEYS = ["Simantrix_access_token", "Simantrix_refresh_token"];

/** Removes tokens that older builds stored in localStorage or JS-readable cookies (once per load). */
export function clearLegacyTokens() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_TOKEN_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
    for (const path of ["/", "/api/v1"]) {
      document.cookie = `${key}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
    }
  }
}
clearLegacyTokens();

export function signalUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
  }
}

/** Sign-in calls answer `{ authenticated: true }` once the BFF has set the session cookies. */
export function isAuthenticatedResponse(response: unknown): boolean {
  return (
    typeof response === "object" &&
    response !== null &&
    (response as { authenticated?: unknown }).authenticated === true
  );
}

/** Auth endpoints whose 401 means "wrong credentials / code", not "session expired". */
export function isSessionlessAuthEndpoint(url: string): boolean {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/2fa/verify") ||
    url.includes("/auth/password/") ||
    url.includes("/auth/handoff/exchange") ||
    url.includes("/login-history/challenge/")
  );
}

/**
 * Runs an action under a Web Lock if supported by the browser, so tabs rotate the single-use
 * refresh cookie one at a time (a second tab then refreshes with the already-rotated cookie).
 */
export async function runWithLock<T>(lockName: string, fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && typeof navigator.locks?.request === "function") {
    return navigator.locks.request(lockName, fn);
  }
  return fn();
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Asks the BFF to rotate the session cookies (`POST /auth/refresh`, empty body). Concurrent
 * callers share one request. Resolves false when the session can't be renewed.
 */
export function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = runWithLock("Simantrix_auth_refresh_lock", async () => {
    try {
      await axios.post(`${API_BASE}/auth/refresh`, undefined, {
        headers: { "x-device-id": getDeviceId() },
        withCredentials: true,
        timeout: 15_000,
      });
      return true;
    } catch (err) {
      console.warn(
        "[AuthRefresh] Session could not be renewed:",
        axios.isAxiosError(err) ? (err.response?.status ?? err.message) : err,
      );
      return false;
    }
  }).finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}
