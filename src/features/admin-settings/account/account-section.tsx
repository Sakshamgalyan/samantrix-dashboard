"use client";

import React from "react";
import { Chip, Typography } from "@galyan/ui";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import {
  AdminLoadError,
  AdminPageSkeleton,
} from "@/components/layout/common/states";
import { GlassSection } from "@/components/layout/common/glass-section";
import {
  errorMessage,
  useGetAccountProfileQuery,
  useGetActiveSessionsQuery,
} from "@/features/admin-settings/account/api";
import { ProfileCard } from "@/features/admin-settings/account/profile-card";
import { PasswordCard } from "@/features/admin-settings/account/password-card";
import { SessionsCard } from "@/features/admin-settings/account/sessions-card";

/** The signed-in user's own account: profile, password, two-factor status and devices. */
export const AccountSection = () => {
  const profileQuery = useGetAccountProfileQuery();
  // The device list is secondary: a failed load keeps the last one (or none)
  const sessionsQuery = useGetActiveSessionsQuery();
  const { refetch: refetchProfile } = profileQuery;
  const { refetch: refetchSessions } = sessionsQuery;
  const profile = profileQuery.data ?? null;
  const sessions = sessionsQuery.data ?? [];
  const error = profileQuery.error
    ? errorMessage(profileQuery.error, "Could not load your account.")
    : null;

  const retry = () => {
    void refetchProfile();
    void refetchSessions();
  };

  if (!profile) {
    return error ? (
      <AdminLoadError
        title="Account unavailable"
        message={error}
        onRetry={retry}
      />
    ) : (
      <AdminPageSkeleton />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        {/* Keyed on the saved values so the form resets to them after a save */}
        <ProfileCard
          key={`${profile.fullName}|${profile.phone}|${profile.timezone}|${profile.avatarUrl ?? ""}`}
          profile={profile}
        />
        <GlassSection
          title="Two-factor authentication"
          subtitle="A code from your authenticator app at every sign-in"
          aside={
            profile.twoFactorEnabled ? (
              <Chip
                size="sm"
                variant="success"
                icon={<ShieldCheck className="size-3" />}
              >
                Enabled
              </Chip>
            ) : (
              <Chip
                size="sm"
                variant="warning"
                icon={<ShieldAlert className="size-3" />}
              >
                Off
              </Chip>
            )
          }
        >
          <Typography
            variant="p"
            textColor="var(--gy-text-secondary)"
            className="text-xs"
          >
            {profile.twoFactorEnabled
              ? "Your account asks for an authenticator code after your password."
              : "Two-factor authentication is off for your account. Ask a superadmin if your role requires it."}
          </Typography>
        </GlassSection>
      </div>
      <div className="space-y-4">
        <PasswordCard />
        <SessionsCard sessions={sessions} />
      </div>
    </div>
  );
};
