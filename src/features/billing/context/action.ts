import type { BillingTab, BillingAction } from "@/features/billing/types";

export const setBillingTabAction = (payload: BillingTab): BillingAction => ({
  type: "SET_TAB",
  payload,
});

export const setBillingPageAction = (payload: number): BillingAction => ({
  type: "SET_PAGE",
  payload,
});
