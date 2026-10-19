import type { OrgSettings } from "@/types/dashboard";

export interface ProfileForm {
  name: string;
  legalName: string;
  website: string;
  industry: string;
  companySize: string;
  businessEmail: string;
  secondaryEmail: string;
  businessPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface UpdateOrgProfileRequest {
  name?: string;
  legalName?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  businessEmail?: string;
  secondaryEmail?: string;
  businessPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
}

export type UpdateOrgSettingsRequest = Pick<
  OrgSettings,
  "timezone" | "locale" | "defaultRole" | "allowMemberInvites" | "retentionDays"
>;
