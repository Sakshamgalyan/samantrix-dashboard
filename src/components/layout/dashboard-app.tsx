"use client";

import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useRouter } from "next/navigation";
import { Skeleton, Spinner, Typography } from "@galyan/ui";
import { useAuth, type LoginPortal } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { isPlatformAdmin } from "@/lib/roles";
import { CONSOLE_HOME, getHomePath } from "@/lib/home-path";
import { PortalSelectModal } from "@/features/auth/components/portal-select-modal";
import { DASHBOARD_ROUTES, matchDashboardRoute } from "./routes";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { PageErrorBoundary } from "./page-error-boundary";
import type { ConsoleScope, DashboardOutletContext } from "./scope-context";

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton height="28px" width="30%" />
      <Skeleton height="120px" />
      <Skeleton height="260px" />
    </div>
  );
}

/** Soft colour fields behind the shell so the glass sidebar and header have something to blur. */
function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-40 size-[520px] rounded-full bg-[var(--gy-primary)]/20 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 size-[460px] rounded-full bg-[var(--gy-info)]/14 blur-[120px]" />
      <div className="absolute -bottom-48 left-1/3 size-[480px] rounded-full bg-[var(--gy-secondary)]/12 blur-[130px]" />
    </div>
  );
}

const PORTAL_SCOPE: Record<LoginPortal, ConsoleScope> = {
  DEVELOPER: "admin",
  ORGANIZATION: "workspace",
};

function DashboardShell() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Developers chose a console when signing in; that choice fixes the scope for the session.
  const loginPortal = user?.userType === "DEVELOPER" ? user.session?.loginAs : null;
  const lockedScope = loginPortal ? PORTAL_SCOPE[loginPortal] : null;
  const canSwitchScope = !lockedScope && isPlatformAdmin(user);

  const activeRoute = matchDashboardRoute(location.pathname);
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
  // Consoles this user may open: a developer's login choice, both for platform admins, else workspace.
  // (UI routing only; the backend enforces access on every request.)
  const allowedScope: ConsoleScope | null = lockedScope ?? (isPlatformAdmin(user) ? null : "workspace");
  const routeOutsideScope =
    allowedScope !== null && activeRoute && activeRoute.scope !== "shared" && activeRoute.scope !== allowedScope;
  if (routeOutsideScope) return <Navigate to={CONSOLE_HOME[allowedScope]} replace />;

  const changeScope = (next: ConsoleScope) => {
    setPreferredScope(next);
    if (activeRoute && activeRoute.scope !== "shared" && activeRoute.scope !== next) navigate(CONSOLE_HOME[next]);
  };

  const outletContext: DashboardOutletContext = { scope };

  return (
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
          eyebrow={scope === "admin" ? "Platform" : "Workspace"}
          icon={
            activeRoute?.icon ? (
              <activeRoute.icon className="size-4.5" />
            ) : undefined
          }
          badge={activeRoute?.badge}
          badgeColor={activeRoute?.badgeColor}
        />
        <main className="flex-1 p-6 lg:p-8">
          <div
            key={location.pathname}
            className="mx-auto max-w-7xl transition-all duration-300 ease-out starting:translate-y-2 starting:opacity-0"
          >
            <PageErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <Outlet context={outletContext} />
              </Suspense>
            </PageErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

/** Developer reached the dashboard without choosing a console (e.g. reloaded mid sign-in). */
function PortalGate() {
  const { user, refreshSession, logout } = useAuth();
  const [submitting, setSubmitting] = useState<LoginPortal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const select = async (portal: LoginPortal) => {
    setSubmitting(portal);
    setError(null);
    try {
      await api.patch("/login-history/current/portal", { loginAs: portal });
      await refreshSession();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open that console. Please try again.");
      setSubmitting(null);
    }
  };

  return (
    <div className="h-dvh bg-[var(--gy-background)]">
      <PortalSelectModal
        isOpen
        organizationName={user?.organization?.name ?? null}
        submitting={submitting}
        error={error}
        onSelect={select}
        onCancel={logout}
      />
    </div>
  );
}

/** Unknown console URL → the user's own console home. */
function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomePath(user)} replace />;
}

function AuthGate() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="grid h-dvh place-items-center bg-[var(--gy-background)]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="primary" />
          <Typography variant="span" className="text-xs uppercase tracking-widest text-[var(--gy-text-subtle)]">
            {isLoading ? "Connecting to Control Center" : "Redirecting to sign in"}
          </Typography>
        </div>
      </div>
    );
  }

  if (user?.session?.requiresPortalSelection) return <PortalGate />;

  return <DashboardShell />;
}

/** Client-only console SPA mounted by the `app/[...slug]` Next route (`/` is sign-in). */
export default function DashboardApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGate />}>
          {DASHBOARD_ROUTES.map(({ path, component: Page }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
