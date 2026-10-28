"use client";

import React, { useState } from "react";
import { Button, Modal, Stepper } from "@galyan/ui";
import { ArrowLeft, ArrowRight, Building2, Check } from "lucide-react";
import { useOrganizationsContext } from "@/features/organizations/context";
import { getInitialFormValues } from "@/features/organizations/common/initial-form-values";
import { validateOrgStep } from "@/features/organizations/common/validate-org-step";
import { buildOrgProfile } from "@/features/organizations/common/build-org-profile";
import { OrgStepProfile } from "@/features/organizations/components/steps/org-step-profile";
import { OrgStepAddress } from "@/features/organizations/components/steps/org-step-address";
import { OrgStepPlan } from "@/features/organizations/components/steps/org-step-plan";
import { OrgStepOwner } from "@/features/organizations/components/steps/org-step-owner";
import type {
  CreatableOrgStatus,
  CreateOrganizationRequest,
} from "@/features/organizations/types";
import type { FormValues } from "@/features/organizations/common/form-types";

export const OrganizationFormDrawer = () => {
  const { state, closeForm, submitCreate, submitEdit } =
    useOrganizationsContext();
  const dialog = state.formDialog;
  const org = dialog?.org ?? null;
  const editing = org !== null;

  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<FormValues>(() =>
    getInitialFormValues(org),
  );
  const [ownerMode, setOwnerMode] = useState<"new" | "existing">("new");
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  if (!dialog) return null;

  const set =
    (key: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    };

  const setValue = (key: keyof FormValues) => (val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleNext = () => {
    const { valid, errors: stepErrors } = validateOrgStep(
      activeStep,
      values,
      editing,
      ownerMode,
    );
    if (!valid) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setActiveStep((curr) => Math.min(curr + 1, 3));
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((curr) => Math.max(curr - 1, 0));
  };

  const handleSubmit = async () => {
    // Validate final step
    const { valid, errors: stepErrors } = validateOrgStep(
      3,
      values,
      editing,
      ownerMode,
    );
    if (!valid) {
      setErrors(stepErrors);
      return;
    }

    setSubmitting(true);
    const profile = buildOrgProfile(values, editing, org);

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

    if (!ok) {
      setSubmitting(false);
    }
  };

  const stepperSteps = [
    { id: "profile", label: "Profile" },
    { id: "address", label: "Address" },
    { id: "plan", label: "Plan" },
    { id: "owner", label: editing ? "Review" : "Owner" },
  ];

  return (
    <Modal
      isOpen
      onClose={submitting ? () => undefined : closeForm}
      variant="sidebar"
      size="lg"
      icon={<Building2 className="size-4 text-[var(--gy-primary)]" />}
      title={editing ? `Edit ${org.name}` : "Create Organization"}
      subtitle={
        editing
          ? "Update profile details, address, plan tier and seat limits."
          : "Guided setup: Profile, location, resource limits and root administrator."
      }
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <div>
            {activeStep > 0 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ArrowLeft className="size-3.5" />}
                onClick={handleBack}
                disabled={submitting}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={closeForm}
              disabled={submitting}
            >
              Cancel
            </Button>

            {activeStep < 3 ? (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="size-3.5" />}
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check className="size-3.5" />}
                isLoading={submitting}
                onClick={() => void handleSubmit()}
              >
                {editing ? "Save Changes" : "Create Organization"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5 px-1 py-1">
        {/* Step Indicator */}
        <div className="rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] p-3">
          <Stepper
            steps={stepperSteps}
            activeStep={activeStep}
            size="sm"
            onStepClick={(idx) => {
              if (idx < activeStep) {
                setErrors({});
                setActiveStep(idx);
              }
            }}
          />
        </div>

        {/* Step Content */}
        <div className="min-h-[340px]">
          {activeStep === 0 && (
            <OrgStepProfile
              values={values}
              errors={errors}
              editing={editing}
              onChange={set}
              onSelectChange={setValue}
            />
          )}

          {activeStep === 1 && (
            <OrgStepAddress
              values={values}
              errors={errors}
              editing={editing}
              onChange={set}
              onSelectChange={setValue}
            />
          )}

          {activeStep === 2 && (
            <OrgStepPlan
              values={values}
              errors={errors}
              editing={editing}
              onChange={set}
              onSelectChange={setValue}
            />
          )}

          {activeStep === 3 && (
            <OrgStepOwner
              values={values}
              errors={errors}
              editing={editing}
              onChange={set}
              onSelectChange={setValue}
              ownerMode={ownerMode}
              onOwnerModeChange={setOwnerMode}
              org={org}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
