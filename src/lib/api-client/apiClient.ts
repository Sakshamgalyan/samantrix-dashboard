/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getDeviceId } from "@/utils/device-id";
import {
  ApiError,
  AUTH_UNAUTHORIZED_EVENT,
  BACKEND_UNAVAILABLE_EVENT,
  BACKEND_RECONNECTED_EVENT,
  REQUEST_TIMEOUT_MS,
  type ApiRequestOptions,
  type RetriableConfig,
} from "./apiClient.types";
import {
  extractErrorMessage,
  isBackendDownError,
  checkBackendHealth,
  getCachedBackendOfflineState,
  setCachedBackendOfflineState,
  clearCachedBackendOfflineState,
} from "./error-handler";
import {
  API_BASE,
  isSessionlessAuthEndpoint,
  refreshSession,
  signalUnauthorized,
  isAuthenticatedResponse,
} from "./token-manager";

export {
  ApiError,
  AUTH_UNAUTHORIZED_EVENT,
  BACKEND_UNAVAILABLE_EVENT,
  BACKEND_RECONNECTED_EVENT,
  isBackendDownError,
  checkBackendHealth,
  getCachedBackendOfflineState,
  setCachedBackendOfflineState,
  clearCachedBackendOfflineState,
};
export { isAuthenticatedResponse };

/** Shared axios instance for every dashboard → BFF (`/api/v1`) call. */
export const apiClient = axios.create({
  baseURL: API_BASE,
  // Aborts the request (not just the promise) once it runs past the limit
  timeout: REQUEST_TIMEOUT_MS,
  timeoutErrorMessage: "timeout",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Request: identify the device (the BFF attaches the session from its httpOnly cookie) ──
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set("x-device-id", getDeviceId());
  return config;
});

// ── Response: unwrap the backend envelope; refresh on 401 & retry once; normalise failure to ApiError ──
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body === "" || body === undefined) return null;
    // Backend TransformInterceptor wraps payloads as { success: true, statusCode, data }
    if (body && typeof body === "object" && "data" in body) return body.data;
    return body;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as RetriableConfig | undefined;

    // Expired access cookie: renew the session once (shared by concurrent callers) and retry
    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !isSessionlessAuthEndpoint(originalConfig.url || "")
    ) {
      originalConfig._retry = true;
      if (await refreshSession()) return apiClient(originalConfig);
      signalUnauthorized();
    }

    if (
      error.code === AxiosError.ECONNABORTED ||
      error.code === AxiosError.ETIMEDOUT
    ) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(BACKEND_UNAVAILABLE_EVENT, {
            detail: {
              message: "The server took too long to respond.",
              status: 408,
            },
          }),
        );
      }
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(BACKEND_UNAVAILABLE_EVENT, {
            detail: {
              message: "Can't reach the server. Check your connection and try again.",
              status: 0,
            },
          }),
        );
      }
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

    // If upstream backend is down or gateway failed (502, 503, 504)
    if ([502, 503, 504].includes(status)) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(BACKEND_UNAVAILABLE_EVENT, {
            detail: { message, status },
          }),
        );
      }
    }

    return Promise.reject(new ApiError(message, status, data));
  },
);

const inFlightGets = new Map<string, Promise<unknown>>();

/**
 * Identical GETs issued while one is still pending share its promise, so components that
 * mount together (or effects re-run by Strict Mode) make one network call.
 * Calls with their own AbortSignal or headers are never shared.
 */
function dedupedGet<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
  if (options?.signal || options?.headers) return apiClient.get<T, T>(endpoint, options) as Promise<T>;
  const key = `${endpoint}?${JSON.stringify(options?.params ?? null)}`;
  const pending = inFlightGets.get(key);
  if (pending) return pending as Promise<T>;
  const request = (apiClient.get<T, T>(endpoint, options) as Promise<T>).finally(() => {
    inFlightGets.delete(key);
  });
  inFlightGets.set(key, request);
  return request;
}

export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    dedupedGet<T>(endpoint, options),

  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiClient.post<T, T>(endpoint, body, options),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiClient.patch<T, T>(endpoint, body, options),

  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiClient.put<T, T>(endpoint, body, options),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient.delete<T, T>(endpoint, options),
};

/**
 * One-time Socket.IO handshake ticket (valid ~60 s). Fetched per (re)connect so the socket
 * never needs the access token itself.
 */
export async function getSocketTicket(): Promise<string> {
  const result = await apiClient.post<{ ticket: string }, { ticket: string }>("/auth/socket-ticket");
  if (!result?.ticket) throw new ApiError("No socket ticket", 401);
  return result.ticket;
}
