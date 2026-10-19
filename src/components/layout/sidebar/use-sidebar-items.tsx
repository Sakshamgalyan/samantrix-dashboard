import { useMemo } from "react";
import type { SidebarItemData } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { DASHBOARD_ROUTES } from "@/components/layout/routes";
import type { ConsoleScope } from "@/components/layout/scope-context";
import { hasOrgRole, hasPermission } from "@/utils/roles";
import { usePendingDevelopers } from "@/components/layout/sidebar/use-pending-developers";

export function useSidebarItems(scope: ConsoleScope): SidebarItemData[] {
  const { user, organization } = useAuth();
  const planTier = organization?.planTier;
  const pendingDevelopers = usePendingDevelopers(scope === "admin" && hasPermission(user, "developers:manage"));

  return useMemo<SidebarItemData[]>(
    () =>
      DASHBOARD_ROUTES.filter(
        (r) =>
          !r.hideInSidebar &&
          (r.scope === "shared" || r.scope === scope) &&
          (!r.permission || hasPermission(user, r.permission)) &&
          // Workspace pages follow the organization role (members see only what they can use)
          (scope !== "workspace" || hasOrgRole(user, r.orgRoles)),
      ).map((r) => {
        const Icon = r.icon;
        const item: SidebarItemData = {
          id: r.path,
          label: r.label,
          icon: <Icon className="size-4" />,
          group: r.group,
          badge: r.badge,
          badgeColor: r.badgeColor,
        };
        // Live counts replace the static route badges
        if (r.path.endsWith("developers")) {
          item.badge = pendingDevelopers > 0 ? String(pendingDevelopers) : undefined;
          item.badgeColor = "warning";
        }
        if (r.path.endsWith("leads")) item.badge = undefined;
        if (r.path.endsWith("security")) {
          item.badge = user?.twoFactorEnabled ? undefined : "Action";
          item.badgeColor = "warning";
        }
        if (r.path.endsWith("subscription") && planTier) {
          item.badge = planTier;
          item.badgeColor = "primary";
        }
        return item;
      }),
    [scope, user, planTier, pendingDevelopers],
  );
}
