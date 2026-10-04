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

export interface OrganizationSubscription {
  status: string;
  planTier: OrgPlanTier;
  amount: number;
  currency: string;
  currentPeriodStart?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
  industry: string | null;
  country: string | null;
  companySize: string | null;
  status: OrgStatus;
  planTier: OrgPlanTier;
  billingCycle: BillingCycle;
  maxMembers: number;
  maxWorkspaces: number;
  createdAt: string;
  updatedAt: string;
  owner: OrganizationOwner;
  subscription: OrganizationSubscription | null;
  memberCount: number;
}

export interface OrganizationCounts {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  pending: number;
  cancelled: number;
  newLast30d: number;
  byStatus: Record<OrgStatus, number>;
  byPlan: Record<OrgPlanTier, number>;
}

export interface AdminOrganizationsResponse {
  generatedAt: string;
  counts: OrganizationCounts;
  limit: number;
  organizations: AdminOrganization[];
}

export interface OrganizationMemberRow {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  department: string | null;
  jobTitle: string | null;
  joinedAt: string;
}

export interface OrganizationInvoiceRow {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  dueDate: string | null;
  createdAt: string;
}

export interface AdminOrganizationDetail extends AdminOrganization {
  legalName: string | null;
  orgType: string | null;
  state: string | null;
  city: string | null;
  website: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  termsAcceptedAt: string | null;
  invitationCount: number;
  invoiceCount: number;
  members: OrganizationMemberRow[];
  recentInvoices: OrganizationInvoiceRow[];
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
