import { dashboardApi } from "@/store";
import type { PageQueryParams } from "@/features/common/pagination";
import type { MarketingRange, MarketingReport, VisitorsResponse } from "@/features/marketing-analytics/types";

/** Marketing report and the recent-visits feed, cached per range / page. */
export const marketingApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** The marketing report for a 7/30/90-day window (KPIs, trend and capped breakdowns). */
    getMarketingReport: build.query<MarketingReport, MarketingRange>({
      query: (range) => ({ url: "/analytics/marketing", params: { range } }),
      providesTags: ["Marketing"],
    }),

    /** One page of the most recent visits (newest first, the backend default); args from `pageParams`. */
    getRecentVisits: build.query<VisitorsResponse, PageQueryParams>({
      query: (params) => ({ url: "/analytics/visitors", params }),
      providesTags: ["Marketing"],
    }),
  }),
});

export const { useGetMarketingReportQuery, useGetRecentVisitsQuery } = marketingApi;
