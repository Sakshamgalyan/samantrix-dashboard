import { dashboardApi } from "@/store";
import type { PageQueryParams, Paginated } from "@/features/common/pagination";
import type { OrgAuditLogRow } from "@/features/audit-logs/types/api";

/**
 * The caller's organization audit trail, paginated on the server. `search` (action, actor,
 * resource) and `action` (event-type prefix such as `USER`) are sent as query params.
 * The Analytics page's "Recent activity" reads page 1 without filters, which is the same
 * cache entry as the Audit logs page's first page.
 */
export const auditLogsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgAuditLogs: build.query<Paginated<OrgAuditLogRow>, PageQueryParams>({
      query: (params) => ({ url: "/organizations/current/audit-logs", params }),
      providesTags: ["AuditLogs"],
    }),
    clearOrgAuditLogs: build.mutation<{ success: boolean; clearedCount: number }, void>({
      query: () => ({
        url: "/organizations/current/audit-logs",
        method: "DELETE",
      }),
      invalidatesTags: ["AuditLogs"],
    }),
  }),
});

export const { useGetOrgAuditLogsQuery, useClearOrgAuditLogsMutation } = auditLogsApi;
