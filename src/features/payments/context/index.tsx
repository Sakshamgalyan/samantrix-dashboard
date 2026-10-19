"use client";

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { pageParams } from "@/features/common/pagination";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import type {
  ManualPaymentInput,
  PaymentFilters,
  PaymentsContextType,
  PaymentsPageState,
  PlanCreateInput,
  PlanTier,
  PlanUpdateInput,
  SeatFilters,
} from "@/features/payments/types";
import { initialPaymentsState, paymentsReducer } from "@/features/payments/context/reducer";
import * as actions from "@/features/payments/context/action";
import {
  LONG_LIVED_QUERY,
  useCreatePlanMutation,
  useGetFinancePlansQuery,
  useGetPaymentsConfigQuery,
  useGetPaymentsQuery,
  useGetPaymentsSummaryQuery,
  useGetSeatsQuery,
  useRecordManualPaymentMutation,
  useRefundPaymentMutation,
  useUpdatePlanMutation,
} from "@/features/payments/context/api";

const POLLING = { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true } as const;

export const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

export const PaymentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [ui, dispatch] = useReducer(paymentsReducer, initialPaymentsState);
  const { filters, seatFilters } = ui;

  // A stable params object per filter set: a filter change is one request, a re-render none
  const listParams = useMemo(
    () => pageParams(filters.page, { status: filters.status, provider: filters.provider, search: filters.search }),
    [filters],
  );
  const seatParams = useMemo(
    () => pageParams(seatFilters.page, { paidOnly: seatFilters.paidOnly, search: seatFilters.search }),
    [seatFilters],
  );

  // The summary is shared with the admin overview; plans and config are long-lived lookups
  const summaryQuery = useGetPaymentsSummaryQuery(undefined, POLLING);
  const paymentsQuery = useGetPaymentsQuery(listParams, POLLING);
  const seatsQuery = useGetSeatsQuery(seatParams, POLLING);
  const plansQuery = useGetFinancePlansQuery(undefined, LONG_LIVED_QUERY);
  const configQuery = useGetPaymentsConfigQuery(undefined, LONG_LIVED_QUERY);

  const [recordManualPaymentMutation] = useRecordManualPaymentMutation();
  const [refundPaymentMutation] = useRefundPaymentMutation();
  const [createPlanMutation] = useCreatePlanMutation();
  const [updatePlanMutation] = useUpdatePlanMutation();

  // The tables keep the previous page on screen while a new page or filter loads, and the last
  // good data when a refresh fails; KPI / seats / plans / config sections hide themselves when missing
  const state = useMemo<PaymentsPageState>(() => {
    const payments = paymentsQuery.data ?? null;
    return {
      filters,
      seatFilters,
      summary: summaryQuery.data ?? null,
      payments,
      seats: seatsQuery.data ?? null,
      plans: plansQuery.data ?? [],
      config: configQuery.data ?? null,
      loading: !payments && !paymentsQuery.error,
      error: !payments && paymentsQuery.error ? queryErrorMessage(paymentsQuery.error, "Couldn't load payments.") : null,
    };
  }, [
    filters,
    seatFilters,
    summaryQuery.data,
    paymentsQuery.data,
    paymentsQuery.error,
    seatsQuery.data,
    plansQuery.data,
    configQuery.data,
  ]);

  const { refetch: refetchSummary } = summaryQuery;
  const { refetch: refetchPayments } = paymentsQuery;
  const { refetch: refetchSeats } = seatsQuery;
  const { refetch: refetchPlans } = plansQuery;
  const { refetch: refetchConfig } = configQuery;

  const reload = useCallback(async () => {
    await Promise.allSettled([refetchSummary(), refetchPayments(), refetchSeats(), refetchPlans(), refetchConfig()]);
  }, [refetchSummary, refetchPayments, refetchSeats, refetchPlans, refetchConfig]);

  const setFilters = useCallback((f: Partial<PaymentFilters>) => dispatch(actions.setFilters(f)), []);
  const setSeatFilters = useCallback((f: Partial<SeatFilters>) => dispatch(actions.setSeatFilters(f)), []);

  // Mutations invalidate the cached payments / seats / plans for every screen; no manual reload
  const recordManualPayment = useCallback(
    async (input: ManualPaymentInput) => {
      const res = await recordManualPaymentMutation(input).unwrap();
      return { invoiceNumber: res.invoiceNumber };
    },
    [recordManualPaymentMutation],
  );

  const refundPayment = useCallback(
    async (paymentId: string, amount: number | undefined, reason: string) => {
      await refundPaymentMutation({ paymentId, amount, reason }).unwrap();
    },
    [refundPaymentMutation],
  );

  const updatePlan = useCallback(
    async (planTier: PlanTier, input: PlanUpdateInput) => {
      await updatePlanMutation({ planTier, input }).unwrap();
    },
    [updatePlanMutation],
  );

  const createPlan = useCallback(
    async (input: PlanCreateInput) => {
      await createPlanMutation(input).unwrap();
    },
    [createPlanMutation],
  );

  const value = useMemo<PaymentsContextType>(
    () => ({ state, setFilters, setSeatFilters, reload, recordManualPayment, refundPayment, updatePlan, createPlan }),
    [state, setFilters, setSeatFilters, reload, recordManualPayment, refundPayment, updatePlan, createPlan],
  );

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
};

export const usePaymentsContext = (): PaymentsContextType => {
  const context = useContext(PaymentsContext);
  if (!context) throw new Error("usePaymentsContext must be used within a PaymentsProvider");
  return context;
};

export * from "@/features/payments/context/reducer";
export * from "@/features/payments/context/action";
export * from "@/features/payments/context/api";
export * from "@/features/payments/context/hooks";
