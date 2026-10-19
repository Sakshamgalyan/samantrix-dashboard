import { dashboardApi } from "@/store";
import type {
  AnalyticsOverview,
  OrgAnalyticsOverview,
} from "@/features/analytics/types/api";

export type { AnalyticsOverview, OrgAnalyticsOverview };

/** Workspace analytics for the caller's organization. */
export const analyticsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgAnalyticsOverview: build.query<AnalyticsOverview, void>({
      query: () => "/organizations/current/analytics/overview",
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetOrgAnalyticsOverviewQuery } = analyticsApi;
