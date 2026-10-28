"use client";

import { Chip, Typography } from "@galyan/ui";
import { Building2, CheckCircle2, ShieldCheck, User } from "lucide-react";
import { PLAN_META } from "@/features/organizations/common/constants";
import type { FormValues } from "@/features/organizations/common/form-types";
import type { OrgPlanTier } from "@/features/organizations/types";

export const OrgStepReviewCard = ({
  values,
  editing,
  ownerMode,
}: {
  values: FormValues;
  editing: boolean;
  ownerMode?: "new" | "existing";
}) => {
  const planTier = (values.planTier || "FREE") as OrgPlanTier;
  const planInfo = PLAN_META[planTier] ?? {
    label: planTier,
    variant: "neutral",
  };

  return (
    <div className="rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--gy-border)] pb-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-[var(--gy-success)]" />
          <Typography
            variant="label"
            weight="semibold"
            textColor="var(--gy-text-primary)"
            className="text-xs uppercase tracking-wider"
          >
            Configuration Summary
          </Typography>
        </div>
        <Chip size="xs" variant={planInfo.variant}>
          {planInfo.label} Plan
        </Chip>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-start gap-1.5">
          <Building2 className="size-3.5 text-[var(--gy-text-muted)] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[var(--gy-text-secondary)] block text-[11px]">
              Organization
            </span>
            <span className="font-medium text-[var(--gy-text-primary)] truncate block">
              {values.name || "Untitled Org"}
            </span>
            {values.slug && (
              <span className="text-[10px] text-[var(--gy-text-muted)] block truncate">
                /{values.slug}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <ShieldCheck className="size-3.5 text-[var(--gy-text-muted)] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[var(--gy-text-secondary)] block text-[11px]">
              Limits & Cycle
            </span>
            <span className="font-medium text-[var(--gy-text-primary)] block">
              {values.maxMembers} seats · {values.billingCycle}
            </span>
            <span className="text-[10px] text-[var(--gy-text-muted)] block">
              {values.maxWorkspaces} office workspaces
            </span>
          </div>
        </div>

        {!editing && values.ownerEmail && (
          <div className="col-span-2 flex items-start gap-1.5 pt-1 border-t border-[var(--gy-border)]">
            <User className="size-3.5 text-[var(--gy-text-muted)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[var(--gy-text-secondary)] block text-[11px]">
                Root Admin (
                {ownerMode === "new" ? "New Account" : "Existing Account"})
              </span>
              <span className="font-medium text-[var(--gy-text-primary)] truncate block">
                {ownerMode === "new" && values.ownerFullName
                  ? `${values.ownerFullName} · `
                  : ""}
                {values.ownerEmail}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
