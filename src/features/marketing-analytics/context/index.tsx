"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import { pageParams } from "@/features/common/pagination";
import type { MarketingContextType, MarketingPageState, MarketingRange } from "@/features/marketing-analytics/types";
import { initialMarketingState, marketingReducer } from "@/features/marketing-analytics/context/reducer";
import * as actions from "@/features/marketing-analytics/context/action";
import { useGetMarketingReportQuery, useGetRecentVisitsQuery } from "@/features/marketing-analytics/context/api";

export const MarketingContext = createContext<MarketingContextType | undefined>(
  undefined,
);

const POLL = { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true } as const;

export const MarketingProvider = ({ children }: { children: React.ReactNode }) => {
  // The reducer holds only UI state; the report and visits come from the shared cache
  const [ui, dispatch] = useReducer(marketingReducer, initialMarketingState);
  const { range, visitsPage } = ui;

  const reportQuery = useGetMarketingReportQuery(range, POLL);
  const visitsArgs = useMemo(() => pageParams(visitsPage), [visitsPage]);
  const visitsQuery = useGetRecentVisitsQuery(visitsArgs, POLL);
  const refetchReport = reportQuery.refetch;
  const refetchVisits = visitsQuery.refetch;

  // Keep the previous report / page on screen (with a spinning refresh) until the new one arrives
  const state = useMemo<MarketingPageState>(
    () => ({
      ...ui,
      refreshing: ui.refreshing || (reportQuery.isFetching && !reportQuery.currentData),
      report: reportQuery.data ?? null,
      error: reportQuery.error
        ? queryErrorMessage(reportQuery.error, "Couldn't load marketing analytics.")
        : null,
      visits: visitsQuery.data ?? null,
      visitsLoading: visitsQuery.isFetching && !visitsQuery.currentData,
      visitsError: visitsQuery.error
        ? queryErrorMessage(visitsQuery.error, "Couldn't load recent visits.")
        : null,
    }),
    [
      ui,
      reportQuery.data,
      reportQuery.currentData,
      reportQuery.isFetching,
      reportQuery.error,
      visitsQuery.data,
      visitsQuery.currentData,
      visitsQuery.isFetching,
      visitsQuery.error,
    ],
  );

  const refresh = useCallback(async () => {
    dispatch(actions.setRefreshing(true));
    try {
      await Promise.all([refetchReport(), refetchVisits()]);
    } finally {
      dispatch(actions.setRefreshing(false));
    }
  }, [refetchReport, refetchVisits]);

  const setRange = useCallback(
    (next: MarketingRange) => dispatch(actions.setRange(next)),
    [],
  );
  const setVisitsPage = useCallback(
    (page: number) => dispatch(actions.setVisitsPage(page)),
    [],
  );

  const value = useMemo<MarketingContextType>(
    () => ({ state, dispatch, setRange, setVisitsPage, refresh }),
    [state, setRange, setVisitsPage, refresh],
  );

  return (
    <MarketingContext.Provider value={value}>
      {children}
    </MarketingContext.Provider>
  );
};

export * from "@/features/marketing-analytics/context/hooks";

export * from "@/features/marketing-analytics/context/reducer";
export * from "@/features/marketing-analytics/context/action";
export * from "@/features/marketing-analytics/context/api";
