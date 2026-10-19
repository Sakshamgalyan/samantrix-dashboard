import type { CurrentUserSession } from "@/features/auth";
import { isPlatformAdmin } from "./roles";

/** Landing page of each console: developers work under /admin, organizations under /organization. */
export const CONSOLE_HOME = {
  admin: "/admin",
  workspace: "/organization",
  developer: "/admin",
} as const;

/** Where a signed-in user lands: their chosen portal, else platform admins → admin console. */
export function getHomePath(user: CurrentUserSession | null | undefined): string {
  const portal = user?.session?.loginAs;
  if (portal) return portal === "DEVELOPER" ? CONSOLE_HOME.admin : CONSOLE_HOME.workspace;
  if (user?.userType === "DEVELOPER" || isPlatformAdmin(user)) return CONSOLE_HOME.admin;
  return CONSOLE_HOME.workspace;
}