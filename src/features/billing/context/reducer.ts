import type { BillingState, BillingAction } from "@/features/billing/types";

export const initialBillingState: BillingState = {
  tab: "INVOICES",
  page: 1,
};

export function billingReducer(state: BillingState, action: BillingAction): BillingState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, tab: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
}
