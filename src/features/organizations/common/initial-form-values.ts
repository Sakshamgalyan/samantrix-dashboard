import type { AdminOrganizationDetail } from "@/features/organizations/types";
import type { FormValues } from "@/features/organizations/common/form-types";

export const getInitialFormValues = (
  org: AdminOrganizationDetail | null,
): FormValues => {
  const v = (x: string | number | null | undefined) =>
    x == null ? "" : String(x);

  return {
    name: v(org?.name),
    slug: v(org?.slug),
    legalName: v(org?.legalName),
    domain: v(org?.domain),
    orgType: v(org?.orgType),
    industry: v(org?.industry),
    companySize: v(org?.companySize),
    country: org ? v(org.country) : "India",
    state: v(org?.state),
    city: v(org?.city),
    address: v(org?.address),
    postalCode: v(org?.postalCode),
    website: v(org?.website),
    businessEmail: v(org?.businessEmail),
    businessPhone: v(org?.businessPhone),
    taxId: v(org?.taxId),
    notes: v(org?.notes),
    planTier: org?.planTier ?? "FREE",
    billingCycle: org?.billingCycle ?? "MONTHLY",
    maxMembers: org ? v(org.maxMembers) : "50",
    maxWorkspaces: org ? v(org.maxWorkspaces) : "5",
    status: "ACTIVE",
    ownerEmail: "",
    ownerFullName: "",
    ownerPhone: "",
  };
};
