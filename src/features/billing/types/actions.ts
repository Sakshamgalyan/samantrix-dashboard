import type { BillingTab } from "@/features/billing/types/state";

export type BillingAction =
  | { type: "SET_TAB"; payload: BillingTab }
  | { type: "SET_PAGE"; payload: number };
