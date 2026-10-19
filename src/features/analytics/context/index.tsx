"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { AnalyticsContextValue } from "@/features/analytics/types/context";
import { initialAnalyticsState, analyticsReducer } from "@/features/analytics/context/reducer";

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(analyticsReducer, initialAnalyticsState);

  return (
    <AnalyticsContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
