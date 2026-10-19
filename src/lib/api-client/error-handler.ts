export function extractErrorMessage(json: unknown, fallback: string): string {
  if (!json) return fallback;
  if (typeof json === "string") return json;

  if (typeof json === "object" && json !== null) {
    const obj = json as Record<string, unknown>;
    // 1. Check NestJS AllExceptionsFilter shape: { error: { message: string | string[], error?: string } } or { error: string }
    if (obj.error) {
      if (typeof obj.error === "string") return obj.error;
      if (typeof obj.error === "object" && obj.error !== null) {
        const errObj = obj.error as Record<string, unknown>;
        const sub = errObj.message;
        if (Array.isArray(sub)) return sub.join(", ");
        if (typeof sub === "string" && sub) return sub;
        if (typeof errObj.error === "string" && errObj.error)
          return errObj.error;
      }
    }

    // 2. Check standard { message: string | string[] }
    if (obj.message) {
      if (Array.isArray(obj.message)) return obj.message.join(", ");
      if (typeof obj.message === "string" && obj.message) return obj.message;
    }
  }

  return fallback;
}

/**
 * Checks whether an error is caused by the backend server being down, unreachable,
 * or returning 502/503/504 gateway failures.
 */
export function isBackendDownError(error: unknown): boolean {
  if (!error) return false;

  // Check HTTP status code if present on ApiError or error object
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const code = Number((error as { statusCode: unknown }).statusCode);
    if ([0, 502, 503, 504].includes(code)) return true;
  }

  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "";

  const lower = msg.toLowerCase();
  return (
    lower.includes("unable to connect to internal services") ||
    lower.includes("can't reach the server") ||
    lower.includes("cannot reach the server") ||
    lower.includes("gateway timeout") ||
    lower.includes("503") ||
    lower.includes("504") ||
    lower.includes("502") ||
    lower.includes("econnrefused") ||
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("networkerror") ||
    lower.includes("upstream error")
  );
}

export const BACKEND_OFFLINE_CACHE_KEY = "simantrix:backend:offline_state";

/**
 * Retrieves the cached backend offline status from localStorage if set within the last 10 minutes.
 */
export function getCachedBackendOfflineState(): {
  isDown: boolean;
  message: string;
  statusCode?: number;
  timestamp: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BACKEND_OFFLINE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.isDown || Date.now() - parsed.timestamp > 10 * 60 * 1000) {
      localStorage.removeItem(BACKEND_OFFLINE_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persists the backend offline state into localStorage cache.
 */
export function setCachedBackendOfflineState(errorInfo: {
  message: string;
  statusCode?: number;
  timestamp?: number;
}): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      BACKEND_OFFLINE_CACHE_KEY,
      JSON.stringify({
        isDown: true,
        message: errorInfo.message,
        statusCode: errorInfo.statusCode || 503,
        timestamp: errorInfo.timestamp || Date.now(),
      }),
    );
  } catch {
    // ignore quota exceptions
  }
}

/**
 * Clears the cached backend offline state once connectivity is restored.
 */
export function clearCachedBackendOfflineState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BACKEND_OFFLINE_CACHE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Pings the public backend health/liveness endpoint to check if the central backend service is reachable.
 * Automatically synchronizes the offline cache state.
 */
export async function checkBackendHealth(): Promise<{
  isOnline: boolean;
  status?: number;
  message?: string;
}> {
  try {
    const res = await fetch("/api/v1/health/liveness", {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      clearCachedBackendOfflineState();
      return { isOnline: true, status: res.status, message: "Backend is operational" };
    }
    const message = res.statusText || "Service Unavailable";
    setCachedBackendOfflineState({ message, statusCode: res.status });
    return {
      isOnline: false,
      status: res.status,
      message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network connection failed";
    setCachedBackendOfflineState({ message, statusCode: 0 });
    return {
      isOnline: false,
      status: 0,
      message,
    };
  }
}
