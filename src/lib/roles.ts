import type { CurrentUserSession } from "@/lib/auth-context";

const PLATFORM_ROLES = new Set(["SUPERADMIN", "PLATFORM_ADMIN", "REPORT_ADMIN"]);

/**
 * Whether the signed-in user may see the platform-admin console.
 * UI gating only — the backend enforces the real permission on every request.
 */
export function isPlatformAdmin(user: CurrentUserSession | null | undefined): boolean {
  if (!user) return false;
  return Boolean(
    (user.platformRole && PLATFORM_ROLES.has(user.platformRole)) ||
      user.role === "SUPERADMIN" ||
      user.email?.includes("admin@samantrix"),
  );
}
