"use client";

import type React from "react";
import { useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Modal,
  RadioGroup,
  Textarea,
} from "@galyan/ui";
import { Building2 } from "lucide-react";
import { useOrganizationsContext } from "@/features/organizations/context";
import type {
  AdminOrganizationDetail,
  BillingCycle,
  CreatableOrgStatus,
  CreateOrganizationRequest,
  OrganizationProfileInput,
  OrgPlanTier,
} from "@/features/organizations/types";
import {
  BILLING_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  CREATE_STATUS_OPTIONS,
  ORG_TYPE_OPTIONS,
  PLAN_META,
  PLAN_ORDER,
} from "@/features/organizations/common/constants";

/** Every field as a string so inputs stay controlled; converted on submit. */
type FormValues = Record<
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

const TEXT_FIELDS = [
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Preset options plus the saved value when it isn't one of them (older or free-text data). */
const withCurrent = (
  options: { value: string; label: string }[],
  current: string,
) =>
  current && !options.some((o) => o.value === current)
    ? [...options, { value: current, label: current }]
    : options;

function initialValues(org: AdminOrganizationDetail | null): FormValues {
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
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="space-y-2.5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--gy-text-subtle)]">
        {title}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 items-start">{children}</div>
    </section>
  );
};

const OrganizationForm = ({ org }: { org: AdminOrganizationDetail | null }) => {
  const { closeForm, submitCreate, submitEdit } = useOrganizationsContext();
  const editing = org !== null;
  const [values, setValues] = useState<FormValues>(() => initialValues(org));
  const [ownerMode, setOwnerMode] = useState<"new" | "existing">("new");
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const set =
    (key: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }));
  const setValue = (key: keyof FormValues) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (values.name.trim().length < 2) next.name = "Enter the organization name";
    if (values.businessEmail && !EMAIL_RE.test(values.businessEmail.trim())) {
      next.businessEmail = "Enter a valid email";
    }
    for (const key of ["maxMembers", "maxWorkspaces"] as const) {
      const n = Number(values[key]);
      if (!Number.isInteger(n) || n < 1) next[key] = "Whole number, 1 or more";
    }
    if (!editing) {
      if (!EMAIL_RE.test(values.ownerEmail.trim())) {
        next.ownerEmail = "Enter the owner's email";
      }
      if (ownerMode === "new" && values.ownerFullName.trim().length < 2) {
        next.ownerFullName = "Enter the owner's full name";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildProfile = (): OrganizationProfileInput => {
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
      // On edit an emptied field is sent as "" so the backend clears it
      if (value || (editing && (org?.[key] ?? "") !== "")) body[key] = value;
    }
    return body;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const profile = buildProfile();
    const ok = editing
      ? await submitEdit(org.id, profile)
      : await submitCreate({
          ...profile,
          status: values.status as CreatableOrgStatus,
          ownerEmail: values.ownerEmail.trim().toLowerCase(),
          ...(ownerMode === "new"
            ? {
                ownerFullName: values.ownerFullName.trim(),
                ...(values.ownerPhone.trim()
                  ? { ownerPhone: values.ownerPhone.trim() }
                  : {}),
              }
            : {}),
        } satisfies CreateOrganizationRequest);
    if (!ok) setSubmitting(false);
  };

  const input = (
    key: keyof FormValues,
    label: string,
    props: Partial<React.ComponentProps<typeof Input>> = {},
  ) => (
    <Input
      label={label}
      size="sm"
      fullWidth
      value={values[key]}
      onChange={set(key)}
      hasError={Boolean(errors[key])}
      error={errors[key]}
      {...props}
    />
  );

  return (
    <Modal
      isOpen
      onClose={submitting ? () => undefined : closeForm}
      size="xl"
      icon={<Building2 className="size-4" />}
      title={editing ? `Edit ${org.name}` : "New organization"}
      subtitle={
        editing
          ? "Profile, address, plan and limits. Use Assign subscription for seats and pricing."
          : "Creates the organization, its owner membership and the default virtual office."
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={closeForm} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            isLoading={submitting}
            onClick={() => void submit()}
          >
            {editing ? "Save changes" : "Create organization"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 px-1 py-1">
        <Section title="Organization">
          {input("name", "Name", { required: true, placeholder: "Acme Corporation" })}
          {input("legalName", "Legal name", { placeholder: "Acme Corporation Pvt Ltd" })}
          {input("slug", "URL slug", {
            placeholder: editing ? undefined : "Generated from the name",
            helperText: "Lowercase letters, numbers and dashes",
          })}
          <Dropdown
            label="Organization type"
            size="sm"
            options={withCurrent(ORG_TYPE_OPTIONS, values.orgType)}
            value={values.orgType}
            onChange={setValue("orgType")}
            placeholder="Select type"
            clearable
          />
          {input("industry", "Industry", { placeholder: "Technology" })}
          <Dropdown
            label="Company size"
            size="sm"
            options={withCurrent(COMPANY_SIZE_OPTIONS, values.companySize)}
            value={values.companySize}
            onChange={setValue("companySize")}
            placeholder="Select size"
            clearable
          />
          {input("website", "Website", { placeholder: "https://acme.com" })}
          {input("domain", "Email domain", { placeholder: "acme.com" })}
        </Section>

        <Section title="Contact & billing address">
          {input("businessEmail", "Business email", {
            type: "email",
            placeholder: editing ? undefined : "Defaults to the owner's email",
          })}
          {input("businessPhone", "Business phone", { placeholder: "+91 98765 43210" })}
          <div className="sm:col-span-2">
            {input("address", "Address", { placeholder: "Street, building" })}
          </div>
          {input("city", "City")}
          {input("state", "State")}
          {input("postalCode", "Postal code")}
          {input("country", "Country")}
          {input("taxId", "GSTIN / Tax ID", { placeholder: "29ABCDE1234F1Z5" })}
        </Section>

        <Section title="Plan & limits">
          <Dropdown
            label="Plan"
            size="sm"
            options={PLAN_ORDER.map((p) => ({ value: p, label: PLAN_META[p].label }))}
            value={values.planTier}
            onChange={setValue("planTier")}
          />
          <Dropdown
            label="Billing cycle"
            size="sm"
            options={BILLING_OPTIONS}
            value={values.billingCycle}
            onChange={setValue("billingCycle")}
          />
          {input("maxMembers", "Member limit (seats)", { type: "number", min: 1 })}
          {input("maxWorkspaces", "Workspace limit", { type: "number", min: 1 })}
          {!editing && (
            <Dropdown
              label="Status"
              size="sm"
              options={CREATE_STATUS_OPTIONS}
              value={values.status}
              onChange={setValue("status")}
            />
          )}
        </Section>

        {!editing && (
          <section className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--gy-text-subtle)]">
              Owner
            </h4>
            <RadioGroup
              name="owner-mode"
              orientation="horizontal"
              size="sm"
              value={ownerMode}
              onChange={(v) => setOwnerMode(v as "new" | "existing")}
              options={[
                { value: "new", label: "Create a new owner account" },
                { value: "existing", label: "Use an existing account" },
              ]}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {input("ownerEmail", "Owner email", {
                type: "email",
                required: true,
                placeholder: "owner@acme.com",
              })}
              {ownerMode === "new" && (
                <>
                  {input("ownerFullName", "Owner full name", { required: true })}
                  {input("ownerPhone", "Owner phone")}
                </>
              )}
            </div>
            <p className="text-xs text-[var(--gy-text-secondary)]">
              {ownerMode === "new"
                ? "The owner is emailed that their account exists and sets a password with “Forgot password” on the sign-in page."
                : "The account must be an organization account that doesn't belong to another organization yet."}
            </p>
          </section>
        )}

        <section className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--gy-text-subtle)]">
            Internal notes
          </h4>
          <Textarea
            size="sm"
            fullWidth
            rows={3}
            maxLength={2000}
            placeholder="Visible to the developer console only"
            value={values.notes}
            onChange={set("notes")}
          />
        </section>
      </div>
    </Modal>
  );
}

/** Create / edit organization dialog; remounted per open so it starts from fresh values. */
export const OrganizationFormModal = () => {
  const { state } = useOrganizationsContext();
  const dialog = state.formDialog;
  if (!dialog) return null;
  return (
    <OrganizationForm key={dialog.org?.id ?? "new"} org={dialog.org} />
  );
};
