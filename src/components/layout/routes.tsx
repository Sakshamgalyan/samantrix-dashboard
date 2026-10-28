import {
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
  CreditCard,
  Receipt,
  ShieldCheck,
  FileText,
  KeyRound,
  Settings,
  Building2,
  Code2,
  Target,
  Rocket,
  Globe,
  DollarSign,
  TrendingUp,
  Bell,
  Boxes,
  Network,
  Bot,
  Laptop,
  Activity,
  Radio,
  type LucideIcon,
} from "lucide-react";
import {
  ORG_ADMINS,
  ORG_LEADS,
  type OrgRole,
  type Permission,
} from "@/utils/roles";

/** Which console a route belongs to; "shared" routes appear in both. */
export type DashboardScope = "admin" | "workspace" | "shared";

export interface DashboardRoute {
  /** URL path without the leading slash (admin console pages live under `admin`). */
  path: string;
  label: string;
  /** One-line purpose of the page, shown in the header's info tooltip. */
  description: string;
  icon: LucideIcon;
  group: string;
  scope: DashboardScope;
  badge?: string;
  badgeColor?: "primary" | "danger" | "success" | "warning" | "neutral";
  /** Developer-console permission needed to see the page (hidden from the sidebar otherwise). */
  permission?: Permission;
  /** Organization roles that may open a workspace page (everyone in the organization when unset). */
  orgRoles?: readonly OrgRole[];
  /** Hide from the primary navigation sidebar (e.g. notifications accessed via header bell). */
  hideInSidebar?: boolean;
}

/**
 * Single source of truth for the dashboard navigation and route metadata.
 */
