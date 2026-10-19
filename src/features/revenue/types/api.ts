import type { PlanTier } from "@/features/payments/types";

export interface RevenueKpis {
  mrr: number;
  arr: number;
  arpa: number;
  payingOrganizations: number;
  seatsSold: number;
  collectedThisMonth: number;
  collectedLastMonth: number;
  collectedGrowthPct: number | null;
  collectedLast12m: number;
  refundsLast12m: number;
  refundCountLast12m: number;
  failedPaymentsLast30d: number;
  failedAmountLast30d: number;
  pendingCheckoutsLast30d: number;
  trialingOrganizations: number;
  /** MRR from yearly-billed subscriptions */
  yearlyMrr: number;
}

/** GET /finance/revenue/kpis (superadmin): Revenue KPIs and payment health. */
export interface RevenueKpisReport {
  currency: string;
  kpis: RevenueKpis;
}

export interface RevenueTrendItem {
  month: string;
  collected: number;
  refunds: number;
}

/** GET /finance/revenue/trend (superadmin): 12-month monthly collections and refunds. */
export interface RevenueTrendReport {
  currency: string;
  trend: RevenueTrendItem[];
  collectedLast12m?: number;
}

export interface PlanMixItem {
  planTier: PlanTier;
  organizations: number;
  seats: number;
  mrr: number;
}

/** GET /finance/revenue/plan-mix (superadmin): Breakdown by plan tier. */
export interface RevenuePlanMixReport {
  currency: string;
  planMix: PlanMixItem[];
  totalMrr?: number;
}

/** Composite revenue report combining KPIs, trend and plan mix. */
export interface RevenueReport {
  currency: string;
  kpis: RevenueKpis;
  trend: RevenueTrendItem[];
  planMix: PlanMixItem[];
}

/** GET /finance/revenue/top-organizations (superadmin; fixed top 8). */
export interface TopOrganizations {
  currency: string;
  organizations: {
    organization: { id: string; name: string };
    planTier: PlanTier | null;
    seats: number;
    lifetimePaid: number;
  }[];
}
