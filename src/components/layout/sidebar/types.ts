import type { DashboardRoute } from "@/components/layout/routes";
import type { ConsoleScope } from "@/components/layout/scope-context";

export interface SidebarProps {
  scope: ConsoleScope;
  activeRoute?: DashboardRoute;
  canSwitchScope: boolean;
  onScopeChange: (scope: ConsoleScope) => void;
}
