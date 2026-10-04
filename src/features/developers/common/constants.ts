import type { ChipVariant } from "@galyan/ui";
import type { DeveloperStatus, RoleOption } from "../types";

export const STATUS_META: Record<
  DeveloperStatus,
  { label: string; variant: ChipVariant }
> = {
  PENDING_VERIFICATION: { label: "Pending review", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  INACTIVE: { label: "Rejected", variant: "danger" },
  SUSPENDED: { label: "Suspended", variant: "danger" },
};

/** Roles an admin can assign on approval. Superadmin is offered only to Superadmins. */
export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "USER",
    label: "Standard developer",
    description: "Console access; no admin rights",
  },
  {
    value: "REPORT_ADMIN",
    label: "Report admin",
    description: "Read analytics and reports",
  },
  {
    value: "PLATFORM_SUPPORT",
    label: "Platform support",
    description: "Help organizations and users",
  },
  {
    value: "PLATFORM_BILLING",
    label: "Platform billing",
    description: "Subscriptions and invoices",
  },
  {
    value: "PLATFORM_ADMIN",
    label: "Platform admin",
    description: "Manage organizations and developers",
  },
  {
    value: "SUPERADMIN",
    label: "Superadmin",
    description: "Full platform access",
  },
];

export const roleLabel = (role: string) =>
  ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

/** Dialog kinds that pick a platform role. */
export const ROLE_DIALOGS = new Set(["approve", "role", "reinstate"]);
