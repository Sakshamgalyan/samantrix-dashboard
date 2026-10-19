"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { OverviewContextValue } from "@/features/overview/types";
import { initialOverviewState, overviewReducer } from "@/features/overview/context/reducer";

const OverviewContext = createContext<OverviewContextValue | undefined>(undefined);

export function OverviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(overviewReducer, initialOverviewState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <OverviewContext.Provider value={value}>
      {children}
    </OverviewContext.Provider>
  );
}

export function useOverview(): OverviewContextValue {
  const context = useContext(OverviewContext);
  if (!context) {
    throw new Error("useOverview must be used within an OverviewProvider");
  }
  return context;
}
