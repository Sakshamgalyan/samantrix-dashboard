import type { PaymentsAction, PaymentsPageState } from "../types";

export const initialPaymentsState: PaymentsPageState = {
  data: null,
  error: null,
  refreshing: false,
  subscriptionTab: "ALL",
  subscriptionSearch: "",
  invoiceTab: "ALL",
  invoiceSearch: "",
};

export function paymentsReducer(
  state: PaymentsPageState,
  action: PaymentsAction,
): PaymentsPageState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, data: action.payload, error: null, refreshing: false };

    case "LOAD_FAILURE":
      // Keep the last good data on screen; the error shows as a banner over it
      return { ...state, error: action.payload, refreshing: false };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_SUBSCRIPTION_TAB":
      return { ...state, subscriptionTab: action.payload };

    case "SET_SUBSCRIPTION_SEARCH":
      return { ...state, subscriptionSearch: action.payload };

    case "SET_INVOICE_TAB":
      return { ...state, invoiceTab: action.payload };

    case "SET_INVOICE_SEARCH":
      return { ...state, invoiceSearch: action.payload };

    default:
      return state;
  }
}
