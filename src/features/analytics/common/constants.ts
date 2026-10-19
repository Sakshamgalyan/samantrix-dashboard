export interface ShortcutItem {
  title: string;
  description: string;
  href: string;
}

export const ANALYTICS_SHORTCUTS: ShortcutItem[] = [
  {
    title: "Feature Catalog",
    description: "Enable AI agents, data automation, and webhooks",
    href: "/organization/features",
  },
  {
    title: "Security & 2FA",
    description: "Manage mandatory two-factor and active sessions",
    href: "/organization/security",
  },
  {
    title: "Audit Trail",
    description: "Review system activities and admin operations",
    href: "/organization/audit-logs",
  },
];
