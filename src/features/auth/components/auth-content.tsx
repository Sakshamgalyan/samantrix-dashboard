"use client";

import { Card, Tabs } from "@galyan/ui";
import { LogIn, Building2 } from "lucide-react";
import { useAuthPageContext } from "../context";
import type { AuthMode } from "../types";
import { AuthShowcase } from "./auth-showcase";
import { LoginForm } from "./login-form";
import { RegisterOrgForm } from "./register-org-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { BackupCodesCard } from "./backup-codes-card";
import { ActiveSessionModal } from "./active-session-modal";
import { PortalSelectModal } from "./portal-select-modal";

const MODE_TABS = [
  { id: "login", label: "Sign in", icon: <LogIn className="size-3.5" /> },
  { id: "register-org", label: "Create organization", icon: <Building2 className="size-3.5" /> },
];

export function AuthContent() {
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

  if (backupCodes && backupCodes.length > 0) {
    return (
      <div className="w-full flex justify-center">
        <BackupCodesCard />
      </div>
    );
  }

  const switchMode = (mode: string) => {
    setAuthMode(mode as AuthMode);
    setStep(1);
    setError(null);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">
      <AuthShowcase />

      <section className="lg:col-span-5 flex justify-center lg:justify-end">
        <div className="relative w-full max-w-[460px] transition-all duration-700 ease-out starting:opacity-0 starting:translate-y-6 starting:scale-[0.98]">
          {/* Soft brand halo behind the card */}
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-[var(--gy-primary)]/25 via-[var(--gy-secondary)]/10 to-[var(--gy-info)]/20 blur-3xl"
          />

          <Card variant="glass" padding="md" radius="xl" shadow="lg">
            <div className="space-y-4">
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
}
