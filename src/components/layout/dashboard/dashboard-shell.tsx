"use client";

import React, { Suspense, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, type LoginPortal } from "@/features/auth";
import { CONSOLE_HOME } from "@/utils/home-path";
import { hasOrgRole, hasPermission, isPlatformAdmin } from "@/utils/roles";
import { AmbientBackdrop } from "@/components/layout/dashboard/ambient-backdrop";
import { PageFallback } from "@/components/layout/dashboard/page-fallback";
import { Header } from "@/components/layout/header";
import { PageErrorBoundary } from "@/components/layout/page-error-boundary";
import { matchDashboardRoute } from "@/components/layout/routes";
import type { ConsoleScope, DashboardOutletContext } from "@/components/layout/scope-context";
import { ScopeProvider } from "@/components/layout/scope-context";
import { Sidebar } from "@/components/layout/sidebar";

const PORTAL_SCOPE: Record<LoginPortal, ConsoleScope> = {
  DEVELOPER: "admin",
  ORGANIZATION: "workspace",
};

export function DashboardShell({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Developers chose a console when signing in; that choice fixes the scope for the session.
  const loginPortal = user?.userType === "DEVELOPER" ? user.session?.loginAs : null;
  const lockedScope = loginPortal ? PORTAL_SCOPE[loginPortal] : null;
  const canSwitchScope = !lockedScope && isPlatformAdmin(user);

  const activeRoute = matchDashboardRoute(pathname);
  // Scoped routes decide the console; on shared routes (overview) the user's toggle does.
  const [preferredScope, setPreferredScope] = useState<ConsoleScope>(() =>
    canSwitchScope ? "admin" : "workspace",
  );
  const scope: ConsoleScope =
    lockedScope ??
    (activeRoute && activeRoute.scope !== "shared"
      ? activeRoute.scope
      : canSwitchScope
        ? preferredScope
        : "workspace");

  // A locked session can't deep-link into the other console's pages
  const allowedScope: ConsoleScope | null = lockedScope ?? (isPlatformAdmin(user) ? null : "workspace");

  const routeOutsideScope =
    allowedScope !== null &&
    activeRoute &&
    activeRoute.scope !== "shared" &&
    activeRoute.scope !== allowedScope;
  const permissionDenied =
    Boolean(activeRoute?.permission) && !hasPermission(user, activeRoute!.permission!);
  const roleDenied =
    scope === "workspace" && !hasOrgRole(user, activeRoute?.orgRoles);
  const isUnauthorized = Boolean(routeOutsideScope || permissionDenied || roleDenied);

  useEffect(() => {
    if (routeOutsideScope) {
      router.replace(CONSOLE_HOME[allowedScope!]);
      return;
    }
    if (permissionDenied) {
      router.replace(CONSOLE_HOME[scope]);
      return;
    }
    if (roleDenied) {
      router.replace(CONSOLE_HOME.workspace);
    }
  }, [routeOutsideScope, permissionDenied, roleDenied, allowedScope, scope, router]);

  const changeScope = (next: ConsoleScope) => {
    setPreferredScope(next);
    if (activeRoute && activeRoute.scope !== "shared" && activeRoute.scope !== next) {
      router.push(CONSOLE_HOME[next]);
    }
  };

  const contextValue: DashboardOutletContext = {
    scope,
    changeScope,
    canSwitchScope,
  };

  return (
    <ScopeProvider value={contextValue}>
      <div className="relative isolate flex h-dvh w-full overflow-hidden bg-[var(--gy-background)] text-[var(--gy-text)] antialiased transition-colors duration-300">
        <AmbientBackdrop />
        <Sidebar
          scope={scope}
          activeRoute={activeRoute}
          canSwitchScope={canSwitchScope}
          onScopeChange={changeScope}
        />
        {/* Header sits inside the scroller so content passes under the sticky glass bar */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Header
            title={activeRoute?.label ?? "Dashboard"}
            description={activeRoute?.description}
            eyebrow={scope === "admin" ? "Developer console" : "Workspace"}
            icon={
              activeRoute?.icon ? (
                <activeRoute.icon className="size-4.5" />
              ) : undefined
            }
            badge={activeRoute?.badge}
            badgeColor={activeRoute?.badgeColor}
          />
          {/* Same horizontal edges as the header bar */}
          <main className="flex-1 pb-3 pl-2.5 pr-3 pt-3">
            <div
              key={pathname}
              className="w-full transition-all duration-300 ease-out starting:translate-y-2 starting:opacity-0"
            >
              <PageErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  {isUnauthorized ? <PageFallback /> : children}
                </Suspense>
              </PageErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ScopeProvider>
  );
}

export default DashboardShell;
