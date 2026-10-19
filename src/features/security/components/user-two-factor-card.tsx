"use client";

import React from "react";
import { Card, Button, Chip, Typography } from "@galyan/ui";
import { ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";
import { SECURITY_FACTS } from "@/features/security/common/constants";

export interface UserTwoFactorCardProps {
  twoFactorEnabled: boolean;
  onOpenSetup: () => void;
  onOpenDisable: () => void;
}

export const UserTwoFactorCard = ({
  twoFactorEnabled,
  onOpenSetup,
  onOpenDisable,
}: UserTwoFactorCardProps) => {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs space-y-5"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--gy-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
              twoFactorEnabled
                ? "bg-[var(--gy-success)]/15 text-[var(--gy-success)]"
                : "bg-[var(--gy-warning)]/15 text-[var(--gy-warning)]"
            }`}
          >
            {twoFactorEnabled ? <ShieldCheck className="size-6" /> : <ShieldAlert className="size-6" />}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-base sm:text-lg">
                Your two-factor authentication
              </Typography>
              <Chip size="xs" variant={twoFactorEnabled ? "success" : "warning"}>
                {twoFactorEnabled ? "Active" : "Disabled"}
              </Chip>
            </div>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm leading-relaxed">
              {twoFactorEnabled
                ? "Your account requires an authenticator code or emergency recovery code during login."
                : "Protect administrative actions by attaching a standard TOTP authenticator application."}
            </Typography>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          {twoFactorEnabled ? (
            <Button variant="danger-soft" size="sm" onClick={onOpenDisable} className="w-full sm:w-auto">
              Disable 2FA
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<KeyRound className="size-4" />}
              onClick={onOpenSetup}
              className="w-full sm:w-auto"
            >
              Configure authenticator
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SECURITY_FACTS.map((fact) => (
          <div
            key={fact.label}
            className="space-y-1 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3.5"
          >
            <Typography variant="span" weight="semibold" textColor="var(--gy-text-subtle)" className="text-xs">
              {fact.label}
            </Typography>
            <Typography variant="p" weight="medium" className={`text-sm ${fact.tone}`}>
              {fact.value}
            </Typography>
          </div>
        ))}
      </div>
    </Card>
  );
};
