"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Dropdown,
  Typography,
} from "@galyan/ui";
import { Building2, Save } from "lucide-react";
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  withCurrent,
} from "@/features/settings/common/constants";
import type { ProfileForm } from "@/features/settings/types/api";

export interface OrganizationProfileCardProps {
  profileForm: ProfileForm;
  canEdit: boolean;
  loading: boolean;
  saving: boolean;
  onChange: (field: keyof ProfileForm, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const OrganizationProfileCard = ({
  profileForm,
  canEdit,
  loading,
  saving,
  onChange,
  onSubmit,
}: OrganizationProfileCardProps) => {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="lg"
      isLoading={loading}
      skeletonLines={6}
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
    >
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] shrink-0">
            <Building2 className="size-4.5" />
          </div>
          <div>
            <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-base sm:text-lg">
              Organization profile
            </Typography>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm mt-0.5">
              Official company naming, contact emails, and regional operational attributes.
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="mt-5">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Display organization name"
              type="text"
              required
              size="sm"
              value={profileForm.name}
              disabled={!canEdit}
              onChange={(e) => onChange("name", e.target.value)}
              fullWidth
            />
            <Input
              label="Legal registered entity name"
              type="text"
              size="sm"
              value={profileForm.legalName}
              disabled={!canEdit}
              onChange={(e) => onChange("legalName", e.target.value)}
              placeholder="e.g. Acme Innovations Inc."
              fullWidth
            />
            <Dropdown
              label="Primary industry"
              size="sm"
              options={INDUSTRY_OPTIONS}
              value={profileForm.industry}
              disabled={!canEdit}
              onChange={(val) => onChange("industry", String(val))}
            />
            <Dropdown
              label="Company size"
              size="sm"
              options={withCurrent(COMPANY_SIZE_OPTIONS, profileForm.companySize)}
              value={profileForm.companySize}
              disabled
              onChange={(val) => onChange("companySize", String(val))}
            />
            <Input
              label="Official website"
              type="url"
              size="sm"
              value={profileForm.website}
              disabled={!canEdit}
              onChange={(e) => onChange("website", e.target.value)}
              placeholder="https://acme.com"
              fullWidth
            />
            <Input
              label="Primary contact email"
              type="email"
              size="sm"
              value={profileForm.businessEmail}
              disabled
              onChange={(e) => onChange("businessEmail", e.target.value)}
              placeholder="contact@acme.com"
              fullWidth
            />
            <Input
              label="Secondary contact email"
              type="email"
              size="sm"
              value={profileForm.secondaryEmail}
              disabled={!canEdit}
              onChange={(e) => onChange("secondaryEmail", e.target.value)}
              placeholder="billing@acme.com"
              fullWidth
            />
            <Input
              label="Business phone"
              type="tel"
              size="sm"
              value={profileForm.businessPhone}
              disabled={!canEdit}
              onChange={(e) => onChange("businessPhone", e.target.value)}
              placeholder="+1 555-0199"
              fullWidth
            />
            <Input
              label="Headquarters address"
              type="text"
              size="sm"
              value={profileForm.address}
              disabled={!canEdit}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="123 Tech Boulevard"
              fullWidth
            />
            <Input
              label="City"
              type="text"
              size="sm"
              value={profileForm.city}
              disabled={!canEdit}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Austin"
              fullWidth
            />
            <Input
              label="State / Province"
              type="text"
              size="sm"
              value={profileForm.state}
              disabled={!canEdit}
              onChange={(e) => onChange("state", e.target.value)}
              placeholder="Texas"
              fullWidth
            />
            <Input
              label="Country"
              type="text"
              size="sm"
              value={profileForm.country}
              disabled={!canEdit}
              onChange={(e) => onChange("country", e.target.value)}
              placeholder="United States"
              fullWidth
            />
          </div>

          {canEdit && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="size-3.5" />}
                disabled={saving}
                isLoading={saving}
                loadingText="Saving profile..."
                className="w-full sm:w-auto"
              >
                Save profile details
              </Button>
            </div>
          )}
        </form>
      </CardBody>
    </Card>
  );
};
