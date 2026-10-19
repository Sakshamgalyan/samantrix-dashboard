"use client";

import dynamic from "next/dynamic";
import { Card, Tabs } from "@galyan/ui";
import { LogIn, Building2 } from "lucide-react";
import { useAuthPageContext } from "@/features/auth/context";
import { useAuth } from "@/features/auth";
import type { AuthMode } from "@/features/auth/types/state";
import { AuthShowcase } from "@/features/auth/components/auth-showcase";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterOrgForm } from "@/features/auth/components/register-org-form";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { BackupCodesCard } from "@/features/auth/components/backup-codes-card";
import { ServerErrorView } from "@/components/layout/common/server-error-view";

const ActiveSessionModal = dynamic(
  () =>
    import("@/features/auth/components/active-session-modal").then(
      (m) => m.ActiveSessionModal,
    ),
  { ssr: false },
);

const PortalSelectModal = dynamic(
  () =>
    import("@/features/auth/components/portal-select-modal").then(
      (m) => m.PortalSelectModal,
    ),
  { ssr: false },
);

const MODE_TABS = [
  { id: "login", label: "Sign in", icon: <LogIn className="size-3.5" /> },
  { id: "register-org", label: "Create organization", icon: <Building2 className="size-3.5" /> },
];

export const AuthContent = () => {
  const {
    authMode,
    setAuthMode,
    setStep,
    setError,
    requires2FA,
    backupCodes,
    portalSelection,
    handleSelectPortal,
    cancelPortalSelection,
  } = useAuthPageContext();
  const { isBackendDown, backendError, retryConnection } = useAuth();

  if (isBackendDown) {
    return (
      <div className="w-full flex justify-center py-6">
        <ServerErrorView
          mode="backend-offline"
          error={backendError ? new Error(backendError.message) : undefined}
          onRetry={retryConnection}
          fullScreen={false}
        />
      </div>
    );
  }

  if (backupCodes && backupCodes.length > 0) {
    return (
      <div className="w-full flex justify-center">
        <BackupCodesCard />
      </div>
    );
  }

  const switchMode = (mode: string) => {
    const nextMode = mode as AuthMode;
    setAuthMode(nextMode);
    setStep(1);
    setError(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (nextMode === "register-org") {
        url.searchParams.set("tab", "register-org");
      } else {
        url.searchParams.delete("tab");
        url.searchParams.delete("mode");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-12 items-center">
      <AuthShowcase />

      <section className="lg:col-span-6 flex justify-center lg:justify-end">
        <div className="relative w-full max-w-[580px] max-h-full transition-all duration-700 ease-out starting:opacity-0 starting:translate-y-6 starting:scale-[0.98]">
          {/* Soft brand halo behind the card */}
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-[var(--gy-primary)]/25 via-[var(--gy-secondary)]/10 to-[var(--gy-info)]/20 blur-3xl"
          />

          <Card variant="glass" padding="sm" radius="xl" shadow="lg" className="w-full max-h-[calc(100dvh-5rem)] overflow-y-auto">
            <div className="space-y-1.5 sm:space-y-2 p-1 sm:p-1.5">
              {/* Sign-in / create-organization tabs; hidden inside the 2FA and forgot-password flows */}
              {!requires2FA && authMode !== "forgot-password" && (
                <Tabs
                  items={MODE_TABS}
                  activeTab={authMode}
                  onTabChange={switchMode}
                  variant="card"
                  size="sm"
                  fullWidth
                />
              )}

              {/* Keyed so each view fades in when the mode changes */}
              <div
                key={requires2FA ? "2fa" : authMode}
                className="transition-all duration-500 ease-out starting:opacity-0 starting:translate-y-3 starting:blur-[2px]"
              >
                {authMode === "forgot-password" ? (
                  <ForgotPasswordForm />
                ) : authMode === "login" ? (
                  <LoginForm />
                ) : (
                  <RegisterOrgForm />
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <ActiveSessionModal />
      <PortalSelectModal
        isOpen={portalSelection !== null}
        organizationName={portalSelection?.organizationName ?? null}
        submitting={portalSelection?.submitting ?? null}
        error={portalSelection?.error ?? null}
        onSelect={handleSelectPortal}
        onCancel={cancelPortalSelection}
      />
    </div>
  );
};
