import type { ChipVariant } from "@galyan/ui";
import { DEVELOPER_ROLES, developerRoleLabel } from "@/utils/roles";
import type {
  DeveloperDialogKind,
  DeveloperStatus,
  RoleOption,
} from "@/features/developers/types";

export const STATUS_META: Record<
  DeveloperStatus,
  { label: string; variant: ChipVariant }
> = {
  PENDING_VERIFICATION: { label: "Pending", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  INACTIVE: { label: "Rejected", variant: "danger" },
  SUSPENDED: { label: "Suspended", variant: "danger" },
};

export const ROLE_CHIP: Record<string, ChipVariant> = {
  SUPERADMIN: "primary",
  MANAGER: "success",
  MEMBER: "soft",
  AUDITOR: "neutral",
  USER: "warning",
};

/** Roles that can be granted ("Pending" is never granted). Superadmin is filtered out for managers. */
export const ROLE_OPTIONS: RoleOption[] = DEVELOPER_ROLES.filter(
  (r) => r.value !== "USER",
).map((r) => ({ value: r.value, label: r.label, description: r.description }));

export const roleLabel = developerRoleLabel;

export const STATUS_FILTERS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_VERIFICATION", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "INACTIVE", label: "Rejected" },
];

export const ROLE_FILTERS = [
  { value: "ALL", label: "All roles" },
  ...DEVELOPER_ROLES.map((r) => ({ value: r.value, label: r.label })),
];

/** Dialog kinds that pick a role. */
export const ROLE_DIALOGS = new Set<DeveloperDialogKind>([
  "approve",
  "reinstate",
  "role",
]);
