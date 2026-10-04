import type { BillingOverview } from "./api";

/** "ALL" or a subscription status (lower-case, as the backend returns it). */
export type SubscriptionTab = string;

/** "ALL" or an invoice status (upper-case, as the backend returns it). */
export type InvoiceTab = string;

export interface PaymentsPageState {
  data: BillingOverview | null;
  error: string | null;
  refreshing: boolean;
  subscriptionTab: SubscriptionTab;
  subscriptionSearch: string;
  invoiceTab: InvoiceTab;
  invoiceSearch: string;
}
