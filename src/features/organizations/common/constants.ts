import type { ChipVariant } from "@galyan/ui";
import type { OrgPlanTier, OrgStatus } from "../types";

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
export const CAN_ACTIVATE: OrgStatus[] = ["SUSPENDED", "PENDING", "CANCELLED"];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "?";
