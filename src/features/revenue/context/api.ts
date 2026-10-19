import { dashboardApi } from "@/store";
import type {
  RevenueReport,
  RevenueKpisReport,
  RevenueTrendReport,
  RevenuePlanMixReport,
  TopOrganizations,
} from "@/features/revenue/types/api";

export type {
  RevenueReport,
  RevenueKpisReport,
  RevenueTrendReport,
  RevenuePlanMixReport,
  TopOrganizations,
};

/** Revenue endpoints segregated by concern for faster, modular loading. */
export const revenueApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** KPIs and payment health. */
    getRevenueKpis: build.query<RevenueKpisReport, void>({
      query: () => "/finance/revenue/kpis",
      providesTags: ["Revenue"],
    }),
    /** 12-month collections and refunds trend. */
    getRevenueTrend: build.query<RevenueTrendReport, void>({
      query: () => "/finance/revenue/trend",
      providesTags: ["Revenue"],
    }),
    /** Breakdown by plan tier. */
    getRevenuePlanMix: build.query<RevenuePlanMixReport, void>({
      query: () => "/finance/revenue/plan-mix",
      providesTags: ["Revenue"],
    }),
    /** Composite summary (KPIs, collections trend and plan mix). */
    getRevenueReport: build.query<RevenueReport, void>({
      query: () => "/finance/revenue",
      providesTags: ["Revenue"],
    }),
    /** Top 8 organizations by lifetime payments (Revenue page only). */
    getTopOrganizations: build.query<TopOrganizations, void>({
      query: () => "/finance/revenue/top-organizations",
      providesTags: ["Revenue"],
    }),
  }),
});

export const {
  useGetRevenueKpisQuery,
  useGetRevenueTrendQuery,
  useGetRevenuePlanMixQuery,
  useGetRevenueReportQuery,
  useGetTopOrganizationsQuery,
} = revenueApi;
