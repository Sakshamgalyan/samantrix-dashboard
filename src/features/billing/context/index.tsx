"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { BillingContextValue } from "@/features/billing/types";
import { initialBillingState, billingReducer } from "@/features/billing/context/reducer";

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(billingReducer, initialBillingState);

  return (
    <BillingContext.Provider value={{ state, dispatch }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
}
