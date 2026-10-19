/** Response shapes of the finance endpoints used by the Payments page. */

import type { Paginated } from "@/features/common/pagination";

export type PlanTier = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type PaymentStatus = "CREATED" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentPurpose = "NEW_SUBSCRIPTION" | "RENEWAL" | "UPGRADE" | "SEAT_PURCHASE" | "MANUAL";
export type PaymentProvider = "RAZORPAY" | "MANUAL";

/** GET /finance/plans (small fixed lookup, not paginated) */
export interface Plan {
  id: string;
  planTier: PlanTier;
  name: string;
  description: string | null;
  pricePerSeatMonthly: number;
  pricePerSeatYearly: number;
  currency: string;
  minSeats: number;
  maxSeats: number | null;
  features: string[];
  isActive: boolean;
}

/** `GET /finance/plans` query: `activeOnly` hides plans that are off sale (even for superadmins). */
export interface PlansQuery {
  activeOnly?: boolean;
}

/** GET /finance/payments/config */
export interface PaymentsConfig {
  enabled: boolean;
  taxPercent: number;
  webhookConfigured: boolean;
}

/** One row of GET /finance/payments */
export interface PaymentRow {
  id: string;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  planTier: PlanTier | null;
  seats: number | null;
  method: string | null;
  failureReason: string | null;
  refundedAmount: number;
  paidAt: string | null;
  createdAt: string;
  /** Bank / UTR / cheque reference of a manual payment */
  reference: string | null;
  organization: { name: string };
  invoice: { invoiceNumber: string } | null;
}

/** GET /finance/payments */
export type PaymentsListResponse = Paginated<PaymentRow>;

/** GET /finance/payments/summary: the KPI row (also used by the admin overview). */
export interface PaymentsSummary {
  currency: string;
  collectedThisMonth: number;
  collectedLastMonth: number;
  paymentsThisMonth: number;
  failedLast30d: number;
  pendingCheckouts: number;
  seats: {
    seatsPurchased: number;
    seatsUsed: number;
    seatsUsedOnPaidPlans: number;
    utilisation: number | null;
    payingOrganizations: number;
    organizationsOverLimit: number;
  };
}

/** One row of GET /finance/seats */
export interface SeatRow {
  organization: { id: string; name: string };
  planTier: PlanTier;
  subscriptionStatus: string | null;
  billingCycle: BillingCycle | null;
  provider: string | null;
  renewsAt: string | null;
  seatsPurchased: number;
  seatsUsed: number;
  utilisation: number | null;
  overLimit: boolean;
}

/** GET /finance/seats */
export type SeatsResponse = Paginated<SeatRow>;

/** GET /finance/organizations/options (manual payment picker) */
export type OrganizationOptionsResponse = Paginated<{ id: string; name: string }>;

export interface PaymentFilters {
  status: PaymentStatus | "ALL";
  provider: PaymentProvider | "ALL";
  search: string;
  page: number;
}

export interface SeatFilters {
  paidOnly: boolean;
  search: string;
  page: number;
}

export interface ManualPaymentInput {
  organizationId: string;
  amount: number;
  method: string;
  reference?: string;
  paidAt?: string;
  applyToSubscription?: boolean;
  planTier?: PlanTier;
  billingCycle?: BillingCycle;
  seats?: number;
  notes?: string;
}

export type PlanUpdateInput = Partial<
  Pick<Plan, "name" | "description" | "pricePerSeatMonthly" | "pricePerSeatYearly" | "minSeats" | "maxSeats" | "features" | "isActive">
>;

export interface PlanCreateInput {
  planTier: PlanTier;
  name: string;
  description?: string;
  pricePerSeatMonthly?: number;
  pricePerSeatYearly?: number;
  minSeats?: number;
  maxSeats?: number | null;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface PlatformFeatureCatalogItem {
  id?: string;
  featureKey: string;
  name: string;
  description: string;
  category: string;
  defaultEnabled: boolean;
  minPlanTier: PlanTier;
  isEnabled?: boolean;
}
