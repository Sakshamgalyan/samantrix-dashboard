import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { ApiError, apiClient } from "@/lib/api-client/apiClient";

/** One request as RTK Query endpoints describe it (a plain string is a GET to that URL). */
export interface ApiQueryArgs {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  params?: AxiosRequestConfig["params"];
  responseType?: AxiosRequestConfig["responseType"];
}

/** Error shape every query/mutation rejects with (mirrors {@link ApiError}). */
export interface ApiQueryError {
  status: number;
  message: string;
  data?: unknown;
}

/**
 * Runs requests through the shared axios client, so token refresh, the device header and
 * the `{ success, data }` envelope unwrapping stay in one place (`@/lib/api`).
 */
const axiosBaseQuery: BaseQueryFn<ApiQueryArgs | string, unknown, ApiQueryError> = async (
  args,
  { signal },
) => {
  const { url, method = "GET", body, params, responseType } =
    typeof args === "string" ? ({ url: args } as ApiQueryArgs) : args;
  try {
    // The response interceptor already returns the unwrapped payload
    const data = await apiClient.request<unknown, unknown>({
      url,
      method,
      data: body,
      params,
      responseType,
      signal,
    });
    return { data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: { status: err.statusCode, message: err.message, data: err.data } };
    }
    return { error: { status: 0, message: "Something went wrong. Please try again." } };
  }
};

/** Message for an RTK Query error (or anything thrown by `.unwrap()`), with a fallback. */
export function queryErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (error instanceof ApiError) return error.message || fallback;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message ? message : fallback;
}

/** Every console page refreshes its data on this cadence while it is open. */
export const POLL_INTERVAL_MS = 60_000;

/**
 * The single server-data cache for the dashboard. Each feature adds its endpoints with
 * `dashboardApi.injectEndpoints` in its own `context/api.ts`, so any two screens asking for
 * the same endpoint + arguments share one request and one cached result.
 */
export const dashboardApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: [
    "Account",
    "Sessions",
    "Analytics",
    "AuditLogs",
    "Billing",
    "Developers",
    "FeatureFlags",
    "Leads",
    "LeadDetail",
    "Waitlist",
    "Marketing",
    "OrgFeatures",
    "OrgMembers",
    "OrgInvitations",
    "OrgSettings",
    "Organizations",
    "OrganizationDetail",
    "Payments",
    "Plans",
    "PlatformOverview",
    "PlatformSettings",
    "Revenue",
    "Security",
    "Integrations",
    "Versioning",
    "OrgRooms",
    "OrgDepartments",
    "OrgAiAssistants",
    "OrgFleet",
    "Ecosystem",
    "RealtimeGateway",
    "Queues",
  ],
  // Revisiting a page within 30s reuses the cached data; older data is shown while it refreshes
  refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  keepUnusedDataFor: 120,
  endpoints: () => ({}),
});
