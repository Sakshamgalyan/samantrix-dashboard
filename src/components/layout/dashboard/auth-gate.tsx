"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Typography } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { PortalGate } from "@/components/layout/dashboard/portal-gate";
import { ServerErrorView } from "@/components/layout/common/server-error-view";

export function AuthGate({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    isBackendDown,
    backendError,
    retryConnection,
  } = useAuth();

  useEffect(() => {
    // Only redirect to /auth if we are genuinely not loading, unauthenticated, AND backend is alive
    if (!isLoading && !isAuthenticated && !isBackendDown) {
      router.replace("/auth");
    }
  }, [isLoading, isAuthenticated, isBackendDown, router]);

  // If backend server is not working, immediately display the dedicated error page
  if (isBackendDown) {
    return (
      <ServerErrorView
        mode="backend-offline"
        error={backendError ? new Error(backendError.message) : undefined}
        onRetry={async () => {
          await retryConnection();
        }}
        fullScreen
      />
    );
  }

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

  return <DashboardShell>{children}</DashboardShell>;
}

export default AuthGate;
