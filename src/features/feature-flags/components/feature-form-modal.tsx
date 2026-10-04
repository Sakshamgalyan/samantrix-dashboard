"use client";

import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dropdown, Input, Modal, Textarea, Toggle } from "@galyan/ui";
import { Flag } from "lucide-react";
import { GLASS_ROW } from "@/components/admin";
import { DEFAULT_CATEGORY, PLAN_META, PLAN_TIERS } from "../common/constants";
import { useFeatureFlagsContext } from "../context";
import {
  NEW_CATEGORY,
  featureFormSchema,
  type FeatureFlag,
  type FeatureFormValues,
} from "../types";

const FORM_ID = "feature-flag-form";

const PLAN_OPTIONS = PLAN_TIERS.map((tier) => ({
  value: tier,
  label: PLAN_META[tier].label,
  description: PLAN_META[tier].description,
}));

function initialValues(feature: FeatureFlag | null): FeatureFormValues {
  return {
    featureKey: feature?.featureKey ?? "",
    name: feature?.name ?? "",
    description: feature?.description ?? "",
    category: feature?.category ?? DEFAULT_CATEGORY,
    newCategory: "",
    minPlanTier: feature?.minPlanTier ?? "FREE",
    defaultEnabled: feature?.defaultEnabled ?? false,
  };
}

/** Form body; remounted (keyed) for each dialog so it starts from the right values. */
function FeatureForm({ feature }: { feature: FeatureFlag | null }) {
  const { categoryOptions, saveFeature } = useFeatureFlagsContext();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FeatureFormValues>({
    resolver: zodResolver(featureFormSchema),
    mode: "onTouched",
    defaultValues: initialValues(feature),
  });
  const category = useWatch({ control, name: "category" });

  const options = [
    ...categoryOptions.map((c) => ({ value: c, label: c })),
    { value: NEW_CATEGORY, label: "New category…" },
  ];

  return (
    <form
      id={FORM_ID}
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await saveFeature(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Feature key"
          placeholder="custom_branding"
          fullWidth
          required
          disabled={feature !== null}
          className="[&_input]:font-mono"
          hasError={!!errors.featureKey}
          error={errors.featureKey?.message}
          helperText={
            feature
              ? "Keys can't change once organizations use them"
              : "Lowercase snake_case, used by the apps"
          }
          {...register("featureKey")}
        />
        <Input
          label="Display name"
          placeholder="Custom Branding"
          fullWidth
          required
          hasError={!!errors.name}
          error={errors.name?.message}
          {...register("name")}
        />
      </div>
      <Textarea
        label="Description"
        placeholder="What organizations get when this is on"
        fullWidth
        rows={3}
        maxCharCount={500}
        hasError={!!errors.description}
        error={errors.description?.message}
        {...register("description")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Dropdown
              variant="glass"
              label="Category"
              options={options}
              value={field.value}
              onChange={(v) => field.onChange(v as string)}
              error={errors.category?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="minPlanTier"
          render={({ field }) => (
            <Dropdown
              variant="glass"
              label="Minimum plan"
              options={PLAN_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v as string)}
            />
          )}
        />
      </div>
      {category === NEW_CATEGORY && (
        <Input
          label="New category name"
          placeholder="e.g. Collaboration"
          fullWidth
          hasError={!!errors.newCategory}
          error={errors.newCategory?.message}
          {...register("newCategory")}
        />
      )}
      <Controller
        control={control}
        name="defaultEnabled"
        render={({ field }) => (
          <div
            className={`${GLASS_ROW} flex items-center justify-between gap-4 px-4 py-3`}
          >
            <div>
              <div className="text-sm font-medium text-[var(--gy-text)]">
                On by default
              </div>
              <div className="text-xs text-[var(--gy-text-secondary)]">
                New organizations start with this switched on. Existing
                organizations keep their own setting.
              </div>
            </div>
            <Toggle
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              aria-label="On by default"
            />
          </div>
        )}
      />
    </form>
  );
}

export function FeatureFormModal() {
  const { dialog, submitting, closeDialog } = useFeatureFlagsContext();
  const open = dialog?.kind === "create" || dialog?.kind === "edit";
  const feature = dialog?.kind === "edit" ? dialog.feature : null;

  return (
    <Modal
      variant="glass"
      size="lg"
      isOpen={open}
      onClose={closeDialog}
      icon={<Flag className="size-5" />}
      title={feature ? `Edit ${feature.name}` : "Add a feature"}
      subtitle={
        feature
          ? feature.featureKey
          : "Adds a flag to the platform catalog. Organizations decide whether to switch it on."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={closeDialog}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form={FORM_ID}
            isLoading={submitting}
          >
            {feature ? "Save changes" : "Add feature"}
          </Button>
        </div>
      }
    >
      {open && (
        <FeatureForm key={feature?.featureKey ?? "new"} feature={feature} />
      )}
    </Modal>
  );
}
