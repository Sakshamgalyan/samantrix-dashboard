"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { SubscriptionContextValue } from "@/features/subscription/types/context";
import { initialSubscriptionState, subscriptionReducer } from "@/features/subscription/context/reducer";

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialSubscriptionState);

  return (
    <SubscriptionContext.Provider value={{ state, dispatch }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
