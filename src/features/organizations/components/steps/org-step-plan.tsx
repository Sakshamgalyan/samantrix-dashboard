"use client";

import { Dropdown, Input, Typography } from "@galyan/ui";
import { Layers, ShieldCheck, Users } from "lucide-react";
import {
  BILLING_OPTIONS,
  CREATE_STATUS_OPTIONS,
  PLAN_META,
  PLAN_ORDER,
} from "@/features/organizations/common/constants";
import type { OrgStepProps } from "@/features/organizations/common/form-types";

export const OrgStepPlan = ({
  values,
  errors,
  editing,
  onChange,
  onSelectChange,
}: OrgStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-[var(--gy-primary)]" />
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text-primary)"
            className="text-base"
          >
            Plan & Resource Limits
          </Typography>
        </div>
        <Typography
          variant="p"
          textColor="var(--gy-text-secondary)"
          className="text-xs"
        >
          Assign the subscription tier, seat capacity and initial lifecycle
          status.
        </Typography>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Dropdown
          label="Subscription Plan Tier"
          size="sm"
          options={PLAN_ORDER.map((p) => ({
            value: p,
            label: `${PLAN_META[p].label} Plan`,
          }))}
          value={values.planTier}
          onChange={onSelectChange("planTier")}
        />
        <Dropdown
          label="Billing Cycle"
          size="sm"
          options={BILLING_OPTIONS}
          value={values.billingCycle}
          onChange={onSelectChange("billingCycle")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Member Limit (Seats)"
          type="number"
          min={1}
          size="sm"
          fullWidth
          required
          leftIcon={<Users className="size-3.5 text-[var(--gy-text-muted)]" />}
          helperText="Maximum users allowed concurrently"
          value={values.maxMembers}
          onChange={onChange("maxMembers")}
          hasError={Boolean(errors.maxMembers)}
          error={errors.maxMembers}
        />
        <Input
          label="Virtual Office Workspaces"
          type="number"
          min={1}
          size="sm"
          fullWidth
          required
          leftIcon={
            <ShieldCheck className="size-3.5 text-[var(--gy-text-muted)]" />
          }
          helperText="Maximum concurrent 3D virtual office spaces"
          value={values.maxWorkspaces}
          onChange={onChange("maxWorkspaces")}
          hasError={Boolean(errors.maxWorkspaces)}
          error={errors.maxWorkspaces}
        />
      </div>

      {!editing && (
        <div>
          <Dropdown
            label="Initial Lifecycle Status"
            size="sm"
            options={CREATE_STATUS_OPTIONS}
            value={values.status}
            onChange={onSelectChange("status")}
          />
          <p className="mt-1 text-[11px] text-[var(--gy-text-secondary)]">
            Active organizations can immediately log into the workplace. Trial
            starts a 14-day trial period.
          </p>
        </div>
      )}
    </div>
  );
};
