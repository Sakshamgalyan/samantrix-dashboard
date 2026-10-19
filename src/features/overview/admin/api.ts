import { dashboardApi } from "@/store";
import type { PlatformOverview } from "@/features/overview/admin/types";

export const overviewApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getPlatformOverview: build.query<PlatformOverview, void>({
      query: () => "/analytics/platform-overview",
      providesTags: ["PlatformOverview"],
    }),
  }),
});

export const { useGetPlatformOverviewQuery } = overviewApi;
