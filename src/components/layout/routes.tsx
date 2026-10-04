import { lazy, type ComponentType, type LazyExoticComponent } from "react";
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
  type LucideIcon,
} from "lucide-react";

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
  component: LazyExoticComponent<ComponentType>;
  badge?: string;
  badgeColor?: "primary" | "danger" | "success" | "warning" | "neutral";
}

const page = (load: () => Promise<{ default: ComponentType }>) => lazy(load);

// One overview screen; it renders the admin or organization view from the console scope.
const overviewPage = page(() => import("@/features/overview/page"));

/**
 * Single source of truth for the dashboard SPA: React Router builds its routes
 * from this list and the sidebar builds its navigation from it.
 */
export const DASHBOARD_ROUTES: DashboardRoute[] = [
  {
    path: "admin",
    label: "Overview",
    description: "Platform-wide metrics: organizations, revenue, and recent activity.",
    icon: LayoutDashboard,
    group: "Overview",
    scope: "admin",
    component: overviewPage,
  },
  {
    path: "overview",
    label: "Overview",
    description: "Your organization at a glance: members, usage, and recent activity.",
    icon: LayoutDashboard,
    group: "Overview",
    scope: "workspace",
    component: overviewPage,
  },

  // ── Platform administration ─────────────────────────────────────────────
  {
    path: "admin/developers",
    label: "Developers",
    description: "Review developer registrations and approve or reject pending accounts.",
    icon: Code2,
    group: "Platform",
    scope: "admin",
    badge: "Queue",
    badgeColor: "warning",
    component: page(() => import("@/features/developers/page")),
  },
  {
    path: "admin/organizations",
    label: "Organizations",
    description: "Every tenant on the platform: status, plan, and owners.",
    icon: Building2,
    group: "Platform",
    scope: "admin",
    component: page(() => import("@/features/organizations/page")),
  },
  {
    path: "admin/payments",
    label: "Payments & Services",
    description: "Platform revenue, subscriptions, and payment activity across organizations.",
    icon: DollarSign,
    group: "Platform",
    scope: "admin",
    component: page(() => import("@/features/payments/page")),
  },
  {
    path: "admin/features",
    label: "Feature Flags",
    description: "Turn platform features on or off and control rollout by plan.",
    icon: Sparkles,
    group: "Growth & Telemetry",
    scope: "admin",
    component: page(() => import("@/features/feature-flags/page")),
  },
  {
    path: "admin/marketing-analytics",
    label: "Marketing Analytics",
    description: "Visitor traffic and conversion from the Samantrix marketing site.",
    icon: Globe,
    group: "Growth & Telemetry",
    scope: "admin",
    component: page(() => import("@/features/marketing-analytics/page")),
  },
  {
    path: "admin/leads",
    label: "Leads & Waitlist",
    description: "Inbound contact requests and the early-access waitlist queue.",
    icon: Target,
    group: "Growth & Telemetry",
    scope: "admin",
    badge: "Inbound",
    badgeColor: "primary",
    component: page(() => import("@/features/leads/page")),
  },
  {
    path: "admin/versioning",
    label: "Versioning & Releases",
    description: "Track app versions and manage release rollouts.",
    icon: Rocket,
    group: "Growth & Telemetry",
    scope: "admin",
    component: page(() => import("@/features/versioning/page")),
  },
  {
    path: "admin/settings",
    label: "Platform Settings",
    description: "Platform-wide configuration that applies to every organization.",
    icon: Settings,
    group: "Growth & Telemetry",
    scope: "admin",
    component: page(() => import("@/features/admin-settings/page")),
  },

  // ── Organization workspace ──────────────────────────────────────────────
  {
    path: "users",
    label: "Team Members",
    description: "Invite people, assign roles, and manage your organization's members.",
    icon: Users,
    group: "Workspace",
    scope: "workspace",
    component: page(() => import("@/features/users/page")),
  },
  {
    path: "features",
    label: "Feature Add-ons",
    description: "Enable optional features available on your plan.",
    icon: Sparkles,
    group: "Workspace",
    scope: "workspace",
    component: page(() => import("@/features/features/page")),
  },
  {
    path: "analytics",
    label: "Analytics",
    description: "How your team uses the virtual office: presence, rooms, and meetings.",
    icon: BarChart3,
    group: "Workspace",
    scope: "workspace",
    component: page(() => import("@/features/analytics/page")),
  },
  {
    path: "subscription",
    label: "Plan & Usage",
    description: "Your current plan, seat usage, and upgrade options.",
    icon: CreditCard,
    group: "Billing",
    scope: "workspace",
    component: page(() => import("@/features/subscription/page")),
  },
  {
    path: "billing",
    label: "Invoices",
    description: "Billing history and downloadable invoices.",
    icon: Receipt,
    group: "Billing",
    scope: "workspace",
    component: page(() => import("@/features/billing/page")),
  },
  {
    path: "security",
    label: "Security & 2FA",
    description: "Two-factor authentication and your organization's security policies.",
    icon: ShieldCheck,
    group: "Governance",
    scope: "workspace",
    component: page(() => import("@/features/security/page")),
  },
  {
    path: "audit-logs",
    label: "Audit Logs",
    description: "A record of security and administrative actions in your organization.",
    icon: FileText,
    group: "Governance",
    scope: "workspace",
    component: page(() => import("@/features/audit-logs/page")),
  },
  {
    path: "integrations",
    label: "API & Integrations",
    description: "API keys and connections to third-party tools.",
    icon: KeyRound,
    group: "Governance",
    scope: "workspace",
    component: page(() => import("@/features/integrations/page")),
  },
  {
    path: "settings",
    label: "Organization Settings",
    description: "Your organization's profile, locale, and workspace defaults.",
    icon: Settings,
    group: "Governance",
    scope: "workspace",
    component: page(() => import("@/features/settings/page")),
  },
];

/** Route matching a router location; longest path wins. */
export function matchDashboardRoute(pathname: string): DashboardRoute | undefined {
  const relative = pathname.replace(/^\/+|\/+$/g, "");
  return [...DASHBOARD_ROUTES]
    .sort((a, b) => b.path.length - a.path.length)
    .find((r) => relative === r.path || relative.startsWith(`${r.path}/`));
}
