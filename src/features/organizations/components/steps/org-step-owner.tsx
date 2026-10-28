"use client";

import { Input, RadioGroup, Textarea, Typography } from "@galyan/ui";
import { FileText, Mail, Phone, User, UserCheck } from "lucide-react";
import { OrgStepReviewCard } from "@/features/organizations/components/steps/org-step-review-card";
import type { OrgStepProps } from "@/features/organizations/common/form-types";

export const OrgStepOwner = ({
  values,
  errors,
  editing,
  onChange,
  ownerMode = "new",
  onOwnerModeChange,
}: OrgStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <UserCheck className="size-4 text-[var(--gy-primary)]" />
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text-primary)"
            className="text-base"
          >
            {editing
              ? "Internal Notes & Confirmation"
              : "Root Administrator & Review"}
          </Typography>
        </div>
        <Typography
          variant="p"
          textColor="var(--gy-text-secondary)"
          className="text-xs"
        >
          {editing
            ? "Add private developer notes and review changes before saving."
            : "Primary workspace owner with root superadmin privileges."}
        </Typography>
      </div>

      {!editing && (
        <div className="space-y-3 rounded-xl border border-[var(--gy-border)] p-3.5 bg-[var(--gy-surface)]">
          <RadioGroup
            name="owner-mode"
            orientation="horizontal"
            size="sm"
            value={ownerMode}
            onChange={(v) => onOwnerModeChange?.(v as "new" | "existing")}
            options={[
              { value: "new", label: "Create a new owner account" },
              { value: "existing", label: "Use an existing account" },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Owner Email Address"
              type="email"
              size="sm"
              fullWidth
              required
              placeholder="owner@acme.com"
              leftIcon={
                <Mail className="size-3.5 text-[var(--gy-text-muted)]" />
              }
              value={values.ownerEmail}
              onChange={onChange("ownerEmail")}
              hasError={Boolean(errors.ownerEmail)}
              error={errors.ownerEmail}
            />

            {ownerMode === "new" && (
              <Input
                label="Owner Full Name"
                size="sm"
                fullWidth
                required
                placeholder="Jane Doe"
                leftIcon={
                  <User className="size-3.5 text-[var(--gy-text-muted)]" />
                }
                value={values.ownerFullName}
                onChange={onChange("ownerFullName")}
                hasError={Boolean(errors.ownerFullName)}
                error={errors.ownerFullName}
              />
            )}
          </div>

          {ownerMode === "new" && (
            <div className="sm:w-1/2">
              <Input
                label="Owner Phone (Optional)"
                type="tel"
                size="sm"
                fullWidth
                placeholder="+91 98765 43210"
                leftIcon={
                  <Phone className="size-3.5 text-[var(--gy-text-muted)]" />
                }
                value={values.ownerPhone}
                onChange={onChange("ownerPhone")}
              />
            </div>
          )}

          <p className="text-[11px] text-[var(--gy-text-secondary)]">
            {ownerMode === "new"
              ? "The owner will receive an email confirmation to set their password on the Simantrix login page."
              : "Use an existing user account that does not already belong to another organization."}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <FileText className="size-3.5 text-[var(--gy-text-muted)]" />
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs"
          >
            Internal Developer Notes
          </Typography>
        </div>
        <Textarea
          size="sm"
          fullWidth
          rows={2}
          maxLength={2000}
          placeholder="Private notes (visible only to platform developers in this console)..."
          value={values.notes}
          onChange={onChange("notes")}
        />
      </div>

      <OrgStepReviewCard
        values={values}
        editing={editing}
        ownerMode={ownerMode}
      />
    </div>
  );
};
