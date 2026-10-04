import type {
  BillingOverview,
  InvoiceTab,
  PaymentsAction,
  SubscriptionTab,
} from "../types";

export const loadSuccess = (data: BillingOverview): PaymentsAction => ({
  type: "LOAD_SUCCESS",
  payload: data,
});

export const loadFailure = (error: string): PaymentsAction => ({
  type: "LOAD_FAILURE",
  payload: error,
});

export const setRefreshing = (refreshing: boolean): PaymentsAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setSubscriptionTab = (tab: SubscriptionTab): PaymentsAction => ({
  type: "SET_SUBSCRIPTION_TAB",
  payload: tab,
});

export const setSubscriptionSearch = (search: string): PaymentsAction => ({
  type: "SET_SUBSCRIPTION_SEARCH",
  payload: search,
});

export const setInvoiceTab = (tab: InvoiceTab): PaymentsAction => ({
  type: "SET_INVOICE_TAB",
  payload: tab,
});

export const setInvoiceSearch = (search: string): PaymentsAction => ({
  type: "SET_INVOICE_SEARCH",
  payload: search,
});
