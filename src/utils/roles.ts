import type { CurrentUserSession } from "@/features/auth";

/**
 * Developer-console roles. Mirrors `simantrix-backend/src/common/constants/platform-roles.constant.ts`.
 * UI gating only — the backend enforces the real permission on every request.
 */
export type DeveloperRole = "SUPERADMIN" | "MANAGER" | "MEMBER" | "AUDITOR" | "USER";

export const DEVELOPER_ROLES: { value: DeveloperRole; label: string; description: string }[] = [
  { value: "SUPERADMIN", label: "Superadmin", description: "Full access, including revenue and the feature catalog" },
  { value: "MANAGER", label: "Manager", description: "Approves developers; manages users, organizations and subscriptions" },
  { value: "MEMBER", label: "Member", description: "Junior developer: works leads and releases" },
  { value: "AUDITOR", label: "Auditor", description: "Read-only access" },
  { value: "USER", label: "Pending", description: "Registered, awaiting approval" },
];

export function developerRoleLabel(role?: string | null): string {
  return DEVELOPER_ROLES.find((r) => r.value === role)?.label ?? role ?? "—";
}

/** Everything the developer console can gate on. */
export type Permission =
  | "console:read" // any approved developer
  | "revenue:view"
  | "developers:manage" // approve, edit, delete, change roles
  | "organizations:manage" // create, edit, delete, status, subscriptions
  | "payments:view"
  | "payments:manage"
  | "features:manage"
  | "leads:work" // contact, notes, quotes, status
  | "leads:delete"
  | "leads:manage"
  | "releases:manage"
  | "versioning:manage"
  | "analytics:view"
  | "ecosystem:view"
  | "audit:view"
  | "settings:manage"
  | "platform:settings";

const ALL: DeveloperRole[] = ["SUPERADMIN", "MANAGER", "MEMBER", "AUDITOR"];
const WORKERS: DeveloperRole[] = ["SUPERADMIN", "MANAGER", "MEMBER"];
const ADMINS: DeveloperRole[] = ["SUPERADMIN", "MANAGER"];
const SUPER: DeveloperRole[] = ["SUPERADMIN"];

const PERMISSIONS: Record<Permission, DeveloperRole[]> = {
  "console:read": ALL,
  "revenue:view": SUPER,
  "developers:manage": ADMINS,
  "organizations:manage": ADMINS,
  "payments:view": [...ADMINS, "AUDITOR"],
  "payments:manage": ADMINS,
  "features:manage": SUPER,
  "leads:work": WORKERS,
  "leads:delete": ADMINS,
  "leads:manage": WORKERS,
  "releases:manage": WORKERS,
  "versioning:manage": WORKERS,
  "analytics:view": ALL,
  "ecosystem:view": ALL,
  "audit:view": [...ADMINS, "AUDITOR"],
  "settings:manage": SUPER,
  "platform:settings": SUPER,
};

/** The caller's developer role, or null for organization accounts. */
export function getDeveloperRole(user: CurrentUserSession | null | undefined): DeveloperRole | null {
  if (!user || user.userType !== "DEVELOPER") return null;
  return (user.platformRole as DeveloperRole) ?? null;
}

export function hasPermission(user: CurrentUserSession | null | undefined, permission: Permission): boolean {
  const role = getDeveloperRole(user);
  return role !== null && PERMISSIONS[permission].includes(role);
}

export const isSuperadmin = (user: CurrentUserSession | null | undefined) => getDeveloperRole(user) === "SUPERADMIN";

/** Whether the signed-in user may open the developer console. */
export function isPlatformAdmin(user: CurrentUserSession | null | undefined): boolean {
  return hasPermission(user, "console:read");
}

/**
 * Organization (workspace) roles. Mirrors the backend's `OrgRole`; the backend's `@Roles("OWNER", "ADMIN")`
 * guards billing, checkout and every settings change, so those pages are shown to owners and admins only.
 */
export type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

/** Owners and admins: billing, security, settings, integrations, audit logs, add-ons. */
export const ORG_ADMINS: readonly OrgRole[] = ["OWNER", "ADMIN"];
/** Owners, admins and managers: the team roster and usage analytics. */
export const ORG_LEADS: readonly OrgRole[] = ["OWNER", "ADMIN", "MANAGER"];

/** The caller's role in their organization, or null without one. */
export function getOrgRole(user: CurrentUserSession | null | undefined): OrgRole | null {
  if (!user?.organization) return null;
  const role = (user.organization.role ?? user.role) as string | undefined;
  return role && ["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"].includes(role) ? (role as OrgRole) : null;
}

/** Whether the caller's organization role is one of `roles` (always true when `roles` is unset). */
export function hasOrgRole(user: CurrentUserSession | null | undefined, roles?: readonly OrgRole[]): boolean {
  if (!roles) return true;
  const role = getOrgRole(user);
  return role !== null && roles.includes(role);
}
