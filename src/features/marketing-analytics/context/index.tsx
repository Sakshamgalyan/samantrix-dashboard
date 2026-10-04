"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useAutoRefresh } from "@/components/admin";
import type { MarketingContextType, MarketingRange } from "../types";
import { initialMarketingState, marketingReducer } from "./reducer";
import * as actions from "./action";
import { loadReportApi, loadVisitsApi } from "./api";

const MarketingContext = createContext<MarketingContextType | undefined>(
  undefined,
);

export function MarketingProvider({ children }: { children: React.ReactNode }) {
  // All page state lives in the reducer
  const [state, dispatch] = useReducer(marketingReducer, initialMarketingState);
  const { range, visitsPage } = state;

  // Each loader re-runs when its input changes, and every 60 s while the page is open
  const loadReport = useCallback(() => loadReportApi(range, dispatch), [range]);
  const loadVisits = useCallback(
    () => loadVisitsApi(visitsPage, dispatch),
    [visitsPage],
  );
  useAutoRefresh(loadReport);
  useAutoRefresh(loadVisits);

  const refresh = useCallback(async () => {
    dispatch(actions.setRefreshing(true));
    await Promise.all([loadReport(), loadVisits()]);
  }, [loadReport, loadVisits]);

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
}

export function useMarketingContext(): MarketingContextType {
  const context = useContext(MarketingContext);
  if (!context) {
    throw new Error(
      "useMarketingContext must be used within a MarketingProvider",
    );
  }
  return context;
}

export * from "./reducer";
export * from "./action";
export * from "./api";
