import type { ChipVariant } from "@galyan/ui";
import type { OrgPlanTier, OrgStatus } from "@/features/organizations/types";

export const STATUS_META: Record<
  OrgStatus,
  { label: string; variant: ChipVariant }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  TRIAL: { label: "Trial", variant: "soft" },
  TRIALING: { label: "Trial", variant: "soft" },
  PENDING: { label: "Pending", variant: "warning" },
  SUSPENDED: { label: "Suspended", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },
  DELETED: { label: "Deleted", variant: "neutral" },
};

export const PLAN_META: Record<
  OrgPlanTier,
  { label: string; variant: ChipVariant }
> = {
  FREE: { label: "Free", variant: "neutral" },
  STARTER: { label: "Starter", variant: "soft" },
  PROFESSIONAL: { label: "Professional", variant: "outline" },
  ENTERPRISE: { label: "Enterprise", variant: "solid" },
};

export const PLAN_ORDER: OrgPlanTier[] = [
  "FREE",
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
];

/** Mirrors the backend transition table (organizations-admin.service.ts). */
export const CAN_SUSPEND: OrgStatus[] = [
  "ACTIVE",
  "TRIAL",
  "TRIALING",
  "PENDING",
];
export const CAN_ACTIVATE: OrgStatus[] = [
  "SUSPENDED",
  "PENDING",
  "CANCELLED",
  "TRIAL",
  "TRIALING",
  "DELETED",
];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "?";

export const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "TRIAL", label: "Trial" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CANCELLED", label: "Cancelled / deleted" },
];

export const PLAN_FILTER_OPTIONS = [
  { value: "ALL", label: "All plans" },
  ...PLAN_ORDER.map((p) => ({ value: p, label: PLAN_META[p].label })),
];

export const BILLING_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export const CREATE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "TRIAL", label: "Trial" },
  { value: "PENDING", label: "Pending" },
];

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past due" },
  { value: "canceled", label: "Canceled" },
];

export const COMPANY_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
].map((s) => ({ value: s, label: `${s} employees` }));

export const ORG_TYPE_OPTIONS = [
  "Private Corporation",
  "Public Company",
  "Startup",
  "Partnership",
  "Sole Proprietorship",
  "Non-profit",
  "Government",
  "Educational Institution",
].map((t) => ({ value: t, label: t }));

/** Seats in use vs purchased (subscription seats, else the member limit). */
export const seatsOf = (org: {
  memberCount: number;
  maxMembers: number;
  subscription: { seats: number } | null;
}) => ({
  used: org.memberCount,
  purchased: org.subscription?.seats ?? org.maxMembers,
});
