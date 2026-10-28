"use client";

import { Dropdown, Input, Typography } from "@galyan/ui";
import { Building2, Globe } from "lucide-react";
import {
  COMPANY_SIZE_OPTIONS,
  ORG_TYPE_OPTIONS,
} from "@/features/organizations/common/constants";
import { withCurrent } from "@/features/organizations/common/with-current";
import type { OrgStepProps } from "@/features/organizations/common/form-types";

export const OrgStepProfile = ({
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
          <Building2 className="size-4 text-[var(--gy-primary)]" />
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text-primary)"
            className="text-base"
          >
            Organization Profile
          </Typography>
        </div>
        <Typography
          variant="p"
          textColor="var(--gy-text-secondary)"
          className="text-xs"
        >
          Basic identity and public company details for the virtual workplace.
        </Typography>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Organization Name"
          size="sm"
          fullWidth
          required
          placeholder="Acme Corporation"
          value={values.name}
          onChange={onChange("name")}
          hasError={Boolean(errors.name)}
          error={errors.name}
        />
        <Input
          label="Legal Name"
          size="sm"
          fullWidth
          placeholder="Acme Corporation Pvt Ltd"
          value={values.legalName}
          onChange={onChange("legalName")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="URL Slug"
          size="sm"
          fullWidth
          placeholder={
            editing ? undefined : "e.g. acme-corp (auto-generated if empty)"
          }
          helperText="Lowercase letters, numbers and dashes"
          value={values.slug}
          onChange={onChange("slug")}
        />
        <Dropdown
          label="Organization Type"
          size="sm"
          options={withCurrent(ORG_TYPE_OPTIONS, values.orgType)}
          value={values.orgType}
          onChange={onSelectChange("orgType")}
          placeholder="Select type"
          clearable
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Industry"
          size="sm"
          fullWidth
          placeholder="e.g. Technology, Finance, SaaS"
          value={values.industry}
          onChange={onChange("industry")}
        />
        <Dropdown
          label="Company Size"
          size="sm"
          options={withCurrent(COMPANY_SIZE_OPTIONS, values.companySize)}
          value={values.companySize}
          onChange={onSelectChange("companySize")}
          placeholder="Select size"
          clearable
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Official Website"
          size="sm"
          fullWidth
          placeholder="https://acme.com"
          leftIcon={<Globe className="size-3.5 text-[var(--gy-text-muted)]" />}
          value={values.website}
          onChange={onChange("website")}
        />
        <Input
          label="Email Domain"
          size="sm"
          fullWidth
          placeholder="acme.com"
          value={values.domain}
          onChange={onChange("domain")}
        />
      </div>
    </div>
  );
};
