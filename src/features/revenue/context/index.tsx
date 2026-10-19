"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { RevenueContextValue } from "@/features/revenue/types/context";
import { initialRevenueState, revenueReducer } from "@/features/revenue/context/reducer";

const RevenueContext = createContext<RevenueContextValue | undefined>(undefined);

export function RevenueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(revenueReducer, initialRevenueState);

  return (
    <RevenueContext.Provider value={{ state, dispatch }}>
      {children}
    </RevenueContext.Provider>
  );
}

export function useRevenueContext(): RevenueContextValue {
  const context = useContext(RevenueContext);
  if (!context) {
    throw new Error("useRevenueContext must be used within a RevenueProvider");
  }
  return context;
}

export * from "@/features/revenue/use-revenue";
