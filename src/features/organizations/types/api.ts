/** Shapes returned by the platform admin organization endpoints (`/organizations/admin*`). */

export type OrgStatus =
  | "PENDING"
  | "ACTIVE"
  | "TRIAL"
  | "TRIALING"
  | "SUSPENDED"
  | "CANCELLED"
  | "DELETED";

export type OrgPlanTier = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export type BillingCycle = "MONTHLY" | "YEARLY";

/** Statuses the console can set (backend enforces the allowed transitions). */
export type SettableOrgStatus = "ACTIVE" | "SUSPENDED";

export interface OrganizationOwner {
  id: string;
  fullName: string;
  email: string;
}

/** Subscription columns shown in the organization table and read by the subscription form. */
export interface OrganizationListSubscription {
  planTier: OrgPlanTier;
  /** Purchased user seats */
  seats: number;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
}

/** Subscription as the detail dialog shows it. */
export interface OrganizationSubscription extends OrganizationListSubscription {
  status: string;
  /** RAZORPAY, MANUAL (assigned from the console), STRIPE (legacy) */
  paymentProvider: string | null;
  notes: string | null;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

/** One row of GET /organizations/admin (paginated). */
export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  country: string | null;
  status: OrgStatus;
  planTier: OrgPlanTier;
  billingCycle: BillingCycle;
  maxMembers: number;
  createdAt: string;
  owner: OrganizationOwner;
  subscription: OrganizationListSubscription | null;
  memberCount: number;
}

export interface OrganizationCounts {
  total: number;
  active: number;
  /** TRIAL + TRIALING */
  trial: number;
  suspended: number;
  pending: number;
  /** CANCELLED + DELETED */
  cancelled: number;
  newLast30d: number;
  /** Trialing organizations whose period ends in the next 14 days */
  trialsEndingIn14d: number;
  byPlan: Record<OrgPlanTier, number>;
}

/** GET /organizations/admin/summary */
export interface AdminOrganizationsSummary {
  generatedAt: string;
  counts: OrganizationCounts;
}

/** One row of GET /organizations/admin/:id/members (paginated). */
export interface OrganizationMemberRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  jobTitle: string | null;
}

export interface OrganizationInvoiceRow {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface OrganizationPaymentRow {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  purpose: string;
  planTier: OrgPlanTier | null;
  seats: number | null;
  method: string | null;
  paidAt: string | null;
  createdAt: string;
}

/** GET /organizations/admin/:id (members are paged separately). */
export interface AdminOrganizationDetail extends AdminOrganization {
  subscription: OrganizationSubscription | null;
  domain: string | null;
  companySize: string | null;
  maxWorkspaces: number;
  legalName: string | null;
  orgType: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  taxId: string | null;
  notes: string | null;
  website: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  invoiceCount: number;
  paymentCount: number;
  /** Latest 10 */
  recentPayments: OrganizationPaymentRow[];
  /** Latest 10 */
  recentInvoices: OrganizationInvoiceRow[];
}

/** A plan and its per-seat price (`GET /organizations/admin/plans`, a small fixed list). */
export interface SubscriptionPlan {
  planTier: OrgPlanTier;
  name: string;
  pricePerSeatMonthly: number;
  pricePerSeatYearly: number;
  currency: string;
  minSeats: number;
  maxSeats: number | null;
}

/** Profile fields shared by create and edit (all optional on edit). */
export interface OrganizationProfileInput {
  name: string;
  slug?: string;
  legalName?: string;
  domain?: string;
  orgType?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  website?: string;
  businessEmail?: string;
  businessPhone?: string;
  taxId?: string;
  notes?: string;
  planTier?: OrgPlanTier;
  billingCycle?: BillingCycle;
  maxMembers?: number;
  maxWorkspaces?: number;
}

export type CreatableOrgStatus = "ACTIVE" | "TRIAL" | "PENDING";

export interface CreateOrganizationRequest extends OrganizationProfileInput {
  status?: CreatableOrgStatus;
  ownerEmail: string;
  ownerFullName?: string;
  ownerPhone?: string;
}

export interface CreateOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  ownerId: string;
  ownerCreated: boolean;
  ownerEmailed: boolean;
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export interface AssignSubscriptionRequest {
  planTier: OrgPlanTier;
  billingCycle: BillingCycle;
  seats: number;
  amount?: number;
  currency?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  status?: SubscriptionStatus;
  notes?: string;
}

export interface UpdateOrganizationStatusRequest {
  status: SettableOrgStatus;
  reason?: string;
}

export interface UpdateOrganizationStatusResponse {
  id: string;
  name: string;
  status: OrgStatus;
  previousStatus: OrgStatus;
  updatedAt: string;
}
