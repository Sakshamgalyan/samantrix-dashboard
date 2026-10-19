"use client";

import { useState } from "react";
import { useAuth, type LoginPortal } from "@/features/auth";
import { PortalSelectModal } from "@/features/auth/components/portal-select-modal";
import { api, ApiError } from "@/lib/api-client/apiClient";

/** Developer reached the dashboard without choosing a console (e.g. reloaded mid sign-in). */
export function PortalGate() {
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
