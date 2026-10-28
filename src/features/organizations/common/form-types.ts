import type { AdminOrganizationDetail } from "@/features/organizations/types";

export type FormValues = Record<
  | "name"
  | "slug"
  | "legalName"
  | "domain"
  | "orgType"
  | "industry"
  | "companySize"
  | "country"
  | "state"
  | "city"
  | "address"
  | "postalCode"
  | "website"
  | "businessEmail"
  | "businessPhone"
  | "taxId"
  | "notes"
  | "planTier"
  | "billingCycle"
  | "maxMembers"
  | "maxWorkspaces"
  | "status"
  | "ownerEmail"
  | "ownerFullName"
  | "ownerPhone",
  string
>;

export const TEXT_FIELDS = [
  "legalName",
  "domain",
  "orgType",
  "industry",
  "companySize",
  "country",
  "state",
  "city",
  "address",
  "postalCode",
  "website",
  "businessEmail",
  "businessPhone",
  "taxId",
  "notes",
] as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type OrgStepId = "profile" | "address" | "plan" | "owner";

export interface OrgStepProps {
  values: FormValues;
  errors: Partial<Record<keyof FormValues, string>>;
  editing: boolean;
  onChange: (
    key: keyof FormValues,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (key: keyof FormValues) => (val: string) => void;
  ownerMode?: "new" | "existing";
  onOwnerModeChange?: (mode: "new" | "existing") => void;
  org?: AdminOrganizationDetail | null;
}
