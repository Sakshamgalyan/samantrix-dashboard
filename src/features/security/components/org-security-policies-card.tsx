"use client";

import React from "react";
import {
  Card,
  Typography,
  Skeleton,
  Toggle,
  Input,
  Button,
  Chip,
} from "@galyan/ui";
import { Globe, ShieldCheck } from "lucide-react";
import type { PolicyFormState } from "@/features/security/types/api";

export interface OrgSecurityPoliciesCardProps {
  policyForm: PolicyFormState;
  loading: boolean;
  savingSettings: boolean;
  canEdit: boolean;
  onFieldChange: <K extends keyof PolicyFormState>(field: K, value: PolicyFormState[K]) => void;
  onAddDomain: () => void;
  onRemoveDomain: (domain: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const OrgSecurityPoliciesCard = ({
  policyForm,
  loading,
  savingSettings,
  canEdit,
  onFieldChange,
  onAddDomain,
  onRemoveDomain,
  onSubmit,
}: OrgSecurityPoliciesCardProps) => {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs space-y-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-base sm:text-lg">
            Organization security policies
          </Typography>
          <Typography variant="p" textColor="var(--gy-text-secondary)" className="mt-0.5 text-xs sm:text-sm">
            Enforce compliance rules, login timeouts, and invitation domain restrictions across all team members.
          </Typography>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="rectangular" height="4.5rem" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton variant="rectangular" height="4rem" />
            <Skeleton variant="rectangular" height="4rem" />
            <Skeleton variant="rectangular" height="4rem" />
          </div>
          <Skeleton variant="rectangular" height="4rem" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Mandatory 2FA */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-4">
              <div className="space-y-0.5">
                <Typography variant="p" weight="semibold" textColor="var(--gy-text)" className="text-sm">
                  Require two-factor auth for all members
                </Typography>
                <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs">
                  When enabled, members without 2FA will be required to set up an authenticator on their next login.
                </Typography>
              </div>
              <Toggle
                checked={policyForm.requireTwoFactor}
                isDisabled={!canEdit}
                aria-label="Require two-factor auth for all members"
                onChange={(e) => onFieldChange("requireTwoFactor", e.target.checked)}
              />
            </div>

            {/* Inputs Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                type="number"
                label="Session timeout (minutes)"
                min={15}
                max={1440}
                fullWidth
                size="sm"
                value={policyForm.sessionTimeoutMinutes}
                disabled={!canEdit}
                onChange={(e) => onFieldChange("sessionTimeoutMinutes", Number(e.target.value))}
              />
              <Input
                type="number"
                label="Minimum password length"
                min={8}
                max={64}
                fullWidth
                size="sm"
                value={policyForm.passwordMinLength}
                disabled={!canEdit}
                onChange={(e) => onFieldChange("passwordMinLength", Number(e.target.value))}
              />
              <Input
                type="number"
                label="Password rotation (days)"
                min={0}
                max={365}
                fullWidth
                size="sm"
                value={policyForm.passwordExpiresDays}
                disabled={!canEdit}
                onChange={(e) => onFieldChange("passwordExpiresDays", Number(e.target.value))}
              />
            </div>

            {/* Allowed Domains */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    label="Allowed email domains for team invitations"
                    placeholder="e.g. acme.com"
                    fullWidth
                    size="sm"
                    leftIcon={<Globe className="size-4" />}
                    value={policyForm.newDomain}
                    disabled={!canEdit}
                    onChange={(e) => onFieldChange("newDomain", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onAddDomain();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!canEdit || !policyForm.newDomain.trim()}
                  onClick={onAddDomain}
                  className="w-full sm:w-auto"
                >
                  Add domain
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {policyForm.allowedEmailDomains.length === 0 ? (
                  <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs">
                    No domain restrictions enforced (any email domain can be invited).
                  </Typography>
                ) : (
                  policyForm.allowedEmailDomains.map((dom) => (
                    <Chip
                      key={dom}
                      variant="soft"
                      size="sm"
                      icon={<Globe className="size-3" />}
                      removable={canEdit}
                      onRemove={() => onRemoveDomain(dom)}
                    >
                      {dom}
                    </Chip>
                  ))
                )}
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={savingSettings}
                loadingText="Saving changes..."
                className="w-full sm:w-auto"
              >
                Save security policies
              </Button>
            </div>
          )}
        </form>
      )}
    </Card>
  );
};
