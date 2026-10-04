"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useAutoRefresh } from "@/components/admin";
import type {
  InvoiceTab,
  PaymentsContextType,
  SubscriptionTab,
} from "../types";
import { initialPaymentsState, paymentsReducer } from "./reducer";
import * as actions from "./action";
import { loadBillingOverviewApi } from "./api";

const PaymentsContext = createContext<PaymentsContextType | undefined>(
  undefined,
);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  // All page state lives in the reducer
  const [state, dispatch] = useReducer(paymentsReducer, initialPaymentsState);

  const load = useCallback(() => loadBillingOverviewApi(dispatch), []);
  useAutoRefresh(load);

  const refresh = useCallback(async () => {
    dispatch(actions.setRefreshing(true));
    await load();
  }, [load]);

  const setSubscriptionTab = useCallback(
    (tab: SubscriptionTab) => dispatch(actions.setSubscriptionTab(tab)),
    [],
  );
  const setSubscriptionSearch = useCallback(
    (search: string) => dispatch(actions.setSubscriptionSearch(search)),
    [],
  );
  const setInvoiceTab = useCallback(
    (tab: InvoiceTab) => dispatch(actions.setInvoiceTab(tab)),
    [],
  );
  const setInvoiceSearch = useCallback(
    (search: string) => dispatch(actions.setInvoiceSearch(search)),
    [],
  );

  const visibleSubscriptions = useMemo(() => {
    const term = state.subscriptionSearch.trim().toLowerCase();
    return (state.data?.subscriptions ?? []).filter(
      (s) =>
        (state.subscriptionTab === "ALL" ||
          s.status === state.subscriptionTab) &&
        (!term ||
          s.organization.name.toLowerCase().includes(term) ||
          s.organization.slug.toLowerCase().includes(term) ||
          s.planTier.toLowerCase().includes(term)),
    );
  }, [state.data, state.subscriptionTab, state.subscriptionSearch]);

  const visibleInvoices = useMemo(() => {
    const term = state.invoiceSearch.trim().toLowerCase();
    return (state.data?.invoices.recent ?? []).filter(
      (i) =>
        (state.invoiceTab === "ALL" || i.status === state.invoiceTab) &&
        (!term ||
          i.invoiceNumber.toLowerCase().includes(term) ||
          i.organization.name.toLowerCase().includes(term)),
    );
  }, [state.data, state.invoiceTab, state.invoiceSearch]);

  const value = useMemo<PaymentsContextType>(
    () => ({
      state,
      dispatch,
      visibleSubscriptions,
      visibleInvoices,
      setSubscriptionTab,
      setSubscriptionSearch,
      setInvoiceTab,
      setInvoiceSearch,
      refresh,
    }),
    [
      state,
      visibleSubscriptions,
      visibleInvoices,
      setSubscriptionTab,
      setSubscriptionSearch,
      setInvoiceTab,
      setInvoiceSearch,
      refresh,
    ],
  );

  return (
    <PaymentsContext.Provider value={value}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePaymentsContext(): PaymentsContextType {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error(
      "usePaymentsContext must be used within a PaymentsProvider",
    );
  }
  return context;
}

export * from "./reducer";
export * from "./action";
export * from "./api";