export const DASHBOARD_ROUTES: DashboardRoute[] = [
  // ── Overviews ─────────────────────────────────────────────────────────────
  {
    path: "admin",
    label: "Overview",
    description: "Leads, organizations, developers and growth at a glance.",
    icon: LayoutDashboard,
    group: "Overview",
    scope: "admin",
  },
  {
    path: "organization",
    label: "Overview",
    description:
      "Your organization at a glance: members, usage, and recent activity.",
    icon: LayoutDashboard,
    group: "Overview",
    scope: "workspace",
  },

  // ── Admin Console ─────────────────────────────────────────────────────────
  {
    path: "admin/revenue",
    label: "Revenue",
    description:
      "Recurring revenue, collections, plan mix and top paying organizations.",
    icon: TrendingUp,
    group: "Overview",
    scope: "admin",
    permission: "revenue:view",
  },
  {
    path: "admin/developers",
    label: "Developers",
    description:
      "Developer accounts: approve registrations, change roles, edit or remove access.",
    icon: Code2,
    group: "Administration",
    scope: "admin",
    permission: "developers:manage",
  },
  {
    path: "admin/organizations",
    label: "Organizations",
    description:
      "Tenant registry: provision organizations, inspect members, manage subscriptions.",
    icon: Building2,
    group: "Administration",
    scope: "admin",
    permission: "organizations:manage",
  },
  {
    path: "admin/payments",
    label: "Payments",
    description:
      "Razorpay charges, manual payment entries, plans and pricing tiers.",
    icon: DollarSign,
    group: "Finance",
    scope: "admin",
    permission: "payments:manage",
  },
  {
    path: "admin/features",
    label: "Feature Flags",
    description:
      "Global switches and per-tier entitlements across the ecosystem.",
    icon: Sparkles,
    group: "System & Core",
    scope: "admin",
    permission: "features:manage",
  },
  {
    path: "admin/versioning",
    label: "App Versioning",
    description:
      "Manage versions, release channels, and rollouts for Simantrix Desktop App.",
    icon: Laptop,
    group: "System & Core",
    scope: "admin",
    permission: "versioning:manage",
  },
  {
    path: "admin/marketing-analytics",
    label: "Marketing Analytics",
    description:
      "Traffic, referral sources, and conversion funnels across simantrix-home.",
    icon: Globe,
    group: "Growth",
    scope: "admin",
    permission: "analytics:view",
  },
  {
    path: "admin/leads",
    label: "Lead Pipeline",
    description:
      "Enterprise inquiries, qualification stages, quotes and demo scheduling.",
    icon: Target,
    group: "Growth",
    scope: "admin",
    permission: "leads:manage",
  },
  {
    path: "admin/ecosystem",
    label: "Ecosystem Health",
    description:
      "Service status, uptime telemetry, database connectivity and dependencies.",
    icon: Activity,
    group: "Infrastructure",
    scope: "admin",
    permission: "ecosystem:view",
  },
  {
    path: "admin/realtime",
    label: "Realtime Gateway",
    description:
      "Live WebSocket monitor, cluster connection state and packet distribution.",
    icon: Radio,
    group: "Infrastructure",
    scope: "admin",
    permission: "ecosystem:view",
  },
  {
    path: "admin/queues",
    label: "Background Jobs",
    description:
      "BullMQ queue metrics: active, waiting, failed jobs and worker concurrency.",
    icon: Network,
    group: "Infrastructure",
    scope: "admin",
    permission: "ecosystem:view",
  },
  {
    path: "admin/audit-logs",
    label: "Platform Audit",
    description:
      "Immutable security trail: logins, role escalations, config changes and deletes.",
    icon: ShieldCheck,
    group: "Security & Compliance",
    scope: "admin",
    permission: "audit:view",
  },
  {
    path: "admin/settings",
    label: "Console Settings",
    description:
      "System parameters, notification routing, and your developer profile.",
    icon: Settings,
    group: "Security & Compliance",
    scope: "admin",
    permission: "console:read",
  },

  // ── Workspace Console ─────────────────────────────────────────────────────
  {
    path: "organization/users",
    label: "Team Members",
    description:
      "Directory of members, invitations, department assignments, and access roles.",
    icon: Users,
    group: "Directory",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/spaces",
    label: "Spaces & Zones",
    description:
      "Custom floor plans, meeting room configurations and spatial layouts.",
    icon: Boxes,
    group: "Workplace",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/departments",
    label: "Departments",
    description:
      "Organizational units, budget tracking, and group-level permission scopes.",
    icon: Network,
    group: "Directory",
    scope: "workspace",
    orgRoles: ORG_LEADS,
  },
  {
    path: "organization/ai-assistants",
    label: "AI Assistants",
    description:
      "Context bots, document indexing, and generative workspace assistants.",
    icon: Bot,
    group: "Workplace",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/features",
    label: "Features & Add-ons",
    description:
      "Enable or customize optional modules available under your plan tier.",
    icon: Sparkles,
    group: "Workplace",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/analytics",
    label: "Usage Analytics",
    description:
      "Seat utilization, room occupancy rates, and meeting duration trends.",
    icon: BarChart3,
    group: "Insights",
    scope: "workspace",
    orgRoles: ORG_LEADS,
  },
  {
    path: "organization/subscription",
    label: "Plan & Billing",
    description:
      "Current tier, seat allocation, renewal dates, and payment history.",
    icon: CreditCard,
    group: "Billing",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/billing",
    label: "Invoices & Receipts",
    description:
      "Downloadable tax invoices, GST receipts, and payment method settings.",
    icon: Receipt,
    group: "Billing",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/security",
    label: "Security & Policies",
    description:
      "Two-factor enforcement, domain restrictions, and access policies.",
    icon: KeyRound,
    group: "Administration",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/fleet",
    label: "Desktop Fleet",
    description:
      "Connected desktop app instances, version compliance, and remote sign-outs.",
    icon: Laptop,
    group: "Administration",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/audit-logs",
    label: "Audit Logs",
    description:
      "Activity trail of member joins, setting changes, and security events.",
    icon: FileText,
    group: "Administration",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/integrations",
    label: "Integrations",
    description:
      "Connect GitHub repositories, webhooks, and third-party productivity tools.",
    icon: Code2,
    group: "Administration",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },
  {
    path: "organization/settings",
    label: "Workspace Settings",
    description:
      "Organization identity, default time zones, and administrative controls.",
    icon: Settings,
    group: "Administration",
    scope: "workspace",
    orgRoles: ORG_ADMINS,
  },

  // ── Hidden Utility Routes ─────────────────────────────────────────────────
  {
    path: "organization/notifications",
    label: "Notifications",
    description: "System updates, security alerts, and activity feed.",
    icon: Bell,
    group: "Overview",
    scope: "workspace",
    hideInSidebar: true,
  },
  {
    path: "admin/notifications",
    label: "Notifications",
    description: "System updates, security alerts, and activity feed.",
    icon: Bell,
    group: "Overview",
    scope: "admin",
    hideInSidebar: true,
  },
];

// Longest path first, sorted once rather than on every navigation
const ROUTES_BY_SPECIFICITY = [...DASHBOARD_ROUTES].sort(
  (a, b) => b.path.length - a.path.length,
);

/** Route matching a router location; longest path wins. */
export function matchDashboardRoute(
  pathname: string,
): DashboardRoute | undefined {
  const relative = pathname.replace(/^\/+|\/+$/g, "");
  return ROUTES_BY_SPECIFICITY.find(
    (r) => relative === r.path || relative.startsWith(`${r.path}/`),
  );
}
