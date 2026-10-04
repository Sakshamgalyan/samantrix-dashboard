/** Shapes of GET /finance/platform/overview (money totals are in `currency`, USD). */

export type PlanTier = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface RevenueSummary {
  /** Monthly recurring revenue: active + past-due subscriptions, yearly plans / 12. */
  mrr: number;
  arr: number;
  payingOrganizations: number;
  trialingOrganizations: number;
  pastDueSubscriptions: number;
  canceledSubscriptions: number;
  cancelingAtPeriodEnd: number;
  collectedLast30d: number;
  collectedLast12m: number;
  /** Billing subscriptions in another currency (not included in the totals). */
  otherCurrencySubscriptions: number;
}

export interface PlanShare {
  planTier: PlanTier;
  organizations: number;
  mrr: number;
}

export interface MonthlyRevenuePoint {
  /** UTC month key, e.g. "2026-10". */
  month: string;
  collected: number;
  payments: number;
}

export interface SubscriptionRow {
  id: string;
  organization: { id: string; name: string; slug: string; status: string };
  planTier: PlanTier;
  billingCycle: "MONTHLY" | "YEARLY";
  /** Lower-case: active, trialing, past_due, canceled… */
  status: string;
  amount: number;
  currency: string;
  /** Normalised monthly amount; 0 unless the subscription bills. */
  monthlyAmount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  organization: { id: string; name: string };
  amount: number;
  currency: string;
  /** Upper-case: PAID, PENDING, FAILED, VOID… */
  status: string;
  paymentMethod: string | null;
  issuedAt: string;
  dueDate: string | null;
  paidAt: string | null;
}

export interface BillingOverview {
  generatedAt: string;
  currency: string;
  revenue: RevenueSummary;
  organizations: {
    total: number;
    withSubscription: number;
    withoutSubscription: number;
  };
  planDistribution: PlanShare[];
  subscriptionStatuses: { status: string; count: number }[];
  monthlyRevenue: MonthlyRevenuePoint[];
  subscriptions: SubscriptionRow[];
  invoices: {
    byStatus: { status: string; count: number }[];
    recent: InvoiceRow[];
  };
}
