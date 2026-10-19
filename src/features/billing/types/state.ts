export type BillingTab = "INVOICES" | "PAYMENTS";

export interface BillingState {
  tab: BillingTab;
  page: number;
}
