"use client";

import { Input, Typography } from "@galyan/ui";
import { Mail, MapPin, Phone } from "lucide-react";
import type { OrgStepProps } from "@/features/organizations/common/form-types";

export const OrgStepAddress = ({
  values,
  errors,
  editing,
  onChange,
}: OrgStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-[var(--gy-primary)]" />
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text-primary)"
            className="text-base"
          >
            Contact & Address
          </Typography>
        </div>
        <Typography
          variant="p"
          textColor="var(--gy-text-secondary)"
          className="text-xs"
        >
          Official communications, invoices and office location details.
        </Typography>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Business Email"
          type="email"
          size="sm"
          fullWidth
          placeholder={editing ? undefined : "contact@acme.com"}
          leftIcon={<Mail className="size-3.5 text-[var(--gy-text-muted)]" />}
          value={values.businessEmail}
          onChange={onChange("businessEmail")}
          hasError={Boolean(errors.businessEmail)}
          error={errors.businessEmail}
        />
        <Input
          label="Business Phone"
          type="tel"
          size="sm"
          fullWidth
          placeholder="+91 98765 43210"
          leftIcon={<Phone className="size-3.5 text-[var(--gy-text-muted)]" />}
          value={values.businessPhone}
          onChange={onChange("businessPhone")}
        />
      </div>

      <div className="space-y-3">
        <Input
          label="Street Address"
          size="sm"
          fullWidth
          placeholder="Building, Street, Suite or Landmark"
          value={values.address}
          onChange={onChange("address")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label="City"
          size="sm"
          fullWidth
          placeholder="City"
          value={values.city}
          onChange={onChange("city")}
        />
        <Input
          label="State / Province"
          size="sm"
          fullWidth
          placeholder="State"
          value={values.state}
          onChange={onChange("state")}
        />
        <Input
          label="Postal Code"
          size="sm"
          fullWidth
          placeholder="PIN / Zip"
          value={values.postalCode}
          onChange={onChange("postalCode")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Country"
          size="sm"
          fullWidth
          placeholder="India"
          value={values.country}
          onChange={onChange("country")}
        />
        <Input
          label="GSTIN / Tax ID"
          size="sm"
          fullWidth
          placeholder="e.g. 29ABCDE1234F1Z5"
          value={values.taxId}
          onChange={onChange("taxId")}
        />
      </div>
    </div>
  );
};
