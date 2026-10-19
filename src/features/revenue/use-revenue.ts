"use client";

import { useMemo } from "react";
import { pageParams } from "@/features/common/pagination";
import { useGetPaymentsQuery } from "@/features/payments/context/api";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import {
  useGetRevenueReportQuery,
  useGetRevenueKpisQuery,
  useGetRevenueTrendQuery,
  useGetRevenuePlanMixQuery,
  useGetTopOrganizationsQuery,
} from "@/features/revenue/context/api";

const POLLING = { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true } as const;

/** The revenue summary, using the consolidated cached revenue report endpoint and refreshed every minute. */
export function useRevenue() {
  const { data, error, isLoading, refetch } = useGetRevenueReportQuery(undefined, POLLING);

  return {
    data: data ?? null,
    kpis: data?.kpis ?? null,
    trend: data?.trend ?? null,
    planMix: data?.planMix ?? null,
    currency: data?.currency ?? "INR",
    isLoading,
    error: data || !error ? null : queryErrorMessage(error, "Couldn't load revenue."),
    reload: refetch,
  };
}

/** Hook to fetch only revenue KPIs and payment health. */
export function useRevenueKpis() {
  const { data, error, refetch, isLoading } = useGetRevenueKpisQuery(undefined, POLLING);
  return {
    data: data ?? null,
    error: data || !error ? null : queryErrorMessage(error, "Couldn't load revenue KPIs."),
    reload: refetch,
    isLoading,
  };
}

/** Hook to fetch only 12-month revenue trend. */
export function useRevenueTrend() {
  const { data, error, refetch, isLoading } = useGetRevenueTrendQuery(undefined, POLLING);
  return {
    data: data ?? null,
    error: data || !error ? null : queryErrorMessage(error, "Couldn't load revenue trend."),
    reload: refetch,
    isLoading,
  };
}

/** Hook to fetch only plan mix distribution. */
export function useRevenuePlanMix() {
  const { data, error, refetch, isLoading } = useGetRevenuePlanMixQuery(undefined, POLLING);
  return {
    data: data ?? null,
    error: data || !error ? null : queryErrorMessage(error, "Couldn't load plan mix."),
    reload: refetch,
    isLoading,
  };
}

/** Top paying organizations (its own small request). */
export function useTopOrganizations() {
  return useGetTopOrganizationsQuery(undefined, POLLING).data ?? null;
}

/** First page of settled (paid or refunded) payments: the "Latest payments" list. */
export function useLatestPayments() {
  const params = useMemo(() => pageParams(1, { settled: true }), []);
  return useGetPaymentsQuery(params, POLLING).data?.data ?? null;
}
