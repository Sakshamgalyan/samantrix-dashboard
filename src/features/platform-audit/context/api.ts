import { dashboardApi } from "@/store";
import type { PlatformAuditLog, PlatformAuditSummary } from "@/features/platform-audit/types";

export const platformAuditApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getPlatformAuditLogs: build.query<
      { data: PlatformAuditLog[]; meta: { total: number; page: number; limit: number; totalPages: number } },
      { page?: number; limit?: number; category?: string; action?: string }
    >({
      query: (params) => ({
        url: "/audit-logs",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 15,
          category: params.category && params.category !== "ALL" ? params.category : undefined,
          action: params.action && params.action !== "ALL" ? params.action : undefined,
        },
      }),
      providesTags: ["AuditLogs"],
    }),

    getPlatformAuditSummary: build.query<PlatformAuditSummary, void>({
      query: () => "/audit-logs/summary",
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const {
  useGetPlatformAuditLogsQuery,
  useGetPlatformAuditSummaryQuery,
} = platformAuditApi;
