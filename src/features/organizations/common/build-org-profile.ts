import type {
  AdminOrganizationDetail,
  BillingCycle,
  OrganizationProfileInput,
  OrgPlanTier,
} from "@/features/organizations/types";
import {
  TEXT_FIELDS,
  type FormValues,
} from "@/features/organizations/common/form-types";

export const buildOrgProfile = (
  values: FormValues,
  editing: boolean,
  org: AdminOrganizationDetail | null,
): OrganizationProfileInput => {
  const body: OrganizationProfileInput = {
    name: values.name.trim(),
    planTier: values.planTier as OrgPlanTier,
    billingCycle: values.billingCycle as BillingCycle,
    maxMembers: Number(values.maxMembers),
    maxWorkspaces: Number(values.maxWorkspaces),
  };

  const slug = values.slug.trim();
  if (slug) body.slug = slug;

  for (const key of TEXT_FIELDS) {
    const value = values[key].trim();
    if (value || (editing && (org?.[key] ?? "") !== "")) {
      body[key] = value;
    }
  }

  return body;
};
