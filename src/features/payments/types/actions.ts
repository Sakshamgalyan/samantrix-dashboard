import type { BillingOverview } from "./api";
import type { InvoiceTab, SubscriptionTab } from "./state";

export type PaymentsAction =
  | { type: "LOAD_SUCCESS"; payload: BillingOverview }
  | { type: "LOAD_FAILURE"; payload: string }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_SUBSCRIPTION_TAB"; payload: SubscriptionTab }
  | { type: "SET_SUBSCRIPTION_SEARCH"; payload: string }
  | { type: "SET_INVOICE_TAB"; payload: InvoiceTab }
  | { type: "SET_INVOICE_SEARCH"; payload: string };
