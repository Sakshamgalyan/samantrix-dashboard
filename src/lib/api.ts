import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getDeviceId } from "./device-id";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(
  /\/+$/,
  "",
);

/** Requests still pending after this long are aborted. */
export const REQUEST_TIMEOUT_MS = 30_000;

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode?: number;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  /** HTTP status; 408 when the request timed out, 0 when no response arrived or it was cancelled. */
  statusCode: number;
  /** Parsed response body, when there was one. */
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function extractErrorMessage(json: any, fallback: string): string {
  if (!json) return fallback;
  if (typeof json === "string") return json;

  // 1. Check NestJS AllExceptionsFilter shape: { error: { message: string | string[], error?: string } } or { error: string }
  if (json.error) {
    if (typeof json.error === "string") return json.error;
    if (typeof json.error === "object") {
      const sub = json.error.message;
      if (Array.isArray(sub)) return sub.join(", ");
      if (typeof sub === "string" && sub) return sub;
      if (typeof json.error.error === "string" && json.error.error)
        return json.error.error;
    }
  }

  // 2. Check standard { message: string | string[] }
  if (json.message) {
    if (Array.isArray(json.message)) return json.message.join(", ");
    if (typeof json.message === "string" && json.message) return json.message;
  }

  return fallback;
}

export const TOKEN_COOKIE_NAME = "samantrix_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "samantrix_refresh_token";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(
  name: string,
  value: string,
  days: number = 7,
  path: string = "/",
) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; expires=${expires}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function removeCookie(name: string, path: string = "/") {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getStoredToken(): string | null {
  const cookieVal = getCookie(TOKEN_COOKIE_NAME);
  if (cookieVal) return cookieVal;
  // Fallback & migration from localStorage if previously stored there
  if (typeof window !== "undefined") {
    try {
      const localVal = localStorage.getItem(TOKEN_COOKIE_NAME);
      if (localVal) {
        setStoredToken(localVal);
        localStorage.removeItem(TOKEN_COOKIE_NAME);
        const refreshVal = localStorage.getItem(REFRESH_TOKEN_COOKIE_NAME);
        if (refreshVal) {
          localStorage.removeItem(REFRESH_TOKEN_COOKIE_NAME);
        }
        return localVal;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function getStoredRefreshToken(): string | null {
  const cookieVal = getCookie(REFRESH_TOKEN_COOKIE_NAME);
  if (cookieVal) return cookieVal;
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(REFRESH_TOKEN_COOKIE_NAME);
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredToken(accessToken: string, refreshToken?: string) {
  setCookie(TOKEN_COOKIE_NAME, accessToken, 7);
  if (refreshToken) {
    setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, 30);
  }
}

export function clearStoredToken() {
  removeCookie(TOKEN_COOKIE_NAME);
  removeCookie(REFRESH_TOKEN_COOKIE_NAME);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TOKEN_COOKIE_NAME);
      localStorage.removeItem(REFRESH_TOKEN_COOKIE_NAME);
    } catch {
      // ignore
    }
  }
}

/** Shared axios instance for every dashboard → BFF (`/api/v1`) call. */
export const apiClient = axios.create({
  baseURL: API_BASE,
  // Aborts the request (not just the promise) once it runs past the limit
  timeout: REQUEST_TIMEOUT_MS,
  timeoutErrorMessage: "timeout",
  headers: { "Content-Type": "application/json" },
});

// ── Request: identify the device and attach the session token ──────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set("x-device-id", getDeviceId());
  const token = getStoredToken();
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ── Response: unwrap the backend envelope; normalise every failure to ApiError ──
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body === "" || body === undefined) return null;
    // Backend TransformInterceptor wraps payloads as { success: true, statusCode, data }
    if (body && typeof body === "object" && "data" in body) return body.data;
    return body;
  },
  (error: AxiosError) => {
    if (
      error.code === AxiosError.ECONNABORTED ||
      error.code === AxiosError.ETIMEDOUT
    ) {
      return Promise.reject(
        new ApiError(
          `The server took longer than ${REQUEST_TIMEOUT_MS / 1000} seconds to respond, so the request was cancelled. Please try again.`,
          408,
        ),
      );
    }
    if (axios.isCancel(error)) {
      return Promise.reject(new ApiError("The request was cancelled.", 0));
    }
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          "Can't reach the server. Check your connection and try again.",
          0,
        ),
      );
    }

    const { status, statusText, data } = error.response;
    const message = extractErrorMessage(
      data,
      `HTTP error ${status}: ${statusText}`,
    );
    return Promise.reject(new ApiError(message, status, data));
  },
);

/** Per-call options (all optional): extra headers, query params, an AbortSignal, or a different timeout. */
export type ApiRequestOptions = Pick<
  AxiosRequestConfig,
  "headers" | "params" | "signal" | "timeout"
>;

export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient.get<T, T>(endpoint, options),

  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiClient.post<T, T>(endpoint, body, options),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiClient.patch<T, T>(endpoint, body, options),

  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiClient.put<T, T>(endpoint, body, options),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient.delete<T, T>(endpoint, options),
};
