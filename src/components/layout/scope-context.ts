import { useOutletContext } from "react-router-dom";

/** Console the user is looking at: platform administration or their own workspace. */
export type ConsoleScope = "admin" | "workspace";

export interface DashboardOutletContext {
  scope: ConsoleScope;
}

/** Read the active console scope from the dashboard shell (for routes rendered in its <Outlet>). */
export function useConsoleScope(): ConsoleScope {
  return useOutletContext<DashboardOutletContext>().scope;
}
